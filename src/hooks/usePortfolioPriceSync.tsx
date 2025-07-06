
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
  contract_address?: string;
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

  const fetchPriceFromDexScreener = useCallback(async (crypto: string, contractAddress?: string): Promise<PriceData | null> => {
    if (!contractAddress) {
      console.log(`Pas d'adresse de contrat pour ${crypto}, synchronisation impossible`);
      return null;
    }

    try {
      console.log(`Récupération prix DexScreener pour ${crypto}: ${contractAddress}`);
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.pairs && data.pairs.length > 0) {
          const bestPair = data.pairs.sort((a: any, b: any) => 
            (parseFloat(b.liquidity?.usd || '0')) - (parseFloat(a.liquidity?.usd || '0'))
          )[0];
          
          const price = parseFloat(bestPair.priceUsd);
          if (price && price > 0) {
            console.log(`Prix DexScreener trouvé: $${price} pour ${crypto}`);
            return {
              price,
              source: 'DexScreener',
              timestamp: new Date()
            };
          }
        }
      }
    } catch (error) {
      console.log(`Erreur DexScreener pour ${crypto}:`, error);
    }
    
    return null;
  }, []);

  const syncPriceForCrypto = useCallback(async (position: Position) => {
    const crypto = position.crypto;
    console.log(`Synchronisation prix pour ${crypto} avec adresse: ${position.contract_address || 'aucune'}`);
    
    // Marquer comme en cours de mise à jour
    setPortfolioPrices(prev => ({
      ...prev,
      [crypto]: {
        ...prev[crypto],
        price: prev[crypto]?.price || position.currentPrice,
        source: prev[crypto]?.source || 'DexScreener',
        lastUpdate: prev[crypto]?.lastUpdate || new Date(),
        isUpdating: true,
        isStale: false
      }
    }));

    try {
      const priceData = await fetchPriceFromDexScreener(crypto, position.contract_address);
      
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
        console.log(`✅ Prix synchronisé pour ${crypto}: $${priceData.price} (${priceData.source})`);
      } else {
        console.warn(`❌ Impossible de synchroniser ${crypto} - adresse manquante ou prix indisponible`);
        setPortfolioPrices(prev => ({
          ...prev,
          [crypto]: {
            ...prev[crypto],
            price: prev[crypto]?.price || position.currentPrice,
            source: 'Non synchronisé',
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
          price: prev[crypto]?.price || position.currentPrice,
          source: 'Erreur',
          lastUpdate: prev[crypto]?.lastUpdate || new Date(),
          isUpdating: false,
          isStale: true
        }
      }));
    }
  }, [fetchPriceFromDexScreener]);

  const syncAllPrices = useCallback(async () => {
    if (isGlobalSync) {
      console.log('Synchronisation déjà en cours, annulation...');
      return;
    }

    console.log('🔄 Démarrage synchronisation des prix...');
    
    if (positions.length === 0) {
      console.log('Aucune position à synchroniser');
      return;
    }

    setIsGlobalSync(true);
    setLastSyncTime(new Date());
    
    // Synchroniser seulement les positions qui ont une adresse de contrat
    const positionsWithContract = positions.filter(pos => pos.contract_address);
    const positionsWithoutContract = positions.filter(pos => !pos.contract_address);

    if (positionsWithoutContract.length > 0) {
      console.log(`⚠️ ${positionsWithoutContract.length} position(s) sans adresse de contrat: ${positionsWithoutContract.map(p => p.crypto).join(', ')}`);
    }

    // Synchroniser avec un délai de 500ms entre chaque crypto
    for (let i = 0; i < positionsWithContract.length; i++) {
      const position = positionsWithContract[i];
      await syncPriceForCrypto(position);
      
      if (i < positionsWithContract.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsGlobalSync(false);
    console.log('✅ Synchronisation des prix terminée');
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

    console.log('🚀 Initialisation synchronisation prix portfolio (DexScreener uniquement)');
    
    // Synchronisation initiale
    syncAllPrices();

    // Synchronisation toutes les minutes
    const syncInterval = setInterval(() => {
      console.log('⏰ Synchronisation périodique (toutes les minutes)');
      syncAllPrices();
    }, 60000);

    // Vérification obsolescence toutes les 30 secondes
    const staleInterval = setInterval(markStale, 30000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(staleInterval);
      console.log('🛑 Nettoyage intervalles synchronisation');
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
