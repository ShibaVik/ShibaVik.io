
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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
}

const Portfolio: React.FC<PortfolioProps> = ({ balance, positions, totalPortfolioValue }) => {
  const { t } = useLanguage();
  
  const totalPnL = positions.reduce((sum, position) => {
    return sum + ((position.currentPrice - position.avgPrice) * position.amount);
  }, 0);

  const totalPnLPercentage = positions.length > 0 
    ? (totalPnL / (totalPortfolioValue - totalPnL)) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Résumé du Portefeuille</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Solde Disponible</p>
              <p className="text-2xl font-bold text-white">${balance.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Valeur Totale</p>
              <p className="text-2xl font-bold text-white">${totalPortfolioValue.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">P&L Total</p>
              <div className="flex items-center justify-center space-x-1">
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </p>
              </div>
              <p className={`text-sm ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ({totalPnL >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions */}
      {positions.length > 0 && (
        <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Positions Actives</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {positions.map((position, index) => {
                const pnl = (position.currentPrice - position.avgPrice) * position.amount;
                const pnlPercentage = ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100;
                
                return (
                  <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-bold text-white">{position.crypto}</h3>
                      <div className="flex items-center space-x-2">
                        {pnl >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                        <span className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Quantité</p>
                        <p className="text-white font-medium">{position.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Prix Moyen</p>
                        <p className="text-white font-medium">${position.avgPrice.toFixed(8)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Prix Actuel</p>
                        <p className="text-white font-medium">${position.currentPrice.toFixed(8)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Valeur</p>
                        <p className="text-white font-medium">${(position.amount * position.currentPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Portfolio;
