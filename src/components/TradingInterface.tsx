
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  contract_address?: string;
}

interface Position {
  crypto: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
}

interface TradingInterfaceProps {
  cryptoData: CryptoData;
  balance: number;
  onTrade: (type: 'buy' | 'sell', amount: number) => void;
  positions: Position[];
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({ 
  cryptoData, 
  balance, 
  onTrade,
  positions 
}) => {
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');

  const currentPosition = positions.find(p => p.crypto === cryptoData.symbol);
  const maxBuyAmount = Math.floor(balance / cryptoData.current_price);
  const maxSellAmount = currentPosition?.amount || 0;

  const handleBuy = () => {
    const amount = parseFloat(buyAmount);
    if (amount > 0 && amount <= maxBuyAmount) {
      onTrade('buy', amount);
      setBuyAmount('');
    }
  };

  const handleSell = () => {
    const amount = parseFloat(sellAmount);
    if (amount > 0 && amount <= maxSellAmount) {
      onTrade('sell', amount);
      setSellAmount('');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Buy Section */}
      <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-400">
            <TrendingUp className="h-5 w-5" />
            <span>ACHETER {cryptoData.symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quantité</Label>
            <Input
              type="number"
              placeholder="Nombre de tokens"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="bg-gray-700 border-gray-600"
              max={maxBuyAmount}
            />
            <p className="text-xs text-gray-400">
              Maximum: {maxBuyAmount.toLocaleString()} tokens
            </p>
          </div>

          {buyAmount && (
            <div className="p-3 bg-gray-700/50 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Prix unitaire:</span>
                <span>${cryptoData.current_price.toFixed(8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quantité:</span>
                <span>{parseFloat(buyAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-green-400">
                  ${(parseFloat(buyAmount) * cryptoData.current_price).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleBuy}
            disabled={!buyAmount || parseFloat(buyAmount) <= 0 || parseFloat(buyAmount) > maxBuyAmount}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            ACHETER
          </Button>
        </CardContent>
      </Card>

      {/* Sell Section */}
      <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-400">
            <TrendingDown className="h-5 w-5" />
            <span>VENDRE {cryptoData.symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quantité</Label>
            <Input
              type="number"
              placeholder="Nombre de tokens"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="bg-gray-700 border-gray-600"
              max={maxSellAmount}
            />
            <p className="text-xs text-gray-400">
              Position: {maxSellAmount.toLocaleString()} tokens
            </p>
          </div>

          {currentPosition && (
            <div className="p-3 bg-gray-700/50 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Prix d'achat moyen:</span>
                <span>${currentPosition.avgPrice.toFixed(8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Prix actuel:</span>
                <span>${cryptoData.current_price.toFixed(8)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>P&L:</span>
                <span className={
                  (cryptoData.current_price - currentPosition.avgPrice) >= 0 
                    ? "text-green-400" 
                    : "text-red-400"
                }>
                  {((cryptoData.current_price - currentPosition.avgPrice) / currentPosition.avgPrice * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {sellAmount && (
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex justify-between font-bold">
                <span>Total de vente:</span>
                <span className="text-red-400">
                  ${(parseFloat(sellAmount) * cryptoData.current_price).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSell}
            disabled={!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > maxSellAmount || !currentPosition}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            VENDRE
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingInterface;
