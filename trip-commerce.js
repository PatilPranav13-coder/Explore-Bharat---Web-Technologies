/* Explore Bharat trip cart and expanded enquiry form.
   This is a front-end demo: it stores selections in this browser only.
   It does not make reservations, charge payments or send data to a server. */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const packages = [
    {
      id: "kashmir",
      title: "Kashmir Paradise Escape",
      destination: "Kashmir",
      duration: "5 days / 4 nights",
      price: 14999,
      overview: "A sample Himalayan escape centred on Srinagar, its lakes and gardens, with time for mountain scenery and local experiences.",
      highlights: ["Srinagar and Dal Lake", "Gulmarg mountain scenery", "Pahalgam valley", "Mughal Gardens and local markets", "Kashmiri cuisine and Kahwa"],
      itinerary: ["Day 1 — Arrive in Srinagar and settle in", "Day 2 — Explore Dal Lake, gardens and Srinagar markets", "Day 3 — Excursion towards Gulmarg", "Day 4 — Explore Pahalgam and its valley scenery", "Day 5 — Return / departure"],
      note: "Mountain excursions depend on season, road conditions and weather. Allow flexibility in the plan."
    },
    {
      id: "rajasthan",
      title: "Royal Rajasthan Tour",
      destination: "Rajasthan",
      duration: "5 days / 4 nights",
      price: 12999,
      overview: "A sample heritage journey through Rajasthan's forts, palaces, colourful markets and regional food traditions.",
      highlights: ["Jaipur and Hawa Mahal", "Historic forts and palace architecture", "Udaipur's lakeside heritage", "Local craft and textile markets", "Dal Baati Churma and regional flavours"],
      itinerary: ["Day 1 — Arrive in Jaipur and explore the old city", "Day 2 — Visit Jaipur's heritage landmarks", "Day 3 — Continue towards a chosen Rajasthan heritage city", "Day 4 — Explore forts, markets and local food", "Day 5 — Departure"],
      note: "Rajasthan is large; the final city sequence should be adjusted to transport time and the traveller's preferred route."
    },
    {
      id: "kerala",
      title: "Kerala Nature Retreat",
      destination: "Kerala",
      duration: "4 days / 3 nights",
      price: 10999,
      overview: "A sample green escape combining Kerala's hill landscapes, backwaters, coastal heritage and food traditions.",
      highlights: ["Munnar tea-growing landscapes", "Alleppey backwater experience", "Kochi heritage neighbourhoods", "Nature walks and local culture", "Appam, Puttu and Kerala Sadya"],
      itinerary: ["Day 1 — Arrive in Kochi and explore the heritage area", "Day 2 — Travel towards Munnar and enjoy the hill scenery", "Day 3 — Continue to the backwater region around Alleppey", "Day 4 — Return / departure"],
      note: "Travel times between regions can be significant. A real itinerary should be tailored to arrival point and transport."
    },
    {
      id: "maharashtra",
      title: "Maharashtra Heritage Trail",
      destination: "Maharashtra",
      duration: "3 days / 2 nights",
      price: 7999,
      overview: "A sample short break introducing Maharashtra's hill forts, historic sites, landscapes and Marathi food traditions.",
      highlights: ["Raigad Fort and Maratha heritage", "Ajanta and Ellora as extended heritage options", "Mahabaleshwar hill scenery", "Regional culture and local markets", "Misal Pav, Puran Poli and Maharashtrian thalis"],
      itinerary: ["Day 1 — Begin with a selected heritage town or fort region", "Day 2 — Explore a fort / heritage site and nearby local experiences", "Day 3 — Return / departure"],
      note: "The state is geographically large. Choose one regional circuit rather than trying to cover every listed attraction in three days."
    }
  ];

  window.ExploreBharatTrips = packages;

  const CART_KEY = "exploreBharat.tripCart.v1";
  const grid = document.querySelector(".featured-grid");
  const form = document.getElementById("registrationForm");
  const $ = function (id) { return document.getElementById(id); };
  const currency = function (value) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
  };
  const packageFor = function (id) { return packages.find(function (item) { return item.id === id; }); };

  function readCart() {
    try {
      const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(value)) return [];
      return value.filter(function (id, index) {
        return packageFor(id) && value.indexOf(id) === index;
      });
    } catch (error) {
      return [];
    }
  }

  let cart = readCart();
  const panel = document.createElement("section");
  panel.className = "trip-cart-panel";
  panel.id = "tripCartPanel";
  panel.setAttribute("aria-labelledby", "tripCartTitle");
  panel.innerHTML = [
    '<div class="trip-cart-heading">',
      '<div><p class="section-tag">YOUR JOURNEY SHORTLIST</p><h3 id="tripCartTitle">Trip <span>Cart</span></h3>',
      '<p>Collect the tour ideas you are interested in, then carry them into the registration form.</p></div>',
      '<div class="trip-cart-count" id="tripCartCount" aria-live="polite">0 selected</div>',
    '</div>',
    '<div class="trip-cart-items" id="tripCartItems"><p class="trip-cart-empty">Your cart is empty. Add a tour package above to start planning.</p></div>',
    '<div class="trip-cart-bottom"><p class="trip-cart-note">All prices are sample project estimates per traveller. This demo does not confirm availability, reserve travel or collect payment.</p>',
      '<div class="trip-cart-actions"><strong id="tripCartTotal">Sample total: —</strong>',
      '<button class="trip-cart-clear" id="tripCartClear" type="button" disabled>Clear cart</button>',
      '<button class="trip-cart-continue" id="tripCartContinue" type="button" disabled>Continue to registration ↗</button></div></div>'
  ].join("");
  if (grid && grid.parentElement) grid.parentElement.appendChild(panel);

  function persist() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (error) {
      console.warn("Explore Bharat could not save the trip cart in this browser.", error);
    }
  }

  function cartPackages() {
    return cart.map(packageFor).filter(Boolean);
  }

  function announce(message) {
    const status = $("tripCartStatus");
    if (status) status.textContent = message;
  }

  function syncRegistration() {
    if (!form) return;
    const items = cartPackages();
    const names = items.map(function (item) { return item.title; });
    const destination = $("registrationDestination");
    const nameField = $("selectedTripNames");
    const durationField = $("selectedTripDuration");
    const priceField = $("selectedTripEstimate");
    const hiddenField = $("selectedTripPackages");
    const summary = $("selectedTripSummary");
    const summaryText = $("selectedTripSummaryText");
    const countField = $("travellerCount");
    const people = Math.max(1, Number(countField ? countField.value : 1) || 1);
    const total = items.reduce(function (sum, item) { return sum + item.price; }, 0);

    if (nameField) nameField.value = names.length ? names.join(" + ") : "";
    if (durationField) durationField.value = items.length === 1 ? items[0].duration : (items.length ? "Multiple package durations" : "");
    if (priceField) priceField.value = items.length ? currency(total) + " per traveller (sample)" : "";
    if (hiddenField) hiddenField.value = JSON.stringify(items.map(function (item) {
      return { id: item.id, title: item.title, destination: item.destination, duration: item.duration, samplePricePerTraveller: item.price };
    }));

    if (destination && items.length) {
      const option = Array.from(destination.options).find(function (node) {
        return node.value === items[0].destination || node.textContent.trim() === items[0].destination;
      });
      if (option) destination.value = option.value;
    }

    if (summary) summary.hidden = !items.length;
    if (summaryText) {
      summaryText.textContent = items.length
        ? names.join(" • ") + ". " + items.map(function (item) { return item.duration + " · " + currency(item.price) + " / traveller"; }).join(" | ") +
          ". Estimated sample total for " + people + (people === 1 ? " traveller: " : " travellers: ") + currency(total * people) + "."
        : "No package selected. You can still register interest in a custom trip.";
    }
  }

  function renderCart() {
    const list = $("tripCartItems");
    if (!list) return;
    list.replaceChildren();
    const items = cartPackages();
    const count = $("tripCartCount");
    const total = items.reduce(function (sum, item) { return sum + item.price; }, 0);
    if (count) count.textContent = items.length + (items.length === 1 ? " selected" : " selected");
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "trip-cart-empty";
      empty.textContent = "Your cart is empty. Add a tour package above to start planning.";
      list.appendChild(empty);
    } else {
      items.forEach(function (item) {
        const row = document.createElement("article");
        row.className = "trip-cart-item";
        const copy = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = item.title;
        const detail = document.createElement("p");
        detail.textContent = item.destination + " · " + item.duration + " · " + currency(item.price) + " per traveller (sample)";
        copy.append(title, detail);
        const remove = document.createElement("button");
        remove.className = "trip-cart-remove";
        remove.type = "button";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", "Remove " + item.title + " from trip cart");
        remove.addEventListener("click", function () { removeFromCart(item.id); });
        row.append(copy, remove);
        list.appendChild(row);
      });
    }
    $("tripCartTotal").textContent = items.length ? "Sample total per traveller: " + currency(total) : "Sample total: —";
    $("tripCartClear").disabled = !items.length;
    $("tripCartContinue").disabled = !items.length;
    document.querySelectorAll("[data-cart-add]").forEach(function (button) {
      const selected = cart.indexOf(button.dataset.cartAdd) !== -1;
      button.textContent = selected ? "✓ Added to cart" : "＋ Add to cart";
      button.classList.toggle("is-added", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute("aria-label", (selected ? "Remove " : "Add ") + (packageFor(button.dataset.cartAdd)?.title || "tour package") + (selected ? " from" : " to") + " your trip cart");
    });
    syncRegistration();
    persist();
  }

  function addToCart(id) {
    const item = packageFor(id);
    if (!item) return false;
    if (cart.indexOf(id) === -1) cart.push(id);
    renderCart();
    announce(item.title + " added to your trip cart. Its details are ready in the registration form.");
    document.dispatchEvent(new CustomEvent("explore-bharat:assistant-action", {
      detail: { title: "Tour package added to cart", detail: item.title + " — " + item.duration + ", sample price " + currency(item.price) + " per traveller." }
    }));
    return true;
  }

  function removeFromCart(id) {
    cart = cart.filter(function (item) { return item !== id; });
    renderCart();
    const item = packageFor(id);
    announce((item ? item.title : "Package") + " removed from your trip cart.");
  }

  if (grid) {
    const cards = Array.from(grid.querySelectorAll(".featured-card"));
    packages.forEach(function (item, index) {
      const card = cards[index];
      if (!card) return;
      card.dataset.packageId = item.id;
      card.dataset.destination = item.destination;
      const content = card.querySelector("div") || card;
      const action = document.createElement("button");
      action.type = "button";
      action.className = "package-cart-button";
      action.dataset.cartAdd = item.id;
      action.addEventListener("click", function () {
        if (cart.indexOf(item.id) === -1) addToCart(item.id);
        else removeFromCart(item.id);
      });
      content.appendChild(action);
      const note = document.createElement("p");
      note.className = "package-sample-note";
      note.textContent = "Sample price only · per traveller";
      content.appendChild(note);
    });
  }

  $("tripCartClear")?.addEventListener("click", function () {
    cart = [];
    renderCart();
    announce("Your trip cart has been cleared.");
  });
  $("tripCartContinue")?.addEventListener("click", function () {
    const section = $("registration");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    $("fullName")?.focus({ preventScroll: true });
    syncRegistration();
  });
  $("travellerCount")?.addEventListener("change", syncRegistration);

  const registrationForm = $("registrationForm");
  if (registrationForm) {
    registrationForm.addEventListener("submit", function () {
      const name = $("fullName")?.value.trim() || "Traveller";
      const destination = $("registrationDestination")?.value || "your selected trip";
      const selected = cartPackages();
      const selectedNames = selected.map(function (item) { return item.title; }).join(", ");
      window.setTimeout(function () {
        const message = $("registrationMessage");
        if (message) {
          message.textContent = "Thank you, " + name + "! Your enquiry for " + (selectedNames || destination) +
            " has been recorded in this website demo. No booking, reservation or payment has been made.";
        }
        syncRegistration();
      }, 0);
    }, true);
  }

  window.ExploreBharatCart = {
    add: addToCart,
    remove: removeFromCart,
    getItems: cartPackages
  };

  renderCart();
});
