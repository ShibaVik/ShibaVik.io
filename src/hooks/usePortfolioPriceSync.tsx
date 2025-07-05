
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
    isStale: boolean;
  };
}

export const usePortfolioPriceSync = (positions: Position[]) => {
  const [portfolioPrices, setPortfolioPrices] = useState<PortfolioPrices>({});
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isGlobalSync, setIsGlobalSync] = useState(false);

  const fetchPrice = useCallback(async (crypto: string): Promise<PriceData | null> => {
    console.log(`Fetching price for ${crypto}`);
    
    try {
      // Essayer d'abord CoinGecko pour les cryptos populaires
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto.toLowerCase()}&vs_currencies=usd`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const coinKey = Object.keys(data)[0];
        if (coinKey && data[coinKey]?.usd) {
          console.log(`CoinGecko price found: $${data[coinKey].usd} for ${crypto}`);
          return {
            price: data[coinKey].usd,
            source: 'CoinGecko',
            timestamp: new Date()
          };
        }
      }

      // Si CoinGecko échoue, essayer une recherche
      const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(crypto)}`);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.coins && searchData.coins.length > 0) {
          const coinId = searchData.coins[0].id;
          const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            if (priceData[coinId]?.usd) {
              console.log(`CoinGecko search price found: $${priceData[coinId].usd} for ${crypto}`);
              return {
                price: priceData[coinId].usd,
                source: 'CoinGecko',
                timestamp: new Date()
              };
            }
          }
        }
      }
    } catch (error) {
      console.log(`Error fetching price for ${crypto}:`, error);
    }
    
    return null;
  }, []);

  const syncPriceForCrypto = useCallback(async (crypto: string) => {
    console.log(`Syncing price for ${crypto}`);
    
    // Marquer comme en cours de mise à jour
    setPortfolioPrices(prev => ({
      ...prev,
      [crypto]: {
        ...prev[crypto],
        price: prev[crypto]?.price || 0,
        source: prev[crypto]?.source || '',
        lastUpdate: prev[crypto]?.lastUpdate || new Date(),
        isUpdating: true,
        isStale: false
      }
    }));

    try {
      const priceData = await fetchPrice(crypto);
      
      if (priceData) {
        setPortfolioPrices(prev => ({
          ...prev,
          [crypto]: {
            price: priceData.price,
            source: priceData.source,
            lastUpdate: new Date(),
            isUpdating: false,
            isStale: false
          }
        }));
        console.log(`✅ Price synced for ${crypto}: $${priceData.price} (${priceData.source})`);
      } else {
        console.warn(`❌ No price found for ${crypto}`);
        setPortfolioPrices(prev => ({
          ...prev,
          [crypto]: {
            ...prev[crypto],
            price: prev[crypto]?.price || 0,
            source: prev[crypto]?.source || 'N/A',
            lastUpdate: prev[crypto]?.lastUpdate || new Date(),
            isUpdating: false,
            isStale: true
          }
        }));
      }
    } catch (error) {
      console.error('Error syncing price for', crypto, ':', error);
      setPortfolioPrices(prev => ({
        ...prev,
        [crypto]: {
          ...prev[crypto],
          price: prev[crypto]?.price || 0,
          source: prev[crypto]?.source || 'N/A',
          lastUpdate: prev[crypto]?.lastUpdate || new Date(),
          isUpdating: false,
          isStale: true
        }
      }));
    }
  }, [fetchPrice]);

  const syncAllPrices = useCallback(async () => {
    if (isGlobalSync) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    console.log('🔄 Starting price sync...');
    const uniqueCryptos = [...new Set(positions.map(p => p.crypto))];
    
    if (uniqueCryptos.length === 0) {
      console.log('No positions to sync');
      return;
    }

    setIsGlobalSync(true);
    setLastSyncTime(new Date());
    
    // Synchroniser un crypto à la fois avec un délai de 500ms entre chaque
    for (let i = 0; i < uniqueCryptos.length; i++) {
      const crypto = uniqueCryptos[i];
      await syncPriceForCrypto(crypto);
      
      // Petit délai entre les requêtes
      if (i < uniqueCryptos.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsGlobalSync(false);
    console.log('✅ Price sync completed');
  }, [positions, syncPriceForCrypto, isGlobalSync]);

  const markStale = useCallback(() => {
    setPortfolioPrices(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(crypto => {
        const lastUpdate = updated[crypto].lastUpdate;
        const timeSinceUpdate = Date.now() - lastUpdate.getTime();
        // Marquer comme obsolète après 2 minutes
        if (timeSinceUpdate > 120000) {
          updated[crypto] = { ...updated[crypto], isStale: true };
        }
      });
      return updated;
    });
  }, []);

  useEffect(() => {
    if (positions.length === 0) return;

    console.log('🚀 Initializing portfolio price sync');
    
    // Synchronisation initiale
    syncAllPrices();

    // Synchronisation toutes les minutes (60 secondes)
    const syncInterval = setInterval(() => {
      console.log('⏰ Periodic sync (every minute)');
      syncAllPrices();
    }, 60000);

    // Vérification obsolescence toutes les 30 secondes
    const staleInterval = setInterval(markStale, 30000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(staleInterval);
      console.log('🛑 Cleanup sync intervals');
    };
  }, [positions.length, syncAllPrices, markStale]);

  return {
    portfolioPrices,
    syncAllPrices,
    syncPriceForCrypto,
    lastSyncTime,
    isGlobalSync
  };
};
