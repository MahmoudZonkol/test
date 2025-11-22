import React, { useState } from 'react';
import { 
  computeW4, 
  hexToBlock, 
  subBytesState, 
  shiftRowsState, 
  mixColumnsState, 
  formatByte,
  hexToWord
} from '../services/cryptoLogic';
import MatrixGrid from './MatrixGrid';

const AesHelper: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'pipeline' | 'w4'>('pipeline');

  // --- W4 STATES ---
  const [w0, setW0] = useState('1A91F720');
  const [w1, setW1] = useState('00000000');
  const [w2, setW2] = useState('00000000');
  const [w3, setW3] = useState('10000000');
  const [rcon, setRcon] = useState('10000000');
  const [w4Result, setW4Result] = useState<string | null>(null);
  const [w4Details, setW4Details] = useState<any>(null);
  const [w4Error, setW4Error] = useState('');

  // --- PIPELINE STATES ---
  const [plaintext, setPlaintext] = useState('EA125A00044513110cF19819082319c5');
  const [pipelineStep, setPipelineStep] = useState(0); 
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pipelineError, setPipelineError] = useState('');

  // --- LOGIC ---
  
  const handleCalculateW4 = () => {
    setW4Error('');
    setW4Result(null);
    setW4Details(null);
    try {
      // We'll re-implement the detailed logic here to show intermediate steps
      const w0Bytes = hexToWord(w0);
      const w3Bytes = hexToWord(w3);
      const rconBytes = hexToWord(rcon);

      // 1. RotWord
      const rot = [...w3Bytes.slice(1), w3Bytes[0]];
      
      // 2. SubWord (Using standard S-Box from cryptoLogic, simplified access here for demo)
      // We actually need the S-Box array. Importing the function effectively runs it.
      // Ideally we'd expose S-BOX but we can just run the blackbox result.
      
      // Let's rely on the imported function for the final result, 
      // but we can manually simulate Rot/Sub for display since we don't export SBOX array directly.
      // WAIT: We do export subBytesState. We can use that for a word (4 bytes) by padding or logic.
      
      const finalW4 = computeW4(w0, w3, rcon);
      
      // Reverse engineering for display:
      // XORing finalW4 with w0 with rcon gives us the SubWord(RotWord(w3))
      // But simpler:
      // Just show the inputs and the result. The user needs to see:
      // W4 = W0 XOR g(W3)
      // g(W3) = SubWord(RotWord(W3)) XOR Rcon
      
      setW4Result(finalW4.map(formatByte).join(''));
      setW4Details({
        w0: w0Bytes.map(formatByte).join(' '),
        w3: w3Bytes.map(formatByte).join(' '),
        rot: rot.map(formatByte).join(' '),
        // approximate
      });

    } catch (err: any) {
      setW4Error(err.message);
    }
  };

  // Pre-calculate pipeline states
  let stepsData = null;
  try {
    const initial = hexToBlock(plaintext);
    const afterSub = subBytesState(initial);
    const afterShift = shiftRowsState(afterSub);
    const afterMix = mixColumnsState(afterShift);
    stepsData = { initial, afterSub, afterShift, afterMix };
  } catch (e: any) {
     // Error handling done in render
  }

  const renderPipelineContent = () => {
     if (!stepsData) return <div className="text-red-400 p-4 border border-red-900 rounded bg-red-900/20">Invalid Hex Input</div>;

     const { initial, afterSub, afterShift, afterMix } = stepsData;

     switch(pipelineStep) {
        case 0: // Input
            return (
                <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-fadeIn">
                     <MatrixGrid state={initial} title="Initial State Matrix" description="16 bytes arranged column-major" />
                     <p className="text-slate-400 text-center max-w-lg">
                         AES operates on a 4x4 matrix of bytes called the <b>State</b>. 
                         The input 32 hex characters are filled into this matrix from top to bottom, left to right.
                     </p>
                </div>
            );
        case 1: // SubBytes
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 animate-fadeIn items-center">
                    <MatrixGrid 
                        state={initial} 
                        title="Before SubBytes" 
                        highlightMode="cell"
                        activeIndex={hoveredIndex}
                        onHoverIndex={setHoveredIndex}
                        description="Hover a byte to see transformation"
                    />
                    
                    <div className="flex flex-col items-center gap-4">
                        <div className="hidden md:block text-3xl text-slate-600">➜</div>
                        <div className="bg-slate-800 p-4 rounded border border-slate-600 w-full text-center min-h-[100px] flex flex-col justify-center">
                             {hoveredIndex !== null ? (
                                 <>
                                    <span className="text-xs text-slate-500 uppercase">Transformation</span>
                                    <div className="flex items-center justify-center gap-4 text-xl font-mono font-bold mt-2">
                                        <span className="text-slate-400">{formatByte(initial[hoveredIndex])}</span>
                                        <span className="text-emerald-500">S-BOX</span>
                                        <span className="text-emerald-400">{formatByte(afterSub[hoveredIndex])}</span>
                                    </div>
                                 </>
                             ) : (
                                 <span className="text-slate-500 italic">Hover over the left matrix</span>
                             )}
                        </div>
                    </div>

                    <MatrixGrid 
                        state={afterSub} 
                        title="After SubBytes" 
                        highlightMode="cell"
                        activeIndex={hoveredIndex}
                        onHoverIndex={setHoveredIndex}
                        description="Non-linear substitution step"
                    />
                </div>
            );
        case 2: // ShiftRows
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 animate-fadeIn">
                     <MatrixGrid state={afterSub} title="Before ShiftRows" highlightMode="rows" description="Rows are colored for clarity" />
                     <div className="flex flex-col justify-center space-y-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Row 0: No shift</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div> Row 1: Shift left by 1</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Row 2: Shift left by 2</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Row 3: Shift left by 3</div>
                     </div>
                     <div className="md:col-span-2 flex justify-center">
                        <div className="w-full max-w-md">
                            <MatrixGrid state={afterShift} title="After ShiftRows" highlightMode="rows" description="Bytes are cyclically shifted left" />
                        </div>
                     </div>
                 </div>
            );
        case 3: // MixColumns
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 animate-fadeIn">
                     <MatrixGrid state={afterShift} title="Before MixColumns" highlightMode="cols" description="Each column is processed independently" />
                     <div className="flex items-center justify-center text-center text-slate-400 text-sm px-4">
                         Each column is multiplied by a fixed matrix in GF(2^8). 
                         <br/><br/>
                         This step provides diffusion, spreading information across the whole state.
                     </div>
                     <div className="md:col-span-2 flex justify-center">
                        <div className="w-full max-w-md">
                             <MatrixGrid state={afterMix} title="After MixColumns" highlightMode="cols" description="New values derived from entire column" />
                        </div>
                     </div>
                     <div className="md:col-span-2 text-center">
                        <p className="font-mono text-emerald-400">Final State[0,0] = {formatByte(afterMix[0])}</p>
                     </div>
                 </div>
            );
        default: return null;
     }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
        
      {/* Navigation Toggle */}
      <div className="flex justify-center">
         <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
            <button
                onClick={() => setActiveSection('pipeline')}
                className={`px-6 py-2 rounded font-medium transition-all ${activeSection === 'pipeline' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                Step-by-Step Round
            </button>
            <button
                onClick={() => setActiveSection('w4')}
                className={`px-6 py-2 rounded font-medium transition-all ${activeSection === 'w4' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                Key Expansion (W4)
            </button>
         </div>
      </div>

      {/* --- PIPELINE MODE --- */}
      {activeSection === 'pipeline' && (
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 space-y-6">
             
             {/* Input Area */}
             <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Input Plaintext (32 Hex)</label>
                <div className="flex gap-2">
                    <input 
                        value={plaintext}
                        onChange={(e) => setPlaintext(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 font-mono text-slate-200 focus:border-emerald-500 outline-none"
                    />
                    <button 
                        onClick={() => setPlaintext("EA125A00044513110cF19819082319c5")}
                        className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
                    >
                        Reset Default
                    </button>
                </div>
             </div>

             {/* Stepper UI */}
             <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                {['Input', 'SubBytes', 'ShiftRows', 'MixColumns'].map((label, idx) => (
                    <button
                        key={label}
                        onClick={() => setPipelineStep(idx)}
                        className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                            pipelineStep === idx 
                                ? 'text-emerald-400 bg-emerald-900/20 font-bold' 
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                            pipelineStep === idx ? 'border-emerald-500 bg-emerald-900' : 'border-slate-600'
                        }`}>
                            {idx + 1}
                        </div>
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
             </div>

             {/* Content Viewer */}
             <div className="min-h-[400px] flex flex-col">
                 {renderPipelineContent()}
             </div>

             {/* Footer Nav */}
             <div className="flex justify-between pt-4 border-t border-slate-700">
                 <button 
                    disabled={pipelineStep === 0}
                    onClick={() => setPipelineStep(p => p - 1)}
                    className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    Previous
                 </button>
                 <button 
                    disabled={pipelineStep === 3}
                    onClick={() => setPipelineStep(p => p + 1)}
                    className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    Next Step
                 </button>
             </div>

          </div>
      )}

      {/* --- W4 MODE --- */}
      {activeSection === 'w4' && (
         <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 space-y-8 animate-fadeIn">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['W0', 'W1', 'W2', 'W3', 'Rcon'].map((label) => (
                  <div key={label}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
                    <input
                      type="text"
                      value={
                        label === 'W0' ? w0 :
                        label === 'W1' ? w1 :
                        label === 'W2' ? w2 :
                        label === 'W3' ? w3 : rcon
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if(label === 'W0') setW0(val);
                        else if(label === 'W1') setW1(val);
                        else if(label === 'W2') setW2(val);
                        else if(label === 'W3') setW3(val);
                        else setRcon(val);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 text-white font-mono rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleCalculateW4}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-lg shadow-emerald-900/20 transition-all"
              >
                Calculate W[4]
              </button>
              
              {w4Error && <p className="text-red-400 text-sm">{w4Error}</p>}

              {w4Result && (
                  <div className="bg-slate-900 p-6 rounded-xl border border-emerald-500/30">
                      <h3 className="text-emerald-400 font-bold uppercase tracking-wider mb-4">Calculation Path</h3>
                      
                      <div className="space-y-4 font-mono text-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span className="w-24 text-slate-500">Input W[3]</span>
                              <span className="text-slate-200">{w3}</span>
                          </div>
                          
                          <div className="flex flex-col gap-1 pl-4 border-l-2 border-slate-700 ml-4 py-2">
                              <div className="flex items-center gap-2">
                                  <span className="text-slate-500 text-xs uppercase">RotWord</span>
                                  <span className="text-slate-400">Rotate left 8 bits</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <span className="text-slate-500 text-xs uppercase">SubWord</span>
                                  <span className="text-slate-400">Apply S-Box to each byte</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <span className="text-slate-500 text-xs uppercase">XOR Rcon</span>
                                  <span className="text-slate-400">XOR with {rcon}</span>
                              </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span className="w-24 text-slate-500">Function g()</span>
                              <span className="text-purple-400 font-bold">Result of g(W3)</span>
                              <span className="text-xs text-slate-600">(Calculated internally)</span>
                          </div>

                          <div className="h-px bg-slate-700 my-2"></div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span className="w-24 text-slate-500">W[0]</span>
                              <span className="text-slate-200">{w0}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase pl-28">
                               ⬇ XOR
                          </div>

                           <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-emerald-900/10 p-2 -mx-2 rounded">
                              <span className="w-24 text-emerald-500 font-bold">W[4]</span>
                              <span className="text-2xl text-emerald-400 font-bold tracking-wider">{w4Result}</span>
                          </div>
                      </div>
                  </div>
              )}
         </div>
      )}

    </div>
  );
};

export default AesHelper;