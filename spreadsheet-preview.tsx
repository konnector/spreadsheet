// Handle keyboard navigation with arrow keys
const handleArrowNavigation = (e) => {
  if (isEditing || selectedCell.row === null) return;
  
  const currentRow = selectedCell.row;
  const currentCol = selectedCell.col;
  let newRow = currentRow;
  let newCol = currentCol;
  
  switch (e.key) {
    case 'ArrowUp':
      newRow = Math.max(0, currentRow - 1);
      break;
    case 'ArrowDown':
      newRow = Math.min(19, currentRow + 1);
      break;
    case 'ArrowLeft':
      newCol = Math.max(0, currentCol - 1);
      break;
    case 'ArrowRight':
      newCol = Math.min(25, currentCol + 1);
      break;
    default:
      return;
  }
  
  if (e.shiftKey) {
    // Extend selection with Shift+Arrow
    if (!selectionRange) {
      // Initialize selection if none exists
      setSelectionRange({
        startRow: currentRow,
        startCol: currentCol,
        endRow: newRow,
        endCol: newCol
      });
    } else {
      // Update existing selection
      setSelectionRange({
        ...selectionRange,
        endRow: newRow,
        endCol: newCol
      });
    }
  } else {
    // Single cell selection without shift
    setSelectedCell({ row: newRow, col: newCol });
    setSelectionRange(null);
  }
  
  e.preventDefault();
};import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, FileSpreadsheet, MessageSquare, Send, X } from 'lucide-react';

const WorkingSpreadsheet = () => {
// Basic state
const [spreadsheetData, setSpreadsheetData] = useState(
  Array(20).fill().map(() => 
    Array(26).fill().map(() => ({
      value: '',
      style: {},
      format: 'text'
    }))
  )
);

const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
const [selectionRange, setSelectionRange] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [editValue, setEditValue] = useState('');
const [showChatPanel, setShowChatPanel] = useState(true);
const [clipboard, setClipboard] = useState([]);
const [showToast, setShowToast] = useState(null);
const [isMouseDown, setIsMouseDown] = useState(false);

// Column and row resizing state
const [columnWidths, setColumnWidths] = useState(Array(26).fill(100)); // Default 100px width
const [rowHeights, setRowHeights] = useState(Array(20).fill(32)); // Default 32px height
const [isResizing, setIsResizing] = useState(false);
const [resizeIndex, setResizeIndex] = useState(null);
const [resizeType, setResizeType] = useState(null); // 'column' or 'row'
const [startResizePosition, setStartResizePosition] = useState(0);
const [startResizeSize, setStartResizeSize] = useState(0);

// State for color pickers
const [showFillPicker, setShowFillPicker] = useState(false);
const [showTextPicker, setShowTextPicker] = useState(false);

const cellInputRef = useRef(null);

// Display toast notification
const displayToast = (message) => {
  setShowToast(message);
  setTimeout(() => setShowToast(null), 2000);
};

// Check if a cell is in selection range
const isCellInSelectionRange = (rowIndex, colIndex) => {
  if (!selectionRange) return false;
  
  const startRow = Math.min(selectionRange.startRow, selectionRange.endRow);
  const endRow = Math.max(selectionRange.startRow, selectionRange.endRow);
  const startCol = Math.min(selectionRange.startCol, selectionRange.endCol);
  const endCol = Math.max(selectionRange.startCol, selectionRange.endCol);
  
  return rowIndex >= startRow && rowIndex <= endRow && 
         colIndex >= startCol && colIndex <= endCol;
};

// Format number based on format type
const formatNumber = (value, format) => {
  if (!value || value === '') return '';
  if (isNaN(Number(value)) && format !== 'text') return value;
  
  const num = Number(value);
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    case 'percentage':
      return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1 }).format(num/100);
    case 'date':
      try {
        return new Date(num).toLocaleDateString();
      } catch (e) {
        return value;
      }
    default:
      return value;
  }
};

