import React from 'react';
import { formatByte } from '../services/cryptoLogic';

interface MatrixGridProps {
  state: number[]; // 16 bytes, column-major
  title: string;
  highlightMode?: 'none' | 'rows' | 'cols' | 'cell';
  activeIndex?: number | null;
  onHoverIndex?: (index: number | null) => void;
  description?: string;
}

const MatrixGrid: React.FC<MatrixGridProps> = ({ 
  state, 
  title, 
  highlightMode = 'none',
  activeIndex = null,
  onHoverIndex,
  description
}) => {
  // Logic to convert column-major 1D array to row-major structure for display
  // state[r + 4*c]
  const rows = [0, 1, 2, 3].map(r => {
    return [0, 1, 2, 3].map(c => {
      const index = r + 4 * c; // Index in the column-major flat array
      return { byte: state[index], index, row: r, col: c };
    });
  });

  const getCellClass = (rowIndex: number, colIndex: number, flatIndex: number) => {
    const base = "h-10 w-full flex items-center justify-center font-mono font-bold rounded border transition-all duration-200 cursor-default ";
    
    if (highlightMode === 'none') {
      return base + "bg-slate-900 border-slate-700 text-cyan-400";
    }

    if (highlightMode === 'rows') {
      // Color code each row differently
      const colors = [
        "bg-red-900/20 border-red-500/50 text-red-400",
        "bg-yellow-900/20 border-yellow-500/50 text-yellow-400",
        "bg-green-900/20 border-green-500/50 text-green-400",
        "bg-blue-900/20 border-blue-500/50 text-blue-400",
      ];
      return base + colors[rowIndex];
    }

    if (highlightMode === 'cols') {
       // Color code each column differently
       const colors = [
        "bg-purple-900/20 border-purple-500/50 text-purple-400",
        "bg-pink-900/20 border-pink-500/50 text-pink-400",
        "bg-indigo-900/20 border-indigo-500/50 text-indigo-400",
        "bg-teal-900/20 border-teal-500/50 text-teal-400",
      ];
      return base + colors[colIndex];
    }

    if (highlightMode === 'cell') {
      const isActive = activeIndex === flatIndex;
      return base + (isActive 
        ? "bg-emerald-600 border-emerald-400 text-white scale-110 z-10 shadow-lg shadow-emerald-900/50" 
        : "bg-slate-900 border-slate-700 text-slate-500 opacity-70");
    }

    return base;
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm flex flex-col h-full">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider text-center">{title}</h4>
        {description && <p className="text-xs text-slate-500 text-center mt-1">{description}</p>}
      </div>
      
      <div className="grid grid-cols-4 gap-2 flex-1">
        {rows.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            {row.map(({ byte, index, col }) => (
              <div 
                key={index}
                onMouseEnter={() => onHoverIndex && onHoverIndex(index)}
                onMouseLeave={() => onHoverIndex && onHoverIndex(null)}
                className={getCellClass(rIdx, col, index)}
              >
                {formatByte(byte)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MatrixGrid;