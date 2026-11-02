/* =========================================================
   EXPLORE BHARAT — VANILLA JAVASCRIPT
   Navigation · Destinations · Culture switch-case · Planner
   ========================================================= */

const WIKIMEDIA = {
  goa: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Goa-sea-beach.jpg/1280px-Goa-sea-beach.jpg",
  ladakh: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Pangong_lake_in_Ladakh.jpg/1280px-Pangong_lake_in_Ladakh.jpg",
  varanasi: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Ghats_of_Varanasi%2C_Evening.jpg/1280px-Ghats_of_Varanasi%2C_Evening.jpg",
  thali: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/Indian_food_thali.jpg/1280px-Indian_food_thali.jpg",
  dance: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/A_Bharatanatyam_dancer.jpg/500px-A_Bharatanatyam_dancer.jpg",
  diwali: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Diwali_Diyas_Lamps.jpg/1280px-Diwali_Diyas_Lamps.jpg",
  assam: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Tea_garden_in_Assam.jpg/1280px-Tea_garden_in_Assam.jpg",
  warli: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Warli_painting.jpg/1280px-Warli_painting.jpg",
  temple: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Meenakshi_Amman_temple_in_Madurai.JPG/960px-Meenakshi_Amman_temple_in_Madurai.JPG",
  music: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/String_instrument_from_India.jpg/1280px-String_instrument_from_India.jpg",
  manuscript: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Indian_manuscript%2C_Devanagari_script_on_paper.jpg/960px-Indian_manuscript%2C_Devanagari_script_on_paper.jpg",
  textile: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Vintage_photograph_of_sari_weaving_in_Maharashtra_-_1873.jpg",
  taj: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/The_Taj_Mahal%2C_Agra_Photography.jpg/1280px-The_Taj_Mahal%2C_Agra_Photography.jpg",
  uttarakhand: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Valley_of_flowers_Uttarakhand.jpg/1280px-Valley_of_flowers_Uttarakhand.jpg"
};

const LOCAL_IMAGES = {
  collage: "images/hero-collage.jpg",
  kashmir: "images/kashmir.jpg",
  rajasthan: "images/rajasthan.jpg",
  kerala: "images/kerala.jpg",
  maharashtra: "images/maharashtra.jpg"
};

/* ---------- MOBILE NAVIGATION ---------- */
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = navMenu ? navMenu.querySelectorAll(".nav-link") : [];

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      menuToggle.textContent = "☰";
    });
  });
}

/* Highlight the visible main section in the navigation. */
if ("IntersectionObserver" in window) {
  const mainSections = document.querySelectorAll("main section[id]");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-25% 0px -60% 0px" });
  mainSections.forEach((section) => sectionObserver.observe(section));
}

/* ---------- DESTINATION DATA ---------- */
const destinations = [
  {
    id: "kashmir", name: "Kashmir", tag: "VALLEYS & LAKES", image: LOCAL_IMAGES.kashmir,
    alt: "Shikara boat on a Kashmir lake with mountains behind it", subtitle: "Paradise on Earth",
    description: "Kashmir brings together Himalayan scenery, quiet lakes, gardens and distinctive regional traditions. It is a destination for travellers who enjoy landscapes, local craft and slow, scenic journeys.",
    places: ["Srinagar and Dal Lake", "Mughal Gardens", "Gulmarg", "Pahalgam"],
    experiences: ["Take a shikara ride on Dal Lake", "Explore local markets and handicrafts", "Try Kashmiri cuisine", "Enjoy a mountain excursion"],
    tip: "Plan around the season and local travel advisories. Mountain conditions and road access can change quickly.",
    gallery: [LOCAL_IMAGES.kashmir, WIKIMEDIA.ladakh, LOCAL_IMAGES.collage]
  },
  {
    id: "rajasthan", name: "Rajasthan", tag: "ROYAL HERITAGE", image: LOCAL_IMAGES.rajasthan,
    alt: "Amber Fort in Rajasthan", subtitle: "Where royal stories live",
    description: "Rajasthan is known for its forts, palaces, desert landscapes, colourful markets and food traditions. Each city offers a different view of the region's layered history.",
    places: ["Jaipur and Amber Fort", "Jaisalmer Fort", "Udaipur City Palace", "Jodhpur's Mehrangarh Fort"],
    experiences: ["Explore historic forts and havelis", "Visit traditional craft markets", "Sample regional cuisine", "Experience folk music and performances"],
    tip: "Daytime temperatures can be high in warmer months. Carry water and plan outdoor sightseeing for cooler hours.",
    gallery: [LOCAL_IMAGES.rajasthan, WIKIMEDIA.taj, LOCAL_IMAGES.collage]
  },
  {
    id: "kerala", name: "Kerala", tag: "BACKWATERS & NATURE", image: LOCAL_IMAGES.kerala,
    alt: "Traditional Kerala houseboat on the backwaters", subtitle: "Where nature finds peace",
    description: "Kerala pairs palm-lined backwaters with hill country, beaches, wildlife habitats and a rich food culture. It is suited to relaxed journeys and nature-focused exploration.",
    places: ["Alappuzha backwaters", "Munnar tea country", "Fort Kochi", "Periyar region"],
    experiences: ["Cruise through the backwaters", "Visit a tea estate", "Explore local markets", "Taste Kerala's regional cuisine"],
    tip: "Monsoon rainfall can affect outdoor plans and transport. Check seasonal weather before finalising an itinerary.",
    gallery: [LOCAL_IMAGES.kerala, WIKIMEDIA.assam, LOCAL_IMAGES.collage]
  },
  {
    id: "maharashtra", name: "Maharashtra", tag: "FORTS & HERITAGE", image: LOCAL_IMAGES.maharashtra,
    alt: "Gateway of India in Mumbai", subtitle: "Land of forts and legends",
    description: "Maharashtra offers a mix of coastal cities, hill stations, cave complexes, forts and living cultural traditions. Its landscapes range from the Konkan coast to the Sahyadri hills.",
    places: ["Mumbai and Gateway of India", "Ajanta and Ellora Caves", "Raigad Fort", "Mahabaleshwar"],
    experiences: ["Explore historic hill forts", "Discover cave art and architecture", "Try Maharashtrian food", "Visit coastal towns and hill stations"],
    tip: "Some hill forts involve steep climbs. Check route conditions and carry suitable footwear.",
    gallery: [LOCAL_IMAGES.maharashtra, WIKIMEDIA.warli, LOCAL_IMAGES.collage]
  },
  {
    id: "ladakh", name: "Ladakh", tag: "HIGH-ALTITUDE ADVENTURE", image: WIKIMEDIA.ladakh,
    alt: "Pangong Lake in Ladakh", subtitle: "A world between mountains and sky",
    description: "Ladakh is a high-altitude region of stark mountains, deep-blue lakes, monasteries and distinctive Himalayan culture. Travel here needs thoughtful planning and time to acclimatise.",
    places: ["Leh", "Pangong Lake", "Nubra Valley", "Thiksey Monastery"],
    experiences: ["Explore monasteries and local markets", "Experience high-altitude landscapes", "Visit mountain villages", "Enjoy regional Ladakhi food"],
    tip: "Acclimatisation is essential at altitude. Follow medical and local guidance, and check permits and road access before travel.",
    gallery: [WIKIMEDIA.ladakh, LOCAL_IMAGES.kashmir, LOCAL_IMAGES.collage]
  },
  {
    id: "goa", name: "Goa", tag: "COASTAL ESCAPE", image: WIKIMEDIA.goa,
    alt: "Beach and fishing boats in Goa", subtitle: "Sunsets, shores and heritage",
    description: "Goa combines beaches, coastal villages, historic architecture, food and a lively arts scene. Beyond its well-known shoreline, visitors can explore quieter inland landscapes.",
    places: ["Old Goa churches", "Panaji and Fontainhas", "Palolem", "Dona Paula"],
    experiences: ["Explore beaches and coastal walks", "Discover heritage neighbourhoods", "Try Goan cuisine", "Visit local markets"],
    tip: "Respect beach safety flags and local rules. Monsoon weather can affect sea conditions and some activities.",
    gallery: [WIKIMEDIA.goa, LOCAL_IMAGES.kerala, LOCAL_IMAGES.collage]
  },
  {
    id: "uttarakhand", name: "Uttarakhand", tag: "MOUNTAINS & MEADOWS", image: WIKIMEDIA.uttarakhand,
    alt: "Valley of Flowers in Uttarakhand", subtitle: "Where the mountains open into meadows",
    description: "Uttarakhand is home to Himalayan valleys, forests, rivers, hill towns and long-standing pilgrimage routes. It offers a range of outdoor and cultural journeys.",
    places: ["Valley of Flowers", "Rishikesh", "Nainital", "Auli"],
    experiences: ["Walk through Himalayan landscapes", "Explore riverfront towns", "Visit local temples and markets", "Discover regional food traditions"],
    tip: "Trekking routes are seasonal and weather-dependent. Follow park rules and local guidance, especially in mountain areas.",
    gallery: [WIKIMEDIA.uttarakhand, LOCAL_IMAGES.kashmir, LOCAL_IMAGES.collage]
  },
  {
    id: "agra", name: "Agra", tag: "MUGHAL ARCHITECTURE", image: WIKIMEDIA.taj,
    alt: "The Taj Mahal in Agra", subtitle: "A city shaped by monumental history",
    description: "Agra is closely associated with Mughal-era architecture, gardens and craftsmanship. Its historic sites reveal stories of court life, design and artistic exchange.",
    places: ["Taj Mahal", "Agra Fort", "Mehtab Bagh", "Fatehpur Sikri"],
    experiences: ["Explore the Taj Mahal and its gardens", "Discover Mughal architecture", "Visit local craft workshops", "Taste Agra's regional sweets"],
    tip: "Check monument opening days and ticket rules before visiting. Early morning visits can be more comfortable.",
    gallery: [WIKIMEDIA.taj, LOCAL_IMAGES.rajasthan, WIKIMEDIA.varanasi]
  },
  {
    id: "varanasi", name: "Varanasi", tag: "RIVER & HERITAGE", image: WIKIMEDIA.varanasi,
    alt: "Historic ghats of Varanasi at evening", subtitle: "A city of living traditions",
    description: "Varanasi is a historic city on the Ganga, known for its ghats, temples, learning traditions, music and crafts. Visitors encounter a dense and continuing cultural landscape.",
    places: ["Dashashwamedh Ghat", "Assi Ghat", "Sarnath", "Old city lanes"],
    experiences: ["Observe the riverfront at sunrise", "Explore local weaving and crafts", "Discover classical music traditions", "Try Banarasi food and sweets"],
    tip: "Be respectful around places of worship and private ceremonies. Ask before photographing people or rituals.",
    gallery: [WIKIMEDIA.varanasi, WIKIMEDIA.taj, LOCAL_IMAGES.collage]
  },
  {
    id: "assam", name: "Assam", tag: "TEA GARDENS & CULTURE", image: WIKIMEDIA.assam,
    alt: "Tea garden landscape in Assam", subtitle: "Green landscapes and river stories",
    description: "Assam offers tea-growing landscapes, river islands, wildlife habitats and vibrant cultural traditions. Its food, music and festivals reflect a distinct regional identity.",
    places: ["Kaziranga National Park", "Majuli", "Sivasagar", "Tea gardens around Jorhat"],
    experiences: ["Learn about tea cultivation", "Explore Assamese weaving", "Discover Bihu traditions", "Experience river island life"],
    tip: "Wildlife experiences should follow park rules and conservation guidance. Seasonal flooding can affect access in some areas.",
    gallery: [WIKIMEDIA.assam, LOCAL_IMAGES.kerala, LOCAL_IMAGES.collage]
  },
  {
    id: "tamil-nadu", name: "Tamil Nadu", tag: "TEMPLES & CLASSICAL ARTS", image: WIKIMEDIA.temple,
    alt: "Meenakshi Amman Temple gopuram in Madurai", subtitle: "A heritage of art, language and devotion",
    description: "Tamil Nadu brings together historic temple towns, classical arts, textile traditions, beaches and a rich literary heritage. Each region offers a distinctive cultural experience.",
    places: ["Meenakshi Amman Temple", "Mahabalipuram", "Thanjavur", "Kanyakumari"],
    experiences: ["Explore historic temple architecture", "Discover Bharatanatyam and Carnatic music", "Visit textile and craft centres", "Taste regional Tamil cuisine"],
    tip: "Follow dress and visitor guidance at religious sites, and check photography rules before entering temple interiors.",
    gallery: [WIKIMEDIA.temple, WIKIMEDIA.dance, LOCAL_IMAGES.collage]
  }
];

