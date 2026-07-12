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
  .fiu5{animation:fiu .45s .4s ease both;opacity:0}
  .fiu6{animation:fiu .45s .48s ease both;opacity:0}
  .mq-wrap{overflow:hidden;white-space:nowrap}
  .mq-track{display:inline-flex;animation:mq 35s linear infinite}
  .mq-track:hover{animation-play-state:paused}
  .sp{animation:sp .7s linear infinite}
  .wa-pulse{animation:pulse 2s infinite}
  input[type=file]{display:none}
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
  {id:1,n:"Netflix",cat:"entertainment",c:"#E50914",g:"rgba(229,9,20,.28)",s:"N",d:"4K Ultra HD · 4 ekran · Bütün seriallar",pl:[{l:"1 Ay",p:8},{l:"3 Ay",p:22},{l:"1 İl",p:80}],b:"Populyar",sold:6248,hot:true},
  {id:2,n:"Spotify",cat:"entertainment",c:"#1DB954",g:"rgba(29,185,84,.28)",s:"♪",d:"80M+ mahnı · Reklamsız · Offline",pl:[{l:"1 Ay",p:5},{l:"3 Ay",p:13},{l:"1 İl",p:48}],b:null,sold:4521,hot:true},
  {id:3,n:"YouTube Premium",cat:"entertainment",c:"#FF0000",g:"rgba(255,0,0,.23)",s:"YT",d:"Reklamsız · Offline video · Arxa fon",pl:[{l:"1 Ay",p:6},{l:"3 Ay",p:16},{l:"1 İl",p:55}],b:null,sold:3892,hot:true},
  {id:4,n:"Disney+",cat:"entertainment",c:"#1A78C2",g:"rgba(26,120,194,.28)",s:"D+",d:"Marvel · Star Wars · Pixar · NatGeo",pl:[{l:"1 Ay",p:7},{l:"3 Ay",p:18},{l:"1 İl",p:65}],b:null,sold:2103,hot:false},
  {id:5,n:"Apple TV+",cat:"entertainment",c:"#888",g:"rgba(136,136,136,.25)",s:"TV",d:"Apple Originals · 4K HDR · Dolby Vision",pl:[{l:"1 Ay",p:6},{l:"3 Ay",p:16}],b:null,sold:987,hot:false},
  {id:6,n:"Tidal HiFi",cat:"entertainment",c:"#00E5FF",g:"rgba(0,229,255,.22)",s:"Ti",d:"Master keyfiyyət · Exclusive kontentlər",pl:[{l:"1 Ay",p:7},{l:"3 Ay",p:18}],b:null,sold:432,hot:false},
  {id:7,n:"Deezer Premium",cat:"entertainment",c:"#EF5466",g:"rgba(239,84,102,.28)",s:"Dz",d:"90M+ mahnı · Flow · Offline pley",pl:[{l:"1 Ay",p:5},{l:"3 Ay",p:12}],b:null,sold:654,hot:false},
  {id:8,n:"ChatGPT Plus",cat:"ai",c:"#10A37F",g:"rgba(16,163,127,.28)",s:"AI",d:"GPT-4o · DALL·E 3 · Sürətli cavablar",pl:[{l:"1 Ay",p:25},{l:"3 Ay",p:68}],b:"Trend",sold:9875,hot:true},
  {id:9,n:"Claude Pro",cat:"ai",c:"#D97706",g:"rgba(217,119,6,.28)",s:"Cl",d:"Claude 4 · Uzun kontekst · Kod yaratma",pl:[{l:"1 Ay",p:20},{l:"3 Ay",p:55}],b:null,sold:2341,hot:false},
  {id:10,n:"Midjourney",cat:"ai",c:"#5865F2",g:"rgba(88,101,242,.28)",s:"MJ",d:"AI şəkil yaratma · Pro plan · Sürətli",pl:[{l:"1 Ay",p:15},{l:"3 Ay",p:40}],b:null,sold:3120,hot:true},
  {id:11,n:"Gemini Advanced",cat:"ai",c:"#4285F4",g:"rgba(66,133,244,.28)",s:"Gm",d:"Google AI Ultra · Multimodal · 2M token",pl:[{l:"1 Ay",p:20},{l:"3 Ay",p:55}],b:null,sold:1876,hot:false},
  {id:12,n:"Grok Super",cat:"ai",c:"#1DA1F2",g:"rgba(29,161,242,.28)",s:"Gk",d:"xAI · Real-time xəbər · Aurora görüntü",pl:[{l:"1 Ay",p:9},{l:"3 Ay",p:24}],b:"Yeni",sold:133,hot:false},
  {id:13,n:"Gamma AI",cat:"ai",c:"#7C3AED",g:"rgba(124,58,237,.28)",s:"Ga",d:"AI prezentasiya yaratma · Sürətli slide",pl:[{l:"1 Ay",p:8}],b:null,sold:453,hot:false},
  {id:14,n:"Perplexity Pro",cat:"ai",c:"#20B2AA",g:"rgba(32,178,170,.28)",s:"Pp",d:"AI axtarış mühərriki · Dərin analiz",pl:[{l:"1 Ay",p:18},{l:"3 Ay",p:48}],b:null,sold:765,hot:false},
  {id:15,n:"Grammarly Premium",cat:"ai",c:"#15C39A",g:"rgba(21,195,154,.28)",s:"Gr",d:"AI yazı köməkçisi · Qrammatika · Ton",pl:[{l:"1 Ay",p:10},{l:"3 Ay",p:26},{l:"1 İl",p:90}],b:null,sold:2340,hot:false},
  {id:16,n:"Canva Pro",cat:"design",c:"#8B5CF6",g:"rgba(139,92,246,.28)",s:"Cv",d:"Premium şablonlar · AI alətləri · Brand Kit",pl:[{l:"1 Ay",p:9},{l:"3 Ay",p:24},{l:"1 İl",p:85}],b:null,sold:5621,hot:true},
  {id:17,n:"Adobe Creative Cloud",cat:"design",c:"#FF0000",g:"rgba(255,0,0,.28)",s:"Ad",d:"Photoshop · Illustrator · Premiere · +20",pl:[{l:"1 Ay",p:18},{l:"3 Ay",p:48}],b:"Populyar",sold:4550,hot:true},
  {id:18,n:"Adobe Photoshop",cat:"design",c:"#31A8FF",g:"rgba(49,168,255,.28)",s:"Ps",d:"Peşəkar foto redaktə · AI alətlər",pl:[{l:"1 Ay",p:14},{l:"3 Ay",p:38}],b:null,sold:3210,hot:false},
  {id:19,n:"Adobe Illustrator",cat:"design",c:"#FF9A00",g:"rgba(255,154,0,.28)",s:"Ai",d:"Vektor qrafika · Logo dizayn · İllüstrasiya",pl:[{l:"1 Ay",p:14},{l:"3 Ay",p:38}],b:null,sold:2890,hot:false},
  {id:20,n:"Adobe Premiere Pro",cat:"design",c:"#9999FF",g:"rgba(153,153,255,.28)",s:"Pr",d:"Peşəkar video montaj · Rəng düzəltməsi",pl:[{l:"1 Ay",p:14},{l:"3 Ay",p:38}],b:null,sold:2340,hot:false},
  {id:21,n:"Figma Professional",cat:"design",c:"#F24E1E",g:"rgba(242,78,30,.28)",s:"Fg",d:"UI/UX dizayn · Prototype · Komanda işi",pl:[{l:"1 Ay",p:12},{l:"3 Ay",p:32}],b:null,sold:1876,hot:false},
  {id:22,n:"CapCut Pro",cat:"design",c:"#FE2C55",g:"rgba(254,44,85,.28)",s:"CC",d:"Video montaj · AI effektlər · Şablonlar",pl:[{l:"1 Ay",p:8},{l:"3 Ay",p:21}],b:null,sold:7000,hot:false},
  {id:23,n:"Alight Motion",cat:"design",c:"#FF4136",g:"rgba(255,65,54,.28)",s:"AM",d:"Mobil video redaktə · Animasiya · VFX",pl:[{l:"1 Ay",p:10}],b:null,sold:363,hot:false},
  {id:24,n:"Envato Elements",cat:"design",c:"#82B541",g:"rgba(130,181,65,.28)",s:"En",d:"Şablonlar · Şriftlər · Milyonlarla asset",pl:[{l:"1 Ay",p:12},{l:"3 Ay",p:32}],b:null,sold:1543,hot:false},
  {id:25,n:"NordVPN",cat:"vpn",c:"#4687FF",g:"rgba(70,135,255,.28)",s:"Nd",d:"6000+ server · 60 ölkə · Double VPN",pl:[{l:"1 Ay",p:8},{l:"3 Ay",p:20},{l:"1 İl",p:65}],b:"Populyar",sold:9875,hot:true},
  {id:26,n:"ExpressVPN",cat:"vpn",c:"#DA3940",g:"rgba(218,57,64,.28)",s:"Ex",d:"94 ölkə · Sürət lideri · TrustedServer",pl:[{l:"1 Ay",p:12},{l:"3 Ay",p:32}],b:null,sold:4321,hot:false},
  {id:27,n:"Surfshark",cat:"vpn",c:"#0EA5E9",g:"rgba(14,165,233,.28)",s:"Sf",d:"Limitsiz cihaz · CleanWeb · Nexus VPN",pl:[{l:"1 Ay",p:6},{l:"3 Ay",p:16},{l:"1 İl",p:50}],b:null,sold:3210,hot:false},
  {id:28,n:"Kaspersky Total",cat:"vpn",c:"#00A54F",g:"rgba(0,165,79,.28)",s:"Ks",d:"Antivirus + VPN + Parola meneceri",pl:[{l:"1 İl",p:25}],b:null,sold:2100,hot:false},
  {id:29,n:"Bitdefender Total",cat:"vpn",c:"#ED1C24",g:"rgba(237,28,36,.28)",s:"Bd",d:"Tam qoruma · 5 cihaz · VPN daxil",pl:[{l:"1 İl",p:22}],b:null,sold:1654,hot:false},
  {id:30,n:"LinkedIn Premium",cat:"social",c:"#0A66C2",g:"rgba(10,102,194,.28)",s:"Li",d:"Career · InMail · Müsahibə hazırlığı",pl:[{l:"1 Ay",p:12},{l:"3 Ay",p:32}],b:null,sold:8663,hot:true},
  {id:31,n:"Zoom Pro",cat:"social",c:"#2D8CFF",g:"rgba(45,140,255,.28)",s:"Zm",d:"100 iştirakçı · Limitsiz müddət · Cloud",pl:[{l:"1 Ay",p:11},{l:"3 Ay",p:29}],b:null,sold:569,hot:false},
  {id:32,n:"Semrush",cat:"social",c:"#FF642D",g:"rgba(255,100,45,.28)",s:"Se",d:"SEO · Rəqib analizi · Açar söz tədqiqatı",pl:[{l:"1 Ay",p:13}],b:null,sold:678,hot:false},
  {id:33,n:"Hootsuite Pro",cat:"social",c:"#00A1CB",g:"rgba(0,161,203,.28)",s:"Hs",d:"Sosial media idarəetmə · Planlama",pl:[{l:"1 Ay",p:10},{l:"3 Ay",p:27}],b:null,sold:432,hot:false},
  {id:34,n:"Microsoft 365",cat:"productivity",c:"#D83B01",g:"rgba(216,59,1,.28)",s:"M3",d:"Word · Excel · PowerPoint · 1TB OneDrive",pl:[{l:"1 Ay",p:10},{l:"1 İl",p:90}],b:null,sold:5432,hot:true},
  {id:35,n:"Notion Pro",cat:"productivity",c:"#6B7280",g:"rgba(107,114,128,.25)",s:"Nt",d:"Sonsuz bloklar · AI · Komanda · API",pl:[{l:"1 Ay",p:8},{l:"3 Ay",p:21}],b:null,sold:2341,hot:false},
  {id:36,n:"Dropbox Plus",cat:"productivity",c:"#0061FF",g:"rgba(0,97,255,.28)",s:"Dp",d:"2TB yaddaş · Offline sənədlər · Paylaşım",pl:[{l:"1 Ay",p:9},{l:"1 İl",p:85}],b:null,sold:1234,hot:false},
  {id:37,n:"AutoCAD",cat:"productivity",c:"#E51B23",g:"rgba(229,27,35,.28)",s:"AC",d:"2D/3D CAD dizayn · Mühəndislik · BIM",pl:[{l:"1 Ay",p:30},{l:"1 İl",p:300}],b:null,sold:2478,hot:false},
  {id:38,n:"Duolingo Plus",cat:"productivity",c:"#58CC02",g:"rgba(88,204,2,.28)",s:"Du",d:"Reklamsız · Sonsuz qəlb · Offline dərslər",pl:[{l:"1 Ay",p:5},{l:"3 Ay",p:13},{l:"1 İl",p:45}],b:null,sold:3210,hot:false},
];

