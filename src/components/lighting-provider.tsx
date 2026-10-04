"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Clock3, Moon, Sun } from "lucide-react";

import {
  lightingStorageKey,
  readLightingPreference,
  resolveLighting,
  type Lighting,
  type LightingPreference,
} from "@/lib/lighting";

const LightingContext = createContext<{
  lighting: Lighting;
  preference: LightingPreference;
  ready: boolean;
  choose: (preference: LightingPreference) => void;
} | null>(null);

export function LightingProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<LightingPreference>("auto");
  const [hour, setHour] = useState(12);
  const [ready, setReady] = useState(false);
  const lighting = resolveLighting(preference, hour);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setPreference(
          readLightingPreference(localStorage.getItem(lightingStorageKey)),
        );
      } catch {
        // Lighting still works when browser storage is unavailable.
      }
      setHour(new Date().getHours());
      setReady(true);
    });
    const updateClock = () => setHour(new Date().getHours());
    const syncPreference = (event: StorageEvent) => {
      if (event.key === lightingStorageKey || event.key === null) {
        setPreference(
          readLightingPreference(event.key === null ? null : event.newValue),
        );
        updateClock();
      }
    };
    const interval = window.setInterval(updateClock, 60000);
    window.addEventListener("focus", updateClock);
    document.addEventListener("visibilitychange", updateClock);
    window.addEventListener("storage", syncPreference);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", updateClock);
      document.removeEventListener("visibilitychange", updateClock);
      window.removeEventListener("storage", syncPreference);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.gardenTheme = lighting;
    const frame = window.requestAnimationFrame(() => {
      document.documentElement.dataset.themeReady = "true";
    });
    return () => window.cancelAnimationFrame(frame);
  }, [lighting, ready]);

  function choose(next: LightingPreference) {
    setHour(new Date().getHours());
    setPreference(next);
    try {
      localStorage.setItem(lightingStorageKey, next);
    } catch {
      // Keep the manual choice in memory for this visit.
    }
  }

  return (
    <LightingContext.Provider value={{ lighting, preference, ready, choose }}>
      {children}
    </LightingContext.Provider>
  );
}

export function useLighting() {
  const context = useContext(LightingContext);
  if (!context) throw new Error("Garden lighting requires LightingProvider.");
  return context;
}

export function LightingControl() {
  const { lighting, preference, ready, choose } = useLighting();
  const night = lighting === "night";
  return (
    <div className="lighting-control" role="group" aria-label="Garden lighting">
      <button
        className="lighting-switch"
        type="button"
        role="switch"
        aria-label="Night mode"
        aria-checked={night}
        disabled={!ready}
        onClick={() => choose(night ? "day" : "night")}
        title={night ? "Switch to day" : "Switch to night"}
      >
        <span className="switch-landscape" aria-hidden="true">
          <span className="switch-cloud" />
          <span className="switch-stars" />
          <span className="switch-hills" />
          <span className="switch-thumb">
            <Sun className="switch-sun" size={21} />
            <Moon className="switch-moon" size={20} />
          </span>
        </span>
      </button>
      <button
        className="lighting-auto"
        type="button"
        aria-pressed={preference === "auto"}
        disabled={!ready}
        onClick={() => choose("auto")}
        title="Follow device time: day 6am–6pm"
      >
        <Clock3 size={14} aria-hidden="true" />
        Auto
      </button>
    </div>
  );
}
