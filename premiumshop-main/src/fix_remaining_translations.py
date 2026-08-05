import re

file_path = "/Users/faiqkarimli/Downloads/PremiumShop/PremiumShop/src/App.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

az_additions = """
    aboutProduct: 'Məhsul Haqqında', advantages: 'Üstünlüklər',
    myOrdersTab: 'Sifarişlərim', genderLabel: 'Cinsiyyət', male: 'Kişi', female: 'Qadın',
    changeImg: 'Şəkli<br/>Dəyiş', changeImgDesktop: 'Şəkli Dəyiş', deleteChangeReceipt: 'Çeki Sil / Dəyiş',
    guarantee100: '100% Zəmanət', salesText: 'Satış', typeText: 'Növ:',
"""

en_additions = """
    aboutProduct: 'About Product', advantages: 'Features',
    myOrdersTab: 'My Orders', genderLabel: 'Gender', male: 'Male', female: 'Female',
    changeImg: 'Change<br/>Image', changeImgDesktop: 'Change Image', deleteChangeReceipt: 'Delete / Change Receipt',
    guarantee100: '100% Guarantee', salesText: 'Sales', typeText: 'Type:',
"""

content = content.replace("az: {", "az: {" + az_additions)
content = content.replace("en: {", "en: {" + en_additions)

replacements = {
    "Məhsul Haqqında": "{t('aboutProduct')}",
    "Üstünlüklər": "{t('advantages')}",
    ">Sifarişlərim<": ">{t('myOrdersTab')}<",
    "Cinsiyyət</label>": "{t('genderLabel')}</label>",
    ">Kişi<": ">{t('male')}<",
    ">Qadın<": ">{t('female')}<",
    ">Şəkli<br/>Dəyiş<": ">{{__html: t('changeImg')}}<", # Needs dangerouslySetInnerHTML, or I just use {t('changeImg')} and avoid <br/> in translations.
    # Actually wait, React will escape <br/>. So let's use dangerouslySetInnerHTML
}

# Safer replacement for changeImg
content = content.replace(
    "<span className=\"text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center\">Şəkli<br/>Dəyiş</span>",
    "<span className=\"text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center\" dangerouslySetInnerHTML={{__html: t('changeImg')}}></span>"
)

content = content.replace("Çeki Sil / Dəyiş", "{t('deleteChangeReceipt')}")
content = content.replace("100% Zəmanət", "{t('guarantee100')}")
content = content.replace(">Satış<", ">{t('salesText')}<")
content = content.replace("Növ:", "{t('typeText')}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
