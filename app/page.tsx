"use client";

import { useState } from "react";
import { SearchCombobox, ProductOption } from "@/components/search-combobox";
import { ResultsCard, ProductResult } from "@/components/results-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { FlaskConical, Loader2 } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<ProductResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(product: ProductOption) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // The product search API already includes the nanomaterial — fetch full detail
      const res = await fetch(`/api/products/${product.id}`);
      if (!res.ok) throw new Error("Failed to load product data");
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold tracking-wide uppercase">NanoSafety Checker</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
        {/* Hero */}
        <section className="text-center space-y-2">
          <h1 className="font-display text-4xl font-extrabold tracking-widest uppercase sm:text-5xl">
            Is Your Cosmetic Product Safe?
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Search any cosmetic product — sunscreen, moisturiser, kajal — to instantly
            see its nano-ingredient composition, toxicology profile, and a
            percentage-based safety verdict.
          </p>
        </section>

        {/* Search */}
        <section className="flex justify-center">
          <SearchCombobox onSelect={handleSelect} />
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <section className="flex justify-center">
            <ResultsCard product={result} />
          </section>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <FlaskConical className="h-14 w-14 opacity-15" />
            <p className="text-sm">Type a product name above to get its safety report.</p>
            <p className="text-xs opacity-60">e.g. "Neutrogena", "Maybelline Kajal", "Dior"</p>
          </div>
        )}
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Safety data sourced from SCCS opinions and FDA guidance documents.
      </footer>
    </div>
  );
}
