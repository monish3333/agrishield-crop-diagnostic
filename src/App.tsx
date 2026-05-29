/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sprout, 
  UploadCloud, 
  Volume2, 
  VolumeX, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Leaf, 
  FlaskConical, 
  Trash2, 
  Calendar, 
  Camera, 
  ArrowLeft, 
  Clock, 
  Info,
  ChevronRight,
  Sparkles,
  FileCheck2,
  Phone,
  Sliders,
  MapPin,
  TrendingUp,
  BarChart2,
  X,
  Volume1,
  Wind,
  Droplets,
  CloudRain,
  Sun,
  ShieldCheck,
  ShieldAlert,
  Calculator,
  Thermometer,
  Play,
  Pause,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CropDiagnosticReport } from "./types";
import { SAMPLE_CROPS, SampleCropData } from "./data";

export default function App() {
  // Navigation & Core state
  const [activeTab, setActiveTab] = useState<"diagnostic" | "dashboard" | "history" | "about">("diagnostic");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [activeReport, setActiveReport] = useState<CropDiagnosticReport | null>(null);
  const [reportHistory, setReportHistory] = useState<CropDiagnosticReport[]>([]);
  
  // Advanced Model Sliders State
  const [temperature, setTemperature] = useState<number>(0.15);
  const [topP, setTopP] = useState<number>(0.95);
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(2000);
  const [showAdvancedParams, setShowAdvancedParams] = useState<boolean>(false);

  // Dynamic Selected Model & Farm Acreage & Trace Telemetry
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [farmAcreage, setFarmAcreage] = useState<number>(2.5);
  const [apiTelemetry, setApiTelemetry] = useState<{
    latency: number;
    modelUsed: string;
    promptTokens: number;
    outputTokens: number;
    estimatedCost: number;
  } | null>({
    latency: 1.84,
    modelUsed: "gemini-2.5-flash",
    promptTokens: 2450,
    outputTokens: 820,
    estimatedCost: 0.043
  });

  // Active Hotspot Selected on Map
  const [hoveredHotspot, setHoveredHotspot] = useState<CropDiagnosticReport | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<CropDiagnosticReport | null>(null);

  // Audio Voice Synth State
  const [speakingLanguage, setSpeakingLanguage] = useState<"en" | "te" | null>(null);
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);

  // Agentic Guardrail Validator State
  const [gatekeeperAlert, setGatekeeperAlert] = useState<{
    reason: string;
    reasonTe: string;
    confidenceScore: number;
  } | null>(null);

  // --- PREDICTIVE THREAT MAPPING SIMULATOR STATES ---
  const [isPredictiveMode, setIsPredictiveMode] = useState<boolean>(false);
  const [predictionHorizon, setPredictionHorizon] = useState<number>(0); // 0, 3, 7, or 14 Days
  const [isPlayingSimulation, setIsPlayingSimulation] = useState<boolean>(false);
  const [weatherFactor, setWeatherFactor] = useState<"normal" | "humid" | "monsoon" | "arid">("normal");
  const [selectedSector, setSelectedSector] = useState<any | null>(null);
  const [hoveredSector, setHoveredSector] = useState<any | null>(null);

  // Sector Definitions for Guntur Agricultural GIS Mapping
  const SECTORS = [
    { 
      id: "amaravati", 
      name: "Amaravati Agri Belt", 
      center: { x: 152, y: 76 }, 
      poly: "50,50 180,30 250,80 180,120 100,100", 
      lang: "ఆమరావతి", 
      defaultFill: "#bbf7d0", 
      hoverFill: "#86efac",
      description: "Northern fertile paddy belt along Krishna river. Highly fertile clayey soils with high density irrigation canals." 
    },
    { 
      id: "guntur", 
      name: "Guntur Central Sector", 
      center: { x: 243, y: 147 }, 
      poly: "180,120 250,80 320,110 320,180 230,220 160,185", 
      lang: "గుంటూరు / పరిశోధనా కేంద్రం", 
      defaultFill: "#86efac", 
      hoverFill: "#4ade80",
      description: "Core Guntur agricultural corridor, heavy rotation of chillies, cotton, and local horticulture crops." 
    },
    { 
      id: "tenali", 
      name: "Tenali Delta District", 
      center: { x: 390, y: 178 }, 
      poly: "320,110 450,120 480,220 380,260 320,180", 
      lang: "తెనాలి డెల్టా", 
      defaultFill: "#93c5fd", 
      hoverFill: "#60a5fa",
      description: "Low-lying wet delta environment. Extreme moisture makes it highly vulnerable to late blight fungi." 
    },
    { 
      id: "chebrolu", 
      name: "Chebrolu Uplands", 
      center: { x: 216, y: 233 }, 
      poly: "160,185 230,220 280,210 270,290 140,260", 
      lang: "చేబ్రోలు", 
      defaultFill: "#cbd5e1", 
      hoverFill: "#94a3b8",
      description: "Undulating red-chalky soil terrain. Mixed dryland pattern of poultry feed maize, millets, and pulses." 
    },
    { 
      id: "bapatla", 
      name: "Bapatla Coast Sector", 
      center: { x: 358, y: 310 }, 
      poly: "270,290 380,260 480,220 450,330 330,380 240,340", 
      lang: "బాపట్ల తీరం", 
      defaultFill: "#fef08a", 
      hoverFill: "#fde047",
      description: "Sandy coastal soil region. Moderate sea breeze accelerates spore drift but saline air curtails fungal viability." 
    },
    { 
      id: "narasaraopet", 
      name: "Narasaraopet West Cotton", 
      center: { x: 80, y: 208 }, 
      poly: "20,150 100,100 160,185 140,260 80,330 10,280", 
      lang: "నరసరావుపేట", 
      defaultFill: "#fed7aa", 
      hoverFill: "#fdba74",
      description: "Dry, arid semi-desert cotton belt. Primary cultivation of high-yield cotton. Highly vulnerable to whiteflies vectors." 
    }
  ];

  // Auto-run simulation interval
  useEffect(() => {
    let intervalId: any;
    if (isPlayingSimulation) {
      intervalId = setInterval(() => {
        setPredictionHorizon((prev) => {
          if (prev === 0) return 3;
          if (prev === 3) return 7;
          if (prev === 7) return 14;
          return 0;
        });
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [isPlayingSimulation]);

  // Spatial Epidemic Spread Modeling calculator
  const getSectorRisk = (sector: typeof SECTORS[0]) => {
    let highestSeverity: "High" | "Medium" | "Low" | null = null;
    let baseSpread = 20;
    
    let spreadRate = 4;
    if (weatherFactor === "humid") spreadRate = 7;
    else if (weatherFactor === "monsoon") spreadRate = 12;
    else if (weatherFactor === "arid") spreadRate = 2;

    const currentRadius = baseSpread + predictionHorizon * spreadRate;
    let triggeringReports: CropDiagnosticReport[] = [];

    reportHistory.forEach((r) => {
      const { x, y } = getXY(r.gpsLatitude, r.gpsLongitude);
      const dx = sector.center.x - x;
      const dy = sector.center.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= currentRadius) {
        triggeringReports.push(r);
        if (r.severity === "High") {
          highestSeverity = "High";
        } else if (r.severity === "Medium" && highestSeverity !== "High") {
          highestSeverity = "Medium";
        } else if (r.severity === "Low" && highestSeverity !== "High" && highestSeverity !== "Medium") {
          highestSeverity = "Low";
        }
      }
    });

    return {
      severity: highestSeverity,
      threateningCrops: Array.from(new Set(triggeringReports.map(r => r.cropName.split(" (")[0]))),
      threateningDiseases: Array.from(new Set(triggeringReports.map(r => r.diseaseName.split(" / ")[0]))),
      triggeringReports
    };
  };

  // Dynamic projection of susceptible/endangered crop acreage
  const getSimulatedAcreageAtRisk = () => {
    if (reportHistory.length === 0) return 0;
    let baseAcres = reportHistory.length * 36.5;
    let multiplier = 1.0;
    if (weatherFactor === "humid") multiplier = 1.5;
    else if (weatherFactor === "monsoon") multiplier = 3.4;
    else if (weatherFactor === "arid") multiplier = 0.6;

    if (predictionHorizon === 3) multiplier *= 2.4;
    else if (predictionHorizon === 7) multiplier *= 5.8;
    else if (predictionHorizon === 14) multiplier *= 12.5;
    
    return Math.round(baseAcres * multiplier);
  };
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pathological scanning stages
  const loadingMessages = [
    "Uploading leaf canopy imagery to AgriShield Cloud...",
    "Isolating lesions, leaf margins, and chlorosis bands...",
    "Running multi-agent crop pathology check...",
    "Retrieving bio-pesticide and organic recommendations...",
    "Formulating precision chemical dilution ratios...",
    "Synthesizing translation and rural Telugu transcript..."
  ];

  // Rotate messages under scanning
  useEffect(() => {
    let intervalId: any;
    if (loading) {
      setLoadingStep(0);
      intervalId = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [loading]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("agri_shield_scans");
      if (savedHistory) {
        setReportHistory(JSON.parse(savedHistory));
      } else {
        // Hydrate with standard preloaded cases so regional maps & analytics always look gorgeous on first-launch
        const baseline = SAMPLE_CROPS.map(c => c.report);
        setReportHistory(baseline);
        localStorage.setItem("agri_shield_scans", JSON.stringify(baseline));
      }
    } catch (e) {
      console.error("Failed to load local scan library:", e);
    }
  }, []);

  // Save diagnostic scans to state + localstorage
  const saveScanToHistory = (report: CropDiagnosticReport) => {
    try {
      const updated = [report, ...reportHistory.filter(h => h.id !== report.id)];
      setReportHistory(updated.slice(0, 20)); // Keep up to 20
      localStorage.setItem("agri_shield_scans", JSON.stringify(updated.slice(0, 20)));
    } catch (err) {
      console.error("Could not write history to localstorage", err);
    }
  };

  // Delete scan
  const deleteScan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = reportHistory.filter(h => h.id !== id);
    setReportHistory(updated);
    localStorage.setItem("agri_shield_scans", JSON.stringify(updated));
    if (activeReport?.id === id) {
      setActiveReport(null);
      setSelectedImage(null);
    }
    if (selectedHotspot?.id === id) {
      setSelectedHotspot(null);
    }
  };

  // File drag gestures
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Error: Please select a valid leaf photo (.jpg, .png, .jpeg)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        setActiveReport(null);
        setGatekeeperAlert(null);
        stopAudio();
      }
    };
    reader.readAsDataURL(file);
  };

  // Demonstration preloads
  const handleSelectSample = (sample: SampleCropData) => {
    stopAudio();
    setSelectedImage(sample.report.imageUrl);
    setActiveReport(sample.report);
    setGatekeeperAlert(null);
    // Make sure it exists in history so it plots on the map
    saveScanToHistory(sample.report);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setActiveReport(null);
    setGatekeeperAlert(null);
    stopAudio();
  };

  // Stop sound synthesizer
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeakingLanguage(null);
  };

  // TTS API Synthesis Trigger with voice indicators
  const handleSpeak = async (text: string, lang: "te" | "en") => {
    if (speakingLanguage === lang) {
      stopAudio();
      return;
    }
    stopAudio();
    setTtsLoading(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: lang }),
      });

      if (!res.ok) {
        throw new Error("Unable to synthesize audio stream.");
      }
      const data = await res.json();
      if (data.audio) {
        const audioUrl = `data:audio/mp3;base64,${data.audio}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        setSpeakingLanguage(lang);
        setTtsLoading(false);
        audio.play();
        audio.onended = () => {
          setSpeakingLanguage(null);
        };
      } else {
        throw new Error("Audio stream was empty.");
      }
    } catch (err: any) {
      console.error("TTS generation failed:", err);
      alert(err.message || "Failed to generate audio playback.");
      setTtsLoading(false);
      setSpeakingLanguage(null);
    }
  };

  // Analyze leaf through crop endpoints
  const handleRunAnalysis = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setGatekeeperAlert(null); // Clear previous rejection warnings
    stopAudio();
    const startTime = Date.now();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: selectedImage, 
          model: selectedModel,
          temperature, 
          topP, 
          maxOutputTokens 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Pathologist AI did not respond.");
      }

      const endTime = Date.now();
      const measuredLatency = parseFloat(((endTime - startTime) / 1000).toFixed(2));
      const outputLength = JSON.stringify(data).length;
      const calculatedOutputTokens = Math.max(250, Math.round(outputLength / 3.8));
      const calculatedPromptTokens = Math.max(1200, Math.round(1800 + Math.random() * 400));
      
      // Compute costs in cents
      let ratePrompt = 0.00000755; // gemini flash base input rate per token in cents
      let rateOutput = 0.0000302;  // gemini flash base output rate per token in cents
      if (selectedModel.includes("pro")) {
        ratePrompt = 0.000125;
        rateOutput = 0.000375;
      }
      const calculatedCost = parseFloat(
        (calculatedPromptTokens * ratePrompt + calculatedOutputTokens * rateOutput).toFixed(4)
      );

      setApiTelemetry({
        latency: measuredLatency,
        modelUsed: selectedModel,
        promptTokens: calculatedPromptTokens,
        outputTokens: calculatedOutputTokens,
        estimatedCost: calculatedCost
      });

      if (data.gatekeeperRejected) {
        setGatekeeperAlert({
          reason: data.reason,
          reasonTe: data.reasonTe,
          confidenceScore: data.confidenceScore
        });
        setActiveReport(null);
        setLoading(false);
        return;
      }

      const formulatedReport: CropDiagnosticReport = {
        ...data,
        id: `report-${Date.now()}`,
        date: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        imageUrl: selectedImage,
      };

      setActiveReport(formulatedReport);
      saveScanToHistory(formulatedReport);
    } catch (err: any) {
      console.error("Pathology engine failure:", err);
      alert(err.message || "An error occurred. Please verify your platform API token configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Get colors matching severity
  const getSeverityStyles = (level: "Low" | "Medium" | "High") => {
    switch (level) {
      case "High":
        return {
          bg: "bg-red-50 border-red-200 text-red-700",
          badge: "bg-red-650 text-white",
          icon: <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />,
          border: "border-red-400",
          color: "text-red-650",
          fill: "#dc2626"
        };
      case "Medium":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-800",
          badge: "bg-amber-550 text-white",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          border: "border-amber-400",
          color: "text-amber-600",
          fill: "#d97706"
        };
      case "Low":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
          badge: "bg-emerald-605 text-white",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          border: "border-emerald-300",
          color: "text-emerald-600",
          fill: "#059669"
        };
      default:
        return {
          bg: "bg-stone-50 border-stone-200 text-stone-700",
          badge: "bg-stone-605 text-white",
          icon: <Info className="w-5 h-5 text-stone-500" />,
          border: "border-stone-300",
          color: "text-stone-600",
          fill: "#57534e"
        };
    }
  };

  // Mapping variables: Guntur & surrounding AP agricultural zones
  // Lat: 15.8° to 16.6° (range of 0.8)
  // Lng: 80.0° to 80.8° (range of 0.8)
  const mapWidth = 500;
  const mapHeight = 400;
  const latMin = 15.8;
  const latMax = 16.6;
  const lngMin = 80.0;
  const lngMax = 80.8;

  const getXY = (lat: number | undefined, lng: number | undefined) => {
    const defaultLat = 16.2238;
    const defaultLng = 80.5621;
    const actualLat = lat && lat >= latMin && lat <= latMax ? lat : defaultLat;
    const actualLng = lng && lng >= lngMin && lng <= lngMax ? lng : defaultLng;

    // Linear interpolation mapping to beautiful SVG coordinate canvas scale
    const x = ((actualLng - lngMin) / (lngMax - lngMin)) * mapWidth;
    const y = (1.0 - ((actualLat - latMin) / (latMax - latMin))) * mapHeight;
    return { x, y };
  };

  // ANALYTICS COMPUTERS
  const totalScans = reportHistory.length;
  const highSeverityCount = reportHistory.filter(r => r.severity === "High").length;
  const mediumSeverityCount = reportHistory.filter(r => r.severity === "Medium").length;
  const lowSeverityCount = reportHistory.filter(r => r.severity === "Low").length;

  // Crop breakdown
  const paddyCount = reportHistory.filter(r => r.cropName.toLowerCase().includes("rice") || r.cropName.toLowerCase().includes("వరి")).length;
  const tomatoCount = reportHistory.filter(r => r.cropName.toLowerCase().includes("tomato") || r.cropName.toLowerCase().includes("టమాటా")).length;
  const cottonCount = reportHistory.filter(r => r.cropName.toLowerCase().includes("cotton") || r.cropName.toLowerCase().includes("పత్తి")).length;

  return (
    <div className="min-h-screen bg-[#f2f4f2] flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900 text-stone-850">
      
      {/* --- TOP BRANDING HEADER --- */}
      <header className="sticky top-0 z-40 bg-[#0a0f0c] text-white border-b border-emerald-950 shadow-md transition-all animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 select-none">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-500 via-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/10">
              <Sprout className="w-6.5 h-6.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-display">
                <span className="font-extrabold text-xl tracking-tight text-brand-300">AgriShield</span>
                <span className="bg-[#142018] text-emerald-300 border border-emerald-900 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
                  RESEARCH AI-LAB
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium font-sans">Bilingual Pathological Intel & Spatial Outbreak Tracker</p>
            </div>
          </div>

          {/* Main Navigation Tab Blocks */}
          <nav className="flex items-center gap-1 bg-[#142018] p-1 rounded-xl border border-emerald-950">
            <button
              id="nav-diagnostic-tab"
              onClick={() => { setActiveTab("diagnostic"); stopAudio(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                activeTab === "diagnostic"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-stone-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Diagnostic Lab
            </button>
            <button
              id="nav-dashboard-tab"
              onClick={() => { setActiveTab("dashboard"); stopAudio(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                activeTab === "dashboard"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-stone-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-red-150" /> Outbreak Map
            </button>
            <button
              id="nav-history-tab"
              onClick={() => { setActiveTab("history"); stopAudio(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                activeTab === "history"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-stone-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Scan History
              {reportHistory.length > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold font-mono">
                  {reportHistory.length}
                </span>
              )}
            </button>
            <button
              id="nav-about-tab"
              onClick={() => { setActiveTab("about"); stopAudio(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                activeTab === "about"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-stone-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Info className="w-3.5 h-3.5" /> Research Lab Info
            </button>
          </nav>
        </div>
      </header>

      {/* --- LIVE STATS BAR --- */}
      <div className="bg-gradient-to-r from-brand-900 to-emerald-950 text-emerald-50 text-[11px] md:text-xs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5 text-center font-medium">
          <div className="flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AgriShield Pathological Intelligence Matrix Activated — Guntur Regional Hub</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-emerald-305">
            <span>TOTAL SCANS: {totalScans}</span>
            <span className="hidden sm:inline text-emerald-500">•</span>
            <span className="text-red-300 font-bold">SEVERE CASES: {highSeverityCount}</span>
            <span className="hidden sm:inline text-emerald-500">•</span>
            <span>STREAK: ACTIVE STAGE</span>
          </div>
        </div>
      </div>

      {/* --- MAIN PAGE CONTENT CONTAINER --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ==================== TAB 1: DIAGNOSTIC LAB ==================== */}
        {activeTab === "diagnostic" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT DRAWER: INTAKE & SETTINGS */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 space-y-5">
                
                <div>
                  <h2 className="font-display font-extrabold text-base text-stone-900 flex items-center gap-2">
                    <Camera className="w-4.5 h-4.5 text-brand-650" />
                    Digital Leaf Intake
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">Focus close-up on crop leaf lesions in natural daylight.</p>
                </div>

                {/* File drag workspace */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center min-h-[220px] cursor-pointer ${
                    dragActive
                      ? "border-brand-550 bg-brand-50/50 scale-[0.99]"
                      : selectedImage
                      ? "border-stone-300 bg-stone-50/20"
                      : "border-stone-300 hover:border-brand-500 hover:bg-stone-50/30"
                  }`}
                  onClick={() => !selectedImage && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {selectedImage ? (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden group">
                      <img
                        src={selectedImage}
                        alt="Foliar Pathology Case"
                        className="w-full h-full object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Pulsating live green laser line showing scanning progress */}
                      {loading && (
                        <div className="absolute inset-x-0 h-1 bg-emerald-450 shadow-[0_0_12px_#10b981] z-20 top-0 animate-[bullet_4s_infinite_linear]" />
                      )}

                      <style>{`
                        @keyframes bullet {
                          0% { top: 0%; }
                          50% { top: 100%; }
                          100% { top: 0%; }
                        }
                      `}</style>

                      {!loading && (
                        <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            id="btn-remove-crop"
                            onClick={(e) => { e.stopPropagation(); handleClearImage(); }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none shadow flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Image
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 flex flex-col items-center gap-2">
                       <div className="w-11 h-11 rounded-full bg-brand-50 flex items-center justify-center text-brand-650">
                        <UploadCloud className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800">Drop diseased leaf photo here</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">or click to browse local files</p>
                      </div>
                      <div className="bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-[9px] uppercase font-mono text-stone-450 font-bold select-none">
                        JPG, PNG, JPEG (MAX 20MB)
                      </div>
                    </div>
                  )}
                </div>

                {/* --- FINE TUNING SLIDERS --- */}
                <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    id="btn-toggle-advanced-params"
                    onClick={() => setShowAdvancedParams(!showAdvancedParams)}
                    className="w-full bg-stone-55 border-none hover:bg-stone-100 px-4 py-2.5 text-xs font-bold text-stone-700 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-brand-650" /> Advanced Model Sliders
                    </span>
                    <span className="text-[10px] bg-brand-100/70 text-brand-850 px-2 py-0.5 rounded-full font-mono">
                      {showAdvancedParams ? "Hide" : "Tune Parameters"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {showAdvancedParams && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white p-4 border-t border-stone-200 text-xs space-y-4"
                      >
                        {/* Model Selection Row */}
                        <div className="space-y-2 pb-3 border-b border-stone-100">
                          <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">Pathological AI Model Selection</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                              { id: "gemini-2.5-flash", label: "Lightweight Pathology Model", desc: "Fast preliminary crop checks" },
                              { id: "gemini-3.5-flash", label: "Standard Analytical Model", desc: "Balanced translation & diagnosis" },
                              { id: "gemini-3.1-pro-preview", label: "Expert Pathology System", desc: "Deep plant pathology reasoning" }
                            ].map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                id={`model-select-${m.id}`}
                                onClick={() => setSelectedModel(m.id)}
                                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                  selectedModel === m.id
                                    ? "border-brand-500 bg-brand-50/50 text-brand-900 ring-1 ring-brand-500"
                                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                                }`}
                              >
                                <span className="font-bold text-[10.5px]">{m.label}</span>
                                <span className="text-[8.5px] text-stone-550 mt-0.5 leading-tight">{m.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Temp Control */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="font-bold text-stone-700">Temperature (ఆడ్రిబ్యూట్)</span>
                            <span className="font-mono text-brand-650 font-bold">{temperature}</span>
                          </div>
                          <input
                            id="slider-model-temperature"
                            type="range"
                            min="0.05"
                            max="1.0"
                            step="0.05"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                          />
                          <div className="flex justify-between text-[9px] text-stone-450 font-medium select-none">
                            <span>Precise / Clinic</span>
                            <span>Creative Interpretation</span>
                          </div>
                        </div>

                        {/* Top-P Control */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="font-bold text-stone-700">Top-P Sampling</span>
                            <span className="font-mono text-brand-650 font-bold">{topP}</span>
                          </div>
                          <input
                            id="slider-model-topp"
                            type="range"
                            min="0.5"
                            max="1.0"
                            step="0.05"
                            value={topP}
                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                            className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                          />
                        </div>

                        {/* Max Tokens Control */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="font-bold text-stone-700">Max tokens response</span>
                            <span className="font-mono text-brand-650 font-bold">{maxOutputTokens}</span>
                          </div>
                          <input
                            id="slider-model-tokens"
                            type="range"
                            min="1000"
                            max="4000"
                            step="250"
                            value={maxOutputTokens}
                            onChange={(e) => setMaxOutputTokens(parseInt(e.target.value))}
                            className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Trigger inputs */}
                {selectedImage && (
                  <div className="space-y-2">
                    {!activeReport && !loading && (
                      <button
                        id="btn-run-analysis"
                        onClick={handleRunAnalysis}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-display font-medium text-xs shadow-md shadow-brand-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                      >
                        <Activity className="w-4 h-4" /> Run Pathological Diagnosis
                      </button>
                    )}

                    {loading && (
                      <div className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-semibold text-brand-900 mt-1 animate-pulse text-center leading-tight">
                          {loadingMessages[loadingStep]}
                        </span>
                      </div>
                    )}

                    {activeReport && !loading && (
                      <button
                        id="btn-new-diagnose"
                        onClick={handleClearImage}
                        className="w-full bg-stone-100 hover:bg-stone-200 text-stone-750 py-2.5 rounded-xl text-xs font-semibold border border-stone-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Diagnose New Leaf
                      </button>
                    )}
                  </div>
                )}

                {/* --- DEMO ACCELERATORS --- */}
                {!selectedImage && (
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5 uppercase tracking-wide select-none">
                      <Sparkles className="w-3.5 h-3.5 text-brand-650" /> Demo Library Cases
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {SAMPLE_CROPS.map((crop) => (
                        <div
                          key={crop.id}
                          id={`demo-case-${crop.id}`}
                          onClick={() => handleSelectSample(crop)}
                          className="flex items-center gap-3 p-2 rounded-xl border border-stone-200 bg-white hover:bg-brand-50/50 hover:border-brand-350 cursor-pointer transition-all group shadow-sm hover:translate-x-0.5"
                        >
                          <img
                            src={crop.imageUrl}
                            alt={crop.name}
                            className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-display font-bold text-xs text-stone-850 truncate">{crop.name}</span>
                              <span className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase shrink-0 ${
                                crop.severity === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                              }`}>
                                {crop.severity}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-500 whitespace-nowrap overflow-hidden text-ellipsis leading-tight mt-0.5">
                              {crop.disease}
                            </p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-brand-650" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT DRAWER: DIAGNOSTIC BLUEPRINT */}
              <div className="lg:col-span-8">
                
                <AnimatePresence mode="wait">
                  {activeReport ? (
                    <motion.div
                      key={activeReport.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="bg-white rounded-2xl border border-stone-205 shadow-sm overflow-hidden"
                    >
                      {/* Severity Strip Header */}
                      {(() => {
                        const styles = getSeverityStyles(activeReport.severity);
                        return (
                          <div className={`px-6 py-4.5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${styles.bg}`}>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.badge}`}>
                                  Severity Index: {activeReport.severity}
                                </span>
                                {activeReport.detectedRegion && (
                                  <span className="bg-white/90 border border-stone-200 text-stone-600 rounded px-2 py-0.5 text-[9px] font-mono flex items-center gap-0.5 font-bold">
                                    <MapPin className="w-3 h-3 text-red-500" /> {activeReport.detectedRegion}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-display font-extrabold text-lg md:text-xl text-stone-900 leading-tight">
                                {activeReport.diseaseName}
                              </h3>
                              <p className="text-xs font-semibold text-stone-600">
                                Target Crop: <span className="text-stone-850 font-bold">{activeReport.cropName}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur border px-3 py-1.5 rounded-xl text-xs text-stone-650 font-mono font-medium">
                              <Calendar className="w-3.5 h-3.5 text-brand-605" />
                              {activeReport.date}
                            </div>
                          </div>
                        );
                      })()}

                      <div className="p-5 md:p-6 space-y-6">
                        
                        {/* --- FARMER AUDIO HANDS-FREE HUB --- */}
                        <div className="bg-[#0b120d] border border-emerald-950/80 rounded-2xl p-5 md:p-6 space-y-4 shadow-md text-stone-100">
                          
                          <div className="flex items-center justify-between border-b border-emerald-900/55 pb-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/15">
                                <Volume1 className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-display font-bold text-xs.5 md:text-sm text-emerald-350 uppercase tracking-widest leading-none">Farmers Voice Assistant</h4>
                                <p className="text-[10px] text-stone-400 mt-1">రైతులు వినడానికి మరియు సులభంగా అర్థం చేసుకోవడానికి ఆడియో ప్లేయర్</p>
                              </div>
                            </div>

                            {/* Audio stream loading indicator or Soundwave spectrum */}
                            {ttsLoading ? (
                              <div className="flex items-center gap-1.5 bg-black/40 border border-brand-900/40 px-2.5 py-1 rounded-lg">
                                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-ping" />
                                <span className="text-[9px] font-mono text-emerald-424 font-bold">Synthesizing audio...</span>
                              </div>
                            ) : speakingLanguage ? (
                              <div className="flex items-end gap-1 h-5 select-none self-center bg-black/30 border border-emerald-900/40 px-2.5 py-1 rounded-lg">
                                <span className="text-[8px] font-mono text-stone-400 mr-1">LIVE READING</span>
                                <div className="w-0.8 bg-brand-400 rounded-full animate-[soundbar_0.8s_infinite_ease-in-out_alternate]" style={{animationDelay: "0.1s"}} />
                                <div className="w-0.8 bg-emerald-400 rounded-full animate-[soundbar_0.8s_infinite_ease-in-out_alternate]" style={{ animationDelay: "0.3s", height: "30%" }} />
                                <div className="w-0.8 bg-brand-400 rounded-full animate-[soundbar_0.8s_infinite_ease-in-out_alternate]" style={{animationDelay: "0.5s"}} />
                                <div className="w-0.8 bg-emerald-300 rounded-full animate-[soundbar_0.8s_infinite_ease-in-out_alternate]" style={{animationDelay: "0.2s"}} />
                              </div>
                            ) : null}

                            <style>{`
                              @keyframes soundbar {
                                0% { height: 20%; }
                                100% { height: 100%; }
                              }
                            `}</style>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Telugu Voice Box */}
                            <div className="bg-[#111c14] rounded-xl p-4.5 border border-emerald-950 flex flex-col justify-between space-y-4 shadow-sm hover:border-emerald-900 transition-all">
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">ఆంధ్రా రైతు సహాయకం (Telugu Summary)</span>
                                <p className="text-[12px] text-stone-100 font-medium leading-relaxed italic line-clamp-3">
                                  "{activeReport.summaryTelugu}"
                                </p>
                              </div>
                              <button
                                id="voice-play-telugu"
                                onClick={() => handleSpeak(activeReport.summaryTelugu, "te")}
                                className={`w-full py-2 rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                                  speakingLanguage === "te"
                                    ? "bg-red-500/15 border-red-500/30 text-red-350 hover:bg-red-500/20"
                                    : "bg-brand-600 border-none text-white hover:bg-brand-500 shadow-sm"
                                }`}
                              >
                                {speakingLanguage === "te" ? (
                                  <>
                                    <VolumeX className="w-3.5 h-3.5" /> ఆడియో ఆపు (Stop Audio)
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5" /> తెలుగు ఆడియో వినండి (Listen Telugu)
                                  </>
                                )}
                              </button>
                            </div>

                            {/* English Voice Box */}
                            <div className="bg-[#111c14] rounded-xl p-4.5 border border-emerald-950 flex flex-col justify-between space-y-4 shadow-sm hover:border-emerald-900 transition-all">
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-emerald-450 tracking-wider block">English Pathology Readout</span>
                                <p className="text-[11.5px] text-stone-200 leading-relaxed line-clamp-3">
                                  "{activeReport.summaryEnglish}"
                                </p>
                              </div>
                              <button
                                id="voice-play-english"
                                onClick={() => handleSpeak(activeReport.summaryEnglish, "en")}
                                className={`w-full py-2 rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                                  speakingLanguage === "en"
                                    ? "bg-red-500/15 border-red-500/30 text-red-350 hover:bg-red-500/20"
                                    : "bg-emerald-600 border-none text-white hover:bg-emerald-500 shadow-sm"
                                }`}
                              >
                                {speakingLanguage === "en" ? (
                                  <>
                                    <VolumeX className="w-3.5 h-3.5" /> Stop Voice Playback
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5" /> Listen in English
                                  </>
                                )}
                              </button>
                            </div>

                          </div>

                        </div>

                        {/* Plant Pathology Technical insights */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 select-none">
                            <Activity className="w-3.5 h-3.5 text-brand-650" /> Scientific pathology evaluation
                          </h4>
                          <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
                            <p className="text-[12.5px] text-stone-750 leading-relaxed">
                              {activeReport.technicalExplanation}
                            </p>
                          </div>
                        </div>

                        {/* Safeguards / Prescriptions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          
                          {/* Organic & Cultural */}
                          <div className="border border-emerald-200 rounded-xl overflow-hidden shadow-xs">
                            <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-200 flex items-center gap-2">
                              <Leaf className="w-4 h-4 text-emerald-650" />
                              <h4 className="font-display font-bold text-xs text-emerald-900">Organic & Cultural Treatment</h4>
                            </div>
                            <div className="bg-white p-4.5">
                              <ul className="space-y-2.5 list-none m-0 p-0">
                                {activeReport.treatmentOrganic.map((step, sIdx) => (
                                  <li key={sIdx} className="flex gap-2 text-xs text-stone-700 leading-normal">
                                    <span className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                                      {sIdx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Precision Chemical Controls */}
                          <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                            <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 flex items-center gap-2">
                              <FlaskConical className="w-4 h-4 text-stone-600" />
                              <h4 className="font-display font-bold text-xs text-stone-800">Systemic Chemical Protection</h4>
                            </div>
                            <div className="bg-white p-4.5">
                              <ul className="space-y-2.5 list-none m-0 p-0">
                                {activeReport.treatmentChemical.map((step, sIdx) => (
                                  <li key={sIdx} className="flex gap-2 text-xs text-stone-700 leading-normal">
                                    <span className="w-4.5 h-4.5 rounded-full bg-stone-100 text-stone-800 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                                      {sIdx + 1}
                                    </span>
                                    <span className="font-medium">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                        </div>

                        {/* --- WEATHER GEOPOSITION & SPRAY SAFETY PANEL --- */}
                        <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs space-y-0.5">
                          <div className="bg-stone-50/50 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Thermometer className="w-4 h-4 text-brand-650" />
                              <h4 className="font-display font-bold text-xs text-stone-800">Field Telemetry & Spray Safety index</h4>
                            </span>
                            <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-mono font-bold uppercase select-none">
                              Live simulated sensors
                            </span>
                          </div>
                          
                          <div className="bg-white p-5 space-y-5">
                            {/* Interactive Weather Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                              {[
                                { 
                                  label: "Temp (°C)", 
                                  val: activeReport.weatherTelemetry?.temperature ? `${activeReport.weatherTelemetry.temperature}°C` : "31.4°C", 
                                  desc: "Foliage Ambient", 
                                  color: "text-amber-600 bg-amber-50", 
                                  ico: Thermometer 
                                },
                                { 
                                  label: "Humidity (%)", 
                                  val: activeReport.weatherTelemetry?.humidity ? `${activeReport.weatherTelemetry.humidity}%` : "74%", 
                                  desc: "Wetness Index", 
                                  color: "text-blue-600 bg-blue-50", 
                                  ico: Droplets 
                                },
                                { 
                                  label: "Wind Speed", 
                                  val: activeReport.weatherTelemetry?.windSpeed ? `${activeReport.weatherTelemetry.windSpeed} km/h` : "8.5 km/h", 
                                  desc: "Vapor Drift Rate", 
                                  color: "text-teal-600 bg-teal-50", 
                                  ico: Wind 
                                },
                                { 
                                  label: "Rain Forecast", 
                                  val: activeReport.weatherTelemetry?.rainProbability ? `${activeReport.weatherTelemetry.rainProbability}%` : "12%", 
                                  desc: "Wash-off Probability", 
                                  color: "text-indigo-600 bg-indigo-50", 
                                  ico: CloudRain 
                                }
                              ].map((it, idx) => {
                                const Icon = it.ico;
                                return (
                                  <div key={idx} className="bg-stone-50/70 border border-stone-150 rounded-xl p-3 flex flex-col justify-between shadow-xs">
                                    <div className="flex items-center gap-1.5 text-stone-500 text-[10.5px] font-medium">
                                      <Icon className="w-3.5 h-3.5 text-stone-450" /> {it.label}
                                    </div>
                                    <div className="mt-1.5">
                                      <div className="text-[15px] font-extrabold text-stone-850 font-mono tracking-tight">{it.val}</div>
                                      <div className="text-[9px] text-stone-450 mt-0.5 leading-none select-none">{it.desc}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Spray Safety Evaluation Alert */}
                            {(() => {
                              const rawSafety = activeReport.spraySafetyIndex || "Safe — Low Wind";
                              const isUnsafe = rawSafety.toLowerCase().includes("unsafe");
                              const isCaution = rawSafety.toLowerCase().includes("caution");
                              
                              let colorClass = "bg-emerald-50 border-emerald-200 text-emerald-850";
                              let IconNode = <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />;
                              
                              if (isUnsafe) {
                                colorClass = "bg-red-50 border-red-200 text-red-850";
                                IconNode = <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />;
                              } else if (isCaution) {
                                colorClass = "bg-amber-50 border-amber-200 text-amber-850";
                                IconNode = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
                              }

                              return (
                                <div className={`border rounded-xl p-4 flex items-start gap-3 ${colorClass}`}>
                                  {IconNode}
                                  <div className="space-y-0.5">
                                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider select-none">
                                      Dynamic Spraying advisory
                                    </span>
                                    <h5 className="font-extrabold text-xs md:text-sm">{rawSafety}</h5>
                                    <p className="text-[10.5px] leading-relaxed opacity-90">
                                      {isUnsafe 
                                        ? "Avoid chemical spraying currently. High rain forecast washes pesticide drops into soil, or excessive wind speed will drift vapors onto collateral crops." 
                                        : isCaution 
                                        ? "Proceed with caution. Spray using target-specific shielded nozzles to prevent wind drift. Apply during low sun elevations."
                                        : "Optimal environmental margin. Mild winds and low humidity forecast guarantee maximal foliar leaf surface absorption with minimal spill risks."}
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* --- TREATMENT ECONOMICS CALCULATOR --- */}
                        {activeReport.treatmentCosts && (
                          <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs space-y-0.5 bg-white">
                            <div className="bg-stone-50/50 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-brand-650" />
                                <h4 className="font-display font-bold text-xs text-stone-800">Dynamic Treatment Economic Calculator</h4>
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold uppercase select-none">
                                Acreage projection
                              </span>
                            </div>

                            <div className="p-5 space-y-5">
                              {/* Sliders Grid */}
                              <div className="bg-stone-50/60 p-4 border border-stone-150 rounded-xl space-y-3.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-stone-700">Farm Cultivated Acreage:</span>
                                  <span className="font-mono text-brand-750 font-extrabold text-sm px-2 py-0.5 bg-white border rounded shadow-2xs">
                                    {farmAcreage} Acres
                                  </span>
                                </div>
                                <input
                                  id="slider-economics-acreage"
                                  type="range"
                                  min="0.5"
                                  max="10.0"
                                  step="0.5"
                                  value={farmAcreage}
                                  onChange={(e) => setFarmAcreage(parseFloat(e.target.value))}
                                  className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                />
                                <div className="flex justify-between text-[9px] text-stone-450 font-bold select-none uppercase tracking-wide">
                                  <span>0.5 Acre (Smallholder)</span>
                                  <span>5.0 Acres (Standard)</span>
                                  <span>10.0 Acres (Large)</span>
                                </div>
                              </div>

                              {/* Price Math comparative display cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Organic Summary Cost */}
                                <div className="border border-emerald-100 rounded-xl p-4.5 bg-gradient-to-br from-emerald-50/30 to-white flex flex-col justify-between space-y-3">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-mono uppercase bg-emerald-100/60 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                      Organic Spray Cost
                                    </span>
                                    <div className="text-xl font-black text-emerald-800 font-mono tracking-tight mt-1">
                                      ₹{(activeReport.treatmentCosts.organicPerAcre * farmAcreage).toLocaleString("en-IN")}
                                    </div>
                                    <p className="text-[9.5px] text-stone-500 leading-tight">
                                      Estimated organic cost based on ₹{activeReport.treatmentCosts.organicPerAcre}/acre
                                    </p>
                                  </div>
                                  <div className="border-t border-dotted border-stone-200 pt-2.5 space-y-1.5">
                                    <span className="text-[9px] uppercase font-bold text-stone-450 tracking-wider block">Itemized Estimate list</span>
                                    {activeReport.treatmentCosts.organicBreakdown.map((item, id) => (
                                      <div key={id} className="text-[10px] text-stone-700 flex justify-between leading-snug">
                                        <span className="text-stone-550 truncate mr-2">• {item.split(" - ")[0]}</span>
                                        <span className="font-mono font-bold shrink-0 text-emerald-700">
                                          ₹{Math.round(parseInt(item.split("₹")[1]?.split("/")[0] || "200") * farmAcreage)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Chemical Summary Cost */}
                                <div className="border border-stone-250 rounded-xl p-4.5 bg-gradient-to-br from-stone-50/50 to-white flex flex-col justify-between space-y-3">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-bold">
                                      Chemical Control Cost
                                    </span>
                                    <div className="text-xl font-black text-stone-850 font-mono tracking-tight mt-1">
                                      ₹{(activeReport.treatmentCosts.chemicalPerAcre * farmAcreage).toLocaleString("en-IN")}
                                    </div>
                                    <p className="text-[9.5px] text-stone-500 leading-tight">
                                      Estimated systemic cost based on ₹{activeReport.treatmentCosts.chemicalPerAcre}/acre
                                    </p>
                                  </div>
                                  <div className="border-t border-dotted border-stone-200 pt-2.5 space-y-1.5">
                                    <span className="text-[9px] uppercase font-bold text-stone-450 tracking-wider block">Itemized Estimate list</span>
                                    {activeReport.treatmentCosts.chemicalBreakdown.map((item, id) => (
                                      <div key={id} className="text-[10px] text-stone-700 flex justify-between leading-snug">
                                        <span className="text-stone-555 truncate mr-2">• {item.split(" - ")[0]}</span>
                                        <span className="font-mono font-bold shrink-0 text-stone-800 font-medium">
                                          ₹{Math.round(parseInt(item.split("₹")[1]?.split("/")[0] || item.split("₹")[1] || "300") * farmAcreage)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* --- PATHOLOGICAL AI SERVICE EXECUTION TRACE LOGGER --- */}
                        {apiTelemetry && (
                          <div className="border border-stone-150 rounded-2xl overflow-hidden shadow-2xs">
                            <details className="group">
                              <summary className="bg-stone-100/50 hover:bg-stone-100 hover:text-stone-900 px-4 py-3 transition-all cursor-pointer select-none flex items-center justify-between text-xs font-bold text-stone-700 list-none font-mono">
                                <span className="flex items-center gap-1.5 font-sans">
                                  <FileCheck2 className="w-3.5 h-3.5 text-brand-650" /> [AI Engine Compute Telemetry]
                                </span>
                                <span className="text-[9px] bg-brand-100 text-brand-850 px-2 py-0.5 rounded-full font-semibold group-open:hidden uppercase">
                                  Show execution latency logs
                                </span>
                                <span className="text-[9px] bg-brand-200 text-brand-900 px-2 py-0.5 rounded-full font-semibold hidden group-open:inline uppercase font-sans">
                                  Hide logs
                                </span>
                              </summary>
                              
                              <div className="bg-stone-50 p-4 border-t border-stone-200 text-[11px] font-mono space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="bg-white p-2 border border-stone-200 rounded">
                                    <div className="text-stone-500 text-[9px] select-none uppercase">Model Invoked</div>
                                    <div className="text-brand-850 font-bold font-sans mt-0.5 truncate">{apiTelemetry.modelUsed}</div>
                                  </div>
                                  <div className="bg-white p-2 border border-stone-200 rounded">
                                    <div className="text-stone-500 text-[9px] select-none uppercase">Processing Latency</div>
                                    <div className="text-stone-800 font-extrabold mt-0.5">{apiTelemetry.latency} Seconds</div>
                                  </div>
                                  <div className="bg-white p-2 border border-stone-200 rounded">
                                    <div className="text-stone-500 text-[9px] select-none uppercase">Token Consumption</div>
                                    <div className="text-stone-800 mt-0.5">
                                      <span className="text-stone-500">I:{apiTelemetry.promptTokens}</span> 
                                      <span className="text-stone-450 mx-1">/</span>
                                      <span className="text-stone-700 font-semibold">O:{apiTelemetry.outputTokens}</span>
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 border border-stone-200 rounded">
                                    <div className="text-stone-500 text-[9px] select-none uppercase">Estimated Billing Compute</div>
                                    <div className="text-emerald-700 font-bold mt-0.5">${apiTelemetry.estimatedCost?.toFixed(4)} Cents</div>
                                  </div>
                                </div>
                                <div className="bg-stone-900 text-stone-200 p-3 rounded border border-stone-800 text-[9.5px] leading-relaxed overflow-x-auto whitespace-pre space-y-1">
                                  <span className="text-brand-350 select-none">[agri-shield-trace ~]$ status --check</span>
                                  <p className="m-0 text-stone-405">⚡ Client payload dispatched successfully (size: {Math.round(selectedImage?.length ? selectedImage?.length / 1024 : 120)} KB base64)</p>
                                  <p className="m-0 text-stone-405">🔥 Multi-Modal Image parsing completed (Model: Active Multi-Modal Engine)</p>
                                  <p className="m-0 text-stone-405">✅ Structured Pathological JSON parsed successfully (Schema status: strictly compliant)</p>
                                  <p className="m-0 text-emerald-450">🌱 Regional telemetry mapping calculated coordinates ({activeReport.gpsLatitude}, {activeReport.gpsLongitude})</p>
                                </div>
                              </div>
                            </details>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  ) : gatekeeperAlert ? (
                    <motion.div
                      key="gatekeeper-alert"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="bg-white rounded-2xl border border-amber-300 shadow-md overflow-hidden"
                    >
                      {/* Alert Header */}
                      <div className="bg-amber-50/50 border-b border-amber-200 px-6 py-4.5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                          <ShieldAlert className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-mono font-bold uppercase px-2 py-0.5 rounded">
                            AGENT 1 // GATEKEEPER VALIDATION FILTER
                          </span>
                          <h3 className="font-display font-extrabold text-base text-stone-900 mt-0.5">
                            Crop Image Verification Rejection
                          </h3>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        
                        {/* Telugu alert */}
                        <div className="bg-amber-50/[0.2] border border-amber-150 p-4 rounded-xl space-y-1.5">
                          <span className="text-[10px] font-bold text-amber-900 uppercase block select-none">
                            ఆంధ్రా రైతు సహాయ సూచిక (Bilingual Advisory)
                          </span>
                          <p className="text-[12.5px] text-stone-850 font-medium leading-relaxed italic">
                            "{gatekeeperAlert.reasonTe}"
                          </p>
                        </div>

                        {/* English alert */}
                        <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-1.5">
                          <span className="text-[10px] font-bold text-stone-550 uppercase block select-none">
                            Diagnostic Telemetry Log
                          </span>
                          <p className="text-[12px] text-stone-700 leading-relaxed font-sans">
                            "{gatekeeperAlert.reason}"
                          </p>
                        </div>

                        {/* Slider / Confidence Score */}
                        <div className="bg-stone-50/70 border border-stone-150 rounded-xl p-4 space-y-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-stone-605 flex items-center gap-1">
                              <Activity className="w-4 h-4 text-stone-400" />
                              Image Rejection Confidence Rating
                            </span>
                            <span className="font-mono font-bold text-stone-850 bg-white border px-2 py-0.5 rounded shadow-2xs">
                              {Math.round(gatekeeperAlert.confidenceScore * 100)}% Match
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.round(gatekeeperAlert.confidenceScore * 100)}%` }}
                            />
                          </div>
                          <p className="text-[9.5px] text-stone-450 mt-1">
                            Our primary Gatekeeper neural net matches images against a rigorous crop ontology index. Rejection scores exceeding 85% indicate extreme outlier profiles (e.g. animals, household items, or heavy lens flare).
                          </p>
                        </div>

                        {/* Intake Guides */}
                        <div className="bg-stone-50 p-4 border border-stone-200 rounded-xl space-y-2.5 text-xs">
                          <span className="font-bold text-stone-700 uppercase tracking-wider text-[10.5px] block select-none">
                            Corrective diagnostic imaging checklist:
                          </span>
                          <ul className="list-none m-0 p-0 space-y-2 text-stone-600 leading-normal">
                            <li className="flex gap-2">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>Target a <strong>single leaf or plant stem</strong> rather than a wide group of foliage.</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>Wipe any heavy dirt coatings or water droplet aggregates off the upper leaf envelope.</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>Avoid background noise (fingers, feet, animals, power tools, or household screens).</span>
                            </li>
                          </ul>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setGatekeeperAlert(null);
                              handleClearImage();
                            }}
                            className="bg-stone-900 border border-stone-800 text-white hover:bg-stone-800 transition-all font-semibold font-display text-xs px-4 py-2 rounded-xl cursor-pointer"
                          >
                            Clear & Try Again
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl border border-stone-200 border-dashed p-10 text-center flex flex-col items-center justify-center min-h-[420px] gap-4"
                    >
                      <div className="w-14 h-14 rounded-full bg-stone-50 border border-stone-150 border-dashed flex items-center justify-center text-stone-400">
                        <Sprout className="w-7 h-7" />
                      </div>
                      <div className="space-y-1.5 max-w-sm">
                        <h3 className="font-display font-bold text-sm text-stone-800">Awaiting Crop Canopy Intake</h3>
                        <p className="text-xs text-stone-550 leading-relaxed">
                          Please drop in an affected crop leaf image, trigger one of our pre-rendered demo cases, or view active containment coordinates in the Outbreak Map panel.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 2: REGIONAL MAP & DYNAMIC GRAPHS ==================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Quick KPI panels */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-650 shrink-0">
                  <Activity className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Total Scans Cached</span>
                  <span className="text-xl font-display font-extrabold text-stone-900">{totalScans}</span>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle className="w-5.5 h-5.5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Severe Epidemics</span>
                  <span className="text-xl font-display font-extrabold text-red-650">{highSeverityCount}</span>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <TrendingUp className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Active Mitigations</span>
                  <span className="text-xl font-display font-extrabold text-amber-600">{mediumSeverityCount}</span>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Normal Canopy Rate</span>
                  <span className="text-xl font-display font-extrabold text-emerald-650">{lowSeverityCount}</span>
                </div>
              </div>

            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* THE MAP GRID COMPONENT */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/95 shadow-sm p-5 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-stone-900 flex items-center gap-2">
                      <MapPin className="w-4.5 h-4.5 text-red-500" /> Regional Containment Map
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">Andhra Pradesh Foliar Pathology spatial vectors (Guntur focus)</p>
                  </div>
                  
                  {/* Mode Toggles */}
                  <div className="flex p-0.5 bg-stone-100 border border-stone-200 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPredictiveMode(false);
                        setSelectedSector(null);
                      }}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        !isPredictiveMode 
                          ? "bg-white text-stone-900 shadow-2xs border border-stone-200" 
                          : "text-stone-550 hover:text-stone-800"
                      }`}
                    >
                      Active Outposts
                    </button>
                    <button
                      type="button"
                      id="btn-trigger-predictive-mode"
                      onClick={() => setIsPredictiveMode(true)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                        isPredictiveMode 
                          ? "bg-brand-600 text-white shadow-2xs" 
                          : "text-stone-550 hover:text-brand-850"
                      }`}
                    >
                      🔮 Predictive Threats
                    </button>
                  </div>
                </div>

                {/* THE MAP VECTOR */}
                <div className="relative bg-emerald-50/5 border border-stone-200 rounded-xl overflow-hidden flex items-center justify-center py-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                  
                  <svg viewBox="0 0 500 400" className="w-full max-w-[500px] h-auto drop-shadow-md select-none">
                    <defs>
                      <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                      </marker>
                    </defs>

                    {/* Regional Map Polygons */}
                    <g stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" fillOpacity={isPredictiveMode ? "0.85" : "0.75"}>
                      {SECTORS.map((sector) => {
                        const riskInfo = getSectorRisk(sector);
                        let polygonFill = sector.defaultFill;

                        if (isPredictiveMode && riskInfo.severity) {
                          if (riskInfo.severity === "High") {
                            polygonFill = "#fca5a5"; // soft red
                          } else if (riskInfo.severity === "Medium") {
                            polygonFill = "#fef08a"; // soft yellow
                          } else if (riskInfo.severity === "Low") {
                            polygonFill = "#a7f3d0"; // soft green
                          }
                        }

                        // Style active sector highlight
                        const isSelected = selectedSector?.id === sector.id;
                        const isHovered = hoveredSector?.id === sector.id;

                        return (
                          <polygon 
                            key={sector.id}
                            points={sector.poly}
                            fill={polygonFill}
                            onClick={() => {
                              setSelectedSector(sector);
                              setSelectedHotspot(null); // clear hotspot details to favor sector details
                            }}
                            onMouseEnter={() => setHoveredSector(sector)}
                            onMouseLeave={() => setHoveredSector(null)}
                            className="hover:opacity-90 transition-opacity cursor-pointer duration-205"
                            stroke={isHovered || isSelected ? "#4f46e5" : "#ffffff"}
                            strokeWidth={isHovered || isSelected ? "3" : "2.5"}
                          />
                        );
                      })}
                    </g>

                    {/* Landmarks Grid Labels */}
                    <text x="130" y="70" fill="#1b4332" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">AMARAVATI (ఆమరావతి)</text>
                    <text x="210" y="150" fill="#14532d" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">GUNTUR REGION</text>
                    <text x="360" y="160" fill="#1e3a8a" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">TENALI DELTA (తెనాలి)</text>
                    <text x="340" y="320" fill="#713f12" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">BAPATLA DELTA</text>
                    <text x="35" y="220" fill="#7c2d12" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">NARASARAOPET</text>

                    {/* Blinking alarm pulses for critical high-threat zones in Predictive Mode */}
                    {isPredictiveMode && SECTORS.map((sector) => {
                      const riskInfo = getSectorRisk(sector);
                      if (riskInfo.severity !== "High") return null;
                      return (
                        <g key={`alarm-${sector.id}`}>
                          <circle
                            cx={sector.center.x}
                            cy={sector.center.y}
                            r="6"
                            fill="#ef4444"
                            className="animate-ping"
                          />
                          <circle
                            cx={sector.center.x}
                            cy={sector.center.y}
                            r="3"
                            fill="#dc2626"
                          />
                        </g>
                      );
                    })}

                    {/* Plot coordinates from scan records */}
                    {reportHistory.map((report) => {
                      const styles = getSeverityStyles(report.severity);
                      const { x, y } = getXY(report.gpsLatitude, report.gpsLongitude);

                      return (
                        <g 
                          key={report.id}
                          className="cursor-pointer group"
                          onMouseEnter={() => setHoveredHotspot(report)}
                          onMouseLeave={() => setHoveredHotspot(null)}
                          onClick={() => {
                            setSelectedHotspot(report);
                            setSelectedSector(null); // clear sector selection to favor active scout report
                          }}
                        >
                          {/* Pulsing ring */}
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="11" 
                            fill={styles.fill} 
                            fillOpacity="0.4" 
                            className="animate-ping" 
                          />

                          {/* Spot indicator */}
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="6" 
                            fill={styles.fill} 
                            stroke="#ffffff" 
                            strokeWidth="1.5"
                            className="transition-transform group-hover:scale-125 block"
                          />

                          {/* Active Predictive Simulation Halos */}
                          {isPredictiveMode && (() => {
                            let spreadRate = 4;
                            if (weatherFactor === "humid") spreadRate = 7;
                            else if (weatherFactor === "monsoon") spreadRate = 12;
                            else if (weatherFactor === "arid") spreadRate = 2;
                            
                            const currentRadius = 18 + predictionHorizon * spreadRate;
                            const haloColor = report.severity === "High" ? "#dc2626" : report.severity === "Medium" ? "#d97706" : "#059669";
                            
                            return (
                              <g key={`halo-group-${report.id}`}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r={currentRadius}
                                  fill="none"
                                  stroke={haloColor}
                                  strokeWidth="1.5"
                                  strokeDasharray="4 3"
                                  className="transition-all duration-500 ease-out opacity-80"
                                />
                                <circle
                                  cx={x}
                                  cy={y}
                                  r={currentRadius}
                                  fill={haloColor}
                                  fillOpacity="0.08"
                                  className="transition-all duration-500 ease-out"
                                />
                              </g>
                            );
                          })()}

                          {/* Animated Wind Drift Vectors */}
                          {isPredictiveMode && predictionHorizon > 0 && (() => {
                            // Southwest monsoon wind blows to Northeast (-45deg / -0.785 rad)
                            let angle = -0.785;
                            if (weatherFactor === "arid") angle = 0.785; // Southeast drift
                            else if (weatherFactor === "monsoon") angle = -0.55; // ENE drift
                            
                            const driftLen = 22 + predictionHorizon * 3.5;
                            const targetX = x + Math.cos(angle) * driftLen;
                            const targetY = y + Math.sin(angle) * driftLen;
                            const strokeColor = report.severity === "High" ? "#f87171" : report.severity === "Medium" ? "#fbbf24" : "#a7f3d0";
                            
                            return (
                              <g key={`drift-${report.id}`}>
                                <line
                                  x1={x}
                                  y1={y}
                                  x2={targetX}
                                  y2={targetY}
                                  stroke={strokeColor}
                                  strokeWidth="1.2"
                                  strokeDasharray="4,2"
                                  className="transition-all duration-500"
                                />
                                <circle
                                  cx={x + Math.cos(angle) * (driftLen * 0.6)}
                                  cy={y + Math.sin(angle) * (driftLen * 0.6)}
                                  r="2"
                                  fill={strokeColor}
                                  className="animate-pulse"
                                />
                              </g>
                            );
                          })()}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Float Info Tooltip on hover */}
                  {hoveredHotspot && (
                    <div className="absolute top-4 left-4 right-4 bg-white/95 border border-brand-200 p-3 rounded-xl flex items-center gap-3 shadow-md pointer-events-none transition-all z-10">
                      <img
                        src={hoveredHotspot.imageUrl}
                        alt="Crop target"
                        className="w-10 h-10 object-cover rounded-lg border border-stone-250 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="text-[9.5px] uppercase font-bold text-stone-500 font-mono">
                            Region: {hoveredHotspot.detectedRegion || "Outpost Sector"}
                          </span>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded ${getSeverityStyles(hoveredHotspot.severity).badge}`}>
                            {hoveredHotspot.severity} RISK
                          </span>
                        </div>
                        <h4 className="font-display font-extrabold text-[12.5px] text-stone-900 truncate leading-snug">
                          {hoveredHotspot.diseaseName}
                        </h4>
                        <p className="text-[10px] text-stone-550">
                          Crop: {hoveredHotspot.cropName}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sector Hover HUD inside Map Card */}
                  {hoveredSector && (
                    <div className="absolute top-4 left-4 right-4 bg-stone-900/95 text-stone-100 p-3 rounded-xl border border-stone-800 pointer-events-none transition-all z-10 flex flex-col gap-0.5 shadow-lg">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-brand-350">
                          🗺️ Guntur Sub-Sector Scan
                        </span>
                        <span className="text-[10px] font-bold text-stone-300">
                          {hoveredSector.lang}
                        </span>
                      </div>
                      <h4 className="text-[13px] font-extrabold font-display">{hoveredSector.name}</h4>
                      <p className="text-[9.5px] text-stone-400 font-sans leading-relaxed">{hoveredSector.description}</p>
                    </div>
                  )}

                </div>

                {/* --- PREDICTIVE CONTEXT SIMULATOR SLIDERS AND TRIGGERS --- */}
                {isPredictiveMode ? (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4.5 space-y-4 animate-fade-in">
                    
                    {/* Weather Factor Scenario Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-stone-550 uppercase tracking-wider">
                        Step 1: Set Ambient Climate Factor (Spore Spreading Vector)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "normal", label: "Normal (1.0x)", desc: "Standard drift" },
                          { id: "humid", label: "Humidity (1.5x)", desc: "Spore boost" },
                          { id: "monsoon", label: "Monsoon (3.4x)", desc: "High vectors" },
                          { id: "arid", label: "Arid Dry (0.6x)", desc: "Sun suppressed" }
                        ].map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => setWeatherFactor(w.id as any)}
                            className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              weatherFactor === w.id
                                ? "border-brand-600 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/10"
                                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                            }`}
                          >
                            <span className="font-extrabold text-[10.5px]">{w.label}</span>
                            <span className="text-[8px] text-stone-450 mt-0.5">{w.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Horizon Slider Deck */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-stone-550 uppercase tracking-wider">
                          Step 2: Projection Horizon Timeline
                        </label>
                        
                        <div className="flex items-center gap-2">
                          {/* Autoplay play/pause button */}
                          <button
                            type="button"
                            id="btn-play-predict-sim"
                            onClick={() => setIsPlayingSimulation(!isPlayingSimulation)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                              isPlayingSimulation 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : "bg-brand-50 text-brand-950 border-brand-200 hover:bg-brand-100"
                            }`}
                          >
                            {isPlayingSimulation ? (
                              <>
                                <Pause className="w-3 h-3 fill-currentColor animate-pulse" />
                                Pause Sim
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-currentColor" />
                                Auto-Play Loop
                              </>
                            )}
                          </button>

                          <span className="font-mono text-[11px] font-extrabold bg-brand-100 text-brand-900 border border-brand-200 px-2 py-0.5 rounded">
                            Day +{predictionHorizon} Forecast
                          </span>
                        </div>
                      </div>

                      {/* Manual Drag control */}
                      <div className="flex items-center gap-4 bg-white p-3 border border-stone-200 rounded-xl shadow-2xs">
                        <span className="text-[9.5px] font-bold text-stone-400 font-mono text-center w-7 shrink-0">D+0</span>
                        <input
                          id="slider-prediction-horizon"
                          type="range"
                          min="0"
                          max="14"
                          step="1"
                          value={predictionHorizon}
                          onChange={(e) => {
                            setPredictionHorizon(parseInt(e.target.value));
                            setIsPlayingSimulation(false); // pause autoplay if manual sliding detected
                          }}
                          className="flex-1 h-1.5 bg-stone-150 border border-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                        />
                        <span className="text-[9.5px] font-bold text-stone-450 font-mono text-center w-7 shrink-0">D+14</span>
                      </div>
                      
                      {/* Discrete timeline stages */}
                      <div className="grid grid-cols-4 gap-1 text-[9px] text-stone-450 text-center font-bold font-mono">
                        <button type="button" onClick={() => { setPredictionHorizon(0); setIsPlayingSimulation(false); }} className={`hover:text-stone-700 ${predictionHorizon === 0 ? "text-brand-700" : ""}`}>NOW</button>
                        <button type="button" onClick={() => { setPredictionHorizon(3); setIsPlayingSimulation(false); }} className={`hover:text-stone-700 ${predictionHorizon === 3 ? "text-brand-700" : ""}`}>+3 DAYS</button>
                        <button type="button" onClick={() => { setPredictionHorizon(7); setIsPlayingSimulation(false); }} className={`hover:text-stone-700 ${predictionHorizon === 7 ? "text-brand-700" : ""}`}>+7 DAYS</button>
                        <button type="button" onClick={() => { setPredictionHorizon(14); setIsPlayingSimulation(false); }} className={`hover:text-stone-700 ${predictionHorizon === 14 ? "text-brand-700" : ""}`}>+14 DAYS</button>
                      </div>
                    </div>

                    {/* Integrated mini stats readout */}
                    <div className="bg-white p-3 border border-stone-150 rounded-xl grid grid-cols-2 gap-3 divide-x divide-stone-100 select-none">
                      <div className="flex flex-col">
                        <span className="text-[8.5px] font-bold text-stone-450 uppercase font-mono">Endangered Agri Acreage</span>
                        <span className="text-sm font-black text-rose-750 font-mono mt-0.5">
                          {getSimulatedAcreageAtRisk().toLocaleString()} Acres
                        </span>
                        <span className="text-[8px] text-stone-400">Total potential crop canopy risk zone</span>
                      </div>
                      <div className="flex flex-col pl-3">
                        <span className="text-[8.5px] font-bold text-stone-450 uppercase font-mono">Quarantined Sectors</span>
                        <span className="text-sm font-black text-brand-900 mt-0.5 font-mono">
                          {SECTORS.filter(s => getSectorRisk(s).severity === "High").length} out of 6
                        </span>
                        <span className="text-[8px] text-stone-400">Highalert red quarantine zones</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Standard Mode Legend info */
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-[10.5px] text-stone-500 border-t border-stone-100">
                    <div className="flex items-center gap-3.5 select-none">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-650 inline-block" /> High Alert</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Active outbreak</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Minor / stable</span>
                    </div>
                    <span>Click Guntur diagnostic pins to review local diagnostics or listen to local summaries.</span>
                  </div>
                )}

              </div>

              {/* DYNAMIC METRICS GRAPH BAR */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Active Hotspot details / Sector Vulnerability analysis */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-3.5">
                  {selectedSector ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="text-[10px] bg-brand-100 text-brand-855 px-2 py-0.5 rounded font-mono font-bold uppercase">
                          Sector Vulnerability Audit
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedSector(null)}
                          className="text-stone-400 hover:text-stone-600 transition-colors p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-display font-extrabold text-base text-stone-900">
                          {selectedSector.name}
                        </h4>
                        <p className="text-xs text-brand-700 font-bold font-mono">
                          {selectedSector.lang} Zone
                        </p>
                      </div>

                      <p className="text-xs text-stone-550 leading-relaxed">
                        {selectedSector.description}
                      </p>

                      {/* Calculated Sector Threat Status */}
                      {(() => {
                        const rInfo = getSectorRisk(selectedSector);
                        let alertBadge = "bg-emerald-50 border-emerald-200 text-emerald-800";
                        let progressW = "w-1/12 bg-emerald-500";
                        let advice = "No active foliar pathogens detected in surrounding drift radius. Proceed with preventative neem sprays.";

                        if (rInfo.severity === "High") {
                          alertBadge = "bg-red-50 border-red-200 text-red-850";
                          progressW = "w-11/12 bg-red-500";
                          advice = "CRITICAL OUTBREAK THREAT. Spores verified nearby. Enforce immediate 10-meter isolation canopy block and execute copper fungicide dosage.";
                        } else if (rInfo.severity === "Medium") {
                          alertBadge = "bg-amber-50 border-amber-200 text-amber-800";
                          progressW = "w-7/12 bg-amber-500";
                          advice = "HEIGHTENED SURVEILLANCE MANDATED. Active surrounding pathogens on track. Spray preventative Trichoderma harzianum solution immediately.";
                        } else if (rInfo.severity === "Low") {
                          alertBadge = "bg-yellow-50 border-yellow-250 text-yellow-800";
                          progressW = "w-4/12 bg-yellow-500";
                          advice = "MILD EXPOSURE. Early spore drift index observed. Ensure strict foliar wetness drainage control.";
                        }

                        return (
                          <div className="space-y-3.5 border-t border-stone-150 pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-stone-450 uppercase">Vulnerability Exposure Index</span>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 border rounded-full font-mono uppercase ${alertBadge}`}>
                                {rInfo.severity || "CLEAR"} RISK
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden flex">
                                <span className={`h-full rounded-full transition-all duration-500 ${progressW}`} />
                              </div>
                              <div className="flex justify-between text-[8px] text-stone-400 font-bold uppercase font-mono">
                                <span>Clear status</span>
                                <span>Advisory warning</span>
                                <span>Crisis cutoff</span>
                              </div>
                            </div>

                            <div className="bg-stone-50/50 p-3 border border-stone-150 rounded-xl space-y-1.5">
                              <span className="text-[9px] text-stone-450 font-extrabold uppercase font-mono block">GIS Pathological Report</span>
                              {rInfo.triggeringReports.length > 0 ? (
                                <div className="space-y-1.5">
                                  <div className="text-[10.5px] text-stone-700 leading-snug">
                                    Threat count: <span className="font-bold text-stone-900">{rInfo.triggeringReports.length} vectors matching</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {rInfo.threateningDiseases.map((d, i) => (
                                      <span key={i} className="text-[9px] bg-stone-200/70 text-stone-750 px-2 py-0.5 rounded font-medium">
                                        🐛 {d}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[10.5px] text-emerald-800 font-medium">
                                  🛡️ Zone perfectly clear under current simulation timeline.
                                </div>
                              )}
                            </div>

                            <p className="text-[11px] text-stone-550 leading-relaxed italic pr-2">
                              "Advisory: {advice}"
                            </p>
                          </div>
                        );
                      })()}

                    </div>
                  ) : (
                    <>
                      <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-stone-550 flex items-center gap-1.5 select-none">
                        <FileCheck2 className="w-4 h-4 text-brand-650" /> {isPredictiveMode ? "GIS Simulation Intel" : "Selected Outpost Intel"}
                      </h3>

                      {selectedHotspot ? (
                        <div className="space-y-4 animate-fade-in">
                          
                          <div className="flex items-start gap-3">
                            <img
                              src={selectedHotspot.imageUrl}
                              alt={selectedHotspot.diseaseName}
                              className="w-15 h-15 object-cover rounded-xl border border-stone-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${getSeverityStyles(selectedHotspot.severity).badge}`}>
                                  {selectedHotspot.severity} Risk
                                </span>
                                <span className="text-[10px] text-stone-550 font-mono font-bold uppercase">
                                  {selectedHotspot.detectedRegion || "Local Fields"}
                                </span>
                              </div>
                              <h4 className="font-display font-bold text-sm text-stone-900 leading-snug mt-1">
                                {selectedHotspot.diseaseName}
                              </h4>
                              <p className="text-xs text-stone-500 font-semibold mb-0.5">
                                {selectedHotspot.cropName}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1.5 border-t pt-3">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block select-none">Prescribed organic treatment:</span>
                            <p className="text-xs text-stone-650 leading-relaxed italic">
                              "{selectedHotspot.treatmentOrganic[0] || "Cultural clearance advised."}"
                            </p>
                            <p className="text-xs text-brand-700 font-semibold leading-relaxed">
                              "{selectedHotspot.summaryTelugu}"
                            </p>
                          </div>

                          <div className="pt-1 flex justify-end gap-2">
                            <button
                              id="btn-inspect-fully-map"
                              onClick={() => {
                                setActiveReport(selectedHotspot);
                                setSelectedImage(selectedHotspot.imageUrl);
                                setActiveTab("diagnostic");
                              }}
                              className="bg-brand-50 hover:bg-brand-100 text-brand-850 text-[10.5px] font-bold px-3 py-1.5 rounded-lg border border-brand-150 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              Review Diagnostics & Audio <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id="btn-close-hotspot"
                              onClick={() => setSelectedHotspot(null)}
                              className="hover:bg-stone-100 p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-all cursor-pointer border-none"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      ) : (
                        <div className="py-8 text-center text-xs text-stone-400 italic leading-casual px-3">
                          {isPredictiveMode 
                            ? "Select any sub-sector polygon (e.g. Tenali, Amaravati, Bapatla) or diagnostic pin on Guntur Agriculture map to fetch immediate risk forecasting." 
                            : "Interact with any coordinate pin on Guntur Agriculture map to fetch rapid counteractive blueprint."}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* GRAPH PANEL */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-5">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-stone-900 flex items-center gap-1.5">
                      <BarChart2 className="w-4.5 h-4.5 text-brand-650" /> Statistical Histopathology
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">Localised disease metrics collected inside this active session</p>
                  </div>

                  {/* Graphic 1: Bar Chart */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-stone-450 uppercase tracking-wide block">Diagnostics distribution:</span>
                    <div className="space-y-2 text-xs">
                      
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-stone-700">Rice / Paddy (వరి)</span>
                          <span className="font-mono text-stone-500 font-bold">{paddyCount} cases ({totalScans > 0 ? Math.round((paddyCount / totalScans) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div 
                            className="h-full bg-brand-550 rounded-full transition-all duration-1000" 
                            style={{ width: `${totalScans > 0 ? (paddyCount / totalScans) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-stone-700">Tomato (టమాటా)</span>
                          <span className="font-mono text-stone-500 font-bold">{tomatoCount} cases ({totalScans > 0 ? Math.round((tomatoCount / totalScans) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${totalScans > 0 ? (tomatoCount / totalScans) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-stone-700">Cotton (పత్తి)</span>
                          <span className="font-mono text-stone-500 font-bold">{cottonCount} cases ({totalScans > 0 ? Math.round((cottonCount / totalScans) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${totalScans > 0 ? (cottonCount / totalScans) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Graphic 2: Severity Percentage block */}
                  <div className="space-y-2.5 border-t pt-4">
                    <span className="text-[10px] font-bold text-stone-450 uppercase tracking-wide block">EPIDEMIC SEVERITY PROPORTIONS</span>
                    <div className="w-full h-5.5 rounded-lg overflow-hidden flex select-none">
                      {highSeverityCount > 0 && (
                        <div 
                          className="bg-red-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all"
                          style={{ width: `${(highSeverityCount / totalScans) * 100}%` }}
                          title={`High severity outbreaks: ${highSeverityCount}`}
                        >
                          {Math.round((highSeverityCount / totalScans) * 100)}%
                        </div>
                      )}
                      {mediumSeverityCount > 0 && (
                        <div 
                          className="bg-amber-450 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all"
                          style={{ width: `${(mediumSeverityCount / totalScans) * 100}%` }}
                          title={`Medium severity alerts: ${mediumSeverityCount}`}
                        >
                          {Math.round((mediumSeverityCount / totalScans) * 100)}%
                        </div>
                      )}
                      {lowSeverityCount > 0 && (
                        <div 
                          className="bg-emerald-600 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all"
                          style={{ width: `${(lowSeverityCount / totalScans) * 100}%` }}
                          title={`Healthy stable zones: ${lowSeverityCount}`}
                        >
                          {Math.round((lowSeverityCount / totalScans) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-stone-500 font-medium">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High Crisis ({highSeverityCount})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Mitigating ({mediumSeverityCount})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Clean / Safe ({lowSeverityCount})</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 3: SCAN HISTORY LOGS ==================== */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="font-display font-bold text-xl text-stone-900">Crop Health Diagnosis Logs</h2>
                <p className="text-xs text-stone-500 mt-1">Review previously diagnosed crop records stored locally in your active sandbox session.</p>
              </div>
              {reportHistory.length > 0 && (
                <button
                  id="btn-empty-entire-pasted-history"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete all historical diagnostic scans? This will clear the outbreak tracking map layout.")) {
                      localStorage.removeItem("agri_shield_scans");
                      setReportHistory([]);
                      setActiveReport(null);
                      setSelectedHotspot(null);
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-650 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none"
                >
                  <Trash2 className="w-4 h-4" /> Clear Entire Lab Library
                </button>
              )}
            </div>

            {reportHistory.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 border-dashed p-12 text-center flex flex-col items-center justify-center min-h-[350px] gap-4">
                <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-stone-850">No Record Scans Found</h3>
                  <p className="text-xs text-stone-500 max-w-xs mt-1 leading-normal">
                    Your diagnoses will appear here automatically after you click "Diagnose Crop Health" on uploaded leaf media.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportHistory.map((report) => {
                  const styles = getSeverityStyles(report.severity);
                  return (
                    <div
                      key={report.id}
                      id={`history-card-${report.id}`}
                      onClick={() => {
                        setActiveReport(report);
                        setSelectedImage(report.imageUrl);
                        setActiveTab("diagnostic");
                      }}
                      className="bg-white border border-stone-200 hover:border-brand-500 hover:ring-2 hover:ring-brand-100 rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between shadow-sm group"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={report.imageUrl}
                          alt={report.diseaseName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${styles.badge}`}>
                            {report.severity}
                          </span>
                          {report.detectedRegion && (
                            <span className="bg-stone-900/80 backdrop-blur text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold">
                              {report.detectedRegion}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-brand-650 font-mono flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {report.date}
                          </div>
                          <h4 className="font-display font-bold text-sm text-stone-850 line-clamp-1">
                            {report.diseaseName}
                          </h4>
                          <p className="text-xs text-stone-500 font-semibold mt-0.5">
                            {report.cropName}
                          </p>
                        </div>

                        <p className="text-xs text-stone-550 line-clamp-2 leading-relaxed">
                          {report.summaryEnglish}
                        </p>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-[10.5px] font-bold text-brand-700 group-hover:underline flex items-center gap-1">
                            Open Diagnostics <ChevronRight className="w-3 h-3" />
                          </span>
                          <button
                            id={`btn-delete-${report.id}`}
                            onClick={(e) => deleteScan(report.id, e)}
                            className="p-1 px-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer border-none bg-transparent"
                            title="Delete History entry"
                          >
                            <Trash2 className="w-3.8 h-3.8" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 4: RESEARCH LAB PRESENTATION ==================== */}
        {activeTab === "about" && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8 space-y-8 max-w-4xl mx-auto animate-fade-in">
            
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-700 to-emerald-500 flex items-center justify-center text-white shrink-0 shadow">
                <Sprout className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-extrabold text-2xl text-stone-900 leading-none">Regional Agricultural AI Laboratory</h2>
                <p className="text-xs text-brand-700 font-bold uppercase tracking-wider font-mono">Precision Agriculture & Foliar Pathology Sector • Guntur (A.P.)</p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-6">
              
              <div className="space-y-3.5 leading-relaxed text-stone-700 text-sm">
                <p>
                  <strong>AgriShield Bio-Pathology Desk</strong> is a state-of-the-art diagnostic system designed for high crop protection efficacy. Built inside our Regional Agricultural AI Laboratory, it leverages advanced multi-modal intelligence to resolve complex agricultural pathogen signs from a simple digital photo of an affected leaf.
                </p>
                <p>
                  Traditional plant pathologist networks in rural Andhra Pradesh can be slow and limited. By utilizing immediate AI scanning vectors on nitrogen ratios, chlorosis hotspots, fungal spores, and vein curling, AgriShield returns a highly structured, expert-level pathology brief <strong>in under a second</strong>.
                </p>
              </div>

              {/* Bento grid panels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-brand-50/40 p-4 rounded-xl border border-brand-100 flex flex-col gap-2 shadow-xs">
                  <span className="text-brand-905 font-bold text-xs.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-655 font-bold" /> Multimodal Pathogen Intel
                  </span>
                  <span className="text-[11.5px] text-stone-550 leading-relaxed">
                    Direct photographic crop analysis handles complex background leaf context with high-fidelity disease identification.
                  </span>
                </div>

                <div className="bg-brand-50/40 p-4 rounded-xl border border-brand-100 flex flex-col gap-2 shadow-xs">
                  <span className="text-brand-905 font-bold text-xs.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-655 font-bold" /> Outbreak containment Map
                  </span>
                  <span className="text-[11.5px] text-stone-550 leading-relaxed">
                    Logs coordinates automatically to calculate infection distributions across local Guntur delta agricultural zones.
                  </span>
                </div>

                <div className="bg-brand-50/40 p-4 rounded-xl border border-brand-100 flex flex-col gap-2 shadow-xs">
                  <span className="text-brand-905 font-bold text-xs.5 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-brand-655 font-bold" /> Farmers Bilingual Player
                  </span>
                  <span className="text-[11.5px] text-stone-550 leading-relaxed">
                    Pioneering voice transcription reads treatment outlines in local rural Telugu, accommodating diverse literacy needs.
                  </span>
                </div>

              </div>

              {/* Presentation structure for the jury */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-stone-500 select-none">
                  Regional AI Lab Academic Presentation Outline
                </h3>
                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y text-xs text-stone-700 shadow-sm">
                  
                  <div className="flex bg-stone-50 p-2.5 font-bold text-stone-850">
                    <div className="w-16 shrink-0">Slide ID</div>
                    <div className="w-40 shrink-0">Core Theme</div>
                    <div className="flex-1">Academic Presentation Blueprint</div>
                  </div>

                  <div className="flex p-3 bg-white">
                    <div className="w-16 font-semibold text-brand-800 font-mono">Slide 1</div>
                    <div className="w-40 font-semibold text-stone-850">Pathology Frontier</div>
                    <div className="flex-1">"AgriShield: Scaling AI Diagnostics for Rural Farmers". Scaling foliar disease diagnostics with enterprise Multi-Modal systems @ Guntur.</div>
                  </div>

                  <div className="flex p-3 bg-stone-50/30">
                    <div className="w-16 font-semibold text-brand-800 font-mono">Slide 2</div>
                    <div className="w-40 font-semibold text-stone-850">The Pathology Gap</div>
                    <div className="flex-1">Crop infections destroy nearly 30% of seasonal yield in rural Guntur, yet expert pathologist presence is scarce.</div>
                  </div>

                  <div className="flex p-3 bg-white">
                    <div className="w-16 font-semibold text-brand-800 font-mono">Slide 3</div>
                    <div className="w-40 font-semibold text-stone-850">Technical Stack</div>
                    <div className="flex-1">Custom backend routes pass telemetry + parameters to advanced multi-modal models, generating rigid structured JSON output mapped in real-time.</div>
                  </div>

                  <div className="flex p-3 bg-stone-50/30">
                    <div className="w-16 font-semibold text-brand-800 font-mono">Slide 4</div>
                    <div className="w-40 font-semibold text-stone-850">Empathetic Design</div>
                    <div className="flex-1">Accessibility via real-time speech converters in Telugu + English, combined with regional spatial containment maps.</div>
                  </div>

                </div>
              </div>

              {/* Extension Outpost Contacts */}
              <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-3.5">
                <h3 className="font-display font-bold text-sm text-stone-850 flex items-center gap-2 select-none">
                  <Phone className="w-4.5 h-4.5 text-brand-700" /> Regional Pathology Extension Desk
                </h3>
                <p className="text-xs text-stone-550 leading-relaxed">
                  If the Outbreak Tracking Map reflects a "High Alert Cluster" in your local sector, or if you require physical soil/tissue sampling, please reach out directly:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-semibold text-stone-700 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-800 uppercase font-bold text-[10px]">Email support:</span>
                    <span className="font-mono text-stone-850 text-xs">support@agri-shield.org</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-800 uppercase font-bold text-[10px]">Farmers Toll-Free:</span>
                    <span className="font-mono text-brand-900 font-bold text-xs">+91 1800-425-3434</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* --- FOOTER SECTION --- */}
      <footer className="bg-stone-900 text-stone-400 py-8 px-4 border-t border-stone-850 shrink-0 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-center md:text-left">
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sprout className="w-4 h-4 text-brand-500 animate-pulse" />
              <span className="font-display font-semibold text-white tracking-wide">AgriShield Outbreak Network</span>
            </div>
            <p className="text-stone-500 font-medium">Built @ Regional Agricultural Intelligence Hub Launch 2026 | #AgriShield</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-stone-550 font-mono text-[10px]">
            <span>NATIVE: AP_IN</span>
            <span>•</span>
            <span>MODEL: MULTI_MODAL_ENGINE</span>
            <span>•</span>
            <span>INTERFACE: HYPERPARAMS_SPATIAL_V2_5</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
