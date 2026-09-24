// ============================================================================
// Farm Management System — dummy data for the UI mock-up.
// All figures are illustrative. Every module in the SRS reads from here.
// ============================================================================

export type FarmType = "dairy" | "fattening" | "mixed";

export type Farm = {
  id: string;
  name: string;
  nameBn: string;
  location: string;
  type: FarmType;
  animals: number;
  color: string;
};

export const FARMS: Farm[] = [
  { id: "f1", name: "Shapla Dairy", nameBn: "শাপলা ডেইরি", location: "Sirajganj", type: "dairy", animals: 64, color: "#16a34a" },
  { id: "f2", name: "Green Feedlot", nameBn: "গ্রিন ফিডলট", location: "Pabna", type: "fattening", animals: 38, color: "#d97706" },
  { id: "f3", name: "Rupsha Mixed Farm", nameBn: "রূপসা মিশ্র খামার", location: "Jashore", type: "mixed", animals: 47, color: "#2563eb" },
];

export const ACCOUNT = {
  owner: "Afsan Rahmatullah",
  fiscalYear: "Jul 2026 – Jun 2027",
  currency: "BDT (৳)",
  farms: FARMS.length,
  totalAnimals: FARMS.reduce((s, f) => s + f.animals, 0),
};

// ---------------------------------------------------------------------------
// Users & roles (§2.2)
// ---------------------------------------------------------------------------
export type UserRow = {
  id: string;
  name: string;
  role: "Owner" | "Farm manager" | "Worker / milker" | "Veterinarian" | "Qurbani buyer";
  farms: string[]; // farm ids or "all"
  phone: string;
  status: "Active" | "Link (expires)" | "Invited";
  access: string;
};

export const USERS: UserRow[] = [
  { id: "u1", name: "Afsan Rahmatullah", role: "Owner", farms: ["all"], phone: "+8801711-000001", status: "Active", access: "Everything on every farm" },
  { id: "u2", name: "Karim Sheikh", role: "Farm manager", farms: ["f1"], phone: "+8801711-000002", status: "Active", access: "Shapla Dairy only" },
  { id: "u3", name: "Rahim Uddin", role: "Farm manager", farms: ["f2", "f3"], phone: "+8801711-000003", status: "Active", access: "Green Feedlot, Rupsha" },
  { id: "u4", name: "Jamal Miah", role: "Worker / milker", farms: ["f1"], phone: "+8801711-000004", status: "Active", access: "Milk, feed, weight — no money" },
  { id: "u5", name: "Salma Begum", role: "Worker / milker", farms: ["f3"], phone: "+8801711-000005", status: "Active", access: "Milk, feed, weight — no money" },
  { id: "u6", name: "Dr. Nasima Akter", role: "Veterinarian", farms: ["f1"], phone: "link", status: "Link (expires)", access: "Health & breeding, read-only, 14 days" },
  { id: "u7", name: "Sadid Hasan", role: "Qurbani buyer", farms: ["f2"], phone: "link", status: "Link (expires)", access: "One animal (BULL-207) only" },
];

export const ROLE_MATRIX = [
  { role: "Owner", where: "Phone or laptop, offsite", can: "Everything on every farm — consolidated views, cost, profit, stock value, variance reports; create farms; manage users & settings; approve write-offs; close months", cannot: "No restriction" },
  { role: "Farm manager", where: "Phone, onsite", can: "Assigned farms only: enter all records, register animals, record purchases, stock counts, sales & payments, manage stock", cannot: "Unassigned/consolidated views; owner-only profit; delete posted entries; change historic prices; approve write-offs above owner limit" },
  { role: "Worker / milker", where: "Phone, at the shed", can: "Assigned farms only: milk entry, feed given (issues stock), weight entry — today + previous 2 days; see stock quantities", cannot: "Any price, stock value, balance, cost or profit figure" },
  { role: "Veterinarian", where: "Phone, visiting, by link", can: "Read health & breeding history shared; record treatments & pregnancy results; see medicine stock quantities", cannot: "Any financial data" },
  { role: "Qurbani buyer", where: "Phone, offsite, by link", can: "View the one animal booked: photos, weight trend, amount paid", cannot: "Any other animal or any farm figure" },
];

// ---------------------------------------------------------------------------
// Animals (Module A)
// ---------------------------------------------------------------------------
export type Purpose = "dairy" | "fattening" | "breeding" | "young stock";
export type Animal = {
  id: string;
  tag: string;
  name?: string;
  farmId: string;
  species: "Cattle" | "Goat";
  breed: string;
  sex: "F" | "M";
  dob: string;
  purpose: Purpose;
  status: "Active" | "Sold" | "Died" | "Culled";
  weight: number;
  weightMethod: "Scale" | "Tape";
  weightDate: string;
  weightStale?: boolean;
  weightDefault?: boolean;
  repro?: "Open" | "Served" | "Pregnant" | "Near delivery" | "Milking" | "Dry";
  motherTag?: string;
  fatherTag?: string;
  group: string;
  costToDate: number;
  photo: string;
};