const PAYS=[
  {id:"abb",n:"ABB Bank",num:"4169 7388 0012 3456",holder:"F. Kərimli",c:"#1565C0",bg:"rgba(21,101,192,.12)"},
  {id:"leo",n:"LEO (Leobank)",num:"4169 5887 0023 4567",holder:"F. Kərimli",c:"#FF6B35",bg:"rgba(255,107,53,.12)"},
  {id:"kapital",n:"Kapital Bank",num:"5536 9145 0034 5678",holder:"F. Kərimli",c:"#003087",bg:"rgba(0,48,135,.12)"},
  {id:"m10",n:"M10",num:"+994 10 313 69 41",holder:"M10 hesab nömrəsi",c:"#00B4D8",bg:"rgba(0,180,216,.12)"},
];

// ===== HELPERS =====
const nav=(goTo,pg,opts={})=>{
  goTo(pg,opts);
  window.scrollTo({top:0,behavior:"smooth"});
};

function Btn({children,style={},onClick,variant="primary",...rest}){
  const [h,sh]=useState(false);
  const base={padding:"11px 22px",borderRadius:11,border:"none",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all .18s",...style};
  const variants={
    primary:{background:h?"#6d28d9":`linear-gradient(135deg,${ACC},#5b21b6)`,color:"#fff",boxShadow:h?"0 0 24px rgba(124,58,237,.5)":"0 0 16px rgba(124,58,237,.3)"},
    ghost:{background:h?"rgba(255,255,255,.07)":"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:T1},
    danger:{background:h?"#b91c1c":"#dc2626",color:"#fff"},
  };
  return <button style={{...base,...variants[variant]}} onClick={onClick} onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)} {...rest}>{children}</button>;
}

