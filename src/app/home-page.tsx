"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BudgetInput } from "@/components/BudgetInput";
import { CarroCard } from "@/components/CarroCard";
import { supabase } from "@/lib/supabase";
import type { Carro } from "@/types";
import Link from "next/link";

interface CarroComReports extends Carro {
  reports_count?: number;
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const budget = searchParams.get("budget");

  const [carros, setCarros] = useState<CarroComReports[]>([]);
  const [topFiabilidade, setTopFiabilidade] = useState<CarroComReports[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!budget) return;
    const num = Number(budget);
    if (num <= 0) return;

    supabase
      .from("carros")
      .select("*")
      .lte("preco_medio", num)
      .order("fiabilidade_score", { ascending: false, nullsFirst: false })
      .then(({ data, error }) => {
        if (!error && data) setCarros(data as CarroComReports[]);
        setHasSearched(true);
      });
  }, [budget]);

  // Top 6 carros mais fiáveis (com score)
  useEffect(() => {
    supabase
      .from("carros")
      .select("*")
      .not("fiabilidade_score", "is", null)
      .order("fiabilidade_score", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setTopFiabilidade(data as CarroComReports[]);
      });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero - foco em fiabilidade */}
      <section className="text-center">
        <span className="inline-block rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700 mb-4">
          🔧 Baseado na opinião de condutores portugueses
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Escolhe o carro mais fiável para ti
        </h1>
        <p className="mt-4 text-lg text-muted max-w-xl mx-auto">
          Descobre carros novos e usados com dados reais de fiabilidade
          reportados por condutores como tu.
        </p>
      </section>

      {/* CTA Reportar */}
      <section className="mt-8 text-center">
        <Link
          href="/reportar/1"
          className="inline-flex h-14 items-center gap-2 rounded-xl bg-foreground px-8 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
        >
          🚗 Reportar fiabilidade do meu carro
        </Link>
        <p className="mt-2 text-xs text-muted">
          A tua experiência ajuda outros condutores a escolher melhor
        </p>
      </section>

      {/* Budget Input */}
      <section className="mt-10 flex justify-center">
        <BudgetInput />
      </section>

      {/* Resultados por budget */}
      {budget && hasSearched && carros.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            Carros até {Number(budget).toLocaleString("pt-PT")}€
            <span className="ml-2 text-sm font-normal text-muted">
              ordenados por fiabilidade
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {carros.map((carro) => (
              <CarroCard key={carro.id} carro={carro} reportsCount={carro.reports_count} />
            ))}
          </div>
        </section>
      )}

      {budget && hasSearched && carros.length === 0 && (
        <section className="mt-12 text-center text-muted">
          <p className="text-lg">
            Nenhum carro encontrado até {Number(budget).toLocaleString("pt-PT")}€.
          </p>
          <p className="mt-2">
            Tenta um valor mais alto ou volta mais tarde — estamos sempre a
            adicionar modelos.
          </p>
        </section>
      )}

      {/* Top fiabilidade */}
      {!budget && topFiabilidade.length > 0 && (
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">🏆 Os mais fiáveis</h2>
              <p className="text-sm text-muted mt-1">
                Top carros com melhor score de fiabilidade
              </p>
            </div>
            <Link
              href="/catalogo"
              className="text-sm font-medium text-foreground underline underline-offset-4 hover:no-underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topFiabilidade.map((carro, i) => (
              <CarroCard key={carro.id} carro={carro} posicao={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Sempre visível: CTA para reportar */}
      <section className="mt-20 text-center border-t border-border pt-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold">Já tens um carro?</h2>
          <p className="mt-2 text-muted">
            Ajuda a comunidade! Reporta a fiabilidade do teu carro e
            ajuda outros condutores a escolher melhor.
          </p>
          <Link
            href="/reportar/1"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-8 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            📝 Reportar fiabilidade
          </Link>
        </div>
      </section>
    </div>
  );
}
