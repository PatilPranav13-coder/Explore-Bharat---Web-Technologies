/* =========================================
   EXPLORE BHARAT — JAVASCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {


/* =========================================
   1. MOBILE NAVIGATION
   ========================================= */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const mainLinks = navMenu.querySelectorAll(".main-link");

menuToggle.addEventListener("click", function () {
    const isOpen = navMenu.classList.toggle("open");

    menuToggle.textContent = isOpen ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", isOpen);
});

mainLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        navMenu.classList.remove("open");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    });
});


/* ACTIVE NAVIGATION LINK */

const pageSections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                mainLinks.forEach(function (link) {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === "#" + entry.target.id
                    );
                });
            }
        });
    }, {
        rootMargin: "-25% 0px -60% 0px"
    });

    pageSections.forEach(function (section) {
        observer.observe(section);
    });
}


/* =========================================
   2. DESTINATION DATA
   ========================================= */

const destinationData = {

    kashmir: {
        name: "Kashmir",
        tag: "VALLEYS & LAKES",
        image: "images/Kashmir%20for%20project.jpg",
        description: "Kashmir is celebrated for its Himalayan scenery, beautiful valleys, peaceful lakes, gardens and rich cultural traditions.",
        places: ["Srinagar and Dal Lake", "Gulmarg", "Pahalgam", "Mughal Gardens"],
        experiences: "Take a shikara ride, explore local markets, enjoy mountain scenery and discover traditional Kashmiri crafts.",
        cuisine: "Rogan Josh, Kahwa, Kashmiri Pulao and traditional Wazwan dishes.",
        duration: "4–6 days"
    },

    rajasthan: {
        name: "Rajasthan",
        tag: "ROYAL HERITAGE",
        image: "images/rajasthan%20for%20project.jpg",
        description: "Rajasthan offers magnificent forts, palaces, desert landscapes, colourful markets and distinctive folk traditions.",
        places: ["Jaipur and Hawa Mahal", "Udaipur", "Jaisalmer Fort", "Jodhpur"],
        experiences: "Explore royal architecture, local handicrafts, traditional music and desert experiences.",
        cuisine: "Dal Baati Churma, Gatte ki Sabzi, Ker Sangri and Ghewar.",
        duration: "5–7 days"
    },

    kerala: {
        name: "Kerala",
        tag: "BACKWATERS & NATURE",
        image: "images/kerala%20for%20project.jpg",
        description: "Kerala is known for its lush greenery, backwaters, coastal landscapes, hill stations and distinctive cuisine.",
        places: ["Alleppey", "Munnar", "Kochi", "Thekkady"],
        experiences: "Enjoy backwater cruises, tea plantations, nature walks and traditional performances.",
        cuisine: "Appam, Puttu, Kerala Sadya and regional seafood preparations.",
        duration: "4–6 days"
    },

    maharashtra: {
        name: "Maharashtra",
        tag: "FORTS & HERITAGE",
        image: "images/Maharashtra%20for%20project.jpg",
        description: "Maharashtra combines historic forts, coastal landscapes, cities, hill stations and a rich Marathi cultural heritage.",
        places: ["Raigad Fort", "Ajanta and Ellora Caves", "Mahabaleshwar", "Mumbai"],
        experiences: "Explore hill forts, heritage sites, coastal destinations and traditional cultural performances.",
        cuisine: "Puran Poli, Misal Pav, Vada Pav, Bhakri and regional Maharashtrian thalis.",
        duration: "4–7 days"
    },

    ladakh: {
        name: "Ladakh",
        tag: "HIGH MOUNTAINS",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1100&q=85",
        description: "Ladakh is known for dramatic high-altitude landscapes, monasteries, mountain lakes and distinctive local traditions.",
        places: ["Leh", "Pangong Lake", "Nubra Valley", "Thiksey Monastery"],
        experiences: "Explore monasteries, mountain roads and high-altitude landscapes. Allow time for acclimatisation.",
        cuisine: "Thukpa, Momos, Skyu and butter tea.",
        duration: "6–8 days"
    },

    goa: {
        name: "Goa",
        tag: "COASTAL ESCAPE",
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1100&q=85",
        description: "Goa brings together beaches, Portuguese-influenced heritage, coastal scenery and local traditions.",
        places: ["Baga Beach", "Old Goa", "Fort Aguada", "Palolem"],
        experiences: "Explore the coast, heritage neighbourhoods, local markets and traditional architecture.",
        cuisine: "Goan fish curry, Bebinca, Poi and other regional dishes.",
        duration: "3–5 days"
    },

    himachal: {
        name: "Himachal Pradesh",
        tag: "HILL STATIONS",
        image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1100&q=85",
        description: "Himachal Pradesh offers mountain towns, forests, valleys, temples and spectacular Himalayan scenery.",
        places: ["Shimla", "Manali", "Dharamshala", "Spiti Valley"],
        experiences: "Enjoy scenic mountain journeys, local markets, nature walks and regional cultural experiences.",
        cuisine: "Dham, Siddu, Madra and Chha Gosht.",
        duration: "5–7 days"
    },

    uttarakhand: {
        name: "Uttarakhand",
        tag: "NATURE & SPIRITUALITY",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1100&q=85",
        description: "Uttarakhand is known for Himalayan landscapes, forests, rivers and places of spiritual significance.",
        places: ["Rishikesh", "Mussoorie", "Nainital", "Valley of Flowers"],
        experiences: "Explore mountain scenery, riverside areas, nature trails and cultural heritage.",
        cuisine: "Kafuli, Aloo Ke Gutke, Mandua Roti and Bal Mithai.",
        duration: "4–7 days"
    },

    agra: {
        name: "Agra",
        tag: "MONUMENTS",
        image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1100&q=85",
        description: "Agra is recognised for its Mughal architectural heritage, historic monuments and traditional crafts.",
        places: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Mehtab Bagh"],
        experiences: "Discover historic architecture, gardens, markets and local craft traditions.",
        cuisine: "Petha, Bedai, Jalebi and Mughlai-inspired dishes.",
        duration: "1–3 days"
    },

    varanasi: {
        name: "Varanasi",
        tag: "SPIRITUAL HERITAGE",
        image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1100&q=85",
        description: "Varanasi is a historic city on the Ganges, known for its ghats, temples, music and long-standing cultural traditions.",
        places: ["Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Sarnath", "Assi Ghat"],
        experiences: "Explore historic lanes, riverfront heritage, local music and traditional crafts respectfully.",
        cuisine: "Kachori Sabzi, Tamatar Chaat, Banarasi Paan and regional sweets.",
        duration: "2–3 days"
    },

    assam: {
        name: "Assam",
        tag: "GREEN ESCAPES",
        image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1100&q=85",
        description: "Assam features tea gardens, river landscapes, wildlife habitats and distinctive Assamese cultural traditions.",
        places: ["Kaziranga National Park", "Majuli", "Sivasagar", "Guwahati"],
        experiences: "Visit tea estates, discover river island culture and learn about Assamese crafts and traditions.",
        cuisine: "Assamese Thali, Khar, Masor Tenga and Pitha.",
        duration: "4–6 days"
    },

    tamilnadu: {
        name: "Tamil Nadu",
        tag: "TEMPLES & TRADITIONS",
        image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1100&q=85",
        description: "Tamil Nadu is home to celebrated temple architecture, classical music, dance traditions, historic cities and coastal scenery.",
        places: ["Madurai", "Mahabalipuram", "Thanjavur", "Kanyakumari"],
        experiences: "Explore temple architecture, classical performances, traditional markets and coastal destinations.",
        cuisine: "Idli, Dosa, Pongal, Chettinad dishes and Filter Coffee.",
        duration: "4–7 days"
    }
};


