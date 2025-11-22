import React, { useState } from 'react';
import CaesarCipher from './components/CaesarCipher';
import AesHelper from './components/AesHelper';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'caesar' | 'aes'>('caesar');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                C
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Crypto<span className="text-slate-200">Edu</span>
              </h1>
            </div>
            
            <nav className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('caesar')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'caesar'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Caesar Cipher
              </button>
              <button
                onClick={() => setActiveTab('aes')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'aes'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AES Helper
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
          {activeTab === 'caesar' ? (
             <section>
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Caesar Cipher</h2>
                    <p className="text-slate-400">A simple substitution cipher that shifts alphabets.</p>
                </div>
                <CaesarCipher />
             </section>
          ) : (
             <section>
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">AES Educational Helper</h2>
                    <p className="text-slate-400">Visualize AES logic including Key Expansion (W4) and One-Shot Transformations.</p>
                </div>
                <AesHelper />
             </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-8 text-center text-slate-500 text-sm">
        <p>Built for Cryptography Education</p>
      </footer>
      
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;