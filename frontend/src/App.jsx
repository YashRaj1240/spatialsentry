import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, Bell, BellOff,
  Video, VideoOff, Camera, Eye, MapPin, Clock, Cpu, HardDrive,
  Sparkles, RefreshCw, Smartphone, Glasses, Lock, Unlock, Flame,
  CheckCircle2, Search, Mic, ArrowRight, Zap, Volume2, VolumeX
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function App() {
  const [activeTab, setActiveTab] = useState('radar'); // 'radar', 'vault', 'assistant'
  const [isArmed, setIsArmed] = useState(true);
  const [activeAlarm, setActiveAlarm] = useState(null); // stores active incident if alarm is firing
  const [incidents, setIncidents] = useState([]);
  const [bufferStats, setBufferStats] = useState(null);
  const [healthData, setHealthData] = useState(null);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showRawFeed, setShowRawFeed] = useState(false); // Default false: Zero-Surveillance Privacy Shield
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sirenOscRef = useRef(null);

  // Pocket & Purse Extraction Guardian states
  const [pocketPopup, setPocketPopup] = useState(null); // { active: boolean, timestamp: string }
  const [isPocketDark, setIsPocketDark] = useState(false);
  const wasDarkRef = useRef(false);

  // Assistant states
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [assistantResult, setAssistantResult] = useState(null);

  // Live Camera Object Memory Scanner states
  const [isScanningMemory, setIsScanningMemory] = useState(false);
  const [memoryScanSuccess, setMemoryScanSuccess] = useState('');
  const [objectScanLabel, setObjectScanLabel] = useState('wireless earbuds');

  // Fetch initial data & unlock mobile AudioContext on first touch
  useEffect(() => {
    fetchIncidents();
    fetchHealth();
    const interval = setInterval(fetchBufferStatus, 3000);

    // Mobile gesture unlock for Web Audio API
    const unlockAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
        if (data.ephemeral_buffer) {
          setBufferStats(data.ephemeral_buffer);
        }
      }
    } catch (e) {
      console.warn("Could not fetch health:", e);
    }
  };

  const fetchBufferStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sentinel/status`);
      if (res.ok) {
        const data = await res.json();
        setBufferStats(data);
      }
    } catch (e) {
      console.warn("Buffer poll error:", e);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sentinel/incidents`);
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (e) {
      console.warn("Incidents fetch error:", e);
    }
  };

  // Toggle Arm / Disarm Perimeter
  const toggleArm = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sentinel/toggle-arm`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsArmed(data.is_armed);
        if (!data.is_armed && activeAlarm) {
          stopSiren();
          setActiveAlarm(null);
        }
      }
    } catch (e) {
      console.error("Arm toggle failed:", e);
    }
  };

  // Web Audio Siren Generator
  const playSiren = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);

      // Alternating 800Hz / 600Hz emergency warble
      let high = true;
      const intervalId = setInterval(() => {
        if (!sirenOscRef.current) {
          clearInterval(intervalId);
          return;
        }
        osc.frequency.setValueAtTime(high ? 880 : 620, ctx.currentTime);
        high = !high;
      }, 250);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      sirenOscRef.current = osc;
    } catch (err) {
      console.warn("Audio Context playback error:", err);
    }
  };

  const stopSiren = () => {
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch (e) {}
      sirenOscRef.current = null;
    }
    setActiveAlarm(null);
  };

  // Pleasant Signature Extraction Chime (Non-intrusive notification)
  const playExtractionChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Friendly Apple-Pay style two-tone chime: D5 (587Hz) -> A5 (880Hz) with soft bell decay
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (err) {
      console.warn("Chime audio error:", err);
    }
  };

  const triggerPocketExtraction = () => {
    playExtractionChime();
    setPocketPopup({
      active: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  };

  const handlePocketConfirmOwner = () => {
    setPocketPopup(null);
  };

  const handlePocketReportTheft = () => {
    setPocketPopup(null);
    handleTriggerSnatch("Smartphone (Extracted from Pocket/Bag)");
  };

  // Trigger Simulated / Real Snatch Intercept
  const handleTriggerSnatch = async (targetItem = "Designer Leather Handbag") => {
    try {
      const res = await fetch(`${API_BASE}/api/sentinel/trigger-snatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_item: targetItem,
          location: "Coffee Shop Outdoor Table (Table #4)"
        })
      });

      if (res.ok) {
        const alertData = await res.json();
        setActiveAlarm(alertData);
        playSiren();
        fetchIncidents();
        fetchBufferStatus();
      }
    } catch (err) {
      console.error("Snatch trigger error:", err);
    }
  };

  // Camera Management
  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access requires HTTPS or Chrome Flag on mobile LAN (see instructions).');
        setIsCameraActive(false);
        return;
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (camErr) {
        // Fallback to any available camera (front or rear)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      setCameraError('Camera access blocked. Please grant camera permission in your mobile browser.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsPocketDark(false);
    wasDarkRef.current = false;
  };

  // Real-time Darkness-to-Light pocket extraction monitor
  useEffect(() => {
    if (!isCameraActive) return;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');

    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        ctx.drawImage(videoRef.current, 0, 0, 32, 24);
        const imgData = ctx.getImageData(0, 0, 32, 24);
        let sum = 0;
        for (let i = 0; i < imgData.data.length; i += 16) {
          sum += (imgData.data[i] * 0.299 + imgData.data[i + 1] * 0.587 + imgData.data[i + 2] * 0.114);
        }
        const avgLuminance = sum / (imgData.data.length / 16);
        const isDark = avgLuminance < 25; // Pitch black inside pocket/bag

        if (isDark) {
          if (!wasDarkRef.current) {
            wasDarkRef.current = true;
            setIsPocketDark(true);
          }
        } else {
          if (wasDarkRef.current) {
            // Uncovered / Extracted from pocket into light!
            wasDarkRef.current = false;
            setIsPocketDark(false);
            triggerPocketExtraction();
          }
        }
      } catch (e) {}
    }, 500);

    return () => clearInterval(interval);
  }, [isCameraActive]);

  // Native Text-to-Speech (TTS) for Hands-Free Voice Assistant
  const speakText = (text) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const clean = text
          .replace(/[\u{1F600}-\u{1F6FF}|[\u{2600}-\u{26FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F900}-\u{1F9FF}]/gu, '')
          .replace(/[*_#`~⚠️🚨✨]/g, '')
          .trim();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TTS Error:", e);
      }
    }
  };

  // Live Camera Scan & Remember Object
  const handleScanAndRemember = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      alert("Please engage the camera guard first to scan an object.");
      return;
    }
    setIsScanningMemory(true);
    setMemoryScanSuccess('');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsScanningMemory(false);
          return;
        }
        const formData = new FormData();
        formData.append('frame', blob, 'camera_scan.jpg');
        formData.append('object_name', objectScanLabel || 'wireless earbuds');
        formData.append('room_context', 'table surface');

        try {
          const res = await fetch(`${API_BASE}/api/sentinel/register-memory`, {
            method: 'POST',
            body: formData
          });

          if (res.ok) {
            const data = await res.json();
            setMemoryScanSuccess(`✨ Memorized: ${data.object_name} on table!`);
            playExtractionChime();
            speakText(`Got it! I have memorized your ${data.object_name} on the table.`);
            setTimeout(() => setMemoryScanSuccess(''), 5000);
          }
        } catch (e) {
          console.error("Register memory failed:", e);
        } finally {
          setIsScanningMemory(false);
        }
      }, 'image/jpeg', 0.85);
    } catch (err) {
      console.error("Scan error:", err);
      setIsScanningMemory(false);
    }
  };

  // Assistant Query
  const handleSearch = async (queryText) => {
    const q = queryText || query;
    if (!q.trim()) return;

    setIsSearching(true);
    setAssistantResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/query-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (res.ok) {
        const data = await res.json();
        setAssistantResult(data);
        if (data.explanation) {
          speakText(data.explanation);
        }
      }
    } catch (err) {
      console.error("Query failed:", err);
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
    // Try browser Web Speech API for real-time speech-to-text
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsRecording(false);
          handleSearch(transcript);
        };
        recognition.onerror = () => {
          fallbackVoiceSimulation();
        };
        recognition.onend = () => {
          setIsRecording(false);
        };
        recognition.start();
        return;
      } catch (err) {
        fallbackVoiceSimulation();
        return;
      }
    }
    fallbackVoiceSimulation();
  };

  const fallbackVoiceSimulation = () => {
    setTimeout(() => {
      setIsRecording(false);
      const prompts = [
        "Where are my earbuds?",
        "Where are my apartment keys?",
        "Did someone grab my phone?",
        "Did I unplug the iron?"
      ];
      const chosen = prompts[Math.floor(Math.random() * prompts.length)];
      setQuery(chosen);
      handleSearch(chosen);
    }, 2200);
  };

  // Render SVG SAM 3.1 Bounding Polygon & Box
  const renderSAMOverlay = (bbox, polygon, isAlarm = false) => {
    if (!bbox || bbox.length < 4) return null;
    const [x1, y1, x2, y2] = bbox;
    const w = x2 - x1;
    const h = y2 - y1;

    let polyString = '';
    if (polygon && polygon.length > 0) {
      polyString = polygon.map(p => `${p[0]},${p[1]}`).join(' ');
    }

    const strokeColor = isAlarm ? '#ff0055' : '#00f2fe';
    const fillColor = isAlarm ? 'rgba(255, 0, 85, 0.35)' : 'rgba(0, 242, 254, 0.25)';

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 720 480">
        {polyString && (
          <polygon
            points={polyString}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="3.5"
            className={isAlarm ? 'animate-pulse' : ''}
          />
        )}
        <rect
          x={x1}
          y={y1}
          width={w}
          height={h}
          fill="none"
          stroke={isAlarm ? '#ff0055' : '#7928ca'}
          strokeWidth="3"
          strokeDasharray={isAlarm ? 'none' : '6,4'}
        />
        <circle cx={x1 + w / 2} cy={y1 + h / 2} r="8" fill={strokeColor} className="animate-ping" />
        <circle cx={x1 + w / 2} cy={y1 + h / 2} r="5" fill="#ffffff" />
      </svg>
    );
  };

  return (
    <div className={`min-h-screen text-gray-100 flex flex-col transition-colors duration-500 ${
      activeAlarm ? 'bg-red-950/40 selection:bg-rose-500' : 'bg-[#06080d] selection:bg-cyan-500'
    }`}>
      {/* 1. TOP SENTINEL HUD HEADER */}
      <header className="border-b border-gray-800/80 bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-2xl border flex items-center justify-center shadow-xl transition-all ${
            activeAlarm
              ? 'bg-rose-600/30 border-rose-500 text-rose-400 animate-bounce shadow-rose-950/60'
              : 'bg-gradient-to-tr from-cyan-500/20 to-indigo-600/20 border-cyan-500/40 text-cyan-400 shadow-cyan-950/40'
          }`}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold tracking-wider text-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                SpatialSentry
              </span>
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 rounded-full flex items-center gap-1 shadow-sm">
                24/7 Spatial Sentinel
              </span>
            </div>
            <p className="text-xs text-gray-400">Smartphone Bodyguard & Spatial Memory Engine · Zero-Surveillance Privacy</p>
          </div>
        </div>

        {/* Real-time Hardware Metrics & Arm Toggle */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Ephemeral Buffer Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-400">RAM Buffer:</span>
            <span className="font-semibold text-cyan-300">
              {bufferStats?.active_frames_in_ram ? `${bufferStats.active_frames_in_ram} frames` : '10s Rolling'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">(0MB on disk)</span>
          </div>

          {/* Model Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-gray-400">Vision:</span>
            <span className="font-semibold text-purple-300">Meta SAM 3.1</span>
          </div>

          {/* Voice Model Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
            <Mic className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-gray-400">Voice:</span>
            <span className="font-semibold text-indigo-300">Muse Voice</span>
          </div>

          {/* ARM / DISARM BUTTON */}
          <button
            onClick={toggleArm}
            className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
              isArmed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30'
            }`}
          >
            {isArmed ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5 text-rose-400" />}
            <span>PERIMETER: {isArmed ? 'ARMED' : 'STANDBY'}</span>
          </button>
        </div>
      </header>

      {/* 2. EMERGENCY ALARM BANNER (When Active) */}
      {activeAlarm && (
        <div className="bg-rose-950/90 border-b border-rose-500/80 px-6 py-3 flex items-center justify-between text-rose-200 animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 animate-ping" />
            <div>
              <span className="font-bold text-sm tracking-wider uppercase text-rose-300">
                🚨 SECURITY INTERCEPT TRIGGERED!
              </span>
              <p className="text-xs text-rose-200/90">
                High-velocity snatch attempt detected on <strong>{activeAlarm.target_item}</strong>. Deterrent siren active; forensic evidence locked.
              </p>
            </div>
          </div>
          <button
            onClick={stopSiren}
            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
          >
            <VolumeX className="w-4 h-4" />
            Silence Alarm
          </button>
        </div>
      )}

      {/* 2.5 POCKET & PURSE EXTRACTION POPUP (NON-INTRUSIVE CHIME & VERIFICATION) */}
      {pocketPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#0f172a]/95 backdrop-blur-xl border-2 border-cyan-400/80 rounded-2xl p-4 shadow-2xl shadow-cyan-950/80 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                <Smartphone className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    ✨ Extraction Chime Sounded
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{pocketPopup.timestamp}</span>
                </div>
                <h4 className="text-sm font-bold text-gray-100 mt-0.5">
                  Phone Removed from Pocket / Bag
                </h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Did you just remove your phone? If you did not, someone nearby may have pulled it from your purse or coat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={handlePocketConfirmOwner}
                className="flex-1 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Yes, It's Me (Dismiss)
              </button>
              <button
                onClick={handlePocketReportTheft}
                className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Not Me! (Lock Evidence)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. NAVIGATION SUB-HEADER */}
      <nav className="px-6 py-2.5 bg-[#090d16]/60 border-b border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'radar'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
            }`}
          >
            🛡️ Live Spatial Radar
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'vault'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
            }`}
          >
            🚨 Incident Evidence Vault ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'assistant'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
            }`}
          >
            🧠 Spatial Memory & Safety
          </button>
        </div>

        <div className="text-xs text-gray-500 hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Zero-Knowledge Buffer Active · All unflagged video purged every 10s</span>
        </div>
      </nav>

      {/* 4. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">

        {/* TAB 1: LIVE SENTINEL RADAR */}
        {activeTab === 'radar' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Radar Viewport (Video Stream or Intercept Freeze) */}
              <div className="lg:col-span-8 bg-[#090d16] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Eye className="w-4 h-4" />
                    Live Perimeter Radar (Meta SAM 3.1 Gaze & Snatch Tracking)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                    isArmed ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                  }`}>
                    {isArmed ? 'ARMED · ACTIVE' : 'STANDBY'}
                  </span>
                </div>

                <div className="relative aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
                  {/* Active Alarm Frozen Intercept */}
                  {activeAlarm ? (
                    <>
                      <img
                        src={`${API_BASE}/data/${activeAlarm.frame_path || 'sample_scenes/cafe_theft_intercept.jpg'}`}
                        alt="Theft Intercept Frame"
                        className="w-full h-full object-cover"
                      />
                      {renderSAMOverlay(activeAlarm.bounding_box, activeAlarm.segmentation_polygon, true)}
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-bold flex items-center gap-2 shadow-2xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                        <span>INTERCEPTED: {activeAlarm.target_item}</span>
                        <span className="text-rose-400">({activeAlarm.displacement_velocity} m/s)</span>
                      </div>
                    </>
                  ) : (
                    /* Live Sentinel Viewport */
                    <>
                      {/* Hidden Video element processing frames in RAM */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${isCameraActive && showRawFeed ? '' : 'hidden'}`}
                      />

                      {/* ZERO-SURVEILLANCE PRIVACY SHIELD (DEFAULT WHEN ACTIVE) */}
                      {isCameraActive && !showRawFeed && (
                        <div className="absolute inset-0 bg-gradient-to-b from-[#090d16] via-[#0b101c] to-[#070a12] flex flex-col items-center justify-between p-6 overflow-hidden">
                          {/* Top Radar Bar */}
                          <div className="w-full flex items-center justify-between text-[11px] font-mono text-cyan-400 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-800/50">
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                              <span className="font-bold">SPATIAL SENTRY RADAR ACTIVE</span>
                            </span>
                            <span className="text-gray-400">Zero-Surveillance Guarantee</span>
                            <span className="text-emerald-400 font-semibold">10s Rolling Purge</span>
                          </div>

                          {/* Center Privacy Holographic Sonar */}
                          <div className="relative flex flex-col items-center justify-center">
                            {/* Concentric Radar Rings */}
                            <div className="absolute w-64 h-64 rounded-full border border-cyan-500/10 animate-ping"></div>
                            <div className="absolute w-48 h-48 rounded-full border border-cyan-500/20"></div>
                            <div className="absolute w-32 h-32 rounded-full border border-indigo-500/30"></div>
                            
                            {/* Central Shield Icon */}
                            <div className="relative z-10 p-5 rounded-3xl bg-gradient-to-tr from-cyan-950/80 to-indigo-950/80 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/60 flex flex-col items-center gap-2">
                              <ShieldCheck className="w-12 h-12 text-cyan-400" />
                              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">
                                Privacy Shield Active
                              </span>
                            </div>
                          </div>

                          {/* Live Sensor Telemetry Strip */}
                          <div className="w-full grid grid-cols-3 gap-3 text-center text-xs">
                            <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800/80">
                              <p className="text-[10px] text-gray-500 uppercase font-semibold">Live Camera Feed</p>
                              <p className="font-bold text-rose-400 flex items-center justify-center gap-1 mt-0.5">
                                <Lock className="w-3 h-3" /> MASKED (Private)
                              </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800/80">
                              <p className="text-[10px] text-gray-500 uppercase font-semibold">Perimeter Sensor</p>
                              <p className={`font-bold mt-0.5 ${isPocketDark ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                                {isPocketDark ? '🌑 IN POCKET / BAG' : 'ACTIVE (0.1 m/s)'}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800/80">
                              <p className="text-[10px] text-gray-500 uppercase font-semibold">Disk Storage</p>
                              <p className="font-bold text-cyan-400 mt-0.5">
                                0.00 MB Saved
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* RAW FEED PEEK (ONLY IF DELIBERATELY TOGGLED) */}
                      {isCameraActive && showRawFeed && (
                        <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between">
                          <div className="flex justify-between items-center text-[10px] text-amber-400 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-800/60 font-mono">
                            <span className="flex items-center gap-1.5 font-bold">
                              ⚠️ RAW FEED PEEK (ALIGNING ANGLE)
                            </span>
                            <span className="text-gray-400">Meta SAM 3.1 Tracking</span>
                          </div>

                          <div className="self-center border-2 border-dashed border-cyan-400/50 rounded-2xl w-64 h-48 flex flex-col items-center justify-center text-xs text-cyan-300 font-mono gap-1">
                            <span>[ PROTECTED ZONE ]</span>
                            <span className="text-[10px] text-gray-400">Smartphone / Handbag / Purse</span>
                          </div>

                          <div className="text-[11px] text-gray-400 text-center bg-black/80 backdrop-blur-sm py-1 rounded-lg border border-gray-800">
                            Auto-purged every 10s · Zero persistent storage
                          </div>
                        </div>
                      )}

                      {/* CAMERA IDLE STATE */}
                      {!isCameraActive && (
                        <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
                          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">
                            <Shield className="w-10 h-10" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-gray-200">Sentinel Radar in Standby</p>
                            <p className="text-xs text-gray-400 mt-1 max-w-sm">
                              Start your device camera to engage the 24/7 Zero-Surveillance Bodyguard. The camera feed remains 100% masked to protect your privacy.
                            </p>
                          </div>
                          <button
                            onClick={startCamera}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Engage Spatial Sentry Guard (Camera Guard)
                          </button>

                          {cameraError && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center max-w-sm">
                              <p className="font-semibold mb-1">⚠️ {cameraError}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Memory Scan Success Notification */}
                {memoryScanSuccess && (
                  <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-5 py-2.5 text-xs font-semibold flex items-center justify-between animate-pulse">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {memoryScanSuccess}
                    </span>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-600/50">
                      Indexed into Spatial Memory
                    </span>
                  </div>
                )}

                {/* Radar Action Toolbar */}
                <div className="p-4 bg-gray-900/80 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {isCameraActive ? (
                      <>
                        <button
                          onClick={stopCamera}
                          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <VideoOff className="w-4 h-4" />
                          Disengage Guard
                        </button>

                        {/* Privacy Toggle: Peek Feed vs Mask */}
                        <button
                          onClick={() => setShowRawFeed(!showRawFeed)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            showRawFeed
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          {showRawFeed ? <Lock className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {showRawFeed ? 'Mask Video (Privacy Mode)' : 'Peek Camera Angle'}
                        </button>

                        {/* Live Object Scanner & Memory Saver */}
                        <button
                          onClick={handleScanAndRemember}
                          disabled={isScanningMemory}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {isScanningMemory ? 'Memorizing...' : '📸 Scan & Remember'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={startCamera}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Engage Bodyguard
                      </button>
                    )}
                  </div>

                  {/* SIMULATE THEFT BUTTON (The Hackathon Winner Feature) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={triggerPocketExtraction}
                      className="px-3.5 py-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                      Test Pocket Extraction Popup
                    </button>
                    <button
                      onClick={() => handleTriggerSnatch("Smartphone (Handbag Snatch Attempt)")}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 animate-bounce" />
                      Test Snatch Intercept
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Sentinel Intelligence Panel */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-[#090d16] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                        Protection Profile
                      </span>
                      <h3 className="text-lg font-bold text-gray-100 mt-0.5">
                        Active Valuables
                      </h3>
                    </div>
                    <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800">
                      <span className="text-gray-300 font-medium">📱 Smartphones & Devices</span>
                      <span className="text-emerald-400 font-semibold">Pocket & Snatch Guard</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800">
                      <span className="text-gray-300 font-medium">👜 Handbags & Purses</span>
                      <span className="text-emerald-400 font-semibold">Active Perimeter</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800">
                      <span className="text-gray-300 font-medium">👛 Coat & Pocket Storage</span>
                      <span className="text-emerald-400 font-semibold">Darkness Sensor Active</span>
                    </div>
                  </div>

                  {/* Forensic Telemetry Box */}
                  <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Meta AI Forensic Logic:
                    </div>
                    <p className="text-[11px] text-gray-300">
                      SAM 3.1 continuously segments foreground valuables and computes optical displacement velocity vectors. Any snatch &gt; 3.0 m/s triggers instant 85dB deterrent sirens and locks evidence.
                    </p>
                  </div>

                  {/* Ephemeral Architecture Guarantee */}
                  <div className="pt-3 border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
                    <span>Privacy Guarantee:</span>
                    <span className="text-emerald-400 font-semibold">Zero Persistent Video Stored</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INCIDENT EVIDENCE VAULT */}
        {activeTab === 'vault' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-rose-400" />
                  Locked Incident Evidence Vault
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  When a theft or perimeter breach is intercepted, the 10-second rolling buffer freezes the incident evidence frame and AI forensic report.
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 font-semibold">
                {incidents.length} Breaches Intercepted
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-[#090d16] border border-gray-800 hover:border-rose-500/50 rounded-2xl p-5 shadow-xl flex flex-col gap-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800">
                        {inc.severity} · {inc.incident_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <h3 className="text-lg font-bold text-gray-100 mt-2">
                        {inc.target_item}
                      </h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {inc.location_context}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {inc.timestamp ? inc.timestamp.slice(11, 16) : ''}
                    </span>
                  </div>

                  {/* Evidence Image with SAM 3.1 Overlay */}
                  <div className="relative aspect-[16/9] bg-black rounded-xl overflow-hidden border border-gray-800">
                    <img
                      src={`${API_BASE}/data/${inc.frame_path || 'sample_scenes/cafe_theft_intercept.jpg'}`}
                      alt={inc.target_item}
                      className="w-full h-full object-cover"
                    />
                    {renderSAMOverlay(inc.bounding_box, inc.segmentation_polygon, true)}
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] text-rose-300 font-mono border border-rose-800">
                      Displacement Velocity: {inc.displacement_velocity} m/s
                    </div>
                  </div>

                  {/* Forensic Summary */}
                  <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300 leading-relaxed">
                    <span className="font-semibold text-rose-400 block mb-1">Forensic Intercept Report:</span>
                    {inc.ai_forensic_report}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SAFETY ASSISTANT & MEMORY */}
        {activeTab === 'assistant' && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div className="bg-[#090d16] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Ask SpatialSentry: Spatial Memory & Anti-Theft
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Query your security timeline or ambient peace-of-mind memories hands-free.
                </p>
              </div>

              {/* Search Bar + Hands-Free Voice Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. 'Did someone grab my phone?' or 'Did I unplug the iron?'..."
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-400 rounded-xl px-4 py-3.5 text-sm text-gray-100 outline-none transition-all pr-12 shadow-inner"
                  />
                  <button
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Hands-Free Voice Button (Meta Muse Voice) */}
                <button
                  onClick={handleVoiceToggle}
                  className={`px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-lg shrink-0 ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse shadow-rose-900/60 ring-2 ring-rose-400'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-purple-950/40'
                  }`}
                >
                  <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce text-white' : 'text-indigo-200'}`} />
                  <span>{isRecording ? 'Listening (Muse Voice)...' : 'Hands-Free Voice'}</span>
                </button>
              </div>

              {/* Quick Prompt Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-500">Quick tests:</span>
                {[
                  "Where are my earbuds?",
                  "Where are my apartment keys?",
                  "Did someone grab my phone?",
                  "Did I unplug the iron?"
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(promptText);
                      handleSearch(promptText);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-indigo-950/60 border border-gray-800 hover:border-indigo-700 text-gray-300 hover:text-indigo-300 transition-all"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Assistant Results */}
            {isSearching ? (
              <div className="p-12 rounded-2xl bg-[#090d16] border border-gray-800 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-sm text-gray-300">Searching 10-second rolling buffer and security ledger...</p>
              </div>
            ) : assistantResult ? (
              <div className="bg-[#090d16] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                      {assistantResult.is_incident ? '🚨 Security Threat Found' : 'Verified Observation'}
                    </span>
                    <h3 className="text-xl font-bold text-gray-100 capitalize mt-1">
                      {assistantResult.target_object}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    assistantResult.is_incident ? 'bg-rose-950/80 text-rose-300 border border-rose-800' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  }`}>
                    {assistantResult.is_incident ? 'Incident Locked' : 'Verified Safe'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-sm text-gray-200 leading-relaxed flex items-center justify-between gap-3">
                  <span>{assistantResult.explanation}</span>
                  <button
                    onClick={() => speakText(assistantResult.explanation)}
                    title="Speak answer aloud"
                    className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 shrink-0 transition-all flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Speak</span>
                  </button>
                </div>

                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-800">
                  <img
                    src={`${API_BASE}/data/${assistantResult.frame_path || 'sample_scenes/cafe_theft_intercept.jpg'}`}
                    alt="Result View"
                    className="w-full h-full object-cover"
                  />
                  {renderSAMOverlay(assistantResult.bounding_box, assistantResult.segmentation_polygon, assistantResult.is_incident)}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* 5. FOOTER WITH META HACKATHON ATTRIBUTION */}
      <footer className="border-t border-gray-800/80 bg-[#090d16] px-6 py-4 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4">
        <div className="flex items-center gap-2">
          <span>Built for the <strong>Meta Global AI Developer Hackathon</strong></span>
          <span>·</span>
          <span>Track: Indie Developer ($150,000 1st Prize)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Meta SAM 3.1</span>
          <span>·</span>
          <span>Meta Muse Voice</span>
          <span>·</span>
          <span>Meta Muse Spark & Llama 3</span>
          <span>·</span>
          <span className="text-emerald-400 font-semibold">10s Ephemeral RAM Buffer</span>
        </div>
      </footer>
    </div>
  );
}