const destinationTrack = document.getElementById("destinationTrack");
const destinationViewport = document.getElementById("destinationViewport");
const prevDestination = document.getElementById("prevDestination");
const nextDestination = document.getElementById("nextDestination");
const destinationCount = document.getElementById("destinationCount");
const destinationDots = document.getElementById("destinationDots");
const viewAllDestinations = document.getElementById("viewAllDestinations");
const destinationControls = document.getElementById("destinationControls");

function destinationCardMarkup(destination) {
  return `
    <article class="destination-card">
      <img src="${destination.image}" alt="${destination.alt}" loading="lazy" onerror="this.onerror=null;this.src='${LOCAL_IMAGES.collage}'">
      <div class="destination-card-body">
        <span class="destination-tag">${destination.tag}</span>
        <h3>${destination.name}</h3>
        <p>${destination.subtitle}. ${destination.description.slice(0, 76)}…</p>
        <button class="discover-button" type="button" data-destination="${destination.id}">Discover Destination →</button>
      </div>
    </article>`;
}

if (destinationTrack) {
  destinationTrack.innerHTML = destinations.map(destinationCardMarkup).join("");
}

function getCardsPerPage() {
  if (window.innerWidth <= 700) return 1;
  if (window.innerWidth <= 1100) return 3;
  return 4;
}

