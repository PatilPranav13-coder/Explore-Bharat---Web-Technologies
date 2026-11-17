const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const tripState={step:1,adults:2,children:0,formData:null};
const destinations=["Ladakh","Jaipur","Kerala","Meghalaya","Varanasi","Andaman Islands","Mumbai","Hampi","Rajasthan","Spiti Valley","Pune"];
const destinationInfo={
 Ladakh:"Ladakh is a high-altitude Himalayan region known for dramatic mountain passes, monasteries, Pangong Lake and Nubra Valley. Travel slowly to acclimatise; check road and weather conditions before departure.",
 Jaipur:"Jaipur, Rajasthan's Pink City, is known for Amber Fort, Hawa Mahal, City Palace, block printing, jewellery and vibrant markets. October to March is generally more comfortable for sightseeing.",
 Kerala:"Kerala offers backwaters, tea-growing hills, wildlife, beaches and distinctive food traditions. A route linking Kochi, Munnar and Alleppey is a popular first visit.",
 Meghalaya:"Meghalaya is known for green hills, waterfalls, caves and living root bridges. Shillong, Cherrapunji and Mawlynnong are common bases; monsoon conditions can affect trails.",
 Varanasi:"Varanasi is one of India's oldest living cities, with riverfront ghats, temples, silk weaving, music and food traditions. Visit cultural and religious spaces respectfully.",
 "Andaman Islands":"The Andaman Islands offer beaches, marine life, snorkelling and island landscapes. Ferry schedules and protected-area rules matter, so plan transfers in advance.",
 Mumbai:"Mumbai blends coastal promenades, historic architecture, markets, museums and an extraordinary food scene. Local trains are useful but busy; plan travel times.",
 Hampi:"Hampi's Vijayanagara-era ruins, boulder landscapes and temple complexes make it a remarkable heritage destination. Explore early or late in the day to avoid heat."
};
const infoFor=(place)=>destinationInfo[place]||`${place} can be a wonderful addition to an India itinerary. Tell your trip planner what interests you most, then verify seasonal conditions, transport and local access before you go.`;
function setStep(next){tripState.step=next;$$(".form-step").forEach(el=>el.classList.toggle("active",Number(el.dataset.step)===next));$("#stepCurrent").textContent=String(next).padStart(2,"0");$("#progressBar").style.width=(next/3*100)+"%";$("#formTitle").textContent=["Where would you like to go?","When are you travelling?","What makes a trip yours?"][next-1];$("#backStep").disabled=next===1;$("#nextStep").classList.toggle("hidden",next===3);$("#submitTrip").classList.toggle("hidden",next!==3);$("#placeError").textContent="";}
function selectedPlaces(){return $$('input[name="places"]:checked',$("#tripForm")).map(x=>x.value)}
function showModal(data){tripState.formData=data;const pairs=[["Destinations",data.places.join(", ")],["Travel dates",data.startDate&&data.endDate?data.startDate+" to "+data.endDate:(data.duration||"Dates flexible")],["Travellers",data.adults+" adults, "+data.children+" children"],["Interests",data.interests.join(", ")||"Open to suggestions"],["Budget",data.budget||"To be discussed"],["Travel style",data.style||"Balanced"]];$("#tripSummary").innerHTML='<div class="summary-grid">'+pairs.map(([k,v])=>'<div><span>'+escapeHtml(k)+'</span><b>'+escapeHtml(v)+'</b></div>').join("")+'</div><p style="font-size:10px;color:#70786f;line-height:1.6">'+(data.notes?escapeHtml(data.notes):"No special notes added yet.")+'</p>';$("#tripModal").classList.add("open");}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function collectTrip(){const f=new FormData($("#tripForm"));let places=selectedPlaces();const custom=(f.get("customPlace")||"").split(",").map(x=>x.trim()).filter(Boolean);custom.forEach(p=>{if(!places.includes(p))places.push(p);});return{places,startDate:f.get("startDate"),endDate:f.get("endDate"),duration:f.get("duration"),adults:tripState.adults,children:tripState.children,interests:f.getAll("interests"),budget:f.get("budget"),style:f.get("style"),notes:f.get("notes")};}
function addPlace(place){const cb=$$('input[name="places"]', $("#placeOptions")).find(x=>x.value===place);if(cb){cb.checked=true;}else{const input=$("#tripForm [name=customPlace]");const current=(input.value||"").split(",").map(x=>x.trim()).filter(Boolean);if(!current.includes(place))current.push(place);input.value=current.join(", ");}$("#planner").scrollIntoView({behavior:"smooth"});}
$("#backStep").addEventListener("click",()=>setStep(Math.max(1,tripState.step-1)));
$("#nextStep").addEventListener("click",()=>{if(tripState.step===1&&!selectedPlaces().length&&!$("#tripForm [name=customPlace]").value.trim()){$("#placeError").textContent="Choose at least one destination or enter your own.";return;}setStep(Math.min(3,tripState.step+1));});
$("#tripForm").addEventListener("submit",e=>{e.preventDefault();const data=collectTrip();if(!data.places.length){setStep(1);$("#placeError").textContent="Add at least one destination to continue.";return;}if(data.startDate&&data.endDate&&new Date(data.endDate)<new Date(data.startDate)){setStep(2);alert("Your return date must be after your departure date.");return;}showModal(data);});
$$("[data-counter]").forEach(btn=>btn.addEventListener("click",()=>{const key=btn.dataset.counter;tripState[key]=Math.max(key==="adults"?1:0,Math.min(20,tripState[key]+Number(btn.dataset.delta)));$("#"+(key==="adults"?"adultCount":"childCount")).textContent=tripState[key];}));
$$(".expand-btn").forEach(btn=>btn.addEventListener("click",()=>{const card=btn.closest(".destination-card");const open=!card.classList.contains("expanded");$$(".destination-card.expanded").forEach(c=>{c.classList.remove("expanded");$(".expand-btn",c).textContent="＋";$(".expand-btn",c).setAttribute("aria-expanded","false");});if(open){card.classList.add("expanded");btn.textContent="−";btn.setAttribute("aria-expanded","true");}}));
$$(".detail-add").forEach(btn=>btn.addEventListener("click",()=>addPlace(btn.dataset.add)));
$$(".package-pick").forEach(btn=>btn.addEventListener("click",()=>{btn.dataset.places.split(",").forEach(addPlace);$("#tripForm [name=notes]").value="Interested in the "+btn.dataset.package+" package as a starting point.";setStep(1);$("#planner").scrollIntoView({behavior:"smooth"});}));
$("#destinationFilters").addEventListener("click",e=>{const btn=e.target.closest("[data-filter]");if(!btn)return;$$(".chip").forEach(c=>c.classList.toggle("active",c===btn));let visible=0;$$(".destination-card").forEach(card=>{const show=btn.dataset.filter==="All"||card.dataset.category===btn.dataset.filter;card.style.display=show?"":"none";if(show)visible++;});$("#destinationCount").textContent=String(visible).padStart(2,"0")+" destinations";});
function openSearchPanel(){
  $("#searchPanel").classList.add("open");
}
function closeSearchPanel(){
  $("#searchPanel").classList.remove("open");
}
function pageSearchHelp(query){
  const q=query.toLowerCase();
  if(/build|custom|planner|itinerary|plan my|make a trip|create a trip/.test(q))return {answer:"Build a trip in three simple steps. First choose one or more destinations. Next add dates, trip length and traveller counts. Finally choose interests, budget and travel style, then review the itinerary and enter your contact details. Your choices stay together as you move through the form.",href:"#planner",label:"Open the trip builder"};
  if(/package|tour|offer|discount|price|cost/.test(q))return {answer:"Explore the Tour packages section for three example journeys: Rajasthan, Kerala and the Himalayas. Select the arrow on a package to use it as a starting point in the custom trip planner. Prices are illustrative, not live quotes or confirmed offers.",href:"#packages",label:"Explore tour packages"};
  if(/register|registration|enquiry|enquire|contact|submit|booking form|name and email/.test(q))return {answer:"To send a trip enquiry, complete all three trip-builder steps and choose Review my trip. Check the summary, then enter your name and email, select how you'd like to be contacted and agree to the privacy note. This submits an enquiry, not a confirmed booking. No payment is taken.",href:"#planner",label:"Start a trip enquiry"};
  if(/destination|place|expand|tile|card|mountain|beach|how.*find.*place|browse.*place/.test(q))return {answer:"Browse destination cards in the Destinations section. Use the category filters to narrow the list, then select the plus button on a card to reveal highlights, suggested season and stay length. Choose Add to my trip to carry that place into the planner.",href:"#destinations",label:"Browse destinations"};
  if(/search|find|look for/.test(q))return {answer:"Use the search field in the top navigation. Search for a destination, travel idea or question. Website topics show a direct section link; travel questions can use live web search when the site owner has configured the AI service.",href:"#destinations",label:"Explore the website"};
  if(/ai|chatbot|bharat ai|assistant|help/.test(q))return {answer:"Bharat AI is the website guide. Ask how to use the destination explorer, trip builder, packages or enquiry form. It can also help brainstorm India travel ideas. AI suggestions are not bookings or verified live availability.",href:"#planner",label:"Open trip planner"};
  return null;
}
async function runSearch(){
  const query=$("#siteSearch").value.trim();
  if(!query){$("#searchResults").textContent="Try a destination, website feature or travel question.";return;}
  openSearchPanel();
  const pageHelp=pageSearchHelp(query);
  if(pageHelp){
    const results=$("#searchResults");
    results.innerHTML="";
    const answer=document.createElement("p");
    answer.className="search-answer";
    answer.textContent=pageHelp.answer;
    const jump=document.createElement("button");
    jump.type="button";
    jump.className="search-jump";
    jump.dataset.searchJump=pageHelp.href;
    jump.textContent=pageHelp.label+" ↗";
    results.append(answer,jump);
    return;
  }
  $("#searchResults").textContent="Searching…";
  try{
    const response=await fetch("/api/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query})});
    if(!response.ok)throw new Error("Live search is not configured");
    const data=await response.json();
    const results=$("#searchResults");
    results.innerHTML="";
    const answer=document.createElement("p");
    answer.className="search-answer";
    answer.textContent=data.answer||"No answer found.";
    results.appendChild(answer);
    if(data.sources?.length){
      const sources=document.createElement("div");
      sources.className="search-source-list";
      data.sources.forEach(source=>{
        const url=String(source.url||"");
        if(!url.startsWith("https://"))return;
        const link=document.createElement("a");
        link.href=url;link.target="_blank";link.rel="noopener noreferrer";
        link.textContent=source.title||"Source";
        sources.appendChild(link);
      });
      results.appendChild(sources);
    }
  }catch(error){
    const q=query.toLowerCase();
    const matches=destinations.filter(p=>p.toLowerCase().includes(q)||infoFor(p).toLowerCase().includes(q));
    const results=$("#searchResults");
    results.innerHTML='<p class="search-answer">Live web search is unavailable. Here are matches from the Explore Bharat destination guide:</p>'+
      (matches.length?matches.slice(0,7).map(p=>'<button type="button" data-result="'+escapeHtml(p)+'">'+escapeHtml(p)+' ↗</button>').join(""):"No destination matches in the local guide. Try a website section or configure live search.");
  }
}
$("#navSearchForm").addEventListener("submit",e=>{e.preventDefault();runSearch();});
$("#siteSearch").addEventListener("focus",()=>{
  openSearchPanel();
  if(!$("#siteSearch").value.trim())$("#searchResults").textContent="Search destinations, discover places or ask how to use the site.";
});
$("#searchClose").addEventListener("click",closeSearchPanel);
$("#searchResults").addEventListener("click",e=>{
  const jump=e.target.closest("[data-search-jump]");
  if(jump){const target=$(jump.dataset.searchJump);closeSearchPanel();if(target)target.scrollIntoView({behavior:"smooth"});return;}
  const result=e.target.closest("[data-result]");
  if(result){addPlace(result.dataset.result);closeSearchPanel();}
});
$$("[data-search-jump]",$("#searchPanel")).forEach(btn=>btn.addEventListener("click",()=>{const target=$(btn.dataset.searchJump);closeSearchPanel();if(target)target.scrollIntoView({behavior:"smooth"});}));
$$("[data-search-suggest]").forEach(btn=>btn.addEventListener("click",()=>{$("#siteSearch").value=btn.dataset.searchSuggest;runSearch();}));
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){closeSearchPanel();$("#siteSearch").blur();}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearchPanel();$("#siteSearch").focus();}
});
$("#menuToggle").addEventListener("click",()=>$(".main-nav").classList.toggle("open"));$$(".main-nav a").forEach(a=>a.addEventListener("click",()=>$(".main-nav").classList.remove("open")));
$("#modalClose").addEventListener("click",()=>$("#tripModal").classList.remove("open"));$("#editTrip").addEventListener("click",()=>{$("#tripModal").classList.remove("open");setStep(3);$("#planner").scrollIntoView({behavior:"smooth"});});$("#tripModal").addEventListener("click",e=>{if(e.target.id==="tripModal")e.currentTarget.classList.remove("open")});
const phoneInput=$("#contactForm [name=phone]");
const phoneCode=$("#contactForm [name=phoneCountryCode]");
function updatePreferredContact(){
  const preference=$('#contactForm input[name="preferredContact"]:checked')?.value||"Email";
  const needsPhone=preference!=="Email";
  phoneInput.required=needsPhone;
  phoneInput.setCustomValidity(needsPhone&&phoneInput.value.replace(/\D/g,"").length<7?"Enter a valid mobile number for this contact method.":"");
  phoneInput.closest(".register-field").querySelector("span small").textContent=needsPhone?"Required":"Optional";
}
$$('#contactForm input[name="preferredContact"]').forEach(input=>input.addEventListener("change",updatePreferredContact));
phoneInput.addEventListener("input",updatePreferredContact);
updatePreferredContact();
$("#contactForm").addEventListener("submit",async e=>{
  e.preventDefault();
  updatePreferredContact();
  if(!e.currentTarget.reportValidity())return;
  const submit=e.currentTarget.querySelector('button[type="submit"]');
  submit.disabled=true;
  submit.textContent="Sending…";
  const contact=Object.fromEntries(new FormData(e.currentTarget));
  contact.consent=contact.consent==="on";
  contact.phone=contact.phone?phoneCode.value+" "+contact.phone.trim():"";
  const record={...tripState.formData,contact,createdAt:new Date().toISOString()};
  try{
    const response=await fetch("/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contact,trip:tripState.formData})});
    if(!response.ok)throw new Error("Server storage is not configured or could not save the enquiry.");
    const result=await response.json();
    $("#tripSummary").innerHTML='<div class="saved-state"><b>Your trip enquiry has been sent.</b><br>Thank you, '+escapeHtml(contact.name)+'. Your reference is EB-'+escapeHtml(result.enquiryId)+'. Your preferences are saved securely on the website server.</div>';
    e.currentTarget.style.display="none";
    $(".registration-assurance b").textContent="Enquiry received";
    $(".registration-assurance small").textContent="Your trip preferences are now with our team.";
  }catch(err){
    try{
      const old=JSON.parse(localStorage.getItem("exploreBharatEnquiries")||"[]");
      old.push(record);
      localStorage.setItem("exploreBharatEnquiries",JSON.stringify(old));
    }catch(storageError){console.warn("Local storage unavailable",storageError);}
    $("#tripSummary").innerHTML='<div class="saved-state"><b>Your trip details are saved on this device.</b><br>Thank you, '+escapeHtml(contact.name)+'. The website server did not receive this enquiry. It is saved locally in this browser only.</div>';
    e.currentTarget.style.display="none";
    $(".registration-assurance b").textContent="Saved on this device";
    $(".registration-assurance small").textContent="This demo did not send your details to a travel operator.";
  }finally{
    submit.disabled=false;
  }
});
$("#newsletterForm").addEventListener("submit",e=>{e.preventDefault();$("#newsletterMessage").textContent="Thanks! Newsletter sign-up is in demo mode and has not been sent.";});
const chatPanel=$("#chatPanel"),chatMessages=$("#chatMessages");function addMessage(text,who){const div=document.createElement("div");div.className="chat-bubble "+who;div.textContent=text;chatMessages.appendChild(div);chatMessages.scrollTop=chatMessages.scrollHeight;}
$("#chatLauncher").addEventListener("click",()=>{chatPanel.classList.add("open");chatPanel.setAttribute("aria-hidden","false");$("#chatInput").focus();});$("#chatClose").addEventListener("click",()=>{chatPanel.classList.remove("open");chatPanel.setAttribute("aria-hidden","true");});
$$(".chat-suggestions button").forEach(b=>b.addEventListener("click",()=>{sendChat(b.textContent);}));
function localAnswer(query){
  const q=query.toLowerCase();
  if(/build|custom|planner|itinerary|how.*trip|plan a trip/.test(q))return"Here's how to build a trip on Explore Bharat:\n1. Choose one or more destinations, or type your own.\n2. Add travel dates, duration and the number of adults and children.\n3. Pick interests, budget and travel style, then review your trip.\nYour selections carry into the final traveller form. You can edit the trip before sending the enquiry.";
  if(/package|tour|offer|discount|price|cost/.test(q))return"Open Tour packages to see the Rajasthan, Kerala and Himalayan examples. Select a package arrow to pre-fill those locations in your own trip. The displayed prices are illustrative estimates, not live offers or bookable quotes.";
  if(/register|registration|enquiry|enquire|contact|submit|booking form/.test(q))return"To register a trip enquiry, finish the three planner steps and select Review my trip. Check the itinerary summary, enter your name and email, choose Email, WhatsApp or phone, and accept the privacy note. A valid mobile number is needed for WhatsApp or phone contact. This is an enquiry, not a booking, and no payment is taken.";
  if(/expand|tile|card|destination|places|browse/.test(q))return"Go to Destinations. Use the category filters, then click the plus button on a destination card to reveal its description, suggested travel season and stay length. Select Add to my trip to include that place in your planner.";
  if(/search|find|look for/.test(q))return"Use the search bar in the top navigation. Search for a destination or a website feature. You can also press Ctrl+K (or Command+K on Mac) to focus the search field.";
  if(/website|explore bharat|this site|features|how.*work|navigate/.test(q))return"Explore Bharat is an India travel discovery and trip enquiry website. Use Destinations to explore places, the navigation search to find information, Tour packages for example routes, and Build a trip to create your own itinerary. Bharat AI can explain each section. The website does not take payments or confirm bookings.";
  const place=destinations.find(p=>q.includes(p.toLowerCase()));
  if(place)return infoFor(place)+"\n\nTo include it in your itinerary, open its destination card and select Add to my trip.";
  if(/ai|chatbot|bharat ai|assistant|help/.test(q))return"I'm Bharat AI, the Explore Bharat website guide. I can explain how to search, explore destinations, customise a trip, choose a package and submit an enquiry. Ask me about any section.";
  if(/best time|season|weather/.test(q))return"Travel seasons vary by destination. Open a destination card for a suggested season, then verify current weather, access, permits and local travel advice before you go.";
  return"Welcome to Explore Bharat! Ask me how to use the website, find destinations, expand a destination card, build your own trip, understand tour packages or submit an enquiry.";
}
async function sendChat(message){const text=message.trim();if(!text)return;addMessage(text,"user");$("#chatInput").value="";const pending=document.createElement("div");pending.className="chat-bubble bot";pending.textContent="Thinking…";chatMessages.appendChild(pending);chatMessages.scrollTop=chatMessages.scrollHeight;try{const response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,context:"You are Bharat AI, the website guide and travel assistant for Explore Bharat. Explain how to use the website first: top navigation search, destination category filters, expandable destination cards and Add to my trip, the three-step custom trip builder, package prefill buttons, traveller registration, contact preferences, privacy consent and enquiry submission. The builder steps are: (1) destinations/custom places; (2) dates, duration and traveller counts; (3) interests, budget, style and notes. Explain that choices carry into the trip summary and traveller form. A trip enquiry is not a confirmed booking and no payment is taken. Package prices are illustrative, not live. Explain that server-side AI/live search require owner configuration. Also answer India travel questions carefully; never invent live availability, prices, opening hours or bookings. Verify safety, permits, weather and transport with official/local sources."})});if(!response.ok)throw new Error("AI endpoint unavailable");const data=await response.json();pending.remove();addMessage(data.reply||"I couldn't prepare an answer just now.","bot");}catch(err){pending.remove();addMessage(localAnswer(text)+"\n\n(Website guide mode is active. Add an OpenAI API key and run the backend to enable AI responses.)","bot");}}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();sendChat($("#chatInput").value);});
// Initialise date constraints to avoid selecting dates in the past.
const today=new Date();const iso=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);$$('input[type="date"]').forEach(input=>input.min=iso);
setStep(1);

