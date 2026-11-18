/* Bharat AI — content-aware Explore Bharat website assistant.
   Answers are grounded in the curated destination and culture content rendered by script.js,
   plus the four sample tours defined in trip-commerce.js. It is not a hosted LLM. */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const $ = function (id) { return document.getElementById(id); };
  const toggle = $("bharatAiToggle");
  const panel = $("bharatAiPanel");
  const close = $("bharatAiClose");
  const messages = $("bharatAiMessages");
  const form = $("bharatAiForm");
  const input = $("bharatAiInput");
  const suggestions = $("bharatAiSuggestions");
  if (!toggle || !panel || !messages || !form || !input) return;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  const aliases = {
    kashmir: ["kashmir", "srinagar", "dal lake", "gulmarg", "pahalgam", "shikara"],
    rajasthan: ["rajasthan", "jaipur", "udaipur", "jaisalmer", "jodhpur", "hawa mahal"],
    kerala: ["kerala", "munnar", "alleppey", "alappuzha", "backwaters", "kochi", "thekkady"],
    maharashtra: ["maharashtra", "raigad", "ajanta", "ellora", "mahabaleshwar", "mumbai", "pune"],
    ladakh: ["ladakh", "leh", "pangong", "nubra valley", "thiksey"],
    goa: ["goa", "palolem", "baga beach", "fort aguada"],
    himachal: ["himachal", "himachal pradesh", "manali", "shimla", "spiti", "dharamshala"],
    uttarakhand: ["uttarakhand", "rishikesh", "mussoorie", "nainital", "valley of flowers"],
    agra: ["agra", "taj mahal", "fatehpur sikri", "agra fort"],
    varanasi: ["varanasi", "kashi", "sarnath", "assi ghat", "dashashwamedh"],
    assam: ["assam", "kaziranga", "majuli", "guwahati", "sivasagar"],
    tamilnadu: ["tamil nadu", "tamilnadu", "madurai", "mahabalipuram", "thanjavur", "kanyakumari"]
  };
  const categoryAliases = {
    dance: ["dance", "dances", "bharatanatyam", "kathak", "kathakali", "odissi", "kuchipudi", "manipuri", "garba", "bhangra", "lavani", "bihu dance", "folk dance"],
    food: ["food", "cuisine", "cuisines", "dish", "dishes", "eat", "eating", "flavour", "flavor", "street food", "traditional food", "puran poli", "dhokla", "dal baati churma", "appam", "rogan josh", "masala dosa"],
    festival: ["festival", "festivals", "celebration", "celebrations", "diwali", "holi", "ganesh chaturthi", "navratri", "onam", "durga puja", "bihu", "pongal", "baisakhi"],
    music: ["music", "song", "songs", "musician", "instruments", "classical music"],
    clothing: ["clothing", "clothes", "dress", "dresses", "saree", "sari", "textile", "traditional wear"],
    art: ["art", "craft", "crafts", "handicraft", "handicrafts", "painting", "pottery", "folk art"],
    languages: ["language", "languages", "dialect", "dialects", "speak", "spoken"],
    architecture: ["architecture", "temple", "temples", "fort", "forts", "palace", "palaces", "monument", "monuments"]
  };
  const categoryNames = {
    dance: "Dance", food: "Food", festival: "Festivals", music: "Music",
    clothing: "Clothing & textiles", art: "Art & crafts",
    languages: "Languages", architecture: "Architecture"
  };

  function normalize(value) {
    return String(value || "").toLocaleLowerCase("en-IN")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, "").replace(/[^a-z0-9₹\s-]/g, " ")
      .replace(/\s+/g, " ").trim();
  }
  function includesTerm(query, term) {
    return (" " + normalize(query) + " ").includes(" " + normalize(term) + " ");
  }
  function formatPrice(value) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
  }
  function destinations() {
    return window.ExploreBharatKnowledge?.destinations || {};
  }
  function cultureIndex() {
    return window.ExploreBharatKnowledge?.culture || {};
  }
  function tours() {
    return Array.isArray(window.ExploreBharatTrips) ? window.ExploreBharatTrips : [];
  }
  function findDestination(query) {
    const data = destinations();
    const matches = [];
    Object.entries(aliases).forEach(function (entry) {
      const key = entry[0], terms = entry[1], destination = data[key];
      terms.forEach(function (term) {
        if (includesTerm(query, term)) matches.push({ key: key, length: normalize(term).length });
      });
      if (destination) {
        [destination.name].concat(destination.places || []).forEach(function (term) {
          if (includesTerm(query, term)) matches.push({ key: key, length: normalize(term).length });
        });
      }
    });
    matches.sort(function (a, b) { return b.length - a.length; });
    const key = matches[0]?.key;
    return key && data[key] ? { key: key, data: data[key] } : null;
  }
  function findTour(query) {
    const list = tours();
    const matches = list.map(function (item) {
      const terms = [item.id, item.title, item.destination];
      const match = terms.some(function (term) { return includesTerm(query, term); });
      return match ? item : null;
    }).filter(Boolean);
    return matches[0] || null;
  }
  function findCategory(query) {
    const candidates = [];
    Object.entries(categoryAliases).forEach(function (entry) {
      entry[1].forEach(function (term) {
        if (includesTerm(query, term)) candidates.push({ category: entry[0], length: normalize(term).length });
      });
    });
    candidates.sort(function (a, b) { return b.length - a.length; });
    return candidates[0]?.category || null;
  }
  function findCultureItems(query, category) {
    const list = cultureIndex()[category] || [];
    return list.filter(function (item) {
      return includesTerm(query, item.name) || includesTerm(query, item.region) || includesTerm(query, item.description);
    });
  }
  function categoryTab(category) {
    const tab = document.querySelector('.culture-tab[data-category="' + category + '"]');
    if (tab) tab.click();
    return tab;
  }
  function recordAction(title, detail) {
    document.dispatchEvent(new CustomEvent("explore-bharat:assistant-action", {
      detail: { title: title, detail: detail }
    }));
  }
  function addMessage(role, text, actions) {
    const wrapper = document.createElement("div");
    wrapper.className = "bharat-ai-message " + (role === "user" ? "bharat-ai-user" : "bharat-ai-bot");
    if (role !== "user") {
      const avatar = document.createElement("span");
      avatar.className = "bharat-ai-message-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = "✦";
      wrapper.appendChild(avatar);
    }
    const bubble = document.createElement("div");
    bubble.className = "bharat-ai-bubble";
    const paragraph = document.createElement("p");
    bubble.appendChild(paragraph);
    if (role !== "user") {
      const meta = document.createElement("span");
      meta.className = "bharat-ai-message-meta";
      meta.textContent = "Bharat AI · Explore Bharat knowledge";
      bubble.appendChild(meta);
    }
    wrapper.appendChild(bubble);
    if (Array.isArray(actions) && actions.length) {
      const actionRow = document.createElement("div");
      actionRow.className = "bharat-ai-actions";
      actions.forEach(function (action) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = action.label;
        button.addEventListener("click", action.run);
        actionRow.appendChild(button);
      });
      bubble.appendChild(actionRow);
    }
    messages.appendChild(wrapper);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (role === "user" || reduced) {
      paragraph.textContent = text;
      messages.scrollTop = messages.scrollHeight;
      return;
    }
    // Animated reveal is only a visual effect; it is not LLM token streaming.
    let offset = 0;
    function revealChunk() {
      offset = Math.min(text.length, offset + 4);
      paragraph.textContent = text.slice(0, offset);
      messages.scrollTop = messages.scrollHeight;
      if (offset < text.length) window.setTimeout(revealChunk, 12);
    }
    revealChunk();
  }
  function setPanel(open) {
    panel.hidden = !open;
    panel.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  }
  function goToSection(id) {
    const section = $(id);
    if (!section) return false;
    section.scrollIntoView({ behavior: motion, block: "start" });
    return true;
  }
  function openDestinationPage(found) {
    const card = document.querySelector('.destination-card[data-destination="' + found.key + '"]');
    goToSection("destinations");
    if (card) {
      card.scrollIntoView({ behavior: motion, block: "center" });
      window.setTimeout(function () { card.click(); }, motion === "auto" ? 0 : 300);
    }
    recordAction("Bharat AI navigation", "Opened " + found.data.name + " destination details.");
    setPanel(false);
  }
  function openCulturePage(category) {
    categoryTab(category);
    goToSection("culture");
    recordAction("Bharat AI navigation", "Opened the " + categoryNames[category] + " culture collection.");
    setPanel(false);
  }
  function openTourSection() {
    goToSection("packages");
    recordAction("Bharat AI navigation", "Opened featured sample tour packages.");
    setPanel(false);
  }
  function openRegistration() {
    const chosen = window.ExploreBharatCart?.getItems?.() || [];
    if (chosen.length) {
      const destination = $("registrationDestination");
      if (destination) {
        const option = Array.from(destination.options).find(function (node) {
          return node.value === chosen[0].destination || node.textContent.trim() === chosen[0].destination;
        });
        if (option) destination.value = option.value;
      }
      $("selectedTripSummary")?.scrollIntoView({ behavior: "auto", block: "nearest" });
    }
    addMessage("bot", chosen.length
      ? "Your selected package details are already loaded in the registration form. Review the itinerary shortlist, dates and traveller details before sending your enquiry."
      : "I've opened the trip enquiry form. You can choose a destination, dates, number of travellers and your preferred travel arrangements.");
    goToSection("registration");
    recordAction("Bharat AI navigation", "Opened the journey registration form.");
    setPanel(false);
  }
  function showDestinationAnswer(found, query) {
    const data = found.data;
    const lower = normalize(query);
    let answer = data.name + " — " + data.tag + "\n\n" + data.description;
    if (/\b(places|visit|see|attractions|sightseeing|where|what to do)\b/.test(lower)) {
      answer += "\n\nPlaces to explore:\n• " + (data.places || []).join("\n• ");
    } else if (/\b(food|eat|cuisine|dish|dishes|famous food|local food)\b/.test(lower)) {
      answer += "\n\nLocal food to discover:\n" + data.cuisine;
    } else if (/\b(experience|experiences|activities|do there|things to do)\b/.test(lower)) {
      answer += "\n\nExperiences:\n" + data.experiences;
    } else if (/\b(duration|days|long|how many days|time needed)\b/.test(lower)) {
      answer += "\n\nSuggested time on the website: " + data.duration + ".";
      answer += "\nThis is a general guide, not a fixed itinerary.";
    } else {
      answer += "\n\nPlaces to explore:\n• " + (data.places || []).join("\n• ");
      answer += "\n\nExperiences:\n" + data.experiences;
      answer += "\n\nCuisine:\n" + data.cuisine;
      answer += "\n\nSuggested duration: " + data.duration + ".";
    }
    if (/best time|weather|temperature|climate|how to reach|flight|train|bus|hotel|visa|permit|safety/.test(lower)) {
      answer += "\n\nThe current website does not contain verified live weather, transport, hotel, permit or safety updates. Please check official and current sources before travelling.";
    }
    addMessage("bot", answer, [
      { label: "Open " + data.name + " guide", run: function () { openDestinationPage(found); } },
      { label: "View tour packages", run: openTourSection }
    ]);
    recordAction("Bharat AI information", "Read the website guide for " + data.name + ".");
  }
  function showCultureAnswer(query, category) {
    const selected = category || "dance";
    categoryTab(selected);
    const entries = cultureIndex()[selected] || [];
    const specific = findCultureItems(query, selected);
    let answer = categoryNames[selected] + " in Bharat\n\n";
    if (specific.length) {
      answer += specific.slice(0, 5).map(function (item) {
        return item.name + " — " + item.region + ". " + item.description;
      }).join("\n\n");
    } else if (entries.length) {
      answer += "Explore these examples from the " + categoryNames[selected].toLowerCase() + " collection:\n";
      answer += entries.slice(0, 6).map(function (item) { return "• " + item.name + " (" + item.region + ")"; }).join("\n");
      answer += "\n\nAsk me about any one of these to learn more.";
    } else {
      answer += "The culture collection is available on the page. Open it to browse the currently listed traditions.";
    }
    addMessage("bot", answer, [
      { label: "Open " + categoryNames[selected] + " collection", run: function () { openCulturePage(selected); } }
    ]);
    recordAction("Bharat AI information", "Explored the " + categoryNames[selected] + " collection.");
  }

  function showGeneralCultureAnswer(query) {
    const keys = Object.keys(categoryAliases);
    const foundDestination = findDestination(query);
    const region = foundDestination?.data.name || "";
    const results = [];
    keys.forEach(function (category) {
      categoryTab(category);
      const entries = cultureIndex()[category] || [];
      const regional = region ? entries.filter(function (item) {
        return includesTerm(item.region, region) || includesTerm(region, item.region);
      }) : entries.slice(0, 2);
      if (regional.length) results.push(categoryNames[category] + ": " + regional.slice(0, 4).map(function (item) {
        return item.name + " (" + item.region + ")";
      }).join(", "));
    });
    categoryTab("dance");
    let answer = region ? "Culture collections connected to " + region + " in the current website content:\n\n" : "Explore the culture collections currently featured on Explore Bharat:\n\n";
    answer += results.length ? results.join("\n\n") : "Dance, food, festivals, music, clothing, art and crafts, languages, and architecture.";
    answer += "\n\nAsk me about a specific tradition or choose a collection to explore its descriptions.";
    addMessage("bot", answer, [{ label: "Open culture collections", run: function () { goToSection("culture"); setPanel(false); } }]);
    recordAction("Bharat AI information", "Explored the general culture collections" + (region ? " for " + region : "") + ".");
  }

  function showTourAnswer(item) {
    const answer = item.title + "\n" + item.destination + " · " + item.duration +
      "\nSample price: " + formatPrice(item.price) + " per traveller\n\n" + item.overview +
      "\n\nHighlights:\n• " + item.highlights.join("\n• ") +
      "\n\nSample itinerary:\n" + item.itinerary.join("\n") +
      "\n\nPlanning note: " + item.note +
      "\n\nThis is an illustrative student-project estimate, not a live quote or confirmed travel offer.";
    addMessage("bot", answer, [
      { label: "＋ Add this package to cart", run: function () {
        const added = window.ExploreBharatCart?.add?.(item.id);
        addMessage("bot", added
          ? item.title + " is in your trip cart. Its details and sample estimate have been loaded into the registration form."
          : "The trip cart is not available right now. Please use the package card on the page.");
        goToSection("packages");
      } },
      { label: "View all packages", run: openTourSection }
    ]);
    recordAction("Bharat AI information", "Viewed the " + item.title + " sample itinerary.");
  }
  function showPackageList() {
    const list = tours();
    if (!list.length) {
      addMessage("bot", "I can't load the sample tour list right now. Please open the Tour Packages section.");
      return;
    }
    const answer = "Here are the four curated sample tour ideas currently listed on Explore Bharat:\n\n" +
      list.map(function (item) {
        return item.title + " — " + item.duration + " · " + formatPrice(item.price) + " per traveller (sample)";
      }).join("\n\n") +
      "\n\nSelect a package to see its highlights and day-by-day sample plan. These are not live bookable offers.";
    addMessage("bot", answer, [{ label: "Open tour packages", run: openTourSection }]);
  }
  function showCart() {
    const list = window.ExploreBharatCart?.getItems?.() || [];
    if (!list.length) {
      addMessage("bot", "Your trip cart is empty. Ask me for a Kashmir, Rajasthan, Kerala or Maharashtra package, then add one to your cart.");
      return;
    }
    const total = list.reduce(function (sum, item) { return sum + item.price; }, 0);
    addMessage("bot", "Your trip cart contains:\n\n" +
      list.map(function (item) { return item.title + " — " + formatPrice(item.price) + " per traveller (sample)"; }).join("\n") +
      "\n\nSample total per traveller: " + formatPrice(total) +
      "\n\nThese selections are saved in this browser only. Continue to registration to submit a trip enquiry; no booking or payment is made.",
      [{ label: "Continue to registration", run: openRegistration }]);
  }
  function handleQuery(raw) {
    const query = normalize(raw);
    if (!query) return;
    addMessage("user", raw.trim());

    if (/\b(hi|hello|hey|namaste|good morning|good evening)\b/.test(query)) {
      addMessage("bot", "Namaste! Ask me about a destination, local food, places to visit, a culture tradition or one of the four sample tour packages. I can also add a package to your trip cart.");
      return;
    }
    if (/\b(help|what can you do|how do i use|what to ask|what do you know)\b/.test(query)) {
      addMessage("bot", "I can explain the destinations and attractions listed on this website, share regional cuisine and culture-card information, describe package highlights and sample itineraries, add packages to your cart, and take you to registration. Try “What should I see in Kerala?”, “Tell me about Lavani”, “What is included in Kashmir package?” or “Add the Rajasthan tour to my cart”.");
      return;
    }
    if (/\b(cart|my selected trips|selected packages|what did i add)\b/.test(query)) {
      showCart();
      return;
    }
    if (/\b(profile|my travel log|travel history|my account)\b/.test(query)) {
      addMessage("bot", "Opening your Explore Bharat profile and travel log.");
      window.setTimeout(function () { $("profileOpen")?.click(); setPanel(false); }, 250);
      return;
    }
    if (/\b(register|registration|enquiry form|sign up|signup|trip form)\b/.test(query)) {
      openRegistration();
      return;
    }
    if (/\b(book|booking|payment|pay online|confirm my trip|reservation)\b/.test(query)) {
      addMessage("bot", "Explore Bharat is currently a front-end student demo. I can help you shortlist sample tours and prepare an enquiry, but this site does not check availability, confirm reservations, accept payments or send bookings to a travel operator.");
      return;
    }

    const tour = findTour(query);
    const cartIntent = /\b(add|put|select|choose|include)\b/.test(query) && /\b(cart|package|tour|trip)\b/.test(query);
    if (tour && cartIntent) {
      const added = window.ExploreBharatCart?.add?.(tour.id);
      addMessage("bot", added
        ? tour.title + " has been added to your trip cart. The package details are loaded into registration. You can review travellers, dates and preferences before submitting an enquiry."
        : "The trip cart is unavailable right now. Use the Add to cart button on the tour package card.");
      return;
    }
    if (tour) {
      showTourAnswer(tour);
      return;
    }
    if (/\b(package|tour packages|holiday packages|travel packages|sample tours|show me tours)\b/.test(query)) {
      showPackageList();
      return;
    }

    const category = findCategory(query);
    if (category) {
      showCultureAnswer(query, category);
      return;
    }
    if (/\b(culture|cultures|tradition|traditions|arts and crafts|heritage collections)\b/.test(query)) {
      showGeneralCultureAnswer(query);
      return;
    }

    const found = findDestination(query);
    if (found) {
      showDestinationAnswer(found, query);
      return;
    }

    if (/\b(destination|destinations|places to visit|where should i go|places in bharat|explore bharat|explore india)\b/.test(query)) {
      const data = destinations();
      const names = Object.values(data).map(function (item) { return item.name; });
      addMessage("bot", "Explore Bharat currently features these destination guides:\n\n" + names.join(" · ") +
        "\n\nAsk about any one for its highlights, places to visit, experiences, cuisine and suggested duration.",
        [{ label: "Open destinations", run: function () { goToSection("destinations"); setPanel(false); } }]);
      return;
    }
    if (/\b(plan|planner|build.*trip|custom trip|my own trip|itinerary|budget)\b/.test(query)) {
      const budget = $("tripBudget"), duration = $("tripDuration"), style = $("tripStyle");
      if (budget && /under|below|low budget|5000/.test(query)) budget.value = "low";
      if (budget && /premium|above 20000/.test(query)) budget.value = "premium";
      if (duration && /weekend|1 2 days|two days/.test(query)) duration.value = "weekend";
      if (duration && /3 5 days|five days|three days/.test(query)) duration.value = "short";
      if (style) {
        const option = Array.from(style.options).find(function (item) { return includesTerm(query, item.textContent); });
        if (option) style.value = option.value;
      }
      addMessage("bot", "I've opened the trip planner. Choose your budget, duration and travel style, then select “Find My Trip”. The result is a travel suggestion, not a confirmed itinerary.");
      goToSection("trip-planner");
      setPanel(false);
      return;
    }
    if (/\b(home|homepage|start page)\b/.test(query)) {
      goToSection("home");
      addMessage("bot", "Taking you back to the Explore Bharat homepage.");
      setPanel(false);
      return;
    }
    if (/\b(best time|weather|temperature|live price|train timing|flight timing|hotel availability|permit)\b/.test(query)) {
      addMessage("bot", "The website currently contains curated destination descriptions and sample tour plans, but it does not connect to live weather, transport schedules, hotel inventory, permit notices or current prices. Please verify those details using official and up-to-date sources before making travel arrangements.");
      return;
    }
    addMessage("bot", "I couldn't find that topic in the current Explore Bharat content. I can answer about the 12 destination guides, the eight culture collections and four sample tour packages. Try “Tell me about Kashmir”, “What food is famous in Assam?”, “Explain Ganesh Chaturthi” or “Show my cart”.");
  }

  toggle.addEventListener("click", function () { setPanel(panel.hidden); });
  close.addEventListener("click", function () { setPanel(false); });
  document.addEventListener("keydown", function (event) {
    if (!panel.hidden && event.key === "Escape") setPanel(false);
  });
  document.addEventListener("click", function (event) {
    if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) setPanel(false);
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!input.value.trim()) return;
    const value = input.value;
    input.value = "";
    handleQuery(value);
  });
  suggestions?.addEventListener("click", function (event) {
    const button = event.target.closest("[data-prompt]");
    if (!button) return;
    handleQuery(button.dataset.prompt);
  });
});