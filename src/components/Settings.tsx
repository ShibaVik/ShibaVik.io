
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Globe, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsProps {
  demoBalance: number;
  onDemoBalanceChange: (balance: number) => void;
  isDemo: boolean;
}

const Settings: React.FC<SettingsProps> = ({ demoBalance, onDemoBalanceChange, isDemo }) => {
  const { language, setLanguage, t } = useLanguage();
  const [newBalance, setNewBalance] = useState(demoBalance.toString());

  const handleBalanceUpdate = () => {
    const balance = parseFloat(newBalance);
    if (balance > 0) {
      onDemoBalanceChange(balance);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <SettingsIcon className="h-5 w-5 text-white" />
          </div>
          <span>Paramètres</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <Label className="text-gray-200 font-medium flex items-center space-x-2">
            <Globe className="h-4 w-4 text-blue-400" />
            <span>Langue / Language</span>
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-gray-100 hover:border-purple-400/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="fr" className="text-gray-100 hover:bg-gray-700">🇫🇷 Français</SelectItem>
              <SelectItem value="en" className="text-gray-100 hover:bg-gray-700">🇺🇸 English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Demo Balance (only show if in demo mode) */}
        {isDemo && (
          <div className="space-y-3">
            <Label className="text-gray-200 font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span>Solde Démo Personnalisé</span>
            </Label>
            <div className="flex space-x-3">
              <Input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 flex-1"
                placeholder="10000"
              />
              <Button 
                onClick={handleBalanceUpdate}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                Appliquer
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Personnalisez votre solde de démo pour tester différents scénarios
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Settings;
