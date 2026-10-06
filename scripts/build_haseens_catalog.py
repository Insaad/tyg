import json
import re
import csv
import os

with open('/tmp/haseens_all_products.json') as f:
    raw_products = json.load(f)

CATEGORY_MAP = {
    '/drops/haseens-official-dholak': {
        'id': 'dholak',
        'name': 'Dholak Festive Collection',
        'urduName': 'ڈھولک کلیکشن',
        'tagline': 'Vibrant Hues, Mirror Work & Rhythmic Festive Joy',
        'description': 'Celebratory Pakistani festive pret and wedding wear designed for lively sangeet nights and musical celebrations.',
        'badgeTone': 'bg-[#9E7B3B]/10 text-[#9E7B3B] border-[#9E7B3B]/30',
        'accentColor': '#9E7B3B',
        'bgGradient': 'from-[#FAF8F5] to-[#F5EFE6]',
        'paletteDescription': 'Warm turmeric gold, sunset rust, festive saffron, and champagne zari.'
    },
    '/drops/haseens-official-banur': {
        'id': 'banur',
        'name': 'Banur Festive Couture',
        'urduName': 'بانور کوتور',
        'tagline': 'Subtle Radiance & Delicate Metallic Sheen',
        'description': 'Heritage-inspired formal pret featuring gossamer pastel fabrics and fine badla embroidery.',
        'badgeTone': 'bg-[#8F7D6B]/10 text-[#8F7D6B] border-[#8F7D6B]/30',
        'accentColor': '#8F7D6B',
        'bgGradient': 'from-[#FDFBF9] to-[#F4EEE6]',
        'paletteDescription': 'Muted champagne, soft ivory, antique brass, and blush taupe.'
    },
    '/drops/haseens-official-dilruba': {
        'id': 'dilruba',
        'name': 'Dilruba Luxury Edition',
        'urduName': 'دلربا ایڈیشن',
        'tagline': 'Passionate Jewel Tones & Regal Embellishments',
        'description': 'Opulent crimson and deep ruby luxury pret accented with dense resham and sparkling zardozi.',
        'badgeTone': 'bg-[#8A2435]/10 text-[#8A2435] border-[#8A2435]/30',
        'accentColor': '#8A2435',
        'bgGradient': 'from-[#FAF5F6] to-[#F3E5E8]',
        'paletteDescription': 'Crimson red, pomegranate, antique gold, and deep plum.'
    },
    '/drops/haseens-official-naqs': {
        'id': 'naqs',
        'name': 'Naqs Fine Couture',
        'urduName': 'نقش فائن کوتور',
        'tagline': 'Intricate Geometric & Floral Thread Etchings',
        'description': 'Architectural embroideries, symmetric jaal compositions, and fine hand-needle craftsmanship.',
        'badgeTone': 'bg-[#4A6B5D]/10 text-[#4A6B5D] border-[#4A6B5D]/30',
        'accentColor': '#4A6B5D',
        'bgGradient': 'from-[#F5F8F6] to-[#E9EFEA]',
        'paletteDescription': 'Sage green, antique silver, mint stone, and deep spruce.'
    },
    '/drops/haseens-official-zahia-1': {
        'id': 'zahia',
        'name': 'Zahia Collection',
        'urduName': 'زاہیہ کلیکشن',
        'tagline': 'Radiant Celebrations of Light & Crystalline Shimmer',
        'description': 'Luminous evening silhouettes featuring pearlescent sequence sprays and iridescent organza textures.',
        'badgeTone': 'bg-[#3A5A7B]/10 text-[#3A5A7B] border-[#3A5A7B]/30',
        'accentColor': '#3A5A7B',
        'bgGradient': 'from-[#F5F8FB] to-[#E8F0F7]',
        'paletteDescription': 'Powder blue, icy silver, moonlight pearl, and soft lavender.'
    },
    '/drops/haseens-official-gulal': {
        'id': 'gulal',
        'name': 'Gulal Festive Drop',
        'urduName': 'گلال کلیکشن',
        'tagline': 'Soft Florals & Ethereal Daywear Elegance',
        'description': 'Delicate botanical threadwork and breezy organza drapery for daytime nikah and garden celebrations.',
        'badgeTone': 'bg-[#B06D79]/10 text-[#B06D79] border-[#B06D79]/30',
        'accentColor': '#B06D79',
        'bgGradient': 'from-[#FBF6F7] to-[#F5E8EB]',
        'paletteDescription': 'Rose quartz, apricot blossom, cream, and soft terracotta.'
    },
    '/collections/10-10sale': {
        'id': 'sale-10-10',
        'name': '10.10 Festive Sale',
        'urduName': '۱۰.۱۰ سیل',
        'tagline': 'Limited-Time Seasonal Reductions Up to 60% Off',
        'description': 'Exclusive seasonal promotion on Haseens Official iconic luxury pret and festive signatures.',
        'badgeTone': 'bg-[#C2410C]/10 text-[#C2410C] border-[#C2410C]/30',
        'accentColor': '#C2410C',
        'bgGradient': 'from-[#FFF7ED] to-[#FFEDD5]',
        'paletteDescription': 'Festive copper, burnt orange, golden zari, and warm ivory.'
    },
    '/collections/lawn': {
        'id': 'lawn',
        'name': 'Luxury Lawn Edition',
        'urduName': 'لگژری لان',
        'tagline': 'Breathable Premium Summer Fabrics with Embroidered Organza Dupattas',
        'description': 'Finest 80s count lawn suits featuring hand-cut Schiffli borders and diaphanous chiffon dupattas.',
        'badgeTone': 'bg-[#15803D]/10 text-[#15803D] border-[#15803D]/30',
        'accentColor': '#15803D',
        'bgGradient': 'from-[#F0FDF4] to-[#DCFCE7]',
        'paletteDescription': 'Fresh jade, pastel lime, crisp ivory, and citrus sorbet.'
    },
    '/nodes/gharara-182': {
        'id': 'gharara',
        'name': 'Gharara Ensembles',
        'urduName': 'غرارہ سوٹ',
        'tagline': 'Nawabi Elegance Crafted with Generational Heritage',
        'description': 'Regal flared pleated ghararas with heavily embellished borders and matching short kurtis.',
        'badgeTone': 'bg-[#9E7B3B]/10 text-[#9E7B3B] border-[#9E7B3B]/30',
        'accentColor': '#9E7B3B',
        'bgGradient': 'from-[#FAF8F5] to-[#F4EEE4]',
        'paletteDescription': 'Antique gold, deep emerald, saffron, and ruby red.'
    },
    '/nodes/pishwas-520': {
        'id': 'pishwas',
        'name': 'Royal Pishwas',
        'urduName': 'شاہی پیشواز',
        'tagline': 'Grand Kalidar Flare Inspired by Mughal Splendor',
        'description': 'Sweeping 36-to-48 kali gowns with densely hand-worked choli bodices and trailing organza dupattas.',
        'badgeTone': 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/30',
        'accentColor': '#7C3AED',
        'bgGradient': 'from-[#FAF5FF] to-[#F3E8FF]',
        'paletteDescription': 'Royal amethyst, gold zari, pearl ivory, and dusty lilac.'
    },
    '/nodes/maxi-299': {
        'id': 'maxi',
        'name': 'Luxury Pret Maxi',
        'urduName': 'لگژری میکسی',
        'tagline': 'Sweeping Evening Silhouettes in Pure Silk & Chiffon',
        'description': 'Graceful floor-length flowing maxis adorned with intricate threadwork, pearls, and micro sequins.',
        'badgeTone': 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30',
        'accentColor': '#0D9488',
        'bgGradient': 'from-[#F0FDFA] to-[#CCFBF1]',
        'paletteDescription': 'Deep sea teal, silver foil, midnight aqua, and champagne.'
    },
    '/nodes/lehenga-296': {
        'id': 'lehenga',
        'name': 'Bridal Lehenga',
        'urduName': 'عروسی لہنگا',
        'tagline': 'Heirloom Masterpieces for Barat, Nikah & Reception',
        'description': 'Bespoke bridal lehengas featuring traditional zardozi, dabka, naqshi, resham floral jaals, and scalloped matha patti dupattas.',
        'badgeTone': 'bg-[#BE123C]/10 text-[#BE123C] border-[#BE123C]/30',
        'accentColor': '#BE123C',
        'bgGradient': 'from-[#FFF1F2] to-[#FFE4E6]',
        'paletteDescription': 'Traditional sindoor red, rust gold, antique vasli, and maroon.'
    },
    '/nodes/sharara-6': {
        'id': 'sharara',
        'name': 'Festive Sharara',
        'urduName': 'شرارہ سوٹ',
        'tagline': 'Celebratory Flared Silhouettes for Mehndi & Sangeet',
        'description': 'Flared silhouette bottoms paired with mid-length embroidered shirts and rich contrast dupattas.',
        'badgeTone': 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30',
        'accentColor': '#D97706',
        'bgGradient': 'from-[#FFFBEB] to-[#FEF3C7]',
        'paletteDescription': 'Mustard yellow, tangerine, mint green, and gota gold.'
    },
    '/nodes/gown-521': {
        'id': 'gown',
        'name': 'Contemporary Couture Gown',
        'urduName': 'جدید گاﺅن',
        'tagline': 'East Meets West Haute Couture for Galas & Walima',
        'description': 'Modern fusion evening gowns with structural drapes, capes, and delicate crystal embroidery.',
        'badgeTone': 'bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/30',
        'accentColor': '#4F46E5',
        'bgGradient': 'from-[#EEF2FF] to-[#E0E7FF]',
        'paletteDescription': 'Slate blue, frosted silver, graphite, and diamond shimmer.'
    }
}

