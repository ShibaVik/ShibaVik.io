import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, Search, DollarSign, LogOut, User, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import TradingInterface from '@/components/TradingInterface';
import Portfolio from '@/components/Portfolio';
import TransactionHistory from '@/components/TransactionHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
  const { user, signOut } = useAuth();
  const { profile, updateBalance } = useProfile();
  const navigate = useNavigate();
  const [searchAddress, setSearchAddress] = useState('');
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [demoBalance, setDemoBalance] = useState(10000);
  const { toast } = useToast();

  const balance = user ? (profile?.current_balance || 0) : demoBalance;

  // Charger les données utilisateur depuis Supabase
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Charger les transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (transactionsData) {
        const formattedTransactions = transactionsData.map(t => ({
          id: t.id,
          type: t.type as 'buy' | 'sell',
          crypto: t.crypto_symbol,
          amount: Number(t.amount),
          price: Number(t.price),
          total: Number(t.total),
          timestamp: new Date(t.created_at)
        }));
        setTransactions(formattedTransactions);
      }

      // Charger les positions
      const { data: positionsData } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user?.id);

      if (positionsData) {
        const formattedPositions = positionsData.map(p => ({
          crypto: p.crypto_symbol,
          amount: Number(p.amount),
          avgPrice: Number(p.avg_price),
          currentPrice: Number(p.current_price)
        }));
        setPositions(formattedPositions);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

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

  useEffect(() => {
    if (cryptoData) {
      const interval = setInterval(refreshPrice, 30000);
      return () => clearInterval(interval);
    }
  }, [cryptoData]);

  const executeTrade = async (type: 'buy' | 'sell', amount: number) => {
    if (!cryptoData) return;

    const total = amount * cryptoData.current_price;

    if (!user) {
      // Mode démo - pas de sauvegarde
      if (type === 'buy') {
        if (total > demoBalance) {
          toast({
            title: "Erreur",
            description: "Solde insuffisant (mode démo)",
            variant: "destructive"
          });
          return;
        }
        setDemoBalance(prev => prev - total);
        toast({
          title: "Achat réussi (mode démo)",
          description: `Acheté ${amount} ${cryptoData.symbol} pour $${total.toFixed(2)}. Connectez-vous pour sauvegarder vos trades.`
        });
      }
      return;
    }

    // Mode connecté - sauvegarde en base
    if (type === 'buy') {
      if (total > balance) {
        toast({
          title: "Erreur",
          description: "Solde insuffisant",
          variant: "destructive"
        });
        return;
      }

      const success = await updateBalance(balance - total);
      if (!success) return;
      
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'buy',
          crypto_symbol: cryptoData.symbol,
          crypto_name: cryptoData.name,
          amount: amount,
          price: cryptoData.current_price,
          total: total,
          contract_address: cryptoData.contract_address
        });

      const existingPosition = positions.find(p => p.crypto === cryptoData.symbol);
      if (existingPosition) {
        const newAmount = existingPosition.amount + amount;
        const newAvgPrice = ((existingPosition.amount * existingPosition.avgPrice) + total) / newAmount;
        
        await supabase
          .from('positions')
          .upsert({
            user_id: user.id,
            crypto_symbol: cryptoData.symbol,
            crypto_name: cryptoData.name,
            amount: newAmount,
            avg_price: newAvgPrice,
            current_price: cryptoData.current_price,
            contract_address: cryptoData.contract_address
          });

        setPositions(prev => prev.map(p => 
          p.crypto === cryptoData.symbol 
            ? { ...p, amount: newAmount, avgPrice: newAvgPrice, currentPrice: cryptoData.current_price }
            : p
        ));
      } else {
        await supabase
          .from('positions')
          .insert({
            user_id: user.id,
            crypto_symbol: cryptoData.symbol,
            crypto_name: cryptoData.name,
            amount: amount,
            avg_price: cryptoData.current_price,
            current_price: cryptoData.current_price,
            contract_address: cryptoData.contract_address
          });

        setPositions(prev => [...prev, {
          crypto: cryptoData.symbol,
          amount,
          avgPrice: cryptoData.current_price,
          currentPrice: cryptoData.current_price
        }]);
      }

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

      const success = await updateBalance(balance + total);
      if (!success) return;

      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'sell',
          crypto_symbol: cryptoData.symbol,
          crypto_name: cryptoData.name,
          amount: amount,
          price: cryptoData.current_price,
          total: total,
          contract_address: cryptoData.contract_address
        });

      const newAmount = position.amount - amount;
      if (newAmount > 0) {
        await supabase
          .from('positions')
          .update({ amount: newAmount })
          .eq('user_id', user.id)
          .eq('crypto_symbol', cryptoData.symbol);

        setPositions(prev => prev.map(p => 
          p.crypto === cryptoData.symbol 
            ? { ...p, amount: newAmount }
            : p
        ));
      } else {
        await supabase
          .from('positions')
          .delete()
          .eq('user_id', user.id)
          .eq('crypto_symbol', cryptoData.symbol);

        setPositions(prev => prev.filter(p => p.crypto !== cryptoData.symbol));
      }

      toast({
        title: "Vente réussie",
        description: `Vendu ${amount} ${cryptoData.symbol} pour $${total.toFixed(2)}`
      });
    }

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
        {/* Header with Auth */}
        <div className="flex justify-between items-center">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              🚀 ShibaVik.io
            </h1>
            <p className="text-gray-400">Simulateur de trading de MemeCoin</p>
            <p className="text-sm text-gray-500">Compatible avec pump.fun, DexScreener et autres DEX</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="text-gray-300">{user.email}</span>
                </div>
                <Button 
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Se connecter / S'inscrire
              </Button>
            )}
          </div>
        </div>

        {/* Info message for demo mode */}
        {!user && (
          <Card className="bg-blue-900/20 border-blue-500/50">
            <CardContent className="p-4">
              <p className="text-blue-200 text-center">
                💡 Vous utilisez le mode démo. Connectez-vous pour sauvegarder vos trades en permanence !
              </p>
            </CardContent>
          </Card>
        )}

        {/* Balance Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-600 rounded-full">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">
                    {user ? 'Solde Actuel' : 'Solde Démo'}
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    ${balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {user && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Solde Initial</p>
                  <p className="text-lg font-semibold text-blue-400">
                    ${profile?.initial_balance?.toLocaleString('fr-FR') || '0'}
                  </p>
                </div>
              )}
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
        <Tabs defaultValue="trade" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="trade">Trading</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trade">
            {cryptoData ? (
              <TradingInterface 
                cryptoData={cryptoData} 
                balance={balance}
                onTrade={executeTrade}
                positions={positions}
              />
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">
                    Recherchez une crypto-monnaie pour commencer à trader
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="portfolio">
            <Portfolio positions={positions} />
          </TabsContent>
          
          <TabsContent value="history">
            <TransactionHistory transactions={transactions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
