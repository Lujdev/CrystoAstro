import { Button } from '../ui/button';

interface PeriodSelectorProps {
  value: number;
  onChange: (days: number) => void;
}

const periods = [
  { label: '7D', value: 7 },
  { label: '15D', value: 15 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={value === period.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
