import { useEffect, useState } from "react";
import { verifyLocation } from "../../api/location";
import { MapPin, TrendingUp, Crosshair, Loader2 } from "lucide-react";

interface Props {
  latitude: number;
  longitude: number;
}

export function LocationCard({ latitude, longitude }: Props) {
  const [location, setLocation] = useState<string>("—");
  const [altitude, setAltitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<string>("—");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!latitude || !longitude) return;

    setLoading(true);

    verifyLocation(latitude, longitude)
      .then((data) => {
        console.log("Fetching for:", latitude, longitude);
        setLocation(data.city);
        setAltitude(data.altitude);
        setAccuracy(data.accuracy);
      })
      .catch(() => {
        setLocation("Unknown");
        setAccuracy("Low");
      })
      .finally(() => setLoading(false));
  }, [latitude, longitude]);

  return (
    <div className="rounded-lg border border-cyan-500/30 p-4 bg-[#0f1729]/50 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="size-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Location Intelligence</h3>
      </div>

      {/* OpenStreetMap Embed */}
      <div className="mb-4 rounded-lg overflow-hidden border border-cyan-500/20">
        <iframe
          title="Location map"
          width="100%"
          height="150"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`}
        />
        <div className="px-3 py-2 bg-[#0a0f1a] border-t border-cyan-500/20">
          <p className="text-xs text-gray-400 font-mono">
            {latitude.toFixed(4)}° N, {Math.abs(longitude).toFixed(4)}° {longitude >= 0 ? 'E' : 'W'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 text-cyan-400 animate-spin" />
          <p className="text-sm text-cyan-300">Updating location...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-cyan-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
              <p className="text-sm text-gray-200">{location}</p>
            </div>
          </div>

          {/* Altitude */}
          <div className="flex items-start gap-2">
            <TrendingUp className="size-4 text-green-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Altitude</p>
              <p className="text-sm text-gray-200">{altitude ?? "—"} meters</p>
            </div>
          </div>

          {/* Accuracy */}
          <div className="flex items-start gap-2">
            <Crosshair className="size-4 text-blue-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Accuracy</p>
              <p className="text-sm text-blue-300">{accuracy}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

