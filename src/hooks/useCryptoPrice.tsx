
import { useState, useEffect, useCallback } from 'react';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  contract_address?: string;
}

export const useCryptoPrice = (crypto: CryptoData | null) => {
  const [updatedPrice, setUpdatedPrice] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePrice = useCallback(async () => {
    if (!crypto) return;

    setIsUpdating(true);
    try {
      let newPrice = null;

      // Si c'est un token avec une adresse de contrat, utiliser DexScreener
      if (crypto.contract_address && crypto.contract_address.length > 30) {
        try {
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${crypto.contract_address}`, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.pairs && data.pairs.length > 0) {
              newPrice = parseFloat(data.pairs[0].priceUsd) || null;
            }
          }
        } catch (error) {
          console.log('Erreur DexScreener:', error);
        }
      }

      // Fallback sur CoinGecko pour les cryptos populaires
      if (!newPrice && crypto.id && !crypto.contract_address) {
        try {
          const response = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.market_data && data.market_data.current_price) {
              newPrice = data.market_data.current_price.usd;
            }
          }
        } catch (error) {
          console.log('Erreur CoinGecko:', error);
        }
      }

      if (newPrice && newPrice !== crypto.current_price) {
        setUpdatedPrice(newPrice);
        setLastUpdate(new Date());
        console.log(`Prix mis à jour pour ${crypto.symbol}: $${newPrice}`);
      }
    } catch (error) {
      console.log('Erreur mise à jour prix:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [crypto]);

  useEffect(() => {
    if (!crypto) return;

    // Mise à jour immédiate
    updatePrice();

    // Mise à jour périodique toutes les 30 secondes
    const interval = setInterval(updatePrice, 30000);
    return () => clearInterval(interval);
  }, [crypto, updatePrice]);

  return {
    currentPrice: updatedPrice || crypto?.current_price || 0,
    lastUpdate,
    isUpdating,
    updatePrice
  };
};
