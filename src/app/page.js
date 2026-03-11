import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-12 pb-16 md:pt-20 md:pb-32 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950">
        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-60 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>

        {/* Decorative Background Elements - clipped in own wrapper */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-6 relative">
          {/* Live Badge */}
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Now Live in Addis Ababa • 25+ Stations Connected
          </div> */}

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-sm">
            Find Fuel.{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              Skip the Line.
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-blue-100/80 leading-relaxed font-medium px-2">
            FuelSync connects Ethiopian drivers with real-time fuel availability
            and allows stations to manage queues efficiently. No more wasted time
            or uncertain waits.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 w-full px-4 sm:px-0">
            <Link
              href="/auth/register"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.7)] hover:-translate-y-1"
            >
              Get Started for Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto text-center px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-1"
            >
              See How It Works
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 text-xs sm:text-sm font-semibold text-blue-200/60">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure &amp; private</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border-y border-white/10 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { label: "Active Drivers", value: "10,000+", icon: "🚗" },
              { label: "Fuel Stations", value: "450+", icon: "⛽" },
              { label: "Queue Reduction", value: "65%", icon: "📉" },
              { label: "Daily Requests", value: "25K+", icon: "📱" },
            ].map((stat, i) => (
              <div key={i} className="text-center group py-2">
                <div className="text-2xl sm:text-3xl mb-2 transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-sm text-blue-200/60 font-medium mt-1 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fuel Types Section */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 w-full relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Fuel Types We Track
            </h2>
            <p className="text-base sm:text-xl text-blue-100/70 max-w-2xl mx-auto font-medium px-2">
              Real-time availability for the most common fuels in Ethiopia
            </p>
          </div>

          {/* Fuel Cards Grid - Dark Glass Effect */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mb-16 sm:mb-24 cursor-default">

            {/* Benzene Card */}
            <div className="group relative bg-white/5 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-bl-full -z-10 group-hover:bg-blue-500/30 group-hover:scale-110 transition-all duration-500 blur-xl" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500/20 shadow-sm border border-blue-400/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-5 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                ⛽
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Benzene (Petrol)</h3>
              <p className="text-sm sm:text-base text-blue-100/70 leading-relaxed font-medium">
                Locate stations with regular unleaded benzene in stock. Real-time updates on availability and estimated wait times.
              </p>
              <div className="mt-6 sm:mt-8 flex items-center text-sm text-blue-300 font-bold bg-blue-900/30 border border-blue-500/20 inline-flex px-4 py-2 rounded-xl">
                <span>45 stations nearby</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Nafta Card */}
            <div className="group relative bg-white/5 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-bl-full -z-10 group-hover:bg-amber-500/30 group-hover:scale-110 transition-all duration-500 blur-xl" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-500/20 shadow-sm border border-amber-400/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-5 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                🚛
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Nafta (Diesel)</h3>
              <p className="text-sm sm:text-base text-blue-100/70 leading-relaxed font-medium">
                Heavy-duty transport needs reliable fuel. Find stations with active Nafta pumps and dedicated commercial vehicle lanes.
              </p>
              <div className="mt-6 sm:mt-8 flex items-center text-sm text-amber-300 font-bold bg-amber-900/30 border border-amber-500/20 inline-flex px-4 py-2 rounded-xl">
                <span>32 stations nearby</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Premium Fuel Card */}
            <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-bl-full -z-10 group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-500 blur-xl" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-500/20 shadow-sm border border-purple-400/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-5 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                ⚡
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Premium Fuels</h3>
              <p className="text-sm sm:text-base text-blue-100/70 leading-relaxed font-medium">
                Track availability of premium benzene, additives, and specialized fuels for high-performance vehicles.
              </p>
              <div className="mt-6 sm:mt-8 flex items-center text-sm text-purple-300 font-bold bg-purple-900/30 border border-purple-500/20 inline-flex px-4 py-2 rounded-xl">
                <span>18 stations nearby</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 px-0 sm:px-4">
            {[
              {
                icon: "🕒",
                title: "Real-time Updates",
                description: "Live fuel availability and queue lengths at stations across Addis Ababa."
              },
              {
                icon: "📱",
                title: "Digital Queue",
                description: "Reserve your spot in line and get notified when it's your turn."
              },
              {
                icon: "🗺️",
                title: "Smart Navigation",
                description: "Integrated maps showing the fastest route to stations with your fuel type."
              }
            ].map((feature, i) => (
              <div key={i} className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-0 p-4 sm:p-6 group hover:-translate-y-1 transition-transform duration-300 bg-white/5 rounded-2xl sm:bg-transparent sm:rounded-none border border-white/5 sm:border-0">
                <div className="text-3xl sm:text-4xl sm:mb-4 group-hover:scale-110 transition-transform shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-base sm:text-xl font-extrabold text-white mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-sm text-blue-100/60 font-medium leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>





      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 bg-slate-950 border-t border-white/10 relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-600/20 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-3 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                  FS
                </div>
                <span className="font-bold text-xl text-white">FuelSync</span>
              </div>
              <p className="text-slate-400 text-sm max-w-md font-medium leading-relaxed">
                Making fuel accessible for everyone in Ethiopia. Real-time tracking,
                digital queues, and smart navigation for drivers and station owners.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">For Stations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              © 2024 FuelSync. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-500">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}