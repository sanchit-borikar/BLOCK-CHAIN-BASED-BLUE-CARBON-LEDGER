import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

import {
    ShoppingCart, Wallet, TrendingUp, MapPin, Coins, Star, Filter, Search,
    Shield, GitBranch, Bell, Rss,
    // Chatbot Icons
    MessageCircle, X, Send, Mic, Languages
} from "lucide-react";

// --- PASTE YOUR GEMINI API KEY HERE ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// 🚨 Security Warning: For personal projects only. Protect your key in production.

// --- TYPE DEFINITIONS ---
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
interface CarbonCredit {
    id: string;
    name: string;
    location: string;
    price: number;
    available: number;
    rating: number;
    projectType: 'mangrove' | 'seagrass' | 'saltmarsh';
    verified: boolean;
    nftEnabled: boolean;
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
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
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
                            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent text-muted-foreground text-sm border-none focus:ring-0">
                                <option value="en-US" className="bg-background text-foreground">English</option>
                                <option value="hi-IN" className="bg-background text-foreground">हिन्दी</option>
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
                                <div className="max-w-[80%] p-3 rounded-xl bg-card/70"><p className="text-sm">Thinking...</p></div>
                            </div>
                        )}
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

// --- UI & DATA COMPONENTS ---
const LiveTicker = () => (
    <div className="bg-card/30 text-foreground text-sm overflow-hidden whitespace-nowrap border-b border-border/50">
        <div className="inline-block animate-ticker py-2">
            <span className="mx-4">VCM Price: <span className="text-success-green font-semibold">$42.50 ▲</span></span>
            <span className="mx-4">CCM Price: <span className="text-carbon-gold font-semibold">$58.20 ▼</span></span>
            <span className="mx-4">Mangrove Credits (MNG): <span className="text-success-green font-semibold">$45.10 ▲</span></span>
            <span className="mx-4">Seagrass Credits (SGS): <span className="text-destructive font-semibold">$38.90 ▼</span></span>
            <span className="mx-4">Total CO₂ Sequestered: <span className="text-white font-semibold">1.2M Tons</span></span>
             <span className="mx-4">VCM Price: <span className="text-success-green font-semibold">$42.50 ▲</span></span>
            <span className="mx-4">CCM Price: <span className="text-carbon-gold font-semibold">$58.20 ▼</span></span>
        </div>
    </div>
);
const ComparisonGraph = () => {
    const data = [ { name: 'Jan', VCM: 38, CCM: 55 }, { name: 'Feb', VCM: 40, CCM: 56 }, { name: 'Mar', VCM: 45, CCM: 60 }, { name: 'Apr', VCM: 42, CCM: 58 }, { name: 'May', VCM: 46, CCM: 62 }, { name: 'Jun', VCM: 48, CCM: 65 }, ];
    return (<Card className="glass-card border-border/50 col-span-2"><CardHeader><CardTitle>Market Comparison: Voluntary (VCM) vs Compliance (CCM)</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="name" /><YAxis /><Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)' }} /><Legend /><Line type="monotone" dataKey="VCM" stroke="#34d399" strokeWidth={2} name="Voluntary Market Price ($)" /><Line type="monotone" dataKey="CCM" stroke="#f59e0b" strokeWidth={2} name="Compliance Market Price ($)" /></LineChart></ResponsiveContainer></CardContent></Card>);
};
const SDGProgress = () => {
    const sdgs = [ { name: 'SDG 13: Climate Action', progress: 75, color: 'bg-ocean-blue' }, { name: 'SDG 14: Life Below Water', progress: 60, color: 'bg-teal-accent' }, { name: 'SDG 15: Life on Land', progress: 85, color: 'bg-success-green' }, ];
    return (<Card className="glass-card border-border/50"><CardHeader><CardTitle>Impact-Linked SDG Progress</CardTitle></CardHeader><CardContent className="space-y-4">{sdgs.map(sdg => (<div key={sdg.name}><p className="text-sm font-medium text-muted-foreground mb-1">{sdg.name}</p><div className="w-full bg-muted rounded-full h-2.5"><div className={`${sdg.color} h-2.5 rounded-full`} style={{ width: `${sdg.progress}%` }}></div></div></div>))}<p className="text-xs text-muted-foreground pt-2">Progress tracker shows how marketplace activities contribute to India’s climate targets.</p></CardContent></Card>);
};
const NewsFeed = () => {
    const news = [ { title: "Govt. introduces new compliance policies for industrial sector.", source: "Climate Times", time: "2h ago" }, { title: "Sundarbans project reaches 50,000 tons of sequestered carbon.", source: "Eco News", time: "8h ago" }, { title: "International carbon policy shifts focus to blue carbon.", source: "Global Finance", time: "1d ago" }, ];
    return (<Card className="glass-card border-border/50 mt-8"><CardHeader><CardTitle className="flex items-center gap-2"><Rss className="w-5 h-5 text-primary" />Market News & Updates</CardTitle></CardHeader><CardContent><ul className="space-y-4">{news.map(item => (<li key={item.title} className="flex items-center justify-between"><div><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.source}</p></div><span className="text-xs text-muted-foreground">{item.time}</span></li>))}</ul></CardContent></Card>);
};

