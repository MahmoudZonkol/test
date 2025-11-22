import React, { useState, useEffect } from 'react';
import { encryptCaesar, decryptCaesar } from '../services/cryptoLogic';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

const CaesarCipher: React.FC = () => {
  const [input, setInput] = useState('');
  const [shift, setShift] = useState<number>(3);
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Real-time update
  useEffect(() => {
    if (mode === 'encrypt') {
      setOutput(encryptCaesar(input, shift));
    } else {
      setOutput(decryptCaesar(input, shift));
    }
  }, [input, shift, mode]);

  const getShiftedAlphabet = () => {
    const s = shift % 26;
    const effectiveShift = mode === 'encrypt' ? s : -s;
    const shifted = [...ALPHABET];
    
    // Visual rotation for the bottom row
    // If encrypting with shift 3: A -> D. So visual map: Top A, Bottom D.
    // If decrypting with shift 3: Input A was really D (if shifted back). 
    // To keep it simple for the user: 
    // Encrypt: Top = Plain, Bottom = Cipher.
    // Decrypt: Top = Cipher, Bottom = Plain.
    
    return ALPHABET.map((char, i) => {
       let newIdx = (i + effectiveShift) % 26;
       if (newIdx < 0) newIdx += 26;
       return ALPHABET[newIdx];
    });
  };

  const shiftedAlphabet = getShiftedAlphabet();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Visual Mapping Tool */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
            Visual Mapping (Shift: {shift})
        </h3>
        
        <div className="relative overflow-x-auto pb-4">
           <div className="min-w-[800px] flex flex-col gap-2">
              {/* Top Row */}
              <div className="flex gap-1">
                <div className="w-16 text-xs text-slate-500 font-bold flex items-center">
                    {mode === 'encrypt' ? 'PLAIN' : 'CIPHER'}
                </div>
                {ALPHABET.map((char, i) => (
                    <div key={`top-${i}`} className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded text-slate-300 font-mono text-sm font-bold">
                        {char}
                    </div>
                ))}
              </div>

              {/* Connector Lines (Decorative) */}
              <div className="flex gap-1 pl-16 h-4">
                 {ALPHABET.map((_, i) => (
                    <div key={`line-${i}`} className="w-8 flex justify-center">
                        <div className="w-0.5 h-full bg-slate-600/50"></div>
                    </div>
                 ))}
              </div>

              {/* Bottom Row */}
               <div className="flex gap-1">
                <div className="w-16 text-xs text-blue-400 font-bold flex items-center">
                     {mode === 'encrypt' ? 'CIPHER' : 'PLAIN'}
                </div>
                {shiftedAlphabet.map((char, i) => (
                    <div key={`bottom-${i}`} className="w-8 h-8 flex items-center justify-center bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 font-mono text-sm font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        {char}
                    </div>
                ))}
              </div>
           </div>
        </div>
        <p className="text-center text-xs text-slate-500 mt-2">
            Read from Top to Bottom to see the transformation for each letter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-slate-800 p-1 rounded-lg flex">
             <button
                onClick={() => setMode('encrypt')}
                className={`flex-1 py-2 text-sm font-bold rounded transition-all ${
                    mode === 'encrypt' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                }`}
             >
                Encrypt
             </button>
             <button
                onClick={() => setMode('decrypt')}
                className={`flex-1 py-2 text-sm font-bold rounded transition-all ${
                    mode === 'decrypt' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                }`}
             >
                Decrypt
             </button>
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-slate-400 mb-2">
              <span>Shift Value (Key)</span>
              <span className="text-white font-mono">{shift}</span>
            </label>
            <input
              type="range"
              min="0"
              max="25"
              value={shift}
              onChange={(e) => setShift(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono">
                <span>0</span>
                <span>13</span>
                <span>25</span>
            </div>
          </div>
        </div>

        {/* Output Area */}
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Input Text
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type something..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 text-white rounded-lg px-4 py-2 outline-none transition-all font-mono resize-none"
            />
          </div>

           <div className="relative group">
            <label className="block text-sm font-medium text-emerald-400 mb-1">
              Result
            </label>
            <div className="min-h-[80px] w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 font-mono text-slate-200 break-all">
                {output || <span className="text-slate-700 italic">Output will appear here...</span>}
            </div>
             {output && (
                <button 
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="absolute top-8 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    Copy
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaesarCipher;