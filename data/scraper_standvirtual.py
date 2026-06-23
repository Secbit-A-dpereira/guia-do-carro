#!/usr/bin/env python3
"""
Scraper StandVirtual — extrai preços reais do mercado português.

Uso:  python3 scraper_standvirtual.py <marca> <modelo>
Ex:   python3 scraper_standvirtual.py renault clio

Output: JSON com preço médio, specs, e distribuição por versão.
"""

import sys
import json
import re
import requests
from collections import defaultdict

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
}


def fetch_listings(marca: str, modelo: str, max_pages: int = 3) -> list[dict]:
    """Busca anúncios da StandVirtual e extrai do JSON-LD."""
    listings = []

    for page in range(1, max_pages + 1):
        url = f"https://www.standvirtual.com/carros/{marca}/{modelo}?page={page}"
        resp = requests.get(url, headers=HEADERS, timeout=15)

        if resp.status_code != 200:
            break

        # Extrair JSON-LD do HTML
        # Procura o primeiro <script type="application/ld+json"> com os dados de listing
        pattern = r'<script[^>]*id="listing-json-ld"[^>]*type="application/ld+json"[^>]*>(.*?)</script>'
        match = re.search(pattern, resp.text, re.DOTALL)

        if not match:
            # Tentar pattern alternativo (sem id)
            scripts = re.findall(
                r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
                resp.text,
                re.DOTALL,
            )
            for s in scripts:
                try:
                    data = json.loads(s)
                    if isinstance(data, dict) and data.get("@type") == "Webpage":
                        main_entity = data.get("mainEntity", {})
                        items = main_entity.get("itemListElement", [])
                        if items:
                            match = s
                            break
                except json.JSONDecodeError:
                    continue

        if not match:
            break

        try:
            data = json.loads(str(match))
        except json.JSONDecodeError:
            break

        main_entity = data.get("mainEntity", {})
        items = main_entity.get("itemListElement", [])

        if not items:
            break

        for item in items:
            offer = item.get("itemOffered", {})
            price_spec = item.get("priceSpecification", {})

            listing = {
                "nome": offer.get("name", ""),
                "marca": offer.get("brand", marca),
                "preco": float(price_spec.get("price", 0)),
                "ano": int(offer.get("modelDate", 0)),
                "km": int(offer.get("mileageFromOdometer", {}).get("value", 0)),
                "combustivel": offer.get("fuelType", ""),
                "imagem": None,
            }
            listings.append(listing)

        # Extrair imagens do HTML (apollo CDN)
        apollo_images = re.findall(
            r'https://ireland\.apollo\.olxcdn\.com/v1/files/[^"\']+?image;s=644x461',
            resp.text,
        )
        # Associar imagens a listings pela ordem
        for i, listing in enumerate(listings):
            if i < len(apollo_images):
                listing["imagem"] = apollo_images[i]

        # Verificar se há próxima página (por número de resultados)
        if len(items) < 30:  # tipicamente 30 por página
            break

    return listings


def compute_averages(listings: list[dict]) -> dict:
    """Calcula preço médio e distribuição."""
    if not listings:
        return {"error": "Nenhum anúncio encontrado"}

    precos = [l["preco"] for l in listings if l["preco"] > 0]
    anos = [l["ano"] for l in listings if l["ano"] > 0]
    kms = [l["km"] for l in listings if l["km"] > 0]

    # Agrupar por versão (nome curto)
    versoes = defaultdict(list)
    for l in listings:
        versao = l["nome"]
        versoes[versao].append(l["preco"])

    # Agrupar por ano
    por_ano = defaultdict(list)
    for l in listings:
        por_ano[l["ano"]].append(l["preco"])

    # Combustíveis mais comuns
    combustiveis = defaultdict(int)
    for l in listings:
        if l["combustivel"]:
            combustiveis[l["combustivel"]] += 1

    return {
        "marca": listings[0]["marca"],
        "modelo": listings[0]["nome"].split()[1] if len(listings[0]["nome"].split()) > 1 else "",
        "total_anuncios": len(listings),
        "preco_medio": round(sum(precos) / len(precos)) if precos else 0,
        "preco_min": round(min(precos)) if precos else 0,
        "preco_max": round(max(precos)) if precos else 0,
        "ano_medio": round(sum(anos) / len(anos)) if anos else 0,
        "ano_min": min(anos) if anos else 0,
        "ano_max": max(anos) if anos else 0,
        "km_medio": round(sum(kms) / len(kms)) if kms else 0,
        "combustiveis": dict(combustiveis),
        "preco_por_ano": {str(k): round(sum(v) / len(v)) for k, v in sorted(por_ano.items())},
        "versoes": [
            {"nome": v, "preco_medio": round(sum(p) / len(p)), "total": len(p)}
            for v, p in sorted(versoes.items(), key=lambda x: len(x[1]), reverse=True)
        ],
    }


def main():
    if len(sys.argv) < 3:
        print("Uso: python3 scraper_standvirtual.py <marca> <modelo>")
        print("Ex:  python3 scraper_standvirtual.py renault clio")
        sys.exit(1)

    marca = sys.argv[1].lower()
    modelo = sys.argv[2].lower()

    print(f"🔍 A pesquisar {marca} {modelo} na StandVirtual...", file=sys.stderr)
    listings = fetch_listings(marca, modelo)

    if not listings:
        print(json.dumps({"error": f"Nenhum anúncio encontrado para {marca} {modelo}"}, indent=2))
        sys.exit(0)

    result = compute_averages(listings)
    print(json.dumps(result, indent=2, ensure_ascii=False))

    print(f"\n📊 {result['total_anuncios']} anúncios encontrados", file=sys.stderr)
    print(f"💰 Preço médio: {result['preco_medio']}€", file=sys.stderr)
    print(f"📅 Ano médio: {result['ano_medio']}", file=sys.stderr)


if __name__ == "__main__":
    main()