function updateDestinationControls() {
  if (!destinationViewport || destinationViewport.classList.contains("is-expanded")) return;
  const cardWidth = destinationTrack.querySelector(".destination-card")?.getBoundingClientRect().width || 0;
  const gap = parseFloat(getComputedStyle(destinationTrack).gap) || 0;
  const maxIndex = Math.max(0, destinations.length - getCardsPerPage());
  const currentIndex = cardWidth ? Math.round(destinationViewport.scrollLeft / (cardWidth + gap)) : 0;
  if (destinationCount) {
    const first = Math.min(destinations.length, currentIndex + 1);
    const last = Math.min(destinations.length, currentIndex + getCardsPerPage());
    destinationCount.textContent = `${String(first).padStart(2,"0")}–${String(last).padStart(2,"0")} / ${String(destinations.length).padStart(2,"0")}`;
  }
  if (prevDestination) prevDestination.disabled = destinationViewport.scrollLeft <= 4;
  if (nextDestination) nextDestination.disabled = currentIndex >= maxIndex;
  if (destinationDots) {
    const pages = Math.ceil(destinations.length / getCardsPerPage());
    const activePage = Math.floor(currentIndex / getCardsPerPage());
    destinationDots.innerHTML = Array.from({length: pages}, (_, index) =>
      `<button class="carousel-dot ${index === activePage ? "active" : ""}" type="button" aria-label="Go to destination group ${index + 1}" data-page="${index}"></button>`
    ).join("");
  }
}

function scrollDestinations(direction) {
  if (!destinationViewport) return;
  destinationViewport.scrollBy({ left: direction * destinationViewport.clientWidth * .92, behavior: "smooth" });
}

prevDestination?.addEventListener("click", () => scrollDestinations(-1));
nextDestination?.addEventListener("click", () => scrollDestinations(1));
destinationViewport?.addEventListener("scroll", () => window.requestAnimationFrame(updateDestinationControls));
window.addEventListener("resize", () => window.requestAnimationFrame(updateDestinationControls));

destinationDots?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button || !destinationViewport) return;
  destinationViewport.scrollTo({ left: Number(button.dataset.page) * destinationViewport.clientWidth, behavior: "smooth" });
});

viewAllDestinations?.addEventListener("click", () => {
  const expanded = destinationViewport.classList.toggle("is-expanded");
  viewAllDestinations.setAttribute("aria-expanded", String(expanded));
  viewAllDestinations.querySelector("span").textContent = expanded ? "Show Carousel" : "View All Destinations";
  if (destinationControls) destinationControls.hidden = expanded;
  if (destinationDots) destinationDots.hidden = expanded;
  if (!expanded) destinationViewport.scrollTo({ left: 0, behavior: "smooth" });
  window.setTimeout(updateDestinationControls, 80);
});

/* ---------- DESTINATION MODAL ---------- */
const destinationModal = document.getElementById("destinationModal");
const modalDialog = destinationModal?.querySelector(".destination-modal");
const modalClose = document.getElementById("modalClose");
let lastModalTrigger = null;

function openDestination(destinationId, trigger) {
  const destination = destinations.find((item) => item.id === destinationId);
  if (!destination || !destinationModal) return;
  lastModalTrigger = trigger || document.activeElement;
  document.getElementById("modalImage").src = destination.image;
  document.getElementById("modalImage").alt = destination.alt;
  document.getElementById("modalTag").textContent = destination.tag;
  document.getElementById("modalTitle").textContent = destination.name;
  document.getElementById("modalSubtitle").textContent = destination.subtitle;
  document.getElementById("modalDescription").textContent = destination.description;
  document.getElementById("modalPlaces").innerHTML = destination.places.map((place) => `<li>${place}</li>`).join("");
  document.getElementById("modalExperiences").innerHTML = destination.experiences.map((experience) => `<li>${experience}</li>`).join("");
  document.getElementById("modalTip").textContent = destination.tip;
  document.getElementById("modalGallery").innerHTML = destination.gallery.map((src, index) =>
    `<img src="${src}" alt="${destination.name} travel photograph ${index + 1}" loading="lazy" onerror="this.onerror=null;this.src='${destination.image}'">`
  ).join("");
  destinationModal.hidden = false;
  document.body.classList.add("modal-open");
  modalClose?.focus();
}

function closeDestinationModal() {
  if (!destinationModal || destinationModal.hidden) return;
  destinationModal.hidden = true;
  document.body.classList.remove("modal-open");
  lastModalTrigger?.focus?.();
}

destinationTrack?.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-destination]");
  if (trigger) openDestination(trigger.dataset.destination, trigger);
});
modalClose?.addEventListener("click", closeDestinationModal);
destinationModal?.addEventListener("click", (event) => {
  if (event.target === destinationModal) closeDestinationModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDestinationModal();
});
document.getElementById("modalPlan")?.addEventListener("click", closeDestinationModal);

/* ---------- CULTURE EXPLORER: SWITCH-CASE ---------- */
const cultureNav = document.getElementById("cultureNav");
const cultureCards = document.getElementById("cultureCards");
const cultureResultTitle = document.getElementById("cultureResultTitle");
const cultureResultDescription = document.getElementById("cultureResultDescription");
const cultureResultsCount = document.getElementById("cultureResultsCount");

