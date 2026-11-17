/* Bharat AI — a site-aware navigation assistant.
   It indexes real Explore Bharat page content and controls existing website sections.
   It is an intent-based client-side guide, not a remote LLM or trained model. */
document.addEventListener("DOMContentLoaded",()=>{
  "use strict";
  const $=(id)=>document.getElementById(id);
  const toggle=$("bharatAiToggle"),panel=$("bharatAiPanel"),close=$("bharatAiClose");
  const messages=$("bharatAiMessages"),form=$("bharatAiForm"),input=$("bharatAiInput");
  const suggestions=$("bharatAiSuggestions");
  if(!toggle||!panel||!messages||!form||!input)return;

  const motion=window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth";
  const destinationAliases={
    kashmir:["kashmir","srinagar","dal lake","gulmarg","pahalgam","shikara"],
    rajasthan:["rajasthan","jaipur","udaipur","jaisalmer","jodhpur","hawa mahal"],
    kerala:["kerala","munnar","alleppey","alappuzha","backwaters","kochi","thekkady"],
    maharashtra:["maharashtra","raigad","ajanta","ellora","mahabaleshwar","mumbai","pune"],
    ladakh:["ladakh","leh","pangong","nubra valley","thiksey"],
    goa:["goa","palolem","baga beach","fort aguada"],
    himachal:["himachal","himachal pradesh","manali","shimla","spiti","dharamshala"],
    uttarakhand:["uttarakhand","rishikesh","mussoorie","nainital","valley of flowers"],
    agra:["agra","taj mahal","fatehpur sikri","agra fort"],
    varanasi:["varanasi","kashi","sarnath","assii ghat","dashashwamedh"],
    assam:["assam","kaziranga","majuli","guwahati","sivasagar"],
    tamilnadu:["tamil nadu","tamilnadu","madurai","mahabalipuram","thanjavur","kanyakumari"]
  };
  const cultureAliases={
    dance:["dance","dances","bharatanatyam","kathak","kathakali","odissi","folk dance"],
    food:["food","cuisine","cuisines","dish","dishes","eat","eating","flavour","flavor","street food","traditional food"],
    festival:["festival","festivals","celebration","celebrations","diwali","holi","navratri","eid","onam","pongal"],
    music:["music","song","songs","musician","instruments","classical music"],
    clothing:["clothing","clothes","dress","dresses","saree","sari","textile","traditional wear"],
    art:["art","craft","crafts","handicraft","handicrafts","painting","pottery","folk art"],
    languages:["language","languages","dialect","dialects","speak","spoken"],
    architecture:["architecture","temple","temples","fort","forts","palace","palaces","monument","monuments"]
  };
  const cultureNames={dance:"Dance",food:"Food",festival:"Festival",music:"Music",clothing:"Clothing",art:"Art & Crafts",languages:"Languages",architecture:"Architecture"};
  const destinationCards=Array.from(document.querySelectorAll(".destination-card"));
  const packageCards=Array.from(document.querySelectorAll(".featured-card"));

  function normalize(value){
    return String(value||"").toLocaleLowerCase("en-IN")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[’']/g,"").replace(/[^a-z0-9₹\s-]/g," ")
      .replace(/\s+/g," ").trim();
  }
  function includesTerm(query,term){
    const q=" "+normalize(query)+" ",t=" "+normalize(term)+" ";
    return q.includes(t);
  }
  function bestDestination(query){
    const candidates=[];
    Object.entries(destinationAliases).forEach(([key,aliases])=>{
      aliases.forEach(alias=>{if(includesTerm(query,alias))candidates.push({key,alias:normalize(alias),length:normalize(alias).length});});
    });
    candidates.sort((a,b)=>b.length-a.length);
    if(!candidates.length)return null;
    const match=candidates[0];
    const card=destinationCards.find(item=>normalize(item.dataset.destination)===normalize(match.key));
    return card?{key:match.key,card,name:card.querySelector("h3")?.textContent.trim()||match.key}:null;
  }
  function bestCulture(query){
    const matches=[];
    Object.entries(cultureAliases).forEach(([key,aliases])=>{
      aliases.forEach(alias=>{if(includesTerm(query,alias))matches.push({key,length:normalize(alias).length});});
    });
    matches.sort((a,b)=>b.length-a.length);
    return matches[0]?.key||null;
  }
  function findPackage(destinationName){
    const wanted=normalize(destinationName);
    return packageCards.find(card=>normalize(card.querySelector("h3")?.textContent||"").includes(wanted));
  }

  function addMessage(role,text){
    const wrapper=document.createElement("div");
    wrapper.className="bharat-ai-message "+(role==="user"?"bharat-ai-user":"bharat-ai-bot");
    if(role!=="user"){
      const avatar=document.createElement("span");avatar.className="bharat-ai-message-avatar";
      avatar.setAttribute("aria-hidden","true");avatar.textContent="✦";wrapper.appendChild(avatar);
    }
    const bubble=document.createElement("div");bubble.className="bharat-ai-bubble";
    const paragraph=document.createElement("p");bubble.appendChild(paragraph);
    if(role!=="user"){
      const meta=document.createElement("span");meta.className="bharat-ai-message-meta";meta.textContent="Bharat AI · Website guide";bubble.appendChild(meta);
    }
    wrapper.appendChild(bubble);messages.appendChild(wrapper);
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(role==="user"||reduced){paragraph.textContent=text;messages.scrollTop=messages.scrollHeight;return;}
    // Typewriter-style progressive reveal for the static website guide.
    // This is a presentation effect, not token streaming from a hosted language model.
    let offset=0;
    function revealChunk(){
      offset=Math.min(text.length,offset+3);
      paragraph.textContent=text.slice(0,offset);
      messages.scrollTop=messages.scrollHeight;
      if(offset<text.length)window.setTimeout(revealChunk,18);
    }
    revealChunk();
  }
  function setPanel(open){
    panel.hidden=!open;panel.setAttribute("aria-hidden",String(!open));
    toggle.setAttribute("aria-expanded",String(open));
    if(open){input.focus();messages.scrollTop=messages.scrollHeight;}
  }
  function recordAction(title,detail){
    document.dispatchEvent(new CustomEvent("explore-bharat:assistant-action",{detail:{title,detail}}));
  }
  function pulse(element){
    element.classList.remove("ai-destination-open");
    void element.offsetWidth;element.classList.add("ai-destination-open");
    window.setTimeout(()=>element.classList.remove("ai-destination-open"),1400);
  }
  function goToSection(id){
    const section=$(id);
    if(!section)return false;
    section.scrollIntoView({behavior:motion,block:"start"});
    return true;
  }
  function navigateDestination(destination){
    addMessage("bot","Absolutely! I'm opening "+destination.name+" for you. You'll find its highlights, famous places, local experiences, cuisine and suggested duration in the destination details.");
    recordAction("Bharat AI navigation","Opened "+destination.name+" destination details using the website guide.");
    destination.card.scrollIntoView({behavior:motion,block:"center"});
    window.setTimeout(()=>destination.card.click(),motion==="auto"?0:420);
    window.setTimeout(()=>setPanel(false),motion==="auto"?100:680);
  }
  function navigateCulture(category){
    const tab=category?document.querySelector('.culture-tab[data-category="'+category+'"]'):null;
    addMessage("bot",category
      ?"Let's explore "+cultureNames[category]+". I've opened the Culture section and selected the "+cultureNames[category]+" collection for you."
      :"Let's explore Bharat's culture. I've opened the Culture section. You can browse dance, food, festivals, music, clothing, art and crafts, languages, and architecture.");
    if(tab)tab.click();
    goToSection("culture");
    recordAction("Bharat AI navigation","Opened the Culture section"+(category?" and selected "+cultureNames[category]:"")+".");
    window.setTimeout(()=>setPanel(false),motion==="auto"?100:520);
  }
  function navigatePackage(destinationName){
    const card=findPackage(destinationName);
    if(!card)return false;
    addMessage("bot","I found the "+(card.querySelector("h3")?.textContent.trim()||destinationName)+" package idea. I'm taking you to it now. The prices shown on this student project are sample prices, not bookable offers.");
    recordAction("Bharat AI navigation","Opened the "+destinationName+" sample tour package card.");
    goToSection("packages");window.setTimeout(()=>{card.scrollIntoView({behavior:motion,block:"center"});pulse(card);},motion==="auto"?0:400);
    window.setTimeout(()=>setPanel(false),motion==="auto"?100:680);
    return true;
  }
  function navigatePlanner(query){
    const pairs=[
      ["tripBudget",[
        {re:/under\s*₹?\s*5\s*,?\s*000|below\s*₹?\s*5\s*,?\s*000|low budget/,value:"low"},
        {re:/₹?\s*5\s*,?\s*000\s*(?:-|to)\s*₹?\s*10\s*,?\s*000/,value:"medium"},
        {re:/₹?\s*10\s*,?\s*000\s*(?:-|to)\s*₹?\s*20\s*,?\s*000/,value:"high"},
        {re:/above\s*₹?\s*20\s*,?\s*000|premium budget/,value:"premium"}
      ]],
      ["tripDuration",[
        {re:/weekend|1\s*[-–]\s*2\s*days|two days/,value:"weekend"},
        {re:/3\s*[-–]\s*5\s*days|five days|three days/,value:"short"},
        {re:/6\+?\s*days|one week|7 days|long trip/,value:"long"}
      ]],
      ["tripStyle",[
        {re:/adventure|mountain|trek|hiking/,value:"adventure"},
        {re:/nature|wildlife|forest|safari/,value:"nature"},
        {re:/heritage|history|fort|palace|monument/,value:"heritage"},
        {re:/beach|coast|sea|relax/,value:"beach"},
        {re:/spiritual|temple|pilgrim/,value:"spiritual"},
        {re:/family|kids|children/,value:"family"}
      ]]
    ];
    pairs.forEach(([id,patterns])=>{
      const field=$(id);if(!field)return;
      const match=patterns.find(item=>item.re.test(query));
      if(match)field.value=match.value;
    });
    addMessage("bot","Let's build your own journey. I've opened the trip planner. Choose or adjust your budget, duration and travel style, then select “Find My Trip”.");
    recordAction("Bharat AI navigation","Opened the custom trip planner from the website guide.");
    goToSection("trip-planner");
    window.setTimeout(()=>setPanel(false),motion==="auto"?100:520);
  }
  function openRegistration(){
    addMessage("bot","I've taken you to the journey registration form. You can enter your travel details there.");
    recordAction("Bharat AI navigation","Opened the journey registration form from the website guide.");
    goToSection("registration");
    window.setTimeout(()=>setPanel(false),motion==="auto"?100:520);
  }
  function openProfile(){
    addMessage("bot","Opening your Explore Bharat profile and travel log.");
    window.setTimeout(()=>{$("profileOpen")?.click();setPanel(false);},300);
  }

  function handleQuery(raw){
    const query=normalize(raw);
    if(!query)return;
    addMessage("user",raw.trim());
    const lower=query;

    if(/\b(hi|hello|hey|namaste|good morning|good evening)\b/.test(lower)){
      addMessage("bot","Namaste! Tell me what you'd like to explore — a destination, India's culture, a tour package or a custom trip.");
      return;
    }
    if(/\b(help|what can you do|how do i use|how to use|what do you do)\b/.test(lower)){
      addMessage("bot","I can navigate the Explore Bharat website for you: open destination details, choose a culture collection, show a sample tour package, open the custom trip planner, take you to registration, or open your profile. Try “I want to explore Bharat's culture” or “Kashmir trip”.");
      return;
    }
    if(/\b(profile|my travel log|travel history|my account)\b/.test(lower)){
      openProfile();return;
    }

    const destination=bestDestination(lower);
    const packageIntent=/\b(package|tour package|packages|sample price|price of|package price)\b/.test(lower);
    if(destination&&packageIntent){
      if(navigatePackage(destination.name))return;
      addMessage("bot","I couldn't find a dedicated "+destination.name+" package card yet, but I can open its destination guide.");
      navigateDestination(destination);return;
    }
    if(destination){navigateDestination(destination);return;}

    const category=bestCulture(lower);
    const isCulture=/\b(culture|cultures|tradition|traditions|heritage|arts and crafts)\b/.test(lower);
    if(category||isCulture){navigateCulture(category);return;}

    if(/\b(destination|destinations|places to visit|where should i go|places in india|explore india)\b/.test(lower)){
      addMessage("bot","Here are the destination spotlights. Choose a card to open its details, or ask me for a specific place such as Kashmir, Kerala or Rajasthan.");
      goToSection("destinations");recordAction("Bharat AI navigation","Opened the destinations section.");setPanel(false);return;
    }
    if(/\b(package|tour packages|holiday packages|travel packages)\b/.test(lower)){
      addMessage("bot","I'm taking you to the featured tour-package ideas. The amounts shown are sample prices for this project.");
      goToSection("packages");recordAction("Bharat AI navigation","Opened featured tour packages.");setPanel(false);return;
    }
    if(/\b(plan|planner|build.*trip|custom trip|my own trip|itinerary|budget)\b/.test(lower)){
      navigatePlanner(lower);return;
    }
    if(/\b(register|registration|sign up|signup|journey form)\b/.test(lower)){
      openRegistration();return;
    }
    if(/\b(home|homepage|start page)\b/.test(lower)){
      addMessage("bot","Taking you back to the Explore Bharat homepage.");
      goToSection("home");recordAction("Bharat AI navigation","Returned to the homepage.");setPanel(false);return;
    }
    if(/\b(faq|frequently asked questions)\b/.test(lower)){
      addMessage("bot","This version of Explore Bharat doesn't have a dedicated FAQ section yet. I can help you explore destinations, culture, tour ideas, the trip planner or registration.");
      return;
    }
    addMessage("bot","I couldn't match that to a section yet. I know the destinations and content currently on this website. Try a destination name, “explore culture”, “show tour packages” or “build my own trip”.");
  }

  toggle.addEventListener("click",()=>setPanel(panel.hidden));
  close.addEventListener("click",()=>setPanel(false));
  document.addEventListener("keydown",event=>{if(!panel.hidden&&event.key==="Escape")setPanel(false);});
  document.addEventListener("click",event=>{
    if(!panel.hidden&&!panel.contains(event.target)&&!toggle.contains(event.target))setPanel(false);
  });
  form.addEventListener("submit",event=>{
    event.preventDefault();
    if(!input.value.trim())return;
    const value=input.value;input.value="";handleQuery(value);
  });
  suggestions?.addEventListener("click",event=>{
    const button=event.target.closest("[data-prompt]");if(!button)return;
    handleQuery(button.dataset.prompt);
  });
});
