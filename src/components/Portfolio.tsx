
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, ShoppingCart, TrendingDown as SellIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Position {
  crypto: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
}

interface PortfolioProps {
  positions: Position[];
  onSelectCrypto?: (crypto: { symbol: string; current_price: number; name: string; id: string }) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ positions, onSelectCrypto }) => {
  const { t } = useLanguage();
  const totalValue = positions.reduce((sum, pos) => sum + (pos.amount * pos.currentPrice), 0);
  const totalCost = positions.reduce((sum, pos) => sum + (pos.amount * pos.avgPrice), 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const handlePositionClick = (position: Position) => {
    if (onSelectCrypto) {
      onSelectCrypto({
        symbol: position.crypto,
        current_price: position.currentPrice,
        name: position.crypto,
        id: position.crypto.toLowerCase()
      });
    }
  };

  if (positions.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-8 text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">{t('noPositions')}</p>
          <p className="text-sm text-gray-500">{t('startTrading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Wallet className="h-5 w-5" />
            <span>{t('portfolioSummary')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">{t('totalValue')}</p>
              <p className="text-xl font-bold text-blue-400">
                ${totalValue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('totalCost')}</p>
              <p className="text-xl font-bold text-white">
                ${totalCost.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('totalPnL')}</p>
              <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">P&L %</p>
              <div className="flex items-center space-x-1">
                {totalPnLPercentage >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <p className={`text-xl font-bold ${totalPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Positions */}
      <div className="grid gap-4">
        {positions.map((position, index) => {
          const positionValue = position.amount * position.currentPrice;
          const positionCost = position.amount * position.avgPrice;
          const positionPnL = positionValue - positionCost;
          const positionPnLPercentage = (positionPnL / positionCost) * 100;

          return (
            <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-cyan-400/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{position.crypto}</h3>
                    <p className="text-sm text-gray-300">
                      {position.amount.toLocaleString()} tokens
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={positionPnL >= 0 ? "default" : "destructive"}
                      className={positionPnL >= 0 ? "bg-green-600" : "bg-red-600"}
                    >
                      {positionPnL >= 0 ? '+' : ''}{positionPnLPercentage.toFixed(2)}%
                    </Badge>
                    {onSelectCrypto && (
                      <Button
                        size="sm"
                        onClick={() => handlePositionClick(position)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">{t('avgPurchasePrice')}</p>
                    <p className="font-semibold text-gray-200">${position.avgPrice.toFixed(8)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t('currentPrice')}</p>
                    <p className="font-semibold text-gray-200">${position.currentPrice.toFixed(8)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Valeur</p>
                    <p className="font-semibold text-blue-400">${positionValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">P&L</p>
                    <p className={`font-semibold ${positionPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {positionPnL >= 0 ? '+' : ''}${positionPnL.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Portfolio;
