import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, Search, DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import TradingInterface from '@/components/TradingInterface';
import Portfolio from '@/components/Portfolio';
import TransactionHistory from '@/components/TransactionHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  contract_address?: string;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  crypto: string;
  amount: number;
  price: number;
  total: number;
  timestamp: Date;
}

interface Position {
  crypto: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
}

const Index = () => {
  const [balance, setBalance] = useState(10000); // $10,000 démo
  const [searchAddress, setSearchAddress] = useState('');
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const { toast } = useToast();

  // Fonction pour rechercher une crypto par adresse avec DexScreener
  const searchCrypto = async () => {
    if (!searchAddress.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse de contrat",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Recherche pour l\'adresse:', searchAddress);
      
      // Utiliser l'API DexScreener qui supporte pump.fun et autres DEX
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${searchAddress}`
      );
      
      if (!response.ok) {
        throw new Error('Token non trouvé');
      }

      const data = await response.json();
      console.log('Données reçues de DexScreener:', data);
      
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error('Aucune paire trouvée pour ce token');
      }

      // Prendre la première paire (généralement la plus liquide)
      const pair = data.pairs[0];
      const tokenInfo = pair.baseToken.address.toLowerCase() === searchAddress.toLowerCase() 
        ? pair.baseToken 
        : pair.quoteToken;

      const priceUsd = parseFloat(pair.priceUsd || '0');
      const priceChange24h = parseFloat(pair.priceChange24h || '0');

      setCryptoData({
        id: tokenInfo.address,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        current_price: priceUsd,
        price_change_percentage_24h: priceChange24h,
        contract_address: searchAddress
      });

      toast({
        title: "Succès",
        description: `${tokenInfo.name} (${tokenInfo.symbol}) trouvé !`
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur",
        description: "Token non trouvé ou adresse invalide. Vérifiez que c'est une adresse valide sur Solana ou Ethereum.",
        variant: "destructive"
      });
      setCryptoData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir le prix
  const refreshPrice = async () => {
    if (!cryptoData || !cryptoData.contract_address) return;

    try {
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${cryptoData.contract_address}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          const priceUsd = parseFloat(pair.priceUsd || '0');
          const priceChange24h = parseFloat(pair.priceChange24h || '0');

          setCryptoData(prev => prev ? {
            ...prev,
            current_price: priceUsd,
            price_change_percentage_24h: priceChange24h
          } : null);

          // Mettre à jour les prix actuels dans les positions
          setPositions(prev => prev.map(pos => 
            pos.crypto === cryptoData.symbol 
              ? { ...pos, currentPrice: priceUsd }
              : pos
          ));
        }
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  };

  // Rafraîchir le prix toutes les 30 secondes
  useEffect(() => {
    if (cryptoData) {
      const interval = setInterval(refreshPrice, 30000);
      return () => clearInterval(interval);
    }
  }, [cryptoData]);

  // Fonction pour exécuter un trade
  const executeTrade = (type: 'buy' | 'sell', amount: number) => {
    if (!cryptoData) return;

    const total = amount * cryptoData.current_price;

    if (type === 'buy') {
      if (total > balance) {
        toast({
          title: "Erreur",
          description: "Solde insuffisant",
          variant: "destructive"
        });
        return;
      }

      setBalance(prev => prev - total);
      
      // Mettre à jour les positions
      setPositions(prev => {
        const existingPosition = prev.find(p => p.crypto === cryptoData.symbol);
        if (existingPosition) {
          const newAmount = existingPosition.amount + amount;
          const newAvgPrice = ((existingPosition.amount * existingPosition.avgPrice) + total) / newAmount;
          return prev.map(p => 
            p.crypto === cryptoData.symbol 
              ? { ...p, amount: newAmount, avgPrice: newAvgPrice, currentPrice: cryptoData.current_price }
              : p
          );
        } else {
          return [...prev, {
            crypto: cryptoData.symbol,
            amount,
            avgPrice: cryptoData.current_price,
            currentPrice: cryptoData.current_price
          }];
        }
      });

      toast({
        title: "Achat réussi",
        description: `Acheté ${amount} ${cryptoData.symbol} pour $${total.toFixed(2)}`
      });
    } else {
      const position = positions.find(p => p.crypto === cryptoData.symbol);
      if (!position || position.amount < amount) {
        toast({
          title: "Erreur",
          description: "Position insuffisante",
          variant: "destructive"
        });
        return;
      }

      setBalance(prev => prev + total);
      setPositions(prev => prev.map(p => 
        p.crypto === cryptoData.symbol 
          ? { ...p, amount: p.amount - amount }
          : p
      ).filter(p => p.amount > 0));

      toast({
        title: "Vente réussie",
        description: `Vendu ${amount} ${cryptoData.symbol} pour $${total.toFixed(2)}`
      });
    }

    // Ajouter la transaction à l'historique
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      crypto: cryptoData.symbol,
      amount,
      price: cryptoData.current_price,
      total,
      timestamp: new Date()
    };

    setTransactions(prev => [newTransaction, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            🚀 MemeCoin Trading Simulator
          </h1>
          <p className="text-gray-400">Tradez avec de l'argent virtuel - Zéro risque, 100% fun!</p>
          <p className="text-sm text-gray-500">Compatible avec pump.fun, DexScreener et autres DEX</p>
        </div>

        {/* Balance Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-600 rounded-full">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Solde Démo</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                DÉMO
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Rechercher une MemeCoin</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Adresse du contrat (Solana, Ethereum, BSC...)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white flex-1"
              />
              <Button 
                onClick={searchCrypto} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "..." : "Rechercher"}
              </Button>
            </div>
            
            <div className="text-xs text-gray-400 space-y-1">
              <p>💡 Exemples d'adresses :</p>
              <p>• Solana: 9BB6W7Q...  (tokens pump.fun)</p>
              <p>• Ethereum: 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984</p>
            </div>
            
            {cryptoData && (
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{cryptoData.name} ({cryptoData.symbol})</h3>
                  <div className="flex items-center space-x-2">
                    {cryptoData.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={cryptoData.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}>
                      {cryptoData.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {cryptoData.current_price < 0.001 
                    ? `$${cryptoData.current_price.toExponential(3)}`
                    : `$${cryptoData.current_price.toFixed(8)}`
                  }
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Prix actualisé automatiquement
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trading Interface */}
        {cryptoData && (
          <Tabs defaultValue="trade" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="trade">Trading</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trade">
              <TradingInterface 
                cryptoData={cryptoData} 
                balance={balance}
                onTrade={executeTrade}
                positions={positions}
              />
            </TabsContent>
            
            <TabsContent value="portfolio">
              <Portfolio positions={positions} />
            </TabsContent>
            
            <TabsContent value="history">
              <TransactionHistory transactions={transactions} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;
