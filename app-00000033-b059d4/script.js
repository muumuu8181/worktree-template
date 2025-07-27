class MazeGame {
    constructor() {
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.currentLevel = 1;
        this.cellSize = 8;
        this.animationSpeed = 50;
        this.showGenerationAnimation = true;
        this.showSolveAnimation = true;
        
        this.maze = [];
        this.width = 15;
        this.height = 15;
        this.player = { x: 1, y: 1 };
        this.goal = { x: 0, y: 0 };
        
        this.isGenerating = false;
        this.isSolving = false;
        this.isPlaying = false;
        this.solutionPath = [];
        this.visitedCells = [];
        this.hintPath = [];
        
        this.generationStartTime = 0;
        this.solveStartTime = 0;
        this.bestTimes = {};
        
        this.levelSizes = {
            1: 15, 2: 20, 3: 25, 4: 30, 5: 35,
            6: 40, 7: 45, 8: 50, 9: 60, 10: 80
        };
        
        this.colors = {
            wall: '#2c3e50',
            path: '#ecf0f1',
            player: '#e74c3c',
            goal: '#27ae60',
            solution: '#3498db',
            visited: '#f39c12',
            hint: '#9b59b6',
            generating: '#e67e22'
        };
        
        this.initCanvas();
        this.setupEventListeners();
        this.generateNewMaze();
    }
    
    initCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.render();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        document.getElementById('cellSizeSlider').addEventListener('input', (e) => {
            this.cellSize = parseInt(e.target.value);
            document.getElementById('cellSizeValue').textContent = e.target.value;
            this.render();
        });
        
        document.getElementById('animSpeedSlider').addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            document.getElementById('animSpeedValue').textContent = e.target.value;
        });
    }
    
    generateNewMaze() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        this.isSolving = false;
        this.isPlaying = false;
        this.solutionPath = [];
        this.visitedCells = [];
        this.hintPath = [];
        
        const size = this.levelSizes[this.currentLevel];
        this.width = size;
        this.height = size;
        
        this.initializeMaze();
        this.generationStartTime = performance.now();
        
        if (this.showGenerationAnimation) {
            this.generateMazeAnimated();
        } else {
            this.generateMazeInstant();
        }
        
        this.player = { x: 1, y: 1 };
        this.goal = { x: this.width - 2, y: this.height - 2 };
        
        this.updateUI();
    }
    
    initializeMaze() {
        this.maze = [];
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x] = {
                    x: x,
                    y: y,
                    walls: { top: true, right: true, bottom: true, left: true },
                    visited: false,
                    isPath: false,
                    inSolution: false,
                    inHint: false,
                    generationStep: -1
                };
            }
        }
    }
    
    generateMazeInstant() {
        const stack = [];
        const startCell = this.maze[1][1];
        startCell.visited = true;
        stack.push(startCell);
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbor = this.getUnvisitedNeighbor(current);
            
            if (neighbor) {
                neighbor.visited = true;
                this.removeWallBetween(current, neighbor);
                stack.push(neighbor);
            } else {
                stack.pop();
            }
        }
        
        this.finalizeGeneration();
    }
    
    async generateMazeAnimated() {
        const stack = [];
        const startCell = this.maze[1][1];
        startCell.visited = true;
        startCell.generationStep = 0;
        stack.push(startCell);
        
        let step = 0;
        const totalCells = Math.floor((this.width - 1) / 2) * Math.floor((this.height - 1) / 2);
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbor = this.getUnvisitedNeighbor(current);
            
            if (neighbor) {
                neighbor.visited = true;
                neighbor.generationStep = step++;
                this.removeWallBetween(current, neighbor);
                stack.push(neighbor);
                
                this.updateProgress(step / totalCells * 100);
                this.render();
                await this.delay(this.animationSpeed);
            } else {
                stack.pop();
            }
        }
        
        this.finalizeGeneration();
    }
    
    getUnvisitedNeighbor(cell) {
        const neighbors = [];
        const { x, y } = cell;
        
        if (y >= 2 && !this.maze[y - 2][x].visited) neighbors.push(this.maze[y - 2][x]);
        if (x < this.width - 2 && !this.maze[y][x + 2].visited) neighbors.push(this.maze[y][x + 2]);
        if (y < this.height - 2 && !this.maze[y + 2][x].visited) neighbors.push(this.maze[y][x + 2]);
        if (x >= 2 && !this.maze[y][x - 2].visited) neighbors.push(this.maze[y][x - 2]);
        
        return neighbors.length > 0 ? neighbors[Math.floor(Math.random() * neighbors.length)] : null;
    }
    
    removeWallBetween(cell1, cell2) {
        const dx = cell2.x - cell1.x;
        const dy = cell2.y - cell1.y;
        
        if (dx === 2) { // cell2 is to the right
            cell1.walls.right = false;
            cell2.walls.left = false;
            this.maze[cell1.y][cell1.x + 1].walls.right = false;
            this.maze[cell1.y][cell1.x + 1].walls.left = false;
        } else if (dx === -2) { // cell2 is to the left
            cell1.walls.left = false;
            cell2.walls.right = false;
            this.maze[cell1.y][cell1.x - 1].walls.right = false;
            this.maze[cell1.y][cell1.x - 1].walls.left = false;
        } else if (dy === 2) { // cell2 is below
            cell1.walls.bottom = false;
            cell2.walls.top = false;
            this.maze[cell1.y + 1][cell1.x].walls.top = false;
            this.maze[cell1.y + 1][cell1.x].walls.bottom = false;
        } else if (dy === -2) { // cell2 is above
            cell1.walls.top = false;
            cell2.walls.bottom = false;
            this.maze[cell1.y - 1][cell1.x].walls.top = false;
            this.maze[cell1.y - 1][cell1.x].walls.bottom = false;
        }
    }
    
    finalizeGeneration() {
        this.isGenerating = false;
        const generationTime = Math.round(performance.now() - this.generationStartTime);
        document.getElementById('generationTime').textContent = generationTime + 'ms';
        
        this.updateProgress(100);
        this.updateMazeStats();
        this.render();
        
        document.getElementById('progressText').textContent = '生成完了！';
    }
    
    async solveMaze() {
        if (this.isSolving || this.isGenerating) return;
        
        this.isSolving = true;
        this.solutionPath = [];
        this.visitedCells = [];
        this.solveStartTime = performance.now();
        
        const path = await this.aStarSolve();
        
        if (path.length > 0) {
            this.solutionPath = path;
            const solveTime = Math.round(performance.now() - this.solveStartTime);
            document.getElementById('solveTime').textContent = solveTime + 'ms';
            document.getElementById('stepCount').textContent = path.length;
            
            if (this.showSolveAnimation) {
                await this.animateSolution();
            } else {
                this.render();
            }
        }
        
        this.isSolving = false;
    }
    
    async aStarSolve() {
        const openSet = [];
        const closedSet = [];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        const start = this.maze[this.player.y][this.player.x];
        const goal = this.maze[this.goal.y][this.goal.x];
        
        openSet.push(start);
        gScore.set(start, 0);
        fScore.set(start, this.heuristic(start, goal));
        
        while (openSet.length > 0) {
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (fScore.get(openSet[i]) < fScore.get(current)) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            if (current === goal) {
                return this.reconstructPath(cameFrom, current);
            }
            
            openSet.splice(currentIndex, 1);
            closedSet.push(current);
            this.visitedCells.push(current);
            
            if (this.showSolveAnimation) {
                this.render();
                await this.delay(Math.max(1, this.animationSpeed / 10));
            }
            
            const neighbors = this.getWalkableNeighbors(current);
            
            for (const neighbor of neighbors) {
                if (closedSet.includes(neighbor)) continue;
                
                const tentativeGScore = gScore.get(current) + 1;
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore.get(neighbor)) {
                    continue;
                }
                
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, goal));
            }
        }
        
        return [];
    }
    
    getWalkableNeighbors(cell) {
        const neighbors = [];
        const { x, y } = cell;
        
        if (y > 0 && !cell.walls.top) neighbors.push(this.maze[y - 1][x]);
        if (x < this.width - 1 && !cell.walls.right) neighbors.push(this.maze[y][x + 1]);
        if (y < this.height - 1 && !cell.walls.bottom) neighbors.push(this.maze[y + 1][x]);
        if (x > 0 && !cell.walls.left) neighbors.push(this.maze[y][x - 1]);
        
        return neighbors;
    }
    
    heuristic(cell1, cell2) {
        return Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y);
    }
    
    reconstructPath(cameFrom, current) {
        const path = [current];
        
        while (cameFrom.has(current)) {
            current = cameFrom.get(current);
            path.unshift(current);
        }
        
        return path;
    }
    
    async animateSolution() {
        for (let i = 0; i < this.solutionPath.length; i++) {
            this.solutionPath[i].inSolution = true;
            this.render();
            await this.delay(this.animationSpeed);
        }
    }
    
    startManualPlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.player = { x: 1, y: 1 };
            this.clearSolution();
            document.getElementById('playBtn').textContent = '🛑 プレイ終了';
            document.getElementById('playBtn').classList.add('danger');
        } else {
            document.getElementById('playBtn').textContent = '🎮 手動でプレイ';
            document.getElementById('playBtn').classList.remove('danger');
        }
        
        this.render();
    }
    
    showHint() {
        if (!this.isPlaying || this.isSolving) return;
        
        this.hintPath = [];
        const path = this.findPathTo(this.player, this.goal);
        
        if (path.length > 1) {
            // Show next 3-5 steps as hint
            const hintLength = Math.min(5, path.length);
            for (let i = 1; i < hintLength; i++) {
                path[i].inHint = true;
                this.hintPath.push(path[i]);
            }
        }
        
        this.render();
        
        setTimeout(() => {
            this.hintPath.forEach(cell => cell.inHint = false);
            this.render();
        }, 3000);
    }
    
    findPathTo(start, goal) {
        const queue = [{ cell: this.maze[start.y][start.x], path: [this.maze[start.y][start.x]] }];
        const visited = new Set();
        
        while (queue.length > 0) {
            const { cell, path } = queue.shift();
            
            if (cell.x === goal.x && cell.y === goal.y) {
                return path;
            }
            
            const key = `${cell.x},${cell.y}`;
            if (visited.has(key)) continue;
            visited.add(key);
            
            const neighbors = this.getWalkableNeighbors(cell);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(neighborKey)) {
                    queue.push({ cell: neighbor, path: [...path, neighbor] });
                }
            }
        }
        
        return [];
    }
    
    movePlayer(dx, dy) {
        if (!this.isPlaying) return;
        
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        if (newX < 0 || newX >= this.width || newY < 0 || newY >= this.height) return;
        
        const currentCell = this.maze[this.player.y][this.player.x];
        const targetCell = this.maze[newY][newX];
        
        // Check if movement is allowed (no wall between)
        let canMove = false;
        if (dx === 1 && !currentCell.walls.right) canMove = true;
        if (dx === -1 && !currentCell.walls.left) canMove = true;
        if (dy === 1 && !currentCell.walls.bottom) canMove = true;
        if (dy === -1 && !currentCell.walls.top) canMove = true;
        
        if (canMove) {
            this.player.x = newX;
            this.player.y = newY;
            
            if (this.player.x === this.goal.x && this.player.y === this.goal.y) {
                this.isPlaying = false;
                document.getElementById('playBtn').textContent = '🎮 手動でプレイ';
                document.getElementById('playBtn').classList.remove('danger');
                alert('🎉 ゴール到達！おめでとうございます！');
            }
            
            this.render();
        }
    }
    
    handleKeyPress(e) {
        if (!this.isPlaying) {
            if (e.key === ' ') {
                e.preventDefault();
                this.solveMaze();
            } else if (e.key.toLowerCase() === 'r') {
                this.resetMaze();
            } else if (e.key.toLowerCase() === 'h') {
                this.showHint();
            }
            return;
        }
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.movePlayer(0, -1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.movePlayer(0, 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.movePlayer(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.movePlayer(1, 0);
                break;
            case 'h':
            case 'H':
                e.preventDefault();
                this.showHint();
                break;
            case ' ':
                e.preventDefault();
                this.solveMaze();
                break;
        }
    }
    
    render() {
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        const offsetX = (this.canvasWidth - this.width * this.cellSize) / 2;
        const offsetY = (this.canvasHeight - this.height * this.cellSize) / 2;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.maze[y][x];
                const cellX = offsetX + x * this.cellSize;
                const cellY = offsetY + y * this.cellSize;
                
                // Draw cell background
                let cellColor = this.colors.wall;
                if (!cell.walls.top && !cell.walls.right && !cell.walls.bottom && !cell.walls.left) {
                    cellColor = this.colors.path;
                } else if (!cell.walls.top || !cell.walls.right || !cell.walls.bottom || !cell.walls.left) {
                    cellColor = this.colors.path;
                }
                
                if (this.visitedCells.includes(cell)) {
                    cellColor = this.colors.visited;
                }
                
                if (cell.inSolution) {
                    cellColor = this.colors.solution;
                }
                
                if (cell.inHint) {
                    cellColor = this.colors.hint;
                }
                
                if (this.isGenerating && cell.generationStep >= 0) {
                    const alpha = Math.min(1, (Date.now() - this.generationStartTime) / 1000);
                    cellColor = this.colors.generating;
                }
                
                this.ctx.fillStyle = cellColor;
                this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Draw walls
                this.ctx.strokeStyle = this.colors.wall;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                
                if (cell.walls.top) {
                    this.ctx.moveTo(cellX, cellY);
                    this.ctx.lineTo(cellX + this.cellSize, cellY);
                }
                if (cell.walls.right) {
                    this.ctx.moveTo(cellX + this.cellSize, cellY);
                    this.ctx.lineTo(cellX + this.cellSize, cellY + this.cellSize);
                }
                if (cell.walls.bottom) {
                    this.ctx.moveTo(cellX + this.cellSize, cellY + this.cellSize);
                    this.ctx.lineTo(cellX, cellY + this.cellSize);
                }
                if (cell.walls.left) {
                    this.ctx.moveTo(cellX, cellY + this.cellSize);
                    this.ctx.lineTo(cellX, cellY);
                }
                
                this.ctx.stroke();
            }
        }
        
        // Draw player
        if (this.isPlaying) {
            const playerX = offsetX + this.player.x * this.cellSize + this.cellSize / 2;
            const playerY = offsetY + this.player.y * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = this.colors.player;
            this.ctx.beginPath();
            this.ctx.arc(playerX, playerY, this.cellSize / 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw goal
        const goalX = offsetX + this.goal.x * this.cellSize + this.cellSize / 2;
        const goalY = offsetY + this.goal.y * this.cellSize + this.cellSize / 2;
        
        this.ctx.fillStyle = this.colors.goal;
        this.ctx.beginPath();
        this.ctx.arc(goalX, goalY, this.cellSize / 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    clearSolution() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x].inSolution = false;
                this.maze[y][x].inHint = false;
            }
        }
        this.solutionPath = [];
        this.visitedCells = [];
        this.hintPath = [];
    }
    
    resetMaze() {
        this.clearSolution();
        this.isPlaying = false;
        this.player = { x: 1, y: 1 };
        document.getElementById('playBtn').textContent = '🎮 手動でプレイ';
        document.getElementById('playBtn').classList.remove('danger');
        this.render();
    }
    
    updateUI() {
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('currentLevelStat').textContent = this.currentLevel;
        document.getElementById('mazeSize').textContent = `${this.width}x${this.height}`;
        
        const bestTime = this.bestTimes[this.currentLevel];
        document.getElementById('bestTime').textContent = bestTime ? bestTime + 'ms' : '--';
    }
    
    updateProgress(percentage) {
        document.getElementById('progressFill').style.width = percentage + '%';
        document.getElementById('progressText').textContent = 
            this.isGenerating ? `生成中... ${Math.round(percentage)}%` : '完了';
    }
    
    updateMazeStats() {
        let totalCells = this.width * this.height;
        let wallCells = 0;
        let pathCells = 0;
        let junctions = 0;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.maze[y][x];
                const wallCount = Object.values(cell.walls).filter(w => w).length;
                
                if (wallCount === 4) {
                    wallCells++;
                } else {
                    pathCells++;
                    if (wallCount <= 2) junctions++;
                }
            }
        }
        
        document.getElementById('mazeInfo').innerHTML = `
            <strong>迷路統計:</strong><br>
            総セル数: ${totalCells}<br>
            壁セル数: ${wallCells}<br>
            通路セル数: ${pathCells}<br>
            分岐点数: ${junctions}<br>
            最短経路長: ${this.solutionPath.length}
        `;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

