export function SemaforoFiabilidade({
  score,
  reportsCount,
  detalhes,
}: {
  score: number | null;
  reportsCount?: number;
  detalhes?: boolean;
}) {
  if (score === null || score === undefined) {
    return (
      <div className="space-y-1">
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-muted">
          Sem dados de fiabilidade
        </span>
        <p className="text-xs text-muted">
          Este carro ainda não tem dados suficientes. 
          {detalhes && " Sê o primeiro a reportar!"}
        </p>
      </div>
    );
  }

  const cor =
    score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-400" : "bg-red-500";

  const label =
    score >= 80 ? "Boa" : score >= 50 ? "Aceitável" : "Atenção";

  const confidence =
    !reportsCount || reportsCount < 3
      ? "Poucos dados"
      : reportsCount < 10
        ? "Alguns dados"
        : "Dados suficientes";

  return (
    <div className="space-y-1">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium">
        <span className={`h-2.5 w-2.5 rounded-full ${cor}`} />
        {label} ({score}%)
      </div>
      {reportsCount !== undefined && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>{reportsCount} report{reportsCount !== 1 ? "s" : ""}</span>
          <span
            className={`rounded-full px-2 py-0.5 ${
              confidence === "Dados suficientes"
                ? "bg-green-50 text-green-700"
                : confidence === "Alguns dados"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-zinc-100 text-muted"
            }`}
          >
            {confidence}
          </span>
        </div>
      )}
      {detalhes && (
        <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-xs text-muted space-y-1.5">
          <p className="font-medium text-foreground">📊 Como é calculado</p>
          <p>
            O score de fiabilidade combina dados de várias fontes:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>TÜV Report (Alemanha):</strong> Taxa de falhas em
              inspeções técnicas obrigatórias com base em milhões de
              veículos avaliados por idade
            </li>
            <li>
              <strong>RepairPal:</strong> Frequência e custo médio de
              reparações por modelo
            </li>
            {reportsCount && reportsCount > 0 && (
              <li>
                <strong>Comunidade Guia do Carro:</strong>{" "}
                {reportsCount} report{reportsCount !== 1 ? "s" : ""} de
                condutores portugueses
              </li>
            )}
          </ul>
          <p className="mt-2 pt-2 border-t border-border">
            <strong>Interpretação:</strong>
          </p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>
              <span className="text-green-600 font-medium">Boa (80-100):</span>{" "}
              Poucas queixas, baixa probabilidade de avarias
            </li>
            <li>
              <span className="text-amber-500 font-medium">Aceitável (50-79):</span>{" "}
              Problemas moderados, dentro do esperado para a idade
            </li>
            <li>
              <span className="text-red-500 font-medium">Atenção (0-49):</span>{" "}
              Acima da média de avarias, requer atenção redobrada
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
