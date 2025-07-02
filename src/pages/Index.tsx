
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCircle, Settings as SettingsIcon, Github, Linkedin } from 'lucide-react';
import TradingInterface from '@/components/TradingInterface';
import PopularCryptos from '@/components/PopularCryptos';
import Portfolio from '@/components/Portfolio';
import TransactionHistory from '@/components/TransactionHistory';
import Settings from '@/components/Settings';
import Auth from '@/components/Auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/Footer';

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

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  crypto: string;
  amount: number;
  price: number;
  total: number;
  timestamp: Date;
}

const Index = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('trading');

  useEffect(() => {
    // Calculate total portfolio value
    const portfolioValue = positions.reduce((sum, position) => {
      return sum + (position.amount * position.currentPrice);
    }, 0);

    setTotalPortfolioValue(balance + portfolioValue);
  }, [balance, positions]);

  const [totalPortfolioValue, setTotalPortfolioValue] = useState(balance);

  const handleTrade = (type: 'buy' | 'sell', amount: number) => {
    if (!selectedCrypto) return;

    const crypto = selectedCrypto.symbol;
    const price = selectedCrypto.current_price;
    const cost = amount * price;

    if (type === 'buy') {
      if (balance >= cost) {
        // Update balance
        setBalance(balance - cost);

        // Update positions
        const existingPosition = positions.find(p => p.crypto === crypto);
        if (existingPosition) {
          const newAmount = existingPosition.amount + amount;
          const newAvgPrice = (existingPosition.avgPrice * existingPosition.amount + cost) / newAmount;
          setPositions(positions.map(p =>
            p.crypto === crypto ? { ...p, amount: newAmount, avgPrice: newAvgPrice, currentPrice: price } : p
          ));
        } else {
          setPositions([...positions, { crypto, amount, avgPrice: price, currentPrice: price }]);
        }

        // Add transaction
        const transaction: Transaction = {
          id: Math.random().toString(36).substring(7),
          type: 'buy',
          crypto,
          amount,
          price,
          total: cost,
          timestamp: new Date(),
        };
        setTransactions([...transactions, transaction]);

        toast({
          title: t('buySuccess'),
          description: `${t('bought')} ${amount} ${crypto} ${t('for')} $${cost.toFixed(2)}`,
        })
      } else {
        toast({
          title: t('insufficientBalance'),
          description: "Vous n'avez pas assez de fonds pour effectuer cet achat.",
          variant: "destructive",
        })
      }
    } else if (type === 'sell') {
      const existingPosition = positions.find(p => p.crypto === crypto);
      if (existingPosition && existingPosition.amount >= amount) {
        // Update balance
        setBalance(balance + cost);

        // Update positions
        const newAmount = existingPosition.amount - amount;
        if (newAmount > 0) {
          setPositions(positions.map(p =>
            p.crypto === crypto ? { ...p, amount: newAmount, currentPrice: price } : p
          ));
        } else {
          setPositions(positions.filter(p => p.crypto !== crypto));
        }

        // Add transaction
        const transaction: Transaction = {
          id: Math.random().toString(36).substring(7),
          type: 'sell',
          crypto,
          amount,
          price,
          total: cost,
          timestamp: new Date(),
        };
        setTransactions([...transactions, transaction]);

        toast({
          title: t('sellSuccess'),
          description: `${t('sold')} ${amount} ${crypto} ${t('for')} $${cost.toFixed(2)}`,
        })
      } else {
        toast({
          title: t('insufficientPosition'),
          description: "Vous n'avez pas assez de tokens pour effectuer cette vente.",
          variant: "destructive",
        })
      }
    }
  };

  const searchCrypto = async () => {
    if (!contractAddress.trim()) {
      toast({
        title: t('error'),
        description: "Veuillez entrer une adresse de contrat valide.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Essayer d'abord avec l'ID direct
      let response = await fetch(`https://api.coingecko.com/api/v3/coins/${contractAddress.toLowerCase()}`);
      
      if (!response.ok) {
        // Si ça échoue, essayer avec la recherche par contrat
        const searchResponse = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${contractAddress}`);
        
        if (searchResponse.ok) {
          response = searchResponse;
        } else {
          // Essayer avec une recherche générale
          const generalSearch = await fetch(`https://api.coingecko.com/api/v3/search?query=${contractAddress}`);
          if (generalSearch.ok) {
            const searchData = await generalSearch.json();
            if (searchData.coins && searchData.coins.length > 0) {
              const coinId = searchData.coins[0].id;
              response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            }
          }
        }
      }

      if (response.ok) {
        const data = await response.json();
        setSelectedCrypto({
          id: data.id,
          symbol: data.symbol.toUpperCase(),
          name: data.name,
          current_price: data.market_data?.current_price?.usd || 0,
          price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
          contract_address: contractAddress,
        });
        
        toast({
          title: "Succès",
          description: `${data.name} trouvé avec succès !`,
        });
      } else {
        throw new Error('Crypto non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de crypto:', error);
      toast({
        title: t('error'),
        description: "Impossible de trouver cette crypto. Vérifiez l'adresse du contrat ou essayez le nom/symbole de la crypto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {t('title')}
              </h1>
              
              {/* Social Links */}
              <div className="hidden md:flex items-center space-x-2 ml-4">
                <a
                  href="https://twitter.com/Nft_ShibaVik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                  title="Twitter"
                >
                  <span className="text-gray-300 hover:text-cyan-400">𝕏</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/sullyvan-milhau"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4 text-gray-300 hover:text-cyan-400" />
                </a>
                <a
                  href="https://opensea.io/ShibaVik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                  title="OpenSea"
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">OS</span>
                  </div>
                </a>
                <a
                  href="https://github.com/ShibaVik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                  title="GitHub"
                >
                  <Github className="h-4 w-4 text-gray-300 hover:text-cyan-400" />
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-300">{t('currentBalance')}: <span className="font-bold text-white">${balance.toFixed(2)}</span></p>
                <p className="text-xs text-gray-400">
                  {user ? (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      Connecté: {user.email}
                    </span>
                  ) : (
                    'Mode: Démo'
                  )}
                </p>
              </div>
              
              <Button 
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                className="border-purple-400/50 text-purple-300 hover:bg-purple-500/10"
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
              
              {user ? (
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/10"
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  {t('signOut')}
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowAuth(!showAuth)}
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/10"
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  {t('signIn')}
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6 mt-4">
            <Button
              variant={activeTab === 'trading' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('trading')}
              className={activeTab === 'trading' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'text-gray-300 hover:text-white'}
            >
              {t('trading')}
            </Button>
            <Button
              variant={activeTab === 'portfolio' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('portfolio')}
              className={activeTab === 'portfolio' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'text-gray-300 hover:text-white'}
            >
              {t('portfolio')}
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('history')}
              className={activeTab === 'history' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'text-gray-300 hover:text-white'}
            >
              {t('history')}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Settings Panel */}
        {showSettings && (
          <Settings 
            demoBalance={balance}
            onDemoBalanceChange={setBalance}
            isDemo={true}
          />
        )}

        {/* Content based on active tab */}
        {activeTab === 'trading' && (
          <>
            {/* Popular Cryptos */}
            <PopularCryptos onSelectCrypto={setSelectedCrypto} />

            {/* Meme Coin Search */}
            <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Search className="h-5 w-5" />
                  <span>{t('searchCrypto')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <Input
                    type="text"
                    placeholder={t('contractAddress')}
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="flex-1 bg-gray-800/80 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Button 
                    onClick={searchCrypto}
                    disabled={loading}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Recherche...' : t('search')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trading Interface */}
            {selectedCrypto ? (
              <TradingInterface
                cryptoData={selectedCrypto}
                balance={balance}
                onTrade={handleTrade}
                positions={positions}
              />
            ) : (
              <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-400 text-lg">{t('searchToTrade')}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === 'portfolio' && (
          <Portfolio
            balance={balance}
            positions={positions}
            totalPortfolioValue={totalPortfolioValue}
          />
        )}

        {activeTab === 'history' && transactions.length > 0 && (
          <TransactionHistory transactions={transactions} />
        )}

        {activeTab === 'history' && transactions.length === 0 && (
          <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400 text-lg">Aucune transaction pour le moment</p>
            </CardContent>
          </Card>
        )}

        {/* Auth Panel */}
        {showAuth && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 rounded-lg p-6 w-full max-w-md border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Connexion / Inscription</h2>
                <Button 
                  onClick={() => setShowAuth(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              <Auth />
            </div>
          </div>
        )}
      </div>

      {/* Footer with Axiom sponsorship */}
      <Footer />
    </div>
  );
};

export default Index;
