
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserCircle, Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileHeaderProps {
  balance: number;
  user: any;
  onShowSettings: () => void;
  onShowAuth: () => void;
  onSignOut: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  balance,
  user,
  onShowSettings,
  onShowAuth,
  onSignOut
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <div className="text-left">
        <p className="text-xs text-gray-300">
          Balance: <span className="font-bold text-white">${balance.toFixed(2)}</span>
        </p>
        <p className="text-xs text-gray-400">
          {user ? (
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Online
            </span>
          ) : (
            <span>{t('demo')}</span>
          )}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button onClick={onShowSettings} variant="outline" size="sm" className="border-purple-400/50 text-cyan-400 bg-slate-900 hover:bg-slate-800 p-2">
          <SettingsIcon className="h-4 w-4" />
        </Button>
        
        {user ? (
          <Button onClick={onSignOut} variant="outline" className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/10 text-xs px-2">
            <UserCircle className="h-4 w-4 mr-1" />
          </Button>
        ) : (
          <Button onClick={onShowAuth} variant="outline" className="border-cyan-400/50 text-cyan-300 bg-slate-900 hover:bg-slate-800 text-xs px-2">
            <UserCircle className="h-4 w-4 mr-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileHeader;
