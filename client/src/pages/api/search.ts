// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Courses } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

type Data = Courses[] | {
  error: string
}

const PER_PAGE = 20

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { q: search, page: pageStr } = req.query;
  if (!search) {
    return res.status(400).json({ error: "request must include search parameter" })
  }
  if (Array.isArray(search)) {
    return res.status(400).json({ error: "only one search can be specified" })
  }
  if (Array.isArray(pageStr)) {
    return res.status(400).json({ error: "can only specify one page" })
  }
  const page = +(pageStr ?? "0") ?? 0;


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
      skip: PER_PAGE * page,
      take: PER_PAGE,
    }
  )

  res.status(200).json(courses)
}
