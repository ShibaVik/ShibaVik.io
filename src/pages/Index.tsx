
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, Search, DollarSign, LogOut, User, LogIn, Github, Linkedin, Twitter, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import TradingInterface from '@/components/TradingInterface';
import Portfolio from '@/components/Portfolio';
import TransactionHistory from '@/components/TransactionHistory';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [language, setLanguage] = useState('en'); // Changed default to English
  const { toast } = useToast();

  const balance = user ? (profile?.current_balance || 0) : demoBalance;

  const translations = {
    fr: {
      title: "ShibaVik.io",
      subtitle: "Simulateur de trading MemeCoin",
      compatible: "⚡ Compatible pump.fun, DexScreener & DEX",
      developer: "Développé par ShibaVik Student - Cryptography Enthusiast",
      demoMode: "Mode démo actif - Connectez-vous pour sauvegarder vos trades en permanence !",
      currentBalance: "Solde Actuel",
      demoBalance: "Solde Démo",
      initialBalance: "Solde Initial",
      searchCrypto: "Rechercher une MemeCoin",
      contractAddress: "Adresse du contrat (Solana, Ethereum, BSC...)",
      search: "Rechercher",
      examples: "💡 Exemples d'adresses :",
      priceUpdated: "⚡ Prix actualisé automatiquement",
      trading: "Trading",
      portfolio: "Portfolio",
      history: "Historique",
      searchToTrade: "Recherchez une crypto-monnaie pour commencer à trader",
      signIn: "Se connecter / S'inscrire",
      signOut: "Déconnexion"
    },
    en: {
      title: "ShibaVik.io",
      subtitle: "MemeCoin Trading Simulator",
      compatible: "⚡ Compatible pump.fun, DexScreener & DEX",
      developer: "Developed by ShibaVik Student - Cryptography Enthusiast",
      demoMode: "Demo mode active - Sign in to save your trades permanently!",
      currentBalance: "Current Balance",
      demoBalance: "Demo Balance",
      initialBalance: "Initial Balance",
      searchCrypto: "Search for a MemeCoin",
      contractAddress: "Contract address (Solana, Ethereum, BSC...)",
      search: "Search",
      examples: "💡 Address examples:",
      priceUpdated: "⚡ Price updated automatically",
      trading: "Trading",
      portfolio: "Portfolio",
      history: "History",
      searchToTrade: "Search for a cryptocurrency to start trading",
      signIn: "Sign In / Sign Up",
      signOut: "Sign Out"
    }
  };

  const t = translations[language as keyof typeof translations];

  const socialLinks = [
    {
      name: 'Twitter',
      url: 'https://twitter.com/Nft_ShibaVik',
      icon: null, // Changed to null to use custom 𝕏 symbol
      label: '𝕏'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/sullyvan-milhau',
      icon: Linkedin,
      label: 'LinkedIn'
    },
    {
      name: 'OpenSea',
      url: 'https://opensea.io/ShibaVik',
      icon: null,
      label: 'OpenSea'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/ShibaVik',
      icon: Github,
      label: 'GitHub'
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      {/* Blockchain-inspired background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-4 h-4 border border-cyan-400 rotate-45 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 border border-blue-500 rotate-12 animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-5 h-5 border border-purple-500 rotate-45 animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-40 w-3 h-3 border border-green-400 rotate-12 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-4 relative z-10">
        {/* Header with Auth and Language Selector */}
        <div className="flex justify-between items-center bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="text-center space-y-3">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text">
                    {t.title}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-gray-300 text-sm">{t.subtitle}</p>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center space-x-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center w-8 h-8 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 hover:scale-110"
                    title={link.name}
                  >
                    {link.icon ? (
                      <link.icon className="h-4 w-4 text-gray-300 group-hover:text-cyan-400 transition-colors duration-300" />
                    ) : link.name === 'Twitter' ? (
                      <span className="text-sm text-gray-300 group-hover:text-cyan-400 transition-colors duration-300 font-bold">
                        𝕏
                      </span>
                    ) : (
                      <span className="text-sm group-hover:text-cyan-400 transition-colors duration-300">
                        🌊
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-cyan-400 text-sm font-medium">
                {t.compatible}
              </p>
              <p className="text-gray-400 text-xs italic">
                {t.developer}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-24 bg-gray-700/50 border-gray-600/50 text-gray-100">
                <Globe className="h-4 w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="fr" className="text-gray-100 hover:bg-gray-700">🇫🇷 FR</SelectItem>
                <SelectItem value="en" className="text-gray-100 hover:bg-gray-700">🇺🇸 EN</SelectItem>
              </SelectContent>
            </Select>

            {user ? (
              <>
                <div className="flex items-center space-x-3 bg-gray-700/50 rounded-xl px-4 py-2 border border-gray-600/50">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-100 font-medium">{user.email}</span>
                </div>
                <Button 
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.signOut}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg shadow-cyan-500/20 transition-all duration-200"
                size="sm"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {t.signIn}
              </Button>
            )}
          </div>
        </div>

        {/* Info message for demo mode - Enhanced visibility */}
        {!user && (
          <Card className="bg-gray-800/60 border-cyan-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">💡</span>
                <p className="text-cyan-100 text-center font-medium">
                  {t.demoMode}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Balance Card - Enhanced design */}
        <Card className="bg-gray-800/40 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/20">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-medium">
                    {user ? t.currentBalance : t.demoBalance}
                  </p>
                  <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text">
                    ${balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {user && (
                <div className="text-right bg-blue-900/20 rounded-xl p-4 border border-blue-500/30">
                  <p className="text-blue-300 text-sm font-medium">{t.initialBalance}</p>
                  <p className="text-xl font-bold text-blue-400">
                    ${profile?.initial_balance?.toLocaleString('fr-FR') || '0'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Section - Enhanced visibility */}
        <Card className="bg-gray-800/40 border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-gray-100">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
              <span>{t.searchCrypto}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex space-x-3">
              <Input
                placeholder={t.contractAddress}
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="bg-gray-700/50 border-gray-600/50 text-gray-100 placeholder-gray-400 flex-1 backdrop-blur-sm"
              />
              <Button 
                onClick={searchCrypto} 
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg shadow-cyan-500/20"
              >
                {loading ? "..." : t.search}
              </Button>
            </div>
            
            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <p className="text-cyan-400 font-medium mb-2">{t.examples}</p>
              <div className="space-y-1 text-sm text-gray-300">
                <p>• <span className="text-purple-400">Solana:</span> 9BB6W7Q... (tokens pump.fun)</p>
                <p>• <span className="text-blue-400">Ethereum:</span> 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984</p>
              </div>
            </div>
            
            {cryptoData && (
              <div className="p-6 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-2xl border border-gray-600/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-100">{cryptoData.name} ({cryptoData.symbol})</h3>
                  <div className="flex items-center space-x-3">
                    {cryptoData.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    )}
                    <span className={`font-bold ${cryptoData.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {cryptoData.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-2">
                  {cryptoData.current_price < 0.001 
                    ? `$${cryptoData.current_price.toExponential(3)}`
                    : `$${cryptoData.current_price.toFixed(8)}`
                  }
                </p>
                <p className="text-cyan-400 text-sm">
                  {t.priceUpdated}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trading Interface - Enhanced tabs */}
        <Tabs defaultValue="trade" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 h-12">
            <TabsTrigger value="trade" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">{t.trading}</TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">{t.portfolio}</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">{t.history}</TabsTrigger>
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
              <Card className="bg-gray-800/40 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Search className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-300 text-lg">
                      {t.searchToTrade}
                    </p>
                  </div>
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

        <Footer />
      </div>
    </div>
  );
};

export default Index;
