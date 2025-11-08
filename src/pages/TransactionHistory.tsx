import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import jsPDF from 'jspdf';

import {
    History, Download, Filter, ArrowUpRight, ArrowDownLeft, Coins, Search, Leaf, Car,
    FileText, ShieldCheck, UserCheck, Award, MessageCircle, X, Send, Bot, Mic, Languages,
    Sparkles, Calendar, Zap, Sun, Wind, Waves
} from "lucide-react";

// --- PASTE YOUR GEMINI API KEY HERE ---
const GEMINI_API_KEY = "AIzaSyAyuQAl0k_hvZC-Ruj4BJmiO99jVQeRiP8";

// --- TYPE DEFINITIONS ---
interface SpeechRecognitionEvent extends Event { results: SpeechRecognitionResultList; }
interface SpeechRecognitionErrorEvent extends Event { error: string; }
declare global {
    interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}
interface Transaction {
    id: string; date: string; type: 'buy' | 'sell'; creditType: 'Voluntary' | 'Compliance';
    projectType: 'Mangrove' | 'Renewable' | 'Forestry'; project: string; amount: number; price: number; total: number;
    paymentMethod: 'Wallet' | 'Bank' | 'NFT'; status: 'completed' | 'pending' | 'failed'; txHash: string;
}

// --- CHILD COMPONENTS ---

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    // ... Full chatbot state and logic would be here
    return (
        <>
            <div className="fixed bottom-8 right-8 z-[100]"><Button onClick={() => setIsOpen(!isOpen)} size="lg" className="rounded-full w-16 h-16 bg-gradient-to-br from-ocean-blue to-teal-accent text-white shadow-lg ocean-glow transform hover:scale-110 transition-transform duration-300">{isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}</Button></div>
            {isOpen && (<div className="fixed bottom-28 right-8 z-[100] w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col glass-card border-border/50 rounded-2xl overflow-hidden animate-slide-up">{/* Full chatbot UI would be here */} <p className="p-4 text-center">Chatbot UI</p> </div>)}
        </>
    );
};

