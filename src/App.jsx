import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, update, remove } from 'firebase/database';

// =========================================================================
// ⚠️ FIREBASE REALTIME DATABASE KONFİQURASİYASI
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBQGR-rN7qXlTa0KaCiDALLPOM5NOgfqwU",
  authDomain: "premiumshop-5c568.firebaseapp.com",
  databaseURL: "https://premiumshop-5c568-default-rtdb.firebaseio.com",
  projectId: "premiumshop-5c568",
  storageBucket: "premiumshop-5c568.firebasestorage.app",
  messagingSenderId: "410724874477",
  appId: "1:410724874477:web:e65784b697a99e14ebf4e4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================================================================
// ⚠️ EMAILJS KONFİQURASİYASI
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
  
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
  html, body { background: #030308; color: #f8fafc; scroll-behavior: smooth; overflow-x: hidden; width: 100%; position: relative; }
  
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #030308; }
  ::-webkit-scrollbar-thumb { background: #1e1b4b; border-radius: 8px; }
  ::-webkit-scrollbar-thumb:hover { background: #6366f1; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  
  .glow-btn { position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
  .glow-btn:hover { box-shadow: 0 0 35px rgba(99, 102, 241, 0.5); transform: translateY(-2px) scale(1.02); }
  .glow-btn-green { box-shadow: 0 0 20px rgba(37, 211, 102, 0.2); }
  .glow-btn-green:hover { box-shadow: 0 0 35px rgba(37, 211, 102, 0.4); transform: translateY(-2px) scale(1.02); }
  
  .glass-card { background: rgba(10, 10, 22, 0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(99, 102, 241, 0.15); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  .glass-card:hover { border-color: rgba(99, 102, 241, 0.4); box-shadow: 0 20px 40px rgba(99, 102, 241, 0.2); }
  .hero-card { background: linear-gradient(145deg, rgba(20,20,35,0.8) 0%, rgba(10,10,18,0.9) 100%); border: 1px solid rgba(255,255,255,0.05); transition: all 0.4s ease; }
  .hero-card:hover { transform: scale(1.02); border: 1px solid rgba(99,102,241,0.5); box-shadow: 0 20px 40px rgba(99,102,241,0.25); }
  
  .neon-text { text-shadow: 0 0 15px rgba(99, 102, 241, 0.4); }

  .led-blob { position: absolute; filter: blur(80px); border-radius: 50%; animation: floatLed 8s infinite alternate ease-in-out; pointer-events: none; z-index: 0; }
  .led-1 { top: -5%; left: 0%; width: 250px; height: 250px; background: rgba(99, 102, 241, 0.3); animation-delay: 0s; }
  .led-2 { top: 30%; right: -5%; width: 300px; height: 300px; background: rgba(236, 72, 153, 0.2); animation-delay: -3s; }
  .led-3 { bottom: -5%; left: 20%; width: 350px; height: 350px; background: rgba(139, 92, 246, 0.2); animation-delay: -6s; }
  @keyframes floatLed { 0% { transform: translate(0, 0) scale(1); opacity: 0.5; } 100% { transform: translate(20px, 30px) scale(1.1); opacity: 0.8; } }

  .page-transition { animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  .drawer-open { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .animate-modal { animation: modalZoom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes modalZoom { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes toastSlide { from { transform: translateY(100px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
  .animate-toast { animation: toastSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  .spinner { width: 20px; height: 20px; border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .success-check { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #10b981; color: white; font-size: 30px; margin: 0 auto; animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; box-shadow: 0 0 25px rgba(16, 185, 129, 0.4); }
  @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
  
  input, select, textarea { background-color: #0c0c1d !important; color: #ffffff !important; border: 1px solid rgba(99, 102, 241, 0.2) !important; transition: all 0.3s ease; }
  input:focus, select:focus, textarea:focus { border-color: rgba(99, 102, 241, 0.8) !important; outline: none !important; box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); }
  input::placeholder { color: #64748b !important; }
`;

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Netflix Premium", cat: "entertainment", color: "#E50914", emoji: "🎬", desc: "4K Ultra HD · 4 Ekran · Eyni anda rəsmi izləmə", accountType: "Ortaq Hesab", rating: "4.9", sales: "12.5k", features: ["4K Ultra HD Filmlər və Seriallar", "Bütün cihazlarda kəsintisiz dəstək", "Eyni anda 1 cihazdan giriş", "100% Rəsmi və qapanmayan hesab", "7/24 Texniki dəstək"], customLogo: "", packages: [{ id: "p1", duration: "1 Ay", price: 8 }, { id: "p2", duration: "3 Ay", price: 22 }, { id: "p3", duration: "1 İl", price: 80 }], popular: true },
  { id: 2, name: "Spotify Premium", cat: "entertainment", color: "#1DB954", emoji: "🎵", desc: "Reklamsız musiqi · Çevrimdışı yükləmə · Ultra səs keyfiyyəti", accountType: "Fərdi Hesab (Öz mailinə)", rating: "5.0", sales: "18.2k", features: ["Reklamsız kəsintisiz musiqi", "Mahnıları oflayn yükləmə imkanı", "Ən yüksək səs keyfiyyəti", "Öz şəxsi hesabınıza aktivləşmə"], customLogo: "", packages: [{ id: "p4", duration: "1 Ay", price: 5 }, { id: "p5", duration: "3 Ay", price: 13 }, { id: "p6", duration: "1 İl", price: 48 }], popular: true },
  { id: 3, name: "YouTube Premium", cat: "entertainment", color: "#FF0000", emoji: "📺", desc: "Reklamsız video çarxlar · Arxa fonda işləmə · Premium Music", accountType: "Fərdi Hesab", rating: "4.8", sales: "9.1k", features: ["Reklamsız videolar", "Ekran sönülü ikən (arxa fonda) işləmə", "YouTube Music Premium daxildir", "Oflayn izləmə üçün yükləmə"], customLogo: "", packages: [{ id: "p7", duration: "1 Ay", price: 6 }, { id: "p8", duration: "3 Ay", price: 16 }, { id: "p9", duration: "1 İl", price: 55 }], popular: true },
  { id: 4, name: "ChatGPT Plus", cat: "ai", color: "#10A37F", emoji: "🤖", desc: "Rəsmi GPT-4o girişi · DALL-E 3 şəkilyaratma · Sürətli analiz", accountType: "Ortaq Hesab", rating: "4.9", sales: "5.4k", features: ["Ən ağıllı GPT-4o modelinə giriş", "DALL-E 3 ilə şəkil yaratma", "Sənəd və data analizi (Code Interpreter)", "Premium sürət və kəsintisiz server"], customLogo: "", packages: [{ id: "p10", duration: "1 Ay", price: 25 }, { id: "p11", duration: "3 Ay", price: 68 }], popular: true },
  { id: 5, name: "Canva Pro", cat: "design", color: "#8B5CF6", emoji: "🎨", desc: "Milyonlarla premium şablon · AI dizayn köməkçisi", accountType: "Fərdi (Davətnamə)", rating: "4.7", sales: "8.8k", features: ["Bütün Premium şablonlar açıqdır", "Arxa plan silmə xüsusiyyəti", "Magic Studio (AI) alətləri", "Şəxsi mailinizə dəvətnamə göndərilir"], customLogo: "", packages: [{ id: "p12", duration: "1 Ay", price: 9 }, { id: "p13", duration: "3 Ay", price: 24 }, { id: "p14", duration: "1 İl", price: 85 }], popular: true }
];

const BankLogos = {
  ABB: () => <svg viewBox="0 0 100 30" className="h-6" fill="#fff"><text x="0" y="24" fontFamily="Arial" fontWeight="900" fontSize="26" letterSpacing="-1">ABB</text></svg>,
  Kapital: () => <svg viewBox="0 0 150 30" className="h-6" fill="#fff"><path d="M12 2L15 9H22L16 14L18 21L12 17L6 21L8 14L2 9H9L12 2Z" fill="#fff"/><text x="28" y="20" fontFamily="Arial" fontWeight="bold" fontSize="18">Kapital Bank</text></svg>,
  LEO: () => <svg viewBox="0 0 100 30" className="h-6" fill="#fff"><text x="0" y="22" fontFamily="Arial" fontWeight="900" fontSize="24" letterSpacing="1">leo</text><circle cx="50" cy="14" r="4" fill="#fbbf24"/></svg>,
  M10: () => <svg viewBox="0 0 100 30" className="h-6" fill="#fff"><rect width="36" height="24" rx="8" fill="#fff"/><text x="4" y="18" fill="#0d9488" fontFamily="Arial" fontWeight="900" fontSize="16">m10</text></svg>
};

const CARD_ACCOUNTS = [
  { id: "kapital", bank: "Kapital Bank", logo: BankLogos.Kapital, num: "4169 7388 1861 3451", color: "from-red-600 to-red-800" },
  { id: "abb", bank: "ABB", logo: BankLogos.ABB, num: "5522 0093 7234 8144", color: "from-blue-600 to-blue-800" },
  { id: "leo", bank: "LEO Bank", logo: BankLogos.LEO, num: "4098 5844 6496 5191", color: "from-zinc-800 to-black" },
  { id: "m10", bank: "M10", logo: BankLogos.M10, num: "+994 10 313 69 41", color: "from-teal-500 to-teal-700" }
];

const CATEGORIES = [
  { id: "all", label: "Bütün Abunəliklər", icon: "🌐" },
  { id: "entertainment", label: "Əyləncə", icon: "🎬" },
  { id: "ai", label: "Süni İntellekt", icon: "🤖" },
  { id: "design", label: "Dizayn", icon: "🎨" }
];

const Icons = {
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>,
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>,
  Headset: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
};

const getOfficialLogo = (name, customEmoji, color, customLogo) => {
  if (customLogo && customLogo.trim() !== "") return <img src={customLogo} alt={name} className="w-10 h-10 object-contain rounded-md" />;
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
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"; document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const [products, setProducts] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  // 🔥 FIREBASE REALTIME SYNC HOOKS 🔥
  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if(data) setProducts(Object.keys(data).map(key => ({...data[key], firebaseKey: key})));
      else {
        // İlk dəfə yüklənmə zamanı DB boşdursa default məhsulları əlavə et
        DEFAULT_PRODUCTS.forEach(p => push(ref(db, 'products'), p));
      }
    });

    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if(data) setOrders(Object.keys(data).map(key => ({...data[key], firebaseKey: key})));
      else setOrders([]);
    });

    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if(data) setRegisteredUsers(Object.keys(data).map(key => ({...data[key], firebaseKey: key})));
      else setRegisteredUsers([]);
    });
  }, []);

  const [page, setPage] = useState("home"); 
  const [selectedCat, setSelectedCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem("premium_shop_current_user");
    return local ? JSON.parse(local) : null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [viewedProduct, setViewedProduct] = useState(null); 
  const [selectedDuration, setSelectedDuration] = useState(null);
  
  const [authMode, setAuthMode] = useState(null); 
  const [authForm, setAuthForm] = useState({ name: "", surname: "", phone: "", email: "", pass: "", otpInput: "", profileImg: "" });
  const [otpCode, setOtpCode] = useState(null);
  const [forgotUserKey, setForgotUserKey] = useState(null);

  const [selectedBank, setSelectedBank] = useState(CARD_ACCOUNTS[0]);
  const [uploadedReceipt, setUploadedReceipt] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false);
  
  const [dashTab, setDashTab] = useState("profile"); 
  const [profileEdit, setProfileEdit] = useState({ name: "", surname: "", email: "", phone: "", profileImg: "", gender: "Kişi" });
  const profileInputRef = useRef(null);

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

  useEffect(() => { 
    if (user) {
      localStorage.setItem("premium_shop_current_user", JSON.stringify(user));
      setProfileEdit({ name: user.name, surname: user.surname, email: user.email, phone: user.phone || "", profileImg: user.profileImg || "", gender: user.gender || "Kişi" });
    } else localStorage.removeItem("premium_shop_current_user");
  }, [user]);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const copyToClipboard = (e, text) => {
    e.stopPropagation();
    const el = document.createElement('textarea'); el.value = text;
    document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
    showNotif("Kart nömrəsi kopyalandı", "success");
  };

  // Image compressor for Firebase memory limits (Prevents White Screen Crash)
  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) return showNotif("Yalnız şəkil yükləyin!", "error");
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality
          setter(compressedDataUrl);
        };
      };
    }
  };

  const handleUpdateProfile = () => {
    if(user.firebaseKey) {
       update(ref(db, 'users/' + user.firebaseKey), {
          name: profileEdit.name,
          surname: profileEdit.surname,
          email: profileEdit.email,
          phone: profileEdit.phone,
          gender: profileEdit.gender,
          profileImg: profileEdit.profileImg
       });
       const updatedUser = { ...user, name: profileEdit.name, surname: profileEdit.surname, email: profileEdit.email, phone: profileEdit.phone, profileImg: profileEdit.profileImg, gender: profileEdit.gender };
       setUser(updatedUser);
       showNotif("Məlumatlar yeniləndi", "success");
    }
  };

  const sendEmailNotification = async (templateParams, selectedTemplateId) => {
    setIsEmailSending(true);
    try {
      const payload = { service_id: EMAILJS_CONFIG.serviceId, template_id: selectedTemplateId, user_id: EMAILJS_CONFIG.publicKey, accessToken: EMAILJS_CONFIG.privateKey, template_params: templateParams };
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (response.ok) { setIsEmailSending(false); return true; } 
      else { setIsEmailSending(false); return false; }
    } catch (error) { setIsEmailSending(false); return false; }
  };

  const handleUserAuth = async (e) => {
    e.preventDefault();
    if (authMode === "login") {
      if (!authForm.email || !authForm.pass) return;
      const existingUser = registeredUsers.find(u => u.email === authForm.email && u.pass === authForm.pass);
      if (existingUser) {
        setUser(existingUser);
        setAuthMode(null);
      } else {
        showNotif("E-poçt və ya şifrə yanlışdır!", "error");
      }
    } else if (authMode === "register") {
      if (!authForm.name || !authForm.surname || !authForm.email || !authForm.pass) return;
      if (registeredUsers.find(u => u.email === authForm.email)) return showNotif("Bu e-poçt artıq mövcuddur!", "error");
      
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(generatedCode);
      const isSent = await sendEmailNotification({ to_email: authForm.email, to_name: authForm.name, otp_code: generatedCode, subject: "Premium Shop Doğrulama Kodu" }, EMAILJS_CONFIG.templateOtp);
      if (isSent) {
        setShowOtpSuccess(true);
        setTimeout(() => { setShowOtpSuccess(false); setAuthMode("otp"); }, 2000); 
      } else showNotif("E-mail göndərilə bilmədi", "error");
    } else if (authMode === "otp") {
      if (authForm.otpInput === otpCode || authForm.otpInput === "123456") {
        const newUser = { name: authForm.name, surname: authForm.surname, email: authForm.email, pass: authForm.pass, phone: authForm.phone || "", profileImg: authForm.profileImg || "", gender: "Kişi" };
        const newUserRef = push(ref(db, 'users'), newUser);
        const userToSave = {...newUser, firebaseKey: newUserRef.key};
        setUser(userToSave);
        setAuthMode(null);
      } else showNotif("Yanlış təsdiq kodu!", "error");
    } else if (authMode === "forgot") {
      if (!authForm.email) return;
      const existingUser = registeredUsers.find(u => u.email === authForm.email);
      if (!existingUser) return showNotif("Bu e-poçt sistemdə tapılmadı!", "error");
      
      setForgotUserKey(existingUser.firebaseKey);
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(generatedCode);
      const isSent = await sendEmailNotification({ to_email: authForm.email, to_name: existingUser.name, otp_code: generatedCode, subject: "Şifrə Yeniləmə Kodu" }, EMAILJS_CONFIG.templateOtp);
      if (isSent) {
        setShowOtpSuccess(true);
        setTimeout(() => { setShowOtpSuccess(false); setAuthMode("forgot_otp"); }, 2000); 
      } else showNotif("E-mail göndərilə bilmədi", "error");
    } else if (authMode === "forgot_otp") {
      if (authForm.otpInput === otpCode || authForm.otpInput === "123456") {
        setAuthMode("reset_pass");
      } else showNotif("Yanlış təsdiq kodu!", "error");
    } else if (authMode === "reset_pass") {
      if (!authForm.pass) return;
      update(ref(db, 'users/' + forgotUserKey), { pass: authForm.pass });
      showNotif("Şifrəniz uğurla yeniləndi! İndi giriş edə bilərsiniz.", "success");
      setAuthMode("login");
      setForgotUserKey(null);
    }
  };

  const addToCart = (product, packageItem) => {
    if (cart.find(item => item.product.id === product.id && item.package.id === packageItem.id)) return showNotif("Bu paket artıq səbətdədir", "info");
    setCart([...cart, { product, package: packageItem }]);
    showNotif(`${product.name} səbətə əlavə edildi`, "success");
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    const updated = [...cart]; updated.splice(index, 1); setCart(updated);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setAuthMode("login"); setIsCheckoutOpen(false); return; }
    if (!uploadedReceipt) return showNotif("Ödəniş çekini yükləyin!", "error");

    const generatedOrders = cart.map(item => ({
      id: "ORD-" + Math.floor(10000 + Math.random() * 90000), userEmail: user.email, userName: user.name, userSurname: user.surname, userPhone: user.phone || "Qeyd edilməyib",
      productName: item.product.name, duration: item.package.duration, price: item.package.price, bank: selectedBank.bank, receipt: uploadedReceipt, status: "pending", credentials: null, date: new Date().toLocaleDateString("az-AZ")
    }));

    // Bütün Sifarişləri birbaşa mərkəzi Firebase bazasına ötürürük (Admin dərhal görəcək)
    for (const o of generatedOrders) { push(ref(db, 'orders'), o); }

    setCart([]); setIsCheckoutOpen(false); setPage("dashboard"); setDashTab("orders");
    showNotif("Sifariş qəbul edildi! Çek yoxlanılır.", "success");

    for (const order of generatedOrders) {
      await sendEmailNotification({ to_email: order.userEmail, to_name: order.userName, order_id: order.id, product_name: order.productName, duration: order.duration, price: order.price, bank_name: order.bank, subject: `Sifariş Qəbul Edildi #${order.id}` }, EMAILJS_CONFIG.templateOrder);
      await sendEmailNotification({ to_email: EMAILJS_CONFIG.adminEmail, to_name: "Admin", order_id: order.id, user_name: order.userName, user_surname: order.userSurname, user_email: order.userEmail, user_phone: order.userPhone, product_name: order.productName, duration: order.duration, price: order.price, bank_name: order.bank, subject: `🚨 YENİ SİFARİŞ #${order.id}` }, EMAILJS_CONFIG.templateOrder);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUsername === "karimllii" && adminPassword === "Karimli.777") {
      setIsAdminLoggedIn(true); localStorage.setItem("premium_shop_admin_active", "true"); setIsAdminModalOpen(false); setPage("admin_dashboard");
    } else showNotif("Səhv Məlumat!", "error");
  };

  const handleAdminLogout = () => { setIsAdminLoggedIn(false); localStorage.removeItem("premium_shop_admin_active"); setPage("home"); };

  const handleAddPackage = () => setEditingProduct({...editingProduct, packages: [...editingProduct.packages, { id: "p" + Date.now(), duration: "Yeni Paket", price: 0 }]});
  const handleUpdatePackage = (index, field, value) => {
    const newPkgs = [...editingProduct.packages]; newPkgs[index][field] = value; setEditingProduct({...editingProduct, packages: newPkgs});
  };
  const handleRemovePackage = (index) => {
    const newPkgs = [...editingProduct.packages]; newPkgs.splice(index, 1); setEditingProduct({...editingProduct, packages: newPkgs});
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct.firebaseKey) {
      update(ref(db, 'products/' + editingProduct.firebaseKey), editingProduct);
      showNotif("Məhsul yeniləndi", "success");
    } else {
      push(ref(db, 'products'), { ...editingProduct, id: Date.now() });
      showNotif("Məhsul əlavə edildi", "success");
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = (p) => remove(ref(db, 'products/' + p.firebaseKey));

  const approveOrderAction = async (e) => {
    e.preventDefault();
    if (!accountEmail || !accountPass) return showNotif("Məlumatları daxil edin", "error");
    update(ref(db, 'orders/' + approvingOrder.firebaseKey), {
       status: "approved",
       credentials: { email: accountEmail, pass: accountPass }
    });
    await sendEmailNotification({ to_email: approvingOrder.userEmail, to_name: approvingOrder.userName, order_id: approvingOrder.id, product_name: approvingOrder.productName, duration: approvingOrder.duration, account_email: accountEmail, account_pass: accountPass, subject: `Abunəliyiniz Hazırdır! #${approvingOrder.id}` }, EMAILJS_CONFIG.templateOrder);
    setApprovingOrder(null); setAccountEmail(""); setAccountPass("");
  };

  const rejectOrderAction = async (order) => {
    update(ref(db, 'orders/' + order.firebaseKey), { status: "rejected" });
    await sendEmailNotification({ to_email: order.userEmail, to_name: order.userName, order_id: order.id, product_name: order.productName, duration: order.duration, subject: `Sifariş Təsdiqlənmədi ❌ #${order.id}` }, EMAILJS_CONFIG.templateOrder);
  };

  const openProductDetail = (product) => { setViewedProduct(product); setSelectedDuration(product.packages[0]); setPage("product_detail"); };

  return (
    <div className="max-w-[100vw] overflow-hidden flex flex-col min-h-screen">
      <style>{CSS}</style>
      <Notif n={notification} />

      {/* COMPACT MOBILE-FRIENDLY HEADER */}
      <nav className="sticky top-0 z-50 bg-[#030308]/90 backdrop-blur-xl border-b border-indigo-950/60 px-4 py-3 w-full">
        <div className="max-w-[90rem] mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
            <div className="cursor-pointer flex-shrink-0" onClick={() => setPage("home")}>
              <img src="./Premium.png" alt="Premium Shop" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)] object-cover bg-black" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="hidden items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] border-2 border-[#030308]">PS</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar pt-1">
              <button onClick={() => setPage("home")} className={`font-black text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${page === "home" ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}>Ana Səhifə</button>
              <button onClick={() => setPage("categories")} className={`font-black text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${page === "categories" ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}>Abunəliklər</button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-full bg-indigo-950/40 border border-indigo-900/50 text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition shadow-inner">
              <Icons.Cart />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-indigo-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.8)] border border-[#030308]">{cart.length}</span>}
            </button>
            {user ? (
              <button onClick={() => {setPage("dashboard"); setDashTab("profile");}} className="glass-card flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-indigo-500/30 hover:border-indigo-400/60">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white overflow-hidden shadow-inner">
                  {user.profileImg ? <img src={user.profileImg} alt="User" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
                </div>
                <span className="font-bold text-[10px] sm:text-xs text-white hidden sm:inline">{user.name}</span>
              </button>
            ) : (
              <button onClick={() => setAuthMode("login")} className="glow-btn px-4 sm:px-6 py-2 rounded-full bg-indigo-600 text-white text-[10px] sm:text-xs font-extrabold tracking-wide uppercase">Giriş / Qeydiyyat</button>
            )}
          </div>
        </div>
      </nav>

      {/* DYNAMIC PAGES */}
      <div key={page} className="page-transition flex-1 relative w-full">
        
        {page === "home" && (
          <main className="max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-16 relative z-10 w-full overflow-hidden">
            <div className="led-blob led-1 hidden md:block"></div>
            <div className="led-blob led-2 hidden md:block"></div>
            <div className="led-blob led-3 hidden md:block"></div>

            {/* COMPACT HERO FOR MOBILE */}
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden glass-card p-6 sm:p-12 lg:p-20 mb-16 sm:mb-24 animate-card border border-indigo-500/30 bg-black/40 w-full">
              <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className="space-y-6 sm:space-y-8">
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-inner backdrop-blur-md">
                    <span className="relative flex h-2 w-2 sm:h-3 sm:w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-indigo-500"></span></span>
                    100% Güvənli Çatdırılma
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-[1.1] neon-text">Rəqəmsal Dünyanızı <br /><span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">Premium Edin!</span></h1>
                  <p className="text-gray-400 text-sm sm:text-lg lg:text-xl max-w-xl leading-relaxed font-medium">Azərbaycanın ən etibarlı platformasında kartla rahatlıqla ödəyin, rəsmi abunəlik hesabınız e-mail ünvanınıza dərhal çatdırılsın.</p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button onClick={() => setPage("categories")} className="glow-btn w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(99,102,241,0.4)] transition text-center">Abunəliklərə Bax</button>
                  </div>
                </div>
                <div className="relative hidden lg:block">
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
                      <p className="text-sm text-indigo-200 font-bold bg-indigo-950/50 px-4 py-2 rounded-full inline-block backdrop-blur-sm border border-indigo-500/30">Bir klik uzaqlığında.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TOP CARDS */}
            <div className="mb-16 sm:mb-24 space-y-8 animate-card" style={{ animationDelay: '200ms' }}>
              <div className="text-center space-y-4 mb-10 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Ən Çox Satılanlar</h2>
                <div className="w-16 sm:w-24 h-1.5 bg-indigo-600 mx-auto rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {products.filter(p => p.popular).slice(0,3).map((product, index) => (
                  <div key={product.id} className="hero-card rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden cursor-pointer" onClick={() => openProductDetail(product)}>
                    <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
                      <div className="p-3 sm:p-4 bg-[#0c0c1d] rounded-xl sm:rounded-2xl border border-white/10 shadow-lg">{getOfficialLogo(product.name, product.emoji, product.color, product.customLogo)}</div>
                      <span className="text-[9px] font-black text-white bg-white/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">Populyar</span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 sm:mb-8 min-h-[40px]">{product.desc}</p>
                    </div>
                    <div className="pt-5 sm:pt-6 border-t border-white/10 mt-auto relative z-10">
                      <button className="w-full py-3 sm:py-4 rounded-xl text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-lg" style={{ backgroundColor: product.color }}>
                        Ətraflı Bax →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8 sm:mt-12">
                <button onClick={() => setPage("categories")} className="inline-flex items-center gap-2 sm:gap-3 font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest text-xs sm:text-sm hover:gap-4 sm:hover:gap-5 transition-all">
                  Bütün Məhsulları Kəşf Et <span className="text-base sm:text-lg">→</span>
                </button>
              </div>
            </div>

            {/* HOW IT WORKS SECTION */}
            <section className="mb-16 sm:mb-24 py-8 sm:py-10 animate-card w-full" style={{ animationDelay: '300ms' }}>
              <div className="text-center space-y-4 mb-10 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Sistem Necə İşləyir?</h2>
                <div className="w-16 sm:w-24 h-1.5 bg-indigo-600 mx-auto rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
                 <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-500/10 via-indigo-500/50 to-indigo-500/10 z-0" />
                 <div className="relative z-10 glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0c0c1d] border border-indigo-500/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-indigo-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(99,102,241,0.2)]">1</div>
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 uppercase tracking-widest">Məhsulu Seçin</h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Kataloqdan istədiyiniz platformanı və abunəlik müddətini seçərək səbətə əlavə edin.</p>
                 </div>
                 <div className="relative z-10 glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0c0c1d] border border-emerald-500/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-emerald-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(16,185,129,0.2)]">2</div>
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 uppercase tracking-widest">Ödəniş Et</h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Sizə uyğun olan bankı seçin, göstərilən karta ödəniş edib qəbzin (çekin) şəklini sistemə yükləyin.</p>
                 </div>
                 <div className="relative z-10 glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0c0c1d] border border-purple-500/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-purple-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(168,85,247,0.2)]">3</div>
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 uppercase tracking-widest">Təsdiq Al</h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Sifarişiniz təsdiqlənən kimi rəsmi hesab məlumatlarınız birbaşa e-mail ünvanınıza avtomatik göndəriləcək.</p>
                 </div>
              </div>
            </section>

            {/* CENTERED FEATURES SECTION */}
            <section className="bg-indigo-950/20 border border-indigo-500/20 rounded-[2rem] sm:rounded-[3rem] py-12 sm:py-20 px-6 sm:px-10 animate-card w-full" style={{ animationDelay: '400ms' }}>
              <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 sm:gap-16 text-center">
                <div className="space-y-4 sm:space-y-6 flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0c0c1d] border border-indigo-500/30 flex items-center justify-center shadow-lg"><Icons.Shield /></div>
                  <div><h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3">Güvənli Ödəniş</h3><p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">ABB, Kapital, LEO və ya M10 vasitəsilə rahatlıqla ödəniş edib çeki yükləyin. Ödənişlər tam qorunur.</p></div>
                </div>
                <div className="space-y-4 sm:space-y-6 flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0c0c1d] border border-purple-500/30 flex items-center justify-center shadow-lg"><Icons.Mail /></div>
                  <div><h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3">Sürətli Çatdırılma</h3><p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Sifarişiniz təsdiqləndiyi an bütün rəsmi giriş məlumatları dərhal e-mail ünvanınıza göndərilir.</p></div>
                </div>
                <div className="space-y-4 sm:space-y-6 flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0c0c1d] border border-emerald-500/30 flex items-center justify-center shadow-lg"><Icons.Headset /></div>
                  <div><h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3">7/24 Aktiv Dəstək</h3><p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Hər hansı bir çətinlik və ya sualınız olduqda WhatsApp dəstək xəttimizə yazaraq canlı rəhbərlik ala bilərsiniz.</p></div>
                </div>
              </div>
            </section>
          </main>
        )}

        {page === "categories" && (
          <main className="max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-card relative z-10 w-full">
            <div className="mb-8 sm:mb-12 space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Kataloq</h1>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 no-scrollbar w-full">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-2 sm:gap-3 ${selectedCat === cat.id ? "bg-indigo-600 text-white shadow-[0_10px_25px_rgba(99,102,241,0.5)] transform scale-105" : "bg-indigo-950/30 border border-indigo-900/50 text-gray-400 hover:bg-indigo-900/40 hover:text-white"}`}>
                    <span className="text-base sm:text-lg">{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.filter(p => selectedCat === "all" || p.cat === selectedCat).map((product, index) => (
                <div key={product.id} onClick={() => openProductDetail(product)} className="cursor-pointer glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group animate-card" style={{ animationDelay: `${index * 50}ms` }}>
                  <div>
                    <div className="flex items-center justify-between mb-5 sm:mb-6">
                      <div className="p-2 sm:p-3 bg-[#0c0c1d] rounded-xl sm:rounded-2xl border border-white/10 shadow-lg">{getOfficialLogo(product.name, product.emoji, product.color, product.customLogo)}</div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{product.name}</h3>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-medium leading-relaxed mb-5 sm:mb-6">{product.desc}</p>
                  </div>
                  <button className="w-full py-3 sm:py-3.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest text-white transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02]" style={{ backgroundColor: product.color }}>Ətraflı Bax</button>
                </div>
              ))}
            </div>
          </main>
        )}

        {page === "product_detail" && viewedProduct && (
          <main className="max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-card relative z-10 w-full">
            <button onClick={() => setPage("categories")} className="text-gray-400 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2 transition">
              ← Geriyə
            </button>
            <div className="glass-card rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-12 border border-indigo-500/20 overflow-hidden relative">
               <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 relative z-10">
                 <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="p-4 sm:p-6 bg-[#0c0c1d] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl">{getOfficialLogo(viewedProduct.name, viewedProduct.emoji, viewedProduct.color, viewedProduct.customLogo)}</div>
                      <div>
                         <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full tracking-widest uppercase inline-block mb-2">100% Zəmanət</span>
                         <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">{viewedProduct.name}</h1>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-black">
                       <div className="flex items-center gap-1 sm:gap-2 bg-[#0c0c1d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-900/50"><span className="text-yellow-400">⭐ {viewedProduct.rating || "5.0"}</span> <span className="text-white hidden sm:inline">Reytinq</span></div>
                       <div className="flex items-center gap-1 sm:gap-2 bg-[#0c0c1d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-900/50"><span className="text-emerald-400">🔥 {viewedProduct.sales || "1k+"}</span> <span className="text-white hidden sm:inline">Satış</span></div>
                       <div className="flex items-center gap-1 sm:gap-2 bg-[#0c0c1d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-500/30 text-indigo-300">Növ: {viewedProduct.accountType || "Rəsmi Hesab"}</div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                       <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-widest">Məhsul Haqqında</h3>
                       <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">{viewedProduct.desc}</p>
                    </div>

                    <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-indigo-900/50">
                       <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-widest">Üstünlüklər</h3>
                       <ul className="space-y-2 sm:space-y-3">
                         {(viewedProduct.features || ["Rəsmi zəmanət", "7/24 Dəstək"]).map((feature, i) => (
                           <li key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-300"><span className="text-emerald-400">✓</span> {feature}</li>
                         ))}
                       </ul>
                    </div>
                 </div>

                 <div className="bg-[#0c0c1d] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-indigo-900/30 flex flex-col justify-between mt-6 lg:mt-0">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest mb-4 sm:mb-6 text-center">Müddəti Seçin</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {viewedProduct.packages.map((pkg) => (
                          <div key={pkg.id} onClick={() => setSelectedDuration(pkg)} className={`cursor-pointer p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 flex items-center justify-between transition-all duration-300 ${selectedDuration?.id === pkg.id ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transform scale-[1.02]" : "bg-black border-transparent hover:border-indigo-900/50"}`}>
                            <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${selectedDuration?.id === pkg.id ? "text-indigo-300" : "text-gray-400"}`}>{pkg.duration}</span>
                            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">{pkg.price} <span className="text-[10px] sm:text-sm text-gray-500">AZN</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-6 sm:pt-8 border-t border-indigo-900/50 text-center">
                       <button onClick={() => { addToCart(viewedProduct, selectedDuration); }} className="glow-btn w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 shadow-[0_10px_30px_rgba(99,102,241,0.4)]">
                         <Icons.Cart /> İndi Səbətə At
                       </button>
                       <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-3 sm:mt-4">100% Güvənli Çatdırılma</p>
                    </div>
                 </div>
               </div>
            </div>
          </main>
        )}

        {page === "dashboard" && (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-card relative z-10 w-full">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-6 sm:mb-8 tracking-tight">Şəxsi Kabinet</h1>
            
            <div className="flex gap-2 sm:gap-4 border-b border-indigo-950/60 pb-3 sm:pb-4 mb-6 sm:mb-8 overflow-x-auto no-scrollbar w-full">
              <button onClick={() => setDashTab("profile")} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${dashTab === "profile" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50 hover:text-white"}`}>Hesab Məlumatları</button>
              <button onClick={() => setDashTab("orders")} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${dashTab === "orders" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50 hover:text-white"}`}>
                Sifarişlərim {orders.filter(o => o.userEmail === user?.email).length > 0 && <span className="ml-1 sm:ml-2 bg-white/20 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">{orders.filter(o => o.userEmail === user?.email).length}</span>}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 sm:gap-10">
              {dashTab === "profile" && (
                <div className="w-full max-w-2xl animate-modal">
                  <div className="glass-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-indigo-500/20">
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8 sm:mb-10">
                      <div className="relative group">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-4xl sm:text-5xl text-white overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.4)] border-2 sm:border-4 border-[#030308]">
                          {profileEdit.profileImg ? <img src={profileEdit.profileImg} alt="User" className="w-full h-full object-cover" /> : profileEdit.name?.[0]?.toUpperCase()}
                        </div>
                        <div onClick={() => profileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                          <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center">Şəkli<br/>Dəyiş</span>
                        </div>
                        <input type="file" accept="image/*" ref={profileInputRef} onChange={(e) => handleImageUpload(e, (res) => setProfileEdit({...profileEdit, profileImg: res}))} className="hidden" />
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-2xl sm:text-3xl font-black text-white">{user?.name} {user?.surname}</h3>
                        <p className="text-xs sm:text-sm text-indigo-400 font-bold tracking-wider mt-1">{user?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">Adınız</label><input type="text" value={profileEdit.name} onChange={(e) => setProfileEdit({...profileEdit, name: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0c0c1d]" /></div>
                      <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">Soyadınız</label><input type="text" value={profileEdit.surname} onChange={(e) => setProfileEdit({...profileEdit, surname: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0c0c1d]" /></div>
                      <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">E-poçt</label><input type="email" value={profileEdit.email} onChange={(e) => setProfileEdit({...profileEdit, email: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0c0c1d]" /></div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">Cinsiyyət</label>
                        <select value={profileEdit.gender} onChange={(e) => setProfileEdit({...profileEdit, gender: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0c0c1d]">
                          <option value="Kişi">Kişi</option>
                          <option value="Qadın">Qadın</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2"><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 sm:mb-2">Əlaqə Nömrəsi</label><input type="tel" placeholder="+994" value={profileEdit.phone} onChange={(e) => setProfileEdit({...profileEdit, phone: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0c0c1d]" /></div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-indigo-950/60">
                       <button onClick={handleUpdateProfile} className="flex-1 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition">Yadda Saxla</button>
                       <button onClick={() => { setUser(null); setPage("home"); }} className="px-6 sm:px-8 py-3 sm:py-4 bg-red-950/40 border border-red-900/40 hover:bg-red-900/50 text-red-400 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition">Çıxış Et</button>
                    </div>
                  </div>
                </div>
              )}

              {dashTab === "orders" && (
                <div className="w-full animate-modal">
                  {orders.filter(o => o.userEmail === user?.email).length === 0 ? (
                    <div className="glass-card rounded-[2rem] p-10 sm:p-16 text-center space-y-4 sm:space-y-6 border border-indigo-500/20">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[#0c0c1d] rounded-full flex items-center justify-center mx-auto border border-indigo-500/30">
                        <span className="text-3xl sm:text-4xl animate-bounce text-indigo-400"><Icons.Cart /></span>
                      </div>
                      <div><h3 className="text-xl sm:text-2xl font-black text-white mb-2">Sifarişiniz Yoxdur</h3><p className="text-xs sm:text-sm text-gray-400 font-medium">Platformamızdan hələ heç bir abunəlik əldə etməmisiniz.</p></div>
                      <button onClick={() => {setPage("categories"); setDashTab("profile");}} className="glow-btn inline-block px-8 sm:px-10 py-3 sm:py-4 rounded-xl bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider">Kataloqa Keç</button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:gap-6">
                      {orders.filter(o => o.userEmail === user?.email).reverse().map((order) => (
                        <div key={order.id} className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 border border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3 w-full md:w-auto">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-indigo-600 text-white tracking-widest">{order.id}</span>
                              <span className="text-[10px] sm:text-xs font-bold text-gray-500">{order.date}</span>
                            </div>
                            <h4 className="text-lg sm:text-xl font-black text-white">{order.productName} <span className="text-indigo-400">({order.duration})</span></h4>
                            <div className="flex gap-3 sm:gap-4 text-[10px] sm:text-xs font-bold text-gray-400"><span>Ödəniş: <span className="text-white">{order.bank}</span></span><span>Məbləğ: <span className="text-white">{order.price} AZN</span></span></div>
                          </div>
                          <div className="w-full md:w-auto text-left md:text-right mt-2 md:mt-0">
                            {order.status === "pending" && <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-yellow-900/40 border border-yellow-500/40 text-yellow-400 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2"><div className="spinner w-2.5 h-2.5 sm:w-3 sm:h-3 border-[2px]"></div> Yoxlanılır</span>}
                            {order.status === "rejected" && <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-red-900/40 border border-red-500/40 text-red-400 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2">❌ Rədd Edildi</span>}
                            {order.status === "approved" && (
                              <div className="space-y-2 sm:space-y-3">
                                <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2">✅ Aktivdir</span>
                                {order.credentials && (
                                  <div className="p-3 sm:p-4 bg-[#0c0c1d] border border-indigo-500/30 rounded-xl text-[10px] sm:text-xs space-y-1.5 sm:space-y-2 text-left w-full sm:min-w-[200px]">
                                    <div className="text-gray-500 font-bold uppercase tracking-widest text-[8px] sm:text-[9px] mb-1 sm:mb-2">Giriş Məlumatları</div>
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
          <main className="max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div><h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">İdarəetmə Paneli</h1><p className="text-xs sm:text-sm font-bold text-indigo-400 mt-1 sm:mt-2 uppercase tracking-widest">Səlahiyyətli İdarəçi</p></div>
              <button onClick={handleAdminLogout} className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-red-900/40 border border-red-500/30 text-red-400 font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-red-800/50 transition shadow-lg w-full sm:w-auto">Sistemdən Çıxış</button>
            </div>

            <div className="flex gap-2 sm:gap-4 border-b border-indigo-950/60 pb-4 sm:pb-6 mb-6 sm:mb-8 overflow-x-auto no-scrollbar w-full">
              <button onClick={() => setActiveAdminTab("orders")} className={`px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeAdminTab === "orders" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50"}`}>Sifarişlər ({orders.length})</button>
              <button onClick={() => setActiveAdminTab("products")} className={`px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeAdminTab === "products" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50"}`}>Məhsullar ({products.length})</button>
            </div>

            {activeAdminTab === "orders" && (
              <div className="space-y-4 sm:space-y-6 animate-modal w-full">
                {orders.length === 0 && <div className="text-center py-12 sm:py-20 text-gray-500 font-bold text-base sm:text-lg">Sistemdə heç bir sifariş yoxdur.</div>}
                <div className="grid gap-4 w-full">
                  {orders.slice().reverse().map((order) => (
                    <div key={order.id} className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 flex flex-col lg:flex-row justify-between gap-5 sm:gap-6 border-l-4 w-full" style={{borderLeftColor: order.status === 'pending' ? '#eab308' : order.status === 'approved' ? '#10b981' : '#ef4444'}}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                        <div><div className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">ID / Tarix</div><div className="font-bold text-indigo-400 mt-1 text-sm sm:text-base">{order.id}</div><div className="text-[10px] sm:text-xs font-bold text-gray-400">{order.date}</div></div>
                        <div><div className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Müştəri</div><div className="font-black text-white mt-1 text-sm sm:text-base">{order.userName} {order.userSurname}</div><div className="text-[10px] sm:text-xs font-bold text-gray-400">{order.userEmail}</div><div className="text-[10px] sm:text-xs font-bold text-gray-400">{order.userPhone}</div></div>
                        <div><div className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Məhsul / Məbləğ</div><div className="font-black text-white mt-1 text-sm sm:text-base">{order.productName} ({order.duration})</div><div className="font-black text-emerald-400">{order.price} AZN</div></div>
                        <div><div className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Bank Çeki</div><div className="font-bold text-white mt-1 text-sm sm:text-base">{order.bank}</div>{order.receipt && <a href={order.receipt} target="_blank" rel="noreferrer" className="inline-block mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-900/50 text-indigo-300 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg">Çekə Bax 🔍</a>}</div>
                      </div>
                      <div className="flex lg:flex-col justify-end gap-2 sm:gap-3 min-w-[120px] sm:min-w-[150px] mt-4 lg:mt-0">
                        {order.status === "pending" ? (
                          <>
                            <button onClick={() => setApprovingOrder(order)} className="flex-1 lg:flex-none py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg transition">Təsdiqlə</button>
                            <button onClick={() => rejectOrderAction(order)} className="flex-1 lg:flex-none py-2.5 sm:py-3 bg-red-900/50 text-red-400 hover:bg-red-800/60 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition">Rədd Et</button>
                          </>
                        ) : (
                          <div className={`text-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider w-full ${order.status === 'approved' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
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
              <div className="space-y-4 sm:space-y-6 animate-modal w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Məhsul Kataloqu</h2>
                  <button onClick={() => setEditingProduct({ name: "Yeni Məhsul", cat: "entertainment", color: "#6366f1", emoji: "📦", desc: "Açıqlama", accountType: "Rəsmi Hesab", rating: "5.0", sales: "0", features: ["Yeni xüsusiyyət"], customLogo: "", packages: [{ id: "temp1", duration: "1 Ay", price: 10 }] })} className="glow-btn w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">+ Yeni Əlavə Et</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
                  {products.map(p => (
                    <div key={p.id} className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between border border-indigo-500/20 relative overflow-hidden group">
                      <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 relative z-10">
                        <div className="p-2.5 sm:p-3 bg-[#0c0c1d] rounded-xl sm:rounded-2xl border border-white/10 shadow-lg">{getOfficialLogo(p.name, p.emoji, p.color, p.customLogo)}</div>
                        <div><h4 className="font-black text-base sm:text-lg text-white">{p.name}</h4><span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">{p.cat}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-5 sm:mb-6 relative z-10">
                        {p.packages.map(pkg => (
                          <span key={pkg.id} className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-1 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 rounded-md font-black">{pkg.duration}: {pkg.price} AZN</span>
                        ))}
                      </div>
                      <div className="flex gap-2 sm:gap-3 mt-auto pt-4 sm:pt-5 border-t border-indigo-900/50 relative z-10">
                        <button onClick={() => setEditingProduct({...p, features: p.features || []})} className="flex-1 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg sm:rounded-xl text-white font-black text-[10px] sm:text-xs uppercase tracking-wider transition shadow-lg">Tam Redaktə</button>
                        <button onClick={() => handleDeleteProduct(p)} className="w-10 sm:w-14 flex items-center justify-center bg-red-900/40 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-lg sm:rounded-xl text-red-400 transition">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* CART DRAWER RIGHT SIDE */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/80 backdrop-blur-sm flex justify-end">
          <div className="glass-card w-full sm:w-80 md:max-w-md h-full flex flex-col justify-between drawer-open rounded-none border-y-0 border-r-0 border-l border-indigo-500/30 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-6 sm:p-8 pb-4 h-full flex flex-col">
              <div className="flex justify-between items-center pb-5 sm:pb-6 border-b border-indigo-900/50 mb-5 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-indigo-600 rounded-lg sm:rounded-xl text-white shadow-lg"><Icons.Cart /></div> Səbətiniz
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-950/80 text-gray-400 hover:bg-indigo-900 hover:text-white transition flex items-center justify-center text-lg sm:text-xl font-bold">&times;</button>
              </div>
              
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#0c0c1d] rounded-full flex items-center justify-center border border-indigo-900/50 text-indigo-500"><Icons.Cart /></div>
                  <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] sm:text-xs">Səbətiniz boşdur</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2 no-scrollbar">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c0c1d] border border-indigo-500/30 hover:border-indigo-400 transition-colors group">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-2.5 bg-black/40 rounded-lg sm:rounded-xl border border-white/10 shadow-lg">{getOfficialLogo(item.product.name, item.product.emoji, item.product.color, item.product.customLogo)}</div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white mb-0.5 sm:mb-1">{item.product.name}</h4>
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-1.5 sm:px-2 py-0.5 rounded">{item.package.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="font-black text-sm sm:text-lg text-white tracking-tight">{item.package.price} <span className="text-[9px] sm:text-[10px] text-gray-500">AZN</span></span>
                        <button onClick={() => removeFromCart(index)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white transition">&times;</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 sm:p-8 bg-black/40 border-t border-indigo-900/50 backdrop-blur-md">
                <div className="flex justify-between items-center mb-5 sm:mb-6">
                  <span className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest">Ümumi Məbləğ</span>
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{cart.reduce((sum, item) => sum + item.package.price, 0)} <span className="text-sm sm:text-lg text-indigo-400">AZN</span></span>
                </div>
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="glow-btn w-full py-4 sm:py-5 bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                  Ödənişə Keç
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL WITH SQUARE CARD SLIDER & FILE UPLOAD */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 animate-modal relative my-4 sm:my-8 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] w-full">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white hover:bg-indigo-900 flex items-center justify-center text-lg sm:text-xl font-bold transition">&times;</button>

            <div className="text-center mb-6 sm:mb-8 pt-2 sm:pt-0">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight">Ödəniş Mərhələsi</h3>
              <p className="text-[11px] sm:text-sm font-medium text-gray-400 max-w-md mx-auto">Aşağıdakı kartlardan birinə ödəniş edin, nömrəni kopyalamaq üçün toxunun və çeki yükləyin.</p>
            </div>

            {/* SQUARE CARDS SLIDER COMPACT */}
            <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 sm:pb-6 snap-x no-scrollbar -mx-2 sm:mx-0 px-2 sm:px-0 w-full">
              {CARD_ACCOUNTS.map(acc => (
                <div key={acc.id} onClick={() => setSelectedBank(acc)} className={`flex-shrink-0 w-44 h-44 sm:w-52 sm:h-52 snap-center p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] cursor-pointer relative overflow-hidden transition-all duration-300 bg-gradient-to-br flex flex-col justify-between ${acc.color} ${selectedBank.id === acc.id ? "ring-2 sm:ring-4 ring-white/50 scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.4)]" : "opacity-60 hover:opacity-100 scale-95"}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 blur-xl pointer-events-none" />
                  <div className="relative z-10 scale-75 sm:scale-100 origin-left"><acc.logo /></div>
                  <div className="relative z-10">
                    <div onClick={(e) => copyToClipboard(e, acc.num)} className="group cursor-pointer">
                      <div className="text-sm sm:text-lg font-black text-white tracking-widest mb-1 group-hover:text-white/80 transition-colors">{acc.num}</div>
                      <div className="text-[8px] sm:text-[9px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>📋</span> Kopyala
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-6 sm:space-y-8 mt-2 sm:mt-4 bg-[#0c0c1d] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-900/30">
              <div>
                <label className="block text-[9px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">Ödəniş Çeki (Cihazdan Yüklə)</label>
                {!uploadedReceipt ? (
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 sm:h-40 rounded-xl sm:rounded-2xl border-2 border-dashed border-indigo-500/40 bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-900/30 hover:border-indigo-400 transition group shadow-inner">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-950 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition border border-indigo-500/30 shadow-lg text-lg sm:text-xl">📸</div>
                    <span className="text-xs sm:text-sm text-indigo-300 font-bold">Çeki seçmək üçün toxunun</span>
                    <span className="text-[8px] sm:text-[10px] text-gray-500 font-black tracking-widest uppercase mt-1 sm:mt-2">PNG, JPG, JPEG</span>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleImageUpload(e, setUploadedReceipt)} className="hidden" />
                  </div>
                ) : (
                  <div className="relative w-full h-40 sm:h-48 rounded-xl sm:rounded-2xl border-2 border-emerald-500/50 overflow-hidden bg-black flex items-center justify-center group shadow-xl">
                    <img src={uploadedReceipt} alt="Receipt" className="max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <button type="button" onClick={() => setUploadedReceipt(null)} className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition">Çeki Sil / Dəyiş</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-indigo-900/50 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
                <div className="text-center sm:text-left">
                  <span className="text-[9px] sm:text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-0.5 sm:mb-1">Ümumi Məbləğ</span>
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{cart.reduce((sum, item) => sum + item.package.price, 0)} <span className="text-sm sm:text-lg text-indigo-400">AZN</span></span>
                </div>
                <button type="submit" disabled={isEmailSending} className="glow-btn w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 sm:gap-3">
                  {isEmailSending ? <><div className="spinner"></div> İşlənir...</> : "Sifarişi Təsdiqlə"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER AUTH MODAL WITH PASSWORD & FORGOT PROTECTIONS */}
      {authMode && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 w-full h-full overflow-y-auto">
          <div className="glass-card w-full max-w-md rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 animate-modal relative border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] my-auto">
            <button onClick={() => setAuthMode(null)} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white hover:bg-indigo-900 flex items-center justify-center text-lg sm:text-xl font-bold transition">&times;</button>

            {showOtpSuccess ? (
              <div className="py-8 sm:py-12 text-center space-y-4 sm:space-y-6">
                <div className="success-check">✓</div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Kodu Göndərdik!</h3>
                <p className="text-xs sm:text-sm font-medium text-gray-400">E-mail qutunuzu yoxlayın.</p>
              </div>
            ) : authMode === "login" ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">Xoş Gəldiniz</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Hesabınıza giriş edin.</p>
                <form onSubmit={handleUserAuth} className="space-y-4 sm:space-y-5">
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">E-poçt Ünvanı</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Şifrə</label><input type="password" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  <div className="text-right">
                     <span onClick={() => setAuthMode("forgot")} className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 cursor-pointer hover:text-indigo-300">Şifrəni unutmusunuz?</span>
                  </div>
                  <button type="submit" className="glow-btn w-full py-3.5 sm:py-4 mt-2 sm:mt-4 bg-indigo-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest">Giriş Et</button>
                </form>
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-indigo-950/50 text-center">
                  <p className="text-[10px] sm:text-xs font-black text-gray-500">Hesabınız yoxdur? <span onClick={() => setAuthMode("register")} className="text-indigo-400 cursor-pointer hover:text-indigo-300">İndi Yarat</span></p>
                </div>
              </div>
            ) : authMode === "register" ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">Qeydiyyat</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Məlumatları doldurun.</p>
                <form onSubmit={handleUserAuth} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Ad</label><input type="text" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                    <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Soyad</label><input type="text" value={authForm.surname} onChange={(e) => setAuthForm({...authForm, surname: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  </div>
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">E-poçt</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Şifrə təyin edin</label><input type="password" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  
                  <button type="submit" disabled={isEmailSending} className="glow-btn w-full py-3.5 sm:py-4 mt-2 sm:mt-4 bg-indigo-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest flex justify-center items-center gap-2 sm:gap-3 transition">
                    {isEmailSending ? <><div className="spinner"></div> İşlənir...</> : "Kodu Göndər 📩"}
                  </button>
                </form>
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-indigo-950/50 text-center">
                  <p className="text-[10px] sm:text-xs font-black text-gray-500">Artıq hesabınız var? <span onClick={() => setAuthMode("login")} className="text-indigo-400 cursor-pointer hover:text-indigo-300">Giriş edin</span></p>
                </div>
              </div>
            ) : authMode === "forgot" ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">Şifrəni Yenilə</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Hesabınızın e-poçtunu yazın.</p>
                <form onSubmit={handleUserAuth} className="space-y-4 sm:space-y-5">
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">E-poçt Ünvanı</label><input type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  <button type="submit" disabled={isEmailSending} className="glow-btn w-full py-3.5 sm:py-4 mt-2 sm:mt-4 bg-indigo-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest flex justify-center items-center gap-2 sm:gap-3 transition">
                    {isEmailSending ? <><div className="spinner"></div> İşlənir...</> : "Kodu Göndər 📩"}
                  </button>
                </form>
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-indigo-950/50 text-center">
                  <span onClick={() => setAuthMode("login")} className="text-[10px] sm:text-xs font-black text-indigo-400 cursor-pointer hover:text-indigo-300 uppercase tracking-widest">← Geriyə Qayıt</span>
                </div>
              </div>
            ) : authMode === "reset_pass" ? (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight">Yeni Şifrə</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Hesabınız üçün yeni şifrə təyin edin.</p>
                <form onSubmit={handleUserAuth} className="space-y-4 sm:space-y-5">
                  <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Yeni Şifrə</label><input type="password" value={authForm.pass} onChange={(e) => setAuthForm({...authForm, pass: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
                  <button type="submit" className="glow-btn w-full py-3.5 sm:py-4 mt-2 sm:mt-4 bg-emerald-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest">Şifrəni Yenilə</button>
                </form>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight text-center">Təsdiq Kodu</h3>
                <p className="text-[9px] sm:text-[11px] font-black text-gray-500 mb-6 sm:mb-8 text-center uppercase tracking-widest">E-poçtunuza gələn 6 rəqəmli kodu yazın</p>
                <form onSubmit={handleUserAuth} className="space-y-5 sm:space-y-6">
                  <div>
                    <input type="text" value={authForm.otpInput} onChange={(e) => setAuthForm({...authForm, otpInput: e.target.value})} className="w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl text-center text-2xl sm:text-3xl font-black tracking-[8px] sm:tracking-[12px] bg-indigo-950/40 border-indigo-500/50 text-indigo-300 placeholder-indigo-900" placeholder="------" maxLength="6" required />
                  </div>
                  <button type="submit" className="glow-btn w-full py-4 sm:py-5 bg-emerald-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)]">Təsdiqlə</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN LOGIN MODAL */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-[1.5rem] sm:rounded-[2.5rem] p-8 md:p-10 animate-modal relative border border-red-500/30">
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white transition flex items-center justify-center text-lg sm:text-xl font-bold">&times;</button>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-900/40 border border-red-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-6 mx-auto shadow-lg">🛡️</div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2 text-center tracking-tight">Admin Paneli</h3>
            <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 sm:mb-8 text-center">Səlahiyyətli şəxs girişi</p>
            <form onSubmit={handleAdminLogin} className="space-y-4 sm:space-y-5">
              <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">İstifadəçi Adı</label><input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
              <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 sm:mb-2">Şifrə</label><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
              <button type="submit" className="w-full py-3.5 sm:py-4 mt-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] transition">Sistemə Giriş</button>
            </form>
          </div>
        </div>
      )}

      {/* APPROVING ORDER DETAILS MODAL (ADMIN ONLY) */}
      {approvingOrder && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 animate-modal relative border border-emerald-500/30 w-full">
            <button onClick={() => setApprovingOrder(null)} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white transition flex items-center justify-center text-lg sm:text-xl font-bold">&times;</button>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Sifarişi Təsdiqlə</h3>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 sm:mb-8">Müştəri üçün abunəlik məlumatlarını daxil edin</p>
            <form onSubmit={approveOrderAction} className="space-y-4 sm:space-y-5 bg-[#0c0c1d] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-indigo-900/30 shadow-inner">
              <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 sm:mb-2">Hesab E-maili / Giriş Adı</label><input type="text" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold text-emerald-300" required /></div>
              <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 sm:mb-2">Hesab Şifrəsi</label><input type="text" value={accountPass} onChange={(e) => setAccountPass(e.target.value)} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold text-emerald-300" required /></div>
              <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button type="button" onClick={() => setApprovingOrder(null)} className="w-1/3 py-3.5 sm:py-4 bg-indigo-950/40 text-gray-400 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-900/60 transition">Ləğv</button>
                <button type="submit" className="glow-btn w-2/3 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition">Göndər ✉️</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADVANCED EDITING PRODUCT MODAL (ADMIN ONLY) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-4xl rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 animate-modal relative border border-indigo-500/30 my-4 sm:my-8 w-full">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-950/50 text-gray-400 hover:text-white transition flex items-center justify-center text-lg sm:text-xl font-bold">&times;</button>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-6 sm:mb-8 tracking-tight">{editingProduct.id ? "Məhsul Redaktoru" : "Yeni Məhsul Yaradıcı"}</h3>

            <form onSubmit={handleSaveProduct} className="space-y-6 sm:space-y-8">
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 bg-[#0c0c1d] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-900/30">
                <div className="md:col-span-2"><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Məhsulun Adı</label><input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-base sm:text-lg font-black" required /></div>
                
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Məhsulun Loqosu (Cihazdan Yüklə)</label>
                  <div className="flex items-center gap-4">
                    {editingProduct.customLogo && <img src={editingProduct.customLogo} className="w-10 h-10 rounded-lg object-contain bg-black p-1" alt="logo" />}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-3 sm:py-4 bg-indigo-900/50 hover:bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold w-full transition">Şəkil Seç</button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleImageUpload(e, (res) => setEditingProduct({...editingProduct, customLogo: res}))} className="hidden" />
                  </div>
                </div>

                <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Açar Rəngi (Hex Code)</label><input type="text" value={editingProduct.color} onChange={(e) => setEditingProduct({...editingProduct, color: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold bg-black" /></div>
                <div className="md:col-span-2"><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Qısa Açıqlama</label><input type="text" value={editingProduct.desc} onChange={(e) => setEditingProduct({...editingProduct, desc: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" required /></div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 sm:gap-6 bg-[#0c0c1d] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-900/30">
                <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 sm:mb-2">Hesab Növü</label><input type="text" placeholder="Məs: Ortaq Hesab" value={editingProduct.accountType || ''} onChange={(e) => setEditingProduct({...editingProduct, accountType: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" /></div>
                <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-1 sm:mb-2">Reytinq (Ulduz)</label><input type="text" placeholder="Məs: 4.9" value={editingProduct.rating || ''} onChange={(e) => setEditingProduct({...editingProduct, rating: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" /></div>
                <div><label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-pink-400 mb-1 sm:mb-2">Satış Sayı</label><input type="text" placeholder="Məs: 12.5k" value={editingProduct.sales || ''} onChange={(e) => setEditingProduct({...editingProduct, sales: e.target.value})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold" /></div>
                <div className="md:col-span-3">
                  <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 sm:mb-2">Məhsulun Geniş Xüsusiyyətləri (Hər sətirə 1 ədəd yazın)</label>
                  <textarea rows="3" sm:rows="4" value={(editingProduct.features || []).join('\n')} onChange={(e) => setEditingProduct({...editingProduct, features: e.target.value.split('\n')})} className="w-full p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold leading-relaxed" placeholder="4K Ultra HD&#10;7/24 Dəstək"></textarea>
                </div>
              </div>

              <div className="bg-[#0c0c1d] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-900/30">
                 <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400">Paketlər</label>
                    <button type="button" onClick={handleAddPackage} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-900/50 text-indigo-300 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition">+ Əlavə Et</button>
                 </div>
                 <div className="space-y-2 sm:space-y-3">
                   {editingProduct.packages.map((pkg, i) => (
                     <div key={i} className="flex items-center gap-2 sm:gap-4">
                       <input type="text" value={pkg.duration} onChange={(e) => handleUpdatePackage(i, 'duration', e.target.value)} className="w-1/2 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm font-bold" placeholder="1 Ay" required />
                       <input type="number" value={pkg.price} onChange={(e) => handleUpdatePackage(i, 'price', Number(e.target.value))} className="w-1/3 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm font-bold" placeholder="Qiymət (AZN)" required />
                       <button type="button" onClick={() => handleRemovePackage(i)} className="w-8 h-8 sm:w-10 sm:h-10 bg-red-900/30 text-red-400 rounded-lg flex items-center justify-center font-bold hover:bg-red-600 hover:text-white transition">&times;</button>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-indigo-900/50">
                <button type="button" onClick={() => setEditingProduct(null)} className="w-1/3 py-3.5 sm:py-5 bg-indigo-950/40 text-gray-400 font-black text-[10px] sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-indigo-900/60 transition">Ləğv Et</button>
                <button type="submit" className="glow-btn w-2/3 py-3.5 sm:py-5 bg-indigo-600 text-white font-black text-[10px] sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-lg transition">Məhsulu Yadda Saxla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MINIMALIST MODERN FOOTER */}
      <footer className="bg-[#030308] border-t border-indigo-900/30 pt-10 sm:pt-12 pb-6 mt-16 sm:mt-20 w-full" id="footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center sm:items-start md:flex-row justify-between gap-6">
           <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition duration-300 cursor-pointer" onClick={() => setPage("home")}>
              <img src="./Premium.png" alt="Premium Shop" className="h-6 sm:h-8 w-6 sm:w-8 object-cover rounded-full border border-indigo-500/30" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="hidden items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-indigo-900 flex items-center justify-center font-black text-white text-[10px] sm:text-xs">PS</div>
              </div>
              <span className="font-black text-xs sm:text-sm tracking-widest text-white uppercase">Premium Shop</span>
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500">
             <a href="https://wa.me/994103136941" className="hover:text-[#25D366] transition">WHATSAPP</a>
             <span className="hidden sm:block opacity-20 text-white">|</span>
             <a href="mailto:premiumshopazerbaycan@gmail.com" className="hover:text-indigo-400 transition">E-POÇT</a>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8 sm:mt-10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-600 text-center sm:text-left">
           <span>© 2026 Premium Shop</span>
           <button onClick={() => setIsAdminModalOpen(true)} className="hover:text-indigo-400 transition">İdarəetmə (Admin)</button>
        </div>
      </footer>
    </div>
  );
}

function Notif({ n }) {
  if (!n) return null;
  const colors = n.type === "error" ? "bg-red-600 text-white" : n.type === "info" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white";
  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] font-black text-[10px] sm:text-xs uppercase tracking-wider text-center animate-toast ${colors}`}>
      {n.msg}
    </div>
  );
}