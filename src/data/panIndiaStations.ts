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
export const DEFAULT_RAILWAY_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1800&q=85";

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
];

// Helper to find closest station anywhere in India from coordinates
export function findNearestPanIndiaStation(lat: number, lon: number): PanIndiaStation {
  let nearest = PAN_INDIA_STATIONS[0];
  let minDistance = Number.POSITIVE_INFINITY;

  for (const st of PAN_INDIA_STATIONS) {
    const dLat = (st.latitude - lat) * (Math.PI / 180);
    const dLon = (st.longitude - lon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(st.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c; // Earth radius in km

    if (dist < minDistance) {
      minDistance = dist;
      nearest = st;
    }
  }

  return nearest;
}
