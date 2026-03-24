import type { NextApiRequest, NextApiResponse } from 'next';
import busboy, { FileInfo } from 'busboy';
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const bb = busboy({ headers: req.headers });
  let extractedText = '';
  let parseError = false;

  bb.on('file', (name: string, file: NodeJS.ReadableStream, info: FileInfo) => {
    const { mimeType } = info;
    const buffers: Buffer[] = [];

    file.on('data', (data: Buffer) => buffers.push(data));

    file.on('end', async () => {
      try {
        const buffer = Buffer.concat(buffers);
        if (mimeType === 'application/pdf') {
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } else if (
          mimeType === 'application/msword' || 
          mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          const docxData = await mammoth.extractRawText({ buffer });
          extractedText = docxData.value;
        } else {
          parseError = true;
        }
      } catch (err) { parseError = true; }
    });
  });

  bb.on('finish', async () => {
    await new Promise(r => setTimeout(r, 200));
    if (parseError || !extractedText) return res.status(400).json({ message: 'Failed to extract text. Unsupported or invalid format.' });
    return res.status(200).json({ text: extractedText });
  });

  req.pipe(bb);
}
