
import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SiteHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 border-b border-gray-700/50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent truncate">
                ShibaVik.io
              </h1>
              <p className="text-sm sm:text-base text-gray-300 -mt-1">
                {t('footerText')}
              </p>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <a href="https://twitter.com/Nft_ShibaVik" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors" title="Twitter">
              <span className="text-gray-300 hover:text-cyan-400 text-base">𝕏</span>
            </a>
            <a href="https://www.linkedin.com/in/sullyvan-milhau" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors" title="LinkedIn">
              <Linkedin className="h-5 w-5 text-gray-300 hover:text-cyan-400" />
            </a>
            <a href="https://opensea.io/ShibaVik" target="_blank" rel="noopener noreferrer" title="OpenSea" className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs">OS</span>
              </div>
            </a>
            <a href="https://github.com/ShibaVik" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors" title="GitHub">
              <Github className="h-5 w-5 text-gray-300 hover:text-cyan-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteHeader;
