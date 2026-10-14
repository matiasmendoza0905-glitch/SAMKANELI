/* =====================================================================
   SAMKANELI · script.js  (JavaScript vanilla, compartido por las 11 páginas)
   Módulos: menú · revelado · carrusel · lightbox · pestañas · filtros ·
   contacto (config.js) · copiar color · video opcional · formulario demo.
   Cada módulo solo actúa si encuentra sus elementos en la página.
   ===================================================================== */
(function(){
"use strict";
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Menú ---------- */
var toggle=$(".nav-toggle"), nav=$("#menu");
function setNav(open){
  if(!toggle||!nav) return;
  nav.classList.toggle("open",open); toggle.setAttribute("aria-expanded",open);
  toggle.setAttribute("aria-label",open?"Cerrar menú":"Abrir menú"); document.body.classList.toggle("nav-open",open);
}
if(toggle){ toggle.addEventListener("click",function(){setNav(!nav.classList.contains("open"))});
  $$("#menu a").forEach(function(a){a.addEventListener("click",function(){setNav(false)})}); }
function closeSubs(except){ $$(".has-sub").forEach(function(li){ if(li!==except){li.classList.remove("open");var b=$(".sub-btn",li);b&&b.setAttribute("aria-expanded","false");} }); }
$$(".sub-btn").forEach(function(b){
  b.addEventListener("click",function(e){ e.stopPropagation(); var li=b.parentNode, o=!li.classList.contains("open"); closeSubs(li); li.classList.toggle("open",o); b.setAttribute("aria-expanded",o); });
});
document.addEventListener("click",function(e){ if(!e.target.closest(".has-sub")) closeSubs(); });
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){ var lbOpen=$(".lb.open"); if(lbOpen) return; if(nav&&nav.classList.contains("open")){setNav(false);toggle.focus();} closeSubs(); }
});
if(window.matchMedia){ window.matchMedia("(min-width:1181px)").addEventListener("change",function(){setNav(false)}); }

/* ---------- Revelado ---------- */
var rv=$$(".reveal");
if("IntersectionObserver" in window && !reduce){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12,rootMargin:"0px 0px -5% 0px"});
  rv.forEach(function(el){io.observe(el)});
}else{ rv.forEach(function(el){el.classList.add("in")}); }

/* ---------- Carrusel ---------- */
$$("[data-carousel]").forEach(function(c){
  var track=$(".car-track",c), slides=$$(".car-slide",c), n=slides.length, idx=0;
  var count=$(".car-count",c), dotsBox=$(".car-dots",c), autoBtn=$(".car-auto",c), timer=null;
  var dots=slides.map(function(_,i){var d=document.createElement("button");d.type="button";d.className="car-dot";d.setAttribute("aria-label","Ir a la diapositiva "+(i+1));d.addEventListener("click",function(){go(i)});dotsBox.appendChild(d);return d});
  function paint(){ count.textContent=(idx+1)+" / "+n; dots.forEach(function(d,i){d.setAttribute("aria-current",i===idx)}); }
  function go(i){ idx=(i+n)%n; track.scrollTo({left:slides[idx].offsetLeft-track.offsetLeft,behavior:reduce?"auto":"smooth"}); paint(); }
  function current(){ var best=0,min=1e9; slides.forEach(function(s,i){var d=Math.abs(s.offsetLeft-track.offsetLeft-track.scrollLeft);if(d<min){min=d;best=i}}); return best; }
  var st; track.addEventListener("scroll",function(){clearTimeout(st);st=setTimeout(function(){idx=current();paint()},60)},{passive:true});
  $(".car-prev",c).addEventListener("click",function(){go(idx-1)}); $(".car-next",c).addEventListener("click",function(){go(idx+1)});
  track.addEventListener("keydown",function(e){ if(e.key==="ArrowRight"){e.preventDefault();go(idx+1)} if(e.key==="ArrowLeft"){e.preventDefault();go(idx-1)} });
  /* arrastre con ratón (el tacto usa el desplazamiento nativo) */
  var down=false,sx=0,sl=0,moved=false;
  track.addEventListener("pointerdown",function(e){ if(e.pointerType!=="mouse")return; down=true;moved=false;sx=e.clientX;sl=track.scrollLeft; });
  window.addEventListener("pointermove",function(e){ if(!down)return; var dx=e.clientX-sx; if(Math.abs(dx)>5){moved=true;track.classList.add("dragging");} if(moved) track.scrollLeft=sl-dx; });
  window.addEventListener("pointerup",function(){ if(!down)return; down=false; if(moved){track.classList.remove("dragging");go(current());} });
  track.addEventListener("click",function(e){ if(moved){e.stopPropagation();e.preventDefault();moved=false;} },true);
  /* autoplay opcional, apagado por defecto */
  function stop(){clearInterval(timer);timer=null;if(autoBtn){autoBtn.setAttribute("aria-pressed","false");autoBtn.textContent="▶ Auto";autoBtn.setAttribute("aria-label","Activar avance automático");}}
  function start(){ if(reduce) return; timer=setInterval(function(){go(idx+1)},6000); autoBtn.setAttribute("aria-pressed","true");autoBtn.textContent="❚❚ Pausa";autoBtn.setAttribute("aria-label","Pausar avance automático"); }
  if(autoBtn){ autoBtn.addEventListener("click",function(){timer?stop():start()}); ["pointerdown","focusin","mouseenter"].forEach(function(ev){c.addEventListener(ev,function(){if(timer)stop()})}); }
  paint();
});

