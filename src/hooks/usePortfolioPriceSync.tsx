
import { useState, useEffect, useCallback } from 'react';

interface PriceData {
  price: number;
  source: string;
  timestamp: Date;
}

interface Position {
  crypto: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
}

interface PortfolioPrices {
  [symbol: string]: {
    price: number;
    source: string;
    lastUpdate: Date;
    isUpdating: boolean;
  };
}

export const usePortfolioPriceSync = (positions: Position[]) => {
  const [portfolioPrices, setPortfolioPrices] = useState<PortfolioPrices>({});

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
      console.log('DexScreener error for contract:', contractAddress, error);
    }
    return null;
  }, []);

  const fetchFromCoinGecko = useCallback(async (cryptoSymbol: string): Promise<PriceData | null> => {
    try {
      // Essayer d'abord avec le symbole directement
      let url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbol.toLowerCase()}&vs_currencies=usd`;
      let response = await fetch(url);
      
      if (!response.ok) {
        // Si échec, essayer avec une recherche
        const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(cryptoSymbol)}`);
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.coins && searchData.coins.length > 0) {
            const coinId = searchData.coins[0].id;
            url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
            response = await fetch(url);
          }
        }
      }
      
      if (response.ok) {
        const data = await response.json();
        const coinKey = Object.keys(data)[0];
        if (coinKey && data[coinKey]?.usd) {
          return {
            price: data[coinKey].usd,
            source: 'CoinGecko',
            timestamp: new Date()
          };
        }
      }
    } catch (error) {
      console.log('CoinGecko error for symbol:', cryptoSymbol, error);
    }
    return null;
  }, []);

  const fetchFromPumpFun = useCallback(async (contractAddress: string): Promise<PriceData | null> => {
    try {
      if (contractAddress && contractAddress.length > 30 && !contractAddress.startsWith('0x')) {
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
      console.log('Pump.fun error for contract:', contractAddress, error);
    }
    return null;
  }, []);

  const syncPriceForCrypto = useCallback(async (crypto: string, contractAddress?: string) => {
    setPortfolioPrices(prev => ({
      ...prev,
      [crypto]: {
        ...prev[crypto],
        isUpdating: true
      }
    }));

    const sources: Promise<PriceData | null>[] = [];

    // Essayer différentes sources selon le type de crypto
    if (contractAddress) {
      if (contractAddress.startsWith('0x')) {
        sources.push(fetchFromDexScreener(contractAddress));
        sources.push(fetchFromCoinGecko(crypto));
      } else if (contractAddress.length > 30) {
        sources.push(fetchFromPumpFun(contractAddress));
        sources.push(fetchFromDexScreener(contractAddress));
      }
    } else {
      sources.push(fetchFromCoinGecko(crypto));
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

        setPortfolioPrices(prev => ({
          ...prev,
          [crypto]: {
            price: priceToUse,
            source: latestPrice.source,
            lastUpdate: new Date(),
            isUpdating: false
          }
        }));

        console.log(`Prix synchronisé pour ${crypto}: $${priceToUse} (${latestPrice.source})`);
      } else {
        setPortfolioPrices(prev => ({
          ...prev,
          [crypto]: {
            ...prev[crypto],
            isUpdating: false
          }
        }));
      }
    } catch (error) {
      console.log('Erreur synchronisation prix pour', crypto, ':', error);
      setPortfolioPrices(prev => ({
        ...prev,
        [crypto]: {
          ...prev[crypto],
          isUpdating: false
        }
      }));
    }
  }, [fetchFromDexScreener, fetchFromCoinGecko, fetchFromPumpFun]);

  const syncAllPrices = useCallback(async () => {
    const uniqueCryptos = [...new Set(positions.map(p => p.crypto))];
    
    for (const crypto of uniqueCryptos) {
      // Simuler une adresse de contrat pour les tests (dans un vrai cas, cela viendrait des données de position)
      await syncPriceForCrypto(crypto);
    }
  }, [positions, syncPriceForCrypto]);

  useEffect(() => {
    if (positions.length === 0) return;

    // Synchronisation initiale
    syncAllPrices();

    // Synchronisation périodique toutes les 15 secondes
    const interval = setInterval(syncAllPrices, 15000);

    return () => clearInterval(interval);
  }, [positions, syncAllPrices]);

  return {
    portfolioPrices,
    syncAllPrices,
    syncPriceForCrypto
  };
};
