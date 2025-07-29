// Tic-Tac-Toe Game Logic
class TicTacToeGame {
    constructor() {
        this.gameId = null;
        this.gameState = null;
        this.gameMode = 'PVP';
        this.gameHistory = [];
        this.isWaitingForAI = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.showMessage('ゲームを開始する準備ができました！', 'info');
    }
    
    initializeElements() {
        // Game board elements
        this.boardElement = document.getElementById('gameBoard');
        this.cells = document.querySelectorAll('.cell');
        
        // Control elements
        this.newGameBtn = document.getElementById('newGameBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.pvpModeBtn = document.getElementById('pvpMode');
        this.pvaModeBtn = document.getElementById('pvaMode');
        
        // Status elements
        this.currentPlayerElement = document.getElementById('currentPlayer');
        this.gameStateElement = document.getElementById('gameState');
        this.moveCountElement = document.getElementById('moveCount');
        this.gameResultElement = document.getElementById('gameResult');
        this.resultMessageElement = document.getElementById('resultMessage');
        this.moveLogElement = document.getElementById('moveLog');
        
        // History elements
        this.showHistoryBtn = document.getElementById('showHistoryBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.historyModal = document.getElementById('historyModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.modalHistoryContent = document.getElementById('modalHistoryContent');
        
        // Loading overlay
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.messageContainer = document.getElementById('messageContainer');
    }
    
    attachEventListeners() {
        // Game controls
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        // Mode selection
        this.pvpModeBtn.addEventListener('click', () => this.setGameMode('PVP'));
        this.pvaModeBtn.addEventListener('click', () => this.setGameMode('PVA'));
        
        // Board clicks
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        // History controls
        this.showHistoryBtn.addEventListener('click', () => this.showHistory());
        this.downloadBtn.addEventListener('click', () => this.downloadHistory());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // Modal click outside to close
        this.historyModal.addEventListener('click', (e) => {
            if (e.target === this.historyModal) {
                this.closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            } else if (e.key === 'n' && e.ctrlKey) {
                e.preventDefault();
                this.startNewGame();
            } else if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.resetGame();
            }
        });
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (mode === 'PVP') {
            this.pvpModeBtn.classList.add('active');
        } else {
            this.pvaModeBtn.classList.add('active');
        }
        
        this.showMessage(`ゲームモードを${mode}に変更しました`, 'info');
        
        // Reset current game if in progress
        if (this.gameState && this.gameState.gameStatus === 'playing') {
            this.resetGame();
        }
    }
    
    async startNewGame() {
        try {
            this.showLoading(false);
            
            const response = await fetch('/api/game/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gameMode: this.gameMode
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.gameId = data.gameId;
                this.gameState = data.gameState;
                this.updateUI();
                this.clearMoveLog();
                this.hideGameResult();
                this.showMessage('新しいゲームを開始しました！', 'success');
            } else {
                throw new Error(data.error || 'ゲーム作成に失敗しました');
            }
        } catch (error) {
            console.error('Error starting new game:', error);
            this.showMessage('ゲーム作成エラー: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async handleCellClick(position) {
        if (!this.gameState || this.gameState.gameStatus !== 'playing') {
            this.showMessage('ゲームが開始されていません', 'error');
            return;
        }
        
        if (this.gameState.board[position] !== '') {
            this.showMessage('既に埋まっているセルです', 'error');
            return;
        }
        
        if (this.isWaitingForAI) {
            this.showMessage('AIの手番を待っています...', 'info');
            return;
        }
        
        const currentPlayer = this.gameState.currentPlayer;
        
        // In PVA mode, only allow human player (X) to click
        if (this.gameMode === 'PVA' && currentPlayer === 'O') {
            this.showMessage('AIの手番です', 'info');
            return;
        }
        
        try {
            await this.makeMove(position, currentPlayer);
        } catch (error) {
            console.error('Error making move:', error);
            this.showMessage('手を打つ際にエラーが発生しました: ' + error.message, 'error');
        }
    }
    
    async makeMove(position, player) {
        try {
            const response = await fetch(`/api/game/${this.gameId}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    position: position,
                    player: player
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.gameState = data.gameState;
                this.updateUI();
                this.addMoveToLog(position, player, false);
                
                // Check if game ended
                if (this.gameState.gameStatus !== 'playing') {
                    this.handleGameEnd();
                } else if (this.gameMode === 'PVA' && this.gameState.currentPlayer === 'O') {
                    // Wait for AI move
                    this.isWaitingForAI = true;
                    this.showLoading(true, 'AI thinking...');
                    
                    // Poll for AI move
                    setTimeout(() => this.pollForAIMove(), 1000);
                }
            } else {
                throw new Error(data.error || '手を打つことができませんでした');
            }
        } catch (error) {
            throw error;
        }
    }
    
    async pollForAIMove() {
        try {
            const response = await fetch(`/api/game/${this.gameId}`);
            const data = await response.json();
            
            if (response.ok) {
                const previousMoveCount = this.gameState.moves.length;
                this.gameState = data.gameState;
                
                // Check if AI made a move
                if (this.gameState.moves.length > previousMoveCount) {
                    const aiMove = this.gameState.moves[this.gameState.moves.length - 1];
                    this.addMoveToLog(aiMove.position, 'O', true);
                    this.updateUI();
                    this.isWaitingForAI = false;
                    this.hideLoading();
                    
                    // Check if game ended after AI move
                    if (this.gameState.gameStatus !== 'playing') {
                        this.handleGameEnd();
                    }
                } else {
                    // AI hasn't moved yet, continue polling
                    setTimeout(() => this.pollForAIMove(), 500);
                }
            } else {
                throw new Error(data.error || 'ゲーム状態の取得に失敗しました');
            }
        } catch (error) {
            console.error('Error polling for AI move:', error);
            this.isWaitingForAI = false;
            this.hideLoading();
            this.showMessage('AI の手を待つ際にエラーが発生しました: ' + error.message, 'error');
        }
    }
    
    updateUI() {
        if (!this.gameState) return;
        
        // Update board
        this.cells.forEach((cell, index) => {
            const cellValue = this.gameState.board[index];
            cell.textContent = cellValue;
            cell.className = 'cell';
            
            if (cellValue === 'X') {
                cell.classList.add('x');
            } else if (cellValue === 'O') {
                cell.classList.add('o');
            }
        });
        
        // Highlight winning line
        if (this.gameState.winningLine) {
            this.gameState.winningLine.forEach(index => {
                this.cells[index].classList.add('winning');
            });
        }
        
        // Update status
        this.currentPlayerElement.textContent = this.gameState.currentPlayer;
        this.currentPlayerElement.className = `player-${this.gameState.currentPlayer.toLowerCase()}`;
        
        this.gameStateElement.textContent = this.getGameStatusText();
        this.moveCountElement.textContent = this.gameState.moves.length;
    }
    
    getGameStatusText() {
        if (!this.gameState) return '準備中';
        
        switch (this.gameState.gameStatus) {
            case 'playing':
                if (this.gameMode === 'PVA' && this.gameState.currentPlayer === 'O') {
                    return 'AI思考中...';
                }
                return 'プレイ中';
            case 'won':
                return `${this.gameState.winner} の勝利！`;
            case 'draw':
                return '引き分け';
            default:
                return '準備中';
        }
    }
    
    handleGameEnd() {
        this.showGameResult();
        
        if (this.gameState.gameStatus === 'won') {
            this.showMessage(`🎉 プレイヤー ${this.gameState.winner} の勝利！`, 'success');
        } else if (this.gameState.gameStatus === 'draw') {
            this.showMessage('🤝 引き分けです！', 'info');
        }
        
        // Add to local history
        this.addToLocalHistory();
    }
    
    showGameResult() {
        if (!this.gameState || this.gameState.gameStatus === 'playing') {
            this.hideGameResult();
            return;
        }
        
        this.gameResultElement.style.display = 'block';
        this.gameResultElement.className = 'game-result';
        
        let message = '';
        if (this.gameState.gameStatus === 'won') {
            message = `🏆 プレイヤー ${this.gameState.winner} の勝利！`;
            this.gameResultElement.classList.add(`winner-${this.gameState.winner.toLowerCase()}`);
        } else if (this.gameState.gameStatus === 'draw') {
            message = '🤝 引き分けです！';
            this.gameResultElement.classList.add('draw');
        }
        
        this.resultMessageElement.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">${message}</div>
            <div>総手数: ${this.gameState.moves.length}</div>
            <div>ゲームモード: ${this.gameState.gameMode}</div>
        `;
    }
    
    hideGameResult() {
        this.gameResultElement.style.display = 'none';
    }
    
    addMoveToLog(position, player, isAI = false) {
        const moveItem = document.createElement('div');
        moveItem.className = `move-item ${isAI ? 'ai' : ''}`;
        moveItem.textContent = `${player}: セル${position + 1} ${isAI ? '(AI)' : ''}`;
        this.moveLogElement.appendChild(moveItem);
        this.moveLogElement.scrollTop = this.moveLogElement.scrollHeight;
    }
    
    clearMoveLog() {
        this.moveLogElement.innerHTML = '';
    }
    
    resetGame() {
        this.gameId = null;
        this.gameState = null;
        this.isWaitingForAI = false;
        
        // Clear board
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Reset status
        this.currentPlayerElement.textContent = 'X';
        this.currentPlayerElement.className = 'player-x';
        this.gameStateElement.textContent = '準備中';
        this.moveCountElement.textContent = '0';
        
        this.clearMoveLog();
        this.hideGameResult();
        this.hideLoading();
        this.showMessage('ゲームをリセットしました', 'info');
    }
    
    async showHistory() {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            
            if (response.ok) {
                this.gameHistory = data.history;
                this.renderHistoryModal();
                this.historyModal.style.display = 'flex';
            } else {
                throw new Error('履歴の取得に失敗しました');
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            this.showMessage('履歴取得エラー: ' + error.message, 'error');
        }
    }
    
    renderHistoryModal() {
        if (this.gameHistory.length === 0) {
            this.modalHistoryContent.innerHTML = '<p>まだゲーム履歴がありません。</p>';
            return;
        }
        
        let historyHTML = '<div class="history-list">';
        
        this.gameHistory.forEach((game, index) => {
            const startTime = new Date(game.startTime).toLocaleString('ja-JP');
            const duration = game.endTime ? 
                Math.round((new Date(game.endTime) - new Date(game.startTime)) / 1000) : 'N/A';
            
            historyHTML += `
                <div class="history-item" style="border: 1px solid #ddd; margin-bottom: 10px; padding: 15px; border-radius: 5px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong>ゲーム ${index + 1}</strong>
                        <span style="color: #666; font-size: 0.9rem;">${startTime}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px;">
                        <div>
                            <p><strong>結果:</strong> ${game.gameStatus === 'won' ? `${game.winner} の勝利` : '引き分け'}</p>
                            <p><strong>モード:</strong> ${game.gameMode}</p>
                            <p><strong>手数:</strong> ${game.moves.length}</p>
                            <p><strong>時間:</strong> ${duration}秒</p>
                        </div>
                        <div>
                            <strong>ボード:</strong>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-top: 5px;">
                                ${game.board.map((cell, i) => `
                                    <div style="
                                        width: 30px; height: 30px; 
                                        border: 1px solid #ccc; 
                                        display: flex; align-items: center; justify-content: center;
                                        font-weight: bold; font-size: 0.8rem;
                                        ${cell === 'X' ? 'color: #FF0000; background: #ffe6e6;' : ''}
                                        ${cell === 'O' ? 'color: #0000FF; background: #e6e6ff;' : ''}
                                        ${game.winningLine && game.winningLine.includes(i) ? 'background: #FFFF00 !important;' : ''}
                                    ">${cell || ''}</div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        historyHTML += '</div>';
        this.modalHistoryContent.innerHTML = historyHTML;
    }
    
    async downloadHistory() {
        try {
            const response = await fetch('/api/download/history');
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tictactoe_results.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                this.showMessage('ゲーム履歴をダウンロードしました', 'success');
            } else {
                throw new Error('ダウンロードに失敗しました');
            }
        } catch (error) {
            console.error('Error downloading history:', error);
            this.showMessage('ダウンロードエラー: ' + error.message, 'error');
        }
    }
    
    clearHistory() {
        if (confirm('ゲーム履歴をクリアしますか？この操作は取り消せません。')) {
            this.gameHistory = [];
            this.showMessage('ローカル履歴をクリアしました', 'info');
            this.closeModal();
        }
    }
    
    addToLocalHistory() {
        if (this.gameState && this.gameState.gameStatus !== 'playing') {
            // Only add completed games
            const existingIndex = this.gameHistory.findIndex(game => game.id === this.gameState.id);
            if (existingIndex === -1) {
                this.gameHistory.push({ ...this.gameState });
            }
        }
    }
    
    closeModal() {
        this.historyModal.style.display = 'none';
    }
    
    showLoading(show = true, message = 'Loading...') {
        if (show) {
            this.loadingOverlay.style.display = 'flex';
            this.loadingOverlay.querySelector('p').textContent = message;
        } else {
            this.hideLoading();
        }
    }
    
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }
    
    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        this.messageContainer.appendChild(messageElement);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 4000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new TicTacToeGame();
    
    // Debug helpers
    window.debugGame = {
        getGameState: () => window.game.gameState,
        getGameId: () => window.game.gameId,
        getHistory: () => window.game.gameHistory,
        resetGame: () => window.game.resetGame(),
        newGame: () => window.game.startNewGame()
    };
    
    console.log('🎮 Tic-Tac-Toe Game initialized!');
    console.log('Debug helpers available at window.debugGame');
});