/* ---------- Lightbox ---------- */
var lb=null,lbItems=[],lbI=0,lastFocus=null;
function buildLb(){
  lb=document.createElement("div"); lb.className="lb"; lb.setAttribute("role","dialog"); lb.setAttribute("aria-modal","true"); lb.setAttribute("aria-label","Vista ampliada de imagen");
  lb.innerHTML='<div class="lb-top"><span class="lb-count" aria-live="polite"></span><button type="button" class="lb-btn lb-close" aria-label="Cerrar vista ampliada">✕</button></div>'+
   '<button type="button" class="lb-btn lb-nav lb-prev" aria-label="Imagen anterior">‹</button><figure class="lb-fig"><img alt=""><figcaption class="lb-cap"></figcaption></figure>'+
   '<button type="button" class="lb-btn lb-nav lb-next" aria-label="Imagen siguiente">›</button>';
  document.body.appendChild(lb);
  $(".lb-close",lb).addEventListener("click",closeLb);
  $(".lb-prev",lb).addEventListener("click",function(){showLb(lbI-1)}); $(".lb-next",lb).addEventListener("click",function(){showLb(lbI+1)});
  lb.addEventListener("click",function(e){ if(e.target===lb||e.target.classList.contains("lb-top")) closeLb(); });
  var tx=null; lb.addEventListener("touchstart",function(e){tx=e.touches[0].clientX},{passive:true});
  lb.addEventListener("touchend",function(e){ if(tx===null)return; var dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>50) showLb(lbI+(dx<0?1:-1)); tx=null; },{passive:true});
}
function showLb(i){
  if(!lbItems.length) return; lbI=(i+lbItems.length)%lbItems.length; var el=lbItems[lbI];
  var im=$("img",lb); im.src=el.currentSrc||el.src; im.alt=el.alt; $(".lb-cap",lb).textContent=el.getAttribute("data-caption")||el.alt;
  $(".lb-count",lb).textContent=lbItems.length>1?(lbI+1)+" / "+lbItems.length:"";
  var multi=lbItems.length>1; $(".lb-prev",lb).style.display=multi?"":"none"; $(".lb-next",lb).style.display=multi?"":"none";
}
function openLb(el){
  if(!lb) buildLb(); var g=el.getAttribute("data-group");
  lbItems=$$('img[data-lightbox][data-group="'+g+'"]'); lastFocus=document.activeElement;
  lb.classList.add("open"); document.body.style.overflow="hidden"; showLb(lbItems.indexOf(el)); $(".lb-close",lb).focus();
}
function closeLb(){ lb.classList.remove("open"); document.body.style.overflow=""; if(lastFocus) lastFocus.focus(); }
document.addEventListener("click",function(e){ var t=e.target; if(t.matches&&t.matches("img[data-lightbox]")){ e.preventDefault(); openLb(t); } });
document.addEventListener("keydown",function(e){
  if(!lb||!lb.classList.contains("open")) return;
  if(e.key==="Escape") closeLb(); else if(e.key==="ArrowRight") showLb(lbI+1); else if(e.key==="ArrowLeft") showLb(lbI-1);
  else if(e.key==="Tab"){ var f=$$("button",lb).filter(function(b){return b.offsetParent!==null}); var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()} else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()} }
});

/* ---------- Pestañas (data-tabs) ---------- */
$$("[data-tabs]").forEach(function(box){
  var tabs=$$('[role="tab"]',box), panels=$$('[role="tabpanel"]',box);
  function sel(t,focus){ tabs.forEach(function(x){var on=x===t;x.setAttribute("aria-selected",on);x.tabIndex=on?0:-1}); panels.forEach(function(p){p.hidden=p.id!==t.getAttribute("aria-controls")}); if(focus)t.focus(); }
  tabs.forEach(function(t,i){ t.addEventListener("click",function(){sel(t)});
    t.addEventListener("keydown",function(e){ var k=e.key; if(k==="ArrowRight")sel(tabs[(i+1)%tabs.length],true); else if(k==="ArrowLeft")sel(tabs[(i-1+tabs.length)%tabs.length],true); else if(k==="Home")sel(tabs[0],true); else if(k==="End")sel(tabs[tabs.length-1],true); }); });
  sel(tabs[0]);
});

