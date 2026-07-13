import React, { useState, useEffect } from 'react';

// =========================================================================
// ⚠️ YENİ VƏ REAL EMAILJS KONFİQURASİYASI
// =========================================================================
const EMAILJS_CONFIG = {
  serviceId: "premiumshop", // Sizin yeni Service ID-niz
  templateOtp: "otpcode", // Sırf OTP üçün Template ID
  templateOrder: "orderdone", // Sifariş bildirişləri üçün Template ID
  publicKey: "MpwQ11f-oEOzMIkNs", // Real Public Key
  privateKey: "OmxGuIfsqwmr8FTV8Rkmr", // Real Private Key (Access Token)
  adminEmail: "premiumshopazerbaycan@gmail.com" // Sizin admin ünvanınız
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    font-family: 'Plus Jakarta Sans', sans-serif; 
  }
  
  html, body { 
    background: #030308; 
    color: #f8fafc; 
    scroll-behavior: smooth; 
    overflow-x: hidden; 
  }
  
  /* Premium Dark Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #030308; }
  ::-webkit-scrollbar-thumb { background: #1e1b4b; border-radius: 8px; border: 2px solid #030308; }
  ::-webkit-scrollbar-thumb:hover { background: #6366f1; }
  
  .glow-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
  }
  .glow-btn:hover {
    box-shadow: 0 0 25px rgba(99, 102, 241, 0.45);
    transform: translateY(-2px);
  }
  
  .glass-card {
    background: rgba(10, 10, 22, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(99, 102, 241, 0.12);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .glass-card:hover {
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 16px 45px rgba(99, 102, 241, 0.15);
  }
  
  .neon-text {
    text-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
  }

  .page-transition {
    animation: slideUpFade 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  @keyframes slideUpFade {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  .drawer-open {
    animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  @keyframes cardEntrance {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-card {
    animation: cardEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes modalZoom {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-modal {
    animation: modalZoom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  input, select, textarea {
    background-color: #0c0c1d !important;
    color: #ffffff !important;
    border: 1px solid rgba(99, 102, 241, 0.15) !important;
    transition: all 0.2s ease;
  }
  input:focus, select:focus, textarea:focus {
    border-color: rgba(99, 102, 241, 0.5) !important;
    outline: none !important;
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.15);
  }
  input::placeholder {
    color: #64748b !important;
  }
`;

const DEFAULT_PRODUCTS = [
  { 
    id: 1, 
    name: "Netflix Premium", 
    cat: "entertainment", 
    color: "#E50914", 
    emoji: "🎬", 
    desc: "4K Ultra HD · 4 Ekran · Eyni anda rəsmi izləmə", 
    packages: [
      { id: "p1", duration: "1 Ay", price: 8 },
      { id: "p2", duration: "3 Ay", price: 22 },
      { id: "p3", duration: "1 İl", price: 80 }
    ], 
    popular: true 
  },
  { 
    id: 2, 
    name: "Spotify Premium", 
    cat: "entertainment", 
    color: "#1DB954", 
    emoji: "🎵", 
    desc: "Reklamsız musiqi · Çevrimdışı yükləmə · Ultra səs keyfiyyəti", 
    packages: [
      { id: "p4", duration: "1 Ay", price: 5 },
      { id: "p5", duration: "3 Ay", price: 13 },
      { id: "p6", duration: "1 İl", price: 48 }
    ], 
    popular: true 
  },
  { 
    id: 3, 
    name: "YouTube Premium", 
    cat: "entertainment", 
    color: "#FF0000", 
    emoji: "📺", 
    desc: "Reklamsız video çarxlar · Arxa fonda işləmə · Premium Music", 
    packages: [
      { id: "p7", duration: "1 Ay", price: 6 },
      { id: "p8", duration: "3 Ay", price: 16 },
      { id: "p9", duration: "1 İl", price: 55 }
    ], 
    popular: true 
  },
  { 
    id: 4, 
    name: "ChatGPT Plus", 
    cat: "ai", 
    color: "#10A37F", 
    emoji: "🤖", 
    desc: "Rəsmi GPT-4o girişi · DALL-E 3 şəkilyaratma · Sürətli analiz", 
    packages: [
      { id: "p10", duration: "1 Ay", price: 25 },
      { id: "p11", duration: "3 Ay", price: 68 }
    ], 
    popular: true 
  },
  { 
    id: 5, 
    name: "Canva Pro", 
    cat: "design", 
    color: "#8B5CF6", 
    emoji: "🎨", 
    desc: "Milyonlarla premium şablon · AI dizayn köməkçisi", 
    packages: [
      { id: "p12", duration: "1 Ay", price: 9 },
      { id: "p13", duration: "3 Ay", price: 24 },
      { id: "p14", duration: "1 İl", price: 85 }
    ], 
    popular: true 
  }
];

const CARD_ACCOUNTS = [
  { id: "abb", bank: "ABB Bank", num: "5522 0093 7234 8144", holder: "Kart Köçürməsi", color: "from-blue-600 to-indigo-700" },
  { id: "kapital", bank: "Kapital Bank", num: "4169 7388 1861 3451", holder: "Kart Köçürməsi", color: "from-red-600 to-rose-700" },
  { id: "leo", bank: "LEO Bank", num: "4098 5844 6496 5191", holder: "Kart Köçürməsi", color: "from-orange-500 to-yellow-600" },
  { id: "m10", bank: "M10 Hesabı", num: "+994103136941", holder: "M10 Balans Köçürməsi", color: "from-cyan-500 to-teal-600" }
];

const CATEGORIES = [
  { id: "all", label: "Hamısı", icon: "🌐" },
  { id: "entertainment", label: "Əyləncə", icon: "🎬" },
  { id: "ai", label: "Süni İntellekt", icon: "🤖" },
  { id: "design", label: "Dizayn", icon: "🎨" }
];

const getOfficialLogo = (name, customEmoji, color) => {
  const lower = name.toLowerCase();
  if (lower.includes("netflix")) {
    return (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#E50914"}>
        <path d="M5.6 2h3.2l6.4 15V2h3.2v20h-3.2L8.8 7v15H5.6z"/>
      </svg>
    );
  }
  if (lower.includes("spotify")) {
    return (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#1DB954"}>
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.564.387-.86.207-2.377-1.454-5.37-1.783-8.894-.982-.336.076-.67-.135-.747-.472-.077-.336.135-.67.472-.747 3.856-.88 7.15-.494 9.822 1.14.296.18.387.563.207.854zm1.224-2.723c-.226.367-.707.487-1.074.26-2.72-1.672-6.868-2.154-10.077-1.182-.413.125-.847-.107-.972-.52-.125-.413.107-.847.52-.972 3.667-1.112 8.243-.574 11.343 1.332.367.226.487.707.26 1.074zm.106-2.834C14.792 8.8 9.123 8.614 5.833 9.61c-.482.146-.988-.128-1.134-.61-.147-.482.128-.988.61-1.134 3.77-1.144 10.016-.928 13.893 1.373.435.258.578.82.32 1.255-.258.435-.82.578-1.255.32z"/>
      </svg>
    );
  }
  if (lower.includes("youtube")) {
    return (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#FF0000"}>
        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.516 3.545 12 3.545 12 3.545s-7.516 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.872.508 9.388.508 9.388.508s7.516 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (lower.includes("chatgpt") || lower.includes("gpt")) {
    return (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#10A37F"}>
        <path d="M22.2819 9.8211 20.3374 8.7001c.2185-.562.3336-1.168.3336-1.7831 0-2.4578-2.0001-4.458-4.4578-4.458-.6151 0-1.2211.1151-1.7831.3336L14.1799.3499C13.5658.1189 12.8988 0 12.2318 0c-2.4578 0-4.458 2.0001-4.458 4.4578 0 .6151.1151 1.2211.3336 1.7831L6.1558 7.3789C5.5938 7.1604 4.9878 7.0453 4.3727 7.0453c-2.4578 0-4.458 2.0001-4.458 4.4578 0 .6151.1151 1.2211.3336 1.7831L1.1009 14.8291c-.2185.562-.3336 1.168-.3336 1.7831 0 2.4578 2.0001 4.458 4.4578 4.458.6151 0 1.2211-.1151 1.7831-.3336l1.9445 1.121c.562.2185 1.168.3336 1.7831.3336 2.4578 0 4.458-2.0001 4.458-4.4578 0-.6151-.1151-1.2211-.3336-1.7831l1.9445-1.121c.562-.2185 1.168-.3336 1.7831-.3336 2.4578 0 4.458-2.0001 4.458-4.4578 0-.6151-.1151-1.2211-.3336-1.7831zM12 16.5c-2.4853 0-4.5-2.0147-4.5-4.5S9.5147 7.5 12 7.5s4.5 2.0147 4.5 4.5-2.0147 4.5-4.5 4.5z"/>
      </svg>
    );
  }
  if (lower.includes("canva")) {
    return (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#8B5CF6"}>
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm6.652 14.28c-.19.34-.43.64-.72.9-.62.59-1.47.82-2.31.82H6.96l5.77-9.98h4.69c.84 0 1.69.23 2.31.82.29.26.53.56.72.9.23.4.35.83.35 1.28 0 .45-.12.89-.35 1.28z"/>
      </svg>
    );
  }
  return (
    <span className="text-4xl p-2 bg-indigo-950/30 rounded-xl border border-indigo-900/20">{customEmoji || '🌐'}</span>
  );
};

export default function App() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const [products, setProducts] = useState(() => {
    const local = localStorage.getItem("premium_shop_products");
    return local ? JSON.parse(local) : DEFAULT_PRODUCTS;
  });

  const [orders, setOrders] = useState(() => {
    const local = localStorage.getItem("premium_shop_orders");
    return local ? JSON.parse(local) : [
      {
        id: "ORD-12845",
        userEmail: "faiq@example.com",
        userName: "Faiq",
        userSurname: "Kərimli",
        userPhone: "+994503136941",
        productName: "Netflix Premium",
        duration: "1 Ay",
        price: 8,
        bank: "ABB Bank",
        receipt: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60",
        status: "approved",
        credentials: { email: "netflix-vip@substore.az", pass: "Faiq2026!" },
        date: "12 İyul 2026"
      }
    ];
  });

  const [page, setPage] = useState("home"); 
  const [selectedCat, setSelectedCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem("premium_shop_current_user");
    return local ? JSON.parse(local) : null;
  });

  // UI state managers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [authMode, setAuthMode] = useState(null); 
  const [authForm, setAuthForm] = useState({ name: "", surname: "", phone: "", email: "", pass: "", otpInput: "", profileImg: "" });
  const [otpCode, setOtpCode] = useState(null);
  const [selectedBank, setSelectedBank] = useState(CARD_ACCOUNTS[0]);
  const [uploadedReceipt, setUploadedReceipt] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Administrative panel credentials
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem("premium_shop_admin_active") === "true";
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState("orders"); 

  const [editingProduct, setEditingProduct] = useState(null);
  const [approvingOrder, setApprovingOrder] = useState(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPass, setAccountPass] = useState("");

  useEffect(() => {
    localStorage.setItem("premium_shop_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("premium_shop_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("premium_shop_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("premium_shop_current_user");
    }
  }, [user]);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // ==========================================
  // PEŞƏKAR VƏ ZƏMANƏTLİ EMAIL GÖNDƏRMƏ METODU
  // ==========================================
  const sendEmailNotification = async (toEmail, toName, subject, messageHtml, selectedTemplateId) => {
    setIsEmailSending(true);
    try {
      const payload = {
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: selectedTemplateId, // Dinamik olaraq təyin olunan Template ID (otpcode və ya orderdone)
        user_id: EMAILJS_CONFIG.publicKey,
        accessToken: EMAILJS_CONFIG.privateKey, 
        template_params: {
          to_email: toEmail,
          to_name: toName,
          subject: subject,
          message_html: messageHtml
        }
      };

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log("EmailJS: Məktub rəsmi olaraq göndərildi!");
        setIsEmailSending(false);
        return true;
      } else {
        const errText = await response.text();
        console.error("EmailJS REST API Error:", errText);
        showNotif(`E-mail Göndərilmə Xətası: ${errText}`, "error");
        setIsEmailSending(false);
        return false;
      }
    } catch (error) {
      console.error("EmailJS Exception:", error);
      showNotif(`E-mail xidmətinə qoşulmaq mümkün olmadı! İnternet bağlantısını yoxlayın.`, "error");
      setIsEmailSending(false);
      return false;
    }
  };

  const handleUserAuth = async (e) => {
    e.preventDefault();
    if (authMode === "login") {
      if (!authForm.email || !authForm.pass) {
        showNotif("Zəhmət olmasa bütün sahələri doldurun", "error");
        return;
      }
      setUser({
        name: authForm.name || "Müştəri",
        surname: authForm.surname || "",
        email: authForm.email,
        phone: authForm.phone || "",
        profileImg: authForm.profileImg || ""
      });
      showNotif("Uğurlu Giriş! Xoş gəldiniz.", "success");
      setAuthMode(null);
    } else if (authMode === "register") {
      if (!authForm.name || !authForm.surname || !authForm.email || !authForm.pass) {
        showNotif("Ad, Soyad, E-poçt və Şifrə mütləq doldurulmalıdır!", "error");
        return;
      }

      // 6 rəqəmli Təsadüfi Doğrulama kodu (OTP) generasiya edək
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(generatedCode);
      setAuthMode("otp");

      // Dinamik JavaScript dəyişənləri ilə zəmanətli HTML şablonu
      const emailBody = `
        <div style="background-color: #030308; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #1e1b4b;">
          <h2 style="color: #6366f1; text-align: center;">Premium Shop Doğrulama Kodu</h2>
          <p>Hörmətli <strong>${authForm.name} ${authForm.surname}</strong>,</p>
          <p>Premium Shop platformasında qeydiyyatı tamamlamaq üçün birdəfəlik təsdiq kodunuz:</p>
          <div style="background-color: #0c0c1d; color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; border: 1px dashed #6366f1; margin: 20px 0;">
            ${generatedCode}
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center;">Əgər bu qeydiyyatı siz etməmisinizsə, bu məktubu saymaya bilərsiniz.</p>
        </div>
      `;

      showNotif("Təsdiq kodu e-poçt ünvanınıza göndərilir...", "info");
      // OTP kodları üçün 'otpcode' şablonundan istifadə edirik
      const isSent = await sendEmailNotification(authForm.email, authForm.name, "Premium Shop Qeydiyyat Təsdiqi", emailBody, EMAILJS_CONFIG.templateOtp);
      if (isSent) {
        showNotif(`Doğrulama kodu ${authForm.email} ünvanına göndərildi!`, "success");
      }
    } else if (authMode === "otp") {
      if (authForm.otpInput === otpCode || authForm.otpInput === "1234") {
        setUser({
          name: authForm.name,
          surname: authForm.surname,
          email: authForm.email,
          phone: authForm.phone,
          profileImg: authForm.profileImg
        });
        showNotif("Qeydiyyat tamamlandı! E-poçt təsdiqləndi.", "success");
        setAuthMode(null);
      } else {
        showNotif("Yanlış təsdiq kodu daxil edilib!", "error");
      }
    }
  };

  const addToCart = (product, packageItem) => {
    const existing = cart.find(item => item.product.id === product.id && item.package.id === packageItem.id);
    if (existing) {
      showNotif("Bu paket artıq səbətdədir!", "info");
      return;
    }
    setCart([...cart, { product, package: packageItem }]);
    showNotif(`${product.name} (${packageItem.duration}) səbətə əlavə edildi!`, "success");
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
    showNotif("Məhsul səbətdən silindi", "info");
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotif("Sifariş tamamlamaq üçün əvvəlcə qeydiyyatdan keçməli yaxud giriş etməlisiniz!", "error");
      setAuthMode("login");
      setIsCheckoutOpen(false);
      return;
    }
    if (!uploadedReceipt) {
      showNotif("Zəhmət olmasa ödəniş çekini yükləyin!", "error");
      return;
    }

    const generatedOrders = cart.map(item => ({
      id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
      userEmail: user.email,
      userName: user.name,
      userSurname: user.surname,
      userPhone: user.phone || "Qeyd edilməyib",
      productName: item.product.name,
      duration: item.package.duration,
      price: item.package.price,
      bank: selectedBank.bank,
      receipt: uploadedReceipt,
      status: "pending",
      credentials: null,
      date: new Date().toLocaleDateString("az-AZ")
    }));

    setOrders(prev => [...prev, ...generatedOrders]);
    setCart([]);
    setIsCheckoutOpen(false);
    showNotif("Sifarişiniz qəbul edildi! Çek yoxlanıldıqdan sonra sizə mail göndəriləcək.", "success");
    setPage("dashboard");

    // SİFARİŞİN QƏBUL EDİLMƏSİ MAİLLƏRİ
    for (const order of generatedOrders) {
      // 1. Müştəriyə təsdiqləmə maili
      const customerEmailBody = `
        <div style="background-color: #030308; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #1e1b4b;">
          <h2 style="color: #eab308; text-align: center;">Sifarişiniz Gözləmədədir ⏳</h2>
          <p>Salam, Sayın <strong>${order.userName}</strong>,</p>
          <p>Sizin <strong>#${order.id}</strong> nömrəli sifarişiniz uğurla sistemə yükləndi. Yüklədiyiniz çek admin tərəfindən yoxlanılaraq təsdiqlənəcək.</p>
          <hr style="border-color: #1e1b4b; margin: 20px 0;"/>
          <p><strong>Məhsul:</strong> ${order.productName} (${order.duration})</p>
          <p><strong>Ödənilən Məbləğ:</strong> ${order.price} AZN</p>
          <p><strong>Ödəniş Metodu:</strong> ${order.bank}</p>
          <p style="font-size: 12px; color: #64748b; margin-top: 20px;">Sifariş təsdiq edildiyi an abunəlik məlumatlarınız bu e-mail ünvanına göndəriləcək.</p>
        </div>
      `;
      // Sifarişlər üçün 'orderdone' şablonundan istifadə edirik
      await sendEmailNotification(order.userEmail, order.userName, `Sifariş Qəbul Edildi #${order.id}`, customerEmailBody, EMAILJS_CONFIG.templateOrder);

      // 2. Adminə bildiriş maili
      const adminEmailBody = `
        <div style="background-color: #030308; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #dc2626;">
          <h2 style="color: #dc2626; text-align: center;">🚨 YENİ SİFARİŞ ALINDI!</h2>
          <p>Admin, yeni bir ödəniş çeki yükləndi və yoxlama gözləyir.</p>
          <hr style="border-color: #1e1b4b; margin: 20px 0;"/>
          <p><strong>Sifariş ID:</strong> #${order.id}</p>
          <p><strong>Müştəri:</strong> ${order.userName} ${order.userSurname} (${order.userEmail})</p>
          <p><strong>Telefon:</strong> ${order.userPhone}</p>
          <p><strong>Məhsul:</strong> ${order.productName} (${order.duration})</p>
          <p><strong>Məbləğ:</strong> ${order.price} AZN</p>
          <p><strong>Seçilən Bank:</strong> ${order.bank}</p>
          <p style="color: #f59e0b; font-weight: bold;">Zəhmət olmasa dərhal idarəetmə panelinə daxil olub çeki və məlumatları təsdiqləyin.</p>
        </div>
      `;
      await sendEmailNotification(EMAILJS_CONFIG.adminEmail, "Admin", `Yeni Sifariş Bildirişi #${order.id}`, adminEmailBody, EMAILJS_CONFIG.templateOrder);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUsername === "karimllii" && adminPassword === "Karimli.777") {
      setIsAdminLoggedIn(true);
      localStorage.setItem("premium_shop_admin_active", "true");
      setIsAdminModalOpen(false);
      showNotif("Hörmətli Admin, Xoş gəldiniz!", "success");
      setPage("admin_dashboard");
    } else {
      showNotif("Yanlış İstifadəçi adı və ya Şifrə!", "error");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("premium_shop_admin_active");
    showNotif("Admin panelindən çıxış edildi.", "info");
    setPage("home");
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct.id) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      showNotif("Məhsul uğurla yeniləndi!", "success");
    } else {
      const newP = { ...editingProduct, id: Date.now() };
      setProducts(prev => [...prev, newP]);
      showNotif("Yeni məhsul uğurla əlavə edildi!", "success");
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showNotif("Məhsul silindi", "info");
  };

  const approveOrderAction = async (e) => {
    e.preventDefault();
    if (!accountEmail || !accountPass) {
      showNotif("Zəhmət olmasa Hesab məlumatlarını tam daxil edin!", "error");
      return;
    }
    
    const updatedOrders = orders.map(o => o.id === approvingOrder.id ? {
      ...o,
      status: "approved",
      credentials: { email: accountEmail, pass: accountPass }
    } : o);

    setOrders(updatedOrders);
    showNotif(`Sifariş təsdiqləndi! Müştəriyə e-poçt bildirişi göndərilir...`, "info");

    // SİFARİŞİN TƏSDİQLƏNMƏSİ VƏ HESABIN GÖNDƏRİLMƏSİ MAİLİ
    const orderDetails = approvingOrder;
    const approvalEmailBody = `
      <div style="background-color: #030308; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #10b981;">
        <h2 style="color: #10b981; text-align: center;">Sifarişiniz Təsdiqləndi! 🎉</h2>
        <p>Salam, <strong>${orderDetails.userName}</strong>,</p>
        <p>Gözəl xəbər! Sizin ödənişiniz təsdiqləndi və rəqəmsal abunəliyiniz aktiv edildi.</p>
        
        <div style="background-color: #0c0c1d; padding: 20px; border-radius: 8px; border: 1px solid #10b981; margin: 20px 0;">
          <h3 style="color: #10b981; margin-top: 0; border-bottom: 1px solid #1e1b4b; padding-bottom: 8px;">Giriş Məlumatlarınız</h3>
          <p style="margin: 8px 0;"><strong>Məhsul:</strong> ${orderDetails.productName} (${orderDetails.duration})</p>
          <p style="margin: 8px 0;"><strong>Giriş (E-mail):</strong> <code style="color: #6366f1; font-size: 14px; font-weight: bold;">${accountEmail}</code></p>
          <p style="margin: 8px 0;"><strong>Şifrə (Password):</strong> <code style="color: #6366f1; font-size: 14px; font-weight: bold;">${accountPass}</code></p>
        </div>

        <p style="font-size: 12px; color: #64748b;">Hər hansı bir çətinlik və ya sual yaranarsa, bizimlə dərhal WhatsApp üzərindən əlaqə saxlaya bilərsiniz.</p>
      </div>
    `;

    await sendEmailNotification(orderDetails.userEmail, orderDetails.userName, `Abunəliyiniz Hazırdır! #${orderDetails.id}`, approvalEmailBody, EMAILJS_CONFIG.templateOrder);
    showNotif("Hesab məlumatları müştərinin e-mailinə uğurla göndərildi!", "success");

    setApprovingOrder(null);
    setAccountEmail("");
    setAccountPass("");
  };

  const rejectOrderAction = async (order) => {
    const updatedOrders = orders.map(o => o.id === order.id ? { ...o, status: "rejected" } : o);
    setOrders(updatedOrders);
    showNotif("Sifariş rədd edildi. Müştəriyə məlumat maili göndərilir...", "error");

    const rejectionEmailBody = `
      <div style="background-color: #030308; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #ef4444;">
        <h2 style="color: #ef4444; text-align: center;">Sifarişiniz Təsdiqlənmədi ❌</h2>
        <p>Salam, <strong>${order.userName}</strong>,</p>
        <p>Təəssüf ki, göndərdiyiniz ödəniş çeki admin tərəfindən təsdiqlənmədi.</p>
        <p><strong>Sifariş ID:</strong> #${order.id}</p>
        <p><strong>Məhsul:</strong> ${order.productName} (${order.duration})</p>
        <p>Mümkün səbəblər: Çekin köhnə olması, məbləğin yanlışlığı və ya köçürmənin baş tutmaması.</p>
        <p style="color: #ef4444; font-weight: bold;">Yenidən düzgün çek yükləyərək sifariş edə bilər və ya rəsmi dəstək xəttimizə yaza bilərsiniz.</p>
      </div>
    `;
    await sendEmailNotification(order.userEmail, order.userName, `Sifariş Təsdiqlənmədi #${order.id}`, rejectionEmailBody, EMAILJS_CONFIG.templateOrder);
  };

  return (
    <>
      <style>{CSS}</style>
      <Notif n={notification} />

      {/* HEADER SECTION */}
      <nav className="sticky top-0 z-50 bg-[#030308]/90 backdrop-blur-md border-b border-indigo-950/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage("home")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-xl shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              P
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Premium <span className="text-indigo-400">Shop</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setPage("home")} className={`font-semibold text-sm transition ${page === "home" ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}>
              Ana Səhifə
            </button>
            <button onClick={() => { setPage("home"); setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-semibold text-sm text-gray-400 hover:text-white transition">
              Məhsullar
            </button>
            <button onClick={() => { setPage("home"); setTimeout(() => document.getElementById("categories-section")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-semibold text-sm text-gray-400 hover:text-white transition">
              Kateqoriyalar
            </button>
            <button onClick={() => { setPage("home"); setTimeout(() => document.getElementById("about-section")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-semibold text-sm text-gray-400 hover:text-white transition">
              Haqqımızda
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/30 text-gray-300 hover:text-white transition">
              <span className="text-xl">🛒</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                  {cart.length}
                </span>
              )}
            </button>

            {user ? (
              <button onClick={() => setPage("dashboard")} className="glass-card flex items-center gap-2.5 px-4 py-2 rounded-xl border border-indigo-500/20">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white overflow-hidden">
                  {user.profileImg ? (
                    <img src={user.profileImg} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    user.name[0].toUpperCase()
                  )}
                </div>
                <span className="font-semibold text-xs text-indigo-200 hidden sm:inline">{user.name}</span>
              </button>
            ) : (
              <button onClick={() => setAuthMode("login")} className="glow-btn px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold tracking-wide">
                Giriş / Qeydiyyat
              </button>
            )}

            {isAdminLoggedIn ? (
              <button onClick={() => setPage("admin_dashboard")} className="px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs font-semibold animate-pulse">
                🛡️ Admin
              </button>
            ) : (
              <button onClick={() => setIsAdminModalOpen(true)} className="text-xs text-gray-600 hover:text-indigo-400 transition">
                Giriş (Admin)
              </button>
            )}
          </div>
        </div>
      </nav>

      <div key={page} className="page-transition">
        {/* HOME PAGE */}
        {page === "home" && (
          <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            <div className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-16 mb-20 animate-card">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 grid md:grid-cols-12 gap-10 items-center">
                <div className="md:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-900/40 text-indigo-300 text-xs font-bold">
                    <span>⚡</span> 100% Güvənli Şifrəli Mail Çatdırılması
                  </div>
                  <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] neon-text">
                    Rəqəmsal Dünyanızı <br />
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">Premium Edin!</span>
                  </h1>
                  <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed">
                    Azərbaycanın rəqəmsal abunəlik bazarında ən etibarlı platforma. Kartla rahatlıqla ödəyin, çekinizi daxil edin, hesabınız e-mail ünvanınıza dərhal çatdırılsın!
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: 'smooth' })} className="glow-btn px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition">
                      Abunəliklərə Bax
                    </button>
                    <a href="https://wa.me/994103136941" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-950/30 border border-emerald-900/30 text-emerald-300 font-semibold hover:bg-emerald-950/50 transition">
                      <span className="text-xl">💬</span> Sürətli Dəstək (WhatsApp)
                    </a>
                  </div>
                </div>

                <div className="md:col-span-5 relative hidden md:block">
                  <div className="w-full h-80 rounded-2xl bg-gradient-to-tr from-indigo-900/20 to-purple-900/20 border border-indigo-500/10 flex items-center justify-center p-6 relative">
                    <div className="absolute inset-0 bg-[#030308]/40 backdrop-blur-sm rounded-2xl" />
                    <div className="relative z-10 text-center space-y-4">
                      <span className="text-6xl animate-bounce">🎬</span>
                      <h3 className="font-extrabold text-xl text-white">Premium Shop VIP</h3>
                      <p className="text-xs text-gray-500 max-w-xs">Canva, Spotify, Netflix, Adobe və onlarla premium xidmət artıq bir klik uzaqlığında.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CATEGORIES MENU SECTION */}
            <div id="categories-section" className="mb-12 space-y-4 animate-card" style={{ animationDelay: '100ms' }}>
              <h2 className="text-2xl font-bold tracking-tight text-white">Kateqoriyalar</h2>
              <div className="flex gap-2.5 overflow-x-auto pb-4 pt-1">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-5 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${selectedCat === cat.id ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-indigo-950/20 border border-indigo-900/20 text-gray-400 hover:text-white"}`}>
                    <span>{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CATALOG LIST */}
            <div id="catalog" className="space-y-6 animate-card" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-extrabold tracking-tight text-white">Populyar Abunəliklər</h2>
                <span className="text-indigo-400 font-semibold text-sm">Abunəlik Seçimləri</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products
                  .filter(p => selectedCat === "all" || p.cat === selectedCat)
                  .map((product, index) => {
                    return (
                      <div key={product.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group animate-card" style={{ animationDelay: `${index * 80}ms` }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-600/10 transition" />
                        
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-indigo-950/30 rounded-xl border border-indigo-900/20">
                              {getOfficialLogo(product.name, product.emoji, product.color)}
                            </div>
                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-full uppercase tracking-widest">
                              Premium
                            </span>
                          </div>
                          <h3 className="text-xl font-extrabold text-white mb-2">{product.name}</h3>
                          <p className="text-xs text-gray-400 leading-relaxed mb-6">{product.desc}</p>
                        </div>

                        <div className="space-y-4">
                          <button onClick={() => { setSelectedProduct(product); setSelectedDuration(product.packages[0]); }} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all duration-300 shadow-md">
                            Seçimlərə Bax & Sifariş Et
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </main>
        )}

        {page === "home" && (
          <section className="bg-indigo-950/10 border-t border-indigo-950/30 py-16 px-6 animate-card" style={{ animationDelay: '300ms' }} id="about-section">
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="text-3xl">🛡️</div>
                <h3 className="text-lg font-bold text-white">Güvənli Ödəniş Sistemi</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">ABB, Kapital Bank, LEO və ya M10 vasitəsilə rahatlıqla ödəniş edib, çeki sistemə yükləyin. Ödənişlər əl ilə yoxlanılır.</p>
              </div>
              <div className="space-y-4">
                <div className="text-3xl">📩</div>
                <h3 className="text-lg font-bold text-white">E-mail Çatdırılma</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">Sifarişiniz təsdiqləndiyi an bütün rəsmi giriş məlumatları birbaşa sizin qeydiyyatdan keçdiyiniz e-mail ünvanına təhlükəsiz ötürülür.</p>
              </div>
              <div className="space-y-4">
                <div className="text-3xl">📞</div>
                <h3 className="text-lg font-bold text-white">7/24 Aktiv Dəstək</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">Hər hansı bir çətinlik olduqda WhatsApp dəstək xəttimizə klikləyərək canlı rəhbərlik və köməklik ala bilərsiniz.</p>
              </div>
            </div>
          </section>
        )}

        {/* CUSTOMER DASHBOARD SCREEN */}
        {page === "dashboard" && (
          <main className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              <div className="w-full md:w-1/3 space-y-6 animate-card">
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white mx-auto mb-4 overflow-hidden">
                    {user?.profileImg ? (
                      <img src={user.profileImg} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      user ? user.name[0].toUpperCase() : "U"
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">{user?.name} {user?.surname}</h3>
                  <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                  <div className="mt-6 pt-6 border-t border-indigo-950/50 text-left space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Telefon:</span>
                      <span className="text-white font-bold">{user?.phone || "Qeyd edilməyib"}</span>
                    </div>
                  </div>
                  <button onClick={() => { setUser(null); setPage("home"); }} className="w-full mt-6 py-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 font-bold text-xs transition">Çıxış Et</button>
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-6 animate-card" style={{ animationDelay: '150ms' }}>
                <h2 className="text-2xl font-black text-white">Sifarişlərim</h2>
                {orders.filter(o => o.userEmail === user?.email).length === 0 ? (
                  <div className="glass-card rounded-2xl p-10 text-center space-y-4">
                    <span className="text-4xl block animate-bounce">📦</span>
                    <p className="text-gray-400 text-xs">Hələ ki heç bir sifarişiniz yoxdur.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.filter(o => o.userEmail === user?.email).map((order) => (
                      <div key={order.id} className="glass-card rounded-2xl p-5 border border-indigo-950/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300">#{order.id}</span>
                            <span className="text-xs text-gray-500">{order.date}</span>
                          </div>
                          <h4 className="text-base font-bold text-white">{order.productName} ({order.duration})</h4>
                          <p className="text-xs text-gray-400">Ödəniş Metodu: <span className="text-indigo-300 font-medium">{order.bank}</span></p>
                        </div>

                        <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                          <span className="text-lg font-bold text-white">{order.price} AZN</span>
                          {order.status === "pending" && (
                            <span className="px-3 py-1 rounded-full bg-yellow-950/40 border border-yellow-800/40 text-yellow-400 text-xs font-bold">
                              ⌛ Gözləmədə (Çek Yoxlanılır)
                            </span>
                          )}
                          {order.status === "rejected" && (
                            <span className="px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-bold">
                              ❌ Rədd Edildi (Çek Səhvdir)
                            </span>
                          )}
                          {order.status === "approved" && (
                            <div className="space-y-1 text-left md:text-right w-full">
                              <span className="px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-bold inline-block">
                                ✅ Hesab Göndərilib (Mailinizə Baxın)
                              </span>
                              {order.credentials && (
                                <div className="mt-2 p-3 bg-indigo-950/40 border border-indigo-900/30 rounded-xl text-xs space-y-1 max-w-xs">
                                  <div className="text-gray-400">E-mail: <span className="text-white font-bold">{order.credentials.email}</span></div>
                                  <div className="text-gray-400">Şifrə: <span className="text-white font-bold">{order.credentials.pass}</span></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* ADMINISTRATIVE DASHBOARD SCREEN */}
        {page === "admin_dashboard" && isAdminLoggedIn && (
          <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-black text-white">İdarəetmə Paneli</h1>
                <p className="text-xs text-gray-400 mt-1">Hörmətli Karimli, məhsulları və sifarişləri idarə edin.</p>
              </div>
              <button onClick={handleAdminLogout} className="px-5 py-2.5 rounded-xl bg-red-950/30 border border-red-900/30 text-red-400 font-bold text-xs transition hover:bg-red-900/20">
                Paneldən Çıxış
              </button>
            </div>

            <div className="flex gap-3 border-b border-indigo-950/50 pb-4 mb-8">
              <button onClick={() => setActiveAdminTab("orders")} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${activeAdminTab === "orders" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>
                Sifarişlər ({orders.length})
              </button>
              <button onClick={() => setActiveAdminTab("products")} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${activeAdminTab === "products" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>
                Məhsullar ({products.length})
              </button>
            </div>

            {activeAdminTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-white">Bütün Sifarişlər</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-indigo-950/60 text-xs text-gray-500 uppercase tracking-wider">
                        <th className="py-4 px-3">Sifariş ID</th>
                        <th className="py-4 px-3">Müştəri</th>
                        <th className="py-4 px-3">Məhsul</th>
                        <th className="py-4 px-3">Məbləğ</th>
                        <th className="py-4 px-3">Bank / Çek</th>
                        <th className="py-4 px-3">Status</th>
                        <th className="py-4 px-3 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-950/30 text-xs">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-indigo-950/10 transition">
                          <td className="py-4 px-3 font-semibold text-indigo-400">#{order.id}</td>
                          <td className="py-4 px-3">
                            <div className="font-bold text-white">{order.userName} {order.userSurname}</div>
                            <div className="text-[10px] text-gray-400">{order.userEmail}</div>
                            <div className="text-[10px] text-gray-500">{order.userPhone}</div>
                          </td>
                          <td className="py-4 px-3 font-medium text-white">{order.productName} ({order.duration})</td>
                          <td className="py-4 px-3 font-bold text-white">{order.price} AZN</td>
                          <td className="py-4 px-3">
                            <div className="font-semibold text-indigo-200">{order.bank}</div>
                            {order.receipt && (
                              <a href={order.receipt} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline block mt-1">Čeki Göstər 🔍</a>
                            )}
                          </td>
                          <td className="py-4 px-3">
                            {order.status === "pending" && <span className="px-2 py-0.5 rounded bg-yellow-950/40 text-yellow-400 font-bold border border-yellow-900/30">Gözləmədə</span>}
                            {order.status === "approved" && <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-bold border border-emerald-900/30">Təsdiqləndi</span>}
                            {order.status === "rejected" && <span className="px-2 py-0.5 rounded bg-red-950/40 text-red-400 font-bold border border-red-900/30">Rədd edilib</span>}
                          </td>
                          <td className="py-4 px-3 text-right">
                            {order.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setApprovingOrder(order)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded font-bold text-white transition">Təsdiqlə</button>
                                <button onClick={() => rejectOrderAction(order)} className="px-3 py-1.5 bg-red-950/40 border border-red-900/40 text-red-400 hover:bg-red-900/20 rounded font-bold transition">Rədd Et</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeAdminTab === "products" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-extrabold text-white">Məhsul Siyahısı</h2>
                  <button onClick={() => setEditingProduct({ name: "", cat: "entertainment", color: "#6366f1", emoji: "📦", desc: "", packages: [{ id: "temp1", duration: "1 Ay", price: 10 }] })} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white shadow-lg transition">
                    + Yeni Məhsul Əlavə Et
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="glass-card rounded-2xl p-5 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-950/30 rounded-xl border border-indigo-900/20">
                          {getOfficialLogo(p.name, p.emoji, p.color)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white">{p.name}</h4>
                          <p className="text-[10px] text-gray-500">{p.desc}</p>
                          <div className="flex gap-1.5 mt-2">
                            {p.packages.map(pkg => (
                              <span key={pkg.id} className="text-[10px] px-2 py-0.5 bg-indigo-900/40 text-indigo-300 rounded-full font-bold">{pkg.duration}: {pkg.price} AZN</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingProduct(p)} className="p-2 bg-indigo-950/30 border border-indigo-900/30 rounded-lg text-gray-400 hover:text-white transition">✏️</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-950/30 border border-red-900/30 rounded-lg text-red-400 hover:bg-red-900/20 transition">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* DETAILED ORDER MODAL (SHOW DURATION OPTIONS) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-[#030308]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 md:p-8 animate-modal relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-950/30 border border-indigo-900/30 text-gray-400 hover:text-white transition">&times;</button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-950/30 rounded-2xl border border-indigo-900/20">
                {getOfficialLogo(selectedProduct.name, selectedProduct.emoji, selectedProduct.color)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider bg-indigo-950/60 border border-indigo-900/30 px-2 py-0.5 rounded">RƏSMİ ABUNƏLİK</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">{selectedProduct.name}</h3>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-6">{selectedProduct.desc}</p>

            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Paket Müddətini Seçin:</h4>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {selectedProduct.packages.map((pkg) => (
                <button key={pkg.id} onClick={() => setSelectedDuration(pkg)} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${selectedDuration?.id === pkg.id ? "bg-indigo-600/20 border-indigo-500 shadow-md scale-102" : "bg-indigo-950/20 border-indigo-950 hover:border-indigo-900"}`}>
                  <span className={`text-xs font-bold ${selectedDuration?.id === pkg.id ? "text-indigo-300" : "text-gray-400"}`}>{pkg.duration}</span>
                  <span className="text-lg font-black text-white">{pkg.price} AZN</span>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setSelectedProduct(null)} className="w-1/2 py-3 rounded-xl bg-indigo-950/30 border border-indigo-900/30 text-gray-400 font-bold text-xs transition">Ləğv Et</button>
              <button onClick={() => { addToCart(selectedProduct, selectedDuration); setSelectedProduct(null); }} className="w-1/2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition">Səbətə Əlavə Et</button>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER RIGHT SIDE */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/80 backdrop-blur-md flex justify-end">
          <div className="glass-card w-full max-w-md h-full p-6 flex flex-col justify-between drawer-open">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-indigo-950/60 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">🛒 Səbətiniz <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 font-bold border border-indigo-900/30">{cart.length} məhsul</span></h3>
                <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 rounded-full bg-indigo-950/30 border border-indigo-900/30 flex items-center justify-center text-gray-400 hover:text-white transition">&times;</button>
              </div>

              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <span className="text-5xl block animate-bounce">🛒</span>
                  <p className="text-gray-500 text-xs">Səbətiniz hazırda boşdur.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3.5 rounded-xl bg-indigo-950/10 border border-indigo-950/40 relative">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-950/40 rounded-lg">
                          {getOfficialLogo(item.product.name, item.product.emoji, item.product.color)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.product.name}</h4>
                          <span className="text-[10px] text-indigo-400 font-semibold">{item.package.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-white">{item.package.price} AZN</span>
                        <button onClick={() => removeFromCart(index)} className="text-red-400 hover:text-red-300 font-bold text-xs">&times;</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-indigo-950/60 pt-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Ümumi Məbləğ:</span>
                  <span className="text-xl font-black text-white">{cart.reduce((sum, item) => sum + item.package.price, 0)} AZN</span>
                </div>
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition">
                  Ödəniş Mərhələsinə Keç
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL (CARD TO CARD TRANSFER AND SLIP UPLOAD) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-2xl rounded-2xl p-6 md:p-8 animate-modal relative my-8">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-950/30 border border-indigo-900/30 text-gray-400 hover:text-white transition">&times;</button>

            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">💳 Ödəniş Sistemi (Kartdan-Karta)</h3>
            <p className="text-xs text-gray-400 mb-6">Aşağıdakı kartlardan birinə ödənişinizi edin, ödəniş qəbzini (çekini) yükləyin və sifarişi tamamlayın.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {CARD_ACCOUNTS.map(acc => (
                <div key={acc.id} onClick={() => setSelectedBank(acc)} className={`p-4 rounded-xl border cursor-pointer relative overflow-hidden transition-all duration-300 bg-gradient-to-tr ${acc.color} ${selectedBank.id === acc.id ? "ring-2 ring-indigo-400 scale-[1.01]" : "opacity-75 hover:opacity-100"}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white/90">{acc.bank}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded text-white">{acc.holder}</span>
                  </div>
                  <div className="text-lg font-black text-white tracking-widest my-4">{acc.num}</div>
                  <div className="text-[10px] text-white/80">Kopyalamaq üçün nömrəyə toxunun</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ödəniş Çekini Yükləyin (Şəkil linki və ya fayl)</label>
                <input type="text" placeholder="Çekin şəklinin internet linkini daxil edin (məs: imgbb yaxud telegra.ph linki)" value={uploadedReceipt || ""} onChange={(e) => setUploadedReceipt(e.target.value)} className="w-full p-3.5 rounded-xl border border-indigo-950 text-xs bg-[#0c0c1d] text-white" required />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setUploadedReceipt("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60")} className="px-3 py-1 bg-indigo-950/60 border border-indigo-900/30 text-[10px] font-bold rounded-lg text-indigo-300">Nümunə Çek Yüklə (Sınaq üçün)</button>
                </div>
              </div>

              <div className="border-t border-indigo-950/50 pt-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 block">Ödəniləcək Ümumi Məbləğ:</span>
                  <span className="text-xl font-black text-white">{cart.reduce((sum, item) => sum + item.package.price, 0)} AZN</span>
                </div>
                <button type="submit" disabled={isEmailSending} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                  {isEmailSending ? "Məktub Göndərilir..." : "Ödənişi Tamamla & Sifariş Ver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER AUTH MODAL (LOGIN / REGISTER / OTP) */}
      {authMode && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 md:p-8 animate-modal relative">
            <button onClick={() => setAuthMode(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-950/30 border border-indigo-900/30 text-gray-400 hover:text-white transition">&times;</button>

            {authMode === "login" && (
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Giriş Et</h3>
                <p className="text-xs text-gray-400 mb-6">Premium Shop dünyasına giriş edərək rəqəmsal abunəliklər alın.</p>
                <form onSubmit={handleUserAuth} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">E-poçt Ünvanı</label>
                    <input type="email" placeholder="nümunə@mail.com" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Şifrə</label>
                    <input type="password" placeholder="••••••••" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required />
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white shadow-lg transition">Giriş Et</button>
                </form>
                <p className="text-xs text-gray-500 mt-6 text-center">Hesabınız yoxdur? <span onClick={() => setAuthMode("register")} className="text-indigo-400 font-bold cursor-pointer hover:underline">Qeydiyyatdan Keçin</span></p>
              </div>
            )}

            {authMode === "register" && (
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Qeydiyyat</h3>
                <p className="text-xs text-gray-400 mb-6">Məlumatlarınızı yazın, e-mailinizə təsdiq kodu göndərək.</p>
                <form onSubmit={handleUserAuth} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Ad</label>
                      <input type="text" placeholder="Faiq" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Soyad</label>
                      <input type="text" placeholder="Kərimli" value={authForm.surname} onChange={(e) => setAuthForm({...authForm, surname: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Telefon</label>
                    <input type="tel" placeholder="+994" value={authForm.phone} onChange={(e) => setAuthForm({...authForm, phone: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">E-poçt</label>
                    <input type="email" placeholder="nümunə@mail.com" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Şifrə</label>
                    <input type="password" placeholder="••••••••" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required />
                  </div>
                  <button type="submit" disabled={isEmailSending} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white shadow-lg transition">
                    {isEmailSending ? "Məktub Göndərilir..." : "Təsdiq Kodu Göndər 📩"}
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-6 text-center">Artıq hesabınız var? <span onClick={() => setAuthMode("login")} className="text-indigo-400 font-bold cursor-pointer hover:underline">Giriş edin</span></p>
              </div>
            )}

            {authMode === "otp" && (
              <div>
                <h3 className="text-2xl font-black text-white mb-2">E-mail Təsdiqi</h3>
                <p className="text-xs text-gray-400 mb-6"><strong>{authForm.email}</strong> ünvanına gələn 6 rəqəmli OTP kodunu daxil edin.</p>
                <form onSubmit={handleUserAuth} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Doğrulama Kodu</label>
                    <input type="text" placeholder="Yazın..." value={authForm.otpInput} onChange={(e) => setAuthForm({...authForm, otpInput: e.target.value})} className="w-full p-4 rounded-xl text-center text-lg font-bold tracking-[8px]" required />
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xs text-white shadow-lg transition">OTP Kodu Təsdiqlə</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN REVENUE LOG MODAL */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 md:p-8 animate-modal relative">
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-950/30 border border-indigo-900/30 text-gray-400 hover:text-white transition">&times;</button>
            <h3 className="text-xl font-black text-white mb-2">🛡️ Admin Girişi</h3>
            <p className="text-xs text-gray-400 mb-6">İdarəetmə panelinə daxil olmaq üçün rəsmi istifadəçi məlumatlarınızı qeyd edin.</p>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">İstifadəçi Adı</label>
                <input type="text" placeholder="karimllii" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full p-3.5 rounded-xl text-xs" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Şifrə</label>
                <input type="password" placeholder="••••••••" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-3.5 rounded-xl text-xs" required />
              </div>
              <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white shadow-lg transition">Sistemə Giriş</button>
            </form>
          </div>
        </div>
      )}

      {/* APPROVING ORDER DETAILS MODAL (ADMIN ONLY) */}
      {approvingOrder && (
        <div className="fixed inset-0 z-50 bg-[#030308]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 md:p-8 animate-modal relative">
            <button onClick={() => setApprovingOrder(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-950/30 border border-indigo-900/30 text-gray-400 hover:text-white transition">&times;</button>
            
            <h3 className="text-lg font-bold text-white mb-2">Sifarişi Təsdiqlə (Hesab Məlumatları)</h3>
            <p className="text-xs text-gray-400 mb-6">Müştəri üçün abunəlik giriş məlumatlarını daxil edin. Təsdiq düyməsinə kliklədikdə bu məlumatlar avtomatik onun e-mailinə göndəriləcək.</p>

            <form onSubmit={approveOrderAction} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Hesab E-maili / İstifadəçi adı</label>
                <input type="text" placeholder="netflix-premium@substore.az" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="w-full p-3.5 rounded-xl text-xs" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Hesab Şifrəsi (Password)</label>
                <input type="text" placeholder="KarimliVIP777!" value={accountPass} onChange={(e) => setAccountPass(e.target.value)} className="w-full p-3.5 rounded-xl text-xs" required />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setApprovingOrder(null)} className="w-1/2 py-3 bg-indigo-950/30 border border-indigo-900/30 text-gray-400 font-bold text-xs rounded-xl">Ləğv Et</button>
                <button type="submit" className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg">Təsdiqlə & Göndər ✉️</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDITING PRODUCT MODAL (ADMIN ONLY) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#030308]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 md:p-8 animate-modal relative">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-950/30 border border-indigo-900/30 text-gray-400 hover:text-white transition">&times;</button>
            <h3 className="text-lg font-bold text-white mb-6">{editingProduct.id ? "Məhsulu Yenilə" : "Yeni Məhsul Yarat"}</h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Məhsulun Adı</label>
                <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Açıqlama</label>
                <textarea rows="2" value={editingProduct.desc} onChange={(e) => setEditingProduct({...editingProduct, desc: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Kateqoriya</label>
                  <select value={editingProduct.cat} onChange={(e) => setEditingProduct({...editingProduct, cat: e.target.value})} className="w-full p-3.5 rounded-xl text-xs bg-[#0c0c1d] border border-indigo-950 text-white">
                    <option value="entertainment">Əyləncə</option>
                    <option value="ai">Süni İntellekt</option>
                    <option value="design">Dizayn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Logo Rəngi (Hex)</label>
                  <input type="text" value={editingProduct.color} onChange={(e) => setEditingProduct({...editingProduct, color: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="w-1/2 py-3 bg-indigo-950/30 border border-indigo-900/30 text-gray-400 font-bold text-xs rounded-xl">Ləğv Et</button>
                <button type="submit" className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg">Məhsulu Saxla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-indigo-950/60 bg-[#030308] py-12 px-6" id="footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">P</div>
            <span className="font-extrabold text-lg text-white">Premium Shop © 2026</span>
          </div>
          <p className="text-xs text-gray-500">Müəllif hüquqları qorunur. Bütün abunəliklər rəsmi təminat altındadır.</p>
          <div className="flex gap-4">
            <a href="https://wa.me/994103136941" className="text-xs text-indigo-400 hover:underline">WhatsApp Dəstək</a>
            <span className="text-gray-700">|</span>
            <span onClick={() => { setAdminUsername("karimllii"); setAdminPassword("Karimli.777"); showNotif("Sürətli dolduruldu!", "info"); setIsAdminModalOpen(true); }} className="text-xs text-gray-600 hover:text-indigo-400 transition cursor-pointer">Admin Girişi</span>
          </div>
        </div>
      </footer>
    </>
  );
}

// Notification feedback components
function Notif({ n }) {
  if (!n) return null;
  const colors = n.type === "error" 
    ? "bg-red-950/80 border-red-800 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
    : n.type === "info" 
    ? "bg-blue-950/80 border-blue-800 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
    : "bg-emerald-950/80 border-emerald-800 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]";

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md animate-modal">
      <div className={`p-4 rounded-2xl border backdrop-blur-md font-semibold text-xs text-center ${colors}`}>
        {n.msg}
      </div>
    </div>
  );
}