export const ANIMALS: Animal[] = [
  { id: "a1", tag: "COW-101", name: "Lalima", farmId: "f1", species: "Cattle", breed: "Holstein Cross", sex: "F", dob: "2021-03-12", purpose: "dairy", status: "Active", weight: 462, weightMethod: "Scale", weightDate: "2026-09-20", repro: "Milking", motherTag: "COW-044", fatherTag: "AI: HF-2291", group: "Milking Shed A", costToDate: 148200, photo: "🐄" },
  { id: "a2", tag: "COW-102", name: "Shona", farmId: "f1", species: "Cattle", breed: "Sahiwal", sex: "F", dob: "2020-11-02", purpose: "dairy", status: "Active", weight: 418, weightMethod: "Tape", weightDate: "2026-09-18", repro: "Dry", motherTag: "COW-030", fatherTag: "Bull: SW-11", group: "Dry Shed", costToDate: 132700, photo: "🐄" },
  { id: "a3", tag: "COW-103", name: "Rani", farmId: "f1", species: "Cattle", breed: "Holstein Cross", sex: "F", dob: "2019-06-21", purpose: "dairy", status: "Active", weight: 505, weightMethod: "Scale", weightDate: "2026-09-21", repro: "Pregnant", motherTag: "COW-012", fatherTag: "AI: HF-1180", group: "Milking Shed A", costToDate: 176400, photo: "🐄" },
  { id: "a4", tag: "COW-118", name: "Moyna", farmId: "f1", species: "Cattle", breed: "Sahiwal", sex: "F", dob: "2022-01-15", purpose: "dairy", status: "Active", weight: 388, weightMethod: "Tape", weightDate: "2026-06-02", weightStale: true, repro: "Milking", motherTag: "COW-102", fatherTag: "AI: SW-77", group: "Milking Shed B", costToDate: 96500, photo: "🐄" },
  { id: "a5", tag: "CALF-140", name: "—", farmId: "f1", species: "Cattle", breed: "Holstein Cross", sex: "F", dob: "2026-07-28", purpose: "young stock", status: "Active", weight: 62, weightMethod: "Tape", weightDate: "2026-09-15", repro: "Open", motherTag: "COW-101", fatherTag: "AI: HF-2291", group: "Calf Pen", costToDate: 18400, photo: "🐮" },
  { id: "a6", tag: "BULL-207", name: "Badshah", farmId: "f2", species: "Cattle", breed: "Brahman Cross", sex: "M", dob: "2024-02-10", purpose: "fattening", status: "Active", weight: 428, weightMethod: "Scale", weightDate: "2026-09-22", group: "Fattening Pen 1", costToDate: 121300, photo: "🐂" },
  { id: "a7", tag: "BULL-208", name: "Kalu", farmId: "f2", species: "Cattle", breed: "Local x Brahman", sex: "M", dob: "2024-04-05", purpose: "fattening", status: "Active", weight: 372, weightMethod: "Scale", weightDate: "2026-09-22", group: "Fattening Pen 1", costToDate: 104900, photo: "🐂" },
  { id: "a8", tag: "BULL-211", name: "Raja", farmId: "f2", species: "Cattle", breed: "Brahman Cross", sex: "M", dob: "2023-12-18", purpose: "fattening", status: "Active", weight: 455, weightMethod: "Tape", weightDate: "2026-09-19", group: "Fattening Pen 2", costToDate: 138600, photo: "🐂" },
  { id: "a9", tag: "GOAT-301", name: "Chuti", farmId: "f3", species: "Goat", breed: "Black Bengal", sex: "F", dob: "2023-05-30", purpose: "breeding", status: "Active", weight: 16.5, weightMethod: "Scale", weightDate: "2026-09-20", repro: "Pregnant", motherTag: "GOAT-220", fatherTag: "Buck: BB-3", group: "Goat Shed", costToDate: 8600, photo: "🐐" },
  { id: "a10", tag: "GOAT-302", name: "Mithu", farmId: "f3", species: "Goat", breed: "Black Bengal", sex: "M", dob: "2025-12-11", purpose: "fattening", status: "Active", weight: 12.2, weightMethod: "Tape", weightDate: "2026-09-20", group: "Goat Shed", costToDate: 4200, photo: "🐐" },
  { id: "a11", tag: "GOAT-305", name: "—", farmId: "f3", species: "Goat", breed: "Black Bengal", sex: "F", dob: "2026-08-12", purpose: "young stock", status: "Active", weight: 6.4, weightDefault: true, weightMethod: "Tape", weightDate: "—", group: "Goat Shed", costToDate: 900, photo: "🐐", repro: "Open" },
  { id: "a12", tag: "COW-115", name: "Tara", farmId: "f3", species: "Cattle", breed: "Sahiwal", sex: "F", dob: "2021-09-09", purpose: "dairy", status: "Active", weight: 441, weightMethod: "Scale", weightDate: "2026-09-19", repro: "Milking", motherTag: "COW-088", fatherTag: "AI: SW-77", group: "Milking Shed", costToDate: 128900, photo: "🐄" },
  { id: "a13", tag: "COW-090", name: "Beli", farmId: "f1", species: "Cattle", breed: "Holstein Cross", sex: "F", dob: "2018-02-14", purpose: "dairy", status: "Sold", weight: 470, weightMethod: "Scale", weightDate: "2026-05-10", repro: "Dry", group: "—", costToDate: 210300, photo: "🐄" },
];

export const WEIGHT_HISTORY = [
  { date: "2026-06-10", weight: 438, method: "Tape", by: "Jamal Miah" },
  { date: "2026-07-08", weight: 445, method: "Tape", by: "Jamal Miah" },
  { date: "2026-08-12", weight: 452, method: "Scale", by: "Karim Sheikh" },
  { date: "2026-09-20", weight: 462, method: "Scale", by: "Karim Sheikh" },
];

export const LINEAGE = {
  animal: "COW-101 · Lalima",
  ancestors: [
    { rel: "Mother", tag: "COW-044", note: "Holstein Cross · avg 14.2 L/day · healthy" },
    { rel: "Father", tag: "AI: HF-2291", note: "Holstein semen straw · high-yield line" },
    { rel: "Grandmother (m)", tag: "COW-021", note: "Sahiwal · avg 9.1 L/day" },
    { rel: "Grandfather (m)", tag: "Bull: HF-8", note: "Holstein bull" },
  ],
  offspring: [
    { rel: "Daughter", tag: "CALF-140", note: "Born 28 Jul 2026 · female · 62 kg" },
    { rel: "Son", tag: "BULL-133", note: "Born 2024 · sold Eid 2025" },
  ],
};

// ---------------------------------------------------------------------------
// Inventory (Module B)
// ---------------------------------------------------------------------------
export type ItemType = "feed" | "medicine" | "vaccine" | "semen straw" | "consumable" | "equipment" | "other";
export type Item = {
  id: string;
  name: string;
  nameBn: string;
  type: ItemType;
  stockUnit: string;
  boughtUnit: string;
  usedUnit: string;
  conversion: string;
  qty: number;
  avgCost: number;
  value: number;
  reorderDays: number;
  daysCover: number | null;
  batchTracked: boolean;
  photo: string;
};