/* DESTINATION CAROUSEL */

const destinationGrid = document.getElementById("destinationGrid");
const destinationViewport = document.getElementById("destinationViewport");
const previousDestination = document.getElementById("previousDestination");
const nextDestination = document.getElementById("nextDestination");
const destinationCounter = document.getElementById("destinationCounter");
const viewAllBtn = document.getElementById("viewAllBtn");
const carouselDots = document.getElementById("carouselDots");

const destinationCards = Array.from(
    document.querySelectorAll(".destination-card")
);

let showingAllDestinations = false;

function getDestinationCardWidth() {
    const card = destinationCards[0];
    if (!card) return 300;

    return card.getBoundingClientRect().width +
        parseFloat(getComputedStyle(destinationGrid).columnGap || 22);
}

function updateDestinationCounter() {
    if (showingAllDestinations) {
        destinationCounter.textContent = "ALL 12 DESTINATIONS";
        return;
    }

    const index = Math.round(
        destinationGrid.scrollLeft / getDestinationCardWidth()
    );

    const current = Math.min(index + 1, destinationCards.length);
    destinationCounter.textContent =
        String(current).padStart(2, "0") + " / " +
        String(destinationCards.length).padStart(2, "0");

    carouselDots.querySelectorAll(".carousel-dot").forEach(function (dot, i) {
        dot.classList.toggle("active", i === Math.min(index, destinationCards.length - 1));
    });
}

