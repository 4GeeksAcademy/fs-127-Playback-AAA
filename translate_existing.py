from api.models import db, Product
from deep_translator import GoogleTranslator

def translate_text(text, target_lang):
    if not text:
        return None
    return GoogleTranslator(source='auto', target=target_lang).translate(text)

products = Product.query.all()
for p in products:
    if "en" not in p.name:
        p.name = {"es": p.name["es"], "en": translate_text(p.name["es"], "en")}
    if p.description and "en" not in p.description:
        p.description = {"es": p.description["es"], "en": translate_text(p.description["es"], "en")}
    db.session.add(p)

db.session.commit()
print("Listo!")