export type WashPackage = {
  slug: string;
  name: string;
  price: number;
  features: string[];
  bookable: boolean;
};

export type TieredPackage = {
  name: string;
  description: string;
  timing: string;
  insideFeatures?: string[];
  outsideFeatures?: string[];
  tiers: { label: string; price: number }[];
  addOns?: { label: string; price: number }[];
  startingAt?: number;
};

export type WashExtra = {
  name: string;
  price: string;
};

export const SERVICE_DISCLAIMER =
  "Our services will not remove pet hair, human or pet contaminants, spilled sauces, or broken glass. We do not spray or clean navigation screens or displays due to the risk of damage.";

export const INSIDE_OUTSIDE_WASHES: WashPackage[] = [
  {
    slug: "rva-ceramic-shine",
    name: "RVA Ceramic Shine",
    price: 45.95,
    bookable: true,
    features: [
      "Soft, gentle wash",
      "Hand dry with soft microfiber towel",
      "Vacuum",
      "Inside and outside windows and mirrors",
      "Undercarriage wash with Rustite",
      "Simoniz liquid ceramic sealant",
      "Rainbow conditioner",
      "Tunnel wheel spray",
      "Wheels hand finished",
      "Tire shine",
      "Trim shine",
      "Clean console, instrument panel, steering column, and dashboard",
      "Clean all cup holders",
      "4 mats cleaned",
      "Door panels surface cleaned",
    ],
  },
  {
    slug: "extreme-hot-wax",
    name: "Extreme Hot Wax",
    price: 35.45,
    bookable: true,
    features: [
      "Soft, gentle wash",
      "Hand dry with soft microfiber towel",
      "Vacuum",
      "Inside and outside windows and mirrors",
      "Undercarriage wash with Rustite",
      "Simoniz hot wax",
      "Rainbow conditioner",
      "Tunnel wheel spray",
      "Wheels hand finished",
      "Tire shine",
      "Clean console, instrument panel, steering column, and dashboard",
      "Clean 4 cup holders",
      "2 front mats cleaned",
      "Door panels damp wiped",
    ],
  },
  {
    slug: "rainbow",
    name: "Rainbow",
    price: 28.95,
    bookable: true,
    features: [
      "Soft, gentle wash",
      "Hand dry with soft microfiber towel",
      "Vacuum",
      "Inside and outside windows and mirrors",
      "Undercarriage wash with Rustite",
      "Simoniz liquid double bond wax",
      "Rainbow conditioner",
      "Tunnel wheel spray",
      "Wheels hand finished",
      "Tire shine",
      "Clean console, instrument panel, steering column, and dashboard",
      "Dust 2 cup holders",
      "Door panels dusted",
    ],
  },
];

export const OUTSIDE_ONLY_WASHES: WashPackage[] = [
  {
    slug: "ultimate",
    name: "Ultimate",
    price: 18.95,
    bookable: true,
    features: [
      "Soft, gentle wash",
      "Hand dry with soft microfiber towel",
      "Outside windows and mirrors",
      "Undercarriage wash with Rustite",
      "Simoniz liquid ceramic sealant",
      "Rainbow conditioner",
      "Tunnel wheel spray",
      "Wheels hand finished",
      "Tire shine",
    ],
  },
  {
    slug: "deluxe",
    name: "Deluxe",
    price: 15.95,
    bookable: true,
    features: [
      "Soft, gentle wash",
      "Hand dry with soft microfiber towel",
      "Outside windows and mirrors",
      "Undercarriage wash with Rustite",
      "Simoniz hot wax",
      "Rainbow conditioner",
      "Tunnel wheel spray",
      "Wheels hand finished",
      "Tire shine",
    ],
  },
  {
    slug: "quick",
    name: "Quick",
    price: 12.95,
    bookable: true,
    features: [
      "Soft, gentle wash",
      "Hand dry with soft microfiber towel",
      "Outside windows and mirrors",
      "Simoniz liquid double bond wax",
      "Tunnel wheel spray",
    ],
  },
];

