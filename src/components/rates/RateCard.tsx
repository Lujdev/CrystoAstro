import { formatBs, formatTimeAgo, formatVariation } from '../../lib/format';
import type { Rate } from '../../types/rates';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';

interface RateCardProps {
  rate: Rate;
}

export function RateCard({ rate }: RateCardProps) {
  const variationColor = rate.variation_24h >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{rate.currency_pair}</h3>
          <span className={`text-sm font-medium ${variationColor}`}>
            {formatVariation(rate.variation_24h)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div>
          <p className="text-sm text-muted-foreground">Compra</p>
          <p className="text-2xl font-bold">Bs {formatBs(rate.buy_price)}</p>
        </div>

        {rate.sell_price && (
          <div>
            <p className="text-sm text-muted-foreground">Venta</p>
            <p className="text-xl font-semibold">Bs {formatBs(rate.sell_price)}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground border-t pt-3">
        <div className="flex justify-between w-full">
          <span>{rate.exchange_code}</span>
          <span>{formatTimeAgo(rate.last_updated)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