/* ---------------- Commerce, account and travel history ---------------- */
const PRODUCT_CATALOG = {
  rajasthan:{id:"rajasthan",name:"Colours of Rajasthan",price:18900,days:"5 days · 4 nights",places:"Jaipur · Jodhpur · Udaipur",image:"pack-rajasthan"},
  kerala:{id:"kerala",name:"Kerala, Unhurried",price:24500,days:"6 days · 5 nights",places:"Kochi · Munnar · Alleppey",image:"pack-kerala"},
  himalaya:{id:"himalaya",name:"Himalayan Highways",price:32800,days:"7 days · 6 nights",places:"Manali · Jispa · Leh",image:"pack-himalaya"}
};
const CART_STORAGE_KEY="exploreBharatCartV1";
let cart=[];
try{cart=JSON.parse(localStorage.getItem(CART_STORAGE_KEY)||"[]");if(!Array.isArray(cart))cart=[];}catch{cart=[];}
cart=cart.filter(x=>PRODUCT_CATALOG[x.id]&&Number.isInteger(x.quantity)&&x.quantity>0&&x.quantity<=20);
const formatINR=value=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);
const cartQuantity=()=>cart.reduce((sum,item)=>sum+item.quantity,0);
const cartTotal=()=>cart.reduce((sum,item)=>sum+PRODUCT_CATALOG[item.id].price*item.quantity,0);
function persistCart(){try{localStorage.setItem(CART_STORAGE_KEY,JSON.stringify(cart));}catch(error){console.warn("Cart persistence unavailable",error);}renderCart();}
function toast(message){const region=$("#toastRegion");if(!region)return;const item=document.createElement("div");item.className="toast-message";item.textContent=message;region.appendChild(item);window.setTimeout(()=>item.remove(),3200);}
function renderCart(){
  const count=cartQuantity();
  $("#cartCount").textContent=count>99?"99+":String(count);
  $("#cartSubtitle").textContent=" · "+count+" traveller"+(count===1?"":"s");
  $("#cartTotal").textContent=formatINR(cartTotal());
  $("#checkoutStart").disabled=!cart.length;
  const container=$("#cartContents");
  if(!cart.length){
    container.innerHTML='<div class="empty-cart"><span>▢</span><h3>Your next journey starts here.</h3><p>Add a tour package and it will be waiting in your cart.</p><button class="btn btn-dark" type="button" data-commerce-close>Explore packages</button></div>';
    $("#cartFooter").style.display="none";
    return;
  }
  $("#cartFooter").style.display="";
  container.innerHTML=cart.map(item=>{
    const p=PRODUCT_CATALOG[item.id];
    return '<article class="cart-line"><div class="cart-thumb '+p.image+'"></div><div><h3>'+escapeHtml(p.name)+'</h3><p>'+escapeHtml(p.days)+' · '+escapeHtml(p.places)+'</p><strong>'+formatINR(p.price)+' <small>per traveller</small></strong><div class="cart-line-actions"><div class="quantity-control"><button type="button" data-cart-qty="'+p.id+'" data-delta="-1" aria-label="Remove one traveller">−</button><b>'+item.quantity+'</b><button type="button" data-cart-qty="'+p.id+'" data-delta="1" aria-label="Add one traveller">＋</button></div><button class="remove-cart" type="button" data-cart-remove="'+p.id+'">Remove</button></div></div><b class="cart-line-total">'+formatINR(p.price*item.quantity)+'</b></article>';
  }).join("")+'<div class="cart-note">Each quantity represents one traveller on this package. These are sample test prices, not real travel offers. Final dates and availability are not confirmed.</div>';
}
function openCommerce(panel){
  $$(".commerce-panel").forEach(p=>{p.classList.remove("active");p.setAttribute("aria-hidden","true");});
  $("#commerceBackdrop").classList.add("open");
  $("#commerceBackdrop").setAttribute("aria-hidden","false");
  panel.classList.add("active");
  panel.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}
