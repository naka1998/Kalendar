import type { FontPreset } from "@/stores/types";

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "montserrat",
    name: "Montserrat",
    family: "Montserrat",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap",
  },
  {
    id: "inter",
    name: "Inter",
    family: "Inter",
    weights: [300, 400, 600],
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap",
  },
  {
    id: "noto-sans-jp",
    name: "Noto Sans JP",
    family: "Noto Sans JP",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;600&display=swap",
  },
  {
    id: "ibm-plex-sans",
    name: "IBM Plex Sans",
    family: "IBM Plex Sans",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600&display=swap",
  },
  {
    id: "lato",
    name: "Lato",
    family: "Lato",
    weights: [300, 400, 600],
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap",
  },
];
