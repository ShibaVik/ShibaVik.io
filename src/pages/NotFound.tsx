
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Home, Rocket } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Rocket className="h-8 w-8 text-green-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            ShibaVik.io
          </h1>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-6xl font-bold text-gray-300">404</h2>
          <h3 className="text-2xl font-semibold text-gray-400">Page non trouvée</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <Button 
          onClick={() => navigate('/')}
          className="bg-green-600 hover:bg-green-700 px-6 py-3"
        >
          <Home className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
