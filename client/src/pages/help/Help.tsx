import { HelpCircle, Book, MessageCircle, ArrowUpRight, Search } from 'lucide-react';

const FAQs = [
  {
    q: "How do I create my first form?",
    a: "Navigate to the Dashboard and click the 'Add New Form' button. You can then use the drag-and-drop builder to add fields to your form."
  },
  {
    q: "Where can I see the responses?",
    a: "On your Dashboard, hover over a published form and click the analytics (chart) icon. This will take you to a detailed breakdown of all submissions."
  },
  {
    q: "Can I embed my form on my website?",
    a: "Currently, forms are shared via direct links. In the dashboard, click the 'Open form' icon to get the public link that you can share with your users."
  },
  {
    q: "How does the conversion rate work?",
    a: "The conversion rate measures how many people submitted your form compared to how many people viewed it. It gives you a quick health check on your form's performance."
  }
];

export default function Help() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-xl mx-auto pt-6">
          <div className="w-16 h-16 bg-surface-card rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">How can we help?</h1>
          <p className="text-muted">Search our knowledge base or browse frequently asked questions below.</p>
          
          <div className="relative mt-6 max-w-md mx-auto">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search for articles..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-hairline rounded-xl text-ink text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Resources Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="bg-white p-6 rounded-2xl border border-hairline hover:border-primary hover:shadow-md transition-all cursor-pointer group">
            <Book className="w-6 h-6 text-primary mb-4" />
            <h3 className="font-semibold text-ink group-hover:text-primary transition-colors flex items-center gap-1">
              Documentation <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-muted mt-2">Detailed guides and best practices for building effective forms.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-hairline hover:border-primary hover:shadow-md transition-all cursor-pointer group">
            <MessageCircle className="w-6 h-6 text-primary mb-4" />
            <h3 className="font-semibold text-ink group-hover:text-primary transition-colors flex items-center gap-1">
              Contact Support <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-muted mt-2">Can't find what you need? Our team is here to help you directly.</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="pt-8">
          <h2 className="text-xl font-bold tracking-tight text-ink mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQs.map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-hairline">
                <h3 className="font-semibold text-ink text-base">{faq.q}</h3>
                <p className="text-muted text-sm mt-2 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
