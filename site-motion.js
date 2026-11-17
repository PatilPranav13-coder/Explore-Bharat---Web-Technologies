/* Explore Bharat — whole-site motion controller. */
document.addEventListener("DOMContentLoaded",()=>{
  "use strict";
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer=window.matchMedia("(pointer:fine)").matches;
  const $=(selector,root=document)=>Array.from(root.querySelectorAll(selector));

  // Reveal sections, content blocks and cards in staggered waves.
  const revealSelectors=[
    ".bharat-highlights-intro",".bharat-highlight-stat",
    ".section-heading",".destination-card",
    ".culture-content",".culture-results-heading",".culture-card",
    ".package-intro",".featured-packages > .section-heading",".featured-card",
    ".travel-style > .section-tag",".travel-style > h2",".travel-style > p",
    ".travel-style-card",".trip-planner > .section-tag",".trip-planner > h2",
    ".trip-planner > p",".trip-form",".trip-result",
    ".registration-heading",".registration-form",
    ".footer > *"
  ].join(",");
  const revealTargets=$(revealSelectors);
  if(!reduceMotion&&"IntersectionObserver" in window&&revealTargets.length){
    revealTargets.forEach((el,index)=>{
      el.classList.add("site-reveal");
      const parent=el.parentElement;
      const siblings=parent?Array.from(parent.children).filter(node=>node.matches(revealSelectors)):[];
      const position=Math.max(0,siblings.indexOf(el));
      el.style.setProperty("--site-motion-delay",Math.min(position,7)*75+"ms");
      if(el.matches(".package-intro,.registration-heading"))el.classList.add("site-reveal-left");
      if(el.matches(".trip-form,.registration-form"))el.classList.add("site-reveal-right");
      if(el.matches(".bharat-highlight-stat,.destination-card,.featured-card,.travel-style-card,.culture-card"))el.classList.add("site-reveal-zoom");
    });
    document.body.classList.add("site-motion-ready");
    const observer=new IntersectionObserver((entries,io)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add("site-revealed");
          io.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:"0px 0px -45px 0px"});
    revealTargets.forEach(el=>observer.observe(el));

    // Culture cards are created dynamically by the original culture switch-case code.
    const cultureGrid=document.getElementById("cultureCards");
    if(cultureGrid){
      const observeNewCultureCards=()=>{
        cultureGrid.querySelectorAll(".culture-card:not(.site-reveal)").forEach((card,index)=>{
          card.classList.add("site-reveal","site-reveal-zoom");
          card.style.setProperty("--site-motion-delay",(index%6)*70+"ms");
          observer.observe(card);
        });
      };
      observeNewCultureCards();
      new MutationObserver(observeNewCultureCards).observe(cultureGrid,{childList:true});
    }
  }

  // Give images and interactive cards a unified media-motion treatment.
  $(".destination-card img,.culture-card img,.featured-card img,.hero-visual img").forEach(img=>{
    img.classList.add("site-motion-image");
  });
  $(".destination-card,.culture-card,.featured-card,.travel-style-card").forEach(card=>{
    card.classList.add("site-motion-tilt");
  });

  if(finePointer&&!reduceMotion){
    $(".site-motion-tilt").forEach(card=>{
      card.addEventListener("pointermove",event=>{
        const rect=card.getBoundingClientRect();
        const x=(event.clientX-rect.left)/rect.width;
        const y=(event.clientY-rect.top)/rect.height;
        card.style.setProperty("--site-tilt-y",((x-.5)*7).toFixed(2)+"deg");
        card.style.setProperty("--site-tilt-x",((.5-y)*6).toFixed(2)+"deg");
      });
      card.addEventListener("pointerleave",()=>{
        card.style.setProperty("--site-tilt-x","0deg");
        card.style.setProperty("--site-tilt-y","0deg");
      });
    });
  }

  // Shimmer, magnetic movement and tactile ripple for interactive controls.
  const interactiveButtons=$("button,.btn,.register-button,.footer-logo");
  interactiveButtons.forEach(button=>button.classList.add("site-motion-button"));
  if(finePointer&&!reduceMotion){
    $(".site-motion-button").forEach(button=>{
      button.addEventListener("pointermove",event=>{
        const rect=button.getBoundingClientRect();
        const dx=(event.clientX-(rect.left+rect.width/2))/rect.width;
        const dy=(event.clientY-(rect.top+rect.height/2))/rect.height;
        button.style.setProperty("--site-magnet-x",(dx*4).toFixed(1)+"px");
        button.style.setProperty("--site-magnet-y",(dy*3).toFixed(1)+"px");
      });
      button.addEventListener("pointerleave",()=>{
        button.style.setProperty("--site-magnet-x","0px");
        button.style.setProperty("--site-magnet-y","0px");
      });
    });
  }
  document.addEventListener("click",event=>{
    const button=event.target.closest(".site-motion-button");
    if(!button||reduceMotion)return;
    const rect=button.getBoundingClientRect();
    const ripple=document.createElement("span");
    ripple.className="site-ripple";
    ripple.style.left=(event.clientX?event.clientX-rect.left:rect.width/2)+"px";
    ripple.style.top=(event.clientY?event.clientY-rect.top:rect.height/2)+"px";
    button.appendChild(ripple);
    ripple.addEventListener("animationend",()=>ripple.remove(),{once:true});
  });

  // Navbar glass/shrink state, back-to-top and subtle hero parallax.
  const navbar=document.querySelector(".navbar");
  const backTop=document.createElement("button");
  backTop.type="button";backTop.className="site-motion-back-top";
  backTop.setAttribute("aria-label","Back to top");backTop.title="Back to top";
  backTop.textContent="↑";document.body.appendChild(backTop);
  let scrollQueued=false;
  function onScroll(){
    if(scrollQueued)return;
    scrollQueued=true;
    requestAnimationFrame(()=>{
      const y=window.scrollY||0;
      navbar?.classList.toggle("is-scrolled",y>36);
      backTop.classList.toggle("is-visible",y>480);
      const heroImage=document.querySelector(".hero-visual img");
      if(heroImage&&!reduceMotion&&y<window.innerHeight*1.3){
        heroImage.style.setProperty("--site-parallax",Math.min(28,y*.045)+"px");
      }
      scrollQueued=false;
    });
  }
  window.addEventListener("scroll",onScroll,{passive:true});onScroll();
  backTop.addEventListener("click",()=>{
    backTop.classList.add("is-launching");
    window.scrollTo({top:0,behavior:reduceMotion?"auto":"smooth"});
    window.setTimeout(()=>backTop.classList.remove("is-launching"),600);
  });

  // Invalid fields receive a brief shake; valid edits clear the feedback state.
  $("input,select,textarea").forEach(field=>{
    field.addEventListener("invalid",()=>{
      field.classList.remove("site-field-shake");
      void field.offsetWidth;
      field.classList.add("site-field-shake");
      field.addEventListener("animationend",()=>field.classList.remove("site-field-shake"),{once:true});
    });
    field.addEventListener("input",()=>field.classList.remove("site-field-shake"));
    field.addEventListener("change",()=>field.classList.remove("site-field-shake"));
  });

  // Pop the planner's recommendation into view when all selections are valid.
  const findTrip=document.getElementById("findTripBtn");
  findTrip?.addEventListener("click",()=>{
    requestAnimationFrame(()=>{
      const result=document.getElementById("tripResult");
      if(result&&!result.hidden){
        result.classList.remove("site-result-enter");
        void result.offsetWidth;
        result.classList.add("site-result-enter");
      }
    });
  });

  // Soft magnetic focus for the search panel and profile action.
  $(".site-search-box,.profile-trigger").forEach(control=>{
    control.addEventListener("focusin",()=>control.classList.add("site-control-focus"));
    control.addEventListener("focusout",()=>control.classList.remove("site-control-focus"));
  });
});
