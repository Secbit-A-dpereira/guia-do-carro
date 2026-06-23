export interface Marca {
  id: number;
  nome: string;
  slug: string;
  logo_url: string | null;
}

export interface Modelo {
  id: number;
  marca_id: number;
  nome: string;
  slug: string;
  ano_min: number;
  ano_max: number | null;
  segmento: string | null;
  tipo_combustivel: string | null;
}

export interface Carro {
  id: number;
  modelo_id: number;
  marca_nome: string;
  modelo_nome: string;
  ano: number;
  preco_medio: number;
  motor: string | null;
  cv: number | null;
  combustivel: string | null;
  fiabilidade_score: number | null;
  imagem_url: string | null;
}

export interface ReportFiabilidade {
  id: number;
  carro_id: number;
  ano_do_carro: number;
  km: number;
  avarias: string[];
  custo_reparacao: number | null;
  comentario: string | null;
  created_at: string;
}
