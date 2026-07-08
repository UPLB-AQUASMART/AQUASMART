"use client";

import { WeatherSection } from "@/app/components/home/WeatherSection";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ForecastAnalyticsDashboard } from "./ForecastAnalyticsDashboard";
import { useOpenMeteoWeather } from "./components/openMeteoWeather";
import styles from "./page.module.css";

const SPLASH_MIN_DURATION_MS = 1500;
const SPLASH_EXIT_MS = 520;
const LOCATION_PROMPT_COPY_DELAY_MS = 2000;

const splashSectionStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  minHeight: "100svh",
  placeItems: "center",
  overflow: "hidden",
  padding: "clamp(120px, 12vw, 154px) 24px 72px",
  background:
    "radial-gradient(circle at 18% 16%, rgba(223, 246, 253, 0.96) 0%, rgba(223, 246, 253, 0.56) 22%, transparent 44%), radial-gradient(circle at 82% 84%, rgba(79, 168, 217, 0.24) 0%, transparent 36%), linear-gradient(135deg, #f8fcff 0%, #eaf7fe 46%, #d9edf8 100%)",
  color: "#0b1f3a",
  textAlign: "center",
  isolation: "isolate",
};

const splashContentStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  width: "min(100%, 680px)",
  justifyItems: "center",
  padding: "clamp(30px, 4vw, 48px)",
};

const splashRingsStyle: CSSProperties = {
  position: "absolute",
  zIndex: -1,
  top: "50%",
  left: "50%",
  width: "min(88vw, 760px)",
  aspectRatio: "1",
  borderRadius: "50%",
  background:
    "repeating-radial-gradient(circle, transparent 0 84px, rgba(31, 163, 201, 0.14) 85px, transparent 87px)",
  opacity: 0.9,
  transform: "translate(-50%, -50%)",
};

const splashSunStyle: CSSProperties = {
  position: "absolute",
  top: "18%",
  left: "calc(50% + 165px)",
  width: "clamp(76px, 8vw, 112px)",
  aspectRatio: "1",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #f8ca4d 0%, #f3a13b 100%)",
  boxShadow:
    "0 0 36px rgba(248, 202, 77, 0.42), 0 0 78px rgba(248, 202, 77, 0.22)",
  opacity: 0.9,
};

const splashCloudStyle: CSSProperties = {
  position: "absolute",
  top: "27%",
  left: "calc(50% + 18px)",
  width: "clamp(220px, 28vw, 430px)",
  aspectRatio: "558 / 310",
  background: 'url("/assets/weather-cloud-icon.png") center / contain no-repeat',
  filter:
    "saturate(0.62) brightness(1.12) contrast(0.92) drop-shadow(0 26px 34px rgba(37, 89, 124, 0.16))",
  opacity: 0.72,
  transform: "translateX(-50%)",
};