let mazeGame;

function generateNewMaze() {
    mazeGame.generateNewMaze();
}

function solveMaze() {
    mazeGame.solveMaze();
}

function resetMaze() {
    mazeGame.resetMaze();
}

function setLevel(level) {
    mazeGame.currentLevel = level;
    mazeGame.updateUI();
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    mazeGame.generateNewMaze();
}

function startManualPlay() {
    mazeGame.startManualPlay();
}

function showHint() {
    mazeGame.showHint();
}

function toggleGenerationAnimation() {
    mazeGame.showGenerationAnimation = !mazeGame.showGenerationAnimation;
    const btn = document.getElementById('genAnimBtn');
    btn.textContent = mazeGame.showGenerationAnimation ? '生成アニメON' : '生成アニメOFF';
    btn.classList.toggle('success', mazeGame.showGenerationAnimation);
}

function toggleSolveAnimation() {
    mazeGame.showSolveAnimation = !mazeGame.showSolveAnimation;
    const btn = document.getElementById('solveAnimBtn');
    btn.textContent = mazeGame.showSolveAnimation ? '解決アニメON' : '解決アニメOFF';
    btn.classList.toggle('success', mazeGame.showSolveAnimation);
}

document.addEventListener('DOMContentLoaded', () => {
    mazeGame = new MazeGame();
    
    setTimeout(() => {
        mazeGame.resizeCanvas();
    }, 100);
    
    // Set default level 1 as active
    document.querySelector('.difficulty-btn').classList.add('active');
});