export const ITEMS: Item[] = [
  { id: "i1", name: "Napier Silage", nameBn: "নেপিয়ার সাইলেজ", type: "feed", stockUnit: "kg", boughtUnit: "ton", usedUnit: "kg", conversion: "1 ton = 1000 kg", qty: 4200, avgCost: 9.5, value: 39900, reorderDays: 14, daysCover: 21, batchTracked: false, photo: "🌾" },
  { id: "i2", name: "Wheat Bran", nameBn: "গমের ভুষি", type: "feed", stockUnit: "kg", boughtUnit: "sack (50kg)", usedUnit: "kg", conversion: "1 sack = 50 kg", qty: 320, avgCost: 34, value: 10880, reorderDays: 10, daysCover: 6, batchTracked: false, photo: "🌾" },
  { id: "i3", name: "Mustard Oil Cake", nameBn: "সরিষার খৈল", type: "feed", stockUnit: "kg", boughtUnit: "sack (40kg)", usedUnit: "kg", conversion: "1 sack = 40 kg", qty: 180, avgCost: 52, value: 9360, reorderDays: 10, daysCover: 12, batchTracked: false, photo: "🌾" },
  { id: "i4", name: "FMD Vaccine", nameBn: "এফএমডি টিকা", type: "vaccine", stockUnit: "dose", boughtUnit: "vial (50 dose)", usedUnit: "dose", conversion: "1 vial = 50 doses", qty: 42, avgCost: 22, value: 924, reorderDays: 30, daysCover: null, batchTracked: true, photo: "💉" },
  { id: "i5", name: "PPR Vaccine (DLS)", nameBn: "পিপিআর টিকা", type: "vaccine", stockUnit: "dose", boughtUnit: "vial (100 dose)", usedUnit: "dose", conversion: "1 vial = 100 doses", qty: 88, avgCost: 0, value: 0, reorderDays: 30, daysCover: null, batchTracked: true, photo: "💉" },
  { id: "i6", name: "Oxytetracycline", nameBn: "অক্সিটেট্রাসাইক্লিন", type: "medicine", stockUnit: "ml", boughtUnit: "bottle (100ml)", usedUnit: "ml", conversion: "1 bottle = 100 ml", qty: 640, avgCost: 3.2, value: 2048, reorderDays: 30, daysCover: null, batchTracked: true, photo: "💊" },
  { id: "i7", name: "Dewormer (Albendazole)", nameBn: "কৃমিনাশক", type: "medicine", stockUnit: "bolus", boughtUnit: "strip (10)", usedUnit: "bolus", conversion: "1 strip = 10 bolus", qty: 34, avgCost: 14, value: 476, reorderDays: 30, daysCover: null, batchTracked: true, photo: "💊" },
  { id: "i8", name: "HF Semen Straw", nameBn: "এইচএফ সিমেন", type: "semen straw", stockUnit: "straw", boughtUnit: "straw", usedUnit: "straw", conversion: "1 : 1", qty: 12, avgCost: 320, value: 3840, reorderDays: 30, daysCover: null, batchTracked: true, photo: "🧬" },
  { id: "i9", name: "Disposable Gloves", nameBn: "গ্লাভস", type: "consumable", stockUnit: "pcs", boughtUnit: "box (100)", usedUnit: "pcs", conversion: "1 box = 100 pcs", qty: 260, avgCost: 4, value: 1040, reorderDays: 20, daysCover: 30, batchTracked: false, photo: "🧤" },
  { id: "i10", name: "Chaff Cutter", nameBn: "কাটার মেশিন", type: "equipment", stockUnit: "unit", boughtUnit: "unit", usedUnit: "unit", conversion: "1 : 1", qty: 2, avgCost: 18000, value: 36000, reorderDays: 0, daysCover: null, batchTracked: false, photo: "⚙️" },
];

export const BATCHES = [
  { item: "FMD Vaccine", batch: "FMD-2026A", expiry: "2026-10-18", qty: 42, status: "Expiring (24 d)" },
  { item: "PPR Vaccine (DLS)", batch: "PPR-DLS-114", expiry: "2027-03-02", qty: 88, status: "OK" },
  { item: "Oxytetracycline", batch: "OTC-8841", expiry: "2027-06-30", qty: 640, status: "OK" },
  { item: "Dewormer (Albendazole)", batch: "ALB-552", expiry: "2026-09-30", qty: 12, status: "Expiring (6 d)" },
  { item: "HF Semen Straw", batch: "HF-2291", expiry: "2028-01-01", qty: 12, status: "OK" },
];

export type Movement = {
  date: string;
  type: "Purchase" | "Issue" | "Transfer" | "Return" | "Count variance" | "Write-off" | "Opening";
  item: string;
  farm: string;
  qty: string;
  value: number;
  by: string;
  ref: string;
};
export const MOVEMENTS: Movement[] = [
  { date: "2026-09-22", type: "Issue", item: "Napier Silage", farm: "Shapla Dairy", qty: "-180 kg", value: -1710, by: "Jamal Miah", ref: "Feed given · Milking Shed A" },
  { date: "2026-09-22", type: "Issue", item: "FMD Vaccine", farm: "Shapla Dairy", qty: "-4 dose", value: -88, by: "Dr. Nasima", ref: "Vaccination · group" },
  { date: "2026-09-21", type: "Purchase", item: "Wheat Bran", farm: "Shapla Dairy", qty: "+500 kg", value: 17000, by: "Karim Sheikh", ref: "PO-1187 · Rahim Traders" },
  { date: "2026-09-20", type: "Write-off", item: "Mustard Oil Cake", farm: "Rupsha Mixed", qty: "-25 kg", value: -1300, by: "Rahim Uddin", ref: "Spoiled (damp) · owner approved" },
  { date: "2026-09-19", type: "Count variance", item: "Napier Silage", farm: "Shapla Dairy", qty: "-40 kg", value: -380, by: "Karim Sheikh", ref: "Stock count SC-09 · shortfall" },
  { date: "2026-09-18", type: "Transfer", item: "Wheat Bran", farm: "Shapla → Rupsha", qty: "100 kg", value: 3400, by: "Owner", ref: "Inter-farm transfer (excluded from P&L)" },
  { date: "2026-09-17", type: "Issue", item: "HF Semen Straw", farm: "Shapla Dairy", qty: "-1 straw", value: -320, by: "AI Tech", ref: "Breeding · COW-103" },
  { date: "2026-09-15", type: "Opening", item: "Oxytetracycline", farm: "Green Feedlot", qty: "+300 ml", value: 960, by: "Owner", ref: "Opening stock (not an expense)" },
];

