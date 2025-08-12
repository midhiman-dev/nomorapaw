import React from 'react';
import { Heart, Sparkles, PawPrint } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-12 mt-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-12 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-12 right-16 w-1 h-1 bg-pink-400/40 rounded-full animate-ping"></div>
        <div className="absolute top-16 right-24 w-1.5 h-1.5 bg-orange-400/20 rounded-full animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-6 text-center relative">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Heart className="w-8 h-8 mr-3 text-pink-400 animate-pulse" fill="currentColor" />
            <PawPrint className="w-4 h-4 absolute -top-1 -right-1 text-purple-300" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            NomoraPaw
          </span>
          <Sparkles className="w-6 h-6 ml-3 text-yellow-400 animate-spin" style={{animationDuration: '3s'}} />
        </div>
        
        <p className="text-purple-200 mb-4 text-lg font-medium">
          ✨ Powered by AI magic to find the perfect name for your beloved companion ✨
        </p>
        
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Heart className="w-4 h-4 text-red-400" fill="currentColor" />
          <span className="text-purple-300">Made with love for pet parents everywhere</span>
          <Heart className="w-4 h-4 text-red-400" fill="currentColor" />
        </div>
        
        <p className="text-gray-400 text-sm">
          © 2025 NomoraPaw. Bringing joy to pets and their humans. 🐾
        </p>
      </div>
    </footer>
  );
};

export default Footer;