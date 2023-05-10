import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const csc307Section1 = await prisma.sections.upsert({
    where: {
      Course_Start_Professor: {
        Course: "CSC 307",
        Start: new Date("2023-09-04"),
        Professor: "Fox",
      },
    },
    update: {},
    create: {
      Course: "CSC 307",
      Start: new Date("2023-09-04"),
      End: new Date("2023-12-08"),
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
        Start: new Date("2023-09-05"),
        Professor: "Gonzalez",
      },
    },
    update: {},
    create: {
      Course: "CSC 307",
      Start: new Date("2023-09-05"),
      End: new Date("2023-12-09"),
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
        Start: new Date("2023-09-06"),
        Professor: "Perez",
      },
    },
    update: {},
    create: {
      Course: "CSC 307",
      Start: new Date("2023-09-06"),
      End: new Date("2023-12-10"),
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
