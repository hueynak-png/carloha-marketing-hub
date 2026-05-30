export const brochureVehicles = {
  tiggo9: {
    label: "Tiggo9",
    copy: {
      CN: {
        title: "奇瑞Tiggo9 2026款（2.0T 四驱） / Tiggo9 PHEV（1.5T，3电机，四驱）",
        specs: {
          dimensions: "4810*1925*1741",
          tireSize: "235/55 R20",
          price: "50000（2026款）/58000美金（PHEV）",
          warranty: "6年20万公里（先到为准）",
          maintenance: "6年或24次（先到为准）",
        },
      },
      EN: {
        title: "Chery Tiggo9 2026 (2.0T AWD) / Tiggo9 PHEV (1.5T, 3-Motor AWD)",
        specs: {
          dimensions: "4810*1925*1741",
          tireSize: "235/55 R20",
          price: "USD 50,000 (2026 model) / USD 58,000 (PHEV)",
          warranty: "6 years / 200,000 km (whichever comes first)",
          maintenance: "6 years or 24 services (whichever comes first)",
        },
      },
    },
    logo: "/logo.png",
    images: [
      {
        id: "sideDisplay",
        label: "Side display",
        src: "/brochure-assets/tiggo9-side-display.jpeg",
      },
      {
        id: "rear",
        label: "Rear",
        src: "/brochure-assets/tiggo9-rear.jpeg",
      },
      {
        id: "interiorDriver",
        label: "Interior",
        src: "/brochure-assets/tiggo9-interior-driver.jpeg",
      },
      {
        id: "hero",
        label: "Main visual",
        src: "/brochure-assets/tiggo9-front.jpeg",
      },
      {
        id: "sideProfile",
        label: "Side profile",
        src: "/brochure-assets/tiggo9-side-profile.jpeg",
      },
      {
        id: "rearSeats",
        label: "Rear seats",
        src: "/brochure-assets/tiggo9-rear-seats.jpeg",
      },
      {
        id: "cargo",
        label: "Cargo",
        src: "/brochure-assets/tiggo9-cargo.jpeg",
      },
      {
        id: "cabinWide",
        label: "Cabin wide",
        src: "/brochure-assets/tiggo9-cabin-wide.jpeg",
      },
    ],
  },
  himla: {
    label: "Himla",
    copy: {
      CN: {
        title: "奇瑞Himla 皮卡（2.4L 四驱）",
        specs: {
          dimensions: "5330*1920*1865",
          tireSize: "245/70 R17",
          price: "27500美金",
          warranty: "6年20万公里（先到为准）",
          maintenance: "",
        },
      },
      EN: {
        title: "Chery Himla Pickup (2.4L 4WD)",
        specs: {
          dimensions: "5330*1920*1865",
          tireSize: "245/70 R17",
          price: "USD 27,500",
          warranty: "6 years / 200,000 km (whichever comes first)",
          maintenance: "",
        },
      },
    },
    logo: "/logo.png",
    images: [
      {
        id: "front",
        label: "Front",
        src: "/brochure-assets/himla-front.png",
      },
      {
        id: "sideProfile",
        label: "Side profile",
        src: "/brochure-assets/himla-side-profile.png",
      },
      {
        id: "rearBed",
        label: "Rear bed",
        src: "/brochure-assets/himla-rear-bed.png",
      },
      {
        id: "frontThreeQuarter",
        label: "Front three-quarter",
        src: "/brochure-assets/himla-front-three-quarter.png",
      },
      {
        id: "dashboard",
        label: "Dashboard",
        src: "/brochure-assets/himla-dashboard.png",
      },
      {
        id: "frontSeat",
        label: "Front seat",
        src: "/brochure-assets/himla-front-seat.png",
      },
      {
        id: "rearSeats",
        label: "Rear seats",
        src: "/brochure-assets/himla-rear-seats.png",
      },
    ],
  },
  tiggo8Pro: {
    label: "Tiggo8 Pro",
    copy: {
      CN: {
        title: "奇瑞Tiggo8 Pro（2.0T 2驱）",
        specs: {
          dimensions: "4722*1860*1705",
          tireSize: "235/55 R18",
          price: "33000美金",
          warranty: "6年20万公里（先到为准）",
          maintenance: "6年或24次（先到为准）",
        },
      },
      EN: {
        title: "Chery Tiggo8 Pro (2.0T 2WD)",
        specs: {
          dimensions: "4722*1860*1705",
          tireSize: "235/55 R18",
          price: "USD 33,000",
          warranty: "6 years / 200,000 km (whichever comes first)",
          maintenance: "6 years or 24 services (whichever comes first)",
        },
      },
    },
    logo: "/logo.png",
    images: [
      {
        id: "front",
        label: "Front",
        src: "/brochure-assets/tiggo8-pro-front.png",
      },
      {
        id: "frontThreeQuarter",
        label: "Front three-quarter",
        src: "/brochure-assets/tiggo8-pro-front-three-quarter.png",
      },
      {
        id: "sideProfile",
        label: "Side profile",
        src: "/brochure-assets/tiggo8-pro-side-profile.png",
      },
      {
        id: "rear",
        label: "Rear",
        src: "/brochure-assets/tiggo8-pro-rear.png",
      },
      {
        id: "driverCockpit",
        label: "Driver cockpit",
        src: "/brochure-assets/tiggo8-pro-driver-cockpit.png",
      },
      {
        id: "dashboardWide",
        label: "Dashboard wide",
        src: "/brochure-assets/tiggo8-pro-dashboard-wide.png",
      },
      {
        id: "rearCabin",
        label: "Rear cabin",
        src: "/brochure-assets/tiggo8-pro-rear-cabin.png",
      },
    ],
  },
};

