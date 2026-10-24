import React, { useState } from 'react';
import { CommunityPost, Station } from '../../types/ev';
import { 
  Activity, 
  Gauge, 
  Send, 
  ShieldCheck, 
  Clock, 
  Server, 
  CheckCircle, 
  AlertTriangle,
  Sliders,
  Filter
} from 'lucide-react';

interface CommunityViewProps {
  posts: CommunityPost[];
  stations: Station[];
  onAddPost: (post: CommunityPost) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  stations,
  onAddPost,
}) => {
  const [selectedStationId, setSelectedStationId] = useState(stations[0]?.id || '');
  const [speedTestKw, setSpeedTestKw] = useState<string>('');
  const [logNotes, setLogNotes] = useState('');
  const [tagSelection, setTagSelection] = useState('Benchmark');

  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  const handleSubmitDiagnostic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logNotes.trim() && !speedTestKw) return;

    const newPost: CommunityPost = {
      id: `diag-${Date.now()}`,
      authorName: 'Local Diagnostic Client',
      authorAvatar: '',
      authorBadge: 'Hardware Report',
      stationId: selectedStation.id,
      stationName: selectedStation.name,
      city: selectedStation.city,
      rating: 5,
      speedReportKw: speedTestKw ? Number(speedTestKw) : undefined,
      advertisedSpeedKw: selectedStation.powerMaxKw,
      comment: logNotes.trim() || `Measured peak power output: ${speedTestKw} kW. Connector handshake completed with zero communication faults.`,
      upvotes: 1,
      userUpvoted: true,
      timestamp: 'Just now',
      verifiedCharge: true,
      tags: [tagSelection, speedTestKw ? 'Power Verified' : 'Field Log'],
    };

    onAddPost(newPost);
    setLogNotes('');
    setSpeedTestKw('');
  };

  return (
    <div className="w-full space-y-5">
      {/* Top Banner */}
      <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>OCPP & Hardware Telemetry Feed</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Dispenser Diagnostics & Speed Benchmark Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective field reports: actual delivered kilowatts (kW) versus rated capacity, hardware maintenance events, and connection reliability.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" />
            <span>Node Status: Nominal</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Telemetry Feed */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1 border-b border-slate-800">
            <span>Recent Dispenser Verification Entries ({posts.length})</span>
            <span>Real-time Stream</span>
          </div>

          <div className="space-y-2.5">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{post.stationName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                        {post.authorBadge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {post.city} • Logged {post.timestamp}
                    </div>
                  </div>

                  {post.verifiedCharge && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      Hardware Validated
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {post.comment}
                </p>

                {post.speedReportKw && (
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Benchmarked Output: <strong className="text-cyan-400">{post.speedReportKw} kW</strong></span>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      Rated {post.advertisedSpeedKw} kW ({Math.round((post.speedReportKw / (post.advertisedSpeedKw || 1)) * 100)}% delivery)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 pt-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Telemetry / Speed Benchmark Form */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 font-mono">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-slate-200 uppercase">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Submit Dispenser Benchmark</span>
          </div>

          <form onSubmit={handleSubmitDiagnostic} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Station</label>
              <select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-slate-700 cursor-pointer"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Measured Peak Power (kW)
              </label>
              <div className="relative">
                <Gauge className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400" />
                <input
                  type="number"
                  placeholder="e.g. 248"
                  value={speedTestKw}
                  onChange={(e) => setSpeedTestKw(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Category Classification</label>
              <select
                value={tagSelection}
                onChange={(e) => setTagSelection(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
              >
                <option value="Benchmark">Benchmark</option>
                <option value="Thermal Check">Thermal Check</option>
                <option value="Connector Check">Connector Check</option>
                <option value="Grid Telemetry">Grid Telemetry</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Hardware Diagnostic Notes</label>
              <textarea
                rows={3}
                placeholder="Log physical dispenser status, cable cooling performance, or connector latching..."
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-slate-700 resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={!logNotes.trim() && !speedTestKw}
              className="w-full py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Record Telemetry Entry</span>
            </button>
          </form>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-400">OCPP Protocol Rules:</div>
            <div>• Measured kW entries update rolling site efficiency scores.</div>
            <div>• Automated anomaly detection triggers alerts if delivered power drops below 70% nameplate.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
