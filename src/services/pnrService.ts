// src/services/pnrService.ts

export interface PassengerInfo {
  number: number;
  bookingStatus: string;
  currentStatus: string;
  coach: string;
  berth: string;
  berthType: string;
  confirmed: boolean;
}

export interface PNRRecord {
  pnr: string;
  trainNumber: string;
  trainName: string;
  fromStation: { name: string; code: string; time: string; platform: string };
  toStation: { name: string; code: string; time: string; platform: string };
  dateOfJourney: string;
  bookingClass: string;
  className: string;
  quota: string;
  chartStatus: "Chart Prepared" | "Chart Not Prepared";
  totalPassengers: number;
  passengers: PassengerInfo[];
  fare: number;
  bookingDate: string;
}

export const MOCK_PNR_DATABASE: Record<string, PNRRecord> = {
  "4529108392": {
    pnr: "4529108392",
    trainNumber: "12627",
    trainName: "Karnataka Express",
    fromStation: { name: "KSR Bengaluru", code: "SBC", time: "19:20", platform: "PF 1" },
    toStation: { name: "New Delhi", code: "NDLS", time: "06:15 (+2 days)", platform: "PF 3" },
    dateOfJourney: "15 Sep 2026",
    bookingClass: "3A",
    className: "AC 3 Tier (3A)",
    quota: "General (GN)",
    chartStatus: "Chart Prepared",
    totalPassengers: 2,
    passengers: [
      {
        number: 1,
        bookingStatus: "CNF / B3 / 42",
        currentStatus: "CNF / B3 / 42",
        coach: "B3",
        berth: "42",
        berthType: "Lower (LB)",
        confirmed: true,
      },
      {
        number: 2,
        bookingStatus: "CNF / B3 / 43",
        currentStatus: "CNF / B3 / 43",
        coach: "B3",
        berth: "43",
        berthType: "Middle (MB)",
        confirmed: true,
      },
    ],
    fare: 4360,
    bookingDate: "10 Sep 2026",
  },
  "8821903411": {
    pnr: "8821903411",
    trainNumber: "20608",
    trainName: "Mysuru - Chennai Vande Bharat Express",
    fromStation: { name: "KSR Bengaluru", code: "SBC", time: "06:00", platform: "PF 7" },
    toStation: { name: "Chennai Central", code: "MAS", time: "10:30", platform: "PF 2" },
    dateOfJourney: "16 Sep 2026",
    bookingClass: "CC",
    className: "AC Chair Car (CC)",
    quota: "General (GN)",
    chartStatus: "Chart Prepared",
    totalPassengers: 1,
    passengers: [
      {
        number: 1,
        bookingStatus: "CNF / C1 / 18",
        currentStatus: "CNF / C1 / 18",
        coach: "C1",
        berth: "18",
        berthType: "Window (W)",
        confirmed: true,
      },
    ],
    fare: 1040,
    bookingDate: "12 Sep 2026",
  },
  "6192837401": {
    pnr: "6192837401",
    trainNumber: "12245",
    trainName: "Howrah - SMVT Bengaluru Duronto Express",
    fromStation: { name: "Howrah Junction", code: "HWH", time: "10:50", platform: "PF 21" },
    toStation: { name: "SMVT Bengaluru", code: "SMVB", time: "16:00 (+1 day)", platform: "PF 4" },
    dateOfJourney: "18 Sep 2026",
    bookingClass: "2A",
    className: "AC 2 Tier (2A)",
    quota: "Tatkal (TQ)",
    chartStatus: "Chart Not Prepared",
    totalPassengers: 1,
    passengers: [
      {
        number: 1,
        bookingStatus: "RAC / 14",
        currentStatus: "RAC / 4",
        coach: "A2",
        berth: "Confirmed at Charting",
        berthType: "Side Lower (SL)",
        confirmed: false,
      },
    ],
    fare: 3890,
    bookingDate: "14 Sep 2026",
  },
  "3829104720": {
    pnr: "3829104720",
    trainNumber: "12639",
    trainName: "Brindavan Express",
    fromStation: { name: "KSR Bengaluru", code: "SBC", time: "15:00", platform: "PF 5" },
    toStation: { name: "Chennai Central", code: "MAS", time: "21:05", platform: "PF 1" },
    dateOfJourney: "19 Sep 2026",
    bookingClass: "2S",
    className: "Second Sitting (2S)",
    quota: "General (GN)",
    chartStatus: "Chart Not Prepared",
    totalPassengers: 2,
    passengers: [
      {
        number: 1,
        bookingStatus: "WL / 24",
        currentStatus: "WL / 6",
        coach: "Unassigned",
        berth: "Waiting List",
        berthType: "WL",
        confirmed: false,
      },
      {
        number: 2,
        bookingStatus: "WL / 25",
        currentStatus: "WL / 7",
        coach: "Unassigned",
        berth: "Waiting List",
        berthType: "WL",
        confirmed: false,
      },
    ],
    fare: 310,
    bookingDate: "13 Sep 2026",
  },
};

const USER_SAVED_PNRS_KEY = "raildrishti_saved_pnrs";

export function lookupPNR(pnr: string): PNRRecord | null {
  const clean = pnr.trim().replace(/\D/g, "");
  if (!clean || clean.length !== 10) return null;
  return MOCK_PNR_DATABASE[clean] || null;
}

export function getUserSavedPNRNumbers(): string[] {
  try {
    const raw = localStorage.getItem(USER_SAVED_PNRS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return ["4529108392", "8821903411", "6192837401"];
}

export function getUserSavedBookings(): PNRRecord[] {
  const numbers = getUserSavedPNRNumbers();
  const results: PNRRecord[] = [];
  numbers.forEach((pnr) => {
    const record = lookupPNR(pnr);
    if (record) {
      results.push(record);
    }
  });
  return results;
}

export function saveUserPNRNumber(pnr: string): boolean {
  const clean = pnr.trim().replace(/\D/g, "");
  if (clean.length !== 10) return false;
  try {
    const existing = getUserSavedPNRNumbers();
    if (!existing.includes(clean)) {
      const updated = [clean, ...existing].slice(0, 10);
      localStorage.setItem(USER_SAVED_PNRS_KEY, JSON.stringify(updated));
    }
    return true;
  } catch {
    return false;
  }
}

export function removeUserPNRNumber(pnr: string): void {
  try {
    const existing = getUserSavedPNRNumbers();
    const updated = existing.filter((item) => item !== pnr);
    localStorage.setItem(USER_SAVED_PNRS_KEY, JSON.stringify(updated));
  } catch {}
}
