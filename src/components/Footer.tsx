
import React from 'react';
import { Github, Linkedin, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { toast } = useToast();

  const socialLinks = [
    {
      name: 'Twitter',
      url: 'https://twitter.com/Nft_ShibaVik',
      icon: null,
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

  const donationAddresses = [
    {
      name: 'Ethereum',
      address: '0xeadb3f882b7dfff677bfca9384fa86ae4c31652f',
      symbol: 'ETH',
      color: 'from-blue-400 to-purple-500'
    },
    {
      name: 'Solana',
      address: 'JE5Bdz7kfTzTCbfZfVxJGXNaYFfq2RfjcB73foy2ZEo8',
      symbol: 'SOL',
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'Bitcoin',
      address: 'bc1q02xk0t9lrktqtrxm9qdgwd9s0e6ft550wnvmj6',
      symbol: 'BTC',
      color: 'from-orange-400 to-yellow-500'
    }
  ];

  const copyToClipboard = (address: string, name: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Adresse copiée !",
      description: `L'adresse ${name} a été copiée dans le presse-papiers.`
    });
  };

  return (
    <footer className="mt-16 border-t border-gray-700 pt-8 bg-gray-900/90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-8">
          {/* Axiom Partnership */}
          <div className="w-full max-w-4xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-4">
                🚀 Prêt pour le Trading Réel ?
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Passez au niveau suivant avec notre partenaire officiel
              </p>
              
              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-400/30 rounded-2xl p-8 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">A</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-xl font-bold text-white">Axiom Trade</h4>
                      <p className="text-cyan-300 text-sm">Plateforme de Trading Avancée</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-gray-300 mb-4">
                      ✨ Interface professionnelle • 📊 Analyses avancées • 🔒 Sécurité maximale
                    </p>
                    <a
                      href="https://axiom.trade/@shibavik"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                    >
                      <span className="mr-2">🎯</span>
                      Trader sur Axiom
                      <span className="ml-2">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brand section */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text">
              ShibaVik.io
            </h3>
          </div>
          
          {/* Social links */}
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
                ) : link.name === 'Twitter' ? (
                  <span className="text-lg text-gray-300 group-hover:text-cyan-400 transition-colors duration-300 font-bold">
                    𝕏
                  </span>
                ) : link.name === 'OpenSea' ? (
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-sm flex items-center justify-center group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300">
                    <span className="text-white text-xs font-bold">OS</span>
                  </div>
                ) : (
                  <span className="text-lg group-hover:text-cyan-400 transition-colors duration-300">
                    🌊
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Donation section */}
          <div className="w-full max-w-4xl">
            <div className="text-center mb-6">
              <h4 className="text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-2">
                💝 Support the Project
              </h4>
              <p className="text-gray-300 text-sm">
                Help us continue developing awesome crypto tools
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {donationAddresses.map((donation) => (
                <div
                  key={donation.name}
                  className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${donation.color} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{donation.symbol}</span>
                      </div>
                      <span className="text-gray-100 font-medium">{donation.name}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(donation.address, donation.name)}
                      className="p-2 bg-gray-700/50 rounded-lg hover:bg-cyan-500/20 transition-colors duration-200 group"
                      title="Copy address"
                    >
                      <Copy className="h-4 w-4 text-gray-300 group-hover:text-cyan-400" />
                    </button>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                    <p className="text-gray-300 text-xs font-mono break-all leading-relaxed">
                      {donation.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Copyright section */}
          <div className="text-center space-y-2">
            <p className="text-gray-300 font-medium">
              © 2024 <span className="text-cyan-400">ShibaVik.io</span> - MemeCoin Trading Simulator
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>Trade your favorite cryptos safely</span>
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
      </div>
    </footer>
  );
};

export default Footer;
