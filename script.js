
/* =====================================================
   EXPLORE BHARAT — MAIN JAVASCRIPT
   ===================================================== */


/* ---------- MOBILE NAVIGATION ---------- */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

/* Select only the main navbar links, not Culture links. */
const navLinks = navMenu
    ? navMenu.querySelectorAll(".nav-link")
    : [];


// Open and close the mobile menu
if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
        const isOpen = navMenu.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.textContent = isOpen ? "✕" : "☰";
    });
}


// Close menu after clicking a main navigation link
navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        if (!navMenu || !menuToggle) return;

        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});


// Highlight the active main navigation link
const sections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                navLinks.forEach(function (link) {
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

    sections.forEach(function (section) {
        observer.observe(section);
    });
}


/* =====================================================
   TRAVEL STYLE SELECTION
   ===================================================== */

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

        if (tripStyleSelect) {
            tripStyleSelect.value = card.dataset.style;
        }
    });
});


/* =====================================================
   BUILD YOUR OWN TRIP — IF / ELSE IF / ELSE LADDER
   ===================================================== */

const findTripBtn = document.getElementById("findTripBtn");

if (findTripBtn) {
    findTripBtn.addEventListener("click", function () {
        const budget = document.getElementById("tripBudget")?.value;
        const duration = document.getElementById("tripDuration")?.value;
        const style = document.getElementById("tripStyle")?.value;

        const error = document.getElementById("plannerError");
        const result = document.getElementById("tripResult");

        if (!error || !result) return;

        error.textContent = "";
        result.hidden = true;

        if (!budget || !duration || !style) {
            error.textContent =
                "Please select your budget, duration and travel style.";
            return;
        }

        let title = "";
        let description = "";
        let suggestedDuration = "";
        let budgetGuide = "";

        /* Choose a destination idea based on travel style and budget. */

        if (style === "adventure" && budget === "premium") {
            title = "Ladakh Adventure Expedition";
            description =
                "Explore dramatic Himalayan landscapes, monasteries and scenic mountain routes. Check seasonal access and acclimatisation requirements before travelling.";

        } else if (style === "adventure" && budget === "high") {
            title = "Himachal Mountain Escape";
            description =
                "Discover mountain towns, walking trails and spectacular Himalayan scenery.";

        } else if (style === "adventure") {
            title = "Local Adventure Getaway";
            description =
                "Consider a nearby hill station, guided nature walk or beginner-friendly outdoor activity to fit a tighter budget.";

        } else if (style === "nature" && budget === "premium") {
            title = "Kashmir Nature Retreat";
            description =
                "Explore lakes, valleys, gardens and Himalayan scenery, with time for relaxed sightseeing.";

        } else if (style === "nature") {
            title = "Kerala Green Escape";
            description =
                "Discover lush landscapes, local food and backwater experiences, adapting the itinerary to your available time and budget.";

        } else if (style === "heritage" && budget === "low") {
            title = "Maharashtra Heritage Trail";
            description =
                "Explore nearby historic forts, museums and local heritage sites with a budget-conscious itinerary.";

        } else if (style === "heritage") {
            title = "Royal Rajasthan Tour";
            description =
                "Discover historic forts, palace architecture, traditional markets and regional cuisine.";

        } else if (style === "beach" && budget === "low") {
            title = "Coastal Weekend Escape";
            description =
                "Choose an accessible nearby beach destination and plan a short trip around transport costs.";

        } else if (style === "beach") {
            title = "Goa Coastal Holiday";
            description =
                "Enjoy coastal scenery, local heritage and relaxed sightseeing. Choose activities that fit your schedule.";

        } else if (style === "spiritual") {
            title = "Spiritual & Heritage Journey";
            description =
                "Explore culturally significant destinations, historic places and local traditions respectfully.";

        } else if (style === "family") {
            title = "Family Discovery Holiday";
            description =
                "Choose a destination with family-friendly sightseeing, convenient transport and a comfortable pace.";

        } else {
            title = "Discover Bharat";
            description =
                "Explore destinations across India and choose experiences that fit your travel preferences.";
        }


        /* Adjust the suggested duration. */

        if (duration === "weekend") {
            suggestedDuration = "1–2 days";
            description +=
                " Keep the itinerary local or regional so you have enough time to enjoy the trip without rushing.";

        } else if (duration === "short") {
            suggestedDuration = "3–5 days";

        } else {
            suggestedDuration = "6 or more days";
            description +=
                " You may be able to explore more than one nearby attraction, depending on travel times.";
        }


        /* Display the selected budget. */

        if (budget === "low") {
            budgetGuide = "Under ₹5,000 per person";

        } else if (budget === "medium") {
            budgetGuide = "₹5,000–₹10,000 per person";

        } else if (budget === "high") {
            budgetGuide = "₹10,000–₹20,000 per person";

        } else {
            budgetGuide = "Above ₹20,000 per person";
        }


        /* Show the recommendation. */

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
}


/* =====================================================
   EXPLORE BHARAT — CULTURE SWITCH-CASE
   ===================================================== */

const cultureNav = document.getElementById("cultureNav");
const cultureCards = document.getElementById("cultureCards");
const cultureResults = document.getElementById("cultureResults");


function showCulture(category) {
    if (!cultureNav || !cultureCards || !cultureResults) return;

    let heading = "";
    let introduction = "";
    let items = [];
    let image = "";

    switch (category) {

        /* ---------- DANCE ---------- */

        case "dance":
            heading = "Classical & Folk Dance";
            introduction =
                "Discover India's dance traditions, from expressive classical performances to energetic regional folk dances.";

            image = "images/culture/dance.jpg";

            items = [
                {
                    name: "Bharatanatyam",
                    region: "Tamil Nadu",
                    description:
                        "A classical dance tradition known for expressive gestures, rhythmic footwork and storytelling."
                },
                {
                    name: "Kathak",
                    region: "North India",
                    description:
                        "A classical dance form featuring intricate footwork, graceful turns and stories told through movement."
                },
                {
                    name: "Kathakali",
                    region: "Kerala",
                    description:
                        "A dance-drama tradition recognised for elaborate costumes, expressive makeup and dramatic storytelling."
                },
                {
                    name: "Odissi",
                    region: "Odisha",
                    description:
                        "A classical dance form known for fluid movements, sculptural poses and expressive storytelling."
                },
                {
                    name: "Kuchipudi",
                    region: "Andhra Pradesh",
                    description:
                        "A classical dance tradition combining expressive movement, rhythmic sequences and theatrical elements."
                },
                {
                    name: "Manipuri",
                    region: "Manipur",
                    description:
                        "A classical dance tradition known for graceful movements and themes often associated with devotional stories."
                },
                {
                    name: "Garba",
                    region: "Gujarat",
                    description:
                        "A lively community folk dance widely performed during Navratri celebrations."
                },
                {
                    name: "Bhangra",
                    region: "Punjab",
                    description:
                        "An energetic folk dance associated with Punjabi cultural celebrations and harvest traditions."
                },
                {
                    name: "Lavani",
                    region: "Maharashtra",
                    description:
                        "A Marathi performance tradition combining expressive singing, rhythm and dance."
                },
                {
                    name: "Bihu Dance",
                    region: "Assam",
                    description:
                        "A joyful folk dance associated with Bihu celebrations and Assamese cultural life."
                }
            ];
            break;


        /* ---------- FOOD ---------- */

        case "food":
            heading = "Flavours of Bharat";
            introduction =
                "Explore regional dishes shaped by local ingredients, cooking traditions, climate and community life.";

            image = "images/culture/food.jpg";

            items = [
                {
                    name: "Puran Poli",
                    region: "Maharashtra",
                    description:
                        "A sweet flatbread traditionally filled with a mixture such as lentils and jaggery."
                },
                {
                    name: "Dhokla",
                    region: "Gujarat",
                    description:
                        "A savoury steamed snack commonly made from fermented gram-flour batter."
                },
                {
                    name: "Dal Baati Churma",
                    region: "Rajasthan",
                    description:
                        "A traditional combination of lentil curry, baked wheat balls and a sweet crumbled preparation."
                },
                {
                    name: "Appam",
                    region: "Kerala",
                    description:
                        "A soft-centred, bowl-shaped pancake often served with curries or vegetable stews."
                },
                {
                    name: "Rogan Josh",
                    region: "Kashmir",
                    description:
                        "A well-known Kashmiri curry traditionally prepared with aromatic spices."
                },
                {
                    name: "Sarson da Saag",
                    region: "Punjab",
                    description:
                        "A mustard-green preparation often served with makki di roti."
                },
                {
                    name: "Masala Dosa",
                    region: "South India",
                    description:
                        "A crisp fermented-rice-and-lentil crepe commonly served with a spiced potato filling."
                },
                {
                    name: "Litti Chokha",
                    region: "Bihar",
                    description:
                        "A regional dish featuring roasted wheat balls filled with sattu and served with a vegetable preparation."
                },
                {
                    name: "Macher Jhol",
                    region: "Bengal",
                    description:
                        "A Bengali-style fish curry prepared with regional spices and ingredients."
                },
                {
                    name: "Pongal",
                    region: "Tamil Nadu",
                    description:
                        "A rice-based dish; sweet and savoury versions are enjoyed in different contexts."
                }
            ];
            break;


        /* ---------- FESTIVALS ---------- */

        case "festival":
            heading = "Festivals & Celebrations";
            introduction =
                "Experience the celebrations, seasonal customs and community traditions observed across India.";

            image = "images/culture/festivals.jpg";

            items = [
                {
                    name: "Diwali",
                    region: "Across India",
                    description:
                        "A festival celebrated in different ways by various communities, often associated with lights, family gatherings and renewal."
                },
                {
                    name: "Holi",
                    region: "Across India",
                    description:
                        "A spring festival known for colourful celebrations, with customs that vary by region."
                },
                {
                    name: "Ganesh Chaturthi",
                    region: "Especially Maharashtra",
                    description:
                        "A festival honouring Lord Ganesha through devotional practices and community celebrations."
                },
                {
                    name: "Navratri",
                    region: "Across India",
                    description:
                        "A festival period with diverse regional traditions, including Garba and Dandiya Raas in Gujarat."
                },
                {
                    name: "Onam",
                    region: "Kerala",
                    description:
                        "A major Kerala festival associated with cultural celebrations, flower arrangements and festive meals."
                },
                {
                    name: "Durga Puja",
                    region: "Especially West Bengal",
                    description:
                        "A major celebration featuring artistic displays, community gatherings and devotion to Goddess Durga."
                },
                {
                    name: "Bihu",
                    region: "Assam",
                    description:
                        "A group of Assamese festivals connected with seasonal change, agriculture, music and dance."
                },
                {
                    name: "Pongal",
                    region: "Tamil Nadu",
                    description:
                        "A harvest festival expressing gratitude for the harvest, the Sun and nature."
                },
                {
                    name: "Baisakhi",
                    region: "Punjab",
                    description:
                        "A festival associated with the harvest season and significant in Sikh history and tradition."
                },
                {
                    name: "Eid",
                    region: "Muslim communities",
                    description:
                        "Celebrations include prayer, charity, family gatherings and festive meals, with practices varying between communities."
                }
            ];
            break;


        /* ---------- MUSIC ---------- */

        case "music":
            heading = "Music of Bharat";
            introduction =
                "Discover classical, folk and devotional musical traditions alongside India's evolving contemporary sounds.";

            image = "images/culture/music.jpg";

            items = [
                {
                    name: "Hindustani Classical",
                    region: "North India",
                    description:
                        "A classical music tradition featuring ragas, improvisation and distinctive performance styles."
                },
                {
                    name: "Carnatic Music",
                    region: "South India",
                    description:
                        "A classical music tradition known for structured compositions, melodic frameworks and rhythmic patterns."
                },
                {
                    name: "Qawwali",
                    region: "South Asian Sufi tradition",
                    description:
                        "A devotional musical form performed in gatherings associated with Sufi traditions."
                },
                {
                    name: "Lavani Music",
                    region: "Maharashtra",
                    description:
                        "A lively Marathi performance tradition combining singing, rhythm and expressive dance."
                },
                {
                    name: "Baul Music",
                    region: "Bengal",
                    description:
                        "A distinctive folk-mystical musical tradition associated with Baul singers and their philosophical songs."
                },
                {
                    name: "Bihu Music",
                    region: "Assam",
                    description:
                        "Festive music featuring regional singing, rhythms and instruments associated with Bihu celebrations."
                },
                {
                    name: "Rajasthani Folk Music",
                    region: "Rajasthan",
                    description:
                        "A wide range of folk traditions featuring local instruments, ballads and community storytelling."
                },
                {
                    name: "Punjabi Folk Music",
                    region: "Punjab",
                    description:
                        "Lively singing and rhythmic traditions associated with community life and celebrations."
                }
            ];
            break;


        /* ---------- CLOTHING ---------- */

        case "clothing":
            heading = "Traditional Clothing & Textiles";
            introduction =
                "Explore India's textiles, weaving, embroidery and regional styles of traditional dress.";

            image = "images/culture/clothing.jpg";

            items = [
                {
                    name: "Nauvari Saree",
                    region: "Maharashtra",
                    description:
                        "A traditional nine-yard saree draping style associated with Maharashtra."
                },
                {
                    name: "Bandhani",
                    region: "Gujarat & Rajasthan",
                    description:
                        "A tie-dye textile tradition that creates patterns by tying sections of fabric before dyeing."
                },
                {
                    name: "Banarasi Silk",
                    region: "Varanasi, Uttar Pradesh",
                    description:
                        "A renowned weaving tradition known for richly detailed silk textiles and brocade work."
                },
                {
                    name: "Phulkari",
                    region: "Punjab",
                    description:
                        "An embroidery tradition known for colourful floral and geometric designs."
                },
                {
                    name: "Mekhela Chador",
                    region: "Assam",
                    description:
                        "A traditional Assamese women's ensemble with regional weaving traditions."
                },
                {
                    name: "Kanjeevaram Silk",
                    region: "Tamil Nadu",
                    description:
                        "A silk-weaving tradition associated with Kanchipuram and its richly woven sarees."
                },
                {
                    name: "Pashmina",
                    region: "Kashmir region",
                    description:
                        "Fine wool textiles associated with specialised craftsmanship and shawl-making traditions."
                },
                {
                    name: "Kasavu Saree",
                    region: "Kerala",
                    description:
                        "A traditional Kerala textile style often recognised by its light fabric and gold-toned border."
                },
                {
                    name: "Chikankari",
                    region: "Lucknow, Uttar Pradesh",
                    description:
                        "An embroidery tradition known for delicate, detailed needlework."
                }
            ];
            break;


        /* ---------- ART & CRAFTS ---------- */

        case "art":
            heading = "Indian Art & Handicrafts";
            introduction =
                "Meet the artistic traditions and craft skills that connect materials, communities and generations.";

            image = "images/culture/art.jpg";

            items = [
                {
                    name: "Warli Painting",
                    region: "Maharashtra",
                    description:
                        "A painting tradition known for geometric figures depicting community life, nature and everyday activities."
                },
                {
                    name: "Madhubani Painting",
                    region: "Bihar",
                    description:
                        "A detailed painting tradition associated with the Mithila region and its distinctive patterns."
                },
                {
                    name: "Pattachitra",
                    region: "Odisha & West Bengal",
                    description:
                        "A traditional painting tradition known for detailed compositions and narrative themes."
                },
                {
                    name: "Blue Pottery",
                    region: "Jaipur, Rajasthan",
                    description:
                        "A decorative pottery craft recognised for its characteristic blue designs."
                },
                {
                    name: "Papier-Mâché",
                    region: "Kashmir",
                    description:
                        "A craft involving shaped paper material and decorative painted designs."
                },
                {
                    name: "Channapatna Toys",
                    region: "Karnataka",
                    description:
                        "Traditional wooden toys associated with turning, colouring and lacquered finishes."
                },
                {
                    name: "Kutch Embroidery",
                    region: "Gujarat",
                    description:
                        "A group of embroidery traditions known for colourful threadwork, mirrors and regional patterns."
                },
                {
                    name: "Bidriware",
                    region: "Bidar, Karnataka",
                    description:
                        "A metal craft known for contrasting inlaid designs on a dark surface."
                },
                {
                    name: "Dhokra Metal Craft",
                    region: "Several regions of India",
                    description:
                        "A traditional metal-casting craft known for distinctive figurines and decorative objects."
                }
            ];
            break;


        /* ---------- LANGUAGES ---------- */

        case "languages":
            heading = "Languages of Bharat";
            introduction =
                "Explore India's linguistic diversity through regional languages, scripts and literary traditions.";

            image = "images/culture/languages.jpg";

            items = [
                {
                    name: "Marathi",
                    region: "Maharashtra",
                    description:
                        "A major language with rich traditions in poetry, theatre, devotional writing and modern literature."
                },
                {
                    name: "Tamil",
                    region: "Tamil Nadu and beyond",
                    description:
                        "A classical language with a long literary history and a vibrant contemporary cultural life."
                },
                {
                    name: "Bengali",
                    region: "West Bengal and beyond",
                    description:
                        "A language with extensive traditions in poetry, fiction, songs and theatre."
                },
                {
                    name: "Gujarati",
                    region: "Gujarat",
                    description:
                        "A language with its own literary traditions and a broad range of regional writing."
                },
                {
                    name: "Punjabi",
                    region: "Punjab and beyond",
                    description:
                        "A language with strong traditions in poetry, music, oral storytelling and literature."
                },
                {
                    name: "Malayalam",
                    region: "Kerala",
                    description:
                        "A language with rich traditions in literature, poetry, cinema and theatre."
                },
                {
                    name: "Assamese",
                    region: "Assam",
                    description:
                        "A language with a long literary history, including poetry, novels and cultural writing."
                },
                {
                    name: "Kannada",
                    region: "Karnataka",
                    description:
                        "A language with a significant literary tradition spanning classical and contemporary works."
                },
                {
                    name: "Telugu",
                    region: "Andhra Pradesh & Telangana",
                    description:
                        "A major language with extensive traditions in poetry, theatre, cinema and literature."
                },
                {
                    name: "Sanskrit",
                    region: "Classical Indian tradition",
                    description:
                        "A classical language important to many historical works of philosophy, literature and religious thought."
                }
            ];
            break;


        /* ---------- ARCHITECTURE ---------- */

        case "architecture":
            heading = "Architectural Heritage of Bharat";
            introduction =
                "Discover forts, temples, mosques, palaces, stepwells and historic structures shaped by different eras and communities.";

            image = "images/culture/architecture.jpg";

            items = [
                {
                    name: "Taj Mahal",
                    region: "Agra, Uttar Pradesh",
                    description:
                        "A white-marble mausoleum recognised for its Mughal architecture and intricate decorative work."
                },
                {
                    name: "Forts of Rajasthan",
                    region: "Rajasthan",
                    description:
                        "Historic fort complexes reflecting regional kingdoms, defensive design and royal histories."
                },
                {
                    name: "Ajanta & Ellora Caves",
                    region: "Maharashtra",
                    description:
                        "Rock-cut cave complexes renowned for their art, sculpture and religious heritage."
                },
                {
                    name: "Meenakshi Amman Temple",
                    region: "Madurai, Tamil Nadu",
                    description:
                        "A major temple complex known for its sculptural details and richly decorated gateway towers."
                },
                {
                    name: "Konark Sun Temple",
                    region: "Odisha",
                    description:
                        "A historic temple famous for its monumental form and elaborate stone carving."
                },
                {
                    name: "Hampi",
                    region: "Karnataka",
                    description:
                        "A historic landscape containing the remains of temples, public spaces and structures associated with the Vijayanagara Empire."
                },
                {
                    name: "Sanchi Stupa",
                    region: "Madhya Pradesh",
                    description:
                        "A major Buddhist monument complex known for its historic stupas and carved gateways."
                },
                {
                    name: "Rani ki Vav",
                    region: "Patan, Gujarat",
                    description:
                        "A historic stepwell known for its multi-level structure and intricate sculptural decoration."
                }
            ];
            break;


        /* ---------- DEFAULT ---------- */

        default:
            heading = "Explore Indian Culture";
            introduction =
                "Choose a category to discover traditions from across Bharat.";

            image = "images/culture/dance.jpg";
            items = [];
    }


    /* ---------- UPDATE CATEGORY HEADING ---------- */

    const headingContainer =
        cultureResults.querySelector(".culture-results-heading");

    if (headingContainer) {
        headingContainer.innerHTML = `
            <p class="section-tag">EXPLORE OUR HERITAGE</p>
            <h3>${heading}</h3>
            <p>${introduction}</p>
        `;
    }


    /* =====================================================
       CULTURE TILES WITH SMALL TOP-RIGHT IMAGES
       ===================================================== */

    cultureCards.innerHTML = items.map(function (item) {
        return `
            <article class="culture-card">

                <div class="culture-card-top">

                    <span class="culture-region">
                        ${item.region}
                    </span>

                    <img
                        src="${image}"
                        alt="${item.name}"
                        loading="lazy"
                        onerror="this.style.display='none'">

                </div>

                <div class="culture-card-content">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                </div>

            </article>
        `;
    }).join("");


    /* ---------- HIGHLIGHT SELECTED CATEGORY ---------- */

    cultureNav.querySelectorAll(".nav-link").forEach(function (link) {
        const isActive = link.dataset.category === category;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "true");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}


/* ---------- CULTURE CATEGORY CLICK EVENTS ---------- */

if (cultureNav) {
    cultureNav.addEventListener("click", function (event) {
        const link = event.target.closest(".nav-link");

        if (!link) return;

        event.preventDefault();
        showCulture(link.dataset.category);
    });
}


/* ---------- SHOW DANCE BY DEFAULT ---------- */

if (cultureNav && cultureCards && cultureResults) {
    showCulture("dance");
}
