import { z } from "zod"

export const enrolledSchema = z.object({
  SectionId: z.number(),
  Seat: z.number().nullish(),
  Type: z.enum(["Enrolled", "Waitlist", "ShoppingCart"]),
})