def extract_fabrics(title, desc_html, tags):
    text = (title + ' ' + str(desc_html) + ' ' + ' '.join(tags)).lower()
    found = []
    for f in ['raw silk', 'pure chiffon', 'french organza', 'tissue', 'banarsi jamawar', 'silk velvet', 'french net', 'cotton lawn', 'georgette']:
        if f in text and f not in found:
            found.append(f.title())
    return ', '.join(found[:2]) if found else 'Pure Chiffon & Silk'

def extract_lead_time(tags):
    for t in tags:
        if 'DeliveryDays' in t:
            m = re.search(r'DeliveryDays_([^_]+)', t)
            if m:
                return m.group(1).replace('-', ' to ')
        if 'DeliveryTime' in t:
            m = re.search(r'DeliveryTime_(\d+)', t)
            if m:
                days = int(m.group(1))
                weeks = round(days / 7)
                return f'{weeks} to {weeks + 2} Weeks'
    return '4 to 6 Weeks'

def extract_embroidery(title, desc_html, tags):
    text = (title + ' ' + str(desc_html) + ' ' + ' '.join(tags)).lower()
    emb = []
    for e in ['zardozi', 'dabka', 'naqshi', 'tilla', 'resham', 'mukesh', 'gota', 'marori', 'cut-dana', 'sequins', 'mirror work', 'schiffli']:
        if e in text and e not in emb:
            emb.append(e.title())
    return ', '.join(emb[:3]) if emb else 'Handcrafted Zardozi, Tilla & Fine Resham'

