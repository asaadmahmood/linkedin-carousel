import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  DM_Sans,
  Plus_Jakarta_Sans,
  Space_Grotesk,
  Lora,
  Poppins,
  Outfit,
  Merriweather,
  Caveat,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkedIn Carousel Generator",
  description: "Create stunning LinkedIn carousels with professional designs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} ${dmSans.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} ${lora.variable} ${poppins.variable} ${outfit.variable} ${merriweather.variable} ${caveat.variable} antialiased bg-[#0d0d0d] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
