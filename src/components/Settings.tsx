
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettingsProps {
  demoBalance: number;
  onDemoBalanceChange: (balance: number) => void;
  isDemo: boolean;
}

const Settings: React.FC<SettingsProps> = ({
  demoBalance,
  onDemoBalanceChange,
  isDemo
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [newBalance, setNewBalance] = useState(demoBalance.toString());

  const handleBalanceUpdate = () => {
    const balance = parseFloat(newBalance);
    if (balance > 0) {
      onDemoBalanceChange(balance);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 backdrop-blur-sm bg-slate-900 py-0">
      <CardContent className="p-4 space-y-4 bg-slate-900 py-[16px] my-0">
        {/* Language Selection */}
        <div className="flex items-center space-x-3">
          <Globe className="h-4 w-4 text-blue-400" />
          <Label className="text-gray-200 text-sm">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32 bg-gray-700/50 border-gray-600/50 text-gray-100 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="en" className="text-gray-100 hover:bg-gray-700">🇺🇸 EN</SelectItem>
              <SelectItem value="fr" className="text-gray-100 hover:bg-gray-700">🇫🇷 FR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Demo Balance (show for both demo and connected users) */}
        <div className="flex items-center space-x-3">
          <DollarSign className="h-4 w-4 text-green-400" />
          <Label className="text-gray-200 text-sm">
            {isDemo ? 'Demo Balance' : 'Account Balance'}
          </Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="w-24 h-8 bg-gray-700/50 border-gray-600/50 text-white text-xs"
              placeholder="10000"
            />
            <Button
              onClick={handleBalanceUpdate}
              size="sm"
              className="h-8 px-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs"
            >
              Set
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;
