import { useState, useRef, useEffect, useCallback } from "react";
import { CATEGORIES, PRODUCTS, PAYMENT_METHODS, BRANDS } from "./data/products.js";

// ─── UTILS ────────────────────────────────────────────────────────────────────
const WA_LINK = "https://wa.me/994103136941";
const ADMIN_PASS = "admin2025";

const ls = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── WHATSAPP BUTTON ──────────────────────────────────────────────────────────
function WhatsAppBtn() {
  const [h, setH] = useState(false);
  return (
    <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
      style={{
        position:"fixed", bottom:24, right:24, zIndex:999,
        width:58, height:58, borderRadius:"50%", backgroundColor:"#25D366",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow: h ? "0 8px 32px rgba(37,211,102,.65)" : "0 4px 20px rgba(37,211,102,.4)",
        transform: h ? "scale(1.1)" : "scale(1)", transition:"all .22s ease",
        textDecoration:"none",
      }}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, navigate, user, onLogout, onAuthOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Ana Səhifə", key: "home" },
    { label: "Bütün Məhsullar", key: "products" },
    { label: "Dəstək Xidməti", href: WA_LINK },
  ];

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:200,
      backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
      backgroundColor: scrolled ? "rgba(7,7,15,0.95)" : "rgba(7,7,15,0.8)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(255,255,255,0.04)",
      transition:"all .3s ease",
    }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:66, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Logo */}
        <div onClick={()=>navigate("home")} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <div style={{
            width:38, height:38, borderRadius:11,
            background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:17, fontWeight:900, color:"white", flexShrink:0,
          }}>P</div>
          <div>
            <div style={{ fontWeight:800, fontSize:16, letterSpacing:"-0.4px", lineHeight:1.1 }}>Premium Shop</div>
            <div style={{ fontSize:9, color:"#a78bfa", letterSpacing:"1px", textTransform:"uppercase", fontWeight:700 }}>premiumshopaz.com</div>
          </div>
        </div>

        {/* Desktop links */}
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          {links.map(l => l.href
            ? <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                style={{ color:"#94a3b8", textDecoration:"none", fontSize:13, padding:"8px 14px", borderRadius:8, transition:"color .2s" }}
                onMouseEnter={e=>e.target.style.color="#f1f5f9"} onMouseLeave={e=>e.target.style.color="#94a3b8"}>
                {l.label}
              </a>
            : <button key={l.label} onClick={()=>navigate(l.key)}
                style={{
                  color: page===l.key ? "#a78bfa" : "#94a3b8",
                  background:"transparent", border:"none", fontSize:13,
                  padding:"8px 14px", borderRadius:8, cursor:"pointer", transition:"color .2s",
                  fontWeight: page===l.key ? 600 : 400,
                }}>
                {l.label}
              </button>
          )}

          {user
            ? <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:8 }}>
                <button onClick={()=>navigate("profile")} style={{
                  display:"flex", alignItems:"center", gap:7,
                  backgroundColor:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.3)",
                  color:"#c4b5fd", borderRadius:10, padding:"7px 14px", fontSize:13, fontWeight:600, cursor:"pointer",
                }}>
                  <span>👤</span> {user.email.split("@")[0]}
                </button>
                <button onClick={onLogout} style={{
                  backgroundColor:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
                  color:"#64748b", borderRadius:10, padding:"7px 12px", fontSize:12, cursor:"pointer",
                }}>Çıxış</button>
              </div>
            : <button onClick={onAuthOpen} style={{
                background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"white",
                border:"none", borderRadius:10, padding:"9px 20px", fontSize:13,
                fontWeight:700, cursor:"pointer", marginLeft:8,
                boxShadow:"0 0 20px rgba(124,58,237,0.3)",
              }}>Giriş / Qeydiyyat</button>
          }
        </div>
      </div>
    </nav>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ navigate }) {
  return (
    <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)", padding:"48px 24px 32px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:40, marginBottom:40 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:14 }}>
              <div style={{
                width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:900, color:"white",
              }}>P</div>
              <span style={{ fontWeight:800, fontSize:15 }}>Premium Shop</span>
            </div>
            <p style={{ color:"#64748b", fontSize:13, lineHeight:1.7 }}>
              Azərbaycanda rəqəmsal abunəliklərin ən etibarlı və sərfəli ünvanı.
            </p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
              display:"inline-flex", alignItems:"center", gap:6, marginTop:14,
              color:"#25D366", textDecoration:"none", fontSize:13, fontWeight:600,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              +994 10 313 69 41
            </a>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#c4b5fd" }}>Məhsullar</div>
            {["Streaming & Musiqi","AI Alətləri","Dizayn","VPN & Güvənlik","Geliştirici"].map(c=>(
              <div key={c} onClick={()=>navigate("products")} style={{
                color:"#64748b", fontSize:13, marginBottom:8, cursor:"pointer",
                transition:"color .2s",
              }} onMouseEnter={e=>e.target.style.color="#a78bfa"}
                 onMouseLeave={e=>e.target.style.color="#64748b"}>{c}</div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#c4b5fd" }}>Əlaqə & Dəstək</div>
            <div style={{ color:"#64748b", fontSize:13, lineHeight:2 }}>
              <div>WhatsApp: +994 10 313 69 41</div>
              <div>Çatdırılma: 12 saat ərzində</div>
              <div>Dəstək: 7/24 aktiv</div>
            </div>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#c4b5fd" }}>Qaydalar</div>
            <div style={{ color:"#64748b", fontSize:13, lineHeight:2 }}>
              <div>Ödəniş: Card-to-Card</div>
              <div>Geri ödəmə: 24s keçərsə</div>
              <div>Zəmanət: Hər sifarişdə</div>
            </div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <p style={{ color:"#334155", fontSize:12 }}>© 2025 Premium Shop · premiumshopaz.com · Bütün hüquqlar qorunur</p>
          <p style={{ color:"#334155", fontSize:12 }}>Azərbaycan · Rəqəmsal Abunəliklər</p>
        </div>
      </div>
    </footer>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, onOrder, delay = 0 }) {
  const [plan, setPlan] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [btnH, setBtnH] = useState(false);
  return (
    <div
      className={`anim-fadeup delay-${Math.min(delay,6)}`}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{
        backgroundColor:"#0f0f1a",
        border:`1px solid ${hovered ? product.color+"45" : "rgba(255,255,255,0.06)"}`,
        borderRadius:20, padding:24, position:"relative", overflow:"hidden",
        transition:"transform .28s ease, box-shadow .28s ease, border-color .28s ease",
        transform: hovered ? "translateY(-7px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hovered ? `0 28px 64px rgba(0,0,0,0.4), 0 0 0 1px ${product.color}20, 0 16px 40px ${product.color}20` : "0 2px 12px rgba(0,0,0,0.3)",
      }}>
      {/* Glow */}
      <div style={{
        position:"absolute", top:-50, right:-40, width:160, height:160, borderRadius:"50%",
        background:`radial-gradient(circle, ${product.color}30 0%, transparent 70%)`,
        pointerEvents:"none", opacity: hovered ? 1 : 0.35, transition:"opacity .28s",
      }}/>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{
            width:46, height:46, borderRadius:13,
            backgroundColor:`${product.color}1a`, border:`1px solid ${product.color}45`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:10, fontWeight:900, color:product.color, letterSpacing:"-0.2px", flexShrink:0,
          }}>{product.short}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#f1f5f9", lineHeight:1.2 }}>{product.name}</div>
            <div style={{ color:"#64748b", fontSize:11, marginTop:3, lineHeight:1.4 }}>{product.desc}</div>
          </div>
        </div>
        {product.badge && (
          <span style={{
            fontSize:9, fontWeight:700, color:product.color,
            backgroundColor:`${product.color}15`, border:`1px solid ${product.color}30`,
            borderRadius:20, padding:"3px 8px", textTransform:"uppercase",
            letterSpacing:"0.6px", whiteSpace:"nowrap", flexShrink:0,
          }}>{product.badge}</span>
        )}
      </div>
      {/* Plan tabs */}
      <div style={{ display:"flex", gap:3, marginBottom:18, backgroundColor:"rgba(255,255,255,0.03)", borderRadius:10, padding:3 }}>
        {product.plans.map((p,i)=>(
          <button key={i} onClick={()=>setPlan(i)} style={{
            flex:1, padding:"6px 0", borderRadius:8, border:"none",
            fontSize:10, fontWeight:600, cursor:"pointer", transition:"all .15s",
            backgroundColor: plan===i ? product.color : "transparent",
            color: plan===i ? "white" : "#64748b",
          }}>{p.l}</button>
        ))}
      </div>
      {/* Price */}
      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
          <span style={{ fontSize:36, fontWeight:900, color:product.color, lineHeight:1 }}>{product.plans[plan].p}</span>
          <span style={{ color:"#94a3b8", fontSize:16 }}>₼</span>
        </div>
        <div style={{ color:"#475569", fontSize:11, marginTop:3 }}>/ {product.plans[plan].l.toLowerCase()} · 12 saat ərzində çatdırılır</div>
      </div>
      {/* CTA */}
      <button
        onMouseEnter={()=>setBtnH(true)} onMouseLeave={()=>setBtnH(false)}
        onClick={()=>onOrder(product, plan)}
        style={{
          width:"100%", padding:"12px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer",
          border:`1px solid ${btnH ? product.color : product.color+"50"}`,
          backgroundColor: btnH ? product.color : `${product.color}15`,
          color: btnH ? "white" : product.color, transition:"all .18s",
        }}>
        Sifariş et →
      </button>
    </div>
  );
}

