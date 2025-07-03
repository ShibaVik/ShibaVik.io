
-- Vérifier que les tables existent et sont bien configurées
-- Mettre à jour la table positions pour inclure les champs manquants si nécessaire
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS crypto_id TEXT;

-- Mettre à jour la table transactions pour s'assurer qu'elle a tous les champs nécessaires
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS crypto_id TEXT;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON public.positions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- Mettre à jour la fonction de gestion des nouveaux utilisateurs si nécessaire
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, initial_balance, current_balance)
  VALUES (new.id, new.email, 10000, 10000);
  RETURN new;
END;
$$;

-- Créer le trigger pour les nouveaux utilisateurs s'il n'existe pas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
