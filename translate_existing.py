from api.models import db, Product,Category,Subcategory,Item
from deep_translator import GoogleTranslator

def translate_text(text, target_lang):
    if not text:
        return None
    return GoogleTranslator(source='auto', target=target_lang).translate(text)

products = Product.query.all()
category= Category.query.all()
subcategory= Subcategory.query.all()
item= Item.query.all()
for p in products:
    p.name = {"es": p.name["es"], "en": translate_text(p.name["es"], "en")}
    if p.description:
        p.description = {"es": p.description["es"], "en": translate_text(p.description["es"], "en")}
    db.session.add(p)

for p in category:
    p.name = {"es": p.name["es"], "en": translate_text(p.name["es"], "en")}
    if p.description:
        p.description = {"es": p.description["es"], "en": translate_text(p.description["es"], "en")}
    db.session.add(p)

for p in subcategory:
    p.name = {"es": p.name["es"], "en": translate_text(p.name["es"], "en")}
    if p.description:
        p.description = {"es": p.description["es"], "en": translate_text(p.description["es"], "en")}
    db.session.add(p)

for p in item:
    p.name = {"es": p.name["es"], "en": translate_text(p.name["es"], "en")}
    db.session.add(p)


db.session.commit()
print("Listo!")