// Apply number formatting
const applyNumberFormat = (format) => {
  if (selectedCell.row === null) return;
  
  const newData = [...spreadsheetData];
  
  if (selectionRange) {
    // Apply to all cells in the selection range
    const startRow = Math.min(selectionRange.startRow, selectionRange.endRow);
    const endRow = Math.max(selectionRange.startRow, selectionRange.endRow);
    const startCol = Math.min(selectionRange.startCol, selectionRange.endCol);
    const endCol = Math.max(selectionRange.startCol, selectionRange.endCol);
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        newData[r][c] = {
          ...newData[r][c],
          format
        };
      }
    }
  } else {
    // Apply to single cell
    newData[selectedCell.row][selectedCell.col] = {
      ...newData[selectedCell.row][selectedCell.col],
      format
    };
  }
  
  setSpreadsheetData(newData);
  displayToast(`Applied ${format} format`);
};

// Cell events
const handleCellMouseDown = (rowIndex, colIndex, isShiftKey = false) => {
  if (isEditing) {
    saveCell();
  }
  
  setIsMouseDown(true);
  
  if (isShiftKey && selectedCell.row !== null) {
    // Shift+click for range selection
    setSelectionRange({
      startRow: selectedCell.row,
      startCol: selectedCell.col,
      endRow: rowIndex,
      endCol: colIndex
    });
  } else {
    // Start a new selection
    setSelectedCell({ row: rowIndex, col: colIndex });
    setSelectionRange({
      startRow: rowIndex,
      startCol: colIndex,
      endRow: rowIndex,
      endCol: colIndex
    });
  }
};

const handleCellMouseEnter = (rowIndex, colIndex) => {
  if (isMouseDown && selectedCell.row !== null) {
    // Update the selection range while dragging
    setSelectionRange({
      ...selectionRange,
      endRow: rowIndex,
      endCol: colIndex
    });
  }
};

const handleMouseUp = () => {
  setIsMouseDown(false);
};

// Handle document-wide mouse up to end selection
useEffect(() => {
  document.addEventListener('mouseup', handleMouseUp);
  return () => document.removeEventListener('mouseup', handleMouseUp);
}, []);

const handleCellClick = (rowIndex, colIndex, isShiftKey = false) => {
  // Already handled by mousedown & mouseup
};

const handleCellDoubleClick = (rowIndex, colIndex) => {
  setSelectedCell({ row: rowIndex, col: colIndex });
  setSelectionRange(null);
  
  if (spreadsheetData[rowIndex] && spreadsheetData[rowIndex][colIndex]) {
    const cellData = spreadsheetData[rowIndex][colIndex];
    setEditValue(cellData.value || '');
    setIsEditing(true);
    
    setTimeout(() => {
      if (cellInputRef.current) {
        cellInputRef.current.focus();
      }
    }, 0);
  }
};

const handleEditChange = (e) => {
  setEditValue(e.target.value);
};

const saveCell = () => {
  if (selectedCell.row === null || !isEditing) return;
  
  const newData = [...spreadsheetData];
  newData[selectedCell.row][selectedCell.col] = {
    ...newData[selectedCell.row][selectedCell.col],
    value: editValue
  };
  
  setSpreadsheetData(newData);
  setIsEditing(false);
};

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveCell();
  } else if (e.key === 'Escape') {
    setIsEditing(false);
  }
};

// Styling operations
const applyFormatting = (property, value) => {
  if (selectedCell.row === null) return;
  
  const newData = [...spreadsheetData];
  
  if (selectionRange) {
    // Apply to all cells in the selection range
    const startRow = Math.min(selectionRange.startRow, selectionRange.endRow);
    const endRow = Math.max(selectionRange.startRow, selectionRange.endRow);
    const startCol = Math.min(selectionRange.startCol, selectionRange.endCol);
    const endCol = Math.max(selectionRange.startCol, selectionRange.endCol);
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const currentStyle = newData[r][c].style || {};
        newData[r][c] = {
          ...newData[r][c],
          style: {
            ...currentStyle,
            [property]: value
          }
        };
      }
    }
  } else {
    // Apply to single cell
    const currentStyle = newData[selectedCell.row][selectedCell.col].style || {};
    newData[selectedCell.row][selectedCell.col] = {
      ...newData[selectedCell.row][selectedCell.col],
      style: {
        ...currentStyle,
        [property]: value
      }
    };
  }
  
  setSpreadsheetData(newData);
};

