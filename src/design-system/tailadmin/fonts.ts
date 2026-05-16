import { Outfit } from "next/font/google";

export const tailAdminFont = Outfit({
  subsets: ["latin"],
  variable: "--font-tailadmin-loaded",
  display: "swap",
});

export const tailAdminFontClassName = "font-tailadmin";
