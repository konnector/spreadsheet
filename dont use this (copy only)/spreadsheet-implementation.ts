// Changes to the layout structure in SpreadsheetPreview.tsx

// 1. Make sure main container has overflow-hidden
<div className="spreadsheet-container flex h-screen w-full bg-white overflow-hidden">
  {/* Toast notification */}
  {showToast && (
    <div className="fixed top-4 right-4 bg-gray-200 text-gray-800 px-3 py-2 rounded shadow-lg z-50">
      {showToast}
    </div>
  )}
  
  {/* Main spreadsheet area */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Header - Add sticky */}
    <div className="border-b p-3 flex justify-between items-center bg-white sticky top-0 z-20">
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded hover:bg-gray-100 flex items-center">
          <FileSpreadsheet size={16} className="mr-1" />
          File
        </button>
        <div className="relative">
          <button className="px-3 py-1 rounded hover:bg-gray-100">
            Edit
          </button>
          {/* Dropdown menu content */}
        </div>
      </div>
      
      <button 
        className="bg-gray-200 text-gray-800 px-3 py-1 rounded flex items-center text-sm hover:bg-gray-300"
        onClick={() => setShowChatPanel(!showChatPanel)}
      >
        <MessageSquare size={16} className="mr-1" />
        {showChatPanel ? 'Hide AI Assistant' : 'Show AI Assistant'}
      </button>
    </div>
    
    {/* Toolbar - Add sticky */}
    <div className="border-b p-2 flex flex-wrap gap-1 bg-white sticky top-0 z-20">
      {/* Toolbar content remains the same */}
    </div>
    
    {/* Formula Bar - Add sticky */}
    <div className="formula-bar bg-white sticky top-0 z-20">
      <span className="formula-bar-label">fx</span>
      <input 
        placeholder="Formula" 
        className="formula-bar-input"
      />
    </div>
    
    {/* Spreadsheet grid - This is the only area that should scroll */}
    <div className="flex-1 overflow-auto">
      <table className="spreadsheet-table">
        <thead className="spreadsheet-header">
          <tr>
            {/* Make the corner cell sticky */}
            <th className="w-10 sticky left-0 z-10"></th>
            {Array(26).fill(null).map((_, i) => (
              <th key={i}>
                {String.fromCharCode(65 + i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array(20).fill(null).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {/* Make the row headers sticky */}
              <td className="spreadsheet-row-header sticky left-0 z-10">
                {rowIndex + 1}
              </td>
              {Array(26).fill(null).map((_, colIndex) => {
                const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex;
                const isInSelectionRange = isCellInSelectionRange(rowIndex, colIndex);
                const cell = spreadsheetData[rowIndex][colIndex];
                
                return (
                  <td 
                    key={colIndex}
                    onMouseDown={(e) => handleCellMouseDown(rowIndex, colIndex, e.shiftKey)}
                    onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                    className={`spreadsheet-cell
                      ${isSelected ? 'spreadsheet-cell-selected' : ''}
                      ${isInSelectionRange ? 'spreadsheet-cell-in-range' : ''}
                    `}
                    style={{
                      ...cell.style
                    }}
                  >
                    {/* Cell content */}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {/* Status Bar */}
    <div className="border-t p-2 text-xs text-gray-500 bg-white">
      {selectedCell.row !== null 
        ? `Selected: ${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`
        : 'No cell selected'}
    </div>
  </div>
  
  {/* AI Chat panel */}
  {showChatPanel && (
    <div className="w-80 border-l flex flex-col bg-white">
      {/* Chat panel content */}
    </div>
  )}
</div>