const toggleFormatting = (property, value) => {
  if (selectedCell.row === null) return;
  
  const newData = [...spreadsheetData];
  
  if (selectionRange) {
    // Toggle for all cells in selection
    const startRow = Math.min(selectionRange.startRow, selectionRange.endRow);
    const endRow = Math.max(selectionRange.startRow, selectionRange.endRow);
    const startCol = Math.min(selectionRange.startCol, selectionRange.endCol);
    const endCol = Math.max(selectionRange.startCol, selectionRange.endCol);
    
    // Check if any cell in the selection has the formatting
    let anyHasFormatting = false;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const currentStyle = newData[r][c].style || {};
        if (currentStyle[property] === value) {
          anyHasFormatting = true;
          break;
        }
      }
      if (anyHasFormatting) break;
    }
    
    // Toggle formatting based on whether any cell has it
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const currentStyle = newData[r][c].style || {};
        newData[r][c] = {
          ...newData[r][c],
          style: {
            ...currentStyle,
            [property]: anyHasFormatting ? undefined : value
          }
        };
      }
    }
  } else {
    // Toggle for single cell
    const currentStyle = spreadsheetData[selectedCell.row][selectedCell.col].style || {};
    const newValue = currentStyle[property] === value ? undefined : value;
    
    newData[selectedCell.row][selectedCell.col] = {
      ...newData[selectedCell.row][selectedCell.col],
      style: {
        ...currentStyle,
        [property]: newValue
      }
    };
  }
  
  setSpreadsheetData(newData);
};

// Clipboard operations
const copySelection = () => {
  if (selectedCell.row === null) return;
  
  let dataToCopy = [];
  
  if (selectionRange) {
    // Copy range of cells
    const startRow = Math.min(selectionRange.startRow, selectionRange.endRow);
    const endRow = Math.max(selectionRange.startRow, selectionRange.endRow);
    const startCol = Math.min(selectionRange.startCol, selectionRange.endCol);
    const endCol = Math.max(selectionRange.startCol, selectionRange.endCol);
    
    for (let r = startRow; r <= endRow; r++) {
      const rowData = [];
      for (let c = startCol; c <= endCol; c++) {
        rowData.push({...spreadsheetData[r][c]});
      }
      dataToCopy.push(rowData);
    }
  } else {
    // Copy single cell
    dataToCopy = [[{...spreadsheetData[selectedCell.row][selectedCell.col]}]];
  }
  
  setClipboard(dataToCopy);
  displayToast("Copied to clipboard");
};

const cutSelection = () => {
  if (selectedCell.row === null) return;
  
  // First copy
  copySelection();
  
  // Then clear the selected cells
  const newData = [...spreadsheetData];
  
  if (selectionRange) {
    const startRow = Math.min(selectionRange.startRow, selectionRange.endRow);
    const endRow = Math.max(selectionRange.startRow, selectionRange.endRow);
    const startCol = Math.min(selectionRange.startCol, selectionRange.endCol);
    const endCol = Math.max(selectionRange.startCol, selectionRange.endCol);
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        newData[r][c] = {
          ...newData[r][c],
          value: ''
        };
      }
    }
  } else {
    newData[selectedCell.row][selectedCell.col] = {
      ...newData[selectedCell.row][selectedCell.col],
      value: ''
    };
  }
  
  setSpreadsheetData(newData);
  displayToast("Cut to clipboard");
};