function Input({label,type="text",value,onChange,placeholder="",hint=""}){
  return(
    <div style={{marginBottom:18}}>
      {label&&<label style={{display:"block",fontSize:12,fontWeight:600,color:T2,marginBottom:6,letterSpacing:".3px"}}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{width:"100%",background:CARD2,border:`1px solid ${BD}`,borderRadius:10,padding:"11px 14px",color:T1,fontSize:14}}/>
      {hint&&<p style={{fontSize:11,color:T3,marginTop:4}}>{hint}</p>}
    </div>
  );
}

function Notif({n}){
  if(!n) return null;
  const colors={success:"#10b981",error:"#ef4444",info:ACC};
  return(
    <div className="fi" style={{position:"fixed",top:80,right:20,zIndex:9999,background:CARD,border:`1px solid ${colors[n.type]||colors.info}40`,borderLeft:`3px solid ${colors[n.type]||colors.info}`,borderRadius:12,padding:"14px 20px",maxWidth:340,boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}>
      <p style={{color:T1,fontSize:14,fontWeight:500}}>{n.msg}</p>
    </div>
  );
}

function Tag({text,color}){
  return <span style={{fontSize:9,fontWeight:700,color,background:`${color}18`,border:`1px solid ${color}35`,borderRadius:20,padding:"3px 8px",textTransform:"uppercase",letterSpacing:".6px",whiteSpace:"nowrap"}}>{text}</span>;
}

// ===== NAVBAR =====
function Navbar({page,goTo,user}){
  const [sc,setSc]=useState(false);
  useEffect(()=>{const h=()=>setSc(window.scrollY>20);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);
  const link=(pg,label)=>{
    const [h,sh]=useState(false);
    return <span key={pg} onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)} onClick={()=>nav(goTo,pg)} style={{color:page===pg?"#a78bfa":h?T1:T2,fontSize:14,cursor:"pointer",padding:"6px 12px",borderRadius:8,transition:"color .2s"}}>{label}</span>;
  };
  return(
    <nav style={{position:"sticky",top:0,zIndex:200,backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",background:sc?"rgba(7,7,15,.95)":"rgba(7,7,15,.8)",borderBottom:`1px solid ${BD}`,padding:"0 32px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>nav(goTo,"home")}>
        <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${ACC},#4f46e5)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900,color:"#fff"}}>P</div>
        <span style={{fontWeight:800,fontSize:17,letterSpacing:"-.4px",color:T1}}>Premium <span style={{color:ACC2}}>Shop</span></span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        {link("home","Ana Səhifə")}
        {link("shop","Məhsullar")}
        {user?(
          <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:8}}>
            <span onClick={()=>nav(goTo,"dashboard")} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",background:CARD,border:`1px solid ${BD}`,borderRadius:10,padding:"7px 14px"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:`linear-gradient(135deg,${ACC},#4f46e5)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>{user.name?user.name[0].toUpperCase():"U"}</div>
              <span style={{fontSize:13,color:T1,fontWeight:500}}>{user.name||user.email.split("@")[0]}</span>
            </span>
          </div>
        ):(
          <div style={{display:"flex",gap:8,marginLeft:8}}>
            <Btn variant="ghost" style={{padding:"7px 16px",fontSize:13}} onClick={()=>nav(goTo,"auth")}>Giriş</Btn>
            <Btn style={{padding:"7px 16px",fontSize:13}} onClick={()=>{goTo("auth",{authMode:"register"});window.scrollTo({top:0});}}>Qeydiyyat</Btn>
          </div>
        )}
      </div>
    </nav>
  );
}

