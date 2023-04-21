require("dotenv").config();
import mysql from "mysql2/promise";
import { exit } from "process";
import { JSDOM } from "jsdom";
import { resolve } from "path";

const PrereqTypeMap: { [type: string]: PrereqType } = {
  Prerequisite: PrereqType.Prerequisite,
  Prerequisites: PrereqType.Prerequisite,
  Corequisite: PrereqType.Corequisite,
  Corequisites: PrereqType.Corequisite,
  Recommended: PrereqType.Reccomended,
  Concurrent: PrereqType.Concurrent,
};

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("missing database url");
    exit(1);
  }
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    debug: false,
  });
  console.log("Connected to PlanetScale!");
  const url = "https://catalog.calpoly.edu/coursesaz/";
  const response = await fetch(url);
  const body = await response.text();
  const dom = new JSDOM(body);
  const urls = dom.window.document.getElementsByClassName("sitemaplink");
  const promises = [];
  for (const urlEl of urls) {
    const path = urlEl.getAttribute("href");
    if (path === null) {
      throw "invalid path";
    }
    const url = new URL(path, "https://catalog.calpoly.edu/");
    promises.push(fetchCourses(connection, url));
  }
  await Promise.all(promises);
  await connection.end();
}

function isCourseCode(code: string): boolean {
  return /[A-Z]+\s[0-9]+/.test(code);
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

function parsePrereqType(type: string): PrereqType | null {
  return PrereqTypeMap[type] ?? null;
}

function extractPrereq(
  source: string,
  prereqType: PrereqType,
  opType: PrereqOpType
): Prereq | null {
  let splitter;
  if (opType === PrereqOpType.And) {
    // if the source string includes semicolons they should be split on
    if (source.includes(";")) {
      splitter = /(?:\s+[;,]\s*and\s+|[;,])\s+/;
    } else {
      splitter = /(?:\s+and\s+|,\s*and\s+|,)/;
    }
  } else {
    splitter = /\s+or\s+/;
  }
  const courses = source
    .split(splitter)
    .map((c) => c.trim())
    .filter((c) => c);
  if (courses.length === 1) {
    const course = courses[0];
    if (isCourseCode(course)) {
      return new PrereqLeaf(course, prereqType);
    } else {
      return null;
    }
  }

  const children = courses
    .map((p) =>
      extractPrereq(
        p,
        prereqType,
        opType === PrereqOpType.And ? PrereqOpType.Or : PrereqOpType.And
      )
    )
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
function extractPrereqs(source: string): Prereq[] {
  const sections = source
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s);

  let groups: Prereq[] = [];
  for (const section of sections) {
    const [prefix, ...coursesArr] = section.split(":");
    const type = parsePrereqType(prefix);
    if (!type) {
      console.error(`unknown prefix type ${prefix} in ${source}`);
      continue;
    }

    const courses = coursesArr.join(":");
    let prereq;
    if (/(;|,|\s+and\s+)/.test(courses)) {
      prereq = extractPrereq(courses, type, PrereqOpType.And);
    } else {
      prereq = extractPrereq(courses, type, PrereqOpType.Or);
    }

    if (prereq !== null) {
      groups.push(prereq);
    }
  }
  return groups;
}

// function for inserting a prereq into an adjacency table (unfinished)
// kept in case we ever change schema
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

async function fetchCourses(connection: mysql.Connection, url: URL) {
  const response = await fetch(url);
  if (response.status != 200) {
    console.error("failed to fetch courses");
    exit(1);
  }

  const queries = [];
  const body = await response.text();
  const dom = new JSDOM(body);
  const courses = dom.window.document.getElementsByClassName("courseblock");
  for (const course of courses) {
    const titleNode =
      course.getElementsByClassName("courseblocktitle")[0]?.firstChild;
    const title = titleNode?.firstChild?.textContent;
    const units = titleNode?.lastChild?.textContent;
    const description = course
      .getElementsByClassName("courseblockdesc")[0]
      .textContent?.trim();
    if (!title || !units || !description) {
      console.error("Missing property.");
      continue;
    }
    const [codeRaw, ...fullnameParts] = title.split(".");
    // class code e.g. CSC 307
    const code = codeRaw.trim();
    const fullname = fullnameParts.join(".").trim().slice(0, -1);
    // split code into fields, (regex used because unicode space)
    const [prefix, numberStr] = code.split(/\s/);
    const number = parseInt(numberStr);
    const unitsRange = units.split(/\s/)[0];
    const [minUnits, ...maybeMaxUnits] = unitsRange.split("-");
    const maxUnits = maybeMaxUnits.length > 0 ? maybeMaxUnits[0] : minUnits;
    const prereqsRaw =
      course.getElementsByClassName("courseextendedwrap")[0].lastChild
        ?.textContent ?? "";
    const prereqs = Object.keys(PrereqTypeMap).some((key) =>
      prereqsRaw.startsWith(key)
    )
      ? extractPrereqs(prereqsRaw)
      : null;
    console.log(`Adding course ${code}`);
    queries.push(
      connection.query(
        "INSERT INTO `Courses` VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          code,
          prefix,
          number,
          minUnits,
          maxUnits,
          fullname,
          description,
          JSON.stringify(prereqs?.length !== 0 ? prereqs : null),
        ]
      )
    );
  }
  // scrictly speaking not needed since connection.end will catch these but
  // good practice
  await Promise.all(queries);
}

main();
