import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import NameForm from './components/NameForm';
import NameList from './components/NameList';

// Mock data for development - replace with actual API call
const mockGenerateNames = async (formData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock response based on form data
  const mockNames = [
    { name: "Luna", reason: "Perfect for a calm and gentle pet with a mysterious charm, inspired by the moon's serene beauty." },
    { name: "Ziggy", reason: "Great for an energetic and playful companion who loves to bounce around and bring joy to everyone." },
    { name: "Sage", reason: "Ideal for a wise and peaceful pet who seems to understand the world around them deeply." },
    { name: "Pepper", reason: "Perfect for a spunky pet with a bit of attitude and lots of personality to match their fiery spirit." },
    { name: "Echo", reason: "Wonderful for a pet who loves to vocalize and communicate, always making their presence known." }
  ];
  
  return mockNames.slice(0, formData.numNames);
};

function App() {
  const [generatedNames, setGeneratedNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGenerateNames = async (formData) => {
    setIsLoading(true);
    setShowResults(false);
    
    try {
      // TODO: Replace with actual API call to backend
      // const response = await fetch('/api/generate-names', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      // const data = await response.json();
      // setGeneratedNames(data.results);
      
      // Using mock data for now
      const names = await mockGenerateNames(formData);
      setGeneratedNames(names);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating names:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <NameForm 
          onGenerate={handleGenerateNames} 
          isLoading={isLoading}
        />
        
        <NameList 
          names={generatedNames} 
          isVisible={showResults}
        />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;