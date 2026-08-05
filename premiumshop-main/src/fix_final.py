import re

file_path = "/Users/faiqkarimli/Downloads/PremiumShop/PremiumShop/src/App.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    "Məhsul Haqqında": "{t('aboutProduct')}",
    "Üstünlüklər": "{t('advantages')}",
    ">Sifarişlərim<": ">{t('myOrdersTab')}<",
    "Cinsiyyət</label>": "{t('genderLabel')}</label>",
    ">Kişi<": ">{t('male')}<",
    ">Qadın<": ">{t('female')}<",
}

for old, new_val in replacements.items():
    content = content.replace(old, new_val)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
