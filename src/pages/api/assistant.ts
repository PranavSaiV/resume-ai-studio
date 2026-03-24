import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const userId = req.headers['user-id'] as string;
  const { message, resumeId } = req.body;

  if (!userId || !message) return res.status(400).json({ message: 'Bad Request' });

  try {
    console.log("GEMINI_API_KEY Available:", !!process.env.GEMINI_API_KEY);
    
    let resume = null;
    if (resumeId) {
      resume = await prisma.resume.findUnique({ where: { id: resumeId, userId } });
    } else {
      resume = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });
    }

    const resumeContent = resume ? JSON.stringify({
      title: resume.title,
      personalInfo: resume.personalInfo,
      experience: resume.experience,
      education: resume.education,
      skills: resume.skills,
      content: resume.content
    }) : "No resume provided.";

    const prompt = `You are SkillForge AI, a career mentor. Use the following resume data to answer the user's career questions: 
    ${resumeContent}. 
    
    User message: "${message}"
    
    If no resume is provided, give general career advice. Keep formatting readable and concise.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    
    return res.status(200).json({ reply: result.response.text() });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: error.message || 'Failed to process request', message: "Detailed Error Response" });
  }
}
