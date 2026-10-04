// ============================================================================
// RailDrishti - Pan-India Major Railway Station Image & Geolocation Registry
// Covers all Indian Railway Zones (NR, SR, WR, CR, ER, SWR, SCR, NCR, ECoR, etc.)
// ============================================================================

export interface PanIndiaStation {
  name: string;
  code: string;
  state: string;
  zone: string;
  latitude: number;
  longitude: number;
  image: string;
}

// Fallback high-resolution Indian Railway station architecture photograph
export const DEFAULT_RAILWAY_FALLBACK_IMAGE = "/images/stations/yelahanka.jpg";

export const PAN_INDIA_STATIONS: PanIndiaStation[] = [
  // ── SOUTH WESTERN RAILWAY (Karnataka & South) ───────────────────────────
  {
    name: "Yesvantpur Junction",
    code: "YPR",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.028,
    longitude: 77.5547,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Yesvantpur%20Junction%20railway%20station%20%28Sept%20%2723%29.jpg",
  },
  {
    name: "KSR Bengaluru Railway Station",
    code: "SBC",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9775,
    longitude: 77.5713,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/KSR%20Bengaluru%20Railway%20Station.jpg",
  },
  {
    name: "Sir M. Visvesvaraya Terminal Bengaluru",
    code: "SMVB",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9984,
    longitude: 77.6534,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sir%20M.%20Visvesvaraya%20Terminal%2C%20Bengaluru.jpg",
  },
  {
    name: "Mysuru Junction",
    code: "MYS",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.3168,
    longitude: 76.6493,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mysore_railway_station.jpg",
  },
  {
    name: "SSS Hubballi Junction",
    code: "UBL",
    state: "Karnataka",
    zone: "SWR",
    latitude: 15.3496,
    longitude: 75.1481,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hubballi_railway_station.jpg",
  },

  // ── NORTHERN RAILWAY (Delhi, UP, Punjab, Haryana, J&K) ───────────────────
  {
    name: "New Delhi Railway Station",
    code: "NDLS",
    state: "Delhi",
    zone: "NR",
    latitude: 28.6429,
    longitude: 77.2195,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/New_Delhi_Railway_Station_Front.jpg",
  },
  {
    name: "Hazrat Nizamuddin",
    code: "NZM",
    state: "Delhi",
    zone: "NR",
    latitude: 28.5888,
    longitude: 77.2536,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hazrat_Nizamuddin_Railway_Station_Front_View.jpg",
  },
  {
    name: "Anand Vihar Terminal",
    code: "ANVT",
    state: "Delhi",
    zone: "NR",
    latitude: 28.6508,
    longitude: 77.3152,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Anand_Vihar_Railway_Terminal.jpg",
  },
  {
    name: "Lucknow Charbagh",
    code: "LKO",
    state: "Uttar Pradesh",
    zone: "NR",
    latitude: 26.8315,
    longitude: 80.9195,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Charbagh_Railway_Station_Lucknow.jpg",
  },
  {
    name: "Varanasi Junction",
    code: "BSB",
    state: "Uttar Pradesh",
    zone: "NR",
    latitude: 25.3284,
    longitude: 82.9868,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Varanasi_Junction_railway_station_front.jpg",
  },
  {
    name: "Kanpur Central",
    code: "CNB",
    state: "Uttar Pradesh",
    zone: "NCR",
    latitude: 26.4542,
    longitude: 80.3503,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kanpur_Central_railway_station.jpg",
  },
  {
    name: "Prayagraj Junction",
    code: "PRYJ",
    state: "Uttar Pradesh",
    zone: "NCR",
    latitude: 25.4484,
    longitude: 81.8285,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Allahabad_Junction_railway_station_building.jpg",
  },
  {
    name: "Chandigarh Junction",
    code: "CDG",
    state: "Chandigarh",
    zone: "NR",
    latitude: 30.7025,
    longitude: 76.8242,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Chandigarh_railway_station.jpg",
  },
  {
    name: "Amritsar Junction",
    code: "ASR",
    state: "Punjab",
    zone: "NR",
    latitude: 31.634,
    longitude: 74.8656,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Amritsar_railway_station.jpg",
  },
  {
    name: "Jammu Tawi",
    code: "JAT",
    state: "Jammu and Kashmir",
    zone: "NR",
    latitude: 32.706,
    longitude: 74.8801,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Jammu_Tawi_railway_station.jpg",
  },

  // ── WESTERN & CENTRAL RAILWAY (Maharashtra, Gujarat, Rajasthan) ──────────
  {
    name: "Chhatrapati Shivaji Maharaj Terminus",
    code: "CSMT",
    state: "Maharashtra",
    zone: "CR",
    latitude: 18.9402,
    longitude: 72.8357,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Chhatrapati_Shivaji_Terminus_%28CST%29%2C_Mumbai.jpg",
  },
  {
    name: "Mumbai Central",
    code: "MMCT",
    state: "Maharashtra",
    zone: "WR",
    latitude: 18.9696,
    longitude: 72.8193,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mumbai_Central_railway_station.jpg",
  },
  {
    name: "Pune Junction",
    code: "PUNE",
    state: "Maharashtra",
    zone: "CR",
    latitude: 18.5289,
    longitude: 73.8744,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Pune_Junction_railway_station.jpg",
  },
  {
    name: "Nagpur Junction",
    code: "NGP",
    state: "Maharashtra",
    zone: "CR",
    latitude: 21.1524,
    longitude: 79.0888,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nagpur_Railway_Station_Exterior.jpg",
  },
  {
    name: "Ahmedabad Junction",
    code: "ADI",
    state: "Gujarat",
    zone: "WR",
    latitude: 23.0232,
    longitude: 72.6006,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ahmedabad_Junction_railway_station.jpg",
  },
  {
    name: "Surat Railway Station",
    code: "ST",
    state: "Gujarat",
    zone: "WR",
    latitude: 21.2052,
    longitude: 72.8407,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Surat_railway_station_building.jpg",
  },
  {
    name: "Jaipur Junction",
    code: "JP",
    state: "Rajasthan",
    zone: "NWR",
    latitude: 26.92,
    longitude: 75.7878,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Jaipur_Junction_Railway_Station_Front.jpg",
  },

  // ── EASTERN & EAST CENTRAL RAILWAY (West Bengal, Bihar, Odisha) ───────────
  {
    name: "Howrah Junction",
    code: "HWH",
    state: "West Bengal",
    zone: "ER",
    latitude: 22.5839,
    longitude: 88.3426,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Howrah_railway_station_facade.jpg",
  },
  {
    name: "Sealdah Railway Station",
    code: "SDAH",
    state: "West Bengal",
    zone: "ER",
    latitude: 22.5684,
    longitude: 88.3713,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sealdah_railway_station_building.jpg",
  },
  {
    name: "Patna Junction",
    code: "PNBE",
    state: "Bihar",
    zone: "ECR",
    latitude: 25.6022,
    longitude: 85.1376,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Patna_Junction_Railway_Station.jpg",
  },
  {
    name: "Bhubaneswar Railway Station",
    code: "BBS",
    state: "Odisha",
    zone: "ECoR",
    latitude: 20.2666,
    longitude: 85.8436,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bhubaneswar_railway_station.jpg",
  },
  {
    name: "Puri Railway Station",
    code: "PURI",
    state: "Odisha",
    zone: "ECoR",
    latitude: 19.8135,
    longitude: 85.8315,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Puri_railway_station.jpg",
  },
  {
    name: "Guwahati Railway Station",
    code: "GHY",
    state: "Assam",
    zone: "NFR",
    latitude: 26.1834,
    longitude: 91.7513,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Guwahati_railway_station_front.jpg",
  },

  // ── SOUTHERN & SOUTH CENTRAL RAILWAY (Tamil Nadu, Kerala, AP, Telangana) ──
  {
    name: "Puratchi Thalaivar Dr. M.G.R. Central (Chennai Central)",
    code: "MAS",
    state: "Tamil Nadu",
    zone: "SR",
    latitude: 13.0827,
    longitude: 80.2755,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Chennai_Central_station_facade.jpg",
  },
  {
    name: "Coimbatore Junction",
    code: "CBE",
    state: "Tamil Nadu",
    zone: "SR",
    latitude: 11.0016,
    longitude: 76.9666,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Coimbatore_Junction_railway_station.jpg",
  },
  {
    name: "Madurai Junction",
    code: "MDU",
    state: "Tamil Nadu",
    zone: "SR",
    latitude: 9.9195,
    longitude: 78.1105,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Madurai_Junction_railway_station.jpg",
  },
  {
    name: "Thiruvananthapuram Central",
    code: "TVC",
    state: "Kerala",
    zone: "SR",
    latitude: 8.4871,
    longitude: 76.9532,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Thiruvananthapuram_Central_railway_station.jpg",
  },
  {
    name: "Ernakulam Junction (Kochi)",
    code: "ERS",
    state: "Kerala",
    zone: "SR",
    latitude: 9.9678,
    longitude: 76.2913,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ernakulam_Junction_railway_station.jpg",
  },
  {
    name: "Secunderabad Junction",
    code: "SC",
    state: "Telangana",
    zone: "SCR",
    latitude: 17.4339,
    longitude: 78.5045,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Secunderabad_railway_station_building.jpg",
  },
  {
    name: "Hyderabad Deccan (Nampally)",
    code: "HYB",
    state: "Telangana",
    zone: "SCR",
    latitude: 17.392,
    longitude: 78.4682,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hyderabad_Deccan_railway_station.jpg",
  },
  {
    name: "Vijayawada Junction",
    code: "BZA",
    state: "Andhra Pradesh",
    zone: "SCR",
    latitude: 16.5175,
    longitude: 80.6201,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Vijayawada_Junction_railway_station.jpg",
  },
  {
    name: "Visakhapatnam Junction",
    code: "VSKP",
    state: "Andhra Pradesh",
    zone: "ECoR",
    latitude: 17.7214,
    longitude: 83.2872,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Visakhapatnam_railway_station.jpg",
  },

  // ── CENTRAL & WEST CENTRAL (Madhya Pradesh, Chhattisgarh, Goa) ───────────
  {
    name: "Bhopal Junction",
    code: "BPL",
    state: "Madhya Pradesh",
    zone: "WCR",
    latitude: 23.2662,
    longitude: 77.4116,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bhopal_Junction_railway_station.jpg",
  },
  {
    name: "Rani Kamlapati (Habibganj)",
    code: "RKMP",
    state: "Madhya Pradesh",
    zone: "WCR",
    latitude: 23.2064,
    longitude: 77.4372,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rani_Kamlapati_railway_station_front.jpg",
  },
  {
    name: "Madgaon Junction",
    code: "MAO",
    state: "Goa",
    zone: "KR",
    latitude: 15.2742,
    longitude: 73.9749,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Madgaon_railway_station.jpg",
  },
  // ── BENGALURU SUBURBAN & LOCAL RAILWAY STATIONS (Every station in Bengaluru) ──
  {
    name: "Malleswaram Railway Station",
    code: "MWM",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.0031,
    longitude: 77.5684,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Malleswaram_railway_station.jpg",
  },
  {
    name: "Bengaluru Cantt Railway Station",
    code: "BNC",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9934,
    longitude: 77.5983,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bengaluru_Cantt_railway_station.jpg",
  },
  {
    name: "Bengaluru East Railway Station",
    code: "BNCE",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.0016,
    longitude: 77.6186,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bangalore_East_Railway_Station.jpg",
  },
  {
    name: "Baiyyappanahalli Railway Station",
    code: "BYPL",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9922,
    longitude: 77.6521,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Baiyyappanahalli_railway_station.jpg",
  },
  {
    name: "Krishnarajapuram Railway Station",
    code: "KJM",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9984,
    longitude: 77.6873,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Krishnarajapuram_railway_station.jpg",
  },
  {
    name: "Hoodi Halt Railway Station",
    code: "HDIH",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9920,
    longitude: 77.7160,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hoodi_railway_station.jpg",
  },
  {
    name: "Whitefield Railway Station",
    code: "WFD",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9936,
    longitude: 77.7584,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Whitefield_railway_station.jpg",
  },
  {
    name: "Devangonthi Railway Station",
    code: "DKN",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9972,
    longitude: 77.8344,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Devangonthi_railway_station.jpg",
  },
  {
    name: "Malur Railway Station",
    code: "MLO",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.0039,
    longitude: 77.9406,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Malur_railway_station.jpg",
  },
  {
    name: "Bangarapet Junction",
    code: "BWT",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9981,
    longitude: 78.2013,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bangarapet_Junction.jpg",
  },
  {
    name: "Banaswadi Railway Station",
    code: "BAND",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.0125,
    longitude: 77.6433,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Banaswadi_railway_station.jpg",
  },
  {
    name: "Channasandra Railway Station",
    code: "CSDR",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.0456,
    longitude: 77.6582,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Channasandra_railway_station.jpg",
  },
  {
    name: "Yelahanka Junction",
    code: "YNK",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.1007,
    longitude: 77.5963,
    image: "/images/stations/yelahanka.jpg",
  },
  {
    name: "Kodigehalli Railway Station",
    code: "KDGH",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.0558,
    longitude: 77.5878,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kodigehalli_railway_station.jpg",
  },
  {
    name: "Lottegollahalli Railway Station",
    code: "LOGH",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.0422,
    longitude: 77.5678,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Lottegollahalli_railway_station.jpg",
  },
  {
    name: "Hebbal Railway Station",
    code: "HEB",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.0361,
    longitude: 77.5925,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hebbal_railway_station.jpg",
  },
  {
    name: "Bellandur Road Railway Station",
    code: "BLRR",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9234,
    longitude: 77.6830,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bellandur_Road_railway_station.jpg",
  },
  {
    name: "Carmelaram Railway Station",
    code: "CRLM",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9103,
    longitude: 77.7082,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Carmelaram_railway_station.jpg",
  },
  {
    name: "Heelalige Railway Station",
    code: "HLE",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.8252,
    longitude: 77.7289,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Heelalige_railway_station.jpg",
  },
  {
    name: "Anekal Road Railway Station",
    code: "AEK",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.7118,
    longitude: 77.6974,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Anekal_Road_railway_station.jpg",
  },
  {
    name: "Hosur Railway Station",
    code: "HSRA",
    state: "Tamil Nadu",
    zone: "SWR",
    latitude: 12.7281,
    longitude: 77.8284,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hosur_railway_station.jpg",
  },
  {
    name: "Nayandahalli Railway Station",
    code: "NYH",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9463,
    longitude: 77.5257,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nayandahalli_railway_station.jpg",
  },
  {
    name: "Jnana Bharati Halt",
    code: "GNB",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9351,
    longitude: 77.5089,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Jnana_Bharati_railway_station.jpg",
  },
  {
    name: "Kengeri Railway Station",
    code: "KGI",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.9127,
    longitude: 77.4819,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kengeri_railway_station.jpg",
  },
  {
    name: "Hejjala Railway Station",
    code: "HJL",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.8711,
    longitude: 77.4192,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hejjala_railway_station.jpg",
  },
  {
    name: "Bidadi Railway Station",
    code: "BID",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.8017,
    longitude: 77.3822,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bidadi_railway_station.jpg",
  },
  {
    name: "Ramanagaram Railway Station",
    code: "RMGM",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.7247,
    longitude: 77.2831,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ramanagaram_railway_station.jpg",
  },
  {
    name: "Channapatna Railway Station",
    code: "CPT",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.6514,
    longitude: 77.2036,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Channapatna_railway_station.jpg",
  },
  {
    name: "Maddur Railway Station",
    code: "MAD",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.5855,
    longitude: 77.0452,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Maddur_railway_station.jpg",
  },
  {
    name: "Mandya Railway Station",
    code: "MYA",
    state: "Karnataka",
    zone: "SWR",
    latitude: 12.5258,
    longitude: 76.8966,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mandya_railway_station.jpg",
  },
  {
    name: "Doddaballapur Railway Station",
    code: "DBU",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.2934,
    longitude: 77.5386,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Doddaballapur_railway_station.jpg",
  },
  {
    name: "Gauribidanur Railway Station",
    code: "GBD",
    state: "Karnataka",
    zone: "SWR",
    latitude: 13.6122,
    longitude: 77.5194,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Gauribidanur_railway_station.jpg",
  },
  {
    name: "Hindupur Railway Station",
    code: "HUP",
    state: "Andhra Pradesh",
    zone: "SWR",
    latitude: 13.8288,
    longitude: 77.4917,
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hindupur_railway_station.jpg",
  },
];

