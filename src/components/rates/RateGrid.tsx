import type { Rate } from '../../types/rates';
import { RateCard } from './RateCard';

interface RateGridProps {
  rates: Rate[];
}

export function RateGrid({ rates }: RateGridProps) {
  // Ordenar de menor a mayor precio
  const sortedRates = [...rates].sort((a, b) => a.buy_price - b.buy_price);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedRates.map((rate) => (
        <RateCard key={rate.id} rate={rate} />
      ))}
    </div>
  );
}
