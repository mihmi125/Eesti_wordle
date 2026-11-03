import React, { useState, useEffect } from "react";
import "./styles.css";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Õ", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä", "Š", "Ž"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

export default function App() {
  const [words, setWords] = useState([]);
  const [solution, setSolution] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  // Alusta uut mängu
  const startNewGame = () => {
    if (words.length === 0) return;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setSolution(randomWord);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setMessage("");
  };

  // 1. Laeme sõnastiku failist words.json
  useEffect(() => {
    fetch("/words.json")
      .then((response) => response.json())
      .then((data) => {
        const upperWords = data.map((w) => w.toUpperCase());
        setWords(upperWords);
        const randomWord =
          upperWords[Math.floor(Math.random() * upperWords.length)];
        setSolution(randomWord);
      });
  }, []);

  // 2. Kuulame klaviatuurivajutusi
  const handleKeyInput = (key) => {
    if (gameOver) return;
    setMessage("");

    if (key === "ENTER") {
      if (currentGuess.length !== 5) return;
      if (!words.includes(currentGuess)) {
        setMessage("Seda sõna pole sõnastikus!");
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");

      if (currentGuess === solution) {
        setGameOver(true);
        setMessage("Sa võitsid!");
      } else if (newGuesses.length === 6) {
        setGameOver(true);
        setMessage("Mäng läbi!");
      }
    } else if (key === "BACKSPACE" || key === "DELETE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-ZŠŽÕÄÖÜ]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      handleKeyInput(event.key.toUpperCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, guesses, gameOver, solution, words]);

  // 3. Arvutame tähe taustavärvi
  const getLetterColour = (word, index) => {
    const letter = word[index];
    if (solution[index] === letter) return "#6aa84f";
    if (solution.includes(letter)) return "#c9b458";
    return "#787c7e";
  };

  const getKeyColour = (key) => {
    if (key === "ENTER" || key === "BACKSPACE") return "#d3d6da";

    let status = "unused";
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          if (solution[i] === key) return "#6aa84f";
          if (solution.includes(key)) status = "yellow";
          else if (status !== "yellow") status = "gray";
        }
      }
    }

    if (status === "yellow") return "#c9b458";
    if (status === "gray") return "#787c7e";
    return "#d3d6da";
  };

  // 4. Ekraani kuvamine
  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "sans-serif",
        marginTop: "20px",
      }}
    >
      {/* PROOVIDE JOONISTAJA */}
      <h1>EESTI WORDLE</h1>
      <div style={{ display: "grid", gap: "8px", justifyContent: "center" }}>
        {[0, 1, 2, 3, 4, 5].map((rowIndex) => {
          const isPastRow = rowIndex < guesses.length;
          const isCurrentRow = rowIndex === guesses.length;
          const rowWord = isPastRow
            ? guesses[rowIndex]
            : isCurrentRow
            ? currentGuess
            : "";
          return (
            <div key={rowIndex} style={{ display: "flex", gap: "5px" }}>
              {[0, 1, 2, 3, 4].map((colIndex) => {
                const letter = rowWord[colIndex] || "";
                let bgColor = "white";
                if (isPastRow) {
                  bgColor = getLetterColour(rowWord, colIndex);
                }
                return (
                  <div
                    key={colIndex}
                    style={{
                      width: "50px",
                      height: "50px",
                      border: "2px solid #ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: "bold",
                      backgroundColor: bgColor,
                      color: bgColor === "white" ? "black" : "white",
                    }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* KLAVIATUUR */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div
            style={{ display: "flex", gap: "5px", justifyContent: "center" }}
            key={rowIndex}
          >
            {row.map((key) => {
              const bgColor = getKeyColour(key);
              return (
                <button
                  key={key}
                  onClick={() => handleKeyInput(key)}
                  style={{
                    marginTop: "5px",
                    padding: "10px",
                    minWidth: "35px",
                    fontSize: "15px",
                    fontWeight: "bold",
                    backgroundColor: bgColor,
                    color: bgColor === "#d3d6da" ? "black" : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  {key === "BACKSPACE" ? "⌫" : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* SÕNUMID */}
      {message && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "20000px",
              boxShadow: "0 18px 20px rgba(0,0,0,5)",
              minWidth: "300px",
              minHeight: "150px",
            }}
          >
            <h2>{message}</h2>

            {gameOver ? <p>Õige sõna: {solution}</p> : ""}

            {gameOver ? (
              <button
                onClick={startNewGame}
                style={{
                  backgroundColor: "red",
                  borderRadius: "20000px",
                  fontSize: "40px",
                  fontWeight: "bold",
                  color: "white",
                  cursor: "cell",
                }}
              >
                Alusta uuesti
              </button>
            ) : (
              <button
                style={{
                  backgroundColor: "lime",
                  borderRadius: "20000px",
                  fontSize: "40px",
                  fontWeight: "bold",
                  color: "white",
                  cursor: "grab",
                }}
                onClick={() => !gameOver && setMessage("")}
              >
                QUIT
              </button>
            )}

            <div></div>
          </div>
        </div>
      )}
    </div>
  );
}
