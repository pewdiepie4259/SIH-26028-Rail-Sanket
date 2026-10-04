// ============================================================================
// RailSanket - Indian Railways Dedicated Personnel Hero Gallery
// Rotates automatically every 5 minutes (300,000 ms) synchronized with real time
// ============================================================================

export interface RailwayEmployeeSlide {
  id: number;
  title: string;
  role: string;
  division: string;
  description: string;
  image: string;
}

export const RAILWAY_EMPLOYEE_SLIDES: RailwayEmployeeSlide[] = [
  {
    id: 1,
    title: "Permanent Way Track Maintainers",
    role: "Track Maintenance Gang & Section Engineer (P-Way)",
    division: "Engineering Branch • Indian Railways",
    description: "Women track maintainers in safety equipment ensuring track packing, gauge integrity, and line safety.",
    image: "/images/employees/employee-track-maintainers.jpg",
  },
  {
    id: 2,
    title: "Train Manager / Guard on Line Clear",
    role: "Train Manager / Senior Passenger Guard",
    division: "Operating Branch • Indian Railways",
    description: "Train Manager giving all-clear departure green flag authorization from the passenger coach.",
    image: "/images/employees/employee-guard-flag.jpg",
  },
  {
    id: 3,
    title: "Locomotive Pilot & Assistant Loco Pilot",
    role: "Loco Pilot / Train Driver (Electric & Diesel Traction)",
    division: "Motive Power & Traction Operations • Indian Railways",
    description: "Loco crew operating primary controls, vigilance devices, and signal perception inside high-speed locomotive cab.",
    image: "/images/employees/employee-loco-pilot.jpg",
  },
  {
    id: 4,
    title: "Station Operations & Train Dispatch",
    role: "Station Master / Train Dispatcher",
    division: "Traffic Operations Branch • Indian Railways",
    description: "Field operational staff managing block line clear communication and train movement coordination.",
    image: "/images/employees/employee-station-master.jpg",
  },
  {
    id: 5,
    title: "Platform Safety & Cleanliness Workforce",
    role: "Swachh Rail & Station Maintenance Crew",
    division: "Station Services & Passenger Amenities • Indian Railways",
    description: "Dedicated platform safety and cleanliness workforce serving round-the-clock nationwide.",
    image: "/images/employees/employee-platform-team.jpg",
  },
  {
    id: 6,
    title: "High-Speed Vande Bharat Fleet Operations",
    role: "Vande Bharat Operating & Technical Crew",
    division: "High-Speed Coaching Branch • Indian Railways",
    description: "Semi-high speed distributed traction coaching rake operations connecting major economic corridors.",
    image: "/images/vande-bharat-bg.jpg",
  },
  {
    id: 7,
    title: "Heavy Haul Electric Traction & Freight Dispatch",
    role: "Loco Traction & Power Maintenance Engineer",
    division: "Electrical Traction Services • Indian Railways",
    description: "High-powered electric traction operations ensuring seamless transit of heavy haul trains.",
    image: "/images/wap4-locomotive.jpg",
  },
  {
    id: 8,
    title: "Night Shift Mainline Signal Interlocking",
    role: "Signal & Telecom Control Supervisor",
    division: "Signaling & Modern Telecommunications • Indian Railways",
    description: "24x7 route relay interlocking and point machine maintenance ensuring zero-failure mainline throughput.",
    image: "/images/bg-slide-platform.jpg",
  },
];

