# 📱🛡️ SpatialSentry — 24/7 Ephemeral AI Smartphone Bodyguard & Spatial Memory Sentinel

> **Continuous Smartphone Protection, Snatch Deterrence & Pocket Extraction Guardian Powered by Meta AI**  
> *Built for the Meta Global AI Developer Hackathon 2026 · Track: Indie Developer ($150,000 1st Prize)*

[![Meta Model API](https://img.shields.io/badge/Meta%20AI-SAM%203.1%20%7C%20Muse%20%7C%20Llama%203-0081FB?logo=meta)](https://dev.meta.ai/)
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

### 2. ✨ Pocket & Purse Extraction Guardian (Darkness-to-Light Chime)
- **Subconscious Conditioning:** When the phone leaves darkness (pocket or purse), it plays a pleasant signature extraction chime and shows a non-intrusive confirmation popup: *"Phone Removed from Pocket · Tap if Not You"*.
- **Pickpocket Intercept:** If a pickpocket silently lifts your phone from your bag in a crowded train, you hear your phone's signature chime behind you, turn around, and stop the theft!

### 3. 🔒 Zero-Surveillance Privacy (10-Second RAM Buffer)
- Video exists **only in transient RAM memory** for 10 seconds.
- If no threat or safety event occurs, the video frames are **automatically overwritten and destroyed**.
- Your private life, conversations, and home are **never saved to disk or uploaded to the cloud**.
- When you are distracted, SpatialSentry quietly verifies important safety details:
  - *"Did I unplug the iron before leaving?"* → Verified at 8:14 AM.
  - *"Did someone grab my phone while I was away?"* → Reports unauthorized contact attempt.
  - *"Where are my apartment keys?"* → Verified on the kitchen counter.

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
