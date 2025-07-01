
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Buy Section - Improved colors */}
      <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span>{t('buy')} {cryptoData.symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={buyMode === 'tokens' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBuyMode('tokens')}
              className={buyMode === 'tokens' 
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
                : "border-green-400/50 text-green-300 hover:bg-green-500/10"
              }
            >
              Tokens
            </Button>
            <Button
              variant={buyMode === 'dollars' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBuyMode('dollars')}
              className={buyMode === 'dollars' 
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
                : "border-green-400/50 text-green-300 hover:bg-green-500/10"
              }
            >
              USD
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-green-200 font-medium">{t('quantity')}</Label>
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
            <p className="text-xs text-green-300">
              {t('maximum')}: {maxBuyAmount.toLocaleString()} tokens (${balance.toFixed(2)})
            </p>
          </div>

          {(buyAmount || buyDollarAmount) && (
            <div className="p-3 bg-gradient-to-br from-green-800/40 to-emerald-800/40 rounded-lg border border-green-500/40 space-y-1">
              <div className="flex justify-between text-green-200">
                <span>{t('unitPrice')}:</span>
                <span className="text-white">${cryptoData.current_price.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-green-200">
                <span>{t('quantity')}:</span>
                <span className="text-white">{parseFloat(buyAmount || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span>{t('total')}:</span>
                <span className="text-green-300">
                  ${buyDollarAmount || (parseFloat(buyAmount || '0') * cryptoData.current_price).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleBuy}
            disabled={!buyAmount || parseFloat(buyAmount) <= 0 || parseFloat(buyAmount) > maxBuyAmount}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {t('buy')}
          </Button>
        </CardContent>
      </Card>

      {/* Sell Section - Improved colors */}
      <Card className="bg-gradient-to-br from-red-900/30 to-rose-900/30 border-red-500/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="p-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <span>{t('sell')} {cryptoData.symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={sellMode === 'tokens' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSellMode('tokens')}
              className={sellMode === 'tokens' 
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" 
                : "border-red-400/50 text-red-300 hover:bg-red-500/10"
              }
            >
              Tokens
            </Button>
            <Button
              variant={sellMode === 'dollars' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSellMode('dollars')}
              className={sellMode === 'dollars' 
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" 
                : "border-red-400/50 text-red-300 hover:bg-red-500/10"
              }
            >
              USD
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-red-200 font-medium">{t('quantity')}</Label>
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
            <p className="text-xs text-red-300">
              {t('position')}: {maxSellAmount.toLocaleString()} tokens
            </p>
          </div>

          {currentPosition && (
            <div className="p-3 bg-gradient-to-br from-red-800/40 to-rose-800/40 rounded-lg border border-red-500/40 space-y-1">
              <div className="flex justify-between text-red-200">
                <span>{t('avgPurchasePrice')}:</span>
                <span className="text-white">${currentPosition.avgPrice.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-red-200">
                <span>{t('currentPrice')}:</span>
                <span className="text-white">${cryptoData.current_price.toFixed(8)}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span>P&L:</span>
                <span className={
                  (cryptoData.current_price - currentPosition.avgPrice) >= 0 
                    ? "text-green-300" 
                    : "text-red-300"
                }>
                  {((cryptoData.current_price - currentPosition.avgPrice) / currentPosition.avgPrice * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {(sellAmount || sellDollarAmount) && (
            <div className="p-3 bg-gradient-to-br from-red-800/40 to-rose-800/40 rounded-lg border border-red-500/40">
              <div className="flex justify-between font-bold text-white">
                <span>{t('saleTotal')}:</span>
                <span className="text-red-300">
                  ${sellDollarAmount || (parseFloat(sellAmount || '0') * cryptoData.current_price).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSell}
            disabled={!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > maxSellAmount || !currentPosition}
            className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/20"
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
