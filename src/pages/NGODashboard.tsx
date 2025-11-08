import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation"; // <-- CORRECTED IMPORT
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  Heart, TrendingUp, Leaf, FileText, MapPin, Plus, BarChart3, Waves,
  // Icons for the chatbot
  MessageCircle, X, Send, Bot, Mic, Languages
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// --- PASTE YOUR GEMINI API KEY HERE ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// 🚨 Security Warning: For personal projects only. Protect your key in production.

// --- TYPE DEFINITIONS FOR SPEECH RECOGNITION ---
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- "CREDIFY" CHATBOT COMPONENT ---
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I am Credify, your AI assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
      setMessages(prev => [...prev, { role: 'ai', text: "It seems the API Key is missing. Please ask the site administrator to configure it." }]);
      return;
    }
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const chatHistory = messages.map(msg => ({ role: msg.role === 'ai' ? 'model' : 'user', parts: [{ text: msg.text }] }));
      const result = await model.generateContent({ contents: [...chatHistory, { role: 'user', parts: [{ text: input }] }] });
      const response = result.response;
      const aiMessage = { role: 'ai', text: response.text() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage = { role: 'ai', text: "Sorry, I'm having trouble connecting. Please check your API key and try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.lang = language;
      recognition.start();
    }
    setIsListening(!isListening);
  };
  
  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <Button onClick={() => setIsOpen(!isOpen)} size="lg" className="rounded-full w-16 h-16 bg-gradient-to-br from-ocean-blue to-teal-accent text-white shadow-lg ocean-glow transform hover:scale-110 transition-transform duration-300">
          {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
        </Button>
      </div>
      
      {isOpen && (
        <div className="fixed bottom-28 right-8 z-50 w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col glass-card border-border/50 rounded-2xl overflow-hidden animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h3 className="text-lg font-bold text-foreground">Credify</h3>
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-muted-foreground" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-muted-foreground text-sm border-none focus:ring-0"
              >
                <option value="en-US" className="bg-background text-foreground">English</option>
                <option value="hi-IN" className="bg-background text-foreground">हिन्दी</option>
                <option value="es-ES" className="bg-background text-foreground">Español</option>
                <option value="fr-FR" className="bg-background text-foreground">Français</option>
                <option value="de-DE" className="bg-background text-foreground">Deutsch</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-primary/80 text-primary-foreground' : 'bg-card/70'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white animate-pulse" />
                  </div>
                <div className="max-w-[80%] p-3 rounded-xl bg-card/70">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border/50">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Credify..." className="flex-1 h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" disabled={isLoading} />
              <Button type="button" size="icon" variant="outline" onClick={handleMicClick} disabled={!recognitionRef.current}>
                <Mic className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
              </Button>
              <Button type="submit" size="icon" className="bg-primary text-primary-foreground ocean-glow" disabled={isLoading}>
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


const mockCreditData = [
  { month: "Jan", credits: 120 }, { month: "Feb", credits: 200 }, { month: "Mar", credits: 180 },
  { month: "Apr", credits: 250 }, { month: "May", credits: 300 }, { month: "Jun", credits: 280 }
];

const mockTrendData = [
  { month: "Jan", price: 45 }, { month: "Feb", price: 52 }, { month: "Mar", price: 48 },
  { month: "Apr", price: 55 }, { month: "May", price: 62 }, { month: "Jun", price: 58 }
];

const NGODashboard = () => {
  const { profile, signOut } = useAuth();
  const [projects] = useState([
    { id: 1, name: "Mangrove Restoration Project", location: "Sundarbans", credits: 450, status: "Active" },
    { id: 2, name: "Coastal Conservation", location: "Kerala", credits: 320, status: "Verified" },
    { id: 3, name: "Blue Carbon Initiative", location: "Goa", credits: 280, status: "Pending" }
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole="ngo" onSignOut={signOut} />
      
      {/* Added pt-24 to this main tag to push content below the fixed navbar */}
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile?.full_name || 'NGO Partner'}
              </h1>
              <p className="text-muted-foreground">
                {profile?.organization_name} • NGO Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-border/50"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Credits Generated</p><p className="text-2xl font-bold text-foreground">1,050</p><p className="text-xs text-green-500 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" />+12% from last month</p></div><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><Leaf className="w-6 h-6 text-primary" /></div></div></CardContent></Card>
          <Card className="glass-card border-border/50"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Credits Sold</p><p className="text-2xl font-bold text-foreground">780</p><p className="text-xs text-green-500 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" />+8% from last month</p></div><div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center"><BarChart3 className="w-6 h-6 text-green-500" /></div></div></CardContent></Card>
          <Card className="glass-card border-border/50"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Active Projects</p><p className="text-2xl font-bold text-foreground">3</p><p className="text-xs text-blue-500 flex items-center mt-1"><MapPin className="w-3 h-3 mr-1" />Across 3 locations</p></div><div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-blue-500" /></div></div></CardContent></Card>
          <Card className="glass-card border-border/50"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Revenue (₹)</p><p className="text-2xl font-bold text-foreground">₹4,68,000</p><p className="text-xs text-teal-500 flex items-center mt-1"><Waves className="w-3 h-3 mr-1" />From blue carbon</p></div><div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-teal-500" /></div></div></CardContent></Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="glass-card border-border/50"><CardHeader><CardTitle className="text-foreground">Credits Generated</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={mockCreditData}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="month" className="text-muted-foreground" /><YAxis className="text-muted-foreground" /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} /><Bar dataKey="credits" fill="hsl(var(--primary))" className="opacity-80" /></BarChart></ResponsiveContainer></CardContent></Card>
          <Card className="glass-card border-border/50"><CardHeader><CardTitle className="text-foreground">Market Price Trends</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={mockTrendData}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis dataKey="month" className="text-muted-foreground" /><YAxis className="text-muted-foreground" /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} /><Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} /></LineChart></ResponsiveContainer></CardContent></Card>
        </div>

        {/* Projects Section */}
        <Card className="glass-card border-border/50 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Your Projects</CardTitle>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90"><Link to="/projects/submit"><Plus className="w-4 h-4 mr-2" />Submit New Project</Link></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4"><div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Waves className="w-5 h-5 text-primary" /></div><div><h3 className="font-semibold text-foreground">{project.name}</h3><p className="text-sm text-muted-foreground flex items-center"><MapPin className="w-3 h-3 mr-1" />{project.location}</p></div></div>
                  <div className="flex items-center space-x-4"><div className="text-right"><p className="font-semibold text-foreground">{project.credits} Credits</p><Badge variant={project.status === 'Active' ? 'default' : project.status === 'Verified' ? 'secondary' : 'outline'} className="mt-1">{project.status}</Badge></div></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-border/50 hover:bg-accent/20 transition-colors cursor-pointer"><CardContent className="p-6 text-center"><Plus className="w-12 h-12 text-primary mx-auto mb-4" /><h3 className="font-semibold text-foreground mb-2">Submit Project</h3><p className="text-sm text-muted-foreground">Upload MRV reports and project details</p></CardContent></Card>
          <Card className="glass-card border-border/50 hover:bg-accent/20 transition-colors cursor-pointer" onClick={() => window.location.href = '/marketplace'}><CardContent className="p-6 text-center"><BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" /><h3 className="font-semibold text-foreground mb-2">Sell Credits</h3><p className="text-sm text-muted-foreground">List your verified credits for sale</p></CardContent></Card>
          <Card className="glass-card border-border/50 hover:bg-accent/20 transition-colors cursor-pointer" onClick={() => window.location.href = '/transactions'}><CardContent className="p-6 text-center"><FileText className="w-12 h-12 text-primary mx-auto mb-4" /><h3 className="font-semibold text-foreground mb-2">View Reports</h3><p className="text-sm text-muted-foreground">Check transaction history and analytics</p></CardContent></Card>
        </div>
      </main>

      {/* Renders the Chatbot in the corner */}
      <Chatbot />
    </div>
  );
};

export default NGODashboard;