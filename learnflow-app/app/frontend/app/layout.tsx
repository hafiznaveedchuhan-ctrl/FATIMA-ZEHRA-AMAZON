import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ChatWidget from "@/components/ChatWidget"
import { FloatingWhatsAppButton } from "@/components/WhatsAppButton"

export const metadata: Metadata = {
  title: "Fatima Zehra Amazon Shop - E-Commerce Store",
  description: "Shop everything from Fatima Zehra Amazon Shop - Electronics, Fashion, Home, and more",
  keywords: "shopping, e-commerce, products, electronics, fashion, home",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  themeColor: "#1e40af",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head></head>
      <body className="bg-white dark:bg-slate-950">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <ChatWidget />
        <FloatingWhatsAppButton
          phoneNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
          defaultMessage="السلام علیکم! مجھے آپ کی مصنوعات کے بارے میں معلومات چاہیے۔"
          position="bottom-left"
        />
      </body>
    </html>
  )
}
