"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, UserCheck, Globe } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950">
      {/* --- PREMIUM HEADER --- */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-white transition-all mb-8 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Boutique</span>
          </Link>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 tracking-tight">
            Privacy <span className="text-amber-500 italic font-normal">Policy</span>
          </h1>
          <div className="w-20 h-1 bg-amber-500 mb-6"></div>
          <p className="text-slate-400 font-light tracking-wide uppercase text-sm">Last updated: February 2026</p>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            
            {/* Intro Card */}
            <div className="bg-white border-t-4 border-amber-500 shadow-xl p-8 md:p-12 mb-12 rounded-sm">
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheck className="text-amber-600" size={32} />
                <h2 className="text-2xl font-serif font-bold m-0">Our Commitment</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg italic">
                "At Fatima Zehra Boutique, we value your trust as much as your style. 
                Aapka data hamare paas mehfooz hai aur hum isay sirf aapka shopping experience behtar banane ke liye istemal karte hain."
              </p>
            </div>

            <div className="space-y-16">
              {/* Section 1 */}
              <section className="group">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-amber-500 font-serif text-2xl font-bold">01.</span>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800">Introduction</h2>
                </div>
                <p className="text-gray-600 pl-10 leading-relaxed">
                  Fatima Zehra Boutique ("we," "our," or "us") is committed to protecting your privacy. This policy explains how we handle your personal information when you browse our collection of bespoke suits and luxury fashion.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-amber-500 font-serif text-2xl font-bold">02.</span>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800">Information We Collect</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6 pl-10">
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-sm">
                    <UserCheck className="text-amber-600 mb-3" size={24} />
                    <h3 className="text-lg font-bold mb-2">Personal Data</h3>
                    <p className="text-sm text-gray-500">Name, Email, Phone number, aur aapke measurements jo hum tailor-made suits ke liye save karte hain.</p>
                  </div>
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-sm">
                    <Eye className="text-amber-600 mb-3" size={24} />
                    <h3 className="text-lg font-bold mb-2">Browsing Info</h3>
                    <p className="text-sm text-gray-500">IP address, browser type, aur wo products jo aapne hamari site par pasand kiye.</p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-amber-500 font-serif text-2xl font-bold">03.</span>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800">How We Use Your Info</h2>
                </div>
                <ul className="list-none pl-10 space-y-4">
                  {["Process your custom orders", "Send updates about your suit stitching status", "Improve our boutique collections", "Fraud prevention & secure payments"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 4 */}
              <section className="bg-slate-900 p-8 text-white rounded-sm relative overflow-hidden">
                <Lock className="absolute right-4 top-4 opacity-10" size={120} />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Lock className="text-amber-500" /> Data Security
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    Hum aapki payment aur personal details ko protect karne ke liye **SSL Encryption** aur premium firewalls use karte hain. Aapka payment data kabhi bhi hamare servers par store nahi hota.
                  </p>
                </div>
              </section>

              {/* Contact Footer Inside Content */}
              <div className="pt-12 border-t border-slate-200">
                <div className="bg-amber-50 p-8 rounded-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Questions & Contact</h3>
                  <p className="text-gray-600 mb-6">Agar aapka koi bhi sawal hai hamari privacy practices ke baare mein, toh humse rabta karein:</p>
                  <div className="space-y-3">
                    <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                      <span className="text-amber-600 italic">Email:</span> 
                      HAFIZNAVEEDCHUHAN@GMAIL.COM
                    </p>
                    <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                      <span className="text-amber-600 italic">WhatsApp:</span> 
                      +92 300 2385209
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Nav */}
          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              <Link href="/terms" className="hover:text-amber-600 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-amber-600 transition-colors">Contact</Link>
              <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
            </div>
            <p className="text-slate-400 text-xs">© 2026 Fatima Zehra Boutique. All Rights Reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}