export const STOCK_COUNTS = [
  { id: "SC-09", date: "2026-09-19", farm: "Shapla Dairy", by: "Karim Sheikh", items: 8, variances: 2, value: -540, approved: "Owner", reason: "Silage shortfall + bran surplus" },
  { id: "SC-08", date: "2026-08-31", farm: "Green Feedlot", by: "Rahim Uddin", items: 12, variances: 0, value: 0, approved: "—", reason: "Month-end count, matched" },
];

// ---------------------------------------------------------------------------
// Feeding (Module B feeding)
// ---------------------------------------------------------------------------
export const FEED_GROUPS = [
  { group: "Milking Shed A", farm: "Shapla Dairy", mode: "Group", animals: 14, silage: 180, bran: 42, cake: 18, prevSame: true, costDay: 3240 },
  { group: "Milking Shed B", farm: "Shapla Dairy", mode: "Group", animals: 9, silage: 110, bran: 24, cake: 10, prevSame: true, costDay: 1980 },
  { group: "Dry Shed", farm: "Shapla Dairy", mode: "Group", animals: 6, silage: 70, bran: 8, cake: 0, prevSame: false, costDay: 940 },
  { group: "Fattening Pen 1", farm: "Green Feedlot", mode: "Individual", animals: 12, silage: 240, bran: 60, cake: 30, prevSame: true, costDay: 5100 },
];

export const FEED_ALLOCATION = [
  { tag: "COW-101", weight: 462, stageRate: 3.0, share: "10.2%", silage: 18.4, cost: 331, flag: "" },
  { tag: "COW-103", weight: 505, stageRate: 3.0, share: "11.1%", silage: 20.0, cost: 361, flag: "" },
  { tag: "COW-118", weight: 388, stageRate: 3.0, share: "8.5%", silage: 15.3, cost: 276, flag: "Stale weight" },
  { tag: "CALF-140", weight: 62, stageRate: 2.0, share: "0.9%", silage: 1.6, cost: 29, flag: "" },
  { tag: "GOAT-305", weight: 6.4, stageRate: 3.0, share: "0.2%", silage: 0.4, cost: 4, flag: "Default weight" },
];

// ---------------------------------------------------------------------------
// Health (Module C)
// ---------------------------------------------------------------------------
export const TREATMENTS = [
  { date: "2026-09-22", animal: "Group · Milking Shed A (14)", reason: "FMD vaccination", medicine: "FMD Vaccine · FMD-2026A", dose: "4 dose", withdrawal: "None", by: "Dr. Nasima", cost: 88 },
  { date: "2026-09-18", animal: "COW-118", reason: "Mastitis", medicine: "Oxytetracycline · OTC-8841", dose: "20 ml", withdrawal: "Milk 4 days", by: "Dr. Nasima", cost: 64, vetFee: 500 },
  { date: "2026-09-10", animal: "BULL-207", reason: "Routine deworming", medicine: "Albendazole · ALB-552", dose: "1 bolus", withdrawal: "Meat 14 days", by: "Rahim Uddin", cost: 14 },
  { date: "2026-09-02", animal: "Group · Goat Shed (11)", reason: "PPR vaccination", medicine: "PPR Vaccine (DLS) · PPR-DLS-114", dose: "11 dose", withdrawal: "None", by: "Dr. Nasima", cost: 0 },
];

export const VACCINE_SCHEDULE = [
  { animal: "COW-101 group", vaccine: "FMD", last: "2026-03-22", next: "2026-09-22", status: "Done today", interval: "Every 6 months" },
  { animal: "Shapla herd", vaccine: "HS", last: "2025-10-01", next: "2026-10-01", status: "Due in 7 d", interval: "Yearly" },
  { animal: "Shapla herd", vaccine: "Anthrax", last: "2025-11-15", next: "2026-11-15", status: "Scheduled", interval: "Yearly" },
  { animal: "Shapla herd", vaccine: "Black quarter", last: "2025-10-01", next: "2026-10-01", status: "Due in 7 d", interval: "Yearly" },
  { animal: "Shapla herd", vaccine: "Lumpy skin disease", last: "—", next: "Vet to set", status: "Interval TBC", interval: "Vet to set" },
  { animal: "Goat Shed", vaccine: "PPR", last: "2026-09-02", next: "Vet to set", status: "Done", interval: "Vet to set" },
  { animal: "All cattle", vaccine: "Deworming", last: "2026-09-10", next: "2026-12-10", status: "Scheduled", interval: "Quarterly" },
];

export const WITHDRAWAL_ACTIVE = [
  { animal: "COW-118 · Moyna", type: "Milk", until: "2026-09-22", note: "Oxytetracycline — do not sell milk" },
  { animal: "BULL-207 · Badshah", type: "Meat", until: "2026-09-24", note: "Albendazole — do not slaughter" },
];

export const HEALTH_TIMELINE = [
  { date: "2026-09-22", kind: "Vaccine", text: "FMD vaccination (group)" },
  { date: "2026-09-20", kind: "Weight", text: "Weighed 462 kg (scale)" },
  { date: "2026-08-12", kind: "Weight", text: "Weighed 452 kg (scale)" },
  { date: "2026-07-28", kind: "Birth", text: "Delivered CALF-140 (female, 62 kg)" },
  { date: "2026-03-22", kind: "Vaccine", text: "FMD vaccination (group)" },
];

