
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

// Données de fallback pour assurer l'opérationnalité
const fallbackCryptos: CryptoData[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    current_price: 45000,
    price_change_percentage_24h: 2.5,
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    current_price: 2800,
    price_change_percentage_24h: 1.8,
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    current_price: 180,
    price_change_percentage_24h: 4.2,
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    current_price: 320,
    price_change_percentage_24h: -0.8,
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
  }
];

const PopularCryptos: React.FC<PopularCryptosProps> = ({ onSelectCrypto }) => {
  const { t } = useLanguage();
  const [cryptos, setCryptos] = useState<CryptoData[]>(fallbackCryptos);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Charger immédiatement avec les données de fallback
    fetchPopularCryptos();
    
    // Puis actualiser périodiquement
    const interval = setInterval(fetchPopularCryptos, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPopularCryptos = async () => {
    try {
      setLoading(true);
      const cryptoIds = ['bitcoin', 'ethereum', 'solana', 'binancecoin'];
      
      // Utiliser un timeout pour éviter les blocages
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const orderedData = cryptoIds.map(id => data.find((crypto: any) => crypto.id === id)).filter(Boolean);
          setCryptos(orderedData);
          setLastUpdate(new Date());
          console.log('Cryptos populaires mises à jour:', orderedData.map(c => c.symbol));
        }
      }
    } catch (error) {
      console.log('Utilisation des données de fallback:', error);
      // Garder les données de fallback ou les dernières données valides
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>{t('popularCryptos')}</span>
          </div>
          <div className="flex items-center space-x-2">
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>}
            <span className="text-xs text-green-400">
              ⚡ {new Intl.DateTimeFormat('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              }).format(lastUpdate)}
            </span>
          </div>
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
                <img 
                  src={crypto.image} 
                  alt={crypto.name} 
                  className="w-6 h-6"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="text-left">
                  <p className="font-semibold text-sm">{crypto.symbol.toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{crypto.name}</p>
                </div>
              </div>
              
              <div className="text-center w-full">
                <p className="font-bold text-white">${crypto.current_price.toLocaleString()}</p>
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
