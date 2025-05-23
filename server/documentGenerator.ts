import * as docx from "docx";

export interface ResumeSection {
  type: 'header' | 'section' | 'experience' | 'education' | 'skills' | 'text';
  content: string;
  subsections?: ResumeSection[];
}

export function parseResumeContent(content: string): ResumeSection[] {
  const lines = content.split('\n').filter(line => line.trim());
  const sections: ResumeSection[] = [];
  
  let currentSection: ResumeSection | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if it's a potential header (name, title)
    if (isLikelyHeader(trimmedLine, lines.indexOf(line))) {
      sections.push({
        type: 'header',
        content: trimmedLine
      });
    }
    // Check if it's a section title
    else if (isSectionTitle(trimmedLine)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'section',
        content: trimmedLine,
        subsections: []
      };
    }
    // Regular content
    else if (trimmedLine) {
      if (currentSection) {
        currentSection.subsections?.push({
          type: 'text',
          content: trimmedLine
        });
      } else {
        sections.push({
          type: 'text',
          content: trimmedLine
        });
      }
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

function isLikelyHeader(line: string, index: number): boolean {
  // First few lines, shorter length, likely to be name/title
  return index < 3 && line.length < 100 && !line.includes('@') && !line.includes('http');
}

function isSectionTitle(line: string): boolean {
  const sectionKeywords = [
    'experience', 'work experience', 'employment', 'career',
    'education', 'academic', 'qualifications',
    'skills', 'technical skills', 'core competencies',
    'projects', 'achievements', 'accomplishments',
    'certifications', 'licenses',
    'summary', 'objective', 'profile'
  ];
  
  const lowerLine = line.toLowerCase();
  return sectionKeywords.some(keyword => lowerLine.includes(keyword)) && line.length < 50;
}

export async function generateDocxFromContent(content: string, filename: string): Promise<Buffer> {
  const sections = parseResumeContent(content);
  
  const children: docx.Paragraph[] = [];
  
  for (const section of sections) {
    switch (section.type) {
      case 'header':
        children.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: section.content,
                bold: true,
                size: 32,
              }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
        break;
        
      case 'section':
        children.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: section.content.toUpperCase(),
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 300, after: 100 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                value: "single",
                size: 6,
              },
            },
          })
        );
        
        // Add subsections
        if (section.subsections) {
          for (const subsection of section.subsections) {
            children.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: subsection.content,
                    size: 22,
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          }
        }
        break;
        
      case 'text':
        children.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: section.content,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          })
        );
        break;
    }
  }
  
  const doc = new docx.Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });
  
  return await docx.Packer.toBuffer(doc);
}
