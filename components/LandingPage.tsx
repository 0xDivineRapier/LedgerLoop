import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3, PieChart, CheckCircle2, TrendingUp, Users, ArrowRightLeft, Lock } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onBookDemoClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onBookDemoClick }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 overflow-x-hidden">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                        <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        LedgerLoop
                    </span>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={onLoginClick}
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        Log In
                    </button>
                    <button 
                        onClick={onBookDemoClick}
                        className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:scale-105"
                    >
                        Book Demo
                    </button>
                </div>
            </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                {/* Hero Text */}
                <div className="flex-1 text-center lg:text-left z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles className="w-4 h-4 fill-current" />
                        <span>AI-Powered Reconciliation Engine 2.5</span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-6 duration-700 leading-[1.1]">
                        Accounting done <br/> 
                        <span className="text-indigo-600 dark:text-indigo-400">by lunchtime.</span>
                    </h1>
                    
                    <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
                        LedgerLoop replaces manual spreadsheet matching with intelligent AI agents. Reconcile thousands of transactions with 99.9% accuracy in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <button 
                            onClick={onLoginClick}
                            className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 hover:scale-105"
                        >
                            Start Free Trial
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={onBookDemoClick}
                            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-lg px-8 py-4 rounded-xl font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            View Live Demo
                        </button>
                    </div>
                    
                    <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>No credit card required</span>
                        </div>
                         <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>SOC2 Compliant</span>
                        </div>
                    </div>
                </div>

                {/* Hero Visual - Dashboard Preview */}
                <div className="flex-1 w-full max-w-xl lg:max-w-none animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Dashboard Mockup Card */}
                    <div className="relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden backdrop-blur-sm">
                        {/* Mock Header */}
                        <div className="h-12 border-b border-slate-100 dark:border-slate-700 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                            </div>
                            <div className="mx-auto bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-md text-xs text-slate-400 font-mono">
                                app.ledgerloop.com/dashboard
                            </div>
                        </div>

                        {/* Mock Content */}
                        <div className="p-6 space-y-6">
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cash Position</div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">$2,405,120</div>
                                    <div className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                                        <TrendingUp className="w-3 h-3" /> +12.5% this week
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Auto-Matched</div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">1,248</div>
                                    <div className="text-xs text-indigo-500 flex items-center gap-1 mt-1">
                                        <Zap className="w-3 h-3" /> 99.8% Accuracy
                                    </div>
                                </div>
                            </div>

                            {/* Active Reconciliation List */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Activity</h4>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full animate-pulse">Live</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { company: "Acme Corp", amount: "$12,500.00", status: "Auto-Matched", time: "Just now" },
                                        { company: "Globex Inc", amount: "$4,250.50", status: "Auto-Matched", time: "2m ago" },
                                        { company: "Soylent Corp", amount: "$890.00", status: "Flagged for Review", time: "5m ago", warning: true },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-default">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.warning ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                    <span className="text-xs font-bold">{item.company[0]}</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.company}</div>
                                                    <div className="text-xs text-slate-500">{item.time}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">{item.amount}</div>
                                                <div className={`text-[10px] font-medium ${item.warning ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {item.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        {/* Social Proof */}
        <div className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">TRUSTED BY FINANCE TEAMS AT MODERN COMPANIES</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                     {['Stripe', 'Mercury', 'Brex', 'Ramp', 'Gusto'].map((brand) => (
                         <span key={brand} className="text-xl md:text-2xl font-bold text-slate-400 dark:text-slate-500">{brand}</span>
                     ))}
                </div>
            </div>
        </div>

        {/* Features Section */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Built for the modern CFO</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Everything you need to close the books faster, without the headache of manual data entry.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="group p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">AI Vibe Match™</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                            Our LLM understands that "Trf Frm PT Indo" and "Indo Jaya Tbk" are the same entity. It handles the messy bank descriptions so you don't have to.
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 text-xs font-mono text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between mb-2">
                                <span>Inv #9921</span>
                                <span className="text-emerald-500">Matched (98%)</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[98%]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="group p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-violet-500/30 transition-all duration-300">
                        <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Real-time Cash Position</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                            Stop guessing your runway. LedgerLoop calculates your exact cash position by reconciling expected vs received funds instantly.
                        </p>
                         <div className="h-20 flex items-end gap-1 px-4 pb-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                <div key={i} className="flex-1 bg-violet-400/50 rounded-t-sm hover:bg-violet-500 transition-colors" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="group p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Anomaly Detection</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                            We flag suspicious duplicate transactions or amount mismatches before they mess up your month-end close.
                        </p>
                        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-100 dark:border-rose-900/30">
                             <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                             <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">1 Anomaly Detected</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 border-t border-slate-200 dark:border-slate-800">
             <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-16 text-slate-900 dark:text-white">Loved by finance teams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { name: "Sarah J.", role: "CFO at TechFlow", quote: "We saved 20 hours a week on reconciliation. It feels like magic." },
                        { name: "David L.", role: "Controller at FinCorp", quote: "The fuzzy matching is incredible. It catches things our old ERP missed constantly." },
                        { name: "Elena R.", role: "Finance Manager at ScaleUp", quote: "Finally, a tool that looks good and works perfectly. The dark mode is a lifesaver." }
                    ].map((t, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="flex gap-1 mb-4">
                                {[1,2,3,4,5].map(star => <div key={star} className="w-4 h-4 bg-amber-400 rounded-sm"></div>)}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">"{t.quote}"</p>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                                <div className="text-sm text-slate-500">{t.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
             {/* Background Gradients */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px] pointer-events-none"></div>

             <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to automate your ledger?</h2>
                <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
                    Join 5,000+ finance professionals who trust LedgerLoop to close their books faster.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={onLoginClick}
                        className="bg-white text-indigo-900 hover:bg-indigo-50 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-xl"
                    >
                        Get Started for Free
                    </button>
                     <button 
                        onClick={onBookDemoClick}
                        className="bg-indigo-800/50 hover:bg-indigo-800 border border-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors backdrop-blur-md"
                    >
                        Book a Demo
                    </button>
                </div>
             </div>
        </section>
        
        <footer className="bg-slate-50 dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <PieChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-slate-900 dark:text-slate-200">LedgerLoop</span>
                </div>
                <div className="text-slate-500 text-sm">
                    © 2024 LedgerLoop Inc. All rights reserved.
                </div>
            </div>
        </footer>
    </div>
  );
};

export default LandingPage;
