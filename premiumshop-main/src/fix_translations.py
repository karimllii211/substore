import re

file_path = "/Users/faiqkarimli/Downloads/PremiumShop/PremiumShop/src/App.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add new keys to TRANSLATIONS.az and TRANSLATIONS.en
az_keys = """
    loginInfoLabel: 'Giriş Məlumatları', loginGuarantee: '5. Giriş Zəmanəti',
    sharedAccWarning: 'Təqdim edilən <strong>Ortaq Hesablarda</strong> (Netflix, Canva, ChatGPT) şifrənin, elektron poçtun, pin kodların və ya hazır profil adlarının dəyişdirilməsi qəti qadağandır. Bu hal sistem tərəfindən aşkarlandıqda istifadəçinin hesaba girişi dərhal bloklanır və ona heç bir <strong>geri ödəniş (refund) edilmir</strong>.',
    orderProcessWarning: 'Müştəri seçdiyi məhsulun ödənişini edib, bank çekini sistemə yüklədikdən sonra sifariş 1-12 saat (adətən 15 dəqiqə) ərzində yoxlanılır. Ödəniş təsdiq edildikdə giriş məlumatları avtomatik olaraq müştərinin Şəxsi Kabinetinə və Qeydiyyatdan keçdiyi E-poçt ünvanına göndərilir.',
    loginGuaranteeDesc: 'Biz sadəcə sizlərə hesab məlumatlarını giriş zəmanətin veririk, girişi özünüz etməlisiniz, giriş zamanı problem yaşanılsa köməklik göstərilir.',
    changeBtn: 'Dəyiş', deleteBtn: 'Sil', setPassLabel: 'Şifrə təyin edin', newPassLabel: 'Yeni Şifrə',
    authPersonLogin: 'Səlahiyyətli şəxs girişi', usernameLabel: 'İstifadəçi Adı',
    extraInfoPh: 'məs. Pin kod, profil adı...', notePh: 'məs. Giriş təlimatları, xüsusi qeydlər...',
    accountTypeLabel: 'Hesab Növü', accountTypePh: 'Məs: Ortaq Hesab', addBtn: '+ Əlavə Et', cancelBtn: 'Ləğv Et',
    allProducts: 'Bütün məhsullar',
"""

en_keys = """
    loginInfoLabel: 'Login Information', loginGuarantee: '5. Login Guarantee',
    sharedAccWarning: 'Changing the password, email, pin codes or ready profile names in the provided <strong>Shared Accounts</strong> (Netflix, Canva, ChatGPT) is strictly prohibited. If this situation is detected by the system, the user\\'s access to the account is immediately blocked and no <strong>refund is given</strong>.',
    orderProcessWarning: 'After the customer pays for the selected product and uploads the bank receipt to the system, the order is checked within 1-12 hours (usually 15 minutes). When the payment is confirmed, the login information is automatically sent to the customer\\'s Personal Cabinet and the Email address they registered with.',
    loginGuaranteeDesc: 'We only provide you with a login guarantee for the account information, you must log in yourself, if you experience problems during login, we will assist you.',
    changeBtn: 'Change', deleteBtn: 'Delete', setPassLabel: 'Set a password', newPassLabel: 'New Password',
    authPersonLogin: 'Authorized personnel login', usernameLabel: 'Username',
    extraInfoPh: 'e.g. Pin code, profile name...', notePh: 'e.g. Login instructions, special notes...',
    accountTypeLabel: 'Account Type', accountTypePh: 'E.g: Shared Account', addBtn: '+ Add', cancelBtn: 'Cancel',
    allProducts: 'All products',
"""

content = content.replace("az: {", "az: {" + az_keys)
content = content.replace("en: {", "en: {" + en_keys)

