
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Auth page
    welcome: "Bienvenue sur ShibaVik.io",
    signIn: "Se connecter",
    signUp: "S'inscrire",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    dontHaveAccount: "Pas de compte ?",
    alreadyHaveAccount: "Déjà un compte ?",
    signInHere: "Connectez-vous ici",
    signUpHere: "Inscrivez-vous ici",
    
    // Main app
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
    priceUpdated: "Prix actualisé automatiquement",
    trading: "Trading",
    portfolio: "Portfolio",
    history: "Historique",
    searchToTrade: "Recherchez une crypto-monnaie pour commencer à trader",
    signOut: "Déconnexion",
    
    // Trading
    buy: "ACHETER",
    sell: "VENDRE",
    quantity: "Quantité",
    amountInTokens: "Nombre de tokens",
    amountInDollars: "Montant en USD",
    unitPrice: "Prix unitaire",
    total: "Total",
    maximum: "Maximum",
    position: "Position",
    avgPurchasePrice: "Prix d'achat moyen",
    currentPrice: "Prix actuel",
    saleTotal: "Total de vente",
    
    // Portfolio
    noPositions: "Aucune position ouverte",
    startTrading: "Commencez par acheter des memecoins!",
    portfolioSummary: "Résumé du Portfolio",
    totalValue: "Valeur totale",
    totalCost: "Coût total",
    totalPnL: "P&L Total",
    
    // Errors
    error: "Erreur",
    success: "Succès",
    insufficientBalance: "Solde insuffisant",
    insufficientPosition: "Position insuffisante",
    buySuccess: "Achat réussi",
    sellSuccess: "Vente réussie",
    bought: "Acheté",
    sold: "Vendu",
    for: "pour"
  },
  en: {
    // Auth page
    welcome: "Welcome to ShibaVik.io",
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    signInHere: "Sign in here",
    signUpHere: "Sign up here",
    
    // Main app
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
    priceUpdated: "Price updated automatically",
    trading: "Trading",
    portfolio: "Portfolio",
    history: "History",
    searchToTrade: "Search for a cryptocurrency to start trading",
    signOut: "Sign Out",
    
    // Trading
    buy: "BUY",
    sell: "SELL",
    quantity: "Quantity",
    amountInTokens: "Number of tokens",
    amountInDollars: "Amount in USD",
    unitPrice: "Unit price",
    total: "Total",
    maximum: "Maximum",
    position: "Position",
    avgPurchasePrice: "Average purchase price",
    currentPrice: "Current price",
    saleTotal: "Sale total",
    
    // Portfolio
    noPositions: "No open positions",
    startTrading: "Start by buying some memecoins!",
    portfolioSummary: "Portfolio Summary",
    totalValue: "Total Value",
    totalCost: "Total Cost",
    totalPnL: "Total P&L",
    
    // Errors
    error: "Error",
    success: "Success",
    insufficientBalance: "Insufficient balance",
    insufficientPosition: "Insufficient position",
    buySuccess: "Purchase successful",
    sellSuccess: "Sale successful",
    bought: "Bought",
    sold: "Sold",
    for: "for"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('fr'); // Défaut en français

  const t = (key: string): string => {
    const currentTranslations = translations[language as keyof typeof translations];
    return currentTranslations?.[key as keyof typeof currentTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