// ---------------------------------------------------------------------------
// Reproduction (Module D)
// ---------------------------------------------------------------------------
export const REPRO_STATES = [
  { tag: "COW-101", state: "Milking", detail: "Lactation day 58 · calf CALF-140", next: "—" },
  { tag: "COW-102", state: "Dry", detail: "Dried off 12 Sep · expected calving 20 Oct", next: "Dry-off cost carrying" },
  { tag: "COW-103", state: "Pregnant", detail: "Confirmed 3 Sep · bred 17 Jul (AI)", next: "Delivery ~23 Apr 2027" },
  { tag: "GOAT-301", state: "Pregnant", detail: "Confirmed 20 Aug · bred 10 Jul", next: "Delivery ~3 Dec 2026" },
  { tag: "COW-115", state: "Open", detail: "Waiting period ended · ready to breed", next: "Observe heat" },
];

export const REPRO_TASKS = [
  { date: "Today", task: "Pregnancy check", animal: "COW-115", farm: "Rupsha Mixed", type: "check" },
  { date: "Today", task: "FMD vaccination", animal: "Milking Shed A (14)", farm: "Shapla Dairy", type: "vaccine" },
  { date: "In 2 d", task: "Dry-off due", animal: "COW-104", farm: "Shapla Dairy", type: "dryoff" },
  { date: "In 4 d", task: "Delivery reminder (30 d)", animal: "COW-102", farm: "Shapla Dairy", type: "delivery" },
  { date: "In 5 d", task: "Breeding — observed heat", animal: "GOAT-308", farm: "Rupsha Mixed", type: "breeding" },
  { date: "In 6 d", task: "Pregnancy check (45 d)", animal: "COW-120", farm: "Shapla Dairy", type: "check" },
];

export const BREEDING_PERF = [
  { tag: "COW-101", daysOpen: 82, calvingInterval: "13.1 mo", servicesPerPreg: 1.4 },
  { tag: "COW-103", daysOpen: 95, calvingInterval: "13.8 mo", servicesPerPreg: 2.0 },
  { tag: "GOAT-301", daysOpen: 61, calvingInterval: "8.2 mo", servicesPerPreg: 1.0 },
];

// ---------------------------------------------------------------------------
// Dairy (Module E)
// ---------------------------------------------------------------------------
export const MILK_SESSION = [
  { tag: "COW-101", name: "Lalima", last: 8.2, morning: 8.4, evening: 7.8, avg7: 8.1, flag: "" },
  { tag: "COW-103", name: "Rani", last: 6.5, morning: 6.6, evening: 5.9, avg7: 6.4, flag: "" },
  { tag: "COW-118", name: "Moyna", last: 5.1, morning: 3.9, evening: 4.0, avg7: 5.0, flag: "↓ 22% below avg" },
  { tag: "COW-115", name: "Tara", last: 7.0, morning: 7.1, evening: 6.8, avg7: 7.0, flag: "" },
  { tag: "COW-102", name: "Shona", last: 0, morning: 0, evening: 0, avg7: 0, flag: "Not milked — Dry" },
];

export const MILK_USE = { produced: 268, sold: 232, home: 12, calves: 18, spoiled: 6 };

// Last 7 days, produced vs sold (litres) — for the dashboard trend chart
export const MILK_WEEK = [
  { day: "Wed", produced: 251, sold: 214 },
  { day: "Thu", produced: 248, sold: 220 },
  { day: "Fri", produced: 256, sold: 226 },
  { day: "Sat", produced: 254, sold: 222 },
  { day: "Sun", produced: 260, sold: 231 },
  { day: "Mon", produced: 263, sold: 228 },
  { day: "Tue", produced: 268, sold: 232 },
];

// Income mix this month (৳) — for the dashboard donut
export const INCOME_MIX = [
  { label: "Milk sales", value: 614000 },
  { label: "Animal sales", value: 254000 },
  { label: "Young stock", value: 18000 },
  { label: "Manure & other", value: 9000 },
];

export type Customer = {
  id: string;
  name: string;
  type: "Household" | "Shop" | "Wholesaler";
  mobile: string;
  rate: number;
  terms: "Cash" | "Monthly credit";
  billed: number;
  paid: number;
  outstanding: number;
  aging: { current: number; d30: number; d60: number; d90: number };
  standingOrder: number;
};
export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Rahela Store", type: "Shop", mobile: "+8801720-111111", rate: 68, terms: "Monthly credit", billed: 42160, paid: 30000, outstanding: 12160, aging: { current: 6120, d30: 4040, d60: 2000, d90: 0 }, standingOrder: 20 },
  { id: "c2", name: "Milk Vita Agent", type: "Wholesaler", mobile: "+8801720-222222", rate: 62, terms: "Monthly credit", billed: 96720, paid: 72000, outstanding: 24720, aging: { current: 12720, d30: 8000, d60: 0, d90: 4000 }, standingOrder: 60 },
  { id: "c3", name: "Karim household", type: "Household", mobile: "+8801720-333333", rate: 72, terms: "Cash", billed: 8640, paid: 8640, outstanding: 0, aging: { current: 0, d30: 0, d60: 0, d90: 0 }, standingOrder: 4 },
  { id: "c4", name: "Nabila Tea Stall", type: "Shop", mobile: "+8801720-444444", rate: 70, terms: "Monthly credit", billed: 21000, paid: 12000, outstanding: 9000, aging: { current: 4200, d30: 2800, d60: 2000, d90: 0 }, standingOrder: 10 },
];

// ---------------------------------------------------------------------------
// Fattening & qurbani (Module F)
// ---------------------------------------------------------------------------
export const FATTENING = [
  { tag: "BULL-207", name: "Badshah", intakeDate: "2026-02-01", intakeWt: 300, target: 520, targetDate: "2027-06-07", current: 428, adg: 0.62, projected: 517, invested: 121300, breakeven: 148000, booked: true },
  { tag: "BULL-208", name: "Kalu", intakeDate: "2026-03-05", intakeWt: 280, target: 480, targetDate: "2027-06-07", current: 372, adg: 0.48, projected: 452, invested: 104900, breakeven: 129000, booked: false },
  { tag: "BULL-211", name: "Raja", intakeDate: "2026-01-18", intakeWt: 340, target: 560, targetDate: "2027-06-07", current: 455, adg: 0.55, projected: 548, invested: 138600, breakeven: 165000, booked: true },
  { tag: "GOAT-302", name: "Mithu", intakeDate: "2026-06-10", intakeWt: 9, target: 22, targetDate: "2027-06-07", current: 12.2, adg: 0.03, projected: 20, invested: 4200, breakeven: 6800, booked: false },
];

