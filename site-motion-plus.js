/* Explore Bharat — expressive motion pack based on the supplied animation reference. */
document.addEventListener("DOMContentLoaded",()=>{
  "use strict";
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine=window.matchMedia("(pointer:fine)").matches;
  const $=(selector,root=document)=>Array.from(root.querySelectorAll(selector));

  // One-time opening curtain. It never blocks clicks or delays navigation.
  if(!reduce){
    let play=false;
    try{play=!sessionStorage.getItem("exploreBharatCurtainSeen");if(play)sessionStorage.setItem("exploreBharatCurtainSeen","1");}
    catch(error){play=true;}
    if(play){
      const curtain=document.createElement("div");curtain.className="site-page-curtain";curtain.setAttribute("aria-hidden","true");
      const left=document.createElement("div");left.className="site-curtain-panel";
      const right=document.createElement("div");right.className="site-curtain-panel";
      const brand=document.createElement("div");brand.className="site-curtain-brand";
      const seal=document.createElement("span");seal.textContent="✦";
      const title=document.createElement("span");title.textContent="Explore Bharat";
      brand.append(seal,title);curtain.append(left,right,brand);document.body.appendChild(curtain);
      requestAnimationFrame(()=>requestAnimationFrame(()=>curtain.classList.add("is-opening")));
      setTimeout(()=>curtain.remove(),1120);
    }
  }

  // Typewriter phrases in the hero.
  const typeTarget=document.getElementById("heroTypewriter");
  if(typeTarget&&!reduce){
    const phrases=["Mountain escapes","Royal heritage","Coastal hideaways","Living traditions","Unforgettable journeys"];
    let phrase=0,index=phrases[0].length,erasing=false,paused=false,timer=0;
    typeTarget.textContent=phrases[0];
    function tick(){
      if(paused)return;
      const current=phrases[phrase];
      if(!erasing){index++;typeTarget.textContent=current.slice(0,index);if(index>=current.length){erasing=true;timer=setTimeout(tick,1500);return;}}
      else{index--;typeTarget.textContent=current.slice(0,index);if(index<=0){erasing=false;phrase=(phrase+1)%phrases.length;}}
      timer=setTimeout(tick,erasing?32:65);
    }
    document.addEventListener("visibilitychange",()=>{paused=document.hidden;if(!paused)timer=setTimeout(tick,220);else clearTimeout(timer);});
    timer=setTimeout(tick,1400);
  }

  // Scramble-and-resolve words on the hero experience chips.
  if(!reduce){
    const glyphs="ABCDEFGHIJKLMNOPQRSTUVWXYZ✦";
    $(".hero-feature-tags span").forEach(chip=>{
      const original=chip.textContent;let active=false;
      chip.addEventListener("mouseenter",()=>{
        if(active)return;active=true;let step=0;
        function animate(){
          step++;const reveal=Math.floor(step/10*original.length);
          chip.textContent=original.split("").map((letter,i)=>letter===" "||i<reveal?letter:glyphs[Math.floor(Math.random()*glyphs.length)]).join("");
          if(step<10)requestAnimationFrame(animate);else{chip.textContent=original;active=false;}
        }
        requestAnimationFrame(animate);
      });
    });
  }

  // Native cursor remains available; decorative dot/ring only supplements it.
  if(fine&&!reduce){
    const dot=document.createElement("span");dot.className="site-cursor-dot";dot.setAttribute("aria-hidden","true");
    const ring=document.createElement("span");ring.className="site-cursor-ring";ring.setAttribute("aria-hidden","true");
    document.body.append(dot,ring);
    let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y,raf=0,visible=false;
    function draw(){
      rx+=(x-rx)*.19;ry+=(y-ry)*.19;
      dot.style.transform="translate3d("+x+"px,"+y+"px,0) translate(-50%,-50%)";
      ring.style.transform="translate3d("+rx+"px,"+ry+"px,0) translate(-50%,-50%)";
      raf=requestAnimationFrame(draw);
    }
    document.addEventListener("pointermove",event=>{
      x=event.clientX;y=event.clientY;
      if(!visible){visible=true;dot.style.opacity="1";ring.style.opacity="1";}
      ring.classList.toggle("is-hovering",Boolean(event.target.closest("a,button,input,select,textarea,[role='button']")));
    },{passive:true});
    document.addEventListener("pointerdown",()=>{dot.classList.add("is-down");ring.classList.add("is-down");});
    document.addEventListener("pointerup",()=>{dot.classList.remove("is-down");ring.classList.remove("is-down");});
    draw();
    document.addEventListener("visibilitychange",()=>{
      if(document.hidden){cancelAnimationFrame(raf);dot.style.opacity="0";ring.style.opacity="0";}
      else{visible=false;draw();}
    });
  }

  // Low-density interactive particle constellation across the page.
  if(!reduce&&!window.matchMedia("(pointer:coarse)").matches){
    const canvas=document.createElement("canvas");canvas.className="site-ambient-canvas";canvas.setAttribute("aria-hidden","true");document.body.appendChild(canvas);
    const ctx=canvas.getContext("2d");
    if(ctx){
      let width=0,height=0,dpr=1,points=[],pointer={x:-9999,y:-9999},raf=0,running=!document.hidden;
      function resize(){
        dpr=Math.min(devicePixelRatio||1,1.5);width=innerWidth;height=innerHeight;
        canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=width+"px";canvas.style.height=height+"px";
        ctx.setTransform(dpr,0,0,dpr,0,0);
        const count=Math.min(44,Math.max(20,Math.round(width/34)));
        points=Array.from({length:count},()=>({x:Math.random()*width,y:Math.random()*height,vx:(Math.random()-.5)*.27,vy:(Math.random()-.5)*.27,r:1+Math.random()*1.35}));
      }
      function render(){
        if(!running)return;ctx.clearRect(0,0,width,height);
        points.forEach((p,i)=>{
          p.x+=p.vx;p.y+=p.vy;if(p.x<-10)p.x=width+10;if(p.x>width+10)p.x=-10;if(p.y<-10)p.y=height+10;if(p.y>height+10)p.y=-10;
          ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="rgba(255,220,145,.36)";ctx.fill();
          for(let j=i+1;j<points.length;j++){
            const q=points[j],d=Math.hypot(p.x-q.x,p.y-q.y);
            if(d<112){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle="rgba(245,215,120,"+(.1*(1-d/112))+")";ctx.lineWidth=.65;ctx.stroke();}
          }
          const distance=Math.hypot(p.x-pointer.x,p.y-pointer.y);
          if(distance<145){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(pointer.x,pointer.y);ctx.strokeStyle="rgba(240,121,63,"+(.14*(1-distance/145))+")";ctx.lineWidth=.7;ctx.stroke();}
        });
        raf=requestAnimationFrame(render);
      }
      addEventListener("resize",resize,{passive:true});
      addEventListener("pointermove",event=>{pointer.x=event.clientX;pointer.y=event.clientY;},{passive:true});
      document.addEventListener("visibilitychange",()=>{running=!document.hidden;if(running)render();else cancelAnimationFrame(raf);});
      resize();render();
    }
  }

  // Confetti only follows the successful local demo form state.
  function celebrate(){
    const canvas=document.createElement("canvas");canvas.className="site-fireworks-canvas";canvas.setAttribute("aria-hidden","true");document.body.appendChild(canvas);
    const ctx=canvas.getContext("2d");if(!ctx){canvas.remove();return;}
    const ratio=Math.min(devicePixelRatio||1,1.5),w=innerWidth,h=innerHeight;
    canvas.width=w*ratio;canvas.height=h*ratio;ctx.scale(ratio,ratio);
    const colors=["#f04b24","#f5d778","#176b48","#e9a849","#b98add","#fff1c9"];
    const pieces=Array.from({length:95},(_,i)=>({x:w*.5+(Math.random()-.5)*90,y:h*.38+(Math.random()-.5)*30,vx:(Math.random()-.5)*8,vy:-2-Math.random()*7,g:.16+Math.random()*.08,life:70+Math.random()*25,size:2+Math.random()*4,angle:Math.random()*6,spin:(Math.random()-.5)*.2,color:colors[i%colors.length]}));
    let frames=0;
    function draw(){
      ctx.clearRect(0,0,w,h);
      pieces.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.angle+=p.spin;p.life--;
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=Math.max(0,Math.min(1,p.life/28));ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.8);ctx.restore();
      });
      if(++frames<100)requestAnimationFrame(draw);else canvas.remove();
    }
    draw();
  }
  const registration=document.getElementById("registrationForm");
  if(registration&&!reduce)registration.addEventListener("submit",()=>{
    setTimeout(()=>{const message=document.getElementById("registrationMessage");if(message&&message.textContent.includes("registered in this demo"))celebrate();},0);
  });
});
