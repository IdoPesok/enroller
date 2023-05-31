import {
  Courses,
  Sections,
  Sections_Format,
  Sections_Modality,
} from "@prisma/client"
import { z } from "zod"

export const ZodSectionObject = z.object({
  Course: z.string(),
  Start: z.date(),
  End: z.date(),
  Sunday: z.boolean(),
  Monday: z.boolean(),
  Tuesday: z.boolean(),
  Wednesday: z.boolean(),
  Thursday: z.boolean(),
  Friday: z.boolean(),
  Saturday: z.boolean(),
  Capacity: z.number().int().positive(),
  WaitlistCapacity: z.number().int().positive(),
  Professor: z.string(),
  Room: z.string(),
  Format: z.nativeEnum(Sections_Format),
  Modality: z.nativeEnum(Sections_Modality),
  CatalogYear: z.string(),
})

export enum DaysOfTheWeek {
  Monday = "Mo",
  Tuesday = "Tu",
  Wednesday = "We",
  Thursday = "Th",
  Friday = "Fr",
  Saturday = "Sa",
  Sunday = "Su",
}

export const DAYS: DaysOfTheWeek[] = [
  DaysOfTheWeek.Monday,
  DaysOfTheWeek.Tuesday,
  DaysOfTheWeek.Wednesday,
  DaysOfTheWeek.Thursday,
  DaysOfTheWeek.Friday,
  DaysOfTheWeek.Saturday,
  DaysOfTheWeek.Sunday,
]

export const SECTION_START_TIMES = [
  "06:10 AM",
  "07:10 AM",
  "08:10 AM",
  "09:10 AM",
  "10:10 AM",
  "11:10 AM",
  "12:10 PM",
  "01:10 PM",
  "02:10 PM",
  "03:10 PM",
  "04:10 PM",
  "05:10 PM",
  "06:10 PM",
  "07:10 PM",
  "08:10 PM",
  "09:10 PM",
  "10:10 PM",
]

export const SECTION_END_TIMES = [
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
]

export const SECTION_FORMAT_OPTIONS: string[] = Object.values(Sections_Format)

export const SECTION_MODALITY_OPTIONS: string[] =
  Object.values(Sections_Modality)

export const sectionFormSchema = z.object({
  professorName: z.string().min(2).max(50),
  activeDays: z.array(z.nativeEnum(DaysOfTheWeek)).min(1),
  startTime: z.string(),
  endTime: z.string(),
  waitlistCapacity: z.number().int().positive(),
  enrollmentCapacity: z.number().int().positive(),
  roomNumber: z.string().min(2).max(10),
  format: z.nativeEnum(Sections_Format),
  modality: z.nativeEnum(Sections_Modality),
})

export type SectionWithCourse = Sections & {
  Courses: Courses
}