processed_products = []
category_hero_images = {}

for idx, (handle, val) in enumerate(raw_products.items()):
    path = val['path']
    p = val['data']
    cat_info = CATEGORY_MAP.get(path, CATEGORY_MAP['/collections/10-10sale'])
    cat_id = cat_info['id']
    cat_name = cat_info['name']

    title = p.get('title') or handle.replace('-', ' ').title()
    title = title.replace(' - ', ' ').replace(' – ', ' ').strip()
    if len(title) > 65:
        title = title[:60].strip() + '...'

    price = p.get('pricing_breakdown', {}).get('price') or p.get('price') or 25000
    try:
        price = int(float(price))
    except:
        price = 25000

    orig_price = p.get('compare_at_price')
    orig_price_num = None
    if orig_price:
        try:
            val_p = int(float(orig_price))
            if val_p > price:
                orig_price_num = val_p
            else:
                orig_price_num = int(price * 1.25)
        except:
            orig_price_num = int(price * 1.25)
    elif cat_id == 'sale-10-10':
        orig_price_num = int(price * 1.25)

    img_data = p.get('image')
    image_url = img_data.get('src') if isinstance(img_data, dict) else (img_data or '')
    if not image_url:
        image_url = 'https://cdn.shopify.com/s/files/1/2337/7003/files/20260926202520-edb6e189a5844c5a-media_image.jpg'

    if cat_id not in category_hero_images and image_url:
        category_hero_images[cat_id] = image_url

    tags = p.get('tags', [])
    desc = p.get('description') or ''
    clean_desc = re.sub(r'<[^>]+>', ' ', desc).strip()
    clean_desc = re.sub(r'\s+', ' ', clean_desc)
    if not clean_desc or len(clean_desc) < 20:
        clean_desc = f"Exquisite handcrafted {cat_name} ensemble from Haseens Official. Masterfully tailored with generational Pakistani artistry, premium pure fabrics, and delicate celebratory motifs."

    fabric = extract_fabrics(title, desc, tags)
    lead_time = extract_lead_time(tags)
    embroidery = extract_embroidery(title, desc, tags)

    pieces = '3-Piece (Shirt, Trouser, Dupatta)'
    if 'saree' in title.lower():
        pieces = '2-Piece (Saree with Blouse)'
    elif 'lehenga' in title.lower():
        pieces = '3-Piece (Choli, Flared Lehenga, Dupatta)'
    elif 'pishwas' in title.lower() or 'maxi' in title.lower():
        pieces = '3-Piece (Kalidar Gown, Trouser, Border Dupatta)'
    elif 'gharara' in title.lower() or 'sharara' in title.lower():
        pieces = '3-Piece (Embroidered Kurti, Flared Bottom, Dupatta)'

    is_featured = idx % 5 == 0
    is_bestseller = idx % 4 == 0
    is_new_arrival = idx % 3 == 0

    status = 'Made to Order' if cat_id in ['lehenga', 'pishwas', 'gharara'] else 'Stitched'

    details = [
        f"Artisanal Silhouette: {cat_name}",
        f"Fabric Craft: {fabric}",
        f"Embellishment Technique: {embroidery}",
        f"Components: {pieces}",
        f"Standard Atelier Production: {lead_time}",
        "Authentic Haseens Official Designer Ensemble with Luxury Finishing",
        "Dry clean only. Store in protective breathable muslin cotton garment bag."
    ]

    prod_id = f"has-{idx+1:03d}"

    prod_obj = {
        'id': prod_id,
        'name': title,
        'category': cat_id,
        'categoryName': cat_name,
        'price': price,
        'image': image_url,
        'secondaryImage': image_url,
        'galleryImages': [image_url],
        'colors': ['Ivory', 'Gold', 'Crimson', 'Emerald'],
        'fabric': fabric,
        'embroidery': embroidery,
        'pieces': pieces,
        'leadTime': lead_time,
        'status': status,
        'description': clean_desc,
        'details': details,
        'isFeatured': is_featured,
        'isBestseller': is_bestseller,
        'isNewArrival': is_new_arrival
    }
    if orig_price_num:
        prod_obj['originalPrice'] = orig_price_num

    processed_products.append(prod_obj)

