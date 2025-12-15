import React, { useState } from 'react';
import { ArrowLeft, Play, UploadCloud, Sparkles, CheckCircle2, BarChart3, Calendar, Check, Loader2, Video } from 'lucide-react';
import { generateMarketingVideo } from '../services/geminiService';

interface BookDemoProps {
  onBack: () => void;
}

const BookDemo: React.FC<BookDemoProps> = ({ onBack }) => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing AI...");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    // Simulate API call
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  const handlePlayDemo = async () => {
    if (videoUrl) return;

    setIsGeneratingVideo(true);
    setLoadingText("Warming up Veo 3.1 model...");
    
    // Rotate loading text to keep user entertained
    const interval = setInterval(() => {
       setLoadingText(prev => {
          if (prev.includes("Warming")) return "Generating futuristic visuals...";
          if (prev.includes("Generating")) return "Rendering financial data streams...";
          if (prev.includes("Rendering")) return "Finalizing motion graphics...";
          return "Almost ready...";
       });
    }, 4000);

    try {
      const url = await generateMarketingVideo();
      if (url) {
        setVideoUrl(url);
      } else {
        alert("Could not generate video. Please ensure you have selected a paid API key.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating video");
    } finally {
      clearInterval(interval);
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Video & Infographic */}
          <div className="space-y-12 animate-in slide-in-from-left-8 duration-700">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
                See LedgerLoop in Action
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Watch our AI-generated product tour to see how we transform weeks of manual reconciliation into minutes of review.
              </p>
            </div>

            {/* Video Player / Generator */}
            <div 
              className={`relative aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 transition-all ${!videoUrl && !isGeneratingVideo ? 'group cursor-pointer' : ''}`}
              onClick={!videoUrl && !isGeneratingVideo ? handlePlayDemo : undefined}
            >
              {videoUrl ? (
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                   {/* Background Gradient */}
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 z-10"></div>
                   
                   {/* Thumbnail Image */}
                   <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center transition-opacity duration-500 ${isGeneratingVideo ? 'opacity-20' : 'opacity-40 group-hover:opacity-50'}`}></div>

                   {/* Center Action */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center text-center w-full px-4">
                      {isGeneratingVideo ? (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                           <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4"></div>
                           <h3 className="text-white font-bold text-lg mb-1">Creating Demo Video</h3>
                           <p className="text-indigo-200 text-sm animate-pulse">{loadingText}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300 mb-4 shadow-lg shadow-indigo-900/50">
                                <Play className="w-8 h-8 text-white fill-current ml-1" />
                            </div>
                            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                                <span className="text-white font-medium text-sm flex items-center gap-2">
                                  <Sparkles className="w-3 h-3 text-indigo-400" />
                                  Generate AI Demo
                                </span>
                            </div>
                        </div>
                      )}
                   </div>

                   {/* Fake UI Elements (Only visible when not generating) */}
                   {!isGeneratingVideo && (
                     <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-indigo-500"></div>
                        </div>
                        <span className="text-xs text-white/80 font-mono">00:00</span>
                     </div>
                   )}
                </>
              )}
            </div>
            
            <p className="text-xs text-slate-500 italic text-center">
              Powered by Google Gemini Veo 3.1. Video generation may take 1-2 minutes.
            </p>

            {/* Infographic: How it Works */}
            <div>
                <h3 className="text-xl font-bold mb-8 text-slate-900 dark:text-white">How it works</h3>
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

                    <div className="space-y-10">
                        {[
                            { 
                                icon: UploadCloud, 
                                title: "Connect Data Source", 
                                desc: "Upload PDFs, CSVs, or connect directly to your bank feed via API." 
                            },
                            { 
                                icon: Sparkles, 
                                title: "AI Analysis", 
                                desc: "LedgerLoop's engine reads messy descriptions and fuzzy matches entities instantly." 
                            },
                            { 
                                icon: CheckCircle2, 
                                title: "Review Matches", 
                                desc: "Approve high-confidence matches and resolve flagged anomalies in one click." 
                            },
                            { 
                                icon: BarChart3, 
                                title: "Real-time Insights", 
                                desc: "See your accurate cash position and outstanding receivables immediately." 
                            }
                        ].map((step, idx) => (
                            <div key={idx} className="relative flex items-start gap-6 group">
                                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:border-indigo-500 dark:group-hover:border-indigo-500 transition-colors">
                                    <step.icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{step.title}</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:pl-12 lg:sticky lg:top-32 animate-in slide-in-from-right-8 duration-700 delay-200">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
              {formState === 'success' ? (
                <div className="text-center py-12 animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Request Received!</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Thanks for your interest. Our team will contact you within 24 hours to schedule your personalized demo.
                  </p>
                  <button 
                    onClick={onBack}
                    className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold py-3.5 rounded-xl transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              ) : (
                <>
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4">
                            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Schedule a Demo</h3>
                        <p className="text-slate-500 dark:text-slate-400">Fill out the form below and we'll get in touch to show you around.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Jane"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Work Email</label>
                            <input 
                                type="email" 
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="jane@company.com"
                            />
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="Acme Inc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role (Optional)</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none">
                                <option>CFO / Finance Director</option>
                                <option>Controller</option>
                                <option>Accountant</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <button 
                            type="submit"
                            disabled={formState === 'submitting'}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
                        >
                            {formState === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Book Demo"}
                        </button>
                        
                        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                            By clicking submit, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookDemo;