import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import archiver from 'archiver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const userId = req.headers['user-id'] as string;
    const format = req.query.format as string || 'pdf';

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId },
    });

    if (resumes.length === 0) {
      return res.status(404).json({ message: 'No resumes found to export' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=resumes-${format}.zip`);

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    for (let i = 0; i < resumes.length; i++) {
      const resume = resumes[i];
      const baseName = `${resume.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${i}`;

      if (format === 'docx') {
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: resume.title, bold: true, size: 32 }),
                ],
              }),
              new Paragraph({ text: `Created At: ${resume.createdAt}` }),
              new Paragraph({ text: `Updated At: ${resume.updatedAt}` }),
              new Paragraph({ text: `Status: ${resume.isActive ? 'Active' : 'Inactive'}` }),
            ],
          }],
        });
        const buffer = await Packer.toBuffer(doc);
        archive.append(buffer, { name: `${baseName}.docx` });
      } else {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(resume.title, 20, 20);
        doc.setFontSize(12);
        doc.text(`Created At: ${new Date(resume.createdAt).toLocaleString()}`, 20, 30);
        doc.text(`Updated At: ${new Date(resume.updatedAt).toLocaleString()}`, 20, 40);
        doc.text(`Status: ${resume.isActive ? 'Active' : 'Inactive'}`, 20, 50);
        
        const buffer = Buffer.from(doc.output('arraybuffer'));
        archive.append(buffer, { name: `${baseName}.pdf` });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate ZIP archive' });
    }
  }
}
