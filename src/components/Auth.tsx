
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { LogIn, UserPlus, Mail } from 'lucide-react';

interface AuthProps {
  onClose?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onClose }) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast({
            title: t('error'),
            description: t('passwordsDoNotMatch'),
            variant: "destructive"
          });
          return;
        }
        
        const { error } = await signUp(email, password);
        if (error) throw error;
        
        toast({
          title: t('success'),
          description: t('checkEmailVerification'),
          duration: 6000,
        });
        
        // Fermer le modal après inscription
        if (onClose) onClose();
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        toast({
          title: t('success'),
          description: t('loginSuccessful')
        });
        
        // Fermer le modal et rediriger après connexion réussie
        if (onClose) onClose();
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('errorOccurred'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center text-white">
          {isSignUp ? t('signUp') : t('signIn')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-200">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
              required
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
                required
              />
            </div>
          )}

          {isSignUp && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-blue-300">
                <Mail className="h-4 w-4" />
                <p className="text-sm">{t('emailVerificationNote')}</p>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            {loading ? "..." : (
              <>
                {isSignUp ? <UserPlus className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                {isSignUp ? t('signUp') : t('signIn')}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
          </p>
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-400 hover:text-cyan-300 p-0 h-auto font-normal"
          >
            {isSignUp ? t('signInHere') : t('signUpHere')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Auth;
