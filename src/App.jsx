import { useState } from "react";

const SERVICES = [
  {
    id: 1, name: "Netflix", short: "N", color: "#E50914", glow: "rgba(229,9,20,0.28)",
    desc: "4K Ultra HD · 4 ekran · Bütün seriallar",
    plans: [{ label: "1 Ay", price: 8 }, { label: "3 Ay", price: 22 }, { label: "1 İl", price: 80 }],
    badge: "Populyar",
  },
  {
    id: 2, name: "Spotify", short: "♪", color: "#1DB954", glow: "rgba(29,185,84,0.28)",
    desc: "80M+ mahnı · Reklamsız · Offline",
    plans: [{ label: "1 Ay", price: 5 }, { label: "3 Ay", price: 13 }, { label: "1 İl", price: 48 }],
    badge: null,
  },
  {
    id: 3, name: "YouTube Premium", short: "YT", color: "#FF0000", glow: "rgba(255,0,0,0.22)",
    desc: "Reklamsız · Offline · Arxa fon",
    plans: [{ label: "1 Ay", price: 6 }, { label: "3 Ay", price: 16 }, { label: "1 İl", price: 55 }],
    badge: null,
  },
  {
    id: 4, name: "Disney+", short: "D+", color: "#1A78C2", glow: "rgba(26,120,194,0.28)",
    desc: "Marvel · Star Wars · Pixar",
    plans: [{ label: "1 Ay", price: 7 }, { label: "3 Ay", price: 18 }, { label: "1 İl", price: 65 }],
    badge: null,
  },
  {
    id: 5, name: "Canva Pro", short: "Cv", color: "#8B5CF6", glow: "rgba(139,92,246,0.28)",
    desc: "Premium şablonlar · AI alətləri · Brand Kit",
    plans: [{ label: "1 Ay", price: 9 }, { label: "3 Ay", price: 24 }, { label: "1 İl", price: 85 }],
    badge: "Yeni",
  },
  {
    id: 6, name: "ChatGPT Plus", short: "AI", color: "#10A37F", glow: "rgba(16,163,127,0.28)",
    desc: "GPT-4o · DALL·E 3 · Sürətli cavablar",
    plans: [{ label: "1 Ay", price: 25 }, { label: "3 Ay", price: 68 }, { label: "1 İl", price: 250 }],
    badge: "Trend",
  },
];

