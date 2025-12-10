import React, { useState } from 'react';
import Board from './components/Board';
import Placar from './components/Placar';
import './index.css';

// === 1. COMPONENTE DE ANIMAÇÃO DE FUNDO (NEON) ===
const BackgroundAnimation = () => {
  const pieces = Array.from({ length: 20 }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * 100}vh`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 4}s`,
      color: Math.random() > 0.5 ? '#0ff' : '#ff00de',
    };
    const symbol = Math.random() > 0.5 ? 'X' : 'O';
    return <div key={i} className="floating-piece" style={style}>{symbol}</div>;
  });
  return <div className="background-animation">{pieces}</div>;
};

function App() {
  const [playerXName, setPlayerXName] = useState('');
  const [playerOName, setPlayerOName] = useState('');
  const [namesRegistered, setNamesRegistered] = useState(false);
  const [boardKey, setBoardKey] = useState(0);
  const [gameOverInfo, setGameOverInfo] = useState({ winner: null, isDraw: false, finished: false });

  const [score, setScore] = useState({
    X: { wins: 0, losses: 0, draws: 0, games: 0 },
    O: { wins: 0, losses: 0, draws: 0, games: 0 },
  });

  // ➡️ NOVOS ESTADOS PARA MODO DE JOGO
  const [gameMode, setGameMode] = useState('human');
  const [difficulty, setDifficulty] = useState('medium');

  // Funções de Controle
  const continueGame = () => {
    setGameOverInfo({ winner: null, isDraw: false, finished: false });
    setBoardKey(prevKey => prevKey + 1);
  };

  const startNewPlayers = () => {
    setScore({
      X: { wins: 0, losses: 0, draws: 0, games: 0 },
      O: { wins: 0, losses: 0, draws: 0, games: 0 },
    });
    setGameOverInfo({ winner: null, isDraw: false, finished: false });
    setNamesRegistered(false);
    setPlayerXName('');
    setPlayerOName('');
    setBoardKey(prevKey => prevKey + 1);
  };

  // LÓGICA DE ATUALIZAÇÃO DO PLACAR (CORRIGIDA PARA PROD/DEV)
  const updateScore = (winnerSymbol, isDraw) => {
    setScore(prevScore => {
      const newScore = { ...prevScore };

      // Verifica o ambiente: 0.5 em DEV (duas chamadas) e 1 em PROD (uma chamada)
      const isDevelopment = import.meta.env.DEV;
      const finalIncrement = isDevelopment ? 0.5 : 1;
      const increment = finalIncrement;

      if (isDraw) {
        newScore.X.draws += increment;
        newScore.O.draws += increment;
      } else if (winnerSymbol === 'X') {
        newScore.X.wins += increment;
        newScore.O.losses += increment;
      } else if (winnerSymbol === 'O') {
        newScore.O.wins += increment;
        newScore.X.losses += increment;
      }

      newScore.X.games += increment;
      newScore.O.games += increment;

      return newScore;
    });

    setGameOverInfo({ winner: winnerSymbol, isDraw: isDraw, finished: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (gameMode === 'robot') {
      if (playerXName) {
        setPlayerOName('🤖 ROBO-IA'); // Nome fixo para o robô
        setNamesRegistered(true);
      } else {
        alert('Por favor, insira seu codinome.');
      }
    }
    else if (gameMode === 'human') {
      if (playerXName && playerOName) {
        setNamesRegistered(true);
      } else {
        alert('Por favor, insira o nome dos dois jogadores.');
      }
    }
  };

  // Painel de Fim de Jogo
  const EndGameControlPanel = () => {
    let message;
    if (gameOverInfo.isDraw) {
      message = 'EMPATE! DETECTADO.';
    } else if (gameOverInfo.winner === 'X') {
      message = `VENCEDOR: ${playerXName} (X)`;
    } else if (gameOverInfo.winner === 'O') {
      message = `VENCEDOR: ${playerOName} (O)`;
    }
    const suggestion = "SISTEMA: Continuar operação ou reiniciar protocolo?";

    return (
      <div className="end-game-panel-content">
        <h2 className="status-message">{message}</h2>
        <p>{suggestion}</p>
        <button onClick={continueGame} className="continue-button">Continuar Disputa</button>
        <button onClick={startNewPlayers} className="new-players-button">Novos Jogadores</button>
      </div>
    );
  };

  // === RENDERIZAÇÃO 1: TELA DE CADASTRO (NEON com SELETORES) ===
  if (!namesRegistered) {
    return (
      <>
        {/* Fundo Animado */}
        <BackgroundAnimation />

        <div className="registration-screen">
          <header className="game-header">
            <h1>PROTOCOL: JOGO DA VELHA</h1>

            {/* SELETOR DE MODO */}
            <div className="mode-selector">
              <button
                className={`mode-button ${gameMode === 'human' ? 'active-mode' : ''}`}
                onClick={() => setGameMode('human')}
              >
                2 JOGADORES
              </button>
              <button
                className={`mode-button ${gameMode === 'robot' ? 'active-mode' : ''}`}
                onClick={() => {
                  setGameMode('robot');
                  setPlayerOName('');
                }}
              >
                VS ROBÔ (1 JOGADOR)
              </button>
            </div>
            {/* Fim do Seletor de Modo */}

            {/* SELETOR DE DIFICULDADE (SÓ APARECE NO MODO ROBÔ) */}
            {gameMode === 'robot' && (
              <div className="difficulty-selector">
                <label>NÍVEL DE DIFICULDADE:</label>
                <div className="difficulty-buttons">
                  {['easy', 'medium', 'hard'].map(level => (
                    <button
                      key={level}
                      className={`diff-button ${difficulty === level ? 'active-diff' : ''}`}
                      onClick={() => setDifficulty(level)}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Fim do Seletor de Dificuldade */}

          </header>
          <main className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="playerX">JOGADOR X ({gameMode === 'robot' ? 'VOCÊ' : 'INICIAR'}):</label>
                <input
                  id="playerX"
                  type="text"
                  placeholder="Digite o codinome..."
                  value={playerXName}
                  onChange={(e) => setPlayerXName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="playerO">JOGADOR O:</label>
                <input
                  id="playerO"
                  type="text"
                  placeholder={gameMode === 'robot' ? '🤖 ROBO-IA (Automático)' : 'Digite o codinome...'}
                  value={gameMode === 'robot' ? '🤖 ROBO-IA' : playerOName}
                  onChange={(e) => setPlayerOName(e.target.value)}
                  required
                  disabled={gameMode === 'robot'}
                  style={gameMode === 'robot' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                />
              </div>
              <button type="submit" className="submit-button">INICIAR SISTEMA</button>
            </form>
          </main>
        </div>
      </>
    );
  }

  // === RENDERIZAÇÃO 2: TELA DE JOGO ===
  return (
    <div className="game">
      {/* Wrapper para o efeito de vidro/tecnológico */}
      <div className="game-board-container">
        <header className="game-header">
          <h1>PROTOCOL: JOGO DA VELHA</h1>
        </header>
        <main className="game-board">
          <Placar playerXName={playerXName} playerOName={playerOName} score={score} />

          {/* ➡️ PASSANDO gameMode E difficulty para o Board */}
          <Board
            key={boardKey}
            playerXName={playerXName}
            playerOName={playerOName}
            onGameEnd={updateScore}
            gameMode={gameMode}
            difficulty={difficulty}
          />

          {gameOverInfo.finished && (
            <div className="overlay-panel">
              <EndGameControlPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;