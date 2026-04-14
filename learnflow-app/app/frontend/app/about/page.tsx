import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-amber-100">
      
      {/* --- HERO SECTION (Teesri Image Yahan Lagayi Hai) --- */}
      <section className="relative h-[85vh] flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          {/* TEESRI IMAGE: Yahan aapki main best photo aayegi */}
          <Image 
            src="/images/naveed/THIRD_IMAGE_HERE.jpg" 
            alt="Fatima Zehra Boutique Main" 
            fill 
            className="object-cover object-top opacity-80"
            priority
          />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-5xl">
          <span className="text-amber-500 tracking-[0.5em] uppercase text-xs font-bold mb-6 block">
            Premium Bespoke Tailoring
          </span>
          <h1 className="text-6xl md:text-9xl font-serif font-bold mb-8 text-white leading-none tracking-tighter">
            Fatima Zehra <br />
            <span className="italic font-normal text-amber-500">Boutique</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-2xl font-light max-w-2xl mx-auto leading-relaxed italic">
            "Definement in every stitch, excellence in every detail."
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-20"></div>
      </section>

      {/* --- OUR STORY SECTION --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Text Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="inline-block border-l-4 border-amber-500 pl-4">
              <h2 className="text-sm uppercase tracking-[0.3em] text-amber-600 font-bold">The Craftsmanship</h2>
              <h3 className="text-4xl md:text-5xl font-serif font-bold mt-2">Where Tradition <br/> Meets Modernity</h3>
            </div>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              Fatima Zehra Boutique mein hum sirf suits nahi banate, hum ek legacy create karte hain. 
              Pichle kayi saalon se hum mardana fashion mein apne "Bespoke" experience ki wajah se pehchane jate hain. 
              Hamara har suit, sherwani aur waistcoat aapki body measurements ke mutabiq customize kiya jata hai.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-amber-500 font-bold text-xl">01.</span>
                <p className="text-slate-700 font-medium">Behtareen Fabric: Hum sirf top-tier imported aur local fabrics use karte hain.</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-amber-500 font-bold text-xl">02.</span>
                <p className="text-slate-700 font-medium">Master Cut: Hamare master tailors har cut ko perfection se design karte hain.</p>
              </div>
            </div>

            <Link href="https://wa.me/923002385209" className="inline-block bg-slate-900 text-white px-10 py-4 font-bold tracking-widest uppercase text-xs hover:bg-amber-600 transition-all duration-300">
              Book Your Appointment
            </Link>
          </div>

          {/* Image Grid Side */}
          <div className="order-1 lg:order-2 grid grid-cols-12 gap-4 h-[600px]">
            <div className="col-span-7 relative rounded-sm overflow-hidden shadow-2xl">
               <Image src="/images/naveed/IMG_20251220_191017_697.jpg" alt="Suit Design" fill className="object-cover" />
            </div>
            <div className="col-span-5 flex flex-col gap-4">
               <div className="h-1/2 relative rounded-sm overflow-hidden shadow-xl">
                  <Image src="/images/naveed/IMG_20230601_205523_081.jpg" alt="Fabric" fill className="object-cover" />
               </div>
               
               {/* BEST QUALITY BOX */}
               <div className="h-1/2 relative bg-amber-500 flex items-center justify-center p-8 text-center text-white overflow-hidden group">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all"></div>
                  <div className="relative z-10">
                    <p className="text-4xl font-bold mb-2 tracking-tighter italic font-serif leading-none">Best <br/> Quality</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold border-t border-white/40 pt-2 inline-block">Guaranteed Selection</p>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="text-center group">
            <div className="w-20 h-20 bg-white shadow-lg rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-500 transition-colors duration-500">
              <span className="text-3xl text-slate-800 group-hover:text-white">✂️</span>
            </div>
            <h4 className="text-xl font-bold mb-4 font-serif text-slate-800">Master Tailoring</h4>
            <p className="text-gray-500 text-sm">Har stitch mein perfection. Hum ensure karte hain ke aapka suit aapke liye hi bana ho.</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-white shadow-lg rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-500 transition-colors duration-500">
              <span className="text-3xl text-slate-800 group-hover:text-white">👔</span>
            </div>
            <h4 className="text-xl font-bold mb-4 font-serif text-slate-800">Formal & Casual</h4>
            <p className="text-gray-500 text-sm">Office wear ho ya Wedding event, hum har maukay ke liye best fashion provide karte hain.</p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-white shadow-lg rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-500 transition-colors duration-500">
              <span className="text-3xl text-slate-800 group-hover:text-white">⭐</span>
            </div>
            <h4 className="text-xl font-bold mb-4 font-serif text-slate-800">Client Priority</h4>
            <p className="text-gray-500 text-sm">Hafiz Naveed Chuhan aur unki team aapki satisfaction ko pehle rakhti hai.</p>
          </div>
        </div>
      </section>

      {/* --- CONTACT BANNER --- */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-slate-900 text-white p-12 md:p-20 text-center relative overflow-hidden border-b-8 border-amber-500">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 italic">Visit Fatima Zehra Today</h2>
            <p className="text-gray-400 mb-10 text-lg tracking-widest uppercase">Hafiz Naveed Chuhan: <span className="text-amber-500 ml-2">923002385209</span></p>
            <div className="flex flex-wrap justify-center gap-8 text-xs uppercase tracking-[0.2em] font-bold text-gray-300">
               <div className="border-r border-gray-700 pr-8">Email: hafiznaveedchuhan@gmail.com</div>
               <div>Location: Karachi, Pakistan</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}