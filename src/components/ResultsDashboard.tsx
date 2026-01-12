import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { RiskScoreCard } from "./analysis/RiskScoreCard";
import { MetadataCard } from "./analysis/MetadataCard";
import { LocationCard } from "./analysis/LocationCard";
import { HumanDetectionCard } from "./analysis/HumanDetectionCard";
import { WebPresenceCard } from "./analysis/WebPresenceCard";
import { ManipulationCard } from "./analysis/ManipulationCard";
import { OcrAnalysisCard } from "./analysis/OcrAnalysisCard";
import { ExportReportCard } from "./analysis/ExportReportCard";

interface ResultsDashboardProps {
  uploadedImage: string;
  onReset: () => void;
  latitude: number | null;
  longitude: number | null;
  humanDetection: {
    humanDetected: boolean;
    humanCount: number;
    confidence: number;
  } | null;
}

export function ResultsDashboard({ uploadedImage, onReset, latitude, longitude, humanDetection }: ResultsDashboardProps) {
  // Use latitude/longitude or fallback to default (Delhi)
  const lat = latitude ?? 28.6139;
  const lon = longitude ?? 77.2090;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onReset}
          variant="outline"
          className="bg-[#0f1729]/50 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400"
        >
          <ArrowLeft className="size-4 mr-2" />
          New Analysis
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">✓ Analysis Complete</p>
          </div>
        </div>
      </div>

      {/* Image Preview */}
      <div className="rounded-xl overflow-hidden border border-cyan-500/30 bg-[#0f1729]/50 backdrop-blur-sm shadow-[0_0_30px_rgba(34,211,238,0.1)]">
        <div className="aspect-video w-full flex items-center justify-center bg-[#0a0e1a]/50">
          <img 
            src={uploadedImage} 
            alt="Analyzed image for OSINT analysis" 
            className="max-w-full max-h-[400px] object-contain"
          />
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score - Full Width on Mobile */}
        <div className="lg:col-span-3">
          <RiskScoreCard />
        </div>

        {/* Export Report - Full Width */}
        <div className="lg:col-span-3">
          <ExportReportCard />
        </div>

        {/* Metadata & Forensics */}
        <div className="lg:col-span-1">
          <MetadataCard />
        </div>

        {/* Location Intelligence */}
        <div className="lg:col-span-1">
          <LocationCard 
            latitude={lat}
            longitude={lon}
          />
        </div>

        {/* Human Detection */}
        <div className="lg:col-span-1">
          <HumanDetectionCard humanDetection={humanDetection} />
        </div>

        {/* OCR & Text Analysis - Full Width */}
        <div className="lg:col-span-3">
          <OcrAnalysisCard />
        </div>

        {/* Web Presence */}
        <div className="lg:col-span-2">
          <WebPresenceCard />
        </div>

        {/* Manipulation Analysis */}
        <div className="lg:col-span-1">
          <ManipulationCard />
        </div>
      </div>
    </div>
  );
}
