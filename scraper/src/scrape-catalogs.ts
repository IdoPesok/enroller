require("dotenv").config();
import mysql from "mysql2/promise";
import { exit } from "process";
import puppeteer from 'puppeteer';
const fetch = require('node-fetch');

interface Concentration {
  name: string | null;
  id: string;
  fullFlowId: string;
}

interface Major {
  name: string;
  id: string;
  concentrations: Concentration[];
}

interface Catalog {
  name: string;
  majors: Major[];
}

interface CourseData {
  cAddl: string,
  cDesc: string,
  cID: string,
  cNum: string,
  cUnits: string,
  cDisplayName: string
}

interface GetDefaultFlowResponse {
  courseData: CourseData[]
}

interface GetDefaultFlowPayload {
  flowCatalogYear: string,
  flowMajor: string,
  flowConcentration: string,
  options: {
    fgoRemoveGE: boolean
  }
}

const BASE_API_URL = 'https://polyflowbuilder.duncanapple.io/api';

function generateGetDefaultFlowPayload(flowCatalogYear: string, flowMajor: string, flowConcentration: string): GetDefaultFlowPayload {
  return {
      flowCatalogYear,
      flowMajor,
      flowConcentration,
      "options": {
        "fgoRemoveGE": false
      }
  }
}

async function getDefaultFlowData(payload: GetDefaultFlowPayload, cookieJar: string): Promise<GetDefaultFlowResponse> {
  const url = `${BASE_API_URL}/util/getDefaultFlow`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieJar
    },
    body: JSON.stringify(payload)
  });

  return await response.json() as GetDefaultFlowResponse;
}

async function getCookies(): Promise<string> {
  if (!process.env.POLYFLOWBUILDER_USERNAME || !process.env.POLYFLOWBUILDER_PASSWORD) {
    console.log(process.env)
    console.log('Please set the POLYFLOWBUILDER_USERNAME and POLYFLOWBUILDER_PASSWORD environment variables');
    exit(1);
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://polyflowbuilder.duncanapple.io/login');

  // Fill in the username and password fields
  // Replace #username and #password with actual selectors from the website
  await page.type('#email', process.env.POLYFLOWBUILDER_USERNAME);
  await page.type('#password', process.env.POLYFLOWBUILDER_PASSWORD);

  // Click the login button
  // click the Sign in button with type submit and value Sign in
  await Promise.all([
      page.waitForNavigation(), 
      page.click('button.btn.btn-lg.btn-success.btn-block[type="submit"]')
  ]);

  // Get cookies and transform them into the correct format for axios
  const cookies = await page.cookies();
  const axiosCookieJar = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

  await browser.close();

  console.log(`GOT COOKIES:\n===\n${axiosCookieJar}\n===`)

  return axiosCookieJar;
}

async function getConnection(): Promise<mysql.Connection> {
  if (!process.env.DATABASE_URL) {
    console.error("missing database url");
    exit(1);
  }
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    debug: false,
  });
}

async function createTables(connection: mysql.Connection) {
  try {
    await connection.query(
      "CREATE TABLE IF NOT EXISTS `Catalogs` (\
        CatalogYear VARCHAR(10) PRIMARY KEY\
      )"
    );

    console.log("created catalogs table");

    await connection.query(
      "CREATE TABLE IF NOT EXISTS `Majors` (\
        Id VARCHAR(24) PRIMARY KEY,\
        Name VARCHAR(255) NOT NULL\
      )"
    );

    console.log("created majors table");

    await connection.query(
      "CREATE TABLE IF NOT EXISTS `Concentrations` (\
        Id VARCHAR(10),\
        Name VARCHAR(255),\
        MajorId VARCHAR(255),\
        PRIMARY KEY (Id, MajorId)\
      )"
    );

    console.log("created concentrations table");

    await connection.query(
      "CREATE TABLE IF NOT EXISTS `Flowcharts` (\
        FlowchartId VARCHAR(255) PRIMARY KEY,\
        CatalogYear VARCHAR(10) NOT NULL,\
        MajorId VARCHAR(24) NOT NULL,\
        ConcentrationId VARCHAR(24) NOT NULL\
      )"
    );

    console.log("created flowcharts table");

    await connection.query(
      "CREATE TABLE IF NOT EXISTS `GraduationRequirements` (\
        FlowchartId VARCHAR(255),\
        Code varchar(10) NOT NULL,\
        PRIMARY KEY (FlowchartId, Code)\
      )"
    );

    console.log("created graduation requirements table");
  } catch (e) {
    console.error("error creating tables", e);
    exit(1);
  }

}

async function dropTables(connection: mysql.Connection) {
  try {
    await connection.query("DROP TABLE IF EXISTS `Concentrations`");
    await connection.query("DROP TABLE IF EXISTS `Majors`");
    await connection.query("DROP TABLE IF EXISTS `Catalogs`");
    await connection.query("DROP TABLE IF EXISTS `Flowcharts`");
    await connection.query("DROP TABLE IF EXISTS `GraduationRequirements`");

    console.log("dropped tables");
  } catch (e) {
    console.error("error dropping tables", e);
    exit(1);
  }
}

