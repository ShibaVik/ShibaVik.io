
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Position {
  crypto: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
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
  contract_address?: string;
}

export const useUserData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les données utilisateur depuis Supabase
  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Charger le profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (profile) {
        setBalance(profile.current_balance || 10000);
      }

      // Charger les positions
      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id);

      if (positionsError) throw positionsError;

      if (positionsData) {
        const formattedPositions = positionsData.map(pos => ({
          crypto: pos.crypto_symbol,
          amount: Number(pos.amount),
          avgPrice: Number(pos.avg_price),
          currentPrice: Number(pos.current_price) || 0,
          contract_address: pos.contract_address || undefined
        }));
        setPositions(formattedPositions);
      }

      // Charger les transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      if (transactionsData) {
        const formattedTransactions = transactionsData.map(tx => ({
          id: tx.id,
          type: tx.type as 'buy' | 'sell',
          crypto: tx.crypto_symbol,
          amount: Number(tx.amount),
          price: Number(tx.price),
          total: Number(tx.total),
          timestamp: new Date(tx.created_at || ''),
          contract_address: tx.contract_address || undefined
        }));
        setTransactions(formattedTransactions);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOUVELLE FONCTION: Réinitialiser complètement toutes les données utilisateur
  const resetAllUserData = async () => {
    if (!user) return;

    try {
      console.log('🗑️ Suppression de toutes les données utilisateur...');
      
      // Supprimer toutes les transactions
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (transactionsError) throw transactionsError;

      // Supprimer toutes les positions
      const { error: positionsError } = await supabase
        .from('positions')
        .delete()
        .eq('user_id', user.id);

      if (positionsError) throw positionsError;

      // Réinitialiser le solde à 10000
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ current_balance: 10000 })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Mettre à jour l'état local
      setBalance(10000);
      setPositions([]);
      setTransactions([]);

      console.log('✅ Toutes les données utilisateur ont été réinitialisées');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      throw error;
    }
  };

  // Sauvegarder une transaction
  const saveTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          crypto_symbol: transaction.crypto,
          crypto_name: transaction.crypto,
          amount: transaction.amount,
          price: transaction.price,
          total: transaction.total,
          contract_address: transaction.contract_address
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la transaction:', error);
    }
  };

  // Mettre à jour une position
  const updatePosition = async (crypto: string, amount: number, avgPrice: number, currentPrice: number, contractAddress?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('positions')
        .upsert({
          user_id: user.id,
          crypto_symbol: crypto,
          crypto_name: crypto,
          amount: amount,
          avg_price: avgPrice,
          current_price: currentPrice,
          contract_address: contractAddress
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error);
    }
  };

  // Supprimer une position
  const deletePosition = async (crypto: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('user_id', user.id)
        .eq('crypto_symbol', crypto);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression de la position:', error);
    }
  };

  // Mettre à jour le solde
  const updateBalance = async (newBalance: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ current_balance: newBalance })
        .eq('id', user.id);

      if (error) throw error;
      setBalance(newBalance);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du solde:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Mode démo - reset aux valeurs par défaut
      setBalance(10000);
      setPositions([]);
      setTransactions([]);
    }
  }, [user]);

  return {
    balance,
    positions,
    transactions,
    loading,
    setBalance,
    setPositions,
    setTransactions,
    saveTransaction,
    updatePosition,
    deletePosition,
    updateBalance,
    loadUserData,
    resetAllUserData // ✅ NOUVELLE FONCTION EXPORTÉE
  };
};
