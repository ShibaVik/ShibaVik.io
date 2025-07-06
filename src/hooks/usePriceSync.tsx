
import { useState, useEffect, useCallback } from 'react';

interface PriceData {
  price: number;
  source: string;
  timestamp: Date;
}

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

export const usePriceSync = (crypto: CryptoData | null, positions?: Position[]) => {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [priceSource, setPriceSource] = useState<string>('');

  const fetchFromDexScreener = useCallback(async (contractAddress: string): Promise<PriceData | null> => {
    try {
      console.log(`Récupération prix DexScreener pour: ${contractAddress}`);
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.pairs && data.pairs.length > 0) {
          // Prioriser les paires avec le plus de liquidité
          const bestPair = data.pairs.sort((a: any, b: any) => 
            (parseFloat(b.liquidity?.usd || '0')) - (parseFloat(a.liquidity?.usd || '0'))
          )[0];
          
          const price = parseFloat(bestPair.priceUsd);
          if (price && price > 0) {
            console.log(`Prix DexScreener trouvé: $${price}`);
            return {
              price,
              source: 'DexScreener',
              timestamp: new Date()
            };
          }
        }
      }
    } catch (error) {
      console.log('Erreur DexScreener:', error);
    }
    return null;
  }, []);

  const fetchFromCoinGecko = useCallback(async (cryptoId: string): Promise<PriceData | null> => {
    try {
      console.log(`Récupération prix CoinGecko pour: ${cryptoId}`);
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const coinKey = Object.keys(data)[0];
        if (coinKey && data[coinKey]?.usd) {
          console.log(`Prix CoinGecko trouvé: $${data[coinKey].usd}`);
          return {
            price: data[coinKey].usd,
            source: 'CoinGecko',
            timestamp: new Date()
          };
        }
      }
    } catch (error) {
      console.log('Erreur CoinGecko:', error);
    }
    return null;
  }, []);

  const syncPrices = useCallback(async () => {
    if (!crypto) return;

    setIsUpdating(true);
    console.log(`🔄 Synchronisation prix pour ${crypto.symbol}`);

    try {
      let priceData: PriceData | null = null;

      // Prioriser DexScreener pour les cryptos avec adresse de contrat
      if (crypto.contract_address) {
        priceData = await fetchFromDexScreener(crypto.contract_address);
      }

      // Fallback vers CoinGecko si DexScreener échoue ou pour les cryptos populaires
      if (!priceData && crypto.id && crypto.id !== crypto.contract_address) {
        priceData = await fetchFromCoinGecko(crypto.id);
      }

      if (priceData) {
        setCurrentPrice(priceData.price);
        setPriceSource(priceData.source);
        setLastUpdate(new Date());
        setPriceHistory(prev => [priceData!, ...prev.slice(0, 9)]);
        console.log(`✅ Prix synchronisé: $${priceData.price} (${priceData.source})`);
      } else {
        console.warn(`❌ Aucun prix trouvé pour ${crypto.symbol}`);
      }
    } catch (error) {
      console.error('Erreur synchronisation prix:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [crypto, fetchFromDexScreener, fetchFromCoinGecko]);

  useEffect(() => {
    if (!crypto) return;

    // Synchronisation immédiate
    syncPrices();
    
    // Synchronisation toutes les minutes
    const interval = setInterval(syncPrices, 60000);
    return () => clearInterval(interval);
  }, [crypto, syncPrices]);

  const isPriceConsistent = useCallback(() => {
    if (priceHistory.length < 2) return true;
    
    const recent = priceHistory.slice(0, 3);
    const maxPrice = Math.max(...recent.map(p => p.price));
    const minPrice = Math.min(...recent.map(p => p.price));
    
    return (maxPrice - minPrice) / minPrice < 0.1;
  }, [priceHistory]);

  return {
    currentPrice: currentPrice || crypto?.current_price || 0,
    lastUpdate,
    isUpdating,
    priceSource,
    priceHistory,
    isPriceConsistent: isPriceConsistent(),
    syncPrices
  };
};