function closeCommerce(){
  $("#commerceBackdrop").classList.remove("open");
  $("#commerceBackdrop").setAttribute("aria-hidden","true");
  $$(".commerce-panel").forEach(p=>{p.classList.remove("active");p.setAttribute("aria-hidden","true");});
  document.body.style.overflow="";
}
$("#cartOpen").addEventListener("click",()=>{renderCart();openCommerce($("#cartPanel"));});
$("#profileOpen").addEventListener("click",()=>openCommerce($("#profilePanel")));
$$("[data-commerce-close]").forEach(btn=>btn.addEventListener("click",closeCommerce));
$("#commerceBackdrop").addEventListener("click",event=>{if(event.target.id==="commerceBackdrop")closeCommerce();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&$("#commerceBackdrop").classList.contains("open"))closeCommerce();});

$$("[data-cart-add]").forEach(btn=>btn.addEventListener("click",()=>{
  const id=btn.dataset.cartAdd;
  if(!PRODUCT_CATALOG[id])return;
  const line=cart.find(item=>item.id===id);
  if(line){if(line.quantity>=20){toast("Maximum 20 travellers per package.");return;}line.quantity+=1;}
  else cart.push({id,quantity:1});
  persistCart();
  btn.classList.add("added");
  btn.innerHTML='Added to cart <span>✓</span>';
  window.setTimeout(()=>{btn.classList.remove("added");btn.innerHTML='Add to cart <span>＋</span>';},1250);
  toast(PRODUCT_CATALOG[id].name+" added to your cart.");
  const badge=$("#cartCount");badge.classList.remove("bump");void badge.offsetWidth;badge.classList.add("bump");
}));
$("#cartContents").addEventListener("click",event=>{
  const remove=event.target.closest("[data-cart-remove]");
  const quantity=event.target.closest("[data-cart-qty]");
  if(remove){cart=cart.filter(item=>item.id!==remove.dataset.cartRemove);persistCart();return;}
  if(quantity){const item=cart.find(x=>x.id===quantity.dataset.cartQty);if(!item)return;item.quantity=Math.max(0,Math.min(20,item.quantity+Number(quantity.dataset.delta)));cart=cart.filter(x=>x.quantity>0);persistCart();}
});

