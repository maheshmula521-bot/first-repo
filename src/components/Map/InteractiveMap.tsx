import React, { useState, useRef, useEffect } from 'react';
import { Station } from '../../types/ev';
import { 
  Zap, 
  Navigation, 
  Layers, 
  Plus, 
  Minus, 
  RotateCcw, 
  Radio, 
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin
} from 'lucide-react';

interface InteractiveMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  activeRoutePolyline?: { start: [number, number]; end: [number, number]; waypoints: [number, number][] } | null;
  userSoCRangeMiles?: number;
  currentCityName?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  activeRoutePolyline,
  userSoCRangeMiles = 220,
  currentCityName = 'San Francisco Bay Area',
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapTheme, setMapTheme] = useState<'neon' | 'satellite' | 'slate'>('neon');
  const [showRangeBubble, setShowRangeBubble] = useState(true);
  const [radarScanning, setRadarScanning] = useState(false);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Center bounding box for SF/Bay Area default view or relative positioning
  // We project lat/lng dynamically into an SVG 1000x650 viewport
  // Bounds around Bay Area / California
  const centerLat = 37.7749;
  const centerLng = -122.4194;

  const projectToSvg = (lat: number, lng: number) => {
    // Mercator-like projection relative to center
    const scaleX = 400;
    const scaleY = 550;
    const x = 500 + (lng - centerLng) * scaleX;
    const y = 325 - (lat - centerLat) * scaleY;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const triggerRadarScan = () => {
    setRadarScanning(true);
    setTimeout(() => setRadarScanning(false), 4000);
  };

  const userSvgPos = projectToSvg(centerLat, centerLng);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-slate-800 bg-[#070b14] select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="region"
      aria-label="Interactive EV Charging Map"
    >
      {/* Map Controls Floating Header */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 flex-wrap max-w-[55%]">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-900/90 border border-slate-800 backdrop-blur-md">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono text-slate-300 uppercase">Grid</span>
          <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
            {stations.filter(s => s.stallsAvailable > 0).length} Open
          </span>
        </div>

        <button
          onClick={triggerRadarScan}
          aria-label="Radar scan nearby chargers"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-400 transition-colors"
        >
          <Radio className={`w-3 h-3 ${radarScanning ? 'animate-spin text-cyan-300' : ''}`} />
          <span>{radarScanning ? 'Scanning...' : 'Radar'}</span>
        </button>

        <button
          onClick={() => setShowRangeBubble(!showRangeBubble)}
          aria-label="Toggle battery range radius ring"
          className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[11px] font-mono transition-colors ${
            showRangeBubble 
              ? 'bg-slate-800 border-cyan-500/60 text-cyan-300' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Range Ring</span>
        </button>
      </div>

      {/* Map Zoom & Style Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
        {/* Style Selector */}
        <div className="flex items-center p-0.5 rounded-md bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setMapTheme('neon')}
            className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
              mapTheme === 'neon' ? 'bg-slate-800 text-cyan-300 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setMapTheme('satellite')}
            className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
              mapTheme === 'satellite' ? 'bg-slate-800 text-emerald-300 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapTheme('slate')}
            className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
              mapTheme === 'slate' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Slate
          </button>
        </div>

        {/* Zoom In/Out/Reset */}
        <div className="flex flex-col gap-0.5 p-0.5 rounded-md bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.3, 3))}
            aria-label="Zoom in"
            className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.3, 0.7))}
            aria-label="Zoom out"
            className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            aria-label="Reset map view"
            className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>



      {/* SVG Canvas Map Surface */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox="0 0 1000 650"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Neon Grid Pattern */}
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={mapTheme === 'satellite' ? '#0f3a2c' : mapTheme === 'slate' ? '#1e293b' : '#0c2238'}
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
          </pattern>

          {/* Radar Radial Gradient */}
          <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>

          {/* Glow Filters */}
          <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Map Background Layer */}
        <rect
          width="1000"
          height="650"
          fill={mapTheme === 'satellite' ? '#071612' : mapTheme === 'slate' ? '#0b111e' : '#040814'}
        />
        <rect width="1000" height="650" fill="url(#gridPattern)" />

        {/* Transformed Content Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: '500px 325px' }}>
          {/* Simulated Coastline / Geographic Bay Contour */}
          <path
            d="M 120 40 C 240 120 310 180 340 260 C 370 340 330 420 300 480 C 270 540 200 600 150 640 L 40 640 L 40 40 Z"
            fill={mapTheme === 'satellite' ? '#0a221a' : mapTheme === 'slate' ? '#0f172a' : '#091529'}
            stroke={mapTheme === 'satellite' ? '#134e4a' : '#1e3a5f'}
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Bay Area Water / Shoreline Feature */}
          <path
            d="M 380 20 C 430 80 470 140 460 210 C 450 280 410 320 430 380 C 450 440 520 480 540 550 C 560 620 520 650 510 650 L 700 650 L 700 20 Z"
            fill={mapTheme === 'satellite' ? '#081e17' : mapTheme === 'slate' ? '#0d1527' : '#061022'}
            stroke={mapTheme === 'satellite' ? '#14532d' : '#1d3557'}
            strokeWidth="1.2"
          />

          {/* Stylized Highway Corridors (US-101, I-80, I-280, CA-85) */}
          <g stroke={mapTheme === 'satellite' ? '#1e3a2e' : '#1e293b'} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7">
            {/* Highway 101 */}
            <path d="M 280 60 Q 380 220 440 340 T 560 600" />
            {/* Interstate 80 */}
            <path d="M 380 220 Q 520 180 680 120 T 920 70" />
            {/* Highway 280 */}
            <path d="M 320 200 Q 360 380 480 560" />
            {/* East Bay Corridor */}
            <path d="M 520 120 Q 550 260 590 420 T 640 620" />
          </g>

          {/* Route Polyline if Trip Planned */}
          {activeRoutePolyline && (
            <g>
              <polyline
                points={`${activeRoutePolyline.start[0]},${activeRoutePolyline.start[1]} ${activeRoutePolyline.waypoints.map(w => `${w[0]},${w[1]}`).join(' ')} ${activeRoutePolyline.end[0]},${activeRoutePolyline.end[1]}`}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="4"
                strokeDasharray="8 4"
                strokeLinecap="round"
                opacity="0.9"
                filter="url(#neonGlow)"
              />
              <circle
                cx={activeRoutePolyline.start[0]}
                cy={activeRoutePolyline.start[1]}
                r="6"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle
                cx={activeRoutePolyline.end[0]}
                cy={activeRoutePolyline.end[1]}
                r="6"
                fill="#ec4899"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Current User Location & Range Bubble */}
          <g transform={`translate(${userSvgPos.x}, ${userSvgPos.y})`}>
            {showRangeBubble && (
              <>
                {/* 150mi inner circle */}
                <circle
                  r="110"
                  fill="#06b6d4"
                  fillOpacity="0.04"
                  stroke="#06b6d4"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                {/* Max Range outer circle */}
                <circle
                  r="160"
                  fill="#10b981"
                  fillOpacity="0.02"
                  stroke="#10b981"
                  strokeWidth="1.2"
                  strokeDasharray="6 4"
                  opacity="0.5"
                />
              </>
            )}

            {/* Radar Sweep Effect */}
            {radarScanning && (
              <circle
                r="180"
                fill="url(#radarSweepGrad)"
                className="animate-radar origin-center"
              />
            )}

            {/* User Pin Pulse */}
            <circle r="16" fill="#06b6d4" fillOpacity="0.2" className="animate-ping" />
            <circle r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="2.5" />
            <text y="-14" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
              YOUR EV
            </text>
          </g>

          {/* Charging Stations Pins */}
          {stations.map((st) => {
            const { x, y } = projectToSvg(st.lat, st.lng);
            const isSelected = selectedStation?.id === st.id;
            const isHovered = hoveredStation?.id === st.id;
            const isAvailable = st.stallsAvailable > 0;
            const isFull = st.stallsAvailable === 0;

            const pinColor = isAvailable 
              ? (st.powerMaxKw >= 250 ? '#10b981' : '#06b6d4') 
              : isFull 
              ? '#ef4444' 
              : '#f59e0b';

            return (
              <g
                key={st.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStation(st);
                }}
                onMouseEnter={() => setHoveredStation(st)}
                onMouseLeave={() => setHoveredStation(null)}
                role="button"
                tabIndex={0}
                aria-label={`${st.name}, ${st.stallsAvailable} of ${st.stallsTotal} stalls available, ${st.powerMaxKw} kilowatt`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectStation(st);
                  }
                }}
              >
                {/* Selection or Hover Highlight Aura */}
                {(isSelected || isHovered) && (
                  <circle
                    r="26"
                    fill={pinColor}
                    fillOpacity="0.25"
                    className="animate-pulse"
                  />
                )}

                {/* Available Pulse Ring */}
                {isAvailable && (
                  <circle
                    r="15"
                    fill="none"
                    stroke={pinColor}
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                    className="animate-ping"
                  />
                )}

                {/* Outer Marker Shell */}
                <circle
                  r={isSelected ? '15' : '12'}
                  fill={isSelected ? pinColor : '#0f172a'}
                  stroke={pinColor}
                  strokeWidth={isSelected ? '3' : '2'}
                  filter="url(#neonGlow)"
                />

                {/* Inner Power Lightning Bolt Icon */}
                <path
                  d="M -2 -5 L 1 -1 L -1 0 L 2 5 L -1 1 L 1 0 Z"
                  fill={isSelected ? '#050811' : pinColor}
                  transform="scale(1.2)"
                />

                {/* Availability Badge Bubble */}
                <g transform="translate(10, -10)">
                  <rect
                    x="-2"
                    y="-8"
                    width="20"
                    height="12"
                    rx="6"
                    fill={isAvailable ? '#064e3b' : '#7f1d1d'}
                    stroke={isAvailable ? '#10b981' : '#f87171'}
                    strokeWidth="1"
                  />
                  <text
                    x="8"
                    y="1"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {st.stallsAvailable}
                  </text>
                </g>

                {/* Station Label Text (shown on select or hover) */}
                {(isSelected || isHovered) && (
                  <g transform="translate(0, 24)">
                    <rect
                      x="-70"
                      y="0"
                      width="140"
                      height="24"
                      rx="6"
                      fill="#0b1329"
                      stroke={pinColor}
                      strokeWidth="1"
                      fillOpacity="0.95"
                    />
                    <text
                      x="0"
                      y="15"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {st.name.length > 20 ? st.name.slice(0, 18) + '…' : st.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Selected Station Quick Card Overlay */}
      {selectedStation && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-30 p-3.5 rounded-lg bg-slate-900 border border-slate-700 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedStation.network}
                </span>
                {selectedStation.isRenewable && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    Clean Grid
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-100 text-sm leading-snug">{selectedStation.name}</h3>
              <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                {selectedStation.address}, {selectedStation.city} • <span className="text-slate-300">{selectedStation.distanceMiles} mi</span>
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-bold font-mono text-slate-100">${selectedStation.pricePerKwh.toFixed(2)}/kWh</div>
              <div className="text-[11px] text-cyan-400 font-mono mt-0.5 font-medium">{selectedStation.powerMaxKw} kW</div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-2.5 p-2 rounded bg-slate-950 border border-slate-800 font-mono text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Stalls</div>
              <div className="text-xs font-bold text-emerald-400">
                {selectedStation.stallsAvailable}/{selectedStation.stallsTotal} Open
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Queue</div>
              <div className="text-xs font-semibold text-slate-300">
                {selectedStation.averageWaitMins === 0 ? 'Zero' : `~${selectedStation.averageWaitMins}m`}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Output</div>
              <div className="text-xs font-bold text-cyan-400">
                {selectedStation.actualVsAdvertisedSpeedPercent}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800">
            <button
              onClick={() => onSelectStation(selectedStation)}
              className="flex-1 py-1.5 px-3 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors text-center flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Reserve Stall</span>
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Open Directions in GPS"
              aria-label="Open directions to station in Google Maps"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>
        </div>
      )}

      {/* Map Legend Footer */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Busy/Queue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
          <span>⚡ 250-350kW Ultra</span>
        </div>
      </div>
    </div>
  );
};