export const defaultBrochureVehicleId = "tiggo9";

export const promotionBrochureDefaults = {
  logo: "/logo.png",
  heading: "2026 MAY PROMOTION",
  subheading: "CARLOHA NIGERIA LTD",
  footerNotes: [
    "Prices valid while stocks last",
    "Vehicle license and insurance charges are extra",
    "Prices are subject to change without prior notice",
    "Vehicle delivery attracts extra charges",
  ],
  contactLabel: "CONTACT PERSON:",
  contactValue: "Edit contact details",
  locations: "HEADQUARTER: Third Axial Road, Beside Heyden gas Station, 105102 Ketu, Lagos.",
  website: "carloha.com.ng  |  chery.com.ng",
  vehicles: [
    {
      id: "promo-tiggo9",
      name: "TIGGO 9",
      image: { id: "promo-tiggo9-image", label: "Tiggo 9", src: "/vehicles/tiggo9.png" },
      specs: "✓ 2.0L TGDI · 187kW / 390Nm\n✓ 8AT + AWD · 4 off-road modes\n✓ L2 ADAS · 540° panoramic camera\n✓ 15.6\" screen · Snapdragon 8155",
      price: "Edit price",
      promoPrice: "Edit promo price",
    },
    {
      id: "promo-tiggo8pro",
      name: "TIGGO 8 PRO",
      image: { id: "promo-tiggo8pro-image", label: "Tiggo 8 Pro", src: "/vehicles/tiggo8pro.png" },
      specs: "✓ Global best-seller · 7 seats\n✓ 889L boot · flexible family space\n✓ 2.0TCI · 144kW / 250Nm\n✓ Sony audio · 360° 3D camera",
      price: "Edit price",
      promoPrice: "Edit promo price",
    },
    {
      id: "promo-tiggo4",
      name: "TIGGO 4",
      image: { id: "promo-tiggo4-image", label: "Tiggo 4", src: "/vehicles/tiggo4.png" },
      specs: "✓ 1.5TCI · 108kW / 210Nm\n✓ 7 airbags · full L2 ADAS\n✓ Dual 10.25\" screens\n✓ 360° HD panoramic camera",
      price: "Edit price",
      promoPrice: "Edit promo price",
    },
    {
      id: "promo-tiggo2pro",
      name: "TIGGO 2 PRO",
      image: { id: "promo-tiggo2pro-image", label: "Tiggo 2 Pro", src: "/vehicles/tiggo2pro.png" },
      specs: "✓ 1.5L + CVT · smooth efficiency\n✓ 9\" HD touchscreen\n✓ Apple CarPlay & Android Auto\n✓ 420L boot · reversing camera",
      price: "Edit price",
      promoPrice: "Edit promo price",
    },
    {
      id: "promo-arrizo5",
      name: "ARRIZO 5",
      image: { id: "promo-arrizo5-image", label: "Arrizo 5", src: "/vehicles/arrizo5.png" },
      specs: "✓ 1.5L engine\n✓ 4,572mm length · 2,670mm wheelbase\n✓ Multifunction steering wheel\n✓ Comfort seats · 6-way adjustment",
      price: "Edit price",
      promoPrice: "Edit promo price",
    },
    {
      id: "promo-himla",
      name: "HIMLA",
      image: { id: "promo-himla-image", label: "Himla", src: "/vehicles/himla.png" },
      specs: "✓ Best-in-class 1,276L cargo\n✓ BorgWarner 4WD · 220mm clearance\n✓ 3,000kg towing · 600mm wading\n✓ 15.6\" 2.5K screen · 360° camera",
      price: "Edit price",
      promoPrice: "Edit promo price",
    },
    {
      id: "promo-icaurv23",
      name: "iCAR V23",
      image: { id: "promo-icaurv23-image", label: "iCAR V23", src: "/vehicles/icaurv23.png" },
      specs: "✓ 501km WLTC · 81.8kWh battery\n✓ AWD · 6 drive modes\n✓ 42-min fast charge · 3.3kW V2L\n✓ L2 ADAS · Snapdragon 8155",
      price: "Edit price",
      promoPrice: "Edit promo price",
    },
  ],
};
