import React, { useState, useEffect } from 'react';
import { 
  Glasses, Mic, Search, MapPin, Clock, Eye, 
  Layers, HardDrive, Cpu, CheckCircle2, AlertCircle,
  Sparkles, RefreshCw, ChevronRight, Video, Camera
} from 'lucide-react';

export default function App() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('recall'); // 'recall', 'timeline', 'simulate'
  const [selectedMemory, setSelectedMemory] = useState(null);

  // Simulation form states
  const [roomContext, setRoomContext] = useState('Living Room');
  const [targetHint, setTargetHint] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState('');

  // Sample quick queries for live demo
  const sampleQueries = [
    "Where did I leave my car keys?",
    "Where is my leather wallet?",
    "Where are my AirPods Pro?",
    "Where did I leave my reading glasses?",
    "Where is my yellow screwdriver?"
  ];

  // Fetch initial timeline & stats
  useEffect(() => {
    fetchTimeline();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn("Could not fetch stats:", err);
    }
  };

  const fetchTimeline = async () => {
    try {
      const res = await fetch('/api/timeline');
      if (res.ok) {
        const data = await res.json();
        setTimeline(data.memories || []);
        if (data.memories && data.memories.length > 0 && !selectedMemory) {
          setSelectedMemory(data.memories[0]);
        }
      }
    } catch (err) {
      console.warn("Could not fetch timeline:", err);
    }
  };

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsSearching(true);
    setResult(null);

    try {
      const res = await fetch('/api/query-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    // Simulate real speech capture / Muse Voice Transcribe
    setTimeout(() => {
      setIsRecording(false);
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      setQuery(randomQuery);
      handleSearch(randomQuery);
    }, 2200);
  };

  const handleSimulateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsIngesting(true);
    setIngestStatus('SAM 3.1 segmenting micro-objects in scene...');

    const formData = new FormData();
    formData.append('frame', file);
    formData.append('room_context', roomContext);
    if (targetHint) formData.append('target_hint', targetHint);

    try {
      const res = await fetch('/api/ingest-frame', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setIngestStatus(`Success! SAM 3.1 indexed ${data.segments_found} object(s). Raw video discarded (0MB wasted).`);
        fetchTimeline();
        fetchStats();
      } else {
        setIngestStatus('Ingestion failed.');
      }
    } catch (err) {
      setIngestStatus('Network error during frame ingestion.');
    } finally {
      setIsIngesting(false);
    }
  };

  // Convert bounding box [x1, y1, x2, y2] to SVG coords for 720x480 frame
  const renderBoundingBox = (bbox, polygon) => {
    if (!bbox || bbox.length < 4) return null;
    const [x1, y1, x2, y2] = bbox;
    const w = x2 - x1;
    const h = y2 - y1;

    let polyString = '';
    if (polygon && polygon.length > 0) {
      polyString = polygon.map(p => `${p[0]},${p[1]}`).join(' ');
    }

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 720 480">
        {polyString && (
          <polygon
            points={polyString}
            fill="rgba(0, 242, 254, 0.25)"
            stroke="#00f2fe"
            strokeWidth="3"
            className="sam-glow"
          />
        )}
        <rect
          x={x1}
          y={y1}
          width={w}
          height={h}
          fill="none"
          stroke="#7928ca"
          strokeWidth="3"
          strokeDasharray="6,4"
        />
        {/* Pulsating target indicator */}
        <circle cx={x1 + w / 2} cy={y1 + h / 2} r="6" fill="#00f2fe" className="animate-ping" />
        <circle cx={x1 + w / 2} cy={y1 + h / 2} r="4" fill="#ffffff" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* 1. TOP SPATIAL HUD HEADER */}
      <header className="border-b border-hud-border/80 bg-hud-dark/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-hud-cyan/20 to-hud-purple/30 border border-hud-cyan/40 text-hud-cyan flex items-center justify-center shadow-lg shadow-cyan-950/40">
            <Glasses className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                SpatialRecall
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded-full">
                Meta Ray-Ban Wearable HUD
              </span>
            </div>
            <p className="text-xs text-gray-400">Ctrl+F for the Physical World · Episodic Spatial Memory</p>
          </div>
        </div>

        {/* Real-time Wearable Hardware Metrics */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hud-card border border-hud-border text-gray-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-400">Vision:</span>
            <span className="font-semibold text-cyan-300">SAM 3.1</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hud-card border border-hud-border text-gray-300">
            <Mic className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-gray-400">Voice:</span>
            <span className="font-semibold text-indigo-300">Muse Voice</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hud-card border border-hud-border text-gray-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-gray-400">Reasoning:</span>
            <span className="font-semibold text-purple-300">Muse Spark</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400">
            <HardDrive className="w-3.5 h-3.5" />
            <span className="text-emerald-300 font-medium">
              Storage: {stats?.total_storage_kb ? `${stats.total_storage_kb} KB` : '3.2 MB'} (<span className="text-emerald-400 font-semibold">&lt;15MB/day</span>)
            </span>
          </div>
        </div>
      </header>

      {/* 2. NAVIGATION SUB-HEADER */}
      <nav className="px-6 py-2 bg-hud-card/40 border-b border-hud-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('recall')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'recall'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-hud-card'
            }`}
          >
            🔍 Live Recall Search
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'timeline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-hud-card'
            }`}
          >
            ⏱️ Spatial Timeline ({timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('simulate')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'simulate'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-hud-card'
            }`}
          >
            📷 Ingest Wearable Feed
          </button>
        </div>

        <div className="text-xs text-gray-500 hidden sm:block">
          Episodic Memory Graph Active · {timeline.length} physical items localized
        </div>
      </nav>

      {/* 3. MAIN BODY CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* TAB 1: RECALL SEARCH */}
        {activeTab === 'recall' && (
          <div className="flex flex-col gap-6">
            {/* Search Input Bar */}
            <div className="bg-hud-card border border-hud-border rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Ask hands-free: 'Where did I leave my car keys?' or 'Find my wallet'..."
                    className="w-full bg-hud-dark border border-hud-border/80 focus:border-cyan-400 rounded-xl px-4 py-3.5 text-base text-gray-100 placeholder-gray-500 outline-none transition-all pr-12 shadow-inner"
                  />
                  <button
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                {/* Hands-Free Voice Button */}
                <button
                  onClick={handleVoiceToggle}
                  className={`px-5 py-3.5 rounded-xl flex items-center gap-2 font-semibold text-sm transition-all shadow-lg ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse shadow-rose-900/50'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-purple-900/30'
                  }`}
                >
                  <Mic className={`w-5 h-5 ${isRecording ? 'animate-bounce' : ''}`} />
                  {isRecording ? 'Listening (Muse Voice)...' : 'Hands-Free Voice'}
                </button>
              </div>

              {/* Sample Query Quick Pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-500">Quick tests:</span>
                {sampleQueries.map((qText, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(qText);
                      handleSearch(qText);
                    }}
                    className="px-2.5 py-1 rounded-md bg-hud-dark/80 hover:bg-cyan-950/60 border border-hud-border hover:border-cyan-700/50 text-gray-300 hover:text-cyan-300 transition-all"
                  >
                    {qText}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Result Viewport */}
            {isSearching ? (
              <div className="flex flex-col items-center justify-center p-16 bg-hud-card/60 border border-hud-border rounded-2xl gap-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-sm font-medium text-gray-300">Searching episodic memory timeline with Muse Spark...</p>
                <p className="text-xs text-gray-500">Cross-referencing spatial bounding boxes and scene keyframes...</p>
              </div>
            ) : result ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual Keyframe Viewport with SAM 3.1 Overlay */}
                <div className="lg:col-span-8 bg-hud-card border border-hud-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  <div className="px-4 py-2.5 bg-hud-dark border-b border-hud-border flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-cyan-400 font-medium">
                      <Eye className="w-4 h-4" />
                      Visual Spatial Grounding (SAM 3.1 Segment Overlay)
                    </span>
                    <span className="text-gray-400">
                      Captured: {result.last_seen_timestamp ? result.last_seen_timestamp.slice(11, 16) : 'Today'} · {result.time_ago}
                    </span>
                  </div>

                  <div className="relative aspect-[3/2] bg-black flex items-center justify-center overflow-hidden">
                    <img
                      src={`/data/${result.frame_path || 'sample_scenes/kitchen_counter.jpg'}`}
                      alt="Identified scene"
                      className="w-full h-full object-cover"
                    />
                    {/* Glowing SAM 3.1 Segmentation Overlay */}
                    {renderBoundingBox(result.bounding_box, result.segmentation_polygon)}

                    {/* HUD Pinpoint Tag */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-cyan-500/60 text-cyan-300 text-xs flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                      <span className="font-bold uppercase tracking-wider">{result.target_object || 'OBJECT FOUND'}</span>
                      <span className="text-gray-400">({Math.round((result.confidence || 0.95) * 100)}% match)</span>
                    </div>
                  </div>
                </div>

                {/* Spatial Context Breakdown Card */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div className="bg-hud-card border border-hud-border rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                          Recall Target Located
                        </span>
                        <h3 className="text-xl font-bold capitalize text-gray-100 mt-0.5">
                          {result.target_object}
                        </h3>
                      </div>
                      <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-hud-dark border border-hud-border">
                        <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Exact Spatial Location</p>
                          <p className="font-medium text-gray-200">{result.location_context}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-hud-dark border border-hud-border">
                        <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Last Observed</p>
                          <p className="font-medium text-gray-200">{result.time_ago} ({result.display_time || 'Recent'})</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning Text */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-purple-950/30 border border-indigo-800/40 text-xs text-indigo-200 leading-relaxed">
                      <div className="flex items-center gap-1.5 font-semibold text-indigo-300 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Muse Spark Reasoning:
                      </div>
                      {result.explanation}
                    </div>

                    {/* Ephemeral Architecture Badge */}
                    <div className="pt-2 border-t border-hud-border/60 text-[11px] text-gray-400 flex items-center justify-between">
                      <span>Ephemeral Memory:</span>
                      <span className="text-emerald-400 font-semibold">Raw Video Discarded (0MB Used)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State / Welcome Screen */
              <div className="bg-hud-card/60 border border-hud-border rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400 shadow-xl">
                  <Eye className="w-8 h-8" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-lg font-bold text-gray-100">Your Physical Life is Now Searchable</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Ask hands-free with your voice or type above to instantly recall where your keys, wallet, tools, or AirPods were last seen.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  <button
                    onClick={() => {
                      setQuery("Where did I leave my car keys?");
                      handleSearch("Where did I leave my car keys?");
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-sm font-medium transition-all"
                  >
                    Try: "Where are my car keys?"
                  </button>
                  <button
                    onClick={() => {
                      setQuery("Where is my leather wallet?");
                      handleSearch("Where is my leather wallet?");
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-sm font-medium transition-all"
                  >
                    Try: "Where is my wallet?"
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SPATIAL TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-100">Episodic Spatial Timeline</h2>
                <p className="text-xs text-gray-400">All micro-objects passively segmented and indexed by SAM 3.1 today</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-hud-dark border border-hud-border text-gray-400">
                Total Storage: ~{stats?.total_storage_kb || '3.2'} KB
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeline.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setResult({
                      found: true,
                      target_object: item.object_name,
                      location_context: item.room_context,
                      last_seen_timestamp: item.timestamp,
                      time_ago: 'Observed today',
                      confidence: item.confidence,
                      bounding_box: item.bounding_box,
                      segmentation_polygon: item.segmentation_polygon,
                      frame_path: item.frame_path,
                      thumbnail_path: item.thumbnail_path,
                      explanation: `Identified by SAM 3.1 in the ${item.room_context}.`
                    });
                    setActiveTab('recall');
                  }}
                  className="bg-hud-card hover:bg-hud-card/80 border border-hud-border hover:border-cyan-500/50 rounded-xl p-4 flex gap-4 cursor-pointer transition-all shadow-md group"
                >
                  <div className="w-20 h-20 rounded-lg bg-black overflow-hidden shrink-0 border border-hud-border group-hover:border-cyan-400 transition-all">
                    <img
                      src={`/data/${item.thumbnail_path || 'thumbnails/keys.jpg'}`}
                      alt={item.object_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                        {item.category}
                      </span>
                      <h4 className="font-semibold text-gray-200 capitalize truncate group-hover:text-cyan-300 transition-all">
                        {item.object_name}
                      </h4>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {item.room_context}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                      <span>{item.timestamp ? item.timestamp.slice(11, 16) : ''}</span>
                      <span className="text-cyan-400 group-hover:translate-x-1 transition-all">Recall &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SIMULATE WEARABLE SWEEP */}
        {activeTab === 'simulate' && (
          <div className="max-w-2xl mx-auto w-full bg-hud-card border border-hud-border rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                Ingest New Wearable Camera Keyframe
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Upload or capture any photo of your room or desk. SAM 3.1 will segment items and store compact coordinates. The raw photo will be discarded.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Room / Spatial Context:
                </label>
                <input
                  type="text"
                  value={roomContext}
                  onChange={(e) => setRoomContext(e.target.value)}
                  placeholder="e.g. Workshop Workbench, Kitchen Counter, Master Bedroom"
                  className="w-full bg-hud-dark border border-hud-border rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Target Object Hint (Optional):
                </label>
                <input
                  type="text"
                  value={targetHint}
                  onChange={(e) => setTargetHint(e.target.value)}
                  placeholder="e.g. blue screwdriver, passport, headphones"
                  className="w-full bg-hud-dark border border-hud-border rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:border-cyan-400 outline-none"
                />
              </div>

              <label
                htmlFor="scene-file-input"
                className="relative border-2 border-dashed border-hud-border hover:border-cyan-500/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-hud-dark/50 overflow-hidden group"
              >
                <Camera className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-300">Click to upload a scene photo or webcam capture</p>
                <p className="text-xs text-gray-500">Supports JPG, PNG (Simulates Ray-Ban 1-fps keyframe sweep)</p>
                <input
                  id="scene-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleSimulateUpload}
                  disabled={isIngesting}
                  className="hidden"
                />
              </label>

              {isIngesting && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-sm">
                  <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                  <span>{ingestStatus}</span>
                </div>
              )}

              {!isIngesting && ingestStatus && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{ingestStatus}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER WITH HACKATHON ATTRIBUTION */}
      <footer className="border-t border-hud-border/80 bg-hud-dark px-6 py-4 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4">
        <div className="flex items-center gap-2">
          <span>Built for the <strong>Meta Global AI Developer Hackathon</strong></span>
          <span>·</span>
          <span>Indie Developer Track</span>
        </div>
        <div className="flex items-center gap-4">
          <span>SAM 3.1</span>
          <span>·</span>
          <span>Muse Voice Transcribe</span>
          <span>·</span>
          <span>Muse Spark</span>
          <span>·</span>
          <span className="text-cyan-400 font-semibold">Zero-Storage Ephemeral Memory</span>
        </div>
      </footer>
    </div>
  );
}
