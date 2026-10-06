import urllib.request
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'store-id': '13',
    'x-store-id': '13',
}

def fetch_url(url, req_headers=None):
    h = headers.copy()
    if req_headers:
        h.update(req_headers)
    req = urllib.request.Request(url, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.read().decode('utf-8')
    except Exception as e:
        return f"Error: {e}"

# Let's inspect the main page __NUXT_DATA__
home_html = fetch_url('https://haseensofficial.com/')
match = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', home_html, re.DOTALL)
if match:
    data = json.loads(match.group(1))
    print(f"Loaded {len(data)} items from home NUXT_DATA")
    
    # Let's find all object-like structures or categories
    with open('/tmp/home_nuxt_data.json', 'w') as f:
        json.dump(data, f, indent=2)
    print("Saved to /tmp/home_nuxt_data.json")

# Let's test gateway.octane.store endpoints
endpoints_to_test = [
    'https://gateway.octane.store/stores/13/products',
    'https://gateway.octane.store/api/v1/stores/13/products',
    'https://gateway.octane.store/products?store_id=13',
    'https://gateway.octane.store/api/products?store_id=13',
    'https://api.laam.pk/stores/13/products',
    'https://api.laam.pk/api/v1/stores/13/products',
    'https://api.laam.pk/v1/products?store_id=13',
    'https://api.laam.pk/v2/products?store_id=13',
]

for ep in endpoints_to_test:
    res = fetch_url(ep)
    print(ep, '->', res[:120])
