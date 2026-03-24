import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  
  const userId = req.headers['user-id'] as string;
  const { score } = req.body;
  if (!userId) return res.status(400).json({ message: 'No userId provided' });

  try {
    let dummyQuiz = await prisma.aptitudeQuiz.findFirst();
    if (!dummyQuiz) {
      dummyQuiz = await prisma.aptitudeQuiz.create({
        data: { question: "General Knowledge", correctAnswer: "N/A" }
      });
    }

    await prisma.quizAttempt.create({
      data: {
        userId,
        aptitudeQuizId: dummyQuiz.id,
        userAnswer: `${score}%`,
        isCorrect: score >= 80,
      }
    });

    res.status(200).json({ success: true, message: "Score successfully updated in QuizAttempt database table." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update UserStats." });
  }
}
