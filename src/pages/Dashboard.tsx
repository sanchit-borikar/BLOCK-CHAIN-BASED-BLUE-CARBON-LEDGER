import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  TrendingUp, Coins, Upload, MapPin, Leaf, Activity, BarChart3, PieChart as PieChartIcon,
  // Icons for the chatbot
  MessageCircle, X, Send, Bot, Mic, Languages
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from "recharts";

// --- PASTE YOUR GEMINI API KEY HERE ---
const GEMINI_API_KEY = "AIzaSyAyuQAl0k_hvZC-Ruj4BJmiO99jVQeRiP8";
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
                {msg.role === 'ai' && ( <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div> )}
                <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-primary/80 text-primary-foreground' : 'bg-card/70'}`}><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div>
              </div>
            ))}
            {isLoading && ( <div className="flex gap-3 justify-start"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white animate-pulse" /></div><div className="max-w-[80%] p-3 rounded-xl bg-card/70"><p className="text-sm">Thinking...</p></div></div> )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border/50">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Credify..." className="flex-1 h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" disabled={isLoading} />
              <Button type="button" size="icon" variant="outline" onClick={handleMicClick} disabled={!recognitionRef.current}><Mic className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} /></Button>
              <Button type="submit" size="icon" className="bg-primary text-primary-foreground ocean-glow" disabled={isLoading}><Send className="w-5 h-5" /></Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


const Dashboard = () => {
  // Mock data for charts
  const carbonTrendsData = [
    { month: 'Jan', credits: 1200 },
    { month: 'Feb', credits: 1500 },
    { month: 'Mar', credits: 1800 },
    { month: 'Apr', credits: 2200 },
    { month: 'May', credits: 2800 },
    { month: 'Jun', credits: 3200 },
  ];

  const projectData = [
    { name: 'Mangrove Restoration', value: 45, color: 'hsl(var(--ocean-blue))' },
    { name: 'Seagrass Conservation', value: 30, color: 'hsl(var(--teal-accent))' },
    { name: 'Salt Marsh Protection', value: 25, color: 'hsl(var(--success-green))' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back, John
            </h1>
            <p className="text-muted-foreground">
              Here's your blue carbon portfolio overview
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                <Coins className="h-4 w-4 text-carbon-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">3,245</div>
                <p className="text-xs text-success-green">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <MapPin className="h-4 w-4 text-ocean-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">12</div>
                <p className="text-xs text-success-green">+2 new this month</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Biodiversity Index</CardTitle>
                <Leaf className="h-4 w-4 text-success-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">8.7</div>
                <p className="text-xs text-success-green">+0.3 from last week</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mangrove Count</CardTitle>
                <Activity className="h-4 w-4 text-teal-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">15,432</div>
                <p className="text-xs text-success-green">+1,234 planted</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Carbon Market Trends */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-ocean-blue" />
                    Carbon Market Trends
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={carbonTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="credits" 
                      stroke="hsl(var(--ocean-blue))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--ocean-blue))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Project Distribution */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-teal-accent" />
                  Project Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={projectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {projectData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="text-foreground font-medium ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Upload MRV Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Submit your latest monitoring, reporting, and verification data.
                </p>
                <Button variant="outline" className="w-full">
                  Upload Report
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success-green to-accent flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle>View Satellite Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Monitor your projects with real-time satellite imagery.
                </p>
                <Button variant="outline" className="w-full">
                  Open Map
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-carbon-gold to-warning-amber flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Deep dive into your project performance and insights.
                </p>
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Renders the Chatbot in the corner */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;