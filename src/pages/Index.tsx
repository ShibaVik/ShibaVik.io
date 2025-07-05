import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCircle, Settings as SettingsIcon } from 'lucide-react';
import TradingInterface from '@/components/TradingInterface';
import PopularCryptos from '@/components/PopularCryptos';
import Portfolio from '@/components/Portfolio';
import TransactionHistory from '@/components/TransactionHistory';
import NFTGallery from '@/components/NFTGallery';
import Settings from '@/components/Settings';
import Auth from '@/components/Auth';
import SiteHeader from '@/components/SiteHeader';
import MobileHeader from '@/components/MobileHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { usePriceSync } from '@/hooks/usePriceSync';
import { useIsMobile } from '@/hooks/use-mobile';
import Footer from '@/components/Footer';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  contract_address?: string;
}

const Index = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const {
    balance,
    positions,
    transactions,
    setBalance,
    setPositions,
    setTransactions,
    saveTransaction,
    updatePosition,
    deletePosition,
    updateBalance
  } = useUserData();

  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('trading');
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(balance);

  // Utiliser le hook de synchronisation des prix avec les positions
  const { currentPrice, lastUpdate, isUpdating, priceSource, isPriceConsistent } = usePriceSync(selectedCrypto, positions);

  // Synchroniser le prix dans selectedCrypto avec le prix mis à jour
  useEffect(() => {
    if (selectedCrypto && currentPrice && currentPrice !== selectedCrypto.current_price) {
      setSelectedCrypto(prev => prev ? { ...prev, current_price: currentPrice } : null);
    }
  }, [currentPrice, selectedCrypto]);

  // Calculer la valeur totale du portfolio avec synchronisation P&L
  useEffect(() => {
    const portfolioValue = positions.reduce((sum, position) => {
      const price = selectedCrypto?.symbol === position.crypto ? currentPrice : position.currentPrice;
      return sum + position.amount * price;
    }, 0);
    setTotalPortfolioValue(balance + portfolioValue);
  }, [balance, positions, currentPrice, selectedCrypto]);

  // Nouvelle fonction pour mettre à jour les positions avec les prix synchronisés
  const handleUpdatePositions = (updatedPositions: Position[]) => {
    setPositions(updatedPositions);
  };

  // Fonction pour réinitialiser complètement le compte démo
  const handleResetAccount = () => {
    setBalance(10000);
    setPositions([]);
    setTransactions([]);
    setSelectedCrypto(null);
    setContractAddress('');
    setActiveTab('trading');
    
    toast({
      title: "Compte réinitialisé",
      description: "Votre compte démo a été remis à zéro avec $10,000",
    });
  };

  const handleTrade = async (type: 'buy' | 'sell', amount: number) => {
    if (!selectedCrypto) return;

    const crypto = selectedCrypto.symbol;
    const price = currentPrice || selectedCrypto.current_price;
    const cost = amount * price;

    if (type === 'buy') {
      if (balance >= cost) {
        const newBalance = balance - cost;

        if (user) {
          await updateBalance(newBalance);
        } else {
          setBalance(newBalance);
        }

        const existingPosition = positions.find(p => p.crypto === crypto);
        if (existingPosition) {
          const newAmount = existingPosition.amount + amount;
          const newAvgPrice = (existingPosition.avgPrice * existingPosition.amount + cost) / newAmount;
          const updatedPositions = positions.map(p => 
            p.crypto === crypto ? {
              ...p,
              amount: newAmount,
              avgPrice: newAvgPrice,
              currentPrice: price
            } : p
          );
          setPositions(updatedPositions);
          if (user) {
            await updatePosition(crypto, newAmount, newAvgPrice, price);
          }
        } else {
          const newPosition = {
            crypto,
            amount,
            avgPrice: price,
            currentPrice: price
          };
          setPositions([...positions, newPosition]);
          if (user) {
            await updatePosition(crypto, amount, price, price);
          }
        }

        const transaction = {
          type: 'buy' as const,
          crypto,
          amount,
          price,
          total: cost
        };
        const newTransaction = {
          id: Math.random().toString(36).substring(7),
          ...transaction,
          timestamp: new Date()
        };
        setTransactions([newTransaction, ...transactions]);
        if (user) {
          await saveTransaction(transaction);
        }

        toast({
          title: t('buySuccess'),
          description: `${t('bought')} ${amount} ${crypto} ${t('for')} $${cost.toFixed(2)}`
        });
      } else {
        toast({
          title: t('insufficientBalance'),
          description: t('notEnoughFunds'),
          variant: "destructive"
        });
      }
    } else if (type === 'sell') {
      const existingPosition = positions.find(p => p.crypto === crypto);
      if (existingPosition && existingPosition.amount >= amount) {
        const newBalance = balance + cost;

        if (user) {
          await updateBalance(newBalance);
        } else {
          setBalance(newBalance);
        }

        const newAmount = existingPosition.amount - amount;
        if (newAmount > 0) {
          const updatedPositions = positions.map(p => 
            p.crypto === crypto ? {
              ...p,
              amount: newAmount,
              currentPrice: price
            } : p
          );
          setPositions(updatedPositions);
          if (user) {
            await updatePosition(crypto, newAmount, existingPosition.avgPrice, price);
          }
        } else {
          setPositions(positions.filter(p => p.crypto !== crypto));
          if (user) {
            await deletePosition(crypto);
          }
        }

        const transaction = {
          type: 'sell' as const,
          crypto,
          amount,
          price,
          total: cost
        };
        const newTransaction = {
          id: Math.random().toString(36).substring(7),
          ...transaction,
          timestamp: new Date()
        };
        setTransactions([newTransaction, ...transactions]);
        if (user) {
          await saveTransaction(transaction);
        }

        toast({
          title: t('sellSuccess'),
          description: `${t('sold')} ${amount} ${crypto} ${t('for')} $${cost.toFixed(2)}`
        });
      } else {
        toast({
          title: t('insufficientPosition'),
          description: t('notEnoughTokens'),
          variant: "destructive"
        });
      }
    }
  };

  const searchCrypto = async () => {
    if (!contractAddress.trim()) {
      toast({
        title: t('error'),
        description: t('contractPlaceholder'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const query = contractAddress.toLowerCase().trim();
      let cryptoData = null;

      if (query.length > 30 && !query.startsWith('0x')) {
        try {
          const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${query}`, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          if (dexResponse.ok) {
            const dexData = await dexResponse.json();
            if (dexData.pairs && dexData.pairs.length > 0) {
              const pair = dexData.pairs[0];
              cryptoData = {
                id: query,
                symbol: pair.baseToken.symbol,
                name: pair.baseToken.name,
                current_price: parseFloat(pair.priceUsd) || 0,
                price_change_percentage_24h: parseFloat(pair.priceChange?.h24) || 0,
                contract_address: query
              };
            }
          }
        } catch (error) {
          console.log('DexScreener indisponible, essai avec CoinGecko...');
        }
      }

      if (!cryptoData && query.startsWith('0x') && query.length === 42) {
        try {
          const baseResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${query}`);
          if (baseResponse.ok) {
            const baseData = await baseResponse.json();
            if (baseData.pairs && baseData.pairs.length > 0) {
              const basePair = baseData.pairs.find(pair => pair.chainId === 'base' || pair.chainId === '8453') || baseData.pairs[0];
              cryptoData = {
                id: query,
                symbol: basePair.baseToken.symbol,
                name: basePair.baseToken.name,
                current_price: parseFloat(basePair.priceUsd) || 0,
                price_change_percentage_24h: parseFloat(basePair.priceChange?.h24) || 0,
                contract_address: query
              };
            }
          }

          if (!cryptoData) {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${query}`);
            if (response.ok) {
              const data = await response.json();
              if (data.market_data && data.market_data.current_price) {
                cryptoData = {
                  id: data.id,
                  symbol: data.symbol.toUpperCase(),
                  name: data.name,
                  current_price: data.market_data.current_price.usd || 0,
                  price_change_percentage_24h: data.market_data.price_change_percentage_24h || 0,
                  contract_address: query
                };
              }
            }
          }
        } catch (error) {
          console.log('Erreur recherche contrat:', error);
        }
      }

      if (!cryptoData) {
        try {
          const response = await fetch(`https://api.coingecko.com/api/v3/coins/${query}`);
          if (response.ok) {
            const data = await response.json();
            if (data.market_data && data.market_data.current_price) {
              cryptoData = {
                id: data.id,
                symbol: data.symbol.toUpperCase(),
                name: data.name,
                current_price: data.market_data.current_price.usd || 0,
                price_change_percentage_24h: data.market_data.price_change_percentage_24h || 0,
                contract_address: contractAddress
              };
            }
          }
        } catch (error) {
          console.log('Erreur CoinGecko ID:', error);
        }
      }

      if (!cryptoData) {
        try {
          const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.coins && searchData.coins.length > 0) {
              const coin = searchData.coins[0];
              const detailResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}`);
              if (detailResponse.ok) {
                const data = await detailResponse.json();
                if (data.market_data && data.market_data.current_price) {
                  cryptoData = {
                    id: data.id,
                    symbol: data.symbol.toUpperCase(),
                    name: data.name,
                    current_price: data.market_data.current_price.usd || 0,
                    price_change_percentage_24h: data.market_data.price_change_percentage_24h || 0,
                    contract_address: contractAddress
                  };
                }
              }
            }
          }
        } catch (error) {
          console.log('Erreur recherche CoinGecko:', error);
        }
      }

      if (cryptoData) {
        setSelectedCrypto(cryptoData);
        toast({
          title: t('success'),
          description: `${cryptoData.name} (${cryptoData.symbol}) ${t('cryptoFound')}`
        });
      } else {
        throw new Error('Cryptocurrency not found');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: t('error'),
        description: `${t('cryptoNotFound')}
• Adresse de contrat Base (0x...)
• Adresse de contrat Solana (Pump.fun)
• Adresse de contrat Ethereum (0x...)
• Symbole (BTC, ETH, DOGE)
• Nom complet (Bitcoin, Ethereum)`,
        variant: "destructive",
        duration: 8000
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
      {/* Site Header - Always visible at the top */}
      <SiteHeader />

      {/* Navigation Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {isMobile ? (
            <MobileHeader
              balance={balance}
              user={user}
              onShowSettings={() => setShowSettings(!showSettings)}
              onShowAuth={() => setShowAuth(!showAuth)}
              onSignOut={handleSignOut}
            />
          ) : (
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm text-gray-300">
                    {t('currentBalance')}: <span className="font-bold text-white">${balance.toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {user ? (
                      <span className="flex items-center justify-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        {t('connected')}: {user.email}
                      </span>
                    ) : (
                      <span>Mode: {t('demo')}</span>
                    )}
                  </p>
                </div>
                
                <Button onClick={() => setShowSettings(!showSettings)} variant="outline" size="sm" className="border-purple-400/50 text-base rounded text-cyan-400 bg-slate-900 hover:bg-slate-800 font-normal p-2">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
                
                {user ? (
                  <Button onClick={handleSignOut} variant="outline" className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/10 text-sm px-4">
                    <UserCircle className="h-4 w-4 mr-2" />
                    {t('signOut')}
                  </Button>
                ) : (
                  <Button onClick={() => setShowAuth(!showAuth)} variant="outline" className="border-cyan-400/50 text-cyan-300 bg-slate-900 hover:bg-slate-800 text-sm px-4">
                    <UserCircle className="h-4 w-4 mr-2" />
                    {t('signIn')}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-6 mt-3 sm:mt-4 overflow-x-auto">
            <Button 
              variant={activeTab === 'trading' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('trading')} 
              className={`${activeTab === 'trading' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'text-gray-300 hover:text-white'} text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap`}
            >
              {t('trading')}
            </Button>
            <Button 
              variant={activeTab === 'portfolio' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('portfolio')} 
              className={`${activeTab === 'portfolio' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'text-gray-300 hover:text-white'} text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap`}
            >
              {t('portfolio')}
            </Button>
            <Button 
              variant={activeTab === 'history' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('history')} 
              className={`${activeTab === 'history' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'text-gray-300 hover:text-white'} text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap`}
            >
              {t('history')}
            </Button>
            <Button 
              variant={activeTab === 'nft' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('nft')} 
              className={`${activeTab === 'nft' ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' : 'text-gray-300 hover:text-white'} text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap`}
            >
              NFT
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className="fixed top-32 sm:top-36 right-2 sm:right-4 z-40 w-[calc(100vw-16px)] sm:w-auto max-w-sm">
            <Settings 
              demoBalance={balance} 
              onDemoBalanceChange={user ? updateBalance : setBalance} 
              onResetAccount={handleResetAccount}
              isDemo={!user}
              onClose={() => setShowSettings(false)}
            />
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'trading' && (
          <>
            {/* Popular Cryptos */}
            <PopularCryptos onSelectCrypto={setSelectedCrypto} />

            {/* Memecoin Search */}
            <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{t('searchCrypto')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Input
                    type="text"
                    placeholder={t('contractPlaceholder')}
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="flex-1 bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 text-sm"
                  />
                  <Button
                    onClick={searchCrypto}
                    disabled={loading}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white whitespace-nowrap"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? t('searching') : t('search')}
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
                lastUpdate={lastUpdate}
                isUpdating={isUpdating}
                priceSource={priceSource}
                isPriceConsistent={isPriceConsistent}
              />
            ) : (
              <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-8 sm:p-12 text-center">
                  <p className="text-gray-400 text-base sm:text-lg">{t('searchToTrade')}</p>
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
            onSelectCrypto={(crypto) => {
              setSelectedCrypto(crypto);
              setActiveTab('trading');
            }}
            onUpdatePositions={handleUpdatePositions}
          />
        )}

        {activeTab === 'history' && transactions.length > 0 && (
          <TransactionHistory transactions={transactions} />
        )}

        {activeTab === 'history' && transactions.length === 0 && (
          <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12 text-center">
              <p className="text-gray-400 text-base sm:text-lg">{t('noTransactions')}</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'nft' && <NFTGallery />}

        {/* Auth Panel */}
        {showAuth && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 rounded-lg p-4 sm:p-6 w-full max-w-md border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">{t('authentication')}</h2>
                <Button onClick={() => setShowAuth(false)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  ✕
                </Button>
              </div>
              <Auth onClose={() => setShowAuth(false)} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
