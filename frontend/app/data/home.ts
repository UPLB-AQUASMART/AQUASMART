export type GoalIcon =
  | "soil"
  | "weather"
  | "water"
  | "monitoring"
  | "notifications";

export type GoalItem = {
  icon: GoalIcon;
  title: string;
  highlight: string;
  body: string;
};

export type ForecastIcon = "sun" | "rain" | "cloud";

export type ForecastItem = {
  temp: string;
  day: string;
  icon: ForecastIcon;
};

export type LearningModule = {
  code: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  pdfHref: string;
};

export const navItems = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/about" },
  { label: "Simulation", href: "/#simulations" },
  { label: "Modules", href: "/modules" },
  { label: "Weather", href: "/forecast" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
  { label: "Partners", href: "/partners" },
];

export const goals: GoalItem[] = [
  {
    icon: "soil",
    title: "Soil Moisture Sensor",
    highlight: "Moisture",
    body: "3-in-1 sensor capable of measuring capacitance, temperature, and salinity.",
  },
  {
    icon: "weather",
    title: "AI Weather Forecasting",
    highlight: "Weather",
    body: "Automated checks throughout the code to confirm that files and models are loaded correctly.",
  },
  {
    icon: "water",
    title: "Sustainable Water Usage",
    highlight: "Water",
    body: "Maximizes water resources by providing a sustainable irrigation plan to farmers.",
  },
  {
    icon: "monitoring",
    title: "Real-time Monitoring",
    highlight: "Real-time",
    body: "Provides real-time data for efficient use and notifications.",
  },
  {
    icon: "notifications",
    title: "SMS Notifications",
    highlight: "SMS",
    body: "Text notifications to notify farmers of irrigation reminders and related concerns.",
  },
];

export const parameterNames = [
  "pH Level",
  "Temperature",
  "Salinity",
  "Electrical Conductivity",
  "TDS",
];

export const parameterCards = [
  {
    active: "pH Level",
    image: "/assets/1.gif",
    description:
      "pH: Represents the concentration of hydrogen ions (H+) in a solution",
  },
  {
    active: "Temperature",
    image: "/assets/2.gif",
    description:
      "Temperature: Tracks water temperature changes that affect crop health and sensor readings",
  },
  {
    active: "Salinity",
    image: "/assets/3.gif",
    description:
      "Salinity: Measures dissolved salts that can stress crops and reduce irrigation efficiency",
  },
  {
    active: "Electrical Conductivity",
    image: "/assets/4.gif",
    description:
      "Electrical Conductivity: Estimates ion concentration to help identify water quality shifts",
  },
  {
    active: "TDS",
    image: "/assets/5.gif",
    description:
      "TDS: Monitors suspended particles that affect clarity, flow, and irrigation quality",
  },
];

export const simulations = [
  {
    title: "Groundwater",
    highlight: "Simulation",
    href: "/simulation/groundwater",
    states: [
      {
        label: "Scenario overview",
        image: "/figma/groundwater-state-overview.png",
        body: "Review total pumping, safe-yield utilization, average drawdown, recovery time, and the current well footprint before changing the model.",
      },
      {
        label: "Well configuration",
        image: "/figma/groundwater-state-configure.png",
        body: "Add another well, position it on the field, and adjust its daily discharge while statistics and water-quality readings recalculate dynamically.",
      },
    ],
  },
  {
    title: "Spatial Drawdown",
    highlight: "Map",
    href: "/simulation",
    states: [
      {
        label: "Regional context",
        image: "/figma/drawdown-state-regional.png",
        body: "Locate active wells and monitoring points across the field to see where pumping pressure may influence neighboring zones.",
      },
      {
        label: "Aquifer profile",
        image: "/figma/drawdown-state-aquifer.png",
        body: "Inspect the layered aquifer cross-section, well depth, and pumping controls to understand how extraction moves through the subsurface.",
      },
      {
        label: "Hydraulic head",
        image: "/figma/drawdown-state-head.png",
        body: "Compare hydraulic-head contours and flow gradients around wells to identify drawdown cones, interference, and higher-risk areas.",
      },
    ],
  },
];

export const learningModules: LearningModule[] = [
  {
    code: "AQS 101",
    title: "Groundwater Monitoring",
    description:
      "Understand how groundwater levels are measured, interpreted, and translated into practical irrigation insights.",
    image: "/figma/drawdown-state-head.png",
    category: "Groundwater",
    date: "May 15, 2025",
    pdfHref: "#",
  },
  {
    code: "AQS 102",
    title: "Smart Sensor Networks",
    description:
      "Learn how field sensors collect pH, salinity, temperature, EC, and TDS data for real-time farm decisions.",
    image: "/figma/drawdown-card.png",
    category: "AI & Technology",
    date: "May 10, 2025",
    pdfHref: "#",
  },
  {
    code: "AQS 103",
    title: "Weather Forecasting",
    description:
      "Explore how rainfall and evapotranspiration forecasts support climate-responsive water management.",
    image: "/assets/weather-preview-light-rain.png",
    category: "Climate Resilience",
    date: "April 28, 2025",
    pdfHref: "#",
  },
  {
    code: "AQS 104",
    title: "Irrigation Planning",
    description:
      "Study how pump-to-crop water movement, soil moisture, and crop needs shape irrigation recommendations.",
    image: "/assets/field.png",
    category: "Field Studies",
    date: "April 12, 2025",
    pdfHref: "#",
  },
  {
    code: "AQS 105",
    title: "Water Quality Basics",
    description:
      "Review key water-quality indicators and how they affect crop health, salinity risk, and sustainable use.",
    image: "/assets/weather-clouds.png",
    category: "Water Quality",
    date: "March 30, 2025",
    pdfHref: "#",
  },
  {
    code: "AQS 106",
    title: "Decision Dashboards",
    description:
      "See how monitoring data, model outputs, and alerts come together in clear dashboards for farm action.",
    image: "/assets/field.png",
    category: "AI & Technology",
    date: "March 15, 2025",
    pdfHref: "#",
  },
];

export const forecast: ForecastItem[] = [
  { temp: "22\u00b0", day: "Friday, 1 Nov", icon: "sun" },
  { temp: "19\u00b0", day: "Sunday, 3 Nov", icon: "rain" },
  { temp: "25\u00b0", day: "Saturday, 2 Nov", icon: "cloud" },
  { temp: "20\u00b0", day: "Monday, 4 Nov", icon: "rain" },
  { temp: "22\u00b0", day: "Tuesday, 5 Nov", icon: "rain" },
  { temp: "18\u00b0", day: "Wednesday, 6 Nov", icon: "rain" },
  { temp: "21\u00b0", day: "Thursday, 7 Nov", icon: "rain" },
];

export const partners = [
  "UNESCO",
  "Nestle",
  "SWP Youth",
  "EuroGeosciences",
  "World Food Forum",
  "FAO",
];

export const footerColumns = [
  {
    title: "Quick Links",
    links: [
      { label: "About", href: "/#about" },
      { label: "Reports & Research", href: "/#simulations" },
      { label: "Team", href: "/team" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Modules",
    links: [
      { label: "Groundwater", href: "/modules" },
      { label: "Aquifer", href: "/modules" },
      { label: "FloPy", href: "/modules" },
      { label: "MODFLOW", href: "/modules" },
      { label: "Add Module +", href: "/modules" },
    ],
  },
  {
    title: "Partners",
    links: partners.map((partner) => ({ label: partner, href: "/partners" })),
  },
];
