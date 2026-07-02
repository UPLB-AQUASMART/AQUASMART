type InputProps = {
  id: string;
  min: string;
  max: string;
  step: string;
  defaultValue: string;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
};

export function NumericInput({
  id,
  min,
  max,
  step,
  defaultValue,
  className,
  readOnly,
  disabled,
}: InputProps) {
  return (
    <input
      className={className}
      id={id}
      type="number"
      min={min}
      max={max}
      step={step}
      defaultValue={defaultValue}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
}

export function RangeInput({
  id,
  min,
  max,
  step,
  defaultValue,
  className,
}: InputProps) {
  return (
    <input
      className={className}
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      defaultValue={defaultValue}
    />
  );
}