function createCarouselDots() {
    carouselDots.innerHTML = "";

    destinationCards.forEach(function (_, index) {
        const dot = document.createElement("button");
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", "Go to destination " + (index + 1));

        dot.addEventListener("click", function () {
            destinationGrid.scrollTo({
                left: index * getDestinationCardWidth(),
                behavior: "smooth"
            });
        });

        carouselDots.appendChild(dot);
    });

    updateDestinationCounter();
}

previousDestination.addEventListener("click", function () {
    if (!showingAllDestinations) {
        destinationGrid.scrollBy({
            left: -getDestinationCardWidth(),
            behavior: "smooth"
        });
    }
});

nextDestination.addEventListener("click", function () {
    if (!showingAllDestinations) {
        destinationGrid.scrollBy({
            left: getDestinationCardWidth(),
            behavior: "smooth"
        });
    }
});

destinationGrid.addEventListener("scroll", updateDestinationCounter);

viewAllBtn.addEventListener("click", function () {
    showingAllDestinations = !showingAllDestinations;

    destinationGrid.classList.toggle("show-all", showingAllDestinations);

    viewAllBtn.textContent = showingAllDestinations
        ? "Show Carousel ↑"
        : "View All Destinations →";

    previousDestination.disabled = showingAllDestinations;
    nextDestination.disabled = showingAllDestinations;

    carouselDots.style.display = showingAllDestinations ? "none" : "flex";

    if (showingAllDestinations) {
        destinationGrid.scrollLeft = 0;
    }

    updateDestinationCounter();
});

window.addEventListener("resize", updateDestinationCounter);

createCarouselDots();


/* DESTINATION MODAL */

const destinationModal = document.getElementById("destinationModal");
const closeModalBtn = document.getElementById("closeModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const planDestinationBtn = document.getElementById("planDestination");

let currentDestination = "";

function openDestination(key) {
    const data = destinationData[key];
    if (!data) return;

    currentDestination = key;

    document.getElementById("modalImage").src = data.image;
    document.getElementById("modalImage").alt = data.name;
    document.getElementById("modalTag").textContent = data.tag;
    document.getElementById("modalTitle").textContent = data.name;
    document.getElementById("modalDescription").textContent = data.description;
    document.getElementById("modalExperiences").textContent = data.experiences;
    document.getElementById("modalCuisine").textContent = data.cuisine;
    document.getElementById("modalDuration").textContent = data.duration;

    const placesList = document.getElementById("modalPlaces");
    placesList.innerHTML = "";

    data.places.forEach(function (place) {
        const li = document.createElement("li");
        li.textContent = place;
        placesList.appendChild(li);
    });

    destinationModal.classList.add("open");
    destinationModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    closeModalBtn.focus();
}

function closeDestinationModal() {
    destinationModal.classList.remove("open");
    destinationModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

destinationCards.forEach(function (card) {
    card.addEventListener("click", function () {
        openDestination(card.dataset.destination);
    });

    card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDestination(card.dataset.destination);
        }
    });
});

