import type { NextApiRequest, NextApiResponse } from 'next';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { format, resume, sections } = req.body;
    if (!resume) {
      return res.status(400).json({ message: 'Missing resume data' });
    }

    const { personalInfo = {}, experience = [], education = [], skills = [], title } = resume;
    const baseName = `${title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'resume'}`;

    if (format === 'docx') {
      const children: any[] = [];
      
      if (sections.personalInfo) {
        children.push(new Paragraph({ children: [new TextRun({ text: personalInfo.name || 'Your Name', bold: true, size: 48 })] }));
        if (personalInfo.email) children.push(new Paragraph({ text: personalInfo.email }));
        if (personalInfo.phone) children.push(new Paragraph({ text: personalInfo.phone }));
        if (personalInfo.summary) children.push(new Paragraph({ text: personalInfo.summary }));
      }
      
      if (sections.experience && experience.length > 0) {
        children.push(new Paragraph({ text: "" })); // spacing
        children.push(new Paragraph({ children: [new TextRun({ text: "EXPERIENCE", bold: true, size: 28 })] }));
        experience.forEach((exp: any) => {
          children.push(new Paragraph({ children: [new TextRun({ text: `${exp.role} at ${exp.company}`, bold: true })] }));
          children.push(new Paragraph({ text: `${exp.startDate} - ${exp.endDate || 'Present'}` }));
          if (exp.description) children.push(new Paragraph({ text: exp.description }));
        });
      }

      if (sections.education && education.length > 0) {
        children.push(new Paragraph({ text: "" }));
        children.push(new Paragraph({ children: [new TextRun({ text: "EDUCATION", bold: true, size: 28 })] }));
        education.forEach((edu: any) => {
          children.push(new Paragraph({ children: [new TextRun({ text: `${edu.degree} - ${edu.institution}`, bold: true })] }));
          children.push(new Paragraph({ text: `${edu.startDate} - ${edu.endDate || 'Present'}` }));
        });
      }

      if (sections.projects && resume.projects && resume.projects.length > 0) {
        children.push(new Paragraph({ text: "" }));
        children.push(new Paragraph({ children: [new TextRun({ text: "PROJECTS", bold: true, size: 28 })] }));
        resume.projects.forEach((proj: any) => {
          children.push(new Paragraph({ children: [new TextRun({ text: `${proj.name} ${proj.link ? `- ${proj.link}` : ''}`, bold: true })] }));
          if (proj.description) children.push(new Paragraph({ text: proj.description }));
        });
      }

      if (sections.skills && skills.length > 0) {
        children.push(new Paragraph({ text: "" }));
        children.push(new Paragraph({ children: [new TextRun({ text: "SKILLS", bold: true, size: 28 })] }));
        children.push(new Paragraph({ text: skills.join(", ") }));
      }

      const doc = new Document({ sections: [{ properties: {}, children }] });
      const buffer = await Packer.toBuffer(doc);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=${baseName}.docx`);
      return res.status(200).send(buffer);
      
    } else {
      // PDF
      const doc = new jsPDF();
      let y = 20;

      if (sections.personalInfo) {
        doc.setFontSize(24);
        doc.text(personalInfo.name || "Your Name", 20, y);
        y += 10;
        doc.setFontSize(12);
        if (personalInfo.email) { doc.text(personalInfo.email, 20, y); y += 6; }
        if (personalInfo.phone) { doc.text(personalInfo.phone, 20, y); y += 6; }
        if (personalInfo.summary) { 
           const lines = doc.splitTextToSize(personalInfo.summary, 170);
           doc.text(lines, 20, y);
           y += (lines.length * 6);
        }
      }

      if (sections.experience && experience.length > 0) {
        y += 10;
        doc.setFontSize(16);
        doc.text("EXPERIENCE", 20, y);
        y += 8;
        doc.setFontSize(12);
        experience.forEach((exp: any) => {
          doc.setFont("helvetica", "bold");
          doc.text(`${exp.role} at ${exp.company}`, 20, y);
          doc.setFont("helvetica", "normal");
          y += 6;
          doc.text(`${exp.startDate} - ${exp.endDate || 'Present'}`, 20, y);
          y += 6;
          if (exp.description) {
            const lines = doc.splitTextToSize(exp.description, 170);
            doc.text(lines, 20, y);
            y += (lines.length * 6);
          }
          y += 4;
        });
      }

      if (sections.education && education.length > 0) {
        y += 6;
        doc.setFontSize(16);
        doc.text("EDUCATION", 20, y);
        y += 8;
        doc.setFontSize(12);
        education.forEach((edu: any) => {
          doc.setFont("helvetica", "bold");
          doc.text(`${edu.degree} - ${edu.institution}`, 20, y);
          doc.setFont("helvetica", "normal");
          y += 6;
          doc.text(`${edu.startDate} - ${edu.endDate || 'Present'}`, 20, y);
          y += 8;
        });
      }

      if (sections.projects && resume.projects && resume.projects.length > 0) {
        y += 6;
        doc.setFontSize(16);
        doc.text("PROJECTS", 20, y);
        y += 8;
        doc.setFontSize(12);
        resume.projects.forEach((proj: any) => {
          doc.setFont("helvetica", "bold");
          doc.text(`${proj.name} ${proj.link ? `- ${proj.link}` : ''}`, 20, y);
          doc.setFont("helvetica", "normal");
          y += 6;
          if (proj.description) {
            const lines = doc.splitTextToSize(proj.description, 170);
            doc.text(lines, 20, y);
            y += (lines.length * 6);
          }
          y += 4;
        });
      }

      if (sections.skills && skills.length > 0) {
        y += 2;
        doc.setFontSize(16);
        doc.text("SKILLS", 20, y);
        y += 8;
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(skills.join(", "), 170);
        doc.text(lines, 20, y);
      }

      const buffer = Buffer.from(doc.output('arraybuffer'));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${baseName}.pdf`);
      return res.status(200).send(buffer);
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate export file' });
    }
  }
}
