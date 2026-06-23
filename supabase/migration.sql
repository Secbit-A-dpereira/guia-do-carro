-- Guiadocarro.pt — Schema Inicial
-- Run this in Supabase SQL Editor

-- 1. Marcas
CREATE TABLE marcas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modelos
CREATE TABLE modelos (
  id SERIAL PRIMARY KEY,
  marca_id INTEGER NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ano_min INTEGER NOT NULL,
  ano_max INTEGER,
  segmento TEXT,
  tipo_combustivel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Carros / versões (com campos desnormalizados para queries simples)
CREATE TABLE carros (
  id SERIAL PRIMARY KEY,
  modelo_id INTEGER NOT NULL REFERENCES modelos(id) ON DELETE CASCADE,
  marca_nome TEXT NOT NULL,
  modelo_nome TEXT NOT NULL,
  ano INTEGER NOT NULL,
  preco_medio NUMERIC(10,2) NOT NULL,
  motor TEXT,
  cv INTEGER,
  combustivel TEXT,
  fiabilidade_score INTEGER CHECK (fiabilidade_score >= 0 AND fiabilidade_score <= 100),
  imagem_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Reports de fiabilidade
CREATE TABLE reports_fiabilidade (
  id SERIAL PRIMARY KEY,
  carro_id INTEGER NOT NULL REFERENCES carros(id) ON DELETE CASCADE,
  ano_do_carro INTEGER NOT NULL,
  km INTEGER NOT NULL,
  avarias TEXT[] DEFAULT '{}',
  custo_reparacao NUMERIC(10,2),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_modelos_marca ON modelos(marca_id);
CREATE INDEX idx_carros_modelo ON carros(modelo_id);
CREATE INDEX idx_carros_preco ON carros(preco_medio);
CREATE INDEX idx_reports_carro ON reports_fiabilidade(carro_id);

-- RLS: Tabelas públicas — leitura para todos
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carros ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports_fiabilidade ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "Leitura pública - marcas" ON marcas FOR SELECT USING (true);
CREATE POLICY "Leitura pública - modelos" ON modelos FOR SELECT USING (true);
CREATE POLICY "Leitura pública - carros" ON carros FOR SELECT USING (true);
CREATE POLICY "Leitura pública - reports" ON reports_fiabilidade FOR SELECT USING (true);

-- Insert anónimo permitido apenas para reports
CREATE POLICY "Insert anónimo - reports" ON reports_fiabilidade FOR INSERT WITH CHECK (true);

-- Seed: 5 marcas, 5 modelos, 6 carros
INSERT INTO marcas (nome, slug) VALUES
  ('Renault', 'renault'),
  ('Peugeot', 'peugeot'),
  ('Volkswagen', 'volkswagen'),
  ('Toyota', 'toyota'),
  ('Mercedes-Benz', 'mercedes-benz');

INSERT INTO modelos (marca_id, nome, slug, ano_min, ano_max, segmento, tipo_combustivel) VALUES
  (1, 'Clio', 'clio', 2019, NULL, 'Citadino', 'Gasolina, Diesel, Elétrico'),
  (2, '308', '308', 2021, NULL, 'Compacto', 'Gasolina, Diesel, Híbrido'),
  (3, 'Golf', 'golf', 2020, NULL, 'Compacto', 'Gasolina, Diesel, Híbrido'),
  (4, 'Corolla', 'corolla', 2019, NULL, 'Compacto', 'Híbrido'),
  (5, 'Classe A', 'classe-a', 2018, NULL, 'Compacto', 'Gasolina, Diesel');

INSERT INTO carros (modelo_id, marca_nome, modelo_nome, ano, preco_medio, motor, cv, combustivel, fiabilidade_score) VALUES
  (1, 'Renault', 'Clio', 2022, 18500, '1.0 TCe', 90, 'Gasolina', 78),
  (1, 'Renault', 'Clio', 2021, 15500, '1.0 TCe', 90, 'Gasolina', 76),
  (2, 'Peugeot', '308', 2023, 28500, '1.2 PureTech', 130, 'Gasolina', 72),
  (3, 'Volkswagen', 'Golf', 2022, 32000, '1.5 TSI', 150, 'Gasolina', 82),
  (4, 'Toyota', 'Corolla', 2023, 29500, '1.8 Hybrid', 140, 'Híbrido', 88),
  (5, 'Mercedes-Benz', 'Classe A', 2021, 28000, 'A200', 163, 'Gasolina', 70);
