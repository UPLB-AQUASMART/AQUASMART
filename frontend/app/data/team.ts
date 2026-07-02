export type TeamMember = {
  name: string;
  role?: string;
  focus?: string;
  image?: string;
  bio: string;
  tags: string[];
  lead?: boolean;
  linkedin?: string;
};

export const coreTeam: TeamMember[] = [
  {
    name: "Leunell Chris M. Buela",
    role: "Project Manager & Technical Lead",
    image: "/assets/team/team-buela.png",
    bio: "Leunell Chris Buela is an Assistant Professor at the University of the Philippines Los Baños working at the intersection of water science, climate adaptation, and sustainable agri-food systems. His work focuses on groundwater and surface water modeling, flood and drought risk assessment, and climate-resilient irrigation and precision agriculture. He currently leads and contributes to multiple national and international projects on groundwater monitoring, contaminant transport, integrated water resources management, and AI-supported decision tools for agriculture, including the AQUASMART initiative.",
    tags: ["Water Science", "Climate Adaptation", "AI Tools"],
    lead: true,
    linkedin: "https://www.linkedin.com/in/lmbuela/?skipRedirect=true",
  },
  {
    name: "Daphne Canape",
    focus: "Designer & Developer",
    bio: "Daphne Canape is an undergraduate Computer Science student at the University of the Philippines Los Baños, with a growing focus on bridging the gap between intuitive web experiences and data-driven insights. Her recent academic projects have centered on full-stack web development and UI/UX design, utilizing frameworks like React to build user-centric applications. Complementing her technical foundation, she has expanded her expertise into data science and predictive modeling using Python. Daphne is eager to apply her technical skills to solve real-world problems, with a specific interest in leveraging data to provide actionable insights that create meaningful business and social impact.",
    tags: ["Design", "Development"],
  },
  {
    name: "Quevin James A. Custodio",
    focus: "Model Developer",
    bio: "Assists with model development, data organization, and technical support for AQUASMART research and simulation workflows.",
    tags: ["Modeling", "Data"],
  },
];
