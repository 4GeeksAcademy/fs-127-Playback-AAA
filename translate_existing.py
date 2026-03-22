from api.models import db, Product, Category, Subcategory, Item,Review
from deep_translator import GoogleTranslator
 
LANGS = ["en", "ca", "gl"]
 
def translate_text(text, target_lang):
    if not text:
        return None
    try:
        return GoogleTranslator(source='auto', target=target_lang).translate(text)
    except Exception as e:
        print(f"Error traduciendo '{text}' a {target_lang}: {e}")
        return text  # fallback: devuelve el original
 
def translate_field(field_dict, base_lang="es"):
    """Recibe {"es": "texto"} y devuelve {"es": "texto", "en": "...", "ca": "...", "gl": "..."}"""
    if not field_dict or base_lang not in field_dict:
        return field_dict
    base_text = field_dict[base_lang]
    result = {base_lang: base_text}
    for lang in LANGS:
        if lang not in field_dict or not field_dict[lang]:
            result[lang] = translate_text(base_text, lang)
        else:
            result[lang] = field_dict[lang]  # ya existe, no sobreescribir
    return result
 
 
print("Traduciendo productos...")
products = Product.query.all()
for i, p in enumerate(products):
    p.name = translate_field(p.name)
    if p.description:
        p.description = translate_field(p.description)
    if hasattr(p, 'characteristics') and p.characteristics:
        p.characteristics = translate_field(p.characteristics)
    db.session.add(p)
    if i % 20 == 0:
        print(f"  {i}/{len(products)} productos...")
 
print("Traduciendo categorías...")
for p in Category.query.all():
    p.name = translate_field(p.name)
    if p.description:
        p.description = translate_field(p.description)
    db.session.add(p)
 
print("Traduciendo subcategorías...")
for p in Subcategory.query.all():
    p.name = translate_field(p.name)
    if p.description:
        p.description = translate_field(p.description)
    db.session.add(p)
 
print("Traduciendo items...")
for p in Item.query.all():
    p.name = translate_field(p.name)
    if hasattr(p, 'description') and p.description:
        p.description = translate_field(p.description)
    db.session.add(p)

    print("Traduciendo reviews...")
from api.models import Review 
for p in Review.query.all():
    if hasattr(p, 'title') and p.title:
        p.title = translate_field(p.title)
    if hasattr(p, 'comment') and p.comment:
        p.comment = translate_field(p.comment)
    db.session.add(p)
 
db.session.commit()
print("¡Listo!")
 