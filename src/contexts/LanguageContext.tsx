
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    title: "ShibaVik.io",
    subtitle: "Simulator developed by MS-ShibaVik A Student Cryptography Enthusiast",
    currentBalance: "Current Balance",
    signIn: "Sign In",
    signOut: "Sign Out",
    trading: "Trading",
    portfolio: "Portfolio",
    history: "History",
    connected: "Connected",
    demo: "Demo",

    // Popular Cryptos
    popularCryptos: "Popular Cryptos",
    lastUpdate: "Last Update",

    // Search
    searchCrypto: "Search Cryptocurrency",
    search: "Search",
    searchToTrade: "Search for a cryptocurrency to start trading",
    searching: "Searching...",
    contractPlaceholder: "Contract address, symbol or name (e.g. 0xBC45647eA894030a4E9801Ec03479739FA2485F0, BTC, ETH)",

    // Trading
    buy: "Buy",
    sell: "Sell",
    quantity: "Quantity",
    unitPrice: "Unit Price",
    total: "Total",
    maximum: "Max",
    currentPrice: "Current Price",
    position: "Position",
    avgPurchasePrice: "Avg Purchase Price",
    amountInTokens: "Amount in Tokens",
    amountInDollars: "Amount in Dollars",
    inputMode: "Input Mode",
    currentValue: "Current Value",

    // Portfolio
    portfolioSummary: "Portfolio Summary",
    totalValue: "Total Value",
    totalCost: "Total Cost",
    totalPnL: "Total P&L",
    noPositions: "No positions yet",
    startTrading: "Start trading to see your positions here",
    positions: "Positions",
    investedValue: "Invested Value",

    // Transactions
    transactionHistory: "Transaction History",
    noTransactions: "No transactions yet",

    // NFT
    nftTitle: "Mint Now NFTs ShibaVik Summer Era",
    viewOnOpenSea: "View on OpenSea",

    // Messages
    buySuccess: "Purchase Successful",
    sellSuccess: "Sale Successful",
    bought: "Bought",
    sold: "Sold",
    for: "for",
    insufficientBalance: "Insufficient Balance",
    insufficientPosition: "Insufficient Position",
    success: "Success",
    error: "Error",
    notEnoughFunds: "You don't have enough funds for this purchase.",
    notEnoughTokens: "You don't have enough tokens for this sale.",
    cryptoFound: "found successfully!",
    cryptoNotFound: "Unable to find this crypto. Try:",

    // Settings
    settings: "Settings",
    language: "Language",
    english: "English",
    french: "French",
    demoBalance: "Demo Balance",
    resetBalance: "Reset Balance",
    authentication: "Authentication",

    // Footer
    footerText: "Simulator developed by MS-ShibaVik",
    footerSubtext: "Educational purpose only - Not financial advice"
  },
  fr: {
    // Header
    title: "ShibaVik.io",
    subtitle: "Simulateur développé par MS-ShibaVik Étudiant Passionné de Cryptographie",
    currentBalance: "Solde Actuel",
    signIn: "Se Connecter",
    signOut: "Se Déconnecter",
    trading: "Trading",
    portfolio: "Portfolio",
    history: "Historique",
    connected: "Connecté",
    demo: "Démo",

    // Popular Cryptos
    popularCryptos: "Cryptos Populaires",
    lastUpdate: "Dernière MàJ",

    // Search
    searchCrypto: "Rechercher une Cryptomonnaie",
    search: "Rechercher",
    searchToTrade: "Recherchez une cryptomonnaie pour commencer à trader",
    searching: "Recherche en cours...",
    contractPlaceholder: "Adresse de contrat, symbole ou nom (ex: 0xBC45647eA894030a4E9801Ec03479739FA2485F0, BTC, ETH)",

    // Trading
    buy: "Acheter",
    sell: "Vendre",
    quantity: "Quantité",
    unitPrice: "Prix Unitaire",
    total: "Total",
    maximum: "Max",
    currentPrice: "Prix Actuel",
    position: "Position",
    avgPurchasePrice: "Prix d'Achat Moyen",
    amountInTokens: "Montant en Tokens",
    amountInDollars: "Montant en Dollars",
    inputMode: "Mode de saisie",
    currentValue: "Valeur actuelle",

    // Portfolio
    portfolioSummary: "Résumé du Portfolio",
    totalValue: "Valeur Totale",
    totalCost: "Coût Total",
    totalPnL: "P&L Total",
    noPositions: "Aucune position pour le moment",
    startTrading: "Commencez à trader pour voir vos positions ici",
    positions: "Positions",
    investedValue: "Valeur investie",

    // Transactions
    transactionHistory: "Historique des Transactions",
    noTransactions: "Aucune transaction pour le moment",

    // NFT
    nftTitle: "Mint Now NFTs ShibaVik Summer Era",
    viewOnOpenSea: "Voir sur OpenSea",

    // Messages
    buySuccess: "Achat Réussi",
    sellSuccess: "Vente Réussie",
    bought: "Acheté",
    sold: "Vendu",
    for: "pour",
    insufficientBalance: "Solde Insuffisant",
    insufficientPosition: "Position Insuffisante",
    success: "Succès",
    error: "Erreur",
    notEnoughFunds: "Vous n'avez pas assez de fonds pour effectuer cet achat.",
    notEnoughTokens: "Vous n'avez pas assez de tokens pour effectuer cette vente.",
    cryptoFound: "trouvé avec succès!",
    cryptoNotFound: "Impossible de trouver cette crypto. Essayez:",

    // Settings
    settings: "Paramètres",
    language: "Langue",
    english: "Anglais",
    french: "Français",
    demoBalance: "Solde Démo",
    resetBalance: "Réinitialiser le Solde",
    authentication: "Authentification",

    // Footer
    footerText: "Simulateur développé par MS-ShibaVik",
    footerSubtext: "À des fins éducatives uniquement - Pas de conseils financiers"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en'); // Anglais par défaut

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
