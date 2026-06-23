"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SemaforoFiabilidade } from "@/components/SemaforoFiabilidade";
import type { Carro, ReportFiabilidade } from "@/types";

function parseGallery(carro: Carro): string[] {
  if (!carro.imagem_url) return [];
  return [carro.imagem_url];
}

export default function CarroDetailClient() {
  const { id } = useParams();
  const [carro, setCarro] = useState<Carro | null>(null);
  const [reports, setReports] = useState<ReportFiabilidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      supabase.from("carros").select("*").eq("id", Number(id)).single(),
      supabase
        .from("reports_fiabilidade")
        .select("*")
        .eq("carro_id", Number(id))
        .order("created_at", { ascending: false }),
    ]).then(([carroRes, reportsRes]) => {
      if (!carroRes.error && carroRes.data) setCarro(carroRes.data);
      if (!reportsRes.error && reportsRes.data) setReports(reportsRes.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted">A carregar...</div>;
  }

  if (!carro) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Carro não encontrado</h1>
        <Link href="/" className="mt-4 inline-block text-muted hover:text-foreground">← Voltar ao início</Link>
      </div>
    );
  }

  const galeria = parseGallery(carro);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">← Voltar</Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">{carro.marca_nome}</h1>
        <p className="text-xl text-muted mt-1">{carro.modelo_nome}</p>
      </div>

      {galeria.length > 0 && (
        <div className="mt-6 rounded-xl overflow-hidden bg-zinc-100">
          <img
            src={galeria[0]}
            alt={`${carro.marca_nome} ${carro.modelo_nome}`}
            className="w-full h-64 sm:h-80 object-contain bg-zinc-100"
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-5">
          <p className="text-xs text-muted uppercase tracking-wider">Preço médio</p>
          <p className="mt-2 text-3xl font-bold">
            {carro.preco_medio.toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-xl border border-border p-5">
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Fiabilidade</p>
          <SemaforoFiabilidade score={carro.fiabilidade_score} detalhes={true} />
        </div>
        <div className="rounded-xl border border-border p-5 sm:col-span-2">
          <p className="text-xs text-muted uppercase tracking-wider mb-4">Especificações</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted">Ano</span><p className="font-medium">{carro.ano}</p></div>
            <div><span className="text-muted">Motor</span><p className="font-medium">{carro.motor ?? "—"}</p></div>
            <div><span className="text-muted">Potência</span><p className="font-medium">{carro.cv ? `${carro.cv} cv` : "—"}</p></div>
            <div><span className="text-muted">Combustível</span><p className="font-medium">{carro.combustivel ?? "—"}</p></div>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Reports de fiabilidade
            {reports.length > 0 && <span className="ml-2 text-sm font-normal text-muted">({reports.length})</span>}
          </h2>
          <Link href={`/reportar/${carro.id}`} className="text-sm font-medium text-foreground underline underline-offset-4 hover:no-underline">
            Reportar avarias
          </Link>
        </div>

        {reports.length === 0 && (
          <p className="mt-6 text-muted">
            Ainda não há reports de fiabilidade para este carro.{" "}
            <Link href={`/reportar/${carro.id}`} className="underline underline-offset-4">Sê o primeiro a reportar</Link>.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-4 text-sm text-muted">
                <span>{r.ano_do_carro}</span>
                <span>{r.km.toLocaleString("pt-PT")} km</span>
                {r.custo_reparacao && (
                  <span>{r.custo_reparacao.toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</span>
                )}
              </div>
              {r.avarias && r.avarias.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.avarias.map((a, i) => (
                    <span key={i} className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">{a}</span>
                  ))}
                </div>
              )}
              {r.comentario && <p className="mt-2 text-sm text-muted">{r.comentario}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