export const BOOKINGS = [
  { animal: "BULL-207 · Badshah", buyer: "Sadid Hasan", mobile: "+8801730-555555", price: 195000, deposit: 40000, balance: 155000, delivery: "Eid-ul-Adha 2027", status: "Booked", shareLink: true },
  { animal: "BULL-211 · Raja", buyer: "Qurbani Group (7 shares)", mobile: "+8801730-666666", price: 210000, deposit: 90000, balance: 120000, delivery: "Eid-ul-Adha 2027", status: "Part booked", shareLink: true },
];

export const QURBANI_SHARES = [
  { share: 1, buyer: "Sadid Hasan", amount: 30000, paid: true },
  { share: 2, buyer: "Imran Kabir", amount: 30000, paid: true },
  { share: 3, buyer: "Faruk Ahmed", amount: 30000, paid: true },
  { share: 4, buyer: "—", amount: 30000, paid: false },
  { share: 5, buyer: "—", amount: 30000, paid: false },
  { share: 6, buyer: "Nasir Uddin", amount: 30000, paid: false },
  { share: 7, buyer: "—", amount: 30000, paid: false },
];

export const PHOTO_TIMELINE = [
  { date: "2026-02-01", wt: 300, note: "Intake" },
  { date: "2026-04-01", wt: 340, note: "Settling well" },
  { date: "2026-06-01", wt: 372, note: "On target" },
  { date: "2026-08-01", wt: 405, note: "Good condition" },
  { date: "2026-09-22", wt: 428, note: "Latest" },
];

// ---------------------------------------------------------------------------
// Ledger (Module G)
// ---------------------------------------------------------------------------
export type Ledger = {
  date: string;
  farm: string;
  type: "Income" | "Cost" | "Stock bought" | "Payment";
  category: string;
  amount: number;
  method: string;
  party: string;
  animal?: string;
  by: string;
  note: string;
  backdated?: boolean;
  reversed?: boolean;
};
export const LEDGER: Ledger[] = [
  { date: "2026-09-22", farm: "Shapla Dairy", type: "Income", category: "Milk sales", amount: 14384, method: "bKash", party: "Milk Vita Agent", by: "Karim Sheikh", note: "232 L @ ৳62" },
  { date: "2026-09-22", farm: "Shapla Dairy", type: "Cost", category: "Feed used", amount: 3240, method: "—", party: "—", animal: "Milking Shed A", by: "System", note: "Feed issued (weighted avg cost)" },
  { date: "2026-09-22", farm: "Shapla Dairy", type: "Cost", category: "Vaccines used", amount: 88, method: "—", party: "—", by: "System", note: "FMD 4 dose issued" },
  { date: "2026-09-21", farm: "Shapla Dairy", type: "Stock bought", category: "Feed (stock)", amount: 17000, method: "Credit", party: "Rahim Traders", by: "Karim Sheikh", note: "Wheat bran — supplier payable" },
  { date: "2026-09-20", farm: "Rupsha Mixed", type: "Cost", category: "Stock loss / variance", amount: 1300, method: "—", party: "—", by: "Rahim Uddin", note: "Write-off: spoiled oil cake (approved)" },
  { date: "2026-09-20", farm: "Green Feedlot", type: "Income", category: "Animal sales", amount: 0, method: "—", party: "Sadid Hasan", by: "Owner", note: "Booking deposit ৳40,000 (see payments)" },
  { date: "2026-09-19", farm: "Shapla Dairy", type: "Payment", category: "Customer payment", amount: 30000, method: "Cash", party: "Rahela Store", by: "Karim Sheikh", note: "Against milk receivable" },
  { date: "2026-09-18", farm: "Account level", type: "Cost", category: "Labour", amount: 8000, method: "Cash", party: "Shared staff", by: "Owner", note: "Shared across farms by cost units (R-18)", },
  { date: "2026-09-17", farm: "Shapla Dairy", type: "Cost", category: "Semen straws used", amount: 320, method: "—", party: "—", animal: "COW-103", by: "System", note: "AI breeding straw issued" },
  { date: "2026-09-15", farm: "Green Feedlot", type: "Payment", category: "Supplier payment", amount: 12000, method: "Bank", party: "Feed Mill Ltd", by: "Owner", note: "Against purchase PO-1102" },
  { date: "2026-09-14", farm: "Shapla Dairy", type: "Cost", category: "Utilities", amount: 2400, method: "Cash", party: "REB", by: "Karim Sheikh", note: "Electricity — shared cost", backdated: true },
];

export const LEDGER_CATEGORIES = {
  cost: ["Feed used", "Medicine used", "Vaccines used", "Semen straws used", "Consumables used", "Stock loss & variance", "Labour", "Utilities", "Animal purchase", "Equipment", "Transport", "Vet & technician fees", "Rent", "Other"],
  income: ["Milk sales", "Animal sales", "Young stock sales", "Manure", "Other"],
};

export const MONEY_ACCOUNTS = [
  { name: "Cash box — Shapla", type: "Cash", farm: "Shapla Dairy", opening: 15000, in: 44000, out: 21000, closing: 38000 },
  { name: "bKash — Owner", type: "Mobile", farm: "Account level", opening: 8000, in: 62000, out: 18000, closing: 52000 },
  { name: "City Bank current", type: "Bank", farm: "Account level", opening: 240000, in: 120000, out: 96000, closing: 264000 },
  { name: "Cash box — Green Feedlot", type: "Cash", farm: "Green Feedlot", opening: 6000, in: 40000, out: 33000, closing: 13000 },
];

export const PAYABLES = [
  { supplier: "Rahim Traders", farm: "Shapla Dairy", purchases: 62000, paid: 45000, returns: 0, owed: 17000, due: "2026-10-05", aging: "Current" },
  { supplier: "Feed Mill Ltd", farm: "Green Feedlot", purchases: 88000, paid: 76000, returns: 2000, owed: 10000, due: "2026-09-30", aging: "Current" },
  { supplier: "Vet Pharma", farm: "Account level", purchases: 14000, paid: 8000, returns: 0, owed: 6000, due: "2026-09-20", aging: "30 days" },
];

