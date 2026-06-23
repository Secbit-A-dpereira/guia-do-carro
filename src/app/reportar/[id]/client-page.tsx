"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { Carro } from "@/types";

const AVARIAS_COMUNS = [
  "Motor",
  "Caixa de velocidades",
  "Suspensão",
  "Travões",
  "Sistema elétrico",
  "Bateria",
  "Ar condicionado",
  "Sistema de escape",
  "Distribuição / Correia",
];

export default function ReportarClient() {
  const { id } = useParams();
  const [carro, setCarro] = useState<Carro | null>(null);

  const [ano, setAno] = useState("");
  const [km, setKm] = useState("");
  const [avarias, setAvarias] = useState<string[]>([]);
  const [custo, setCusto] = useState("");
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("carros")
      .select("*")
      .eq("id", Number(id))
      .single()
      .then(({ data }) => {
        if (data) setCarro(data);
      });
  }, [id]);

  function toggleAvaria(a: string) {
    setAvarias((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);

    const { error } = await supabase.from("reports_fiabilidade").insert({
      carro_id: Number(id),
      ano_do_carro: Number(ano),
      km: Number(km),
      avarias,
      custo_reparacao: custo ? Number(custo) : null,
      comentario: comentario || null,
    });

    setSubmitting(false);

    if (!error) {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Obrigado! 🚗</h1>
        <p className="mt-4 text-muted">
          O teu report de fiabilidade foi registado. Ajudaste outros condutores a escolher melhor.
        </p>
        <Link
          href={`/carro/${id}`}
          className="mt-8 inline-block h-12 rounded-xl bg-foreground px-8 leading-[48px] text-sm font-semibold text-background hover:opacity-90 transition-opacity"
        >
          Ver carro
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link
        href={carro ? `/carro/${carro.id}` : "/"}
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Voltar
      </Link>

      <h1 className="mt-6 text-2xl font-bold">Reportar fiabilidade</h1>

      {carro && (
        <p className="mt-2 text-muted">
          {carro.marca_nome} {carro.modelo_nome} ({carro.ano})
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ano do carro</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              placeholder="2022"
              required
              className="w-full h-12 rounded-xl border border-border px-4 text-base outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quilómetros</label>
            <input
              type="number"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="50000"
              required
              className="w-full h-12 rounded-xl border border-border px-4 text-base outline-none focus:border-foreground transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Que tipo de avarias tiveste?
          </label>
          <div className="flex flex-wrap gap-2">
            {AVARIAS_COMUNS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAvaria(a)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  avarias.includes(a)
                    ? "bg-red-500 text-white"
                    : "bg-zinc-100 text-muted hover:bg-zinc-200"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Custo total das reparações (opcional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">€</span>
            <input
              type="number"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              placeholder="500"
              className="w-full h-12 rounded-xl border border-border pl-10 pr-4 text-base outline-none focus:border-foreground transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Comentário (opcional)</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Partilha a tua experiência com este carro..."
            rows={4}
            className="w-full rounded-xl border border-border px-4 py-3 text-base outline-none focus:border-foreground transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-14 rounded-xl bg-foreground text-sm font-semibold text-background hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "A enviar..." : "Submeter report"}
        </button>
      </form>
    </div>
  );
}
