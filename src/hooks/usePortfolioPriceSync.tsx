
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

  const fetchFromDexScreener = useCallback(async (contractAddress: string): Promise<PriceData | null> => {
    try {
      console.log(`Fetching from DexScreener for contract: ${contractAddress}`);
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
            console.log(`DexScreener prix trouvé: $${price} pour ${contractAddress}`);
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
      console.log(`Fetching from CoinGecko for symbol: ${cryptoSymbol}`);
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
          console.log(`CoinGecko prix trouvé: $${data[coinKey].usd} pour ${cryptoSymbol}`);
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
      console.log(`Fetching from Pump.fun/Solana for contract: ${contractAddress}`);
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
              console.log(`Pump.fun/Solana prix trouvé: $${price} pour ${contractAddress}`);
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

  const validatePriceConsistency = useCallback((prices: PriceData[]): PriceData | null => {
    if (prices.length === 0) return null;
    if (prices.length === 1) return prices[0];

    // Calculer la moyenne et détecter les écarts importants
    const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
    const validPrices = prices.filter(p => {
      const deviation = Math.abs(p.price - avgPrice) / avgPrice;
      return deviation < 0.1; // Tolérance de 10%
    });

    if (validPrices.length === 0) {
      console.warn('Tous les prix sont incohérents, utilisation du prix le plus récent');
      return prices.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    }

    // Retourner le prix le plus récent parmi les prix cohérents
    return validPrices.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }, []);

  const syncPriceForCrypto = useCallback(async (crypto: string, contractAddress?: string) => {
    console.log(`Synchronisation du prix pour ${crypto}${contractAddress ? ` (${contractAddress})` : ''}`);
    
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

    const sources: Promise<PriceData | null>[] = [];

    // Stratégie de récupération selon le type de crypto
    if (contractAddress) {
      if (contractAddress.startsWith('0x') && contractAddress.length === 42) {
        // Contrat Ethereum/Base - utiliser DexScreener puis CoinGecko
        sources.push(fetchFromDexScreener(contractAddress));
        sources.push(fetchFromCoinGecko(crypto));
        console.log(`Recherche prix Ethereum/Base pour ${crypto}`);
      } else if (contractAddress.length > 30) {
        // Contrat Solana/Pump.fun - utiliser Pump.fun puis DexScreener
        sources.push(fetchFromPumpFun(contractAddress));
        sources.push(fetchFromDexScreener(contractAddress));
        console.log(`Recherche prix Solana/Pump.fun pour ${crypto}`);
      }
    } else {
      // Crypto populaire - utiliser CoinGecko
      sources.push(fetchFromCoinGecko(crypto));
      console.log(`Recherche prix CoinGecko pour ${crypto}`);
    }

    try {
      const results = await Promise.allSettled(sources);
      const validPrices: PriceData[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          validPrices.push(result.value);
          console.log(`Source ${index + 1} retournée: $${result.value.price} (${result.value.source})`);
        } else if (result.status === 'rejected') {
          console.log(`Source ${index + 1} échouée:`, result.reason);
        }
      });

      const selectedPrice = validatePriceConsistency(validPrices);

      if (selectedPrice) {
        setPortfolioPrices(prev => ({
          ...prev,
          [crypto]: {
            price: selectedPrice.price,
            source: selectedPrice.source,
            lastUpdate: new Date(),
            isUpdating: false,
            isStale: false
          }
        }));

        console.log(`✅ Prix synchronisé pour ${crypto}: $${selectedPrice.price} (${selectedPrice.source})`);
      } else {
        console.warn(`❌ Aucun prix valide trouvé pour ${crypto}`);
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
      console.error('Erreur synchronisation prix pour', crypto, ':', error);
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
  }, [fetchFromDexScreener, fetchFromCoinGecko, fetchFromPumpFun, validatePriceConsistency]);

  const syncAllPrices = useCallback(async () => {
    console.log('🔄 Début de la synchronisation complète des prix...');
    const uniqueCryptos = [...new Set(positions.map(p => p.crypto))];
    
    if (uniqueCryptos.length === 0) {
      console.log('Aucune position à synchroniser');
      return;
    }

    setLastSyncTime(new Date());
    
    // Synchroniser tous les cryptos en parallèle avec un délai pour éviter les limites de taux
    for (let i = 0; i < uniqueCryptos.length; i++) {
      const crypto = uniqueCryptos[i];
      // Dans un vrai cas, l'adresse de contrat viendrait des données de position
      await syncPriceForCrypto(crypto);
      
      // Petit délai entre les requêtes pour éviter les limites de taux
      if (i < uniqueCryptos.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('✅ Synchronisation complète terminée');
  }, [positions, syncPriceForCrypto]);

  const markPricesAsStale = useCallback(() => {
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

    console.log('🚀 Initialisation du hook de synchronisation des prix');
    
    // Synchronisation initiale
    syncAllPrices();

    // Synchronisation périodique toutes les minutes
    const syncInterval = setInterval(() => {
      console.log('⏰ Synchronisation périodique (toutes les minutes)');
      syncAllPrices();
    }, 60000);

    // Vérification de l'obsolescence toutes les 30 secondes
    const staleCheckInterval = setInterval(markPricesAsStale, 30000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(staleCheckInterval);
      console.log('🛑 Nettoyage des intervalles de synchronisation');
    };
  }, [positions, syncAllPrices, markPricesAsStale]);

  return {
    portfolioPrices,
    syncAllPrices,
    syncPriceForCrypto,
    lastSyncTime
  };
};
