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
  if(/destination|place|expand|tile|card|mountain|beach|kerala|ladakh|jaipur|meghalaya|varanasi|andaman|hampi|mumbai/.test(q))return {answer:"Browse destination cards in the Destinations section. Use the category filters to narrow the list, then select the plus button on a card to reveal highlights, suggested season and stay length. Choose Add to my trip to carry that place into the planner.",href:"#destinations",label:"Browse destinations"};
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