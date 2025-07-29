const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Game state management
let gameStates = new Map();
let gameHistory = [];

// Serve main game page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create new game
app.post('/api/game/new', (req, res) => {
    const gameId = Date.now().toString();
    const gameState = {
        id: gameId,
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameMode: req.body.gameMode || 'PVP', // PVP or PVA
        gameStatus: 'playing', // playing, won, draw
        winner: null,
        winningLine: null,
        moves: [],
        startTime: new Date().toISOString()
    };
    
    gameStates.set(gameId, gameState);
    res.json({ gameId, gameState });
});

// Make a move
app.post('/api/game/:gameId/move', (req, res) => {
    const { gameId } = req.params;
    const { position, player } = req.body;
    
    const gameState = gameStates.get(gameId);
    if (!gameState) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    if (gameState.gameStatus !== 'playing') {
        return res.status(400).json({ error: 'Game is already finished' });
    }
    
    if (gameState.board[position] !== '') {
        return res.status(400).json({ error: 'Position already occupied' });
    }
    
    if (player !== gameState.currentPlayer) {
        return res.status(400).json({ error: 'Not your turn' });
    }
    
    // Make the move
    gameState.board[position] = player;
    gameState.moves.push({
        position,
        player,
        timestamp: new Date().toISOString()
    });
    
    // Check for winner
    const winResult = checkWinner(gameState.board);
    if (winResult.winner) {
        gameState.gameStatus = 'won';
        gameState.winner = winResult.winner;
        gameState.winningLine = winResult.line;
        gameState.endTime = new Date().toISOString();
        
        // Add to history
        gameHistory.push({
            ...gameState,
            board: [...gameState.board],
            moves: [...gameState.moves]
        });
    } else if (gameState.board.every(cell => cell !== '')) {
        gameState.gameStatus = 'draw';
        gameState.endTime = new Date().toISOString();
        
        // Add to history
        gameHistory.push({
            ...gameState,
            board: [...gameState.board],
            moves: [...gameState.moves]
        });
    } else {
        // Switch player
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        
        // AI move for PVA mode
        if (gameState.gameMode === 'PVA' && gameState.currentPlayer === 'O' && gameState.gameStatus === 'playing') {
            setTimeout(() => {
                makeAIMove(gameState);
            }, 500); // Delay for better UX
        }
    }
    
    res.json({ gameState });
});

// Get game state
app.get('/api/game/:gameId', (req, res) => {
    const { gameId } = req.params;
    const gameState = gameStates.get(gameId);
    
    if (!gameState) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ gameState });
});

// Get game history
app.get('/api/history', (req, res) => {
    res.json({ history: gameHistory });
});

// Download game history as JSON
app.get('/api/download/history', (req, res) => {
    const filename = 'tictactoe_results.json';
    const filepath = path.join(__dirname, filename);
    
    // Write history to file
    fs.writeFileSync(filepath, JSON.stringify(gameHistory, null, 2));
    
    res.download(filepath, filename, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).json({ error: 'Download failed' });
        }
        // Clean up the file after download
        fs.unlink(filepath, (unlinkErr) => {
            if (unlinkErr) console.error('File cleanup error:', unlinkErr);
        });
    });
});

// AI move logic
function makeAIMove(gameState) {
    const availablePositions = gameState.board
        .map((cell, index) => cell === '' ? index : null)
        .filter(pos => pos !== null);
    
    if (availablePositions.length === 0) return;
    
    let aiPosition;
    
    // Simple AI strategy: try to win, block player, or random
    aiPosition = findWinningMove(gameState.board, 'O') || 
                 findWinningMove(gameState.board, 'X') || 
                 availablePositions[Math.floor(Math.random() * availablePositions.length)];
    
    // Make AI move
    gameState.board[aiPosition] = 'O';
    gameState.moves.push({
        position: aiPosition,
        player: 'O',
        timestamp: new Date().toISOString(),
        isAI: true
    });
    
    // Check for winner after AI move
    const winResult = checkWinner(gameState.board);
    if (winResult.winner) {
        gameState.gameStatus = 'won';
        gameState.winner = winResult.winner;
        gameState.winningLine = winResult.line;
        gameState.endTime = new Date().toISOString();
        
        // Add to history
        gameHistory.push({
            ...gameState,
            board: [...gameState.board],
            moves: [...gameState.moves]
        });
    } else if (gameState.board.every(cell => cell !== '')) {
        gameState.gameStatus = 'draw';
        gameState.endTime = new Date().toISOString();
        
        // Add to history
        gameHistory.push({
            ...gameState,
            board: [...gameState.board],
            moves: [...gameState.moves]
        });
    } else {
        gameState.currentPlayer = 'X';
    }
}

// Find winning move for a player
function findWinningMove(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        const line = [board[a], board[b], board[c]];
        const playerCount = line.filter(cell => cell === player).length;
        const emptyCount = line.filter(cell => cell === '').length;
        
        if (playerCount === 2 && emptyCount === 1) {
            return pattern.find(pos => board[pos] === '');
        }
    }
    
    return null;
}

// Check for winner
function checkWinner(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return {
                winner: board[a],
                line: pattern
            };
        }
    }
    
    return { winner: null, line: null };
}

// Start server
app.listen(port, () => {
    console.log(`Tic-Tac-Toe server running at http://localhost:${port}`);
    console.log('Game modes available: PVP (Player vs Player), PVA (Player vs AI)');
});

module.exports = app;