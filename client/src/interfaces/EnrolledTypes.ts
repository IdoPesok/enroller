import { User } from "@clerk/nextjs/server"
import { Enrolled, Sections } from "@prisma/client"
import { z } from "zod"

export type EnrolledWithSection = Enrolled & {
  Section: Sections
}

export type SectionsWithEnrolled = Sections & { Enrolleds: Enrolled[] }

export const enrolledSchema = z.object({
  SectionId: z.number(),
  Seat: z.number().nullable(),
  Type: z.enum(["Enrolled", "Waitlist", "ShoppingCart"]),
})

export type EnrolledWithUserData = Enrolled & {
  userData: User
}

export type EnrollmentTransaction =
  | {
      status: "success"
      data: EnrolledWithSection
      message: string
      waitlisted: boolean
    }
  | {
      status: "failure"
      message: string
    }
