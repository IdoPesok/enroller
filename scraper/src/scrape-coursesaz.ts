require("dotenv").config();
import { exit } from "process";
// import { JSDOM } from "jsdom";
import * as cheerio from "cheerio";
import { Prisma, PrismaClient } from "@prisma/client";
import { MultiBar, Presets, SingleBar } from "cli-progress";

const fetch = require("fetch-retry")(global.fetch, {
  retries: 1000,
});

const CATALOG_URL = "https://catalog.calpoly.edu/";
const PREV_CATALOGS_URL = "https://previouscatalogs.calpoly.edu/";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("missing database url");
    exit(1);
  }

  const prisma = new PrismaClient();

  console.log("Connected to Database!");
  // console.log("Deleting old data...");
  // await prisma.courses.deleteMany();

  console.log("Fetching previous catalogs...");
  const response = await fetch(PREV_CATALOGS_URL);
  const $ = cheerio.load(await response.text());
  const prevCatalogs = $("[id^=Catalog]")
    .parent()
    .map((_, el) => $(el).find($("a:contains('Online catalog')")).attr("href"))
    .get();
  const catalogs = prevCatalogs.concat(CATALOG_URL).map((url) => new URL(url));

  console.log("Scraping courses...");
  const multibar = new MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: " {bar} | {years} | {value}/{total}",
    },
    Presets.shades_grey
  );
  await Promise.all(
    catalogs.map(async (catalog) => {
      const catalogYear = getCatalogYear(catalog);
      const bar = multibar.create(1, 0, { years: catalogYear });
      await fetchCatalog(prisma, catalog, catalogYear, bar);
    })
  );
  multibar.stop();

  await prisma.$disconnect();
}

async function fetchCatalog(
  prisma: PrismaClient,
  catalog: URL,
  catalogYear: string,
  bar: SingleBar
) {
  const response = await fetch(`${catalog.href}coursesaz`);
  const body = await response.text();
  const $ = cheerio.load(body);
  const urls = $(".sitemaplink")
    .map((_, el) => new URL(el.attribs.href, catalog))
    .get();
  bar.setTotal(urls.length);
  await Promise.all(
    urls.map((url) =>
      fetchCourses(prisma, url, catalogYear).then(() => bar.increment())
    )
  );
}

function getCatalogYear(catalog: URL): string {
  let years = catalog.href
    .split("/")
    .filter((s) => s !== "")
    .pop();
  if (!years) {
    return "unknown";
  }
  // normalize
  years = years.replace(/^([0-9]{2})([0-9]{2})-([0-9]{2})$/, "$1$2-$1$3");
  return /^[0-9]{4}-[0-9]{4}$/.test(years) ? years : "2022-2026";
}

function isCourseCode(code: string): boolean {
  return /[A-Z]+\s*[0-9]+/.test(code);
}

const enum PrereqType {
  Prerequisite = "prerequisite",
  Corequisite = "corequisite",
  Reccomended = "reccomended",
  Concurrent = "concurrent",
}

class Prereq {}

const enum PrereqOpType {
  And = "and",
  Or = "or",
}

class PrereqOp extends Prereq {
  type: PrereqOpType;
  children: Prereq[];

  constructor(type: PrereqOpType, children: Prereq[]) {
    super();
    this.type = type;
    this.children = children;
  }
}

class PrereqLeaf extends Prereq {
  code: string;
  type: PrereqType;
  constructor(code: string, type: PrereqType) {
    super();
    this.code = code;
    this.type = type;
  }
}

const PrereqTypeMap: { [type: string]: PrereqType } = {
  prerequisite: PrereqType.Prerequisite,
  corequisite: PrereqType.Corequisite,
  recommended: PrereqType.Reccomended,
  concurrent: PrereqType.Concurrent,
};

function cleanPrereqSource(source: string): string {
  return source.toLowerCase().replace("-", "").replace(/s$/, "");
}

function startsWithPrereqType(source: string): boolean {
  source = cleanPrereqSource(source.substring(0, source.indexOf(":")));
  return Object.keys(PrereqTypeMap).some((key) => source.startsWith(key));
}

function parsePrereqType(type: string): PrereqType | null {
  type = cleanPrereqSource(type);
  return PrereqTypeMap[type] ?? null;
}

function extractPrereq(source: string, prereqType: PrereqType): Prereq | null {
  let opType;
  let courses;
  // if the source string contains a semicolon then assume it is semicolon delimited
  if (source.includes(";")) {
    // try to split on semicolon delimited or
    // negative lookahead to avoid false positives
    opType = PrereqOpType.Or;
    courses = source.split(/;\s*or\s+/);
    // no matches, try to split on semicolon
    if (courses.length === 1) {
      opType = PrereqOpType.And;
      courses = source.split(/(?:;\s*and|;)\s+/);
    }
  } else {
    // check for comma or delimited
    opType = PrereqOpType.Or;
    courses = source.split(/,\s*or\s+/);
    // try to split on and variants
    if (courses.length === 1) {
      opType = PrereqOpType.And;
      courses = source.split(/(?:\s+and\s+|,\s*and\s+|,)/);
    }
    // lastly try for regular or
    if (courses.length === 1) {
      opType = PrereqOpType.Or;
      courses = source.split(/\s+or\s+(?!better|earlier)/);
    }
  }
  courses = courses.map((c) => c.trim()).filter((c) => c);
  if (courses.length === 1) {
    const course = courses[0];
    return new PrereqLeaf(course, prereqType);
  }

  const children = courses
    .map((p) => extractPrereq(p, prereqType))
    .filter((p) => p) as Prereq[];
  if (children.length > 1) {
    return new PrereqOp(opType, children);
  } else if (children.length === 1) {
    return children[0];
  } else {
    return null;
  }
}

