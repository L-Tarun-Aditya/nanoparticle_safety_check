"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { computeSafetyScore } from "@/lib/safety";

interface Nanomaterial {
  id: number;
  name: string;
  nanoForm?: string | null;
  particleSize?: string | null;
  shape?: string | null;
  zetaPotential?: string | null;
  surfaceCoating?: string | null;
  surfaceArea?: string | null;
  aggregation?: string | null;
  solubility?: string | null;
  exposureRoute?: string | null;
  cytotoxicity?: string | null;
  skinIrritation?: string | null;
  immunoToxicity?: string | null;
  reproductiveToxicity?: string | null;
  carcinotoxicity?: string | null;
  genotoxicity?: string | null;
  regulatoryStatus?: string | null;
  regulatoryRisk?: string | null;
  sccsConclusion?: string | null;
  fdaRemarks?: string | null;
  maxConcentration?: string | null;
  remarks?: string | null;
}

export interface ProductResult {
  id: number;
  exampleProduct: string;
  particleSize?: string | null;
  shape?: string | null;
  cytotoxicity?: string | null;
  skinIrritation?: string | null;
  exposureRoute?: string | null;
  nanomaterial: Nanomaterial;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="font-display text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="text-sm leading-snug">{value}</p>
    </div>
  );
}

function SafetyBar({ safePercent, unsafePercent }: { safePercent: number; unsafePercent: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="font-display text-base font-bold uppercase tracking-wide text-green-600 dark:text-green-400">✅ Safe {safePercent}%</span>
        <span className="font-display text-base font-bold uppercase tracking-wide text-red-600 dark:text-red-400">🚫 Unsafe {unsafePercent}%</span>
      </div>
      <div className="relative h-5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute left-0 top-0 h-full rounded-l-full bg-green-500 transition-all duration-700"
          style={{ width: `${safePercent}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full rounded-r-full bg-red-500 transition-all duration-700"
          style={{ width: `${unsafePercent}%` }}
        />
      </div>
    </div>
  );
}

function FactorRow({ label, weight, safe, note }: { label: string; weight: number; safe: boolean; note: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <span className={`mt-0.5 text-base shrink-0 ${safe ? "text-green-500" : "text-red-500"}`}>
        {safe ? "✓" : "✗"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display text-sm font-bold uppercase tracking-wide">{label}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            weight {weight}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate" title={note}>{note}</p>
      </div>
      <span className={`text-xs font-semibold shrink-0 ${safe ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
        {safe ? "Low risk" : "Concern"}
      </span>
    </div>
  );
}

const verdictConfig = {
  Safe: {
    badge: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
    label: "Safe to Use",
  },
  Caution: {
    badge: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700",
    label: "Use with Caution",
  },
  Unsafe: {
    badge: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
    label: "Unsafe",
  },
};

export function ResultsCard({ product }: { product: ProductResult }) {
  const nm = product.nanomaterial;

  // Use product-specific data where available, fall back to nanomaterial DB data
  const scoreInput = {
    regulatoryStatus: nm.regulatoryStatus,
    cytotoxicity: product.cytotoxicity ?? nm.cytotoxicity,
    carcinotoxicity: nm.carcinotoxicity,
    skinIrritation: product.skinIrritation ?? nm.skinIrritation,
    immunoToxicity: nm.immunoToxicity,
    reproductiveToxicity: nm.reproductiveToxicity,
    genotoxicity: nm.genotoxicity,
  };

  const { safePercent, unsafePercent, verdict, factors } = computeSafetyScore(scoreInput);
  const vc = verdictConfig[verdict];

  return (
    <Card className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CardHeader className="pb-3">
        {/* Product name + verdict badge */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="font-display text-2xl font-bold uppercase tracking-wide">{product.exampleProduct}</CardTitle>
            <CardDescription className="mt-1">
              Active nanotechnology: <span className="font-medium text-foreground">{nm.name}</span>
            </CardDescription>
          </div>
          <Badge variant="outline" className={`px-3 py-1 font-display text-sm font-bold uppercase tracking-widest ${vc.badge}`}>
            {vc.label}
          </Badge>
        </div>

        {/* Safety percentage bar */}
        <div className="mt-4">
          <SafetyBar safePercent={safePercent} unsafePercent={unsafePercent} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Factor breakdown */}
        <section>
          <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-widest">
            Safety Factor Breakdown
          </h3>
          <div className="rounded-lg border bg-muted/30 px-4 py-1">
            {factors.map((f) => (
              <FactorRow key={f.label} {...f} />
            ))}
          </div>
        </section>

        {/* Chemical composition */}
        <section>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest">
            Chemical Composition
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            <Field label="Nano Form" value={nm.nanoForm} />
            <Field label="Particle Size" value={product.particleSize ?? nm.particleSize} />
            <Field label="Shape" value={product.shape ?? nm.shape} />
            <Field label="Zeta Potential" value={nm.zetaPotential} />
            <Field label="Surface Coating" value={nm.surfaceCoating} />
            <Field label="Surface Area" value={nm.surfaceArea} />
            <Field label="Aggregation" value={nm.aggregation} />
            <Field label="Solubility" value={nm.solubility} />
            <Field label="Exposure Route" value={product.exposureRoute ?? nm.exposureRoute} />
          </div>
        </section>

        {/* Regulatory */}
        <section>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest">Regulatory</h3>
          <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
            <Field label="Regulatory Status" value={nm.regulatoryStatus} />
            <Field label="Regulatory Risk" value={nm.regulatoryRisk} />
            <Field label="Max Concentration in Cosmetics" value={nm.maxConcentration} />
          </div>
          {nm.sccsConclusion && (
            <div className="mt-3 rounded-md bg-muted/50 p-3">
              <p className="font-display text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                SCCS Conclusion
              </p>
              <p className="mt-1 text-sm leading-relaxed">{nm.sccsConclusion}</p>
            </div>
          )}
          {nm.fdaRemarks && (
            <div className="mt-3 rounded-md bg-muted/50 p-3">
              <p className="font-display text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                FDA Remarks
              </p>
              <p className="mt-1 text-sm leading-relaxed">{nm.fdaRemarks}</p>
            </div>
          )}
        </section>

        {/* Remarks */}
        {nm.remarks && (
          <section>
            <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-widest">Remarks</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{nm.remarks}</p>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
