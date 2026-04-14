"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    feedback: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", feedback: "" });
    setLoading(false);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950">
      
      {/* --- LUXURY HERO SECTION --- */}
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <span className="text-amber-500 tracking-[0.4em] uppercase text-xs font-bold mb-4 block">
            Let's Craft Excellence
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
            Contact <span className="text-amber-500 italic font-normal">Us</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Aapki fit aur style hamari zimmedari hai. Bespoke tailoring ya kisi bhi inquiry ke liye humse rabta karein.
          </p>
        </div>
      </section>

      {/* --- CONTACT INFO CARDS --- */}
      <section className="py-20 px-6 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Visit Us */}
          <div className="bg-white p-10 shadow-2xl border-b-4 border-amber-500 rounded-sm group hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-slate-900 text-amber-500 flex items-center justify-center rounded-full mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <MapPin size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight uppercase">Visit Our Studio</h3>
            <p className="text-gray-500 mb-4 leading-relaxed italic text-sm">Experience luxury fabrics in person.</p>
            <p className="text-slate-900 font-bold">Model Town, Lahore, Pakistan</p>
          </div>

          {/* Card 2: Call/WhatsApp */}
          <div className="bg-white p-10 shadow-2xl border-b-4 border-amber-500 rounded-sm group hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-slate-900 text-amber-500 flex items-center justify-center rounded-full mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Phone size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight uppercase">Direct Line</h3>
            <p className="text-gray-500 mb-4 leading-relaxed italic text-sm">Available for consultations (10 AM - 10 PM)</p>
            <a href="tel:+923002385209" className="text-slate-900 font-bold text-lg hover:text-amber-600 transition-colors">+92 300 2385209</a>
          </div>

          {/* Card 3: Email */}
          <div className="bg-white p-10 shadow-2xl border-b-4 border-amber-500 rounded-sm group hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-slate-900 text-amber-500 flex items-center justify-center rounded-full mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Mail size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight uppercase">Support Email</h3>
            <p className="text-gray-500 mb-4 leading-relaxed italic text-sm">We respond within 24 hours.</p>
            <a href="mailto:HAFIZNAVEEDCHUHAN@GMAIL.COM" className="text-slate-900 font-bold text-sm truncate block hover:text-amber-600 transition-colors">HAFIZNAVEEDCHUHAN@GMAIL.COM</a>
          </div>

        </div>
      </section>

      {/* --- FORM & MISSION SECTION --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Left Side: Mission & Content */}
          <div className="space-y-10">
            <div>
              <h2 className="text-4xl font-serif font-bold mb-6">Our <span className="text-amber-600">Mission</span></h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Fatima Zehra Boutique ka maqsad sirf kapray bechna nahi, balkay aapki shakhsiyat ko mardana wajahat aur naye fashion se araasta karna hai. Hum har suit ko aik 'Masterpiece' samajh kar silye hain.
              </p>
              <div className="flex gap-4 items-center p-6 bg-amber-50 border-l-4 border-amber-500">
                 <Clock className="text-amber-600 shrink-0" size={30} />
                 <p className="text-sm font-semibold text-slate-800 italic">"Hum waqt par delivery aur behtareen fitting ki guarantee dete hain."</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-8 bg-slate-900 text-white rounded-sm text-center">
                <p className="text-4xl font-bold text-amber-500 mb-2 font-serif tracking-tighter">15+</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Years Experience</p>
              </div>
              <div className="p-8 bg-amber-500 text-white rounded-sm text-center">
                <p className="text-4xl font-bold mb-2 font-serif tracking-tighter">100%</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-amber-900">Premium Fabric</p>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-white shadow-2xl p-10 border border-slate-100 rounded-sm">
            <h3 className="text-2xl font-bold mb-8 tracking-tight uppercase flex items-center gap-3">
              <MessageSquare className="text-amber-500" /> Send a Message
            </h3>

            {submitted && (
              <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm animate-fade-in">
                ✓ Message received! Hamari team jald aap se rabta karegi.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="E.g. Naveed Chuhan"
                    className="w-full bg-slate-50 border-b-2 border-slate-200 py-3 px-4 focus:border-amber-500 outline-none transition-all text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="E.g. info@boutique.com"
                    className="w-full bg-slate-50 border-b-2 border-slate-200 py-3 px-4 focus:border-amber-500 outline-none transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="E.g. +92 300 1234567"
                  className="w-full bg-slate-50 border-b-2 border-slate-200 py-3 px-4 focus:border-amber-500 outline-none transition-all text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Inquiry / Feedback</label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="How can we help you today?"
                  className="w-full bg-slate-50 border-b-2 border-slate-200 py-3 px-4 focus:border-amber-500 outline-none transition-all text-slate-900 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold py-5 px-8 flex items-center justify-center gap-3 group hover:bg-amber-600 transition-all duration-300"
              >
                {loading ? "SENDING..." : (
                  <>
                    CONFIRM MESSAGE <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* --- FOOTER NAV --- */}
      <footer className="py-12 border-t border-slate-100 text-center">
        <div className="flex justify-center gap-8 mb-6">
           <Link href="/about" className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-amber-500 transition-colors">About</Link>
           <Link href="/products" className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-amber-500 transition-colors">Products</Link>
           <Link href="/privacy" className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-amber-500 transition-colors">Privacy</Link>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-slate-300">© 2026 FATIMA ZEHRA BOUTIQUE. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}