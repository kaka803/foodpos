import { Inter } from "next/font/google";
import "./globals.css";
import { POSProvider } from "../context/POSContext";
import ToasterProvider from "../components/ui/ToasterProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "BitePOS - Fast Food Point of Sale",
  description: "Modern, ultra-fast point of sale and billing management system for fast food shops and restaurants.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#f8f9fd] text-[#1c1d22] font-sans antialiased selection:bg-[#f26522] selection:text-white">
        <POSProvider>
          {children}
          <ToasterProvider />
        </POSProvider>
      </body>
    </html>
  );
}
