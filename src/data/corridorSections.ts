export interface SectionStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  platforms: number;
  is_junction?: boolean;
}

export interface CorridorTrainRake {
  id: string;
  name: string;
  number: string;
  direction: 'UP' | 'DOWN'; // UP: towards origin, DOWN: towards destination
  currentStation: string;
  nextStation: string;
  progress: number; // 0 to 100 between current and next
  speedKmh: number;
  delayMinutes: number;
  signalAspect: 'GREEN' | 'YELLOW' | 'DOUBLE_YELLOW' | 'RED';
  track: 'MAIN' | 'LOOP' | 'PLATFORM';
  lat?: number;
  lon?: number;
}

export interface RailwaySection {
  id: string;
  name: string;
  zone: string;
  division: string;
  description: string;
  totalLengthKm: number;
  defaultZoom: number;
  center: [number, number];
  stations: SectionStation[];
  defaultRakes: CorridorTrainRake[];
}

export interface RailwayDivision {
  id: string;
  name: string;
  zoneId: string;
  sections: RailwaySection[];
}

export interface RailwayZone {
  id: string;
  name: string;
  divisions: RailwayDivision[];
}

export const RAILWAY_HIERARCHY: RailwayZone[] = [
  {
    id: 'SWR',
    name: 'South Western Railway (SWR)',
    divisions: [
      {
        id: 'SBC',
        name: 'Bengaluru Division (SBC)',
        zoneId: 'SWR',
        sections: [
          {
            id: 'SBC-BWT',
            name: 'Bengaluru – Bangarapet Trunk Line',
            zone: 'SWR',
            division: 'SBC',
            description: 'High-density electrified quadruple trunk corridor connecting KSR Bengaluru to Chennai & Tamil Nadu border.',
            totalLengthKm: 70,
            defaultZoom: 11,
            center: [12.992, 77.85],
            stations: [
              { id: 'SBC', name: 'KSR Bengaluru City', lat: 12.9784, lon: 77.5696, distanceKm: 0, platforms: 10, is_junction: true },
              { id: 'BNC', name: 'Bengaluru Cantt', lat: 12.9934, lon: 77.5983, distanceKm: 4.2, platforms: 3 },
              { id: 'BNCE', name: 'Bengaluru East', lat: 12.9981, lon: 77.6163, distanceKm: 6.8, platforms: 2 },
              { id: 'BYPL', name: 'Baiyyappanahalli', lat: 12.9912, lon: 77.6528, distanceKm: 11.2, platforms: 4, is_junction: true },
              { id: 'KJM', name: 'Krishnarajapuram', lat: 13.0012, lon: 77.6780, distanceKm: 14.1, platforms: 4, is_junction: true },
              { id: 'WFD', name: 'Whitefield', lat: 12.9942, lon: 77.7583, distanceKm: 23.0, platforms: 4 },
              { id: 'MLO', name: 'Malur', lat: 13.0039, lon: 77.9392, distanceKm: 42.8, platforms: 3 },
              { id: 'BWT', name: 'Bangarapet Jn', lat: 12.9988, lon: 78.1969, distanceKm: 70.4, platforms: 5, is_junction: true },
            ],
            defaultRakes: [
              {
                id: '20608',
                name: 'Vande Bharat Express',
                number: '20608',
                direction: 'DOWN',
                currentStation: 'SBC',
                nextStation: 'BNC',
                progress: 35,
                speedKmh: 94,
                delayMinutes: 0,
                signalAspect: 'GREEN',
                track: 'MAIN',
              },
              {
                id: '06527',
                name: 'Bangarapet MEMU',
                number: '06527',
                direction: 'DOWN',
                currentStation: 'WFD',
                nextStation: 'MLO',
                progress: 60,
                speedKmh: 52,
                delayMinutes: 8,
                signalAspect: 'YELLOW',
                track: 'MAIN',
              },
              {
                id: '12639',
                name: 'Brindavan Express',
                number: '12639',
                direction: 'DOWN',
                currentStation: 'BYPL',
                nextStation: 'KJM',
                progress: 40,
                speedKmh: 75,
                delayMinutes: 12,
                signalAspect: 'DOUBLE_YELLOW',
                track: 'MAIN',
              },
              {
                id: '12628',
                name: 'Karnataka Express',
                number: '12628',
                direction: 'UP',
                currentStation: 'BWT',
                nextStation: 'MLO',
                progress: 50,
                speedKmh: 82,
                delayMinutes: 15,
                signalAspect: 'GREEN',
                track: 'MAIN',
              },
              {
                id: '12610',
                name: 'Chennai Superfast',
                number: '12610',
                direction: 'UP',
                currentStation: 'KJM',
                nextStation: 'BYPL',
                progress: 75,
                speedKmh: 64,
                delayMinutes: 4,
                signalAspect: 'YELLOW',
                track: 'MAIN',
              },
            ],
          },
          {
            id: 'SBC-MYS',
            name: 'Bengaluru – Mysuru Double Line Corridor',
            zone: 'SWR',
            division: 'SBC',
            description: 'Modern double electrified corridor serving regional express and MEMU traffic.',
            totalLengthKm: 138,
            defaultZoom: 10,
            center: [12.65, 77.10],
            stations: [
              { id: 'SBC', name: 'KSR Bengaluru City', lat: 12.9784, lon: 77.5696, distanceKm: 0, platforms: 10, is_junction: true },
              { id: 'KGI', name: 'Kengeri', lat: 12.9090, lon: 77.4840, distanceKm: 12.2, platforms: 4 },
              { id: 'BID', name: 'Bidadi', lat: 12.8010, lon: 77.3850, distanceKm: 30.0, platforms: 2 },
              { id: 'RMGM', name: 'Ramanagaram', lat: 12.7210, lon: 77.2800, distanceKm: 44.8, platforms: 3 },
              { id: 'CPT', name: 'Channapatna', lat: 12.6540, lon: 77.2020, distanceKm: 56.1, platforms: 3 },
              { id: 'MAD', name: 'Maddur', lat: 12.5850, lon: 77.0450, distanceKm: 73.9, platforms: 3 },
              { id: 'MYA', name: 'Mandya', lat: 12.5234, lon: 76.8986, distanceKm: 93.1, platforms: 3, is_junction: true },
              { id: 'PAN', name: 'Pandavapura', lat: 12.4410, lon: 76.7120, distanceKm: 118.4, platforms: 2 },
              { id: 'MYS', name: 'Mysuru Jn', lat: 12.3160, lon: 76.6450, distanceKm: 138.2, platforms: 6, is_junction: true },
            ],
            defaultRakes: [
              {
                id: '20661',
                name: 'Vande Bharat Express (MYS)',
                number: '20661',
                direction: 'DOWN',
                currentStation: 'SBC',
                nextStation: 'KGI',
                progress: 65,
                speedKmh: 98,
                delayMinutes: 0,
                signalAspect: 'GREEN',
                track: 'MAIN',
              },
              {
                id: '12613',
                name: 'Tippu Express',
                number: '12613',
                direction: 'DOWN',
                currentStation: 'RMGM',
                nextStation: 'CPT',
                progress: 30,
                speedKmh: 88,
                delayMinutes: 2,
                signalAspect: 'GREEN',
                track: 'MAIN',
              },
              {
                id: '16592',
                name: 'Hampi Express',
                number: '16592',
                direction: 'UP',
                currentStation: 'MYA',
                nextStation: 'MAD',
                progress: 45,
                speedKmh: 70,
                delayMinutes: 7,
                signalAspect: 'DOUBLE_YELLOW',
                track: 'MAIN',
              },
              {
                id: '06214',
                name: 'Mysuru Passenger',
                number: '06214',
                direction: 'UP',
                currentStation: 'CPT',
                nextStation: 'RMGM',
                progress: 70,
                speedKmh: 45,
                delayMinutes: 18,
                signalAspect: 'RED',
                track: 'MAIN',
              },
            ],
          },
          {
            id: 'SBC-HUP',
            name: 'Bengaluru – Hindupur / Dharmavaram Branch',
            zone: 'SWR',
            division: 'SBC',
            description: 'Northern exit corridor towards Andhra Pradesh and Secunderabad.',
            totalLengthKm: 100,
            defaultZoom: 10,
            center: [13.40, 77.55],
            stations: [
              { id: 'SBC', name: 'KSR Bengaluru City', lat: 12.9784, lon: 77.5696, distanceKm: 0, platforms: 10, is_junction: true },
              { id: 'YPR', name: 'Yesvantpur Jn', lat: 13.0238, lon: 77.5503, distanceKm: 5.6, platforms: 6, is_junction: true },
              { id: 'YNK', name: 'Yelahanka Jn', lat: 13.1007, lon: 77.5963, distanceKm: 18.0, platforms: 3, is_junction: true },
              { id: 'DBU', name: 'Dodballapur', lat: 13.2925, lon: 77.5417, distanceKm: 36.2, platforms: 3 },
              { id: 'GBD', name: 'Gauribidanur', lat: 13.6120, lon: 77.5180, distanceKm: 60.5, platforms: 3 },
              { id: 'HUP', name: 'Hindupur', lat: 13.8290, lon: 77.4930, distanceKm: 100.1, platforms: 4, is_junction: true },
            ],
            defaultRakes: [
              {
                id: '12786',
                name: 'Kacheguda Express',
                number: '12786',
                direction: 'DOWN',
                currentStation: 'YPR',
                nextStation: 'YNK',
                progress: 55,
                speedKmh: 76,
                delayMinutes: 5,
                signalAspect: 'GREEN',
                track: 'MAIN',
              },
              {
                id: '16591',
                name: 'Hampi Express',
                number: '16591',
                direction: 'UP',
                currentStation: 'GBD',
                nextStation: 'DBU',
                progress: 35,
                speedKmh: 82,
                delayMinutes: 0,
                signalAspect: 'GREEN',
                track: 'MAIN',
              },
            ],
          },
        ],
      },
      {
        id: 'MYS',
        name: 'Mysuru Division (MYS)',
        zoneId: 'SWR',
        sections: [
          {
            id: 'MYS-HAS',
            name: 'Mysuru – Hassan Jn Section',
            zone: 'SWR',
            division: 'MYS',
            description: 'Single electrified line connecting Mysuru to Hassan and Mangaluru.',
            totalLengthKm: 120,
            defaultZoom: 10,
            center: [12.65, 76.35],
            stations: [
              { id: 'MYS', name: 'Mysuru Jn', lat: 12.3160, lon: 76.6450, distanceKm: 0, platforms: 6, is_junction: true },
              { id: 'KRNR', name: 'Krishnarajanagara', lat: 12.4410, lon: 76.3820, distanceKm: 35.0, platforms: 2 },
              { id: 'HLN', name: 'Hole Narsipur', lat: 12.7880, lon: 76.2420, distanceKm: 78.5, platforms: 2 },
              { id: 'HAS', name: 'Hassan Jn', lat: 13.0070, lon: 76.1020, distanceKm: 120.0, platforms: 4, is_junction: true },
            ],
            defaultRakes: [
              {
                id: '16515',
                name: 'Karwar Express',
                number: '16515',
                direction: 'DOWN',
                currentStation: 'MYS',
                nextStation: 'KRNR',
                progress: 40,
                speedKmh: 58,
                delayMinutes: 3,
                signalAspect: 'GREEN',
                track: 'MAIN',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'SR',
    name: 'Southern Railway (SR)',
    divisions: [
      {
        id: 'MAS',
        name: 'Chennai Division (MAS)',
        zoneId: 'SR',
        sections: [
          {
            id: 'MAS-JTJ',
            name: 'Chennai Central – Jolarpettai Jn Trunk',
            zone: 'SR',
            division: 'MAS',
            description: 'Heavy passenger & freight trunk linking Chennai to Karnataka and Kerala.',
            totalLengthKm: 213,
            defaultZoom: 9,
            center: [12.85, 79.45],
            stations: [
              { id: 'MAS', name: 'MGR Chennai Central', lat: 13.0827, lon: 80.2755, distanceKm: 0, platforms: 15, is_junction: true },
              { id: 'PER', name: 'Perambur', lat: 13.1100, lon: 80.2300, distanceKm: 5.6, platforms: 4 },
              { id: 'AJJ', name: 'Arakkonam Jn', lat: 13.0800, lon: 79.6700, distanceKm: 68.8, platforms: 7, is_junction: true },
              { id: 'KPD', name: 'Katpadi Jn', lat: 12.9698, lon: 79.1384, distanceKm: 129.8, platforms: 5, is_junction: true },
              { id: 'JTJ', name: 'Jolarpettai Jn', lat: 12.5694, lon: 78.5833, distanceKm: 213.2, platforms: 5, is_junction: true },
            ],
            defaultRakes: [
              {
                id: '12601',
                name: 'Mangalore Mail',
                number: '12601',
                direction: 'DOWN',
                currentStation: 'AJJ',
                nextStation: 'KPD',
                progress: 50,
                speedKmh: 95,
                delayMinutes: 0,
                signalAspect: 'GREEN',
                track: 'MAIN',
              },
              {
                id: '12608',
                name: 'Lalbagh Express',
                number: '12608',
                direction: 'UP',
                currentStation: 'JTJ',
                nextStation: 'KPD',
                progress: 60,
                speedKmh: 84,
                delayMinutes: 10,
                signalAspect: 'YELLOW',
                track: 'MAIN',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'CR',
    name: 'Central Railway (CR)',
    divisions: [
      {
        id: 'CSMT',
        name: 'Mumbai Division (CSMT)',
        zoneId: 'CR',
        sections: [
          {
            id: 'CSMT-ROHA',
            name: 'Mumbai CSMT – Panvel – Roha (Konkan Gate)',
            zone: 'CR',
            division: 'CSMT',
            description: 'Intense suburban and Konkan Railway passenger gateway route.',
            totalLengthKm: 144,
            defaultZoom: 9,
            center: [18.70, 73.00],
            stations: [
              { id: 'CSMT', name: 'Mumbai CSMT', lat: 18.9400, lon: 72.8355, distanceKm: 0, platforms: 18, is_junction: true },
              { id: 'DR', name: 'Dadar Central', lat: 19.0180, lon: 72.8430, distanceKm: 8.8, platforms: 8, is_junction: true },
              { id: 'TNA', name: 'Thane', lat: 19.1860, lon: 72.9760, distanceKm: 33.6, platforms: 10, is_junction: true },
              { id: 'PNVL', name: 'Panvel Jn', lat: 18.9894, lon: 73.1175, distanceKm: 68.8, platforms: 7, is_junction: true },
              { id: 'ROHA', name: 'Roha Jn', lat: 18.4410, lon: 73.1180, distanceKm: 143.9, platforms: 3, is_junction: true },
            ],
            defaultRakes: [
              {
                id: '10111',
                name: 'Konkan Kanya Express',
                number: '10111',
                direction: 'DOWN',
                currentStation: 'PNVL',
                nextStation: 'ROHA',
                progress: 45,
                speedKmh: 78,
                delayMinutes: 6,
                signalAspect: 'GREEN',
                track: 'MAIN',
              },
            ],
          },
        ],
      },
    ],
  },
];
