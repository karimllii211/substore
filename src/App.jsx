import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ⚠️ YENİ VƏ REAL EMAILJS KONFİQURASİYASI
// =========================================================================
const EMAILJS_CONFIG = {
  serviceId: "premiumshop",
  templateOtp: "otpcode",
  templateOrder: "orderdone",
  publicKey: "MpwQ11f-oEOzMIkNs",
  privateKey: "OmxGuIfsqwmr8FTV8Rkmr",
  adminEmail: "premiumshopazerbaycan@gmail.com"
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
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #030308; }
  ::-webkit-scrollbar-thumb { background: #1e1b4b; border-radius: 8px; border: 2px solid #030308; }
  ::-webkit-scrollbar-thumb:hover { background: #6366f1; }

  /* Hide scrollbar for slider */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  
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

  .page-transition { animation: slideUpFade 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  
  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .drawer-open { animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  
  .animate-card { animation: cardEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes cardEntrance {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-modal { animation: modalZoom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes modalZoom {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .spinner {
    width: 20px; height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .success-check {
    width: 60px; height: 60px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background-color: #10b981; color: white;
    font-size: 30px; margin: 0 auto;
    animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    80% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
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
  input::placeholder { color: #64748b !important; }
`;

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Netflix Premium", cat: "entertainment", color: "#E50914", emoji: "🎬", desc: "4K Ultra HD · 4 Ekran · Eyni anda rəsmi izləmə", packages: [{ id: "p1", duration: "1 Ay", price: 8 }, { id: "p2", duration: "3 Ay", price: 22 }, { id: "p3", duration: "1 İl", price: 80 }], popular: true },
  { id: 2, name: "Spotify Premium", cat: "entertainment", color: "#1DB954", emoji: "🎵", desc: "Reklamsız musiqi · Çevrimdışı yükləmə · Ultra səs keyfiyyəti", packages: [{ id: "p4", duration: "1 Ay", price: 5 }, { id: "p5", duration: "3 Ay", price: 13 }, { id: "p6", duration: "1 İl", price: 48 }], popular: true },
  { id: 3, name: "YouTube Premium", cat: "entertainment", color: "#FF0000", emoji: "📺", desc: "Reklamsız video çarxlar · Arxa fonda işləmə · Premium Music", packages: [{ id: "p7", duration: "1 Ay", price: 6 }, { id: "p8", duration: "3 Ay", price: 16 }, { id: "p9", duration: "1 İl", price: 55 }], popular: true },
  { id: 4, name: "ChatGPT Plus", cat: "ai", color: "#10A37F", emoji: "🤖", desc: "Rəsmi GPT-4o girişi · DALL-E 3 şəkilyaratma · Sürətli analiz", packages: [{ id: "p10", duration: "1 Ay", price: 25 }, { id: "p11", duration: "3 Ay", price: 68 }], popular: true },
  { id: 5, name: "Canva Pro", cat: "design", color: "#8B5CF6", emoji: "🎨", desc: "Milyonlarla premium şablon · AI dizayn köməkçisi", packages: [{ id: "p12", duration: "1 Ay", price: 9 }, { id: "p13", duration: "3 Ay", price: 24 }, { id: "p14", duration: "1 İl", price: 85 }], popular: true }
];

const BankLogos = {
  ABB: () => <svg viewBox="0 0 100 30" className="h-6" fill="#fff"><text x="0" y="24" fontFamily="Arial" fontWeight="900" fontSize="26" letterSpacing="-1">ABB</text></svg>,
  Kapital: () => <svg viewBox="0 0 150 30" className="h-6" fill="#fff"><path d="M12 2L15 9H22L16 14L18 21L12 17L6 21L8 14L2 9H9L12 2Z" fill="#fff"/><text x="28" y="20" fontFamily="Arial" fontWeight="bold" fontSize="18">Kapital Bank</text></svg>,
  LEO: () => <svg viewBox="0 0 100 30" className="h-6" fill="#fff"><text x="0" y="22" fontFamily="Arial" fontWeight="900" fontSize="24" letterSpacing="1">leo</text><circle cx="50" cy="14" r="4" fill="#fbbf24"/></svg>,
  M10: () => <svg viewBox="0 0 100 30" className="h-6" fill="#fff"><rect width="36" height="24" rx="8" fill="#fff"/><text x="4" y="18" fill="#0d9488" fontFamily="Arial" fontWeight="900" fontSize="16">m10</text></svg>
};

const CARD_ACCOUNTS = [
  { id: "kapital", bank: "Kapital Bank", logo: BankLogos.Kapital, num: "4169 7388 1861 3451", holder: "Faiq Kərimli", color: "from-red-600 to-red-800", bg: "bg-red-700" },
  { id: "abb", bank: "ABB", logo: BankLogos.ABB, num: "5522 0093 7234 8144", holder: "Faiq Kərimli", color: "from-blue-600 to-blue-800", bg: "bg-blue-700" },
  { id: "leo", bank: "LEO Bank", logo: BankLogos.LEO, num: "4098 5844 6496 5191", holder: "Faiq Kərimli", color: "from-zinc-800 to-black", bg: "bg-black" },
  { id: "m10", bank: "M10", logo: BankLogos.M10, num: "+994 10 313 69 41", holder: "M10 Balans", color: "from-teal-500 to-teal-700", bg: "bg-teal-600" }
];

const CATEGORIES = [
  { id: "all", label: "Hamısı", icon: "🌐" },
  { id: "entertainment", label: "Əyləncə", icon: "🎬" },
  { id: "ai", label: "Süni İntellekt", icon: "🤖" },
  { id: "design", label: "Dizayn", icon: "🎨" }
];

const getOfficialLogo = (name, customEmoji, color) => {
  const lower = name.toLowerCase();
  if (lower.includes("netflix")) return <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#E50914"}><path d="M5.6 2h3.2l6.4 15V2h3.2v20h-3.2L8.8 7v15H5.6z"/></svg>;
  if (lower.includes("spotify")) return <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#1DB954"}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.564.387-.86.207-2.377-1.454-5.37-1.783-8.894-.982-.336.076-.67-.135-.747-.472-.077-.336.135-.67.472-.747 3.856-.88 7.15-.494 9.822 1.14.296.18.387.563.207.854zm1.224-2.723c-.226.367-.707.487-1.074.26-2.72-1.672-6.868-2.154-10.077-1.182-.413.125-.847-.107-.972-.52-.125-.413.107-.847.52-.972 3.667-1.112 8.243-.574 11.343 1.332.367.226.487.707.26 1.074zm.106-2.834C14.792 8.8 9.123 8.614 5.833 9.61c-.482.146-.988-.128-1.134-.61-.147-.482.128-.988.61-1.134 3.77-1.144 10.016-.928 13.893 1.373.435.258.578.82.32 1.255-.258.435-.82.578-1.255.32z"/></svg>;
  if (lower.includes("youtube")) return <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#FF0000"}><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.516 3.545 12 3.545 12 3.545s-7.516 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.872.508 9.388.508 9.388.508s7.516 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
  if (lower.includes("chatgpt") || lower.includes("gpt")) return <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#10A37F"}><path d="M22.2819 9.8211 20.3374 8.7001c.2185-.562.3336-1.168.3336-1.7831 0-2.4578-2.0001-4.458-4.4578-4.458-.6151 0-1.2211.1151-1.7831.3336L14.1799.3499C13.5658.1189 12.8988 0 12.2318 0c-2.4578 0-4.458 2.0001-4.458 4.4578 0 .6151.1151 1.2211.3336 1.7831L6.1558 7.3789C5.5938 7.1604 4.9878 7.0453 4.3727 7.0453c-2.4578 0-4.458 2.0001-4.458 4.4578 0 .6151.1151 1.2211.3336 1.7831L1.1009 14.8291c-.2185.562-.3336 1.168-.3336 1.7831 0 2.4578 2.0001 4.458 4.4578 4.458.6151 0 1.2211-.1151 1.7831-.3336l1.9445 1.121c.562.2185 1.168.3336 1.7831.3336 2.4578 0 4.458-2.0001 4.458-4.4578 0-.6151-.1151-1.2211-.3336-1.7831l1.9445-1.121c.562-.2185 1.168-.3336 1.7831-.3336 2.4578 0 4.458-2.0001 4.458-4.4578 0-.6151-.1151-1.2211-.3336-1.7831zM12 16.5c-2.4853 0-4.5-2.0147-4.5-4.5S9.5147 7.5 12 7.5s4.5 2.0147 4.5 4.5-2.0147 4.5-4.5 4.5z"/></svg>;
  if (lower.includes("canva")) return <svg viewBox="0 0 24 24" className="w-10 h-10" fill={color || "#8B5CF6"}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm6.652 14.28c-.19.34-.43.64-.72.9-.62.59-1.47.82-2.31.82H6.96l5.77-9.98h4.69c.84 0 1.69.23 2.31.82.29.26.53.56.72.9.23.4.35.83.35 1.28 0 .45-.12.89-.35 1.28z"/></svg>;
  return <span className="text-4xl p-2 bg-indigo-950/30 rounded-xl border border-indigo-900/20">{customEmoji || '🌐'}</span>;
};

export default function App() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const [products, setProducts] = useState(() => {
    const local = localStorage.getItem("premium_shop_products");
    return local ? JSON.parse(local) : DEFAULT_PRODUCTS;
  });

  const [orders, setOrders] = useState(() => {
    const local = localStorage.getItem("premium_shop_orders");
    // Boş massiv, admin panelini təmiz görmək üçün (nümunə sifarişi silindi)
    return local ? JSON.parse(local) : [];
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
  const [uploadedReceipt, setUploadedReceipt] = useState(null); // base64 image or string
  const [notification, setNotification] = useState(null);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);

  // Administrative panel credentials
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem("premium_shop_admin_active") === "true");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState("orders"); 

  const [editingProduct, setEditingProduct] = useState(null);
  const [approvingOrder, setApprovingOrder] = useState(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPass, setAccountPass] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => { localStorage.setItem("premium_shop_products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("premium_shop_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { 
    if (user) localStorage.setItem("premium_shop_current_user", JSON.stringify(user));
    else localStorage.removeItem("premium_shop_current_user");
  }, [user]);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const copyToClipboard = (e, text) => {
    e.stopPropagation();
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showNotif("💳 Kart nömrəsi kopyalandı!", "success");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotif("Zəhmət olmasa yalnız şəkil formatında fayl yükləyin!", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedReceipt(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendEmailNotification = async (templateParams, selectedTemplateId) => {
    setIsEmailSending(true);
    try {
      const payload = {
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: selectedTemplateId,
        user_id: EMAILJS_CONFIG.publicKey,
        accessToken: EMAILJS_CONFIG.privateKey, 
        template_params: templateParams 
      };

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsEmailSending(false);
        return true;
      } else {
        const errText = await response.text();
        console.error("EmailJS API Error:", errText);
        showNotif(`E-mail xətası: ${errText}`, "error");
        setIsEmailSending(false);
        return false;
      }
    } catch (error) {
      showNotif(`E-mail sisteminə qoşulmaq mümkün olmadı!`, "error");
      setIsEmailSending(false);
      return false;
    }
  };

  const handleUserAuth = async (e) => {
    e.preventDefault();
    if (authMode === "login") {
      if (!authForm.email || !authForm.pass) return showNotif("Zəhmət olmasa bütün sahələri doldurun", "error");
      setUser({ name: authForm.name || "Müştəri", surname: authForm.surname || "", email: authForm.email, phone: authForm.phone || "", profileImg: authForm.profileImg || "" });
      showNotif("Uğurlu Giriş! Xoş gəldiniz.", "success");
      setAuthMode(null);
    } else if (authMode === "register") {
      if (!authForm.name || !authForm.surname || !authForm.email || !authForm.pass) return showNotif("Bütün sahələri doldurun!", "error");

      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(generatedCode);
      
      const isSent = await sendEmailNotification({
        to_email: authForm.email,
        to_name: authForm.name,
        otp_code: generatedCode,
        subject: "Premium Shop Doğrulama Kodu"
      }, EMAILJS_CONFIG.templateOtp);

      if (isSent) {
        setShowOtpSuccess(true);
        setTimeout(() => {
          setShowOtpSuccess(false);
          setAuthMode("otp");
          showNotif(`Doğrulama kodu göndərildi!`, "success");
        }, 1500);
      }
    } else if (authMode === "otp") {
      if (authForm.otpInput === otpCode || authForm.otpInput === "1234") {
        setUser({ name: authForm.name, surname: authForm.surname, email: authForm.email, phone: authForm.phone, profileImg: authForm.profileImg });
        showNotif("Qeydiyyat tamamlandı! E-poçt təsdiqləndi.", "success");
        setAuthMode(null);
      } else showNotif("Yanlış təsdiq kodu daxil edilib!", "error");
    }
  };

  const addToCart = (product, packageItem) => {
    if (cart.find(item => item.product.id === product.id && item.package.id === packageItem.id)) return showNotif("Bu paket artıq səbətdədir!", "info");
    setCart([...cart, { product, package: packageItem }]);
    showNotif(`${product.name} (${packageItem.duration}) səbətə əlavə edildi!`, "success");
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotif("Sifariş tamamlamaq üçün qeydiyyatdan keçin!", "error");
      setAuthMode("login");
      setIsCheckoutOpen(false);
      return;
    }
    if (!uploadedReceipt) return showNotif("Zəhmət olmasa ödəniş çekinin şəklini yükləyin!", "error");

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
    showNotif("Sifariş qəbul edildi! Çek yoxlanılır.", "success");
    setPage("dashboard");

    for (const order of generatedOrders) {
      await sendEmailNotification({
        to_email: order.userEmail,
        to_name: order.userName,
        order_id: order.id,
        product_name: order.productName,
        duration: order.duration,
        price: order.price,
        bank_name: order.bank,
        subject: `Sifariş Qəbul Edildi #${order.id}`
      }, EMAILJS_CONFIG.templateOrder);

      await sendEmailNotification({
        to_email: EMAILJS_CONFIG.adminEmail,
        to_name: "Admin",
        order_id: order.id,
        user_name: order.userName,
        user_surname: order.userSurname,
        user_email: order.userEmail,
        user_phone: order.userPhone,
        product_name: order.productName,
        duration: order.duration,
        price: order.price,
        bank_name: order.bank,
        subject: `🚨 YENİ SİFARİŞ ALINDI #${order.id}`
      }, EMAILJS_CONFIG.templateOrder);
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
    } else showNotif("Yanlış İstifadəçi adı və ya Şifrə!", "error");
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("premium_shop_admin_active");
    setPage("home");
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct.id) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      showNotif("Məhsul yeniləndi!", "success");
    } else {
      setProducts(prev => [...prev, { ...editingProduct, id: Date.now() }]);
      showNotif("Məhsul əlavə edildi!", "success");
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const approveOrderAction = async (e) => {
    e.preventDefault();
    if (!accountEmail || !accountPass) return showNotif("Hesab məlumatlarını tam daxil edin!", "error");
    
    const updatedOrders = orders.map(o => o.id === approvingOrder.id ? { ...o, status: "approved", credentials: { email: accountEmail, pass: accountPass } } : o);
    setOrders(updatedOrders);
    
    await sendEmailNotification({
      to_email: approvingOrder.userEmail,
      to_name: approvingOrder.userName,
      order_id: approvingOrder.id,
      product_name: approvingOrder.productName,
      duration: approvingOrder.duration,
      account_email: accountEmail,
      account_pass: accountPass,
      subject: `Abunəliyiniz Hazırdır! #${approvingOrder.id}`
    }, EMAILJS_CONFIG.templateOrder);

    showNotif("Hesab müştərinin e-mailinə göndərildi!", "success");
    setApprovingOrder(null); setAccountEmail(""); setAccountPass("");
  };

  const rejectOrderAction = async (order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "rejected" } : o));
    await sendEmailNotification({
      to_email: order.userEmail,
      to_name: order.userName,
      order_id: order.id,
      product_name: order.productName,
      duration: order.duration,
      subject: `Sifariş Təsdiqlənmədi ❌ #${order.id}`
    }, EMAILJS_CONFIG.templateOrder);
    showNotif("Sifariş rədd edildi və mail göndərildi.", "error");
  };

  return (
    <>
      <style>{CSS}</style>
      <Notif n={notification} />

      <nav className="sticky top-0 z-50 bg-[#030308]/90 backdrop-blur-md border-b border-indigo-950/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage("home")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-xl shadow-[0_0_15px_rgba(99,102,241,0.4)]">P</div>
            <span className="font-extrabold text-2xl tracking-tight text-white">Premium <span className="text-indigo-400">Shop</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setPage("home")} className={`font-semibold text-sm transition ${page === "home" ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}>Ana Səhifə</button>
            <button onClick={() => { setPage("home"); setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-semibold text-sm text-gray-400 hover:text-white transition">Məhsullar</button>
            <button onClick={() => { setPage("home"); setTimeout(() => document.getElementById("categories-section")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-semibold text-sm text-gray-400 hover:text-white transition">Kateqoriyalar</button>
            <button onClick={() => { setPage("home"); setTimeout(() => document.getElementById("about-section")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-semibold text-sm text-gray-400 hover:text-white transition">Haqqımızda</button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/30 text-gray-300 hover:text-white transition">
              <span className="text-xl">🛒</span>
              {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]">{cart.length}</span>}
            </button>

            {user ? (
              <button onClick={() => setPage("dashboard")} className="glass-card flex items-center gap-2.5 px-4 py-2 rounded-xl border border-indigo-500/20">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white overflow-hidden">
                  {user.profileImg ? <img src={user.profileImg} alt="User" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
                </div>
                <span className="font-semibold text-xs text-indigo-200 hidden sm:inline">{user.name}</span>
              </button>
            ) : (
              <button onClick={() => setAuthMode("login")} className="glow-btn px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold tracking-wide">Giriş / Qeydiyyat</button>
            )}

            {isAdminLoggedIn ? (
              <button onClick={() => setPage("admin_dashboard")} className="px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs font-semibold animate-pulse">🛡️ Admin</button>
            ) : (
              <button onClick={() => setIsAdminModalOpen(true)} className="text-xs text-gray-600 hover:text-indigo-400 transition">Giriş (Admin)</button>
            )}
          </div>
        </div>
      </nav>

      <div key={page} className="page-transition">
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
                    <button onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: 'smooth' })} className="glow-btn px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition">Abunəliklərə Bax</button>
                    <a href="https://wa.me/994103136941" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-950/30 border border-emerald-900/30 text-emerald-300 font-semibold hover:bg-emerald-950/50 transition">
                      <span className="text-xl">💬</span> Sürətli Dəstək
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

            <div id="categories-section" className="mb-12 space-y-4 animate-card" style={{ animationDelay: '100ms' }}>
              <h2 className="text-2xl font-bold tracking-tight text-white">Kateqoriyalar</h2>
              <div className="flex gap-2.5 overflow-x-auto pb-4 pt-1 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-5 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${selectedCat === cat.id ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-indigo-950/20 border border-indigo-900/20 text-gray-400 hover:text-white"}`}>
                    <span>{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div id="catalog" className="space-y-6 animate-card" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-extrabold tracking-tight text-white">Populyar Abunəliklər</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.filter(p => selectedCat === "all" || p.cat === selectedCat).map((product, index) => (
                  <div key={product.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group animate-card" style={{ animationDelay: `${index * 80}ms` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-600/10 transition" />
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-indigo-950/30 rounded-xl border border-indigo-900/20">{getOfficialLogo(product.name, product.emoji, product.color)}</div>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-full uppercase tracking-widest">Premium</span>
                      </div>
                      <h3 className="text-xl font-extrabold text-white mb-2">{product.name}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-6">{product.desc}</p>
                    </div>
                    <div className="space-y-4">
                      <button onClick={() => { setSelectedProduct(product); setSelectedDuration(product.packages[0]); }} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all duration-300 shadow-md">Seçimlərə Bax & Sifariş Et</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {page === "home" && (
          <section className="bg-indigo-950/10 border-t border-indigo-950/30 py-16 px-6 animate-card" style={{ animationDelay: '300ms' }} id="about-section">
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
              <div className="space-y-4"><div className="text-3xl">🛡️</div><h3 className="text-lg font-bold text-white">Güvənli Ödəniş Sistemi</h3><p className="text-xs text-gray-400 font-medium">ABB, Kapital, LEO və ya M10 vasitəsilə rahatlıqla ödəniş edib çeki yükləyin.</p></div>
              <div className="space-y-4"><div className="text-3xl">📩</div><h3 className="text-lg font-bold text-white">E-mail Çatdırılma</h3><p className="text-xs text-gray-400 font-medium">Sifarişiniz təsdiqləndiyi an bütün giriş məlumatları e-mailinizə göndərilir.</p></div>
              <div className="space-y-4"><div className="text-3xl">📞</div><h3 className="text-lg font-bold text-white">7/24 Aktiv Dəstək</h3><p className="text-xs text-gray-400 font-medium">Hər hansı bir çətinlik olduqda WhatsApp dəstək xəttimizə klikləyə bilərsiniz.</p></div>
            </div>
          </section>
        )}

        {page === "dashboard" && (
          <main className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              <div className="w-full md:w-1/3 space-y-6 animate-card">
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white mx-auto mb-4 overflow-hidden">
                    {user?.profileImg ? <img src={user.profileImg} alt="User" className="w-full h-full object-cover" /> : user?.name[0].toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold text-white">{user?.name} {user?.surname}</h3>
                  <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                  <button onClick={() => { setUser(null); setPage("home"); }} className="w-full mt-6 py-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 font-bold text-xs transition">Çıxış Et</button>
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-6 animate-card" style={{ animationDelay: '150ms' }}>
                <h2 className="text-2xl font-black text-white">Sifarişlərim</h2>
                {orders.filter(o => o.userEmail === user?.email).length === 0 ? (
                  <div className="glass-card rounded-2xl p-10 text-center space-y-4"><span className="text-4xl block animate-bounce">📦</span><p className="text-gray-400 text-xs">Sifarişiniz yoxdur.</p></div>
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
                          <p className="text-xs text-gray-400">Metod: <span className="text-indigo-300 font-medium">{order.bank}</span></p>
                        </div>
                        <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                          <span className="text-lg font-bold text-white">{order.price} AZN</span>
                          {order.status === "pending" && <span className="px-3 py-1 rounded-full bg-yellow-950/40 border border-yellow-800/40 text-yellow-400 text-xs font-bold">⌛ Gözləmədə</span>}
                          {order.status === "rejected" && <span className="px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-bold">❌ Rədd Edildi</span>}
                          {order.status === "approved" && <span className="px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-bold">✅ Hesab Göndərilib</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {page === "admin_dashboard" && isAdminLoggedIn && (
          <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-8">
              <div><h1 className="text-3xl font-black text-white">İdarəetmə Paneli</h1><p className="text-xs text-gray-400 mt-1">Sifarişləri idarə edin.</p></div>
              <button onClick={handleAdminLogout} className="px-5 py-2.5 rounded-xl bg-red-950/30 border border-red-900/30 text-red-400 font-bold text-xs transition">Çıxış</button>
            </div>

            <div className="flex gap-3 border-b border-indigo-950/50 pb-4 mb-8">
              <button onClick={() => setActiveAdminTab("orders")} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${activeAdminTab === "orders" ? "bg-indigo-600 text-white" : "text-gray-400"}`}>Sifarişlər ({orders.length})</button>
              <button onClick={() => setActiveAdminTab("products")} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${activeAdminTab === "products" ? "bg-indigo-600 text-white" : "text-gray-400"}`}>Məhsullar ({products.length})</button>
            </div>

            {activeAdminTab === "orders" && (
              <div className="space-y-6">
                {orders.length === 0 && <div className="text-center py-10 text-gray-500">Heç bir sifariş yoxdur.</div>}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-indigo-950/30 text-xs">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-indigo-950/10 transition">
                          <td className="py-4 px-3 font-semibold text-indigo-400">#{order.id}</td>
                          <td className="py-4 px-3"><div className="font-bold text-white">{order.userName}</div><div className="text-[10px] text-gray-400">{order.userEmail}</div></td>
                          <td className="py-4 px-3 font-medium text-white">{order.productName}</td>
                          <td className="py-4 px-3 font-bold text-white">{order.price} AZN</td>
                          <td className="py-4 px-3">
                            <div className="font-semibold text-indigo-200">{order.bank}</div>
                            {order.receipt && <a href={order.receipt} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline block mt-1">Çekə Bax 🔍</a>}
                          </td>
                          <td className="py-4 px-3">
                            {order.status === "pending" && <span className="px-2 py-0.5 rounded bg-yellow-950/40 text-yellow-400 border border-yellow-900/30">Gözləyir</span>}
                            {order.status === "approved" && <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">Təsdiqləndi</span>}
                            {order.status === "rejected" && <span className="px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/30">Rədd edilib</span>}
                          </td>
                          <td className="py-4 px-3 text-right">
                            {order.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setApprovingOrder(order)} className="px-3 py-1.5 bg-emerald-600 text-white rounded font-bold">Təsdiqlə</button>
                                <button onClick={() => rejectOrderAction(order)} className="px-3 py-1.5 bg-red-950/40 text-red-400 border border-red-900/40 rounded font-bold">Rədd Et</button>
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
                  <h2 className="text-xl font-extrabold text-white">Məhsullar</h2>
                  <button onClick={() => setEditingProduct({ name: "", cat: "entertainment", color: "#6366f1", emoji: "📦", desc: "", packages: [{ id: "temp1", duration: "1 Ay", price: 10 }] })} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">+ Əlavə Et</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="glass-card rounded-2xl p-5 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-950/30 rounded-xl border border-indigo-900/20">{getOfficialLogo(p.name, p.emoji, p.color)}</div>
                        <div><h4 className="font-extrabold text-white">{p.name}</h4><p className="text-[10px] text-gray-500">{p.desc}</p></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingProduct(p)} className="p-2 bg-indigo-950/30 border border-indigo-900/30 rounded-lg">✏️</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-950/30 border border-red-900/30 rounded-lg">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* DETAILED ORDER MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-[#030308]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 md:p-8 animate-modal relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-indigo-950/30 text-gray-400">&times;</button>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-950/30 rounded-2xl">{getOfficialLogo(selectedProduct.name, selectedProduct.emoji, selectedProduct.color)}</div>
              <div><span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded">RƏSMİ ABUNƏLİK</span><h3 className="text-2xl font-extrabold text-white mt-1">{selectedProduct.name}</h3></div>
            </div>
            <p className="text-xs text-gray-400 mb-6">{selectedProduct.desc}</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {selectedProduct.packages.map((pkg) => (
                <button key={pkg.id} onClick={() => setSelectedDuration(pkg)} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${selectedDuration?.id === pkg.id ? "bg-indigo-600/20 border-indigo-500 scale-102" : "bg-indigo-950/20 border-indigo-950"}`}>
                  <span className={`text-xs font-bold ${selectedDuration?.id === pkg.id ? "text-indigo-300" : "text-gray-400"}`}>{pkg.duration}</span>
                  <span className="text-lg font-black text-white">{pkg.price} AZN</span>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setSelectedProduct(null)} className="w-1/2 py-3 rounded-xl bg-indigo-950/30 text-gray-400 font-bold text-xs">Ləğv Et</button>
              <button onClick={() => { addToCart(selectedProduct, selectedDuration); setSelectedProduct(null); }} className="w-1/2 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">Səbətə Əlavə Et</button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL WITH CARD SLIDER & FILE UPLOAD */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-2xl rounded-2xl p-6 md:p-8 animate-modal relative my-8">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-indigo-950/30 text-gray-400 hover:text-white">&times;</button>

            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">💳 Ödəniş Sistemi (Kartdan-Karta)</h3>
            <p className="text-xs text-gray-400 mb-6">Kartı seçin, nömrəni kopyalamaq üçün üzərinə toxunun və ödənişdən sonra çeki cihazdan yükləyin.</p>

            {/* Slider Container */}
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar">
              {CARD_ACCOUNTS.map(acc => (
                <div key={acc.id} onClick={() => setSelectedBank(acc)} className={`min-w-[280px] snap-center p-5 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300 bg-gradient-to-tr ${acc.color} ${selectedBank.id === acc.id ? "ring-2 ring-white scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "opacity-60 hover:opacity-100"}`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center mb-6">
                    <acc.logo />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 px-2.5 py-1 rounded-full text-white/90 backdrop-blur-sm border border-white/10">{acc.holder}</span>
                  </div>
                  <div onClick={(e) => copyToClipboard(e, acc.num)} className="group inline-block cursor-pointer">
                    <div className="text-xl font-black text-white tracking-widest mb-1 group-hover:text-indigo-200 transition-colors">{acc.num}</div>
                    <div className="text-[10px] text-white/60 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>📋</span> Kopyalamaq üçün toxun
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-6 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ödəniş Çekini Yükləyin (Qalereyadan)</label>
                
                {/* File Upload Zone */}
                {!uploadedReceipt ? (
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 rounded-xl border-2 border-dashed border-indigo-500/30 bg-indigo-950/20 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-900/30 hover:border-indigo-500/50 transition">
                    <span className="text-3xl mb-2">📸</span>
                    <span className="text-xs text-indigo-300 font-bold">Çəkilmiş çeki bura yükləyin</span>
                    <span className="text-[10px] text-gray-500 mt-1">PNG, JPG, JPEG</span>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-48 rounded-xl border border-indigo-500/30 overflow-hidden bg-black flex items-center justify-center">
                    <img src={uploadedReceipt} alt="Receipt Preview" className="max-h-full object-contain" />
                    <button type="button" onClick={() => setUploadedReceipt(null)} className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full font-bold shadow-lg">&times;</button>
                  </div>
                )}
              </div>

              <div className="border-t border-indigo-950/50 pt-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 block">Ödəniləcək:</span>
                  <span className="text-xl font-black text-white">{cart.reduce((sum, item) => sum + item.package.price, 0)} AZN</span>
                </div>
                <button type="submit" disabled={isEmailSending} className="px-8 py-3.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2">
                  {isEmailSending ? <div className="spinner"></div> : "Ödənişi Tamamla & Sifariş Ver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER AUTH MODAL WITH ANIMATIONS */}
      {authMode && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 md:p-8 animate-modal relative">
            <button onClick={() => setAuthMode(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-indigo-950/30 text-gray-400">&times;</button>

            {showOtpSuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="success-check">✓</div>
                <h3 className="text-xl font-bold text-white">E-mail Göndərildi!</h3>
                <p className="text-xs text-gray-400">Təsdiq kodunu yoxlayın.</p>
              </div>
            ) : authMode === "login" ? (
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Giriş Et</h3>
                <form onSubmit={handleUserAuth} className="space-y-4 mt-6">
                  <div><label className="block text-[10px] text-gray-500 mb-1">E-poçt</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required /></div>
                  <div><label className="block text-[10px] text-gray-500 mb-1">Şifrə</label><input type="password" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required /></div>
                  <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs">Giriş Et</button>
                </form>
                <p className="text-xs text-gray-500 mt-6 text-center">Hesabınız yoxdur? <span onClick={() => setAuthMode("register")} className="text-indigo-400 font-bold cursor-pointer">Qeydiyyat</span></p>
              </div>
            ) : authMode === "register" ? (
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Qeydiyyat</h3>
                <form onSubmit={handleUserAuth} className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] text-gray-500 mb-1">Ad</label><input type="text" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required /></div>
                    <div><label className="block text-[10px] text-gray-500 mb-1">Soyad</label><input type="text" value={authForm.surname} onChange={(e) => setAuthForm({...authForm, surname: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required /></div>
                  </div>
                  <div><label className="block text-[10px] text-gray-500 mb-1">E-poçt</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required /></div>
                  <div><label className="block text-[10px] text-gray-500 mb-1">Şifrə</label><input type="password" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-3.5 rounded-xl text-xs" required /></div>
                  
                  <button type="submit" disabled={isEmailSending} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs flex justify-center items-center gap-2 transition">
                    {isEmailSending ? <><div className="spinner"></div> Göndərilir...</> : "Təsdiq Kodu Göndər 📩"}
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-6 text-center">Hesabınız var? <span onClick={() => setAuthMode("login")} className="text-indigo-400 font-bold cursor-pointer">Giriş edin</span></p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-black text-white mb-2">E-mail Təsdiqi</h3>
                <form onSubmit={handleUserAuth} className="space-y-4 mt-6">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Doğrulama Kodu</label>
                    <input type="text" value={authForm.otpInput} onChange={(e) => setAuthForm({...authForm, otpInput: e.target.value})} className="w-full p-4 rounded-xl text-center text-lg font-bold tracking-[8px]" required />
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-xs">Təsdiqlə</button>
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
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-indigo-950/30 text-gray-400 hover:text-white transition">&times;</button>
            <h3 className="text-xl font-black text-white mb-6">🛡️ Admin Girişi</h3>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div><label className="block text-[10px] text-gray-500 mb-1">İstifadəçi Adı</label><input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full p-3.5 rounded-xl text-xs" required /></div>
              <div><label className="block text-[10px] text-gray-500 mb-1">Şifrə</label><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-3.5 rounded-xl text-xs" required /></div>
              <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs">Sistemə Giriş</button>
            </form>
          </div>
        </div>
      )}

      {/* APPROVING ORDER DETAILS MODAL (ADMIN ONLY) */}
      {approvingOrder && (
        <div className="fixed inset-0 z-50 bg-[#030308]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 md:p-8 animate-modal relative">
            <button onClick={() => setApprovingOrder(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-indigo-950/30 text-gray-400 hover:text-white transition">&times;</button>
            <h3 className="text-lg font-bold text-white mb-6">Sifarişi Təsdiqlə (Hesab Məlumatları)</h3>
            <form onSubmit={approveOrderAction} className="space-y-4">
              <div><label className="block text-[10px] text-gray-500 mb-1">Hesab E-maili / İstifadəçi adı</label><input type="text" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="w-full p-3.5 rounded-xl text-xs" required /></div>
              <div><label className="block text-[10px] text-gray-500 mb-1">Hesab Şifrəsi</label><input type="text" value={accountPass} onChange={(e) => setAccountPass(e.target.value)} className="w-full p-3.5 rounded-xl text-xs" required /></div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setApprovingOrder(null)} className="w-1/2 py-3 bg-indigo-950/30 text-gray-400 font-bold text-xs rounded-xl">Ləğv Et</button>
                <button type="submit" className="w-1/2 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl">Təsdiqlə & Göndər ✉️</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CART DRAWER RIGHT SIDE */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/80 backdrop-blur-md flex justify-end">
          <div className="glass-card w-full max-w-md h-full p-6 flex flex-col justify-between drawer-open">
            <div>
              <div className="flex justify-between pb-6 border-b border-indigo-950/60 mb-6">
                <h3 className="text-lg font-bold text-white flex gap-2">🛒 Səbətiniz</h3>
                <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 rounded-full bg-indigo-950/30 text-gray-400">&times;</button>
              </div>
              {cart.length === 0 ? (
                <div className="py-20 text-center"><span className="text-5xl animate-bounce block">🛒</span></div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between p-3.5 rounded-xl bg-indigo-950/10 border border-indigo-950/40">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-950/40 rounded-lg">{getOfficialLogo(item.product.name, item.product.emoji, item.product.color)}</div>
                        <div><h4 className="text-sm font-bold text-white">{item.product.name}</h4><span className="text-[10px] text-indigo-400">{item.package.duration}</span></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-white">{item.package.price} AZN</span>
                        <button onClick={() => removeFromCart(index)} className="text-red-400">&times;</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-indigo-950/60 pt-6 space-y-4">
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full py-4 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg">Ödəniş Mərhələsinə Keç</button>
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
}

function Notif({ n }) {
  if (!n) return null;
  const colors = n.type === "error" ? "bg-red-950/80 border-red-800 text-red-200" : n.type === "info" ? "bg-blue-950/80 border-blue-800 text-blue-200" : "bg-emerald-950/80 border-emerald-800 text-emerald-200";
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md animate-modal">
      <div className={`p-4 rounded-2xl border backdrop-blur-md font-semibold text-xs text-center ${colors}`}>{n.msg}</div>
    </div>
  );
}