// --- NEW: BUY CREDITS MODAL COMPONENT ---
const BuyCreditsModal = ({ isOpen, credit, onClose, onConfirm }: {
    isOpen: boolean;
    credit: CarbonCredit | null;
    onClose: () => void;
    onConfirm: (credit: CarbonCredit, quantity: number) => void;
}) => {
    const [quantity, setQuantity] = useState(1);
    useEffect(() => { if (credit) { setQuantity(1); } }, [credit]);
    if (!isOpen || !credit) return null;
    const totalPrice = (quantity * credit.price).toFixed(2);
    const handleConfirm = () => { onConfirm(credit, quantity); onClose(); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in">
            <div className="glass-card border-border/50 rounded-lg w-full max-w-md m-4 p-6 space-y-4">
                <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-foreground">Purchase Credits</h2><Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button></div>
                <div><p className="text-muted-foreground">Project:</p><p className="font-semibold text-lg">{credit.name}</p></div>
                <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground">Price/Credit</p><p className="font-semibold text-foreground">${credit.price}</p></div><div><p className="text-muted-foreground">Available</p><p className="font-semibold text-foreground">{credit.available.toLocaleString()}</p></div></div>
                <div className="space-y-2"><label htmlFor="quantity" className="text-sm font-medium text-muted-foreground">Quantity</label><Input id="quantity" type="number" min="1" max={credit.available} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(credit.available, Number(e.target.value))))} className="bg-background/50" /></div>
                <div className="pt-2 border-t border-border/50"><div className="flex justify-between items-center"><p className="text-muted-foreground">Total Cost</p><p className="text-2xl font-bold text-primary">${totalPrice}</p></div></div>
                <div className="flex gap-4"><Button variant="outline" onClick={onClose} className="w-full">Cancel</Button><Button onClick={handleConfirm} className="w-full bg-primary text-primary-foreground">Confirm Purchase</Button></div>
            </div>
        </div>
    );
};