# 2. Replace hardcoded strings in JSX with {t('key')}
replacements = {
    "Giriş Məlumatları": "{t('loginInfoLabel')}",
    "5. Giriş Zəmanəti": "{t('loginGuarantee')}",
    "Təqdim edilən <strong>Ortaq Hesablarda</strong> (Netflix, Canva, ChatGPT) şifrənin, elektron poçtun, pin kodların və ya hazır profil adlarının dəyişdirilməsi qəti qadağandır. Bu hal sistem tərəfindən aşkarlandıqda istifadəçinin hesaba girişi dərhal bloklanır və ona heç bir <strong>geri ödəniş (refund) edilmir</strong>.": "{t('sharedAccWarning')}",
    "Müştəri seçdiyi məhsulun ödənişini edib, bank çekini sistemə yüklədikdən sonra sifariş 1-12 saat (adətən 15 dəqiqə) ərzində yoxlanılır. Ödəniş təsdiq edildikdə giriş məlumatları avtomatik olaraq müştərinin Şəxsi Kabinetinə və Qeydiyyatdan keçdiyi E-poçt ünvanına göndərilir.": "{t('orderProcessWarning')}",
    "Biz sadəcə sizlərə hesab məlumatlarını giriş zəmanətin veririk, girişi özünüz etməlisiniz, giriş zamanı problem yaşanılsa köməklik göstərilir.": "{t('loginGuaranteeDesc')}",
    ">Dəyiş</button>": ">{t('changeBtn')}</button>",
    ">Sil</button>": ">{t('deleteBtn')}</button>",
    "Şifrə təyin edin": "{t('setPassLabel')}",
    "Yeni Şifrə</label>": "{t('newPassLabel')}</label>",
    "Səlahiyyətli şəxs girişi": "{t('authPersonLogin')}",
    "İstifadəçi Adı</label>": "{t('usernameLabel')}</label>",
    'placeholder="məs. Pin kod, profil adı..."': 'placeholder={t("extraInfoPh")}',
    "Qeyd (Müstəriyə məlumat)": "{t('noteToCustomer')}", # Already in translations
    'placeholder="məs. Giriş təlimatları, xüsusi qeydlər..."': 'placeholder={t("notePh")}',
    "Hesab Növü</label>": "{t('accountTypeLabel')}</label>",
    'placeholder="Məs: Ortaq Hesab"': 'placeholder={t("accountTypePh")}',
    ">Ləğv Et</button>": ">{t('cancelBtn')}</button>",
    "› Bütün məhsullar": "› {t('allProducts')}",
    "› Qaydalar": "› {t('footerRules')}",
    "› Hesab": "› {t('profile')}",
    'placeholder="Email daxil et"': 'placeholder={t("subscribePlaceholder")}',
    ">Admin<": ">{t('footerAdmin')}<",
    "E-poçt Ünvanı": "{t('emailLabel')}",
    "Şifrə</label>": "{t('passLabel')}</label>",
    "Ad</label>": "{t('nameLabel')}</label>",
    "Soyad</label>": "{t('surnameLabel')}</label>",
    "E-poçt</label>": "{t('emailLabel')}</label>",
    "← Geriyə Qayıt": "{t('checkoutBack')}", # Not perfect match but fits
    "Artıq hesabınız var? <span": "{t('hasAccount')} <span",
    ">Giriş edin</span>": ">{t('loginBtn')}</span>",
    "İşlənir...": "Processing...",
    
}

# The dangerouslySetInnerHTML is required for HTML strings from t()
content = content.replace(
    "<p className=\"text-gray-400 text-xs sm:text-sm leading-relaxed font-medium\">{t('sharedAccWarning')}</p>",
    "<p className=\"text-gray-400 text-xs sm:text-sm leading-relaxed font-medium\" dangerouslySetInnerHTML={{__html: t('sharedAccWarning')}}></p>"
)
content = content.replace(
    "<p className=\"text-gray-400 text-xs sm:text-sm leading-relaxed font-medium\">{t('orderProcessWarning')}</p>",
    "<p className=\"text-gray-400 text-xs sm:text-sm leading-relaxed font-medium\" dangerouslySetInnerHTML={{__html: t('orderProcessWarning')}}></p>"
)

for old, new_val in replacements.items():
    content = content.replace(old, new_val)

# Fix bottom panel icons again, because they were reverted to `› ${t('login')}` in git reset!
content = content.replace(">`› ${t('login')}`</span>", ">{`› ${t('login')}`}</span>")
content = content.replace(">`› ${t('register')}`</span>", ">{`› ${t('register')}`}</span>")


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
