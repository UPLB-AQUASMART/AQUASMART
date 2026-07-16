"use client";

import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Droplet,
  Eye,
  Grid3X3,
  Info,
  Leaf,
  Lightbulb,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sprout,
  Waves,
} from "lucide-react";
import { useId, useState } from "react";
import {
  cropDemandFactor,
  defaultScenario,
  type IrrigationScenario,
} from "./irrigationScheduleData";
import styles from "./IrrigationScenarioSetup.module.css";

type IrrigationScenarioSetupProps = {
  onGenerate: (scenario: IrrigationScenario) => void;
};

const irrigationMethods = [
  { label: "Drip (85% efficient)", value: "Drip", efficiency: 85 },
  { label: "Sprinkler (75% efficient)", value: "Sprinkler", efficiency: 75 },
  { label: "Furrow (60% efficient)", value: "Furrow", efficiency: 60 },
  { label: "Flood (50% efficient)", value: "Flood", efficiency: 50 },
];

const soilRetention = {
  Sandy: "Low",
  Loamy: "Medium",
  Clay: "High",
  Silty: "Medium",
} as const;

type SimpleDropdownOption = {
  label: string;
  value: string;
};

function SimpleDropdown({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: SimpleDropdownOption[];
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownId = useId();
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  return (
    <div className={styles.dropdown}>
      <button
        type="button"
        aria-controls={dropdownId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
        onBlur={(event) => {
          if (
            !event.currentTarget.parentElement?.contains(event.relatedTarget)
          ) {
            setIsOpen(false);
          }
        }}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedOption?.label ?? value}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          className={styles.dropdownMenu}
          id={dropdownId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          onBlur={(event) => {
            if (
              !event.currentTarget.parentElement?.contains(event.relatedTarget)
            ) {
              setIsOpen(false);
            }
          }}
        >
          {options.map((option) => (
            <button
              type="button"
              aria-selected={option.value === value}
              key={option.value}
              role="option"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function previewDemand(
  fieldAreaHa: number,
  efficiency: number,
  cropType: string,
) {
  return (
    Math.round(
      fieldAreaHa *
        cropDemandFactor(cropType) *
        (100 / Math.max(efficiency, 1)) *
        6.7 *
        10,
    ) / 10
  );
}

function demandLevel(demand: number) {
  if (demand >= 18) return "High";
  if (demand <= 9) return "Low";
  return "Moderate";
}

export function IrrigationScenarioSetup({
  onGenerate,
}: IrrigationScenarioSetupProps) {
  const [scenario, setScenario] = useState<IrrigationScenario>(defaultScenario);
  const demand = previewDemand(
    scenario.fieldAreaHa,
    scenario.irrigationEfficiency,
    scenario.cropType,
  );
  const retention =
    soilRetention[scenario.soilType as keyof typeof soilRetention] ?? "Medium";

  const updateScenario = <Key extends keyof IrrigationScenario>(
    key: Key,
    value: IrrigationScenario[Key],
  ) => {
    setScenario((current) => ({ ...current, [key]: value }));
  };

  const useSampleSetup = () => setScenario(defaultScenario);

  return (
    <section className={styles.setup} aria-labelledby="irrigation-setup-title">
      <div className={styles.hero}>
        <img
          className={styles.heroImage}
          src="https://fruitgrowers.com/wp-content/uploads/2019/06/watering-crops.jpg"
          alt=""
        />
        <div className={styles.heroContent}>
          <h1 id="irrigation-setup-title">
            Irrigation Schedule
            <span>Configuration</span>
          </h1>
          <div className={styles.heroBottom}>
            <p>
              Set up crop, field, soil, and forecast conditions before
              generating an irrigation schedule for AQUASMART Mini.
            </p>
            <a
              className={styles.heroAction}
              href="#irrigation-config-panel"
              aria-label="View irrigation schedule configuration"
            >
              <Eye aria-hidden="true" size={31} strokeWidth={2.4} />
            </a>
          </div>
        </div>
      </div>
      <form
        id="irrigation-config-panel"
        className={styles.panel}
        onSubmit={(event) => {
          event.preventDefault();
          onGenerate(scenario);
        }}
      >
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <span className={styles.eyebrow}>Irrigation Planning Setup</span>
            <h2>Configure the schedule inputs before simulation.</h2>
            <p>
              Set up your crop, field, and forecast conditions before generating
              the irrigation schedule.
            </p>
          </div>
          <div className={styles.headerImage} aria-hidden="true" />
          <button
            className={styles.iconButton}
            type="button"
            aria-label="Configuration settings"
          >
            <Settings2 aria-hidden="true" />
          </button>
        </div>

        <div className={styles.configGrid}>
          <div className={styles.configCard}>
            <span className={styles.cardIcon} data-tone="green">
              <Sprout aria-hidden="true" />
            </span>
            <span className={styles.cardCopy}>
              <strong>Crop Type</strong>
              <small>Determines baseline water demand.</small>
            </span>
            <SimpleDropdown
              label="Crop type"
              value={scenario.cropType}
              onChange={(value) => updateScenario("cropType", value)}
              options={[
                { label: "Rice (Inbred)", value: "Rice (Inbred)" },
                { label: "Rice (Hybrid)", value: "Rice (Hybrid)" },
                { label: "Corn", value: "Corn" },
                { label: "Vegetables", value: "Vegetables" },
              ]}
            />
          </div>

          <div className={styles.configCard}>
            <span className={styles.cardIcon} data-tone="blue">
              <Grid3X3 aria-hidden="true" />
            </span>
            <span className={styles.cardCopy}>
              <strong>Field Area (hectares)</strong>
              <small>Sets the total area for irrigation planning.</small>
            </span>
            <strong className={styles.rangeValue}>
              {scenario.fieldAreaHa.toFixed(1)}
            </strong>
            <input
              min="0.5"
              max="10"
              step="0.1"
              type="range"
              value={scenario.fieldAreaHa}
              onChange={(event) =>
                updateScenario("fieldAreaHa", Number(event.target.value))
              }
            />
            <span className={styles.rangeLabels}>
              <small>0.5</small>
              <small>10.0</small>
            </span>
          </div>

          <div className={styles.configCard}>
            <span className={styles.cardIcon} data-tone="blue">
              <Waves aria-hidden="true" />
            </span>
            <span className={styles.cardCopy}>
              <strong>Irrigation Method</strong>
              <small>Affects application efficiency.</small>
            </span>
            <SimpleDropdown
              label="Irrigation method"
              value={scenario.irrigationMethod}
              onChange={(value) => {
                const method = irrigationMethods.find(
                  (item) => item.value === value,
                );
                updateScenario("irrigationMethod", value);
                updateScenario(
                  "irrigationEfficiency",
                  method?.efficiency ?? scenario.irrigationEfficiency,
                );
              }}
              options={irrigationMethods.map((method) => ({
                label: method.label,
                value: method.value,
              }))}
            />
          </div>

          <div className={styles.configCard}>
            <span className={styles.cardIcon} data-tone="green">
              <Leaf aria-hidden="true" />
            </span>
            <span className={styles.cardCopy}>
              <strong>Soil Type</strong>
              <small>Influences soil water holding capacity.</small>
            </span>
            <SimpleDropdown
              label="Soil type"
              value={scenario.soilType}
              onChange={(value) => updateScenario("soilType", value)}
              options={[
                { label: "Loamy", value: "Loamy" },
                { label: "Sandy", value: "Sandy" },
                { label: "Clay", value: "Clay" },
                { label: "Silty", value: "Silty" },
              ]}
            />
          </div>

          <div className={styles.configCard}>
            <span className={styles.cardIcon} data-tone="blue">
              <CalendarDays aria-hidden="true" />
            </span>
            <span className={styles.cardCopy}>
              <strong>Forecast Period</strong>
              <small>Defines the duration of weather forecast.</small>
            </span>
            <SimpleDropdown
              label="Forecast period"
              value={scenario.forecastPeriod}
              onChange={(value) => updateScenario("forecastPeriod", value)}
              options={[
                { label: "14-day forecast", value: "14-day forecast" },
                { label: "7-day forecast", value: "7-day forecast" },
              ]}
            />
          </div>
        </div>

        <section
          className={styles.preview}
          aria-labelledby="configuration-preview-title"
        >
          <div className={styles.previewHeader}>
            <span>
              <Eye aria-hidden="true" />
            </span>
            <div>
              <h2 id="configuration-preview-title">Configuration Preview</h2>
              <p>Quick summary of expected conditions based on your inputs.</p>
            </div>
          </div>

          <div className={styles.previewGrid}>
            <article>
              <Droplet aria-hidden="true" />
              <div>
                <h3>Estimated Water Demand</h3>
                <strong>{demand} mm/day</strong>
                <small>{demandLevel(demand)}</small>
              </div>
              <Info aria-hidden="true" />
            </article>
            <article>
              <Leaf aria-hidden="true" />
              <div>
                <h3>Soil Retention ({scenario.soilType})</h3>
                <strong>{retention}</strong>
                <small>Balanced retention</small>
              </div>
              <Info aria-hidden="true" />
            </article>
            <article>
              <ShieldCheck aria-hidden="true" />
              <div>
                <h3>Forecast Confidence</h3>
                <strong>{scenario.irrigationEfficiency - 7}%</strong>
                <small>Good</small>
              </div>
              <Info aria-hidden="true" />
            </article>
            <article>
              <CalendarDays aria-hidden="true" />
              <div>
                <h3>Schedule Horizon</h3>
                <strong>
                  {scenario.forecastPeriod.startsWith("14")
                    ? "14 days"
                    : "7 days"}
                </strong>
                <small>Open-Meteo window</small>
              </div>
              <Info aria-hidden="true" />
            </article>
          </div>
        </section>

        <div className={styles.actions}>
          <p>
            <Lightbulb aria-hidden="true" />
            <span>
              <strong>Tip:</strong> You can adjust these settings anytime before
              generating your schedule.
            </span>
          </p>
          <button
            className={styles.sampleButton}
            type="button"
            onClick={useSampleSetup}
          >
            <RefreshCw aria-hidden="true" />
            Use Sample Setup
          </button>
          <button className={styles.generateButton} type="submit">
            <CalendarDays aria-hidden="true" />
            Generate Irrigation Schedule
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}
