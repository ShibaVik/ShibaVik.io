
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
    <footer className="mt-12 border-t border-gray-700 pt-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            ShibaVik.io
          </h3>
        </div>
        
        <div className="flex items-center space-x-6">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 group"
            >
              {link.icon ? (
                <link.icon className="h-5 w-5 group-hover:text-blue-400 transition-colors" />
              ) : (
                <span className="text-sm font-bold group-hover:text-blue-400 transition-colors">
                  🌊
                </span>
              )}
              <span className="text-sm">
                {link.name === 'Twitter' ? '𝕏' : link.label}
              </span>
            </a>
          ))}
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 ShibaVik.io - Simulateur de trading de MemeCoin</p>
          <p className="mt-1">🚀 Tradez vos cryptos préférées en toute sécurité</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
