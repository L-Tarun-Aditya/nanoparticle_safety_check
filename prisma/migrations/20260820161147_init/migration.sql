-- CreateTable
CREATE TABLE "Nanomaterial" (
    "id" SERIAL NOT NULL,
    "sampleId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nanoForm" TEXT,
    "particleSize" TEXT,
    "shape" TEXT,
    "zetaPotential" TEXT,
    "surfaceCoating" TEXT,
    "surfaceArea" TEXT,
    "aggregation" TEXT,
    "aggregationRange" TEXT,
    "solubility" TEXT,
    "exposureRoute" TEXT,
    "cytotoxicity" TEXT,
    "skinIrritation" TEXT,
    "immunoToxicity" TEXT,
    "reproductiveToxicity" TEXT,
    "carcinotoxicity" TEXT,
    "genotoxicity" TEXT,
    "regulatoryRisk" TEXT,
    "regulatoryStatus" TEXT,
    "sccsConclusion" TEXT,
    "primarySource" TEXT,
    "officialDocument" TEXT,
    "doiReference" TEXT,
    "remarks" TEXT,
    "oecdGuidelines" TEXT,
    "fdaRemarks" TEXT,
    "maxConcentration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nanomaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" SERIAL NOT NULL,
    "slNumber" INTEGER NOT NULL,
    "exampleProduct" TEXT NOT NULL,
    "particleSize" TEXT,
    "shape" TEXT,
    "zetaPotential" TEXT,
    "surfaceCoating" TEXT,
    "surfaceArea" TEXT,
    "aggregation" TEXT,
    "hydroDynamicSize" TEXT,
    "solubility" TEXT,
    "exposureRoute" TEXT,
    "cytotoxicity" TEXT,
    "skinIrritation" TEXT,
    "immunoToxicity" TEXT,
    "reproductiveToxicity" TEXT,
    "carcinotoxicity" TEXT,
    "genotoxicity" TEXT,
    "nanomaterialId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nanomaterial_sampleId_key" ON "Nanomaterial"("sampleId");

-- AddForeignKey
ALTER TABLE "CaseStudy" ADD CONSTRAINT "CaseStudy_nanomaterialId_fkey" FOREIGN KEY ("nanomaterialId") REFERENCES "Nanomaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
