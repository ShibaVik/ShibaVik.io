
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Position {
  crypto: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
}

interface PortfolioProps {
  balance: number;
  positions: Position[];
  totalPortfolioValue: number;
  onSelectCrypto?: (crypto: { id: string; symbol: string; name: string; current_price: number; price_change_percentage_24h: number; }) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ balance, positions, totalPortfolioValue, onSelectCrypto }) => {
  const { t } = useLanguage();

  const totalInvested = positions.reduce((sum, position) => sum + (position.amount * position.avgPrice), 0);
  const totalCurrentValue = positions.reduce((sum, position) => sum + (position.amount * position.currentPrice), 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const handlePositionClick = (position: Position) => {
    if (onSelectCrypto) {
      onSelectCrypto({
        id: position.crypto.toLowerCase(),
        symbol: position.crypto,
        name: position.crypto,
        current_price: position.currentPrice,
        price_change_percentage_24h: 0
      });
    }
  };

  if (positions.length === 0) {
    return (
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Wallet className="h-5 w-5 text-cyan-400" />
            <span>{t('portfolio')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Wallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">{t('noPositions')}</h3>
          <p className="text-gray-500">{t('startTrading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <DollarSign className="h-5 w-5 text-green-400" />
            <span>{t('portfolioSummary')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">{t('currentBalance')}</p>
              <p className="text-2xl font-bold text-white">${balance.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">{t('totalValue')}</p>
              <p className="text-2xl font-bold text-cyan-400">${totalPortfolioValue.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">{t('totalCost')}</p>
              <p className="text-2xl font-bold text-orange-400">${totalInvested.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">{t('totalPnL')}</p>
              <div className={`flex items-center justify-center space-x-1 ${
                totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ${Math.abs(totalPnL).toFixed(2)}
                  </p>
                  <p className="text-sm">
                    ({totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions */}
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Wallet className="h-5 w-5 text-cyan-400" />
            <span>Positions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position, index) => {
              const currentValue = position.amount * position.currentPrice;
              const investedValue = position.amount * position.avgPrice;
              const pnl = currentValue - investedValue;
              const pnlPercentage = (pnl / investedValue) * 100;

              return (
                <div 
                  key={index} 
                  className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handlePositionClick(position)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{position.crypto}</h3>
                      <p className="text-sm text-gray-400">{position.amount.toFixed(6)} tokens</p>
                    </div>
                    <div className={`text-right ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <div className="flex items-center space-x-1">
                        {pnl >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <div>
                          <p className="font-bold">${Math.abs(pnl).toFixed(2)}</p>
                          <p className="text-sm">({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">{t('avgPurchasePrice')}</p>
                      <p className="text-white font-medium">${position.avgPrice.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">{t('currentPrice')}</p>
                      <p className="text-white font-medium">${position.currentPrice.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Valeur investie</p>
                      <p className="text-orange-400 font-medium">${investedValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Valeur actuelle</p>
                      <p className="text-cyan-400 font-medium">${currentValue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;
