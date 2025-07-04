
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserCircle, Settings as SettingsIcon, Github, Linkedin } from 'lucide-react';
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
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">S</span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            ShibaVik.io
          </h1>
          <p className="text-[10px] text-gray-400 -mt-0.5">
            {t('footerText')}
          </p>
        </div>
        
        {/* Social Links */}
        <div className="flex items-center space-x-1">
          <a href="https://twitter.com/Nft_ShibaVik" target="_blank" rel="noopener noreferrer" className="p-1 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors" title="Twitter">
            <span className="text-gray-300 hover:text-cyan-400 text-xs">𝕏</span>
          </a>
          <a href="https://www.linkedin.com/in/sullyvan-milhau" target="_blank" rel="noopener noreferrer" className="p-1 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors" title="LinkedIn">
            <Linkedin className="h-3 w-3 text-gray-300 hover:text-cyan-400" />
          </a>
          <a href="https://opensea.io/ShibaVik" target="_blank" rel="noopener noreferrer" title="OpenSea" className="p-1 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">OS</span>
            </div>
          </a>
          <a href="https://github.com/ShibaVik" target="_blank" rel="noopener noreferrer" className="p-1 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors" title="GitHub">
            <Github className="h-3 w-3 text-gray-300 hover:text-cyan-400" />
          </a>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="text-right">
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
