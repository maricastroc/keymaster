import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const querySchema = z.object({
  category: z.enum(['general', 'lyrics', 'quotes', 'code', 'any']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  language: z.enum(['en', 'pt', 'es', 'fr', 'de']).default('en'),
  excludeId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { category, difficulty, language, excludeId } = querySchema.parse(req.query);

    // Language is authoritative; difficulty always applies. Category is a
    // preference — if a language doesn't yet have texts in the chosen category,
    // we fall back to any category (in the same language + difficulty) so the
    // user never dead-ends on an empty bucket.
    const buildWhere = (withCategory: boolean): Prisma.TextWhereInput => {
      const w: Prisma.TextWhereInput = { difficulty, language };
      if (withCategory && category !== 'any') w.category = category;
      if (excludeId) w.id = { not: excludeId };
      return w;
    };

    let where = buildWhere(true);
    let count = await prisma.text.count({ where });

    if (count === 0 && category !== 'any') {
      where = buildWhere(false);
      count = await prisma.text.count({ where });
    }

    if (count === 0) {
      return res
        .status(404)
        .json({ message: 'No texts found for this filter.' });
    }

    const skip = Math.floor(Math.random() * count);

    const text = await prisma.text.findFirst({
      where,
      skip,
    });

    return res.status(200).json({
      id: text?.id,
      content: text?.content,
      category: text?.category,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid filters provided.' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}
