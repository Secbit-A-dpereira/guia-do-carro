"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";

export function BudgetInput() {
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("budget") ?? "");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const num = Number(value);
    if (num > 0) {
      router.push(`/?budget=${num}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center gap-3 flex-wrap justify-center">
      <div className="relative flex-1 min-w-[200px]">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">
          €
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Quanto queres gastar?"
          min={0}
          className="w-full h-14 rounded-xl border border-border bg-white pl-10 pr-4 text-lg font-medium outline-none focus:border-foreground transition-colors"
        />
      </div>
      <button
        type="submit"
        className="h-14 rounded-xl bg-foreground px-8 text-sm font-semibold text-background hover:opacity-90 transition-colors"
      >
        Pesquisar
      </button>
    </form>
  );
}