// In-memory master stations cache fetched from the complete Indian Railways database
let masterStationsCache: PanIndiaStation[] | null = null;
let fetchPromise: Promise<PanIndiaStation[]> | null = null;

// Calculate accurate Haversine surface distance in kilometers
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c; // Earth radius in km
}

// Helper to find closest station anywhere in India from coordinates
export function findNearestPanIndiaStation(lat: number, lon: number): PanIndiaStation {
  const stations = masterStationsCache && masterStationsCache.length > 0
    ? masterStationsCache
    : PAN_INDIA_STATIONS;

  let nearest = stations[0];
  let minDistance = Number.POSITIVE_INFINITY;

  for (const st of stations) {
    if (!st.latitude || !st.longitude) continue;
    const dist = calculateHaversineKm(lat, lon, st.latitude, st.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = st;
    }
  }

  return nearest;
}

// Asynchronously loads all stations from the backend database (5,000+ pan-India stations)
// and accurately finds the nearest railway station for any location in India
export async function resolveNearestStation(lat: number, lon: number): Promise<PanIndiaStation> {
  // 1. If we already have the complete pan-India database cached in memory
  if (masterStationsCache && masterStationsCache.length > 0) {
    return findNearestPanIndiaStation(lat, lon);
  }

  // 2. Fetch all stations from backend SQLite database
  if (!fetchPromise) {
    fetchPromise = fetch("http://localhost:5000/api/stations/all")
      .then((res) => (res.ok ? res.json() : { stations: [] }))
      .then((data) => {
        if (data && Array.isArray(data.stations) && data.stations.length > 0) {
          const mapped: PanIndiaStation[] = data.stations.map((s: any) => {
            const existing = PAN_INDIA_STATIONS.find(
              (p) => p.code.toUpperCase() === s.code.toUpperCase()
            );
            const isYnk =
              s.code?.toUpperCase() === "YNK" ||
              (s.name && s.name.toLowerCase().includes("yelahanka"));
            const stationImage = isYnk
              ? "/images/stations/yelahanka.jpg"
              : existing?.image || DEFAULT_RAILWAY_FALLBACK_IMAGE;

            return {
              name: s.name || s.code,
              code: s.code,
              state: s.state || "India",
              zone: s.zone || "IR",
              latitude: Number(s.latitude),
              longitude: Number(s.longitude),
              image: stationImage,
            };
          });
          masterStationsCache = mapped;
          return mapped;
        }
        return PAN_INDIA_STATIONS;
      })
      .catch(() => PAN_INDIA_STATIONS);
  }

  try {
    const allStations = await fetchPromise;
    if (allStations && allStations.length > 0) {
      let nearest = allStations[0];
      let minDistance = Number.POSITIVE_INFINITY;
      for (const st of allStations) {
        if (!st.latitude || !st.longitude) continue;
        const dist = calculateHaversineKm(lat, lon, st.latitude, st.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = st;
        }
      }
      return nearest;
    }
  } catch {
    // fallback
  }

  return findNearestPanIndiaStation(lat, lon);
}

