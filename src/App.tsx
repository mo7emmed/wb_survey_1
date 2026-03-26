/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Moon, Sun, Bed, Weight, CheckCircle2, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const QUESTIONS = [
  {
    id: 1,
    question: "أسلوب النوم الذي أختاره:",
    options: [
      "فراش عملي مع ضمان حقيقي بسعر مناسب",
      "راحة فندقية فاخرة بغض النظر عن السعر"
    ],
    icon: <Bed className="w-8 h-8" />
  },
  {
    id: 2,
    question: "أستيقظ وأنا..",
    options: [
      "نشيط وبدون مشاكل",
      "أشعر بألم في الظهر"
    ],
    icon: <Sun className="w-8 h-8" />
  },
  {
    id: 3,
    question: "عادةً أريد النوم على فراش...",
    options: [
      "ناشف أو متوسط الطراوة",
      "عالي الطراوة"
    ],
    icon: <Moon className="w-8 h-8" />
  },
  {
    id: 4,
    question: "وزني..",
    options: [
      "أقل من 80 كغ",
      "80 - 100 كغ",
      "100 - 120 كغ",
      "أكثر من 120 كغ"
    ],
    icon: <Weight className="w-8 h-8" />
  }
];

const LOGO_WHITE = "https://mediafiles.whitebedding.net/Landscape%20-%20White.png";
const LOGO_CYAN = "https://mediafiles.whitebedding.net/Landscape%20Reduced%20Margines%20-%20Dark%20Cyan.png";

