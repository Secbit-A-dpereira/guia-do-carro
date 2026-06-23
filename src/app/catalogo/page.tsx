"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Marca } from "@/types";

export default function CatalogoPage() {
  const [marcas, setMarcas] = useState<Marca[]>([]);

  useEffect(() => {
    supabase
      .from("marcas")
      .select("*")
      .order("nome", { ascending: true })
      .then(({ data }) => {
        if (data) setMarcas(data);
      });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Marcas</h1>
      <p className="mt-2 text-muted">Escolhe uma marca para ver os modelos disponíveis.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {marcas.map((marca) => (
          <Link
            key={marca.id}
            href={`/catalogo/${marca.slug}`}
            className="rounded-xl border border-border p-6 hover:border-foreground/30 transition-colors"
          >
            <h2 className="text-xl font-semibold">{marca.nome}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
