import { cn } from "cn";
import {
  DM_Sans,
  EB_Garamond,
  Figtree,
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  Instrument_Sans,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Lora,
  Manrope,
  Merriweather,
  Montserrat,
  Noto_Sans,
  Noto_Serif,
  Nunito_Sans,
  Outfit,
  Oxanium,
  Playfair_Display,
  Public_Sans,
  Raleway,
  Roboto,
  Roboto_Slab,
  Source_Sans_3,
  Space_Grotesk,
} from "next/font/google";

// The fonts shadcn/ui's create page offers, as `--font-{name}` on <html>.
// Only the selected ones download, since none are preloaded.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  preload: false,
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  preload: false,
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  preload: false,
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  preload: false,
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  preload: false,
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  preload: false,
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  preload: false,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  preload: false,
});

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
  preload: false,
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  preload: false,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  preload: false,
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  preload: false,
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-3",
  preload: false,
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  preload: false,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  preload: false,
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  preload: false,
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  preload: false,
});

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  preload: false,
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  preload: false,
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  preload: false,
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  preload: false,
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  preload: false,
});

export const previewFontVariables = cn(
  geist.variable,
  inter.variable,
  notoSans.variable,
  nunitoSans.variable,
  figtree.variable,
  roboto.variable,
  raleway.variable,
  dmSans.variable,
  publicSans.variable,
  outfit.variable,
  oxanium.variable,
  manrope.variable,
  spaceGrotesk.variable,
  montserrat.variable,
  ibmPlexSans.variable,
  sourceSans3.variable,
  instrumentSans.variable,
  geistMono.variable,
  jetbrainsMono.variable,
  notoSerif.variable,
  robotoSlab.variable,
  merriweather.variable,
  lora.variable,
  playfairDisplay.variable,
  ebGaramond.variable,
  instrumentSerif.variable,
);
