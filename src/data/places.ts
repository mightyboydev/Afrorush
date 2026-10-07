// src/data/places.ts — AfroRush Nigerian places catalog.
// 4 states (Kaduna, Abuja, Lagos, Port Harcourt) with their real cities,
// streets, junctions, joints, schools, markets, hospitals, landmarks.
// Grouped by category so the Map screen can filter by type.
//
// All names are real Nigerian places. Inspired by phlifestyle's place
// catalog but with completely original AfroRush data + Kaduna "Harmattan Sun"
// color theming per state.

export type StateId = "kaduna" | "abuja" | "lagos" | "rivers";

export type PlaceCategory =
  | "work"        // bank, office, hospital, pharmacy
  | "social"      // restaurant, club, hotel, mall
  | "justice"    // court, police, prison, efcc
  | "recreation" // park, beach, stadium, museum, cruise
  | "market"     // open-air market, motor park junction
  | "campus"     // university, polytechnic, college
  | "religious"  // church, mosque, cathedral
  | "transport"  // airport, train station, bus terminal
  | "landmark";  // iconic bridge, rock, monument

export interface StateInfo {
  id: StateId;
  name: string;
  capital: string;
  accent: string;       // brand accent color for this state
  emoji: string;
  tagline: string;       // short vibe description
}

export interface Place {
  id: string;
  name: string;
  state: StateId;
  category: PlaceCategory;
  emoji: string;
  desc: string;          // one-line description
  color?: string;        // optional per-state color override
}

// ============================================================
// 4 STATES
// ============================================================

export const STATES: StateInfo[] = [
  {
    id: "kaduna",
    name: "Kaduna",
    capital: "Kaduna",
    accent: "#7c3aed",     // indigo (Hausa textile)
    emoji: "🏛️",
    tagline: "Crocodile City · Hausa-Fulani north",
  },
  {
    id: "abuja",
    name: "Abuja",
    capital: "Abuja",
    accent: "#0d7c4a",     // emerald (capital green)
    emoji: "🇳🇬",
    tagline: "Federal Capital · Aso Rock · power",
  },
  {
    id: "lagos",
    name: "Lagos",
    capital: "Ikeja",
    accent: "#c87f3f",     // terracotta (Centre of Excellence warm)
    emoji: "🌊",
    tagline: "Centre of Excellence · Eko · loud",
  },
  {
    id: "rivers",
    name: "Port Harcourt",
    capital: "Port Harcourt",
    accent: "#d4a017",     // gold (oil city)
    emoji: "🛢️",
    tagline: "Garden City · oil capital · creeks",
  },
];

// Helper to look up a state's info
export function getState(id: StateId): StateInfo | undefined {
  return STATES.find((s) => s.id === id);
}

// ============================================================
// PLACES — ~25 per state, ~100 total
// ============================================================

