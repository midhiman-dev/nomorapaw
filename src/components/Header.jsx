import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-xl relative overflow-hidden">
      {/* Floating elements for delight */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-8 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-12 right-12 w-1 h-1 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-8 left-16 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-6 py-8 relative">
        <div className="flex items-center justify-center mb-2">
          <div className="relative">
            <Heart className="w-10 h-10 mr-3 text-pink-200 animate-pulse" fill="currentColor" />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-200 animate-spin" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
            NomoraPaw
          </h1>
        </div>
        <p className="text-center text-pink-100 text-lg font-medium">
          ✨ Discover the perfect name for your furry friend ✨
        </p>
      </div>
    </header>
  );
};

export default Header;