// ─── ORDER MODAL ──────────────────────────────────────────────────────────────
function OrderModal({ product, planIdx, user, onClose, onAuthOpen }) {
  const [step, setStep] = useState(user ? "payment" : "login");
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const plan = product.plans[planIdx];

  const handleSubmit = () => {
    if (!file) { alert("Zəhmət olmasa ödəniş çekini yükləyin."); return; }
    const orders = ls.get("ps_orders") || [];
    const newOrder = {
      id: Date.now(),
      productName: product.name,
      plan: plan.l,
      price: plan.p,
      color: product.color,
      short: product.short,
      status: "pending",
      note,
      date: new Date().toLocaleDateString("az-AZ"),
      userEmail: user.email,
    };
    ls.set("ps_orders", [...orders, newOrder]);
    setSubmitted(true);
  };

  if (step === "login") return (
    <ModalWrap onClose={onClose}>
      <div style={{ textAlign:"center", padding:"8px 0 16px" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>🔐</div>
        <h3 style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>Sifariş üçün giriş lazımdır</h3>
        <p style={{ color:"#64748b", fontSize:14, marginBottom:24 }}>Sifarişinizi izləmək üçün hesabınıza giriş edin</p>
        <button onClick={()=>{ onClose(); onAuthOpen(); }} style={{
          width:"100%", padding:"13px", borderRadius:12,
          background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"white",
          border:"none", fontSize:14, fontWeight:700, cursor:"pointer",
        }}>Giriş / Qeydiyyat</button>
      </div>
    </ModalWrap>
  );

  return (
    <ModalWrap onClose={onClose} wide>
      {submitted ? (
        <div style={{ textAlign:"center", padding:"24px 0" }}>
          <div className="anim-scalein" style={{ fontSize:60, marginBottom:16 }}>✅</div>
          <h3 className="anim-fadeup delay-1" style={{ fontSize:22, fontWeight:800, marginBottom:10 }}>Sifarişiniz qəbul edildi!</h3>
          <p className="anim-fadeup delay-2" style={{ color:"#94a3b8", fontSize:14, lineHeight:1.7, marginBottom:20 }}>
            Ödənişiniz yoxlanılır. 12 saat ərzində hesab məlumatları<br/>email və WhatsApp vasitəsilə göndəriləcək.
          </p>
          <div className="anim-fadeup delay-3" style={{
            backgroundColor:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)",
            borderRadius:14, padding:16, marginBottom:20,
          }}>
            <div style={{ fontSize:13, color:"#a78bfa", fontWeight:600 }}>📦 {product.name} · {plan.l} · {plan.p}₼</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>Sifariş nömrəsi: #{Date.now().toString().slice(-6)}</div>
          </div>
          <button onClick={onClose} style={{
            padding:"11px 28px", borderRadius:12, background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
            color:"white", border:"none", fontSize:14, fontWeight:700, cursor:"pointer",
          }}>Bağla</button>
        </div>
      ) : (
        <>
          <h3 style={{ fontSize:19, fontWeight:800, marginBottom:4 }}>Sifariş et</h3>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
            <div style={{
              width:38, height:38, borderRadius:10, backgroundColor:`${product.color}1a`,
              border:`1px solid ${product.color}45`, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:10, fontWeight:800, color:product.color,
            }}>{product.short}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{product.name}</div>
              <div style={{ fontSize:12, color:product.color }}>{plan.l} — {plan.p}₼</div>
            </div>
          </div>

          {/* Payment methods */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, color:"#64748b", fontWeight:600, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.6px" }}>
              Ödəniş Üsulları — istənilənini seçin
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {PAYMENT_METHODS.map((pm,i)=>(
                <div key={i} style={{
                  backgroundColor: pm.bg, border:`1px solid ${pm.color}30`,
                  borderRadius:12, padding:"12px 14px",
                }}>
                  <div style={{ fontWeight:700, fontSize:13, color:pm.color, marginBottom:4 }}>{pm.name}</div>
                  <div style={{ fontSize:11, color:"#94a3b8", fontFamily:"monospace" }}>{pm.info}</div>
                  {pm.owner && <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>Ad: {pm.owner}</div>}
                </div>
              ))}
            </div>
            <div style={{
              marginTop:10, backgroundColor:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)",
              borderRadius:10, padding:"10px 14px", fontSize:12, color:"#4ade80",
            }}>
              ⏱ Ödəniş məbləği: <strong>{plan.p}₼</strong> · Köçürmə edib çeki aşağıya yükləyin
            </div>
          </div>

          {/* Receipt upload */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, color:"#64748b", fontWeight:600, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" }}>
              Ödəniş Çeki (skrinşot)
            </div>
            <label style={{
              display:"block", border:`2px dashed ${file ? "#7c3aed" : "rgba(255,255,255,0.1)"}`,
              borderRadius:12, padding:"20px", textAlign:"center", cursor:"pointer",
              backgroundColor: file ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.02)",
              transition:"all .2s",
            }}>
              <input type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={e=>setFile(e.target.files[0])}/>
              {file
                ? <div style={{ color:"#a78bfa", fontSize:13, fontWeight:600 }}>✅ {file.name}</div>
                : <div>
                    <div style={{ fontSize:24, marginBottom:6 }}>📎</div>
                    <div style={{ color:"#64748b", fontSize:13 }}>Çeki yükləmək üçün klik edin</div>
                    <div style={{ color:"#475569", fontSize:11, marginTop:3 }}>JPG, PNG, PDF</div>
                  </div>
              }
            </label>
          </div>

          {/* Note */}
          <div style={{ marginBottom:20 }}>
            <textarea value={note} onChange={e=>setNote(e.target.value)}
              placeholder="Əlavə qeyd (istəyə bağlı)"
              style={{ resize:"none", height:64 }}/>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose} style={{
              flex:1, padding:"12px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)",
              backgroundColor:"rgba(255,255,255,0.04)", color:"#94a3b8", fontSize:14, cursor:"pointer",
            }}>Ləğv et</button>
            <button onClick={handleSubmit} style={{
              flex:2, padding:"12px", borderRadius:12,
              background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"white",
              border:"none", fontSize:14, fontWeight:700, cursor:"pointer",
              boxShadow:"0 0 24px rgba(124,58,237,0.35)",
            }}>Sifarişi Göndər →</button>
          </div>
          <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:"#475569" }}>
            12 saat ərzində çatdırılır · 24 saatı keçərsə geri ödəmə üçün <a href={WA_LINK} style={{ color:"#a78bfa" }}>əlaqə saxlayın</a>
          </div>
        </>
      )}
    </ModalWrap>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("register"); // register | login
  const [step, setStep] = useState("email");    // email | otp | phone | done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = () => {
    if (!email.includes("@")) { setError("Düzgün email daxil edin"); return; }
    setError("");
    if (mode === "login") {
      const users = ls.get("ps_users") || [];
      const found = users.find(u => u.email === email);
      if (!found) { setError("Bu email ilə hesab tapılmadı"); return; }
    }
    setLoading(true);
    const code = generateOTP();
    setGeneratedOtp(code);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      // DEV: console.log for testing until real email is set up
      console.log("OTP kodu:", code);
      alert(`Test üçün OTP kodunuz: ${code}\n(Real saytda email-ə göndəriləcək)`);
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otp !== generatedOtp) { setError("OTP kodu yanlışdır"); return; }
    setError("");
    if (mode === "login") {
      const users = ls.get("ps_users") || [];
      const found = users.find(u => u.email === email);
      onSuccess(found);
      onClose();
    } else {
      setStep("phone");
    }
  };

  const handleFinish = () => {
    const newUser = { email, phone, name: email.split("@")[0], createdAt: new Date().toISOString() };
    const users = ls.get("ps_users") || [];
    ls.set("ps_users", [...users, newUser]);
    onSuccess(newUser);
    setStep("done");
    setTimeout(onClose, 2000);
  };

  return (
    <ModalWrap onClose={onClose}>
      {step === "done" ? (
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <div style={{ fontSize:52, marginBottom:12 }}>🎉</div>
          <h3 style={{ fontSize:20, fontWeight:800 }}>Xoş gəldiniz!</h3>
          <p style={{ color:"#64748b", marginTop:8 }}>Hesabınız uğurla yaradıldı.</p>
        </div>
      ) : (
        <>
          {/* Mode switch */}
          <div style={{ display:"flex", gap:4, marginBottom:24, backgroundColor:"rgba(255,255,255,0.04)", borderRadius:12, padding:4 }}>
            {["register","login"].map(m=>(
              <button key={m} onClick={()=>{ setMode(m); setStep("email"); setError(""); }}
                style={{
                  flex:1, padding:"9px", borderRadius:9, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all .15s",
                  backgroundColor: mode===m ? "#7c3aed" : "transparent",
                  color: mode===m ? "white" : "#64748b",
                }}>
                {m==="register" ? "Qeydiyyat" : "Giriş"}
              </button>
            ))}
          </div>

          {step === "email" && <>
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>
              {mode==="register" ? "Hesab yarat" : "Hesabına gir"}
            </h3>
            <p style={{ color:"#64748b", fontSize:13, marginBottom:20 }}>
              {mode==="register" ? "Email ünvanınıza doğrulama kodu göndərəcəyik" : "Email ünvanınızı daxil edin"}
            </p>
            <div style={{ marginBottom:16 }}>
              <input value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSendOtp()}
                placeholder="email@example.com" type="email"/>
            </div>
            {error && <p style={{ color:"#f87171", fontSize:12, marginBottom:12 }}>{error}</p>}
            <button onClick={handleSendOtp} disabled={loading} style={{
              width:"100%", padding:"13px", borderRadius:12,
              background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"white",
              border:"none", fontSize:14, fontWeight:700, cursor:"pointer",
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "Göndərilir..." : "Kodu Göndər →"}
            </button>
          </>}

          {step === "otp" && <>
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>Kodu daxil edin</h3>
            <p style={{ color:"#64748b", fontSize:13, marginBottom:20 }}>
              <strong style={{ color:"#a78bfa" }}>{email}</strong> ünvanına 6 rəqəmli kod göndərildi
            </p>
            <input value={otp} onChange={e=>setOtp(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleVerifyOtp()}
              placeholder="123456" maxLength={6}
              style={{ textAlign:"center", fontSize:24, letterSpacing:"8px", fontWeight:700, marginBottom:16 }}/>
            {error && <p style={{ color:"#f87171", fontSize:12, marginBottom:12 }}>{error}</p>}
            <button onClick={handleVerifyOtp} style={{
              width:"100%", padding:"13px", borderRadius:12,
              background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"white",
              border:"none", fontSize:14, fontWeight:700, cursor:"pointer",
            }}>Təsdiqlə →</button>
            <button onClick={()=>setStep("email")} style={{
              width:"100%", marginTop:10, padding:"10px", border:"none",
              backgroundColor:"transparent", color:"#64748b", fontSize:13, cursor:"pointer",
            }}>← Geri</button>
          </>}

          {step === "phone" && <>
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>Nömrənizi əlavə edin</h3>
            <p style={{ color:"#64748b", fontSize:13, marginBottom:4 }}>
              Bu addım istəyə bağlıdır. Nömrəniz yalnız geri ödəmə halında istifadə olunur.
            </p>
            <p style={{ color:"#475569", fontSize:11, marginBottom:20 }}>
              * Əlavə etmək istəməsəniz keçin
            </p>
            <input value={phone} onChange={e=>setPhone(e.target.value)}
              placeholder="+994 XX XXX XX XX" type="tel" style={{ marginBottom:16 }}/>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={handleFinish} style={{
                flex:1, padding:"12px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)",
                backgroundColor:"rgba(255,255,255,0.04)", color:"#94a3b8", fontSize:13, cursor:"pointer",
              }}>Keç →</button>
              <button onClick={handleFinish} style={{
                flex:2, padding:"12px", borderRadius:12,
                background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"white",
                border:"none", fontSize:14, fontWeight:700, cursor:"pointer",
              }}>Tamamla ✓</button>
            </div>
          </>}
        </>
      )}
    </ModalWrap>
  );
}

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
function ModalWrap({ children, onClose, wide }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div className="anim-fadein" onClick={onClose} style={{
      position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.7)", zIndex:500,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
      backdropFilter:"blur(8px)",
    }}>
      <div className="anim-scalein" onClick={e=>e.stopPropagation()} style={{
        backgroundColor:"#0f0f1a", border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:22, padding:28, width:"100%", maxWidth: wide ? 540 : 420,
        position:"relative", maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 32px 80px rgba(0,0,0,0.6)",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.06)",
          border:"none", color:"#64748b", borderRadius:"50%", width:30, height:30,
          cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
        }}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ onOrder, navigate }) {
  const productsRef = useRef(null);
  const featured = PRODUCTS.filter(p => p.badge).slice(0,6);
  const allFeatured = PRODUCTS.slice(0,8);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
  };

  return (
    <div>
      {/* HERO */}
      <section style={{ position:"relative", zIndex:1, padding:"100px 24px 80px", textAlign:"center", maxWidth:760, margin:"0 auto" }}>
        {/* Animated blobs */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          {[
            {w:700,h:700,top:-250,left:-250,c:"rgba(109,40,217,0.12)"},
            {w:600,h:600,top:"40%",right:-250,c:"rgba(59,130,246,0.07)"},
            {w:500,h:500,bottom:-100,left:"30%",c:"rgba(139,92,246,0.06)"},
          ].map((b,i)=>(
            <div key={i} style={{
              position:"absolute", width:b.w, height:b.h, borderRadius:"50%",
              top:b.top, right:b.right, bottom:b.bottom, left:b.left,
              background:`radial-gradient(circle, ${b.c} 0%, transparent 70%)`,
              filter:"blur(80px)", animation:`blobPulse ${4+i}s ease-in-out infinite`,
              animationDelay:`${i*1.5}s`,
            }}/>
          ))}
        </div>

        {/* Badge */}
        <div className="anim-fadeup" style={{
          display:"inline-flex", alignItems:"center", gap:8,
          backgroundColor:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.22)",
          borderRadius:24, padding:"6px 18px", fontSize:13, color:"#c4b5fd", marginBottom:28, fontWeight:500,
        }}>
          ⚡ 32+ Rəqəmsal Abunəlik · 12 saat ərzində çatdırılır
        </div>

        <h1 className="anim-fadeup delay-1" style={{
          fontSize:"clamp(36px,6vw,64px)", fontWeight:900, lineHeight:1.05,
          letterSpacing:"-2px", marginBottom:22,
        }}>
          <span className="gradient-text">Bütün Rəqəmsal</span><br/>
          <span className="gradient-text-animate">Abunəliklər</span><br/>
          <span style={{ color:"#f1f5f9" }}>Bir Yerdə</span>
        </h1>

        <p className="anim-fadeup delay-2" style={{ color:"#94a3b8", fontSize:18, lineHeight:1.75, marginBottom:40, maxWidth:520, margin:"0 auto 40px" }}>
          Netflix, Spotify, ChatGPT, Adobe, Canva, NordVPN və daha çox. Etibarlı xidmət, sərfəli qiymət, sürətli çatdırılma.
        </p>

        <div className="anim-fadeup delay-3" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={scrollToProducts} style={{
            background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"white",
            border:"none", borderRadius:14, padding:"15px 32px", fontSize:16, fontWeight:800,
            cursor:"pointer", boxShadow:"0 0 40px rgba(124,58,237,0.4)", letterSpacing:"-0.3px",
            transition:"all .2s",
          }}>
            Abunəliklərə Bax ↓
          </button>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
            display:"inline-block", backgroundColor:"rgba(37,211,102,0.1)",
            border:"1px solid rgba(37,211,102,0.25)", color:"#4ade80",
            textDecoration:"none", borderRadius:14, padding:"15px 28px", fontSize:15, fontWeight:600,
          }}>
            💬 Dəstək Xidməti
          </a>
        </div>

        {/* Stats */}
        <div className="anim-fadeup delay-4" style={{ display:"flex", gap:44, justifyContent:"center", marginTop:68, flexWrap:"wrap" }}>
          {[["1000+","Məmnun müştəri"],["12s","Çatdırılma vaxtı"],["32+","Fərqli abunəlik"],["7/24","Dəstək xidməti"]].map(([n,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:900, color:"#a78bfa", letterSpacing:"-0.5px" }}>{n}</div>
              <div style={{ fontSize:12, color:"#475569", marginTop:3, fontWeight:500 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BRAND MARQUEE */}
      <div style={{ overflow:"hidden", padding:"28px 0", borderTop:"1px solid rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.04)", position:"relative", zIndex:1 }}>
        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:80, background:"linear-gradient(to right, #07070f, transparent)", zIndex:2 }}/>
        <div style={{ position:"absolute", right:0, top:0, bottom:0, width:80, background:"linear-gradient(to left, #07070f, transparent)", zIndex:2 }}/>
        <div className="anim-marquee" style={{ display:"flex", gap:0, whiteSpace:"nowrap" }}>
          {[...BRANDS,...BRANDS].map((b,i)=>(
            <span key={i} style={{ padding:"0 28px", color:"#475569", fontSize:13, fontWeight:600, letterSpacing:"0.3px" }}>
              <span style={{ color:"#7c3aed", marginRight:8 }}>✦</span>{b}
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section style={{ position:"relative", zIndex:1, padding:"60px 24px 0", maxWidth:1100, margin:"0 auto" }}>
        <div className="anim-fadeup" style={{ textAlign:"center", marginBottom:44 }}>
          <h2 style={{ fontSize:34, fontWeight:800, letterSpacing:"-1px", marginBottom:10 }}>Kateqoriyalar</h2>
          <p style={{ color:"#64748b" }}>İstədiyiniz sahəni seçin</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px,1fr))", gap:12, marginBottom:64 }}>
          {[
            { icon:"🎬", label:"Streaming", key:"streaming" },
            { icon:"🤖", label:"AI Alətləri", key:"ai" },
            { icon:"🎨", label:"Dizayn", key:"design" },
            { icon:"💼", label:"Produktivlik", key:"productivity" },
            { icon:"🔒", label:"VPN & Güvənlik", key:"vpn" },
            { icon:"💻", label:"Geliştirici", key:"dev" },
          ].map((c,i)=>(
            <div key={c.key}
              className={`anim-fadeup delay-${i+1}`}
              onClick={()=>navigate("products", c.key)}
              style={{
                backgroundColor:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:16, padding:"20px 16px", textAlign:"center", cursor:"pointer",
                transition:"all .22s ease",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.backgroundColor="rgba(124,58,237,0.12)"; e.currentTarget.style.borderColor="rgba(124,58,237,0.35)"; e.currentTarget.style.transform="translateY(-4px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.backgroundColor="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.transform="translateY(0)"; }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{c.icon}</div>
              <div style={{ fontSize:12, fontWeight:600, color:"#94a3b8" }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section ref={productsRef} style={{ position:"relative", zIndex:1, padding:"0 24px 64px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:36, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontSize:30, fontWeight:800, letterSpacing:"-0.8px", marginBottom:6 }}>Seçilmiş Məhsullar</h2>
            <p style={{ color:"#64748b", fontSize:14 }}>Ən çox sifariş verilən abunəliklər</p>
          </div>
          <button onClick={()=>navigate("products")} style={{
            backgroundColor:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.3)",
            color:"#a78bfa", borderRadius:10, padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer",
          }}>Hamısına bax →</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:18 }}>
          {allFeatured.map((p,i)=>(
            <ProductCard key={p.id} product={p} onOrder={onOrder} delay={i+1}/>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ position:"relative", zIndex:1, padding:"64px 24px", maxWidth:900, margin:"0 auto" }}>
        <div className="anim-fadeup" style={{ textAlign:"center", marginBottom:52 }}>
          <h2 style={{ fontSize:34, fontWeight:800, letterSpacing:"-1px", marginBottom:10 }}>Necə işləyir?</h2>
          <p style={{ color:"#64748b" }}>4 sadə addımda abunəliyinizi alın</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px,1fr))", gap:16 }}>
          {[
            { n:"01", icon:"🔍", title:"Seçin", desc:"İstədiyiniz platformanı və müddəti seçin.", color:"#7c3aed" },
            { n:"02", icon:"💳", title:"Ödəyin", desc:"ABB, LEO, Kapital və ya M10 ilə kart köçürməsi edin.", color:"#5b21b6" },
            { n:"03", icon:"📤", title:"Çeki Yükləyin", desc:"Ödəniş skrinşotunu sayta yükləyin.", color:"#4c1d95" },
            { n:"04", icon:"✅", title:"Hesabı Alın", desc:"12 saat ərzində hesab məlumatları sizə çatır.", color:"#3b0764" },
          ].map((s,i)=>(
            <div key={i} className={`anim-fadeup delay-${i+1}`} style={{
              backgroundColor:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
              borderRadius:18, padding:"24px 20px", textAlign:"center",
              transition:"transform .22s, border-color .22s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.borderColor="rgba(124,58,237,0.3)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; }}>
              <div style={{ fontSize:30, marginBottom:10 }}>{s.icon}</div>
              <div style={{
                display:"inline-block", fontSize:9, fontWeight:800, color:s.color,
                backgroundColor:`${s.color}15`, border:`1px solid ${s.color}35`,
                borderRadius:20, padding:"3px 10px", letterSpacing:"1px", marginBottom:12,
              }}>{s.n}</div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>{s.title}</div>
              <div style={{ color:"#64748b", fontSize:13, lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop:20, backgroundColor:"rgba(234,179,8,0.06)", border:"1px solid rgba(234,179,8,0.2)",
          borderRadius:14, padding:"14px 20px", textAlign:"center", fontSize:13, color:"#fbbf24",
        }}>
          ⚠️ 24 saat ərzində çatdırılmadıqda tam geri ödəmə üçün <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ color:"#fbbf24", fontWeight:700 }}>WhatsApp</a> vasitəsilə əlaqə saxlayın
        </div>
      </section>

      {/* PAYMENT SECTION */}
      <section style={{ position:"relative", zIndex:1, padding:"0 24px 64px", maxWidth:900, margin:"0 auto" }}>
        <div className="anim-fadeup" style={{ textAlign:"center", marginBottom:36 }}>
          <h2 style={{ fontSize:30, fontWeight:800, letterSpacing:"-0.8px", marginBottom:8 }}>Ödəniş Üsulları</h2>
          <p style={{ color:"#64748b", fontSize:14 }}>ABB, LEO, Kapital Bank və ya M10 ilə ödəyin</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:14 }}>
          {PAYMENT_METHODS.map((pm,i)=>(
            <div key={i} className={`anim-fadeup delay-${i+1}`} style={{
              backgroundColor: pm.bg, border:`1px solid ${pm.color}25`,
              borderRadius:16, padding:"20px 22px",
              transition:"transform .22s",
            }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
              <div style={{
                width:44, height:44, borderRadius:12, backgroundColor:`${pm.color}20`,
                border:`1px solid ${pm.color}40`, display:"flex", alignItems:"center",
                justifyContent:"center", fontWeight:800, fontSize:12, color:pm.color, marginBottom:12,
              }}>{pm.short}</div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{pm.name}</div>
              <div style={{ fontSize:12, color:"#94a3b8", fontFamily:"monospace", lineHeight:1.6 }}>{pm.info}</div>
              {pm.owner && <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>Ad: {pm.owner}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section style={{ position:"relative", zIndex:1, padding:"0 24px 80px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px,1fr))", gap:14 }}>
          {[
            { icon:"🔒", title:"Güvənli ödəniş", desc:"Card-to-card köçürmə. Çek ilə təsdiq edilir." },
            { icon:"⚡", title:"12 saat çatdırılma", desc:"Onay verilən kimi 12 saat ərzində hesab göndərilir." },
            { icon:"🔄", title:"Geri ödəmə zəmanəti", desc:"24 saatı keçərsə tam geri ödəmə edilir." },
            { icon:"💬", title:"7/24 Dəstək", desc:"WhatsApp vasitəsilə hər sualınıza cavab veririk." },
          ].map((t,i)=>(
            <div key={i} className={`anim-fadeup delay-${i+1}`} style={{
              backgroundColor:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)",
              borderRadius:16, padding:"22px 24px",
            }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{t.icon}</div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>{t.title}</div>
              <div style={{ color:"#64748b", fontSize:13, lineHeight:1.6 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── PRODUCTS PAGE ────────────────────────────────────────────────────────────
function ProductsPage({ onOrder, initialCat = "all" }) {
  const [cat, setCat] = useState(initialCat);
  const [search, setSearch] = useState("");
  const filtered = PRODUCTS.filter(p =>
    (cat === "all" || p.cat === cat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"48px 24px 80px" }}>
      <div className="anim-fadeup" style={{ marginBottom:36 }}>
        <h1 style={{ fontSize:34, fontWeight:800, letterSpacing:"-1px", marginBottom:6 }}>Bütün Məhsullar</h1>
        <p style={{ color:"#64748b" }}>32+ rəqəmsal abunəlik — streaming, AI, dizayn, VPN və daha çox</p>
      </div>

      {/* Search */}
      <div className="anim-fadeup delay-1" style={{ marginBottom:20 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍  Məhsul axtar... (Netflix, Spotify, ChatGPT...)"
          style={{ fontSize:14 }}/>
      </div>

      {/* Category tabs */}
      <div className="anim-fadeup delay-2" style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:32 }}>
        {CATEGORIES.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)} style={{
            padding:"8px 16px", borderRadius:20, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all .15s",
            backgroundColor: cat===c.id ? "#7c3aed" : "rgba(255,255,255,0.05)",
            color: cat===c.id ? "white" : "#94a3b8",
            boxShadow: cat===c.id ? "0 0 20px rgba(124,58,237,0.4)" : "none",
          }}>{c.label} {cat===c.id && `(${filtered.length})`}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0
        ? <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:18 }}>
            {filtered.map((p,i)=><ProductCard key={p.id} product={p} onOrder={onOrder} delay={(i%6)+1}/>)}
          </div>
        : <div style={{ textAlign:"center", padding:"60px 20px", color:"#64748b" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <p>"{search}" üçün nəticə tapılmadı</p>
          </div>
      }
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user, onUpdatePhone, navigate }) {
  const [orders] = useState(() => (ls.get("ps_orders") || []).filter(o=>o.userEmail===user.email).reverse());
  const [phone, setPhone] = useState(user.phone || "");
  const [saved, setSaved] = useState(false);

  const statusLabel = { pending:"Gözlənilir", approved:"Təsdiqləndi", delivered:"Çatdırıldı" };
  const statusColor = { pending:"#f59e0b", approved:"#10b981", delivered:"#a78bfa" };

  const handleSave = () => {
    const users = ls.get("ps_users") || [];
    const upd = users.map(u => u.email === user.email ? {...u, phone} : u);
    ls.set("ps_users", upd);
    onUpdatePhone(phone);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"48px 24px 80px" }}>
      <div className="anim-fadeup" style={{ marginBottom:36 }}>
        <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:"-0.8px", marginBottom:4 }}>Hesabım</h1>
        <p style={{ color:"#64748b" }}>{user.email}</p>
      </div>

      {/* Profile info */}
      <div className="anim-fadeup delay-1" style={{
        backgroundColor:"#0f0f1a", border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:18, padding:24, marginBottom:20,
      }}>
        <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Şəxsi Məlumatlar</h3>
        <div style={{ display:"grid", gap:12 }}>
          <div>
            <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Email</div>
            <div style={{ fontSize:14, color:"#a78bfa", fontFamily:"monospace" }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Əlaqə nömrəsi (geri ödəmə üçün)</div>
            <div style={{ display:"flex", gap:10 }}>
              <input value={phone} onChange={e=>setPhone(e.target.value)}
                placeholder="+994 XX XXX XX XX" style={{ flex:1 }}/>
              <button onClick={handleSave} style={{
                padding:"0 18px", borderRadius:10, border:"none",
                backgroundColor: saved ? "rgba(34,197,94,0.2)" : "rgba(124,58,237,0.2)",
                color: saved ? "#4ade80" : "#a78bfa",
                fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
              }}>{saved ? "✓ Saxlandı" : "Saxla"}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="anim-fadeup delay-2">
        <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>Sifarişlərim ({orders.length})</h3>
        {orders.length === 0
          ? <div style={{
              backgroundColor:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
              borderRadius:16, padding:"40px 24px", textAlign:"center",
            }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📦</div>
              <p style={{ color:"#64748b" }}>Hələ sifariş verməmisiniz</p>
              <button onClick={()=>navigate("products")} style={{
                marginTop:16, padding:"10px 24px", borderRadius:10,
                background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"white",
                border:"none", fontSize:13, fontWeight:600, cursor:"pointer",
              }}>Məhsullara bax →</button>
            </div>
          : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {orders.map(o=>(
                <div key={o.id} style={{
                  backgroundColor:"#0f0f1a", border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:16, padding:"18px 20px", display:"flex",
                  alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12,
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{
                      width:42, height:42, borderRadius:11,
                      backgroundColor:`${o.color}1a`, border:`1px solid ${o.color}40`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:10, fontWeight:800, color:o.color,
                    }}>{o.short}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{o.productName}</div>
                      <div style={{ fontSize:12, color:"#64748b" }}>{o.plan} · {o.date}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{ fontSize:18, fontWeight:800, color:o.color }}>{o.price}₼</div>
                    <span style={{
                      fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20,
                      backgroundColor:`${statusColor[o.status] || "#f59e0b"}15`,
                      color: statusColor[o.status] || "#f59e0b",
                      border:`1px solid ${statusColor[o.status] || "#f59e0b"}30`,
                    }}>{statusLabel[o.status] || "Gözlənilir"}</span>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage() {
  const [pass, setPass] = useState("");
  const [auth, setAuth] = useState(false);
  const [orders, setOrders] = useState([]);
  const [accountInputs, setAccountInputs] = useState({});
  const [saved, setSaved] = useState({});

  const login = () => {
    if (pass === ADMIN_PASS) { setAuth(true); setOrders(ls.get("ps_orders") || []); }
    else alert("Şifrə yanlışdır");
  };

  const approve = (id) => {
    const acc = accountInputs[id];
    if (!acc) { alert("Hesab məlumatlarını daxil edin"); return; }
    const upd = orders.map(o => o.id===id ? {...o, status:"delivered", accountInfo:acc} : o);
    ls.set("ps_orders", upd);
    setOrders(upd);
    setSaved(s=>({...s, [id]:true}));
  };

  if (!auth) return (
    <div style={{ maxWidth:400, margin:"120px auto", padding:"0 24px" }}>
      <div style={{ backgroundColor:"#0f0f1a", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:32, textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🔐</div>
        <h2 style={{ fontSize:20, fontWeight:800, marginBottom:20 }}>Admin Panel</h2>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Admin şifrəsi" style={{ marginBottom:16 }}/>
        <button onClick={login} style={{
          width:"100%", padding:"13px", borderRadius:12,
          background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"white",
          border:"none", fontSize:14, fontWeight:700, cursor:"pointer",
        }}>Giriş</button>
      </div>
    </div>
  );

  const pending = orders.filter(o=>o.status==="pending");
  const done = orders.filter(o=>o.status!=="pending");

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"48px 24px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:36, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800 }}>Admin Panel</h1>
          <p style={{ color:"#64748b", fontSize:13 }}>Gözləyən sifarişlər: {pending.length}</p>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <div style={{
            backgroundColor:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)",
            borderRadius:12, padding:"10px 18px", color:"#fbbf24", fontSize:14, fontWeight:700,
          }}>⏳ {pending.length} Gözlənilir</div>
          <div style={{
            backgroundColor:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)",
            borderRadius:12, padding:"10px 18px", color:"#10b981", fontSize:14, fontWeight:700,
          }}>✅ {done.length} Tamamlandı</div>
        </div>
      </div>

      {pending.length === 0 && <div style={{ textAlign:"center", padding:"40px", color:"#64748b" }}>Gözləyən sifariş yoxdur 🎉</div>}

      <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:40 }}>
        {pending.map(o=>(
          <div key={o.id} style={{
            backgroundColor:"#0f0f1a", border:"1px solid rgba(245,158,11,0.2)",
            borderRadius:18, padding:22,
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:42, height:42, borderRadius:11,
                  backgroundColor:`${o.color}1a`, border:`1px solid ${o.color}40`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:800, color:o.color,
                }}>{o.short}</div>
                <div>
                  <div style={{ fontWeight:700 }}>{o.productName} — {o.plan}</div>
                  <div style={{ fontSize:12, color:"#64748b" }}>{o.userEmail} · {o.date} · {o.price}₼</div>
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, backgroundColor:"rgba(245,158,11,0.12)", color:"#fbbf24", border:"1px solid rgba(245,158,11,0.25)" }}>Gözlənilir</span>
            </div>
            {o.note && <div style={{ fontSize:12, color:"#94a3b8", marginBottom:12, backgroundColor:"rgba(255,255,255,0.03)", borderRadius:8, padding:"8px 12px" }}>📝 {o.note}</div>}
            <div style={{ display:"flex", gap:10 }}>
              <input
                value={accountInputs[o.id] || ""}
                onChange={e=>setAccountInputs(s=>({...s,[o.id]:e.target.value}))}
                placeholder="Hesab məlumatları: email: ... şifrə: ..."
                style={{ flex:1 }}/>
              <button onClick={()=>approve(o.id)} style={{
                padding:"0 20px", borderRadius:10, border:"none",
                backgroundColor: saved[o.id] ? "rgba(16,185,129,0.2)" : "rgba(124,58,237,0.2)",
                color: saved[o.id] ? "#10b981" : "#a78bfa",
                fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap",
              }}>{saved[o.id] ? "✓ Göndərildi" : "Onayla & Göndər"}</button>
            </div>
          </div>
        ))}
      </div>

      {done.length > 0 && <>
        <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16, color:"#64748b" }}>Tamamlanan Sifarişlər</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {done.map(o=>(
            <div key={o.id} style={{
              backgroundColor:"rgba(16,185,129,0.04)", border:"1px solid rgba(16,185,129,0.15)",
              borderRadius:14, padding:"14px 18px", display:"flex",
              alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8,
            }}>
              <div style={{ fontSize:14, fontWeight:600 }}>{o.productName} — {o.plan}</div>
              <div style={{ fontSize:12, color:"#64748b" }}>{o.userEmail} · {o.price}₼</div>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, backgroundColor:"rgba(16,185,129,0.12)", color:"#10b981" }}>✅ Tamamlandı</span>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [pageKey, setPageKey] = useState(0);
  const [visible, setVisible] = useState(true);
  const [catFilter, setCatFilter] = useState("all");

  const [user, setUser] = useState(() => ls.get("ps_current_user"));
  const [orderModal, setOrderModal] = useState(null); // {product, planIdx}
  const [authOpen, setAuthOpen] = useState(false);

  const navigate = (p, cat = "all") => {
    setVisible(false);
    setTimeout(() => {
      setPage(p);
      setCatFilter(cat);
      setPageKey(k => k+1);
      window.scrollTo({ top:0, behavior:"smooth" });
      setVisible(true);
    }, 220);
  };

  const handleOrder = (product, planIdx) => {
    setOrderModal({ product, planIdx });
  };

  const handleLogin = (u) => {
    setUser(u);
    ls.set("ps_current_user", u);
  };

  const handleLogout = () => {
    setUser(null);
    ls.set("ps_current_user", null);
    navigate("home");
  };

  const handleUpdatePhone = (phone) => {
    const upd = { ...user, phone };
    setUser(upd);
    ls.set("ps_current_user", upd);
  };

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#07070f", color:"#f1f5f9", position:"relative" }}>

      <Navbar
        page={page} navigate={navigate}
        user={user} onLogout={handleLogout}
        onAuthOpen={()=>setAuthOpen(true)}
      />

      <div key={pageKey} className="page-wrap" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition:"opacity .22s ease, transform .22s ease" }}>
        {page === "home"     && <HomePage onOrder={handleOrder} navigate={navigate}/>}
        {page === "products" && <ProductsPage onOrder={handleOrder} initialCat={catFilter}/>}
        {page === "profile"  && user && <ProfilePage user={user} onUpdatePhone={handleUpdatePhone} navigate={navigate}/>}
        {page === "admin"    && <AdminPage/>}
      </div>

      {page !== "admin" && <Footer navigate={navigate}/>}

      {/* Modals */}
      {authOpen && (
        <AuthModal onClose={()=>setAuthOpen(false)} onSuccess={handleLogin}/>
      )}
      {orderModal && (
        <OrderModal
          product={orderModal.product}
          planIdx={orderModal.planIdx}
          user={user}
          onClose={()=>setOrderModal(null)}
          onAuthOpen={()=>{ setOrderModal(null); setAuthOpen(true); }}
        />
      )}

      <WhatsAppBtn/>

      {/* Secret admin access - click logo 5 times */}
      <div style={{ position:"fixed", bottom:90, right:24, zIndex:100 }}>
        <button onClick={()=>navigate("admin")} style={{
          backgroundColor:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
          color:"#334155", borderRadius:8, padding:"5px 10px", fontSize:10, cursor:"pointer",
        }}>Admin</button>
      </div>
    </div>
  );
}