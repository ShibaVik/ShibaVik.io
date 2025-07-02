
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface PopularCryptosProps {
  onSelectCrypto: (crypto: CryptoData) => void;
}

const PopularCryptos: React.FC<PopularCryptosProps> = ({ onSelectCrypto }) => {
  const { t } = useLanguage();
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularCryptos();
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchPopularCryptos, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPopularCryptos = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1&sparkline=false&price_change_percentage=24h'
      );
      
      if (response.ok) {
        const data = await response.json();
        setCryptos(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des cryptos populaires:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>Cryptos Populaires</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Star className="h-5 w-5 text-yellow-400" />
          <span>Cryptos Populaires</span>
          <span className="text-xs text-green-400 ml-2">⚡ {t('priceUpdated')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cryptos.map((crypto) => (
            <Button
              key={crypto.id}
              onClick={() => onSelectCrypto(crypto)}
              variant="outline"
              className="bg-gray-800/80 border-gray-600 hover:bg-gray-700/80 text-white p-4 h-auto flex flex-col items-center space-y-2 transition-all duration-200 hover:border-cyan-400/50"
            >
              <div className="flex items-center space-x-2">
                <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold text-sm">{crypto.symbol.toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{crypto.name}</p>
                </div>
              </div>
              
              <div className="text-center w-full">
                <p className="font-bold text-white">${crypto.current_price.toFixed(4)}</p>
                <div className={`flex items-center justify-center space-x-1 ${
                  crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {crypto.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="text-xs font-medium">
                    {crypto.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularCryptos;
