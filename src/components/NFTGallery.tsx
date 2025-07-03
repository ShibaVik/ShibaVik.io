
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const NFTGallery: React.FC = () => {
  const { t } = useLanguage();

  // NFT artworks data with real images
  const nftArtworks = [
    {
      id: 1,
      title: "Summer Era #001",
      image: "/lovable-uploads/87473569-185c-4045-949f-dadb46c56d20.png",
      description: "ShibaVik with blue lightning glasses - Digital art piece from Summer Era collection",
      openseaUrl: "https://opensea.io/collection/shibavik-summer-era/overview"
    },
    {
      id: 2,
      title: "Summer Era #002",
      image: "/lovable-uploads/2affb9d5-bdbd-4a23-9c9e-f0366645d4b6.png",
      description: "ShibaVik with pink lightning glasses - Unique cryptographic art representation",
      openseaUrl: "https://opensea.io/collection/shibavik-summer-era/overview"
    },
    {
      id: 3,
      title: "Summer Era #003",
      image: "/lovable-uploads/5e98f41d-8ea6-4c97-b847-89fb4cea9de2.png",
      description: "ShibaVik with magenta glasses - Abstract digital masterpiece",
      openseaUrl: "https://opensea.io/collection/shibavik-summer-era/overview"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <ImageIcon className="h-6 w-6" />
            <span>Mint Now NFTs ShibaVik Summer Era</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Summer Era Collection</h2>
            <p className="text-gray-300 mb-4">
              Discover unique digital artworks created by MS-ShibaVik. Each piece represents a moment in the Summer Era collection featuring the iconic ShibaVik character.
            </p>
            <Button
              onClick={() => window.open('https://opensea.io/collection/shibavik-summer-era/overview', '_blank')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Collection on OpenSea
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* NFT Carousel */}
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-8">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {nftArtworks.map((nft) => (
                <CarouselItem key={nft.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <Card className="bg-gray-800/80 border-gray-600 hover:bg-gray-700/80 transition-colors">
                      <CardContent className="p-4">
                        <div className="aspect-square rounded-lg mb-4 overflow-hidden border border-purple-500/30">
                          <img 
                            src={nft.image} 
                            alt={nft.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{nft.title}</h3>
                        <p className="text-sm text-gray-300 mb-4">{nft.description}</p>
                        <Button
                          onClick={() => window.open(nft.openseaUrl, '_blank')}
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          View on OpenSea
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-purple-400/50 text-purple-300 hover:bg-purple-500/10" />
            <CarouselNext className="border-purple-400/50 text-purple-300 hover:bg-purple-500/10" />
          </Carousel>
        </CardContent>
      </Card>

      {/* Collection Info */}
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Unique Artworks</h3>
              <p className="text-gray-300 text-sm">Each NFT is a one-of-a-kind digital creation featuring ShibaVik</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-pink-400 mb-2">Summer Era Theme</h3>
              <p className="text-gray-300 text-sm">Inspired by the vibrant energy of summer and lightning aesthetics</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Blockchain Verified</h3>
              <p className="text-gray-300 text-sm">Authentic ownership on the blockchain via OpenSea</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTGallery;
