import React, { useState, useEffect } from "react";

// Elegant Custom CSS for AppBazar style premium dark neon design
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
  
  /* Scrollbar custom styling */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #030308; }
  ::-webkit-scrollbar-thumb { background: #1e1b4b; border-radius: 8px; border: 2px solid #030308; }
  ::-webkit-scrollbar-thumb:hover { background: #6366f1; }
  
  /* Glowing buttons and cards */
  .glow-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
  }
  .glow-btn:hover {
    box-shadow: 0 0 25px rgba(99, 102, 241, 0.45);
    transform: translateY(-2px);
  }
  
  .glass-card {
    background: rgba(10, 10, 22, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(99, 102, 241, 0.12);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .glass-card:hover {
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15);
  }
  
  .neon-text {
    text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  }

  /* Shimmer effect for custom loaders */
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer {
    background: linear-gradient(90deg, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  /* Slide in custom drawers */
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  .drawer-open {
    animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

// Default premium products pre-seeded for Azerbaijani users
const DEFAULT_PRODUCTS = [
  { 
    id: 1, 
    name: "Netflix Premium", 
    cat: "entertainment", 
    color: "#E50914", 
    emoji: "🎬", 
    desc: "4K Ultra HD · 4 Ekran · Eyni anda izləmə imkanı", 
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
    desc: "Reklamsız musiqi · Offline yükləmə · Yüksək səs keyfiyyəti", 
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
    desc: "Reklamsız videolar · Arxa fonda oynatma · YouTube Music daxil", 
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
    desc: "GPT-4o girişi · DALL-E 3 ilə şəkil yaratma · Sürətli cavablar", 
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
    desc: "Bütün premium şablonlar · AI dizayn alətləri · Arxa fon silmə", 
    packages: [
      { id: "p12", duration: "1 Ay", price: 9 },
      { id: "p13", duration: "3 Ay", price: 24 },
      { id: "p14", duration: "1 İl", price: 85 }
    ], 
    popular: true 
  },
  { 
    id: 6, 
    name: "NordVPN Premium", 
    cat: "vpn", 
    color: "#4687FF", 
    emoji: "🔒", 
    desc: "Ultra sürətli təhlükəsizlik serverləri · Şifrələnmiş internet", 
    packages: [
      { id: "p15", duration: "1 Ay", price: 8 },
      { id: "p16", duration: "3 Ay", price: 20 },
      { id: "p17", duration: "1 İl", price: 65 }
    ], 
    popular: true 
  }
];

// Re-designed bank accounts requested by the user
const CARD_ACCOUNTS = [
  { id: "abb", bank: "ABB Bank", num: "5522 0093 7234 8144", holder: "Faiq Kərimli", color: "from-blue-600 to-indigo-700" },
  { id: "kapital", bank: "Kapital Bank", num: "4169 7388 1861 3451", holder: "Faiq Kərimli", color: "from-red-600 to-rose-700" },
  { id: "leo", bank: "LEO Bank", num: "4098 5844 6496 5191", holder: "Faiq Kərimli", color: "from-orange-500 to-yellow-600" },
  { id: "m10", bank: "M10 Hesabı", num: "+994103136941", holder: "M10 Pul Köçürməsi", color: "from-cyan-500 to-teal-600" }
];

const CATEGORIES = [
  { id: "all", label: "Hamısı", icon: "🌐" },
  { id: "entertainment", label: "Əyləncə", icon: "🎬" },
  { id: "ai", label: "Süni İntellekt", icon: "🤖" },
  { id: "design", label: "Dizayn", icon: "🎨" },
  { id: "vpn", label: "VPN & Antivirus", icon: "🔒" },
  { id: "productivity", label: "Biznes & Produktivlik", icon: "💼" }
];

export default function App() {
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
        receipt: "proof_receipt_12845.png",
        status: "approved",
        credentials: { email: "netflix-vip@substore.az", pass: "Faiq2026!" },
        date: "12 İyul 2026"
      }
    ];
  });

  // State managers
  const [page, setPage] = useState("home"); // home, shop, contact, dashboard
  const [selectedCat, setSelectedCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem("premium_shop_current_user");
    return local ? JSON.parse(local) : null;
  });

  // Modals & UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [authMode, setAuthMode] = useState(null); // 'login', 'register', 'otp'
  const [authForm, setAuthForm] = useState({ name: "", surname: "", phone: "", email: "", pass: "", otpInput: "" });
  const [otpCode, setOtpCode] = useState(null);
  const [selectedBank, setSelectedBank] = useState(CARD_ACCOUNTS[0]);
  const [uploadedReceipt, setUploadedReceipt] = useState(null);
  const [notification, setNotification] = useState(null);

  // Admin states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem("premium_shop_admin_active") === "true";
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState("orders"); // orders, edit_products

  // Admin editing states
  const [editingProduct, setEditingProduct] = useState(null);
  const [approvingOrder, setApprovingOrder] = useState(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPass, setAccountPass] = useState("");

  // Sync to localStorage
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

  const handleUserAuth = (e) => {
    e.preventDefault();
    if (authMode === "login") {
      if (!authForm.email || !authForm.pass) {
        showNotif("Zəhmət olmasa bütün sahələri doldurun", "error");
        return;
      }
      setUser({
        name: authForm.name || "Hörmətli",
        surname: authForm.surname || "Müştəri",
        email: authForm.email,
        phone: authForm.phone || "+99450XXXXXXX"
      });
      showNotif("Uğurlu Giriş! Xoş gəldiniz.", "success");
      setAuthMode(null);
    } else if (authMode === "register") {
      if (!authForm.name || !authForm.surname || !authForm.phone || !authForm.email || !authForm.pass) {
        showNotif("Zəhmət olmasa bütün məlumatları doldurun", "error");
        return;
      }
      // Generate simulated OTP
      const code = "1234";
      setOtpCode(code);
      setAuthMode("otp");
      showNotif(`Doğrulama kodu ${authForm.email} ünvanına göndərildi (Simulyasiya: 1234)`, "info");
    } else if (authMode === "otp") {
      if (authForm.otpInput === "1234") {
        setUser({
          name: authForm.name,
          surname: authForm.surname,
          email: authForm.email,
          phone: authForm.phone
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

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      showNotif("Sifariş tamamlamaq üçün əvvəlcə giriş etməlisiniz!", "error");
      setAuthMode("login");
      setIsCheckoutOpen(false);
      return;
    }
    if (!uploadedReceipt) {
      showNotif("Zəhmət olmasa ödəniş çekini yükləyin!", "error");
      return;
    }

    // Place orders for all items in the cart
    const newOrders = cart.map(item => ({
      id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
      userEmail: user.email,
      userName: user.name,
      userSurname: user.surname,
      userPhone: user.phone,
      productName: item.product.name,
      duration: item.package.duration,
      price: item.package.price,
      bank: selectedBank.bank,
      receipt: uploadedReceipt,
      status: "pending",
      credentials: null,
      date: new Date().toLocaleDateString("az-AZ")
    }));

    setOrders(prev => [...prev, ...newOrders]);
    setCart([]);
    setIsCheckoutOpen(false);
    showNotif("Sifarişiniz qəbul edildi! Admin təsdiqindən sonra hesabınız göndəriləcək.", "success");
    setPage("dashboard");
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUsername === "karimllii" && adminPassword === "Karimli.777") {
      setIsAdminLoggedIn(true);
      localStorage.setItem("premium_shop_admin_active", "true");
      setIsAdminModalOpen(false);
      showNotif("Hörmətli Admin, Xoş gəldiniz!", "success");
      setPage("home");
    } else {
      showNotif("Yanlış İstifadəçi adı və ya Şifrə!", "error");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("premium_shop_admin_active");
    showNotif("Admin panelindən çıxış edildi.", "info");
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct.id) {
      // Edit existing
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      showNotif("Məhsul uğurla yeniləndi!", "success");
    } else {
      // Add new
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

  const approveOrderAction = (e) => {
    e.preventDefault();
    if (!accountEmail || !accountPass) {
      showNotif("Zəhmət olmasa Hesab məlumatlarını tam daxil edin!", "error");
      return;
    }
    setOrders(prev => prev.map(o => o.id === approvingOrder.id ? {
      ...o,
      status: "approved",
      credentials: { email: accountEmail, pass: accountPass }
    } : o));

    showNotif(`Sifariş təsdiqləndi! Email göndərildi: ${approvingOrder.userEmail}`, "success");
    setApprovingOrder(null);
    setAccountEmail("");
    setAccountPass("");
  };

  const rejectOrderAction = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "rejected" } : o));
    showNotif("Sifariş rədd edildi", "error");
  };

  return (
    <>
      <style>{CSS}</style>

      {/* STICKY NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-[#030308]/90 backdrop-blur-md border-b border-indigo-950/40 px-6 py-4">
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
            <button onClick={() => setPage("home")} className={`font-semibold text-sm transition ${page === "home" ? "text-indigo-400 glow-btn" : "text-gray-400 hover:text-white"}`}>
              Ana Səhifə
            </button>
            <button onClick={() => { setPage("home"); setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-semibold text-sm text-gray-400 hover:text-white transition">
              Məhsullar
            </button>
            <button onClick={() => { setPage("home"); setTimeout(() => document.getElementById("categories-section")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-semibold text-sm text-gray-400 hover:text-white transition">
              Kateqoriyalar
            </button>
            <button onClick={() => { setPage("home"); setTimeout(() => document.getElementById("footer")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="font-semibold text-sm text-gray-400 hover:text-white transition">
              Əlaqə
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
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="font-semibold text-xs text-indigo-200 hidden sm:inline">{user.name}</span>
              </button>
            ) : (
              <button onClick={() => setAuthMode("login")} className="glow-btn px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold tracking-wide">
                Hesab
              </button>
            )}

            {isAdminLoggedIn && (
              <button onClick={() => setPage("admin_dashboard")} className="px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs font-semibold">
                🛡️ Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* NOTIFICATION TOAST */}
      <Notif n={notification} />

      {/* HERO BANNER SECTION (Inspired by appbazar.az) */}
      {page === "home" && (
        <main className="max-w-7xl mx-auto px-6 py-12 md:py-24">
          <div className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-16 mb-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 grid md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-900/40 text-indigo-300 text-xs font-bold">
                  <span>⚡</span> Sifarişlər dərhal təsdiqlənir
                </div>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] neon-text">
                  Rəqəmsal Dünyanızı <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">Premium Edin!</span>
                </h1>
                <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed">
                  Azərbaycanın rəqəmsal abunəlik bazarında ən güvənli platforma. Bütün Premium xidmətləri asan ödəniş, təhlükəsiz zəmanət və ani çatdırılma ilə əldə edin.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: 'smooth' })} className="glow-btn px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition">
                    Abunəliklərə Bax
                  </button>
                  <a href="https://wa.me/994103136941" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-950/30 border border-emerald-900/30 text-emerald-300 font-semibold hover:bg-emerald-950/50 transition">
                    <span className="text-xl">💬</span> Bizimlə Əlaqə
                  </a>
                </div>
              </div>

              <div className="md:col-span-5 relative hidden md:block">
                <div className="w-full h-80 rounded-2xl bg-gradient-to-tr from-indigo-900/20 to-purple-900/20 border border-indigo-500/10 flex items-center justify-center p-6 relative">
                  <div className="absolute inset-0 bg-[#030308]/40 backdrop-blur-sm rounded-2xl" />
                  <div className="relative z-10 text-center space-y-4">
                    <span className="text-6xl animate-bounce">🎬</span>
                    <h3 className="font-extrabold text-xl">Premium Shop VIP</h3>
                    <p className="text-xs text-gray-500 max-w-xs">Canva, Spotify, Netflix, Adobe və onlarla premium xidmət artıq bir klik uzaqlığında.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORIES SECTION */}
          <div id="categories-section" className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Kateqoriyalar</h2>
            <div className="flex gap-2.5 overflow-x-auto pb-4 pt-1 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-5 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${selectedCat === cat.id ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-indigo-950/20 border border-indigo-900/20 text-gray-400 hover:text-white"}`}>
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCTS CATALOG SECTION */}
          <div id="catalog" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold tracking-tight">Populyar Abunəliklər</h2>
              <span className="text-indigo-400 font-semibold text-sm">6 Əsas Seçim</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products
                .filter(p => selectedCat === "all" || p.cat === selectedCat)
                .map(product => {
                  const lowestPrice = product.packages && product.packages.length > 0 
                    ? Math.min(...product.packages.map(p => p.price)) 
                    : "0";
                  return (
                    <div key={product.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-600/10 transition" />
                      
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-4xl p-2 bg-indigo-950/30 rounded-xl border border-indigo-900/20">{product.emoji}</span>
                          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-full uppercase tracking-widest">
                            Premium
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-white mb-2">{product.name}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6">{product.desc}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-gray-500 font-semibold">Qiymət: </span>
                          <span className="text-2xl font-black text-indigo-400">{lowestPrice} AZN</span>
                          <span className="text-xs text-gray-500"> -dan başlayan</span>
                        </div>
                        <button onClick={() => { setSelectedProduct(product); setSelectedDuration(product.packages[0]); }} className="w-full py-3 rounded-xl bg-indigo-950/40 hover:bg-indigo-600 border border-indigo-900/40 hover:border-transparent text-white font-bold text-xs transition-all duration-300">
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

      {/* FOOTER & ADMIN TRIGGERS */}
      {page === "home" && (
        <section className="bg-indigo-950/10 border-t border-indigo-950/30 py-16 px-6" id="about-section">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Güvənli Alış-Veriş</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Kartla rahatlıqla ödəniş edin və çekinizi sistemə yükləyin. Ödənişlər dərhal yoxlanılır.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Yüksək Keyfiyyət</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Alınan bütün hesablar zəmanətlidir. Problem yarandıqda dərhal yeni hesab göndərilir.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Zəmanətli Dəstək</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Sualınız var? 7/24 fəaliyyət göstərən dəstək xidmətimizə birbaşa WhatsApp ilə qoşulun.</p>
            </div>
          </div>
        </section>
      )}

      {/* DETAILS VIEW / SPECIFIC PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl w-full max-w-lg p-6 sm:p-8 relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg p-2">✕</button>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl p-3 bg-indigo-950/40 rounded-2xl border border-indigo-900/30">{selectedProduct.emoji}</span>
              <div>
                <h3 className="text-2xl font-extrabold text-white">{selectedProduct.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{selectedProduct.desc}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Müddət və Paket Seçin:</label>
              <div className="grid grid-cols-2 gap-3">
                {selectedProduct.packages && selectedProduct.packages.map(pkg => (
                  <div key={pkg.id} onClick={() => setSelectedDuration(pkg)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${selectedDuration?.id === pkg.id ? "bg-indigo-600/10 border-indigo-500" : "bg-indigo-950/10 border-indigo-900/20 hover:border-indigo-800/40"}`}>
                    <span className="font-bold text-sm">{pkg.duration}</span>
                    <span className="text-lg font-black text-indigo-400 mt-2">{pkg.price} AZN</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setSelectedProduct(null)} className="flex-1 py-3.5 rounded-xl bg-indigo-950/40 text-gray-300 font-bold text-xs hover:text-white transition">Geri Qayıt</button>
              <button onClick={() => { addToCart(selectedProduct, selectedDuration); setSelectedProduct(null); }} className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs glow-btn transition">Səbətə Əlavə Et</button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="bg-[#050510] border-l border-indigo-950 w-full max-w-md h-full p-6 flex flex-col justify-between drawer-open">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-indigo-950/80 mb-6">
                <h3 className="text-xl font-extrabold text-white">Səbətiniz</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white text-lg">✕</button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <span className="text-5xl block">🛒</span>
                  <p className="text-sm text-gray-400">Səbətiniz boşdur</p>
                  <button onClick={() => setIsCartOpen(false)} className="text-xs font-bold text-indigo-400 hover:underline">Alış-verişə davam et</button>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="glass-card p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.product.emoji}</span>
                        <div>
                          <h4 className="font-bold text-sm text-white">{item.product.name}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{item.package.duration} - {item.package.price} AZN</p>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-300 text-xs p-2">Sil</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-4 border-t border-indigo-950/80 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Toplam Məbləğ:</span>
                  <span className="text-2xl font-black text-indigo-400">
                    {cart.reduce((sum, item) => sum + item.package.price, 0)} AZN
                  </span>
                </div>
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm glow-btn transition">
                  Ödəniş Mərhələsinə Keç
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL WITH NEW BANK TRANSFERS */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <div className="glass-card rounded-3xl w-full max-w-2xl p-6 sm:p-8 relative my-8">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg p-2">✕</button>
            <h3 className="text-2xl font-extrabold text-white mb-6">Sifarişi Tamamla</h3>

            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 flex justify-between items-center text-sm">
                <span className="text-gray-400">Ödəniləcək məbləğ:</span>
                <span className="text-xl font-black text-indigo-400">
                  {cart.reduce((sum, item) => sum + item.package.price, 0)} AZN
                </span>
              </div>

              {/* Bank Seçimi */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ödəniş Üsulu Seçin:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CARD_ACCOUNTS.map(acc => (
                    <div key={acc.id} onClick={() => setSelectedBank(acc)} className={`p-4 rounded-xl border-2 cursor-pointer text-center transition ${selectedBank.id === acc.id ? "bg-indigo-600/10 border-indigo-500" : "bg-indigo-950/10 border-indigo-900/20"}`}>
                      <h4 className="font-extrabold text-sm">{acc.bank}</h4>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kart Məlumatları Kartı */}
              <div className={`p-6 rounded-2xl bg-gradient-to-tr ${selectedBank.color} text-white shadow-lg space-y-4 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold tracking-widest">KART KÖÇÜRMƏSİ</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded uppercase">{selectedBank.bank}</span>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Hesab / Kart Nömrəsi:</p>
                  <div className="flex items-center gap-3">
                    <span className="text-lg sm:text-xl font-black tracking-wider">{selectedBank.num}</span>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(selectedBank.num); showNotif("Nömrə kopyalandı!", "success"); }} className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded text-xs font-bold transition">Kopyala</button>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase">Alıcı</p>
                    <p className="font-bold text-sm">{selectedBank.holder}</p>
                  </div>
                  <span className="text-lg">💳</span>
                </div>
              </div>

              {/* Çek yüklənməsi */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ödəniş Çeki (Şəkil / PDF):</label>
                <div className="p-6 rounded-xl border border-dashed border-indigo-900/40 bg-indigo-950/5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-950/10 transition relative">
                  <input type="file" required onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedReceipt(e.target.files[0].name);
                      showNotif("Çek uğurla əlavə edildi!", "success");
                    }
                  }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="text-4xl mb-2">📥</span>
                  <p className="text-xs font-semibold text-indigo-400">Ödəniş qəbzini yükləmək üçün klikləyin</p>
                  {uploadedReceipt && <p className="text-[10px] text-emerald-400 font-bold mt-2">Yükləndi: {uploadedReceipt}</p>}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-3.5 rounded-xl bg-indigo-950/40 text-gray-300 font-bold text-xs hover:text-white transition">Ləğv Et</button>
                <button type="submit" className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm glow-btn transition">Təsdiqlə və Çeki Göndər</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER AUTHENTICATION SYSTEM (With simulated OTP as requested) */}
      {authMode && (
        <div className="fixed inset-0 z-50 bg-[#030308]/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl w-full max-w-md p-8 relative">
            <button onClick={() => setAuthMode(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg p-2">✕</button>
            
            {authMode === "login" ? (
              <form onSubmit={handleUserAuth} className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-white">Xoş Gəldiniz</h3>
                  <p className="text-xs text-gray-400 mt-1">Premium abunəlik dünyasına qoşulun</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">E-Poçt:</label>
                  <input type="email" required placeholder="example@mail.com" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Şifrə:</label>
                  <input type="password" required placeholder="••••••••" value={authForm.pass} onChange={e => setAuthForm({ ...authForm, pass: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
                </div>
                <button type="submit" className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs glow-btn transition">Giriş Et</button>
                <p className="text-xs text-gray-500 text-center">Hesabınız yoxdur? <span onClick={() => setAuthMode("register")} className="text-indigo-400 hover:underline cursor-pointer font-bold">Qeydiyyatdan keçin</span></p>
              </form>
            ) : authMode === "register" ? (
              <form onSubmit={handleUserAuth} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-black text-white">Yeni Hesab</h3>
                  <p className="text-xs text-gray-400 mt-1">Məlumatlarınızı daxil edərək qeydiyyatdan keçin</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Ad:</label>
                    <input type="text" required placeholder="Faiq" value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Soyad:</label>
                    <input type="text" required placeholder="Kərimli" value={authForm.surname} onChange={e => setAuthForm({ ...authForm, surname: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Mobil Nömrə:</label>
                  <input type="tel" required placeholder="+994503136941" value={authForm.phone} onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">E-Poçt:</label>
                  <input type="email" required placeholder="faiq@example.com" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Şifrə yaradın:</label>
                  <input type="password" required placeholder="••••••••" value={authForm.pass} onChange={e => setAuthForm({ ...authForm, pass: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
                </div>
                <button type="submit" className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs glow-btn transition">Davam Et</button>
                <p className="text-xs text-gray-500 text-center">Hesabınız var? <span onClick={() => setAuthMode("login")} className="text-indigo-400 hover:underline cursor-pointer font-bold">Daxil olun</span></p>
              </form>
            ) : (
              <form onSubmit={handleUserAuth} className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-white">E-Poçt Təsdiqlənməsi</h3>
                  <p className="text-xs text-gray-400 mt-1">E-poçtunuza kod göndərildi. Simulyasiya Kodu: <b>1234</b></p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Təsdiq Kodu:</label>
                  <input type="text" required maxLength="4" placeholder="••••" value={authForm.otpInput} onChange={e => setAuthForm({ ...authForm, otpInput: e.target.value })} className="w-full text-center bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-lg tracking-widest" />
                </div>
                <button type="submit" className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs glow-btn transition">Təsdiqlə və Giriş Et</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* USER DASHBOARD PAGE */}
      {page === "dashboard" && (
        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            {/* Profil Məlumatları */}
            <div className="w-full md:w-1/3 space-y-6">
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white mx-auto mb-4">
                  {user ? user.name[0].toUpperCase() : "U"}
                </div>
                <h3 className="text-lg font-bold text-white">{user?.name} {user?.surname}</h3>
                <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                <div className="mt-6 pt-6 border-t border-indigo-950/50 text-left space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Telefon:</span>
                    <span className="text-white font-bold">{user?.phone}</span>
                  </div>
                </div>
                <button onClick={() => { setUser(null); setPage("home"); }} className="w-full mt-6 py-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 font-bold text-xs transition">Çıxış Et</button>
              </div>
            </div>

            {/* Sifariş Tarixçəsi və Hesab Məlumatları */}
            <div className="w-full md:w-2/3 space-y-6">
              <h2 className="text-2xl font-black">Sifarişlərim</h2>
              {orders.filter(o => o.userEmail === user?.email).length === 0 ? (
                <div className="glass-card rounded-2xl p-10 text-center space-y-4">
                  <span className="text-4xl block">📦</span>
                  <p className="text-gray-400 text-xs">Hələ ki heç bir sifarişiniz yoxdur.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter(o => o.userEmail === user?.email)
                    .map(order => (
                      <div key={order.id} className="glass-card rounded-2xl p-6 border-l-4 border-l-indigo-500">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                          <div>
                            <h4 className="font-extrabold text-lg">{order.productName} ({order.duration})</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Sifariş kodu: #{order.id} · {order.date}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${order.status === "approved" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : order.status === "rejected" ? "bg-red-950 text-red-300 border border-red-900" : "bg-yellow-950 text-yellow-300 border border-yellow-900"}`}>
                              {order.status === "approved" ? "Təsdiqləndi" : order.status === "rejected" ? "Rədd Edildi" : "Admin Onayı Gözləyir"}
                            </span>
                            <p className="font-extrabold text-sm text-indigo-400 mt-2">{order.price} AZN</p>
                          </div>
                        </div>

                        {order.status === "approved" && order.credentials && (
                          <div className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/30 space-y-3">
                            <div className="flex items-center justify-between text-xs border-b border-indigo-950/40 pb-2">
                              <span className="text-emerald-400 font-bold">🔒 Hesab Məlumatlarınız:</span>
                              <span className="text-[10px] text-gray-500">Kimsəyə ötürməyin</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="p-3 rounded-lg bg-indigo-950/60 border border-indigo-900/40 flex justify-between items-center">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] text-gray-400 block">E-Poçt:</span>
                                  <span className="text-xs font-bold text-white select-all">{order.credentials.email}</span>
                                </div>
                                <button onClick={() => { navigator.clipboard.writeText(order.credentials.email); showNotif("E-Poçt kopyalandı!", "success"); }} className="text-[10px] bg-indigo-800/40 px-2 py-0.5 rounded text-white">Kopyala</button>
                              </div>
                              <div className="p-3 rounded-lg bg-indigo-950/60 border border-indigo-900/40 flex justify-between items-center">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] text-gray-400 block">Şifrə:</span>
                                  <span className="text-xs font-bold text-white select-all">{order.credentials.pass}</span>
                                </div>
                                <button onClick={() => { navigator.clipboard.writeText(order.credentials.pass); showNotif("Şifrə kopyalandı!", "success"); }} className="text-[10px] bg-indigo-800/40 px-2 py-0.5 rounded text-white">Kopyala</button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {order.status === "pending" && (
                          <p className="text-xs text-gray-500 mt-2">⏱️ Ödəniş çekiniz admin tərəfindən yoxlanılır. Təsdiqlənəndə hesab məlumatları bura daxil ediləcək.</p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ADMIN CONTROL PANEL DASHBOARD (Strict credentials restricted) */}
      {page === "admin_dashboard" && isAdminLoggedIn && (
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between border-b border-indigo-950/80 pb-6 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-white">🛡️ Admin İdarəetmə Paneli</h2>
              <p className="text-xs text-gray-400 mt-1">Sifarişləri və abunəlik məhsullarını asanlıqla tənzimləyin</p>
            </div>
            <button onClick={handleAdminLogout} className="px-5 py-2.5 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 font-bold text-xs">Çıxış Et</button>
          </div>

          <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveAdminTab("orders")} className={`px-6 py-3 rounded-xl font-bold text-xs transition ${activeAdminTab === "orders" ? "bg-indigo-600 text-white" : "bg-indigo-950/20 text-gray-400 hover:text-white"}`}>
              Gələn Sifarişlər ({orders.filter(o => o.status === "pending").length})
            </button>
            <button onClick={() => setActiveAdminTab("edit_products")} className={`px-6 py-3 rounded-xl font-bold text-xs transition ${activeAdminTab === "edit_products" ? "bg-indigo-600 text-white" : "bg-indigo-950/20 text-gray-400 hover:text-white"}`}>
              Məhsulları Redaktə Et ({products.length})
            </button>
          </div>

          {/* ACTIVE TAB: ORDERS QUEUE */}
          {activeAdminTab === "orders" && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="glass-card p-10 rounded-2xl text-center text-gray-400">Hələ ki, sifariş yoxdur.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-indigo-950/80 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="py-4 px-4">Sifarişçi</th>
                        <th className="py-4 px-4">Məhsul / Müddət</th>
                        <th className="py-4 px-4">Kart / Ödəniş</th>
                        <th className="py-4 px-4">Yüklənən Çek</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-950/40 text-sm">
                      {orders.slice().reverse().map(order => (
                        <tr key={order.id} className="hover:bg-indigo-950/5">
                          <td className="py-4 px-4">
                            <p className="font-bold">{order.userName} {order.userSurname}</p>
                            <p className="text-[10px] text-gray-500">{order.userEmail} · {order.userPhone}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-white">{order.productName}</p>
                            <p className="text-xs text-indigo-400 font-bold">{order.duration} ({order.price} AZN)</p>
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-gray-400">{order.bank}</td>
                          <td className="py-4 px-4">
                            <span className="text-xs text-indigo-400 underline cursor-pointer select-all font-semibold">📁 {order.receipt}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${order.status === "approved" ? "bg-emerald-950/60 text-emerald-300" : order.status === "rejected" ? "bg-red-950/60 text-red-300" : "bg-yellow-950/60 text-yellow-300"}`}>
                              {order.status === "approved" ? "Təsdiqləndi" : order.status === "rejected" ? "Rədd Edildi" : "Gözləyir"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {order.status === "pending" ? (
                              <div className="flex gap-2">
                                <button onClick={() => setApprovingOrder(order)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">Onayla</button>
                                <button onClick={() => rejectOrderAction(order.id)} className="px-3 py-1.5 rounded-lg bg-red-950 text-red-400 hover:text-red-300 text-xs font-bold border border-red-900/40">Rədd et</button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 font-bold">Tamamlanıb</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TAB: PRODUCTS MANAGEMENT */}
          {activeAdminTab === "edit_products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Bütün Abunəliklər</h3>
                <button onClick={() => setEditingProduct({ name: "", cat: "entertainment", color: "#6366f1", emoji: "🌐", desc: "", packages: [{ id: Date.now().toString(), duration: "1 Ay", price: 10 }] })} className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition">
                  ➕ Yeni Məhsul Əlavə Et
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map(p => (
                  <div key={p.id} className="glass-card p-6 rounded-2xl flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-1.5 bg-indigo-950/30 rounded-lg">{p.emoji}</span>
                        <div>
                          <h4 className="font-extrabold text-lg text-white">{p.name}</h4>
                          <span className="text-[10px] text-gray-500 font-bold uppercase">{p.cat}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{p.desc}</p>
                      
                      {/* Package tiers info */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {p.packages && p.packages.map((pkg, idx) => (
                          <span key={idx} className="bg-indigo-950/50 border border-indigo-900/40 px-2.5 py-1 rounded text-xs text-indigo-300">
                            {pkg.duration}: <b>{pkg.price} AZN</b>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button onClick={() => setEditingProduct(p)} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">Düzəliş et</button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-950 text-red-400 text-xs font-bold transition">Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ADMIN SUBMIT REVENUE APPROVAL (LOQIN / PASS INPUT DISPATCHED IN EMAIL) */}
      {approvingOrder && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-sm flex items-center justify-center p-6">
          <form onSubmit={approveOrderAction} className="glass-card rounded-3xl w-full max-w-md p-8 space-y-5 relative">
            <button type="button" onClick={() => setApprovingOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg p-2">✕</button>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">Hesab Məlumatlarını Təyin Et</h3>
              <p className="text-xs text-indigo-300 font-semibold mt-1">Sifariş: {approvingOrder.productName} ({approvingOrder.duration})</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Loqin / E-Poçt:</label>
              <input type="text" required placeholder="premium-netflix@substore.az" value={accountEmail} onChange={e => setAccountEmail(e.target.value)} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Şifrə:</label>
              <input type="text" required placeholder="PremiumXYZ123!" value={accountPass} onChange={e => setAccountPass(e.target.value)} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
              Hesabı Göndər və Sifarişi Tamamla
            </button>
          </form>
        </div>
      )}

      {/* EDIT/ADD PRODUCT MODAL FOR ADMIN */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-[#030308]/85 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <form onSubmit={handleSaveProduct} className="glass-card rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-5 relative my-8">
            <button type="button" onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg p-2">✕</button>
            <h3 className="text-2xl font-black text-white">{editingProduct.id ? "Məhsulu Redaktə Et" : "Yeni Məhsul Əlavə Et"}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Məhsul Adı:</label>
                <input type="text" required value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Kateqoriya:</label>
                <select value={editingProduct.cat} onChange={e => setEditingProduct({ ...editingProduct, cat: e.target.value })} className="w-full bg-indigo-950/20 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm">
                  <option value="entertainment">Əyləncə</option>
                  <option value="ai">Süni İntellekt</option>
                  <option value="design">Dizayn</option>
                  <option value="vpn">VPN & Antivirus</option>
                  <option value="productivity">Produktivlik</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Emoji (Logo üçün):</label>
                <input type="text" required value={editingProduct.emoji} onChange={e => setEditingProduct({ ...editingProduct, emoji: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Mövzu Rəngi (HEX):</label>
                <input type="text" required value={editingProduct.color} onChange={e => setEditingProduct({ ...editingProduct, color: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Qısa Təsvir:</label>
              <textarea required value={editingProduct.desc} onChange={e => setEditingProduct({ ...editingProduct, desc: e.target.value })} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm h-20" />
            </div>

            {/* Price Duration packages creator */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase">Müddət və Qiymətlər:</label>
                <button type="button" onClick={() => {
                  const updatedPacks = [...(editingProduct.packages || [])];
                  updatedPacks.push({ id: Date.now().toString(), duration: "1 Ay", price: 10 });
                  setEditingProduct({ ...editingProduct, packages: updatedPacks });
                }} className="text-xs text-indigo-400 hover:underline font-bold">➕ Yeni Müddət Əlavə Et</button>
              </div>

              <div className="space-y-3 max-h-40 overflow-y-auto">
                {editingProduct.packages && editingProduct.packages.map((pkg, idx) => (
                  <div key={pkg.id} className="flex items-center gap-3 bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-xl">
                    <input type="text" required placeholder="məs: 1 Ay" value={pkg.duration} onChange={e => {
                      const updatedPacks = [...editingProduct.packages];
                      updatedPacks[idx].duration = e.target.value;
                      setEditingProduct({ ...editingProduct, packages: updatedPacks });
                    }} className="flex-2 bg-indigo-950/40 border border-indigo-900/20 rounded-lg px-3 py-2 text-xs text-white" />
                    
                    <input type="number" required placeholder="məs: 10" value={pkg.price} onChange={e => {
                      const updatedPacks = [...editingProduct.packages];
                      updatedPacks[idx].price = parseFloat(e.target.value);
                      setEditingProduct({ ...editingProduct, packages: updatedPacks });
                    }} className="flex-1 bg-indigo-950/40 border border-indigo-900/20 rounded-lg px-3 py-2 text-xs text-white" />
                    
                    <span className="text-xs text-gray-400 font-bold">AZN</span>
                    <button type="button" onClick={() => {
                      const updatedPacks = editingProduct.packages.filter((_, pidx) => pidx !== idx);
                      setEditingProduct({ ...editingProduct, packages: updatedPacks });
                    }} className="text-red-400 hover:text-red-300 text-xs p-1.5">Sil</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-3.5 rounded-xl bg-indigo-950/40 text-gray-300 font-bold text-xs hover:text-white transition">Ləğv Et</button>
              <button type="submit" className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition">Yadda Saxla</button>
            </div>
          </form>
        </div>
      )}

      {/* ADMIN SIGN-IN TRIGGER MODAL */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#030308]/90 backdrop-blur-sm flex items-center justify-center p-6">
          <form onSubmit={handleAdminLogin} className="glass-card rounded-3xl w-full max-w-md p-8 space-y-5 relative">
            <button type="button" onClick={() => setIsAdminModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg p-2">✕</button>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-white">Admin Girişi</h3>
              <p className="text-xs text-gray-400 mt-1">Sistem nizamlanması üçün giriş edin</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Admin İstifadəçi Adı:</label>
              <input type="text" required placeholder="karimllii" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Admin Şifrəsi:</label>
              <input type="password" required placeholder="••••••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-indigo-950/10 border border-indigo-900/30 rounded-xl px-4 py-3 text-white text-sm" />
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition">Giriş Et</button>
          </form>
        </div>
      )}

      {/* APP FOOTER */}
      <footer id="footer" className="bg-[#030308] border-t border-indigo-950/40 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">P</div>
              <span className="font-extrabold text-white text-base">Premium Shop</span>
            </div>
            <p className="text-[11px] text-gray-500">© 2026 premiumshopaz.com - Bütün hüquqlar qorunur.</p>
          </div>

          <div className="flex gap-6 text-xs text-gray-400">
            <span onClick={() => { setPage("home"); setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white cursor-pointer transition">Məhsullar</span>
            <span onClick={() => { setPage("home"); setTimeout(() => document.getElementById("categories-section")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white cursor-pointer transition">Kateqoriyalar</span>
            <span onClick={() => { setPage("home"); setTimeout(() => document.getElementById("about-section")?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white cursor-pointer transition">Zəmanət və Əlaqə</span>
          </div>

          <div>
            {isAdminLoggedIn ? (
              <button onClick={() => setPage("admin_dashboard")} className="text-xs text-indigo-400 font-bold hover:underline">🛡️ Admin Dashboard</button>
            ) : (
              <button onClick={() => setIsAdminModalOpen(true)} className="text-[11px] text-gray-600 hover:text-gray-400 hover:underline">🔐 Admin Girişi</button>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}

// Notification System Component Helper
function Notif({ n }) {
  if (!n) return null;
  const isError = n.type === "error";
  const isInfo = n.type === "info";
  return (
    <div className="fixed top-24 right-6 z-50 glass-card rounded-2xl p-4 max-w-sm flex items-start gap-3 border-l-4 border-l-indigo-500 shadow-2xl animate-[fadeIn_0.3s_ease]">
      <span className="text-xl">{isError ? "❌" : isInfo ? "ℹ️" : "✅"}</span>
      <div>
        <p className="text-xs font-bold text-white">{isError ? "Xəta" : isInfo ? "Məlumat" : "Uğurlu"}</p>
        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{n.msg}</p>
      </div>
    </div>
  );
}