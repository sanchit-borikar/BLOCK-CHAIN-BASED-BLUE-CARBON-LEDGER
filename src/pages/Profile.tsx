import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "@/components/ui/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/hooks/useAuth";
// --- NEW: Imports for AI and PDF Generation ---
import { GoogleGenerativeAI } from "@google/generative-ai";
import jsPDF from 'jspdf';

import {
    ShieldCheck, Leaf, Car, Award, Target, Droplets,
    Download, FileText, MessageCircle, X, Sparkles
} from "lucide-react";

// --- NEW: Add your Gemini API Key here ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- TYPE DEFINITIONS ---
interface Transaction {
    id: string; date: string; project: string; amount: number;
}
interface BadgeInfo {
    icon: React.ElementType; title: string; description: string; color: string;
}

// --- CHILD COMPONENTS (Unchanged) ---

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <div className="fixed bottom-8 right-8 z-[100]"><Button onClick={() => setIsOpen(!isOpen)} size="lg" className="rounded-full w-16 h-16 bg-gradient-to-br from-ocean-blue to-teal-accent text-white shadow-lg ocean-glow transform hover:scale-110 transition-transform duration-300">{isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}</Button></div>
            {isOpen && (<div className="fixed bottom-28 right-8 z-[100] w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col glass-card border-border/50 rounded-2xl overflow-hidden animate-slide-up"><p className="p-4 text-center">Chatbot UI</p></div>)}
        </>
    );
};

const ProfileHeader = ({ name, totalOffset }: { name: string, totalOffset: number }) => {
    const treesPlanted = (totalOffset * 15).toLocaleString();
    const carsRemoved = (totalOffset * 0.2).toFixed(1);
    
    return (
        <Card className="glass-card border-border/50 mb-8 overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/50"><AvatarFallback className="bg-gradient-to-br from-ocean-blue to-teal-accent text-white text-3xl">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2"><h1 className="text-3xl font-bold">{name}</h1><Badge className="bg-success-green/20 text-success-green border-success-green/50"><ShieldCheck className="w-4 h-4 mr-1"/>NCCR Verified</Badge></div>
                    <p className="text-muted-foreground">Role: Organization | Blue Carbon Innovations</p>
                </div>
                <div className="flex-grow grid grid-cols-3 gap-4 text-center border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
                    <div><h3 className="text-2xl font-bold">{totalOffset.toLocaleString()}</h3><p className="text-sm text-muted-foreground">Tons CO₂ Offset</p></div>
                    <div><h3 className="text-2xl font-bold flex items-center justify-center gap-2"><Leaf className="text-success-green"/>{treesPlanted}</h3><p className="text-sm text-muted-foreground">Trees Planted</p></div>
                    <div><h3 className="text-2xl font-bold flex items-center justify-center gap-2"><Car className="text-ocean-blue"/>{carsRemoved}</h3><p className="text-sm text-muted-foreground">Cars Off-Road</p></div>
                </div>
            </div>
        </Card>
    );
};

const Achievements = ({ badges }: { badges: BadgeInfo[] }) => {
    return (
        <Card className="glass-card border-border/50">
            <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
            <CardContent className="space-y-4">{badges.map(badge => (<div key={badge.title} className="flex items-center gap-4"><badge.icon className={`w-10 h-10 p-2 rounded-lg bg-muted/50 ${badge.color}`} /><div><p className="font-semibold">{badge.title}</p><p className="text-sm text-muted-foreground">{badge.description}</p></div></div>))}</CardContent>
        </Card>
    );
};

