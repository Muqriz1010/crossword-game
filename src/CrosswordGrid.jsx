import { useState } from "react";
import { answers } from "./answers"; // ✅ Import from external file
import "./CrosswordGrid.css";

const GRID_SIZE = 10;

// ✅ Get coordinates of all playable cells
const getActiveCells = (answers) => {
  const cells = new Set();
  answers.forEach(({ row, col, word, direction }) => {
    for (let i = 0; i < word.length; i++) {
      const r = direction === "across" ? row : row + i;
      const c = direction === "across" ? col + i : col;
      cells.add(`${r},${c}`);
    }
  });
  return cells;
};

// ✅ Check if a word is correctly filled in
const isWordCorrect = (grid, answer) => {
  const { word, row, col, direction } = answer;
  for (let i = 0; i < word.length; i++) {
    const r = direction === "across" ? row : row + i;
    const c = direction === "across" ? col + i : col;
    const cellLetter = grid[r]?.[c]?.toUpperCase() || "";
    if (cellLetter !== word[i]) return false;
  }
  return true;
};

export default function CrosswordGrid() {
  const [grid, setGrid] = useState(
    Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(""))
  );
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const activeCells = getActiveCells(answers);

  const handleChange = (row, col, value) => {
    if (value.length > 1) return;

    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = value.toUpperCase();
    setGrid(newGrid);

    // Recheck all answers
    const correct = answers.filter((ans) => isWordCorrect(newGrid, ans));
    setCorrectAnswers(correct);
  };

  const isCellCorrect = (row, col) => {
    for (const ans of correctAnswers) {
      for (let i = 0; i < ans.word.length; i++) {
        const r = ans.direction === "across" ? ans.row : ans.row + i;
        const c = ans.direction === "across" ? ans.col + i : ans.col;
        if (r === row && c === col) return true;
      }
    }
    return false;
  };

  return (
    <div className="grid-container">
      <div className="grid">
        {grid.map((rowArr, rowIndex) =>
          rowArr.map((cell, colIndex) => {
            const key = `${rowIndex},${colIndex}`;
            const isActive = activeCells.has(key);
            return (
              <input
                key={key}
                type="text"
                maxLength={1}
                value={cell}
                onChange={(e) =>
                  handleChange(rowIndex, colIndex, e.target.value)
                }
                className={`cell 
                  ${isActive ? "active" : "inactive"} 
                  ${isCellCorrect(rowIndex, colIndex) ? "correct" : ""}
                `}
                disabled={!isActive}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
