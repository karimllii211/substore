import re

file_path = "/Users/faiqkarimli/Downloads/PremiumShop/PremiumShop/src/App.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "<p className=\"text-gray-400 text-xs sm:text-sm leading-relaxed font-medium\">{t('sharedAccWarning')}</p>",
    "<p className=\"text-gray-400 text-xs sm:text-sm leading-relaxed font-medium\" dangerouslySetInnerHTML={{__html: t('sharedAccWarning')}}></p>"
)
content = content.replace(
    "<p className=\"text-gray-400 text-xs sm:text-sm leading-relaxed font-medium\">{t('orderProcessWarning')}</p>",
    "<p className=\"text-gray-400 text-xs sm:text-sm leading-relaxed font-medium\" dangerouslySetInnerHTML={{__html: t('orderProcessWarning')}}></p>"
)

# And fix "+ Əlavə Et" which might not have been replaced cleanly if there were extra spaces
content = content.replace(">+ Əlavə Et</button>", ">{t('addBtn')}</button>")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