// --- MAIN MARKETPLACE COMPONENT ---
const Marketplace = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("marketplace");
    const { toast } = useToast();
    
    // --- State for managing the modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);

    const carbonCredits: CarbonCredit[] = [
        { id: "1", name: "Sundarbans Mangrove Restoration", location: "West Bengal, India", price: 45, available: 1250, rating: 4.8, projectType: "mangrove", verified: true, nftEnabled: true },
        { id: "2", name: "Coastal Seagrass Conservation", location: "Tamil Nadu, India", price: 38, available: 800, rating: 4.6, projectType: "seagrass", verified: true, nftEnabled: false },
        { id: "3", name: "Salt Marsh Protection Initiative", location: "Gujarat, India", price: 42, available: 950, rating: 4.7, projectType: "saltmarsh", verified: true, nftEnabled: true },
        { id: "4", name: "Mangrove Afforestation Project", location: "Odisha, India", price: 40, available: 1100, rating: 4.5, projectType: "mangrove", verified: true, nftEnabled: false }
    ];

    const getProjectTypeColor = (type: string) => {
        switch (type) {
            case 'mangrove': return 'bg-ocean-blue text-white';
            case 'seagrass': return 'bg-teal-accent text-white';
            case 'saltmarsh': return 'bg-success-green text-white';
            default: return 'bg-muted text-muted-foreground';
        }
    };
    
    const handleConnectWallet = () => toast({ title: "Connect Wallet", description: "Wallet connection feature coming soon!" });

    // --- Function to open the modal ---
    const handleBuyClick = (credit: CarbonCredit) => {
        setSelectedCredit(credit);
        setIsModalOpen(true);
    };

    // --- Function to handle the purchase confirmation ---
    const handleConfirmPurchase = (credit: CarbonCredit, quantity: number) => {
        toast({
            title: "Purchase Successful",
            description: `You purchased ${quantity} credit(s) from ${credit.name}.`,
        });
    };

    const filteredCredits = carbonCredits.filter(credit => {
        const matchesSearch = credit.name.toLowerCase().includes(searchTerm.toLowerCase()) || credit.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = selectedFilter === "all" || credit.projectType === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <div className="fixed top-16 w-full z-20">
              <LiveTicker />
            </div>

            <main className="pt-28 pb-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">Carbon Ledger Dashboard</h1>
                            <p className="text-muted-foreground">The central hub for carbon credit management and trading.</p>
                        </div>
                        <Button onClick={handleConnectWallet} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Wallet className="w-4 h-4 mr-2" /> Connect Wallet
                        </Button>
                    </div>

                    <div className="flex border-b border-border/50 mb-6">
                        <Button variant="ghost" onClick={() => setActiveTab('marketplace')} className={`rounded-none ${activeTab === 'marketplace' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Marketplace</Button>
                        <Button variant="ghost" onClick={() => setActiveTab('admin')} className={`rounded-none ${activeTab === 'admin' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Admin & Government Tools</Button>
                    </div>
                    
                    {activeTab === 'marketplace' ? (
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <ComparisonGraph />
                                <Card className="glass-card border-border/50">
                                    <CardHeader><CardTitle>Browse Voluntary Carbon Market (VCM)</CardTitle></CardHeader>
                                    <CardContent><div className="flex flex-col md:flex-row gap-4 mb-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-background/50" /></div><div className="flex gap-2"><Button variant={selectedFilter === "all" ? "default" : "outline"} onClick={() => setSelectedFilter("all")} size="sm">All</Button><Button variant={selectedFilter === "mangrove" ? "default" : "outline"} onClick={() => setSelectedFilter("mangrove")} size="sm">Mangrove</Button><Button variant={selectedFilter === "seagrass" ? "default" : "outline"} onClick={() => setSelectedFilter("seagrass")} size="sm">Seagrass</Button><Button variant={selectedFilter === "saltmarsh" ? "default" : "outline"} onClick={() => setSelectedFilter("saltmarsh")} size="sm">Salt Marsh</Button></div></div></CardContent>
                                </Card>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredCredits.map((credit) => (
                                        <Card key={credit.id} className="glass-card border-border/50 hover:border-primary/50 transition-colors">
                                            <CardHeader><div className="flex items-start justify-between"><div><CardTitle className="text-lg mb-2">{credit.name}</CardTitle><p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />{credit.location}</p></div>{credit.verified && <Badge variant="secondary" className="bg-success-green/20 text-success-green">Verified</Badge>}</div></CardHeader>
                                            <CardContent className="space-y-4"><div className="flex items-center justify-between"><Badge className={getProjectTypeColor(credit.projectType)}>{credit.projectType.charAt(0).toUpperCase() + credit.projectType.slice(1)}</Badge><div className="flex items-center gap-1"><Star className="w-4 h-4 text-carbon-gold fill-current" /><span className="text-sm font-medium">{credit.rating}</span></div></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Price</span><span className="font-bold">${credit.price}</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Available</span><span className="font-medium">{credit.available.toLocaleString()}</span></div>
                                                <Button onClick={() => handleBuyClick(credit)} className="w-full"><ShoppingCart className="w-4 h-4 mr-2" />Buy/Sell Credits</Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-1 space-y-8">
                                <SDGProgress />
                                <Card className="glass-card border-border/50"><CardHeader><CardTitle>Geographic Heatmap</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-center py-8">Interactive map coming soon.</p></CardContent></Card>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                             <Card className="glass-card border-border/50"><CardHeader><CardTitle>Government & NCCR Dashboard</CardTitle><p className="text-muted-foreground">Tools for verification, policy oversight, and reporting.</p></CardHeader></Card>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="glass-card border-border/50"><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="text-primary w-5 h-5"/>Carbon Credit Verification Suite</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Validate projects using satellite, drone, and IoT data. AI-driven fraud detection prevents double-counting.</p></CardContent></Card>
                                <Card className="glass-card border-border/50"><CardHeader><CardTitle className="flex items-center gap-2"><GitBranch className="text-primary w-5 h-5"/>Policy Oversight Dashboard</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Set base prices, regulate market volatility, and monitor nationwide compliance in real-time.</p></CardContent></Card>
                                <Card className="glass-card border-border/50"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart className="text-primary w-5 h-5"/>Analytics & Global Reporting</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Visualize CO₂ sequestration data per region. Export-ready reports for COP, UNFCCC, and global registries.</p></CardContent></Card>
                                <Card className="glass-card border-border/50"><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="text-primary w-5 h-5"/>Smart Compliance Tools</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Industry-specific dashboards to track obligations. Automated penalty and reward system for CCM participation.</p></CardContent></Card>
                            </div>
                        </div>
                    )}
                    <NewsFeed />
                </div>
            </main>
            
            <BuyCreditsModal
                isOpen={isModalOpen}
                credit={selectedCredit}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmPurchase}
            />
            <Chatbot />
        </div>
    );
};

export default Marketplace;