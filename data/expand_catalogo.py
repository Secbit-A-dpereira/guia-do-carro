#!/usr/bin/env python3
"""Full pipeline: scrape all models + insert into Supabase."""
import json, urllib.request, urllib.parse, re, time, sys

import os
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://suzsasiozkcoyshvktuo.supabase.co")
KEY = os.environ.get("SUPABASE_KEY", "")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

# All models with reliability scores (TÜV/RepairPal based)
ALL_MODELS = [
    # Existing + new
    ("renault", "clio", 76), ("renault", "captur", 74), ("renault", "megane", 72), ("renault", "zoe", 76),
    ("renault", "kadjar", 72), ("renault", "scenic", 70),
    ("peugeot", "208", 74), ("peugeot", "308", 72), ("peugeot", "3008", 70), ("peugeot", "2008", 74),
    ("peugeot", "508", 70), ("peugeot", "rifter", 68),
    ("volkswagen", "golf", 82), ("volkswagen", "t-roc", 84), ("volkswagen", "tiguan", 78),
    ("volkswagen", "polo", 80), ("volkswagen", "id4", 78), ("volkswagen", "t-cross", 82),
    ("toyota", "corolla", 88), ("toyota", "yaris", 86), ("toyota", "rav4", 85), ("toyota", "c-hr", 84),
    ("toyota", "aygo", 82),
    ("mercedes-benz", "classe-a", 70), ("mercedes-benz", "classe-c", 72), ("mercedes-benz", "gla", 72),
    ("mercedes-benz", "classe-e", 74), ("mercedes-benz", "glc", 72),
    ("seat", "leon", 76), ("seat", "ibiza", 74), ("seat", "arona", 78),
    ("bmw", "serie-1", 72), ("bmw", "serie-3", 74), ("bmw", "x1", 70),
    ("bmw", "serie-5", 74), ("bmw", "x3", 72),
    ("opel", "corsa", 72), ("opel", "astra", 70), ("opel", "mokka", 74),
    ("opel", "crossland", 72), ("opel", "grandland", 70),
    ("dacia", "sandero", 66), ("dacia", "duster", 64), ("dacia", "spring", 68), ("dacia", "jogger", 66),
    ("nissan", "qashqai", 74), ("nissan", "juke", 70), ("nissan", "leaf", 76), ("nissan", "x-trail", 72),
    ("honda", "civic", 86), ("honda", "hr-v", 88),
    ("ford", "focus", 74), ("ford", "kuga", 70), ("ford", "fiesta", 72), ("ford", "puma", 74),
    ("ford", "transit", 68),
    ("kia", "ceed", 76), ("kia", "sportage", 74), ("kia", "picanto", 80), ("kia", "niro", 76),
    ("kia", "stonic", 78),
    ("hyundai", "i30", 76), ("hyundai", "tucson", 74), ("hyundai", "kona", 76), ("hyundai", "bayon", 76),
    ("fiat", "500", 68), ("fiat", "panda", 72), ("fiat", "tipo", 70),
    # Novas marcas
    ("audi", "a3", 78), ("audi", "a4", 78), ("audi", "q3", 76), ("audi", "q5", 76),
    ("citroen", "c3", 72), ("citroen", "c4", 70), ("citroen", "c5-aircross", 70),
    ("mazda", "3", 82), ("mazda", "cx-30", 82), ("mazda", "cx-5", 80),
    ("mini", "cooper", 82), ("mini", "countryman", 78),
    ("suzuki", "swift", 84), ("suzuki", "vitara", 82),
    ("volvo", "xc40", 76), ("volvo", "xc60", 74),
]

