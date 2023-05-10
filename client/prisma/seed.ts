import { PrismaClient } from "@prisma/client"
import { set } from "date-fns"

const prisma = new PrismaClient()

async function main() {
  const csc307Section1 = await prisma.sections.upsert({
    where: {
      Course_Start_Professor: {
        Course: "CSC 307",
        Start: set(new Date(), { hours: 10, minutes: 10, seconds: 0 }),
        Professor: "Fox",
      },
    },
    update: {},
    create: {
      Course: "CSC 307",
      Start: set(new Date(), { hours: 10, minutes: 10, seconds: 0 }),
      End: set(new Date(), { hours: 11, minutes: 0, seconds: 0 }),
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
      Format: "in_person",
    },
  })

  const csc307Section2 = await prisma.sections.upsert({
    where: {
      Course_Start_Professor: {
        Course: "CSC 307",
        Start: set(new Date(), { hours: 10, minutes: 10, seconds: 0 }),
        Professor: "Gonzalez",
      },
    },
    update: {},
    create: {
      Course: "CSC 307",
      Start: set(new Date(), { hours: 10, minutes: 10, seconds: 0 }),
      End: set(new Date(), { hours: 11, minutes: 0, seconds: 0 }),
      Sunday: false,
      Monday: true,
      Tuesday: false,
      Wednesday: true,
      Thursday: false,
      Friday: false,
      Saturday: false,
      Capacity: 30,
      WaitlistCapacity: 10,
      Professor: "Gonzalez",
      Room: "S420",
      Format: "in_person",
    },
  })

  const csc307Section3 = await prisma.sections.upsert({
    where: {
      Course_Start_Professor: {
        Course: "CSC 307",
        Start: set(new Date(), { hours: 10, minutes: 10, seconds: 0 }),
        Professor: "Perez",
      },
    },
    update: {},
    create: {
      Course: "CSC 307",
      Start: set(new Date(), { hours: 10, minutes: 10, seconds: 0 }),
      End: set(new Date(), { hours: 11, minutes: 0, seconds: 0 }),
      Sunday: false,
      Monday: true,
      Tuesday: false,
      Wednesday: true,
      Thursday: false,
      Friday: false,
      Saturday: false,
      Capacity: 30,
      WaitlistCapacity: 10,
      Professor: "Perez",
      Room: "S420",
      Format: "online",
    },
  })

  console.log({ csc307Section1, csc307Section2, csc307Section3 })
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
