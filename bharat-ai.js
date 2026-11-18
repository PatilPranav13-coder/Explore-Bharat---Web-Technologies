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

  let lastTourResult = null;
  function showTourAnswer(item) {
    lastTourResult = item;
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
  function currentCart() {
    return window.ExploreBharatCart?.getItems?.() || [];
  }
  function showCart() {
    const list = currentCart();
    if (!list.length) {
      addMessage("bot", "Your trip cart is empty. You can say “Add Kashmir to my cart”, “Put Kerala in the cart”, or ask me to recommend a tour.");
      return;
    }
    const total = list.reduce(function (sum, item) { return sum + item.price; }, 0);
    const actions = list.map(function (item) {
      return { label: "Remove " + item.destination, run: function () {
        window.ExploreBharatCart?.remove?.(item.id);
        addMessage("bot", item.title + " has been removed from your cart.");
        showCart();
      } };
    });
    actions.push({ label: "Clear my cart", run: function () {
      window.ExploreBharatCart?.clear?.();
      addMessage("bot", "Your trip cart has been cleared.");
    } });
    actions.push({ label: "Continue to registration", run: openRegistration });
    addMessage("bot", "Your trip cart contains:\n\n" +
      list.map(function (item) { return item.title + " — " + formatPrice(item.price) + " per traveller (sample)"; }).join("\n") +
      "\n\nSample total per traveller: " + formatPrice(total) +
      "\n\nThese selections are saved in this browser only. You can remove individual tours or clear the cart. No booking or payment is made.", actions);
  }

  function mentionedTours(query) {
    return tours().filter(function (item) {
      return [item.id, item.title, item.destination].some(function (term) { return includesTerm(query, term); });
    });
  }
  function tellActionSuccess(text, buttons) {
    addMessage("bot", text, buttons || []);
  }
  function addTourToCart(item) {
    if (!item) return false;
    const ok = window.ExploreBharatCart?.add?.(item.id);
    if (ok) {
      lastTourResult = item;
      tellActionSuccess(item.title + " has been added to your trip cart. The package, destination, duration and sample estimate are now loaded into the registration form.", [
        { label: "View my cart", run: showCart },
        { label: "Continue to registration", run: openRegistration },
        { label: "Add another package", run: openTourSection }
      ]);
    } else {
      tellActionSuccess("I couldn't update the cart just now. Please use the Add to cart button on the package card.");
    }
    return Boolean(ok);
  }
  function removeTourFromCart(item) {
    if (!item) return false;
    const existed = currentCart().some(function (entry) { return entry.id === item.id; });
    if (!existed) {
      tellActionSuccess(item.title + " is not currently in your cart.");
      return false;
    }
    const ok = window.ExploreBharatCart?.remove?.(item.id);
    if (ok !== false) tellActionSuccess(item.title + " has been removed from your trip cart.", [
      { label: "View updated cart", run: showCart },
      { label: "Continue planning", run: openTourSection }
    ]);
    return true;
  }
  function compareTours(list) {
    const selected = list && list.length >= 2 ? list : tours();
    const answer = "Here is a comparison of the sample packages currently listed on Explore Bharat:\n\n" +
      selected.map(function (item) {
        return item.title + "\nDestination: " + item.destination +
          "\nDuration: " + item.duration +
          "\nSample price: " + formatPrice(item.price) + " per traveller";
      }).join("\n\n") +
      "\n\nPrices are sample project values only. They do not include a verified live quotation or availability.";
    addMessage("bot", answer, selected.slice(0, 4).map(function (item) {
      return { label: "Add " + item.destination, run: function () { addTourToCart(item); } };
    }));
    recordAction("Bharat AI action", "Compared " + selected.map(function (item) { return item.title; }).join(", ") + ".");
  }
  function recommendTours(query) {
    const lower = normalize(query);
    let ceiling = Infinity;
    const amount = lower.match(/(?:under|below|upto|up to|max(?:imum)?|budget of)\s*₹?\s*(\d{1,2})(?:\s*(?:k|thousand))?\b/);
    if (amount) ceiling = Number(amount[1]) * (/k|thousand/.test(amount[0]) || Number(amount[1]) < 100 ? 1000 : 1);
    if (/under 5000|below 5000|low budget/.test(lower)) ceiling = Math.min(ceiling, 5000);
    if (/under 10000|below 10000/.test(lower)) ceiling = Math.min(ceiling, 10000);
    if (/under 15000|below 15000/.test(lower)) ceiling = Math.min(ceiling, 15000);
    if (/under 20000|below 20000/.test(lower)) ceiling = Math.min(ceiling, 20000);

    const style = /heritage|history|fort|palace|monument/.test(lower) ? "heritage"
      : /nature|green|backwater|wildlife|relax/.test(lower) ? "nature"
      : /mountain|snow|adventure|trek|himalaya/.test(lower) ? "mountain"
      : /beach|coast|sea/.test(lower) ? "coast"
      : /family|children|kids/.test(lower) ? "family" : "";
    const length = /weekend|1.?2 days|short trip/.test(lower) ? "short"
      : /week|6.?8 days|long trip/.test(lower) ? "long" : "";

    const scores = {
      kashmir: { nature: 5, mountain: 4, family: 3 },
      rajasthan: { heritage: 5, family: 4 },
      kerala: { nature: 5, family: 4, coast: 2 },
      maharashtra: { heritage: 4, short: 5, family: 3 }
    };
    const candidates = tours().filter(function (item) { return item.price <= ceiling; })
      .map(function (item) {
        let score = (scores[item.id] && style ? (scores[item.id][style] || 0) : 1);
        if (length === "short" && item.id === "maharashtra") score += 3;
        if (length === "long" && item.id === "kashmir") score += 2;
        if (item.price <= ceiling && ceiling !== Infinity) score += 1;
        return { item: item, score: score };
      }).sort(function (a, b) { return b.score - a.score || a.item.price - b.item.price; });
    if (!candidates.length) {
      addMessage("bot", "The current sample packages do not fit that budget. I can still open the custom trip planner so you can create a lower-budget trip idea.");
      addMessage("bot", "Please note that the displayed prices are sample estimates, not live quotations.");
      return;
    }
    const chosen = candidates.slice(0, 2).map(function (entry) { return entry.item; });
    const preference = [style, length].filter(Boolean).join(" and ");
    addMessage("bot", "Based on " + (preference || "the options on the website") +
      (ceiling === Infinity ? "" : " and your budget ceiling of " + formatPrice(ceiling)) +
      ", I recommend:\n\n" + chosen.map(function (item) {
        return item.title + " — " + item.duration + ", " + formatPrice(item.price) + " per traveller (sample).";
      }).join("\n") + "\n\nWould you like me to add one to your cart?");
    chosen.forEach(function (item) {
      addMessage("bot", item.title + " is ready to select.", [
        { label: "Add " + item.destination + " to cart", run: function () { addTourToCart(item); } },
        { label: "See package details", run: function () { showTourAnswer(item); } }
      ]);
    });
  }
  function setSelectValue(id, candidates) {
    const field = $(id);
    if (!field) return false;
    const options = Array.from(field.options);
    const match = options.find(function (option) {
      const value = normalize(option.value + " " + option.textContent);
      return candidates.some(function (candidate) { return value.includes(normalize(candidate)); });
    });
    if (!match) return false;
    field.value = match.value;
    field.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  function fillRegistrationFromMessage(raw, query) {
    const changes = [];
    const found = findDestination(query);
    const selectedTour = findTour(query);
    if (selectedTour && /\b(add|put|cart|package|tour)\b/.test(query)) {
      window.ExploreBharatCart?.add?.(selectedTour.id);
      changes.push(selectedTour.title + " added to the trip cart");
    }
    if (found && /registration|register|form|enquiry|trip|travel date|travellers|people/.test(query)) {
      if (setSelectValue("registrationDestination", [found.data.name])) changes.push("destination set to " + found.data.name);
    }

    const count = query.match(/\b([1-9]|10)\s*(?:travellers?|people|persons|adults|members)\b/);
    if (count && $("travellerCount")) {
      $("travellerCount").value = count[1];
      $("travellerCount").dispatchEvent(new Event("change", { bubbles: true }));
      changes.push(count[1] + " travellers");
    }
    const departureISO = raw.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    if (departureISO && $("travelDate")) {
      $("travelDate").value = departureISO[1];
      $("travelDate").dispatchEvent(new Event("change", { bubbles: true }));
      changes.push("departure date " + departureISO[1]);
    }
    const returnISO = raw.match(/\b(?:return|back)\s*(?:date)?\s*(?:is|on)?\s*(20\d{2}-\d{2}-\d{2})\b/i);
    if (returnISO && $("returnDate")) {
      $("returnDate").value = returnISO[1];
      $("returnDate").dispatchEvent(new Event("change", { bubbles: true }));
      changes.push("return date " + returnISO[1]);
    }
    const from = query.match(/\bfrom ([a-z][a-z -]{1,35}?)(?= budget| with| for| on| by| and|,|$)/);
    if (from && $("originCity")) {
      $("originCity").value = from[1].trim().replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
      changes.push("departure city " + $("originCity").value);
    }
    const food = /vegetarian|veg\b/.test(query) ? "Vegetarian"
      : /vegan/.test(query) ? "Vegan"
      : /jain/.test(query) ? "Jain"
      : /non.?vegetarian|nonveg/.test(query) ? "Non-vegetarian" : "";
    if (food && setSelectValue("foodPreference", [food])) changes.push(food + " food");
    const transport = /train/.test(query) ? "Train" : /flight|plane/.test(query) ? "Flight"
      : /bus/.test(query) ? "Bus" : /cab|car|drive/.test(query) ? "Private cab or car"
      : /mixed transport/.test(query) ? "Mixed transport" : "";
    if (transport && setSelectValue("transportPreference", [transport])) changes.push(transport.toLowerCase());
    const stay = /homestay|home stay/.test(query) ? "Homestay"
      : /premium|resort/.test(query) ? "Premium hotel or resort"
      : /budget hotel|budget stay|hostel/.test(query) ? "Budget stay"
      : /standard hotel/.test(query) ? "Standard hotel" : "";
    if (stay && setSelectValue("stayPreference", [stay])) changes.push(stay.toLowerCase());
    const purpose = /\bfamily\b/.test(query) ? "Family"
      : /\bcouple\b/.test(query) ? "Couple"
      : /\bsolo\b/.test(query) ? "Solo" : /\bfriends|group\b/.test(query) ? "Friends" : "";
    if (purpose && setSelectValue("tripPurpose", [purpose])) changes.push(purpose.toLowerCase() + " trip");
    let budget = "";
    const value = query.match(/(?:budget|under|below|upto|up to)\s*₹?\s*(\d{1,2})(?:\s*(k|thousand))?\b/);
    if (value) {
      const amount = Number(value[1]) * (value[2] || Number(value[1]) < 100 ? 1000 : 1);
      budget = amount < 5000 ? "Under ₹5,000" : amount < 10000 ? "₹5,000–₹10,000"
        : amount < 20000 ? "₹10,000–₹20,000" : "Above ₹20,000";
    }
    if (/under 5000|below 5000|low budget/.test(query)) budget = "Under ₹5,000";
    if (/5000 to 10000|5000-10000/.test(query)) budget = "₹5,000–₹10,000";
    if (/10000 to 20000|10000-20000/.test(query)) budget = "₹10,000–₹20,000";
    if (budget && setSelectValue("budgetRange", [budget])) changes.push("budget " + budget);

    if (!changes.length) return false;
    goToSection("registration");
    addMessage("bot", "I've updated the registration form: " + changes.join(", ") +
      ". Please review the fields and complete anything still missing. I have not submitted the form.");
    recordAction("Bharat AI action", "Prefilled trip enquiry form: " + changes.join(", ") + ".");
    return true;
  }
  function runPlannerFromMessage(query) {
    const budget = $("tripBudget"), duration = $("tripDuration"), style = $("tripStyle");
    let changed = false;
    if (budget) {
      if (/under 5000|below 5000|low budget/.test(query)) { budget.value = "low"; changed = true; }
      else if (/5000 to 10000|5000-10000|medium budget/.test(query)) { budget.value = "medium"; changed = true; }
      else if (/10000 to 20000|10000-20000/.test(query)) { budget.value = "high"; changed = true; }
      else if (/premium|above 20000|over 20000/.test(query)) { budget.value = "premium"; changed = true; }
    }
    if (duration) {
      if (/weekend|1 2 days|two days/.test(query)) { duration.value = "weekend"; changed = true; }
      else if (/3 5 days|three to five days|five days/.test(query)) { duration.value = "short"; changed = true; }
      else if (/6 days|7 days|one week|long trip/.test(query)) { duration.value = "long"; changed = true; }
    }
    if (style) {
      const selected = /adventure|mountain|trek/.test(query) ? "adventure"
        : /nature|wildlife|forest/.test(query) ? "nature"
        : /heritage|history|fort/.test(query) ? "heritage"
        : /beach|coast/.test(query) ? "beach"
        : /spiritual|temple|pilgrim/.test(query) ? "spiritual"
        : /family|children|kids/.test(query) ? "family" : "";
      if (selected) { style.value = selected; changed = true; }
    }
    if (changed) {
      const cards = document.querySelectorAll(".travel-style-card");
      cards.forEach(function (card) {
        const active = card.dataset.style === style?.value;
        card.classList.toggle("selected", active);
        card.setAttribute("aria-pressed", String(active));
      });
    }
    goToSection("trip-planner");
    if (budget?.value && duration?.value && style?.value) {
      $("findTripBtn")?.click();
      addMessage("bot", "I've filled your budget, duration and travel style, and generated a trip suggestion below. Review it before continuing.");
    } else {
      const missing = [];
      if (!budget?.value) missing.push("budget");
      if (!duration?.value) missing.push("duration");
      if (!style?.value) missing.push("travel style");
      addMessage("bot", (changed ? "I've filled the preferences I could identify. " : "Let's build your trip. ") +
        "Please select " + missing.join(", ") + " in the planner.");
    }
    recordAction("Bharat AI action", "Updated custom trip planner preferences.");
    return true;
  }
  function openSectionIntent(query) {
    const mappings = [
      { re: /\b(packages?|tours?)\b/, id: "packages", name: "tour packages" },
      { re: /\b(registration|register|enquiry form)\b/, id: "registration", name: "registration" },
      { re: /\b(culture|traditions?)\b/, id: "culture", name: "culture" },
      { re: /\b(destinations?|places)\b/, id: "destinations", name: "destinations" },
      { re: /\b(planner|build.*trip|custom trip)\b/, id: "trip-planner", name: "trip planner" },
      { re: /\b(home|homepage)\b/, id: "home", name: "homepage" }
    ];
    const target = mappings.find(function (item) { return item.re.test(query); });
    if (!target) return false;
    goToSection(target.id);
    addMessage("bot", "I've opened the " + target.name + " section.");
    setPanel(false);
    return true;
  }
  function handleQuery(raw) {
    const query = normalize(raw);
    if (!query) return;
    addMessage("user", raw.trim());

    if (/\b(hi|hello|hey|namaste|good morning|good evening)\b/.test(query)) {
      addMessage("bot", "Namaste! I can take actions for you: add or remove tours, clear and inspect your cart, compare or recommend packages, fill trip preferences, update your registration form, and open destination or culture guides. Try “Add Kashmir to my cart” or “Set 4 travellers, vegetarian food and train travel”.");
      return;
    }
    if (/\b(help|what can you do|how do i use|what to ask|what do you know|show commands)\b/.test(query)) {
      addMessage("bot", "Here's what I can do on this website:\n\n• Cart: add Kashmir / Kerala / Rajasthan / Maharashtra, remove a tour, show the cart, or clear it.\n• Discover: open a destination, explain attractions, food and culture.\n• Plan: recommend tours, compare packages, or fill budget, duration and travel style in the planner.\n• Registration: set the destination, traveller count, date, departure city, budget, food, transport and accommodation preferences.\n• Navigation: open destinations, culture, packages, profile or registration.\n\nI will change the website fields when you ask, but I won't submit the enquiry or make a booking.");
      return;
    }

    // Action intents must run before generic mentions of "cart", "package" or "registration".
    const tour = findTour(query) || ((/\b(it|that one|the previous one)\b/.test(query) && lastTourResult) ? lastTourResult : null);
    const isAdd = /\b(add|put|include|save|select|choose)\b/.test(query) ||
      /\bto (?:my )?cart\b/.test(query) || /\bin (?:my )?cart\b/.test(query);
    const isRemove = /\b(remove|delete|take out|drop|unselect)\b/.test(query);
    const isClear = /\b(clear|empty|remove all|delete all)\b/.test(query) && /\b(cart|trips|packages)\b/.test(query);
    const namedTours = mentionedTours(query);
    const cartActionContext = /\b(cart|package|tour|trip)\b/.test(query);

    if (isClear) {
      window.ExploreBharatCart?.clear?.();
      addMessage("bot", "Done — I've cleared all packages from your trip cart.");
      return;
    }
    if (isRemove && (cartActionContext || Boolean(tour))) {
      const item = namedTours[0] || tour;
      if (item) { removeTourFromCart(item); return; }
      if (/\b(all|everything)\b/.test(query)) {
        window.ExploreBharatCart?.clear?.();
        addMessage("bot", "I've cleared every package from your cart.");
      } else {
        addMessage("bot", "Which package should I remove? You can say “Remove Kashmir from my cart” or ask me to show your cart.");
      }
      return;
    }
    if (isAdd && (cartActionContext || Boolean(tour))) {
      const items = namedTours.length ? namedTours : (tour ? [tour] : []);
      if (/\b(all|every|all four)\b/.test(query)) {
        tours().forEach(function (item) { window.ExploreBharatCart?.add?.(item.id); });
        addMessage("bot", "I've added all four sample tour packages to your cart. You can now review or remove individual packages.");
        return;
      }
      if (items.length) {
        items.forEach(function (item) { window.ExploreBharatCart?.add?.(item.id); });
        addMessage("bot", items.map(function (item) { return item.title; }).join(" and ") +
          (items.length === 1 ? " has" : " have") + " been added to your cart. Their details are ready in registration.", [
            { label: "View cart", run: showCart },
            { label: "Go to registration", run: openRegistration }
          ]);
        return;
      }
    }

    if (/\b(compare|comparison|difference between|versus|vs)\b/.test(query)) {
      compareTours(namedTours.length >= 2 ? namedTours : tours());
      return;
    }
    if (/\b(recommend|suggest|best package|best tour|which package|which tour|find me a tour|suitable tour)\b/.test(query)) {
      recommendTours(query);
      return;
    }
    if (/\b(cart|my selected trips|selected packages|what did i add|show.*cart|view.*cart)\b/.test(query)) {
      showCart();
      return;
    }
    if (/\b(profile|my travel log|travel history|my account)\b/.test(query)) {
      addMessage("bot", "Opening your Explore Bharat profile and travel log.");
      window.setTimeout(function () { $("profileOpen")?.click(); setPanel(false); }, 250);
      return;
    }
    if (/\b(register|registration|enquiry form|fill.*form|complete.*form|sign up|signup|trip form)\b/.test(query)) {
      if (fillRegistrationFromMessage(raw, query)) return;
      openRegistration();
      return;
    }
    if (/\b(set|update|change|make it|i want|we are|travellers?|people|vegetarian|vegan|jain|train|flight|homestay|budget)\b/.test(query) &&
        /\b(form|registration|trip|travel|travellers?|people|date|from|vegetarian|vegan|jain|train|flight|homestay|budget)\b/.test(query)) {
      if (fillRegistrationFromMessage(raw, query)) return;
    }
    if (/\b(book|booking|payment|pay online|confirm my trip|reservation)\b/.test(query)) {
      addMessage("bot", "I can prepare your trip enquiry, but Explore Bharat is currently a front-end demo. It does not check live availability, confirm reservations, accept payments or send bookings to a travel operator.");
      return;
    }

    const mentioned = namedTours[0] || tour;
    const asksTour = /\b(package|packages|tour|itinerary|sample price|price|cost|estimate|included|holiday|escape|retreat)\b/.test(query);
    if (mentioned && asksTour) { showTourAnswer(mentioned); return; }
    if (/\b(package|tour packages|holiday packages|travel packages|sample tours|show me tours)\b/.test(query)) {
      showPackageList();
      return;
    }

    if (/\b(open|go to|navigate|take me|show me the)\b/.test(query)) {
      const foundToOpen = findDestination(query);
      if (foundToOpen) { openDestinationPage(foundToOpen); return; }
      const categoryToOpen = findCategory(query);
      if (categoryToOpen) { openCulturePage(categoryToOpen); return; }
      if (openSectionIntent(query)) return;
    }
    if (/\b(plan|planner|build.*trip|custom trip|my own trip|find.*trip|itinerary|budget)\b/.test(query) &&
        /\b(plan|planner|build|find|custom|budget|adventure|nature|heritage|beach|spiritual|family|weekend|days)\b/.test(query)) {
      runPlannerFromMessage(query);
      return;
    }

    const category = findCategory(query);
    if (category) { showCultureAnswer(query, category); return; }
    if (/\b(culture|cultures|tradition|traditions|arts and crafts|heritage collections)\b/.test(query)) {
      showGeneralCultureAnswer(query);
      return;
    }
    const found = findDestination(query);
    if (found) { showDestinationAnswer(found, query); return; }

    if (/\b(destination|destinations|places to visit|where should i go|places in bharat|explore bharat|explore india)\b/.test(query)) {
      const data = destinations();
      const names = Object.values(data).map(function (item) { return item.name; });
      addMessage("bot", "Explore Bharat currently features these destination guides:\n\n" + names.join(" · ") +
        "\n\nAsk about any one for its highlights, places to visit, experiences, cuisine and suggested duration.",
        [{ label: "Open destinations", run: function () { goToSection("destinations"); setPanel(false); } }]);
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
    addMessage("bot", "I couldn't match that action yet. Try adding or removing a tour, comparing or recommending packages, setting your trip preferences, filling your registration form, or opening a destination or culture collection.");
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