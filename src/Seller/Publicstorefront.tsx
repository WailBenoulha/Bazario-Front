import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  FiSmartphone, FiMonitor, FiTablet, FiHeadphones, FiCamera, FiTv, FiCpu, FiPrinter,
  FiShoppingBag, FiWatch, FiSunrise, FiStar,
  FiPackage, FiArchive, FiBox, FiGift, FiShoppingCart,
  FiHome, FiTool, FiZap, FiMusic, FiBook, FiBookOpen,
  FiHeart, FiActivity, FiAward, FiTrendingUp,
  FiCoffee, FiDroplet, FiFeather, FiLayers,
  FiGrid, FiTag, FiSliders, FiServer
} from "react-icons/fi";
import {
  MdSportsSoccer, MdSportsBasketball, MdOutlineFaceRetouchingNatural,
  MdOutlineLocalGroceryStore, MdOutlineChildCare, MdOutlinePets,
  MdOutlineDirectionsCar, MdOutlineHealthAndSafety, MdOutlineDesktopWindows
} from "react-icons/md";
import { GiRunningShoe, GiDress, GiJewelCrown, GiLipstick, GiSofa, GiPlantRoots } from "react-icons/gi";

const ICON_MAP: Record<string, React.ComponentType<{size?:number;color?:string}>> = {
  FiSmartphone,FiMonitor,FiTablet,FiHeadphones,FiCamera,FiTv,FiCpu,FiPrinter,MdOutlineDesktopWindows,
  FiShoppingBag,FiWatch,GiRunningShoe,GiDress,GiJewelCrown,
  GiLipstick,MdOutlineFaceRetouchingNatural,MdOutlineHealthAndSafety,FiDroplet,FiFeather,
  MdSportsSoccer,MdSportsBasketball,FiActivity,FiAward,
  FiCoffee,MdOutlineLocalGroceryStore,
  FiHome,GiSofa,FiTool,GiPlantRoots,
  MdOutlineChildCare,MdOutlinePets,
  MdOutlineDirectionsCar,
  FiBook,FiBookOpen,FiMusic,
  FiPackage,FiArchive,FiBox,FiGift,FiShoppingCart,FiStar,FiSunrise,
  FiHeart,FiTrendingUp,FiZap,FiGrid,FiTag,FiSliders,FiServer,FiLayers,
};
const CatIcon=({k,size=16,color}:{k?:string;size?:number;color?:string})=>{
  const C=k?ICON_MAP[k]:FiPackage;
  return C?<C size={size} color={color}/>:<FiPackage size={size} color={color}/>;
};

const API_URL = "http://127.0.0.1:8000/api";

/* ── Types ── */
interface StoreData { id:number;name:string;slug:string;niche:string;description:string;accent_color:string;button_style:string;panel_style:string;logo?:string;logo_url?:string;is_live:boolean; }
interface ProductImage { id:number;image_url:string;is_primary:boolean;order:number; }
interface ProductColor  { id:number;name:string;hex:string; }
interface ProductSize   { id:number;label:string;stock:number; }
interface StoreCategory { id:number;name:string;icon?:string;description?:string;order:number; }
interface Product { id:number;name:string;description:string;price:number;stock:number;image?:string;image_url?:string;images?:ProductImage[];sizes?:ProductSize[];colors?:ProductColor[];material?:string;weight?:string;brand?:string;categories?:number[];category_names?:string[]; }
interface CartItem extends Product { qty:number;selectedSize?:string;selectedColor?:string; }

const NICHE_LABEL:Record<string,string>={fashion:"Fashion",electronics:"Electronics",cosmetics:"Beauty & Cosmetics",food:"Food & Drink",accessories:"Accessories",sports:"Sports & Fitness",education:"Education",other:"Store"};
const NICHE_EMOJI:Record<string,string>={fashion:"👗",electronics:"⚡",cosmetics:"💄",food:"🍽️",accessories:"💍",sports:"🏆",education:"📚",other:"✦"};

/* ── hex → rgb ── */
const toRgb=(hex:string)=>{const c=(hex||"#E87722").replace("#","");return{r:parseInt(c.slice(0,2),16)||232,g:parseInt(c.slice(2,4),16)||119,b:parseInt(c.slice(4,6),16)||34};};

/* ── Button factory ── */
const getBtnStyle=(s:string,ac:string,ok=true):React.CSSProperties=>{
  const r=({soft:"10px",rounded:"999px",sharp:"2px",pill:"999px",ghost:"10px",elevated:"10px"} as any)[s]??"10px";
  if(!ok)return{borderRadius:r,opacity:.35,cursor:"not-allowed",background:isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)",color:"currentColor"};
  if(s==="ghost")return{borderRadius:r,background:"transparent",border:`1.5px solid ${ac}`,color:ac};
  return{borderRadius:r,background:`linear-gradient(135deg,${ac} 0%,${ac}cc 100%)`,color:"#fff",boxShadow:`0 8px 28px ${ac}55`};
};
let isDark=true; // will be updated in component

/* ── Hooks ── */
function useReveal(delay=0){
  const ref=useRef<HTMLDivElement>(null);const[vis,setVis]=useState(false);
  useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setTimeout(()=>setVis(true),delay);o.disconnect();}},{threshold:.05});o.observe(el);return()=>o.disconnect();},[delay]);
  return{ref,vis};
}
function useMouse(){
  const[m,setM]=useState({x:.5,y:.5});
  useEffect(()=>{const h=(e:MouseEvent)=>setM({x:e.clientX/window.innerWidth,y:e.clientY/window.innerHeight});window.addEventListener("mousemove",h,{passive:true});return()=>window.removeEventListener("mousemove",h);},[]);
  return m;
}
function useScroll(){const[s,setS]=useState(0);useEffect(()=>{const h=()=>setS(window.scrollY);window.addEventListener("scroll",h,{passive:true});return()=>window.removeEventListener("scroll",h);},[]);return s;}

/* ════════════════════════════════════════════════
   LUXURY CANVAS — orbs + noise + particle web
════════════════════════════════════════════════ */
const LuxuryCanvas=({ac,mouse}:{ac:string;mouse:{x:number;y:number}})=>{
  const cv=useRef<HTMLCanvasElement>(null);
  const raf=useRef(0);
  const mRef=useRef(mouse);
  useEffect(()=>{mRef.current=mouse;},[mouse]);

  useEffect(()=>{
    const c=cv.current;if(!c)return;
    const ctx=c.getContext("2d");if(!ctx)return;
    const resize=()=>{c.width=c.offsetWidth;c.height=c.offsetHeight;};
    resize();const ro=new ResizeObserver(resize);ro.observe(c);
    const rgb=toRgb(ac);
    const R=(r:number,g:number,b:number,a:number)=>`rgba(${r},${g},${b},${a})`;
    const rc=R.bind(null,rgb.r,rgb.g,rgb.b);

    /* Orbs */
    type Orb={x:number;y:number;r:number;vx:number;vy:number;phase:number;pv:number};
    const orbs:Orb[]=Array.from({length:6},(_,i)=>({
      x:Math.random()*2000,y:Math.random()*1000,
      r:180+i*60,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.14,
      phase:Math.random()*Math.PI*2,pv:.004+Math.random()*.003,
    }));

    /* Web particles */
    type P={x:number;y:number;vx:number;vy:number;r:number;op:number;rot:number;rv:number;pulse:number;pv:number;kind:number};
    const pts:P[]=Array.from({length:48},()=>({
      x:Math.random()*3000,y:Math.random()*1200,
      vx:(Math.random()-.5)*.38,vy:(Math.random()-.5)*.28,
      r:Math.random()*42+5,op:Math.random()*.15+.02,
      rot:Math.random()*Math.PI*2,rv:(Math.random()-.5)*.005,
      pulse:Math.random()*Math.PI*2,pv:.012+Math.random()*.016,
      kind:Math.floor(Math.random()*6),
    }));

    const hex6=(x:number,y:number,r:number)=>{ctx.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));}ctx.closePath();};
    const star5=(x:number,y:number,r:number)=>{ctx.beginPath();for(let i=0;i<10;i++){const a=Math.PI/5*i-Math.PI/2;const rr=i%2?r*.38:r;ctx.lineTo(x+rr*Math.cos(a),y+rr*Math.sin(a));}ctx.closePath();};
    const tri=(x:number,y:number,r:number)=>{ctx.beginPath();for(let i=0;i<3;i++){const a=Math.PI*2/3*i-Math.PI/2;ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));}ctx.closePath();};
    const cross=(x:number,y:number,r:number)=>{const t=r*.25;ctx.beginPath();ctx.rect(-t,-r,t*2,r*2);ctx.rect(-r,-t,r*2,t*2);};

    let t=0;
    const draw=()=>{
      t+=.006;
      const{width:W,height:H}=c;
      ctx.clearRect(0,0,W,H);
      const mx=mRef.current.x*W,my=mRef.current.y*H;

      /* soft orbs */
      for(const o of orbs){
        o.x+=o.vx+(mx/W-.5)*.4;o.y+=o.vy+(my/H-.5)*.3;
        o.phase+=o.pv;
        if(o.x<-o.r)o.x=W+o.r;if(o.x>W+o.r)o.x=-o.r;
        if(o.y<-o.r)o.y=H+o.r;if(o.y>H+o.r)o.y=-o.r;
        const pulse=1+Math.sin(o.phase)*.12;
        const gr=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r*pulse);
        gr.addColorStop(0,rc(.07));
        gr.addColorStop(.5,rc(.028));
        gr.addColorStop(1,rc(0));
        ctx.beginPath();ctx.arc(o.x,o.y,o.r*pulse,0,Math.PI*2);
        ctx.fillStyle=gr;ctx.fill();
      }

      /* web particles */
      for(const p of pts){
        p.x+=p.vx;p.y+=p.vy;p.rot+=p.rv;p.pulse+=p.pv;
        if(p.x<-120)p.x=W+120;if(p.x>W+120)p.x=-120;
        if(p.y<-120)p.y=H+120;if(p.y>H+120)p.y=-120;
        const ps=1+Math.sin(p.pulse)*.13;
        const al=p.op*(0.7+Math.sin(p.pulse*.7)*.3);
        const r=p.r*ps;
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=al;
        ctx.strokeStyle=rc(.75);ctx.fillStyle=rc(.04);
        switch(p.kind){
          case 0:ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.lineWidth=1.2;ctx.stroke();ctx.fill();break;
          case 1:ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.lineWidth=1.8;ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.55,0,Math.PI*2);ctx.lineWidth=.7;ctx.stroke();break;
          case 2:hex6(0,0,r);ctx.lineWidth=1.3;ctx.stroke();ctx.fill();break;
          case 3:star5(0,0,r);ctx.lineWidth=1.1;ctx.stroke();ctx.fill();break;
          case 4:tri(0,0,r);ctx.lineWidth=1.3;ctx.stroke();ctx.fill();break;
          default:cross(0,0,r);ctx.lineWidth=1.1;ctx.stroke();break;
        }
        ctx.restore();
      }

      /* connector web */
      for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<190){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=rc((1-d/190)*.055);ctx.lineWidth=1;ctx.stroke();}
      }

      /* mouse attraction lines */
      for(const p of pts){
        const dx=p.x-mx,dy=p.y-my,d=Math.sqrt(dx*dx+dy*dy);
        if(d<160){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mx,my);ctx.strokeStyle=rc((1-d/160)*.12);ctx.lineWidth=1;ctx.stroke();}
      }

      /* scanning line */
      const scanY=((t*.3)%1)*H;
      const gr=ctx.createLinearGradient(0,scanY-40,0,scanY+40);
      gr.addColorStop(0,rc(0));gr.addColorStop(.5,rc(.04));gr.addColorStop(1,rc(0));
      ctx.fillStyle=gr;ctx.fillRect(0,scanY-40,W,80);

      raf.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf.current);ro.disconnect();};
  },[ac]);

  return <canvas ref={cv} className="absolute inset-0 w-full h-full pointer-events-none"/>;
};