export const MONTH_CLOSE = [
  { farm: "Shapla Dairy", month: "Aug 2026", status: "Closed", by: "Owner", on: "2026-09-03" },
  { farm: "Green Feedlot", month: "Aug 2026", status: "Closed", by: "Owner", on: "2026-09-03" },
  { farm: "Rupsha Mixed", month: "Aug 2026", status: "Open", by: "—", on: "—" },
  { farm: "Shapla Dairy", month: "Sep 2026", status: "Open", by: "—", on: "—" },
];

// consolidated P&L (FR-715)
export const CONSOLIDATED_PL = {
  rows: [
    { cat: "Milk sales", f1: 428000, f2: 0, f3: 186000, acc: 0 },
    { cat: "Animal sales", f1: 0, f2: 210000, f3: 44000, acc: 0 },
    { cat: "Young stock sales", f1: 12000, f2: 0, f3: 6000, acc: 0 },
    { cat: "Feed used", f1: -168000, f2: -94000, f3: -72000, acc: 0 },
    { cat: "Medicine & vaccines used", f1: -14200, f2: -6800, f3: -5400, acc: 0 },
    { cat: "Labour", f1: -60000, f2: -40000, f3: -36000, acc: -24000 },
    { cat: "Utilities & rent", f1: -22000, f2: -12000, f3: -14000, acc: 0 },
    { cat: "Stock loss & variance", f1: -1800, f2: -900, f3: -1300, acc: 0 },
  ],
};

// ---------------------------------------------------------------------------
// Profitability & performance (Module H)
// ---------------------------------------------------------------------------
export const COST_PER_ANIMAL = [
  { tag: "COW-101", purpose: "dairy", purchase: 0, feed: 42000, health: 3200, shared: 18000, total: 148200, note: "Born on farm" },
  { tag: "COW-103", purpose: "dairy", purchase: 95000, feed: 38000, health: 4400, shared: 19000, total: 176400, note: "" },
  { tag: "BULL-207", purpose: "fattening", purchase: 78000, feed: 31000, health: 1300, shared: 11000, total: 121300, note: "" },
  { tag: "GOAT-301", purpose: "breeding", purchase: 3500, feed: 3200, health: 400, shared: 1500, total: 8600, note: "" },
];

export const COST_PER_LITRE = [
  { scope: "COW-101 (lactation)", cost: 48200, litres: 1420, cpl: 33.9 },
  { scope: "COW-103 (lactation to date)", cost: 51000, litres: 1180, cpl: 43.2 },
  { scope: "Shapla dairy herd (Sep)", cost: 196400, litres: 5240, cpl: 37.5 },
  { scope: "All farms dairy (Sep)", cost: 312800, litres: 8420, cpl: 37.1 },
];

export const ATTENTION = [
  { animal: "COW-118 · Moyna", farm: "Shapla Dairy", reason: "Milk 22% below own 7-day average", severity: "high" },
  { animal: "BULL-208 · Kalu", farm: "Green Feedlot", reason: "Projected weight 452 kg < target 480 kg", severity: "high" },
  { animal: "GOAT-305", farm: "Rupsha Mixed", reason: "No recorded weight — using default", severity: "med" },
  { animal: "COW-118 · Moyna", farm: "Shapla Dairy", reason: "Weight stale (110 days old)", severity: "med" },
  { animal: "Shapla herd", farm: "Shapla Dairy", reason: "HS & Black quarter vaccination due in 7 days", severity: "med" },
  { animal: "Stock: Wheat Bran", farm: "Shapla Dairy", reason: "Low stock — 6 days of cover left", severity: "high" },
  { animal: "Batch: FMD-2026A", farm: "Shapla Dairy", reason: "Vaccine batch expiring in 24 days", severity: "low" },
  { animal: "Issue queue", farm: "Rupsha Mixed", reason: "1 stock issue awaiting reconciliation (reason needed)", severity: "med" },
];

// ---------------------------------------------------------------------------
// Reports & dashboard (Module I)
// ---------------------------------------------------------------------------
export const FARM_COMPARISON = [
  { farm: "Shapla Dairy", milk: 5240, cpl: 37.5, profit: 92000, stockValue: 71000, receivables: 45880, attention: 4 },
  { farm: "Green Feedlot", milk: 0, cpl: null, profit: 61000, stockValue: 48000, receivables: 0, attention: 2 },
  { farm: "Rupsha Mixed", milk: 3180, cpl: 36.6, profit: 38000, stockValue: 33000, receivables: 9000, attention: 3 },
];

export const STANDARD_REPORTS = [
  { name: "Production by animal / group / farm", module: "Dairy", scope: "Any farm scope" },
  { name: "Profit & loss (consolidated)", module: "Ledger", scope: "Per farm + account" },
  { name: "Receivables (aged)", module: "Ledger", scope: "Per customer" },
  { name: "Payables (aged)", module: "Ledger", scope: "Per supplier" },
  { name: "Inventory valuation & usage", module: "Inventory", scope: "As at any date" },
  { name: "Herd inventory by species & purpose", module: "Animals", scope: "Per farm / all" },
  { name: "Breeding performance", module: "Reproduction", scope: "Per animal" },
  { name: "Fattening season", module: "Fattening", scope: "Per farm / all" },
  { name: "Variances (milk unaccounted, stock)", module: "Ledger", scope: "Owner only" },
];

// ---------------------------------------------------------------------------
// Dashboard KPIs (Module I)
// ---------------------------------------------------------------------------
export const DASH = {
  milkToday: 268,
  milkLastWeek: 254,
  cashCollected: 118640,
  cashBilled: 168520,
  attentionCount: 8,
  cplMonth: 37.1,
  cplLastMonth: 38.4,
};

