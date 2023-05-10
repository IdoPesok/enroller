require("dotenv").config();
import mysql from "mysql2/promise";
import { exit } from "process";
import puppeteer from 'puppeteer';
const fetch = require('node-fetch');

interface Concentration {
  name: string;
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

  console.log(response)

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
        Id VARCHAR(255) PRIMARY KEY,\
        Name VARCHAR(255) NOT NULL,\
        CatalogYear VARCHAR(10)\
      )"
    );

    console.log("created majors table");

    await connection.query(
      "CREATE TABLE IF NOT EXISTS `Concentrations` (\
        Id VARCHAR(10),\
        Name VARCHAR(255) NOT NULL,\
        MajorId VARCHAR(255),\
        PRIMARY KEY (MajorId, Id),\
      )"
    );

    console.log("created concentrations table");
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

    console.log("dropped tables");
  } catch (e) {
    console.error("error dropping tables", e);
    exit(1);
  }
}

async function saveCatalogs(connection: mysql.Connection, catalogs: Catalog[]) {
  try {
    for (const catalog of catalogs) {
      await connection.query("INSERT INTO Catalogs (CatalogYear) VALUES (?)", [
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
      await connection.query("INSERT INTO Majors (Id, Name, CatalogYear) VALUES (?, ?, ?)", [
        major.id,
        major.name,
        catalogYear
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
      }

      await connection.query("INSERT INTO Concentrations (Id, Name, MajorId) VALUES (?, ?, ?)", [
        concentration.id,
        concentration.name,
        majorId
      ]);
    }

    console.log("saved concentrations for major " + majorId);
  } catch (e) {
    console.error("error saving concentrations", e);
    exit(1);
  }
}

async function main() {
  const connection = await getConnection();

  // import json file from assets/flowcharts.json
  const catalogs = require('../assets/flowcharts.json') as Catalog[];

  // get cookies to make requests
  // note it is recommended to run get cookies one time, then replace getCookies with the cookies as a string
  const cookies = "_ga=GA1.1.2143786650.1683676847; _ga_G38JXCL5JS=GS1.1.1683676846.1.1.1683676851.0.0.0; _gat_gtag_UA_173468759_1=1; _gid=GA1.2.1132281474.1683676848; s=s%3A5qMrxSkcVrej8Hqb7kKUSQcLa8Uqqi1C.YFZFeLmkw4cPVA3HaFGlr6iO1%2BqRleliSgh6%2FG9wzWk" 
  // const cookies = await getCookies();

  await dropTables(connection);
  await createTables(connection);

  await saveCatalogs(connection, catalogs);

  for (const catalog of catalogs) {
    const flowCatalogYear = catalog.name;

    await saveMajors(connection, catalog.majors, flowCatalogYear)

    for (const major of catalog.majors) {
      const flowMajor = major.id;
      await saveConcentrations(connection, major.concentrations, flowMajor)

      for (const concentration of major.concentrations) {
        const flowConcentration = concentration.id;

        const payload = generateGetDefaultFlowPayload(flowCatalogYear, flowMajor, flowConcentration);

        try {
          const response = await getDefaultFlowData(payload, cookies);

          console.log(response);

          // only call once for now
          return
        } catch (e) {
          console.log(e);
          exit(1);
        }
      }
    }
  }

}

main();