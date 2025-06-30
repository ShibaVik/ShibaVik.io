
import React from 'react';
import { Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    {
      name: 'Twitter',
      url: 'https://twitter.com/Nft_ShibaVik',
      icon: Twitter,
      label: '𝕏'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/sullyvan-milhau',
      icon: Linkedin,
      label: 'LinkedIn'
    },
    {
      name: 'OpenSea',
      url: 'https://opensea.io/ShibaVik',
      icon: null,
      label: 'OpenSea'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/ShibaVik',
      icon: Github,
      label: 'GitHub'
    }
  ];

  return (
    <footer className="mt-16 border-t border-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 pt-8 bg-gradient-to-br from-gray-900/50 to-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-6">
        {/* Brand section */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text">
            ShibaVik.io
          </h3>
        </div>
        
        {/* Social links - compact and prominent */}
        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl border border-gray-600/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 hover:scale-110"
              title={link.name}
            >
              {link.icon ? (
                <link.icon className="h-5 w-5 text-gray-300 group-hover:text-cyan-400 transition-colors duration-300" />
              ) : (
                <span className="text-lg group-hover:text-cyan-400 transition-colors duration-300">
                  🌊
                </span>
              )}
              
              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-cyan-400 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {link.name === 'Twitter' ? '𝕏' : link.label}
              </span>
            </a>
          ))}
        </div>
        
        {/* Copyright section with better contrast */}
        <div className="text-center space-y-2">
          <p className="text-gray-300 font-medium">
            © 2024 <span className="text-cyan-400">ShibaVik.io</span> - Simulateur de trading MemeCoin
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Tradez vos cryptos préférées en sécurité</span>
            <span className="text-cyan-400">🚀</span>
          </div>
        </div>

        {/* Decorative blockchain pattern */}
        <div className="flex items-center space-x-1 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 border border-cyan-400/30 rotate-45 bg-gradient-to-br from-cyan-400/10 to-transparent"></div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
