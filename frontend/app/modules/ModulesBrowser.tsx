"use client";

import { Construction, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { LearningModule } from "@/app/data/home";
import { LearningModuleCard } from "./components/LearningModuleCard";
import styles from "./page.module.css";

const filters = [
  "All Modules",
  "Water Quality",
  "Groundwater",
  "AI & Technology",
  "Field Studies",
  "Climate Resilience",
];

export function ModulesBrowser({ modules }: { modules: LearningModule[] }) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(filters[0]);

  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return modules.filter((module) => {
      const matchesFilter =
        activeFilter === "All Modules" || module.category === activeFilter;
      const matchesQuery =
        !normalizedQuery ||
        `${module.code} ${module.title} ${module.description} ${module.category}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, modules, query]);

  return (
    <>
      <div className={styles.searchRow}>
        <label className={styles.searchField}>
          <span>Search modules</span>
          <Search size={18} strokeWidth={2.2} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search modules..."
            type="search"
            value={query}
          />
        </label>
        <button className={styles.searchButton} type="button">
          Search
        </button>
      </div>

      <div className={styles.filterRow} aria-label="Filter modules by topic">
        {filters.map((filter) => (
          <button
            className={`${styles.chip}${activeFilter === filter ? ` ${styles.activeChip}` : ""}`}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      <div className={styles.gridSection}>
        {modules.length === 0 ? (
          <div className={styles.wipContainer}>
            <Construction size={48} strokeWidth={1.5} className={styles.wipIcon} />
            <h2 className={styles.wipTitle}>Modules Coming Soon</h2>
            <p className={styles.wipDescription}>
              Learning modules are currently being prepared and will be available
              here once published. Check back soon for groundwater, sensor
              networks, irrigation planning, and other educational materials.
            </p>
            <span className={styles.wipBadge}>Work in Progress</span>
          </div>
        ) : (
          <>
            <div className={styles.materialsGrid}>
              {filteredModules.map((module) => (
                <LearningModuleCard module={module} key={module.code} />
              ))}
            </div>

            {filteredModules.length === 0 ? (
              <p className={styles.emptyState}>
                No modules match your search yet. Try another topic or keyword.
              </p>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
