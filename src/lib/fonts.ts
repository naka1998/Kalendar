import type { FontPreset } from "@/stores/types";

export const FONT_CATEGORIES = ["かっこいい", "しっかり", "かわいい", "おしゃれ"] as const;

export const FONT_PRESETS: (FontPreset & { category: (typeof FONT_CATEGORIES)[number] })[] = [
  {
    id: "montserrat",
    category: "かっこいい",
    name: "Montserrat",
    family: "Montserrat",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap",
  },
  {
    id: "inter",
    category: "しっかり",
    name: "Inter",
    family: "Inter",
    weights: [300, 400, 600],
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap",
  },
  {
    id: "noto-sans-jp",
    category: "しっかり",
    name: "Noto Sans JP",
    family: "Noto Sans JP",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;600&display=swap",
  },
  {
    id: "ibm-plex-sans",
    category: "かっこいい",
    name: "IBM Plex Sans",
    family: "IBM Plex Sans",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600&display=swap",
  },
  {
    id: "lato",
    category: "しっかり",
    name: "Lato",
    family: "Lato",
    weights: [300, 400, 600],
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap",
  },
  {
    id: "zen-maru-gothic",
    category: "かわいい",
    name: "Zen Maru Gothic",
    family: "Zen Maru Gothic",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;700&display=swap",
  },
  {
    id: "nunito",
    category: "かわいい",
    name: "Nunito",
    family: "Nunito",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap",
  },
  {
    id: "m-plus-rounded-1c",
    category: "かわいい",
    name: "M PLUS Rounded 1c",
    family: "M PLUS Rounded 1c",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@300;400;700;800&display=swap",
  },
  {
    id: "cormorant-garamond",
    category: "おしゃれ",
    name: "Cormorant Garamond",
    family: "Cormorant Garamond",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&display=swap",
  },
  {
    id: "playfair-display",
    category: "おしゃれ",
    name: "Playfair Display",
    family: "Playfair Display",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap",
  },
  {
    id: "shippori-mincho",
    category: "おしゃれ",
    name: "Shippori Mincho",
    family: "Shippori Mincho",
    weights: [300, 400, 600],
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;600;700;800&display=swap",
  },
];