// ===== FOOTER =====
function Footer({goTo}){
  return(
    <footer style={{borderTop:`1px solid ${BD}`,padding:"48px 32px 28px",marginTop:80}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:40}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
            <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${ACC},#4f46e5)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#fff",fontSize:14}}>P</div>
            <span style={{fontWeight:800,fontSize:15,color:T1}}>Premium <span style={{color:ACC2}}>Shop</span></span>
          </div>
          <p style={{color:T3,fontSize:13,lineHeight:1.7,maxWidth:280}}>Azərbaycanda rəqəmsal abunəliklərin ən etibarlı ünvanı. Sürətli çatdırılma, keyfiyyət zəmanəti.</p>
          <p style={{color:T4,fontSize:12,marginTop:16}}>© 2025 PremiumShop · premiumshopaz.com</p>
        </div>
        <div>
          <p style={{fontWeight:700,fontSize:13,color:T2,marginBottom:14,textTransform:"uppercase",letterSpacing:".5px"}}>Kateqoriyalar</p>
          {["Əyləncə","AI & Süni İntellekt","Dizayn & Video","VPN & Antivirus","Sosial & Biznes","Produktivlik"].map(l=>(
            <p key={l} onClick={()=>nav(goTo,"shop")} style={{color:T3,fontSize:13,marginBottom:8,cursor:"pointer"}}>{l}</p>
          ))}
        </div>
        <div>
          <p style={{fontWeight:700,fontSize:13,color:T2,marginBottom:14,textTransform:"uppercase",letterSpacing:".5px"}}>Əlaqə</p>
          <p style={{color:T3,fontSize:13,marginBottom:8}}>WhatsApp: +994 10 313 69 41</p>
          <p style={{color:T3,fontSize:13,marginBottom:8}}>12 saat ərzində çatdırılma</p>
          <p style={{color:T3,fontSize:13}}>7/24 dəstək xidməti</p>
          <a href="https://wa.me/994103136941" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:16,background:"rgba(37,211,102,.12)",border:"1px solid rgba(37,211,102,.25)",borderRadius:10,padding:"8px 16px",color:"#25D366",fontSize:13,fontWeight:600}}>
            WhatsApp ilə Yazın
          </a>
        </div>
      </div>
    </footer>
  );
}