function ServiceCard({ service }) {
  const [plan, setPlan] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#0f0f1a",
        border: `1px solid ${hovered ? service.color + "45" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 20,
        padding: 24,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? `0 24px 60px ${service.glow}` : "none",
        cursor: "default",
      }}
    >
      {/* Brand glow top-right */}
      <div style={{
        position: "absolute", top: -40, right: -30,
        width: 140, height: 140, borderRadius: "50%",
        background: `radial-gradient(circle, ${service.glow} 0%, transparent 70%)`,
        pointerEvents: "none", opacity: hovered ? 1 : 0.4,
        transition: "opacity 0.25s",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            backgroundColor: `${service.color}1a`,
            border: `1px solid ${service.color}45`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: service.color, letterSpacing: "-0.2px",
          }}>
            {service.short}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{service.name}</div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{service.desc}</div>
          </div>
        </div>
        {service.badge && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: service.color,
            backgroundColor: `${service.color}15`,
            border: `1px solid ${service.color}30`,
            borderRadius: 20, padding: "3px 9px",
            textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap",
          }}>
            {service.badge}
          </span>
        )}
      </div>

      {/* Plan tabs */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 20,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 10, padding: 4,
      }}>
        {service.plans.map((p, i) => (
          <button
            key={i}
            onClick={() => setPlan(i)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 7, border: "none",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
              backgroundColor: plan === i ? service.color : "transparent",
              color: plan === i ? "white" : "#64748b",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Price */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 38, fontWeight: 800, color: service.color, lineHeight: 1 }}>
            {service.plans[plan].price}
          </span>
          <span style={{ color: "#94a3b8", fontSize: 16 }}>AZN</span>
        </div>
        <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>
          / {service.plans[plan].label.toLowerCase()}
        </div>
      </div>

      {/* CTA */}
      <button
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          width: "100%", padding: "12px", borderRadius: 11,
          border: `1px solid ${btnHovered ? service.color : service.color + "50"}`,
          backgroundColor: btnHovered ? service.color : `${service.color}15`,
          color: btnHovered ? "white" : service.color,
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          transition: "all 0.18s",
        }}
      >
        Sifariş et →
      </button>
    </div>
  );
}

function NavLink({ href, children }) {
  const [h, setH] = useState(false);
  return (
    <a
      href={href}
      style={{
        color: h ? "#f1f5f9" : "#94a3b8", textDecoration: "none",
        fontSize: 14, padding: "8px 14px", borderRadius: 8, transition: "color 0.2s",
      }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    >
      {children}
    </a>
  );
}

function WhatsAppButton() {
  const [h, setH] = useState(false);
  return (
    <a
      href="https://wa.me/994XXXXXXXXX"
      target="_blank"
      rel="noopener noreferrer"
      title="WhatsApp ilə əlaqə"
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 999,
        width: 58, height: 58, borderRadius: "50%",
        backgroundColor: "#25D366",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: h ? "0 8px 32px rgba(37,211,102,0.6)" : "0 4px 20px rgba(37,211,102,0.38)",
        textDecoration: "none",
        transform: h ? "scale(1.1)" : "scale(1)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

export default function SubStore() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#07070f",
      color: "#f1f5f9",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowX: "hidden",
      position: "relative",
    }}>

      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", width: 640, height: 640, borderRadius: "50%",
          top: -220, left: -200,
          background: "radial-gradient(circle, rgba(109,40,217,0.13) 0%, transparent 70%)",
          filter: "blur(70px)",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          top: "45%", right: -200,
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          filter: "blur(70px)",
        }} />
        <div style={{
          position: "absolute", width: 420, height: 420, borderRadius: "50%",
          bottom: 0, left: "28%",
          background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
          filter: "blur(70px)",
        }} />
      </div>

      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        backgroundColor: "rgba(7,7,15,0.88)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "0 32px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "white",
          }}>S</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.3px" }}>SubStore</span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#a78bfa",
            backgroundColor: "rgba(167,139,250,0.1)",
            border: "1px solid rgba(167,139,250,0.22)",
            borderRadius: 20, padding: "2px 8px",
            letterSpacing: "0.8px", textTransform: "uppercase",
          }}>AZ</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NavLink href="#products">Məhsullar</NavLink>
          <NavLink href="#how">Necə işləyir</NavLink>
          <a
            href="https://wa.me/994XXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", textDecoration: "none",
              borderRadius: 10, padding: "8px 18px",
              fontSize: 13, fontWeight: 600, marginLeft: 8,
            }}
          >
            Əlaqə
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "100px 24px 80px",
        textAlign: "center", maxWidth: 740, margin: "0 auto",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          backgroundColor: "rgba(167,139,250,0.08)",
          border: "1px solid rgba(167,139,250,0.2)",
          borderRadius: 24, padding: "6px 18px",
          fontSize: 13, color: "#c4b5fd", marginBottom: 30, fontWeight: 500,
        }}>
          ⚡ Sifariş etdikdən sonra 24 saat ərzində çatdırılır
        </div>

        <h1 style={{
          fontSize: "clamp(38px, 6vw, 62px)",
          fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px",
          marginBottom: 22,
          background: "linear-gradient(135deg, #ffffff 30%, #a78bfa 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Rəqəmsal Abunəliklər<br />Ən Ucuz Qiymətə
        </h1>

        <p style={{
          color: "#94a3b8", fontSize: 18, lineHeight: 1.75,
          marginBottom: 42, maxWidth: 490, margin: "0 auto 42px",
        }}>
          Netflix, Spotify, YouTube Premium, ChatGPT Plus və daha çoxu. Etibarlı xidmət, sürətli çatdırılma.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#products" style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white", textDecoration: "none", borderRadius: 12,
            padding: "14px 32px", fontSize: 15, fontWeight: 700,
            boxShadow: "0 0 40px rgba(124,58,237,0.35)", letterSpacing: "-0.2px",
          }}>
            Abunəliklərə Bax
          </a>
          <a href="https://wa.me/994XXXXXXXXX" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f1f5f9", textDecoration: "none", borderRadius: 12,
            padding: "14px 28px", fontSize: 15, fontWeight: 500,
          }}>
            WhatsApp ilə Yazın
          </a>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 44, justifyContent: "center",
          marginTop: 68, flexWrap: "wrap",
        }}>
          {[["500+", "Məmnun müştəri"], ["24s", "Çatdırılma vaxtı"], ["6+", "Platform"], ["7/24", "Dəstək"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#a78bfa", letterSpacing: "-0.5px" }}>{num}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 3, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{
        maxWidth: 1120, margin: "0 auto", padding: "0 24px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }} />

      {/* PRODUCTS */}
      <section id="products" style={{ position: "relative", zIndex: 1, padding: "64px 24px", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-1px", marginBottom: 10 }}>
            Abunəlik Seçin
          </h2>
          <p style={{ color: "#64748b", fontSize: 15 }}>
            Plan seçin, sifariş edin — 24 saat ərzində hesabınız hazırdır
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
          gap: 18,
        }}>
          {SERVICES.map(s => <ServiceCard key={s.id} service={s} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ position: "relative", zIndex: 1, padding: "64px 24px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-1px", marginBottom: 10 }}>
            Necə işləyir?
          </h2>
          <p style={{ color: "#64748b" }}>3 addımda abunəliyinizi alın</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { n: "01", title: "Sifariş et", desc: "İstədiyiniz platformanı və plan müddətini seçib «Sifariş et» düyməsinə basın.", color: "#7c3aed" },
            { n: "02", title: "Ödəniş et", desc: "Kart nömrəmizə köçürmə edin. Ödəniş skrinşotunu WhatsApp vasitəsilə göndərin.", color: "#5b21b6" },
            { n: "03", title: "Hesabı alın", desc: "Ödəniş təsdiqlənəndən sonra 24 saat ərzində hesab məlumatları email və ya WhatsApp ilə göndərilir.", color: "#4c1d95" },
          ].map((step, i) => (
            <div key={i} style={{
              display: "flex", gap: 20,
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 16, padding: "24px 28px", alignItems: "flex-start",
            }}>
              <div style={{
                minWidth: 52, height: 52, borderRadius: 14,
                backgroundColor: `${step.color}1a`,
                border: `1px solid ${step.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: step.color, letterSpacing: "1px",
              }}>
                {step.n}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 7, color: "#f1f5f9" }}>{step.title}</div>
                <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.65 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ / TRUST STRIP */}
      <section style={{
        position: "relative", zIndex: 1,
        maxWidth: 1120, margin: "0 auto", padding: "0 24px 64px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 14,
        }}>
          {[
            { icon: "🔒", title: "Etibarlı ödəniş", desc: "Card-to-card köçürmə. Ödəniş skrinşotu ilə təsdiq." },
            { icon: "⚡", title: "Sürətli çatdırılma", desc: "Onay verilən kimi 24 saat ərzində hesab göndərilir." },
            { icon: "💬", title: "WhatsApp dəstək", desc: "Hər sualınızda birbaşa əlaqə saxlaya bilərsiniz." },
            { icon: "🔄", title: "Yenilənmə xatırlatması", desc: "Abunəlik bitməzdən əvvəl sizə bildiriş göndəririk." },
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 16, padding: "22px 24px",
            }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "#f1f5f9" }}>{item.title}</div>
              <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "36px 24px", textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900, color: "white",
          }}>S</div>
          <span style={{ fontWeight: 700, color: "#64748b" }}>SubStore</span>
        </div>
        <p style={{ color: "#334155", fontSize: 13 }}>
          © 2025 SubStore · Azərbaycan · Bütün hüquqlar qorunur
        </p>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
