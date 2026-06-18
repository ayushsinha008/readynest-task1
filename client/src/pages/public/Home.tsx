import { Link } from 'react-router-dom';
import LogoIcon from '../../components/icons/LogoIcon';
import { useAuthStore } from '../../store/useAuthStore';

export default function Home() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#e5e7eb] font-sans selection:bg-primary selection:text-on-primary p-4 md:p-6 lg:p-8 flex flex-col">
      <div className="bg-white rounded-[40px] border border-gray-200 shadow-xl relative bg-dot-pattern flex flex-col min-h-full overflow-hidden">
        
        {/* Navigation */}
        <nav className="relative z-20 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <LogoIcon className="w-full h-full text-ink" />
            </div>
            <span className="font-display font-bold tracking-tight text-ink text-[22px]">FormBuilder</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[15px] font-medium text-gray-500 hover:text-ink transition-colors">Features</a>
            <a href="#solutions" className="text-[15px] font-medium text-gray-500 hover:text-ink transition-colors">Solutions</a>
            <a href="#resources" className="text-[15px] font-medium text-gray-500 hover:text-ink transition-colors">Resources</a>
            <a href="#about" className="text-[15px] font-medium text-gray-500 hover:text-ink transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => logout()}
                  className="text-[15px] font-medium text-gray-500 hover:text-red-500 transition-colors"
                >
                  Log out
                </button>
                <Link
                  to="/dashboard"
                  className="bg-primary text-on-primary h-10 px-5 rounded-xl flex items-center justify-center text-[15px] font-bold hover:bg-primary-active transition-colors shadow-sm"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[15px] font-medium text-ink hover:text-gray-600 transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-on-primary h-10 px-5 rounded-xl flex items-center justify-center text-[15px] font-bold hover:bg-primary-active transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 flex-1 flex items-center justify-center py-20 px-6">
          
          {/* Central Content */}
          <div className="max-w-[800px] mx-auto text-center flex flex-col items-center relative z-20">
            {/* 3D Floating Logo */}
            <div className="w-24 h-24 bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] flex items-center justify-center mb-12 border border-gray-100 transform hover:-translate-y-2 transition-transform duration-500">
              <LogoIcon className="w-12 h-12 text-ink" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[64px] leading-[1.1] font-display font-bold tracking-tight text-ink mb-6 max-w-3xl">
              Build, plan, and track <br className="hidden md:block" />
              <span className="text-gray-400 font-medium">all in one place</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-600 max-w-[600px] mx-auto mb-10 font-medium">
              Efficiently manage your forms and boost productivity.
            </p>

            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="bg-primary text-on-primary h-[52px] px-8 rounded-xl flex items-center justify-center text-[16px] font-bold hover:bg-primary-active transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
            </Link>
          </div>

          {/* FLOATING CARDS (CSS Replicas) */}
          
          {/* Top Left: Sticky Note */}
          <div className="absolute top-[10%] left-[5%] transform -rotate-3 z-0 hidden xl:block">
            <div className="w-[240px] h-[240px] bg-[#fef08a] shadow-md relative p-6 font-handwriting text-gray-800 text-lg leading-relaxed rotate-2">
              <div className="w-4 h-4 bg-red-500 rounded-full absolute -top-2 left-1/2 -translate-x-1/2 shadow-sm border border-red-700"></div>
              Create forms to collect crucial details, and accomplish more tasks with ease.
            </div>
            {/* Checkbox Floating over sticky note */}
            <div className="absolute -bottom-8 -left-4 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-100 rotate-12">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
          </div>

          {/* Top Right: Reminders Card */}
          <div className="absolute top-[15%] right-[5%] transform rotate-3 z-0 hidden xl:block">
            <div className="w-[280px] bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-ink mb-4">Reminders</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm font-semibold text-ink">Today's Meeting</p>
                  <p className="text-xs text-gray-500 mb-2">Call with marketing team</p>
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md">13:00 - 13:45</span>
                </div>
              </div>
            </div>
            {/* Floating clock */}
            <div className="absolute -left-10 top-10 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-100 -rotate-12">
              <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          {/* Bottom Left: Tasks List */}
          <div className="absolute bottom-[5%] left-[8%] transform -rotate-2 z-0 hidden xl:block">
            <div className="w-[300px] bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-ink mb-4">Today's tasks</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold">New ideas for campaign</span>
                    <span className="text-[10px] font-bold text-gray-500">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 w-[60%] h-full"></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold">Design PPT #4</span>
                    <span className="text-[10px] font-bold text-gray-500">112%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 w-full h-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right: Integrations */}
          <div className="absolute bottom-[8%] right-[8%] transform rotate-2 z-0 hidden xl:block">
            <div className="w-[280px] bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-ink mb-4">100+ Integrations</h3>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center transform -rotate-6">
                  <div className="w-8 h-8 flex items-center justify-center text-red-500 font-bold text-2xl font-serif">M</div>
                </div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center transform rotate-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none"><path fill="#E01E5A" d="M5.04 15.04A2.04 2.04 0 0 1 3 13h4.08v2.04zm.96-2.04h-4.08A2.04 2.04 0 0 1 3.96 8.92H6v4.08z"/><path fill="#36C5F0" d="M8.96 15.04a2.04 2.04 0 0 1 2.04 2.04V21.16a2.04 2.04 0 0 1-4.08 0v-4.08h2.04zm-2.04-.96V10.08A2.04 2.04 0 0 1 8.96 8.04h4.08a2.04 2.04 0 0 1 0 4.08H8.96v1.96z"/><path fill="#2EB67D" d="M15.04 8.96A2.04 2.04 0 0 1 17.08 11h-4.08V8.96zM14.08 11h4.08A2.04 2.04 0 0 1 20.2 15.08H16v-4.08z"/><path fill="#ECB22E" d="M15.04 8.96A2.04 2.04 0 0 1 13 6.92V2.84a2.04 2.04 0 0 1 4.08 0v4.08h-2.04zM13 10.08v4.08A2.04 2.04 0 0 1 10.96 16.2V10.08h2.04z"/></svg>
                </div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center transform -rotate-3 text-blue-500 font-bold text-xl">
                  31
                </div>
              </div>
            </div>
          </div>
          
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-20 py-24 px-6 bg-white/80 border-t border-gray-100 backdrop-blur-md">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-ink mb-4">Everything you need</h2>
              <p className="text-lg text-gray-500">Powerful features wrapped in a minimal interface.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">Drag & Drop Builder</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Construct your forms visually. Just drag fields, reorder them, and configure settings without touching any code.</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">Live Previews</h3>
                <p className="text-gray-500 text-sm leading-relaxed">See exactly what your users will see. Every style change and rule applies in real-time in the preview window.</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">Real-time Analytics</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Track views, submissions, and drop-offs. Instantly understand how your forms are performing with beautiful charts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section (Placeholder) */}
        <section id="solutions" className="relative z-20 py-24 px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-6">Built for every workflow</h2>
              <p className="text-lg text-gray-500 mb-8">From simple contact forms to complex multi-step surveys with logic routing, our solution adapts to what you need.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700"><span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span> Lead Generation</li>
                <li className="flex items-center gap-3 text-gray-700"><span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span> Customer Feedback</li>
                <li className="flex items-center gap-3 text-gray-700"><span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span> Event Registration</li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 h-[360px] flex overflow-hidden group">
              {/* Fake Sidebar */}
              <div className="w-20 border-r border-gray-100 bg-gray-50 flex flex-col items-center py-4 gap-4">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-green-500 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
              {/* Fake Builder Canvas */}
              <div className="flex-1 bg-gray-50/50 p-6 flex flex-col gap-4 relative overflow-hidden">
                {/* Drag Cursor Animation (Fake) */}
                <div className="absolute w-6 h-6 z-10 text-ink opacity-0 group-hover:opacity-100 group-hover:animate-[bounce_2s_infinite] transition-opacity top-10 right-10 pointer-events-none">
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 4.7z"/></svg>
                </div>
                
                <div className="w-3/4 h-8 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm group-hover:-translate-y-1 transition-transform">
                  <div className="w-1/3 h-3 bg-gray-200 rounded-full mb-3"></div>
                  <div className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg"></div>
                </div>
                <div className="w-full bg-white border border-blue-200 ring-2 ring-blue-50 ring-offset-1 rounded-xl p-4 shadow-sm relative group-hover:translate-x-1 transition-transform">
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-blue-100 rounded-r flex items-center justify-center">
                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                  </div>
                  <div className="w-1/4 h-3 bg-gray-200 rounded-full mb-3"></div>
                  <div className="w-full h-20 bg-gray-50 border border-gray-100 rounded-lg"></div>
                </div>
                <div className="w-1/3 h-10 bg-primary/20 border border-primary/30 rounded-xl mt-auto"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Section (Placeholder) */}
        <section id="resources" className="relative z-20 py-24 px-6 bg-white border-t border-gray-100">
          <div className="max-w-[1000px] mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-4">Resources to help you grow</h2>
            <p className="text-lg text-gray-500 mb-10">Templates, guides, and integrations to get you started in minutes.</p>
            <div className="flex justify-center gap-4">
              <a href="#" className="px-6 py-3 bg-gray-100 text-ink rounded-xl font-semibold hover:bg-gray-200 transition-colors">Browse Templates</a>
              <a href="#" className="px-6 py-3 bg-gray-100 text-ink rounded-xl font-semibold hover:bg-gray-200 transition-colors">Read the Docs</a>
            </div>
          </div>
        </section>

        {/* About Creator Section */}
        <section id="about" className="relative z-20 py-24 px-6 bg-white border-t border-gray-100 pb-32">
          <div className="max-w-[800px] mx-auto">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-[32px] p-10 md:p-14 border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
              
              {/* Subtle Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              
              <p className="relative z-10 text-sm font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">Meet the Creator</p>
              <h2 className="relative z-10 text-4xl md:text-5xl font-display font-bold text-ink mb-6">Ayush Sinha</h2>
              
              <div className="relative z-10 w-12 h-1 bg-gray-200 mx-auto rounded-full mb-8"></div>
              
              <p className="relative z-10 text-lg md:text-xl leading-relaxed text-gray-600 max-w-2xl mx-auto mb-10 font-medium">
                A 2nd Year B.Tech student at CGC University, specializing in Artificial Intelligence and Machine Learning. 
                With a strong foundation in <span className="text-ink font-bold">Python, C, and C++</span>, I am deeply dedicated to mastering Full-Stack Web Development. 
                This Form Builder is a testament to my commitment to building clean, user-centric applications that bridge elegant UI design with powerful backend architecture.
              </p>

              <div className="relative z-10 flex items-center justify-center gap-5">
                <a href="https://github.com/ayushsinha008" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center hover:bg-[#24292e] hover:border-[#24292e] hover:shadow-sm transition-all hover:-translate-y-1 group">
                  <svg className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
                <a href="https://x.com/Ayush_zxn07" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all hover:-translate-y-1 group">
                  <svg className="w-5 h-5 text-gray-700 group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.15H5.059z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/ayush-sinha-46a37b365" target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#0A66C2]/10 border border-[#0A66C2]/20 rounded-2xl flex items-center justify-center hover:bg-[#0A66C2] hover:text-white group transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-[#0A66C2]/20">
                  <svg className="w-5 h-5 text-[#0A66C2] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                </a>
                <a href="https://www.instagram.com/_ayush__704?igsh=MXQ4bGRqdDNsbGFtcw==" target="_blank" rel="noreferrer" className="w-12 h-12 bg-pink-50 border border-pink-100 rounded-2xl flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:border-transparent group transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-pink-500/20">
                  <svg className="w-6 h-6 text-pink-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" clipRule="evenodd" /></svg>
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