/* ---------- Filtros (data-filter-group + data-cat) ---------- */
$$("[data-filter-group]").forEach(function(g){
  var target=$(g.getAttribute("data-filter-group")); if(!target) return; var btns=$$("button",g), items=$$("[data-cat]",target), out=$("[data-filter-count]");
  btns.forEach(function(b){ b.addEventListener("click",function(){
    var f=b.getAttribute("data-filter"), n=0; btns.forEach(function(x){x.setAttribute("aria-pressed",x===b)});
    items.forEach(function(it){var show=f==="todas"||it.getAttribute("data-cat").split(" ").indexOf(f)>-1;it.hidden=!show;if(show)n++});
    if(out) out.textContent=n+(n===1?" aplicación":" aplicaciones");
  }); });
});

/* ---------- Contacto desde config.js ---------- */
var C=window.SAMKANELI_CONFIG||{};
function ok(v){return typeof v==="string"&&v.trim()!==""}
$$("[data-contact]").forEach(function(a){
  var k=a.getAttribute("data-contact"), v=C[k], href=null;
  if(!ok(v)) return;
  if(k==="whatsapp") href="https://wa.me/"+v.replace(/\D/g,"")+"?text="+encodeURIComponent(C.mensajeWhatsapp||"");
  else if(k==="email") href="mailto:"+v; else href=v;
  a.setAttribute("href",href); if(k!=="email"){a.setAttribute("target","_blank");a.setAttribute("rel","noopener noreferrer");}
  a.classList.add("is-active");
});
$$("[data-contact-text]").forEach(function(el){
  var k=el.getAttribute("data-contact-text"), v=C[k];
  if(ok(v)){ el.textContent=v; el.classList.remove("pending"); }
});
$$("[data-contact-status]").forEach(function(el){
  var k=el.getAttribute("data-contact-status"); el.hidden=!(ok(C[k])===(el.getAttribute("data-when")==="set"));
});

/* ---------- Copiar color ---------- */
$$("[data-copy]").forEach(function(b){ b.addEventListener("click",function(){
  var t=b.getAttribute("data-copy"), lab=b.getAttribute("data-label")||b.textContent;
  function done(){ b.textContent="¡Copiado!"; setTimeout(function(){b.textContent=lab},1400); }
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done,function(){b.textContent=t;});
  else { var ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");done()}catch(_){b.textContent=t}document.body.removeChild(ta); }
}); });

/* ---------- Video opcional (solo pide el archivo al pulsar) ---------- */
$$("[data-video-slot]").forEach(function(box){
  var btn=$(".video-play",box), note=$(".video-note",box), src=box.getAttribute("data-video-slot");
  if(!btn) return;
  btn.addEventListener("click",function(){
    var v=document.createElement("video"); v.controls=true; v.playsInline=true; v.preload="metadata"; v.className="video-el";
    v.setAttribute("aria-label","Video de presentación de SAMKANELI");
    v.addEventListener("error",function(){ v.remove(); btn.hidden=false; if(note){note.hidden=false;} },{once:true});
    v.src=src; $(".video-stage",box).appendChild(v); btn.hidden=true; if(note) note.hidden=true;
    var p=v.play(); if(p&&p.catch)p.catch(function(){});
  });
});

/* ---------- Formulario de contacto: DEMOSTRACIÓN local ---------- */
$$("form[data-demo-form]").forEach(function(f){
  var msg=$(".form-msg",f);
  f.addEventListener("submit",function(e){
    e.preventDefault(); var bad=null;
    $$("[required]",f).forEach(function(i){ var err=$("#"+i.id+"-err"); var v=!i.value.trim()||(i.type==="email"&&i.value&&!/^\S+@\S+\.\S+$/.test(i.value)); i.setAttribute("aria-invalid",v); if(err) err.hidden=!v; if(v&&!bad) bad=i; });
    if(bad){ msg.textContent="Revisa los campos marcados."; msg.className="form-msg err"; bad.focus(); return; }
    msg.textContent="Demostración visual: tu mensaje NO se envió a ningún servidor. Para recibir consultas reales, activa un canal en config.js."; msg.className="form-msg ok"; f.reset();
  });
});
})();