def scrape_and_extract(marca, modelo):
    """Scrape StandVirtual + extract listings."""
    url = f"https://www.standvirtual.com/carros/{marca}/{modelo}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode()
    except:
        return [], []
    
    # Extract JSON-LD
    listings = []
    match = re.search(r'<script[^>]*id="listing-json-ld"[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(1))
            items = data.get("mainEntity", {}).get("itemListElement", [])
            for item in items:
                offer = item.get("itemOffered", {})
                price_spec = item.get("priceSpecification", {})
                listings.append({
                    "nome": offer.get("name", ""),
                    "marca": offer.get("brand", marca),
                    "preco": float(price_spec.get("price", 0)),
                    "ano": int(offer.get("modelDate", 0)),
                    "km": int(offer.get("mileageFromOdometer", {}).get("value", 0)),
                    "combustivel": offer.get("fuelType", ""),
                })
        except:
            pass
    
    # Extract images
    images = re.findall(r'https://ireland\.apollo\.olxcdn\.com/v1/files/[^"\']+?image;s=644x461', html)
    images = list(dict.fromkeys(images))[:5]
    
    return listings, images

def get_wiki_image(title):
    """Get Wikipedia image for a model."""
    params = urllib.parse.urlencode({"action": "query", "titles": title, "prop": "pageimages", "format": "json", "pithumbsize": 600})
    url = f"https://en.wikipedia.org/w/api.php?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        for pid, page in data.get("query", {}).get("pages", {}).items():
            if pid != "-1" and "thumbnail" in page:
                return page["thumbnail"]["source"]
    except:
        pass
    return None

# Wikipedia titles for new models
WIKI_TITLES = {
    "renault-zoe": "Renault Zoe", "renault-kadjar": "Renault Kadjar", "renault-scenic": "Renault Scénic",
    "peugeot-2008": "Peugeot 2008", "peugeot-508": "Peugeot 508", "peugeot-rifter": "Peugeot Rifter",
    "volkswagen-polo": "Volkswagen Polo", "volkswagen-id4": "Volkswagen ID.4", "volkswagen-t-cross": "Volkswagen T-Cross",
    "toyota-c-hr": "Toyota C-HR", "toyota-aygo": "Toyota Aygo",
    "mercedes-benz-classe-e": "Mercedes-Benz E-Class", "mercedes-benz-glc": "Mercedes-Benz GLC",
    "bmw-serie-5": "BMW 5 Series", "bmw-x3": "BMW X3",
    "opel-crossland": "Opel Crossland", "opel-grandland": "Opel Grandland",
    "dacia-spring": "Dacia Spring", "dacia-jogger": "Dacia Jogger",
    "nissan-leaf": "Nissan Leaf", "nissan-x-trail": "Nissan X-Trail",
    "ford-puma": "Ford Puma", "ford-transit": "Ford Transit",
    "kia-niro": "Kia Niro", "kia-stonic": "Kia Stonic",
    "hyundai-kona": "Hyundai Kona", "hyundai-bayon": "Hyundai Bayon",
    "fiat-tipo": "Fiat Tipo",
    # New brands
    "audi-a3": "Audi A3", "audi-a4": "Audi A4", "audi-q3": "Audi Q3", "audi-q5": "Audi Q5",
    "citroen-c3": "Citroën C3", "citroen-c4": "Citroën C4", "citroen-c5-aircross": "Citroën C5 Aircross",
    "mazda-3": "Mazda3", "mazda-cx-30": "Mazda CX-30", "mazda-cx-5": "Mazda CX-5",
    "mini-cooper": "Mini Hatch", "mini-countryman": "Mini Countryman",
    "suzuki-swift": "Suzuki Swift", "suzuki-vitara": "Suzuki Vitara",
    "volvo-xc40": "Volvo XC40", "volvo-xc60": "Volvo XC60",
}

# Brand proper names
BRAND_NAMES = {
    "renault": "Renault", "peugeot": "Peugeot", "volkswagen": "Volkswagen",
    "toyota": "Toyota", "mercedes-benz": "Mercedes-Benz", "seat": "Seat",
    "bmw": "BMW", "opel": "Opel", "dacia": "Dacia", "nissan": "Nissan",
    "honda": "Honda", "ford": "Ford", "kia": "Kia", "hyundai": "Hyundai",
    "fiat": "Fiat", "audi": "Audi", "citroen": "Citroën", "mazda": "Mazda",
    "mini": "Mini", "suzuki": "Suzuki", "volvo": "Volvo",
}

def main():
    # Get existing modelos to avoid recreating
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/modelos?select=slug", headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req) as resp:
        existing = [m["slug"] for m in json.loads(resp.read())]
    
    print(f"📋 Modelos existentes: {len(existing)}")
    
    # Group by brand for marca insertion
    marcas_set = {}
    for marca, modelo, score in ALL_MODELS:
        slug = f"{marca}-{modelo}"
        if slug in existing:
            continue
        if marca not in marcas_set:
            marcas_set[marca] = BRAND_NAMES.get(marca, marca.capitalize())
    
    # Insert new marcas
    for marca_slug, nome in marcas_set.items():
        data = json.dumps({"nome": nome, "slug": marca_slug}).encode()
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/marcas",
            data=data,
            headers={"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json", "Prefer": "return=minimal"}
        )
        try:
            urllib.request.urlopen(req)
            print(f"  🏭 Marcas inseridas")
        except:
            pass
    
    # Get all marcas and modelos for reference
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/marcas?select=id,slug", headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req) as resp:
        marcas_db = {m["slug"]: m["id"] for m in json.loads(resp.read())}
    
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/modelos?select=id,slug", headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req) as resp:
        modelos_db = {m["slug"]: m["id"] for m in json.loads(resp.read())}
    
    # Get next ID values
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/modelos?select=id&order=id.desc&limit=1", headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req) as resp:
        last_id_data = json.loads(resp.read())
        last_mid = last_id_data[0]["id"] if last_id_data else 40
    
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/carros?select=id&order=id.desc&limit=1", headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req) as resp:
        last_id_data = json.loads(resp.read())
        last_cid = last_id_data[0]["id"] if last_id_data else 82
    
    next_mid = last_mid + 1
    next_cid = last_cid + 1
    new_modelos = 0
    new_carros = 0
    
    for marca, modelo, fiabilidade in ALL_MODELS:
        slug = f"{marca}-{modelo}"
        if slug in modelos_db:
            continue
        
        print(f"\n  {marca} {modelo}...", end=" ", flush=True)
        
        listings, images = scrape_and_extract(marca, modelo)
        if not listings:
            print("❌ sem anúncios")
            continue
        
        # Filter: only >= 2018, only this brand
        marca_nome = BRAND_NAMES.get(marca, marca.capitalize())
        filtered = [l for l in listings if l["ano"] >= 2018 and l["marca"].lower() == marca]
        
        if not filtered:
            # Try without brand filter
            filtered = [l for l in listings if l["ano"] >= 2018]
        
        if not filtered:
            print("⚠️ só carros antigos")
            continue
        
        # Get unique model bases
        from collections import defaultdict
        versions = defaultdict(list)
        for l in filtered:
            name = l["nome"]
            # Extract base model name (after brand)
            parts = name.split()
            if len(parts) >= 2:
                version = " ".join(parts[1:])  # everything after brand
            else:
                version = name
            versions[version].append(l)
        
        # Get image
        if not images:
            wiki_slug = WIKI_TITLES.get(slug)
            wiki_img = get_wiki_image(wiki_slug) if wiki_slug else None
        else:
            wiki_img = None
        
        gallery = images if images else ([wiki_img] if wiki_img else [])
        gallery_json = json.dumps(gallery) if gallery else "[]"
        
        reg_image = gallery[0] if gallery else None
        
        # Insert modelo
        marca_id = marcas_db.get(marca, 1)
        anos = [l["ano"] for l in filtered if l["ano"]]
        combustiveis = list(set(l["combustivel"] for l in filtered if l["combustivel"]))
        
        modelo_data = {
            "id": next_mid, "marca_id": marca_id, "nome": modelo.capitalize(),
            "slug": slug, "ano_min": min(anos) if anos else 2020,
            "ano_max": max(anos) if anos else 2025,
            "tipo_combustivel": ", ".join(sorted(combustiveis)) if combustiveis else "Gasolina"
        }
        data = json.dumps(modelo_data).encode()
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/modelos", data=data,
            headers={"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json", "Prefer": "return=minimal"})
        urllib.request.urlopen(req)
        
        # Insert carros (max 4 versions)
        carros_inseridos = 0
        for version_name, version_listings in list(versions.items())[:4]:
            precos = [l["preco"] for l in version_listings if l["preco"] > 0]
            if not precos:
                continue
            
            preco_medio = round(sum(precos) / len(precos))
            ano_medio = round(sum(l["ano"] for l in version_listings) / len(version_listings))
            km_medio = round(sum(l["km"] for l in version_listings) / len(version_listings))
            
            # Extract motor from name
            motor = ""
            for p in version_name.split():
                if re.match(r'^\d+[\.\s]\d', p) or re.match(r'^1\.\d', p):
                    motor = p
                    break
            if not motor and "Elétrico" in version_name:
                motor = "Elétrico"
            
            # Adjust score for high km
            score = fiabilidade
            if km_medio > 100000:
                score = max(score - 5, 0)
            
            carro_data = {
                "id": next_cid, "modelo_id": next_mid,
                "marca_nome": marca_nome,
                "modelo_nome": version_name[:100],
                "ano": ano_medio, "preco_medio": preco_medio,
                "motor": motor, "combustivel": version_listings[0]["combustivel"] or "Gasolina",
                "fiabilidade_score": score, "imagem_url": reg_image or ""
            }
            data = json.dumps(carro_data).encode()
            req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/carros", data=data,
                headers={"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json", "Prefer": "return=minimal"})
            try:
                urllib.request.urlopen(req)
                carros_inseridos += 1
                next_cid += 1
            except:
                pass
        
        if carros_inseridos > 0:
            print(f"✅ {len(versions)} versões • {carros_inseridos} carros • {len(gallery)} fotos")
            modelos_db[slug] = next_mid
            next_mid += 1
            new_modelos += 1
            new_carros += carros_inseridos
        else:
            print("❌ sem dados")
        
        time.sleep(0.3)
    
    print(f"\n{'='*50}")
    print(f"✅ {new_modelos} novos modelos, {new_carros} novos carros!")
    
    # Final count
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/carros?select=count", headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req) as resp:
        total = json.loads(resp.read())[0]["count"]
    
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/marcas?select=count", headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req) as resp:
        marcas_total = json.loads(resp.read())[0]["count"]
    
    print(f"📊 Total: {marcas_total} marcas, {new_modelos + 40} modelos, ~{total} carros")

if __name__ == "__main__":
    main()