export const PLACES: Place[] = [
  // ============================================================
  // KADUNA STATE — Northern Nigeria (Hausa-Fulani)
  // ============================================================

  // Streets & Junctions
  { id: "kdn-ahmadu-bello-way", name: "Ahmadu Bello Way", state: "kaduna", category: "market", emoji: "🛣️", desc: "Main drag · banks, suya spots, hustle" },
  { id: "kdn-kawo-junction", name: "Kawo Junction", state: "kaduna", category: "transport", emoji: "🚐", desc: "Biggest motor park in the north" },
  { id: "kdn-sabon-gari", name: "Sabon Gari Market", state: "kaduna", category: "market", emoji: "🧺", desc: "Southerners' market · foodstuff + provisions" },
  { id: "kdn-tudun-wada", name: "Tudun Wada", state: "kaduna", category: "market", emoji: "🏪", desc: "Dense residential + street trading" },
  { id: "kdn-rigasa-station", name: "Rigasa Train Station", state: "kaduna", category: "transport", emoji: "🚂", desc: "Trans-Saharan rail terminal" },

  // Schools
  { id: "kdn-abu-zaria", name: "ABU Zaria", state: "kaduna", category: "campus", emoji: "🎓", desc: "Ahmadu Bello University · Samaru campus" },
  { id: "kdn-kasu", name: "KASU", state: "kaduna", category: "campus", emoji: "🎓", desc: "Kaduna State University · Kafanchan" },
  { id: "kdn-nda", name: "NDA Kaduna", state: "kaduna", category: "campus", emoji: "🎖️", desc: "Nigerian Defence Academy · cadet training" },
  { id: "kdn-kadpoly", name: "Kaduna Polytechnic", state: "kaduna", category: "campus", emoji: "🎓", desc: "Oldest federal poly in the north" },
  { id: "kdn-fgc-kaduna", name: "FGC Kaduna", state: "kaduna", category: "campus", emoji: "🏫", desc: "Federal Government College · unity school" },

  // Recreation & Landmarks
  { id: "kdn-murtala-square", name: "Murtala Square", state: "kaduna", category: "recreation", emoji: "🏟️", desc: "Sports + recreation ground · matchday" },
  { id: "kdn-kaduna-river", name: "River Kaduna", state: "kaduna", category: "landmark", emoji: "🐊", desc: "Crocodile-infested · bridge views" },
  { id: "kdn-lugard-hall", name: "Lugard Hall", state: "kaduna", category: "landmark", emoji: "🏛️", desc: "Colonial-era parliament building" },
  { id: "kdn-kaduna-museum", name: "Kaduna Museum", state: "kaduna", category: "recreation", emoji: "🏺", desc: "Nok terracotta + northern artifacts" },
  { id: "kdn-matsirga-falls", name: "Matsirga Falls", state: "kaduna", category: "recreation", emoji: "💦", desc: "Kafanchan · 30m waterfall + picnic" },
  { id: "kdn-nok-village", name: "Nok Village", state: "kaduna", category: "landmark", emoji: "🗿", desc: "Birthplace of Nok culture (1000 BC)" },

  // Joints / Hotels / Malls
  { id: "kdn-hamdala", name: "Hamdala Hotel", state: "kaduna", category: "social", emoji: "🏨", desc: "Legendary hotel · Ahmadu Bello Way" },
  { id: "kdn-mega-mall", name: "Kaduna Mega Mall", state: "kaduna", category: "social", emoji: "🏬", desc: "ShopRite + cinema · biggest in north" },
  { id: "kdn-sahad", name: "Sahad Stores", state: "kaduna", category: "social", emoji: "🛍️", desc: "Northern premium supermarket chain" },

  // Religion
  { id: "kdn-sultan-bello-mosque", name: "Sultan Bello Mosque", state: "kaduna", category: "religious", emoji: "🕌", desc: "Grand central mosque · Hausa architecture" },
  { id: "kdn-st-josephs", name: "St. Joseph's Cathedral", state: "kaduna", category: "religious", emoji: "⛪", desc: "Catholic HQ · Hausa Christian mass" },

  // Justice / Work
  { id: "kdn-high-court", name: "Kaduna High Court", state: "kaduna", category: "justice", emoji: "⚖️", desc: "State judiciary complex" },
  { id: "kdn-prison", name: "Kaduna Prison", state: "kaduna", category: "justice", emoji: "🔒", desc: "Federal prison · Nigeria Correctional" },
  { id: "kdn-barau-dikko", name: "Barau Dikko Hospital", state: "kaduna", category: "work", emoji: "🏥", desc: "State teaching hospital" },
  { id: "kdn-44-military-hospital", name: "44 Military Hospital", state: "kaduna", category: "work", emoji: "🏥", desc: "Nigerian Army medical corps" },

  // ============================================================
  // ABUJA (FCT) — Federal Capital Territory
  // ============================================================

  // Districts & Streets
  { id: "abj-maitama", name: "Maitama District", state: "abuja", category: "market", emoji: "💼", desc: "Embassies · premium real estate" },
  { id: "abj-wuse-2", name: "Wuse 2", state: "abuja", category: "social", emoji: "🏬", desc: "Aminu Kano Crescent · restaurants + bars" },
  { id: "abj-asokoro", name: "Asokoro", state: "abuja", category: "landmark", emoji: "🏛️", desc: "Presidential Villa · Aso Rock view" },
  { id: "abj-garki", name: "Garki Modern Market", state: "abuja", category: "market", emoji: "🧺", desc: "Old district · main market + council" },
  { id: "abj-gwarinpa", name: "Gwarinpa Estate", state: "abuja", category: "market", emoji: "🏘️", desc: "Largest housing estate in West Africa" },
  { id: "abj-jabi", name: "Jabi District", state: "abuja", category: "recreation", emoji: "🌊", desc: "Lake + mall + youth hangout" },

  // Schools
  { id: "abj-uniabuja", name: "University of Abuja", state: "abuja", category: "campus", emoji: "🎓", desc: "Main campus · Gwagwalada + mini campus" },
  { id: "abj-nile-univ", name: "Nile University", state: "abuja", category: "campus", emoji: "🎓", desc: "Private · Turkish-Nigerian" },
  { id: "abj-baze", name: "Baze University", state: "abuja", category: "campus", emoji: "🎓", desc: "Private · Jabi campus" },
  { id: "abj-loyola", name: "Loyola Jesuit", state: "abuja", category: "campus", emoji: "🏫", desc: "Top secondary school · Karu" },
  { id: "abj-ais", name: "American International School", state: "abuja", category: "campus", emoji: "🏫", desc: "Diplomatic kids' school · Wuse II" },

  // Recreation & Landmarks
  { id: "abj-millennium-park", name: "Millennium Park", state: "abuja", category: "recreation", emoji: "🌳", desc: "Largest green space in the capital" },
  { id: "abj-jabi-lake", name: "Jabi Lake Park", state: "abuja", category: "recreation", emoji: "🚤", desc: "Boating + picnic · sunset chill" },
  { id: "abj-aso-rock", name: "Aso Rock", state: "abuja", category: "landmark", emoji: "⛰️", desc: "400m granite monolith · presidential" },
  { id: "abj-zuma-rock", name: "Zuma Rock", state: "abuja", category: "landmark", emoji: "🏔️", desc: "'Gateway to Abuja' · 725m monolith" },
  { id: "abj-gurara-falls", name: "Gurara Falls", state: "abuja", category: "recreation", emoji: "💦", desc: "50km from city · weekend picnic" },
  { id: "abj-magicland", name: "Magicland Amusement Park", state: "abuja", category: "recreation", emoji: "🎢", desc: "Ferris wheel + rollercoaster · Area 1" },

  // Joints / Hotels / Malls
  { id: "abj-jabi-mall", name: "Jabi Lake Mall", state: "abuja", category: "social", emoji: "🏬", desc: "ShopRite + cinema + lake view" },
  { id: "abj-ceddi", name: "Ceddi Plaza", state: "abuja", category: "social", emoji: "🏢", desc: "Central business district · CBD plaza" },
  { id: "abj-transcorp", name: "Transcorp Hilton", state: "abuja", category: "social", emoji: "🏨", desc: "5-star · Maitama · diplomats" },
  { id: "abj-sheraton", name: "Sheraton Abuja", state: "abuja", category: "social", emoji: "🏨", desc: "Ladi Kwali Way · business hotel" },
  { id: "abj-wuse-market", name: "Wuse Market", state: "abuja", category: "market", emoji: "🧺", desc: "Most famous market in the capital" },

  // Religion
  { id: "abj-national-mosque", name: "National Mosque", state: "abuja", category: "religious", emoji: "🕌", desc: "Independence Avenue · gold dome" },
  { id: "abj-national-christian", name: "National Christian Centre", state: "abuja", category: "religious", emoji: "⛪", desc: "Ecumenical Centre · Anglican-style" },

  // Justice / Work
  { id: "abj-supreme-court", name: "Supreme Court", state: "abuja", category: "justice", emoji: "⚖️", desc: "Three Arms Zone · apex judiciary" },
  { id: "abj-efcc-hq", name: "EFCC HQ", state: "abuja", category: "justice", emoji: "🚔", desc: "Economic Financial Crimes Commission" },
  { id: "abj-national-hospital", name: "National Hospital", state: "abuja", category: "work", emoji: "🏥", desc: "Federal teaching hospital · Garki" },
  { id: "abj-cbn-hq", name: "Central Bank HQ", state: "abuja", category: "work", emoji: "🏦", desc: "CBN · monetary authority" },

  // Transport
  { id: "abj-airport", name: "Nnamdi Azikiwe Airport", state: "abuja", category: "transport", emoji: "✈️", desc: "International · Abuja → Lagos daily" },
  { id: "abj-brt-station", name: "Abuja Metro Station", state: "abuja", category: "transport", emoji: "🚇", desc: "BRT light rail · Central → Airport" },

  // Landmarks
  { id: "abj-national-assembly", name: "National Assembly", state: "abuja", category: "landmark", emoji: "🏛️", desc: "Three Arms Zone · Senate + Reps" },
  { id: "abj-aso-villa", name: "Aso Villa", state: "abuja", category: "landmark", emoji: "🇳🇬", desc: "Presidential Villa · seat of power" },

  // ============================================================
  // LAGOS STATE — South-West, commercial capital
  // ============================================================

  // Districts & Streets
  { id: "lag-vi", name: "Victoria Island", state: "lagos", category: "social", emoji: "🏝️", desc: "V/I · corporate HQ + nightlife" },
  { id: "lag-lekki", name: "Lekki Phase 1", state: "lagos", category: "social", emoji: "🏖️", desc: "Affluent suburb · beach + malls" },
  { id: "lag-ikoyi", name: "Ikoyi", state: "lagos", category: "social", emoji: "💼", desc: "Old money · embassies + clubs" },
  { id: "lag-ikeja", name: "Ikeja", state: "lagos", category: "market", emoji: "🏙️", desc: "State capital · Computer Village" },
  { id: "lag-yaba", name: "Yaba", state: "lagos", category: "campus", emoji: "💻", desc: "Tech hub · UNILAG + Yabatech" },
  { id: "lag-surulere", name: "Surulere", state: "lagos", category: "recreation", emoji: "🏟️", desc: "National Stadium · matchday" },
  { id: "lag-festac", name: "Festac Town", state: "lagos", category: "market", emoji: "🏘️", desc: "Festival estate · 1977 FESTAC" },
  { id: "lag-ikorodu", name: "Ikorodu Road", state: "lagos", category: "transport", emoji: "🛣️", desc: "Main artery · go-slow + danfo" },

  // Schools
  { id: "lag-unilag", name: "UNILAG", state: "lagos", category: "campus", emoji: "🎓", desc: "University of Lagos · Akoka" },
  { id: "lag-lasu", name: "LASU", state: "lagos", category: "campus", emoji: "🎓", desc: "Lagos State University · Ojo" },
  { id: "lag-yabatech", name: "YabaTech", state: "lagos", category: "campus", emoji: "🎓", desc: "Yaba College of Tech · oldest poly" },
  { id: "lag-pan-atlantic", name: "Pan-Atlantic University", state: "lagos", category: "campus", emoji: "🎓", desc: "LBS · private · Ibeju-Lekki" },
  { id: "lag-kings-college", name: "King's College Lagos", state: "lagos", category: "campus", emoji: "🏫", desc: "Elite secondary · Lagos Island" },

  // Markets
  { id: "lag-balogun", name: "Balogun Market", state: "lagos", category: "market", emoji: "🧺", desc: "Lagos Island · biggest textile market" },
  { id: "lag-computer-village", name: "Computer Village", state: "lagos", category: "market", emoji: "📱", desc: "Ikeja · phones + repairs" },
  { id: "lag-alaba", name: "Alaba International Market", state: "lagos", category: "market", emoji: "📺", desc: "Ojo · electronics wholesale" },
  { id: "lag-mile12", name: "Mile 12 Market", state: "lagos", category: "market", emoji: "🥬", desc: "Ikorodu Road · foodstuff" },
  { id: "lag-oshodi", name: "Oshodi Market", state: "lagos", category: "market", emoji: "🧺", desc: "Biggest open-air market in Lagos" },
  { id: "lag-ladipo", name: "Ladipo Market", state: "lagos", category: "market", emoji: "🔧", desc: "Spare parts · Mushin auto" },

  // Recreation & Landmarks
  { id: "lag-national-stadium", name: "National Stadium", state: "lagos", category: "recreation", emoji: "🏟️", desc: "Surulere · 55k capacity" },
  { id: "lag-tarkwa-bay", name: "Tarkwa Bay Beach", state: "lagos", category: "recreation", emoji: "🏖️", desc: "Boat-only access · pristine beach" },
  { id: "lag-elegushi-beach", name: "Elegushi Beach", state: "lagos", category: "recreation", emoji: "🏖️", desc: "Lekki · owambe + carnival" },
  { id: "lag-lekki-conservation", name: "Lekki Conservation Centre", state: "lagos", category: "recreation", emoji: "🦒", desc: "Canopy walk · longest in Africa" },
  { id: "lag-nike-art", name: "Nike Art Gallery", state: "lagos", category: "recreation", emoji: "🎨", desc: "Lekki · 5 floors of Nigerian art" },
  { id: "lag-national-theatre", name: "National Theatre", state: "lagos", category: "landmark", emoji: "🎭", desc: "Iganmu · 1976 FESTAC icon" },
  { id: "lag-third-mainland", name: "Third Mainland Bridge", state: "lagos", category: "landmark", emoji: "🌉", desc: "Longest bridge in Africa · 11.8km" },
  { id: "lag-lekki-bridge", name: "Lekki-Ikoyi Link Bridge", state: "lagos", category: "landmark", emoji: "🌉", desc: "Cable-stayed · toll crossing" },

  // Joints / Hotels / Malls
  { id: "lag-quilox", name: "Quilox Nightclub", state: "lagos", category: "social", emoji: "🪩", desc: "GRA · Lagos hottest nightclub" },
  { id: "lag-eko-hotels", name: "Eko Hotels & Suites", state: "lagos", category: "social", emoji: "🏨", desc: "V/I · 5-star + beach view" },
  { id: "lag-terra-kulture", name: "Terra Kulture", state: "lagos", category: "social", emoji: "🎭", desc: "V/I · Nigerian theatre + food" },
  { id: "lag-the-palms", name: "The Palms Lekki", state: "lagos", category: "social", emoji: "🏬", desc: "First modern mall in Lagos" },
  { id: "lag-federal-palace", name: "Federal Palace Hotel", state: "lagos", category: "social", emoji: "🏨", desc: "V/I · casino + cross-Atlantic view" },

  // Religion
  { id: "lag-holy-cross", name: "Holy Cross Cathedral", state: "lagos", category: "religious", emoji: "⛪", desc: "Catholic HQ · Lagos Island" },
  { id: "lag-central-mosque", name: "Lagos Central Mosque", state: "lagos", category: "religious", emoji: "🕌", desc: "Idumota · oldest grand mosque" },
  { id: "lag-rccg-hq", name: "RCCG HQ", state: "lagos", category: "religious", emoji: "⛪", desc: "Redeemed Christian Church · Redemption Camp" },

  // Justice / Work
  { id: "lag-high-court", name: "Lagos High Court", state: "lagos", category: "justice", emoji: "⚖️", desc: "Igbosere · oldest judiciary in Nigeria" },
  { id: "lag-ikoyi-prison", name: "Ikoyi Prison", state: "lagos", category: "justice", emoji: "🔒", desc: "Federal · maximum security" },
  { id: "lag-panti-scid", name: "Panti SCID", state: "lagos", category: "justice", emoji: "🚔", desc: "Yaba · State Criminal Investigation Dept" },
  { id: "lag-luth", name: "LUTH", state: "lagos", category: "work", emoji: "🏥", desc: "Lagos University Teaching Hospital · Idi-Araba" },
  { id: "lag-reddington", name: "Reddington Hospital", state: "lagos", category: "work", emoji: "🏥", desc: "V/I · private · 24/7 emergency" },

  // Transport
  { id: "lag-airport", name: "Murtala Muhammed Airport", state: "lagos", category: "transport", emoji: "✈️", desc: "Ikeja · international + domestic" },
  { id: "lag-apapa-port", name: "Apapa Port", state: "lagos", category: "transport", emoji: "🚢", desc: "Largest seaport in Nigeria" },
  { id: "lag-oshodi-brt", name: "Oshodi BRT Terminal", state: "lagos", category: "transport", emoji: "🚍", desc: "Largest BRT hub in West Africa" },

  // ============================================================
  // PORT HARCOURT (Rivers State) — South-South, oil capital
  // ============================================================

  // Districts & Streets
  { id: "ph-aba-road", name: "Aba Road", state: "rivers", category: "transport", emoji: "🛣️", desc: "Main artery · mile 1 to Eleme junction" },
  { id: "ph-gra", name: "GRA Phase 2", state: "rivers", category: "social", emoji: "💼", desc: "Government Reserved Area · expats + diplomats" },
  { id: "ph-trans-amadi", name: "Trans-Amadi Industrial Layout", state: "rivers", category: "work", emoji: "🏭", desc: "Oil servicing yards + container offices" },
  { id: "ph-d-line", name: "D-Line", state: "rivers", category: "market", emoji: "🏪", desc: "Residential + commercial · Ikwerre Road" },
  { id: "ph-rumuokoro", name: "Rumuokoro Junction", state: "rivers", category: "transport", emoji: "🚐", desc: "Biggest motor park in PH" },
  { id: "ph-garrison", name: "Garrison Junction", state: "rivers", category: "transport", emoji: "🛣️", desc: "Rebisi flyover · bus stop + akara" },
  { id: "ph-eliozu", name: "Eliozu Roundabout", state: "rivers", category: "transport", emoji: "🔄", desc: "East-West × G.U. Ake Road" },
  { id: "ph-choba", name: "Choba Junction", state: "rivers", category: "campus", emoji: "🎓", desc: "UNIPORT main gate · student junction" },

  // Schools
  { id: "ph-uniport", name: "UNIPORT", state: "rivers", category: "campus", emoji: "🎓", desc: "University of Port Harcourt · Choba" },
  { id: "ph-rsu", name: "RSU", state: "rivers", category: "campus", emoji: "🎓", desc: "Rivers State University · Nkpolu" },
  { id: "ph-iaue", name: "Ignatius Ajuru University", state: "rivers", category: "campus", emoji: "🎓", desc: "Education · Rumuolumeni" },
  { id: "ph-ken-saro-wiwa", name: "Ken Saro-Wiwa Polytechnic", state: "rivers", category: "campus", emoji: "🎓", desc: "Bori · Ogoni · renamed in honour" },

  // Markets
  { id: "ph-mile1", name: "Mile 1 Market", state: "rivers", category: "market", emoji: "🧺", desc: "Diobu · zinc-roofed stall rows" },
  { id: "ph-mile3", name: "Mile 3 Market", state: "rivers", category: "market", emoji: "🧺", desc: "Ikwerre Road · big motor park" },
  { id: "ph-oilmill", name: "Oil Mill Market", state: "rivers", category: "market", emoji: "🛢️", desc: "Eleme Junction · Wednesday wholesale" },
  { id: "ph-waterfront", name: "Creek Road Fish Market", state: "rivers", category: "market", emoji: "🐟", desc: "Seafood · periwinkle · canoes" },

  // Recreation & Landmarks
  { id: "ph-pleasure-park", name: "Pleasure Park", state: "rivers", category: "recreation", emoji: "🌳", desc: "Aba Road · boating lake + suya" },
  { id: "ph-boro-park", name: "Isaac Boro Park", state: "rivers", category: "recreation", emoji: "🗿", desc: "Monument · soldier statues" },
  { id: "ph-stadium", name: "Yakubu Gowon Stadium", state: "rivers", category: "recreation", emoji: "🏟️", desc: "Elekahia · 30k capacity" },
  { id: "ph-beach", name: "PH Tourist Beach", state: "rivers", category: "recreation", emoji: "🏖️", desc: "Sand · bush bars · canoe rides" },
  { id: "ph-cruise", name: "Riverbreeze Cruise", state: "rivers", category: "recreation", emoji: "⛵", desc: "Marine Base · Bonny River boat" },
  { id: "ph-rebisi-flyover", name: "Rebisi Flyover", state: "rivers", category: "landmark", emoji: "🌉", desc: "Julius Berger · Garrison junction" },
  { id: "ph-bonny-island", name: "Bonny Island", state: "rivers", category: "landmark", emoji: "🏝️", desc: "NLNG · Atlantic · export terminal" },

  // Joints / Hotels / Malls
  { id: "ph-hotel-presidential", name: "Hotel Presidential", state: "rivers", category: "social", emoji: "🏨", desc: "5-star · Mosogar · conference" },
  { id: "ph-novotel", name: "Novotel Port Harcourt", state: "rivers", category: "social", emoji: "🏨", desc: "GRA · business hotel" },
  { id: "ph-promenade-mall", name: "Promenade Mall", state: "rivers", category: "social", emoji: "🏬", desc: "GRA · cinema + shops" },
  { id: "ph-jevinik", name: "Jevinik Restaurant", state: "rivers", category: "social", emoji: "🍲", desc: "Trans-Amadi · native soup + swallow" },
  { id: "ph-onyx", name: "Onyx Restaurant", state: "rivers", category: "social", emoji: "🍽️", desc: "GRA · fine dining + lounge" },

  // Religion
  { id: "ph-cathedral", name: "Catholic Cathedral PH", state: "rivers", category: "religious", emoji: "⛪", desc: "Holy Trinity · D-Line" },
  { id: "ph-central-mosque", name: "PH Central Mosque", state: "rivers", category: "religious", emoji: "🕌", desc: "Moscow Road · grand mosque" },

  // Justice / Work
  { id: "ph-high-court", name: "Rivers State High Court", state: "rivers", category: "justice", emoji: "⚖️", desc: "Moscow Road · state judiciary" },
  { id: "ph-borokiri-prison", name: "Borokiri Prison", state: "rivers", category: "justice", emoji: "🔒", desc: "Federal · maximum security" },
  { id: "ph-upth", name: "UPTH", state: "rivers", category: "work", emoji: "🏥", desc: "University of PH Teaching Hospital" },
  { id: "ph-braithwaite", name: "Braithwaite Memorial", state: "rivers", category: "work", emoji: "🏥", desc: "State teaching hospital · Moscow Road" },
  { id: "ph-refinery", name: "PH Refinery (Alesa)", state: "rivers", category: "work", emoji: "🛢️", desc: "Eleme · NNPC · 210k bpd capacity" },

  // Transport
  { id: "ph-airport", name: "PH International Airport", state: "rivers", category: "transport", emoji: "✈️", desc: "Omagwa · 35km from city" },
  { id: "ph-waterlines-park", name: "Waterlines Interstate Park", state: "rivers", category: "transport", emoji: "🚐", desc: "Aba Road bridge · interstate motor parks" },
];

