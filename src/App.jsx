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
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
  
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
  
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #030308; }
  ::-webkit-scrollbar-thumb { background: #1e1b4b; border-radius: 8px; }
  ::-webkit-scrollbar-thumb:hover { background: #6366f1; }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  
  .glow-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  }
  .glow-btn:hover {
    box-shadow: 0 0 35px rgba(99, 102, 241, 0.5);
    transform: translateY(-3px) scale(1.02);
  }
  
  .glass-card {
    background: rgba(10, 10, 22, 0.65);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(99, 102, 241, 0.15);
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .glass-card:hover {
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 20px 50px rgba(99, 102, 241, 0.2);
    transform: translateY(-5px);
  }

  /* Big Hero Cards for Home Page */
  .hero-card {
    background: linear-gradient(145deg, rgba(20,20,35,0.8) 0%, rgba(10,10,18,0.9) 100%);
    border: 1px solid rgba(255,255,255,0.05);
    transition: all 0.5s ease;
  }
  .hero-card:hover {
    transform: scale(1.03);
    border: 1px solid rgba(99,102,241,0.5);
    box-shadow: 0 25px 60px rgba(99,102,241,0.25);
  }
  .hero-card-img-wrap {
    transition: transform 0.5s ease;
  }
  .hero-card:hover .hero-card-img-wrap {
    transform: scale(1.1) rotate(2deg);
  }
  
  .neon-text { text-shadow: 0 0 15px rgba(99, 102, 241, 0.4); }

  .page-transition { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .drawer-open { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes slideInRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  
  .animate-modal { animation: modalZoom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes modalZoom {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .spinner {
    width: 22px; height: 22px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .success-check {
    width: 70px; height: 70px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background-color: #10b981; color: white;
    font-size: 35px; margin: 0 auto;
    animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
  }
  @keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  input, select, textarea {
    background-color: #0c0c1d !important;
    color: #ffffff !important;
    border: 1px solid rgba(99, 102, 241, 0.2) !important;
    transition: all 0.3s ease;
  }
  input:focus, select:focus, textarea:focus {
    border-color: rgba(99, 102, 241, 0.8) !important;
    outline: none !important;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
  }
`;

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Netflix Premium", cat: "entertainment", color: "#E50914", emoji: "🎬", desc: "4K Ultra HD · 4 Ekran · Eyni anda rəsmi izləmə", packages: [{ id: "p1", duration: "1 Ay", price: 8 }, { id: "p2", duration: "3 Ay", price: 22 }, { id: "p3", duration: "1 İl", price: 80 }] },
  { id: 2, name: "Spotify Premium", cat: "entertainment", color: "#1DB954", emoji: "🎵", desc: "Reklamsız musiqi · Çevrimdışı yükləmə · Ultra səs keyfiyyəti", packages: [{ id: "p4", duration: "1 Ay", price: 5 }, { id: "p5", duration: "3 Ay", price: 13 }, { id: "p6", duration: "1 İl", price: 48 }] },
  { id: 3, name: "YouTube Premium", cat: "entertainment", color: "#FF0000", emoji: "📺", desc: "Reklamsız video çarxlar · Arxa fonda işləmə · Premium Music", packages: [{ id: "p7", duration: "1 Ay", price: 6 }, { id: "p8", duration: "3 Ay", price: 16 }, { id: "p9", duration: "1 İl", price: 55 }] },
  { id: 4, name: "ChatGPT Plus", cat: "ai", color: "#10A37F", emoji: "🤖", desc: "Rəsmi GPT-4o girişi · DALL-E 3 şəkilyaratma · Sürətli analiz", packages: [{ id: "p10", duration: "1 Ay", price: 25 }, { id: "p11", duration: "3 Ay", price: 68 }] },
  { id: 5, name: "Canva Pro", cat: "design", color: "#8B5CF6", emoji: "🎨", desc: "Milyonlarla premium şablon · AI dizayn köməkçisi", packages: [{ id: "p12", duration: "1 Ay", price: 9 }, { id: "p13", duration: "3 Ay", price: 24 }, { id: "p14", duration: "1 İl", price: 85 }] }
];

const BankLogos = {
  ABB: () => <svg viewBox="0 0 100 30" className="h-6" fill="#fff"><text x="0" y="24" fontFamily="Arial" fontWeight="900" fontSize="26" letterSpacing="-1">ABB</text></svg>,
  Kapital: () => <svg viewBox="0 0 150 30" className="h-6" fill="#fff"><path d="M12 2L15 9H22L16 14L18 21L12 17L6 21L8 14L2 9H9L12 2Z" fill="#fff"/><text x="28" y="20" fontFamily="Arial" fontWeight="bold" fontSize="18">Kapital Bank</text></svg>,
  LEO: () => <svg viewBox="0 0 100 30" className="h-6" fill="#fff"><text x="0" y="22" fontFamily="Arial" fontWeight="900" fontSize="24" letterSpacing="1">leo</text><circle cx="50" cy="14" r="4" fill="#fbbf24"/></svg>,
  M10: () => <svg viewBox="0 0 100 30" className="h-6" fill="#fff"><rect width="36" height="24" rx="8" fill="#fff"/><text x="4" y="18" fill="#0d9488" fontFamily="Arial" fontWeight="900" fontSize="16">m10</text></svg>
};

const CARD_ACCOUNTS = [
  { id: "kapital", bank: "Kapital Bank", logo: BankLogos.Kapital, num: "4169 7388 1861 3451", holder: "Faiq Kərimli", color: "from-red-600 to-red-800" },
  { id: "abb", bank: "ABB", logo: BankLogos.ABB, num: "5522 0093 7234 8144", holder: "Faiq Kərimli", color: "from-blue-600 to-blue-800" },
  { id: "leo", bank: "LEO Bank", logo: BankLogos.LEO, num: "4098 5844 6496 5191", holder: "Faiq Kərimli", color: "from-zinc-800 to-black" },
  { id: "m10", bank: "M10", logo: BankLogos.M10, num: "+994 10 313 69 41", holder: "M10 Balans", color: "from-teal-500 to-teal-700" }
];

const CATEGORIES = [
  { id: "all", label: "Bütün Məhsullar", icon: "🌐" },
  { id: "entertainment", label: "Əyləncə", icon: "🎬" },
  { id: "ai", label: "Süni İntellekt", icon: "🤖" },
  { id: "design", label: "Dizayn", icon: "🎨" }
];

// SVG Icons for generic use
const Icons = {
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinelinejoin="round" className="text-indigo-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>,
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinelinejoin="round" className="text-purple-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>,
  Headset: () => <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinelinejoin="round" className="text-pink-400"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>,
  WhatsApp: () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
};

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
    return local ? JSON.parse(local) : []; // Boş başlayır
  });

  const [page, setPage] = useState("home"); // home, categories, dashboard, admin_dashboard
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
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  
  // Dashboard Tabs
  const [dashTab, setDashTab] = useState("profile"); // profile, orders
  const [profileEdit, setProfileEdit] = useState({ phone: user?.phone || "", profileImg: user?.profileImg || "" });
  const profileInputRef = useRef(null);

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
    if (user) {
      localStorage.setItem("premium_shop_current_user", JSON.stringify(user));
      setProfileEdit({ phone: user.phone || "", profileImg: user.profileImg || "" });
    } else localStorage.removeItem("premium_shop_current_user");
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

  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) return showNotif("Yalnız şəkil formatı dəstəklənir!", "error");
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    setUser({ ...user, phone: profileEdit.phone, profileImg: profileEdit.profileImg });
    showNotif("Məlumatlarınız uğurla yeniləndi!", "success");
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
        }, 2000); // Wait for the checkmark animation
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
    setDashTab("orders");

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

  // Top 3 Products for Home
  const topProducts = products.filter(p => [1, 2, 3].includes(p.id));

  return (
    <>
      <style>{CSS}</style>
      <Notif n={notification} />

      {/* FIXED HEADER */}
      <nav className="sticky top-0 z-50 bg-[#030308]/90 backdrop-blur-xl border-b border-indigo-950/60 px-6 py-4">
        <div className="max-w-[90rem] mx-auto flex items-center justify-between">
          
          {/* Logo Integration */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setPage("home")}>
            {/* Fallback styling wrapped around the img tag. The img src points to the provided Premium.png */}
            <div className="w-auto h-12 flex items-center justify-center transition-transform group-hover:scale-105">
              <img 
                src="./Premium.png" 
                alt="Premium Shop" 
                className="h-full object-contain drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex'; // Show fallback
                }}
              />
              {/* Fallback PS Logo if image is missing */}
              <div className="hidden items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">PS</div>
                <span className="font-extrabold text-2xl tracking-tight text-white">Premium <span className="text-indigo-400">Shop</span></span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setPage("home")} className={`font-bold text-[13px] uppercase tracking-wider transition-colors ${page === "home" ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}>Ana Səhifə</button>
            <button onClick={() => setPage("categories")} className={`font-bold text-[13px] uppercase tracking-wider transition-colors ${page === "categories" ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}>Bütün Abunəliklər</button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Proper SVG Cart Icon far right next to profile */}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-900/50 text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition shadow-inner">
              <Icons.Cart />
              {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-indigo-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.8)] border border-[#030308]">{cart.length}</span>}
            </button>

            {user ? (
              <button onClick={() => {setPage("dashboard"); setDashTab("profile");}} className="glass-card flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-indigo-500/30 hover:border-indigo-400/60">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white overflow-hidden shadow-inner">
                  {user.profileImg ? <img src={user.profileImg} alt="User" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
                </div>
                <span className="font-bold text-xs text-white hidden sm:inline">{user.name}</span>
              </button>
            ) : (
              <button onClick={() => setAuthMode("login")} className="glow-btn px-6 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-extrabold tracking-wide uppercase">Giriş / Qeydiyyat</button>
            )}
          </div>
        </div>
      </nav>

      {/* DYNAMIC PAGE RENDERER */}
      <div key={page} className="page-transition min-h-screen">
        
        {/* ========================================================================= */}
        {/* HOME PAGE - WIDE & ANIMATED */}
        {/* ========================================================================= */}
        {page === "home" && (
          <main className="max-w-[90rem] mx-auto px-6 py-12 md:py-20">
            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden glass-card p-10 md:p-20 mb-24 animate-card border border-indigo-500/20">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-widest shadow-inner">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span></span>
                    100% Güvənli Çatdırılma
                  </div>
                  <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white leading-[1.05] neon-text">
                    Rəqəmsal Dünyanızı <br />
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">Premium Edin!</span>
                  </h1>
                  <p className="text-gray-400 text-lg sm:text-xl max-w-xl leading-relaxed font-medium">
                    Azərbaycanın ən etibarlı platformasında kartla rahatlıqla ödəyin, rəsmi abunəlik hesabınız e-mail ünvanınıza dərhal çatdırılsın.
                  </p>
                  <div className="flex flex-wrap gap-5 pt-4">
                    <button onClick={() => setPage("categories")} className="glow-btn px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(99,102,241,0.4)] transition">
                      Abunəliklərə Bax
                    </button>
                    <a href="https://wa.me/994103136941" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-black text-sm uppercase tracking-wider hover:bg-emerald-900/50 hover:scale-105 transition duration-300">
                      <Icons.WhatsApp /> WhatsApp Dəstək
                    </a>
                  </div>
                </div>

                <div className="relative hidden md:block">
                  <div className="w-full aspect-square rounded-[3rem] bg-gradient-to-tr from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 flex items-center justify-center p-8 relative shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030308] via-transparent to-transparent" />
                    <div className="relative z-10 text-center space-y-6 transform group-hover:-translate-y-4 transition-transform duration-500">
                      <div className="flex justify-center gap-4 mb-8">
                         <div className="p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce" style={{animationDelay: "0ms"}}>{getOfficialLogo("Netflix", "🎬")}</div>
                         <div className="p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce" style={{animationDelay: "150ms"}}>{getOfficialLogo("Spotify", "🎵")}</div>
                         <div className="p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce" style={{animationDelay: "300ms"}}>{getOfficialLogo("Youtube", "📺")}</div>
                      </div>
                      <h3 className="font-black text-3xl text-white drop-shadow-lg">Bütün Premium Xidmətlər</h3>
                      <p className="text-sm text-indigo-200 font-bold bg-indigo-950/50 px-4 py-2 rounded-full inline-block backdrop-blur-sm">Bir klik uzaqlığında.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BIG 3 HOME CARDS */}
            <div className="mb-20 space-y-8 animate-card" style={{ animationDelay: '200ms' }}>
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Ən Çox Satılanlar</h2>
                <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="hero-card rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 transition-opacity group-hover:opacity-40" style={{ backgroundColor: product.color }} />
                    
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <div className="hero-card-img-wrap p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                          {getOfficialLogo(product.name, product.emoji, product.color)}
                        </div>
                        <span className="text-[10px] font-black text-white bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                          Populyar
                        </span>
                      </div>
                      <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{product.name}</h3>
                      <p className="text-sm text-gray-400 font-medium leading-relaxed mb-8 min-h-[40px]">{product.desc}</p>
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-auto">
                      <button onClick={() => { setSelectedProduct(product); setSelectedDuration(product.packages[0]); }} className="w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-lg relative overflow-hidden group/btn" style={{ backgroundColor: product.color }}>
                        <span className="relative z-10 flex items-center justify-center gap-2">Paketləri Gör <span>→</span></span>
                        <div className="absolute inset-0 bg-black/20 transform scale-x-0 origin-left group-hover/btn:scale-x-100 transition-transform duration-300 ease-out" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <button onClick={() => setPage("categories")} className="inline-flex items-center gap-3 font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest text-sm hover:gap-5 transition-all">
                  Bütün Məhsulları Kəşf Et <span className="text-lg">→</span>
                </button>
              </div>
            </div>

            {/* SVG FEATURES SECTION (Req 5) */}
            <section className="bg-indigo-950/20 border border-indigo-500/20 rounded-[3rem] py-20 px-10 animate-card" style={{ animationDelay: '400ms' }}>
              <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-16 text-center md:text-left">
                <div className="space-y-6 flex flex-col items-center md:items-start">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center shadow-lg"><Icons.Shield /></div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-3">Güvənli Ödəniş Sistemi</h3>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">ABB, Kapital, LEO və ya M10 vasitəsilə rahatlıqla ödəniş edib çeki yükləyin. Ödənişlər tam qorunur.</p>
                  </div>
                </div>
                <div className="space-y-6 flex flex-col items-center md:items-start">
                  <div className="w-20 h-20 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center shadow-lg"><Icons.Mail /></div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-3">Sürətli E-mail Çatdırılma</h3>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">Sifarişiniz təsdiqləndiyi an bütün rəsmi giriş məlumatları dərhal qeydiyyatdan keçdiyiniz e-mail ünvanına göndərilir.</p>
                  </div>
                </div>
                <div className="space-y-6 flex flex-col items-center md:items-start">
                  <div className="w-20 h-20 rounded-2xl bg-pink-900/40 border border-pink-500/30 flex items-center justify-center shadow-lg"><Icons.Headset /></div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-3">7/24 Aktiv Dəstək</h3>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">Hər hansı bir çətinlik və ya sualınız olduqda WhatsApp dəstək xəttimizə klikləyərək canlı rəhbərlik ala bilərsiniz.</p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* ========================================================================= */}
        {/* ALL CATEGORIES PAGE (Req 8) */}
        {/* ========================================================================= */}
        {page === "categories" && (
          <main className="max-w-[90rem] mx-auto px-6 py-12 animate-card">
            <div className="mb-12 space-y-6">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Kataloq</h1>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-3 ${selectedCat === cat.id ? "bg-indigo-600 text-white shadow-[0_10px_25px_rgba(99,102,241,0.5)] transform scale-105" : "bg-indigo-950/30 border border-indigo-900/50 text-gray-400 hover:bg-indigo-900/40 hover:text-white"}`}>
                    <span className="text-lg">{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.filter(p => selectedCat === "all" || p.cat === selectedCat).map((product, index) => (
                <div key={product.id} className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group animate-card" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-10 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: product.color }} />
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-black/40 rounded-2xl border border-white/10 shadow-lg">{getOfficialLogo(product.name, product.emoji, product.color)}</div>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">{product.name}</h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">{product.desc}</p>
                  </div>
                  <button onClick={() => { setSelectedProduct(product); setSelectedDuration(product.packages[0]); }} className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02]" style={{ backgroundColor: product.color }}>Sifariş Et</button>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ========================================================================= */}
        {/* CUSTOMER DASHBOARD (Req 2, 3, 16) */}
        {/* ========================================================================= */}
        {page === "dashboard" && (
          <main className="max-w-6xl mx-auto px-6 py-12 animate-card">
            <h1 className="text-4xl font-black text-white mb-8">Şəxsi Kabinet</h1>
            
            <div className="flex gap-4 border-b border-indigo-950/60 pb-4 mb-8 overflow-x-auto no-scrollbar">
              <button onClick={() => setDashTab("profile")} className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all ${dashTab === "profile" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50 hover:text-white"}`}>Hesab Məlumatları</button>
              <button onClick={() => setDashTab("orders")} className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all ${dashTab === "orders" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50 hover:text-white"}`}>
                Sifarişlərim {orders.filter(o => o.userEmail === user?.email).length > 0 && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">{orders.filter(o => o.userEmail === user?.email).length}</span>}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
              
              {/* Profile TAB */}
              {dashTab === "profile" && (
                <div className="w-full max-w-xl animate-modal">
                  <div className="glass-card rounded-[2rem] p-8 border border-indigo-500/20">
                    <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-5xl text-white overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.4)] border-4 border-[#030308]">
                          {profileEdit.profileImg ? <img src={profileEdit.profileImg} alt="User" className="w-full h-full object-cover" /> : user?.name[0].toUpperCase()}
                        </div>
                        <div onClick={() => profileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                          <span className="text-white text-xs font-bold uppercase tracking-widest text-center">Şəkli<br/>Yenilə</span>
                        </div>
                        <input type="file" accept="image/*" ref={profileInputRef} onChange={(e) => handleImageUpload(e, (res) => setProfileEdit({...profileEdit, profileImg: res}))} className="hidden" />
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-3xl font-black text-white">{user?.name} {user?.surname}</h3>
                        <p className="text-indigo-400 font-bold tracking-wider mt-1">{user?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Əlaqə Nömrəsi (Sonradan Əlavə Edilə Bilər)</label>
                        <input type="tel" placeholder="+994 (--) --- -- --" value={profileEdit.phone} onChange={(e) => setProfileEdit({...profileEdit, phone: e.target.value})} className="w-full p-4 rounded-xl text-sm font-bold bg-indigo-950/20" />
                      </div>
                      <div className="flex gap-4 pt-4 border-t border-indigo-950/60">
                         <button onClick={handleUpdateProfile} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg transition">Məlumatları Saxla</button>
                         <button onClick={() => { setUser(null); setPage("home"); }} className="px-8 py-4 bg-red-950/40 border border-red-900/40 hover:bg-red-900/50 text-red-400 rounded-xl font-black text-sm uppercase tracking-wider transition">Çıxış Et</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders TAB */}
              {dashTab === "orders" && (
                <div className="w-full animate-modal">
                  {orders.filter(o => o.userEmail === user?.email).length === 0 ? (
                    <div className="glass-card rounded-[2rem] p-16 text-center space-y-6 border border-indigo-500/20">
                      <div className="w-24 h-24 bg-indigo-950/50 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30">
                        <span className="text-5xl animate-bounce">📦</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white mb-2">Sifarişiniz Yoxdur</h3>
                        <p className="text-gray-400 font-medium">Platformamızdan hələ heç bir abunəlik əldə etməmisiniz.</p>
                      </div>
                      <button onClick={() => {setPage("categories"); setDashTab("profile");}} className="glow-btn inline-block px-10 py-4 rounded-xl bg-indigo-600 text-white font-black text-sm uppercase tracking-wider">Kataloqa Keç</button>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {orders.filter(o => o.userEmail === user?.email).reverse().map((order) => (
                        <div key={order.id} className="glass-card rounded-[2rem] p-6 sm:p-8 border border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-[10px] font-black px-3 py-1.5 rounded-md bg-indigo-600 text-white tracking-widest">{order.id}</span>
                              <span className="text-xs font-bold text-gray-500">{order.date}</span>
                            </div>
                            <h4 className="text-xl font-black text-white">{order.productName} <span className="text-indigo-400">({order.duration})</span></h4>
                            <div className="flex gap-4 text-xs font-bold text-gray-400">
                              <span>Ödəniş: <span className="text-white">{order.bank}</span></span>
                              <span>Məbləğ: <span className="text-white">{order.price} AZN</span></span>
                            </div>
                          </div>
                          
                          <div className="w-full md:w-auto text-left md:text-right">
                            {order.status === "pending" && <span className="px-4 py-2 rounded-xl bg-yellow-900/40 border border-yellow-500/40 text-yellow-400 text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2"><div className="spinner w-3 h-3 border-[2px]"></div> Yoxlanılır</span>}
                            {order.status === "rejected" && <span className="px-4 py-2 rounded-xl bg-red-900/40 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2">❌ Rədd Edildi</span>}
                            {order.status === "approved" && (
                              <div className="space-y-3">
                                <span className="px-4 py-2 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2">✅ Aktivdir</span>
                                {order.credentials && (
                                  <div className="p-4 bg-[#0c0c1d] border border-indigo-500/30 rounded-xl text-xs space-y-2 text-left">
                                    <div className="text-gray-500 font-bold uppercase tracking-widest text-[9px] mb-2">Giriş Məlumatları</div>
                                    <div className="flex justify-between gap-4"><span className="text-gray-400">E-mail:</span> <span className="text-white font-black select-all">{order.credentials.email}</span></div>
                                    <div className="flex justify-between gap-4"><span className="text-gray-400">Şifrə:</span> <span className="text-white font-black select-all">{order.credentials.pass}</span></div>
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
              )}
            </div>
          </main>
        )}

        {/* ADMINISTRATIVE DASHBOARD SCREEN */}
        {page === "admin_dashboard" && isAdminLoggedIn && (
          <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
              <div><h1 className="text-4xl font-black text-white">İdarəetmə Paneli</h1><p className="text-sm font-medium text-indigo-400 mt-2">Xoş gəldiniz Admin, tam səlahiyyətlərə sahibsiniz.</p></div>
              <button onClick={handleAdminLogout} className="px-6 py-3 rounded-xl bg-red-900/40 border border-red-500/30 text-red-400 font-black text-sm uppercase tracking-wider hover:bg-red-800/50 transition">Sistemdən Çıxış</button>
            </div>

            <div className="flex gap-4 border-b border-indigo-950/60 pb-6 mb-8 overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveAdminTab("orders")} className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeAdminTab === "orders" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50"}`}>Sifarişlər ({orders.length})</button>
              <button onClick={() => setActiveAdminTab("products")} className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeAdminTab === "products" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50"}`}>Məhsullar ({products.length})</button>
            </div>

            {activeAdminTab === "orders" && (
              <div className="space-y-6 animate-modal">
                {orders.length === 0 && <div className="text-center py-20 text-gray-500 font-bold text-lg">Sistemdə heç bir sifariş tapılmadı.</div>}
                <div className="grid gap-4">
                  {orders.slice().reverse().map((order) => (
                    <div key={order.id} className="glass-card rounded-2xl p-6 flex flex-col lg:flex-row justify-between gap-6 border-l-4" style={{borderLeftColor: order.status === 'pending' ? '#eab308' : order.status === 'approved' ? '#10b981' : '#ef4444'}}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                        <div><div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ID / Tarix</div><div className="font-bold text-indigo-400">{order.id}</div><div className="text-xs text-gray-400">{order.date}</div></div>
                        <div><div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Müştəri</div><div className="font-bold text-white">{order.userName} {order.userSurname}</div><div className="text-xs text-gray-400">{order.userEmail}</div><div className="text-xs text-gray-400">{order.userPhone}</div></div>
                        <div><div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Məhsul / Məbləğ</div><div className="font-bold text-white">{order.productName} ({order.duration})</div><div className="font-black text-emerald-400">{order.price} AZN</div></div>
                        <div><div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bank Çeki</div><div className="font-bold text-white">{order.bank}</div>{order.receipt && <a href={order.receipt} target="_blank" rel="noreferrer" className="inline-block mt-2 px-3 py-1 bg-indigo-900/50 text-indigo-300 text-xs font-bold rounded">Çekə Bax 🔍</a>}</div>
                      </div>
                      <div className="flex lg:flex-col justify-end gap-3 min-w-[140px]">
                        {order.status === "pending" ? (
                          <>
                            <button onClick={() => setApprovingOrder(order)} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-xs uppercase tracking-wider">Təsdiqlə</button>
                            <button onClick={() => rejectOrderAction(order)} className="w-full py-2 bg-red-900/50 text-red-400 hover:bg-red-800/60 rounded-lg font-black text-xs uppercase tracking-wider">Rədd Et</button>
                          </>
                        ) : (
                          <div className={`text-center py-2 px-4 rounded-lg font-black text-xs uppercase tracking-wider ${order.status === 'approved' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                            {order.status === 'approved' ? 'Təsdiqlənib' : 'Rədd Edilib'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAdminTab === "products" && (
              <div className="space-y-6 animate-modal">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-white">Məhsul Kataloqu</h2>
                  <button onClick={() => setEditingProduct({ name: "", cat: "entertainment", color: "#6366f1", emoji: "📦", desc: "", packages: [{ id: "temp1", duration: "1 Ay", price: 10 }] })} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg">+ Yeni Əlavə Et</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-black/40 rounded-xl border border-white/10">{getOfficialLogo(p.name, p.emoji, p.color)}</div>
                        <div><h4 className="font-black text-lg text-white">{p.name}</h4><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{p.cat}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {p.packages.map(pkg => (
                          <span key={pkg.id} className="text-[10px] px-2.5 py-1 bg-indigo-900/40 border border-indigo-500/20 text-indigo-300 rounded-md font-black">{pkg.duration}: {pkg.price} AZN</span>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-auto pt-4 border-t border-indigo-950/50">
                        <button onClick={() => setEditingProduct(p)} className="flex-1 py-2 bg-indigo-900/40 hover:bg-indigo-800/60 rounded-lg text-indigo-300 font-bold text-xs uppercase tracking-wider">Redaktə Et</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="w-12 flex items-center justify-center bg-red-900/30 hover:bg-red-800/50 border border-red-900/50 rounded-lg text-red-400">🗑️</button>
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
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-xl rounded-[2.5rem] p-8 md:p-10 animate-modal relative border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)]">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white hover:bg-indigo-900 transition flex items-center justify-center text-xl font-bold">&times;</button>
            <div className="flex items-center gap-6 mb-8">
              <div className="p-5 bg-black/40 rounded-3xl border border-white/10 shadow-xl">{getOfficialLogo(selectedProduct.name, selectedProduct.emoji, selectedProduct.color)}</div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full tracking-widest uppercase mb-2 inline-block">100% Zəmanət</span>
                <h3 className="text-3xl font-black text-white tracking-tight">{selectedProduct.name}</h3>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 leading-relaxed mb-8 p-5 bg-indigo-950/20 rounded-2xl border border-indigo-900/30">{selectedProduct.desc}</p>
            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">Paket Müddətini Seçin</h4>
            <div className="grid grid-cols-3 gap-4 mb-10">
              {selectedProduct.packages.map((pkg) => (
                <button key={pkg.id} onClick={() => setSelectedDuration(pkg)} className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${selectedDuration?.id === pkg.id ? "bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transform scale-105" : "bg-indigo-950/20 border-transparent hover:border-indigo-900"}`}>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${selectedDuration?.id === pkg.id ? "text-indigo-400" : "text-gray-500"}`}>{pkg.duration}</span>
                  <span className="text-2xl font-black text-white tracking-tight">{pkg.price} <span className="text-sm text-gray-400">AZN</span></span>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setSelectedProduct(null)} className="w-1/3 py-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 text-gray-400 hover:text-white font-black text-xs uppercase tracking-wider transition">Ləğv Et</button>
              <button onClick={() => { addToCart(selectedProduct, selectedDuration); setSelectedProduct(null); }} className="glow-btn w-2/3 py-4 rounded-xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                <Icons.Cart /> Səbətə At
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL WITH CARD SLIDER & FILE UPLOAD */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-2xl rounded-[2.5rem] p-6 md:p-10 animate-modal relative my-8 border border-indigo-500/30">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white hover:bg-indigo-900 flex items-center justify-center text-xl font-bold transition">&times;</button>

            <div className="text-center mb-8">
              <h3 className="text-3xl font-black text-white mb-3">Ödəniş Mərhələsi</h3>
              <p className="text-sm font-medium text-gray-400 max-w-md mx-auto">Aşağıdakı kartlardan birinə ödəniş edin, nömrəni kopyalamaq üçün toxunun və çeki yükləyin.</p>
            </div>

            {/* Slider Container aligned beautifully */}
            <div className="flex overflow-x-auto gap-5 pb-6 snap-x no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {CARD_ACCOUNTS.map(acc => (
                <div key={acc.id} onClick={() => setSelectedBank(acc)} className={`min-w-[280px] sm:min-w-[320px] snap-center p-6 rounded-3xl cursor-pointer relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${acc.color} ${selectedBank.id === acc.id ? "ring-4 ring-white/50 scale-[1.02] shadow-[0_20px_40px_rgba(0,0,0,0.6)]" : "opacity-50 hover:opacity-90 scale-95"}`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <acc.logo />
                    <span className="text-[9px] font-black uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full text-white/90 backdrop-blur-md border border-white/20">{acc.holder}</span>
                  </div>
                  <div onClick={(e) => copyToClipboard(e, acc.num)} className="group inline-block cursor-pointer relative z-10">
                    <div className="text-2xl font-black text-white tracking-widest mb-1 group-hover:text-white/80 transition-colors">{acc.num}</div>
                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-y-1">
                      <span>📋</span> Kopyalamaq üçün toxun
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-8 mt-4 bg-indigo-950/20 p-6 rounded-3xl border border-indigo-900/30">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Ödəniş Çeki (Cihazdan Yüklə)</label>
                
                {/* File Upload Zone */}
                {!uploadedReceipt ? (
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 rounded-2xl border-2 border-dashed border-indigo-500/40 bg-[#0c0c1d] flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-900/30 hover:border-indigo-400 transition group">
                    <div className="w-12 h-12 rounded-full bg-indigo-950 flex items-center justify-center mb-3 group-hover:scale-110 transition border border-indigo-500/30">
                      <span className="text-xl">📸</span>
                    </div>
                    <span className="text-sm text-indigo-300 font-bold">Çeki seçmək üçün toxunun</span>
                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-2">PNG, JPG, JPEG</span>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleImageUpload(e, setUploadedReceipt)} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-48 rounded-2xl border-2 border-emerald-500/50 overflow-hidden bg-black flex items-center justify-center group">
                    <img src={uploadedReceipt} alt="Receipt" className="max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <button type="button" onClick={() => setUploadedReceipt(null)} className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition">Çeki Sil / Dəyiş</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-indigo-900/50 pt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-center sm:text-left">
                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1">Ümumi Məbləğ</span>
                  <span className="text-3xl font-black text-white tracking-tighter">{cart.reduce((sum, item) => sum + item.package.price, 0)} <span className="text-lg text-indigo-400">AZN</span></span>
                </div>
                <button type="submit" disabled={isEmailSending} className="glow-btn w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3">
                  {isEmailSending ? <><div className="spinner"></div> İşlənir...</> : "Sifarişi Təsdiqlə"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER AUTH MODAL WITH ANIMATIONS */}
      {authMode && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-[2.5rem] p-8 md:p-10 animate-modal relative border border-indigo-500/30">
            <button onClick={() => setAuthMode(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white hover:bg-indigo-900 flex items-center justify-center text-xl font-bold transition">&times;</button>

            {showOtpSuccess ? (
              <div className="py-12 text-center space-y-6">
                <div className="success-check">✓</div>
                <h3 className="text-2xl font-black text-white tracking-tight">Kodu Göndərdik!</h3>
                <p className="text-sm font-medium text-gray-400">E-mail qutunuzu yoxlayın.</p>
              </div>
            ) : authMode === "login" ? (
              <div>
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Xoş Gəldiniz</h3>
                <p className="text-xs font-medium text-gray-400 mb-8">Davam etmək üçün hesabınıza giriş edin.</p>
                <form onSubmit={handleUserAuth} className="space-y-5">
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">E-poçt Ünvanı</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-4 rounded-xl text-sm" required /></div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Şifrə</label><input type="password" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-4 rounded-xl text-sm" required /></div>
                  <button type="submit" className="glow-btn w-full py-4 mt-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest">Giriş Et</button>
                </form>
                <div className="mt-8 pt-6 border-t border-indigo-950/50 text-center">
                  <p className="text-xs font-bold text-gray-500">Hesabınız yoxdur? <span onClick={() => setAuthMode("register")} className="text-indigo-400 cursor-pointer hover:text-indigo-300">İndi Yarat</span></p>
                </div>
              </div>
            ) : authMode === "register" ? (
              <div>
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Qeydiyyat</h3>
                <p className="text-xs font-medium text-gray-400 mb-8">Premium xidmətlərə qoşulmaq üçün məlumatları doldurun.</p>
                <form onSubmit={handleUserAuth} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Ad</label><input type="text" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} className="w-full p-4 rounded-xl text-sm" required /></div>
                    <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Soyad</label><input type="text" value={authForm.surname} onChange={(e) => setAuthForm({...authForm, surname: e.target.value})} className="w-full p-4 rounded-xl text-sm" required /></div>
                  </div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">E-poçt</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-4 rounded-xl text-sm" required /></div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Şifrə təyin edin</label><input type="password" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-4 rounded-xl text-sm" required /></div>
                  
                  <button type="submit" disabled={isEmailSending} className="glow-btn w-full py-4 mt-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-3 transition">
                    {isEmailSending ? <><div className="spinner"></div> İşlənir...</> : "Doğrulama Kodu Göndər 📩"}
                  </button>
                </form>
                <div className="mt-8 pt-6 border-t border-indigo-950/50 text-center">
                  <p className="text-xs font-bold text-gray-500">Artıq hesabınız var? <span onClick={() => setAuthMode("login")} className="text-indigo-400 cursor-pointer hover:text-indigo-300">Giriş edin</span></p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight text-center">Təsdiq Kodu</h3>
                <p className="text-[11px] font-bold text-gray-400 mb-8 text-center uppercase tracking-widest">E-poçtunuza gələn 6 rəqəmli kodu daxil edin</p>
                <form onSubmit={handleUserAuth} className="space-y-6">
                  <div>
                    <input type="text" value={authForm.otpInput} onChange={(e) => setAuthForm({...authForm, otpInput: e.target.value})} className="w-full p-5 rounded-2xl text-center text-3xl font-black tracking-[12px] bg-indigo-950/20 border-indigo-500/50 text-indigo-300 placeholder-indigo-900" placeholder="------" maxLength="6" required />
                  </div>
                  <button type="submit" className="glow-btn w-full py-5 bg-emerald-600 text-white rounded-xl font-black text-sm uppercase tracking-widest">Təsdiqlə və Daxil Ol</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN REVENUE LOG MODAL */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-[2.5rem] p-8 md:p-10 animate-modal relative">
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white transition flex items-center justify-center text-xl font-bold">&times;</button>
            <div className="w-16 h-16 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto shadow-lg">🛡️</div>
            <h3 className="text-2xl font-black text-white mb-2 text-center">Admin Paneli</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8 text-center">Səlahiyyətli şəxs girişi</p>
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">İstifadəçi Adı</label><input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full p-4 rounded-xl text-sm font-bold" required /></div>
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Şifrə</label><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 rounded-xl text-sm font-bold" required /></div>
              <button type="submit" className="w-full py-4 mt-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] transition">Sistemə Giriş</button>
            </form>
          </div>
        </div>
      )}

      {/* APPROVING ORDER DETAILS MODAL (ADMIN ONLY) */}
      {approvingOrder && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 animate-modal relative border border-emerald-500/30">
            <button onClick={() => setApprovingOrder(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white transition flex items-center justify-center text-xl font-bold">&times;</button>
            <h3 className="text-2xl font-black text-white mb-2">Sifarişi Təsdiqlə</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">Müştəri üçün abunəlik məlumatlarını daxil edin</p>
            <form onSubmit={approveOrderAction} className="space-y-5 bg-[#0c0c1d] p-6 rounded-2xl border border-indigo-900/30">
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Hesab E-maili / Giriş Adı</label><input type="text" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="w-full p-4 rounded-xl text-sm font-bold text-emerald-300" required /></div>
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Hesab Şifrəsi</label><input type="text" value={accountPass} onChange={(e) => setAccountPass(e.target.value)} className="w-full p-4 rounded-xl text-sm font-bold text-emerald-300" required /></div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setApprovingOrder(null)} className="w-1/3 py-4 bg-indigo-950/40 text-gray-400 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-900/60 transition">Ləğv</button>
                <button type="submit" className="w-2/3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition">Göndər ✉️</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDITING PRODUCT MODAL (ADMIN ONLY) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 animate-modal relative">
            <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white transition flex items-center justify-center text-xl font-bold">&times;</button>
            <h3 className="text-2xl font-black text-white mb-8">{editingProduct.id ? "Məhsulu Redaktə Et" : "Yeni Məhsul Yarat"}</h3>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Məhsulun Adı</label><input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-4 rounded-xl text-sm" required /></div>
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Açıqlama</label><textarea rows="2" value={editingProduct.desc} onChange={(e) => setEditingProduct({...editingProduct, desc: e.target.value})} className="w-full p-4 rounded-xl text-sm" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Kateqoriya</label>
                  <select value={editingProduct.cat} onChange={(e) => setEditingProduct({...editingProduct, cat: e.target.value})} className="w-full p-4 rounded-xl text-sm bg-[#0c0c1d] border-indigo-900/50">
                    <option value="entertainment">Əyləncə</option>
                    <option value="ai">Süni İntellekt</option>
                    <option value="design">Dizayn</option>
                  </select>
                </div>
                <div><label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Logo Rəngi (Hex)</label><input type="text" value={editingProduct.color} onChange={(e) => setEditingProduct({...editingProduct, color: e.target.value})} className="w-full p-4 rounded-xl text-sm" /></div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setEditingProduct(null)} className="w-1/3 py-4 bg-indigo-950/40 text-gray-400 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-900/60 transition">Ləğv</button>
                <button type="submit" className="w-2/3 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition">Saxla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CART DRAWER RIGHT SIDE */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/60 backdrop-blur-sm flex justify-end">
          <div className="glass-card w-full max-w-md h-full flex flex-col justify-between drawer-open rounded-none border-y-0 border-r-0 border-l border-indigo-500/30">
            <div className="p-8 pb-4 h-full flex flex-col">
              <div className="flex justify-between items-center pb-6 border-b border-indigo-900/50 mb-6">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><Icons.Cart /></div> Səbətiniz
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:bg-indigo-900 hover:text-white transition flex items-center justify-center text-xl font-bold">&times;</button>
              </div>
              
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-indigo-950/40 rounded-full flex items-center justify-center border border-indigo-900/50">
                    <span className="text-4xl opacity-50"><Icons.Cart /></span>
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Səbətiniz boşdur</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 hover:border-indigo-500/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">{getOfficialLogo(item.product.name, item.product.emoji, item.product.color)}</div>
                        <div>
                          <h4 className="text-sm font-black text-white mb-1">{item.product.name}</h4>
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded">{item.package.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-base text-white tracking-tight">{item.package.price} <span className="text-[10px] text-gray-500">AZN</span></span>
                        <button onClick={() => removeFromCart(index)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-950/30 text-red-400 hover:bg-red-600 hover:text-white transition opacity-50 group-hover:opacity-100">&times;</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-black/40 border-t border-indigo-900/50 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Ümumi Məbləğ</span>
                  <span className="text-3xl font-black text-white tracking-tighter">{cart.reduce((sum, item) => sum + item.package.price, 0)} <span className="text-lg text-indigo-400">AZN</span></span>
                </div>
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="glow-btn w-full py-5 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                  Ödənişə Keç
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP BUTTON (Req 14) */}
      <a href="https://wa.me/994103136941" target="_blank" rel="noreferrer" className="fixed bottom-8 right-8 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 hover:-translate-y-2 transition-all duration-300 group flex items-center gap-0 hover:gap-3 overflow-hidden">
        <Icons.WhatsApp />
        <span className="font-black text-sm tracking-wider uppercase max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">Bizə Yazın</span>
      </a>

      {/* FOOTER & CONTACT (Req 1, 4, 15) */}
      <footer className="border-t border-indigo-900/50 bg-[#030308] mt-20 relative overflow-hidden" id="footer">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
        
        {/* Warranty Banner */}
        <div className="bg-indigo-950/20 py-8 border-b border-indigo-900/30">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-6 md:gap-12">
             <div className="flex items-center gap-3"><div className="text-emerald-400"><Icons.Shield /></div><span className="font-black text-white text-sm uppercase tracking-widest">100% Rəsmi Zəmanət</span></div>
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 hidden md:block" />
             <div className="flex items-center gap-3"><div className="text-indigo-400"><Icons.Mail /></div><span className="font-black text-white text-sm uppercase tracking-widest">Sürətli Çatdırılma</span></div>
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 hidden md:block" />
             <div className="flex items-center gap-3"><div className="text-pink-400"><Icons.Headset /></div><span className="font-black text-white text-sm uppercase tracking-widest">Aktiv Dəstək</span></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-2 gap-12">
          {/* Brand Col */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <img 
                  src="./Premium.png" 
                  alt="Premium Shop" 
                  className="h-12 object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className="hidden items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-xl">PS</div>
                  <span className="font-extrabold text-2xl tracking-tight text-white">Premium <span className="text-indigo-400">Shop</span></span>
                </div>
            </div>
            <p className="text-sm font-medium text-gray-400 leading-relaxed max-w-sm">Azərbaycanın ən güvənli rəqəmsal abunəlik satışı platforması. Gündəlik rəqəmsal ehtiyaclarınızı Premium keyfiyyətlə qarşılayın.</p>
          </div>

          {/* Contact Col */}
          <div className="md:text-right space-y-6">
            <h4 className="text-lg font-black text-white uppercase tracking-widest">Əlaqə Vasitələri</h4>
            <div className="flex flex-col md:items-end gap-4">
               <a href="https://wa.me/994103136941" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-gray-400 hover:text-[#25D366] font-bold text-sm transition group">
                 <div className="w-10 h-10 rounded-full bg-indigo-950/40 border border-indigo-900/50 flex items-center justify-center group-hover:border-[#25D366] group-hover:bg-[#25D366]/10 transition"><Icons.WhatsApp /></div>
                 +994 10 313 69 41
               </a>
               <a href="mailto:premiumshopazerbaycan@gmail.com" className="inline-flex items-center gap-3 text-gray-400 hover:text-indigo-400 font-bold text-sm transition group">
                 <div className="w-10 h-10 rounded-full bg-indigo-950/40 border border-indigo-900/50 flex items-center justify-center group-hover:border-indigo-400 group-hover:bg-indigo-400/10 transition"><Icons.Mail /></div>
                 premiumshopazerbaycan@gmail.com
               </a>
            </div>
          </div>
        </div>

        {/* Copyright & Admin Link */}
        <div className="border-t border-indigo-900/30 py-8 bg-[#020205]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
            <span>Premium Shop © 2026. Bütün Hüquqlar Qorunur.</span>
            <span onClick={() => setIsAdminModalOpen(true)} className="cursor-pointer hover:text-indigo-400 transition flex items-center gap-2">🛡️ İdarəetmə (Admin)</span>
          </div>
        </div>
      </footer>
    </>
  );
}

// Notification feedback components
function Notif({ n }) {
  if (!n) return null;
  const colors = n.type === "error" ? "bg-red-950/90 border-red-500 text-red-100 shadow-[0_10px_40px_rgba(239,68,68,0.4)]" 
             : n.type === "info" ? "bg-blue-950/90 border-blue-500 text-blue-100 shadow-[0_10px_40px_rgba(59,130,246,0.4)]" 
             : "bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-[0_10px_40px_rgba(16,185,129,0.4)]";
  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-md animate-modal">
      <div className={`p-5 rounded-2xl border-2 backdrop-blur-xl font-black text-sm uppercase tracking-wider text-center ${colors}`}>{n.msg}</div>
    </div>
  );
}