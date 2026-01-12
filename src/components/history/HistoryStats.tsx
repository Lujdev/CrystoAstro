import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { formatBs, formatVariation } from '../../lib/format';
import type { HistoryStats as IHistoryStats } from '../../types/rates';
import { Card, CardContent } from '../ui/card';

interface HistoryStatsProps {
  stats: IHistoryStats;
}

export function HistoryStats({ stats }: HistoryStatsProps) {
  const getIcon = (val: number) => {
    if (val > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (val < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const variationColor = stats.changePercent >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Precio Promedio</div>
          <div className="text-2xl font-bold">Bs {formatBs(stats.avg)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Mínimo</div>
          <div className="text-2xl font-bold">Bs {formatBs(stats.min)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Máximo</div>
          <div className="text-2xl font-bold">Bs {formatBs(stats.max)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Variación</div>
          <div className={`text-2xl font-bold flex items-center gap-2 ${variationColor}`}>
            {getIcon(stats.changePercent)}
            {formatVariation(stats.changePercent)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.change >= 0 ? '+' : ''} Bs {formatBs(stats.change)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