function getCultureCollection(category) {
  let heading = "";
  let introduction = "";
  let items = [];

  switch (category) {
    case "dance":
      heading = "Classical & Folk Dance";
      introduction = "Discover India's dance traditions, from expressive classical performances to energetic regional folk dances.";
      items = [
        ["Bharatanatyam", "Tamil Nadu", "A classical dance form known for expressive gestures, rhythmic footwork and storytelling.", WIKIMEDIA.dance],
        ["Kathak", "North India", "A classical style featuring intricate footwork, turns and narrative expression.", WIKIMEDIA.dance],
        ["Kathakali", "Kerala", "A dance-drama tradition recognised for elaborate costumes, makeup and expressive performance.", WIKIMEDIA.dance],
        ["Odissi", "Odisha", "A classical form known for fluid movements, sculptural poses and expressive storytelling.", WIKIMEDIA.dance],
        ["Kuchipudi", "Andhra Pradesh", "A classical dance tradition combining movement, rhythm and theatrical storytelling.", WIKIMEDIA.dance],
        ["Manipuri", "Manipur", "A graceful classical form often associated with devotional and Vaishnavite themes.", WIKIMEDIA.dance],
        ["Garba", "Gujarat", "A lively community folk dance widely performed during Navratri.", WIKIMEDIA.dance],
        ["Bhangra", "Punjab", "An energetic folk dance associated with Punjabi cultural celebrations and harvest traditions.", WIKIMEDIA.dance],
        ["Lavani", "Maharashtra", "A Marathi performance tradition combining expressive singing, rhythm and dance.", WIKIMEDIA.dance],
        ["Bihu Dance", "Assam", "A joyful folk dance associated with Bihu celebrations and Assamese cultural life.", WIKIMEDIA.dance]
      ];
      break;

    case "food":
      heading = "Flavours of Bharat";
      introduction = "Explore regional dishes shaped by local ingredients, cooking traditions, climate and community life.";
      items = [
        ["Puran Poli", "Maharashtra", "A sweet flatbread traditionally filled with a mixture such as lentils and jaggery.", WIKIMEDIA.thali],
        ["Dhokla", "Gujarat", "A savoury steamed snack commonly made from fermented gram-flour batter.", WIKIMEDIA.thali],
        ["Dal Baati Churma", "Rajasthan", "A traditional combination of lentil curry, baked wheat balls and a sweet crumbled preparation.", WIKIMEDIA.thali],
        ["Appam", "Kerala", "A soft-centred, bowl-shaped pancake often served with curries or vegetable stew.", WIKIMEDIA.thali],
        ["Rogan Josh", "Kashmir", "A well-known Kashmiri curry traditionally prepared with aromatic spices.", WIKIMEDIA.thali],
        ["Sarson da Saag", "Punjab", "A mustard-green preparation often served with makki di roti.", WIKIMEDIA.thali],
        ["Masala Dosa", "South India", "A crisp fermented-rice-and-lentil crepe commonly served with a spiced potato filling.", WIKIMEDIA.thali],
        ["Litti Chokha", "Bihar", "Roasted wheat balls filled with sattu and served with a vegetable preparation.", WIKIMEDIA.thali],
        ["Macher Jhol", "Bengal", "A Bengali-style fish curry prepared with regional spices and ingredients.", WIKIMEDIA.thali],
        ["Pongal", "Tamil Nadu", "A rice-based dish; sweet and savoury versions are enjoyed in different contexts.", WIKIMEDIA.thali]
      ];
      break;

    case "festival":
      heading = "Festivals & Celebrations";
      introduction = "Experience the celebrations, seasonal customs and community traditions observed across India.";
      items = [
        ["Diwali", "Across India", "Celebrated in different ways by various communities, often associated with lights, family gatherings and renewal.", WIKIMEDIA.diwali],
        ["Holi", "Across India", "A spring festival known for colourful celebrations, with customs that vary by region.", WIKIMEDIA.diwali],
        ["Ganesh Chaturthi", "Especially Maharashtra", "Honours Lord Ganesha through devotional practices and community celebrations.", WIKIMEDIA.diwali],
        ["Navratri", "Across India", "A festival period with diverse regional traditions, including Garba and Dandiya Raas in Gujarat.", WIKIMEDIA.diwali],
        ["Onam", "Kerala", "A major Kerala festival associated with cultural celebrations, flower arrangements and festive meals.", WIKIMEDIA.diwali],
        ["Durga Puja", "Especially West Bengal", "A major celebration featuring artistic displays, community gatherings and devotion to Goddess Durga.", WIKIMEDIA.diwali],
        ["Bihu", "Assam", "A group of Assamese festivals connected with seasonal change, agriculture, music and dance.", WIKIMEDIA.diwali],
        ["Pongal", "Tamil Nadu", "A harvest festival expressing gratitude for the harvest, the Sun and nature.", WIKIMEDIA.diwali],
        ["Baisakhi", "Punjab", "A festival associated with the harvest season and significant in Sikh history and tradition.", WIKIMEDIA.diwali],
        ["Eid", "Muslim communities", "Celebrations include prayer, charity, family gatherings and festive meals, with practices varying between communities.", WIKIMEDIA.diwali]
      ];
      break;

    case "music":
      heading = "Music of Bharat";
      introduction = "Discover classical, folk and devotional musical traditions alongside India's evolving contemporary sounds.";
      items = [
        ["Hindustani Classical", "North India", "A classical music tradition featuring ragas, improvisation and distinctive performance styles.", WIKIMEDIA.music],
        ["Carnatic Music", "South India", "A classical tradition known for structured compositions, melodic frameworks and rhythmic patterns.", WIKIMEDIA.music],
        ["Qawwali", "South Asian Sufi tradition", "A devotional musical form performed in gatherings associated with Sufi traditions.", WIKIMEDIA.music],
        ["Lavani Music", "Maharashtra", "A lively Marathi performance tradition combining singing, rhythm and expressive dance.", WIKIMEDIA.music],
        ["Baul Music", "Bengal", "A distinctive folk-mystical tradition associated with Baul singers and philosophical songs.", WIKIMEDIA.music],
        ["Bihu Music", "Assam", "Festive music featuring regional singing, rhythms and instruments associated with Bihu.", WIKIMEDIA.music],
        ["Rajasthani Folk Music", "Rajasthan", "Folk traditions featuring local instruments, ballads and community storytelling.", WIKIMEDIA.music],
        ["Punjabi Folk Music", "Punjab", "Lively singing and rhythmic traditions associated with community life and celebrations.", WIKIMEDIA.music]
      ];
      break;

    case "clothing":
      heading = "Traditional Clothing & Textiles";
      introduction = "Explore India's textiles, weaving, embroidery and regional styles of traditional dress.";
      items = [
        ["Nauvari Saree", "Maharashtra", "A traditional nine-yard saree draping style associated with Maharashtra.", WIKIMEDIA.textile],
        ["Bandhani", "Gujarat & Rajasthan", "A tie-dye textile tradition that creates patterns by tying sections of fabric before dyeing.", WIKIMEDIA.textile],
        ["Banarasi Silk", "Varanasi, Uttar Pradesh", "A renowned weaving tradition known for detailed silk textiles and brocade work.", WIKIMEDIA.textile],
        ["Phulkari", "Punjab", "An embroidery tradition known for colourful floral and geometric designs.", WIKIMEDIA.textile],
        ["Mekhela Chador", "Assam", "A traditional Assamese women's ensemble with regional weaving traditions.", WIKIMEDIA.textile],
        ["Kanjeevaram Silk", "Tamil Nadu", "A silk-weaving tradition associated with Kanchipuram and richly woven sarees.", WIKIMEDIA.textile],
        ["Pashmina", "Kashmir region", "Fine wool textiles associated with specialised craftsmanship and shawl-making traditions.", WIKIMEDIA.textile],
        ["Kasavu Saree", "Kerala", "A traditional Kerala textile style often recognised by its light fabric and gold-toned border.", WIKIMEDIA.textile],
        ["Chikankari", "Lucknow, Uttar Pradesh", "An embroidery tradition known for delicate, detailed needlework.", WIKIMEDIA.textile]
      ];
      break;

    case "art":
      heading = "Indian Art & Handicrafts";
      introduction = "Meet the artistic traditions and craft skills that connect materials, communities and generations.";
      items = [
        ["Warli Painting", "Maharashtra", "A painting tradition using geometric figures to depict community life, nature and everyday activities.", WIKIMEDIA.warli],
        ["Madhubani Painting", "Bihar", "A detailed painting tradition associated with the Mithila region and its distinctive patterns.", WIKIMEDIA.warli],
        ["Pattachitra", "Odisha & West Bengal", "A traditional painting tradition known for detailed compositions and narrative themes.", WIKIMEDIA.warli],
        ["Blue Pottery", "Jaipur, Rajasthan", "A decorative pottery craft recognised for its characteristic blue designs.", WIKIMEDIA.warli],
        ["Papier-Mâché", "Kashmir", "A craft involving shaped paper material and decorative painted designs.", WIKIMEDIA.warli],
        ["Channapatna Toys", "Karnataka", "Traditional wooden toys associated with turning, colouring and lacquered finishes.", WIKIMEDIA.warli],
        ["Kutch Embroidery", "Gujarat", "Embroidery traditions known for colourful threadwork, mirrors and regional patterns.", WIKIMEDIA.warli],
        ["Bidriware", "Bidar, Karnataka", "A metal craft known for contrasting inlaid designs on a dark surface.", WIKIMEDIA.warli],
        ["Dhokra Metal Craft", "Several regions", "A traditional metal-casting craft known for distinctive figurines and decorative objects.", WIKIMEDIA.warli]
      ];
      break;

    case "languages":
      heading = "Languages of Bharat";
      introduction = "Explore India's linguistic diversity through regional languages, scripts and literary traditions.";
      items = [
        ["Marathi", "Maharashtra", "A major language with rich traditions in poetry, theatre, devotional writing and modern literature.", WIKIMEDIA.manuscript],
        ["Tamil", "Tamil Nadu and beyond", "A classical language with a long literary history and vibrant contemporary cultural life.", WIKIMEDIA.manuscript],
        ["Bengali", "West Bengal and beyond", "A language with extensive traditions in poetry, fiction, songs and theatre.", WIKIMEDIA.manuscript],
        ["Gujarati", "Gujarat", "A language with its own literary traditions and a broad range of regional writing.", WIKIMEDIA.manuscript],
        ["Punjabi", "Punjab and beyond", "A language with strong traditions in poetry, music, oral storytelling and literature.", WIKIMEDIA.manuscript],
        ["Malayalam", "Kerala", "A language with rich traditions in literature, poetry, cinema and theatre.", WIKIMEDIA.manuscript],
        ["Assamese", "Assam", "A language with a long literary history, including poetry, novels and cultural writing.", WIKIMEDIA.manuscript],
        ["Kannada", "Karnataka", "A language with a significant literary tradition spanning classical and contemporary works.", WIKIMEDIA.manuscript],
        ["Telugu", "Andhra Pradesh & Telangana", "A major language with extensive traditions in poetry, theatre, cinema and literature.", WIKIMEDIA.manuscript],
        ["Sanskrit", "Classical Indian tradition", "A classical language important to historical works of philosophy, literature and religious thought.", WIKIMEDIA.manuscript]
      ];
      break;

    case "architecture":
      heading = "Architectural Heritage of Bharat";
      introduction = "Discover forts, temples, mosques, palaces, stepwells and historic structures shaped by different eras and communities.";
      items = [
        ["Taj Mahal", "Agra, Uttar Pradesh", "A white-marble mausoleum recognised for its Mughal architecture and intricate decorative work.", WIKIMEDIA.taj],
        ["Forts of Rajasthan", "Rajasthan", "Historic fort complexes reflecting regional kingdoms, defensive design and royal histories.", LOCAL_IMAGES.rajasthan],
        ["Ajanta & Ellora Caves", "Maharashtra", "Rock-cut cave complexes renowned for their art, sculpture and religious heritage.", LOCAL_IMAGES.maharashtra],
        ["Meenakshi Amman Temple", "Madurai, Tamil Nadu", "A major temple complex known for sculptural details and decorated gateway towers.", WIKIMEDIA.temple],
        ["Konark Sun Temple", "Odisha", "A historic temple famous for its monumental form and elaborate stone carving.", WIKIMEDIA.temple],
        ["Hampi", "Karnataka", "A historic landscape with temples, public spaces and structures from the Vijayanagara period.", WIKIMEDIA.temple],
        ["Sanchi Stupa", "Madhya Pradesh", "A major Buddhist monument complex known for historic stupas and carved gateways.", WIKIMEDIA.temple],
        ["Rani ki Vav", "Patan, Gujarat", "A historic stepwell known for its multi-level structure and intricate sculptural decoration.", WIKIMEDIA.warli]
      ];
      break;

    default:
      heading = "Explore Indian Culture";
      introduction = "Choose a category to discover traditions from across Bharat.";
      items = [];
  }

  return { heading, introduction, items };
}

