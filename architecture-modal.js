/* Explore Bharat — architecture story expansion */
document.addEventListener("DOMContentLoaded",()=>{
  "use strict";
  const $=(id)=>document.getElementById(id);
  const modal=$("architectureModal");
  if(!modal)return;
  const image=$("architectureModalImage");
  const closeButtons=modal.querySelectorAll("[data-architecture-close]");
  const triggerSelector=".architecture-card[data-architecture-id]";
  let lastFocus=null,currentId="";
  const data={
    "taj-mahal":{
      title:"Taj Mahal",location:"Agra, Uttar Pradesh",period:"1631–1648",style:"Mughal marble architecture",region:"North India",
      kicker:"A MONUMENT OF MUGHAL INDIA",badge:"UNESCO World Heritage Site",
      description:"Commissioned by Mughal emperor Shah Jahan in memory of Mumtaz Mahal, the Taj Mahal is a white-marble mausoleum within a carefully planned garden complex. Its balanced composition, inlay work, calligraphy and great central dome bring architecture, landscape and craftsmanship together.",
      highlights:["White marble surfaces with pietra-dura stone inlay and calligraphic decoration.","A central domed mausoleum framed by four minarets and a charbagh-style garden.","The wider complex includes a gateway, mosque and jawab building."],
      experience:"Notice how the monument changes colour through the day, then explore the marble inlay and garden geometry from the main approach.",
      sources:[["UNESCO heritage record","https://whc.unesco.org/en/list/252/"],["Image & licence","https://commons.wikimedia.org/wiki/File:The_Taj_Mahal,_Agra_Photography.jpg"],["Image: Fastestfaraz1 · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:The_Taj_Mahal,_Agra_Photography.jpg"]]
    },
    "forts-of-rajasthan":{
      title:"Amber Fort",location:"Amer, Jaipur, Rajasthan",period:"Fort complex from the 16th century; palace additions in the 17th",style:"Rajput–Mughal court architecture",region:"Rajasthan",
      kicker:"FORTS, PALACES & COURTLY LIFE",badge:"Part of Rajasthan’s UNESCO-listed Hill Forts",
      description:"Amber Fort rises above Maota Lake in the Aravalli hills. Its defensive setting, courtyards, audience halls and palace rooms reveal how a fort could also function as a royal residence and a centre of courtly culture.",
      highlights:["A sequence of gates and courtyards that moves from defence to formal palace spaces.","The Sheesh Mahal is celebrated for its mirror-work decoration.","Its palace architecture reflects an exchange of Rajput and Mughal design ideas."],
      experience:"Explore the fort slowly: compare the scale of its defensive approach with the finer ornament inside the palace courts.",
      sources:[["UNESCO Hill Forts of Rajasthan","https://whc.unesco.org/en/list/247/"],["Image & licence","https://commons.wikimedia.org/wiki/File:Amber_Fort,_Jaipur_(Rajasthan).jpg"],["Image: Rijin S · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Amber_Fort_Jaipur_01.jpg"]]
    },
    "ajanta-ellora-caves":{
      title:"Ajanta & Ellora Caves",location:"Aurangabad region, Maharashtra",period:"Ajanta: 2nd–1st century BCE and 5th–6th century CE phases; Ellora: 6th–12th century",style:"Buddhist, Hindu and Jain rock-cut architecture",region:"Maharashtra",
      kicker:"A CIVILISATION CARVED INTO ROCK",badge:"Both cave groups are UNESCO World Heritage Sites",
      description:"Ajanta and Ellora are distinct cave complexes that together reveal centuries of artistic and religious history. Ajanta is especially known for Buddhist sanctuaries, monasteries, paintings and sculpture. Ellora brings Buddhist, Hindu and Jain sanctuaries together along a basalt escarpment.",
      highlights:["Ajanta’s chaityagrihas and viharas combine worship, monastic life and painted decoration.","Ellora contains 34 caves; the Kailasa temple at Cave 16 is carved from the rock on a monumental scale.","The two sites show different phases of Indian rock-cut architecture and craftsmanship."],
      experience:"At Ajanta, look for the relationship between the painted interiors and the rock-cut spaces. At Ellora, compare the cave groups and the scale of the Kailasa temple.",
      sources:[["UNESCO: Ajanta Caves","https://whc.unesco.org/en/list/242/"],["UNESCO: Ellora Caves","https://whc.unesco.org/en/list/243/"],["Image & licence","https://commons.wikimedia.org/wiki/File:Ajanta_Caves,_Maharashtra,_India.jpg"],["Image: Jayesh Paranjape · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Ajanta_Caves_as_seen_from_the_view-point.JPG"]]
    },
    "meenakshi-amman-temple":{
      title:"Meenakshi Amman Temple",location:"Madurai, Tamil Nadu",period:"Historic temple complex developed over many centuries",style:"Dravidian temple architecture",region:"Tamil Nadu",
      kicker:"THE LIVING TEMPLE CITY OF MADURAI",badge:"Historic active place of worship",
      description:"The Meenakshi Amman Temple is dedicated to Meenakshi and Sundareswarar. Its great gopurams, sculptural surfaces, corridors and ritual spaces form a landmark of Madurai and an important living centre of worship.",
      highlights:["Tall gateway towers (gopurams) covered with tiers of sculpted figures.","A complex of shrines, corridors, halls and sacred tanks.","The temple’s architecture is closely connected to Madurai’s urban and cultural identity."],
      experience:"Look closely at the layered gopuram sculpture and the way the gateways organise movement into the temple complex. Visitors should follow local dress and photography rules.",
      sources:[["Image & licence","https://commons.wikimedia.org/wiki/File:Meenakshi_Amman_Temple,_Madurai.jpg"],["Image: Ilya Mauter · CC BY 3.0","https://commons.wikimedia.org/wiki/File:Meenakshi_Amman_temple_in_Madurai.JPG"]]
    },
    "konark-sun-temple":{
      title:"Konark Sun Temple",location:"Konark, Odisha",period:"13th century CE",style:"Kalinga temple architecture",region:"Odisha",
      kicker:"THE STONE CHARIOT OF THE SUN",badge:"UNESCO World Heritage Site",
      description:"The Sun Temple at Konark is conceived as the monumental chariot of Surya. Its carved stone wheels, sculptural programme and carefully composed architectural mass make it one of the most distinctive temple monuments on India’s eastern coast.",
      highlights:["The temple’s chariot form is expressed through sculpted wheels and horse imagery.","The ornament includes scenes of music, dance, daily life and religious symbolism.","It represents a culmination of Kalinga temple architecture."],
      experience:"Study the carved wheels and the sculptural bands around the platform. Morning and late-afternoon light help reveal the depth of the stone carving.",
      sources:[["UNESCO heritage record","https://whc.unesco.org/en/list/246/"],["Image & licence","https://commons.wikimedia.org/wiki/File:Konark_Sun_Temple_of_Orissa.jpg"],["Image: Bhubaneswar2009 · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Konark_Sun_Temple,_Konark,_Odisha,_India.jpg"]]
    },
    "hampi":{
      title:"Hampi",location:"Vijayanagara region, Karnataka",period:"Principal capital remains from the 14th–16th centuries",style:"Vijayanagara and Dravidian architecture",region:"Karnataka",
      kicker:"THE GREAT CAPITAL OF VIJAYANAGARA",badge:"UNESCO World Heritage Site",
      description:"Hampi preserves the remains of the Vijayanagara capital: temples, royal and sacred complexes, gateways, water systems, bazaars and fortifications set among granite hills and the Tungabhadra river landscape.",
      highlights:["The Vittala Temple complex includes the iconic stone chariot and a broad temple street.","Royal and sacred areas reveal a sophisticated urban landscape.","Granite masonry, pillared halls and gateway towers define much of the surviving architecture."],
      experience:"Explore a cluster at a time rather than rushing between ruins. The stone chariot, temple halls and surrounding landscape are especially rewarding in softer morning or evening light.",
      sources:[["UNESCO heritage record","https://whc.unesco.org/en/list/241/"],["Image & licence","https://commons.wikimedia.org/wiki/File:Hampi_stone_chariot.jpg"],["Image: Hardeep Asrani · CC0","https://commons.wikimedia.org/wiki/File:Hampi_stone_chariot.jpg"]]
    },
    "sanchi-stupa":{
      title:"Sanchi Stupa",location:"Sanchi, Madhya Pradesh",period:"Buddhist monuments spanning the 3rd century BCE to the 12th century CE",style:"Buddhist stupa architecture",region:"Madhya Pradesh",
      kicker:"AN EARLY CENTRE OF BUDDHIST ART",badge:"UNESCO World Heritage Site",
      description:"Sanchi is one of India’s most important Buddhist monument groups. The Great Stupa, stone railings and elaborately carved gateways preserve a long tradition of Buddhist architecture, symbolism and storytelling.",
      highlights:["The hemispherical stupa dome is organised around a central relic structure.","Carved torana gateways carry detailed narrative and symbolic reliefs.","The wider site includes monasteries, temples and pillars from different periods."],
      experience:"Walk around the stupa to study the gateways from each side. The carved panels reward a slow visit and close observation.",
      sources:[["UNESCO heritage record","https://whc.unesco.org/en/list/524/"],["Image & licence","https://commons.wikimedia.org/wiki/File:SANCHI_STUPA_AT_SAN_CHI_IN_RAISEN.jpg"],["Image: Wikimedia Commons · verify author on source page","https://commons.wikimedia.org/wiki/File:SANCHI_STUPA_AT_SAN_CHI_IN_RAISEN.jpg"]]
    },
    "rani-ki-vav":{
      title:"Rani ki Vav",location:"Patan, Gujarat",period:"11th century CE",style:"Maru-Gurjara stepwell architecture",region:"Gujarat",
      kicker:"A PALACE-LIKE ARCHITECTURE OF WATER",badge:"UNESCO World Heritage Site",
      description:"Rani ki Vav is a monumental stepwell on the banks of the Saraswati River. Designed as an inverted temple, its descending corridors and sculptural panels turn a practical water structure into an elaborate work of architecture.",
      highlights:["Seven levels of stairs descend towards the water and well shaft.","More than 500 principal sculptures and over a thousand smaller figures enrich the walls.","Its form combines water storage, ritual meaning and highly refined Maru-Gurjara craftsmanship."],
      experience:"View the structure from the upper levels to understand its symmetry, then follow the descending steps to appreciate the changing scale and detail.",
      sources:[["UNESCO heritage record","https://whc.unesco.org/en/list/922/"],["Image & licence","https://commons.wikimedia.org/wiki/File:Rani_ki_vav_at_Patan.jpg"],["Image: Bernard Gagnon · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Rani_ki_vav_04.jpg"]]
    }
  };

  function makeText(tag,text,className){
    const el=document.createElement(tag);if(className)el.className=className;el.textContent=text;return el;
  }
  function openDetails(id,card){
    const entry=data[id];if(!entry)return;
    currentId=id;lastFocus=card||document.activeElement;
    const imageNode=card?.querySelector("img");
    image.src=imageNode?.currentSrc||imageNode?.src||"";
    image.alt=entry.title+" — architecture";
    $("architectureModalTitle").textContent=entry.title;
    $("architectureModalKicker").textContent=entry.kicker;
    $("architectureModalLocation").textContent=entry.location;
    $("architectureModalPeriod").textContent=entry.period;
    $("architectureModalStyle").textContent=entry.style;
    $("architectureModalRegion").textContent=entry.region;
    $("architectureModalDescription").textContent=entry.description;
    $("architectureModalExperience").textContent=entry.experience;
    $("architectureModalHeritageBadge").textContent=entry.badge;
    const highlights=$("architectureModalHighlights");highlights.replaceChildren();
    entry.highlights.forEach(text=>highlights.appendChild(makeText("li",text)));
    const sources=$("architectureModalSources");sources.replaceChildren();
    entry.sources.forEach(([label,url])=>{
      const link=document.createElement("a");link.href=url;link.target="_blank";link.rel="noopener noreferrer";link.textContent=label;sources.appendChild(link);
    });
    modal.hidden=false;modal.setAttribute("aria-hidden","false");document.body.classList.add("architecture-modal-open");
    modal.querySelector(".architecture-modal-close").focus();
    document.dispatchEvent(new CustomEvent("explore-bharat:assistant-action",{detail:{
      title:"Architecture explored",detail:"Opened the architecture story for "+entry.title+"."
    }}));
  }
  function closeDetails(){
    if(modal.hidden)return;
    modal.hidden=true;modal.setAttribute("aria-hidden","true");document.body.classList.remove("architecture-modal-open");
    if(lastFocus?.focus)lastFocus.focus();
  }
  document.addEventListener("click",event=>{
    const card=event.target.closest(triggerSelector);
    if(card){openDetails(card.dataset.architectureId,card);return;}
    if(event.target.closest("[data-architecture-close]"))closeDetails();
  });
  document.addEventListener("keydown",event=>{
    if(modal.hidden)return;
    if(event.key==="Escape"){event.preventDefault();closeDetails();return;}
    const card=event.target.closest(triggerSelector);
    if(card&&(event.key==="Enter"||event.key===" ")){event.preventDefault();openDetails(card.dataset.architectureId,card);}
  });
  $("architecturePlanVisit").addEventListener("click",()=>{
    const style=$("tripStyle");
    if(style&&Array.from(style.options).some(option=>option.value==="heritage"))style.value="heritage";
    closeDetails();
    const heritageOption=style&&Array.from(style.options).find(option=>option.value==="heritage");
    if(style&&heritageOption)style.value="heritage";
    document.getElementById("trip-planner")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    document.dispatchEvent(new CustomEvent("explore-bharat:assistant-action",{detail:{
      title:"Heritage trip planning",detail:"Used the architecture guide to start planning a visit to "+(data[currentId]?.title||"a heritage site")+"."
    }}));
  });
});
