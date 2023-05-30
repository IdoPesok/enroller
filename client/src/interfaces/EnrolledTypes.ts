import { Enrolled, Sections } from "@prisma/client";

export type EnrolledWithSection = (Enrolled & {
  Section: Sections;
})