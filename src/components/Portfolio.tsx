
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortfolioPriceSync } from '@/hooks/usePortfolioPriceSync';
import { Button } from "@/components/ui/button";

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
  onUpdatePositions?: (updatedPositions: Position[]) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ 
  balance, 
  positions, 
  totalPortfolioValue, 
  onSelectCrypto,
  onUpdatePositions 
}) => {
  const { t, language } = useLanguage();
  const { portfolioPrices, syncAllPrices } = usePortfolioPriceSync(positions);

  // Calculer les positions avec les prix mis à jour
  const updatedPositions = positions.map(position => {
    const priceInfo = portfolioPrices[position.crypto];
    const currentPrice = priceInfo?.price || position.currentPrice;
    return {
      ...position,
      currentPrice
    };
  });

  // Mettre à jour les positions dans le composant parent si disponible
  React.useEffect(() => {
    if (onUpdatePositions && Object.keys(portfolioPrices).length > 0) {
      onUpdatePositions(updatedPositions);
    }
  }, [portfolioPrices, positions, onUpdatePositions]);

  const totalInvested = updatedPositions.reduce((sum, position) => sum + (position.amount * position.avgPrice), 0);
  const totalCurrentValue = updatedPositions.reduce((sum, position) => sum + (position.amount * position.currentPrice), 0);
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

  const handleManualSync = () => {
    syncAllPrices();
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
        <CardContent className="text-center py-8 sm:py-12">
          <Wallet className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">{t('noPositions')}</h3>
          <p className="text-gray-500 text-sm sm:text-base">{t('startTrading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Portfolio Summary */}
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-lg sm:text-xl">{t('portfolioSummary')}</span>
            </div>
            <Button 
              onClick={handleManualSync}
              variant="ghost" 
              size="sm"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">{t('currentBalance')}</p>
              <p className="text-lg sm:text-2xl font-bold text-white">${balance.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">{t('totalValue')}</p>
              <p className="text-lg sm:text-2xl font-bold text-cyan-400">${(balance + totalCurrentValue).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">{t('totalCost')}</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-400">${totalInvested.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">{t('totalPnL')}</p>
              <div className={`flex items-center justify-center space-x-1 ${
                totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold">
                    ${Math.abs(totalPnL).toFixed(2)}
                  </p>
                  <p className="text-xs sm:text-sm">
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
            <span className="text-lg sm:text-xl">{t('positions')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {updatedPositions.map((position, index) => {
              const currentValue = position.amount * position.currentPrice;
              const investedValue = position.amount * position.avgPrice;
              const pnl = currentValue - investedValue;
              const pnlPercentage = (pnl / investedValue) * 100;
              const priceInfo = portfolioPrices[position.crypto];

              return (
                <div 
                  key={index} 
                  className="bg-gray-800/80 rounded-lg p-3 sm:p-4 border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => handlePositionClick(position)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white truncate">{position.crypto}</h3>
                      <p className="text-xs sm:text-sm text-gray-400">{position.amount.toFixed(6)} tokens</p>
                      {/* Indicateur de mise à jour des prix */}
                      {priceInfo && (
                        <div className="flex items-center space-x-2 text-xs mt-1">
                          {priceInfo.isUpdating && (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-cyan-400"></div>
                          )}
                          {priceInfo.lastUpdate && (
                            <div className="flex items-center space-x-1 text-green-400">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                }).format(priceInfo.lastUpdate)}
                              </span>
                            </div>
                          )}
                          {priceInfo.source && (
                            <span className="text-gray-400">via {priceInfo.source}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`text-right ${pnl >= 0 ? 'text-green-400' : 'text-red-400'} ml-2`}>
                      <div className="flex items-center space-x-1">
                        {pnl >= 0 ? (
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                        <div>
                          <p className="font-bold text-sm sm:text-base">${Math.abs(pnl).toFixed(2)}</p>
                          <p className="text-xs">({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-400">{t('avgPurchasePrice')}</p>
                      <p className="text-white font-medium">${position.avgPrice.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">{t('currentPrice')}</p>
                      <p className="text-white font-medium">${position.currentPrice.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">{t('investedValue')}</p>
                      <p className="text-orange-400 font-medium">${investedValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">{t('currentValue')}</p>
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
