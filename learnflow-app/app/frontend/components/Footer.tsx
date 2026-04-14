"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter, ExternalLink, ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative bg-[#0a0a0a] text-white pt-20 pb-10 overflow-hidden border-t border-amber-900/20">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
      
      <div className="container-wide">
        {/* 1. Value Propositions (Stylish Icons) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pb-12 border-b border-white/5">
          {[
            { icon: <Truck className="text-amber-500" />, title: "Free Shipping", desc: "Across Pakistan" },
            { icon: <RotateCcw className="text-amber-500" />, title: "Easy Returns", desc: "7-Day Exchange" },
            { icon: <ShieldCheck className="text-amber-500" />, title: "Secure Payment", desc: "100% Protected" },
            { icon: <CreditCard className="text-amber-500" />, title: "Cash on Delivery", desc: "Pay at Door" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center group cursor-default">
              <div className="mb-4 p-3 rounded-full bg-white/5 group-hover:bg-amber-500/10 transition-colors duration-500">
                {item.icon}
              </div>
              <h5 className="font-bold text-sm tracking-wider uppercase">{item.title}</h5>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 2. Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <h3 className="text-3xl font-serif font-black tracking-tighter mb-6 bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-clip-text text-transparent">
              FATIMA ZEHRA
            </h3>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
              Defining the future of Eastern couture. From intricate craftsmanship to modern silhouettes, we create legacies, not just garments.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-amber-600 hover:border-amber-600 transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - FIXED PATHS */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-amber-500">Navigation</h4>
            <ul className="space-y-4">
              {/* "Products" is the actual folder name, so we use it for Shop */}
              {["Products", "About", "Contact", "Orders"].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase()}`} 
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium inline-block relative group"
                  >
                    {item === "Products" ? "Shop" : item}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amber-500 transition-all group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-amber-500">Boutique Office</h4>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <MapPin size={18} className="text-amber-500 flex-shrink-0" />
                <p className="text-sm text-gray-400 uppercase">House No. R-98, Sector 5C-2, North Karachi</p>
              </div>
              <div className="flex items-start gap-4">
                <Phone size={18} className="text-amber-500 flex-shrink-0" />
                <p className="text-sm text-gray-400">+92 300 2385209</p>
              </div>
              <div className="flex items-start gap-4">
                <Mail size={18} className="text-amber-500 flex-shrink-0" />
                <p className="text-sm text-gray-400">hnaveed264@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-amber-500">The Insider</h4>
            <p className="text-sm text-gray-400 mb-6">Join our elite circle for private collection launches.</p>
            <form onSubmit={handleSubscribe} className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="w-full bg-transparent border-b border-white/20 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors uppercase tracking-widest placeholder:text-gray-600"
                required
              />
              <button type="submit" className="absolute right-0 bottom-3 hover:text-amber-500 transition-colors">
                <ExternalLink size={20} />
              </button>
            </form>
            {subscribed && <p className="text-amber-500 text-[10px] mt-2 font-bold uppercase tracking-tighter">✓ Welcome to the Legacy</p>}
          </div>
        </div>

        {/* 3. AGENTIC AI DEVELOPER CREDIT SECTION (RETAINED) */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-white/[0.04]">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(217,119,6,0.3)]">
              <span className="text-xl font-black">N</span>
            </div>
            <div>
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em]">Architected By</p>
              <h6 className="text-lg font-bold text-white tracking-wide">HAFIZ NAVEED UDDIN</h6>
              <p className="text-xs text-gray-500 uppercase">Agentic AI Developer / Full-Stack Engineer</p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <a 
              href="mailto:HAFIZNAVEEDCHUHAN@GMAIL.COM" 
              className="text-sm font-bold text-gray-400 hover:text-white transition-colors border-b border-gray-800 pb-1"
            >
              HAFIZNAVEEDCHUHAN@GMAIL.COM
            </a>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-full border border-amber-500/20 uppercase tracking-tighter">
              Available for New Ventures
            </span>
          </div>
        </div>

        {/* 4. Copyright */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} Fatima Zehra Amazon Shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}