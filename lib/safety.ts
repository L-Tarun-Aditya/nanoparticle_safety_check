export interface SafetyScore {
  safePercent: number;   // 0–100
  unsafePercent: number; // 0–100
  verdict: "Safe" | "Caution" | "Unsafe";
  factors: SafetyFactor[];
}

export interface SafetyFactor {
  label: string;
  weight: number;       // contribution to overall score (0–100)
  safe: boolean;
  note: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function low(v: string | null | undefined) {
  return (v ?? "").toLowerCase();
}

function scoreField(value: string | null | undefined): {
  score: number; // 0 = fully unsafe, 100 = fully safe
  note: string;
} {
  const v = low(value);
  if (!v || v === "unknown" || v === "n/a" || v === "-") return { score: 50, note: "No data" };

  if (v.includes("no evidence") || v === "no" || v === "negative" || v.includes("non-irritant") || v.includes("non irritant"))
    return { score: 100, note: value! };

  if (v.includes("high") || v.includes("confirmed") || v === "yes" || v.includes("banned") || v.includes("prohibited"))
    return { score: 0, note: value! };

  if (v.includes("moderate") && v.includes("low"))
    return { score: 55, note: value! };

  if (v.startsWith("low") || v.includes("low ("))
    return { score: 85, note: value! };

  if (v.includes("low-moderate") || v.includes("low to moderate") || v.includes("low–moderate"))
    return { score: 60, note: value! };

  if (v.includes("moderate"))
    return { score: 35, note: value! };

  if (v.includes("possible"))
    return { score: 40, note: value! };

  if (v.includes("slightly") || v.includes("mild"))
    return { score: 70, note: value! };

  return { score: 65, note: value! };
}

function regulatoryScore(value: string | null | undefined): { score: number; note: string } {
  const v = low(value);
  if (!v) return { score: 20, note: "No regulatory data" };

  if (v.includes("banned") || v.includes("prohibited") || v.includes("not permitted"))
    return { score: 0, note: value! };

  if (v.includes("approved") && (v.includes("condition") || v.includes("restriction")))
    return { score: 80, note: value! };

  if (v.includes("approved") && v.includes("case-by-case"))
    return { score: 65, note: value! };

  if (v.includes("approved") && v.includes("strict"))
    return { score: 70, note: value! };

  if (v.includes("approved"))
    return { score: 90, note: value! };

  return { score: 40, note: value! };
}

// ── main export ───────────────────────────────────────────────────────────────

export function computeSafetyScore(material: {
  regulatoryStatus?: string | null;
  cytotoxicity?: string | null;
  carcinotoxicity?: string | null;
  skinIrritation?: string | null;
  immunoToxicity?: string | null;
  reproductiveToxicity?: string | null;
  genotoxicity?: string | null;
}): SafetyScore {
  // Each factor: { label, getter, weight (total weights must sum to 100) }
  const rawFactors: { label: string; value: string | null | undefined; weight: number; scorer?: typeof regulatoryScore }[] = [
    { label: "Regulatory Status",     value: material.regulatoryStatus,     weight: 30, scorer: regulatoryScore },
    { label: "Cytotoxicity",          value: material.cytotoxicity,          weight: 20 },
    { label: "Carcinotoxicity",       value: material.carcinotoxicity,       weight: 20 },
    { label: "Skin Irritation",       value: material.skinIrritation,        weight: 10 },
    { label: "Genotoxicity",          value: material.genotoxicity,          weight: 10 },
    { label: "Immunotoxicity",        value: material.immunoToxicity,        weight: 5  },
    { label: "Reproductive Toxicity", value: material.reproductiveToxicity,  weight: 5  },
  ];

  const factors: SafetyFactor[] = rawFactors.map(({ label, value, weight, scorer }) => {
    const { score, note } = scorer ? scorer(value) : scoreField(value);
    return { label, weight, safe: score >= 60, note };
  });

  // Weighted average
  const totalWeight = rawFactors.reduce((s, f) => s + f.weight, 0);
  const weightedScore = rawFactors.reduce((sum, f, i) => {
    const { score } = f.scorer ? f.scorer(f.value) : scoreField(f.value);
    return sum + (score * f.weight) / totalWeight;
  }, 0);

  const safePercent = Math.round(weightedScore);
  const unsafePercent = 100 - safePercent;

  let verdict: SafetyScore["verdict"];
  if (safePercent >= 70) verdict = "Safe";
  else if (safePercent >= 45) verdict = "Caution";
  else verdict = "Unsafe";

  return { safePercent, unsafePercent, verdict, factors };
}
