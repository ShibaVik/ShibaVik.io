
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface Position {
  crypto: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
}

interface PortfolioProps {
  positions: Position[];
}

const Portfolio: React.FC<PortfolioProps> = ({ positions }) => {
  const totalValue = positions.reduce((sum, pos) => sum + (pos.amount * pos.currentPrice), 0);
  const totalCost = positions.reduce((sum, pos) => sum + (pos.amount * pos.avgPrice), 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  if (positions.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-8 text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Aucune position ouverte</p>
          <p className="text-sm text-gray-500">Commencez par acheter des memecoins!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Résumé du Portfolio</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Valeur totale</p>
              <p className="text-xl font-bold text-blue-400">
                ${totalValue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Coût total</p>
              <p className="text-xl font-bold">
                ${totalCost.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">P&L Total</p>
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
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{position.crypto}</h3>
                    <p className="text-sm text-gray-400">
                      {position.amount.toLocaleString()} tokens
                    </p>
                  </div>
                  <Badge 
                    variant={positionPnL >= 0 ? "default" : "destructive"}
                    className={positionPnL >= 0 ? "bg-green-600" : "bg-red-600"}
                  >
                    {positionPnL >= 0 ? '+' : ''}{positionPnLPercentage.toFixed(2)}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Prix moyen</p>
                    <p className="font-semibold">${position.avgPrice.toFixed(8)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Prix actuel</p>
                    <p className="font-semibold">${position.currentPrice.toFixed(8)}</p>
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