closeModalBtn.addEventListener("click", closeDestinationModal);
modalBackdrop.addEventListener("click", closeDestinationModal);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeDestinationModal();
    }
});

planDestinationBtn.addEventListener("click", function () {
    const name = destinationData[currentDestination]?.name;

    closeDestinationModal();

    document.getElementById("registrationDestination").value = name || "";

    document.getElementById("registration").scrollIntoView({
        behavior: "smooth"
    });
});


/* =========================================
   3. CULTURE — SWITCH CASE
   ========================================= */

const cultureNav = document.getElementById("cultureNav");
const cultureCards = document.getElementById("cultureCards");
const cultureResults = document.getElementById("cultureResults");

function showCulture(category) {

    let heading = "";
    let introduction = "";
    let items = [];

    switch (category) {

        /* DANCE */

        case "dance":
            heading = "Classical & Folk Dance";
            introduction = "Discover India's classical and regional folk dance traditions.";

            items = [
                ["Bharatanatyam", "Tamil Nadu", "Known for expressive gestures, rhythmic footwork and storytelling.", "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80"],
                ["Kathak", "North India", "A classical dance form featuring intricate footwork, graceful turns and storytelling.", "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=400&q=80"],
                ["Kathakali", "Kerala", "A dance-drama tradition with elaborate costumes, expressive makeup and dramatic stories.", "https://images.unsplash.com/photo-1604608672516-9d5aabf7d1c4?auto=format&fit=crop&w=400&q=80"],
                ["Odissi", "Odisha", "A classical dance form known for fluid movement and sculptural poses.", "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=400&q=80"],
                ["Kuchipudi", "Andhra Pradesh", "A classical dance combining expressive movement, rhythm and theatrical elements.", "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80"],
                ["Manipuri", "Manipur", "A graceful classical dance tradition often associated with devotional stories.", "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=400&q=80"],
                ["Garba", "Gujarat", "A lively community folk dance widely performed during Navratri.", "https://images.unsplash.com/photo-1604608672516-9d5aabf7d1c4?auto=format&fit=crop&w=400&q=80"],
                ["Bhangra", "Punjab", "An energetic folk dance associated with Punjabi celebrations and harvest traditions.", "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=400&q=80"],
                ["Lavani", "Maharashtra", "A Marathi performance tradition combining expressive singing, rhythm and dance.", "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80"],
                ["Bihu Dance", "Assam", "A joyful folk dance associated with Bihu celebrations and Assamese culture.", "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=400&q=80"]
            ];
            break;


        /* FOOD */

        case "food":
            heading = "Flavours of Bharat";
            introduction = "Explore regional dishes shaped by ingredients, climate and culinary traditions.";

            items = [
                ["Puran Poli", "Maharashtra", "A sweet flatbread traditionally filled with lentils and jaggery.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80"],
                ["Dhokla", "Gujarat", "A savoury steamed snack commonly made from fermented gram-flour batter.", "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80"],
                ["Dal Baati Churma", "Rajasthan", "A traditional combination of lentil curry, baked wheat balls and sweet crumbles.", "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80"],
                ["Appam", "Kerala", "A soft-centred pancake often served with curries or vegetable stews.", "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=400&q=80"],
                ["Rogan Josh", "Kashmir", "A well-known Kashmiri curry prepared with aromatic spices.", "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80"],
                ["Sarson da Saag", "Punjab", "A mustard-green preparation often served with makki di roti.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80"],
                ["Masala Dosa", "South India", "A crisp fermented-rice-and-lentil crepe with spiced potato filling.", "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80"],
                ["Litti Chokha", "Bihar", "Roasted wheat balls filled with sattu, served with a vegetable preparation.", "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80"],
                ["Macher Jhol", "Bengal", "A Bengali fish curry prepared with regional spices.", "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80"],
                ["Pongal", "Tamil Nadu", "A rice-based dish prepared in sweet and savoury variations.", "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=400&q=80"]
            ];
            break;


        /* FESTIVALS */

        case "festival":
            heading = "Festivals & Celebrations";
            introduction = "Experience the celebrations, seasonal customs and community traditions of India.";

            items = [
                ["Diwali", "Across India", "A festival celebrated in different ways by communities, often associated with lights and renewal.", "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80"],
                ["Holi", "Across India", "A spring festival known for colourful celebrations and regional customs.", "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=400&q=80"],
                ["Ganesh Chaturthi", "Maharashtra", "A festival honouring Lord Ganesha through devotional and community celebrations.", "https://images.unsplash.com/photo-1567591370504-8b9c3ba7b2f8?auto=format&fit=crop&w=400&q=80"],
                ["Navratri", "Across India", "A festival period with diverse traditions, including Garba and Dandiya Raas.", "https://images.unsplash.com/photo-1604608672516-9d5aabf7d1c4?auto=format&fit=crop&w=400&q=80"],
                ["Onam", "Kerala", "A major Kerala festival associated with flower arrangements and festive meals.", "https://images.unsplash.com/photo-1604608672516-9d5aabf7d1c4?auto=format&fit=crop&w=400&q=80"],
                ["Durga Puja", "West Bengal", "A major celebration featuring artistic displays, gatherings and devotion to Goddess Durga.", "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=400&q=80"],
                ["Bihu", "Assam", "A group of Assamese festivals connected with seasonal change, agriculture, music and dance.", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80"],
                ["Pongal", "Tamil Nadu", "A harvest festival expressing gratitude for the harvest, the Sun and nature.", "https://images.unsplash.com/photo-1604608672516-9d5aabf7d1c4?auto=format&fit=crop&w=400&q=80"],
                ["Baisakhi", "Punjab", "A harvest-associated festival with significance in Sikh history and tradition.", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80"],

            ];
            break;


        /* MUSIC */

        case "music":
            heading = "Music of Bharat";
            introduction = "Discover classical, folk and devotional music traditions across India.";

            items = [
                ["Hindustani Classical", "North India", "A classical tradition featuring ragas and improvisation.", "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80"],
                ["Carnatic Music", "South India", "Known for structured compositions, melodic frameworks and rhythmic patterns.", "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80"],
                ["Qawwali", "South Asian Sufi tradition", "A devotional musical form performed in gatherings associated with Sufi traditions.", "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=400&q=80"],
                ["Lavani Music", "Maharashtra", "A lively Marathi performance tradition combining singing and rhythm.", "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80"],
                ["Baul Music", "Bengal", "A folk-mystical tradition associated with Baul singers and philosophical songs.", "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80"],
                ["Bihu Music", "Assam", "Festive music featuring regional singing, rhythms and traditional instruments.", "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=400&q=80"],
                ["Rajasthani Folk Music", "Rajasthan", "Folk traditions featuring local instruments, ballads and storytelling.", "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80"],
                ["Punjabi Folk Music", "Punjab", "Lively singing and rhythmic traditions associated with community life.", "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80"]
            ];
            break;


        /* CLOTHING */

        case "clothing":
            heading = "Traditional Clothing & Textiles";
            introduction = "Explore India's textiles, weaving, embroidery and regional styles of dress.";

            items = [
                ["Nauvari Saree", "Maharashtra", "A traditional nine-yard saree draping style.", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"],
                ["Bandhani", "Gujarat & Rajasthan", "A tie-dye tradition creating patterns by tying portions of fabric before dyeing.", "https://images.unsplash.com/photo-1609741199670-7a8f9e3d2e4d?auto=format&fit=crop&w=400&q=80"],
                ["Banarasi Silk", "Uttar Pradesh", "A renowned silk-weaving tradition known for detailed brocade work.", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"],
                ["Phulkari", "Punjab", "An embroidery tradition known for colourful floral and geometric designs.", "https://images.unsplash.com/photo-1609741199670-7a8f9e3d2e4d?auto=format&fit=crop&w=400&q=80"],
                ["Mekhela Chador", "Assam", "A traditional Assamese women's ensemble with regional weaving traditions.", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"],
                ["Kanjeevaram Silk", "Tamil Nadu", "A silk-weaving tradition associated with Kanchipuram.", "https://images.unsplash.com/photo-1609741199670-7a8f9e3d2e4d?auto=format&fit=crop&w=400&q=80"],
                ["Pashmina", "Kashmir", "Fine wool textiles associated with specialised shawl-making craftsmanship.", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"],
                ["Kasavu Saree", "Kerala", "A traditional textile style often recognised by its light fabric and gold-toned border.", "https://images.unsplash.com/photo-1609741199670-7a8f9e3d2e4d?auto=format&fit=crop&w=400&q=80"],
                ["Chikankari", "Lucknow", "An embroidery tradition known for delicate, detailed needlework.", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"]
            ];
            break;


        /* ART & CRAFTS */

        case "art":
            heading = "Indian Art & Handicrafts";
            introduction = "Discover creative traditions and craft skills passed through generations.";

            items = [
                ["Warli Painting", "Maharashtra", "A painting tradition using geometric figures to depict community life and nature.", "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80"],
                ["Madhubani Painting", "Bihar", "A detailed painting tradition associated with the Mithila region.", "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=400&q=80"],
                ["Pattachitra", "Odisha & West Bengal", "A traditional painting style known for detailed compositions and narrative themes.", "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80"],
                ["Blue Pottery", "Jaipur", "A decorative pottery craft recognised for its characteristic blue designs.", "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80"],
                ["Papier-Mâché", "Kashmir", "A craft involving shaped paper material and decorative painted designs.", "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=400&q=80"],
                ["Channapatna Toys", "Karnataka", "Traditional wooden toys associated with turning and lacquered finishes.", "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80"],
                ["Kutch Embroidery", "Gujarat", "Embroidery traditions known for colourful threadwork and mirror decoration.", "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80"],
                ["Bidriware", "Karnataka", "A metal craft known for contrasting inlaid designs on dark surfaces.", "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80"],
                ["Dhokra Metal Craft", "Several regions", "A traditional metal-casting craft known for distinctive figurines and objects.", "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=400&q=80"]
            ];
            break;


        /* LANGUAGES */

        case "languages":
            heading = "Languages of Bharat";
            introduction = "Explore India's linguistic diversity, regional languages and literary traditions.";

            items = [
                ["Marathi", "Maharashtra", "A language with rich traditions in poetry, theatre, devotional writing and literature.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80"],
                ["Tamil", "Tamil Nadu", "A classical language with a long literary history and vibrant cultural life.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80"],
                ["Bengali", "West Bengal", "A language with extensive traditions in poetry, fiction, songs and theatre.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80"],
                ["Gujarati", "Gujarat", "A language with distinctive literary traditions and regional writing.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80"],
                ["Punjabi", "Punjab", "A language with traditions in poetry, music and oral storytelling.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80"],
                ["Malayalam", "Kerala", "A language with rich traditions in literature, cinema and theatre.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80"],
                ["Assamese", "Assam", "A language with a long literary history and a variety of cultural writing.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80"],
                ["Kannada", "Karnataka", "A language with a significant classical and contemporary literary tradition.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80"],
                ["Telugu", "Andhra Pradesh & Telangana", "A major language with extensive traditions in poetry, theatre and literature.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80"],
                ["Sanskrit", "Classical Indian tradition", "A classical language important to many historical works of philosophy and literature.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80"]
            ];
            break;


        /* ARCHITECTURE */

        case "architecture":
            heading = "Architectural Heritage of Bharat";
            introduction = "Discover forts, temples, palaces, stepwells and historic structures from different eras.";

            items = [
                ["Taj Mahal", "Agra, Uttar Pradesh", "A white-marble mausoleum recognised for its Mughal architecture.", "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80"],
                ["Forts of Rajasthan", "Rajasthan", "Historic fort complexes reflecting regional kingdoms and defensive design.", "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=400&q=80"],
                ["Ajanta & Ellora Caves", "Maharashtra", "Rock-cut cave complexes renowned for their art, sculpture and heritage.", "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80"],
                ["Meenakshi Amman Temple", "Tamil Nadu", "A temple complex known for sculptural details and decorated gateway towers.", "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80"],
                ["Konark Sun Temple", "Odisha", "A historic temple famous for monumental architecture and stone carving.", "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80"],
                ["Hampi", "Karnataka", "A historic landscape with temples and structures of the Vijayanagara Empire.", "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80"],
                ["Sanchi Stupa", "Madhya Pradesh", "A major Buddhist monument complex known for its stupas and carved gateways.", "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80"],
                ["Rani ki Vav", "Gujarat", "A historic stepwell with multiple levels and intricate sculptural decoration.", "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80"]
            ];
            break;


        default:
            heading = "Explore Indian Culture";
            introduction = "Choose a category to discover traditions from across Bharat.";
            items = [];
    }


    /* UPDATE CULTURE HEADING */

    const headingBox = cultureResults.querySelector(".culture-results-heading");

    headingBox.innerHTML = `
        <p class="section-tag">EXPLORE OUR HERITAGE</p>
        <h3>${heading}</h3>
        <p>${introduction}</p>
    `;


    /* UPDATE CULTURE CARDS */

    cultureCards.innerHTML = items.map(function (item) {
        return `
            <article class="culture-card">

                <div class="culture-card-top">
                    <span class="culture-region">${item[1]}</span>

                    <img
                        src="${item[3]}"
                        alt="${item[0]}"
                        loading="lazy"
                        onerror="this.style.display='none'">
                </div>

                <div class="culture-card-content">
                    <h4>${item[0]}</h4>
                    <p>${item[2]}</p>
                </div>

            </article>
        `;
    }).join("");


    /* ACTIVE CATEGORY BUTTON */

    cultureNav.querySelectorAll(".culture-tab").forEach(function (button) {
        const active = button.dataset.category === category;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active);
    });
}


/* CULTURE CATEGORY EVENTS */

cultureNav.addEventListener("click", function (event) {
    const button = event.target.closest(".culture-tab");

    if (!button) return;

    showCulture(button.dataset.category);
});


/* SHOW DANCE BY DEFAULT */

showCulture("dance");


/* =========================================
   4. TRAVEL STYLE SELECTION
   ========================================= */

const styleCards = document.querySelectorAll(".travel-style-card");
const tripStyleSelect = document.getElementById("tripStyle");

styleCards.forEach(function (card) {
    card.addEventListener("click", function () {

        styleCards.forEach(function (item) {
            item.classList.remove("selected");
            item.setAttribute("aria-pressed", "false");
        });

        card.classList.add("selected");
        card.setAttribute("aria-pressed", "true");

        tripStyleSelect.value = card.dataset.style;

    });
});


/* =========================================
   5. BUILD YOUR OWN TRIP — IF ELSE
   ========================================= */

document.getElementById("findTripBtn").addEventListener("click", function () {

    const budget = document.getElementById("tripBudget").value;
    const duration = document.getElementById("tripDuration").value;
    const style = document.getElementById("tripStyle").value;

    const error = document.getElementById("plannerError");
    const result = document.getElementById("tripResult");

    error.textContent = "";
    result.hidden = true;

    if (!budget || !duration || !style) {
        error.textContent = "Please select your budget, duration and travel style.";
        return;
    }

    let title = "";
    let description = "";
    let suggestedDuration = "";
    let budgetGuide = "";


    /* DESTINATION RECOMMENDATION */

    if (style === "adventure" && budget === "premium") {
        title = "Ladakh Adventure Expedition";
        description = "Explore dramatic Himalayan landscapes, monasteries and scenic mountain routes. Plan for acclimatisation and seasonal travel conditions.";

    } else if (style === "adventure" && budget === "high") {
        title = "Himachal Mountain Escape";
        description = "Discover mountain towns, nature trails and spectacular Himalayan scenery.";

    } else if (style === "adventure") {
        title = "Local Adventure Getaway";
        description = "Consider a nearby hill station, guided walk or beginner-friendly outdoor activity.";

    } else if (style === "nature" && budget === "premium") {
        title = "Kashmir Nature Retreat";
        description = "Explore lakes, valleys, gardens and Himalayan scenery.";

    } else if (style === "nature") {
        title = "Kerala Green Escape";
        description = "Discover lush landscapes, local cuisine and backwater experiences.";

    } else if (style === "heritage" && budget === "low") {
        title = "Maharashtra Heritage Trail";
        description = "Explore historic forts, museums and local heritage sites.";

    } else if (style === "heritage") {
        title = "Royal Rajasthan Tour";
        description = "Discover forts, palaces, traditional markets and regional cuisine.";

    } else if (style === "beach" && budget === "low") {
        title = "Coastal Weekend Escape";
        description = "Choose an accessible nearby beach destination and plan around transport costs.";

    } else if (style === "beach") {
        title = "Goa Coastal Holiday";
        description = "Enjoy coastal scenery, local heritage and relaxed sightseeing.";

    } else if (style === "spiritual") {
        title = "Spiritual & Heritage Journey";
        description = "Explore culturally significant destinations, historic places and local traditions respectfully.";

    } else if (style === "family") {
        title = "Family Discovery Holiday";
        description = "Choose a destination with convenient transport, family-friendly sightseeing and a comfortable pace.";

    } else {
        title = "Discover Bharat";
        description = "Explore destinations across India and choose experiences that match your preferences.";
    }


    /* DURATION */

    if (duration === "weekend") {
        suggestedDuration = "1–2 days";
        description += " Keep the itinerary local or regional to avoid rushing.";

    } else if (duration === "short") {
        suggestedDuration = "3–5 days";

    } else {
        suggestedDuration = "6 or more days";
        description += " Consider exploring multiple nearby attractions if travel time permits.";
    }


    /* BUDGET */

    if (budget === "low") {
        budgetGuide = "Under ₹5,000 per person";

    } else if (budget === "medium") {
        budgetGuide = "₹5,000–₹10,000 per person";

    } else if (budget === "high") {
        budgetGuide = "₹10,000–₹20,000 per person";

    } else {
        budgetGuide = "Above ₹20,000 per person";
    }


    /* DISPLAY RESULT */

    document.getElementById("resultTitle").textContent = title;
    document.getElementById("resultDescription").textContent = description;
    document.getElementById("resultDuration").textContent = suggestedDuration;
    document.getElementById("resultBudget").textContent = budgetGuide;

    result.hidden = false;

    result.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});


/* =========================================
   6. REGISTRATION FORM VALIDATION
   ========================================= */

const registrationForm = document.getElementById("registrationForm");
const registrationMessage = document.getElementById("registrationMessage");
const travelDateInput = document.getElementById("travelDate");

const today = new Date();
const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

travelDateInput.min = localToday;


registrationForm.addEventListener("submit", function (event) {

    event.preventDefault();

    if (!registrationForm.checkValidity()) {
        registrationForm.reportValidity();
        return;
    }

    const name = document.getElementById("fullName").value.trim();

    const destination = document.getElementById(
        "registrationDestination"
    ).value;

    registrationMessage.textContent =
        "Thank you, " + name + "! Your journey to " +
        destination + " has been registered in this demo.";

    registrationForm.reset();
    travelDateInput.min = localToday;

});


});