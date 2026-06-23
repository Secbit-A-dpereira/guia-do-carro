import type { Carro } from "@/types";
import { SemaforoFiabilidade } from "./SemaforoFiabilidade";
import Link from "next/link";

export function CarroCard({
  carro,
  reportsCount,
  posicao,
}: {
  carro: Carro;
  reportsCount?: number;
  posicao?: number;
}) {
  return (
    <Link
      href={`/carro/${carro.id}`}
      className="block rounded-xl border border-border overflow-hidden hover:border-foreground/30 transition-colors group"
    >
      {carro.imagem_url && (
        <div className="aspect-[4/3] bg-zinc-50 overflow-hidden flex items-center justify-center p-4">
          <img
            src={carro.imagem_url}
            alt={`${carro.marca_nome} ${carro.modelo_nome}`}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">
            {carro.marca_nome} {carro.modelo_nome}
          </h3>
          {posicao && (
            <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
              {posicao}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted">
          {carro.ano} ·{" "}
          {carro.preco_medio.toLocaleString("pt-PT", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          })}
        </p>
        <div className="mt-3">
          <SemaforoFiabilidade score={carro.fiabilidade_score} reportsCount={reportsCount} />
        </div>
      </div>
    </Link>
  );
}
