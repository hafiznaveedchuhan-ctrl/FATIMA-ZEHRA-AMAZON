"use client";

import Link from "next/link";
import { ArrowLeft, Scale, Gavel, Truck, CreditCard, RefreshCw, AlertCircle, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950">
      
      {/* --- LUXURY HEADER --- */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-white transition-all mb-8 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Boutique</span>
          </Link>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 tracking-tight">
            Terms & <span className="text-amber-500 italic font-normal">Conditions</span>
          </h1>
          <div className="w-20 h-1 bg-amber-500 mb-6"></div>
          <p className="text-slate-400 font-light tracking-wide uppercase text-sm">Effective Date: January 2026</p>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            
            {/* Agreement Highlight */}
            <div className="bg-white border-l-4 border-amber-500 shadow-xl p-8 mb-16 rounded-sm">
              <div className="flex items-center gap-4 mb-4">
                <FileText className="text-amber-600" size={28} />
                <h2 className="text-xl font-serif font-bold m-0 uppercase tracking-wider">User Agreement</h2>
              </div>
              <p className="text-gray-600 m-0 leading-relaxed italic">
                "Welcome to Fatima Zehra Boutique. Hamari website istemal karne ka matlab hai ke aap hamare asoolon aur qawaneen se ittefaq karte hain. Hum chahte hain ke aapka experience behtareen aur hamesha ke liye yaadgaar ho."
              </p>
            </div>

            <div className="space-y-16">
              
              {/* 1. Intellectual Property */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <Scale className="text-amber-600" />
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800 m-0">Intellectual Property</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Boutique ki images, logos, designs, aur text Fatima Zehra Boutique ki milkiyat hain. Inka baghair ijazat istemal qanoonan mana hai.
                </p>
              </section>

              {/* 2. Product Info & Custom Orders */}
              <section className="bg-slate-50 p-8 border border-slate-100 rounded-sm">
                <div className="flex items-center gap-4 mb-6">
                  <AlertCircle className="text-amber-600" />
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800 m-0">Product Accuracy</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Hum koshish karte hain ke suits ke colors aur fabric details bilkul sahi nazar aayein. Bespoke orders (jo aapki naap par silay jate hain) mein halki si tabdeeli mumkin hai kyunke ye handcrafted hote hain.
                </p>
              </section>

              {/* 3. Shipping & Delivery Grid */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <Truck className="text-amber-600" />
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800 m-0">Shipping Policies</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="border-b border-slate-200 pb-4">
                    <h3 className="text-sm font-bold uppercase text-amber-600 mb-2">Delivery Time</h3>
                    <p className="text-gray-600 text-sm">Pakistan mein 5-7 working days. Bespoke suits ke liye stitching ka waqt alag se bataya jayega.</p>
                  </div>
                  <div className="border-b border-slate-200 pb-4">
                    <h3 className="text-sm font-bold uppercase text-amber-600 mb-2">Shipping Charges</h3>
                    <p className="text-gray-600 text-sm">Rs 3,000 se upar ke orders par delivery bilkul FREE hai.</p>
                  </div>
                </div>
              </section>

              {/* 4. Returns & Refunds */}
              <section className="bg-slate-900 p-8 text-white rounded-sm relative overflow-hidden">
                <RefreshCw className="absolute right-[-20px] top-[-20px] opacity-10 text-white" size={150} />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <RefreshCw className="text-amber-500" /> Returns & Refunds
                  </h2>
                  <div className="space-y-4 text-slate-300">
                    <p><span className="text-amber-500 font-bold">●</span> Ready-to-wear items 14 days mein exchange ho sakte hain.</p>
                    <p><span className="text-amber-500 font-bold">●</span> <strong className="text-white underline decoration-amber-500">Customized/Bespoke orders</strong> wapis nahi hote kyunke wo sirf aapke liye banaye jate hain.</p>
                    <p><span className="text-amber-500 font-bold">●</span> Item unworn aur original packaging mein hona chahiye.</p>
                  </div>
                </div>
              </section>

              {/* 5. Payment Terms */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <CreditCard className="text-amber-600" />
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800 m-0">Secure Payments</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Hum Bank Transfer, Credit/Debit cards aur JazzCash/EasyPaisa qabool karte hain. Order confirm hone par hi kaam shuru kiya jayega.
                </p>
              </section>

              {/* 6. Governing Law */}
              <section className="border-t border-slate-200 pt-12">
                <div className="flex items-center gap-4 mb-6">
                  <Gavel className="text-amber-600" />
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800 m-0">Governing Law</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Ye qawaneen Pakistan ke qanoon ke mutabiq hain. Kisi bhi maslay ki surat mein faisla Karachi/Lahore ki adalat mein hoga.
                </p>
              </section>

              {/* Contact Footer */}
              <div className="bg-amber-50 p-10 rounded-sm text-center">
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Need Clarification?</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Agar aapko kisi term ki samajh nahi aayi, toh hichkichayein nahi, humse rabta karein.</p>
                <div className="flex flex-col md:flex-row justify-center gap-6">
                  <a href="mailto:HAFIZNAVEEDCHUHAN@GMAIL.COM" className="bg-slate-900 text-white px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-amber-600 transition-all">Email Us</a>
                  <a href="tel:+923002385209" className="border-2 border-slate-900 px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Call Support</a>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Links */}
          <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              <Link href="/privacy" className="hover:text-amber-600 transition-colors">Privacy Policy</Link>
              <Link href="/contact" className="hover:text-amber-600 transition-colors">Contact</Link>
              <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
            </div>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest">© 2026 Fatima Zehra Boutique</p>
          </div>
        </div>
      </section>
    </div>
  );
}