// ---------------------------------------------------------------------------
// Calculation rules (§5) — for the Settings/Rules reference screen
// ---------------------------------------------------------------------------
export const CALC_RULES = [
  { id: "R-01", figure: "Feed allocated to an animal (group feeding)", formula: "group feed × (weight × stage rate) ÷ Σ(weight × stage rate)" },
  { id: "R-02", figure: "Feed cost per animal per day", formula: "Σ (qty allocated × issue unit cost from R-20)" },
  { id: "R-03", figure: "Shared cost per animal", formula: "farm shared cost × (cost units × days active) ÷ Σ(cost units × days active)" },
  { id: "R-04", figure: "Total cost per animal", formula: "purchase + Σ feed + Σ own treatment/straw + Σ shared + Σ account-level (R-18)" },
  { id: "R-05", figure: "Cost per litre, one animal", formula: "lactation cost ÷ litres produced (incl. dry-period carry R-06)" },
  { id: "R-06", figure: "Dry-period carry", formula: "cost from dry-off to delivery carried to next lactation" },
  { id: "R-07", figure: "Cost per litre, farm dairy herd", formula: "period dairy-herd cost ÷ litres produced (cost view only)" },
  { id: "R-08", figure: "Realised milk income per animal", formula: "farm milk revenue × (animal litres ÷ farm litres)" },
  { id: "R-09", figure: "Milk value not realised", formula: "home/calf/spoiled litres × avg realised price" },
  { id: "R-10", figure: "Dairy profit per animal", formula: "R-08 income − cost (dry month → carried, not loss)" },
  { id: "R-11", figure: "Average daily gain (ADG)", formula: "(latest weight − earlier weight) ÷ days between" },
  { id: "R-12", figure: "Projected weight on target date", formula: "latest weight + (recent ADG × days remaining)" },
  { id: "R-13", figure: "Break-even price & margin", formula: "cost to date + (avg daily cost × days remaining)" },
  { id: "R-14", figure: "Expected delivery date", formula: "breeding date + gestation days (cattle 280, goat 146)" },
  { id: "R-15", figure: "Milk drop flag", formula: "session yield < (1 − 15%) × own 7-day average" },
  { id: "R-16", figure: "Fallback weight", formula: "default weight for species/stage; figures marked 'default used'" },
  { id: "R-17", figure: "Stale weight", formula: "older than 90 d (dairy/breeding) / 14 d (fattening) → flagged" },
  { id: "R-18", figure: "Account-level cost to farms", formula: "account cost × farm Σ(units × days) ÷ account Σ(units × days)" },
  { id: "R-19", figure: "Landed & weighted average cost", formula: "landed line cost ÷ qty; new avg = blended per item per farm" },
  { id: "R-20", figure: "Issue cost", formula: "qty issued × weighted average at time of issue" },
  { id: "R-21", figure: "Issue beyond stock", formula: "valued at current average; difference posts as variance" },
  { id: "R-22", figure: "Stock value", formula: "Σ(qty × weighted avg) = ledger stock balance" },
  { id: "R-23", figure: "Days of cover", formula: "qty on hand ÷ avg daily issued over last 14 days" },
  { id: "R-24", figure: "Count variance", formula: "(counted − system) × weighted average cost" },
  { id: "R-25", figure: "Backdated stock movement", formula: "recompute avg & later issue costs from date forward (open months)" },
];

export const DEFAULT_VALUES = [
  { setting: "Cattle gestation", value: "280 days (per breed)", status: "Sourced", basis: "Breed averages 279–283 d [13]; Holstein ~276 d [14]" },
  { setting: "Goat gestation", value: "146 days", status: "Sourced", basis: "Black Bengal 143–148 d [15][12]" },
  { setting: "Dry-off before delivery (cattle)", value: "60 days", status: "Sourced", basis: "45–65 d recommended [16]; 60 d standard [14]" },
  { setting: "Dry-off before delivery (goats)", value: "Off; set by farm", status: "Assumption", basis: "Most Black Bengal raised for meat" },
  { setting: "Heat cycle length", value: "21 days (cattle & goats)", status: "Earlier spec", basis: "21 d cattle [1]; goat is assumption" },
  { setting: "Pregnancy check after breeding", value: "45 days", status: "Earlier spec", basis: "45–60 d [1]" },
  { setting: "Waiting period after delivery", value: "45 days", status: "Earlier spec", basis: "[1]" },
  { setting: "Delivery reminders", value: "30 & 20 days before, and on the day", status: "Brief", basis: "Management brief" },
  { setting: "Cattle vaccines", value: "FMD, HS, anthrax, black quarter, LSD, deworming", status: "Sourced", basis: "Diseases of concern in BD [7]; intervals [11] to confirm" },
  { setting: "Goat vaccines", value: "PPR, deworming (interval by vet)", status: "Sourced", basis: "PPR main cause of goat deaths [12]" },
  { setting: "Cost units", value: "Weight ÷ 454 kg", status: "Sourced", basis: "Animal unit convention [2]" },
  { setting: "Milk drop threshold", value: "15% below own 7-day avg", status: "Earlier spec", basis: "[1]" },
  { setting: "Overdue task escalation", value: "48 hours", status: "Earlier spec", basis: "[1]" },
  { setting: "Stale weight limit", value: "90 d dairy/breeding; 14 d fattening", status: "Assumption", basis: "No source reviewed" },
  { setting: "Batch expiry warning", value: "30 days before", status: "Assumption", basis: "No source reviewed" },
  { setting: "Days-of-cover window", value: "14 days", status: "Assumption", basis: "No source reviewed" },
  { setting: "Qurbani shares", value: "7 per cattle, 1 per goat", status: "Assumption", basis: "Common practice; scope to confirm" },
];

export const SPECIES_CONFIG = [
  { species: "Cattle", gestation: "280 d", heat: "21 d", dryOff: "60 d", costUnit: "Weight ÷ 454", defWeightAdult: "450 kg", weighInterval: "90 d", qurbaniShares: 7 },
  { species: "Goat (Black Bengal)", gestation: "146 d", heat: "21 d", dryOff: "Off", costUnit: "Weight ÷ 454", defWeightAdult: "18 kg", weighInterval: "30 d", qurbaniShares: 1 },
];
