import { useState } from 'react';
import type { ExchangeCategory, Rate } from '../../types/rates';
import { EXCHANGE_CATEGORIES } from '../../types/rates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AverageCard } from './AverageCard';
import { RateGrid } from './RateGrid';

interface RateTabsProps {
  rates: Rate[];
}

export function RateTabs({ rates }: RateTabsProps) {
  const [activeTab, setActiveTab] = useState<ExchangeCategory>('BCV');

  const filterRates = (category: ExchangeCategory) => {
    const exchanges = EXCHANGE_CATEGORIES[category];
    return rates.filter((rate) => exchanges.includes(rate.exchange_code));
  };

  const bcvRate = rates.find((r) => r.exchange_code === 'BCV' && r.currency_pair === 'USD/VES');
  const binanceRate = rates.find(
    (r) => r.exchange_code === 'BINANCE_P2P' && r.currency_pair === 'USDT/VES',
  );

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ExchangeCategory)}>
      <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-6">
        <TabsTrigger value="BCV">BCV</TabsTrigger>
        <TabsTrigger value="Crypto">Crypto</TabsTrigger>
        <TabsTrigger value="Otras">Otras</TabsTrigger>
      </TabsList>

      <TabsContent value="BCV" className="space-y-4">
        {bcvRate && binanceRate && <AverageCard bcvRate={bcvRate} binanceRate={binanceRate} />}
        <RateGrid rates={filterRates('BCV')} />
      </TabsContent>

      <TabsContent value="Crypto">
        <RateGrid rates={filterRates('Crypto')} />
      </TabsContent>

      <TabsContent value="Otras">
        <RateGrid rates={filterRates('Otras')} />
      </TabsContent>
    </Tabs>
  );
}