function showCulture(category) {
  if (!cultureCards || !cultureResultTitle || !cultureResultDescription) return;
  const collection = getCultureCollection(category);
  cultureResultTitle.textContent = collection.heading;
  cultureResultDescription.textContent = collection.introduction;
  cultureResultsCount.textContent = `${collection.items.length} ${collection.items.length === 1 ? "ENTRY" : "TRADITIONS"}`;

  cultureCards.innerHTML = collection.items.map(([name, region, description, image]) => `
    <article class="culture-card">
      <div class="culture-card-top">
        <span class="culture-region">${region}</span>
        <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='${LOCAL_IMAGES.collage}'">
      </div>
      <div class="culture-card-content">
        <h4>${name}</h4>
        <p>${description}</p>
      </div>
    </article>`).join("");

  cultureNav?.querySelectorAll(".culture-tab").forEach((button) => {
    const active = button.dataset.category === category;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

cultureNav?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  showCulture(button.dataset.category);
});
showCulture("dance");

/* ---------- TRAVEL STYLE SELECTION ---------- */
const travelStyleCards = document.querySelectorAll(".travel-style-card");
const tripStyleSelect = document.getElementById("tripStyle");

travelStyleCards.forEach((card) => {
  card.addEventListener("click", () => {
    travelStyleCards.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-pressed", "false");
    });
    card.classList.add("selected");
    card.setAttribute("aria-pressed", "true");
    if (tripStyleSelect) tripStyleSelect.value = card.dataset.style;
    document.getElementById("trip-planner")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ---------- TRIP PLANNER: IF / ELSE IF / ELSE ---------- */
const tripPlannerForm = document.getElementById("tripPlannerForm");
const tripResult = document.getElementById("tripResult");
const plannerError = document.getElementById("plannerError");

tripPlannerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const budget = document.getElementById("tripBudget").value;
  const duration = document.getElementById("tripDuration").value;
  const style = document.getElementById("tripStyle").value;
  plannerError.textContent = "";
  tripResult.hidden = true;

  if (!budget || !duration || !style) {
    plannerError.textContent = "Please select your budget, duration and travel style.";
    return;
  }

  let title = "";
  let description = "";

  if (style === "adventure" && budget === "premium") {
    title = "Ladakh Adventure Expedition";
    description = "Explore high-altitude lakes, monasteries and striking Himalayan landscapes. Plan acclimatisation days and check seasonal road access before travelling.";
  } else if (style === "adventure" && (budget === "high" || budget === "medium")) {
    title = "Himachal Mountain Escape";
    description = "Discover mountain towns, scenic walks and Himalayan viewpoints. Choose a route that fits your travel time and transport budget.";
  } else if (style === "adventure") {
    title = "A Nearby Adventure Getaway";
    description = "Consider a nearby hill station, guided nature walk or beginner-friendly outdoor activity to keep transport costs manageable.";
  } else if (style === "nature" && budget === "premium") {
    title = "Kashmir Nature Retreat";
    description = "Explore lakes, valleys, gardens and Himalayan scenery, with time for relaxed sightseeing and local experiences.";
  } else if (style === "nature") {
    title = "Kerala Green Escape";
    description = "Discover backwaters, greenery and regional food. Adapt the route and accommodation to your selected budget.";
  } else if (style === "heritage" && budget === "low") {
    title = "Maharashtra Heritage Trail";
    description = "Explore nearby forts, museums and historic sites with a budget-conscious regional itinerary.";
  } else if (style === "heritage") {
    title = "Royal Rajasthan Journey";
    description = "Discover forts, palace architecture, traditional markets and regional cuisine across Rajasthan.";
  } else if (style === "beach" && budget === "low") {
    title = "Coastal Weekend Escape";
    description = "Choose an accessible nearby beach destination and plan around transport costs, local food and a simple stay.";
  } else if (style === "beach") {
    title = "Goa Coastal Holiday";
    description = "Enjoy coastal scenery, heritage neighbourhoods and relaxed sightseeing. Choose experiences that suit your schedule.";
  } else if (style === "spiritual") {
    title = "Spiritual & Heritage Journey";
    description = "Explore culturally significant destinations, historic places and local traditions with respect for community customs.";
  } else if (style === "family") {
    title = "Family Discovery Holiday";
    description = "Choose a destination with family-friendly attractions, convenient transport and a comfortable pace.";
  } else {
    title = "Discover Bharat";
    description = "Explore destinations across India and choose experiences that fit your travel preferences.";
  }

  let suggestedDuration = "";
  if (duration === "weekend") {
    suggestedDuration = "1–2 days";
    description += " Keep the route local or regional so you have enough time to enjoy the trip without rushing.";
  } else if (duration === "short") {
    suggestedDuration = "3–5 days";
  } else {
    suggestedDuration = "6 or more days";
    description += " A longer trip can include additional nearby attractions, depending on transfer times.";
  }

  let budgetGuide = "";
  if (budget === "low") budgetGuide = "Under ₹5,000 per person";
  else if (budget === "medium") budgetGuide = "₹5,000–₹10,000 per person";
  else if (budget === "high") budgetGuide = "₹10,000–₹20,000 per person";
  else budgetGuide = "Above ₹20,000 per person";

  document.getElementById("resultTitle").textContent = title;
  document.getElementById("resultDescription").textContent = description;
  document.getElementById("resultDuration").textContent = suggestedDuration;
  document.getElementById("resultBudget").textContent = budgetGuide;
  tripResult.hidden = false;
  tripResult.scrollIntoView({ behavior: "smooth", block: "center" });
});

/* ---------- REGISTRATION FORM (FRONT-END DEMO) ---------- */
const registrationForm = document.getElementById("registrationForm");
const registrationMessage = document.getElementById("registrationMessage");
const travelDate = document.getElementById("travelDate");
const registrationDestination = document.getElementById("registrationDestination");

if (travelDate) {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  travelDate.min = localToday;
}

registrationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!registrationForm.reportValidity()) return;
  const name = document.getElementById("fullName").value.trim();
  const destination = registrationDestination.value;
  const date = travelDate.value;
  registrationMessage.textContent = `Thank you, ${name}! Your Explore Bharat demo registration for ${destination} on ${date} has been recorded on this page. No booking or payment has been made.`;
  registrationMessage.hidden = false;
  registrationForm.reset();
  if (travelDate) {
    const today = new Date();
    travelDate.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  }
});

/* ---------- FOOTER YEAR + INITIAL UI ---------- */
const yearNode = document.getElementById("copyrightYear");
if (yearNode) yearNode.textContent = new Date().getFullYear();
updateDestinationControls();
