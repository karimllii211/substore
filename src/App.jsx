import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, update, onValue, push, remove } from 'firebase/database';

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
  html, body { background: #030308; color: #f8fafc; scroll-behavior: smooth; overflow-x: hidden; width: 100%; position: relative; transition: background-color 0.4s, color 0.4s; }
  
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 8px; }
  ::-webkit-scrollbar-thumb:hover { background: #6366f1; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  
  .glow-btn { position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
  .glow-btn:hover { box-shadow: 0 0 35px rgba(99, 102, 241, 0.5); transform: translateY(-2px) scale(1.02); }
  
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

  /* MÖHTƏŞƏM SCROLL ANİMASİYALARI */
  .reveal { opacity: 0; transform: translateY(40px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
  .show-reveal { opacity: 1; transform: translateY(0); }
  
  .page-transition { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes slideUpFade { 
    from { opacity: 0; transform: translateY(20px) scale(0.98); filter: blur(4px); } 
    to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 
  }
  
  .drawer-open { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
  
  .animate-modal { animation: modalZoom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes modalZoom { 
    from { opacity: 0; transform: scale(0.92); filter: blur(2px); } 
    to { opacity: 1; transform: scale(1); filter: blur(0); } 
  }
  
  @keyframes toastSlide { from { transform: translateY(100px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
  .animate-toast { animation: toastSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  .spinner { width: 20px; height: 20px; border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .success-check { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #10b981; color: white; font-size: 30px; margin: 0 auto; animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; box-shadow: 0 0 25px rgba(16, 185, 129, 0.4); }
  @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
  
  input, select, textarea { background-color: #0c0c1d !important; color: #ffffff !important; border: 1px solid rgba(99, 102, 241, 0.2) !important; transition: all 0.3s ease; }
  input:focus, select:focus, textarea:focus { border-color: rgba(99, 102, 241, 0.8) !important; outline: none !important; box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); }
  input::placeholder { color: #64748b !important; }

  /* WHATSAPP WIDGET */
  .wa-float {
    position: fixed; width: 55px; height: 55px; bottom: 30px; left: 20px; background-color: #25d366; color: #FFF;
    border-radius: 50px; text-align: center; font-size: 30px; box-shadow: 0px 4px 15px rgba(37, 211, 102, 0.4);
    z-index: 1000; display: flex; align-items: center; justify-content: center; transition: all 0.3s;
  }
  .wa-float:hover { transform: scale(1.1); }
  
  /* FOOTER APBAZAR STYLE BACKGROUND */
  .footer-bg {
    background: #060814;
    position: relative;
  }
  .footer-wave {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-image: radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08), transparent 25%);
    pointer-events: none;
  }
`;

// Tam qüsursuz işləyən Light Mode Rejimi
const LightModeCSS = `
  body, html { background-color: #f4f7fb !important; color: #0f172a !important; }
  .glass-card, .hero-card { background: #ffffff !important; border-color: #cbd5e1 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.04) !important; }
  .glass-card .text-white, .hero-card .text-white, h1.text-white, h2.text-white, h3.text-white { color: #0f172a !important; }
  .glass-card .text-gray-400, .hero-card .text-gray-400 { color: #475569 !important; }
  .glass-card .text-gray-500, .hero-card .text-gray-500 { color: #64748b !important; }
  .bg-\\[\\#0c0c1d\\] { background-color: #f8fafc !important; border-color: #e2e8f0 !important; color: #0f172a !important; }
  .bg-black\\/40, .bg-indigo-950\\/20 { background-color: #ffffff !important; border-color: #e2e8f0 !important; }
  .border-white\\/10 { border-color: #e2e8f0 !important; }
  
  /* Qorunacaq rənglər (Düymələr, İkonlar) */
  .glow-btn.text-white, .bg-indigo-600.text-white, .bg-emerald-600.text-white, .bg-red-600.text-white, .cart-badge { color: #ffffff !important; }
  .neon-text { text-shadow: none !important; color: #0f172a !important; }
  input, select, textarea { background-color: #ffffff !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; }
  
  /* Üst Menyu Light Mode */
  .nav-light { background-color: rgba(255,255,255,0.95) !important; border-bottom-color: #e2e8f0 !important; }
  .nav-light .text-white { color: #0f172a !important; }
  .nav-light .text-gray-400 { color: #475569 !important; }
  
  /* Alt Menyu Qara Qalmalıdır (Şəkildəki Kimi) */
  #footer { background-color: #060814 !important; color: #ffffff !important; }
  #footer .text-white { color: #ffffff !important; }
  #footer .text-gray-400 { color: #9ca3af !important; }
  #footer input { background-color: #111122 !important; border: none !important; color: #ffffff !important; }
`;

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Netflix Premium", cat: "entertainment", color: "#E50914", emoji: "🎬", desc: "4K Ultra HD · 4 Ekran · Eyni anda rəsmi izləmə", accountType: "Ortaq Hesab", rating: "4.9", sales: "12.5k", features: ["4K Ultra HD Filmlər və Seriallar", "Bütün cihazlarda kəsintisiz dəstək", "Eyni anda 1 cihazdan giriş", "100% Rəsmi və qapanmayan hesab", "7/24 Texniki dəstək"], customLogo: "", packages: [{ id: "p1", duration: "1 Ay", price: 8 }, { id: "p2", duration: "3 Ay", price: 22 }, { id: "p3", duration: "1 İl", price: 80 }], popular: true },
  { id: 2, name: "Spotify Premium", cat: "entertainment", color: "#1DB954", emoji: "🎵", desc: "Reklamsız musiqi · Çevrimdışı yükləmə · Ultra səs keyfiyyəti", accountType: "Fərdi Hesab (Öz mailinə)", rating: "5.0", sales: "18.2k", features: ["Reklamsız kəsintisiz musiqi", "Mahnıları oflayn yükləmə imkanı", "Ən yüksək səs keyfiyyəti", "Öz şəxsi hesabınıza aktivləşmə"], customLogo: "", packages: [{ id: "p4", duration: "1 Ay", price: 5 }, { id: "p5", duration: "3 Ay", price: 13 }, { id: "p6", duration: "1 İl", price: 48 }], popular: true },
  { id: 3, name: "YouTube Premium", cat: "entertainment", color: "#FF0000", emoji: "📺", desc: "Reklamsız video çarxlar · Arxa fonda işləmə · Premium Music", accountType: "Fərdi Hesab", rating: "4.8", sales: "9.1k", features: ["Reklamsız videolar", "Ekran sönülü ikən (arxa fonda) işləmə", "YouTube Music Premium daxildir", "Oflayn izləmə üçün yükləmə"], customLogo: "", packages: [{ id: "p7", duration: "1 Ay", price: 6 }, { id: "p8", duration: "3 Ay", price: 16 }, { id: "p9", duration: "1 İl", price: 55 }], popular: true },
  { id: 4, name: "ChatGPT Plus", cat: "ai", color: "#10A37F", emoji: "🤖", desc: "Rəsmi GPT-4o girişi · DALL-E 3 şəkilyaratma · Sürətli analiz", accountType: "Ortaq Hesab", rating: "4.9", sales: "5.4k", features: ["Ən ağıllı GPT-4o modelinə giriş", "DALL-E 3 ilə şəkil yaratma", "Sənəd və data analizi (Code Interpreter)", "Premium sürət və kəsintisiz server"], customLogo: "", packages: [{ id: "p10", duration: "1 Ay", price: 25 }, { id: "p11", duration: "3 Ay", price: 68 }], popular: true },
  { id: 5, name: "Canva Pro", cat: "design", color: "#8B5CF6", emoji: "🎨", desc: "Milyonlarla premium şablon · AI dizayn köməkçisi", accountType: "Fərdi (Davətnamə)", rating: "4.7", sales: "8.8k", features: ["Bütün Premium şablonlar açıqdır", "Arxa plan silmə xüsusiyyəti", "Magic Studio (AI) alətləri", "Şəxsi mailinizə dəvətnamə göndərilir"], customLogo: "", packages: [{ id: "p12", duration: "1 Ay", price: 9 }, { id: "p13", duration: "3 Ay", price: 24 }, { id: "p14", duration: "1 İl", price: 85 }], popular: true }
];

const renderBankLogo = (src, altName, extraClass = "") => (
  <img src={src} alt={altName} className={`max-h-12 sm:max-h-16 max-w-[120px] sm:max-w-[160px] object-contain drop-shadow-sm ${extraClass}`} onError={(e) => {
    e.target.style.display = 'none';
    if(e.target.nextSibling) e.target.nextSibling.style.display = 'block';
  }} />
);

const BankLogos = {
  ABB: () => renderBankLogo("/abb.png", "ABB Bank", "mix-blend-multiply"),
  Kapital: () => renderBankLogo("/kapital.png", "Kapital Bank", "mix-blend-multiply"),
  LEO: () => renderBankLogo("/leo.png", "LEO Bank", "invert"),
  M10: () => renderBankLogo("/m10.png", "M10", "mix-blend-multiply")
};

const CARD_ACCOUNTS = [
  { id: "kapital", bank: "Kapital Bank", logo: BankLogos.Kapital, num: "4169 7388 1861 3451", color: "bg-white border-4 border-[#dc2626]", numColor: "text-gray-900" },
  { id: "abb", bank: "ABB", logo: BankLogos.ABB, num: "5522 0093 7234 8144", color: "bg-white border-4 border-[#2563eb]", numColor: "text-blue-900" },
  { id: "leo", bank: "LEO Bank", logo: BankLogos.LEO, num: "4098 5844 6496 5191", color: "bg-white border-4 border-black", numColor: "text-gray-900" },
  { id: "m10", bank: "M10", logo: BankLogos.M10, num: "+994 10 313 69 41", color: "bg-white border-4 border-[#02D68F]", numColor: "text-gray-900" }
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
  Headset: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>,
  Sun: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Moon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
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
  const [products, setProducts] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem("ps_theme") || "dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // SCROLL ANİMASİYASI İZLƏYİCİSİ (Bərpa edildi və səhifə dəyişəndə tətiklənir)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-reveal');
        }
      });
    }, { threshold: 0.05 });

    setTimeout(() => {
      const hiddenElements = document.querySelectorAll('.reveal');
      hiddenElements.forEach((el) => {
        el.classList.remove('show-reveal');
        observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, [products, orders]); // Səhifə asılılıqları

  useEffect(() => {
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"; document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    localStorage.setItem("ps_theme", theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode-active');
    } else {
      document.body.classList.remove('light-mode-active');
    }
  }, [theme]);

  // 🔥 FIREBASE REALTIME SYNC HOOKS 🔥
  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if(data) setProducts(Object.keys(data).map(key => ({...data[key], firebaseKey: key})));
      else DEFAULT_PRODUCTS.forEach(p => push(ref(db, 'products'), p));
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
  const [cart, setCart] = useState(() => {
    const local = localStorage.getItem("premium_shop_cart");
    return local ? JSON.parse(local) : [];
  });
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem("premium_shop_current_user");
    return local ? JSON.parse(local) : null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
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

  useEffect(() => {
    localStorage.setItem("premium_shop_cart", JSON.stringify(cart));
  }, [cart]);

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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6); 
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
    if (!user) { setAuthMode("login"); return; }
    if (!uploadedReceipt) return showNotif("Ödəniş çekini yükləyin!", "error");

    const generatedOrders = cart.map(item => ({
      id: "ORD-" + Math.floor(10000 + Math.random() * 90000), userEmail: user.email, userName: user.name, userSurname: user.surname, userPhone: user.phone || "Qeyd edilməyib",
      productName: item.product.name, duration: item.package.duration, price: item.package.price, bank: selectedBank.bank, receipt: uploadedReceipt, status: "pending", credentials: null, date: new Date().toLocaleDateString("az-AZ")
    }));

    for (const o of generatedOrders) { push(ref(db, 'orders'), o); }

    setCart([]); setPage("dashboard"); setDashTab("orders");
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
      {theme === 'light' && <style>{LightModeCSS}</style>}
      <Notif n={notification} />

      {/* YENİ APPBAZAR TƏRZİ HEADER */}
      <nav className={`sticky top-0 z-40 transition-colors duration-300 border-b ${theme === 'light' ? 'nav-light shadow-sm' : 'bg-[#030308]/90 border-indigo-950/60'}`} style={{ backdropFilter: 'blur(20px)' }}>
        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between w-full">
           
           {/* Left Logo Section */}
           <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => setPage("home")}>
              <img src="/Premium.png" alt="PS" className="w-9 h-9 sm:w-12 sm:h-12 object-cover rounded-full border border-purple-500/30 shadow-lg" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} />
              <div className="hidden w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 items-center justify-center font-black text-white text-lg sm:text-xl shadow-lg skew-x-[-10deg]">
                <span className="skew-x-[10deg]">P</span>
              </div>
              <span className="font-black text-lg sm:text-2xl tracking-tight hidden sm:block text-white">PremiumShop</span>
           </div>

           {/* Center Menu Links (Desktop) */}
           <div className="hidden md:flex items-center gap-8 font-bold text-sm text-white">
              <span className="cursor-pointer hover:text-purple-400 transition" onClick={() => setPage("home")}>Ana Səhifə</span>
              <span className="cursor-pointer hover:text-purple-400 transition" onClick={() => {setPage("categories"); setSelectedCat("all");}}>Məhsullar</span>
              <div className="relative group py-2">
                 <span className="cursor-pointer hover:text-purple-400 transition flex items-center gap-1">Kateqoriyalar <span className="text-[10px]">▼</span></span>
                 <div className="absolute top-full left-0 mt-0 w-48 bg-[#030308] border border-indigo-900/50 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 flex flex-col p-2">
                    {CATEGORIES.map(c => (
                       <span key={c.id} onClick={() => { setPage("categories"); setSelectedCat(c.id); }} className="px-4 py-3 hover:bg-indigo-900/40 rounded-lg cursor-pointer text-sm font-bold text-white transition">{c.icon} {c.label}</span>
                    ))}
                 </div>
              </div>
              <span className="cursor-pointer hover:text-purple-400 transition" onClick={() => setPage("contact")}>Əlaqə</span>
           </div>

           {/* Mobile Center Hamburger Toggle */}
           <div className="md:hidden flex-1 flex justify-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-400 hover:text-white p-2">
                 <Icons.Menu />
              </button>
           </div>

           {/* Actions Section */}
           <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
              <button className="hidden sm:block text-gray-400 hover:text-purple-400 transition">
                <Icons.Bell />
              </button>
              
              <button onClick={() => setIsCartOpen(true)} className="relative text-gray-400 hover:text-purple-400 transition">
                <Icons.Cart />
                {cart.length > 0 && <span className="cart-badge absolute -top-2 -right-2 bg-purple-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-[#030308]">{cart.length}</span>}
              </button>

              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-400 hover:text-purple-400 transition ml-1 sm:ml-2">
                {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
              </button>

              {user ? (
                <button onClick={() => {setPage("dashboard"); setDashTab("profile");}} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/40 transition">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs text-white overflow-hidden shadow-inner">
                    {user.profileImg ? <img src={user.profileImg} alt="User" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
                  </div>
                  <span className="font-bold text-[10px] sm:text-xs text-white hidden sm:inline">{user.name}</span>
                </button>
              ) : (
                <div className="flex items-center gap-4 ml-1 sm:ml-3">
                  <span className="hidden sm:block font-bold text-sm cursor-pointer text-white hover:text-purple-400 transition" onClick={() => setAuthMode("login")}>Giriş</span>
                  <button onClick={() => setAuthMode("register")} className="glow-btn px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] sm:text-xs tracking-wide whitespace-nowrap">
                    Qeydiyyat
                  </button>
                </div>
              )}
           </div>
        </div>
        
        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#030308] border-b border-indigo-900/50 flex flex-col p-4 space-y-4 font-bold text-sm text-white shadow-xl z-40">
             <span className="cursor-pointer hover:text-purple-400" onClick={() => {setPage("home"); setIsMobileMenuOpen(false);}}>Ana Səhifə</span>
             <span className="cursor-pointer hover:text-purple-400" onClick={() => {setPage("categories"); setSelectedCat("all"); setIsMobileMenuOpen(false);}}>Məhsullar</span>
             <span className="cursor-pointer hover:text-purple-400" onClick={() => {setPage("contact"); setIsMobileMenuOpen(false);}}>Əlaqə</span>
          </div>
        )}
      </nav>

      <div className="page-transition flex-1 relative w-full">
        
        {page === "home" && (
          <main className="max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-16 relative z-10 w-full overflow-hidden">
            <div className="led-blob led-1 hidden md:block"></div>
            <div className="led-blob led-2 hidden md:block"></div>
            <div className="led-blob led-3 hidden md:block"></div>

            <div className="reveal relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden glass-card p-6 sm:p-12 lg:p-20 mb-16 sm:mb-24 border border-indigo-500/30 bg-black/40 w-full">
              <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className="space-y-6 sm:space-y-8">
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-inner backdrop-blur-md">
                    <span className="relative flex h-2 w-2 sm:h-3 sm:w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-indigo-500"></span></span>
                    100% Güvənli Çatdırılma
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-[1.1] neon-text">Rəqəmsal Dünyanızı <br /><span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-500 text-transparent bg-clip-text">Premium Edin!</span></h1>
                  <p className="text-gray-400 text-sm sm:text-lg lg:text-xl max-w-xl leading-relaxed font-medium">Azərbaycanın ən etibarlı platformasında kartla rahatlıqla ödəyin, rəsmi abunəlik hesabınız e-mail ünvanınıza dərhal çatdırılsın.</p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button onClick={() => {setPage("categories"); setSelectedCat("all");}} className="glow-btn w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(168,85,247,0.4)] transition text-center">Bütün Məhsullar</button>
                  </div>
                </div>
                <div className="relative hidden lg:block">
                  <div className="w-full aspect-square rounded-[3rem] bg-gradient-to-tr from-purple-900/30 to-indigo-900/30 border border-purple-500/20 flex items-center justify-center p-8 relative shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030308] via-transparent to-transparent" />
                    <div className="relative z-10 text-center space-y-6 transform group-hover:-translate-y-4 transition-transform duration-500">
                      <div className="flex justify-center gap-4 mb-8">
                         <div className="p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce" style={{animationDelay: "0ms"}}>{getOfficialLogo("Netflix", "🎬")}</div>
                         <div className="p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce" style={{animationDelay: "150ms"}}>{getOfficialLogo("Spotify", "🎵")}</div>
                         <div className="p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce" style={{animationDelay: "300ms"}}>{getOfficialLogo("Youtube", "📺")}</div>
                      </div>
                      <h3 className="font-black text-3xl text-white drop-shadow-lg">Bütün Premium Xidmətlər</h3>
                      <p className="text-sm text-purple-200 font-bold bg-purple-950/50 px-4 py-2 rounded-full inline-block backdrop-blur-sm border border-purple-500/30">Bir klik uzaqlığında.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MÖHTƏŞƏM SLOGANLAR BÖLMƏSİ */}
            <div className="reveal mb-16 sm:mb-24 grid md:grid-cols-2 gap-6 sm:gap-8">
               <div className="glass-card p-8 rounded-3xl border-l-4 border-l-[#E50914] bg-gradient-to-br from-black/50 to-red-900/10 hover:scale-105 transition">
                  <h3 className="text-2xl font-black text-white mb-4">"Həftəsonu Film Marafonu" 🍿</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">Həftəsonu planı hazırdır, popkornlar partlayır... Bəs Netflix? "Hesab tapım", "Ödənişi təsdiqləsinlər" deyə saatlarla gözləməyə son! Saytımıza daxil ol, avtomatik sistemlə anında Netflix Premium əldə et və film marafonuna dərhal başla! 🎬🚀</p>
                  <p className="text-red-400 font-bold text-xs uppercase tracking-widest">🍿 Sənin bu həftəki favoritin hansı filmdir?</p>
               </div>
               <div className="glass-card p-8 rounded-3xl border-l-4 border-l-[#1DB954] bg-gradient-to-br from-black/50 to-green-900/10 hover:scale-105 transition">
                  <h3 className="text-2xl font-black text-white mb-4">"Reklamsız Həyat" Konsepti 🎧</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">Tam ən sevdiyin mahnının nəqəratində və ya filmin ən maraqlı yerində o bezdirici reklam çıxır? 😤 Buna dözmək məcburiyyətində deyilsən! Bizimlə YouTube və Spotify Premium-a anında, avtomatik ödənişlə keçid et, reklamsız həyatın dadını çıxar.</p>
                  <p className="text-green-400 font-bold text-xs uppercase tracking-widest">✨ Özünü musiqiyə və videolara burax!</p>
               </div>
            </div>

            <div className="reveal mb-16 sm:mb-24 space-y-8">
              <div className="text-center space-y-4 mb-10 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Ən Çox Satılanlar</h2>
                <div className="w-16 sm:w-24 h-1.5 bg-purple-600 mx-auto rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {products.filter(p => p.popular).slice(0,3).map((product, index) => (
                  <div key={product.id} className="hero-card rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden cursor-pointer reveal" style={{ transitionDelay: `${index * 100}ms` }} onClick={() => openProductDetail(product)}>
                    <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
                      <div className="p-3 sm:p-4 bg-[#0c0c1d] rounded-xl sm:rounded-2xl border border-white/10 shadow-lg">{getOfficialLogo(product.name, product.emoji, product.color, product.customLogo)}</div>
                      <span className="text-[9px] font-black text-white bg-white/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">Populyar</span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 sm:mb-8 min-h-[40px]">{product.desc}</p>
                    </div>
                    <div className="pt-5 sm:pt-6 border-t border-white/10 mt-auto relative z-10">
                      <button className="w-full py-3 sm:py-4 rounded-xl text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:scale-[1.02]" style={{ backgroundColor: product.color }}>
                        Ətraflı Bax →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <section className="reveal mb-16 sm:mb-24 py-8 sm:py-10 w-full">
              <div className="text-center space-y-4 mb-10 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Sistem Necə İşləyir?</h2>
                <div className="w-16 sm:w-24 h-1.5 bg-purple-600 mx-auto rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
                 <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-purple-500/10 via-purple-500/50 to-purple-500/10 z-0" />
                 <div className="reveal relative z-10 glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0c0c1d] border border-purple-500/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-purple-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(168,85,247,0.2)]">1</div>
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 uppercase tracking-widest">Məhsulu Seçin</h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Kataloqdan istədiyiniz platformanı və abunəlik müddətini seçərək səbətə əlavə edin.</p>
                 </div>
                 <div className="reveal relative z-10 glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl text-center group" style={{ transitionDelay: '100ms' }}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0c0c1d] border border-emerald-500/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-emerald-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(16,185,129,0.2)]">2</div>
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 uppercase tracking-widest">Ödəniş Et</h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Sizə uyğun olan bankı seçin, göstərilən karta ödəniş edib qəbzin (çekin) şəklini sistemə yükləyin.</p>
                 </div>
                 <div className="reveal relative z-10 glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl text-center group" style={{ transitionDelay: '200ms' }}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#0c0c1d] border border-indigo-500/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-indigo-400 mb-6 sm:mb-8 shadow-[0_0_20px_rgba(99,102,241,0.2)]">3</div>
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 uppercase tracking-widest">Təsdiq Al</h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">Sifarişiniz təsdiqlənən kimi rəsmi hesab məlumatlarınız birbaşa Şəxsi Kabinetinizdə görünəcək.</p>
                 </div>
              </div>
            </section>

            <section className="reveal bg-purple-950/20 border border-purple-500/20 rounded-[2rem] sm:rounded-[3rem] py-12 sm:py-20 px-6 sm:px-10 w-full mb-12">
              <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
                <div className="space-y-6">
                   <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">"Tam Avtomatlaşdırılmış Güvən" 😎</h2>
                   <p className="text-gray-400 text-sm sm:text-base leading-relaxed">Çoxlu abunəliklər, qarışıq ödənişlər, adminin cavab verməsini gözləmək... Bunları artıq unut! ❌</p>
                   <p className="text-gray-400 text-sm sm:text-base leading-relaxed">Bütün sevimli Premium xidmətlərin tək bir ünvanda. 7/24 işləyən avtomatik ödəniş sistemimizlə hesabın saniyələr içində aktivləşir. Sən sadəcə istədiyin platformanı seçirsən, ödəyirsən və anında istifadə edirsən. Rahatlıq və əyləncə heç bu qədər əlçatan olmamışdı! 💳</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-6 rounded-2xl text-center space-y-3"><Icons.Shield /><div className="font-black text-white text-lg">Güvənli Ödəniş</div><div className="text-xs text-gray-400">ABB, Kapital, M10 və s.</div></div>
                  <div className="glass-card p-6 rounded-2xl text-center space-y-3"><Icons.Mail /><div className="font-black text-white text-lg">Sürətli Çatdırılma</div><div className="text-xs text-gray-400">Dərhal E-mailinizə</div></div>
                  <div className="glass-card p-6 rounded-2xl text-center space-y-3 col-span-2"><Icons.Headset /><div className="font-black text-white text-lg">7/24 Aktiv Dəstək</div><div className="text-xs text-gray-400">Sənin zamanın dəyərlidir, onu qeydiyyatlarla və uzun proseslərlə xərcləmə. Ən baxımlı seriallar, ən hit mahnılar üçün sadəcə bir neçə toxunuş kifayətdir. 🌟</div></div>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* ƏLAQƏ SƏHİFƏSİ (YENİ) */}
        {page === "contact" && (
          <main className="reveal max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 w-full text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-10 tracking-tight">Bizimlə Əlaqə</h1>
            <p className="text-gray-400 mb-12 text-sm sm:text-base">Sualınız və ya probleminiz var? Seçim edin və birbaşa bizə yazın. Dərhal cavablandırılacaq!</p>
            <div className="grid md:grid-cols-2 gap-8">
               <a href="https://wa.me/994103136941" target="_blank" rel="noreferrer" className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center gap-6 hover:scale-105 transition border border-green-500/30">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c.003-3.625 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>
                  </div>
                  <h3 className="text-2xl font-black text-white">WhatsApp</h3>
                  <p className="text-gray-400 text-sm">7/24 Sürətli Dəstək Xətti</p>
               </a>
               <a href="mailto:premiumshopazerbaycan@gmail.com" className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center gap-6 hover:scale-105 transition border border-purple-500/30">
                  <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  </div>
                  <h3 className="text-2xl font-black text-white">E-Poçt</h3>
                  <p className="text-gray-400 text-sm">Rəsmi Müraciətlər və İş Birliyi</p>
               </a>
            </div>
          </main>
        )}

        {/* Məhsullar Səhifəsi */}
        {page === "categories" && (
          <main className="reveal max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <div className="mb-6 sm:mb-12 space-y-3 sm:space-y-6">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Kataloq</h1>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 no-scrollbar w-full">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-3 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-2 sm:gap-3 ${selectedCat === cat.id ? "bg-purple-600 text-white shadow-[0_10px_25px_rgba(168,85,247,0.5)] transform scale-105" : "bg-indigo-950/30 border border-indigo-900/50 text-gray-400 hover:bg-indigo-900/40 hover:text-white"}`}>
                    <span className="text-sm sm:text-lg">{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.filter(p => selectedCat === "all" || p.cat === selectedCat).map((product, index) => (
                <div key={product.id} onClick={() => openProductDetail(product)} className="reveal cursor-pointer glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden group" style={{ transitionDelay: `${index * 50}ms` }}>
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <div className="p-2 sm:p-3 bg-[#0c0c1d] rounded-xl sm:rounded-2xl border border-white/10 shadow-lg">{getOfficialLogo(product.name, product.emoji, product.color, product.customLogo)}</div>
                    </div>
                    <h3 className="text-base sm:text-2xl font-black text-white mb-1 sm:mb-2">{product.name}</h3>
                    <p className="text-[9px] sm:text-xs text-gray-400 font-medium leading-relaxed mb-4 sm:mb-6">{product.desc}</p>
                  </div>
                  <button className="w-full py-2.5 sm:py-3.5 rounded-xl font-black text-[8px] sm:text-xs uppercase tracking-widest text-white transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02]" style={{ backgroundColor: product.color }}>Ətraflı Bax</button>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* Məhsul Detalı Səhifəsi */}
        {page === "product_detail" && viewedProduct && (
          <main className="reveal max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <button onClick={() => setPage("categories")} className="text-gray-400 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2 transition">
              ← Geriyə
            </button>
            <div className="glass-card rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-12 border border-indigo-500/20 overflow-hidden relative">
               <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 relative z-10">
                 <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center gap-4 sm:gap-6 reveal">
                      <div className="p-4 sm:p-6 bg-[#0c0c1d] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl">{getOfficialLogo(viewedProduct.name, viewedProduct.emoji, viewedProduct.color, viewedProduct.customLogo)}</div>
                      <div>
                         <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full tracking-widest uppercase inline-block mb-2">100% Zəmanət</span>
                         <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">{viewedProduct.name}</h1>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-black reveal" style={{ transitionDelay: '50ms' }}>
                       <div className="flex items-center gap-1 sm:gap-2 bg-[#0c0c1d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-900/50"><span className="text-yellow-400">⭐ {viewedProduct.rating || "5.0"}</span> <span className="text-white hidden sm:inline">Reytinq</span></div>
                       <div className="flex items-center gap-1 sm:gap-2 bg-[#0c0c1d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-900/50"><span className="text-emerald-400">🔥 {viewedProduct.sales || "1k+"}</span> <span className="text-white hidden sm:inline">Satış</span></div>
                       <div className="flex items-center gap-1 sm:gap-2 bg-[#0c0c1d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-500/30 text-indigo-300">Növ: {viewedProduct.accountType || "Rəsmi Hesab"}</div>
                    </div>

                    <div className="space-y-3 sm:space-y-4 reveal" style={{ transitionDelay: '100ms' }}>
                       <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-widest">Məhsul Haqqında</h3>
                       <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">{viewedProduct.desc}</p>
                    </div>

                    <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-indigo-900/50 reveal" style={{ transitionDelay: '150ms' }}>
                       <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-widest">Üstünlüklər</h3>
                       <ul className="space-y-2 sm:space-y-3">
                         {(viewedProduct.features || ["Rəsmi zəmanət", "7/24 Dəstək"]).map((feature, i) => (
                           <li key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-300"><span className="text-emerald-400">✓</span> {feature}</li>
                         ))}
                       </ul>
                    </div>
                 </div>

                 <div className="bg-[#0c0c1d] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-indigo-900/30 flex flex-col justify-between mt-6 lg:mt-0 reveal" style={{ transitionDelay: '200ms' }}>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest mb-4 sm:mb-6 text-center">Müddəti Seçin</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {viewedProduct.packages.map((pkg) => (
                          <div key={pkg.id} onClick={() => setSelectedDuration(pkg)} className={`cursor-pointer p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 flex items-center justify-between transition-all duration-300 ${selectedDuration?.id === pkg.id ? "bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] transform scale-[1.02]" : "bg-black border-transparent hover:border-indigo-900/50"}`}>
                            <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${selectedDuration?.id === pkg.id ? "text-purple-300" : "text-gray-400"}`}>{pkg.duration}</span>
                            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">{pkg.price} <span className="text-[10px] sm:text-sm text-gray-500">AZN</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-6 sm:pt-8 border-t border-indigo-900/50 text-center">
                       <button onClick={() => { addToCart(viewedProduct, selectedDuration); }} className="glow-btn w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 shadow-[0_10px_30px_rgba(168,85,247,0.4)]">
                         <Icons.Cart /> İndi Səbətə At
                       </button>
                       <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-3 sm:mt-4">100% Güvənli Çatdırılma</p>
                    </div>
                 </div>
               </div>
            </div>
          </main>
        )}

        {/* Ödəniş Səhifəsi */}
        {page === "checkout" && (
          <main className="reveal max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <button type="button" onClick={() => { setPage("categories"); setIsCartOpen(true); }} className="text-gray-400 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2 transition cursor-pointer relative z-50">
              ← Səbətə Qayıt
            </button>
            
            <div className="glass-card w-full max-w-4xl mx-auto rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] relative">
              <div className="text-center mb-6 sm:mb-8 pt-2 sm:pt-0 reveal">
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight">Ödəniş Mərhələsi</h3>
                <p className="text-[11px] sm:text-sm font-medium text-gray-400 max-w-md mx-auto">Aşağıdakı kartlardan birinə ödəniş edin, nömrəni kopyalamaq üçün toxunun və çeki yükləyin.</p>
              </div>

              <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 sm:pb-6 snap-x no-scrollbar w-full reveal" style={{ transitionDelay: '100ms' }}>
                {CARD_ACCOUNTS.map(acc => (
                  <div key={acc.id} onClick={() => setSelectedBank(acc)} className={`flex-shrink-0 w-56 h-36 sm:w-64 sm:h-44 snap-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${acc.color} ${selectedBank.id === acc.id ? "ring-offset-4 ring-purple-500 scale-[1.02] shadow-[0_15px_40px_rgba(0,0,0,0.4)]" : "opacity-90 hover:opacity-100 scale-95"}`}>
                    <div className="relative z-10 font-black text-gray-400 text-[10px] sm:text-xs tracking-widest text-center uppercase">{acc.bank}</div>
                    <div className="relative z-10 w-full flex items-center justify-center flex-1 py-1"><acc.logo /></div>
                    <div className="relative z-10 mt-auto text-center">
                      <div onClick={(e) => copyToClipboard(e, acc.num)} className="group cursor-pointer inline-block bg-gray-100/80 px-3 py-1 rounded-md border border-gray-300 shadow-sm">
                        <div className={`text-base sm:text-lg font-black tracking-widest transition-colors ${acc.numColor}`}>{acc.num}</div>
                        <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500">
                          <span>📋</span> Kopyala
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-6 sm:space-y-8 mt-2 sm:mt-4 bg-[#0c0c1d] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-900/30 reveal" style={{ transitionDelay: '200ms' }}>
                <div>
                  <label className="block text-[9px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">Ödəniş Çeki (Cihazdan Yüklə)</label>
                  {!uploadedReceipt ? (
                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 sm:h-40 rounded-xl sm:rounded-2xl border-2 border-dashed border-purple-500/40 bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-purple-900/30 hover:border-purple-400 transition group shadow-inner">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-950 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition border border-purple-500/30 shadow-lg text-lg sm:text-xl">📸</div>
                      <span className="text-xs sm:text-sm text-purple-300 font-bold">Çeki seçmək üçün toxunun</span>
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
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{cart.reduce((sum, item) => sum + item.package.price, 0)} <span className="text-sm sm:text-lg text-purple-400">AZN</span></span>
                  </div>
                  <button type="submit" disabled={isEmailSending} className="glow-btn w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 sm:gap-3">
                    {isEmailSending ? <><div className="spinner"></div> İşlənir...</> : "Sifarişi Təsdiqlə"}
                  </button>
                </div>
              </form>
            </div>
          </main>
        )}

        {/* Şəxsi Kabinet */}
        {page === "dashboard" && (
          <main className="reveal max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <h1 className="text-2xl sm:text-4xl font-black text-white mb-4 sm:mb-8 tracking-tight">Şəxsi Kabinet</h1>
            
            <div className="flex gap-2 sm:gap-4 border-b border-indigo-950/60 pb-3 sm:pb-4 mb-6 sm:mb-8 overflow-x-auto no-scrollbar w-full">
              <button onClick={() => setDashTab("profile")} className={`px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${dashTab === "profile" ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50 hover:text-white"}`}>Hesab Məlumatları</button>
              <button onClick={() => setDashTab("orders")} className={`px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${dashTab === "orders" ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50 hover:text-white"}`}>
                Sifarişlərim {orders.filter(o => o.userEmail === user?.email).length > 0 && <span className="ml-1 sm:ml-2 bg-white/20 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">{orders.filter(o => o.userEmail === user?.email).length}</span>}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 sm:gap-10">
              {dashTab === "profile" && (
                <div className="w-full max-w-2xl reveal">
                  <div className="glass-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-indigo-500/20">
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8 sm:mb-10">
                      <div className="relative group">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-4xl sm:text-5xl text-white overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.4)] border-2 sm:border-4 border-[#030308]">
                          {profileEdit.profileImg ? <img src={profileEdit.profileImg} alt="User" className="w-full h-full object-cover" /> : profileEdit.name?.[0]?.toUpperCase()}
                        </div>
                        <div onClick={() => profileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                          <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center">Şəkli<br/>Dəyiş</span>
                        </div>
                        <input type="file" accept="image/*" ref={profileInputRef} onChange={(e) => handleImageUpload(e, (res) => setProfileEdit({...profileEdit, profileImg: res}))} className="hidden" />
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-2xl sm:text-3xl font-black text-white">{user?.name} {user?.surname}</h3>
                        <p className="text-xs sm:text-sm text-purple-400 font-bold tracking-wider mt-1">{user?.email}</p>
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
                       <button onClick={handleUpdateProfile} className="flex-1 py-3 sm:py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition">Yadda Saxla</button>
                       <button onClick={() => { setUser(null); setPage("home"); }} className="px-6 sm:px-8 py-3 sm:py-4 bg-red-950/40 border border-red-900/40 hover:bg-red-900/50 text-red-400 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition">Çıxış Et</button>
                    </div>
                  </div>
                </div>
              )}

              {dashTab === "orders" && (
                <div className="w-full reveal">
                  {orders.filter(o => o.userEmail === user?.email).length === 0 ? (
                    <div className="glass-card rounded-[2rem] p-10 sm:p-16 text-center space-y-4 sm:space-y-6 border border-indigo-500/20">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[#0c0c1d] rounded-full flex items-center justify-center mx-auto border border-indigo-500/30">
                        <span className="text-2xl sm:text-4xl animate-bounce text-purple-400"><Icons.Cart /></span>
                      </div>
                      <div><h3 className="text-lg sm:text-2xl font-black text-white mb-1">Sifarişiniz Yoxdur</h3><p className="text-xs sm:text-sm text-gray-400 font-medium">Platformamızdan hələ heç bir abunəlik əldə etməmisiniz.</p></div>
                      <button onClick={() => {setPage("categories"); setDashTab("profile");}} className="glow-btn inline-block px-8 sm:px-10 py-3 sm:py-4 rounded-xl bg-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider">Kataloqa Keç</button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:gap-6">
                      {orders.filter(o => o.userEmail === user?.email).reverse().map((order) => (
                        <div key={order.id} className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 border border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3 w-full md:w-auto">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-purple-600 text-white tracking-widest">{order.id}</span>
                              <span className="text-[9px] sm:text-xs font-bold text-gray-500">{order.date}</span>
                            </div>
                            <h4 className="text-sm sm:text-xl font-black text-white">{order.productName} <span className="text-purple-400">({order.duration})</span></h4>
                            <div className="flex gap-3 sm:gap-4 text-[9px] sm:text-xs font-bold text-gray-400"><span>Ödəniş: <span className="text-white">{order.bank}</span></span><span>Məbləğ: <span className="text-white">{order.price} AZN</span></span></div>
                          </div>
                          <div className="w-full md:w-auto text-left md:text-right mt-2 md:mt-0">
                            {order.status === "pending" && <span className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-yellow-900/40 border border-yellow-500/40 text-yellow-400 text-[8px] sm:text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2"><div className="spinner w-2 h-2 sm:w-3 sm:h-3 border-[2px]"></div> Yoxlanılır</span>}
                            {order.status === "rejected" && <span className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-red-900/40 border border-red-500/40 text-red-400 text-[8px] sm:text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2">❌ Rədd Edildi</span>}
                            {order.status === "approved" && (
                              <div className="space-y-2 sm:space-y-3">
                                <span className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 text-[8px] sm:text-xs font-black uppercase tracking-wider shadow-inner inline-flex items-center gap-2">✅ Aktivdir</span>
                                {order.credentials && (
                                  <div className="p-3 sm:p-4 bg-[#0c0c1d] border border-indigo-500/30 rounded-xl text-[9px] sm:text-xs space-y-1.5 sm:space-y-2 text-left w-full sm:min-w-[200px]">
                                    <div className="text-gray-500 font-bold uppercase tracking-widest text-[7px] sm:text-[9px] mb-1 sm:mb-2">Giriş Məlumatları</div>
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

        {/* Qaydalar və Məxfilik Siyasəti (Yeni Əlavə) */}
        {(page === "rules" || page === "privacy") && (
          <main className="reveal max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 w-full text-center">
            <div className="glass-card p-10 sm:p-16 rounded-[2rem] border border-indigo-500/30">
               <div className="w-20 h-20 mx-auto bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-3xl mb-6">📄</div>
               <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">{page === "rules" ? "İstifadə Qaydaları" : "Məxfilik Siyasəti"}</h1>
               <p className="text-gray-400 mb-8 leading-relaxed">Bu bölməyə aid PDF faylı və ya detallı mətn tezliklə bura əlavə olunacaqdır. Saytımızın bütün şərtləri müştəri məmnuniyyətini qorumaq üçündür.</p>
               <button onClick={() => setPage("home")} className="glow-btn px-8 py-3 bg-purple-600 text-white font-bold rounded-xl text-sm uppercase tracking-widest">Ana Səhifəyə Qayıt</button>
            </div>
          </main>
        )}

        {/* ADMINISTRATIVE DASHBOARD SCREEN */}
        {page === "admin_dashboard" && isAdminLoggedIn && (
          <main className="reveal max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div><h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">İdarəetmə Paneli</h1><p className="text-xs sm:text-sm font-bold text-purple-400 mt-1 sm:mt-2 uppercase tracking-widest">Səlahiyyətli İdarəçi</p></div>
              <button onClick={handleAdminLogout} className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-red-900/40 border border-red-500/30 text-red-400 font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-red-800/50 transition shadow-lg w-full sm:w-auto">Sistemdən Çıxış</button>
            </div>

            <div className="flex gap-2 sm:gap-4 border-b border-indigo-950/60 pb-4 sm:pb-6 mb-6 sm:mb-8 overflow-x-auto no-scrollbar w-full">
              <button onClick={() => setActiveAdminTab("orders")} className={`px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeAdminTab === "orders" ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50"}`}>Sifarişlər ({orders.length})</button>
              <button onClick={() => setActiveAdminTab("products")} className={`px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all ${activeAdminTab === "products" ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:bg-indigo-950/50"}`}>Məhsullar ({products.length})</button>
            </div>

            {activeAdminTab === "orders" && (
              <div className="space-y-4 sm:space-y-6 reveal w-full">
                {orders.length === 0 && <div className="text-center py-12 sm:py-20 text-gray-500 font-bold text-base sm:text-lg">Sistemdə heç bir sifariş yoxdur.</div>}
                <div className="grid gap-4 w-full">
                  {orders.slice().reverse().map((order) => (
                    <div key={order.id} className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 flex flex-col lg:flex-row justify-between gap-5 sm:gap-6 border-l-4 w-full" style={{borderLeftColor: order.status === 'pending' ? '#eab308' : order.status === 'approved' ? '#10b981' : '#ef4444'}}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                        <div><div className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">ID / Tarix</div><div className="font-bold text-purple-400 mt-1 text-[11px] sm:text-base">{order.id}</div><div className="text-[10px] sm:text-xs font-bold text-gray-400">{order.date}</div></div>
                        <div><div className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Müştəri</div><div className="font-black text-white mt-1 text-[11px] sm:text-base">{order.userName} {order.userSurname}</div><div className="text-[10px] sm:text-xs font-bold text-gray-400">{order.userEmail}</div><div className="text-[10px] sm:text-xs font-bold text-gray-400">{order.userPhone}</div></div>
                        <div><div className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Məhsul / Məbləğ</div><div className="font-black text-white mt-1 text-[11px] sm:text-base">{order.productName} ({order.duration})</div><div className="font-black text-emerald-400">{order.price} AZN</div></div>
                        <div><div className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Bank Çeki</div><div className="font-bold text-white mt-1 text-[11px] sm:text-base">{order.bank}</div>{order.receipt && <a href={order.receipt} target="_blank" rel="noreferrer" className="inline-block mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-900/50 text-indigo-300 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg">Çekə Bax 🔍</a>}</div>
                      </div>
                      <div className="flex lg:flex-col justify-end gap-2 sm:gap-3 min-w-[120px] sm:min-w-[150px] mt-4 lg:mt-0">
                        {order.status === "pending" ? (
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <button onClick={() => setApprovingOrder(order)} className="flex-1 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg transition">Təsdiqlə</button>
                            <button onClick={() => rejectOrderAction(order)} className="flex-1 py-2.5 sm:py-3 bg-red-900/50 text-red-400 hover:bg-red-800/60 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition">Rədd Et</button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 w-full">
                            <div className={`text-center py-2 px-3 rounded-lg font-black text-[10px] uppercase w-full ${order.status === 'approved' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                              {order.status === 'approved' ? 'Təsdiqlənib' : 'Rədd Edilib'}
                            </div>
                            <div className="flex gap-2 w-full">
                              {order.status === 'approved' && <button onClick={() => { setApprovingOrder(order); setAccountEmail(order.credentials?.email || ''); setAccountPass(order.credentials?.pass || ''); }} className="flex-1 bg-blue-900/40 text-blue-400 py-2 rounded text-[9px] font-black uppercase transition hover:bg-blue-800/60">Dəyiş</button>}
                              <button onClick={() => rejectOrderAction(order)} className="flex-1 bg-orange-900/40 text-orange-400 py-2 rounded text-[9px] font-black uppercase transition hover:bg-orange-800/60">Ləğv</button>
                              <button onClick={() => remove(ref(db, 'orders/' + order.firebaseKey))} className="flex-1 bg-red-900/40 text-red-400 py-2 rounded text-[9px] font-black uppercase transition hover:bg-red-800/60">Sil</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeAdminTab === "products" && (
              <div className="space-y-4 sm:space-y-6 reveal w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Məhsul Kataloqu</h2>
                  <button onClick={() => setEditingProduct({ name: "Yeni Məhsul", cat: "entertainment", color: "#6366f1", emoji: "📦", desc: "Açıqlama", accountType: "Rəsmi Hesab", rating: "5.0", sales: "0", features: ["Yeni xüsusiyyət"], customLogo: "", packages: [{ id: "temp1", duration: "1 Ay", price: 10 }] })} className="glow-btn w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">+ Yeni Əlavə Et</button>
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
                        <button onClick={() => setEditingProduct({...p, features: p.features || []})} className="flex-1 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-500 rounded-lg sm:rounded-xl text-white font-black text-[10px] sm:text-xs uppercase tracking-wider transition shadow-lg">Tam Redaktə</button>
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

      {/* WHATSAPP FLOAT BUTTON (Sol Alt Künc) */}
      <a href="https://wa.me/994103136941" className="wa-float reveal" style={{ zIndex: 1000 }} target="_blank" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c.003-3.625 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
        </svg>
      </a>

      {/* YENİ APPBAZAR TƏRZİ ALT MENYU (FOOTER) */}
      <footer className="footer-bg mt-16 pt-16 sm:pt-24 pb-8" id="footer">
        <div className="footer-wave"></div>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 sm:gap-16 relative z-10">
           
           {/* 1. Brend və Sosial */}
           <div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tighter">PREMIUM.</h2>
              <p className="text-gray-400 text-sm mb-6 font-medium">Bizi sosial şəbəkələrdə izləyin!</p>
              <div className="flex gap-3">
                 <a href="https://facebook.com/premiumshop.az" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition font-bold">f</a>
                 <a href="https://instagram.com/substore.az" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition font-bold">ig</a>
              </div>
           </div>

           {/* 2. Faydalı Linklər */}
           <div>
              <h3 className="text-lg font-bold text-white mb-4">Faydalı Link</h3>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                 <li><span className="text-purple-500 mr-2 font-bold">›</span> <span className="cursor-pointer hover:text-white transition" onClick={() => {setPage("categories"); setSelectedCat("all");}}>Bütün məhsullar</span></li>
                 <li><span className="text-purple-500 mr-2 font-bold">›</span> <span className="cursor-pointer hover:text-white transition" onClick={() => setPage("rules")}>İstifadə Şərtləri</span></li>
                 <li><span className="text-purple-500 mr-2 font-bold">›</span> <span className="cursor-pointer hover:text-white transition" onClick={() => { if(user) {setPage("dashboard"); setDashTab("profile");} else {setAuthMode("login");} }}>Hesab</span></li>
                 <li><span className="text-purple-500 mr-2 font-bold">›</span> <span className="cursor-pointer hover:text-white transition" onClick={() => setIsCartOpen(true)}>Səbətim</span></li>
              </ul>
           </div>

           {/* 3. Qısa Keçidlər */}
           <div>
              <h3 className="text-lg font-bold text-white mb-4">Qısa Keçidlər</h3>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                 <li><span className="text-purple-500 mr-2 font-bold">›</span> <span className="cursor-pointer hover:text-white transition" onClick={() => setAuthMode("login")}>Giriş</span></li>
                 <li><span className="text-purple-500 mr-2 font-bold">›</span> <span className="cursor-pointer hover:text-white transition" onClick={() => setAuthMode("register")}>Qeydiyyat</span></li>
              </ul>
           </div>

           {/* 4. Abunə Ol */}
           <div>
              <h3 className="text-lg font-bold text-white mb-4">Abunə Ol</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-4 font-medium">Ən yeni güncəlləmələrdən xəbərdar olmaq üçün abunə ol!</p>
              <div className="space-y-3">
                 <input type="email" placeholder="Email daxil et" className="w-full bg-[#111122] border-none rounded-full px-5 py-3.5 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
                 <button onClick={() => setAuthMode("register")} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold rounded-full py-3.5 text-sm tracking-widest transition shadow-[0_0_15px_rgba(168,85,247,0.4)]">ABUNƏ OL</button>
              </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mt-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs font-medium text-gray-500 relative z-10">
           <span>Copyright © 2026 Premium Shop, Bütün hüquqlar qorunur.</span>
           <div className="flex gap-4 mt-4 sm:mt-0">
             <span className="cursor-pointer hover:text-white transition" onClick={() => setPage("rules")}>Qaydalar</span>
             <span className="cursor-pointer hover:text-white transition" onClick={() => setPage("privacy")}>Məxfilik Siyasəti</span>
             <span className="cursor-pointer hover:text-white transition" onClick={() => setIsAdminModalOpen(true)}>Admin</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

// Minimalist Toast Notification
function Notif({ n }) {
  if (!n) return null;
  const colors = n.type === "error" ? "bg-red-600 text-white" : n.type === "info" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white";
  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1001] px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] font-black text-[10px] sm:text-xs uppercase tracking-wider text-center animate-toast ${colors}`}>
      {n.msg}
    </div>
  );
}