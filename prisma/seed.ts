/**
 * Seed script – reads the two xlsx files and loads data into Postgres via Prisma.
 *
 * Usage:
 *   1. Set DATABASE_URL in .env
 *   2. pnpm db:migrate --name init
 *   3. pnpm db:seed
 */

import "dotenv/config";
import { join } from "path";
import XLSX from "xlsx";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function clean(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return String(value);
  return String(value).replace(/\n/g, " ").trim() || null;
}

async function main() {
  // ── 1. Read xlsx files ────────────────────────────────────────────────────
  const dbPath = join(__dirname, "../../pharma/Project_database_filled.xlsx");
  const csPath = join(__dirname, "../../pharma/case study example.xlsx");

  const wb1 = XLSX.readFile(dbPath);
  const mainData = XLSX.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]]) as Record<string, unknown>[];

  const wb2 = XLSX.readFile(csPath);
  const caseData = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]]) as Record<string, unknown>[];

  // ── 2. Clear existing data ─────────────────────────────────────────────────
  await prisma.caseStudy.deleteMany();
  await prisma.nanomaterial.deleteMany();

  // ── 3. Seed nanomaterials ─────────────────────────────────────────────────
  const nanomaterialMap: Record<number, number> = {}; // sampleId → db id

  for (const row of mainData) {
    const sampleId = row["Sample ID "];
    if (!sampleId || !row["Nanomaterial"]) continue;

    const created = await prisma.nanomaterial.create({
      data: {
        sampleId: Number(sampleId),
        name: clean(row["Nanomaterial"])!,
        nanoForm: clean(row["Nano form "]),
        particleSize: clean(row["Particle size\n (nm)"]),
        shape: clean(row["Shape"]),
        zetaPotential: clean(row["Zeta potential\n(mv)"]),
        surfaceCoating: clean(row["surface coating"]),
        surfaceArea: clean(row["Surface area\n(m2/g)"]),
        aggregation: clean(row["aggregation (hydrodynamic size)"]),
        aggregationRange: clean(row["range of the aggregation"]),
        solubility: clean(row["Solubility\n (mg/L)"]),
        exposureRoute: clean(row["Exposure Route"]),
        cytotoxicity: clean(row["Cytotoxicity"]),
        skinIrritation: clean(row["Skin irritation"]),
        immunoToxicity: clean(row["immuno toxicity"]),
        reproductiveToxicity: clean(row["reproductive toxicity "]),
        carcinotoxicity: clean(row["Carcinotoxicity"]),
        genotoxicity: clean(row["Genotoxicity"]),
        regulatoryRisk: clean(row["Regulatory risk"]),
        regulatoryStatus: clean(row["Regulatory Status"]),
        sccsConclusion: clean(row["SCCS Conclusion"]),
        primarySource: clean(row["Primary Source"]),
        officialDocument: clean(row["Official Document "]),
        doiReference: clean(row["DOI/Official Reference"]),
        remarks: clean(row["Remarks"]),
        oecdGuidelines: clean(row["OECD Test Guidelines\nRelevant"]),
        fdaRemarks: clean(row["FDA Remarks"]),
        maxConcentration: clean(row["Maximum Permitted\nConcentration \nin Cosmetics"]),
      },
    });

    nanomaterialMap[Number(sampleId)] = created.id;
    console.log(`✔ Nanomaterial [${sampleId}]: ${created.name}`);
  }

  // ── 4. Seed case studies ──────────────────────────────────────────────────
  const keywords: [string, number][] = [
    ["titanium", 1], ["zinc oxide", 2], ["zinc", 2],
    ["silver", 3], ["gold", 4], ["silica", 5],
    ["liposome", 6], ["niosome", 7], ["sln", 8], ["solid lipid", 8],
    ["nlc", 9], ["nanostructured lipid", 9], ["nanoemulsion", 10], ["nano emulsion", 10],
    ["sphingosome", 11], ["dendrimer", 12], ["nanosphere", 13],
    ["polymeric nanoparticle", 14], ["cubosome", 15], ["fullerene", 16],
    ["carbon black", 17], ["chitosan", 18], ["nanoclay", 19], ["ethosome", 20],
  ];

  function findNanomaterialId(csName: unknown): number | null {
    if (!csName) return null;
    const normalised = String(csName).toLowerCase().replace(/\s+/g, " ").trim();
    for (const [kw, sid] of keywords) {
      if (normalised.includes(kw)) return nanomaterialMap[sid] ?? null;
    }
    return null;
  }

  for (const row of caseData) {
    const slNumber = row["sl number"];
    if (!slNumber) continue;

    const nmId = findNanomaterialId(row["nano material"]);
    if (!nmId) {
      console.warn(`⚠  Could not match case study [${slNumber}]: ${row["nano material"]}`);
      continue;
    }

    await prisma.caseStudy.create({
      data: {
        slNumber: Number(slNumber),
        exampleProduct: clean(row["example product"]) ?? "Unknown",
        particleSize: clean(row["particle size (nm)"]),
        shape: clean(row["shape"]),
        zetaPotential: clean(row["zeta potential(mv)"]),
        surfaceCoating: clean(row["surface coating"]),
        surfaceArea: clean(row["surafce area(m2/g)"]),
        aggregation: clean(row["aggregation"]),
        hydroDynamicSize: clean(row["hydrodynamic size(nm)"]),
        solubility: clean(row["solubility(mg/l)"]),
        exposureRoute: clean(row["exposure route"]),
        cytotoxicity: clean(row["cytotoxicity"]),
        skinIrritation: clean(row["skin irritation"]),
        immunoToxicity: clean(row["immunotoxicity"]),
        reproductiveToxicity: clean(row["reproductive toxocity"]),
        carcinotoxicity: clean(row["carcinotoxicity"]),
        genotoxicity: clean(row["genotoxicity"]),
        nanomaterialId: nmId,
      },
    });

    console.log(`✔ CaseStudy [${slNumber}]: ${row["example product"]}`);
  }

  console.log("\n✅  Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
