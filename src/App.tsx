import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import NameForm from './components/NameForm';
import NameList from './components/NameList';

function App() {
  const [generatedNames, setGeneratedNames] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);

  const handleGenerateNames = async (formData) => {
    setIsLoading(true);
    setShowResults(false);
    
    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animal: formData.animal,
          traits: formData.traits,
          theme: formData.theme,
          num_names: formData.numNames
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGeneratedNames(data.results);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating names:', error);
      alert('Failed to generate names. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Floating background elements for visual delight */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-56 h-56 bg-orange-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12 relative">
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
