
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Buy Section */}
      <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-400">
            <TrendingUp className="h-5 w-5" />
            <span>{t('buy')} {cryptoData.symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={buyMode === 'tokens' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBuyMode('tokens')}
              className="text-white"
            >
              Tokens
            </Button>
            <Button
              variant={buyMode === 'dollars' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBuyMode('dollars')}
              className="text-white"
            >
              USD
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200">{t('quantity')}</Label>
            {buyMode === 'tokens' ? (
              <Input
                type="number"
                placeholder={t('amountInTokens')}
                value={buyAmount}
                onChange={(e) => handleBuyAmountChange(e.target.value, 'tokens')}
                className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
                max={maxBuyAmount}
              />
            ) : (
              <Input
                type="number"
                placeholder={t('amountInDollars')}
                value={buyDollarAmount}
                onChange={(e) => handleBuyAmountChange(e.target.value, 'dollars')}
                className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
                max={balance}
              />
            )}
            <p className="text-xs text-gray-300">
              {t('maximum')}: {maxBuyAmount.toLocaleString()} tokens (${balance.toFixed(2)})
            </p>
          </div>

          {(buyAmount || buyDollarAmount) && (
            <div className="p-3 bg-gray-700/50 rounded-lg space-y-1">
              <div className="flex justify-between text-gray-200">
                <span>{t('unitPrice')}:</span>
                <span>${cryptoData.current_price.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>{t('quantity')}:</span>
                <span>{parseFloat(buyAmount || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span>{t('total')}:</span>
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
            {t('buy')}
          </Button>
        </CardContent>
      </Card>

      {/* Sell Section */}
      <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-400">
            <TrendingDown className="h-5 w-5" />
            <span>{t('sell')} {cryptoData.symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={sellMode === 'tokens' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSellMode('tokens')}
              className="text-white"
            >
              Tokens
            </Button>
            <Button
              variant={sellMode === 'dollars' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSellMode('dollars')}
              className="text-white"
            >
              USD
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200">{t('quantity')}</Label>
            {sellMode === 'tokens' ? (
              <Input
                type="number"
                placeholder={t('amountInTokens')}
                value={sellAmount}
                onChange={(e) => handleSellAmountChange(e.target.value, 'tokens')}
                className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
                max={maxSellAmount}
              />
            ) : (
              <Input
                type="number"
                placeholder={t('amountInDollars')}
                value={sellDollarAmount}
                onChange={(e) => handleSellAmountChange(e.target.value, 'dollars')}
                className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
                max={maxSellAmount * cryptoData.current_price}
              />
            )}
            <p className="text-xs text-gray-300">
              {t('position')}: {maxSellAmount.toLocaleString()} tokens
            </p>
          </div>

          {currentPosition && (
            <div className="p-3 bg-gray-700/50 rounded-lg space-y-1">
              <div className="flex justify-between text-gray-200">
                <span>{t('avgPurchasePrice')}:</span>
                <span>${currentPosition.avgPrice.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>{t('currentPrice')}:</span>
                <span>${cryptoData.current_price.toFixed(8)}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
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
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex justify-between font-bold text-white">
                <span>{t('saleTotal')}:</span>
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
            {t('sell')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingInterface;
