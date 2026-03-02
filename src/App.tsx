import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  MessageSquare, 
  LayoutDashboard, 
  Settings, 
  Search, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  BrainCircuit, 
  Sparkles,
  ChevronRight,
  User,
  LogOut,
  Send,
  Loader2,
  FileText,
  Calendar,
  GraduationCap,
  Moon,
  Sun
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from './utils/cn';
import { getChatResponse, generateQuiz, summarizeText, generateStudyPlan } from './services/gemini';

// Types
type View = 'dashboard' | 'chat' | 'quiz' | 'summary' | 'planner';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Components
const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20" 
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
    )}
  >
    <Icon size={20} className={cn("transition-transform duration-200 group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const Card = ({ children, className, title, subtitle, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, icon?: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300", className)}
  >
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {Icon && <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400"><Icon size={20} /></div>}
      </div>
    )}
    {children}
  </motion.div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizTopic, setQuizTopic] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [studyPlanGoal, setStudyPlanGoal] = useState('');
  const [studyPlanResult, setStudyPlanResult] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getChatResponse(userMsg, []);
      setMessages(prev => [...prev, { role: 'model', content: response || 'Sorry, I couldn\'t generate a response.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'Error: Failed to connect to AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await generateQuiz(quizTopic);
      setQuiz(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!summaryText.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await summarizeText(summaryText);
      setSummaryResult(result || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    if (!studyPlanGoal.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await generateStudyPlan(studyPlanGoal, "2 weeks");
      setStudyPlanResult(result || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
            <BrainCircuit size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight dark:text-white">EduGenius <span className="text-indigo-600 dark:text-indigo-400">AI</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <SidebarItem icon={MessageSquare} label="AI Tutor" active={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
          <SidebarItem icon={Sparkles} label="Quiz Generator" active={currentView === 'quiz'} onClick={() => setCurrentView('quiz')} />
          <SidebarItem icon={FileText} label="Smart Summary" active={currentView === 'summary'} onClick={() => setCurrentView('summary')} />
          <SidebarItem icon={Calendar} label="Study Planner" active={currentView === 'planner'} onClick={() => setCurrentView('planner')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white">Student User</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Free Plan</p>
            </div>
          </div>
          <button className="flex items-center gap-3 w-full px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative transition-colors duration-300">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">{currentView}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back! Ready to learn something new?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search topics..." 
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64 dark:text-white"
              />
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Stats & Progress */}
              <Card className="md:col-span-2" title="Learning Progress" subtitle="Your activity over the last 7 days" icon={BookOpen}>
                <div className="h-48 flex items-end justify-between gap-2 mt-6">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1 }}
                        className="w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-lg relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {h}%
                        </div>
                      </motion.div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Day {i+1}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Quick Stats" icon={Sparkles}>
                <div className="space-y-6 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center"><CheckCircle2 size={16} /></div>
                      <span className="text-sm font-medium dark:text-slate-300">Quizzes Passed</span>
                    </div>
                    <span className="text-lg font-bold dark:text-white">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center"><Clock size={16} /></div>
                      <span className="text-sm font-medium dark:text-slate-300">Study Hours</span>
                    </div>
                    <span className="text-lg font-bold dark:text-white">24.5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center"><GraduationCap size={16} /></div>
                      <span className="text-sm font-medium dark:text-slate-300">Courses</span>
                    </div>
                    <span className="text-lg font-bold dark:text-white">4</span>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="md:col-span-3" title="Recent Activity" icon={Clock}>
                <div className="space-y-4 mt-4">
                  {[
                    { title: "Quantum Physics Quiz", type: "Quiz", time: "2 hours ago", status: "Completed" },
                    { title: "World War II Summary", type: "Summary", time: "Yesterday", status: "Saved" },
                    { title: "Calculus Study Plan", type: "Planner", time: "2 days ago", status: "Active" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-100 dark:group-hover:border-indigo-900/30 transition-all">
                          {item.type === 'Quiz' ? <Sparkles size={18} /> : item.type === 'Summary' ? <FileText size={18} /> : <Calendar size={18} />}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold dark:text-slate-200">{item.title}</h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{item.type} • {item.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                          item.status === 'Completed' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        )}>
                          {item.status}
                        </span>
                        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {currentView === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col h-[calc(100vh-200px)] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">AI Tutor Online</span>
                  </div>
                  {messages.length > 0 && (
                    <button 
                      onClick={() => setMessages([])}
                      className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      Clear Conversation
                    </button>
                  )}
                </div>
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                      <MessageSquare size={32} />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white">Your Personal AI Tutor</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Ask me anything about your studies. I can explain complex topics, solve problems, or give you examples.</p>
                    <div className="grid grid-cols-2 gap-3 mt-8 w-full">
                      {["Explain photosynthesis", "Help with calculus", "History of Rome", "Grammar rules"].map(q => (
                        <button 
                          key={q} 
                          onClick={() => { setInput(q); }}
                          className="p-3 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    )}>
                      {msg.role === 'user' ? <User size={16} /> : <BrainCircuit size={16} />}
                    </div>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    )}>
                      <div className="markdown-body">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <BrainCircuit size={16} />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">EduGenius is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative max-w-4xl mx-auto">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your question here..."
                    className="w-full pl-6 pr-16 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card title="Generate a Quiz" subtitle="Enter a topic to generate a custom quiz" icon={Sparkles}>
                <div className="flex gap-4 mt-4">
                  <input 
                    type="text" 
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="e.g., Photosynthesis, Civil War, Python Basics"
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                  />
                  <button 
                    onClick={handleGenerateQuiz}
                    disabled={!quizTopic.trim() || isLoading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    Generate
                  </button>
                </div>
              </Card>

              {quiz.length > 0 && (
                <div className="space-y-6">
                  {quiz.map((q, i) => (
                    <Card key={i} title={`Question ${i + 1}`}>
                      <p className="text-lg font-medium mb-6 dark:text-slate-200">{q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, j) => (
                          <button 
                            key={j}
                            className="p-4 text-left border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                          >
                            <span className="w-8 h-8 inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-all text-xs font-bold">
                              {String.fromCharCode(65 + j)}
                            </span>
                            <span className="text-sm font-medium dark:text-slate-300">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'summary' && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card title="Source Text" subtitle="Paste the text you want to summarize" icon={FileText}>
                <textarea 
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="Paste long articles, notes, or textbook chapters here..."
                  className="w-full h-64 mt-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-sm dark:text-white"
                />
                <button 
                  onClick={handleSummarize}
                  disabled={!summaryText.trim() || isLoading}
                  className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Summarize Now
                </button>
              </Card>

              <Card title="AI Summary" subtitle="Key takeaways and conclusions" icon={Sparkles}>
                <div className="h-64 mt-4 overflow-y-auto pr-2">
                  {summaryResult ? (
                    <div className="markdown-body text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      <Markdown>{summaryResult}</Markdown>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-center">
                      <Sparkles size={32} className="mb-4 opacity-20" />
                      <p className="text-sm">Your summary will appear here</p>
                    </div>
                  )}
                </div>
                {summaryResult && (
                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all dark:text-slate-300">Copy Text</button>
                    <button className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all">Save to Notes</button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {currentView === 'planner' && (
            <motion.div 
              key="planner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card title="Create Study Plan" subtitle="What are you studying for?" icon={Calendar}>
                <div className="flex gap-4 mt-4">
                  <input 
                    type="text" 
                    value={studyPlanGoal}
                    onChange={(e) => setStudyPlanGoal(e.target.value)}
                    placeholder="e.g., Final Exam in Biology, Learning React in 2 weeks"
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                  />
                  <button 
                    onClick={handleGenerateStudyPlan}
                    disabled={!studyPlanGoal.trim() || isLoading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    Generate Plan
                  </button>
                </div>
              </Card>

              {studyPlanResult && (
                <Card title="Your Personalized Plan" icon={Sparkles}>
                  <div className="markdown-body mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    <Markdown>{studyPlanResult}</Markdown>
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
