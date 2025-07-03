
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

    // Popular Cryptos
    popularCryptos: "Popular Cryptos",

    // Search
    searchCrypto: "Search Cryptocurrency",
    search: "Search",
    searchToTrade: "Search for a cryptocurrency to start trading",

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

    // Portfolio
    portfolioSummary: "Portfolio Summary",
    totalValue: "Total Value",
    totalCost: "Total Cost",
    totalPnL: "Total P&L",
    noPositions: "No positions yet",
    startTrading: "Start trading to see your positions here",

    // Transactions
    transactionHistory: "Transaction History",

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

    // Settings
    settings: "Settings",
    language: "Language",
    english: "English",
    french: "French",
    demoBalance: "Demo Balance",
    resetBalance: "Reset Balance"
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

    // Popular Cryptos
    popularCryptos: "Cryptos Populaires",

    // Search
    searchCrypto: "Rechercher une Cryptomonnaie",
    search: "Rechercher",
    searchToTrade: "Recherchez une cryptomonnaie pour commencer à trader",

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

    // Portfolio
    portfolioSummary: "Résumé du Portfolio",
    totalValue: "Valeur Totale",
    totalCost: "Coût Total",
    totalPnL: "P&L Total",
    noPositions: "Aucune position pour le moment",
    startTrading: "Commencez à trader pour voir vos positions ici",

    // Transactions
    transactionHistory: "Historique des Transactions",

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

    // Settings
    settings: "Paramètres",
    language: "Langue",
    english: "Anglais",
    french: "Français",
    demoBalance: "Solde Démo",
    resetBalance: "Réinitialiser le Solde"
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
