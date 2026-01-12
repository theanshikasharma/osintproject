import { useState } from "react";
import { Upload, Shield, FileText, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { ImageUploadZone } from "./components/ImageUploadZone";
import { ProcessingSteps } from "./components/ProcessingSteps";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { extractGPSFromImage } from "./utils/gpsExtractor";

interface HumanDetectionResult {
  humanDetected: boolean;
  humanCount: number;
  confidence: number;
}

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [extractedGps, setExtractedGps] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>("");
  const [humanDetection, setHumanDetection] = useState<HumanDetectionResult | null>(null);

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      setUploadedImage(e.target?.result as string);
      setIsProcessing(true);
      setShowResults(false);
      setLatitude(null);
      setLongitude(null);
      setHumanDetection(null);
      setGpsStatus("Extracting GPS data from image...");
      
      // Extract GPS coordinates from image EXIF metadata
      const gps = await extractGPSFromImage(file);
      
      // THIS MUST RUN - set GPS coordinates immediately
      if (gps) {
        setLatitude(gps.latitude);
        setLongitude(gps.longitude);
        setExtractedGps({ latitude: gps.latitude, longitude: gps.longitude });
      } else {
        // Fallback to default if no GPS found
        setLatitude(28.6139);
        setLongitude(77.2090);
        setExtractedGps(null);
      }
      
      // Call human detection API
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("http://localhost:8000/analyze/human-detection", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        console.log("Human Detection API Response:", data);
        setHumanDetection(data);
      } catch (err) {
        console.error("Human detection failed:", err);
      }
      
      // Simulate other processing steps
      setTimeout(() => {
        setGpsStatus(gps ? "GPS extracted - Analyzing image metadata..." : "No GPS data - Analyzing image metadata...");
      }, 1000);
      
      setTimeout(() => {
        setGpsStatus("Running OCR analysis...");
      }, 2000);
      
      setTimeout(() => {
        setGpsStatus("Checking web presence...");
      }, 3000);
      
      setTimeout(() => {
        setGpsStatus("Detecting manipulations...");
      }, 4000);
      
      setTimeout(() => {
        setIsProcessing(false);
        setShowResults(true);
        setGpsStatus(gps ? "✓ GPS coordinates extracted from image EXIF" : "⚠ No GPS data found in image - using default location");
      }, 5000);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setIsProcessing(false);
    setShowResults(false);
    setExtractedGps(null);
    setLatitude(null);
    setLongitude(null);
    setHumanDetection(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1729] to-[#1a1f3a] text-white">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-[#0a0e1a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
              <Shield className="size-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">OSINT Vision</h1>
              <p className="text-xs text-cyan-400">Image-Based Cyber Threat Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-md">
              <p className="text-xs text-cyan-300">Status: <span className="text-green-400">Active</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {!uploadedImage && !isProcessing && !showResults && (
          <ImageUploadZone onImageUpload={handleImageUpload} />
        )}

        {isProcessing && (
          <ProcessingSteps uploadedImage={uploadedImage} gpsStatus={gpsStatus} />
        )}

        {showResults && uploadedImage && (
          <ResultsDashboard 
            uploadedImage={uploadedImage} 
            onReset={handleReset}
            latitude={latitude}
            longitude={longitude}
            humanDetection={humanDetection}
          />
        )}
      </main>
    </div>
  );
}
