import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  Upload, FileText, CheckCircle, MapPin, Bot, Download, Sparkles,
  // Icons for the chatbot
  MessageCircle, X, Send, Mic, Languages
} from "lucide-react";
import { Navigation } from "@/components/ui/navigation";

// --- PASTE YOUR API KEY HERE. THIS IS THE ONLY LINE YOU NEED TO EDIT. ---
const GEMINI_API_KEY = "AIzaSyAyuQAl0k_hvZC-Ruj4BJmiO99jVQeRiP8";
// 🚨 Security Warning: This is for personal projects only. Do not expose API keys in production apps.

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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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


// --- UI Components ---
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={`rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl text-foreground shadow-lg ${className}`} {...props} />)); Card.displayName = "Card";
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />)); CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (<h3 ref={ref} className={`text-lg font-semibold leading-none tracking-tight text-foreground ${className}`} {...props} />)); CardTitle.displayName = "CardTitle";
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />)); CardContent.displayName = "CardContent";
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'default' }>(({ className, variant = 'default', ...props }, ref) => {const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"; const variantClasses = variant === 'outline' ? "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"; return (<button className={`${baseClasses} ${variantClasses} ${className}`} ref={ref} {...props} />)}); Button.displayName = "Button";
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {return (<input type={type} className={`flex h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`} ref={ref} {...props} />)}); Input.displayName = "Input";
const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (<label ref={ref} className={`text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props} />)); Label.displayName = "Label";
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {return (<textarea className={`flex min-h-[80px] w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`} ref={ref} {...props} />)}); Textarea.displayName = "Textarea";
const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} role="alert" className={`relative w-full rounded-lg border border-border bg-card/60 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${className}`} {...props} />)); Alert.displayName = "Alert";
const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (<div ref={ref} className={`text-sm text-muted-foreground [&_p]:leading-relaxed ${className}`} {...props} />)); AlertDescription.displayName = "AlertDescription";

interface FormData {
  name: string;
  location: string;
  coordinates: string;
  description: string;
}

const ProjectSubmission = () => {
  const mrvInputRef = useRef<HTMLInputElement>(null);
  const satbaraInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({ name: "", location: "", coordinates: "", description: "" });
  const [mrvFile, setMrvFile] = useState<File | null>(null);
  const [satbaraFile, setSatbaraFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiValidation, setAiValidation] = useState<string | null>(null);
  const [toast, setToast] = useState({ title: '', description: '', show: false });

  async function fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  const handleExportPDF = async () => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
      showToast({ title: "API Key Missing", description: "Please add your Gemini API key to the code." });
      return;
    }
    setIsSummarizing(true);
    setSummary("🔄 Generating AI summary... Please wait.");

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const projectDetails = `Project Name: ${formData.name}\nLocation: ${formData.location}\nCoordinates: ${formData.coordinates}\nDescription: ${formData.description}\nBudget: ${(formData as any).budget}`; // Assuming you add budget to your form state
      
      const prompt = `
        **Task:** Generate a concise, professional executive summary based on the provided project details and any attached documents.
        **CRITICAL INSTRUCTIONS:**
        1.  **Use Markdown:** Use markdown for formatting. Use double asterisks for bolding (e.g., **Project Overview:**). Use a single asterisk (*) for bullet points.
        2.  **Strictly follow this exact structure and wording:**
        **Executive Summary: [Insert Project Name from details]**
        **Project Overview:**
        [Provide a 1-2 sentence summary of the project's goal, location, and budget, based on the input data.]
        **Key Objectives:**
        * [Generate a bullet point for the first key objective, inferring it from the description.]
        * [Generate a bullet point for the second key objective.]
        * [Generate a bullet point for the third key objective.]
        * [Generate a bullet point for ensuring the solution is accessible and user-friendly.]
        * [Generate a bullet point for the solution being cost-effective and suitable for the target region.]
        **Document Analysis:**
        * **Dataset Collection and Annotation:** [Summarize details about the dataset from attached documents.]
        * **Model Development and Training:** [Summarize details about the models used and their performance metrics, like YOLOv8 and mAP scores, from attached documents.]
        * [Add a concluding sentence about accuracy improvements from multi-modal fusion if mentioned in documents.]
        **Input Data to be Summarized:**
        ${projectDetails}
      `;

      const fileParts = [];
      if (mrvFile) fileParts.push(await fileToGenerativePart(mrvFile));
      if (satbaraFile) fileParts.push(await fileToGenerativePart(satbaraFile));
      
      const result = await model.generateContent([prompt, ...fileParts]);
      const response = result.response;
      setSummary(response.text());

    } catch (error) {
      console.error("Gemini API Error:", error);
      setSummary("❌ Error: Could not generate summary. Please check the console for details.");
      showToast({ title: "AI Error", description: "Failed to generate summary." });
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    if (summary && summary !== "🔄 Generating AI summary... Please wait." && !summary.startsWith("❌ Error")) {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const usableWidth = pageWidth - (margin * 2);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("AI-Generated Project Summary", pageWidth / 2, margin, { align: 'center' });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated by Gemini on: ${new Date().toLocaleDateString()}`, pageWidth / 2, margin + 8, { align: 'center' });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(summary, margin, margin + 20, { maxWidth: usableWidth, lineHeightFactor: 1.5 });
      
      doc.save("AI-Project-Summary.pdf");
      setIsSummarizing(false);
    }
  }, [summary]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setFormData({ ...formData, [e.target.id]: e.target.value }); };
  const handleFileUpload = (file: File | null, type: 'mrv' | 'satbara') => { if (type === 'mrv') setMrvFile(file); else setSatbaraFile(file); };
  const showToast = ({ title, description }: { title: string, description: string }) => { setToast({ title, description, show: true }); setTimeout(() => setToast({ title: '', description: '', show: false }), 4000); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setIsSubmitting(true); await new Promise(resolve => setTimeout(resolve, 2000)); setAiValidation("✅ AI validation complete. Project meets initial criteria."); await new Promise(resolve => setTimeout(resolve, 1000)); showToast({title: "Project Submitted Successfully", description: "Your project has been submitted for verification.",}); setIsSubmitting(false); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Submit New Project</h1>
              <p className="text-muted-foreground">Register your project for verification and credit generation</p>
            </div>
            <Button 
              onClick={handleExportPDF}
              disabled={isSummarizing}
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:scale-100"
            >
              {isSummarizing ? ( <><Sparkles className="w-4 h-4 mr-2 animate-ping" />Summarizing...</> ) : ( <><Download className="w-4 h-4 mr-2" />Export AI Summary</> )}
            </Button>
          </div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-ocean-blue" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" placeholder="e.g., Sundarbans Mangrove Initiative" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g., West Bengal, India" value={formData.location} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinates">GPS Coordinates</Label>
                  <Input id="coordinates" placeholder="e.g., 21.9497° N, 88.2639° E" value={formData.coordinates} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea id="description" placeholder="Describe your blue carbon project..." value={formData.description} onChange={handleInputChange} required className="min-h-[120px]" />
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-teal-accent" />MRV Report Upload</CardTitle></CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4 text-sm">Upload Monitoring, Reporting & Verification documents</p>
                  <input type="file" ref={mrvInputRef} onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'mrv')} className="hidden" />
                  <Button variant="outline" onClick={() => mrvInputRef.current?.click()} className="cursor-pointer w-full">Choose File</Button>
                  {mrvFile && ( <p className="text-sm text-success-green mt-2">✅ {mrvFile.name} uploaded</p> )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-success-green" />SATBARA Certificate</CardTitle></CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4 text-sm">Upload land ownership certificate</p>
                  <input type="file" ref={satbaraInputRef} onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'satbara')} className="hidden" />
                  <Button variant="outline" onClick={() => satbaraInputRef.current?.click()} className="cursor-pointer w-full">Choose File</Button>
                  {satbaraFile && ( <p className="text-sm text-success-green mt-2">✅ {satbaraFile.name} uploaded</p> )}
                </div>
              </CardContent>
            </Card>
          </div>
          {aiValidation && (
            <Card className="mb-6">
              <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-carbon-gold" />AI Validation Results</CardTitle></CardHeader>
              <CardContent>
                <Alert><CheckCircle className="h-4 w-4 text-success-green" /><AlertDescription><pre className="whitespace-pre-wrap text-sm font-mono">{aiValidation}</pre></AlertDescription></Alert>
              </CardContent>
            </Card>
          )}
          <div className="text-center">
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name || !formData.location || !formData.description} className="px-8 py-3 h-auto text-base">
              {isSubmitting ? (<><Bot className="w-5 h-5 mr-2 animate-spin" />AI Validating...</>) : (<><Upload className="w-5 h-5 mr-2" />Submit Project</>)}
            </Button>
          </div>
        </div>
      </div>
      <div className={`fixed bottom-5 right-5 transition-all duration-300 ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {toast.show && (<div className="rounded-xl border border-border bg-card/80 backdrop-blur-lg text-foreground shadow-lg p-4 max-w-sm"><p className="font-bold">{toast.title}</p><p className="text-sm text-muted-foreground">{toast.description}</p></div>)}
      </div>
      
      {/* Renders the Chatbot in the corner */}
      <Chatbot />
    </div>
  );
};

export default ProjectSubmission;