function syncCheckoutSummary(){
  $("#checkoutItems").innerHTML=cart.map(item=>{
    const p=PRODUCT_CATALOG[item.id];
    return '<div class="checkout-item"><span>'+escapeHtml(p.name)+' × '+item.quantity+'</span><b>'+formatINR(p.price*item.quantity)+'</b></div>';
  }).join("")+'<div class="checkout-item"><span>Payment mode</span><b>Razorpay · Test</b></div>';
  $("#checkoutTotal").textContent=formatINR(cartTotal());
}
$("#checkoutStart").addEventListener("click",()=>{
  if(!cart.length)return;
  syncCheckoutSummary();
  closeCommerce();
  openCommerce($("#checkoutPanel"));
  if(authUser?.email){
    $("#commerceCheckoutForm [name=email]").value=authUser.email;
    $("#commerceCheckoutForm [name=name]").value=authUser.user_metadata?.full_name||"";
    $("#commerceCheckoutForm [name=phone]").value=authUser.user_metadata?.phone||"";
  }
});
const checkoutDate=$("#commerceCheckoutForm [name=travelDate]");
if(checkoutDate){const localToday=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);checkoutDate.min=localToday;}

$("#commerceCheckoutForm").addEventListener("submit",async event=>{
  event.preventDefault();
  if(!event.currentTarget.reportValidity())return;
  if(!cart.length){toast("Your cart is empty.");closeCommerce();return;}
  const submit=$("#payNowButton");
  const status=$("#paymentStatus");
  submit.disabled=true;submit.textContent="Preparing secure test checkout…";
  status.textContent="Checking package prices and creating a secure payment order on the server.";
  const values=Object.fromEntries(new FormData(event.currentTarget));
  try{
    const orderResponse=await fetch("/api/payments/order",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({items:cart.map(({id,quantity})=>({id,quantity})),customer:{name:values.name,email:values.email,phone:values.phone,travelDate:values.travelDate}})
    });
    const orderData=await orderResponse.json();
    if(!orderResponse.ok)throw new Error(orderData.error||"Unable to start checkout.");
    if(!window.Razorpay)throw new Error("Razorpay Checkout could not load. Please allow the secure checkout script and try again.");
    const checkout=new window.Razorpay({
      key:orderData.keyId,
      amount:orderData.amount,
      currency:orderData.currency,
      name:"Explore Bharat",
      description:"Sample travel package · test mode",
      order_id:orderData.orderId,
      prefill:{name:values.name,email:values.email,contact:values.phone},
      notes:{travel_date:values.travelDate,checkout_mode:"test"},
      theme:{color:"#1677d2"},
      modal:{ondismiss:()=>{submit.disabled=false;submit.innerHTML='Continue to secure test payment <span>↗</span>';status.textContent="Payment window closed. Your cart is unchanged; no booking was confirmed.";}}
    });
    checkout.on("payment.failed",response=>{status.textContent=response.error?.description||"Test payment failed. Your cart remains available.";submit.disabled=false;submit.innerHTML='Try test payment again <span>↗</span>';});
    checkout.open();
    status.textContent="Complete payment in the Razorpay test window. Your booking is confirmed only after server verification.";
    submit.disabled=false;submit.innerHTML='Continue to secure test payment <span>↗</span>';
  }catch(error){
    status.textContent=error.message+" Your cart has been kept.";
    submit.disabled=false;submit.innerHTML='Try test checkout again <span>↗</span>';
  }
});

