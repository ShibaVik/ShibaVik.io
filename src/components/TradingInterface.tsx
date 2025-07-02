
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [inputMode, setInputMode] = useState<'tokens' | 'usd'>('tokens');
  const [tokenAmount, setTokenAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');

  const position = positions.find(p => p.crypto === cryptoData.symbol);
  const maxTokens = position ? position.amount : 0;
  const maxUSD = tradeType === 'buy' ? balance : (maxTokens * cryptoData.current_price);

  // Synchroniser les montants quand l'un change
  useEffect(() => {
    if (inputMode === 'tokens' && tokenAmount) {
      const usd = parseFloat(tokenAmount) * cryptoData.current_price;
      setUsdAmount(usd.toFixed(2));
    } else if (inputMode === 'usd' && usdAmount) {
      const tokens = parseFloat(usdAmount) / cryptoData.current_price;
      setTokenAmount(tokens.toFixed(6));
    }
  }, [tokenAmount, usdAmount, inputMode, cryptoData.current_price]);

  const handleTrade = () => {
    const amount = parseFloat(tokenAmount);
    if (amount > 0) {
      onTrade(tradeType, amount);
      setTokenAmount('');
      setUsdAmount('');
    }
  };

  const setMaxAmount = () => {
    if (tradeType === 'buy') {
      const maxTokensFromBalance = balance / cryptoData.current_price;
      setTokenAmount(maxTokensFromBalance.toFixed(6));
      setUsdAmount(balance.toFixed(2));
    } else {
      setTokenAmount(maxTokens.toFixed(6));
      setUsdAmount((maxTokens * cryptoData.current_price).toFixed(2));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Crypto Info */}
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{cryptoData.symbol.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{cryptoData.symbol}</h2>
                <p className="text-sm text-gray-400">{cryptoData.name}</p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t('currentPrice')}</span>
            <span className="text-2xl font-bold text-white">${cryptoData.current_price.toFixed(8)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400">24h Change</span>
            <div className={`flex items-center space-x-1 ${
              cryptoData.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {cryptoData.price_change_percentage_24h >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-bold">
                {cryptoData.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {position && (
            <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">{t('position')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('quantity')}</span>
                  <span className="text-white">{position.amount.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('avgPurchasePrice')}</span>
                  <span className="text-white">${position.avgPrice.toFixed(8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Valeur actuelle</span>
                  <span className="text-cyan-400">${(position.amount * cryptoData.current_price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trading Panel */}
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">{t('trading')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trade Type Selection */}
          <div className="flex space-x-2">
            <Button
              onClick={() => setTradeType('buy')}
              className={`flex-1 ${
                tradeType === 'buy'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  : 'bg-gray-800/80 text-gray-300 hover:text-white border border-gray-600'
              }`}
            >
              {t('buy')}
            </Button>
            <Button
              onClick={() => setTradeType('sell')}
              disabled={!position || position.amount === 0}
              className={`flex-1 ${
                tradeType === 'sell'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  : 'bg-gray-800/80 text-gray-300 hover:text-white border border-gray-600'
              }`}
            >
              {t('sell')}
            </Button>
          </div>

          {/* Input Mode Selection */}
          <div className="space-y-2">
            <Label className="text-gray-200">Mode de saisie</Label>
            <Select value={inputMode} onValueChange={(value: 'tokens' | 'usd') => setInputMode(value)}>
              <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="tokens" className="text-gray-100 hover:bg-gray-700">
                  {t('amountInTokens')}
                </SelectItem>
                <SelectItem value="usd" className="text-gray-100 hover:bg-gray-700">
                  {t('amountInDollars')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-gray-200">
                  {inputMode === 'tokens' ? t('quantity') : t('amountInDollars')}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={setMaxAmount}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  {t('maximum')}: {inputMode === 'tokens' 
                    ? (tradeType === 'buy' 
                      ? (balance / cryptoData.current_price).toFixed(6)
                      : maxTokens.toFixed(6)
                    )
                    : maxUSD.toFixed(2)
                  }
                </Button>
              </div>
              <Input
                type="number"
                placeholder={inputMode === 'tokens' ? "0.000000" : "0.00"}
                value={inputMode === 'tokens' ? tokenAmount : usdAmount}
                onChange={(e) => {
                  if (inputMode === 'tokens') {
                    setTokenAmount(e.target.value);
                  } else {
                    setUsdAmount(e.target.value);
                  }
                }}
                className="bg-gray-800/80 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('unitPrice')}</span>
                <span className="text-white">${cryptoData.current_price.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('quantity')}</span>
                <span className="text-white">{tokenAmount || '0'} {cryptoData.symbol}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-300">{t('total')}</span>
                <span className="text-cyan-400">${usdAmount || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Trade Button */}
          <Button
            onClick={handleTrade}
            disabled={!tokenAmount || parseFloat(tokenAmount) <= 0}
            className={`w-full py-3 text-lg font-bold ${
              tradeType === 'buy'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
            }`}
          >
            <DollarSign className="h-5 w-5 mr-2" />
            {tradeType === 'buy' ? t('buy') : t('sell')} {cryptoData.symbol}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingInterface;