async function saveCatalogs(connection: mysql.Connection, catalogs: Catalog[]) {
  try {
    for (const catalog of catalogs) {
      await connection.query("INSERT IGNORE INTO Catalogs (CatalogYear) VALUES (?)", [
        catalog.name,
      ]);
    }
    console.log("saved catalogs");
  } catch (e) {
    console.error("error saving catalogs", e);
    exit(1);
  }
}

async function saveMajors(connection: mysql.Connection, majors: Major[], catalogYear: string) {
  try {
    for (const major of majors) {
      await connection.query("INSERT IGNORE INTO Majors (Id, Name) VALUES (?, ?)", [
        major.id,
        major.name
      ]);
    }

    console.log("saved majors for catalog year " + catalogYear);
  } catch (e) {
    console.error("error saving majors", e);
    exit(1);
  }
}

async function saveConcentrations(connection: mysql.Connection, concentrations: Concentration[], majorId: string) {
  try {
    for (const concentration of concentrations) {
      const temp = {...concentration}
      if (!temp.id || temp.id === "") {
        temp.id = "GENERAL"
        temp.name = null;
      }

      await connection.query("INSERT IGNORE INTO Concentrations (Id, Name, MajorId) VALUES (?, ?, ?)", [
        temp.id,
        temp.name,
        majorId
      ]);
    }

    console.log("saved concentrations for major " + majorId);
  } catch (e) {
    console.error("error saving concentrations", e);
    exit(1);
  }
}

const GENERAL_CONCENTRATION_ID = "GENERAL";

function getFlowchartId(catalogYear: string, majorId: string, concentrationId: string) {
  const id = (!concentrationId || concentrationId === "") ? GENERAL_CONCENTRATION_ID : concentrationId;
  return `${catalogYear}-${majorId}-${id}`
}

async function saveFlowchart(
  connection: mysql.Connection, 
  concentration: Concentration, 
  major: Major, 
  catalogYear: string,
  courseData: CourseData[]
) {
  try {
    const temp = {...concentration}
    if (!temp.id || temp.id.trim() === "") {
      temp.id = GENERAL_CONCENTRATION_ID
      temp.name = null
    }

    const flowchartId = getFlowchartId(catalogYear, major.id, temp.id);

    await connection.query("INSERT INTO `Flowcharts` (FlowchartId, CatalogYear, MajorId, ConcentrationId) VALUES (?, ?, ?, ?)", [
      flowchartId,
      catalogYear,
      major.id,
      temp.id
    ]);

    for (const course of courseData) {
      // insert space before the course number in the course id
      const ix = course.cID.indexOf(course.cNum.toString());
      const courseCode = course.cID.slice(0, ix) + " " + course.cID.slice(ix);
      console.log(courseCode)
      await connection.query("INSERT IGNORE INTO `GraduationRequirements` (FlowchartId, Code) VALUES (?, ?)", [
        flowchartId,
        courseCode
      ]);
    }

    console.log(`saved flowchart ${flowchartId}`)
  } catch (e) {
    console.error("error saving concentrations", e);
    exit(1);
  }
}

async function haveGradRequirementsBeenAdded(connection: mysql.Connection, flowchartId: string): Promise<boolean> {
  const result = await connection.query("SELECT 1 FROM `GraduationRequirements` WHERE FlowchartId = ? LIMIT 1", [
    flowchartId
  ]);

  return (result[0] as unknown[]).length > 0;
}

async function main() {
  const connection = await getConnection();

  // import json file from assets/flowcharts.json
  const catalogs = require('../assets/flowcharts.json') as Catalog[];

  // get cookies to make requests
  // note it is recommended to run get cookies one time, then replace getCookies with the cookies as a string
  const cookies = await getCookies();

  const START_FROM_SCRATCH = true;

  if (START_FROM_SCRATCH) {
    await dropTables(connection);
    await createTables(connection);

    await saveCatalogs(connection, catalogs);
  }

  for (const catalog of catalogs) {
    const flowCatalogYear = catalog.name;

    await saveMajors(connection, catalog.majors, flowCatalogYear);

    for (const major of catalog.majors) {
      await saveConcentrations(connection, major.concentrations, major.id);

      for (const concentration of major.concentrations) {
        const flowConcentration = concentration.id;

        const payload = generateGetDefaultFlowPayload(flowCatalogYear, major.id, flowConcentration);
        const flowchartId = getFlowchartId(flowCatalogYear, major.id, flowConcentration);

        try {
          const gradAdded = await haveGradRequirementsBeenAdded(connection, flowchartId);
          if (!START_FROM_SCRATCH && gradAdded) {
            console.log(`grad requirements for ${flowchartId} already exists`)
            continue;
          }

          const response = await getDefaultFlowData(payload, cookies);

          // only call once for now
          await saveFlowchart(connection, concentration, major, flowCatalogYear, response.courseData)
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  await connection.end();
}

main();