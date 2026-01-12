import { Users, CheckCircle2, Loader2 } from "lucide-react";

interface HumanDetectionResult {
  humanDetected: boolean;
  humanCount: number;
  confidence: number;
}

interface Props {
  humanDetection: HumanDetectionResult | null;
}

export function HumanDetectionCard({ humanDetection }: Props) {
  if (!humanDetection) {
    return (
      <div className="h-full p-6 rounded-xl bg-gradient-to-br from-[#0f1729]/50 to-[#1a1f3a]/50 border border-cyan-500/20 backdrop-blur-sm shadow-[0_0_20px_rgba(34,211,238,0.1)]">
        <div className="flex items-center gap-2 mb-6">
          <Users className="size-5 text-cyan-400" />
          <h3 className="font-semibold">Human vs Object Detection</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 text-cyan-400 animate-spin" />
          <span className="ml-3 text-gray-400">Analyzing image...</span>
        </div>
      </div>
    );
  }

  const { humanDetected, humanCount, confidence } = humanDetection;

  return (
    <div className="h-full p-6 rounded-xl bg-gradient-to-br from-[#0f1729]/50 to-[#1a1f3a]/50 border border-cyan-500/20 backdrop-blur-sm shadow-[0_0_20px_rgba(34,211,238,0.1)]">
      <div className="flex items-center gap-2 mb-6">
        <Users className="size-5 text-cyan-400" />
        <h3 className="font-semibold">Human vs Object Detection</h3>
      </div>

      <div className="space-y-4">
        <div className={`
          p-6 rounded-lg text-center
          ${humanDetected 
            ? "bg-green-500/10 border-2 border-green-500/30" 
            : "bg-blue-500/10 border-2 border-blue-500/30"
          }
        `}>
          <CheckCircle2 className={`
            size-12 mx-auto mb-3
            ${humanDetected ? "text-green-400" : "text-blue-400"}
          `} />
          <p className={`
            text-lg font-bold mb-1
            ${humanDetected ? "text-green-300" : "text-blue-300"}
          `}>
            {humanDetected ? "Human detected" : "No human detected – object-only image"}
          </p>
          <p className="text-sm text-gray-400">
            {humanDetected 
              ? "Face and body features identified" 
              : "Only objects and scenery detected"
            }
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <p className="text-xs text-gray-400 mb-1">Confidence</p>
            <p className="text-lg font-bold text-cyan-400">{(confidence * 100).toFixed(1)}%</p>
          </div>
          
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <p className="text-xs text-gray-400 mb-1">Detected</p>
            <p className="text-lg font-bold text-purple-400">
              {humanDetected ? `${humanCount} Humans` : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