// this is super jank. I do not want to fix it.
function extractPrereqs(source: string, course: string): Prereq[] {
  const sections = source
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s)
    .map((s) => s.replace(/\.$/, ""));

  let groups: Prereq[] = [];
  for (const section of sections) {
    const [prefix, ...coursesArr] = section.split(":");
    const type = parsePrereqType(prefix);
    if (!type) {
      if (prefix.includes("or")) {
      } else {
        // console.error(
        //   `${course}\n\tunknown prefix type ${prefix} in\n\t${source}`
        // );
      }
      continue;
    }

    const courses = coursesArr.join(":");
    const prereq = extractPrereq(courses, type);
    if (prereq !== null) {
      groups.push(prereq);
    }
  }
  return groups;
}

// function for inserting a prereq into an adjacency table (unfinished)
// kept in case we ever change schema
/*
async function insertPrereq(
  connection: mysql.Connection,
  courseCode: string,
  prereq: Prereq,
  parent_id: number | null
) {
  if (prereq instanceof PrereqLeaf) {
    const { code, type } = prereq as PrereqLeaf;
    await connection.query("INSERT INTO `Prereqs2` VALUES (?, ?, ?, ?, ?, ?)", [
      courseCode,
      null,
      parent_id,
      "prereq",
      code,
      type,
    ]);
  } else if (prereq instanceof PrereqOp) {
    const { type, children } = prereq as PrereqOp;
    await connection.query(
      "INSERT INTO `Prereqs2` VALUES (?, ?, ?, ?, ?, ?);",
      [courseCode, null, parent_id, type, null, null]
    );
    const id = await connection.query("SELECT LAST_INSERT_ID()");
    console.log(id);
    for (const child of children) {
      // insertPrereq(connection, courseCode, child, id);
    }
    console.log(children);
  } else {
    throw `Invalid prereq ${prereq}`;
  }
}
*/

async function fetchCourses(
  prisma: PrismaClient,
  url: URL,
  catalogYear: string
) {
  const response = await fetch(url);
  const queries = [];
  const body = await response.text();
  const $ = cheerio.load(body);
  const courses = $(".courseblock");
  for (const course of courses) {
    const titleNode = $(course).find($(".courseblocktitle")).first();
    const [title, units] = titleNode.text().split("\n");

    const description = $(course).find($(".courseblockdesc")).text().trim();
    if (!title || !description) {
      console.error("Invalid Course.");
      continue;
    }
    const [codeRaw, ...fullnameParts] = title.split(".");
    // class code e.g. CSC 307
    const code = codeRaw.trim().replace(/\s/g, " ");
    const fullname = fullnameParts.join(".").trim().slice(0, -1);
    // split code into fields, (regex used because unicode space)
    const [prefix, numberStr] = code.split(/\s/);
    const number = parseInt(numberStr);
    const unitsRange = units.split(/\s/)[0];
    const [minUnits, ...maybeMaxUnits] = unitsRange
      .split("-")
      .map(parseInt)
      .map((n) => (isNaN(n) ? null : n));
    const maxUnits = maybeMaxUnits.length > 0 ? maybeMaxUnits[0] : minUnits;
    const prereqsRaw =
      $(course)
        .find($(".courseextendedwrap"))
        .first()
        .children()
        .last()
        .text() ?? "";
    const prereqs = startsWithPrereqType(prereqsRaw)
      ? extractPrereqs(prereqsRaw, code)
      : undefined;

    // console.log(`Course ${code}`);
    // console.log(prereqsRaw);
    queries.push(
      await prisma.courses.upsert({
        where: {
          CatalogYear_Code: {
            CatalogYear: catalogYear,
            Code: code,
          },
        },
        update: {},
        create: {
          CatalogYear: catalogYear,
          Code: code,
          Prefix: prefix,
          Number: number,
          MinUnits: minUnits,
          MaxUnits: maxUnits,
          Name: fullname,
          Description: description,
          Prereqs:
            prereqs?.length !== 0 ? (prereqs as Prisma.JsonArray) : undefined,
        },
      })
    );
    // console.log(JSON.stringify(prereqs, null, "  "));
    // queries.push(
    //   connection.query(
    //     "INSERT INTO `Courses` VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    //     [
    //       code,
    //       prefix,
    //       number,
    //       minUnits,
    //       maxUnits,
    //       fullname,
    //       description,
    //       JSON.stringify(prereqs?.length !== 0 ? prereqs : null),
    //     ]
    //   )
    // );
  }
  // scrictly speaking not needed since connection.end will catch these but
  // good practice
  await Promise.all(queries);
}

main();