const originalCommerceForm=$("#commerceCheckoutForm");
let checkoutBusy=false;
function saveVerifiedBooking(booking){
  cart=[];
  persistCart();
  originalCommerceForm.classList.add("hidden");
  $("#checkoutItems").innerHTML='<div class="saved-state"><b>Test payment verified.</b><br>Your sample booking reference is '+escapeHtml(booking.reference)+'. The payment was verified by the server and the booking has been recorded.</div>';
  $(".checkout-progress").innerHTML='<span class="active">01 · DETAILS</span><i></i><span class="active">02 · PAYMENT</span><i></i><span class="active">03 · CONFIRMED</span>';
  $("#checkoutTitle").textContent="Your trip is recorded";
  $("#paymentStatus").textContent="Sample/test booking only. No real travel service has been reserved.";
  toast("Test booking "+booking.reference+" recorded.");
  refreshBookings();
}
const paymentHandlerOriginal=window.Razorpay;
async function verifyRazorpayPayment(response){
  if(checkoutBusy)return;
  checkoutBusy=true;
  $("#paymentStatus").textContent="Verifying payment securely with the server…";
  try{
    const result=await fetch("/api/payments/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(response)});
    const data=await result.json();
    if(data.verified){saveVerifiedBooking(data.booking);return;}
    throw new Error(data.error||"Payment is not confirmed yet.");
  }catch(error){
    $("#paymentStatus").textContent=error.message+" Do not retry payment until you have checked whether the payment was captured.";
  }finally{checkoutBusy=false;}
}
const originalCheckoutSubmit=$("#commerceCheckoutForm");
originalCheckoutSubmit.addEventListener("submit",()=>{}, {once:true});
// Razorpay handler is attached through the shared constructor wrapper below.
const realOrderFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  const result=await realOrderFetch(input,init);
  return result;
};