const pasteFromClipboard = () => {
  if (selectedCell.row === null || clipboard.length === 0) return;
  
  const newData = [...spreadsheetData];
  const pasteData = clipboard;
  const pasteHeight = pasteData.length;
  const pasteWidth = pasteData[0].length;
  
  // Paste starting from the selected cell
  for (let r = 0; r < pasteHeight; r++) {
    const targetRow = selectedCell.row + r;
    if (targetRow >= newData.length) continue;
    
    for (let c = 0; c < pasteWidth; c++) {
      const targetCol = selectedCell.col + c;
      if (targetCol >= newData[0].length) continue;
      
      newData[targetRow][targetCol] = {
        ...newData[targetRow][targetCol],
        ...pasteData[r][c]
      };
    }
  }
  
  setSpreadsheetData(newData);
  displayToast("Pasted from clipboard");
};

const selectAll = () => {
  setSelectionRange({
    startRow: 0,
    startCol: 0,
    endRow: 19,
    endCol: 25
  });
  displayToast("All cells selected");
};

// Handle outside clicks to close color pickers
useEffect(() => {
  const handleClickOutside = (event) => {
    if (showFillPicker || showTextPicker) {
      if (!event.target.closest('.color-picker')) {
        setShowFillPicker(false);
        setShowTextPicker(false);
      }
    }
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [showFillPicker, showTextPicker]);

// Keyboard shortcuts
useEffect(() => {
  const handleKeyboardShortcuts = (e) => {
    if (isEditing) return;
    
    const ctrlKey = e.ctrlKey || e.metaKey;
    
    // Arrow key navigation
    if (e.key.startsWith('Arrow')) {
      handleArrowNavigation(e);
      return;
    }
    
    // Delete key to clear selection
    if (e.key === 'Delete' && selectedCell.row !== null) {
      e.preventDefault();
      
      const newData = [...spreadsheetData];
      
      if (selectionRange) {
        const startRow = Math.min(selectionRange.startRow, selectionRange.endRow);
        const endRow = Math.max(selectionRange.startRow, selectionRange.endRow);
        const startCol = Math.min(selectionRange.startCol, selectionRange.endCol);
        const endCol = Math.max(selectionRange.startCol, selectionRange.endCol);
        
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            newData[r][c] = {
              ...newData[r][c],
              value: ''
            };
          }
        }
      } else {
        newData[selectedCell.row][selectedCell.col] = {
          ...newData[selectedCell.row][selectedCell.col],
          value: ''
        };
      }
      
      setSpreadsheetData(newData);
      displayToast("Cleared cells");
      return;
    }
    
    // Handle Ctrl+key shortcuts
    if (ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          toggleFormatting('fontWeight', 'bold');
          break;
        case 'i':
          e.preventDefault();
          toggleFormatting('fontStyle', 'italic');
          break;
        case 'u':
          e.preventDefault();
          toggleFormatting('textDecoration', 'underline');
          break;
        case 'c':
          e.preventDefault();
          copySelection();
          break;
        case 'x':
          e.preventDefault();
          cutSelection();
          break;
        case 'v':
          e.preventDefault();
          pasteFromClipboard();
          break;
        case 'a':
          e.preventDefault();
          selectAll();
          break;
        default:
          break;
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyboardShortcuts);
  return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
}, [isEditing, selectedCell, selectionRange, spreadsheetData, clipboard]);

// Chat message component
const ChatMessage = ({ message, sender, isBot }) => (
  <div className={`flex gap-2 mb-3 ${isBot ? 'bg-gray-100 p-2 rounded' : ''}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-blue-100' : 'bg-gray-200'}`}>
      {isBot ? 'AI' : 'U'}
    </div>
    <div>
      <div className="text-sm font-medium">{sender}</div>
      <div className="text-sm">{message}</div>
    </div>
  </div>
);

// Color palette component
const ColorPalette = ({ onSelectColor, onClose, forText = false }) => {
  const standardColors = ['#000000', '#FFFFFF', '#2980B9', '#E74C3C', '#F1C40F', '#27AE60', '#E67E22', '#1ABC9C'];
  const colorRows = [
    // Grays
    forText 
      ? ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF']
      : ['#FFFFFF', '#D9D9D9', '#A6A6A6', '#808080', '#595959', '#404040', '#262626', '#0D0D0D', '#000000', '#FFFFFF'],
    // Reds
    ['#EB3323', '#A61B0F', '#DA372C', '#E74C3C', '#F16251', '#F58376', '#F8A59B', '#FACFC8', '#FDE7E3', '#FFEFED'],
    // Blues
    ['#2980B9', '#2471A3', '#3498DB', '#5DADE2', '#85C1E9', '#AED6F1', '#D6EAF8', '#EBF5FB', '#F8F9F9', '#F8F9F9'],
    // Greens
    ['#27AE60', '#229954', '#2ECC71', '#58D68D', '#82E0AA', '#ABEBC6', '#D5F5E3', '#EAFAF1', '#FEF9E7', '#F8F9F9']
  ];
  
  const handleColorClick = (color) => {
    onSelectColor(color);
    onClose();
  };
  
  return (
    <div className="absolute left-0 mt-1 bg-white shadow-lg rounded border p-3 z-20 w-64 color-picker">
      <div className="flex justify-between items-center mb-2">
        <button 
          className="flex items-center text-sm text-gray-700"
          onClick={() => handleColorClick('')}
        >
          <span className="mr-1">↺</span> Reset
        </button>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      
      {/* Main color grid */}
      {colorRows.map((row, rowIdx) => (
        <div key={`row-${rowIdx}`} className="grid grid-cols-10 gap-1 mb-1">
          {row.map((color, idx) => (
            <div 
              key={`color-${rowIdx}-${idx}`}
              className={`w-5 h-5 rounded-full cursor-pointer ${color === '#FFFFFF' ? 'border border-gray-300' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(color)}
            ></div>
          ))}
        </div>
      ))}
      
      {/* Standard colors */}
      <div className="mt-2 border-t pt-2">
        <div className="text-xs text-gray-600 mb-1">STANDARD</div>
        <div className="grid grid-cols-8 gap-1">
          {standardColors.map((color, idx) => (
            <div 
              key={`std-${idx}`}
              className={`w-5 h-5 rounded-full cursor-pointer ${color === '#FFFFFF' ? 'border border-gray-300' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(color)}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Custom colors */}
      <div className="mt-2 border-t pt-2">
        <div className="text-xs text-gray-600 mb-1">CUSTOM</div>
        <div className="flex items-center gap-1">
          <div 
            className="w-6 h-6 rounded-full bg-black cursor-pointer" 
            onClick={() => handleColorClick('#000000')}
          ></div>
          <div 
            className="w-6 h-6 rounded-full bg-white border border-gray-300 cursor-pointer" 
            onClick={() => handleColorClick('#FFFFFF')}
          ></div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center border border-gray-300 cursor-pointer">
            <span className="text-lg">+</span>
          </div>
        </div>
      </div>
      
      {!forText && (
        <div className="mt-3 pt-2 border-t">
          <button className="text-sm text-gray-700 hover:bg-gray-100 w-full text-center py-1 rounded">
            Conditional formatting
          </button>
        </div>
      )}
    </div>
  );
};

return (
  <div className="flex h-screen w-full bg-white">
    {/* Toast notification */}
    {showToast && (
      <div className="fixed top-4 right-4 bg-gray-800 text-white px-3 py-2 rounded shadow-lg z-50">
        {showToast}
      </div>
    )}
    
    {/* Main spreadsheet area */}
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b p-3 flex justify-between">
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded hover:bg-gray-100 flex items-center">
            <FileSpreadsheet size={16} className="mr-1" />
            File
          </button>
          <div className="relative">
            <button className="px-3 py-1 rounded hover:bg-gray-100">
              Edit
            </button>
            <div className="absolute left-0 mt-1 bg-white shadow-lg rounded border border-gray-200 min-w-40 z-20 hidden group-hover:block">
              <button 
                className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center"
                onClick={copySelection}
              >
                Copy <span className="ml-auto text-xs text-gray-500">Ctrl+C</span>
              </button>
              <button 
                className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center"
                onClick={cutSelection}
              >
                Cut <span className="ml-auto text-xs text-gray-500">Ctrl+X</span>
              </button>
              <button 
                className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center"
                onClick={pasteFromClipboard}
              >
                Paste <span className="ml-auto text-xs text-gray-500">Ctrl+V</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button 
                className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center"
                onClick={selectAll}
              >
                Select All <span className="ml-auto text-xs text-gray-500">Ctrl+A</span>
              </button>
            </div>
          </div>
        </div>
        
        <button 
          className="bg-gray-800 text-white px-3 py-1 rounded flex items-center text-sm"
          onClick={() => setShowChatPanel(!showChatPanel)}
        >
          <MessageSquare size={16} className="mr-1" />
          {showChatPanel ? 'Hide AI Assistant' : 'Show AI Assistant'}
        </button>
      </div>
      
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1">
        {/* Text styles */}
        <div className="flex border-r pr-2 mr-2">
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => toggleFormatting('fontWeight', 'bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => toggleFormatting('fontStyle', 'italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => toggleFormatting('textDecoration', 'underline')}
            title="Underline (Ctrl+U)"
          >
            <Underline size={16} />
          </button>
        </div>
        
        {/* Alignment */}
        <div className="flex border-r pr-2 mr-2">
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => applyFormatting('textAlign', 'left')}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => applyFormatting('textAlign', 'center')}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
        </div>
        
        {/* Font family and size */}
        <div className="flex items-center border-r pr-2 mr-2 gap-1">
          <select 
            className="border rounded p-1 text-sm"
            onChange={(e) => applyFormatting('fontFamily', e.target.value)}
            title="Font Type"
          >
            <option value="">Font</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Courier New, monospace">Courier New</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
          </select>
          
          <select 
            className="border rounded p-1 text-sm"
            onChange={(e) => applyFormatting('fontSize', e.target.value)}
            title="Font Size"
          >
            <option value="">Size</option>
            <option value="10px">10</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
          </select>
        </div>
        
        {/* Number formatting */}
        <div className="flex items-center border-r pr-2 mr-2">
          <select 
            className="border rounded p-1 text-sm"
            onChange={(e) => applyNumberFormat(e.target.value)}
            title="Number Format"
          >
            <option value="text">Format</option>
            <option value="text">General</option>
            <option value="currency">Currency</option>
            <option value="percentage">Percentage</option>
            <option value="date">Date</option>
          </select>
        </div>
        
        {/* Cell colors */}
        <div className="flex items-center border-r pr-2 mr-2">
          {/* Fill color picker */}
          <div className="relative mr-2">
            <button 
              className="p-1 hover:bg-gray-100 rounded flex items-center"
              title="Fill Color"
              onClick={() => {
                setShowFillPicker(!showFillPicker);
                setShowTextPicker(false);
              }}
            >
              <div className="w-4 h-4 border border-gray-300 bg-white"></div>
              <span className="ml-1 text-sm">Fill</span>
            </button>
            
            {showFillPicker && (
              <ColorPalette 
                onSelectColor={(color) => applyFormatting('backgroundColor', color)}
                onClose={() => setShowFillPicker(false)}
              />
            )}
          </div>
          
          {/* Text color picker */}
          <div className="relative">
            <button 
              className="p-1 hover:bg-gray-100 rounded flex items-center"
              title="Text Color"
              onClick={() => {
                setShowTextPicker(!showTextPicker);
                setShowFillPicker(false);
              }}
            >
              <div className="w-4 h-4 border border-gray-300 bg-black"></div>
              <span className="ml-1 text-sm">Text</span>
            </button>
            
            {showTextPicker && (
              <ColorPalette 
                onSelectColor={(color) => applyFormatting('color', color)}
                onClose={() => setShowTextPicker(false)}
                forText={true}
              />
            )}
          </div>
        </div>
        
        {/* Cell borders */}
        <div className="flex items-center border-r pr-2 mr-2">
          <button 
            className="p-1 hover:bg-gray-100 rounded text-sm"
            onClick={() => applyFormatting('border', '1px solid black')}
            title="Add Border"
          >
            Borders
          </button>
        </div>
        
        {/* Text wrapping */}
        <div className="flex items-center">
          <button 
            className="px-2 py-1 hover:bg-gray-100 rounded text-sm"
            onClick={() => applyFormatting('whiteSpace', 'normal')}
            title="Wrap Text"
          >
            Wrap
          </button>
        </div>
      </div>
      
      {/* Formula Bar */}
      <div className="border-b p-2 flex items-center gap-2 bg-white">
        <span className="text-sm font-medium text-gray-500">fx</span>
        <input 
          placeholder="Formula" 
          className="h-8 text-sm border border-gray-300 rounded px-2 py-1 w-full"
        />
      </div>
      
      {/* Spreadsheet grid */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="w-10 h-8 bg-gray-100 border-r border-b"></th>
              {Array(26).fill().map((_, i) => (
                <th key={i} className="min-w-24 px-2 h-8 bg-gray-100 border border-gray-200 text-sm">
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(20).fill().map((_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border border-gray-200 bg-gray-100 text-sm text-center h-8">
                  {rowIndex + 1}
                </td>
                {Array(26).fill().map((_, colIndex) => {
                  const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex;
                  const isInSelectionRange = isCellInSelectionRange(rowIndex, colIndex);
                  const cell = spreadsheetData[rowIndex][colIndex];
                  
                  return (
                    <td 
                      key={colIndex}
                      onMouseDown={(e) => handleCellMouseDown(rowIndex, colIndex, e.shiftKey)}
                      onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                      onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                      className={`border border-gray-200 px-2 h-8 relative 
                        ${isSelected ? 'outline outline-2 outline-blue-500' : ''}
                        ${isInSelectionRange ? 'bg-blue-50' : ''}
                      `}
                      style={cell.style}
                    >
                      {isEditing && isSelected ? (
                        <input
                          ref={cellInputRef}
                          type="text"
                          value={editValue}
                          onChange={handleEditChange}
                          onBlur={saveCell}
                          onKeyDown={handleKeyDown}
                          className="absolute inset-0 w-full h-full border-none outline-none px-2"
                          autoFocus={true}
                        />
                      ) : (
                        formatNumber(cell.value, cell.format)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Status Bar */}
      <div className="border-t p-2 text-xs text-gray-500">
        {selectedCell.row !== null 
          ? `Selected: ${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`
          : 'No cell selected'}
      </div>
    </div>
    
    {/* AI Chat panel */}
    {showChatPanel && (
      <div className="w-80 border-l flex flex-col">
        <div className="p-3 border-b flex justify-between items-center">
          <h2 className="font-medium">AI Assistant</h2>
          <button 
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setShowChatPanel(false)}
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex-1 p-3 overflow-auto">
          <ChatMessage 
            sender="AI Assistant"
            message="Hello! I can help you create spreadsheets. Try asking me to build something."
            isBot={true}
          />
          <ChatMessage 
            sender="You"
            message="Can you make a budget spreadsheet?"
            isBot={false}
          />
          <ChatMessage 
            sender="AI Assistant"
            message="I've created a budget template with income, expenses, and savings categories. You can start entering your data!"
            isBot={true}
          />
        </div>
        
        <div className="border-t p-3">
          <div className="relative">
            <input 
              className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10" 
              placeholder="Ask AI Assistant..."
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 rounded-full p-1 text-white">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default WorkingSpreadsheet;