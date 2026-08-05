import re

file_path = "/Users/faiqkarimli/Downloads/PremiumShop/PremiumShop/src/App.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    "'{t('aboutProduct')}'": "'Məhsul Haqqında'",
    "'{t('advantages')}'": "'Üstünlüklər'",
    "'{t('deleteChangeReceipt')}'": "'Çeki Sil / Dəyiş'",
    "'{t('guarantee100')}'": "'100% Zəmanət'",
    "'{t('typeText')}'": "'Növ:'",
    "'{t('loginInfoLabel')}'": "'Giriş Məlumatları'",
    "'{t('loginGuarantee')}'": "'5. Giriş Zəmanəti'",
    "'{t('sharedAccWarning')}'": "'Təqdim edilən <strong>Ortaq Hesablarda</strong> (Netflix, Canva, ChatGPT) şifrənin, elektron poçtun, pin kodların və ya hazır profil adlarının dəyişdirilməsi qəti qadağandır. Bu hal sistem tərəfindən aşkarlandıqda istifadəçinin hesaba girişi dərhal bloklanır və ona heç bir <strong>geri ödəniş (refund) edilmir</strong>.'",
    "'{t('orderProcessWarning')}'": "'Müştəri seçdiyi məhsulun ödənişini edib, bank çekini sistemə yüklədikdən sonra sifariş 1-12 saat (adətən 15 dəqiqə) ərzində yoxlanılır. Ödəniş təsdiq edildikdə giriş məlumatları avtomatik olaraq müştərinin Şəxsi Kabinetinə və Qeydiyyatdan keçdiyi E-poçt ünvanına göndərilir.'",
    "'{t('loginGuaranteeDesc')}'": "'Biz sadəcə sizlərə hesab məlumatlarını giriş zəmanətin veririk, girişi özünüz etməlisiniz, giriş zamanı problem yaşanılsa köməklik göstərilir.'",
    "'{t('setPassLabel')}'": "'Şifrə təyin edin'",
    "'{t('authPersonLogin')}'": "'Səlahiyyətli şəxs girişi'",
}

for old, new_val in replacements.items():
    content = content.replace(old, new_val)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