/* ════════════════════════════════════════════════
   PRODUCT DETAIL MODAL
════════════════════════════════════════════════ */
const ProductDetailModal=({product,ac,btnStyle,dark,onClose,onAdd}:{
  product:Product;ac:string;btnStyle:string;dark:boolean;
  onClose:()=>void;onAdd:(p:Product,sz?:string,cl?:string)=>void;
})=>{
  const[img,setImg]=useState(0);
  const[sz,setSz]=useState<string|null>(null);
  const[cl,setCl]=useState<string|null>(null);
  const[done,setDone]=useState(false);
  const rgb=toRgb(ac);

  const imgs:string[]=[];
  if(product.images?.length){[...product.images].sort((a,b)=>(b.is_primary?1:0)-(a.is_primary?1:0)||(a.order-b.order)).forEach(i=>imgs.push(i.image_url));}
  else if(product.image_url)imgs.push(product.image_url);

  const hasSz=!!(product.sizes?.length);const hasCl=!!(product.colors?.length);
  const oos=product.stock===0;
  const szObj=hasSz?product.sizes!.find(s=>s.label===sz):null;
  const szOos=szObj?.stock===0;
  const canAdd=!oos&&!szOos&&(!hasSz||sz!==null);
  const bg=dark?"#0a0a0a":"#fff";
  const text=dark?"#f5f5f5":"#111";
  const sub=dark?"rgba(255,255,255,.48)":"#888";
  const surf=dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)";
  const bord=dark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)";

  useEffect(()=>{document.body.style.overflow="hidden";return()=>{document.body.style.overflow="";};},[]);

  const handleAdd=()=>{if(!canAdd)return;onAdd(product,sz||undefined,cl||undefined);setDone(true);setTimeout(()=>{setDone(false);onClose();},700);};

  return(
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center sm:px-4"
      style={{background:"rgba(0,0,0,.88)",backdropFilter:"blur(28px)"}} onClick={onClose}>
      <style>{`
        @keyframes sheetUp{from{opacity:0;transform:translateY(60px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        .sheet-modal{animation:sheetUp .44s cubic-bezier(.34,1.1,.64,1) both}
        @keyframes imgSwap{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        .img-swap{animation:imgSwap .3s ease both}
      `}</style>
      <div className="sheet-modal relative w-full sm:max-w-[820px] overflow-hidden"
        style={{background:bg,borderRadius:28,border:`1px solid ${dark?"rgba(255,255,255,.1)":"rgba(0,0,0,.1)"}`,maxHeight:"94vh",overflowY:"auto",
          boxShadow:`0 80px 160px -32px rgba(0,0,0,.9),0 0 0 1px ${ac}20,inset 0 1px 0 ${dark?"rgba(255,255,255,.06)":"rgba(255,255,255,.9)"}`}}
        onClick={e=>e.stopPropagation()}>
        {/* top chromatic bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] z-10" style={{background:`linear-gradient(90deg,transparent,${ac},${ac}aa,${ac},transparent)`}}/>
        <button onClick={onClose} className="absolute top-5 right-5 z-20 h-9 w-9 rounded-full flex items-center justify-center cursor-pointer text-sm font-black transition-all hover:scale-110 hover:rotate-90"
          style={{background:surf,border:`1px solid ${bord}`,color:sub}}>✕</button>

        <div className="flex flex-col lg:flex-row">
          {/* Gallery — sliding strip with swipe */}
          <div className="lg:w-[420px] shrink-0 flex flex-col">
            <div className="relative overflow-hidden" style={{height:400,background:`linear-gradient(145deg,${ac}16,${dark?"#0d0d0d":"#f8f8f8"})`,userSelect:"none"}}
              onTouchStart={e=>{const t=e.touches[0];(e.currentTarget as any)._tx=t.clientX;}}
              onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-((e.currentTarget as any)._tx||0);if(Math.abs(dx)>40){setImg(i=>dx<0?(i+1)%imgs.length:(i-1+imgs.length)%imgs.length);}}}
              onMouseDown={e=>{(e.currentTarget as any)._mx=e.clientX;(e.currentTarget as any)._dragging=true;}}
              onMouseUp={e=>{if(!(e.currentTarget as any)._dragging)return;(e.currentTarget as any)._dragging=false;const dx=e.clientX-((e.currentTarget as any)._mx||0);if(Math.abs(dx)>40)setImg(i=>dx<0?(i+1)%imgs.length:(i-1+imgs.length)%imgs.length);}}>

              {/* Sliding strip */}
              {imgs.length>0
                ?(
                  <div style={{display:"flex",width:`${imgs.length*100}%`,height:"100%",transform:`translateX(${-img*(100/imgs.length)}%)`,transition:"transform .42s cubic-bezier(.77,0,.18,1)"}}>
                    {imgs.map((src,i)=>(
                      <div key={i} style={{width:`${100/imgs.length}%`,height:"100%",flexShrink:0,position:"relative"}}>
                        <img src={src} alt={`${product.name} ${i+1}`} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                      </div>
                    ))}
                  </div>
                )
                :<div className="h-full flex items-center justify-center" style={{fontSize:96,opacity:.1}}>📦</div>
              }

              {/* gradient overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(to top,rgba(0,0,0,.52) 0%,transparent 45%)"}}/>

              {/* Stock badge */}
              {product.stock<=5&&product.stock>0&&(
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest pointer-events-none"
                  style={{background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.4)",color:"#fbbf24",backdropFilter:"blur(10px)"}}>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"/>ONLY {product.stock} LEFT
                </div>
              )}
              {oos&&<div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}}><span className="text-white/50 font-black text-sm tracking-[.3em] uppercase">Sold Out</span></div>}

              {/* Photo counter badge */}
              {imgs.length>1&&(
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-xl text-[11px] font-black pointer-events-none"
                  style={{background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)",color:"rgba(255,255,255,.8)"}}>
                  {img+1} / {imgs.length}
                </div>
              )}

              {/* Arrow buttons */}
              {imgs.length>1&&<>
                <button onClick={e=>{e.stopPropagation();setImg(i=>(i-1+imgs.length)%imgs.length);}}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
                  style={{background:"rgba(0,0,0,.62)",backdropFilter:"blur(12px)",color:"#fff",border:"1px solid rgba(255,255,255,.18)"}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button onClick={e=>{e.stopPropagation();setImg(i=>(i+1)%imgs.length);}}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
                  style={{background:"rgba(0,0,0,.62)",backdropFilter:"blur(12px)",color:"#fff",border:"1px solid rgba(255,255,255,.18)"}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 pointer-events-none">
                  {imgs.map((_,i)=>(
                    <button key={i} onClick={e=>{e.stopPropagation();setImg(i);}}
                      className="rounded-full cursor-pointer transition-all pointer-events-auto"
                      style={{width:img===i?24:7,height:7,background:img===i?ac:"rgba(255,255,255,.38)",boxShadow:img===i?`0 0 8px ${ac}`:undefined}}/>
                  ))}
                </div>
              </>}
            </div>

            {/* Thumbnail strip */}
            {imgs.length>1&&(
              <div className="flex gap-2 p-3 overflow-x-auto" style={{background:dark?"rgba(255,255,255,.025)":"rgba(0,0,0,.025)"}}>
                {imgs.map((s,i)=>(
                  <button key={i} onClick={()=>setImg(i)}
                    className="shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105"
                    style={{width:60,height:60,border:`2.5px solid ${img===i?ac:"transparent"}`,opacity:img===i?1:.42,transform:img===i?"scale(1.06)":"scale(1)",flexShrink:0}}>
                    <img src={s} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="flex-1 flex flex-col p-7 lg:p-9 gap-6 overflow-y-auto">
            {/* title */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-black tracking-[.25em] uppercase px-2.5 py-1 rounded-full" style={{background:`${ac}18`,border:`1px solid ${ac}35`,color:ac}}>
                  {NICHE_LABEL[product.material||"other"]?.split(" ")[0]||"Product"}
                </span>
                {product.brand&&<span className="text-[9px] font-black tracking-[.2em] uppercase px-2.5 py-1 rounded-full" style={{background:surf,border:`1px solid ${bord}`,color:sub}}>{product.brand}</span>}
              </div>
              <h2 className="font-black leading-tight mb-4" style={{color:text,fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.6rem,3vw,2.1rem)",letterSpacing:"-.01em"}}>{product.name}</h2>
              <div className="flex items-end gap-3">
                <span className="font-black" style={{color:ac,fontFamily:"'Syne',sans-serif",fontSize:"2.2rem",lineHeight:1}}>{Number(product.price).toLocaleString()}</span>
                <span className="font-bold text-lg mb-0.5" style={{color:sub}}>DA</span>
              </div>
            </div>

            {product.description&&<p className="text-[14px] leading-[1.75]" style={{color:sub,fontFamily:"'DM Sans',sans-serif"}}>{product.description}</p>}

            {/* specs */}
            {(product.brand||product.material||product.weight)&&(
              <div className="grid grid-cols-2 gap-2.5">
                {[{k:"Brand",v:product.brand},{k:"Material",v:product.material},{k:"Weight",v:product.weight}].filter(d=>d.v).map(d=>(
                  <div key={d.k} className="px-4 py-3 rounded-2xl" style={{background:surf,border:`1px solid ${bord}`}}>
                    <p className="text-[9px] font-black uppercase tracking-[.22em] mb-1" style={{color:`rgba(${rgb.r},${rgb.g},${rgb.b},.7)`}}>{d.k}</p>
                    <p className="text-[13px] font-bold" style={{color:text}}>{d.v}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Colors */}
            {hasCl&&(
              <div>
                <p className="text-[9px] font-black tracking-[.22em] uppercase mb-3" style={{color:sub}}>
                  Colour{cl&&<span style={{color:ac}}> — {cl}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors!.map((c,i)=>(
                    <button key={i} onClick={()=>setCl(cl===c.name?null:c.name)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all hover:scale-105"
                      style={{border:`1.5px solid ${cl===c.name?ac:bord}`,background:cl===c.name?`${ac}12`:surf,boxShadow:cl===c.name?`0 4px 14px ${ac}30`:undefined}}>
                      <span className="h-4 w-4 rounded-full flex-shrink-0" style={{background:c.hex,boxShadow:`0 0 0 1.5px rgba(255,255,255,.2),0 2px 6px rgba(0,0,0,.4)`}}/>
                      <span className="text-[12px] font-bold" style={{color:text}}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {hasSz&&(
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-black tracking-[.22em] uppercase" style={{color:sub}}>
                    Size{sz&&<span style={{color:ac}}> — {sz}</span>}
                  </p>
                  {!sz&&<span className="text-[10px] font-black" style={{color:"#ef4444"}}>Required ↑</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes!.map((s,i)=>{
                    const out=s.stock===0;const sel=sz===s.label;
                    return(
                      <button key={i} onClick={()=>!out&&setSz(sel?null:s.label)} disabled={out}
                        className="relative px-5 py-2.5 rounded-xl font-black text-sm cursor-pointer transition-all"
                        style={{background:sel?`linear-gradient(135deg,${ac},${ac}cc)`:surf,color:sel?"#fff":out?`${sub}`:text,border:`1.5px solid ${sel?ac:bord}`,boxShadow:sel?`0 6px 20px ${ac}50`:undefined,opacity:out?.35:1,textDecoration:out?"line-through":undefined,transform:sel?"scale(1.06)":"scale(1)"}}>
                        {s.label}
                        {!out&&s.stock<=5&&<span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 border-2 animate-pulse" style={{borderColor:dark?"#0a0a0a":"#fff"}}/>}
                      </button>
                    );
                  })}
                </div>
                {szObj&&!szOos&&<p className="text-[11px] mt-2.5" style={{color:sub}}>{szObj.stock} units in this size</p>}
                {szOos&&<p className="text-[11px] mt-2.5 font-bold" style={{color:"#ef4444"}}>This size is out of stock</p>}
              </div>
            )}

            {/* stock dot */}
            <div className="flex items-center gap-2.5">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${oos?"bg-red-500":product.stock<=5?"bg-amber-400 animate-pulse":"bg-emerald-500 animate-pulse"}`}/>
              <span className="text-[13px]" style={{color:sub}}>{oos?"Sold out — notify me?":product.stock<=5?`Only ${product.stock} remaining`:`In stock · ${product.stock} available`}</span>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 mt-auto">
              <button onClick={handleAdd} disabled={!canAdd}
                className="w-full py-4 font-black text-[15px] rounded-xl cursor-pointer active:scale-95 transition-all tracking-wide"
                style={{...getBtnStyle(btnStyle,ac,canAdd),opacity:canAdd?1:.4}}>
                {done?"✓ Added to Cart":oos?"Sold Out":hasSz&&!sz?"Select a Size to Continue →":"Add to Cart"}
              </button>
              <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-sm cursor-pointer transition-all hover:opacity-60" style={{background:surf,color:sub}}>
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   PRODUCT CARD — editorial tilt card
════════════════════════════════════════════════ */
const ProductCard=({p,ac,btnStyle,dark,onView,onAdd,idx}:{
  p:Product;ac:string;btnStyle:string;dark:boolean;
  onView:(x:Product)=>void;onAdd:(x:Product)=>void;idx:number;
})=>{
  const{ref,vis}=useReveal(idx*55);
  const[hov,setHov]=useState(false);
  const elRef=useRef<HTMLDivElement>(null);
  const img=(p.images?.length)?((p.images.find(i=>i.is_primary)||p.images[0]).image_url):(p.image_url||null);
  const photoN=(p.images?.length||0)||(p.image_url?1:0);
  const oos=p.stock===0;
  const hasSz=!!(p.sizes?.length);const hasCl=!!(p.colors?.length);
  const bg=dark?"#121212":"#ffffff";
  const border=dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.08)";
  const text=dark?"#f0f0f0":"#111";
  const sub=dark?"rgba(255,255,255,.42)":"#888";
  const chipBg=dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.05)";

  const tilt=(e:React.MouseEvent<HTMLDivElement>)=>{
    if(!elRef.current)return;
    const r=elRef.current.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    elRef.current.style.transform=`perspective(1000px) rotateX(${y*-7}deg) rotateY(${x*7}deg) translateY(-10px) scale(1.022)`;
  };
  const resetTilt=()=>{setHov(false);if(elRef.current)elRef.current.style.transform="perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)";};

  return(
    <div ref={ref} style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(36px)",transition:`opacity .55s ease ${idx*55}ms,transform .55s cubic-bezier(.34,1.1,.64,1) ${idx*55}ms`}}>
      <div ref={elRef} className="relative flex flex-col overflow-hidden cursor-pointer group"
        style={{borderRadius:20,background:bg,border:`1px solid ${hov?ac+"55":border}`,
          transition:"border-color .35s,box-shadow .35s",willChange:"transform",
          boxShadow:hov?`0 40px 80px -16px ${ac}40,0 0 0 1px ${ac}25`:(dark?"0 2px 20px rgba(0,0,0,.65)":"0 2px 20px rgba(0,0,0,.07)")}}
        onMouseEnter={()=>setHov(true)} onMouseLeave={resetTilt} onMouseMove={tilt}
        onClick={()=>onView(p)}>

        {/* Shimmer */}
        <div className="absolute inset-0 pointer-events-none z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[20px]"
          style={{background:`linear-gradient(108deg,transparent 25%,${ac}0a 50%,transparent 75%)`,mixBlendMode:"screen"}}/>

        {/* Image — TALLER for bigger cards */}
        <div className="relative overflow-hidden flex-shrink-0" style={{height:320,background:dark?`linear-gradient(145deg,${ac}12,#0d0d0d)`:`linear-gradient(145deg,${ac}08,#f5f5f5)`}}>
          {img
            ?<img src={img} alt={p.name} className="w-full h-full object-cover" style={{transform:hov?"scale(1.08) translateY(-2%)":"scale(1)",transition:"transform .8s cubic-bezier(.33,1,.68,1)"}}/>
            :<div className="h-full flex items-center justify-center" style={{fontSize:80,opacity:.08}}>{NICHE_EMOJI.other}</div>
          }
          {/* layered gradients */}
          <div className="absolute inset-0" style={{background:`linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.18) 40%,transparent 65%)`}}/>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background:`radial-gradient(ellipse at 50% 50%,${ac}18 0%,transparent 70%)`}}/>

          {/* top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
            <div className="flex flex-col gap-1.5">
              {p.stock<=5&&p.stock>0&&<span className="text-[8px] font-black tracking-[.2em] px-2 py-1 rounded-full" style={{background:"rgba(245,158,11,.18)",border:"1px solid rgba(245,158,11,.45)",color:"#fbbf24",backdropFilter:"blur(8px)"}}>LOW STOCK</span>}
              {hasSz&&<span className="text-[8px] font-black tracking-[.15em] px-2 py-1 rounded-full" style={{background:`${ac}22`,border:`1px solid ${ac}45`,color:ac,backdropFilter:"blur(8px)"}}>SIZES</span>}
            </div>
            {photoN>1&&(
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black" style={{background:"rgba(0,0,0,.65)",backdropFilter:"blur(8px)",color:"rgba(255,255,255,.7)"}}>
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {photoN}
              </div>
            )}
          </div>

          {/* sold out */}
          {oos&&<div className="absolute inset-0 flex items-center justify-center z-[5]" style={{background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}}><span className="text-white/50 font-black text-xs tracking-[.28em] uppercase">Sold Out</span></div>}

          {/* price + quick view */}
          <div className="absolute bottom-0 inset-x-0 p-4 flex items-end justify-between">
            <span className="font-black text-[22px] text-white leading-none" style={{fontFamily:"'Syne',sans-serif",textShadow:"0 2px 16px rgba(0,0,0,.8)"}}>{Number(p.price).toLocaleString()} <span className="text-sm text-white/45">DA</span></span>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <span className="px-3.5 py-2 rounded-xl text-[11px] font-black text-white" style={{background:"rgba(0,0,0,.7)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,.15)"}}>View →</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{padding:"20px 20px 18px",display:"flex",flexDirection:"column",gap:12}}>
          <div>
            {p.category_names&&p.category_names.length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                {p.category_names.slice(0,2).map((cn,ci)=>(
                  <span key={ci} style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9,fontWeight:800,letterSpacing:".14em",textTransform:"uppercase",padding:"3px 8px",borderRadius:999,background:`${ac}14`,border:`1px solid ${ac}28`,color:ac}}>{cn}</span>
                ))}
              </div>
            )}
            <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:text,lineHeight:1.25,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</h3>
            {p.description&&<p style={{fontSize:12,marginTop:5,lineHeight:1.6,color:sub,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.description}</p>}
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:6}}>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:ac,lineHeight:1}}>{Number(p.price).toLocaleString()}</span>
            <span style={{fontSize:13,fontWeight:700,color:sub}}>DA</span>
          </div>
          {hasCl&&(
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              {p.colors!.slice(0,8).map((c,i)=>(
                <div key={i} title={c.name} style={{height:16,width:16,borderRadius:"50%",background:c.hex,boxShadow:`0 0 0 1.5px ${dark?"rgba(255,255,255,.2)":"rgba(0,0,0,.15)"}`,cursor:"pointer",transition:"transform .2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.3)")} onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}/>
              ))}
              {p.colors!.length>8&&<span style={{fontSize:10,color:sub}}>+{p.colors!.length-8}</span>}
            </div>
          )}
          {hasSz&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {p.sizes!.slice(0,7).map((s,i)=>(
                <span key={i} style={{fontSize:11,fontWeight:800,padding:"3px 9px",borderRadius:8,background:s.stock===0?"rgba(239,68,68,.1)":chipBg,color:s.stock===0?"#ef4444":sub,textDecoration:s.stock===0?"line-through":undefined,border:`1px solid ${s.stock===0?"rgba(239,68,68,.2)":dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)"}`}}>{s.label}</span>
              ))}
              {p.sizes!.length>7&&<span style={{fontSize:10,color:sub}}>+{p.sizes!.length-7}</span>}
            </div>
          )}
          <button onClick={e=>{e.stopPropagation();if(!oos)onAdd(p);}}
            style={{...getBtnStyle(btnStyle,ac,!oos),width:"100%",padding:"13px",fontWeight:800,fontSize:13,cursor:"pointer",border:"none",transition:"all .2s",marginTop:2}}>
            {oos?"Sold Out":hasSz?"Choose Options →":"+ Add to Cart"}
          </button>
        </div>

        {/* bottom accent */}
        <div className="absolute bottom-0 inset-x-0 h-[2px] rounded-b-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{background:`linear-gradient(90deg,transparent,${ac},transparent)`}}/>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   CART DRAWER
════════════════════════════════════════════════ */
const CartDrawer=({cart,ac,btnStyle,dark,onClose,onUpdate,onCheckout}:{
  cart:CartItem[];ac:string;btnStyle:string;dark:boolean;
  onClose:()=>void;onUpdate:(id:number,qty:number,sz?:string,cl?:string)=>void;onCheckout:()=>void;
})=>{
  const bg=dark?"#0e0e0e":"#fafaf8";
  const text=dark?"#f0f0f0":"#111";
  const sub=dark?"rgba(255,255,255,.45)":"#888";
  const surf=dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)";
  const bord=dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)";
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  return(
    <div className="fixed inset-0 z-[300]" onClick={onClose}>
      <div className="absolute inset-0" style={{background:"rgba(0,0,0,.55)",backdropFilter:"blur(10px)"}}/>
      <div className="absolute top-0 right-0 h-full w-full max-w-[380px] flex flex-col"
        style={{background:bg,borderLeft:`1px solid ${bord}`,boxShadow:`-20px 0 60px rgba(0,0,0,${dark?.6:.15})`}}
        onClick={e=>e.stopPropagation()}>
        {/* header */}
        <div className="p-6 border-b flex items-start justify-between" style={{borderColor:bord}}>
          <div>
            <h2 className="font-black text-xl" style={{color:text,fontFamily:"'Syne',sans-serif"}}>Cart</h2>
            <p className="text-xs mt-0.5" style={{color:sub}}>{cart.reduce((s,i)=>s+i.qty,0)} item{cart.reduce((s,i)=>s+i.qty,0)!==1?"s":""} · {total.toLocaleString()} DA</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:rotate-90" style={{background:surf,border:`1px solid ${bord}`,color:sub}}>✕</button>
        </div>
        {/* items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {!cart.length
            ?<div className="flex flex-col items-center justify-center h-full gap-5" style={{opacity:.35}}>
              <div style={{fontSize:52}}>🛒</div>
              <p className="font-black text-sm" style={{color:text}}>Empty cart</p>
            </div>
            :cart.map(item=>{
              const img=(item.images?.length)?((item.images.find(i=>i.is_primary)||item.images[0]).image_url):(item.image_url||null);
              return(
                <div key={`${item.id}-${item.selectedSize||""}-${item.selectedColor||""}`}
                  className="flex gap-3 p-3.5 rounded-2xl" style={{background:surf,border:`1px solid ${bord}`}}>
                  <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0" style={{background:`${ac}18`}}>
                    {img?<img src={img} alt="" className="h-full w-full object-cover"/>:<div className="h-full flex items-center justify-center opacity-25 text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{color:text}}>{item.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1 mb-1.5">
                      {item.selectedSize&&<span className="text-[10px] font-black px-1.5 py-0.5 rounded-md" style={{background:`${ac}22`,color:ac}}>{item.selectedSize}</span>}
                      {item.selectedColor&&<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{background:surf,border:`1px solid ${bord}`,color:sub}}>
                        <span className="h-2 w-2 rounded-full" style={{background:item.colors?.find(c=>c.name===item.selectedColor)?.hex||"#888"}}/>{item.selectedColor}
                      </span>}
                    </div>
                    <p className="font-black text-sm" style={{color:ac}}>{Number(item.price).toLocaleString()} DA</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button onClick={()=>onUpdate(item.id,item.qty+1,item.selectedSize,item.selectedColor)} className="h-7 w-7 rounded-lg flex items-center justify-center font-black cursor-pointer transition-all hover:scale-110" style={{background:surf,border:`1px solid ${bord}`,color:text}}>+</button>
                    <span className="font-black text-sm" style={{color:text}}>{item.qty}</span>
                    <button onClick={()=>onUpdate(item.id,item.qty-1,item.selectedSize,item.selectedColor)} className="h-7 w-7 rounded-lg flex items-center justify-center font-black cursor-pointer transition-all hover:scale-110" style={{background:surf,border:`1px solid ${bord}`,color:text}}>−</button>
                  </div>
                </div>
              );
            })
          }
        </div>
        {cart.length>0&&(
          <div className="p-5 border-t" style={{borderColor:bord}}>
            <div className="flex justify-between items-baseline mb-5">
              <span className="font-bold text-sm" style={{color:sub}}>Total</span>
              <span className="font-black text-2xl" style={{color:ac,fontFamily:"'Syne',sans-serif"}}>{total.toLocaleString()} <span className="text-sm opacity-55">DA</span></span>
            </div>
            <button onClick={onCheckout} className="w-full py-4 font-black text-[15px] text-white cursor-pointer active:scale-95 transition-all rounded-xl"
              style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 10px 32px ${ac}55`}}>
              Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   CHECKOUT MODAL — Full Algerian address form
════════════════════════════════════════════════ */
const WILAYAS: Record<string, string[]> = {
  "Adrar":["Adrar","Aoulef","Timimoun","Reggane","Tsabit","Fenoughil"],"Chlef":["Chlef","Ténès","Oued Fodda","El Karimia","Taougrite"],"Laghouat":["Laghouat","Aflou","Ksar El Hirane","Hassi R'Mel","Brida"],"Oum El Bouaghi":["Oum El Bouaghi","Aïn Beïda","Khenchela","Meskiana","Souk Naamane"],"Batna":["Batna","Barika","Tazoult","N'Gaous","Arris","Timgad"],"Béjaïa":["Béjaïa","Akbou","Kherrata","Sidi Aïch","El Kseur","Amizour"],"Biskra":["Biskra","Tolga","Ouled Djellal","Sidi Okba","Zeribet El Oued"],"Béchar":["Béchar","Abadla","Beni Abbès","Taghit","Igli"],"Blida":["Blida","Boufarik","Meftah","Larbaa","Oued El Alleug","Bougara"],"Bouira":["Bouira","Lakhdaria","M'Chedallah","Aïn Bessem","Sour El Ghozlane"],"Tamanrasset":["Tamanrasset","In Salah","Abalessa","In Guezzam","Tazrouk"],"Tébessa":["Tébessa","Bir El Ater","Cheria","El Aouinet","Morsott"],"Tlemcen":["Tlemcen","Ghazaouet","Maghnia","Nedroma","Remchi","Bensekrane"],"Tiaret":["Tiaret","Frenda","Sougueur","Mechraa Safa","Ksar Chellala"],"Tizi Ouzou":["Tizi Ouzou","Azazga","Larbaa Nath Irathen","Draâ El Mizan","Boghni","Tigzirt"],"Alger":["Alger Centre","Bab El Oued","El Harrach","Bir Mourad Raïs","Birkhadem","Kouba","Dar El Beïda","Rouiba","Réghaïa","Hydra","El Biar","Cheraga","Draria","Bouzaréah"],"Djelfa":["Djelfa","Messaad","Aïn Oussera","Birine","Hassi Bahbah"],"Jijel":["Jijel","El Milia","Taher","Collo","Ziama Mansouriah"],"Sétif":["Sétif","El Eulma","Aïn Oulmène","Aïn Azel","Bougaa","Salah Bey","El Ouricia"],"Saïda":["Saïda","Aïn El Hadjar","Youb","Sidi Ahmed"],"Skikda":["Skikda","El Harrouch","Azzaba","Collo","Tamalous"],"Sidi Bel Abbès":["Sidi Bel Abbès","Telagh","Ras El Ma","Sfisef","Moulay Slissen"],"Annaba":["Annaba","El Bouni","El Hadjar","Berrahal","Séraïdi"],"Guelma":["Guelma","Bouchegouf","Héliopolis","Oued Zenati","Hammam Maskhoutine"],"Constantine":["Constantine","El Khroub","Aïn Smara","Didouche Mourad","Hamma Bouziane","Zighoud Youcef"],"Médéa":["Médéa","Berrouaghia","Tablat","Ksar El Boukhari","Boughezoul"],"Mostaganem":["Mostaganem","Kheir Eddine","Aïn Tédelès","Sidi Ali","Mesra"],"M'Sila":["M'Sila","Bou Saâda","Sidi Aïssa","Aïn El Melh","Magra"],"Mascara":["Mascara","Sig","Mohammadia","Bouhanifia","Tighennif"],"Ouargla":["Ouargla","Hassi Messaoud","Touggourt","Ngoussa","El Hadjira"],"Oran":["Oran","Es Senia","Bir El Djir","Aïn El Türck","Arzew","Bethioua","Mers El Kebir"],"El Bayadh":["El Bayadh","Brezina","Chellala","El Abiodh Sidi Cheikh","Rogassa"],"Illizi":["Illizi","Djanet","In Amenas","Debdeb"],"Bordj Bou Arréridj":["Bordj Bou Arréridj","Ras El Oued","El Anseur","Mansoura","Bordj Ghdir"],"Boumerdès":["Boumerdès","Khemis El Khechna","Dellys","Thénia","Boudouaou","Corso"],"El Tarf":["El Tarf","La Calle","Ben Mehidi","Besbes","Bouteldja"],"Tindouf":["Tindouf","Oum El Assel"],"Tissemsilt":["Tissemsilt","Khemisti","Bordj Bou Naama","Theniet El Had"],"El Oued":["El Oued","Guemar","Robbah","Djamaa","Maghier","Kouinine"],"Khenchela":["Khenchela","Aïn Touila","Baghaï","Chechar","El Hamma"],"Souk Ahras":["Souk Ahras","Sedrata","Mérahna","Oum El Adhaïm","Tiffech"],"Tipaza":["Tipaza","Cherchell","Hadjout","Koléa","Aïn Tagourait","Sidi Ghiles"],"Mila":["Mila","Ferdjioua","Chelghoum Laïd","Tadjenanet","Rouached"],"Aïn Defla":["Aïn Defla","El Attaf","Khemis Miliana","Miliana","Rouina"],"Naâma":["Naâma","Mecheria","Aïn Sefra","Sfissifa","Tiout"],"Aïn Témouchent":["Aïn Témouchent","Béni Saf","Hammam Bou Hadjar","El Amria","Aghlal"],"Ghardaïa":["Ghardaïa","Metlili","El Guerrara","Berriane","Daya Ben Dahoua"],"Relizane":["Relizane","Jdiouia","Mazouna","Oued Rhiou","Sidi M'Hamed Ben Ali"],"Timimoun":["Timimoun","Aougrout","Charouine","Ksar Kaddour"],"Bordj Badji Mokhtar":["Bordj Badji Mokhtar","In Khalil"],"Ouled Djellal":["Ouled Djellal","Sidi Khaled","Doucen"],"Beni Abbès":["Beni Abbès","Igli","El Ouata"],"In Salah":["In Salah","In Ghar","Foggaret Ezzoua"],"In Guezzam":["In Guezzam","Tin Zaouatine"],"Touggourt":["Touggourt","Témacine","Megarine","Nezla"],"Djanet":["Djanet","Bordj El Haoues"],"El M'Ghair":["El M'Ghair","Djamaa","Sidi Amrane"],"El Meniaa":["El Meniaa","Hassi El Gara"],
};
const WILAYA_LIST=Object.keys(WILAYAS);

const CheckoutModal=({cart,ac,dark,storeId,onClose,onSuccess}:{
  cart:CartItem[];ac:string;dark:boolean;storeId:number;onClose:()=>void;onSuccess:()=>void;
})=>{
  const[form,setForm]=useState({firstName:"",lastName:"",email:"",phone:"",wilaya:"",city:"",address:"",notes:""});
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const[focused,setFocused]=useState("");
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const bg=dark?"#0e0e0e":"#fff";
  const text=dark?"#f0f0f0":"#111";
  const sub=dark?"rgba(255,255,255,.45)":"#888";
  const bord=dark?"rgba(255,255,255,.09)":"rgba(0,0,0,.09)";
  const inputBg=dark?"rgba(255,255,255,.06)":"rgba(0,0,0,.04)";
  const cities=form.wilaya?WILAYAS[form.wilaya]||[]:[];

  const submit=async()=>{
    if(!form.firstName||!form.phone||!form.wilaya){setErr("Please fill in all required fields (name, phone, wilaya)");return;}
    setLoading(true);setErr("");
    try{
      const res=await fetch(`${API_URL}/orders/`,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          store:storeId,
          customer_name:form.firstName,
          customer_family_name:form.lastName,
          customer_email:form.email,
          customer_phone:form.phone,
          customer_wilaya:form.wilaya,
          customer_city:form.city,
          customer_address:form.address,
          notes:form.notes,
          items:cart.map(i=>({product:i.id,quantity:i.qty,selected_size:i.selectedSize||"",selected_color:i.selectedColor||""})),
        }),
      });
      if(res.ok)onSuccess();else{const d=await res.json();setErr(JSON.stringify(d));}
    }catch{setErr("Network error. Please try again.");}
    finally{setLoading(false);}
  };

  const iStyle=(f:string):React.CSSProperties=>({
    background:focused===f?`${ac}0e`:inputBg,border:`1px solid ${focused===f?ac:bord}`,
    borderRadius:12,color:text,width:"100%",padding:"12px 15px",fontSize:14,
    boxShadow:focused===f?`0 0 0 3px ${ac}18`:"none",transition:"all .2s",outline:"none",fontFamily:"'DM Sans',sans-serif",
  });
  const lStyle:React.CSSProperties={display:"block",fontSize:9,fontWeight:800,letterSpacing:".22em",textTransform:"uppercase",marginBottom:6,color:sub};
  const F=(k:string)=>({onFocus:()=>setFocused(k),onBlur:()=>setFocused("")});

  return(
    <div className="fixed inset-0 z-[400] flex items-center justify-center px-4"
      style={{background:"rgba(0,0,0,.88)",backdropFilter:"blur(26px)"}} onClick={onClose}>
      <div className="relative w-full max-w-lg overflow-hidden"
        style={{background:bg,border:`1px solid ${ac}30`,borderRadius:28,maxHeight:"93vh",overflowY:"auto",boxShadow:`0 60px 120px -24px ${ac}40,0 0 0 1px ${ac}18`}}
        onClick={e=>e.stopPropagation()}>
        <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-3xl" style={{background:`linear-gradient(90deg,transparent,${ac},transparent)`}}/>
        <div style={{padding:28}}>
          {/* Header */}
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
            <div>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:text,margin:0}}>Complete Order</h2>
              <p style={{fontSize:13,color:sub,marginTop:4}}>{cart.reduce((s,i)=>s+i.qty,0)} items · {total.toLocaleString()} DA</p>
            </div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:inputBg,border:`1px solid ${bord}`,color:sub,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
          </div>

          {err&&<div style={{marginBottom:16,padding:"12px 16px",borderRadius:12,background:"#ef444415",border:"1px solid #ef444430",color:"#f87171",fontSize:13}}>{err}</div>}

          <div style={{display:"flex",flexDirection:"column",gap:20}}>

            {/* ── Personal Info ── */}
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{height:1,flex:1,background:`linear-gradient(to right,${ac}50,transparent)`}}/>
                <span style={{fontSize:9,fontWeight:800,letterSpacing:".25em",textTransform:"uppercase",color:ac}}>Personal Info</span>
                <div style={{height:1,flex:1,background:`linear-gradient(to left,${ac}50,transparent)`}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={lStyle}>First Name *</label>
                  <input value={form.firstName} onChange={e=>setForm(v=>({...v,firstName:e.target.value}))} {...F("firstName")} placeholder="Ahmed" style={iStyle("firstName")}/>
                </div>
                <div>
                  <label style={lStyle}>Family Name *</label>
                  <input value={form.lastName} onChange={e=>setForm(v=>({...v,lastName:e.target.value}))} {...F("lastName")} placeholder="Benali" style={iStyle("lastName")}/>
                </div>
              </div>
            </div>

            {/* ── Contact ── */}
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{height:1,flex:1,background:`linear-gradient(to right,${ac}50,transparent)`}}/>
                <span style={{fontSize:9,fontWeight:800,letterSpacing:".25em",textTransform:"uppercase",color:ac}}>Contact</span>
                <div style={{height:1,flex:1,background:`linear-gradient(to left,${ac}50,transparent)`}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={lStyle}>Phone *</label>
                  <input value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))} {...F("phone")} placeholder="0550 000 000" style={iStyle("phone")}/>
                </div>
                <div>
                  <label style={lStyle}>Email</label>
                  <input type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} {...F("email")} placeholder="ahmed@example.com" style={iStyle("email")}/>
                </div>
              </div>
            </div>

            {/* ── Delivery Address ── */}
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{height:1,flex:1,background:`linear-gradient(to right,${ac}50,transparent)`}}/>
                <span style={{fontSize:9,fontWeight:800,letterSpacing:".25em",textTransform:"uppercase",color:ac}}>Delivery Address</span>
                <div style={{height:1,flex:1,background:`linear-gradient(to left,${ac}50,transparent)`}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {/* Wilaya */}
                <div>
                  <label style={lStyle}>Wilaya *</label>
                  <select value={form.wilaya} onChange={e=>setForm(v=>({...v,wilaya:e.target.value,city:""}))} {...F("wilaya")}
                    style={{...iStyle("wilaya"),appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center"}}>
                    <option value="">— Select Wilaya —</option>
                    {WILAYA_LIST.map(w=><option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                {/* City — auto-populated from wilaya */}
                <div>
                  <label style={lStyle}>City / Commune{cities.length>0?` (${cities.length} available)`:""}</label>
                  {cities.length>0
                    ?<select value={form.city} onChange={e=>setForm(v=>({...v,city:e.target.value}))} {...F("city")}
                        style={{...iStyle("city"),appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center"}}>
                        <option value="">— Select City —</option>
                        {cities.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    :<input value={form.city} onChange={e=>setForm(v=>({...v,city:e.target.value}))} {...F("city")} placeholder="Select a wilaya first" disabled={!form.wilaya} style={{...iStyle("city"),opacity:!form.wilaya?.5:1}}/>
                  }
                </div>
                {/* Address */}
                <div>
                  <label style={lStyle}>Street Address</label>
                  <input value={form.address} onChange={e=>setForm(v=>({...v,address:e.target.value}))} {...F("address")} placeholder="Street, building, neighbourhood..." style={iStyle("address")}/>
                </div>
              </div>
            </div>

            {/* ── Notes ── */}
            <div>
              <label style={lStyle}>Order Notes</label>
              <textarea value={form.notes} onChange={e=>setForm(v=>({...v,notes:e.target.value}))} {...F("notes")}
                placeholder="Special delivery instructions, preferred time..."
                style={{...iStyle("notes"),resize:"none",height:80}}/>
            </div>

            {/* ── Order Summary ── */}
            <div style={{padding:16,borderRadius:16,background:dark?"rgba(255,255,255,.04)":"rgba(0,0,0,.03)",border:`1px solid ${bord}`}}>
              <p style={{fontSize:9,fontWeight:800,letterSpacing:".2em",textTransform:"uppercase",color:sub,marginBottom:10}}>Order Summary</p>
              {cart.map(item=>(
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:13}}>
                  <span style={{color:sub}}>
                    {item.name}
                    {item.selectedSize&&<span style={{color:ac}}> · {item.selectedSize}</span>}
                    {item.selectedColor&&<span style={{color:sub}}> · {item.selectedColor}</span>}
                    <span style={{color:sub}}> ×{item.qty}</span>
                  </span>
                  <span style={{fontWeight:700,color:text,marginLeft:12,flexShrink:0}}>{(item.price*item.qty).toLocaleString()} DA</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,marginTop:6,borderTop:`1px solid ${bord}`}}>
                <span style={{fontWeight:800,color:text}}>Total</span>
                <span style={{fontWeight:800,fontSize:18,color:ac}}>{total.toLocaleString()} DA</span>
              </div>
            </div>

            <button onClick={submit} disabled={loading}
              style={{width:"100%",padding:"16px",fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#fff",fontSize:15,borderRadius:14,cursor:"pointer",border:"none",background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 10px 32px ${ac}50`,opacity:loading?.7:1,transition:"all .2s"}}>
              {loading?"Placing Order...":"Place Order ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════ */
export default function PublicStorefront(){
  const{slug}=useParams<{slug:string}>();
  const[store,setStore]=useState<StoreData|null>(null);
  const[products,setProducts]=useState<Product[]>([]);
  const[categories,setCategories]=useState<StoreCategory[]>([]);
  const[activeCat,setActiveCat]=useState<number|null>(null);
  const[loading,setLoading]=useState(true);
  const[notFound,setNotFound]=useState(false);
  const[cart,setCart]=useState<CartItem[]>([]);
  const[cartOpen,setCartOpen]=useState(false);
  const[checkout,setCheckout]=useState(false);
  const[success,setSuccess]=useState(false);
  const[viewProd,setViewProd]=useState<Product|null>(null);
  const[search,setSearch]=useState("");
  const[searchOpen,setSearchOpen]=useState(false);
  const scroll=useScroll();
  const mouse=useMouse();

  useEffect(()=>{
    (async()=>{
      try{
        const sr=await fetch(`${API_URL}/stores/?slug=${slug}`);
        if(!sr.ok){setNotFound(true);setLoading(false);return;}
        const sd=await sr.json();const s=sd.results?.[0]??sd[0];
        if(!s){setNotFound(true);setLoading(false);return;}
        setStore(s);

        // Fetch categories and products in parallel
        const [pr, cr] = await Promise.all([
          fetch(`${API_URL}/products/?store=${s.id}&is_active=true`),
          fetch(`${API_URL}/categories/?store=${s.id}`),
        ]);

        if(cr.ok){ const cd=await cr.json(); setCategories(cd.results??cd); }

        if(pr.ok){
          const pd=await pr.json();
          const prods: Product[] = pd.results??pd;

          // For any product that has no images[] array from the API,
          // fetch them separately from /api/product-images/?product=<id>
          const enriched = await Promise.all(prods.map(async (p) => {
            if (p.images && p.images.length > 0) return p; // already has images
            try {
              const ir = await fetch(`${API_URL}/product-images/?product=${p.id}`);
              if (ir.ok) {
                const id = await ir.json();
                const imgs: ProductImage[] = id.results ?? id;
                if (imgs.length > 0) return { ...p, images: imgs };
              }
            } catch { /* ignore — fall back to image_url */ }
            return p;
          }));
          setProducts(enriched);
        }
      }catch{setNotFound(true);}finally{setLoading(false);}
    })();
  },[slug]);

  const addToCart=useCallback((p:Product,sz?:string,cl?:string)=>{
    setCart(c=>{const key=`${p.id}-${sz||""}-${cl||""}`;const ex=c.find(i=>`${i.id}-${i.selectedSize||""}-${i.selectedColor||""}`===key);return ex?c.map(i=>`${i.id}-${i.selectedSize||""}-${i.selectedColor||""}`===key?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1,selectedSize:sz,selectedColor:cl}];});
  },[]);
  const updateCart=(id:number,qty:number,sz?:string,cl?:string)=>{
    const key=`${id}-${sz||""}-${cl||""}`;
    if(qty<=0)setCart(c=>c.filter(i=>`${i.id}-${i.selectedSize||""}-${i.selectedColor||""}`!==key));
    else setCart(c=>c.map(i=>`${i.id}-${i.selectedSize||""}-${i.selectedColor||""}`===key?{...i,qty}:i));
  };

  if(loading)return(
    <div className="fixed inset-0 flex items-center justify-center" style={{background:"#080808"}}>
      <style>{`@keyframes luxSpin{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}`}</style>
      <div style={{width:48,height:48,borderRadius:"50%",border:"2px solid rgba(232,119,34,.15)",borderTop:"2px solid #E87722",animation:"luxSpin 1.2s cubic-bezier(.68,-.55,.27,1.55) infinite"}}/>
    </div>
  );

  if(notFound||!store)return(
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center" style={{background:"#080808"}}>
      <div style={{fontSize:64,filter:"grayscale(1)",opacity:.2}}>🔍</div>
      <div>
        <p className="font-black text-2xl text-white mb-2" style={{fontFamily:"'Syne',sans-serif"}}>Store not found</p>
        <p style={{color:"rgba(255,255,255,.3)",fontSize:14}}>This store doesn't exist or is offline.</p>
      </div>
    </div>
  );

  const ac=store.accent_color||"#E87722";
  const ps=store.panel_style||"dark";
  isDark=ps==="dark"||ps==="glass";
  const btnStyle=store.button_style||"soft";
  const rgb=toRgb(ac);
  const BG=isDark?"#080808":"#f4f4f0";
  const TEXT=isDark?"#f0f0f0":"#111";
  const SUB=isDark?"rgba(255,255,255,.42)":"#888";
  const CARD=isDark?"#131313":"#ffffff";
  const BORD=isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.08)";
  const NAVBG=isDark?"rgba(8,8,8,.93)":"rgba(244,244,240,.94)";
  const INPUTBG=isDark?"rgba(255,255,255,.07)":"rgba(0,0,0,.05)";
  const filtered=products.filter(p=>{
    const matchSearch=!search||(p.name+" "+(p.description||"")).toLowerCase().includes(search.toLowerCase());
    const matchCat=activeCat===null||(p.categories||[]).includes(activeCat);
    return matchSearch&&matchCat;
  });
  const cartCount=cart.reduce((s,i)=>s+i.qty,0);

  if(success)return(
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-7 px-6 text-center" style={{background:BG}}>
      <style>{`@keyframes successPop{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.25) rotate(5deg)}100%{transform:scale(1) rotate(0);opacity:1}}`}</style>
      <div className="h-28 w-28 rounded-full flex items-center justify-center text-5xl"
        style={{background:`linear-gradient(135deg,${ac}22,${ac}10)`,border:`2px solid ${ac}50`,boxShadow:`0 0 60px ${ac}35`,animation:"successPop .7s cubic-bezier(.34,1.1,.64,1) both"}}>✓</div>
      <div>
        <h2 className="font-black text-3xl mb-2.5" style={{color:TEXT,fontFamily:"'Syne',sans-serif"}}>Order Confirmed!</h2>
        <p className="text-[15px] max-w-xs leading-relaxed" style={{color:SUB}}>Thank you for your purchase. We'll be in touch shortly.</p>
      </div>
      <button onClick={()=>{setSuccess(false);setCart([]);}} className="px-9 py-4 rounded-xl font-black text-white cursor-pointer active:scale-95 transition-all" style={{background:`linear-gradient(135deg,${ac},${ac}bb)`,boxShadow:`0 10px 36px ${ac}50`,fontSize:15}}>
        Continue Shopping
      </button>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        body{font-family:'DM Sans',sans-serif;background:${BG}}
        @keyframes navIn{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroWord{from{opacity:0;transform:translateY(40px) skewY(2deg)}to{opacity:1;transform:translateY(0) skewY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes imgSwap{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        .img-swap{animation:imgSwap .3s ease both}
        @keyframes scrollBounce{0%,100%{transform:translateY(0);opacity:.35}50%{transform:translateY(6px);opacity:.9}}
        @keyframes blobFloat{0%,100%{border-radius:60% 40% 70% 30%/50% 60% 40% 50%;transform:translate(0,0)}33%{border-radius:40% 60% 30% 70%/60% 40% 60% 40%;transform:translate(-12px,8px)}66%{border-radius:70% 30% 50% 50%/40% 70% 30% 60%;transform:translate(8px,-10px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.85)}},textarea::placeholder{color:rgba(128,128,128,.4);font-family:'DM Sans',sans-serif}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${ac}40;border-radius:4px}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 24px",background:NAVBG,backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderBottom:`1px solid ${isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"}`,boxShadow:scroll>10?`0 4px 40px rgba(0,0,0,${isDark?.4:.1})`:undefined,transition:"box-shadow .3s",animation:"navIn .6s cubic-bezier(.34,1.1,.64,1) both"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{position:"relative"}}>
            {store.logo_url
              ?<img src={store.logo_url} alt="" style={{height:36,width:36,borderRadius:10,objectFit:"cover",boxShadow:`0 4px 18px ${ac}55`}}/>
              :<div style={{height:36,width:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:`linear-gradient(135deg,${ac},${ac}99)`,boxShadow:`0 4px 18px ${ac}55`}}>{NICHE_EMOJI[store.niche]||"✦"}</div>
            }
            <div style={{position:"absolute",bottom:-1,right:-1,height:10,width:10,borderRadius:"50%",background:"#22c55e",border:`2px solid ${isDark?"#080808":"#f4f4f0"}`}}/>
          </div>
          <div>
            <p style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:TEXT,lineHeight:1}}>{store.name}</p>
            <p style={{fontSize:10,color:SUB,marginTop:2,letterSpacing:".08em"}}>{NICHE_LABEL[store.niche]}</p>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* search toggle */}
          <div style={{position:"relative",overflow:"hidden",borderRadius:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,background:searchOpen?`${ac}14`:INPUTBG,border:`1px solid ${searchOpen?ac+"45":BORD}`,borderRadius:12,padding:"8px 14px",transition:"all .3s"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:searchOpen?ac:SUB,flexShrink:0}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setSearchOpen(true)} onBlur={()=>setSearchOpen(false)} placeholder="Search products..." style={{background:"transparent",border:"none",outline:"none",color:TEXT,fontSize:13,width:search||searchOpen?140:0,transition:"width .3s",fontFamily:"'DM Sans',sans-serif"}}/>
            </div>
          </div>
          {/* cart */}
          <button onClick={()=>setCartOpen(true)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:12,cursor:"pointer",border:`1px solid ${cartCount>0?ac+"45":BORD}`,background:cartCount>0?`${ac}14`:INPUTBG,color:cartCount>0?ac:SUB,fontWeight:700,fontSize:13,transition:"all .25s",position:"relative"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount>0&&<span style={{fontFamily:"'Syne',sans-serif",fontWeight:800}}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          FULL-VIEWPORT NICHE HERO — each niche has its own DNA
      ══════════════════════════════════════════════════════════ */}
      {(()=>{
        /* ── per-niche config ── */
        const NICHE_CONFIG:Record<string,{
          font:string; titleSize:string; titleWeight:string;
          tagline:string; layoutStyle:"centered"|"split"|"editorial"|"minimal";
          accentChar:string; patternEl:React.ReactNode;
        }> = {
          fashion:{
            font:"'Cormorant Garamond',serif",titleSize:"clamp(4.5rem,10vw,9rem)",titleWeight:"700",
            tagline:"Dress the life you deserve.",layoutStyle:"editorial",accentChar:"✦",
            patternEl:<>
              {/* Runway stripes */}
              {[0,1,2,3,4,5].map(i=>(
                <div key={i} style={{position:"absolute",top:0,bottom:0,left:`${8+i*16}%`,width:1,background:`linear-gradient(to bottom,transparent,rgba(${rgb.r},${rgb.g},${rgb.b},.12) 30%,rgba(${rgb.r},${rgb.g},${rgb.b},.18) 70%,transparent)`,pointerEvents:"none"}}/>
              ))}
              {/* Large editorial number */}
              <div style={{position:"absolute",right:"5%",top:"50%",transform:"translateY(-50%)",fontSize:"clamp(160px,22vw,280px)",fontWeight:900,color:`rgba(${rgb.r},${rgb.g},${rgb.b},.055)`,fontFamily:"'Cormorant Garamond',serif",lineHeight:1,pointerEvents:"none",userSelect:"none",letterSpacing:"-0.04em"}}>
                {new Date().getFullYear()}
              </div>
              {/* Horizontal rule */}
              <div style={{position:"absolute",left:0,right:0,top:"75%",height:1,background:`linear-gradient(to right,transparent 5%,rgba(${rgb.r},${rgb.g},${rgb.b},.18) 30%,rgba(${rgb.r},${rgb.g},${rgb.b},.18) 70%,transparent 95%)`,pointerEvents:"none"}}/>
            </>,
          },
          electronics:{
            font:"'Syne',sans-serif",titleSize:"clamp(3.5rem,9vw,8rem)",titleWeight:"800",
            tagline:"Technology that moves you forward.",layoutStyle:"split",accentChar:"⬡",
            patternEl:<>
              {/* Hex grid */}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.06,pointerEvents:"none"}} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
                {Array.from({length:60},(_,i)=>{const x=(i%8)*55+(Math.floor(i/8)%2)*27;const y=Math.floor(i/8)*48;const pts=Array.from({length:6},(_,j)=>{const a=Math.PI/3*j-Math.PI/6;return`${x+22*Math.cos(a)},${y+22*Math.sin(a)}`;}).join(" ");return <polygon key={i} points={pts} fill="none" stroke={ac} strokeWidth="0.8"/>;}).slice(0,40)}
              </svg>
              {/* Scan line */}
              <div style={{position:"absolute",inset:0,background:`repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(${rgb.r},${rgb.g},${rgb.b},.015) 3px,rgba(${rgb.r},${rgb.g},${rgb.b},.015) 4px)`,pointerEvents:"none"}}/>
            </>,
          },
          cosmetics:{
            font:"'Cormorant Garamond',serif",titleSize:"clamp(4rem,9.5vw,8.5rem)",titleWeight:"700",
            tagline:"Beauty is the art of being yourself.",layoutStyle:"centered",accentChar:"◈",
            patternEl:<>
              {/* Radial petal rings */}
              {[340,280,220].map((s,i)=>(
                <div key={i} style={{position:"absolute",top:"50%",left:"50%",transform:`translate(-50%,-50%) translate(${(mouse.x-.5)*-(i+1)*12}px,${(mouse.y-.5)*-(i+1)*8}px)`,width:s,height:s,borderRadius:"50%",border:`1px solid rgba(${rgb.r},${rgb.g},${rgb.b},${.12-i*.03})`,transition:"transform .2s linear",pointerEvents:"none"}}/>
              ))}
              {/* Soft glow blob */}
              <div style={{position:"absolute",top:"20%",right:"10%",width:400,height:400,borderRadius:"60% 40% 70% 30% / 50% 60% 40% 50%",background:`radial-gradient(ellipse,rgba(${rgb.r},${rgb.g},${rgb.b},.14) 0%,transparent 70%)`,pointerEvents:"none",animation:"blobFloat 7s ease-in-out infinite"}}/>
            </>,
          },
          food:{
            font:"'Syne',sans-serif",titleSize:"clamp(3.8rem,9vw,8rem)",titleWeight:"800",
            tagline:"Every bite tells a story.",layoutStyle:"centered",accentChar:"✿",
            patternEl:<>
              {/* Warm dot grid */}
              <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle,rgba(${rgb.r},${rgb.g},${rgb.b},.18) 1.5px,transparent 1.5px)`,backgroundSize:"38px 38px",pointerEvents:"none",opacity:.55}}/>
              {/* Curved decorative lines */}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.12,pointerEvents:"none"}} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
                <path d="M-50,250 Q200,50 400,250 T850,250" fill="none" stroke={ac} strokeWidth="1.5"/>
                <path d="M-50,320 Q200,120 400,320 T850,320" fill="none" stroke={ac} strokeWidth="1"/>
              </svg>
            </>,
          },
          sports:{
            font:"'Syne',sans-serif",titleSize:"clamp(4rem,10vw,9rem)",titleWeight:"800",
            tagline:"Outperform. Every. Day.",layoutStyle:"editorial",accentChar:"◆",
            patternEl:<>
              {/* Dynamic diagonal slashes */}
              {[0,1,2,3,4].map(i=>(
                <div key={i} style={{position:"absolute",top:-200,left:`${5+i*22}%`,width:3,height:"140%",background:`linear-gradient(to bottom,transparent,rgba(${rgb.r},${rgb.g},${rgb.b},.12),transparent)`,transform:"rotate(-12deg)",transformOrigin:"top",pointerEvents:"none"}}/>
              ))}
              {/* Bold speed lines */}
              <div style={{position:"absolute",top:0,right:0,bottom:0,width:"45%",background:`linear-gradient(to right,transparent,rgba(${rgb.r},${rgb.g},${rgb.b},.05))`,clipPath:"polygon(15% 0,100% 0,100% 100%,0 100%)",pointerEvents:"none"}}/>
            </>,
          },
          accessories:{
            font:"'Cormorant Garamond',serif",titleSize:"clamp(4.2rem,9.5vw,8.5rem)",titleWeight:"700",
            tagline:"The details make the difference.",layoutStyle:"centered",accentChar:"◇",
            patternEl:<>
              {/* Diamond grid */}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.07,pointerEvents:"none"}} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
                {Array.from({length:80},(_,i)=>{const x=(i%10)*45,y=Math.floor(i/10)*45;return <rect key={i} x={x+12} y={y+12} width={20} height={20} transform={`rotate(45,${x+22},${y+22})`} fill="none" stroke={ac} strokeWidth="0.7"/>;})}
              </svg>
            </>,
          },
          education:{
            font:"'Syne',sans-serif",titleSize:"clamp(3.5rem,8.5vw,7.5rem)",titleWeight:"800",
            tagline:"Knowledge is the ultimate luxury.",layoutStyle:"split",accentChar:"◉",
            patternEl:<>
              {/* Rule-of-thirds grid */}
              <div style={{position:"absolute",left:"33.33%",top:0,bottom:0,width:1,background:`rgba(${rgb.r},${rgb.g},${rgb.b},.09)`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",left:"66.66%",top:0,bottom:0,width:1,background:`rgba(${rgb.r},${rgb.g},${rgb.b},.09)`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",top:"33.33%",left:0,right:0,height:1,background:`rgba(${rgb.r},${rgb.g},${rgb.b},.09)`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",top:"66.66%",left:0,right:0,height:1,background:`rgba(${rgb.r},${rgb.g},${rgb.b},.09)`,pointerEvents:"none"}}/>
            </>,
          },
          other:{
            font:"'Cormorant Garamond',serif",titleSize:"clamp(4rem,9vw,8rem)",titleWeight:"700",
            tagline:"Curated for the discerning buyer.",layoutStyle:"centered",accentChar:"✦",
            patternEl:<>
              {[600,460,320].map((s,i)=>(
                <div key={i} style={{position:"absolute",top:"50%",left:"50%",transform:`translate(-50%,-50%)`,width:s,height:s,borderRadius:"50%",border:`1px solid rgba(${rgb.r},${rgb.g},${rgb.b},${.1-i*.025})`,pointerEvents:"none"}}/>
              ))}
            </>,
          },
        };
        const cfg=NICHE_CONFIG[store.niche]||NICHE_CONFIG.other;
        const isEditorial=cfg.layoutStyle==="editorial";
        const isSplit=cfg.layoutStyle==="split";

        return(
          <section style={{position:"relative",overflow:"hidden",minHeight:"100vh",paddingTop:66,display:"flex",flexDirection:"column"}}>
            {/* Canvas */}
            <LuxuryCanvas ac={ac} mouse={mouse}/>

            {/* Base bg gradient */}
            <div style={{position:"absolute",inset:0,pointerEvents:"none",
              background:isDark
                ?`radial-gradient(ellipse 100% 80% at ${15+mouse.x*8}% ${35+mouse.y*12}%,rgba(${rgb.r},${rgb.g},${rgb.b},.2) 0%,transparent 55%),radial-gradient(ellipse 70% 60% at ${75+mouse.x*4}% ${65+mouse.y*5}%,rgba(${rgb.r},${rgb.g},${rgb.b},.1) 0%,transparent 50%),linear-gradient(180deg,${BG} 0%,${BG}00 25%,${BG}00 75%,${BG} 100%)`
                :`radial-gradient(ellipse 100% 80% at ${15+mouse.x*8}% ${35+mouse.y*12}%,rgba(${rgb.r},${rgb.g},${rgb.b},.14) 0%,transparent 55%),radial-gradient(ellipse 70% 60% at ${75+mouse.x*4}% ${65+mouse.y*5}%,rgba(${rgb.r},${rgb.g},${rgb.b},.07) 0%,transparent 50%),linear-gradient(180deg,${BG} 0%,${BG}00 20%,${BG}00 75%,${BG} 100%)`
            }}/>

            {/* Niche pattern layer */}
            {cfg.patternEl}

            {/* ── EDITORIAL layout (fashion / sports) — left-aligned, giant ── */}
            {isEditorial&&(
              <div style={{position:"relative",zIndex:10,flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 6vw 80px",maxWidth:1400,margin:"0 auto",width:"100%"}}>
                {/* eyebrow */}
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24,animation:"heroWord .7s cubic-bezier(.34,1.1,.64,1) .08s both"}}>
                  <div style={{height:2,width:40,background:ac,borderRadius:2}}/>
                  <span style={{fontSize:11,fontWeight:800,letterSpacing:".3em",textTransform:"uppercase",color:ac}}>{NICHE_LABEL[store.niche]} Collection</span>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:16,padding:"5px 14px",borderRadius:999,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.3)"}}>
                    <span style={{height:6,width:6,borderRadius:"50%",background:"#4ade80",animation:"pulse 1.5s infinite"}}/>
                    <span style={{fontSize:9,fontWeight:800,letterSpacing:".25em",textTransform:"uppercase",color:"#4ade80"}}>Live Store</span>
                  </div>
                </div>

                {/* Giant store name — split into lines */}
                <div style={{marginBottom:32,animation:"heroWord .95s cubic-bezier(.34,1.1,.64,1) .18s both"}}>
                  {store.name.split(" ").map((word,wi)=>(
                    <div key={wi} style={{overflow:"hidden",lineHeight:.92}}>
                      <h1 style={{fontFamily:cfg.font,fontWeight:cfg.titleWeight as any,color:wi%2===1&&isDark?`rgba(${rgb.r},${rgb.g},${rgb.b},.75)`:TEXT,fontSize:cfg.titleSize,lineHeight:.92,letterSpacing:"-.03em",margin:0,display:"block",animation:`heroWord .95s cubic-bezier(.34,1.1,.64,1) ${.18+wi*.14}s both`,transform:`translate(${(mouse.x-.5)*-(wi+1)*4}px,${(mouse.y-.5)*-(wi+1)*2}px)`,transition:"transform .15s linear",WebkitTextStroke:wi%2===1&&!isDark?`2px ${ac}`:undefined,WebkitTextFillColor:wi%2===1&&!isDark?"transparent":undefined}}>
                        {word}
                      </h1>
                    </div>
                  ))}
                </div>

                {/* logo + description row */}
                <div style={{display:"flex",alignItems:"flex-start",gap:28,flexWrap:"wrap",animation:"heroWord .8s cubic-bezier(.34,1.1,.64,1) .45s both"}}>
                  {/* logo pill */}
                  <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 20px 12px 12px",borderRadius:999,background:isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",border:`1px solid rgba(${rgb.r},${rgb.g},${rgb.b},.25)`,backdropFilter:"blur(10px)",flexShrink:0}}>
                    <div style={{width:44,height:44,borderRadius:"50%",overflow:"hidden",flexShrink:0,background:`linear-gradient(135deg,${ac},${ac}88)`,boxShadow:`0 8px 24px ${ac}50`}}>
                      {store.logo_url?<img src={store.logo_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{display:"flex",height:"100%",alignItems:"center",justifyContent:"center",fontSize:22}}>{NICHE_EMOJI[store.niche]||cfg.accentChar}</span>}
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:800,color:TEXT,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{store.name}</p>
                      <p style={{fontSize:10,color:SUB,marginTop:3,letterSpacing:".1em"}}>{products.length} products available</p>
                    </div>
                  </div>

                  {store.description&&(
                    <div style={{flex:1,minWidth:260,maxWidth:480}}>
                      <div style={{width:36,height:2,background:ac,marginBottom:12,borderRadius:2}}/>
                      <p style={{fontSize:"clamp(15px,1.8vw,18px)",lineHeight:1.7,color:SUB,fontFamily:"'DM Sans',sans-serif",fontStyle:"italic"}}>{store.description}</p>
                    </div>
                  )}
                </div>

                {/* Scroll CTA */}
                <button onClick={()=>document.getElementById("shop-section")?.scrollIntoView({behavior:"smooth"})}
                  style={{marginTop:44,alignSelf:"flex-start",display:"flex",alignItems:"center",gap:10,padding:"14px 32px",borderRadius:999,background:`linear-gradient(135deg,${ac},${ac}cc)`,color:"#fff",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,letterSpacing:".12em",cursor:"pointer",border:"none",boxShadow:`0 12px 40px ${ac}55,0 4px 12px rgba(0,0,0,.3)`,animation:"heroWord .8s cubic-bezier(.34,1.1,.64,1) .6s both"}}>
                  <span>Shop the Collection</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            )}

            {/* ── SPLIT layout (electronics / education) — left text, right visual ── */}
            {isSplit&&(
              <div style={{position:"relative",zIndex:10,flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,alignItems:"center",padding:"0 0 60px",maxWidth:1400,margin:"0 auto",width:"100%"}}>
                {/* Left */}
                <div style={{padding:"40px 6vw 40px 8vw",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28,animation:"heroWord .7s cubic-bezier(.34,1.1,.64,1) .08s both"}}>
                    <div style={{height:2,width:32,background:ac}}/>
                    <span style={{fontSize:10,fontWeight:800,letterSpacing:".28em",textTransform:"uppercase",color:ac}}>{NICHE_LABEL[store.niche]}</span>
                    <span style={{display:"flex",alignItems:"center",gap:5,fontSize:9,fontWeight:800,letterSpacing:".2em",textTransform:"uppercase",padding:"4px 12px",borderRadius:999,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.3)",color:"#4ade80"}}>
                      <span style={{height:5,width:5,borderRadius:"50%",background:"#4ade80",animation:"pulse 1.5s infinite"}}/>Live
                    </span>
                  </div>

                  <h1 style={{fontFamily:cfg.font,fontWeight:cfg.titleWeight as any,fontSize:cfg.titleSize,color:TEXT,letterSpacing:"-.03em",lineHeight:.92,margin:"0 0 24px",animation:"heroWord .95s cubic-bezier(.34,1.1,.64,1) .18s both"}}>
                    {store.name.split(" ").map((w,i)=>(
                      <span key={i} style={{display:"block",color:i===1?ac:TEXT}}>{w}</span>
                    ))}
                  </h1>

                  {store.description&&(
                    <p style={{fontSize:17,lineHeight:1.72,color:SUB,marginBottom:36,maxWidth:400,fontFamily:"'DM Sans',sans-serif",animation:"heroWord .8s cubic-bezier(.34,1.1,.64,1) .32s both"}}>
                      {store.description}
                    </p>
                  )}

                  <div style={{display:"flex",gap:12,flexWrap:"wrap",animation:"heroWord .8s cubic-bezier(.34,1.1,.64,1) .44s both"}}>
                    <button onClick={()=>document.getElementById("shop-section")?.scrollIntoView({behavior:"smooth"})}
                      style={{display:"flex",alignItems:"center",gap:8,padding:"13px 28px",borderRadius:12,background:`linear-gradient(135deg,${ac},${ac}cc)`,color:"#fff",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,cursor:"pointer",border:"none",boxShadow:`0 10px 32px ${ac}50`}}>
                      Shop Now <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"13px 20px",borderRadius:12,background:isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)",border:`1px solid ${BORD}`,color:SUB,fontSize:13}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ac} strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      <span style={{fontWeight:700}}>{products.length} Products</span>
                    </div>
                  </div>
                </div>

                {/* Right — large logo display */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 8vw 40px 0",animation:"heroWord .9s cubic-bezier(.34,1.1,.64,1) .25s both"}}>
                  <div style={{position:"relative"}}>
                    {/* Glow rings */}
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:280,height:280,borderRadius:"50%",border:`1px solid rgba(${rgb.r},${rgb.g},${rgb.b},.2)`,pointerEvents:"none"}}/>
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:340,height:340,borderRadius:"50%",border:`1px solid rgba(${rgb.r},${rgb.g},${rgb.b},.1)`,pointerEvents:"none"}}/>
                    <div style={{width:160,height:160,borderRadius:32,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:64,background:`linear-gradient(145deg,${ac},${ac}77)`,boxShadow:`0 32px 80px ${ac}60,0 0 0 1px ${ac}40,inset 0 1px 0 rgba(255,255,255,.3)`,position:"relative",zIndex:1}}>
                      {store.logo_url?<img src={store.logo_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span>{NICHE_EMOJI[store.niche]||cfg.accentChar}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CENTERED layout (cosmetics, food, accessories, other) — full centered luxury ── */}
            {!isEditorial&&!isSplit&&(
              <div style={{position:"relative",zIndex:10,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"60px 24px 80px",maxWidth:900,margin:"0 auto",width:"100%"}}>
                {/* Logo — big */}
                <div style={{marginBottom:32,animation:"heroWord .7s cubic-bezier(.34,1.1,.64,1) .05s both",transform:`translate(${(mouse.x-.5)*-12}px,${(mouse.y-.5)*-8}px)`,transition:"transform .15s linear"}}>
                  <div style={{position:"relative",display:"inline-block"}}>
                    <div style={{width:112,height:112,borderRadius:28,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,background:`linear-gradient(145deg,${ac},${ac}88)`,boxShadow:`0 28px 80px ${ac}65,inset 0 1px 0 rgba(255,255,255,.35),0 0 0 1px ${ac}35`}}>
                      {store.logo_url?<img src={store.logo_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:NICHE_EMOJI[store.niche]||cfg.accentChar}
                    </div>
                    {/* orbit dot */}
                    <div style={{position:"absolute",top:8,right:-6,width:18,height:18,borderRadius:"50%",background:"#22c55e",border:`3px solid ${BG}`,boxShadow:"0 4px 12px rgba(34,197,94,.5)",animation:"pulse 2s infinite"}}/>
                  </div>
                </div>

                {/* Eyebrow */}
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,animation:"heroWord .7s cubic-bezier(.34,1.1,.64,1) .12s both"}}>
                  <div style={{height:1,width:44,background:`linear-gradient(to right,transparent,rgba(${rgb.r},${rgb.g},${rgb.b},.5))`}}/>
                  <span style={{fontSize:10,fontWeight:800,letterSpacing:".32em",textTransform:"uppercase",color:ac}}>{NICHE_LABEL[store.niche]}</span>
                  <div style={{height:1,width:44,background:`linear-gradient(to left,transparent,rgba(${rgb.r},${rgb.g},${rgb.b},.5))`}}/>
                </div>

                {/* Giant store name */}
                <h1 style={{fontFamily:cfg.font,fontWeight:cfg.titleWeight as any,fontSize:cfg.titleSize,color:TEXT,letterSpacing:"-.025em",lineHeight:.9,marginBottom:0,textShadow:isDark?`0 0 120px rgba(${rgb.r},${rgb.g},${rgb.b},.45),0 4px 60px rgba(0,0,0,.9)`:undefined,transform:`translate(${(mouse.x-.5)*-5}px,${(mouse.y-.5)*-3}px)`,transition:"transform .15s linear",animation:"heroWord 1s cubic-bezier(.34,1.1,.64,1) .2s both"}}>
                  {store.name}
                </h1>

                {/* Tagline */}
                <p style={{fontSize:14,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:`rgba(${rgb.r},${rgb.g},${rgb.b},.7)`,marginTop:20,marginBottom:0,fontFamily:"'DM Sans',sans-serif",animation:"heroWord .8s cubic-bezier(.34,1.1,.64,1) .35s both"}}>
                  {cfg.tagline}
                </p>

                {/* Divider */}
                <div style={{display:"flex",alignItems:"center",gap:16,margin:"28px 0",animation:"heroWord .7s cubic-bezier(.34,1.1,.64,1) .42s both"}}>
                  <div style={{height:1,width:80,background:`linear-gradient(to right,transparent,rgba(${rgb.r},${rgb.g},${rgb.b},.4))`}}/>
                  <span style={{fontSize:18,color:`rgba(${rgb.r},${rgb.g},${rgb.b},.6)`}}>{cfg.accentChar}</span>
                  <div style={{height:1,width:80,background:`linear-gradient(to left,transparent,rgba(${rgb.r},${rgb.g},${rgb.b},.4))`}}/>
                </div>

                {store.description&&(
                  <p style={{fontSize:"clamp(15px,1.9vw,19px)",lineHeight:1.75,color:SUB,maxWidth:560,marginBottom:36,fontFamily:"'DM Sans',sans-serif",fontStyle:"italic",animation:"heroWord .8s cubic-bezier(.34,1.1,.64,1) .5s both"}}>
                    "{store.description}"
                  </p>
                )}

                {/* Pill badges row */}
                <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",marginBottom:40,animation:"heroWord .8s cubic-bezier(.34,1.1,.64,1) .58s both"}}>
                  <span style={{fontSize:10,fontWeight:800,letterSpacing:".18em",textTransform:"uppercase",padding:"9px 22px",borderRadius:999,background:`${ac}1a`,border:`1px solid ${ac}40`,color:ac}}>{NICHE_LABEL[store.niche]}</span>
                  <span style={{display:"flex",alignItems:"center",gap:7,fontSize:10,fontWeight:800,letterSpacing:".18em",textTransform:"uppercase",padding:"9px 22px",borderRadius:999,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.3)",color:"#4ade80"}}>
                    <span style={{height:6,width:6,borderRadius:"50%",background:"#4ade80",animation:"pulse 1.5s infinite"}}/>Live Now
                  </span>
                  <span style={{fontSize:10,fontWeight:800,letterSpacing:".18em",textTransform:"uppercase",padding:"9px 22px",borderRadius:999,background:INPUTBG,border:`1px solid ${BORD}`,color:SUB}}>{products.length} Products</span>
                </div>

                {/* CTA */}
                <button onClick={()=>document.getElementById("shop-section")?.scrollIntoView({behavior:"smooth"})}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"15px 36px",borderRadius:999,background:`linear-gradient(135deg,${ac},${ac}cc)`,color:"#fff",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,letterSpacing:".1em",cursor:"pointer",border:"none",boxShadow:`0 14px 44px ${ac}55,0 4px 14px rgba(0,0,0,.35)`,animation:"heroWord .8s cubic-bezier(.34,1.1,.64,1) .65s both"}}>
                  Explore Collection
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            )}

            {/* Bottom page-bleed fade */}
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:160,background:`linear-gradient(to bottom,transparent,${BG})`,pointerEvents:"none"}}/>

            {/* Scroll indicator — animated chevrons */}
            <div style={{position:"absolute",bottom:28,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:4,animation:"heroWord 1s ease .9s both",opacity:.45}}>
              {[0,1,2].map(i=>(
                <svg key={i} width="16" height="10" viewBox="0 0 24 14" fill="none" stroke={ac} strokeWidth="2" style={{animation:`scrollBounce 1.8s ease ${i*.2}s infinite`}}><polyline points="2 2 12 12 22 2"/></svg>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ── SECTION DIVIDER ── */}
      {/* ══ CATEGORIES + SECTION HEADER ══ */}
      <div id="shop-section" style={{maxWidth:1280,margin:"0 auto",padding:"52px 24px 0"}}>

        {/* Section title row */}
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:28}}>
          <div style={{flex:1,height:1,background:`linear-gradient(to right,rgba(${rgb.r},${rgb.g},${rgb.b},.35),transparent)`}}/>
          <span style={{fontSize:9,fontWeight:800,letterSpacing:".32em",textTransform:"uppercase",color:SUB}}>
            {activeCat!==null
              ? (categories.find(c=>c.id===activeCat)?.name||"Collection")
              : "Full Collection"}
            {" · "}{filtered.length} item{filtered.length!==1?"s":""}
          </span>
          <div style={{flex:1,height:1,background:`linear-gradient(to left,rgba(${rgb.r},${rgb.g},${rgb.b},.35),transparent)`}}/>
        </div>

        {/* Category filter tabs */}
        {categories.length>0&&(
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:36}}>
            {/* All tab */}
            <button onClick={()=>setActiveCat(null)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:999,cursor:"pointer",border:`1.5px solid ${activeCat===null?ac:isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.1)"}`,background:activeCat===null?`linear-gradient(135deg,${ac},${ac}cc)`:(isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)"),color:activeCat===null?"#fff":SUB,fontWeight:800,fontSize:12,letterSpacing:".08em",transition:"all .25s",boxShadow:activeCat===null?`0 6px 20px ${ac}45`:undefined}}>
              <CatIcon k="FiGrid" size={14} color={activeCat===null?"#fff":SUB}/>
              <span>All</span>
              <span style={{fontSize:10,opacity:.7,fontWeight:700}}>({products.length})</span>
            </button>
            {/* Category tabs */}
            {categories.map(cat=>{
              const count=products.filter(p=>p.category===cat.id).length;
              const isActive=activeCat===cat.id;
              return(
                <button key={cat.id} onClick={()=>setActiveCat(isActive?null:cat.id)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:999,cursor:"pointer",border:`1.5px solid ${isActive?ac:isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.1)"}`,background:isActive?`linear-gradient(135deg,${ac},${ac}cc)`:(isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)"),color:isActive?"#fff":SUB,fontWeight:800,fontSize:12,letterSpacing:".08em",transition:"all .25s",boxShadow:isActive?`0 6px 20px ${ac}45`:undefined}}>
                  <CatIcon k={cat.icon||"FiPackage"} size={14} color={isActive?"#fff":SUB}/>
                  <span>{cat.name}</span>
                  <span style={{fontSize:10,opacity:.7,fontWeight:700}}>({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ PRODUCT GRID — bigger, 2-3 col ══ */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"0 24px 80px"}}>
        {!filtered.length
          ?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"96px 0",textAlign:"center"}}>
            <div style={{fontSize:56,opacity:.2}}>{search?"🔍":activeCat!==null?"📂":"📦"}</div>
            <p style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:SUB}}>
              {search?"No results found":activeCat!==null?"No products in this category":"No products yet"}
            </p>
            {(search||activeCat!==null)&&(
              <button onClick={()=>{setSearch("");setActiveCat(null);}} style={{padding:"10px 24px",borderRadius:999,background:`${ac}18`,border:`1px solid ${ac}40`,color:ac,fontWeight:800,fontSize:13,cursor:"pointer"}}>
                Clear filter
              </button>
            )}
          </div>
          :<div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,340px),1fr))",
              gap:24,
            }}>
            {filtered.map((p,i)=>(
              <ProductCard key={p.id} p={p} ac={ac} btnStyle={btnStyle} dark={isDark}
                onView={setViewProd} onAdd={p=>{addToCart(p);}} idx={i}/>
            ))}
          </div>
        }
      </div>

      {/* ── FOOTER ── */}
      <div style={{borderTop:`1px solid ${isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.06)"}`,padding:"32px 24px",textAlign:"center"}}>
        <p style={{fontSize:11,letterSpacing:".22em",textTransform:"uppercase",color:isDark?"rgba(255,255,255,.18)":"rgba(0,0,0,.22)"}}>
          Powered by <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:ac}}>Bazario</span>
        </p>
      </div>

      {/* ── OVERLAYS ── */}
      {cartOpen&&<CartDrawer cart={cart} ac={ac} btnStyle={btnStyle} dark={isDark} onClose={()=>setCartOpen(false)} onUpdate={updateCart} onCheckout={()=>{setCartOpen(false);setCheckout(true);}}/>}
      {checkout&&<CheckoutModal cart={cart} ac={ac} dark={isDark} storeId={store.id} onClose={()=>setCheckout(false)} onSuccess={()=>{setCheckout(false);setSuccess(true);}}/>}
      {viewProd&&<ProductDetailModal product={viewProd} ac={ac} btnStyle={btnStyle} dark={isDark} onClose={()=>setViewProd(null)} onAdd={addToCart}/>}
    </div>
  );
}