function ForecastSplash({
  error,
  isLeaving,
  isPaused,
  progress,
  showLocationPromptText,
  status,
}: {
  error?: string | null;
  isLeaving: boolean;
  isPaused: boolean;
  progress: number;
  showLocationPromptText: boolean;
  status: "requesting-location" | "loading-weather" | "ready" | "location-unavailable" | "weather-unavailable";
}) {
  const clampedProgress = Math.min(Math.max(Math.round(progress), 0), 100);
  const isUnavailable = status === "location-unavailable" || status === "weather-unavailable";
  const heading = isUnavailable
    ? status === "location-unavailable"
      ? "User location is unavailable"
      : "Weather data is unavailable"
    : status === "requesting-location" && showLocationPromptText
      ? "Allow location to load your forecast"
      : "Preparing your field forecast";
  const message = isUnavailable
    ? status === "location-unavailable"
      ? "AQUASMART cannot request live weather data without your location permission. Please allow location access and reload the forecast page."
      : "AQUASMART could not retrieve weather data right now. Please check your connection and try again."
    : status === "requesting-location" && showLocationPromptText
      ? "Waiting for your browser location prompt. The forecast loader will resume after you choose."
      : status === "requesting-location"
        ? "Checking browser location access before requesting local weather data."
      : "Pulling live rainfall, temperature, and evapotranspiration data from Open-Meteo.";
  const splashClassName = [
    styles["forecast-splash"],
    isLeaving ? styles["forecast-splash-leaving"] : "",
    isPaused ? styles["forecast-splash-paused"] : "",
    isUnavailable ? styles["forecast-splash-unavailable"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={splashClassName}
      role="status"
      aria-live="polite"
      style={splashSectionStyle}
    >
      <div className={styles["splash-rings"]} aria-hidden="true" style={splashRingsStyle} />
      <div className={styles["splash-sun"]} aria-hidden="true" style={splashSunStyle} />
      <div className={styles["splash-cloud"]} aria-hidden="true" style={splashCloudStyle} />
      <div className={styles["splash-content"]} style={splashContentStyle}>
        <h1
          style={{
            maxWidth: 620,
            margin: 0,
            fontFamily: '"Sora", "Inter", sans-serif',
            fontSize: "clamp(34px, 5vw, 58px)",
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.05,
          }}
        >
          {heading}
        </h1>
        <p
          style={{
            maxWidth: 530,
            margin: "18px 0 0",
            color: "#5e6c7d",
            fontSize: "clamp(15px, 1.7vw, 19px)",
            fontWeight: 600,
            lineHeight: 1.55,
          }}
        >
          {message}
        </p>
        {error && isUnavailable ? (
          <small className={styles["splash-error-detail"]}>{error}</small>
        ) : null}
        <div
          className={styles["splash-progress"]}
          role="progressbar"
          aria-label="Forecast loading progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={clampedProgress}
          style={{
            position: "relative",
            width: "min(100%, 320px)",
            height: 8,
            overflow: "hidden",
            marginTop: 34,
            borderRadius: 999,
            background: "rgba(31, 163, 201, 0.14)",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: "0 auto 0 0",
              width: `${clampedProgress}%`,
              borderRadius: "inherit",
              background: "linear-gradient(90deg, #37a8dc, #3aa24d)",
              transition: "width 420ms cubic-bezier(0.2, 0.85, 0.22, 1)",
            }}
          />
        </div>
        <small className={styles["splash-progress-value"]}>
          {isUnavailable
            ? "No weather data available"
            : isPaused && showLocationPromptText
              ? "Paused for location permission"
              : `${clampedProgress}% ready`}
        </small>
      </div>
    </section>
  );
}

export function ForecastPageClient() {
  const { data, error, isLoading, status } = useOpenMeteoWeather();
  const splashStartedAtRef = useRef(0);
  const [progress, setProgress] = useState(8);
  const [showSplash, setShowSplash] = useState(true);
  const [isSplashLeaving, setIsSplashLeaving] = useState(false);
  const [showLocationPromptText, setShowLocationPromptText] = useState(false);
  const isPromptPending = status === "requesting-location";
  const isUnavailable = status === "location-unavailable" || status === "weather-unavailable";

  useEffect(() => {
    splashStartedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isPromptPending) {
      const resetTimer = window.setTimeout(() => {
        setShowLocationPromptText(false);
      }, 0);

      return () => window.clearTimeout(resetTimer);
    }

    const promptCopyTimer = window.setTimeout(() => {
      setShowLocationPromptText(true);
    }, LOCATION_PROMPT_COPY_DELAY_MS);

    return () => window.clearTimeout(promptCopyTimer);
  }, [isPromptPending]);

  useEffect(() => {
    if (!showSplash || !isLoading || isPromptPending || isUnavailable) {
      return;
    }

    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 88) {
          return current;
        }

        const step = current < 45 ? 8 : current < 72 ? 5 : 2;
        return Math.min(current + step, 88);
      });
    }, 180);

    return () => window.clearInterval(progressTimer);
  }, [isLoading, isPromptPending, isUnavailable, showSplash]);

  useEffect(() => {
    if (isUnavailable) {
      const unavailableTimer = window.setTimeout(() => {
        setIsSplashLeaving(false);
        setShowSplash(true);
      }, 0);

      return () => window.clearTimeout(unavailableTimer);
    }

    if (isLoading || !showSplash) {
      return;
    }

    const completeTimer = window.setTimeout(() => {
      setProgress(100);
    }, 0);

    const elapsed = splashStartedAtRef.current
      ? Date.now() - splashStartedAtRef.current
      : SPLASH_MIN_DURATION_MS;
    const exitDelay = Math.max(360, SPLASH_MIN_DURATION_MS - elapsed);

    const leaveTimer = window.setTimeout(() => {
      setIsSplashLeaving(true);
    }, exitDelay);

    const doneTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, exitDelay + SPLASH_EXIT_MS);

    return () => {
      window.clearTimeout(completeTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [isLoading, isUnavailable, showSplash]);

  const forecastContent = (
    <div
      className={`${styles["forecast-ready"]}${
        isSplashLeaving ? ` ${styles["forecast-ready-entering"]}` : ""
      }`}
    >
      <WeatherSection
        forecastDetails={data?.details}
        forecastItems={data?.forecast}
      />
      <ForecastAnalyticsDashboard weatherData={data} />
    </div>
  );

  return (
    <div
      className={`${styles["forecast-transition-shell"]}${
        showSplash ? "" : ` ${styles["forecast-transition-complete"]}`
      }`}
    >
      {(isSplashLeaving || !showSplash) && !isUnavailable ? forecastContent : null}
      {showSplash ? (
        <div
          className={`${styles["forecast-splash-layer"]}${
            isSplashLeaving ? ` ${styles["forecast-splash-layer-leaving"]}` : ""
          }`}
        >
          <ForecastSplash
            error={error}
            isLeaving={isSplashLeaving}
            isPaused={isPromptPending || isUnavailable}
            progress={progress}
            showLocationPromptText={showLocationPromptText}
            status={status}
          />
        </div>
      ) : null}
    </div>
  );
}
