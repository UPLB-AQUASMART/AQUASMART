import { ChevronDown } from "lucide-react";
import type { ChartDropdownOption } from "../types";
import styles from "./ChartDropdown.module.css";

type ChartDropdownProps<T extends string> = {
  id: string;
  label: string;
  options: ChartDropdownOption<T>[];
  value: T;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: T) => void;
};

export function ChartDropdown<T extends string>({
  id,
  label,
  options,
  value,
  open,
  onOpenChange,
  onChange,
}: ChartDropdownProps<T>) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className={styles.filterRow}>
      <span id={`${id}-label`}>{label}</span>
      <div className={`${styles.dropdown} ${open ? styles.open : ""}`}>
        <button
          type="button"
          aria-labelledby={`${id}-label ${id}-button`}
          aria-haspopup="listbox"
          aria-expanded={open}
          id={`${id}-button`}
          onClick={() => onOpenChange(!open)}
        >
          <span>{selected.label}</span>
          <ChevronDown size={18} strokeWidth={2.4} />
        </button>
        {open && (
          <div
            className={styles.menu}
            role="listbox"
            aria-labelledby={`${id}-label`}
          >
            {options.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={option.value === value ? styles.selectedOption : ""}
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  onOpenChange(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
