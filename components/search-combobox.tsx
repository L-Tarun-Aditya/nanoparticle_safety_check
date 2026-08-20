"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronsUpDown, Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ProductOption {
  id: number;
  exampleProduct: string;
  nanomaterial: { name: string };
}

interface SearchComboboxProps {
  onSelect: (product: ProductOption) => void;
}

export function SearchCombobox({ onSelect }: SearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ProductOption | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all on first open
  useEffect(() => {
    if (open && options.length === 0) fetchOptions("");
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOptions(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, open]);

  async function fetchOptions(q: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
      if (res.ok) setOptions(await res.json());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  function handleSelect(opt: ProductOption) {
    setSelected(opt);
    setOpen(false);
    onSelect(opt);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex w-full max-w-2xl items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-base font-normal text-foreground shadow-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "ring-2 ring-ring ring-offset-2"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Search cosmetic products"
      >
        <span className="flex items-center gap-3 truncate">
          <Search className="h-5 w-5 shrink-0 opacity-40" />
          <span className="truncate text-left">
            {selected
              ? <><span className="font-medium">{selected.exampleProduct}</span><span className="ml-2 text-sm text-muted-foreground">({selected.nanomaterial.name})</span></>
              : <span className="text-muted-foreground">Search a product name, e.g. "Neutrogena sunscreen"…</span>
            }
          </span>
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
      </PopoverTrigger>

      <PopoverContent className="w-[min(92vw,640px)] p-0" align="start" sideOffset={6}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type product name…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="py-5 text-center text-sm text-muted-foreground">Searching…</div>
            )}
            {!loading && options.length === 0 && (
              <CommandEmpty>No products found.</CommandEmpty>
            )}
            {!loading && options.length > 0 && (
              <CommandGroup heading="Cosmetic Products">
                {options.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={String(opt.id)}
                    onSelect={() => handleSelect(opt)}
                    className="cursor-pointer flex-col items-start gap-0.5"
                  >
                    <div className="flex w-full items-center gap-2">
                      <Check
                        className={cn("h-4 w-4 shrink-0", selected?.id === opt.id ? "opacity-100" : "opacity-0")}
                      />
                      <span className="font-medium">{opt.exampleProduct}</span>
                    </div>
                    <span className="ml-6 text-xs text-muted-foreground">{opt.nanomaterial.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
