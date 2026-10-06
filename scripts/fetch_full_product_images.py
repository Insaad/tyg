import json
import re
import urllib.request
import concurrent.futures
import time

with open('/tmp/haseens_all_products.json') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products to enrich with multiple images and sub-categories...")

# Fetch full images for each product handle
def fetch_images_for_product(item):
    handle, data = item
    url = f"https://haseensofficial.com/products/{handle}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    imgs = []
    try:
        html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8')
        all_imgs = re.findall(r'https://cdn\.shopify\.com/s/files/[a-zA-Z0-9/_.\-]+\.(?:jpg|png|webp)', html)
        seen = set()
        for i in all_imgs:
            if not any(bad in i for bad in ['Favicon', 'HASEENS_LOGO', 'file-', 'thumbnail', 'logo', 'Kurta_set_f76b388d']):
                if i not in seen:
                    seen.add(i)
                    imgs.append(i)
    except Exception as e:
        pass
    
    # Fallback to existing single image if empty
    orig_img = data.get('data', {}).get('image', {}).get('src') or ''
    if not imgs and orig_img:
        imgs = [orig_img]
    elif orig_img and orig_img not in imgs:
        imgs.insert(0, orig_img)

    return handle, imgs

start_time = time.time()
enriched_images = {}
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    results = executor.map(fetch_images_for_product, products.items())
    for handle, imgs in results:
        enriched_images[handle] = imgs

print(f"Fetched full photo galleries for {len(enriched_images)} products in {time.time() - start_time:.1f}s")

with open('/tmp/haseens_enriched_images.json', 'w') as f:
    json.dump(enriched_images, f)

print("Saved to /tmp/haseens_enriched_images.json")