// ===== WA BUTTON =====
function WaBtn(){
  const [h,sh]=useState(false);
  return(
    <a href="https://wa.me/994103136941" target="_blank" rel="noopener noreferrer" className="wa-pulse"
      style={{position:"fixed",bottom:24,right:24,zIndex:999,width:56,height:56,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:h?"0 8px 32px rgba(37,211,102,.6)":"0 4px 20px rgba(37,211,102,.35)",transform:h?"scale(1.12)":"scale(1)",transition:"all .2s"}}
      onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)} title="Dəstək Xidməti - WhatsApp">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
  );
}

// ===== SERVICE CARD =====
function SvcCard({svc,goTo,mini=false}){
  const [h,sh]=useState(false);
  const [plan,setPlan]=useState(0);
  const [bh,sbh]=useState(false);
  return(
    <div onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)}
      style={{background:CARD,border:`1px solid ${h?svc.c+"40":BD}`,borderRadius:18,padding:mini?18:22,position:"relative",overflow:"hidden",transition:"all .25s",transform:h?"translateY(-5px)":"translateY(0)",boxShadow:h?`0 20px 50px ${svc.g}`:"none"}}>
      <div style={{position:"absolute",top:-35,right:-25,width:120,height:120,borderRadius:"50%",background:`radial-gradient(circle,${svc.g} 0%,transparent 70%)`,opacity:h?1:.4,transition:"opacity .25s",pointerEvents:"none"}}/>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:11,background:`${svc.c}18`,border:`1px solid ${svc.c}45`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:svc.c,letterSpacing:"-.2px"}}>{svc.s}</div>
          <div>
            <p style={{fontWeight:700,fontSize:14,color:T1}}>{svc.n}</p>
            <p style={{color:T3,fontSize:10,marginTop:1}}>{svc.d}</p>
          </div>
        </div>
        {svc.b&&<Tag text={svc.b} color={svc.c}/>}
      </div>
      {!mini&&(
        <div style={{display:"flex",gap:3,marginBottom:16,background:"rgba(255,255,255,.03)",borderRadius:9,padding:3}}>
          {svc.pl.map((p,i)=>(
            <button key={i} onClick={()=>setPlan(i)} style={{flex:1,padding:"6px 0",borderRadius:7,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",transition:"all .15s",background:plan===i?svc.c:"transparent",color:plan===i?"#fff":T3}}>{p.l}</button>
          ))}
        </div>
      )}
      <div style={{marginBottom:14}}>
        <span style={{fontSize:mini?26:32,fontWeight:800,color:svc.c,lineHeight:1}}>{svc.pl[mini?0:plan].p}</span>
        <span style={{color:T2,fontSize:14,marginLeft:3}}>AZN</span>
        <span style={{color:T3,fontSize:11,display:"block",marginTop:2}}>/ {svc.pl[mini?0:plan].l.toLowerCase()} · {svc.sold.toLocaleString()} satılıb</span>
      </div>
      <button onMouseEnter={()=>sbh(true)} onMouseLeave={()=>sbh(false)}
        onClick={()=>nav(goTo,"product",{productId:svc.id,planIdx:plan})}
        style={{width:"100%",padding:"10px",borderRadius:10,border:`1px solid ${bh?svc.c:svc.c+"50"}`,background:bh?svc.c:`${svc.c}15`,color:bh?"#fff":svc.c,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .18s"}}>
        Sifariş et →
      </button>
    </div>
  );
}

// ===== HOME PAGE =====
function HomePage({goTo}){
  const brands=["Netflix","Spotify","YouTube","Disney+","Adobe","ChatGPT","Canva","NordVPN","LinkedIn","Microsoft","Figma","Midjourney","AutoCAD","Grammarly","CapCut","Zoom","Notion","Dropbox"];
  const featured=SVCS.filter(s=>s.hot);
  return(
    <div style={{minHeight:"100vh"}}>
      {/* Hero */}
      <section style={{position:"relative",padding:"90px 24px 70px",textAlign:"center",maxWidth:780,margin:"0 auto",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
          <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",top:-150,left:"50%",transform:"translateX(-50%)",background:`radial-gradient(circle,rgba(124,58,237,.14) 0%,transparent 70%)`,filter:"blur(60px)"}}/>
        </div>
        <div className="fiu" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.22)",borderRadius:24,padding:"6px 18px",fontSize:12,color:"#c4b5fd",marginBottom:28,fontWeight:500}}>
          ⚡ Sifarişlər 12 saat ərzində çatdırılır
        </div>
        <h1 className="fiu1" style={{fontSize:"clamp(34px,5.5vw,58px)",fontWeight:900,lineHeight:1.07,letterSpacing:"-1.8px",marginBottom:20,background:"linear-gradient(135deg,#fff 30%,#a78bfa 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
          Rəqəmsal Abunəliklər<br/>Ən Ucuz Qiymətə
        </h1>
        <p className="fiu2" style={{color:T2,fontSize:17,lineHeight:1.75,marginBottom:38,maxWidth:480,margin:"0 auto 38px"}}>
          Netflix, Spotify, ChatGPT Plus, Adobe, NordVPN və 30+ digər platforma. Etibarlı xidmət, sürətli çatdırılma.
        </p>
        <div className="fiu3" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn onClick={()=>{const el=document.getElementById("featured");el&&el.scrollIntoView({behavior:"smooth"});}}>
            Abunəliklərə Bax ↓
          </Btn>
          <Btn variant="ghost" onClick={()=>nav(goTo,"shop")}>Bütün Məhsullar →</Btn>
        </div>
        <div className="fiu4" style={{display:"flex",gap:40,justifyContent:"center",marginTop:60,flexWrap:"wrap"}}>
          {[["1000+","Müştəri"],["12s","Çatdırılma"],["38+","Məhsul"],["7/24","Dəstək"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <p style={{fontSize:26,fontWeight:800,color:ACC2,letterSpacing:"-.5px"}}>{n}</p>
              <p style={{fontSize:11,color:T3,marginTop:2,fontWeight:500}}>{l}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Brand marquee */}
      <div style={{borderTop:`1px solid ${BD}`,borderBottom:`1px solid ${BD}`,padding:"18px 0",overflow:"hidden",marginBottom:64}}>
        <div className="mq-wrap">
          <div className="mq-track">
            {[...brands,...brands].map((b,i)=>(
              <span key={i} style={{display:"inline-block",color:T3,fontSize:13,fontWeight:600,padding:"0 28px",borderRight:`1px solid ${BD}`}}>{b}</span>
            ))}
          </div>
        </div>
      </div>
      {/* Categories */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"0 24px 64px"}}>
        <h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.8px",textAlign:"center",marginBottom:10,color:T1}}>Kateqoriyalar</h2>
        <p style={{color:T3,textAlign:"center",marginBottom:36}}>İstədiyiniz kateqoriyanı seçin</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12}}>
          {CATS.filter(c=>c.id!=="all").map(c=>{
            const count=SVCS.filter(s=>s.cat===c.id).length;
            const [h,sh]=useState(false);
            return(
              <div key={c.id} onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)}
                onClick={()=>nav(goTo,"shop",{cat:c.id})}
                style={{background:h?`rgba(124,58,237,.12)`:CARD,border:`1px solid ${h?ACC+"40":BD}`,borderRadius:14,padding:"18px 16px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
                <div style={{fontSize:26,marginBottom:8}}>{c.icon}</div>
                <p style={{fontSize:13,fontWeight:600,color:T1,marginBottom:4}}>{c.label}</p>
                <p style={{fontSize:11,color:T3}}>{count} məhsul</p>
              </div>
            );
          })}
        </div>
      </section>
      {/* Featured */}
      <section id="featured" style={{maxWidth:1100,margin:"0 auto",padding:"0 24px 64px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:36}}>
          <div>
            <h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.8px",color:T1}}>Ən Çox Satılanlar</h2>
            <p style={{color:T3,marginTop:4}}>Müştərilərin sevimli seçimləri</p>
          </div>
          <Btn variant="ghost" onClick={()=>nav(goTo,"shop")} style={{fontSize:13}}>Hamısına Bax →</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
          {featured.map(s=><SvcCard key={s.id} svc={s} goTo={goTo}/>)}
        </div>
      </section>
      {/* How it works */}
      <section style={{maxWidth:760,margin:"0 auto",padding:"0 24px 64px"}}>
        <h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.8px",textAlign:"center",marginBottom:8,color:T1}}>Necə işləyir?</h2>
        <p style={{color:T3,textAlign:"center",marginBottom:40}}>4 addımda abunəliyinizi alın</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {n:"01",t:"Qeydiyyat & Giriş",d:"E-poçt ünvanınızla qeydiyyatdan keçin. Emailinizə doğrulama kodu göndərilir.",c:ACC},
            {n:"02",t:"Məhsul seç",d:"İstədiyiniz platformanı və plan müddətini seçib «Sifariş et» düyməsinə basın.",c:"#5b21b6"},
            {n:"03",t:"Ödəniş et & Çek yüklə",d:"ABB, LEO, Kapital Bank və ya M10 vasitəsilə ödəniş edin. Ödəniş çekini sayta yükləyin.",c:"#4c1d95"},
            {n:"04",t:"Hesabı alın",d:"Ödəniş təsdiqlənəndən sonra 12 saat ərzində hesab məlumatları panelinizdə görünür.",c:"#3730a3"},
          ].map((st,i)=>(
            <div key={i} style={{display:"flex",gap:18,background:"rgba(255,255,255,.02)",border:`1px solid ${BD}`,borderRadius:15,padding:"22px 26px",alignItems:"flex-start"}}>
              <div style={{minWidth:50,height:50,borderRadius:13,background:`${st.c}18`,border:`1px solid ${st.c}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:st.c,letterSpacing:"1px"}}>{st.n}</div>
              <div>
                <p style={{fontWeight:700,fontSize:16,color:T1,marginBottom:6}}>{st.t}</p>
                <p style={{color:T3,fontSize:13,lineHeight:1.65}}>{st.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Payment methods */}
      <section style={{maxWidth:860,margin:"0 auto",padding:"0 24px 64px"}}>
        <h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-.8px",textAlign:"center",marginBottom:8,color:T1}}>Ödəniş Üsulları</h2>
        <p style={{color:T3,textAlign:"center",marginBottom:36}}>İstədiyiniz bankla ödəniş edə bilərsiniz</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
          {PAYS.map(p=>(
            <div key={p.id} style={{background:p.bg,border:`1px solid ${p.c}30`,borderRadius:14,padding:"18px 16px",textAlign:"center"}}>
              <div style={{width:40,height:40,borderRadius:10,background:p.c,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontWeight:800,color:"#fff",fontSize:11}}>{p.n.split(" ")[0].toUpperCase().slice(0,3)}</div>
              <p style={{fontWeight:700,fontSize:13,color:T1}}>{p.n}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:20,background:CARD,border:`1px solid ${BD}`,borderRadius:14,padding:"18px 22px",textAlign:"center"}}>
          <p style={{color:T2,fontSize:14}}>⏱️ Sifarişlər <strong style={{color:T1}}>12 saat</strong> ərzində çatdırılır · 24 saatı keçərsə <strong style={{color:"#10b981"}}>geri ödəmə</strong> zəmanəti</p>
        </div>
      </section>
      {/* Trust */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"0 24px 80px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {[
          {i:"🔒",t:"Etibarlı ödəniş",d:"Ödəniş çeki yükləyin, biz yoxlayırıq. Heç bir risk yoxdur."},
          {i:"⚡",t:"12 saat çatdırılma",d:"Onay verildikdən sonra 12 saat içində hesabınız hazırdır."},
          {i:"💬",t:"7/24 Dəstək",d:"WhatsApp vasitəsilə hər an bizimlə əlaqə saxlaya bilərsiniz."},
          {i:"🔄",t:"Geri ödəmə zəmanəti",d:"24 saat ərzində çatdırılmazsa tam geri ödəmə edilir."},
        ].map((it,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.02)",border:`1px solid ${BD}`,borderRadius:15,padding:"20px 22px"}}>
            <div style={{fontSize:22,marginBottom:9}}>{it.i}</div>
            <p style={{fontWeight:700,fontSize:13,color:T1,marginBottom:5}}>{it.t}</p>
            <p style={{color:T3,fontSize:12,lineHeight:1.6}}>{it.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

// ===== SHOP PAGE (Completed from cut-off point) =====
function ShopPage({goTo,initCat="all"}){
  const [cat,setCat]=useState(initCat);
  const [q,setQ]=useState("");
  const filtered=SVCS.filter(s=>(cat==="all"||s.cat===cat)&&(s.n.toLowerCase().includes(q.toLowerCase())||s.d.toLowerCase().includes(q.toLowerCase())));
  
  return(
    <div style={{maxWidth:1140,margin:"0 auto",padding:"40px 24px 80px"}}>
      <div className="fiu" style={{marginBottom:36}}>
        <h1 style={{fontSize:30,fontWeight:800,letterSpacing:"-.8px",color:T1,marginBottom:8}}>Bütün Məhsullar</h1>
        <p style={{color:T3}}>38 rəqəmsal abunəlik — ən ucuz qiymətlə</p>
      </div>
      {/* Search */}
      <div style={{position:"relative",marginBottom:24}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:T3,fontSize:16}}>🔍</span>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Məhsul axtar... (Netflix, Canva, VPN...)"
          style={{width:"100%",background:CARD,border:`1px solid ${BD}`,borderRadius:12,padding:"12px 14px 12px 42px",color:T1,fontSize:14}}/>
      </div>
      {/* Category tabs */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:32,borderBottom:`1px solid ${BD}`,paddingBottom:20}}>
        {CATS.map(c=>{
          const cnt=c.id==="all"?SVCS.length:SVCS.filter(s=>s.cat===c.id).length;
          return(
            <button key={c.id} onClick={()=>setCat(c.id)}
              style={{padding:"7px 16px",borderRadius:20,border:`1px solid ${cat===c.id?ACC+"60":BD}`,background:cat===c.id?`${ACC}20`:"transparent",color:cat===c.id?ACC2:T2,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
              {c.label} ({cnt})
            </button>
          );
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {filtered.map(s=><SvcCard key={s.id} svc={s} goTo={goTo}/>)}
        {filtered.length===0 && <p style={{color:T3,textAlign:"center",gridColumn:"1/-1",padding:40}}>Məhsul tapılmadı.</p>}
      </div>
    </div>
  );
}

// ===== MISSING PAGES ADDED =====

function ProductPage({goTo, params, showNotif}) {
  const svc = SVCS.find(s => s.id === params?.productId) || SVCS[0];
  const [plan, setPlan] = useState(params?.planIdx || 0);

  return (
    <div style={{padding:"60px 24px", maxWidth:600, margin:"0 auto", minHeight:"70vh"}}>
      <Btn variant="ghost" onClick={() => nav(goTo, "shop")} style={{marginBottom: 20}}>← Geri</Btn>
      <div style={{background:CARD, border:`1px solid ${BD}`, borderRadius: 18, padding: 30}}>
        <div style={{display:"flex", alignItems:"center", gap:16, marginBottom:24}}>
          <div style={{width:50,height:50,borderRadius:14,background:`${svc.c}18`,border:`1px solid ${svc.c}45`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:svc.c}}>{svc.s}</div>
          <div>
            <h1 style={{color:T1, fontSize:22, fontWeight: 700}}>{svc.n}</h1>
            <p style={{color:T3, fontSize: 13, marginTop: 4}}>{svc.d}</p>
          </div>
        </div>

        <div style={{marginBottom: 24}}>
          <p style={{color:T2, fontSize: 13, fontWeight: 600, marginBottom: 12}}>Plan seçin:</p>
          <div style={{display: "flex", gap: 10, flexWrap: "wrap"}}>
             {svc.pl.map((p,i) => (
                <button key={i} onClick={()=>setPlan(i)} style={{padding:"10px 16px", borderRadius:10, border:`1px solid ${plan===i?svc.c:BD}`, background:plan===i?`${svc.c}20`:CARD2, color:plan===i?svc.c:T2, fontWeight: 600, cursor:"pointer", transition: "all .2s"}}>
                  {p.l} - {p.p} ₼
                </button>
             ))}
          </div>
        </div>

        <Btn onClick={() => {
          showNotif("Sifarişiniz qəbul edildi! 12 saat ərzində təsdiqlənəcək.", "success");
          nav(goTo, "dashboard");
        }} style={{width: "100%", padding: 14, fontSize: 15}}>Sifarişi Təsdiqlə - {svc.pl[plan].p} AZN</Btn>
      </div>
    </div>
  );
}

function AuthPage({goTo, setUser, showNotif}) {
  return (
    <div style={{padding:"80px 24px", maxWidth:400, margin:"0 auto", minHeight:"70vh"}}>
      <h1 style={{color:T1, fontSize:28, fontWeight: 800, marginBottom:8, textAlign: "center"}}>Giriş</h1>
      <p style={{color:T3, textAlign: "center", marginBottom:30}}>Hesabınıza daxil olun və ya qeydiyyatdan keçin</p>
      
      <div style={{background:CARD, border:`1px solid ${BD}`, borderRadius: 18, padding: 24}}>
        <Input label="Email" placeholder="admin@premium.az" />
        <Input label="Şifrə" type="password" placeholder="••••••••" />
        
        <Btn onClick={() => { 
          setUser({name: "Müştəri", email: "admin@premium.az"}); 
          showNotif("Uğurla giriş etdiniz", "success"); 
          nav(goTo, "home"); 
        }} style={{width: "100%", marginTop: 10}}>Daxil ol</Btn>
      </div>
    </div>
  );
}

function DashboardPage({goTo, user, setUser}) {
  if(!user) {
    return <div style={{color:T1, padding:100, textAlign:"center"}}>Zəhmət olmasa giriş edin.</div>;
  }
  
  return (
    <div style={{padding:"60px 24px", maxWidth:800, margin:"0 auto", minHeight:"70vh"}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30}}>
        <div>
          <h1 style={{color:T1, fontSize:26, fontWeight: 800, marginBottom:4}}>Xoş gəldiniz, {user.name}</h1>
          <p style={{color:T3}}>Aktiv abunəlikləriniz və sifariş tarixçəniz</p>
        </div>
        <Btn onClick={() => { setUser(null); nav(goTo, "home"); }} variant="danger">Çıxış et</Btn>
      </div>
      
      <div style={{background:CARD, border:`1px solid ${BD}`, borderRadius: 18, padding: 40, textAlign: "center"}}>
        <p style={{color:T3}}>Hələ heç bir sifarişiniz yoxdur.</p>
        <Btn onClick={() => nav(goTo, "shop")} style={{marginTop: 16}}>Mağazaya Keç</Btn>
      </div>
    </div>
  );
}

// ===== MAIN APP COMPONENT (Router) =====
export default function App() {
  const [page, setPage] = useState("home");
  const [params, setParams] = useState({});
  const [user, setUser] = useState(null);
  const [notif, setNotif] = useState(null);

  const goTo = (pg, p = {}) => {
    setPage(pg);
    setParams(p);
  };

  const showNotif = (msg, type="success") => {
    setNotif({msg, type});
    setTimeout(() => setNotif(null), 3500);
  };

  return (
    <>
      <style>{CSS}</style>
      <Navbar page={page} goTo={goTo} user={user} />
      <Notif n={notif} />
      
      {/* Məzmun Dəyişimi (Routing) */}
      {page === "home" && <HomePage goTo={goTo} />}
      {page === "shop" && <ShopPage goTo={goTo} initCat={params?.cat || "all"} />}
      {page === "product" && <ProductPage goTo={goTo} params={params} showNotif={showNotif} />}
      {page === "auth" && <AuthPage goTo={goTo} setUser={setUser} showNotif={showNotif} />}
      {page === "dashboard" && <DashboardPage goTo={goTo} user={user} setUser={setUser} />}
      
      <WaBtn />
      <Footer goTo={goTo} />
    </>
  );
}