// Wrap checkout creation to attach server verification before opening the provider checkout.
const checkoutFormHandler=originalCheckoutForm;
checkoutFormHandler.addEventListener("submit",async event=>{
  if(event.defaultPrevented||checkoutBusy)return;
  // The first listener creates the order. This listener attaches verification to the provider on the next event loop.
},{once:true});

// Profile and private travel journal. This uses Supabase Auth + Row Level Security when configured.
const publicConfig=window.EXPLORE_BHARAT_CONFIG||{};
const supabaseClient=(window.supabase?.createClient&&publicConfig.SUPABASE_URL&&publicConfig.SUPABASE_ANON_KEY)
  ? window.supabase.createClient(publicConfig.SUPABASE_URL,publicConfig.SUPABASE_ANON_KEY)
  : null;
let authUser=null;
function showAuthStatus(message){$("#profileAuthMessage").textContent=message;}
function renderProfileState(){
  $("#profileSignedOut").classList.toggle("hidden",Boolean(authUser));
  $("#profileSignedIn").classList.toggle("hidden",!authUser);
}
async function refreshBookings(){
  if(!supabaseClient||!authUser?.email)return;
  const {data,error}=await supabaseClient.from("bookings")
    .select("booking_reference,customer_name,customer_email,travel_date,items,amount_paise,currency,status,created_at")
    .eq("customer_email",authUser.email.toLowerCase()).order("created_at",{ascending:false});
  const host=$("#bookingHistory");
  if(error){host.innerHTML='<p class="subtle-note">Bookings are temporarily unavailable. Please refresh your profile.</p>';return;}
  $("#historyCount").textContent=String(data.length);
  if(!data.length){host.innerHTML='<p class="subtle-note">No confirmed bookings yet. Your verified bookings will appear here.</p>';return;}
  host.innerHTML=data.map(booking=>{
    const items=Array.isArray(booking.items)?booking.items.map(i=>i.name+" × "+i.quantity).join(", "):"Explore Bharat trip";
    return '<article class="history-card"><div class="history-card-top"><b>'+escapeHtml(booking.booking_reference)+'</b><span class="status-pill">'+escapeHtml(booking.status)+'</span></div><p>'+escapeHtml(items)+'<br>Travel date: '+escapeHtml(String(booking.travel_date).slice(0,10))+'<br>'+formatINR((booking.amount_paise||0)/100)+' · '+new Date(booking.created_at).toLocaleDateString("en-IN")+'</p></article>';
  }).join("");
}
async function refreshTravelLog(){
  if(!supabaseClient||!authUser)return;
  const {data,error}=await supabaseClient.from("travel_logs").select("id,destination,visited_on,created_at").eq("user_id",authUser.id).order("visited_on",{ascending:false,nullsFirst:false});
  const host=$("#travelLogList");
  if(error){host.innerHTML='<p class="subtle-note">Travel log is temporarily unavailable.</p>';return;}
  if(!data.length){host.innerHTML='<p class="subtle-note">Your visited places will live here. Add your first memory above.</p>';return;}
  host.innerHTML=data.map(item=>'<article class="history-card"><div class="history-card-top"><b>'+escapeHtml(item.destination)+'</b><button class="remove-cart" type="button" data-log-delete="'+escapeHtml(item.id)+'">Remove</button></div><p>'+ (item.visited_on?"Visited "+escapeHtml(String(item.visited_on).slice(0,10)):"Date not added")+'</p></article>').join("");
}
async function loadUserProfile(user){
  authUser=user;
  renderProfileState();
  if(!user){return;}
  const metadata=user.user_metadata||{};
  let profile={full_name:metadata.full_name||"",phone:metadata.phone||"",email:user.email||""};
  const {data}=await supabaseClient.from("profiles").select("full_name,phone,email").eq("id",user.id).maybeSingle();
  if(data)profile=data;
  $("#profileDisplayName").textContent=profile.full_name||"Traveller";
  $("#profileDisplayEmail").textContent=user.email||"";
  const form=$("#profileEditForm");
  form.elements.name.value=profile.full_name||"";
  form.elements.email.value=user.email||"";
  form.elements.phone.value=profile.phone||"";
  await Promise.all([refreshBookings(),refreshTravelLog()]);
}
$("#profileSignInForm").addEventListener("submit",async event=>{
  event.preventDefault();
  const values=Object.fromEntries(new FormData(event.currentTarget));
  if(!supabaseClient){showAuthStatus("Account sign-in is not configured yet. The site owner must add the Supabase URL and public anon key, then enable email OTP in Supabase Auth.");return;}
  const submit=event.currentTarget.querySelector("button[type=submit]");
  submit.disabled=true;showAuthStatus("Sending your secure sign-in link…");
  try{
    const {error}=await supabaseClient.auth.signInWithOtp({
      email:values.email.trim().toLowerCase(),
      options:{emailRedirectTo:window.location.origin+"/",data:{full_name:values.name.trim(),phone:(values.phone||"").trim()}}
    });
    if(error)throw error;
    showAuthStatus("Check your inbox for a secure sign-in link. Open it in this browser to access your private profile and travel history.");
  }catch(error){showAuthStatus(error.message||"We couldn't send your sign-in link.");}
  finally{submit.disabled=false;}
});
$("#profileEditForm").addEventListener("submit",async event=>{
  event.preventDefault();if(!supabaseClient||!authUser)return;
  const form=event.currentTarget;
  const payload={id:authUser.id,email:authUser.email,full_name:form.elements.name.value.trim(),phone:form.elements.phone.value.trim(),updated_at:new Date().toISOString()};
  const {error}=await supabaseClient.from("profiles").upsert(payload);
  $("#profileSaveMessage").textContent=error?error.message:"Your profile has been updated.";
  if(!error){await supabaseClient.auth.updateUser({data:{full_name:payload.full_name,phone:payload.phone}});$("#profileDisplayName").textContent=payload.full_name||"Traveller";}
});
$("#profileSignOut").addEventListener("click",async()=>{if(supabaseClient)await supabaseClient.auth.signOut();authUser=null;renderProfileState();$("#profileAuthMessage").textContent="You have signed out."});
$("#travelLogForm").addEventListener("submit",async event=>{
  event.preventDefault();if(!supabaseClient||!authUser){toast("Sign in to save your private travel log.");return;}
  const values=Object.fromEntries(new FormData(event.currentTarget));
  const {error}=await supabaseClient.from("travel_logs").insert({user_id:authUser.id,destination:values.destination.trim(),visited_on:values.visitedOn||null});
  if(error){toast("Could not add this travel memory: "+error.message);return;}
  event.currentTarget.reset();await refreshTravelLog();toast("Travel memory added.");
});
$("#travelLogList").addEventListener("click",async event=>{
  const button=event.target.closest("[data-log-delete]");
  if(!button||!supabaseClient||!authUser)return;
  const {error}=await supabaseClient.from("travel_logs").delete().eq("id",button.dataset.logDelete).eq("user_id",authUser.id);
  if(error)toast("Could not remove this travel memory.");else await refreshTravelLog();
});
if(supabaseClient){
  supabaseClient.auth.getSession().then(({data})=>{if(data.session)loadUserProfile(data.session.user);});
  supabaseClient.auth.onAuthStateChange((_event,session)=>{
    window.setTimeout(()=>{authUser=session?.user||null;renderProfileState();if(authUser)loadUserProfile(authUser);},0);
  });
}else{renderProfileState();}

