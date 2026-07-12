import React, { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
  html, body { background: #07070f; color: #f1f5f9; scroll-behavior: smooth; overflow-x: hidden; }
  
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: #2d2d4e; border-radius: 6px; }
  ::-webkit-scrollbar-thumb:hover { background: #7c3aed; }
  
  a { text-decoration: none; color: inherit; }
  button, input, textarea { font-family: inherit; outline: none; border: none; background: none; }
  
  /* Animations */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes pulseWa { 0%, 100% { box-shadow: 0 0 0 0 rgba(37,211,102,0.5); } 50% { box-shadow: 0 0 0 12px rgba(37,211,102,0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .page-enter { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .anim-item { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .anim-d1 { animation-delay: 0.1s; } .anim-d2 { animation-delay: 0.2s; }
  .anim-d3 { animation-delay: 0.3s; } .anim-d4 { animation-delay: 0.4s; }
  
  .mq-wrap { overflow: hidden; white-space: nowrap; width: 100%; position: relative; }
  .mq-wrap::before, .mq-wrap::after { content: ""; position: absolute; top: 0; bottom: 0; width: 60px; z-index: 2; }
  .mq-wrap::before { left: 0; background: linear-gradient(to right, #07070f, transparent); }
  .mq-wrap::after { right: 0; background: linear-gradient(to left, #07070f, transparent); }
  .mq-track { display: inline-flex; animation: marquee 40s linear infinite; }
  .mq-track:hover { animation-play-state: paused; }
  
  .wa-btn { animation: pulseWa 2.5s infinite; }
  .glass-card { background: rgba(20, 20, 32, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); }
  
  /* Form Elements */
  .custom-file-upload { display: inline-block; padding: 12px 20px; cursor: pointer; border-radius: 12px; background: rgba(124,58,237,0.15); border: 1px dashed rgba(124,58,237,0.4); color: #a78bfa; font-weight: 500; text-align: center; width: 100%; transition: all 0.2s; }
  .custom-file-upload:hover { background: rgba(124,58,237,0.25); border-color: #7c3aed; }
  input[type="file"] { display: none; }
`;

// Theme Constants
const COLORS = {
  bg: "#07070f", card: "#0f0f1a", cardHover: "#161626",
  accent: "#7c3aed", accentLight: "#a78bfa", accentDark: "#5b21b6",
  text1: "#f1f5f9", text2: "#94a3b8", text3: "#64748b",
  border: "rgba(255,255,255,0.06)"
};

const SVGS = {
  netflix: <svg viewBox="0 0 111 111" width="100%" height="100%"><path fill="#E50914" d="M105.062 14.28L62.03 105.694h-22.38l-40.4-91.414h23.513l24.717 63.858L85.235 14.28h19.827z"/></svg>,
  spotify: <svg viewBox="0 0 24 24" width="100%" height="100%" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.721 12.9c.42.18.6.78.24 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.559.3z"/></svg>,
  youtube: <svg viewBox="0 0 24 24" width="100%" height="100%" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  chatgpt: <svg viewBox="0 0 24 24" width="100%" height="100%" fill="#10A37F"><path d="M22.28 9.68a5.98 5.98 0 0 0-1.87-4.14 5.96 5.96 0 0 0-4.13-1.87 5.97 5.97 0 0 0-5.86-2.58 5.98 5.98 0 0 0-4.15 1.87A5.95 5.95 0 0 0 1.7 10.3a5.97 5.97 0 0 0 2.58 5.86 5.98 5.98 0 0 0 1.87 4.14 5.96 5.96 0 0 0 4.13 1.87 5.97 5.97 0 0 0 5.86 2.58 5.98 5.98 0 0 0 4.15-1.87 5.95 5.95 0 0 0 4.56-7.34 5.97 5.97 0 0 0-2.57-5.86zm-10.28 10.6a4.4 4.4 0 0 1-3.23-1.4 4.38 4.38 0 0 1-1.35-3.26l4.58 2.65zm7.1-4.7a4.4 4.4 0 0 1-1.88 2.92 4.39 4.39 0 0 1-3.48.55V13.8l4.58-2.65v4.43zm1.18-7.55a4.4 4.4 0 0 1-1.35 3.26 4.39 4.39 0 0 1-3.23 1.4L11.12 9.9v-5.3a4.4 4.4 0 0 1 4.58 1.15 4.38 4.38 0 0 1 1.38 3.28zm-11.8 1.1a4.4 4.4 0 0 1 1.88-2.92 4.39 4.39 0 0 1 3.48-.55v5.25L4.9 12.65V8.23zm-.72 7.14a4.4 4.4 0 0 1 1.35-3.26 4.39 4.39 0 0 1 3.23-1.4l4.58 2.65v5.3a4.4 4.4 0 0 1-4.58-1.15 4.38 4.38 0 0 1-1.38-3.28zm9.05-8.24-4.58-2.65 4.58-2.65v5.3z"/></svg>,
};

const CATS = [
  { id: "all", label: "Bütün Məhsullar", icon: "🌐" },
  { id: "entertainment", label: "Əyləncə", icon: "🎬" },
  { id: "ai", label: "AI & Süni İntellekt", icon: "🤖" },
  { id: "design", label: "Dizayn & Video", icon: "🎨" },
  { id: "vpn", label: "VPN & Antivirus", icon: "🔒" },
  { id: "productivity", label: "Produktivlik & Biznes", icon: "💼" },
];

const SVCS = [
  { id: 1, n: "Netflix", cat: "entertainment", c: "#E50914", s: SVGS.netflix, d: "4K Ultra HD · 4 ekran · Bütün seriallar", pl: [{ l: "1 Ay", p: 8 }, { l: "3 Ay", p: 22 }, { l: "1 İl", p: 80 }], b: "Populyar", hot: true },
  { id: 2, n: "Spotify", cat: "entertainment", c: "#1DB954", s: SVGS.spotify, d: "80M+ mahnı · Reklamsız · Offline rejim", pl: [{ l: "1 Ay", p: 5 }, { l: "3 Ay", p: 13 }, { l: "1 İl", p: 48 }], b: null, hot: true },
  { id: 3, n: "YouTube Premium", cat: "entertainment", c: "#FF0000", s: SVGS.youtube, d: "Reklamsız · Offline video · Arxa fon", pl: [{ l: "1 Ay", p: 6 }, { l: "3 Ay", p: 16 }, { l: "1 İl", p: 55 }], b: null, hot: true },
  { id: 8, n: "ChatGPT Plus", cat: "ai", c: "#10A37F", s: SVGS.chatgpt, d: "GPT-4o · DALL·E 3 · Sürətli cavablar", pl: [{ l: "1 Ay", p: 25 }, { l: "3 Ay", p: 68 }], b: "Trend", hot: true },
  { id: 16, n: "Canva Pro", cat: "design", c: "#8B5CF6", s: "Cv", d: "Premium şablonlar · AI alətləri", pl: [{ l: "1 Ay", p: 9 }, { l: "3 Ay", p: 24 }, { l: "1 İl", p: 85 }], b: null, hot: true },
  { id: 25, n: "NordVPN", cat: "vpn", c: "#4687FF", s: "Nd", d: "6000+ server · Yüksək məxfilik", pl: [{ l: "1 Ay", p: 8 }, { l: "3 Ay", p: 20 }, { l: "1 İl", p: 65 }], b: "Populyar", hot: true },
  { id: 10, n: "Midjourney", cat: "ai", c: "#5865F2", s: "MJ", d: "AI şəkil yaratma · Pro plan", pl: [{ l: "1 Ay", p: 15 }, { l: "3 Ay", p: 40 }], b: null, hot: false },
  { id: 17, n: "Adobe Creative Cloud", cat: "design", c: "#FF0000", s: "Ad", d: "Photoshop, Premiere və 20+ tətbiq", pl: [{ l: "1 Ay", p: 18 }, { l: "3 Ay", p: 48 }], b: "Kampaniya", hot: true },
  { id: 4, n: "Disney+", cat: "entertainment", c: "#1A78C2", s: "D+", d: "Marvel · Star Wars · Pixar", pl: [{ l: "1 Ay", p: 7 }, { l: "3 Ay", p: 18 }, { l: "1 İl", p: 65 }], b: null, hot: false },
  { id: 34, n: "Microsoft 365", cat: "productivity", c: "#D83B01", s: "M3", d: "Word · Excel · 1TB OneDrive", pl: [{ l: "1 Ay", p: 10 }, { l: "1 İl", p: 90 }], b: null, hot: false },
  { id: 21, n: "Figma Pro", cat: "design", c: "#F24E1E", s: "Fg", d: "UI/UX dizayn · Komanda işi", pl: [{ l: "1 Ay", p: 12 }, { l: "3 Ay", p: 32 }], b: null, hot: false },
  { id: 26, n: "ExpressVPN", cat: "vpn", c: "#DA3940", s: "Ex", d: "94 ölkə · Yüksək sürət", pl: [{ l: "1 Ay", p: 12 }, { l: "3 Ay", p: 32 }], b: null, hot: false },
];

const PAYS = [
  { id: "abb", n: "ABB Bank", num: "4169 7388 0012 3456", holder: "F. Kərimli", c: "#1565C0" },
  { id: "leo", n: "LEO Bank", num: "4169 5887 0023 4567", holder: "F. Kərimli", c: "#FF6B35" },
  { id: "kapital", n: "Kapital Bank", num: "5536 9145 0034 5678", holder: "F. Kərimli", c: "#003087" },
  { id: "m10", n: "M10", num: "+994 10 313 69 41", holder: "M10 hesab nömrəsi", c: "#00B4D8" },
];

function Btn({ children, onClick, variant = "primary", style = {}, className = "", loading = false, ...rest }) {
  const [h, sh] = useState(false);
  const base = { padding: "12px 24px", borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, ...style };
  
  const variants = {
    primary: { background: h && !loading ? COLORS.accentDark : COLORS.accent, color: "#fff", boxShadow: h && !loading ? `0 8px 24px ${COLORS.accent}60` : `0 4px 12px ${COLORS.accent}30`, transform: h && !loading ? "translateY(-2px)" : "none" },
    ghost: { background: h ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${h ? "rgba(255,255,255,0.15)" : COLORS.border}`, color: COLORS.text1, transform: h ? "translateY(-2px)" : "none" },
    danger: { background: h ? "#991b1b" : "#dc2626", color: "#fff" },
  };

  return (
    <button style={{ ...base, ...variants[variant] }} onClick={loading ? undefined : onClick} onMouseEnter={() => sh(true)} onMouseLeave={() => sh(false)} className={className} {...rest}>
      {loading ? <span className="loader" style={{width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite"}}/> : children}
    </button>
  );
}

function Input({ label, type = "text", value, onChange, placeholder = "", hint = "", icon }) {
  return (
    <div style={{ marginBottom: 20, position: "relative" }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text2, marginBottom: 8 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: COLORS.text3 }}>{icon}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: "100%", background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: `14px 16px ${icon ? "14px 42px" : "14px 16px"}`, color: COLORS.text1, fontSize: 14, transition: "border 0.2s" }}
          onFocus={(e) => e.target.style.borderColor = COLORS.accent}
          onBlur={(e) => e.target.style.borderColor = COLORS.border}
        />
      </div>
      {hint && <p style={{ fontSize: 12, color: COLORS.text3, marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

function Notif({ n }) {
  if (!n) return null;
  const colors = { success: "#10b981", error: "#ef4444", info: COLORS.accent };
  return (
    <div className="anim-item" style={{ position: "fixed", top: 80, right: 24, zIndex: 9999, background: COLORS.card, border: `1px solid ${colors[n.type]}40`, borderLeft: `4px solid ${colors[n.type]}`, borderRadius: 12, padding: "16px 24px", maxWidth: 360, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ color: colors[n.type], fontSize: 20 }}>{n.type === "success" ? "✓" : "!"}</div>
      <p style={{ color: COLORS.text1, fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{n.msg}</p>
    </div>
  );
}

function SvcCard({ svc, onClick }) {
  const [h, sh] = useState(false);
  
  return (
    <div onMouseEnter={() => sh(true)} onMouseLeave={() => sh(false)} onClick={onClick}
      style={{ background: COLORS.card, border: `1px solid ${h ? svc.c + "50" : COLORS.border}`, borderRadius: 20, padding: 24, position: "relative", overflow: "hidden", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", transform: h ? "translateY(-6px)" : "none", cursor: "pointer", boxShadow: h ? `0 24px 60px ${svc.c}20` : "none" }}>
      
      {/* Background glow */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, ${svc.c}30 0%, transparent 70%)`, opacity: h ? 1 : 0.3, transition: "opacity 0.3s", pointerEvents: "none" }} />
      
      {svc.b && <span style={{ position: "absolute", top: 16, right: 16, fontSize: 10, fontWeight: 800, color: svc.c, background: `${svc.c}15`, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "1px" }}>{svc.b}</span>}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${svc.c}10`, border: `1px solid ${svc.c}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: typeof svc.s === "string" ? 18 : "inherit", fontWeight: 800, color: svc.c, padding: typeof svc.s === "string" ? 0 : 10 }}>
          {svc.s}
        </div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: COLORS.text1 }}>{svc.n}</h3>
          <p style={{ color: COLORS.text3, fontSize: 12, marginTop: 4 }}>{svc.d}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 24 }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: svc.c, lineHeight: 1 }}>{svc.pl[0].p}</span>
        <span style={{ color: COLORS.text2, fontSize: 14, fontWeight: 600, paddingBottom: 4 }}>AZN <span style={{ color: COLORS.text3, fontSize: 12, fontWeight: 400 }}>/ {svc.pl[0].l.toLowerCase()}</span></span>
      </div>

      <div style={{ width: "100%", padding: "12px", borderRadius: 12, background: h ? svc.c : `${svc.c}10`, color: h ? "#fff" : svc.c, textAlign: "center", fontSize: 14, fontWeight: 700, transition: "all 0.3s" }}>
        Sifariş et
      </div>
    </div>
  );
}

function Navbar({ page, goTo, user }) {
  const [sc, setSc] = useState(false);
  useEffect(() => { const h = () => setSc(window.scrollY > 20); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 200, background: sc ? "rgba(7,7,15,0.85)" : "transparent", backdropFilter: sc ? "blur(20px)" : "none", borderBottom: sc ? `1px solid ${COLORS.border}` : "1px solid transparent", transition: "all 0.3s", padding: "16px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => { goTo("home"); window.scrollTo(0,0); }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", boxShadow: `0 4px 16px ${COLORS.accent}40` }}>P</div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px", color: COLORS.text1 }}>Premium <span style={{ color: COLORS.accentLight }}>Shop</span></span>
        </div>
        
        <div style={{ display: window.innerWidth > 768 ? "flex" : "none", gap: 6 }}>
          {["home", "shop"].map((p, i) => (
             <button key={p} onClick={() => { goTo(p); window.scrollTo(0,0); }} style={{ padding: "8px 16px", color: page === p ? COLORS.accentLight : COLORS.text2, fontWeight: page === p ? 700 : 500, cursor: "pointer", transition: "color 0.2s" }}>
               {i === 0 ? "Ana Səhifə" : "Məhsullar"}
             </button>
          ))}
        </div>

        <div>
          {user ? (
            <button onClick={() => goTo("dashboard")} className="glass-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{user.email[0].toUpperCase()}</div>
              <span style={{ fontSize: 14, color: COLORS.text1, fontWeight: 600 }}>Hesabım</span>
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => goTo("auth", { mode: "login" })} style={{ padding: "10px 18px" }}>Giriş</Btn>
              <Btn onClick={() => goTo("auth", { mode: "register" })} style={{ padding: "10px 18px" }}>Qeydiyyat</Btn>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer({ goTo }) {
  return (
    <footer style={{ borderTop: `1px solid ${COLORS.border}`, padding: "60px 24px 40px", marginTop: 80, background: "linear-gradient(to top, rgba(124,58,237,0.03), transparent)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 14 }}>P</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: COLORS.text1 }}>Premium Shop</span>
          </div>
          <p style={{ color: COLORS.text3, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>Azərbaycanda rəqəmsal abunəliklərin ən etibarlı ünvanı. Bütün xidmətlər üçün 100% zəmanət.</p>
          <p style={{ color: COLORS.text3, fontSize: 13 }}>© 2026 premiumshopaz.com</p>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 700, fontSize: 15, color: COLORS.text1, marginBottom: 20 }}>Tez Keçidlər</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span onClick={() => { goTo("shop"); window.scrollTo(0,0); }} style={{ color: COLORS.text3, fontSize: 14, cursor: "pointer", width: "fit-content" }}>Bütün Məhsullar</span>
            <span onClick={() => { goTo("auth", {mode: "register"}); window.scrollTo(0,0); }} style={{ color: COLORS.text3, fontSize: 14, cursor: "pointer", width: "fit-content" }}>Qeydiyyat</span>
          </div>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, fontSize: 15, color: COLORS.text1, marginBottom: 20 }}>Əlaqə</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ color: COLORS.text3, fontSize: 14 }}>Dəstək: +994 10 313 69 41</p>
            <p style={{ color: COLORS.text3, fontSize: 14 }}>İş saatları: 7/24</p>
            <a href="https://wa.me/994103136941" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 10, padding: "10px 16px", color: "#25D366", fontSize: 14, fontWeight: 600, width: "fit-content", transition: "background 0.2s" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Dəstək Xidməti
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function HomePage({ goTo }) {
  const brands = ["Netflix", "Spotify", "YouTube", "Disney+", "Adobe", "ChatGPT", "Canva", "NordVPN", "LinkedIn", "Microsoft", "Figma", "AutoCAD"];
  const scrollToShop = () => {
    const el = document.getElementById("featured");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section style={{ position: "relative", padding: "100px 24px 80px", textAlign: "center", maxWidth: 900, margin: "0 auto", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, background: `radial-gradient(circle, ${COLORS.accent}25 0%, transparent 70%)`, filter: "blur(60px)", zIndex: -1, pointerEvents: "none" }} />
        
        <div className="anim-item" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 30, padding: "8px 20px", color: COLORS.accentLight, fontSize: 13, fontWeight: 600, marginBottom: 32 }}>
          <span style={{ fontSize: 16 }}>⚡</span> Sifarişlər 12 saat ərzində çatdırılır
        </div>
        
        <h1 className="anim-item anim-d1" style={{ fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 24 }}>
          Rəqəmsal Abunəliklər <br />
          <span style={{ background: `linear-gradient(135deg, #fff 20%, ${COLORS.accentLight} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ən Ucuz Qiymətə</span>
        </h1>
        
        <p className="anim-item anim-d2" style={{ color: COLORS.text2, fontSize: 18, lineHeight: 1.6, marginBottom: 40, maxWidth: 540, margin: "0 auto 40px" }}>
          PremiumShop ilə sevdiyiniz platformalara daha sərfəli qiymətə sahib olun. Tam etibarlı xidmət və 100% zəmanət.
        </p>
        
        <div className="anim-item anim-d3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn onClick={scrollToShop} style={{ padding: "16px 32px", fontSize: 16, borderRadius: 100 }}>Abunəliklərə Bax &darr;</Btn>
        </div>
      </section>

      {/* Marquee Brands */}
      <div className="anim-item anim-d4" style={{ borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, padding: "20px 0", marginBottom: 80, background: "rgba(255,255,255,0.01)" }}>
        <div className="mq-wrap">
          <div className="mq-track">
            {[...brands, ...brands].map((b, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", color: COLORS.text3, fontSize: 16, fontWeight: 700, padding: "0 40px", letterSpacing: "0.5px" }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section id="featured" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px", color: COLORS.text1 }}>Populyar Abunəliklər</h2>
            <p style={{ color: COLORS.text3, marginTop: 8, fontSize: 15 }}>Müştərilərin ən çox üstünlük verdiyi xidmətlər</p>
          </div>
          <Btn variant="ghost" onClick={() => { goTo("shop"); window.scrollTo(0,0); }}>Bütün Məhsullar →</Btn>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {SVCS.filter(s => s.hot).map(s => (
            <SvcCard key={s.id} svc={s} onClick={() => { goTo("product", { id: s.id }); window.scrollTo(0,0); }} />
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        <div className="glass-card" style={{ borderRadius: 24, padding: "40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30 }}>
          {[
            { icon: "🔒", title: "Güvənli Ödəniş", desc: "İstədiyiniz bankı (ABB, LEO, Kapital, M10) seçib ödəniş edə bilərsiniz." },
            { icon: "⚡", title: "Sürətli Təhvil", desc: "Sifarişlər 12 saat ərzində çatdırılır. Gözləməyə ehtiyac yoxdur." },
            { icon: "🔄", title: "Geri Ödəmə Zəmanəti", desc: "24 saat ərzində çatdırılmasa, geri ödəmə edilməsi üçün əlaqə saxlanılır." }
          ].map((itm, i) => (
            <div key={i} style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.2))`, border: `1px solid ${COLORS.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{itm.icon}</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text1, marginBottom: 8 }}>{itm.title}</h4>
                <p style={{ color: COLORS.text3, fontSize: 14, lineHeight: 1.6 }}>{itm.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ShopPage({ goTo }) {
  const [cat, setCat] = useState("all");
  const filtered = SVCS.filter(s => cat === "all" || s.cat === cat);

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px", minHeight: "80vh" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", color: COLORS.text1, marginBottom: 12 }}>Mağaza</h1>
      <p style={{ color: COLORS.text3, fontSize: 16, marginBottom: 40 }}>Bütün rəqəmsal abunəliklər bir ünvanda.</p>
      
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
        {CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            style={{ padding: "10px 20px", borderRadius: 100, border: `1px solid ${cat === c.id ? COLORS.accent : COLORS.border}`, background: cat === c.id ? COLORS.accent : COLORS.card, color: cat === c.id ? "#fff" : COLORS.text2, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {filtered.map(s => (
          <SvcCard key={s.id} svc={s} onClick={() => { goTo("product", { id: s.id }); window.scrollTo(0,0); }} />
        ))}
        {filtered.length === 0 && <p style={{ color: COLORS.text3, padding: 40, gridColumn: "1/-1", textAlign: "center" }}>Bu kateqoriyada məhsul yoxdur.</p>}
      </div>
    </div>
  );
}

function AuthPage({ goTo, setUser, showNotif, initMode }) {
  const [mode, setMode] = useState(initMode || "login");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = () => {
    if (!email) return showNotif("E-poçt daxil edin", "error");
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "login") {
        if(!pass) return showNotif("Şifrə daxil edin", "error");
        setUser({ email, phone: "" });
        showNotif("Uğurla daxil oldunuz", "success");
        goTo("dashboard");
      } else {
        // Register flow
        if (step === 1) {
          showNotif("Doğrulama kodu göndərildi (Simulyasiya: 1234)", "success");
          setStep(2);
        } else if (step === 2) {
          if(code !== "1234") return showNotif("Kod yalnışdır (1234 yazın)", "error");
          setStep(3);
        } else if (step === 3) {
          if(!pass || pass.length < 6) return showNotif("Şifrə minimum 6 simvol olmalıdır", "error");
          setUser({ email, phone: "" });
          showNotif("Qeydiyyat uğurla tamamlandı!", "success");
          goTo("dashboard");
        }
      }
    }, 800);
  };

  return (
    <div className="page-enter" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 420, borderRadius: 24, padding: 40 }}>
        
        <div style={{ display: "flex", background: COLORS.cardHover, borderRadius: 12, padding: 4, marginBottom: 32 }}>
          <button onClick={() => { setMode("login"); setStep(1); }} style={{ flex: 1, padding: "10px", borderRadius: 10, background: mode === "login" ? COLORS.card : "transparent", color: mode === "login" ? COLORS.text1 : COLORS.text3, fontWeight: 600, transition: "all 0.2s", cursor: "pointer" }}>Giriş</button>
          <button onClick={() => { setMode("register"); setStep(1); }} style={{ flex: 1, padding: "10px", borderRadius: 10, background: mode === "register" ? COLORS.card : "transparent", color: mode === "register" ? COLORS.text1 : COLORS.text3, fontWeight: 600, transition: "all 0.2s", cursor: "pointer" }}>Qeydiyyat</button>
        </div>

        {mode === "login" ? (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text1, marginBottom: 8 }}>Hesaba Giriş</h2>
            <p style={{ color: COLORS.text3, fontSize: 14, marginBottom: 24 }}>Sifarişlərinizi izləmək üçün daxil olun.</p>
            <Input label="E-poçt" type="email" placeholder="mail@numune.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <Input label="Şifrə" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} />
            <Btn onClick={handleAction} loading={loading} style={{ width: "100%", marginTop: 10 }}>Daxil ol</Btn>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text1, marginBottom: 8 }}>Yeni Hesab</h2>
            <p style={{ color: COLORS.text3, fontSize: 14, marginBottom: 24 }}>
              {step === 1 ? "Davam etmək üçün e-poçt ünvanınızı yazın." : step === 2 ? "E-poçta gələn kodu daxil edin." : "Yeni şifrənizi təyin edin."}
            </p>
            
            {step === 1 && <Input label="E-poçt" type="email" placeholder="mail@numune.com" value={email} onChange={e=>setEmail(e.target.value)} />}
            {step === 2 && <Input label="Doğrulama Kodu (Demo: 1234)" placeholder="1234" value={code} onChange={e=>setCode(e.target.value)} />}
            {step === 3 && <Input label="Şifrə təyin edin" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} />}
            
            <Btn onClick={handleAction} loading={loading} style={{ width: "100%", marginTop: 10 }}>
              {step === 1 ? "Kod Göndər" : step === 2 ? "Təsdiqlə" : "Qeydiyyatı Tamamla"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductPage({ goTo, params, user, showNotif, addOrder }) {
  const svc = SVCS.find(s => s.id === params?.id) || SVCS[0];
  const [step, setStep] = useState(1); // 1: Details, 2: Checkout
  const [planIdx, setPlanIdx] = useState(0);
  const [payId, setPayId] = useState("abb");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const selPlan = svc.pl[planIdx];
  const selBank = PAYS.find(p => p.id === payId);

  const handleOrder = () => {
    if (!user) { showNotif("Sifariş etmək üçün daxil olun", "error"); return goTo("auth", {mode: "login"}); }
    if (!file) return showNotif("Zəhmət olmasa ödəniş çekini yükləyin", "error");
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addOrder({
        id: "ORD-" + Math.floor(Math.random()*90000+10000),
        svcName: svc.n,
        plan: selPlan.l,
        price: selPlan.p,
        bank: selBank.n,
        status: "pending",
        date: new Date().toLocaleDateString()
      });
      showNotif("Sifariş qəbul edildi! Admin təsdiqi gözlənilir.", "success");
      goTo("dashboard");
    }, 1500);
  };

  return (
    <div className="page-enter" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 100px", minHeight: "80vh" }}>
      <button onClick={() => step === 2 ? setStep(1) : goTo("shop")} style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.text3, fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 30, background: "none", border: "none" }}>
        &larr; Geri Qayıt
      </button>

      {step === 1 ? (
        <div className="anim-item">
          <div className="glass-card" style={{ borderRadius: 24, padding: 32, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: `${svc.c}10`, border: `1px solid ${svc.c}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: typeof svc.s === "string"?30:"inherit", fontWeight: 800, color: svc.c, padding: typeof svc.s === "string"?0:16 }}>{svc.s}</div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: COLORS.text1, marginBottom: 8 }}>{svc.n}</h1>
                <p style={{ color: COLORS.text2, fontSize: 15, lineHeight: 1.6 }}>{svc.d}</p>
                
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontWeight: 600, color: COLORS.text1, marginBottom: 12 }}>Plan Seçin:</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {svc.pl.map((p, i) => (
                      <div key={i} onClick={() => setPlanIdx(i)} style={{ padding: "12px 20px", borderRadius: 14, border: `2px solid ${planIdx === i ? svc.c : COLORS.border}`, background: planIdx === i ? `${svc.c}15` : COLORS.cardHover, cursor: "pointer", transition: "all 0.2s" }}>
                        <div style={{ fontWeight: 700, color: planIdx === i ? svc.c : COLORS.text2, fontSize: 14 }}>{p.l}</div>
                        <div style={{ fontWeight: 800, color: COLORS.text1, fontSize: 18, marginTop: 4 }}>{p.p} AZN</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={() => { if(!user){ showNotif("Sifariş üçün daxil olun","error"); goTo("auth"); } else setStep(2); }} style={{ padding: "16px 40px", fontSize: 16 }}>Davam Et &rarr;</Btn>
          </div>
        </div>
      ) : (
        <div className="anim-item">
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text1, marginBottom: 24 }}>Ödəniş və Təsdiq</h2>
          
          <div className="glass-card" style={{ borderRadius: 24, padding: 32, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text2, marginBottom: 16 }}>1. Bank Seçimi</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
              {PAYS.map(p => (
                <div key={p.id} onClick={() => setPayId(p.id)} style={{ padding: "16px", borderRadius: 16, border: `2px solid ${payId === p.id ? p.c : COLORS.border}`, background: payId === p.id ? `${p.c}10` : COLORS.cardHover, textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: p.c, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12 }}>{p.n.slice(0,3).toUpperCase()}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text1 }}>{p.n}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text2, marginBottom: 16 }}>2. Köçürmə Məlumatları</h3>
            <div style={{ background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: COLORS.text3 }}>Göndəriləcək Məbləğ:</span>
                <span style={{ fontWeight: 800, color: COLORS.text1, fontSize: 18 }}>{selPlan.p} AZN</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: COLORS.text3 }}>{payId==="m10"?"Nömrə:":"Kart Nömrəsi:"}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, color: selBank.c, letterSpacing: "1px" }}>{selBank.num}</span>
                  <button onClick={() => { navigator.clipboard.writeText(selBank.num); showNotif("Kopyalandı", "info"); }} style={{ cursor: "pointer", color: COLORS.text3, padding: 4 }}>📋</button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: COLORS.text3 }}>Alıcı:</span>
                <span style={{ fontWeight: 600, color: COLORS.text1 }}>{selBank.holder}</span>
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text2, marginBottom: 16 }}>3. Ödəniş Çeki (Mütləqdir)</h3>
            <label className="custom-file-upload">
              <input type="file" accept="image/*,.pdf" onChange={e => {
                if(e.target.files[0]) {
                  setFile(e.target.files[0].name);
                  showNotif("Çek əlavə edildi", "success");
                }
              }} />
              {file ? `📄 ${file} (Dəyişdir)` : "📥 Çeki bura yükləyin (Şəkil və ya PDF)"}
            </label>
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 16, padding: 20, marginBottom: 32 }}>
            <p style={{ color: "#10b981", fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
              Sifarişlər ödəniş yoxlanıldıqdan sonra 12 saat ərzində panelinizə əlavə edilir. 24 saat ərzində çatdırılmasa, geri ödəmə üçün sizinlə əlaqə saxlanılacaq.
            </p>
          </div>

          <Btn onClick={handleOrder} loading={loading} style={{ width: "100%", padding: "16px", fontSize: 16 }}>Sifarişi Təsdiqlə - {selPlan.p} AZN</Btn>
        </div>
      )}
    </div>
  );
}

function DashboardPage({ user, setUser, orders, showNotif }) {
  const [phone, setPhone] = useState(user?.phone || "");
  const [viewAcc, setViewAcc] = useState(null);

  if (!user) return <div style={{ padding: 100, textAlign: "center", color: COLORS.text1 }}>Giriş edin.</div>;

  const saveProfile = () => {
    setUser({ ...user, phone });
    showNotif("Məlumatlar yeniləndi", "success");
  };

  return (
    <div className="page-enter" style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 100px", minHeight: "80vh" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: COLORS.text1, marginBottom: 8 }}>Müştəri Paneli</h1>
      <p style={{ color: COLORS.text3, fontSize: 15, marginBottom: 40 }}>Hesab məlumatlarınızı və sifarişlərinizi buradan idarə edin.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30, alignItems: "start" }}>
        
        {/* Profile Sidebar */}
        <div className="glass-card" style={{ borderRadius: 20, padding: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 auto 20px" }}>
            {user.email[0].toUpperCase()}
          </div>
          <Input label="E-poçt (Dəyişdirilə bilməz)" value={user.email} disabled />
          <Input label="Əlaqə Nömrəsi (Geri ödəmələr üçün)" placeholder="+994501234567" value={phone} onChange={e=>setPhone(e.target.value)} hint="Sifariş 24 saata təslim edilmədikdə bu nömrəyə pul qaytarılır." />
          <Btn onClick={saveProfile} style={{ width: "100%", marginBottom: 16 }}>Yadda Saxla</Btn>
          <Btn variant="danger" onClick={() => setUser(null)} style={{ width: "100%" }}>Çıxış Et</Btn>
        </div>

        {/* Orders List */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text1, marginBottom: 20 }}>Sifarişlərim</h2>
          
          {orders.length === 0 ? (
            <div className="glass-card" style={{ borderRadius: 20, padding: 40, textAlign: "center" }}>
              <p style={{ color: COLORS.text3, fontSize: 15 }}>Hələ heç bir sifarişiniz yoxdur.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {orders.slice().reverse().map(ord => (
                <div key={ord.id} className="glass-card" style={{ borderRadius: 16, padding: 20, borderLeft: `4px solid ${ord.status === "approved" ? "#10b981" : "#f59e0b"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text1 }}>{ord.svcName} <span style={{ color: COLORS.text3, fontSize: 14, fontWeight: 500 }}>({ord.plan})</span></h3>
                      <p style={{ color: COLORS.text3, fontSize: 13, marginTop: 4 }}>ID: {ord.id} • {ord.date}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: ord.status === "approved" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: ord.status === "approved" ? "#10b981" : "#f59e0b" }}>
                        {ord.status === "approved" ? "Təsdiqləndi" : "Admin Onayı Gözləyir"}
                      </span>
                      <p style={{ fontWeight: 800, color: COLORS.text1, marginTop: 6 }}>{ord.price} AZN</p>
                    </div>
                  </div>
                  
                  {ord.status === "approved" && (
                    <Btn onClick={() => setViewAcc(ord)} style={{ padding: "8px 16px", fontSize: 13, background: "#10b981", boxShadow: "none" }}>Hesab Məlumatlarına Bax</Btn>
                  )}
                  {ord.status === "pending" && (
                    <p style={{ fontSize: 13, color: COLORS.text3 }}>⏱️ Çekiniz yoxlanılır. Maksimum 12 saat ərzində hesab veriləcək.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account Details Modal */}
      {viewAcc && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="anim-item glass-card" style={{ width: "100%", maxWidth: 400, borderRadius: 24, padding: 32, background: COLORS.card }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text1, marginBottom: 8 }}>{viewAcc.svcName} Hesabı</h3>
            <p style={{ color: COLORS.text3, fontSize: 14, marginBottom: 24 }}>Hesab məlumatlarınızı kimsəylə paylaşmayın.</p>
            
            <div style={{ background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: COLORS.text3, marginBottom: 4 }}>E-poçt / Loqin</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.text1, userSelect: "all" }}>premium{viewAcc.id.slice(-4)}@premiumshop.az</p>
            </div>
            
            <div style={{ background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: COLORS.text3, marginBottom: 4 }}>Şifrə</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.text1, userSelect: "all" }}>Premium{viewAcc.id.slice(-4)}**!</p>
            </div>
            
            <Btn onClick={() => setViewAcc(null)} variant="ghost" style={{ width: "100%" }}>Bağla</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [params, setParams] = useState({});
  const [user, setUser] = useState(null);
  const [notif, setNotif] = useState(null);
  
  // Fake Initial Order for Demo purposes
  const [orders, setOrders] = useState([
    { id: "ORD-99999", svcName: "Netflix", plan: "1 Ay", price: 8, bank: "ABB Bank", status: "approved", date: "11 İyul 2026" }
  ]);

  const goTo = (pg, p = {}) => { setPage(pg); setParams(p); };
  
  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const addOrder = (ord) => setOrders([...orders, ord]);

  return (
    <>
      <style>{CSS}</style>
      <Navbar page={page} goTo={goTo} user={user} />
      <Notif n={notif} />
      
      {page === "home" && <HomePage goTo={goTo} />}
      {page === "shop" && <ShopPage goTo={goTo} />}
      {page === "product" && <ProductPage goTo={goTo} params={params} user={user} showNotif={showNotif} addOrder={addOrder} />}
      {page === "auth" && <AuthPage goTo={goTo} setUser={setUser} showNotif={showNotif} initMode={params.mode} />}
      {page === "dashboard" && <DashboardPage user={user} setUser={setUser} orders={orders} showNotif={showNotif} />}
      
      {/* WhatsApp Floating Button */}
      <a href="https://wa.me/994103136941" target="_blank" rel="noopener noreferrer" className="wa-btn"
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, display: "flex", alignItems: "center", gap: 10, background: "#25D366", color: "#fff", padding: "12px 20px", borderRadius: 100, textDecoration: "none", fontWeight: 700, fontSize: 14, boxShadow: "0 8px 30px rgba(37,211,102,0.4)", transition: "transform 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05) translateY(-5px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1) translateY(0)"}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Dəstək Xidməti
      </a>
      
      <Footer goTo={goTo} />
    </>
  );
=======