print(f'Processed {len(processed_products)} products successfully!')

category_themes = []
for path, cat in CATEGORY_MAP.items():
    cat_id = cat['id']
    hero = category_hero_images.get(cat_id, 'https://cdn.shopify.com/s/files/1/2337/7003/files/20260926202520-edb6e189a5844c5a-media_image.jpg')
    category_themes.append({
        'id': cat_id,
        'name': cat['name'],
        'urduName': cat['urduName'],
        'tagline': cat['tagline'],
        'description': cat['description'],
        'heroImage': hero,
        'accentColor': cat['accentColor'],
        'bgGradient': cat['bgGradient'],
        'badgeTone': cat['badgeTone'],
        'paletteDescription': cat['paletteDescription']
    })

# 1. Output CSV files for Google Sheets
csv_products_path = '/app/applet/public/catalog_products.csv'
with open(csv_products_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        'id', 'title', 'category', 'category_name', 'price', 'original_price',
        'image', 'secondary_image', 'fabric', 'embroidery', 'pieces',
        'lead_time', 'status', 'featured', 'bestseller', 'new_arrival', 'description'
    ])
    for p in processed_products:
        writer.writerow([
            p['id'],
            p['name'],
            p['category'],
            p['categoryName'],
            p['price'],
            p.get('originalPrice', ''),
            p['image'],
            p.get('secondaryImage', ''),
            p['fabric'],
            p['embroidery'],
            p['pieces'],
            p['leadTime'],
            p['status'],
            'TRUE' if p['isFeatured'] else 'FALSE',
            'TRUE' if p['isBestseller'] else 'FALSE',
            'TRUE' if p['isNewArrival'] else 'FALSE',
            p['description']
        ])
print(f'Wrote CSV to {csv_products_path}')

csv_categories_path = '/app/applet/public/catalog_categories.csv'
with open(csv_categories_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'name', 'urdu_name', 'tagline', 'description', 'hero_image'])
    for c in category_themes:
        writer.writerow([
            c['id'],
            c['name'],
            c['urduName'],
            c['tagline'],
            c['description'],
            c['heroImage']
        ])
print(f'Wrote CSV to {csv_categories_path}')

# 2. Output JSON catalog
with open('/app/applet/src/data/haseensCatalog.json', 'w', encoding='utf-8') as f:
    json.dump({
        'products': processed_products,
        'categories': category_themes
    }, f, indent=2, ensure_ascii=False)
print('Wrote /app/applet/src/data/haseensCatalog.json')