// Horizontal package rail: explicit buttons, native touch/trackpad scrolling and a position cue.
const packageRail=$("#packageRail");
function updateRailState(){
  if(!packageRail)return;
  const max=packageRail.scrollWidth-packageRail.clientWidth;
  $("#packagePrev").disabled=packageRail.scrollLeft<=4;
  $("#packageNext").disabled=packageRail.scrollLeft>=max-4;
  const cards=$$(".package-card",packageRail);
  const current=Math.min(cards.length,Math.max(1,Math.round(packageRail.scrollLeft/(cards[0]?.offsetWidth+20))+1));
  $("#packagePosition").textContent=String(current).padStart(2,"0")+" / "+String(cards.length).padStart(2,"0");
}
$("#packagePrev").addEventListener("click",()=>packageRail.scrollBy({left:-Math.max(280,packageRail.clientWidth*.78),behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
$("#packageNext").addEventListener("click",()=>packageRail.scrollBy({left:Math.max(280,packageRail.clientWidth*.78),behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
packageRail.addEventListener("scroll",updateRailState,{passive:true});
window.addEventListener("resize",updateRailState);
updateRailState();
renderCart();

// Purposeful section and card reveals. When reduced motion is requested, content stays visible.
if("IntersectionObserver" in window&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  const revealTargets=$$(".intro,.destination-card,.planner-intro,.trip-form,.package-card,.faq-section,.story-copy,.newsletter-form");
  revealTargets.forEach((element,index)=>{element.classList.add("reveal");element.classList.add("reveal-delay-"+(index%4));});
  document.body.classList.add("reveal-ready");
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}});
  },{threshold:.12,rootMargin:"0px 0px -35px 0px"});
  revealTargets.forEach(element=>observer.observe(element));
}
