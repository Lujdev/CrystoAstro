import { formatBs } from '../../lib/format';
import type { Rate } from '../../types/rates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface AverageCardProps {
  bcvRate: Rate;
  binanceRate: Rate;
}

export function AverageCard({ bcvRate, binanceRate }: AverageCardProps) {
  const average = (bcvRate.buy_price + binanceRate.buy_price) / 2;

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle>Promedio BCV + Binance</CardTitle>
        <CardDescription>Promedio de compra USD/USDT</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-3xl font-bold mb-4">Bs {formatBs(average)}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">BCV:</span>
            <span className="font-semibold">Bs {formatBs(bcvRate.buy_price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Binance:</span>
            <span className="font-semibold">Bs {formatBs(binanceRate.buy_price)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