const ImpactTracker = ({ transactions }: { transactions: Transaction[] }) => {
    const totalCO2Offset = transactions.filter(tx => tx.type === 'buy' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
    const treesPlanted = (totalCO2Offset * 15).toLocaleString();
    const carsRemoved = (totalCO2Offset * 0.2).toFixed(1);
    return (
        <Card className="glass-card border-border/50 mb-8">
            <CardHeader><CardTitle>Your Environmental Impact</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-muted/50 p-4 rounded-lg"><h3 className="text-3xl font-bold text-primary">{totalCO2Offset.toLocaleString()} tons</h3><p className="text-muted-foreground">Total CO₂ Offset</p></div>
                <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-center gap-4"><Leaf className="w-10 h-10 text-success-green" /><div><h3 className="text-2xl font-bold">{treesPlanted}</h3><p className="text-muted-foreground">Trees Planted Equivalent</p></div></div>
                <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-center gap-4"><Car className="w-10 h-10 text-ocean-blue" /><div><h3 className="text-2xl font-bold">{carsRemoved}</h3><p className="text-muted-foreground">Cars Off The Road / Year</p></div></div>
            </CardContent>
        </Card>
    );
};

const PortfolioSummary = ({ transactions }: { transactions: Transaction[] }) => {
    const portfolioData = transactions.filter(tx => tx.type === 'buy' && tx.status === 'completed').reduce((acc, tx) => {
        if (!acc[tx.projectType]) { acc[tx.projectType] = 0; }
        acc[tx.projectType] += tx.amount;
        return acc;
    }, {} as Record<string, number>);
    const chartData = Object.entries(portfolioData).map(([name, value]) => ({ name, value }));
    const COLORS: Record<string, string> = { Mangrove: '#0088FE', Renewable: '#00C49F', Forestry: '#FFBB28' };
    return (
        <Card className="glass-card border-border/50">
            <CardHeader><CardTitle>Portfolio Distribution</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                            {chartData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#CCCCCC'} />))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const MonthlySummary = ({ transactions }: { transactions: Transaction[] }) => {
    const currentMonthTxs = transactions.filter(tx => new Date(tx.date).getMonth() === new Date().getMonth());
    const monthlyVolume = currentMonthTxs.reduce((sum, tx) => sum + tx.total, 0);
    return (
        <Card className="glass-card border-border/50">
            <CardHeader><CardTitle>September 2025 Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Transactions</span><span className="font-bold">{currentMonthTxs.length}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Net Volume</span><span className="font-bold text-primary">${monthlyVolume.toLocaleString()}</span></div>
            </CardContent>
        </Card>
    );
};

const PortfolioSnapshot = ({ transactions }: { transactions: Transaction[] }) => {
    const buyTxs = transactions.filter(tx => tx.type === 'buy');
    const averagePurchase = buyTxs.reduce((sum, tx) => sum + tx.total, 0) / (buyTxs.length || 1);
    const typeCounts = buyTxs.reduce((acc, tx) => {
        acc[tx.projectType] = (acc[tx.projectType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const mostActiveType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b, 'N/A');
    return (
        <Card className="glass-card border-border/50">
            <CardHeader><CardTitle>Portfolio Snapshot</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Most Active Sector</span><div className="flex items-center gap-2 font-bold">{mostActiveType === 'Renewable' && <Zap className="w-4 h-4 text-success-green" />}{mostActiveType === 'Mangrove' && <Waves className="w-4 h-4 text-ocean-blue" />}{mostActiveType === 'Forestry' && <Leaf className="w-4 h-4 text-teal-accent" />}{mostActiveType}</div></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Avg. Purchase</span><span className="font-bold">${averagePurchase.toFixed(2)}</span></div>
            </CardContent>
        </Card>
    );
};

const CertificateModal = ({ isOpen, onClose, certificateText, onDownloadPdf, isLoading }: {
    isOpen: boolean; onClose: () => void; certificateText: string; onDownloadPdf: () => void; isLoading: boolean;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in">
            <div className="glass-card border-border/50 rounded-lg w-full max-w-2xl m-4 flex flex-col max-h-[90vh]">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-carbon-gold" /> AI-Generated Certificate</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto bg-muted/30 p-4 rounded-md">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground"><Sparkles className="w-5 h-5 mr-2 animate-pulse" />Generating certificate...</div>
                    ) : (
                        <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">{certificateText}</pre>
                    )}
                </CardContent>
                <div className="p-6 border-t border-border/50">
                    <Button onClick={onDownloadPdf} disabled={isLoading || !certificateText} className="w-full"><Download className="w-4 h-4 mr-2" />Download PDF</Button>
                </div>
            </div>
        </div>
    );
};

const AiInsightModal = ({ isOpen, onClose, insightText, isLoading }: {
    isOpen: boolean; onClose: () => void; insightText: string; isLoading: boolean;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in">
            <div className="glass-card border-border/50 rounded-lg w-full max-w-lg m-4 flex flex-col">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Your Personal Data Analyst</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-24 text-muted-foreground"><Sparkles className="w-5 h-5 mr-2 animate-pulse" />Analyzing your transactions...</div>
                    ) : (
                        <div className="whitespace-pre-wrap text-sm text-foreground">{insightText}</div>
                    )}
                </CardContent>
            </div>
        </div>
    );
};


// --- MAIN TRANSACTION HISTORY PAGE ---
const TransactionHistoryPage = () => {
    const [isAdminView, setIsAdminView] = useState(false);
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [currentCertificate, setCurrentCertificate] = useState("");
    // ADD THIS NEW STATE to hold the structured data for the PDF
    const [certificateData, setCertificateData] = useState<any>(null);
    const [isCertLoading, setIsCertLoading] = useState(false);
    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    const [insightText, setInsightText] = useState("");
    const [isInsightLoading, setIsInsightLoading] = useState(false);

    const transactions: Transaction[] = [
        { id: "1", date: "2025-09-24", type: "buy", creditType: "Voluntary", project: "Sundarbans Restoration", projectType: "Mangrove", amount: 50, price: 45, total: 2250, paymentMethod: "Wallet", status: "completed", txHash: "0x1234...abcd" },
        { id: "2", date: "2025-09-22", type: "sell", creditType: "Compliance", project: "Wind Farm Project", projectType: "Renewable", amount: 25, price: 38, total: 950, paymentMethod: "Bank", status: "completed", txHash: "0x5678...efgh" },
        { id: "3", date: "2025-09-20", type: "buy", creditType: "Voluntary", project: "Amazon Reforestation", projectType: "Forestry", amount: 100, price: 42, total: 4200, paymentMethod: "NFT", status: "pending", txHash: "0x9012...ijkl" },
        { id: "4", date: "2025-09-18", type: "buy", creditType: "Compliance", project: "Solar Power Initiative", projectType: "Renewable", amount: 75, price: 40, total: 3000, paymentMethod: "Wallet", status: "completed", txHash: "0x3456...mnop" },
        { id: "5", date: "2025-09-15", type: "buy", creditType: "Voluntary", project: "Coastal Seagrass Beds", projectType: "Mangrove", amount: 30, price: 35, total: 1050, paymentMethod: "Wallet", status: "completed", txHash: "0x789a...bcde" },
        { id: "6", date: "2025-09-11", type: "buy", creditType: "Voluntary", project: "Himalayan Forestry", projectType: "Forestry", amount: 120, price: 28, total: 3360, paymentMethod: "Bank", status: "completed", txHash: "0xfedc...ba98" },
        { id: "7", date: "2025-09-05", type: "sell", creditType: "Compliance", project: "Sundarbans Restoration", projectType: "Mangrove", amount: 10, price: 48, total: 480, paymentMethod: "Wallet", status: "completed", txHash: "0x7654...cdef" },
        { id: "8", date: "2025-09-02", type: "buy", creditType: "Compliance", project: "Geothermal Plant", projectType: "Renewable", amount: 200, price: 41, total: 8200, paymentMethod: "Bank", status: "completed", txHash: "0xab12...ef34" },
    ];
    
    // REPLACE THIS ENTIRE FUNCTION
    const handleGenerateCertificate = async (tx: Transaction) => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") { alert("Please add your Gemini API key."); return; }
        setIsCertModalOpen(true);
        setIsCertLoading(true);
        setCurrentCertificate("");
        setCertificateData(null);

        const formatDataAsText = (data: any): string => {
            let text = `CARBON CREDIT TRANSACTION RECEIPT\n`;
            text += `=================================\n\n`;
            text += `Issuer: ${data.issuer}\n`;
            text += `Date of Issue: ${data.dateOfIssue}\n\n`;
            text += `I. Transaction Details\n------------------------\n`;
            Object.entries(data.transactionDetails).forEach(([key, value]) => { text += `${key}: ${value}\n`; });
            text += `\nII. Block Information\n---------------------\n`;
            Object.entries(data.blockInfo).forEach(([key, value]) => { text += `${key}: ${value}\n`; });
            text += `\nIII. Cryptographic Hashes\n---------------------------\n`;
            text += `Transaction Hash: ${data.transactionDetails["Transaction Hash"]}\n`;
            Object.entries(data.cryptoHashes).forEach(([key, value]) => { text += `${key}: ${value}\n`; });
            return text;
        };

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Generate a JSON object for a carbon credit transaction receipt.
            DO NOT output markdown, just the raw JSON.
            Use the following data:
            - Transaction ID: ${tx.id}, - Transaction Hash: ${tx.txHash}, - Timestamp: ${tx.date}, - Project Name: "${tx.project}", - Credit Type: "${tx.creditType} (${tx.projectType})", - Quantity: "${tx.amount} tons CO2e", - Price per Credit: "$${tx.price}", - Total Value: "$${tx.total}", - Payment Method: "${tx.paymentMethod}", - Status: "${tx.status}"
            Invent plausible data for the following fields: Issuer, Date of Issue, Block Height, Block Timestamp, Gas Fees, Nonce, Previous Block Hash, and Merkle Root.
            The JSON structure MUST be:
            { "issuer": "string", "dateOfIssue": "YYYY-MM-DD", "transactionDetails": { "Transaction ID": "string", "Transaction Hash": "string", "Timestamp": "string", "Project Name": "string", "Credit Type": "string", "Quantity": "string", "Price per Credit ($)": "string", "Total Value ($)": "string", "Payment Method": "string", "Status": "string" }, "blockInfo": { "Block Height": "string", "Block Timestamp": "string", "Gas Fees": "string", "Nonce": "string" }, "cryptoHashes": { "Previous Block Hash": "string", "Merkle Root": "string" } }
        `;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(cleanedJson);
            
            setCertificateData(parsedData);
            setCurrentCertificate(formatDataAsText(parsedData));

        } catch (error) {
            console.error("Gemini API Error or JSON parsing failed:", error);
            setCurrentCertificate("Error: Could not generate the certificate data.");
        } finally {
            setIsCertLoading(false);
        }
    };
    
    // REPLACE THIS ENTIRE FUNCTION
    const downloadPdf = () => {
        if (!certificateData || isCertLoading) return;
        const doc = new jsPDF();
        let currentY = 20;

        const drawSectionHeader = (title: string) => {
            doc.setFont("helvetica", "bold"); doc.setFontSize(12);
            doc.text(title, 15, currentY); currentY += 8;
        };

        const drawRow = (label: string, value: string) => {
            doc.setFont("helvetica", "bold"); doc.setFontSize(10);
            doc.text(label, 15, currentY);
            doc.setFont("courier", "normal");
            doc.text(String(value), 65, currentY); currentY += 7;
        };

        doc.setFont("helvetica", "bold"); doc.setFontSize(16);
        doc.text("CARBON CREDIT TRANSACTION RECEIPT", 105, currentY, { align: "center" });
        currentY += 10;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        doc.text(`Issuer: ${certificateData.issuer}`, 15, currentY); currentY += 5;
        doc.text(`Date of Issue: ${certificateData.dateOfIssue}`, 15, currentY); currentY += 10;
        
        drawSectionHeader("I. Transaction Details");
        Object.entries(certificateData.transactionDetails).forEach(([key, value]) => drawRow(key, value));
        currentY += 5;

        drawSectionHeader("II. Block Information");
        Object.entries(certificateData.blockInfo).forEach(([key, value]) => drawRow(key, value));
        currentY += 5;

        drawSectionHeader("III. Cryptographic Hashes");
        drawRow("Transaction Hash", certificateData.transactionDetails["Transaction Hash"]);
        Object.entries(certificateData.cryptoHashes).forEach(([key, value]) => drawRow(key, value));
        currentY += 10;

        drawSectionHeader("IV. Verification");
        doc.setFont("helvetica", "normal");
        const verificationText = `This transaction has been permanently recorded on the blockchain. The cryptographic hashes provided allow for independent verification of the transaction's integrity and authenticity. Any tampering with this record will result in an immediate mismatch of the cryptographic hashes. This receipt serves as irrefutable proof of the purchase.`;
        const textLines = doc.splitTextToSize(verificationText, 180);
        doc.text(textLines, 15, currentY);
        currentY += textLines.length * 5 + 10;

        doc.text("Global Carbon Registry (GCR)", 15, currentY);

        doc.save(`Certificate-${certificateData.transactionDetails["Transaction Hash"].substring(0, 10)}.pdf`);
    };

    const handleGetInsights = async () => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") { alert("Please add your Gemini API key."); return; }
        setIsInsightModalOpen(true); setIsInsightLoading(true); setInsightText("");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const dataForAnalysis = transactions.map(tx => ({ type: tx.type, projectType: tx.projectType, total: tx.total, date: tx.date }));
        const prompt = `You are a financial analyst specializing in carbon markets. Based on the following JSON data of a user's transaction history, provide three key insights. Comment on their spending trends, identify their most invested-in project type, and suggest one diversification opportunity. Keep the tone encouraging and format the response as a short, easy-to-read summary with bullet points. Transaction Data: ${JSON.stringify(dataForAnalysis, null, 2)}`;
        try {
            const result = await model.generateContent(prompt);
            setInsightText(result.response.text());
        } catch (error) {
            console.error("Gemini API Error:", error);
            setInsightText("Sorry, I was unable to analyze the data. Please check the API key and console.");
        } finally {
            setIsInsightLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <div className="pt-20 pb-12">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Transaction Portfolio</h1>
                            <p className="text-muted-foreground">Your comprehensive history and impact overview.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button onClick={handleGetInsights} className="bg-primary/10 text-primary hover:bg-primary/20"><Sparkles className="w-4 h-4 mr-2" />Get AI Insights</Button>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                <label htmlFor="admin-toggle" className="text-sm font-medium">Admin View</label>
                                <input type="checkbox" id="admin-toggle" checked={isAdminView} onChange={() => setIsAdminView(!isAdminView)} className="toggle-switch"/>
                            </div>
                        </div>
                    </div>

                    {isAdminView ? (
                        <div className="animate-fade-in">{/* ... Admin View JSX ... */}</div>
                    ) : (
                        <div className="animate-fade-in">
                            <ImpactTracker transactions={transactions} />
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <Card className="glass-card border-border/50">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>Detailed History</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Input placeholder="Search..." className="w-48 bg-background/50" />
                                                    <Button variant="outline"><Filter className="w-4 h-4 mr-2"/>Filter</Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {transactions.map((tx) => (
                                                    <div key={tx.id} className="grid grid-cols-6 gap-4 items-center p-3 rounded-lg border border-border/50 text-sm">
                                                        <div className="font-mono text-xs text-muted-foreground">{tx.txHash.substring(0, 8)}...</div>
                                                        <div>{new Date(tx.date).toLocaleDateString()}</div>
                                                        <div><Badge variant={tx.creditType === 'Voluntary' ? 'secondary' : 'default'}>{tx.creditType}</Badge></div>
                                                        <div className="font-semibold">{tx.project}</div>
                                                        <div className="text-right">{tx.amount} tons</div>
                                                        <div className="text-right">
                                                            <p className="font-bold">${tx.total.toLocaleString()}</p>
                                                            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => handleGenerateCertificate(tx)}>
                                                                <FileText className="w-3 h-3 mr-1"/>Certificate
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="lg:col-span-1 space-y-8">
                                    <PortfolioSummary transactions={transactions} />
                                    <MonthlySummary transactions={transactions} />
                                    <PortfolioSnapshot transactions={transactions} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <CertificateModal isOpen={isCertModalOpen} onClose={() => setIsCertModalOpen(false)} certificateText={currentCertificate} onDownloadPdf={downloadPdf} isLoading={isCertLoading}/>
            <AiInsightModal isOpen={isInsightModalOpen} onClose={() => setIsInsightModalOpen(false)} insightText={insightText} isLoading={isInsightLoading}/>
            <Chatbot />
        </div>
    );
};

export default TransactionHistoryPage;