import { useState, useEffect } from "react";

const CSS = `
  @keyframes fiu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes sp{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,.4)}70%{box-shadow:0 0 0 10px rgba(37,211,102,0)}}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:#07070f;scroll-behavior:smooth}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#2d2d4e;border-radius:4px}
  a{text-decoration:none;color:inherit}
  button,input,textarea{font-family:inherit;outline:none}
  .fi{animation:fi .3s ease both}
  .fiu{animation:fiu .45s ease both}
  .fiu1{animation:fiu .45s .08s ease both;opacity:0}
  .fiu2{animation:fiu .45s .16s ease both;opacity:0}
  .fiu3{animation:fiu .45s .24s ease both;opacity:0}
  .fiu4{animation:fiu .45s .32s ease both;opacity:0}
  .mq-wrap{overflow:hidden;white-space:nowrap}
  .mq-track{display:inline-flex;animation:mq 35s linear infinite}
  .mq-track:hover{animation-play-state:paused}
  .wa-pulse{animation:pulse 2s infinite}
`;

const BG="#07070f",CARD="#0f0f1a",CARD2="#141420",ACC="#7c3aed",ACC2="#a78bfa",
  T1="#f1f5f9",T2="#94a3b8",T3="#64748b",T4="#334155",BD="rgba(255,255,255,.06)";

const CATS=[
  {id:"all",label:"Hamısı",icon:"🌐"},
  {id:"entertainment",label:"Əyləncə",icon:"🎬"},
  {id:"ai",label:"AI & Süni İntellekt",icon:"🤖"},
  {id:"design",label:"Dizayn & Video",icon:"🎨"},
  {id:"vpn",label:"VPN & Antivirus",icon:"🔒"},
  {id:"social",label:"Sosial & Biznes",icon:"💼"},
  {id:"productivity",label:"Produktivlik",icon:"⚡"},
];

const SVCS=[
  {id:1,n:"Netflix",cat:"entertainment",c:"#E50914",g:"rgba(229,9,20,.28)",s:"N",d:"4K Ultra HD",pl:[{l:"1 Ay",p:8},{l:"3 Ay",p:22}],sold:6248,hot:true},
  {id:8,n:"ChatGPT Plus",cat:"ai",c:"#10A37F",g:"rgba(16,163,127,.28)",s:"AI",d:"GPT-4o",pl:[{l:"1 Ay",p:25}],sold:9875,hot:true},
  {id:16,n:"Canva Pro",cat:"design",c:"#8B5CF6",g:"rgba(139,92,246,.28)",s:"Cv",d:"Premium AI",pl:[{l:"1 Ay",p:9}],sold:5621,hot:true},
];

function Navbar({page,goTo,user}){
  return(
    <nav style={{padding:"20px 32px",borderBottom:`1px solid ${BD}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <h2 style={{cursor:"pointer",color:T1}} onClick={()=>goTo("home")}>Premium Shop</h2>
      <div style={{display:"flex",gap:15}}>
        <span onClick={()=>goTo("home")} style={{cursor:"pointer",color:page==="home"?ACC2:T2}}>Ana Səhifə</span>
        <span onClick={()=>goTo("shop")} style={{cursor:"pointer",color:page==="shop"?ACC2:T2}}>Məhsullar</span>
      </div>
    </nav>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [cat, setCat] = useState("all");

  const goTo = (pg) => setPage(pg);

  return (
    <div style={{backgroundColor:BG, minHeight:"100vh", color:T1}}>
      <style>{CSS}</style>
      <Navbar page={page} goTo={goTo} />
      
      <main style={{padding:"40px 20px", maxWidth:1100, margin:"0 auto"}}>
        {page === "home" ? (
          <div style={{textAlign:"center", paddingTop:50}}>
            <h1>Rəqəmsal Abunəliklər</h1>
            <p style={{color:T3, marginTop:10}}>Ən ucuz qiymətə, ən sürətli çatdırılma.</p>
          </div>
        ) : (
          <div>
            <div style={{marginBottom:30, display:"flex", gap:10, flexWrap:"wrap"}}>
              {CATS.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)} 
                  style={{padding:"8px 16px", borderRadius:8, border:"none", background:cat===c.id?ACC:CARD, color:"#fff", cursor:"pointer"}}>
                  {c.label}
                </button>
              ))}
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:20}}>
              {SVCS.filter(s => cat==="all" || s.cat===cat).map(s => (
                <div key={s.id} style={{background:CARD, padding:20, borderRadius:15, border:`1px solid ${BD}`}}>
                  <h3 style={{marginBottom:5}}>{s.n}</h3>
                  <p style={{color:T3, fontSize:13}}>{s.d}</p>
                  <p style={{color:s.c, fontWeight:"bold", marginTop:10}}>{s.pl[0].p} AZN</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