// ============================================================
// Helpers
// ============================================================

/** Get all places in a given state */
export function getPlacesByState(stateId: StateId): Place[] {
  return PLACES.filter((p) => p.state === stateId);
}

/** Get all places in a state + category */
export function getPlaces(stateId: StateId, category?: PlaceCategory): Place[] {
  return PLACES.filter((p) => p.state === stateId && (!category || p.category === category));
}

/** Get all distinct categories that have at least 1 place in the state */
export function getCategoriesForState(stateId: StateId): PlaceCategory[] {
  const cats = new Set<PlaceCategory>();
  for (const p of PLACES) if (p.state === stateId) cats.add(p.category);
  return Array.from(cats);
}

/** Find a place by id */
export function findPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

// ============================================================
// Category metadata (for filter UI)
// ============================================================

export const CATEGORY_META: Record<PlaceCategory, { label: string; emoji: string; color: string }> = {
  work:        { label: "Work",        emoji: "💼", color: "var(--ar-indigo)" },
  social:      { label: "Social",      emoji: "🎉", color: "var(--ar-rose)" },
  justice:     { label: "Justice",     emoji: "⚖️", color: "var(--ar-ink)" },
  recreation:  { label: "Recreation",  emoji: "🌳", color: "var(--ar-emerald)" },
  market:      { label: "Market",      emoji: "🧺", color: "var(--ar-terracotta)" },
  campus:      { label: "Campus",      emoji: "🎓", color: "var(--ar-gold)" },
  religious:   { label: "Religious",   emoji: "🕌", color: "var(--ar-emerald-deep)" },
  transport:   { label: "Transport",    emoji: "🚐", color: "var(--ar-indigo-deep)" },
  landmark:    { label: "Landmark",    emoji: "🌉", color: "var(--ar-terracotta-deep)" },
};
