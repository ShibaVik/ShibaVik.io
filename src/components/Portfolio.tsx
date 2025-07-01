
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, ShoppingCart } from 'lucide-react';
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
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/50">
        <CardContent className="p-8 text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">{t('noPositions')}</p>
          <p className="text-sm text-gray-400">{t('startTrading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary - Improved colors */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span>{t('portfolioSummary')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-800/40 to-blue-800/40 rounded-lg border border-cyan-500/40">
              <p className="text-sm text-cyan-200">{t('totalValue')}</p>
              <p className="text-xl font-bold text-cyan-300">
                ${totalValue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-gray-800/40 to-gray-700/40 rounded-lg border border-gray-500/40">
              <p className="text-sm text-gray-200">{t('totalCost')}</p>
              <p className="text-xl font-bold text-white">
                ${totalCost.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-lg border ${totalPnL >= 0 
              ? 'bg-gradient-to-br from-green-800/40 to-emerald-800/40 border-green-500/40' 
              : 'bg-gradient-to-br from-red-800/40 to-rose-800/40 border-red-500/40'
            }`}>
              <p className={`text-sm ${totalPnL >= 0 ? 'text-green-200' : 'text-red-200'}`}>{t('totalPnL')}</p>
              <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-lg border ${totalPnLPercentage >= 0 
              ? 'bg-gradient-to-br from-green-800/40 to-emerald-800/40 border-green-500/40' 
              : 'bg-gradient-to-br from-red-800/40 to-rose-800/40 border-red-500/40'
            }`}>
              <p className={`text-sm ${totalPnLPercentage >= 0 ? 'text-green-200' : 'text-red-200'}`}>P&L %</p>
              <div className="flex items-center space-x-1">
                {totalPnLPercentage >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-300" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-300" />
                )}
                <p className={`text-xl font-bold ${totalPnLPercentage >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Positions - Better colors and mobile responsive */}
      <div className="grid gap-4">
        {positions.map((position, index) => {
          const positionValue = position.amount * position.currentPrice;
          const positionCost = position.amount * position.avgPrice;
          const positionPnL = positionValue - positionCost;
          const positionPnLPercentage = (positionPnL / positionCost) * 100;

          return (
            <Card key={index} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/50 hover:border-cyan-400/50 transition-all duration-200 cursor-pointer backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                  <div>
                    <h3 className="text-lg font-bold text-white">{position.crypto}</h3>
                    <p className="text-sm text-gray-300">
                      {position.amount.toLocaleString()} tokens
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={positionPnL >= 0 ? "default" : "destructive"}
                      className={positionPnL >= 0 
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
                        : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                      }
                    >
                      {positionPnL >= 0 ? '+' : ''}{positionPnLPercentage.toFixed(2)}%
                    </Badge>
                    {onSelectCrypto && (
                      <Button
                        size="sm"
                        onClick={() => handlePositionClick(position)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div className="p-2 bg-gradient-to-br from-blue-800/40 to-indigo-800/40 rounded border border-blue-500/40">
                    <p className="text-blue-200">{t('avgPurchasePrice')}</p>
                    <p className="font-semibold text-blue-300">${position.avgPrice.toFixed(8)}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-purple-800/40 to-pink-800/40 rounded border border-purple-500/40">
                    <p className="text-purple-200">{t('currentPrice')}</p>
                    <p className="font-semibold text-purple-300">${position.currentPrice.toFixed(8)}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-cyan-800/40 to-teal-800/40 rounded border border-cyan-500/40">
                    <p className="text-cyan-200">Valeur</p>
                    <p className="font-semibold text-cyan-300">${positionValue.toFixed(2)}</p>
                  </div>
                  <div className={`p-2 rounded border ${positionPnL >= 0 
                    ? 'bg-gradient-to-br from-green-800/40 to-emerald-800/40 border-green-500/40' 
                    : 'bg-gradient-to-br from-red-800/40 to-rose-800/40 border-red-500/40'
                  }`}>
                    <p className={positionPnL >= 0 ? 'text-green-200' : 'text-red-200'}>P&L</p>
                    <p className={`font-semibold ${positionPnL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
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