const Pledges = () => {
    const goal = 250, current = 180, progress = (current / goal) * 100;
    return (
        <Card className="glass-card border-border/50">
            <CardHeader><CardTitle>Goals & Pledges</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-end mb-1"><p className="font-semibold">Annual Offset Goal</p><p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{current}</span> / {goal} tons</p></div>
                        <div className="w-full bg-muted rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                    </div>
                    <Button variant="outline" className="w-full"><Target className="w-4 h-4 mr-2" />Set New Goal</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const PortfolioGraph = () => {
    const [data, setData] = useState(() => {
        const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
        let cumulativeOffset = 20;
        return months.map(month => {
            cumulativeOffset += Math.random() * 20 + 5;
            return { month, offset: Math.round(cumulativeOffset) };
        });
    });
    return (
        <Card className="glass-card border-border/50">
            <CardHeader><div className="flex justify-between items-center"><CardTitle>Monthly Offset Timeline</CardTitle></div></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={250}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/><XAxis dataKey="month" /><YAxis /><Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)' }}/><Line type="monotone" dataKey="offset" stroke="#34d399" strokeWidth={2} name="CO₂ Offset (tons)" /></LineChart></ResponsiveContainer></CardContent>
        </Card>
    );
};

const RecentActivity = ({ transactions }: { transactions: Transaction[] }) => {
    return (
        <Card className="glass-card border-border/50">
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent className="space-y-4">{transactions.slice(0, 3).map(tx => (<div key={tx.id} className="flex justify-between items-center"><div><p className="font-semibold">{tx.project}</p><p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p></div><p className="font-bold text-success-green">+{tx.amount} tons</p></div>))}</CardContent>
        </Card>
    );
};

// --- NEW: MODAL COMPONENT FOR THE AUDIT REPORT ---
const AuditReportModal = ({ isOpen, onClose, reportText, onDownloadPdf, isLoading }: {
    isOpen: boolean; onClose: () => void; reportText: string; onDownloadPdf: () => void; isLoading: boolean;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in">
            <div className="glass-card border-border/50 rounded-lg w-full max-w-3xl m-4 flex flex-col max-h-[90vh]">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary"/> AI-Generated Audit Report</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto bg-muted/30 p-4 rounded-md">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                            Generating your comprehensive audit report...
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">{reportText}</pre>
                    )}
                </CardContent>
                <div className="p-6 border-t border-border/50">
                    <Button onClick={onDownloadPdf} disabled={isLoading || !reportText} className="w-full"><Download className="w-4 h-4 mr-2" />Download as PDF</Button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN PROFILE PAGE ---
const ProfilePage = () => {
    const transactions: Transaction[] = [
        { id: "1", date: "2025-09-24", project: "Sundarbans Restoration", amount: 50 },
        { id: "2", date: "2025-09-18", project: "Solar Power Initiative", amount: 75 },
        { id: "3", date: "2025-08-20", project: "Amazon Reforestation", amount: 80 },
    ];
    const badges: BadgeInfo[] = [
        { icon: Award, title: "Carbon Warrior", description: "Offset 100+ tons of CO₂", color: "text-carbon-gold" },
        { icon: Droplets, title: "Mangrove Guardian", description: "Supported 5+ mangrove projects", color: "text-ocean-blue" },
    ];
    const totalOffset = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // --- NEW: State for managing the audit report modal ---
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportText, setReportText] = useState("");
    const [isReportLoading, setIsReportLoading] = useState(false);

    // --- NEW: Function to generate the report using Gemini ---
    const handleGenerateAuditReport = async () => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") { 
            alert("Please add your Gemini API key to the code."); 
            return; 
        }
        setIsReportModalOpen(true); 
        setIsReportLoading(true); 
        setReportText("");

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `You are a professional auditor for a carbon credit marketplace. Generate a comprehensive sustainability audit report for a user named "John Doe". The report should be a summary of all the data visible on their profile page.
        
        The report must be structured with the following sections: 
        1. Executive Summary: A brief overview of John Doe's climate identity and impact.
        2. Carbon Offset Analysis: State the total offset of ${totalOffset} tons and its environmental equivalents.
        3. Portfolio Highlights: Mention the achievements like "${badges.map(b => b.title).join(', ')}".
        4. Recent Activity Summary: Briefly summarize the transactions provided.
        5. Compliance Status: Confirm their 'NCCR Verified' status.
        6. Future Outlook: Comment on their progress towards their annual goal of 250 tons.

        Make the report look official, detailed, and professional.
        
        Transaction Data for summary: ${JSON.stringify(transactions, null, 2)}`;

        try {
            const result = await model.generateContent(prompt);
            setReportText(result.response.text());
        } catch (error) {
            console.error("Audit Report Error:", error);
            setReportText("Failed to generate report. Please check the API key and console.");
        } finally {
            setIsReportLoading(false);
        }
    };

    // --- NEW: Function to download the generated report as a PDF ---
    const downloadReportAsPdf = () => {
        if (!reportText || isReportLoading) return;
        const doc = new jsPDF();
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        const textLines = doc.splitTextToSize(reportText, 180);
        doc.text(textLines, 15, 20);
        doc.save(`Sustainability-Audit-Report-${Date.now()}.pdf`);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <div className="pt-20 pb-12">
                <div className="container mx-auto px-4">
                    <ProfileHeader name="John Doe" totalOffset={totalOffset} />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <PortfolioGraph />
                            <RecentActivity transactions={transactions} />
                             <Card className="glass-card border-border/50">
                                <CardHeader><CardTitle>Certificates & Reports</CardTitle></CardHeader>
                                <CardContent className="flex flex-col md:flex-row gap-4">
                                    {/* UPDATED: Button now calls the new handler function */}
                                    <Button onClick={handleGenerateAuditReport} className="flex-1"><Download className="w-4 h-4 mr-2" />Download Audit Report</Button>
                                    
                                </CardContent>
                            </Card>
                        </div>

                        {/* Side Panel */}
                        <div className="lg:col-span-1 space-y-8">
                            <Achievements badges={badges} />
                            <Pledges />
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW: Render the modal */}
            <AuditReportModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                reportText={reportText} 
                onDownloadPdf={downloadReportAsPdf} 
                isLoading={isReportLoading} 
            />
            <Chatbot />
        </div>
    );
};

export default ProfilePage;