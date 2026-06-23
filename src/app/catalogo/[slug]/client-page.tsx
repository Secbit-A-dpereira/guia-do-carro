"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CarroCard } from "@/components/CarroCard";
import type { Carro, Marca, Modelo } from "@/types";

export default function ModelosPorMarcaClient() {
  const { slug } = useParams();
  const [marca, setMarca] = useState<Marca | null>(null);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [carros, setCarros] = useState<Carro[]>([]);
  const [filtroCombustivel, setFiltroCombustivel] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    supabase
      .from("marcas")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data: marcaData }) => {
        if (!marcaData) {
          setLoading(false);
          return;
        }

        setMarca(marcaData);

        supabase
          .from("modelos")
          .select("*")
          .eq("marca_id", marcaData.id)
          .order("nome", { ascending: true })
          .then(({ data: modelosData }) => {
            if (!modelosData || modelosData.length === 0) {
              setLoading(false);
              return;
            }

            setModelos(modelosData);

            const modeloIds = modelosData.map((m) => m.id);

            let query = supabase
              .from("carros")
              .select("*")
              .in("modelo_id", modeloIds)
              .order("preco_medio", { ascending: true });

            if (filtroCombustivel) {
              query = query.eq("combustivel", filtroCombustivel);
            }

            query.then(({ data: carrosData }) => {
              if (carrosData) {
                setCarros(carrosData);
              }
              setLoading(false);
            });
          });
      });
  }, [slug, filtroCombustivel]);

  const combustiveis = [...new Set(carros.map((c) => c.combustivel).filter(Boolean))];

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted">
        A carregar...
      </div>
    );
  }

  if (!marca) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Marca não encontrada</h1>
        <Link href="/catalogo" className="mt-4 inline-block text-muted hover:text-foreground">
          ← Ver todas as marcas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link
        href="/catalogo"
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Todas as marcas
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{marca.nome}</h1>
      <p className="mt-1 text-muted">{modelos.length} modelos disponíveis</p>

      {combustiveis.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroCombustivel("")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !filtroCombustivel
                ? "bg-foreground text-background"
                : "bg-zinc-100 text-muted hover:bg-zinc-200"
            }`}
          >
            Todos
          </button>
          {combustiveis.map((c) => (
            <button
              key={c}
              onClick={() => setFiltroCombustivel(c!)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filtroCombustivel === c
                  ? "bg-foreground text-background"
                  : "bg-zinc-100 text-muted hover:bg-zinc-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {carros.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {carros.map((carro) => (
            <CarroCard key={carro.id} carro={carro} />
          ))}
        </div>
      )}

      {carros.length === 0 && !loading && (
        <p className="mt-8 text-muted">
          Nenhum carro encontrado para esta marca.
        </p>
      )}
    </div>
  );
}
