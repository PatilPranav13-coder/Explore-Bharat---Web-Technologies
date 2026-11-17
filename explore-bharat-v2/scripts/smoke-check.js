import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = path.dirname(new URL(import.meta.url).pathname);
const read = name => fs.readFileSync(path.join(root, "..", name), "utf8");
const html = read("index.html");
const app = read("app.js");
const server = read("server.js");

for (const file of ["index.html", "styles.css", "app.js", "server.js", "package.json", ".env.example", "privacy.html", "terms.html", "config.js", "config.example.js", "supabase/schema.sql"]) {
  assert.ok(fs.existsSync(path.join(root, "..", file)), `Missing required file: ${file}`);
}
for (const id of ["main-content", "destinationGrid", "planner", "tripForm", "contactForm", "navSearchForm", "siteSearch", "searchPanel", "chatLauncher", "chatPanel", "faq", "registrationTitle", "profileOpen", "cartOpen", "packageRail", "cartPanel", "profilePanel", "checkoutPanel", "profileSignInForm", "profileEditForm", "travelLogForm", "commerceCheckoutForm"]) {
  assert.ok(html.includes(`id="${id}"`), `Missing required UI element: ${id}`);
}
for (const endpoint of ["/api/chat", "/api/search", "/api/enquiries", "/api/payments/order", "/api/payments/verify"]) {
  assert.ok(app.includes(endpoint), `Frontend does not call ${endpoint}`);
  assert.ok(server.includes(endpoint), `Backend does not implement ${endpoint}`);
}
assert.ok(server.includes("process.env.OPENAI_API_KEY"), "Server must read the OpenAI key from the environment.");
assert.ok(server.includes('type: "web_search"'), "Live web search tool is not configured.");
assert.ok(server.includes("trip_enquiries"), "PostgreSQL enquiry persistence is missing.");\nassert.ok(server.includes("/api/payments/webhook"), "Razorpay captured-payment webhook endpoint is missing.");
assert.ok(!app.includes("process.env.OPENAI_API_KEY") && !/sk-[A-Za-z0-9_-]{20,}/.test(app), "Never expose an API key in browser JavaScript.");
assert.ok(html.includes("Package prices are illustrative"), "Package estimate disclaimer is missing.");
assert.ok(html.includes('name="preferredContact"'), "Traveller contact preference is missing.");
assert.ok(html.includes('name="phoneCountryCode"'), "Traveller phone country code is missing.");
assert.ok(app.includes("updatePreferredContact"), "Dynamic contact validation is missing.");
assert.ok(server.includes("preferred_contact"), "Server does not store traveller contact preference.");
assert.ok(server.includes('startsWith("rzp_test_")'), "Live Razorpay keys must be rejected by this prototype.");
assert.ok(server.includes("timingSafeEqual"), "Payment signature must be compared safely.");
assert.ok(server.includes('payment.status !== "captured"'), "A booking must not be confirmed for an uncaptured payment.");
assert.ok(server.includes("createBookingFromPayment"), "Verified payment must create a booking record.");
assert.ok(app.includes("data-cart-add"), "Tour packages do not expose Add to cart controls.");
assert.ok(app.includes("function renderCart"), "Cart renderer is missing.");
assert.ok(app.includes("signInWithOtp"), "Passwordless Supabase profile sign-in is missing.");
assert.ok(app.includes("travel_logs"), "Personal travel log is not connected.");
assert.ok(html.includes("test mode"), "Checkout must disclose test-only payment mode.");
assert.ok(html.includes("profileOpen") && html.includes("cartOpen"), "Profile and cart must be visible in the navigation.");
const schema = read("supabase/schema.sql");
assert.ok(schema.includes("enable row level security"), "Supabase tables must use Row Level Security.");
assert.ok(schema.includes("auth.uid()"), "Profile/travel-log policies must scope data to the signed-in user.");
assert.ok(schema.includes("auth.jwt()"), "Booking history must be scoped to the authenticated email.");
assert.ok(html.includes("Search destinations, trips"), "Persistent navigation search is missing.");
assert.ok(html.includes("How do I build a trip?"), "Website guide quick prompts are missing.");
assert.ok(app.includes("function pageSearchHelp"), "Navigation search does not explain website features.");
assert.ok(app.includes("function localAnswer"), "Local website guide fallback is missing.");
assert.ok(server.includes("interactive website guide for Explore Bharat"), "AI system prompt is not focused on explaining the website.");
console.log("Explore Bharat smoke checks passed.");
