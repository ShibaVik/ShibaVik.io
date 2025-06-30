
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Rocket, ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [initialBalance, setInitialBalance] = useState(10000);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            initial_balance: initialBalance
          }
        }
      });

      if (error) throw error;

      setShowEmailVerification(true);
      toast({
        title: "Compte créé !",
        description: "Vérifiez votre email pour confirmer votre compte avant de vous connecter."
      });
    } catch (error: any) {
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie !",
        description: "Bienvenue sur ShibaVik.io"
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Rocket className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                ShibaVik.io
              </h1>
            </div>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-center text-white flex items-center justify-center space-x-2">
                <Mail className="h-5 w-5 text-green-400" />
                <span>Vérifiez votre email</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                <p className="text-green-200 mb-2">
                  Un email de confirmation a été envoyé à :
                </p>
                <p className="font-semibold text-green-400">{email}</p>
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <p>📧 Cliquez sur le lien dans l'email pour activer votre compte</p>
                <p>🔒 Une fois confirmé, vous pourrez vous connecter</p>
                <p className="text-yellow-400">
                  ⚠️ N'oubliez pas de vérifier vos spams !
                </p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowEmailVerification(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Retour
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Continuer en mode démo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Rocket className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              ShibaVik.io
            </h1>
          </div>
          <p className="text-gray-400">Simulateur de trading de MemeCoin</p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-white">
              Accédez à votre compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="initial-balance">Solde initial (USD)</Label>
                    <Input
                      id="initial-balance"
                      type="number"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      min={1000}
                      max={1000000}
                      step={1000}
                    />
                    <p className="text-xs text-gray-400">
                      Choisissez votre solde démo (entre 1 000 et 1 000 000 USD)
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer un compte'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-400">
          <p>💡 L'inscription permet de sauvegarder vos trades en permanence</p>
          <p>✅ Vous pouvez aussi utiliser le mode démo sans inscription</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
