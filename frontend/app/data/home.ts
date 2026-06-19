export type GoalIcon = "soil" | "weather" | "water" | "monitoring" | "notifications";

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

export const navItems = [
  { label: "Home", href: "#home", active: true },
  { label: "About", href: "#about" },
  { label: "Simulation", href: "#simulations" },
  { label: "Weather", href: "#weather" },
  { label: "Team", href: "#partners" },
  { label: "Contact", href: "#contact" },
  { label: "Partners", href: "#partners" },
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
  "Turbidity",
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
    active: "Turbidity",
    image: "/assets/5.gif",
    description:
      "Turbidity: Monitors suspended particles that affect clarity, flow, and irrigation quality",
  },
];

export const simulations = [
  {
    title: "Groundwater",
    highlight: "Simulation",
    href: "/simulation",
    image: "/figma/groundwater-card.png",
    body: "Observe groundwater movement, well behavior, and field-level irrigation effects through a simplified interactive model.",
  },
  {
    title: "Spatial Drawdown",
    highlight: "Map",
    href: "/simulation",
    image: "/figma/drawdown-card.png",
    body: "Compare spatial drawdown changes and understand how pumping pressure affects the surrounding area.",
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
      { label: "About", href: "#about" },
      { label: "Reports & Research", href: "#simulations" },
      { label: "Team", href: "#partners" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Monitoring",
    links: [
      { label: "Live Monitoring", href: "#about" },
      { label: "Updates", href: "#weather" },
      { label: "AI Insights", href: "#weather" },
      { label: "Data Portal", href: "#simulations" },
    ],
  },
  {
    title: "Partners",
    links: partners.map((partner) => ({ label: partner, href: "#partners" })),
  },
];
