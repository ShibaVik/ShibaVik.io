
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PopularCrypto {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  contract_address?: string;
}

interface PopularCryptosProps {
  onSelectCrypto: (crypto: PopularCrypto) => void;
}

const PopularCryptos: React.FC<PopularCryptosProps> = ({ onSelectCrypto }) => {
  const { t } = useLanguage();

  // Static data for popular cryptos - in a real app, this would come from an API
  const popularCryptos: PopularCrypto[] = [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      current_price: 67234.50,
      price_change_percentage_24h: 2.4,
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      current_price: 3456.78,
      price_change_percentage_24h: -1.2,
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      current_price: 178.90,
      price_change_percentage_24h: 4.7,
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border-orange-500/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg">
            <Star className="h-5 w-5 text-white" />
          </div>
          <span>Cryptos Populaires</span>
        </CardTitle>
        <p className="text-sm text-gray-300">Commencez avec des actifs moins volatiles</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {popularCryptos.map((crypto) => (
            <div
              key={crypto.id}
              className="p-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600/50 hover:border-orange-400/50 transition-all duration-200 cursor-pointer group"
              onClick={() => onSelectCrypto(crypto)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-white text-lg">{crypto.symbol}</h3>
                  <p className="text-xs text-gray-300">{crypto.name}</p>
                </div>
                <div className={`flex items-center space-x-1 ${
                  crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendingUp className={`h-4 w-4 ${crypto.price_change_percentage_24h < 0 ? 'rotate-180' : ''}`} />
                  <span className="text-sm font-medium">
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text">
                  ${crypto.current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  Sélectionner
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularCryptos;
