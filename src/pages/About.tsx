import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Added for Chatbot
import { 
    Waves, 
    BookOpen, 
    ExternalLink,
    Users,
    Award,
    Globe,
    Leaf,
    Shield,
    // --- NEW: Icons for the chatbot ---
    MessageCircle,
    X,
    Send,
    Bot,
    Mic,
    Languages
} from "lucide-react";

// --- NEW: Add your Gemini API Key here for the chatbot ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- NEW: TYPE DEFINITIONS for chatbot's speech recognition ---
interface SpeechRecognitionEvent extends Event { results: SpeechRecognitionResultList; }
interface SpeechRecognitionErrorEvent extends Event { error: string; }
declare global {
    interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

// --- NEW: CHATBOT COMPONENT ---
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! I am Credify. Ask me anything about Blue Carbon." }]);
    const [isLoading, setIsLoading] = useState(false);
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
        recognition.onresult = (event: SpeechRecognitionEvent) => setInput(event.results[0][0].transcript);
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => console.error("Speech recognition error:", event.error);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
            setMessages(prev => [...prev, { role: 'ai', text: "API Key is missing. Please ask the site admin to configure it." }]);
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
            const aiMessage = { role: 'ai', text: result.response.text() };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting. Please try again." }]);
        } finally { setIsLoading(false); }
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-[100]"><Button onClick={() => setIsOpen(!isOpen)} size="lg" className="rounded-full w-16 h-16 bg-gradient-to-br from-ocean-blue to-teal-accent text-white shadow-lg ocean-glow transform hover:scale-110 transition-transform duration-300">{isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}</Button></div>
            {isOpen && (<div className="fixed bottom-28 right-8 z-[100] w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col glass-card border-border/50 rounded-2xl overflow-hidden animate-slide-up">
                <div className="flex items-center justify-between p-4 border-b border-border/50"><h3 className="text-lg font-bold text-foreground">Credify Assistant</h3></div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (<div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>{msg.role === 'ai' && (<div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div>)}<div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-primary/80 text-primary-foreground' : 'bg-card/70'}`}><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div></div>))}
                    {isLoading && (<div className="flex gap-3 justify-start"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white animate-pulse" /></div><div className="max-w-[80%] p-3 rounded-xl bg-card/70"><p className="text-sm">Thinking...</p></div></div>)}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-border/50"><form onSubmit={handleSendMessage} className="flex items-center gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything..." className="flex-1 h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm" disabled={isLoading} /><Button type="submit" size="icon" className="bg-primary text-primary-foreground" disabled={isLoading}><Send className="w-5 h-5" /></Button></form></div>
            </div>)}
        </>
    );
};


const About = () => {
    const researchPapers = [ { title: "Blue Carbon Ecosystems: A Global Perspective", authors: "Smith, J. et al.", journal: "Nature Climate Change", year: "2024", url: "#" }, { title: "Blockchain Technology for Carbon Credit Verification", authors: "Kumar, R. & Patel, S.", journal: "Environmental Technology & Innovation", year: "2024", url: "#" }, { title: "Mangrove Conservation and Economic Incentives", authors: "Chen, L. et al.", journal: "Marine Policy", year: "2023", url: "#" }, { title: "AI in Environmental Monitoring: MRV Applications", authors: "Johnson, M. & Williams, A.", journal: "Remote Sensing of Environment", year: "2023", url: "#" } ];
    const teamMembers = [ { name: "Team Syntax", role: "Development Team", institution: "Smart India Hackathon 2025", id: "Team ID: 738" }, { name: "Problem Statement", role: "SIH25038", institution: "Blue Carbon Registry & MRV System", id: "Blockchain Solution" } ];
    const features = [ { icon: Shield, title: "Blockchain Verification", description: "Immutable records ensure transparency and trust in carbon credit transactions." }, { icon: Leaf, title: "Blue Carbon Focus", description: "Specialized in coastal ecosystems with 10x higher carbon sequestration rates." }, { icon: Globe, title: "Global Impact", description: "Connecting projects worldwide to create a unified blue carbon marketplace." }, { icon: Award, title: "AI-Powered MRV", description: "Automated monitoring, reporting, and verification using advanced AI algorithms." } ];

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            
            <div className="pt-20 pb-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center mx-auto mb-6 ocean-glow"><Waves className="w-10 h-10 text-white" /></div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">About Blue Carbon Ledger</h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">A revolutionary blockchain-based platform for transparent, verifiable blue carbon credit management and environmental impact tracking.</p>
                    </div>

                    {/* What is Blue Carbon */}
                    <section className="mb-16">
                        <Card className="glass-card border-border/50"><CardHeader><CardTitle className="text-2xl flex items-center gap-2"><Waves className="w-6 h-6 text-ocean-blue" />Understanding Blue Carbon</CardTitle></CardHeader><CardContent className="space-y-6"><p className="text-muted-foreground leading-relaxed">Blue carbon refers to the organic carbon captured and stored by coastal and marine ecosystems, particularly vegetated coastal ecosystems including mangroves, tidal marshes, and seagrass meadows. These ecosystems are among the most carbon-rich ecosystems on Earth, storing carbon at rates up to 10 times higher than terrestrial forests.</p><div className="grid md:grid-cols-3 gap-6"><div className="p-4 rounded-lg bg-muted/30"><h3 className="font-semibold text-foreground mb-2">Mangroves</h3><p className="text-sm text-muted-foreground">Tropical coastal forests that store massive amounts of carbon in their biomass and deep sediments.</p></div><div className="p-4 rounded-lg bg-muted/30"><h3 className="font-semibold text-foreground mb-2">Seagrass Beds</h3><p className="text-sm text-muted-foreground">Underwater flowering plants that create extensive carbon storage systems in marine sediments.</p></div><div className="p-4 rounded-lg bg-muted/30"><h3 className="font-semibold text-foreground mb-2">Salt Marshes</h3><p className="text-sm text-muted-foreground">Coastal wetlands that efficiently capture and store carbon in waterlogged soils.</p></div></div><p className="text-muted-foreground leading-relaxed">Despite covering less than 2% of the ocean surface, blue carbon ecosystems store 50% of all carbon buried in marine sediments. However, these ecosystems are disappearing at rates 2-7 times faster than tropical rainforests, making their protection and restoration critical for climate change mitigation.</p></CardContent></Card>
                    </section>

                    {/* Key Features */}
                    <section className="mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Key Features & Innovation</h2>
                        <div className="grid md:grid-cols-2 gap-6">{features.map((feature, index) => { const Icon = feature.icon; return (<Card key={index} className="glass-card border-border/50"><CardHeader><div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-white" /></div><CardTitle>{feature.title}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{feature.description}</p></CardContent></Card>); })}</div>
                    </section>

                    {/* Team */}
                    <section className="mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Development Team</h2>
                        <div className="grid md:grid-cols-2 gap-6">{teamMembers.map((member, index) => (<Card key={index} className="glass-card border-border/50"><CardHeader><div className="w-16 h-16 rounded-full bg-gradient-to-br from-ocean-blue to-teal-accent flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-white" /></div><CardTitle className="text-center">{member.name}</CardTitle><p className="text-center text-muted-foreground">{member.role}</p></CardHeader><CardContent className="text-center"><p className="text-sm text-muted-foreground mb-2">{member.institution}</p><p className="text-xs text-carbon-gold">{member.id}</p></CardContent></Card>))}</div>
                    </section>

                    {/* Research Papers */}
                    <section className="mb-16">
                        <Card className="glass-card border-border/50"><CardHeader><CardTitle className="text-2xl flex items-center gap-2"><BookOpen className="w-6 h-6 text-carbon-gold" />Research & Publications</CardTitle><p className="text-muted-foreground">Scientific foundation and research backing our blue carbon initiatives</p></CardHeader><CardContent><div className="space-y-4">{researchPapers.map((paper, index) => (<div key={index} className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"><div className="flex items-start justify-between"><div className="flex-1"><h3 className="font-semibold text-foreground mb-2">{paper.title}</h3><p className="text-sm text-muted-foreground mb-1"><strong>Authors:</strong> {paper.authors}</p><p className="text-sm text-muted-foreground"><strong>Published:</strong> {paper.journal}, {paper.year}</p></div><Button variant="outline" size="sm" asChild><a href={paper.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a></Button></div></div>))}</div><div className="text-center mt-8"><Button variant="outline" className="w-full md:w-auto"><BookOpen className="w-4 h-4 mr-2" />View All Research</Button></div></CardContent></Card>
                    </section>

                    {/* Call to Action */}
                    <section className="text-center">
                        <Card className="glass-card border-border/50 bg-gradient-to-br from-card to-ocean-blue/5"><CardContent className="p-8"><h2 className="text-3xl font-bold text-foreground mb-4">Join the Blue Carbon Revolution</h2><p className="text-muted-foreground mb-6 max-w-2xl mx-auto">Be part of the solution to climate change by supporting verified blue carbon projects that protect and restore critical coastal ecosystems.</p><div className="flex flex-col sm:flex-row gap-4 justify-center"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started Today</Button><Button variant="outline">Learn More</Button></div></CardContent></Card>
                    </section>
                </div>
            </div>

            {/* --- CHATBOT RENDERED HERE --- */}
            <Chatbot />
        </div>
    );
};

export default About;