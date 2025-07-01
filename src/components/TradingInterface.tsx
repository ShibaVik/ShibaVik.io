
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  const [buyAmount, setBuyAmount] = useState('');
  const [buyDollarAmount, setBuyDollarAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [sellDollarAmount, setSellDollarAmount] = useState('');
  const [buyMode, setBuyMode] = useState<'tokens' | 'dollars'>('tokens');
  const [sellMode, setSellMode] = useState<'tokens' | 'dollars'>('tokens');

  const currentPosition = positions.find(p => p.crypto === cryptoData.symbol);
  const maxBuyAmount = Math.floor(balance / cryptoData.current_price);
  const maxSellAmount = currentPosition?.amount || 0;

  const handleBuyAmountChange = (value: string, mode: 'tokens' | 'dollars') => {
    if (mode === 'tokens') {
      setBuyAmount(value);
      setBuyDollarAmount((parseFloat(value) * cryptoData.current_price).toFixed(2));
    } else {
      setBuyDollarAmount(value);
      setBuyAmount((parseFloat(value) / cryptoData.current_price).toFixed(0));
    }
  };

  const handleSellAmountChange = (value: string, mode: 'tokens' | 'dollars') => {
    if (mode === 'tokens') {
      setSellAmount(value);
      setSellDollarAmount((parseFloat(value) * cryptoData.current_price).toFixed(2));
    } else {
      setSellDollarAmount(value);
      setSellAmount((parseFloat(value) / cryptoData.current_price).toFixed(0));
    }
  };

  const handleBuy = () => {
    const amount = parseFloat(buyAmount);
    if (amount > 0 && amount <= maxBuyAmount) {
      onTrade('buy', amount);
      setBuyAmount('');
      setBuyDollarAmount('');
    }
  };

  const handleSell = () => {
    const amount = parseFloat(sellAmount);
    if (amount > 0 && amount <= maxSellAmount) {
      onTrade('sell', amount);
      setSellAmount('');
      setSellDollarAmount('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Buy Section */}
      <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Acheter {cryptoData.symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={buyMode === 'tokens' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBuyMode('tokens')}
              className={buyMode === 'tokens' 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-gray-600 text-gray-300 hover:bg-gray-700"
              }
            >
              Tokens
            </Button>
            <Button
              variant={buyMode === 'dollars' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBuyMode('dollars')}
              className={buyMode === 'dollars' 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-gray-600 text-gray-300 hover:bg-gray-700"
              }
            >
              Total USD
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 font-medium">
              {buyMode === 'tokens' ? 'Quantité' : 'Montant Total'}
            </Label>
            {buyMode === 'tokens' ? (
              <Input
                type="number"
                placeholder="Nombre de tokens"
                value={buyAmount}
                onChange={(e) => handleBuyAmountChange(e.target.value, 'tokens')}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                max={maxBuyAmount}
              />
            ) : (
              <Input
                type="number"
                placeholder="Montant en dollars"
                value={buyDollarAmount}
                onChange={(e) => handleBuyAmountChange(e.target.value, 'dollars')}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                max={balance}
              />
            )}
            <p className="text-xs text-gray-400">
              Maximum: {maxBuyAmount.toLocaleString()} tokens (${balance.toFixed(2)})
            </p>
          </div>

          {(buyAmount || buyDollarAmount) && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Prix unitaire:</span>
                <span className="text-white">${cryptoData.current_price.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Quantité:</span>
                <span className="text-white">{parseFloat(buyAmount || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-gray-600 pt-2">
                <span>Total:</span>
                <span className="text-green-400">
                  ${buyDollarAmount || (parseFloat(buyAmount || '0') * cryptoData.current_price).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleBuy}
            disabled={!buyAmount || parseFloat(buyAmount) <= 0 || parseFloat(buyAmount) > maxBuyAmount}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Acheter
          </Button>
        </CardContent>
      </Card>

      {/* Sell Section */}
      <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5" />
            <span>Vendre {cryptoData.symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={sellMode === 'tokens' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSellMode('tokens')}
              className={sellMode === 'tokens' 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "border-gray-600 text-gray-300 hover:bg-gray-700"
              }
            >
              Tokens
            </Button>
            <Button
              variant={sellMode === 'dollars' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSellMode('dollars')}
              className={sellMode === 'dollars' 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "border-gray-600 text-gray-300 hover:bg-gray-700"
              }
            >
              Total USD
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 font-medium">
              {sellMode === 'tokens' ? 'Quantité' : 'Montant Total'}
            </Label>
            {sellMode === 'tokens' ? (
              <Input
                type="number"
                placeholder="Nombre de tokens"
                value={sellAmount}
                onChange={(e) => handleSellAmountChange(e.target.value, 'tokens')}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                max={maxSellAmount}
              />
            ) : (
              <Input
                type="number"
                placeholder="Montant en dollars"
                value={sellDollarAmount}
                onChange={(e) => handleSellAmountChange(e.target.value, 'dollars')}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                max={maxSellAmount * cryptoData.current_price}
              />
            )}
            <p className="text-xs text-gray-400">
              Position: {maxSellAmount.toLocaleString()} tokens
            </p>
          </div>

          {currentPosition && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Prix d'achat moyen:</span>
                <span className="text-white">${currentPosition.avgPrice.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Prix actuel:</span>
                <span className="text-white">${cryptoData.current_price.toFixed(8)}</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-gray-600 pt-2">
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

          {(sellAmount || sellDollarAmount) && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
              <div className="flex justify-between font-bold text-white">
                <span>Total de vente:</span>
                <span className="text-red-400">
                  ${sellDollarAmount || (parseFloat(sellAmount || '0') * cryptoData.current_price).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSell}
            disabled={!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > maxSellAmount || !currentPosition}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Vendre
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingInterface;
