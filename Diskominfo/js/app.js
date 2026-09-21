
(() => {
  "use strict";
  const body=document.body;
  const qs=(s,p=document)=>p.querySelector(s);
  const qsa=(s,p=document)=>[...p.querySelectorAll(s)];

  const mobile=qs(".mobile-panel");
  const mobileOpenButton=qs(".mobile-open");
  const mobileCloseButton=qs(".mobile-close");
  const syncBodyLock=()=>body.classList.toggle("locked",Boolean(
    mobile?.classList.contains("open")||qs(".search-overlay")?.classList.contains("open")
  ));
  const openMobile=()=>{
    if(mobile)mobile.inert=false;
    mobile?.classList.add("open");
    mobile?.setAttribute("aria-hidden","false");
    mobileOpenButton?.setAttribute("aria-expanded","true");
    syncBodyLock();
    setTimeout(()=>mobileCloseButton?.focus(),80);
  };
  const closeMobile=(restoreFocus=true)=>{
    const wasOpen=mobile?.classList.contains("open");
    if(wasOpen&&restoreFocus)mobileOpenButton?.focus();
    mobile?.classList.remove("open");
    mobile?.setAttribute("aria-hidden","true");
    if(mobile)mobile.inert=true;
    mobileOpenButton?.setAttribute("aria-expanded","false");
    syncBodyLock();
  };
  mobileOpenButton?.setAttribute("aria-expanded","false");
  mobileOpenButton?.setAttribute("aria-controls","mobileNavigation");
  mobile?.setAttribute("id","mobileNavigation");
  if(mobile)mobile.inert=true;
  mobileCloseButton?.setAttribute("aria-label","Tutup menu");
  mobileOpenButton?.addEventListener("click",openMobile);
  mobileCloseButton?.addEventListener("click",()=>closeMobile());
  qsa(".mobile-panel a").forEach(a=>a.addEventListener("click",closeMobile));

  const overlay=qs(".search-overlay"), input=qs("#siteSearch"), results=qs("#searchResults");
  const desktopSearchButton=qs(".search-open");
  const searchCloseButton=qs(".search-close");
  let searchReturnFocus=null;
  const openSearch=(returnTarget=document.activeElement)=>{
    const mobileWasOpen=mobile?.classList.contains("open");
    if(mobileWasOpen)closeMobile(false);
    searchReturnFocus=mobileWasOpen?mobileOpenButton:returnTarget;
    overlay?.classList.add("open");
    overlay?.setAttribute("aria-hidden","false");
    syncBodyLock();
    setTimeout(()=>input?.focus(),120);
  };
  const closeSearch=(restoreFocus=true)=>{
    const wasOpen=overlay?.classList.contains("open");
    overlay?.classList.remove("open");
    overlay?.setAttribute("aria-hidden","true");
    syncBodyLock();
    if(wasOpen&&restoreFocus&&searchReturnFocus instanceof HTMLElement){
      setTimeout(()=>searchReturnFocus.focus(),40);
    }
  };
  searchCloseButton?.setAttribute("aria-label","Tutup pencarian");
  desktopSearchButton?.addEventListener("click",e=>openSearch(e.currentTarget));
  searchCloseButton?.addEventListener("click",()=>closeSearch());
  overlay?.addEventListener("click",e=>{if(e.target===overlay)closeSearch()});

  // Search stays available on phones and tablets from inside the mobile menu.
  if(mobile&&!qs(".mobile-search-open",mobile)){
    const mobileSearch=document.createElement("button");
    mobileSearch.className="mobile-search-open";
    mobileSearch.type="button";
    mobileSearch.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><span>Cari informasi</span><small>Ketik kata kunci</small>';
    qs(".mobile-head",mobile)?.insertAdjacentElement("afterend",mobileSearch);
    mobileSearch.addEventListener("click",()=>openSearch(mobileOpenButton));
  }

  // Keep the long mobile navigation compact: one section opens at a time.
  qsa("details",mobile).forEach(detail=>detail.addEventListener("toggle",()=>{
    if(!detail.open)return;
    qsa("details",mobile).forEach(other=>{if(other!==detail)other.open=false});
  }));

  // Desktop dropdowns also work by click on touch laptops and keyboards.
  const desktopGroups=qsa(".nav-group");
  const closeDesktopMenus=()=>desktopGroups.forEach(group=>{
    group.classList.remove("menu-open");
    qs(".nav-chevron",group)?.setAttribute("aria-expanded","false");
  });
  desktopGroups.forEach(group=>{
    const trigger=qs(".nav-chevron",group);
    if(!trigger)return;
    trigger.setAttribute("aria-expanded","false");
    trigger.addEventListener("click",e=>{
      e.stopPropagation();
      const willOpen=!group.classList.contains("menu-open");
      closeDesktopMenus();
      if(willOpen){group.classList.add("menu-open");trigger.setAttribute("aria-expanded","true")}
    });
  });
  document.addEventListener("click",e=>{if(!e.target.closest(".nav-group"))closeDesktopMenus()});
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){closeDesktopMenus();closeSearch();closeMobile()}
    if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)){e.preventDefault();openSearch(desktopSearchButton)}
  });

  const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  input?.addEventListener("input",e=>{
    const q=e.target.value.trim().toLowerCase();
    if(!q){results.innerHTML="";return}
    const found=(window.SITE_SEARCH_DATA||[]).filter(x=>x.title.toLowerCase().includes(q)).slice(0,12);
    results.innerHTML=found.length?found.map(x=>`<a class="search-result" href="${x.url}"><strong>${esc(x.title)}</strong><small>${esc(x.type)}</small></a>`).join(""):`<div class="search-result"><strong>Informasi tidak ditemukan</strong><small>Coba kata kunci lain</small></div>`;
  });

  // Query-driven internal document page.
  const params=new URLSearchParams(location.search);
  const docTitle=params.get("judul"), docYear=params.get("tahun");
  if(docTitle){
    const a=qs("#docTitle"),b=qs("#docTitle2");
    if(a)a.textContent=docTitle;if(b)b.textContent=docTitle;
  }
  if(docYear&&qs("#docYear"))qs("#docYear").textContent=`Tahun ${docYear}`;
  const sambutan=params.get("judul");
  if(sambutan&&qs("#sambutanTitle")){qs("#sambutanTitle").textContent=sambutan;qs("#sambutanLead").textContent=sambutan}

  // Embedded video stays inside the site page.
  qsa(".video-play").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const player=btn.closest(".video-player");
      const id=player?.dataset.youtube;
      if(!id)return;
      player.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1" title="${esc(player.dataset.title||"Video")}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });
  });



  // ---------------------------------------------------------
  // Motion system: subtle reveal on scroll.
  // ---------------------------------------------------------
  const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealSelectors=[
    ".hero-copy", ".hero-collage", ".section-head", ".quick-item",
    ".feature-grid > *", ".home-news-card", ".transparency-grid > *",
    ".mini-doc", ".explore-card", ".photo-strip figure", ".video-card",
    ".official-portal-card", ".category-hero-grid > *", ".directory-card",
    ".inner-hero-grid > *", ".article", ".side-nav", ".news-list-card",
    ".gallery-grid figure", ".gallery-video", ".contact-card", ".big-doc",
    ".region-grid a", ".document-years a", ".sitemap-grid a"
  ];
  const revealEls=[...new Set(revealSelectors.flatMap(s=>qsa(s)))];
  revealEls.forEach((el,i)=>{
    el.classList.add("reveal-js");
    el.style.setProperty("--reveal-index",String(i%6));
  });
  body.classList.add("motion-ready");
  if(reducedMotion){
    revealEls.forEach(el=>el.classList.add("reveal-in"));
  }else if("IntersectionObserver" in window){
    const revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add("reveal-in");
        revealObserver.unobserve(entry.target);
      });
    },{threshold:.10,rootMargin:"0px 0px -35px 0px"});
    revealEls.forEach(el=>revealObserver.observe(el));
  }else{
    revealEls.forEach(el=>el.classList.add("reveal-in"));
  }

  // ---------------------------------------------------------
  // Click/press microinteraction and ripple.
  // ---------------------------------------------------------
  const pressEls=qsa(".btn,.quick-item,.explore-card,.official-portal-card,.video-card,.directory-card,.home-news-card,.news-list-card,.big-doc,.mini-doc,.region-grid a,.sitemap-grid a");
  pressEls.forEach(el=>{
    el.classList.add("interactive-press");
    el.addEventListener("pointerdown",e=>{
      el.classList.add("is-pressing");
      if(reducedMotion)return;
      const r=el.getBoundingClientRect();
      const ripple=document.createElement("span");
      ripple.className="click-ripple";
      ripple.style.left=`${e.clientX-r.left}px`;
      ripple.style.top=`${e.clientY-r.top}px`;
      el.appendChild(ripple);
      setTimeout(()=>ripple.remove(),620);
    });
    ["pointerup","pointercancel","pointerleave"].forEach(type=>el.addEventListener(type,()=>el.classList.remove("is-pressing")));
  });

  // Header gains depth only after the page moves.
  const siteHeader=qs(".header");
  const syncHeader=()=>siteHeader?.classList.toggle("scrolled",scrollY>12);
  syncHeader();
  addEventListener("scroll",syncHeader,{passive:true});

  // Mark the active page for clearer navigation and assistive technology.
  const currentPage=location.pathname.split("/").pop()||"index.html";
  qsa('a[href]').forEach(link=>{
    const href=link.getAttribute("href")?.split(/[?#]/)[0];
    if(href===currentPage)link.setAttribute("aria-current","page");
  });

  // Tiny parallax on hero decoration, not on text/images.
  const heroCollage=qs(".hero-collage");
  if(heroCollage && !reducedMotion && matchMedia("(pointer:fine)").matches){
    heroCollage.addEventListener("pointermove",e=>{
      const r=heroCollage.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width-.5)*8;
      const y=((e.clientY-r.top)/r.height-.5)*8;
      heroCollage.style.setProperty("--hero-x",`${x.toFixed(1)}px`);
      heroCollage.style.setProperty("--hero-y",`${y.toFixed(1)}px`);
    });
    heroCollage.addEventListener("pointerleave",()=>{
      heroCollage.style.setProperty("--hero-x","0px");
      heroCollage.style.setProperty("--hero-y","0px");
    });
  }

  addEventListener("resize",()=>{if(innerWidth>900){closeMobile(false);closeDesktopMenus()}});
})();
