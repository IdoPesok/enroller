import {
  SectionWithCourse,
  SectionsWithCounts,
  SectionsWithCourseAndCounts,
} from "@/interfaces/SectionTypes"
import { prisma } from "@/server/prisma"
import { Enrolled_Type, Sections } from "@prisma/client"

export const getSectionsWithCounts = async (
  sections: Sections[] | SectionWithCourse[]
): Promise<SectionsWithCounts[]> => {
  return await Promise.all(
    sections.map(async (section) => {
      const { SectionId } = section
      const [enrolled, waitlisted] = await Promise.all([
        prisma.enrolled.count({
          where: { SectionId, Type: Enrolled_Type.Enrolled },
        }),
        prisma.enrolled.count({
          where: { SectionId, Type: Enrolled_Type.Waitlist },
        }),
      ])
      return { ...section, Enrolled: enrolled, Waitlisted: waitlisted }
    })
  )
}
