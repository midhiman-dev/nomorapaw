import React, { useState } from 'react';
import { Sparkles, Loader2, PawPrint, Heart, Star, Camera, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

const NameForm = ({ onGenerate, isLoading }) => {
  const [formData, setFormData] = useState({
    animal: '',
    traits: [],
    theme: '',
    numNames: 5
  });
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [showTraitModal, setShowTraitModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

  // Common pets for main grid
  const commonPets = [
    { id: 'dog', name: 'Dog', emoji: '🐕' },
    { id: 'cat', name: 'Cat', emoji: '🐱' },
    { id: 'rabbit', name: 'Rabbit', emoji: '🐰' },
    { id: 'bird', name: 'Bird', emoji: '🐦' },
    { id: 'fish', name: 'Fish', emoji: '🐠' },
    { id: 'hamster', name: 'Hamster', emoji: '🐹' },
    { id: 'turtle', name: 'Turtle', emoji: '🐢' },
    { id: 'guinea-pig', name: 'Guinea Pig', emoji: '🐹' }
  ];

  // Rare animals for modal
  const rareAnimals = [
    { id: 'ferret', name: 'Ferret', emoji: '🦦' },
    { id: 'hedgehog', name: 'Hedgehog', emoji: '🦔' },
    { id: 'snake', name: 'Snake', emoji: '🐍' },
    { id: 'lizard', name: 'Lizard', emoji: '🦎' },
    { id: 'chinchilla', name: 'Chinchilla', emoji: '🐭' },
    { id: 'parrot', name: 'Parrot', emoji: '🦜' },
    { id: 'horse', name: 'Horse', emoji: '🐴' },
    { id: 'goat', name: 'Goat', emoji: '🐐' },
    { id: 'pig', name: 'Pig', emoji: '🐷' },
    { id: 'chicken', name: 'Chicken', emoji: '🐓' }
  ];

  // Personality traits
  const commonTraits = [
    'Playful', 'Calm', 'Energetic', 'Shy', 'Loyal', 'Curious', 'Gentle', 'Bold',
    'Friendly', 'Independent', 'Cuddly', 'Smart', 'Mischievous', 'Protective',
    'Social', 'Quiet', 'Active', 'Lazy', 'Brave', 'Sweet'
  ];

  // Themes with icons
  const themes = [
    { id: 'mythology', name: 'Mythology', emoji: '⚡', description: 'Gods & legends' },
    { id: 'nature', name: 'Nature', emoji: '🌿', description: 'Plants & elements' },
    { id: 'food', name: 'Food', emoji: '🍎', description: 'Delicious treats' },
    { id: 'space', name: 'Space', emoji: '🚀', description: 'Stars & planets' },
    { id: 'fantasy', name: 'Fantasy', emoji: '🧙', description: 'Magic & wonder' },
    { id: 'movies', name: 'Movies', emoji: '🎬', description: 'Film characters' },
    { id: 'music', name: 'Music', emoji: '🎵', description: 'Songs & artists' },
    { id: 'colors', name: 'Colors', emoji: '🎨', description: 'Vibrant hues' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.animal) return;
    
    onGenerate({
      ...formData,
      traits: formData.traits // Already an array
    });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);
  };

  const handleAnimalSelect = (animalId) => {
    setFormData({ ...formData, animal: animalId });
    setShowAnimalModal(false);
  };

  const handleTraitToggle = (trait) => {
    const newTraits = formData.traits.includes(trait)
      ? formData.traits.filter(t => t !== trait)
      : [...formData.traits, trait];
    setFormData({ ...formData, traits: newTraits });
  };

  const handleThemeSelect = (themeId) => {
    setFormData({ ...formData, theme: themeId });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      // Simulate AI detection - in real app, call image classification API
      setTimeout(() => {
        const detectedAnimal = commonPets[Math.floor(Math.random() * commonPets.length)];
        setFormData({ ...formData, animal: detectedAnimal.id });
      }, 1500);
    }
  };

  const nextTheme = () => {
    setCurrentThemeIndex((prev) => (prev + 1) % themes.length);
  };

  const prevTheme = () => {
    setCurrentThemeIndex((prev) => (prev - 1 + themes.length) % themes.length);
  };

  const getAnimalDisplay = () => {
    const animal = [...commonPets, ...rareAnimals].find(a => a.id === formData.animal);
    return animal ? `${animal.emoji} ${animal.name}` : 'Select your pet';
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl mx-auto relative overflow-hidden border border-purple-100">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="text-center mb-8 relative">
        <div className="relative inline-block">
          <PawPrint className="w-16 h-16 mx-auto text-purple-500 mb-4 animate-bounce" />
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="w-8 h-8 text-pink-500 animate-ping" fill="currentColor" />
            </div>
          )}
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Tell us about your pet
        </h2>
        <p className="text-gray-600 text-lg">
          We'll create magical names tailored just for them 🎭
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative">
        {/* Photo Upload Section - TEMPORARILY HIDDEN */}
        <div className="relative" style={{ display: 'none' }}>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Camera className="w-4 h-4 mr-2 text-purple-500" />
            Upload a photo (optional)
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-purple-200 rounded-2xl hover:border-purple-400 transition-all duration-300 cursor-pointer group"
            >
              {uploadedImage ? (
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded pet" className="h-24 w-24 object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-purple-500/20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-purple-600 font-medium">Tap to upload photo</p>
                  <p className="text-sm text-gray-500">AI will detect your pet type</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Animal Picker */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <PawPrint className="w-4 h-4 mr-2 text-purple-500" />
            What kind of animal? *
          </label>
          
          {/* Common pets grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {commonPets.map((pet) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => handleAnimalSelect(pet.id)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 ${
                  formData.animal === pet.id
                    ? 'border-purple-400 bg-purple-50 shadow-lg transform scale-105'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25 hover:scale-102'
                }`}
              >
                <span className="text-2xl">{pet.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{pet.name}</span>
              </button>
            ))}
          </div>

          {/* More animals button */}
          <button
            type="button"
            onClick={() => setShowAnimalModal(true)}
            className="w-full p-4 border-2 border-dashed border-purple-200 rounded-2xl text-purple-600 font-medium hover:border-purple-400 hover:bg-purple-25 transition-all duration-300"
          >
            + More Animals
          </button>

          {/* Selected animal display */}
          {formData.animal && (
            <div className="mt-3 p-3 bg-purple-50 rounded-xl">
              <p className="text-purple-700 font-medium text-center">
                Selected: {getAnimalDisplay()}
              </p>
            </div>
          )}
        </div>

        {/* Trait Selector */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <Star className="w-4 h-4 mr-2 text-pink-500" />
            Personality traits
          </label>
          
          {/* Scrollable trait chips */}
          <div className="flex overflow-x-auto pb-2 space-x-3 scrollbar-hide">
            {commonTraits.map((trait) => (
              <button
                key={trait}
                type="button"
                onClick={() => handleTraitToggle(trait)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  formData.traits.includes(trait)
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-700 hover:scale-105'
                }`}
              >
                {trait}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowTraitModal(true)}
              className="flex-shrink-0 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-medium hover:from-purple-200 hover:to-pink-200 transition-all duration-300"
            >
              + More Traits
            </button>
          </div>

          {/* Selected traits display */}
          {formData.traits.length > 0 && (
            <div className="mt-3 p-3 bg-pink-50 rounded-xl">
              <p className="text-pink-700 font-medium text-sm mb-2">Selected traits:</p>
              <div className="flex flex-wrap gap-2">
                {formData.traits.map((trait) => (
                  <span key={trait} className="px-2 py-1 bg-pink-200 text-pink-800 rounded-lg text-xs font-medium">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Browser */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-orange-500" />
            Theme or style
          </label>
          
          {/* Theme carousel */}
          <div className="relative">
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={prevTheme}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex space-x-4 overflow-hidden">
                {[-1, 0, 1].map((offset) => {
                  const index = (currentThemeIndex + offset + themes.length) % themes.length;
                  const theme = themes[index];
                  const isCenter = offset === 0;
                  
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        if (isCenter) {
                          handleThemeSelect(theme.id);
                        } else {
                          setCurrentThemeIndex(index);
                        }
                      }}
                      className={`flex-shrink-0 p-4 rounded-2xl border-2 transition-all duration-500 ${
                        isCenter
                          ? formData.theme === theme.id
                            ? 'border-orange-400 bg-orange-50 shadow-xl transform scale-110'
                            : 'border-gray-300 bg-white shadow-lg transform scale-105 hover:border-orange-300'
                          : 'border-gray-200 bg-gray-50 transform scale-90 opacity-60'
                      }`}
                      style={{ width: isCenter ? '140px' : '120px' }}
                    >
                      <div className="text-center">
                        <span className="text-3xl block mb-2">{theme.emoji}</span>
                        <span className="text-sm font-bold text-gray-800 block">{theme.name}</span>
                        <span className="text-xs text-gray-600">{theme.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <button
                type="button"
                onClick={nextTheme}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Selected theme display */}
          {formData.theme && (
            <div className="mt-3 p-3 bg-orange-50 rounded-xl">
              <p className="text-orange-700 font-medium text-center">
                Selected: {themes.find(t => t.id === formData.theme)?.name}
              </p>
            </div>
          )}
        </div>

        {/* Number of names selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Number of names
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[3, 5, 8, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setFormData({...formData, numNames: num})}
                className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  formData.numNames === num
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          type="submit"
          disabled={isLoading || !formData.animal}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              Creating Magic...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 mr-3 animate-pulse" />
              ✨ Generate Names ✨
            </>
          )}
        </button>
      </form>

      {/* Animal Modal */}
      {showAnimalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Choose Your Pet</h3>
              <button
                onClick={() => setShowAnimalModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {rareAnimals.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => handleAnimalSelect(pet.id)}
                  className="p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-25 transition-all duration-300 flex flex-col items-center space-y-2"
                >
                  <span className="text-2xl">{pet.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 text-center">{pet.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trait Modal */}
      {showTraitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">All Personality Traits</h3>
              <button
                onClick={() => setShowTraitModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {commonTraits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => handleTraitToggle(trait)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    formData.traits.includes(trait)
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-700'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowTraitModal(false)}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Done ({formData.traits.length} selected)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NameForm;