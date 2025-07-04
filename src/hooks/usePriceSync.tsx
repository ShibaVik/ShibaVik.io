
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
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.pairs && data.pairs.length > 0) {
          const price = parseFloat(data.pairs[0].priceUsd);
          if (price && price > 0) {
            return {
              price,
              source: 'DexScreener',
              timestamp: new Date()
            };
          }
        }
      }
    } catch (error) {
      console.log('DexScreener error:', error);
    }
    return null;
  }, []);

  const fetchFromCoinGecko = useCallback(async (cryptoId: string, contractAddress?: string): Promise<PriceData | null> => {
    try {
      let url = '';
      
      if (contractAddress && contractAddress.startsWith('0x')) {
        url = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${contractAddress}`;
      } else if (cryptoId) {
        url = `https://api.coingecko.com/api/v3/coins/${cryptoId}`;
      }
      
      if (url) {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.market_data && data.market_data.current_price && data.market_data.current_price.usd) {
            return {
              price: data.market_data.current_price.usd,
              source: 'CoinGecko',
              timestamp: new Date()
            };
          }
        }
      }
    } catch (error) {
      console.log('CoinGecko error:', error);
    }
    return null;
  }, []);

  const fetchFromPumpFun = useCallback(async (contractAddress: string): Promise<PriceData | null> => {
    try {
      if (contractAddress.length > 30 && !contractAddress.startsWith('0x')) {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.pairs && data.pairs.length > 0) {
            const solanaPair = data.pairs.find(pair => pair.chainId === 'solana') || data.pairs[0];
            const price = parseFloat(solanaPair.priceUsd);
            if (price && price > 0) {
              return {
                price,
                source: 'Pump.fun/Solana',
                timestamp: new Date()
              };
            }
          }
        }
      }
    } catch (error) {
      console.log('Pump.fun error:', error);
    }
    return null;
  }, []);

  const syncPrices = useCallback(async () => {
    if (!crypto) return;

    setIsUpdating(true);
    const sources: Promise<PriceData | null>[] = [];

    if (crypto.contract_address) {
      if (crypto.contract_address.startsWith('0x')) {
        sources.push(fetchFromDexScreener(crypto.contract_address));
        sources.push(fetchFromCoinGecko(crypto.id, crypto.contract_address));
      } else if (crypto.contract_address.length > 30) {
        sources.push(fetchFromPumpFun(crypto.contract_address));
        sources.push(fetchFromDexScreener(crypto.contract_address));
      }
    } else if (crypto.id) {
      sources.push(fetchFromCoinGecko(crypto.id));
    }

    try {
      const results = await Promise.allSettled(sources);
      const validPrices: PriceData[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          validPrices.push(result.value);
        }
      });

      if (validPrices.length > 0) {
        const latestPrice = validPrices.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
        const avgPrice = validPrices.reduce((sum, p) => sum + p.price, 0) / validPrices.length;
        const priceToUse = Math.abs(latestPrice.price - avgPrice) / avgPrice < 0.05 ? latestPrice.price : avgPrice;

        setCurrentPrice(priceToUse);
        setPriceSource(latestPrice.source);
        setLastUpdate(new Date());
        setPriceHistory(prev => [latestPrice, ...prev.slice(0, 9)]);

        console.log(`Prix synchronisé pour ${crypto.symbol}: $${priceToUse} (${latestPrice.source})`);
      }
    } catch (error) {
      console.log('Erreur synchronisation prix:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [crypto, fetchFromDexScreener, fetchFromCoinGecko, fetchFromPumpFun]);

  useEffect(() => {
    if (!crypto) return;

    syncPrices();
    const interval = setInterval(syncPrices, 15000);
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
