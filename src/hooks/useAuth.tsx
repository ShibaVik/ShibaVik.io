
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fonction pour synchroniser les données utilisateur
    const syncUserData = async (currentSession: Session | null) => {
      if (!mounted) return;
      
      console.log('Synchronisation des données utilisateur:', currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    };

    // Vérifier la session existante au chargement
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
        }
        await syncUserData(session);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Changement d\'état auth:', event, session?.user?.email);
        await syncUserData(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Tentative de connexion pour:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Erreur de connexion:', error.message);
        return { data: null, error };
      }
      
      console.log('Connexion réussie:', data.user?.email);
      return { data, error: null };
    } catch (err) {
      console.error('Exception lors de la connexion:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Tentative d\'inscription pour:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Erreur d\'inscription:', error.message);
        return { data: null, error };
      }
      
      console.log('Inscription réussie:', data.user?.email);
      return { data, error: null };
    } catch (err) {
      console.error('Exception lors de l\'inscription:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Tentative de déconnexion');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur de déconnexion:', error.message);
      } else {
        console.log('Déconnexion réussie');
        setUser(null);
        setSession(null);
      }
    } catch (err) {
      console.error('Exception lors de la déconnexion:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  };
};
