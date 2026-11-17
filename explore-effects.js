/* Explore Bharat visual effects and navigation search. Original site interactions stay in script.js. */
document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("siteSearchForm");
  const searchInput = document.getElementById("siteSearchInput");
  const searchResults = document.getElementById("siteSearchResults");

  // Build the searchable index directly from the original page content.
  const entries = [];
  const addEntry = (entry) => entries.push(entry);

  document.querySelectorAll(".destination-card").forEach((card) => {
    const title = card.querySelector("h3")?.textContent.trim() || "Destination";
    const key = card.dataset.destination || "";
    addEntry({
      title,
      description: card.querySelector(".card-content")?.textContent.replace(/\s+/g, " ").trim() || "Explore this destination.",
      type: "Destination",
      icon: "📍",
      target: "#destinations",
      element: card,
      kind: "destination",
      keywords: key
    });
  });

  document.querySelectorAll(".culture-tab").forEach((tab) => {
    addEntry({
      title: tab.textContent.trim(),
      description: "Explore India's culture, art, traditions and regional experiences.",
      type: "Culture",
      icon: "🎨",
      target: "#culture",
      element: tab,
      kind: "culture"
    });
  });

  document.querySelectorAll(".featured-card").forEach((card) => {
    addEntry({
      title: card.querySelector("h3")?.textContent.trim() || "Tour package",
      description: card.textContent.replace(/\s+/g, " ").trim(),
      type: "Tour package",
      icon: "🧳",
      target: "#packages",
      element: card,
      kind: "package"
    });
  });

  document.querySelectorAll(".travel-style-card").forEach((card) => {
    addEntry({
      title: card.querySelector("h3")?.textContent.trim() || "Travel style",
      description: card.textContent.replace(/\s+/g, " ").trim(),
      type: "Trip idea",
      icon: "✨",
      target: "#trip-planner",
      element: card,
      kind: "style"
    });
  });

  [
    {title:"Explore destinations",description:"Browse all 12 featured destinations across Bharat.",type:"Explore",icon:"🗺️",target:"#destinations"},
    {title:"Culture and traditions",description:"Discover dance, food, festivals, music, clothing and crafts.",type:"Explore",icon:"🪷",target:"#culture"},
    {title:"Tour packages",description:"View the featured journeys and sample package ideas.",type:"Explore",icon:"🎒",target:"#packages"},
    {title:"Build your own trip",description:"Choose your budget, duration and preferred experience.",type:"Trip planner",icon:"🧭",target:"#trip-planner"},
    {title:"Register for your journey",description:"Open the original travel registration form.",type:"Registration",icon:"📝",target:"#registration"}
  ].forEach(addEntry);

  function renderResults(query) {
    if (!searchResults) return;
    const normalized = query.trim().toLocaleLowerCase("en-IN");
    const terms = normalized.split(/\s+/).filter(Boolean);
    const matches = !normalized
      ? entries.filter((item) => ["Explore destinations","Culture and traditions","Tour packages","Build your own trip"].includes(item.title))
      : entries.filter((item) => {
          const haystack = [item.title,item.description,item.type,item.keywords || ""].join(" ").toLocaleLowerCase("en-IN");
          return haystack.includes(normalized) || terms.every((term) => haystack.includes(term));
        });

    searchResults.replaceChildren();
    const heading = document.createElement("div");
    heading.className = "search-results-heading";
    heading.textContent = normalized ? "Search results" : "Explore Bharat";
    searchResults.appendChild(heading);

    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "search-empty";
      empty.textContent = "No exact match yet. Try a state, destination, food, dance form, festival or travel style.";
      searchResults.appendChild(empty);
    } else {
      matches.slice(0,7).forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result";
        button.setAttribute("role","option");
        const icon = document.createElement("span");
        icon.className = "search-result-icon";
        icon.setAttribute("aria-hidden","true");
        icon.textContent = item.icon || "✦";
        const copy = document.createElement("span");
        copy.className = "search-result-copy";
        const strong = document.createElement("strong");
        strong.textContent = item.title;
        const small = document.createElement("small");
        small.textContent = item.description;
        copy.append(strong,small);
        const type = document.createElement("span");
        type.className = "search-result-type";
        type.textContent = item.type;
        button.append(icon,copy,type);
        button.addEventListener("click", () => {
          closeResults();
          if (item.kind === "destination" && item.element) {
            item.element.scrollIntoView({behavior:motionMode(),block:"center"});
            item.element.click();
          } else if ((item.kind === "culture" || item.kind === "style") && item.element) {
            item.element.scrollIntoView({behavior:motionMode(),block:"center"});
            item.element.click();
          } else if (item.element) {
            item.element.scrollIntoView({behavior:motionMode(),block:"center"});
          } else {
            document.querySelector(item.target)?.scrollIntoView({behavior:motionMode(),block:"start"});
          }
        });
        searchResults.appendChild(button);
      });
    }
    searchResults.hidden = false;
  }

  function closeResults() {
    if (searchResults) searchResults.hidden = true;
  }

  function motionMode() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  if (searchForm && searchInput && searchResults) {
    searchInput.addEventListener("focus", () => renderResults(searchInput.value));
    searchInput.addEventListener("input", () => renderResults(searchInput.value));
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderResults(searchInput.value);
      const first = searchResults.querySelector(".search-result");
      if (first) first.click();
    });
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeResults();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        searchResults.querySelector(".search-result")?.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!searchForm.contains(event.target)) closeResults();
    });
  }

  // A subtle saffron-gold reading progress ribbon.
  const progress = document.createElement("div");
  progress.id = "bharatScrollProgress";
  progress.setAttribute("aria-hidden","true");
  document.body.appendChild(progress);
  let ticking = false;
  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = "scaleX(" + Math.max(0,Math.min(1,amount)) + ")";
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    }
  }, {passive:true});
  updateProgress();

  // Sparkles are ornamental only; all meaningful page content remains in the original HTML.
  const hero = document.querySelector(".hero-content");
  if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const sparkles = document.createElement("div");
    sparkles.className = "hero-sparkles";
    sparkles.setAttribute("aria-hidden","true");
    const symbols = ["✦","✧","❋","✺","✧","✦","❈","✧","✦","❋","✺","✧","✦","❈"];
    symbols.forEach((symbol,index) => {
      const star = document.createElement("span");
      star.className = "hero-sparkle";
      star.textContent = symbol;
      star.style.setProperty("--spark-x",(7 + ((index * 37) % 88)) + "%");
      star.style.setProperty("--spark-y",(10 + ((index * 23) % 80)) + "%");
      star.style.setProperty("--spark-size",(10 + (index % 4) * 5) + "px");
      star.style.setProperty("--spark-time",(5 + (index % 5) * 1.2) + "s");
      star.style.setProperty("--spark-delay",(-index * .8) + "s");
      star.style.setProperty("--spark-drift",((index % 2 ? 1 : -1) * (10 + index * 2)) + "px");
      sparkles.appendChild(star);
    });
    hero.prepend(sparkles);
  }

  // Entrance reveals activate only after the observer is ready, so content never gets stranded hidden.
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealTargets = document.querySelectorAll(
      ".section-heading,.destination-card,.culture-content,.culture-cards > *,.featured-card,.travel-style-card,.trip-form,.registration-form"
    );
    revealTargets.forEach((element,index) => {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--reveal-delay",((index % 5) * 65) + "ms");
    });
    document.body.classList.add("effects-ready");
    const observer = new IntersectionObserver((observations) => {
      observations.forEach((observation) => {
        if (observation.isIntersecting) {
          observation.target.classList.add("is-visible");
          observer.unobserve(observation.target);
        }
      });
    },{threshold:.12,rootMargin:"0px 0px -35px 0px"});
    revealTargets.forEach((element) => observer.observe(element));
  }


  // Animate homepage feature counts when the ribbon first enters view.
  const counters=document.querySelectorAll(".highlight-counter[data-count]");
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function runCounter(element){
    const target=Number(element.dataset.count);
    if(!Number.isFinite(target))return;
    if(reduceMotion){element.textContent=String(target);return;}
    const duration=1050,start=performance.now();
    function tick(now){
      const progress=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-progress,3);
      element.textContent=String(Math.round(target*eased));
      if(progress<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if(counters.length&&"IntersectionObserver" in window&&!reduceMotion){
    const countObserver=new IntersectionObserver((entries,observer)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){runCounter(entry.target);observer.unobserve(entry.target);}
      });
    },{threshold:.65});
    counters.forEach(counter=>countObserver.observe(counter));
  }

  // A soft pointer-responsive light over the hero photograph on desktop.
  const heroVisual=document.querySelector(".hero-visual");
  if(heroVisual&&!reduceMotion&&window.matchMedia("(pointer:fine)").matches){
    const glow=document.createElement("div");
    glow.className="hero-pointer-glow";glow.setAttribute("aria-hidden","true");heroVisual.appendChild(glow);
    heroVisual.addEventListener("pointermove",event=>{
      const rect=heroVisual.getBoundingClientRect();
      glow.style.setProperty("--glow-x",((event.clientX-rect.left)/rect.width*100)+"%");
      glow.style.setProperty("--glow-y",((event.clientY-rect.top)/rect.height*100)+"%");
      glow.classList.add("active");
    });
    heroVisual.addEventListener("pointerleave",()=>glow.classList.remove("active"));
  }

});