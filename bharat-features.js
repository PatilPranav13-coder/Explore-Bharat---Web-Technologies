/* Explore Bharat — command palette and blur-up media. */
document.addEventListener("DOMContentLoaded",()=>{
 "use strict";
 const $=id=>document.getElementById(id);
 const overlay=$("bharatCommandOverlay"),input=$("bharatCommandInput"),results=$("bharatCommandResults");
 if(!overlay||!input||!results)return;
 const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
 const behaviour=reduce?"auto":"smooth";
 const actions=[];
 const add=(label,description,icon,run,keywords="")=>actions.push({label,description,icon,run,keywords});
 const section=(id)=>$(id)?.scrollIntoView({behavior,block:"start"});
 const goCulture=category=>{
   const tab=document.querySelector('.culture-tab[data-category="'+category+'"]');
   if(tab)tab.click();section("culture");
 };
 add("Home","Return to the Explore Bharat landing section","⌂",()=>section("home"),"start top");
 add("All destinations","Browse the destination collection","⌖",()=>section("destinations"),"places explore india");
 add("Culture collections","Explore traditions, food, dance and festivals","✺",()=>section("culture"),"heritage traditions");
 add("Architectural heritage","Open the architecture collection","⌂",()=>{goCulture("architecture");},"monuments temples forts buildings");
 add("Tour packages","Browse sample tour ideas","▤",()=>section("packages"),"packages price");
 add("Build my trip","Open the custom trip planner","✈",()=>section("trip-planner"),"itinerary plan budget");
 add("Registration","Go to the journey registration form","✎",()=>section("registration"),"register sign up");
 add("My profile","Open your profile and travel log","♙",()=>$("profileOpen")?.click(),"account travel history");
 add("Bharat AI","Open the website guide","✦",()=>$("bharatAiToggle")?.click(),"assistant chatbot help");
 document.querySelectorAll(".destination-card").forEach(card=>{
   const title=card.querySelector("h3")?.textContent.trim();if(!title)return;
   add(title,"Open destination details","⌖",()=>{section("destinations");setTimeout(()=>card.click(),reduce?0:320);},"destination "+(card.dataset.destination||""));
 });
 document.querySelectorAll(".culture-tab").forEach(tab=>{
   const category=tab.dataset.category,label=tab.textContent.trim();
   if(category)add(label+" culture","Open the "+label+" collection","✺",()=>goCulture(category),"culture traditions art");
 });
 let filtered=[],active=0,lastFocus=null;
 function close(){overlay.hidden=true;document.body.style.overflow="";if(lastFocus?.focus)lastFocus.focus();}
 function render(query=""){
   const term=query.trim().toLocaleLowerCase("en-IN");
   filtered=actions.filter(item=>!term||(item.label+" "+item.description+" "+item.keywords).toLocaleLowerCase("en-IN").includes(term));
   active=0;results.replaceChildren();
   if(!filtered.length){const empty=document.createElement("p");empty.className="bharat-command-empty";empty.textContent="No matching command. Try a destination, culture category or tool.";results.appendChild(empty);return;}
   filtered.forEach((item,index)=>{
     const button=document.createElement("button");button.type="button";button.className="bharat-command-item";button.setAttribute("role","option");button.setAttribute("aria-selected",String(index===active));
     const icon=document.createElement("span");icon.className="bharat-command-item-icon";icon.textContent=item.icon;
     const copy=document.createElement("span");copy.className="bharat-command-item-copy";
     const title=document.createElement("strong");title.textContent=item.label;
     const description=document.createElement("small");description.textContent=item.description;copy.append(title,description);
     const hint=document.createElement("kbd");hint.textContent=index===0?"↵":"";
     button.append(icon,copy,hint);button.addEventListener("click",()=>execute(index));results.appendChild(button);
   });
 }
 function execute(index){const item=filtered[index];if(!item)return;close();item.run();}
 function open(){
   lastFocus=document.activeElement;overlay.hidden=false;document.body.style.overflow="hidden";input.value="";render();input.focus();
 }
 document.addEventListener("keydown",event=>{
   if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();open();return;}
   if(overlay.hidden)return;
   if(event.key==="Escape"){event.preventDefault();close();}
   else if(event.key==="ArrowDown"&&filtered.length){event.preventDefault();active=(active+1)%filtered.length;updateActive();}
   else if(event.key==="ArrowUp"&&filtered.length){event.preventDefault();active=(active-1+filtered.length)%filtered.length;updateActive();}
   else if(event.key==="Enter"&&filtered.length){event.preventDefault();execute(active);}
 });
 function updateActive(){
   results.querySelectorAll(".bharat-command-item").forEach((item,index)=>item.setAttribute("aria-selected",String(index===active)));
   results.querySelectorAll(".bharat-command-item")[active]?.scrollIntoView({block:"nearest"});
 }
 input.addEventListener("input",()=>render(input.value));
 overlay.addEventListener("click",event=>{if(event.target===overlay)close();});

 // Blur-up: retain the image geometry, then resolve the soft placeholder once decoded.
 document.querySelectorAll("img").forEach(image=>{
   image.classList.add("blur-up-media");
   const done=()=>{
     if(image.naturalWidth>0)image.classList.add("is-loaded");
     else image.classList.add("is-unavailable");
   };
   if(image.complete)done();
   else{
     image.addEventListener("load",done,{once:true});
     image.addEventListener("error",done,{once:true});
   }
 });
});
