import React, { useState, useRef, useEffect, Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
// Lazy-load the heavy Three.js background to improve initial bundle and startup
const DottedSurface = lazy(() => import('@/components/DottedSurface').then(m => ({ default: m.DottedSurface })));
import { 
  Waves, Shield, TrendingUp, Globe, ArrowRight, CheckCircle, Leaf, Database,
  MessageCircle, X, Send, Bot,
  Mic, Languages
} from "lucide-react";

// Load API key from environment variables
// Load and verify API key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Gemini API key is missing from environment variables!");
} else {
  console.log("Gemini API key loaded successfully");
}

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

  // Test API connection on component mount
  useEffect(() => {
    const testAPI = async () => {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("API Test Success:", result.response.text());
      } catch (error) {
        console.error("API Test Failed:", error);
      }
    };
    testAPI();
  }, []);

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
      console.log("Using API Key:", GEMINI_API_KEY.substring(0, 8) + "...");
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const chatHistory = messages.map(msg => ({ role: msg.role === 'ai' ? 'model' : 'user', parts: [{ text: msg.text }] }));
        const result = await model.generateContent({ contents: [...chatHistory, { role: 'user', parts: [{ text: input }] }] });
      
      if (!result.response) {
        throw new Error("No response received from the API");
      }

      const aiMessage = { 
        role: 'ai', 
        text: result.response.text() || "I apologize, but I couldn't generate a response."
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Detailed Gemini API Error:", error);
      const errorMessage = { 
        role: 'ai', 
        text: `Error: ${error.message || "Unknown error occurred. Please try again."}`
      };
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


// --- HOMEPAGE COMPONENT ---
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(194_95%_48%_/_0.1)_0%,transparent_50%)] opacity-20"></div>
        
        {/* Dotted Surface Background (lazy-loaded) */}
        <Suspense fallback={null}>
          <DottedSurface className="z-0" />
        </Suspense>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center ocean-glow">
                <Waves className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-ocean-blue via-teal-accent to-primary bg-clip-text text-transparent">
              Blue Carbon Ledger
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Verifiable Truth for Carbon Credits
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Blockchain-powered MRV system for transparent, verifiable blue carbon credit management
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 ocean-glow">
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- ALL YOUR ORIGINAL HOMEPAGE SECTIONS ARE RESTORED BELOW --- */}

      {/* What is Blue Carbon Section */}
      <section className="py-20 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              What is Blue Carbon?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Blue carbon refers to the carbon stored in coastal and marine ecosystems like mangroves, 
              salt marshes, and seagrass beds. These ecosystems are among the most carbon-rich on Earth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center mb-4">
                  <Waves className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Coastal Ecosystems</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mangroves, salt marshes, and seagrass beds store massive amounts of carbon in their biomass and sediments.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success-green to-accent flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Carbon Sequestration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  These ecosystems sequester carbon 10x faster than terrestrial forests, making them crucial for climate action.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-carbon-gold to-warning-amber flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Economic Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Blue carbon credits represent verified carbon storage and sequestration, creating economic incentives for conservation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Required Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Why is This Required?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Current carbon credit systems lack transparency and verifiability. Our blockchain-based solution ensures 
              trust and accuracy in blue carbon management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-success-green mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Transparent Verification</h3>
                    <p className="text-muted-foreground">
                      Blockchain technology ensures immutable records of carbon credit transactions and project data.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-success-green mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Automated MRV</h3>
                    <p className="text-muted-foreground">
                      AI-powered monitoring, reporting, and verification reduces costs and improves accuracy.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-success-green mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Global Accessibility</h3>
                    <p className="text-muted-foreground">
                      Decentralized platform enables worldwide participation in blue carbon markets.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-success-green mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">SATBARA Integration</h3>
                    <p className="text-muted-foreground">
                      Land certificate verification ensures legitimate project ownership and compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">100%</h3>
                <p className="text-muted-foreground">Verified Projects</p>
              </Card>
              <Card className="glass-card text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success-green to-accent flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">24/7</h3>
                <p className="text-muted-foreground">Monitoring</p>
              </Card>
              <Card className="glass-card text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-carbon-gold to-warning-amber flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Global</h3>
                <p className="text-muted-foreground">Reach</p>
              </Card>
              <Card className="glass-card text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-ocean-blue flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Real-time</h3>
                <p className="text-muted-foreground">Analytics</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Join the Blue Carbon Revolution
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your journey towards verified, transparent carbon credit management today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 ocean-glow">
              <Link to="/signup">
                Create Account <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Renders the Chatbot in the corner */}
      <Chatbot />
    </div>
  );
};

export default Index;