export const vehicleOrder = ["Tiggo 9", "Himla", "iCAUR V23", "Tiggo 2 Pro", "Tiggo 4 Pro", "Tiggo 8 Pro", "Arrizo 5", "QQ3"];
export const materialTypeOrder = ["Specification Sheet", "Brochures", "Flyers", "Official Photos", "Official Videos", "Social Media Videos", "Training Materials"];
export const generalOrder = ["Dealer Guidelines", "Brand Assets", "Logo", "Event Materials", "Showroom Materials", "Holiday Campaigns", "PR Articles"];


function descriptionFor(type, vehicle) {
  const descriptions = {
    "Specification Sheet": "Official specification sheet.",
    "Brochures": "Official brochures.",
    "Flyers": "Official flyers.",
    "Official Photos": "Official vehicle photos.",
    "Official Videos": "Official vehicle videos.",
    "Social Media Videos": "Social media videos for promotion.",
    "Training Materials": "Training materials for sales and dealers."
  };
  return `${descriptions[type] || "Official marketing materials."} For ${vehicle}.`;
}

const vehicleLinks = {
  "Tiggo 9": "https://drive.google.com/drive/folders/1ZnPuOvzazPDTABAfjhuVOPSTMRyDFBbA?usp=drive_link",
  "Himla": "https://drive.google.com/drive/folders/1W_-WcSZc8-oReGnjP7uS6L52Z9MgnVgt?usp=drive_link",
  "iCAUR V23": "https://drive.google.com/drive/folders/1Dft5u21m8XymOuVGsqcH-9UII-M517l2?usp=drive_link",
  "Tiggo 2 Pro": "https://drive.google.com/drive/folders/1L_NKFOQgZDG3SI7sMgqUTJ5OHbSgxwgn?usp=drive_link",
  "Tiggo 4 Pro": "https://drive.google.com/drive/folders/1FYk8z4jdMTEX_1EOyMgWRhQVHQLb0yi0?usp=drive_link",
  "Tiggo 8 Pro": "https://drive.google.com/drive/folders/18eMWpwVulNOzVrhPHUhYF2JWkDgUsdZg?usp=drive_link",
  "Arrizo 5": "https://drive.google.com/drive/folders/1MMvvoCQBuwb9Ym_ZxLTohFsNEMoz5SVU?usp=drive_link",
  "QQ3": "Coming Soon"
};

export const seedVehicleMaterials = vehicleOrder.flatMap(vehicle =>
  materialTypeOrder.map(type => ({
    Vehicle: vehicle,
    "Vehicle Image": "",
    "Last Updated": vehicle === "QQ3" ? "" : "2026-05",
    "Material Type": type,
    Title: `${vehicle} ${type}`,
    Description: descriptionFor(type, vehicle),
    "Google Drive Link": vehicleLinks[vehicle],
    "File Format": "Folder",
    Language: "EN",
    Audience: "All",
    "Usage Note": "",
    Status: vehicle === "QQ3" ? "Coming Soon" : "Ready"
  }))
);

export const seedGeneralMaterials = generalOrder.map(category => ({
  Category: category,
  Title: category,
  Description: `${category} folder for marketing support.`,
  "Google Drive Link": "Coming Soon",
  "File Format": "Folder",
  Language: "EN",
  Audience: "All",
  "Usage Note": "",
  Status: "Coming Soon",
  "Last Updated": ""
}));
