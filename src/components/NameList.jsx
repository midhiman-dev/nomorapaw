import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star, Copy, Check, Heart, Sparkles, PawPrint } from 'lucide-react';

const NameList = ({ names, isVisible }) => {
  const [ratings, setRatings] = useState({});
  const [copiedName, setCopiedName] = useState(null);

  const handleRating = (index, rating) => {
    setRatings(prev => ({
      ...prev,
      [index]: rating
    }));
    
    // Add celebratory animation for positive ratings
    if (rating === 'up') {
      // Trigger confetti or celebration effect
      const button = document.querySelector(`[data-rating-button="${index}-up"]`);
      if (button) {
        button.classList.add('animate-bounce');
        setTimeout(() => button.classList.remove('animate-bounce'), 600);
      }
    }
  };

  const copyToClipboard = async (name, index) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedName(index);
      setTimeout(() => setCopiedName(null), 2000);
    } catch (err) {
      console.error('Failed to copy name:', err);
    }
  };

  if (!isVisible || !names || names.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-16 animate-fade-in">
      <div className="text-center mb-12 relative">
        {/* Celebration elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-4 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="absolute -top-2 left-2/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
        </div>
        
        <div className="relative inline-block mb-6">
          <Star className="w-16 h-16 mx-auto text-yellow-500 mb-4 animate-spin" style={{animationDuration: '3s'}} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-6 h-6 text-pink-500 animate-pulse" fill="currentColor" />
          </div>
        </div>
        
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-4">
          Perfect Names for Your Pet
        </h2>
        <p className="text-gray-600 text-xl">
          🎉 Here are some magical name suggestions just for them! 🎉
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1 lg:max-w-3xl lg:mx-auto">
        {names.map((nameObj, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border-2 border-purple-100 hover:border-purple-200 transform hover:scale-[1.02] relative overflow-hidden group"
          >
            {/* Decorative background gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-50 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="flex items-start justify-between mb-6 relative">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <PawPrint className="w-6 h-6 mr-3 text-purple-500" />
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {nameObj.name}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(nameObj.name, index)}
                    className="ml-4 p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-full transition-all duration-200 hover:scale-110"
                    title="Copy name"
                  >
                    {copiedName === index ? (
                      <Check className="w-5 h-5 text-green-500 animate-bounce" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg pl-9">
                  {nameObj.reason}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100 relative">
              <div className="flex space-x-4">
                <button
                  data-rating-button={`${index}-up`}
                  onClick={() => handleRating(index, 'up')}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    ratings[index] === 'up'
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600 hover:scale-105'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>Love it!</span>
                </button>
                <button
                  data-rating-button={`${index}-down`}
                  onClick={() => handleRating(index, 'down')}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    ratings[index] === 'down'
                      ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:scale-105'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span>Not quite</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-lg font-bold text-purple-500">#{index + 1}</span>
              </div>
            </div>
            
            {/* Success celebration overlay */}
            {ratings[index] === 'up' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="text-6xl animate-bounce">🎉</div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Generate more names button */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-6 text-lg">
          Want more options? Generate another batch! 🔄
        </p>
      </div>
    </div>
  );
};

export default NameList;