export default function App() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 for landing, 0-3 for questions, 4 for result
  const [answers, setAnswers] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const pageId = process.env.PAGE_ID;
    if (pageId) {
      // @ts-ignore
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', pageId);
      window.fbq('track', 'SurveyPageView');
    }
  }, []);

  const handleStart = () => {
    setCurrentStep(0);
  };

  const handleAnswer = (answer: string) => {
    if (isAnimating) return;
    
    const newAnswers = [...answers];
    newAnswers[currentStep] = answer;
    setAnswers(newAnswers);
    
    if (currentStep < QUESTIONS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 400);
    } else {
      setCurrentStep(QUESTIONS.length);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (currentStep === QUESTIONS.length) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [currentStep]);

  const generateWhatsAppLink = () => {
    const phone = "+9647722000668";
    let message = "مرحباً الفراش الأبيض، لقد أكملت الاستبيان وهذه هي إجاباتي:\n\n";
    QUESTIONS.forEach((q, index) => {
      message += `*${q.question}*\n- ${answers[index]}\n\n`;
    });
    message += "أود الحصول على خصم الـ 10% الخاص بي!";
    
    return `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
  };

  const handleWhatsAppClick = async () => {
    try {
      // Track Meta Pixel Event
      if (window.fbq) {
        window.fbq('trackCustom', 'WABtnClick');
      }

      // Calculate time spent
      const timeSpentMs = Date.now() - startTime;
      const seconds = Math.floor(timeSpentMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const timeSpentStr = minutes > 0 ? `${minutes} دقيقة و ${remainingSeconds} ثانية` : `${seconds} ثانية`;

      // Send Telegram notification in the background
      fetch('/api/notify', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSpent: timeSpentStr })
      }).catch(err => console.error('Silent notification error:', err));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#00838f] text-white font-sans selection:bg-yellow-400 selection:text-cyan-900 overflow-hidden relative" dir="rtl">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-400 rounded-full blur-3xl opacity-10"
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 py-12 flex flex-col min-h-screen">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center mb-12"
        >
          <img src={LOGO_WHITE} alt="White Bedding" className="h-16 object-contain" referrerPolicy="no-referrer" />
        </motion.header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {currentStep === -1 && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-center space-y-8"
              >
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold leading-tight">
                    اكتشف سر <span className="text-yellow-400">النوم المثالي</span>
                  </h1>
                  <p className="text-cyan-50 text-lg opacity-90">
                    أجب على 4 أسئلة سريعة واحصل على خصم حصري 10% على مشترياتك القادمة.
                  </p>
                </div>
                
                <div className="relative inline-block group">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-1 bg-yellow-400 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"
                  ></motion.div>
                  <button
                    onClick={handleStart}
                    className="relative px-10 py-4 bg-yellow-400 text-cyan-900 font-bold text-xl rounded-full shadow-xl hover:bg-white transition-colors flex items-center gap-3"
                  >
                    ابدأ الآن
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                </div>

                <div className="pt-8 flex justify-center gap-8 opacity-60">
                  <div className="flex flex-col items-center gap-2">
                    <Bed className="w-6 h-6" />
                    <span className="text-xs">راحة فندقية</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Sun className="w-6 h-6" />
                    <span className="text-xs">نشاط يومي</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Moon className="w-6 h-6" />
                    <span className="text-xs">نوم عميق</span>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep >= 0 && currentStep < QUESTIONS.length && (
              <motion.div
                key={`question-${currentStep}`}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400 font-bold">السؤال {currentStep + 1} من {QUESTIONS.length}</span>
                  <div className="flex gap-1">
                    {QUESTIONS.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 w-8 rounded-full transition-colors ${i <= currentStep ? 'bg-yellow-400' : 'bg-cyan-800'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative w-full">
                  {currentStep > 0 && currentStep < QUESTIONS.length && (
                    <button
                      onClick={handleBack}
                      className="absolute top-4 left-4 p-2 text-white/50 hover:text-yellow-400 transition-colors flex items-center gap-1 text-sm font-bold"
                    >
                      <ChevronRight className="w-4 h-4" />
                      رجوع
                    </button>
                  )}
                  <div className="bg-yellow-400 text-cyan-900 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto sm:mx-0">
                    {QUESTIONS[currentStep].icon}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-8 leading-relaxed text-center sm:text-right">
                    {QUESTIONS[currentStep].question}
                  </h2>
                  <div className={`grid gap-3 sm:gap-4 ${currentStep < QUESTIONS.length - 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {QUESTIONS[currentStep].options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(option)}
                        className={`w-full p-3 sm:p-5 text-center bg-white/5 hover:bg-white/20 border border-white/10 hover:border-yellow-400 rounded-2xl transition-all duration-200 group flex flex-col items-center justify-center gap-3 ${currentStep < QUESTIONS.length - 1 ? 'min-h-[160px]' : 'flex-row text-right p-5'}`}
                      >
                        <span className={`${currentStep < QUESTIONS.length - 1 ? 'text-base sm:text-lg leading-tight' : 'text-xl'} font-bold group-hover:text-yellow-400 transition-colors`}>
                          {option}
                        </span>
                        <div className={`rounded-full border-2 border-white/30 group-hover:border-yellow-400 flex items-center justify-center ${currentStep < QUESTIONS.length - 1 ? 'w-6 h-6' : 'w-7 h-7'}`}>
                          <div className={`bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${currentStep < QUESTIONS.length - 1 ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === QUESTIONS.length && (
              <motion.div
                key="result"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-8"
              >
                <div className="relative inline-block">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="bg-yellow-400 text-cyan-900 p-6 rounded-full shadow-2xl relative z-10"
                  >
                    <CheckCircle2 className="w-20 h-20" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-yellow-400 rounded-full blur-xl"
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-yellow-400">مبارك!</h2>
                  <p className="text-2xl font-bold">حصلت على خصم 10 بالمئة.</p>
                  <p className="text-cyan-50 opacity-80">تواصل معنا الآن عبر الواتساب لتفعيل الخصم واختيار فراشك المثالي.</p>
                </div>

                <motion.a
                  href={generateWhatsAppLink()}
                  onClick={handleWhatsAppClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-3 w-full py-5 bg-[#25D366] text-white font-bold text-xl rounded-2xl shadow-xl hover:brightness-110 transition-all"
                >
                  <MessageCircle className="w-7 h-7" />
                  تواصل عبر الواتساب
                </motion.a>
                
                <p className="text-xs opacity-50">سيتم إرسال إجاباتك تلقائياً لمساعدتنا في خدمتك بشكل أفضل.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center opacity-40 text-xs">
          <p>© {new Date().getFullYear()} الفراش الأبيض - جميع الحقوق محفوظة</p>
        </footer>
      </div>

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5
          }}
          animate={{ 
            y: [null, Math.random() * -100 - 50],
            opacity: [null, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
        />
      ))}
    </div>
  );
}
