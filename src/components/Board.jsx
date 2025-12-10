import React, { useState, useEffect, useRef } from 'react';
import Square from './Square';

// === FUNÇÃO AUXILIAR calculateWinner ===
// Verifica se há um vencedor e retorna o símbolo e a linha
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], line: lines[i] };
        }
    }
    return null;
}

// === ALGORITMO MINIMAX RECURSIVO ===
// O Robô (Maximizer) é 'O', o Humano (Minimizer) é 'X'.
function minimax(newSquares, depth, isMaximizingPlayer) {
    const result = calculateWinner(newSquares);

    if (result !== null) {
        // Se 'X' (oponente) venceu: -10 (pior para o Robô)
        if (result.winner === 'X') return -10 + depth;
        // Se 'O' (Robô) venceu: +10 (melhor para o Robô)
        if (result.winner === 'O') return 10 - depth;
    }
    // Empate/Jogo completo sem vitória
    if (newSquares.every(Boolean)) return 0;

    const availableMoves = newSquares
        .map((square, index) => (square === null ? index : null))
        .filter(index => index !== null);

    if (isMaximizingPlayer) { // Robô ('O') - Tenta maximizar a pontuação
        let bestScore = -Infinity;
        for (const move of availableMoves) {
            let nextSquares = newSquares.slice();
            nextSquares[move] = 'O';
            let score = minimax(nextSquares, depth + 1, false);
            bestScore = Math.max(score, bestScore);
        }
        return bestScore;
    } else { // Humano ('X') - Tenta minimizar a pontuação
        let bestScore = Infinity;
        for (const move of availableMoves) {
            let nextSquares = newSquares.slice();
            nextSquares[move] = 'X';
            let score = minimax(nextSquares, depth + 1, true);
            bestScore = Math.min(score, bestScore);
        }
        return bestScore;
    }
}

// === 3. LÓGICA DE IA: MINIMAX E DIFICULDADES ===
function calculateRobotMove(squares, difficulty) {
    const availableMoves = squares
        .map((square, index) => (square === null ? index : null))
        .filter(index => index !== null);

    // 1. Dificuldade FÁCIL: Alto índice de aleatoriedade (80%)
    if (difficulty === 'easy' && Math.random() < 0.8) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // 2. Procura por VITÓRIA IMEDIATA (para o Robô 'O') ou BLOQUEIO (para o Humano 'X')
    let winningMove = null;
    let blockingMove = null;

    for (const move of availableMoves) {
        // Checagem de Vitória (Robô)
        let nextSquares = squares.slice();
        nextSquares[move] = 'O';
        if (calculateWinner(nextSquares)) {
            winningMove = move;
            break;
        }

        // Checagem de Bloqueio (Humano)
        nextSquares = squares.slice();
        nextSquares[move] = 'X';
        if (calculateWinner(nextSquares)) {
            blockingMove = move;
        }
    }

    if (winningMove !== null) return winningMove;
    if (blockingMove !== null) return blockingMove;

    // 3. MINIMAX (para Hard e, se necessário, Medium/Easy)

    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
        let newSquares = squares.slice();
        newSquares[move] = 'O';

        let score = minimax(newSquares, 0, false);

        // Dificuldade MÉDIA: O Minimax é rodado, mas introduzimos 
        // 20% de chance de jogar aleatoriamente para simular falha humana, mesmo em vitória.
        if (difficulty === 'medium' && score === 10 && Math.random() < 0.2) {
            // Se for o caso de falha simulada, não joga a melhor jogada.
        } else if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}


// === COMPONENTE PRINCIPAL BOARD ===
function Board({ playerXName, playerOName, onGameEnd, gameMode, difficulty }) {

    const [history, setHistory] = useState([
        { squares: Array(9).fill(null) }
    ]);
    const [currentMove, setCurrentMove] = useState(0);

    const currentSquares = history[currentMove].squares;
    const xIsNext = currentMove % 2 === 0;

    const gameFinishedRef = useRef(false);

    const result = calculateWinner(currentSquares);
    const winner = result ? result.winner : null;
    const winningLine = result ? result.line : [];

    const isDraw = currentSquares.every(Boolean) && !winner && currentSquares.length === 9;
    const gameOver = !!winner || isDraw;

    // === EFEITO 1: REGISTRAR PONTUAÇÃO (Estabilizado e Notificação) ===
    useEffect(() => {
        if (gameOver && !gameFinishedRef.current) {
            gameFinishedRef.current = true;
            onGameEnd(winner, isDraw);
        }
    }, [gameOver, onGameEnd, winner, isDraw]);

    // === EFEITO 2: GARANTIA DE RESET DA FLAG (Correção do Bug do Empate) ===
    useEffect(() => {
        if (currentMove === 0 && history.length === 1 && gameFinishedRef.current) {
            gameFinishedRef.current = false;
        }
    }, [currentMove, history.length]);

    // === EFEITO 3: CONTROLE DO TURNO DO ROBÔ ===
    useEffect(() => {
        // Aciona a IA se for modo robô, vez do 'O' e o jogo não acabou
        if (gameMode === 'robot' && !xIsNext && !gameOver) {

            // Pequeno delay para simular o tempo de "pensamento"
            const robotDelay = setTimeout(() => {
                const nextMove = calculateRobotMove(currentSquares, difficulty);
                handleClick(nextMove);
            }, 500);

            return () => clearTimeout(robotDelay);
        }
    }, [gameMode, xIsNext, gameOver, currentSquares, difficulty]);
    // Dependências ajustadas para garantir que a IA jogue apenas quando necessário.

    const handleClick = (i) => {
        const historyUntilCurrent = history.slice(0, currentMove + 1);
        const current = historyUntilCurrent[historyUntilCurrent.length - 1];
        const squares = current.squares.slice();

        if (winner || squares[i] || gameOver) {
            return;
        }

        squares[i] = xIsNext ? 'X' : 'O';

        setHistory(historyUntilCurrent.concat([{ squares: squares }]));
        setCurrentMove(historyUntilCurrent.length);
    };

    const jumpTo = (nextMove) => {
        setCurrentMove(nextMove);
        gameFinishedRef.current = false;
    };

    const renderSquare = (i) => {
        const isWinner = winningLine.includes(i);
        const isDisabled = gameOver;

        return (
            <Square
                value={currentSquares[i]}
                onClick={() => handleClick(i)}
                isWinner={isWinner}
                isDisabled={isDisabled}
            />
        );
    };

    let status;
    if (winner) {
        status = 'Vencedor: ' + (winner === 'X' ? playerXName : playerOName);
    } else if (isDraw) {
        status = 'Empate!';
    } else {
        status = 'Próximo jogador: ' + (xIsNext ? playerXName : playerOName);
    }

    const moves = history.map((step, move) => {
        let description;
        if (move > 0) {
            const playerSymbol = move % 2 === 1 ? 'X' : 'O';
            const playerName = playerSymbol === 'X' ? playerXName : playerOName;
            description = `Ir para a jogada #${move} (${playerName})`;
        } else {
            description = 'Ir para o início do jogo';
        }
        return (
            <li key={move}>
                <button
                    className={move === currentMove ? 'current-move' : ''}
                    onClick={() => jumpTo(move)}
                >
                    {description}
                </button>
            </li>
        );
    });

    return (
        <div className="game-container">
            <div className="board-wrapper">
                <div className="status">{status}</div>
                <div className="board-row">
                    {renderSquare(0)}{renderSquare(1)}{renderSquare(2)}
                </div>
                <div className="board-row">
                    {renderSquare(3)}{renderSquare(4)}{renderSquare(5)}
                </div>
                <div className="board-row">
                    {renderSquare(6)}{renderSquare(7)}{renderSquare(8)}
                </div>
            </div>

            <div className="game-info">
                <ol>{moves}</ol>
            </div>
        </div>
    );
}

export default Board;