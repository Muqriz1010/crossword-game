import { useState, useRef } from "react";
import { answers } from "./answers";
import "./CrosswordGrid.css";

const GRID_SIZE = 10;

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
  const [selectedClues, setSelectedClues] = useState([]);
  const [currentDirection, setCurrentDirection] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [currentClue, setCurrentClue] = useState(null);
  const inputRefs = useRef({});

  const activeCells = getActiveCells(answers);

  const focusCell = (row, col) => {
    const key = `${row},${col}`;
    if (inputRefs.current[key]) {
      inputRefs.current[key].focus();
    }
  };

  const moveFocus = (row, col, direction, forward = true) => {
    let nextRow = row;
    let nextCol = col;

    if (direction === "across") {
      nextCol += forward ? 1 : -1;
    } else if (direction === "down") {
      nextRow += forward ? 1 : -1;
    }

    const key = `${nextRow},${nextCol}`;
    if (activeCells.has(key)) {
      focusCell(nextRow, nextCol);
    }
  };

  const handleChange = (row, col, value) => {
    if (value.length > 1) return;

    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = value.toUpperCase();
    setGrid(newGrid);

    const correct = answers.filter((ans) => isWordCorrect(newGrid, ans));
    setCorrectAnswers(correct);

    if (value && currentDirection) {
      moveFocus(row, col, currentDirection, true);
    }
  };

  const handleKeyDown = (e, row, col) => {
    const key = e.key;

    if (key === "ArrowRight") moveFocus(row, col, "across", true);
    else if (key === "ArrowLeft") moveFocus(row, col, "across", false);
    else if (key === "ArrowDown") moveFocus(row, col, "down", true);
    else if (key === "ArrowUp") moveFocus(row, col, "down", false);
    else if (key === "Backspace") {
      if (grid[row][col] === "" && currentDirection) {
        moveFocus(row, col, currentDirection, false);
      }
    }
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

  const handleCellClick = (row, col) => {
    const clues = answers.filter((ans) => {
      for (let i = 0; i < ans.word.length; i++) {
        const r = ans.direction === "across" ? ans.row : ans.row + i;
        const c = ans.direction === "across" ? ans.col + i : ans.col;
        if (r === row && c === col) return true;
      }
      return false;
    });

    setSelectedClues(clues);

    let directionToSet = null;
    if (clues.length === 1) {
      directionToSet = clues[0].direction;
    } else if (clues.length > 1) {
      directionToSet = currentDirection === "across" ? "down" : "across";
    }

    setCurrentDirection(directionToSet);

    const activeClue = clues.find((c) => c.direction === directionToSet);
    if (activeClue) {
      const cells = [];
      for (let i = 0; i < activeClue.word.length; i++) {
        const r = activeClue.direction === "across" ? activeClue.row : activeClue.row + i;
        const c = activeClue.direction === "across" ? activeClue.col + i : activeClue.col;
        cells.push(`${r},${c}`);
      }
      setHighlightedCells(cells);
      setCurrentClue(activeClue.clue); // ✅ Set clue
    } else {
      setHighlightedCells([]);
      setCurrentClue(null); // ✅ Clear clue
    }
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
                onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                className={`cell 
                  ${isActive ? "active" : "inactive"} 
                  ${isCellCorrect(rowIndex, colIndex) ? "correct" : ""}
                  ${highlightedCells.includes(key) ? "highlight" : ""}
                `}
                disabled={!isActive}
                ref={(el) => (inputRefs.current[key] = el)}
              />
            );
          })
        )}
      </div>
      <div style={{ marginTop: "1rem", fontSize: "1.2rem", textAlign: "center" }}>
        Selected Direction: <strong>{currentDirection || "None"}</strong>
      </div>
      {currentClue && (
        <div style={{ marginTop: "0.5rem", fontSize: "1rem", textAlign: "center", color: "#333" }}>
          Clue: <strong>{currentClue}</strong>
        </div>
      )}
    </div>
  );
}
