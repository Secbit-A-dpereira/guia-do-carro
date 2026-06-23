"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SemaforoFiabilidade } from "@/components/SemaforoFiabilidade";
import type { Carro } from "@/types";

export default function CompararClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ids = searchParams.get("ids");

  // Derive selecionados from URL during render (not in effect)
  const selecionadosIniciais = useMemo(() => {
    if (!ids) return [] as number[];
    return ids.split(",").map(Number);
  }, [ids]);

  const [carros, setCarros] = useState<Carro[]>([]);
  const [todosCarros, setTodosCarros] = useState<Carro[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>(selecionadosIniciais);

  const step: "select" | "compare" = ids ? "compare" : "select";

  useEffect(() => {
    supabase
      .from("carros")
      .select("*")
      .order("fiabilidade_score", { ascending: false, nullsFirst: false })
      .then(({ data }) => {
        if (data) setTodosCarros(data);
      });
  }, []);

  useEffect(() => {
    if (ids) {
      supabase
        .from("carros")
        .select("*")
        .in("id", selecionadosIniciais)
        .then(({ data }) => {
          if (data) setCarros(data);
        });
    }
  }, [ids, selecionadosIniciais]);

  function toggleSelecao(id: number) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function comparar() {
    const idsParam = selecionados.join(",");
    router.push(`/comparar?ids=${idsParam}`);
  }

  // ... rest stays the same
  if (step === "compare") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <button
          onClick={() => router.push("/comparar")}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← Nova comparação
        </button>

        <h1 className="mt-4 text-3xl font-bold">Comparar carros</h1>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-6 text-left text-sm font-medium text-muted">Especificação</th>
                {carros.map((c) => (
                  <th key={c.id} className="py-3 px-4 text-left">
                    <Link href={`/carro/${c.id}`} className="text-lg font-semibold hover:underline">
                      {c.marca_nome} {c.modelo_nome}
                    </Link>
                    <p className="text-sm text-muted mt-0.5">{c.ano}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-4 pr-6 text-sm text-muted">Preço</td>
                {carros.map((c) => (
                  <td key={c.id} className="py-4 px-4 text-lg font-bold">
                    {c.preco_medio.toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 pr-6 text-sm text-muted">Motor</td>
                {carros.map((c) => <td key={c.id} className="py-4 px-4">{c.motor ?? "—"}</td>)}
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 pr-6 text-sm text-muted">Potência</td>
                {carros.map((c) => <td key={c.id} className="py-4 px-4">{c.cv ? `${c.cv} cv` : "—"}</td>)}
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 pr-6 text-sm text-muted">Combustível</td>
                {carros.map((c) => <td key={c.id} className="py-4 px-4">{c.combustivel ?? "—"}</td>)}
              </tr>
              <tr>
                <td className="py-4 pr-6 text-sm text-muted">Fiabilidade</td>
                {carros.map((c) => (
                  <td key={c.id} className="py-4 px-4">
                    <SemaforoFiabilidade score={c.fiabilidade_score} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Link href={`/comparar?ids=${carros.map((c) => c.id).join(",")}`} className="text-sm text-muted hover:text-foreground">
            Link para esta comparação
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Comparar carros</h1>
      <p className="mt-2 text-muted">
        Seleciona 2 ou 3 carros para comparar lado a lado.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {todosCarros.map((carro) => (
          <label
            key={carro.id}
            className={`block rounded-xl border p-5 cursor-pointer transition-colors ${
              selecionados.includes(carro.id)
                ? "border-foreground bg-zinc-50"
                : "border-border hover:border-foreground/30"
            }`}
          >
            <input
              type="checkbox"
              checked={selecionados.includes(carro.id)}
              onChange={() => toggleSelecao(carro.id)}
              className="sr-only"
            />
            <h3 className="font-semibold">{carro.marca_nome} {carro.modelo_nome}</h3>
            <p className="mt-1 text-sm text-muted">
              {carro.ano} · {carro.preco_medio.toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
            <div className="mt-3">
              <SemaforoFiabilidade score={carro.fiabilidade_score} />
            </div>
          </label>
        ))}
      </div>

      {selecionados.length < 2 && (
        <p className="mt-6 text-center text-sm text-muted">
          Seleciona pelo menos 2 carros para comparar.
        </p>
      )}

      {selecionados.length >= 2 && (
        <div className="mt-6 text-center">
          <button
            onClick={comparar}
            className="h-12 rounded-xl bg-foreground px-8 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
          >
            Comparar {selecionados.length} carros
          </button>
        </div>
      )}
    </div>
  );
}
