import { Link } from 'react-router-dom';
import { ArrowRight, Layout, Zap, BarChart3, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas font-sans selection:bg-primary selection:text-on-primary">
      {/* Navigation */}
      <nav className="border-b border-hairline bg-canvas">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center">
              <span className="text-canvas font-display font-bold text-sm">F</span>
            </div>
            <span className="font-display font-semibold tracking-tight text-ink text-lg">FormBuilder</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-muted hover:text-ink transition-colors">
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-primary text-on-primary h-9 px-4 rounded-md flex items-center justify-center text-sm font-semibold hover:bg-primary-active transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-[800px] mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-soft border border-hairline text-sm font-semibold text-ink">
            <Zap className="w-4 h-4 text-badge-orange" />
            <span>Now with interactive Previews</span>
          </div>

          <h1 className="text-[56px] lg:text-[72px] leading-[1.05] font-display font-semibold tracking-tight text-ink">
            Build dynamic forms at <span className="text-muted">speed</span>.
          </h1>

          <p className="text-xl text-muted max-w-[600px] mx-auto">
            The open-source form builder designed for modern teams. Create beautiful, high-converting forms in minutes without writing a single line of code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-primary text-on-primary h-12 px-8 rounded-md flex items-center justify-center text-base font-semibold hover:bg-primary-active transition-colors gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto bg-surface-soft text-ink border border-hairline h-12 px-8 rounded-md flex items-center justify-center text-base font-semibold hover:bg-surface-card transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-surface-soft border-t border-hairline px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] leading-[1.1] font-display font-semibold tracking-tight text-ink">Everything you need</h2>
            <p className="text-lg text-muted mt-4">Powerful features wrapped in a beautiful, minimal interface.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-canvas border border-hairline rounded-xl p-8 hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-surface-soft rounded-lg flex items-center justify-center mb-6">
                <Layout className="w-6 h-6 text-ink" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3 font-sans">Drag & Drop Builder</h3>
              <p className="text-muted text-base">Visually construct your forms with a smooth, intuitive drag and drop interface. Reorder fields effortlessly.</p>
            </div>

            <div className="bg-canvas border border-hairline rounded-xl p-8 hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-surface-soft rounded-lg flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-ink" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3 font-sans">Live Previews</h3>
              <p className="text-muted text-base">See exactly what your users will see. Interactive preview modals let you test form logic before publishing.</p>
            </div>

            <div className="bg-canvas border border-hairline rounded-xl p-8 hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-surface-soft rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-ink" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3 font-sans">Beautiful Analytics</h3>
              <p className="text-muted text-base">Track views, submissions, and conversion rates with gorgeous charts built into your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline bg-canvas py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-ink rounded-full flex items-center justify-center">
              <span className="text-canvas font-display font-bold text-xs">F</span>
            </div>
            <span className="font-display font-semibold tracking-tight text-ink text-base">FormBuilder</span>
          </div>
          <p className="text-sm text-muted">© 2026 FormBuilder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
