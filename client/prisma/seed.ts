import { PrismaClient } from "@prisma/client"
import { set } from "date-fns"

const prisma = new PrismaClient()

function zero(date: Date): Date {
  return set(date, { seconds: 0, milliseconds: 0 })
}

async function main() {
  const csc307Section1 = await prisma.sections.upsert({
    where: {
      Course_Start_Professor: {
        Course: "CSC 307",
        Start: zero(
          set(new Date(), {
            hours: 10,
            minutes: 10,
          })
        ),
        Professor: "Fox",
      },
    },
    update: {},
    create: {
      CatalogYear: "2021-2022",
      Course: "CSC 307",
      Start: zero(set(new Date(), { hours: 10, minutes: 10 })),
      End: zero(set(new Date(), { hours: 11, minutes: 0 })),
      Sunday: false,
      Monday: true,
      Tuesday: false,
      Wednesday: true,
      Thursday: false,
      Friday: false,
      Saturday: false,
      Capacity: 30,
      WaitlistCapacity: 10,
      Professor: "Fox",
      Room: "S420",
      Format: "Seminar",
      Modality: "InPerson",
    },
  })

  const csc307Section2 = await prisma.sections.upsert({
    where: {
      Course_Start_Professor: {
        Course: "CSC 307",
        Start: zero(set(new Date(), { hours: 10, minutes: 10 })),
        Professor: "Gonzalez",
      },
    },
    update: {},
    create: {
      CatalogYear: "2021-2022",
      Course: "CSC 307",
      Start: zero(set(new Date(), { hours: 12, minutes: 10 })),
      End: zero(set(new Date(), { hours: 14, minutes: 0 })),
      Sunday: false,
      Monday: false,
      Tuesday: true,
      Wednesday: false,
      Thursday: true,
      Friday: false,
      Saturday: false,
      Capacity: 30,
      WaitlistCapacity: 10,
      Professor: "Gonzalez",
      Room: "S420",
      Format: "Lab",
      Modality: "InPerson",
    },
  })

  const csc307Section3 = await prisma.sections.upsert({
    where: {
      Course_Start_Professor: {
        Course: "CSC 307",
        Start: zero(set(new Date(), { hours: 10, minutes: 10 })),
        Professor: "Perez",
      },
    },
    update: {},
    create: {
      CatalogYear: "2021-2022",
      Course: "CSC 307",
      Start: zero(set(new Date(), { hours: 13, minutes: 10 })),
      End: zero(set(new Date(), { hours: 15, minutes: 0 })),
      Sunday: false,
      Monday: true,
      Tuesday: false,
      Wednesday: true,
      Thursday: false,
      Friday: true,
      Saturday: null,
      Capacity: 30,
      WaitlistCapacity: 10,
      Professor: "Perez",
      Room: "S420",
      Format: "Lecture",
      Modality: "Online",
    },
  })

  const tjcolliSection1 = await prisma.enrolled.upsert({
    where: {
      User_SectionId: { User: "user_2QDp9b95iUuYTE2TVxBS6cRJK4F", SectionId: 1 },
    },
    update: {},
    create: {
      User: "user_2QDp9b95iUuYTE2TVxBS6cRJK4F",
      SectionId: 1,
      Type: "ShoppingCart",
    },
  })

  const tjcolliSection2 = await prisma.enrolled.upsert({
    where: {
      User_SectionId: { User: "user_2QDp9b95iUuYTE2TVxBS6cRJK4F", SectionId: 2 },
    },
    update: {},
    create: {
      User: "user_2QDp9b95iUuYTE2TVxBS6cRJK4F",
      SectionId: 2,
      Type: "Waitlist",
    },
  })
  console.log({ csc307Section1, csc307Section2, csc307Section3, tjcolliSection1, tjcolliSection2 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