export const MINI_DETAIL_PACKAGES: TieredPackage[] = [
  {
    name: "Inside Super Clean",
    description:
      "A more thorough inside cleaning than our regular wash. This is not a full detail service.",
    timing:
      "Allow 35-45 minutes after the wash is finished. Combo services take about an hour.",
    insideFeatures: [
      "Extreme Hot Wax wash package",
      "Clean and apply treatment to the dashboard",
      "Clean and treat leather seats",
      "Deep clean and treat door panels",
      "Clean front and rear passenger cup holders",
      "Clean and shampoo (4) carpeted mats",
      "Compressed air crevice debris removal",
    ],
    tiers: [
      { label: "Sedans, etc.", price: 99.95 },
      { label: "Mid-size truck, crossover, etc.", price: 109.95 },
      { label: "Large SUV, mini van, truck, etc.", price: 119.95 },
      { label: "XL SUV, etc.", price: 129.95 },
    ],
    addOns: [
      { label: "Third row seats", price: 10 },
      { label: "Include professional express wax", price: 35 },
    ],
  },
  {
    name: "Pro Wax",
    description:
      "Our best outside protection and shine, applied with professional equipment.",
    timing:
      "Allow 35-45 minutes after the wash is finished. Combo services take about an hour.",
    outsideFeatures: [
      "Outside wash and towel dry",
      "Undercarriage wash with Rustite",
      "Simoniz wax applied with a professional orbital buffer",
      "Wax removed with a thick-pile microfiber cloth",
      "Finish enhanced with spray ceramic for gloss and protection",
    ],
    insideFeatures: [
      "Vacuum",
      "Wash all windows and mirrors",
      "Clean console, instrument panel, steering column, and dashboard",
      "Clean (4) cup holders",
      "Door panels damp wiped (not detailed)",
      "Clean (2) front floor mats",
    ],
    tiers: [
      { label: "Sedans, etc.", price: 89.95 },
      { label: "Mid-size truck, crossover, etc.", price: 99.95 },
      { label: "Large SUV, mini van, truck, etc.", price: 109.95 },
      { label: "XL SUV, etc.", price: 119.95 },
    ],
    addOns: [
      { label: "Third row seats", price: 10 },
      { label: "Include Interior Super Clean", price: 45 },
    ],
  },
  {
    name: "Combo",
    description:
      "Our best inside and outside service. Interior Super Clean plus Pro Wax for an impressive cleanup on most vehicles.",
    timing:
      "Allow about an hour after the wash is finished, depending on traffic.",
    startingAt: 134.95,
    tiers: [],
  },
];

export const WASH_EXTRAS: WashExtra[] = [
  { name: "Pro Wax, hand-applied (wash not included)", price: "Starting at $60.00" },
  { name: "Hot Wax (tunnel-applied)", price: "$3.00" },
  { name: "Liquid Ceramic Sealant (tunnel-applied)", price: "$4.00" },
  { name: "Dash Protect", price: "$5.00" },
  { name: "Exterior Trim Shine", price: "$5.00" },
  { name: "Single rubber or carpet mat shampoo/wash", price: "$5.00" },
  { name: "Single row mat shampoo/wash", price: "$8.00" },
  { name: "Rear hatch mat shampoo/wash", price: "$8.00" },
];

export const WASH_COMPARISON = {
  headers: [
    "RVA Ceramic Shine",
    "Extreme Hot Wax",
    "Rainbow",
    "Ultimate",
    "Deluxe",
    "Quick",
  ],
  startingPrices: [45.95, 35.45, 28.95, 18.95, 15.95, 12.95],
  rows: [
    { label: "Soft, gentle wash", values: [true, true, true, true, true, true] },
    {
      label: "Hand dry with soft microfiber towel",
      values: [true, true, true, true, true, true],
    },
    {
      label: "Outside windows and mirrors",
      values: [true, true, true, true, true, true],
    },
    {
      label: "Undercarriage wash with Rustite",
      values: [true, true, true, true, true, false],
    },
    {
      label: "Tunnel applied wax",
      values: [
        "Ceramic sealant",
        "Hot wax",
        "Double bond wax",
        "Ceramic sealant",
        "Hot wax",
        "Double bond wax",
      ],
    },
    {
      label: "Rainbow conditioner",
      values: [true, true, true, true, true, false],
    },
    {
      label: "Tunnel wheel spray",
      values: [true, true, true, true, true, true],
    },
    {
      label: "Wheels hand finished",
      values: [true, true, true, true, true, false],
    },
    { label: "Tire shine", values: [true, true, true, true, true, false] },
    { label: "Trim shine", values: [true, false, false, false, false, false] },
    { label: "Vacuum", values: [true, true, true, false, false, false] },
    {
      label: "Inside windows",
      values: [true, true, true, false, false, false],
    },
    {
      label: "Console and dashboard cleaned",
      values: [true, true, true, false, false, false],
    },
    {
      label: "Cup holders",
      values: ["Clean all", "Clean 4", "Dust 2", false, false, false],
    },
    {
      label: "Floor mats",
      values: ["4 mats", "2 front", false, false, false, false],
    },
    {
      label: "Door panels",
      values: ["Surface cleaned", "Damp wiped", "Dusted", false, false, false],
    },
  ],
};

export const BOOKABLE_WASHES = [...INSIDE_OUTSIDE_WASHES, ...OUTSIDE_ONLY_WASHES];
