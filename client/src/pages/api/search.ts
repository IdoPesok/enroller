// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Courses, PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = Courses[] | {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const search = req.query.q;
  if (!search) {
    return res.status(400).json({ error: "request must include search parameter" })
  }
  if (Array.isArray(search)) {
    return res.status(400).json({ error: "only one search can be specified" })
  }

  const prisma = new PrismaClient()

  const courses = await prisma.courses.findMany(
    {
      where: {
        Code: {
          search
        },
        Name: {
          search
        },
      },
      take: 50,
    }
  )

  res.status(200).json(courses)
}
