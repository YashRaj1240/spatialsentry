# 📱🛡️ SpatialSentry — 24/7 Ephemeral AI Smartphone Bodyguard & Spatial Memory Sentinel

> **Continuous Smartphone Protection, Snatch Deterrence & Spatial Memory Powered by Meta AI**  
> *Meta Global AI Developer Hackathon Submission — Track: Indie Developer ($150,000 1st Prize)*

[![Live App on Vercel](https://img.shields.io/badge/🚀%20Live%20Production%20App-spatialsentry0--218f.vercel.app-00f2fe?style=for-the-badge&logo=vercel)](https://spatialsentry0-218f.vercel.app)
[![Meta Model API](https://img.shields.io/badge/Meta%20AI-SAM%203.1%20%7C%20Muse%20Spark%20%7C%20Muse%20Voice-0081FB?style=for-the-badge&logo=meta)](https://dev.meta.ai/)

---

### 🌐 **Live Application URL (Instant Access for Judges):**
👉 **[https://spatialsentry0-218f.vercel.app](https://spatialsentry0-218f.vercel.app)**

---

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind-61DAFB?logo=react)](https://react.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-10s%20RAM%20Auto--Purge-emerald)](https://github.com/)
[![Platforms](https://img.shields.io/badge/Hardware-Smartphones%20%7C%20Meta%20Ray--Ban%20%7C%20PWA-purple)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🚨 The Problem: An Epidemic of Smartphone Snatch Theft & The Privacy Dilemma

Across major cities worldwide (London, Paris, NYC, San Francisco, Delhi, Barcelona), **smartphone snatching and pocket theft has surged dramatically**. People feel anxious holding their phones on public transit, walking alone at night, or setting their phone down in a cafe for even 30 seconds.

Yet, people refuse to run continuous recording apps for one simple reason: **PRIVACY**. Nobody wants their personal life recorded 24/7, and nobody wants gigabytes of useless video clogging their storage.

---

## 🛡️ The Breakthrough: SpatialSentry & The Ephemeral Rolling Buffer

**SpatialSentry** provides **24/7 proactive smartphone protection without ever recording your private life**.

```
[Smartphone Camera & Darkness Sensors]
             │
             ▼
   [10-Second Rolling RAM Buffer]
   (Continuously overwritten in memory · 0 MB saved to disk)
             │
      ┌──────┴───────────────────────────────────┐
      │                                          │
[Normal Calm Activity]              [High-Velocity Snatch Attempt (>3.0 m/s)]
      │                                          │
      ▼                                          ▼
[Auto-Purged Every 10s]              [🚨 EMERGENCY THREAT INTERCEPT!]
(Permanently destroyed in RAM)       • 85dB Deterrent Siren triggered
                                     • Meta SAM 3.1 locks suspect boundary
                                     • 10s Incident Evidence frozen to Vault
                                     • Forensic report logged with GPS time
```

---

## 🎯 The Three Core Pillars

### 1. 🚨 Active Smartphone Perimeter Guard & Anti-Theft Sentinel
- **Table / Surface Guard:** Prop your phone on a table or counter while you look away or visit the restroom.
- **Snatch Detection Vector:** If an unauthorized hand grabs your phone at high displacement velocity (>3.0 m/s), an **instant deterrent siren** sounds, startling the thief into dropping the device.
- **Suspect Tagging:** **Meta SAM 3.1** instantly segments the suspect's hand, jacket, and direction of flight, locking an unalterable forensic evidence card.

### 2. ☀️ The Dark-to-Light Silent Pickpocket Trap (Custom Sound Conditioning)
- **Positive Habit Conditioning:** Users pick a pleasant sound they love (💧 Water Drop, 🔔 Velvet Chime, 🎵 Zen Marimba, or 🎶 Pop Sparkle). Every time the phone leaves darkness (pocket or bag) into the light, this sound plays naturally. Because you love the sound, you never get irritated—you get accustomed to hearing it every time your phone comes out.
- **The Silent Thief Trap:** A pickpocket secretly slides your phone out of your bag without making any noise. Because they don't know about the dark-to-light trigger, your familiar sound plays as usual. The thief thinks it's harmless, but you instantly realize: *"Wait! My phone sound just played, but my hands are in my lap!"* You turn around and catch the thief red-handed in the act!

### 3. 🎙️ TARA — 24/7 Voice AI Spatial Memory Sentinel
- **Meta Muse Spark 1.3 & Muse Voice:** Conversational voice AI operating under a strict 6-state goal completion machine:
  `FIND OBJECT -> SHARE LOCATION -> OFFER FURTHER HELP -> PROCESS USER RESPONSE -> CLOSE OR CONTINUE`
- **Natural Multi-Turn Dialog:**
  - *"Where is my mouse?"* → *"Your computer mouse was last spotted on the work desk surface. Is there anything else you'd like me to help you find?"*
  - Follow-up (Case A): *"Yes, where is my wallet?"* → Answers with location without restarting greeting.
  - Closing (Case B & C): *"No, that's all."* or *"I'm good."* → *"Alright! Glad I could help. Just call me whenever you need to find something. Have a great day!"* (Voice session terminates cleanly).

### 4. 🔒 Zero-Surveillance Privacy (10-Second RAM Buffer)
- Raw video frames exist **only in transient RAM memory** for 10 seconds.
- Every 10 seconds, raw image buffers are **automatically wiped and destroyed** from memory.
- Only structured text coordinates and knowledge graph representations are permanently preserved—your private room photos are **never stored on disk or uploaded to the cloud**.

---

## 🏗️ Technical Architecture

```mermaid
flowchart TD
    subgraph Capture["1. Ambient Capture (Smartphones / Meta Glasses)"]
        Stream["Live Video Sensor Stream (1-30 FPS)"]
    end

    subgraph MemoryEngine["2. Spatial Ephemeral Engine (Zero-Disk)"]
        Stream --> RAM["In-Memory Circular Buffer (deque maxlen=20)"]
        RAM --> Monitor["Velocity Vector & Perimeter Analyzer"]
        Monitor -- "No Threat (99.9% of time)" --> Purge["🗑️ Auto-Purge from RAM (0 MB Stored)"]
    end

    subgraph ThreatPerception["3. Meta AI Threat Perception"]
        Monitor -- "Snatch or Breach Detected!" --> Freeze["🚨 Freeze 10s Buffer into Evidence Vault"]
        Freeze --> SAM["Meta SAM 3.1: Zero-Shot Suspect & Target Segmentation"]
        Freeze --> Siren["Audible Web Audio Deterrent Siren (880Hz Warble)"]
        Freeze --> MuseSpark["Meta Muse Spark / Llama 3: Generate Forensic Incident Ledger"]
    end

    subgraph UserHUD["4. Interactive Sentinel HUD"]
        Siren --> HUD["Active Radar HUD:<br/>• Flashing Emergency Banner<br/>• Neon SAM 3.1 Suspect Overlay<br/>• Instant Incident Evidence Card"]
    end
```

---

## 🛠️ Meta AI Models Used

* **Meta SAM 3.1 (Segment Anything):** Performs real-time pixel segmentation on protected valuables and suspect contact points, calculating perimeter intrusions.
* **Meta Muse Voice Transcribe:** Provides hands-free emergency SOS commands and voice queries.
* **Meta Muse Spark & Llama 3:** Multimodal temporal reasoning and forensic threat incident classification.

---

## ⚡ Quick Start (Local Setup)

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start Backend API
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```

### 2. Start Frontend Sentinel HUD
```bash
cd frontend
npm install
npm run dev -- --port 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎬 3-Minute Hackathon Demo Script (For Judges)

* **0:00 - 0:30 (The Hook & Problem):**
  *"Every day, thousands of smartphones and bags are snatched on streets and transit. People can't use continuous body cameras because of privacy. Meet SpatialSentry: the 24/7 AI smartphone bodyguard that watches your back without ever storing your private life."*
* **0:30 - 1:15 (The Rolling Buffer & Pocket Extraction Chime):**
  *Show the Live Spatial Radar HUD. Explain the 10-second rolling RAM buffer showing 0MB persistent disk storage, and test the signature Pocket Extraction Chime & Popup.*
* **1:15 - 2:00 (The Action: Simulated Snatch Intercept):**
  *Arm the perimeter. Click 'Test Snatch Intercept'. The siren blares! The screen flashes red! Meta SAM 3.1 locks the neon suspect polygon over the snatching hand.*
* **2:00 - 2:30 (Evidence Vault & Forensic Ledger):**
  *Click the 'Incident Evidence Vault' tab. Show the frozen 10-second proof with displacement velocity (4.8 m/s) and AI incident summary.*
* **2:30 - 3:00 (Ambient Memory & Closing):**
  *Ask: 'Did someone grab my phone?' Show Muse Spark explaining the safety log. Close with the massive global impact across 5+ billion smartphone users and Meta smart glasses.*
