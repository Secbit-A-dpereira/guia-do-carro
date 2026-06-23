#!/usr/bin/env python3
"""Add gallery images for all car models."""
import json, urllib.request, re, sys, time

import os
KEY = os.environ.get("SUPABASE_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://suzsasiozkcoyshvktuo.supabase.co")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

# First, need to add the galeria column
# Since we can't do DDL via REST, let's use the Supabase client
# to create a new table carro_galeria via direct SQL
# 
# Actually, the simplest approach:
# Store gallery images as a JSON text array in a new column
# via calling the PostgREST RPC endpoint which can run SQL
# 
# OR: Just update imagem_url to be a JSON string array
# and handle both single URL and array on the frontend

# Let me try a much simpler approach:
# Add column via direct postgres connection
# Supabase free tier allows connection via:
# postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
# But I don't have the DB password.

# The actual pragmatic solution:
# Create a NEW table carro_galeria via the Supabase dashboard
# The user can run:
# CREATE TABLE carro_galeria (id SERIAL PRIMARY KEY, carro_id INTEGER REFERENCES carros(id), imagem_url TEXT NOT NULL, ordem INTEGER DEFAULT 0);
# Then I can insert into it via REST API

# But I can't create tables. So let me use the carros table differently.
# I'll store multiple images as a JSON array in the existing imagem_url column
# by converting it to text (it already is TEXT) and storing JSON.

# Step 1: For each model, scrape StandVirtual and get multiple images
MODELOS = [
    ("renault", "clio", 1), ("renault", "captur", 2), ("renault", "megane", 3),
    ("peugeot", "208", 4), ("peugeot", "308", 5), ("peugeot", "3008", 6),
    ("volkswagen", "golf", 7), ("volkswagen", "t-roc", 8), ("volkswagen", "tiguan", 9),
    ("toyota", "corolla", 10), ("toyota", "yaris", 11), ("toyota", "rav4", 12),
]

def fetch_gallery(marca, modelo, max_images=6):
    url = f"https://www.standvirtual.com/carros/{marca}/{modelo}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode()
    except:
        return []
    
    # Find large images grouped by listing
    images = re.findall(r'https://ireland\.apollo\.olxcdn\.com/v1/files/[^"\']+?image;s=644x461', html)
    
    if not images:
        return []
    
    # Take first max_images
    return images[:max_images]

# Step 2: Get distinct carros and their modelo_ids
req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/modelos?select=id,slug",
    headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"}
)
with urllib.request.urlopen(req) as resp:
    modelos_db = json.loads(resp.read())

slug_to_mid = {m["slug"]: m["id"] for m in modelos_db}

# Step 3: For each model, get gallery and store
updated = 0
for marca, modelo, _ in MODELOS:
    slug = f"{marca}-{modelo}"
    mid = slug_to_mid.get(slug)
    if not mid:
        print(f"  {slug} → skip (not in DB)")
        continue
    
    print(f"  {marca} {modelo}...", end=" ", flush=True)
    images = fetch_gallery(marca, modelo)
    
    if images:
        # Store as JSON array in imagem_url field
        # Format: ["url1","url2","url3"]
        gallery_json = json.dumps(images)
        
        data = json.dumps({"galeria": gallery_json}).encode()
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/carros?modelo_id=eq.{mid}",
            data=data, method="PATCH",
            headers={
                "apikey": KEY, "Authorization": f"Bearer {KEY}",
                "Content-Type": "application/json", "Prefer": "return=minimal"
            }
        )
        try:
            urllib.request.urlopen(req)
            print(f"✅ {len(images)} imagens")
            updated += 1
        except Exception as e:
            print(f"❌ erro: {e}")
    else:
        print("❌ sem imagens")
    
    time.sleep(0.3)

print(f"\n✅ {updated} modelos atualizados com galeria")
