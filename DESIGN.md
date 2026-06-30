---
version: lightweight
source: https://aquasmart-uplb.vercel.app
accessed: 2026-06-30
name: AQUASMART Mini
description: A clean agricultural water-intelligence interface with aqua accents, deep navy structure, soft scientific surfaces, and field imagery.
colors:
  navy: "#0B1F3A"
  aqua: "#1FA3C9"
  aqua-bright: "#37A8DC"
  green: "#22C55E"
  muted: "#857F7F"
  slate-muted: "#66758F"
  pale: "#F5FAFC"
  pill: "#DFF6FD"
  line: "#E2E8F0"
  surface: "#FFFFFF"
typography:
  heading:
    fontFamily: "Sora"
    weight: "600-800"
    usage: "Hero headlines, section titles, simulation headings"
  body:
    fontFamily: "Inter"
    weight: "400-600"
    usage: "Navigation, paragraphs, cards, general UI"
  weather-ui:
    fontFamily: "Rubik"
    weight: "400-500"
    usage: "Forecast cards and weather-focused panels"
radius:
  small: "8px"
  medium: "12px-20px"
  large: "24px-40px"
  pill: "999px"
---

# AQUASMART Mini Design Guide

## Identity

AQUASMART Mini should feel practical, optimistic, and research-backed. The interface combines agricultural imagery, water-system visuals, weather cards, and simulation previews to make irrigation and groundwater concepts approachable for farmers, students, and water managers.

The visual language is not stark or monochrome. It is a light scientific dashboard style with deep navy text, aqua highlights, green sustainability accents, soft pale-blue surfaces, and rounded controls.

## Color

Use `navy` as the primary text and structural color. Use `aqua` for active states, icons, links, charts, parameter markers, and emphasis. Use `green` sparingly for harvest, sustainability, and positive ecological cues.

Use `pale`, `pill`, and `surface` for calm backgrounds, cards, and navigation panels. Use `line` for subtle dividers and low-emphasis borders. Avoid introducing unrelated accent colors unless they represent data states, alerts, or weather conditions.

## Typography

Use Sora for large, confident headings such as the hero, section headlines, simulation titles, and major dashboard labels. Use Inter for the core site experience: body copy, navigation, buttons, cards, and descriptions. Use Rubik only in weather-specific UI where the production site already uses it.

Hero-scale type can be bold and expressive. Card and dashboard text should stay tighter, smaller, and easier to scan.

## Layout

Pages use a centered maximum-width canvas with full-width sections. The home page is image-led: a large hero, sticky navigation, broad section spacing, and immersive content blocks. Dashboard and simulation pages should be denser, with clear panels, maps, parameter controls, and readable metrics.

Keep section composition generous but purposeful. Use large framed feature areas for major concepts like goals and simulations, and smaller cards for repeated data, modules, partners, and readings.

## Components

Navigation uses a translucent sticky header with the AQUASMART logo, simple text links, and a mobile menu toggle. Preserve the blur treatment and compact spacing.

Pills label sections and states. They should be rounded, aqua-tinted, and concise.

Cards use soft backgrounds, rounded corners, light borders, and restrained shadows. Feature cards may use stronger shadows and dark framed sections when they sit over visual backgrounds.

Buttons and toggles should be rounded or pill-shaped. Active states should use aqua fills, aqua borders, or a clear active marker. Keep labels short and task-oriented.

Simulation and weather panels should prioritize legible data presentation over decoration. Use images, maps, and preview states to explain model behavior, but keep controls predictable.

## Imagery

Use real AQUASMART assets and generated interface previews as primary visual anchors: hero field imagery, groundwater simulation screenshots, drawdown states, forecast previews, partner logos, and team photos.

Decorative radial assets and animated GIFs may be used for energy, but they should not compete with data or readable content.

## Motion

The production site uses scroll reveal, animated preview states, and subtle hover/focus behavior. Motion should feel smooth and lightweight. Avoid heavy transitions that slow navigation or distract from scientific content.

## Accessibility

Maintain strong contrast between navy text and light surfaces. Use semantic headings, descriptive link labels, visible focus states, and real button elements for interactive controls. Decorative images should use empty alt text; meaningful previews and logos should have useful alt text.

## Do

- Use navy, aqua, green, pale blue, and white as the core palette.
- Keep headings expressive but make dashboard text compact and scannable.
- Use rounded cards, pills, and soft shadows consistently.
- Let field, water, weather, and simulation imagery carry the product identity.
- Keep production pages responsive across mobile and desktop.

## Don't

- Do not use the generic black-and-white Vercel Minimal style for AQUASMART.
- Do not replace the agriculture/water identity with abstract SaaS visuals.
- Do not overload pages with decorative effects where users need to read data.
- Do not introduce one-off colors or fonts without a data or brand reason.
