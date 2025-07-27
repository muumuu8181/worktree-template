class RTSGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimap = document.getElementById('minimap');
        this.minimapCtx = this.minimap.getContext('2d');
        
        this.gameState = 'waiting';
        this.currentStage = 1;
        this.difficulty = 'normal';
        this.gameTime = 0;
        this.startTime = 0;
        
        this.mapWidth = 1200;
        this.mapHeight = 800;
        this.viewX = 0;
        this.viewY = 0;
        this.camera = { x: 0, y: 0 };
        
        this.playerUnits = [];
        this.enemyUnits = [];
        this.selectedUnits = [];
        this.obstacles = [];
        this.battleLog = [];
        
        this.gridSize = 20;
        this.pathfindingGrid = [];
        
        this.formation = 'line';
        this.isGameRunning = false;
        this.isPaused = false;
        
        this.difficultySettings = {
            easy: { enemyCount: 3, enemySpeed: 0.5, enemyReactionTime: 2000 },
            normal: { enemyCount: 5, enemySpeed: 0.8, enemyReactionTime: 1000 },
            hard: { enemyCount: 8, enemySpeed: 1.2, enemyReactionTime: 500 }
        };
        
        this.stageConfigs = [
            { obstacles: 5, terrain: 'forest', enemyFormation: 'defensive' },
            { obstacles: 8, terrain: 'mountain', enemyFormation: 'aggressive' },
            { obstacles: 12, terrain: 'desert', enemyFormation: 'guerrilla' },
            { obstacles: 15, terrain: 'urban', enemyFormation: 'fortress' },
            { obstacles: 20, terrain: 'swamp', enemyFormation: 'mobile' }
        ];
        
        this.initCanvas();
        this.setupEventListeners();
        this.generateMap();
        this.gameLoop();
    }
    
    initCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.minimap.width = 150;
        this.minimap.height = 150;
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    generateMap() {
        this.obstacles = [];
        this.pathfindingGrid = [];
        
        const gridWidth = Math.ceil(this.mapWidth / this.gridSize);
        const gridHeight = Math.ceil(this.mapHeight / this.gridSize);
        
        for (let y = 0; y < gridHeight; y++) {
            this.pathfindingGrid[y] = [];
            for (let x = 0; x < gridWidth; x++) {
                this.pathfindingGrid[y][x] = { walkable: true, cost: 1 };
            }
        }
        
        const stageConfig = this.stageConfigs[this.currentStage - 1] || this.stageConfigs[0];
        const obstacleCount = stageConfig.obstacles + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < obstacleCount; i++) {
            const obstacle = {
                x: Math.random() * (this.mapWidth - 60) + 30,
                y: Math.random() * (this.mapHeight - 60) + 30,
                width: 30 + Math.random() * 40,
                height: 30 + Math.random() * 40,
                type: stageConfig.terrain
            };
            
            this.obstacles.push(obstacle);
            this.updatePathfindingGrid(obstacle);
        }
        
        this.addLogEntry(`ステージ ${this.currentStage} - ${stageConfig.terrain}マップ生成完了`, 'move');
    }
    
    updatePathfindingGrid(obstacle) {
        const startX = Math.floor(obstacle.x / this.gridSize);
        const startY = Math.floor(obstacle.y / this.gridSize);
        const endX = Math.ceil((obstacle.x + obstacle.width) / this.gridSize);
        const endY = Math.ceil((obstacle.y + obstacle.height) / this.gridSize);
        
        for (let y = startY; y < endY && y < this.pathfindingGrid.length; y++) {
            for (let x = startX; x < endX && x < this.pathfindingGrid[0].length; x++) {
                if (this.pathfindingGrid[y] && this.pathfindingGrid[y][x]) {
                    this.pathfindingGrid[y][x].walkable = false;
                }
            }
        }
    }
    
    createUnit(x, y, team, type = 'soldier') {
        return {
            id: Math.random().toString(36).substr(2, 9),
            x: x,
            y: y,
            targetX: x,
            targetY: y,
            team: team,
            type: type,
            hp: 100,
            maxHp: 100,
            damage: 20,
            range: 60,
            speed: 1,
            state: 'idle',
            path: [],
            target: null,
            lastAttackTime: 0,
            attackCooldown: 1000,
            selected: false,
            formation: { x: 0, y: 0 }
        };
    }
    
    aStarPathfinding(startX, startY, endX, endY) {
        const gridWidth = this.pathfindingGrid[0].length;
        const gridHeight = this.pathfindingGrid.length;
        
        const start = { x: Math.floor(startX / this.gridSize), y: Math.floor(startY / this.gridSize) };
        const end = { x: Math.floor(endX / this.gridSize), y: Math.floor(endY / this.gridSize) };
        
        if (start.x < 0 || start.x >= gridWidth || start.y < 0 || start.y >= gridHeight ||
            end.x < 0 || end.x >= gridWidth || end.y < 0 || end.y >= gridHeight) {
            return [];
        }
        
        if (!this.pathfindingGrid[end.y][end.x].walkable) {
            for (let radius = 1; radius <= 3; radius++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const newEndX = end.x + dx;
                        const newEndY = end.y + dy;
                        if (newEndX >= 0 && newEndX < gridWidth && newEndY >= 0 && newEndY < gridHeight &&
                            this.pathfindingGrid[newEndY][newEndX].walkable) {
                            end.x = newEndX;
                            end.y = newEndY;
                            break;
                        }
                    }
                }
            }
        }
        
        const openSet = [{ ...start, g: 0, h: this.heuristic(start, end), f: this.heuristic(start, end), parent: null }];
        const closedSet = [];
        const allNodes = {};
        
        while (openSet.length > 0) {
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < current.f) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            openSet.splice(currentIndex, 1);
            closedSet.push(current);
            
            if (current.x === end.x && current.y === end.y) {
                const path = [];
                let node = current;
                while (node) {
                    path.unshift({ x: node.x * this.gridSize + this.gridSize / 2, y: node.y * this.gridSize + this.gridSize / 2 });
                    node = node.parent;
                }
                return path;
            }
            
            const neighbors = [
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y },
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 },
                { x: current.x - 1, y: current.y - 1 },
                { x: current.x + 1, y: current.y - 1 },
                { x: current.x - 1, y: current.y + 1 },
                { x: current.x + 1, y: current.y + 1 }
            ];
            
            for (const neighbor of neighbors) {
                if (neighbor.x < 0 || neighbor.x >= gridWidth || neighbor.y < 0 || neighbor.y >= gridHeight) continue;
                if (!this.pathfindingGrid[neighbor.y][neighbor.x].walkable) continue;
                if (closedSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) continue;
                
                const gScore = current.g + this.pathfindingGrid[neighbor.y][neighbor.x].cost;
                
                let existingOpen = openSet.find(node => node.x === neighbor.x && node.y === neighbor.y);
                if (existingOpen && gScore >= existingOpen.g) continue;
                
                const h = this.heuristic(neighbor, end);
                const f = gScore + h;
                
                const newNode = {
                    x: neighbor.x,
                    y: neighbor.y,
                    g: gScore,
                    h: h,
                    f: f,
                    parent: current
                };
                
                if (existingOpen) {
                    existingOpen.g = gScore;
                    existingOpen.f = f;
                    existingOpen.parent = current;
                } else {
                    openSet.push(newNode);
                }
            }
        }
        
        return [];
    }
    
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    
    updateUnits() {
        if (!this.isGameRunning || this.isPaused) return;
        
        [...this.playerUnits, ...this.enemyUnits].forEach(unit => {
            if (unit.hp <= 0) {
                unit.state = 'dead';
                return;
            }
            
            this.updateUnitAI(unit);
            this.moveUnit(unit);
            this.updateCombat(unit);
        });
        
        this.playerUnits = this.playerUnits.filter(unit => unit.hp > 0);
        this.enemyUnits = this.enemyUnits.filter(unit => unit.hp > 0);
        
        this.checkWinCondition();
    }
    
    updateUnitAI(unit) {
        if (unit.team === 'enemy' && unit.state !== 'dead') {
            const nearestPlayer = this.findNearestUnit(unit, this.playerUnits);
            
            if (nearestPlayer) {
                const distance = this.getDistance(unit, nearestPlayer);
                
                if (distance <= unit.range && this.hasLineOfSight(unit, nearestPlayer)) {
                    unit.state = 'attacking';
                    unit.target = nearestPlayer;
                } else if (distance <= 150) {
                    unit.state = 'pursuing';
                    unit.targetX = nearestPlayer.x;
                    unit.targetY = nearestPlayer.y;
                    unit.path = this.aStarPathfinding(unit.x, unit.y, unit.targetX, unit.targetY);
                } else if (unit.state === 'idle') {
                    const patrolPoint = this.getPatrolPoint(unit);
                    unit.targetX = patrolPoint.x;
                    unit.targetY = patrolPoint.y;
                    unit.path = this.aStarPathfinding(unit.x, unit.y, unit.targetX, unit.targetY);
                    unit.state = 'patrolling';
                }
            }
        }
    }
    
    getPatrolPoint(unit) {
        const stageConfig = this.stageConfigs[this.currentStage - 1] || this.stageConfigs[0];
        
        switch (stageConfig.enemyFormation) {
            case 'defensive':
                return { x: this.mapWidth * 0.8, y: this.mapHeight * 0.5 };
            case 'aggressive':
                return { x: Math.random() * this.mapWidth, y: Math.random() * this.mapHeight };
            case 'guerrilla':
                return { x: this.mapWidth * 0.7 + Math.random() * this.mapWidth * 0.3, y: Math.random() * this.mapHeight };
            case 'fortress':
                return { x: this.mapWidth * 0.9, y: this.mapHeight * 0.5 + (Math.random() - 0.5) * 100 };
            case 'mobile':
                return { x: unit.x + (Math.random() - 0.5) * 200, y: unit.y + (Math.random() - 0.5) * 200 };
            default:
                return { x: Math.random() * this.mapWidth, y: Math.random() * this.mapHeight };
        }
    }
    
    findNearestUnit(unit, targets) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (const target of targets) {
            if (target.hp > 0) {
                const distance = this.getDistance(unit, target);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = target;
                }
            }
        }
        
        return nearest;
    }
    
    getDistance(unit1, unit2) {
        const dx = unit1.x - unit2.x;
        const dy = unit1.y - unit2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    hasLineOfSight(unit1, unit2) {
        const dx = unit2.x - unit1.x;
        const dy = unit2.y - unit1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.ceil(distance / 5);
        
        for (let i = 0; i <= steps; i++) {
            const x = unit1.x + (dx * i / steps);
            const y = unit1.y + (dy * i / steps);
            
            for (const obstacle of this.obstacles) {
                if (x >= obstacle.x && x <= obstacle.x + obstacle.width &&
                    y >= obstacle.y && y <= obstacle.y + obstacle.height) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    moveUnit(unit) {
        if (unit.path.length > 0) {
            const target = unit.path[0];
            const dx = target.x - unit.x;
            const dy = target.y - unit.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 5) {
                unit.path.shift();
            } else {
                const moveSpeed = unit.speed * (unit.team === 'enemy' ? this.difficultySettings[this.difficulty].enemySpeed : 1);
                unit.x += (dx / distance) * moveSpeed;
                unit.y += (dy / distance) * moveSpeed;
            }
        }
    }
    
    updateCombat(unit) {
        if (unit.state === 'attacking' && unit.target && unit.target.hp > 0) {
            const distance = this.getDistance(unit, unit.target);
            
            if (distance <= unit.range && this.hasLineOfSight(unit, unit.target)) {
                const now = Date.now();
                if (now - unit.lastAttackTime >= unit.attackCooldown) {
                    this.attack(unit, unit.target);
                    unit.lastAttackTime = now;
                }
            } else {
                unit.state = 'pursuing';
                unit.target = null;
            }
        }
    }
    
    attack(attacker, target) {
        const damage = attacker.damage + Math.floor(Math.random() * 10);
        target.hp -= damage;
        
        const attackerType = attacker.team === 'player' ? 'プレイヤー' : '敵AI';
        const targetType = target.team === 'player' ? 'プレイヤー' : '敵AI';
        
        this.addLogEntry(`${attackerType}ユニットが${targetType}ユニットに${damage}ダメージ`, 'combat');
        
        if (target.hp <= 0) {
            this.addLogEntry(`${targetType}ユニット撃破！`, 'victory');
        }
    }
    
    checkWinCondition() {
        if (this.playerUnits.length === 0 && this.isGameRunning) {
            this.endGame('defeat');
        } else if (this.enemyUnits.length === 0 && this.isGameRunning) {
            this.endGame('victory');
        }
    }
    
    endGame(result) {
        this.isGameRunning = false;
        this.gameState = result === 'victory' ? 'victory' : 'defeat';
        
        const message = result === 'victory' ? 
            `ステージ ${this.currentStage} クリア！` : 
            `ステージ ${this.currentStage} 敗北...`;
        
        this.addLogEntry(message, 'victory');
        this.updateUI();
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }
    
    render() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        this.renderTerrain();
        this.renderObstacles();
        this.renderUnits();
        this.renderEffects();
        
        this.ctx.restore();
        
        this.renderMinimap();
        this.updateUI();
    }
    
    renderTerrain() {
        const stageConfig = this.stageConfigs[this.currentStage - 1] || this.stageConfigs[0];
        
        let terrainColors = {
            forest: ['#2d5016', '#3a6b1c', '#4a7c2a'],
            mountain: ['#4a4a4a', '#5a5a5a', '#6a6a6a'],
            desert: ['#d4a574', '#e6b888', '#f2c999'],
            urban: ['#3a3a3a', '#4a4a4a', '#5a5a5a'],
            swamp: ['#2a4d3a', '#3e5d4a', '#526d5a']
        };
        
        const colors = terrainColors[stageConfig.terrain] || terrainColors.forest;
        
        for (let x = 0; x < this.mapWidth; x += 40) {
            for (let y = 0; y < this.mapHeight; y += 40) {
                this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                this.ctx.fillRect(x, y, 40, 40);
            }
        }
    }
    
    renderObstacles() {
        for (const obstacle of this.obstacles) {
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            this.ctx.strokeStyle = '#8b4513';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }
    
    renderUnits() {
        [...this.playerUnits, ...this.enemyUnits].forEach(unit => {
            if (unit.hp <= 0) return;
            
            const color = unit.team === 'player' ? 
                (unit.selected ? '#00ff00' : '#0080ff') : '#ff4040';
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(unit.x, unit.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (unit.selected) {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(unit.x, unit.y, 12, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            const hpBarWidth = 20;
            const hpBarHeight = 4;
            const hpPercentage = unit.hp / unit.maxHp;
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(unit.x - hpBarWidth/2, unit.y - 15, hpBarWidth, hpBarHeight);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(unit.x - hpBarWidth/2, unit.y - 15, hpBarWidth * hpPercentage, hpBarHeight);
            
            if (unit.path.length > 0) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(unit.x, unit.y);
                for (const point of unit.path) {
                    this.ctx.lineTo(point.x, point.y);
                }
                this.ctx.stroke();
            }
        });
    }
    
    renderEffects() {
        // Combat effects, explosions, etc.
    }
    
    renderMinimap() {
        this.minimapCtx.fillStyle = '#000000';
        this.minimapCtx.fillRect(0, 0, 150, 150);
        
        const scaleX = 150 / this.mapWidth;
        const scaleY = 150 / this.mapHeight;
        
        for (const obstacle of this.obstacles) {
            this.minimapCtx.fillStyle = '#654321';
            this.minimapCtx.fillRect(
                obstacle.x * scaleX,
                obstacle.y * scaleY,
                obstacle.width * scaleX,
                obstacle.height * scaleY
            );
        }
        
        for (const unit of this.playerUnits) {
            this.minimapCtx.fillStyle = '#0080ff';
            this.minimapCtx.fillRect(unit.x * scaleX - 1, unit.y * scaleY - 1, 2, 2);
        }
        
        for (const unit of this.enemyUnits) {
            this.minimapCtx.fillStyle = '#ff4040';
            this.minimapCtx.fillRect(unit.x * scaleX - 1, unit.y * scaleY - 1, 2, 2);
        }
        
        const viewWidth = this.width * scaleX;
        const viewHeight = this.height * scaleY;
        this.minimapCtx.strokeStyle = '#ffffff';
        this.minimapCtx.lineWidth = 1;
        this.minimapCtx.strokeRect(
            this.camera.x * scaleX,
            this.camera.y * scaleY,
            viewWidth,
            viewHeight
        );
    }
    
    updateUI() {
        document.getElementById('gameState').textContent = this.gameState;
        document.getElementById('currentStage').textContent = this.currentStage;
        document.getElementById('playerUnits').textContent = this.playerUnits.length;
        document.getElementById('enemyUnits').textContent = this.enemyUnits.length;
        
        const selectedCount = this.selectedUnits.length;
        document.getElementById('selectedUnit').textContent = selectedCount > 0 ? `${selectedCount}体` : 'なし';
        
        if (this.isGameRunning) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('gameTime').textContent = `${minutes}:${seconds}`;
        }
        
        if (this.selectedUnits.length > 0) {
            const unit = this.selectedUnits[0];
            document.getElementById('unitInfo').innerHTML = `
                <strong>ユニット情報:</strong><br>
                ID: ${unit.id.substr(0, 6)}<br>
                HP: ${unit.hp}/${unit.maxHp}<br>
                状態: ${unit.state}<br>
                位置: (${Math.floor(unit.x)}, ${Math.floor(unit.y)})
            `;
        }
    }
    
    addLogEntry(message, type = 'normal') {
        const time = new Date().toLocaleTimeString();
        const entry = `[${time}] ${message}`;
        
        this.battleLog.unshift({ message: entry, type: type });
        if (this.battleLog.length > 50) {
            this.battleLog.pop();
        }
        
        const logElement = document.getElementById('battleLog');
        logElement.innerHTML = this.battleLog
            .map(log => `<div class="log-entry ${log.type}">${log.message}</div>`)
            .join('');
        logElement.scrollTop = 0;
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left + this.camera.x;
        const clickY = e.clientY - rect.top + this.camera.y;
        
        if (e.shiftKey) {
            const clickedUnit = this.findUnitAt(clickX, clickY, this.playerUnits);
            if (clickedUnit) {
                clickedUnit.selected = !clickedUnit.selected;
                if (clickedUnit.selected) {
                    this.selectedUnits.push(clickedUnit);
                } else {
                    this.selectedUnits = this.selectedUnits.filter(u => u !== clickedUnit);
                }
            }
        } else {
            this.selectedUnits.forEach(unit => unit.selected = false);
            this.selectedUnits = [];
            
            const clickedUnit = this.findUnitAt(clickX, clickY, this.playerUnits);
            if (clickedUnit) {
                clickedUnit.selected = true;
                this.selectedUnits.push(clickedUnit);
            }
        }
    }
    
    handleRightClick(e) {
        if (this.selectedUnits.length === 0) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const targetX = e.clientX - rect.left + this.camera.x;
        const targetY = e.clientY - rect.top + this.camera.y;
        
        this.moveSelectedUnits(targetX, targetY);
    }
    
    moveSelectedUnits(targetX, targetY) {
        this.selectedUnits.forEach((unit, index) => {
            const offset = this.getFormationOffset(index, this.selectedUnits.length);
            const finalX = targetX + offset.x;
            const finalY = targetY + offset.y;
            
            unit.targetX = finalX;
            unit.targetY = finalY;
            unit.path = this.aStarPathfinding(unit.x, unit.y, finalX, finalY);
            unit.state = 'moving';
        });
        
        this.addLogEntry(`${this.selectedUnits.length}体のユニットに移動命令`, 'move');
    }
    
    getFormationOffset(index, totalUnits) {
        switch (this.formation) {
            case 'line':
                return { x: (index - totalUnits/2) * 25, y: 0 };
            case 'circle':
                const angle = (index / totalUnits) * Math.PI * 2;
                const radius = Math.max(30, totalUnits * 8);
                return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
            case 'wedge':
                const row = Math.floor(Math.sqrt(index));
                const col = index - row * row;
                return { x: (col - row/2) * 20, y: row * 25 };
            default:
                return { x: 0, y: 0 };
        }
    }
    
    findUnitAt(x, y, units) {
        for (const unit of units) {
            const distance = Math.sqrt((unit.x - x) ** 2 + (unit.y - y) ** 2);
            if (distance <= 12) {
                return unit;
            }
        }
        return null;
    }
    
    handleKeyPress(e) {
        if (e.key === ' ') {
            e.preventDefault();
            this.isPaused ? this.resumeGame() : this.pauseGame();
        }
    }
    
    gameLoop() {
        this.updateUnits();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

let game;

function startGame() {
    game.playerUnits = [];
    game.enemyUnits = [];
    game.selectedUnits = [];
    
    for (let i = 0; i < 5; i++) {
        game.playerUnits.push(game.createUnit(50 + i * 30, 100, 'player'));
    }
    
    const difficulty = game.difficultySettings[game.difficulty];
    for (let i = 0; i < difficulty.enemyCount; i++) {
        game.enemyUnits.push(game.createUnit(
            game.mapWidth - 100,
            100 + i * 40,
            'enemy'
        ));
    }
    
    game.isGameRunning = true;
    game.gameState = 'running';
    game.startTime = Date.now();
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    
    game.addLogEntry('戦闘開始！', 'victory');
}

function pauseGame() {
    game.isPaused = true;
    game.gameState = 'paused';
    document.getElementById('pauseBtn').textContent = '▶ 再開';
    document.getElementById('pauseBtn').onclick = resumeGame;
}

function resumeGame() {
    game.isPaused = false;
    game.gameState = 'running';
    document.getElementById('pauseBtn').textContent = '⏸ 一時停止';
    document.getElementById('pauseBtn').onclick = pauseGame;
}

function resetGame() {
    game.isGameRunning = false;
    game.isPaused = false;
    game.gameState = 'waiting';
    game.playerUnits = [];
    game.enemyUnits = [];
    game.selectedUnits = [];
    game.battleLog = [];
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = '⏸ 一時停止';
    document.getElementById('pauseBtn').onclick = pauseGame;
    
    game.addLogEntry('ゲームリセット', 'normal');
}

function selectStage(stage) {
    if (stage === 0) {
        game.currentStage = Math.floor(Math.random() * 5) + 1;
    } else {
        game.currentStage = stage;
    }
    
    game.generateMap();
    
    document.querySelectorAll('.stage-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    game.addLogEntry(`ステージ ${game.currentStage} を選択`, 'move');
}

function setDifficulty(difficulty) {
    game.difficulty = difficulty;
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    game.addLogEntry(`難易度: ${difficulty}`, 'normal');
}

function addPlayerUnit() {
    if (game.playerUnits.length < 20) {
        const unit = game.createUnit(
            50 + Math.random() * 100,
            50 + Math.random() * 100,
            'player'
        );
        game.playerUnits.push(unit);
        game.addLogEntry('プレイヤーユニット追加', 'move');
    }
}

function selectAllUnits() {
    game.selectedUnits.forEach(unit => unit.selected = false);
    game.selectedUnits = [...game.playerUnits];
    game.selectedUnits.forEach(unit => unit.selected = true);
    game.addLogEntry(`全ユニット選択 (${game.selectedUnits.length}体)`, 'move');
}

function attackMove() {
    game.selectedUnits.forEach(unit => {
        unit.state = 'aggressive';
    });
    game.addLogEntry('攻撃移動モード設定', 'combat');
}

function defendPosition() {
    game.selectedUnits.forEach(unit => {
        unit.state = 'defending';
        unit.targetX = unit.x;
        unit.targetY = unit.y;
    });
    game.addLogEntry('防御位置設定', 'move');
}

function setFormation(formation) {
    game.formation = formation;
    
    document.querySelectorAll('.formation-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    game.addLogEntry(`隊形: ${formation}`, 'move');
}

document.addEventListener('DOMContentLoaded', () => {
    game = new RTSGame();
    
    setTimeout(() => {
        game.resizeCanvas();
    }, 100);
});