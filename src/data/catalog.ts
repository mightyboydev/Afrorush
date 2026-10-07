// src/data/catalog.ts — Game data catalog.
// Extracted from storage.ts + PhoneScreen.tsx for leaner imports.
// No logic changes — just moved data to one place.

import { BIKE_CATALOG, OUTFIT_CATALOG, type CatalogItem } from "@/lib/storage";

export const JOBS = [
  { id: "suya-seller", title: "Suya Seller", pay: 300, time: "3 min", desc: "Sell suya at the junction", stamina: 10, hunger: 8 },
  { id: "okada-rider", title: "Okada Rider", pay: 500, time: "5 min", desc: "Carry passengers across the city", stamina: 15, hunger: 12 },
  { id: "phone-repair", title: "Phone Repairer", pay: 1000, time: "8 min", desc: "Fix screens and chargers", stamina: 12, hunger: 10 },
  { id: "delivery", title: "Delivery Boy", pay: 800, time: "10 min", desc: "Deliver packages on time", stamina: 20, hunger: 15 },
  { id: "danfo-driver", title: "Danfo Driver", pay: 1200, time: "15 min", desc: "Drive the yellow bus route", stamina: 25, hunger: 18 },
  { id: "event-promoter", title: "Event Promoter", pay: 2000, time: "20 min", desc: "Promote owambe parties", stamina: 30, hunger: 20 },
  { id: "agbero", title: "Agbero (Tout)", pay: 1500, time: "10 min", desc: "Collect danfo dues — risky but pays", stamina: 20, hunger: 15 },
  { id: "tech-hustler", title: "Tech Hustler", pay: 5000, time: "30 min", desc: "Remote dev work — clean money", stamina: 35, hunger: 8 },
];

export const FOOD = [
  { id: "gala-pure-water", name: "Gala + Pure Water", price: 50, stamina: 10, hunger: 15, desc: "Quick snack. Cheap fix." },
  { id: "suya-rice", name: "Suya + Rice", price: 200, stamina: 25, hunger: 30, desc: "Spicy suya with jollof." },
  { id: "amala-shitta", name: "Amala Shitta", price: 300, stamina: 40, hunger: 50, desc: "Smooth amala + ewedu. Big restoration!" },
  { id: "pounded-yam", name: "Pounded Yam + Egusi", price: 500, stamina: 60, hunger: 70, desc: "Heavyweight. Full restoration." },
  { id: "pepper-soup", name: "Pepper Soup (Catfish)", price: 800, stamina: 35, hunger: 30, desc: "Calms the soul + small cred boost." },
  { id: "small-chops", name: "Small Chops Platter", price: 1000, stamina: 20, hunger: 15, desc: "Party snacks — for the flex." },
];

export const DRINKS = [
  { id: "star", name: "Star Beer", price: 500, cred: 5 },
  { id: "hennessy", name: "Hennessy Shot", price: 2000, cred: 15 },
  { id: "champagne", name: "Moet Bottle", price: 15000, cred: 50 },
  { id: "hennessy-bottle", name: "Hennessy Bottle", price: 25000, cred: 70 },
  { id: "azul", name: "Azul Bottle", price: 40000, cred: 90 },
];

export const RIDES = [
  { id: "trek", name: "Trek", fare: 0, time: "Slow but free", risk: 0, staminaCost: 15 },
  { id: "danfo", name: "Danfo", fare: 100, time: "Cheap but agbero risk", risk: 0.30, staminaCost: 5 },
  { id: "keke", name: "Keke", fare: 150, time: "Quick hop, small risk", risk: 0.15, staminaCost: 5 },
  { id: "okada", name: "Okada", fare: 250, time: "Fastest in traffic", risk: 0.05, staminaCost: 8 },
  { id: "brt", name: "BRT Bus", fare: 350, time: "Safe + dedicated lane", risk: 0, staminaCost: 3 },
  { id: "cab", name: "Cab", fare: 500, time: "Comfortable + AC", risk: 0, staminaCost: 0 },
];

export const STICKERS = [
  { id: "odogwu", label: "Odogwu", caption: "Big man" },
  { id: "wahala", label: "Wahala", caption: "Problem" },
  { id: "echoke", label: "E Choke", caption: "E shock you" },
  { id: "nawa", label: "Nawa", caption: "Disappointing" },
  { id: "sharp", label: "Sharp Guy", caption: "Quick thinker" },
  { id: "owambe", label: "Owambe", caption: "Party time" },
  { id: "sapa", label: "Sapa", caption: "Broke" },
  { id: "soft", label: "Soft Life", caption: "Easy living" },
];

export const EVENTS = [
  { day: "Mon", title: "Business Summit", venue: "Hamdala Hotel", time: "6:00 PM", reward: "5,000 + rep", category: "work" },
  { day: "Wed", title: "Matchday", venue: "Murtala Square", time: "6:00 PM", reward: "2,500 if GCFC win", category: "recreation" },
  { day: "Fri", title: "Beach Party", venue: "Riverside Beach", time: "8:00 PM", reward: "+20 cred", category: "recreation" },
  { day: "Sat", title: "Owambe", venue: "Event Centre", time: "4:00 PM", reward: "Spray +vibes", category: "social" },
  { day: "Sun", title: "Beach Party II", venue: "Riverside Beach", time: "5:00 PM", reward: "+15 cred", category: "recreation" },
];

export { BIKE_CATALOG, OUTFIT_CATALOG, type CatalogItem };
