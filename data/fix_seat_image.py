#!/usr/bin/env python3
"""Fix Seat Leon image - try direct Wikipedia page."""
import json, urllib.request, urllib.parse

SUPABASE_URL = "https://suzsasiozkcoyshvktuo.supabase.co"
SECRET_KEY="sb_s...
UA = "Guiadocarro/1.0"

# Try Wikipedia with the Spanish page
titles = ["SEAT Leon", "SEAT León", "Seat Leon"]
for title in titles:
    params = urllib.parse.urlencode({
        "action": "query", "titles": title, "prop": "pageimages",
        "format": "json", "pithumbsize": 600,
    })
    url = f"https://en.wikipedia.org/w/api.php?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
    
    for pid, page in data.get("query", {}).get("pages", {}).items():
        if pid != "-1" and "thumbnail" in page:
            img = page["thumbnail"]["source"]
            print(f"✅ {title}: {img}")
            
            # Update Seat Leon carros (modelo_id=16)
            data = json.dumps({"imagem_url": img}).encode()
            ureq = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/carros?modelo_id=eq.16",
                data=data, method="PATCH",
                headers={
                    "apikey": SECRET_KEY, "Authorization": f"Bearer {SECRET_KEY}",
                    "Content-Type": "application/json", "Prefer": "return=minimal"
                }
            )
            urllib.request.urlopen(ureq)
            print(f"   ✅ 2 carros atualizados!")
            exit(0)

print("❌ Nenhuma imagem encontrada para Seat Leon")
