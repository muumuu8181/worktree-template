class AIArtGenerator {
    constructor() {
        this.canvas = document.getElementById('artCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resolution = 512;
        this.currentStyle = 'abstract';
        this.currentColorPalette = 'neon';
        this.seed = 12345;
        
        this.parameters = {
            complexity: 50,
            colorIntensity: 70,
            noise: 30,
            symmetry: 0,
            dynamic: 40
        };
        
        this.colorPalettes = {
            neon: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b'],
            ocean: ['#06ffa5', '#096dd9', '#1890ff', '#52c41a', '#73d13d'],
            sunset: ['#ff9a00', '#ff5e00', '#ff1744', '#e91e63', '#9c27b0'],
            pastel: ['#b794f6', '#f687b3', '#90cdf4', '#68d391', '#fbb6ce'],
            mono: ['#ffffff', '#f7fafc', '#e2e8f0', '#a0aec0', '#4a5568'],
            rainbow: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080']
        };
        
        this.artStyles = {
            abstract: this.generateAbstractArt.bind(this),
            geometric: this.generateGeometricArt.bind(this),
            organic: this.generateOrganicArt.bind(this),
            fractal: this.generateFractalArt.bind(this),
            neural: this.generateNeuralArt.bind(this),
            psychedelic: this.generatePsychedelicArt.bind(this)
        };
        
        this.generationHistory = [];
        this.isGenerating = false;
        
        this.setupEventListeners();
        this.initCanvas();
        this.generateArt();
    }
    
    setupEventListeners() {
        document.getElementById('complexitySlider').addEventListener('input', (e) => {
            this.parameters.complexity = parseInt(e.target.value);
            document.getElementById('complexityValue').textContent = e.target.value;
        });
        
        document.getElementById('colorIntensitySlider').addEventListener('input', (e) => {
            this.parameters.colorIntensity = parseInt(e.target.value);
            document.getElementById('colorIntensityValue').textContent = e.target.value;
        });
        
        document.getElementById('noiseSlider').addEventListener('input', (e) => {
            this.parameters.noise = parseInt(e.target.value);
            document.getElementById('noiseValue').textContent = e.target.value;
        });
        
        document.getElementById('symmetrySlider').addEventListener('input', (e) => {
            this.parameters.symmetry = parseInt(e.target.value);
            document.getElementById('symmetryValue').textContent = e.target.value;
        });
        
        document.getElementById('dynamicSlider').addEventListener('input', (e) => {
            this.parameters.dynamic = parseInt(e.target.value);
            document.getElementById('dynamicValue').textContent = e.target.value;
        });
        
        document.getElementById('seedInput').addEventListener('change', (e) => {
            this.seed = parseInt(e.target.value) || 12345;
        });
    }
    
    initCanvas() {
        this.canvas.width = this.resolution;
        this.canvas.height = this.resolution;
        this.updateUI();
    }
    
    async generateArt() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        const startTime = performance.now();
        
        this.updateProgress(0);
        this.updateGenerationStats('生成中...');
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.resolution, this.resolution);
        
        // Seed random number generator
        this.random = this.createSeededRandom(this.seed);
        
        // Generate art based on current style
        await this.artStyles[this.currentStyle]();
        
        const generationTime = Math.round(performance.now() - startTime);
        this.updateProgress(100);
        this.updateGenerationStats(`生成完了 (${generationTime}ms)`);
        
        this.addToHistory(generationTime);
        this.isGenerating = false;
        
        document.getElementById('generationTime').textContent = generationTime + 'ms';
    }
    
    createSeededRandom(seed) {
        let m = 0x80000000; // 2**31
        let a = 1103515245;
        let c = 12345;
        let state = seed ? seed : Math.floor(Math.random() * (m - 1));
        
        return function() {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    }
    
    async generateAbstractArt() {
        const colors = this.colorPalettes[this.currentColorPalette];
        const complexity = this.parameters.complexity;
        const noise = this.parameters.noise;
        
        // Create flow field
        const flowField = this.createFlowField();
        
        // Generate multiple layers
        for (let layer = 0; layer < 5; layer++) {
            await this.delay(50);
            this.updateProgress((layer + 1) * 20);
            
            const numStrokes = Math.floor(complexity * 10);
            
            for (let i = 0; i < numStrokes; i++) {
                const startX = this.random() * this.resolution;
                const startY = this.random() * this.resolution;
                
                this.drawFlowLine(startX, startY, flowField, colors, layer);
            }
        }
        
        // Add noise if specified
        if (noise > 0) {
            this.addNoise(noise / 100);
        }
        
        // Apply symmetry if specified
        if (this.parameters.symmetry > 0) {
            this.applySymmetry();
        }
    }
    
    async generateGeometricArt() {
        const colors = this.colorPalettes[this.currentColorPalette];
        const complexity = this.parameters.complexity;
        
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(0, 0, this.resolution, this.resolution);
        
        for (let layer = 0; layer < 4; layer++) {
            await this.delay(75);
            this.updateProgress((layer + 1) * 25);
            
            const shapes = Math.floor(complexity / 10) + 3;
            
            for (let i = 0; i < shapes; i++) {
                const color = colors[Math.floor(this.random() * colors.length)];
                this.ctx.fillStyle = color + Math.floor(this.random() * 128 + 64).toString(16);
                
                if (this.random() > 0.5) {
                    this.drawGeometricCircle();
                } else {
                    this.drawGeometricPolygon();
                }
            }
        }
    }
    
    async generateOrganicArt() {
        const colors = this.colorPalettes[this.currentColorPalette];
        
        // Create organic background
        this.createOrganicBackground(colors[0]);
        
        for (let layer = 0; layer < 6; layer++) {
            await this.delay(40);
            this.updateProgress((layer + 1) * 16.67);
            
            this.drawOrganicShape(colors);
        }
    }
    
    async generateFractalArt() {
        const colors = this.colorPalettes[this.currentColorPalette];
        const maxDepth = Math.floor(this.parameters.complexity / 10) + 3;
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.resolution, this.resolution);
        
        for (let i = 0; i < 4; i++) {
            await this.delay(100);
            this.updateProgress((i + 1) * 25);
            
            this.drawFractalTree(
                this.resolution / 2,
                this.resolution - 50,
                maxDepth,
                colors[i % colors.length]
            );
        }
    }
    
    async generateNeuralArt() {
        const colors = this.colorPalettes[this.currentColorPalette];
        
        // Create neural network-like structure
        const nodes = this.createNeuralNodes();
        
        for (let layer = 0; layer < 3; layer++) {
            await this.delay(80);
            this.updateProgress((layer + 1) * 33.33);
            
            this.drawNeuralConnections(nodes, colors);
            this.drawNeuralNodes(nodes, colors);
        }
    }
    
    async generatePsychedelicArt() {
        const colors = this.colorPalettes[this.currentColorPalette];
        
        // Create psychedelic background
        this.createPsychedelicBackground();
        
        for (let layer = 0; layer < 8; layer++) {
            await this.delay(30);
            this.updateProgress((layer + 1) * 12.5);
            
            this.drawPsychedelicPattern(colors, layer);
        }
    }
    
    createFlowField() {
        const fieldSize = 20;
        const field = [];
        
        for (let x = 0; x < fieldSize; x++) {
            field[x] = [];
            for (let y = 0; y < fieldSize; y++) {
                const angle = this.perlinNoise(x * 0.1, y * 0.1) * Math.PI * 2;
                field[x][y] = { angle: angle, strength: this.random() };
            }
        }
        
        return field;
    }
    
    drawFlowLine(startX, startY, flowField, colors, layer) {
        const color = colors[Math.floor(this.random() * colors.length)];
        const alpha = (this.parameters.colorIntensity / 100) * (0.3 + layer * 0.15);
        
        this.ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        this.ctx.lineWidth = 1 + this.random() * 3;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        
        for (let step = 0; step < 100; step++) {
            const fieldX = Math.floor((x / this.resolution) * 20);
            const fieldY = Math.floor((y / this.resolution) * 20);
            
            if (fieldX >= 0 && fieldX < 20 && fieldY >= 0 && fieldY < 20) {
                const flow = flowField[fieldX][fieldY];
                x += Math.cos(flow.angle) * flow.strength * 5;
                y += Math.sin(flow.angle) * flow.strength * 5;
                
                this.ctx.lineTo(x, y);
            } else {
                break;
            }
        }
        
        this.ctx.stroke();
    }
    
    drawGeometricCircle() {
        const x = this.random() * this.resolution;
        const y = this.random() * this.resolution;
        const radius = this.random() * 100 + 20;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawGeometricPolygon() {
        const centerX = this.random() * this.resolution;
        const centerY = this.random() * this.resolution;
        const sides = Math.floor(this.random() * 6) + 3;
        const radius = this.random() * 80 + 30;
        
        this.ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    createOrganicBackground(baseColor) {
        const gradient = this.ctx.createRadialGradient(
            this.resolution / 2, this.resolution / 2, 0,
            this.resolution / 2, this.resolution / 2, this.resolution / 2
        );
        
        gradient.addColorStop(0, baseColor + '80');
        gradient.addColorStop(1, baseColor + '20');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.resolution, this.resolution);
    }
    
    drawOrganicShape(colors) {
        const centerX = this.random() * this.resolution;
        const centerY = this.random() * this.resolution;
        const color = colors[Math.floor(this.random() * colors.length)];
        
        this.ctx.fillStyle = color + '60';
        this.ctx.beginPath();
        
        const points = 20;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = 50 + this.perlinNoise(i * 0.3, centerX * 0.01) * 80;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawFractalTree(x, y, depth, color) {
        if (depth === 0) return;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = depth;
        
        const length = depth * 15;
        const angle1 = -Math.PI / 4;
        const angle2 = Math.PI / 4;
        
        const endX1 = x + Math.cos(angle1) * length;
        const endY1 = y + Math.sin(angle1) * length;
        const endX2 = x + Math.cos(angle2) * length;
        const endY2 = y + Math.sin(angle2) * length;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX1, endY1);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX2, endY2);
        this.ctx.stroke();
        
        this.drawFractalTree(endX1, endY1, depth - 1, color);
        this.drawFractalTree(endX2, endY2, depth - 1, color);
    }
    
    createNeuralNodes() {
        const nodes = [];
        const layers = 4;
        const nodesPerLayer = 8;
        
        for (let layer = 0; layer < layers; layer++) {
            for (let node = 0; node < nodesPerLayer; node++) {
                nodes.push({
                    x: (layer + 1) * (this.resolution / (layers + 1)),
                    y: (node + 1) * (this.resolution / (nodesPerLayer + 1)),
                    layer: layer,
                    activation: this.random()
                });
            }
        }
        
        return nodes;
    }
    
    drawNeuralConnections(nodes, colors) {
        this.ctx.strokeStyle = colors[0] + '40';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (Math.abs(nodes[i].layer - nodes[j].layer) === 1 && this.random() > 0.5) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(nodes[i].x, nodes[i].y);
                    this.ctx.lineTo(nodes[j].x, nodes[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    drawNeuralNodes(nodes, colors) {
        for (const node of nodes) {
            const color = colors[node.layer % colors.length];
            const radius = 5 + node.activation * 15;
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    createPsychedelicBackground() {
        const imageData = this.ctx.createImageData(this.resolution, this.resolution);
        const data = imageData.data;
        
        for (let y = 0; y < this.resolution; y++) {
            for (let x = 0; x < this.resolution; x++) {
                const index = (y * this.resolution + x) * 4;
                const hue = (x + y + this.seed) % 360;
                const rgb = this.hslToRgb(hue / 360, 0.8, 0.5);
                
                data[index] = rgb[0];
                data[index + 1] = rgb[1];
                data[index + 2] = rgb[2];
                data[index + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    drawPsychedelicPattern(colors, layer) {
        const centerX = this.resolution / 2;
        const centerY = this.resolution / 2;
        const spirals = 3 + layer;
        
        for (let spiral = 0; spiral < spirals; spiral++) {
            const color = colors[spiral % colors.length];
            this.ctx.strokeStyle = color + '80';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let t = 0; t < Math.PI * 4; t += 0.1) {
                const radius = t * 10 + layer * 20;
                const x = centerX + Math.cos(t + spiral * Math.PI / 3) * radius;
                const y = centerY + Math.sin(t + spiral * Math.PI / 3) * radius;
                
                if (t === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
        }
    }
    
    perlinNoise(x, y) {
        // Simplified Perlin noise implementation
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const xf = x - xi;
        const yf = y - yi;
        
        const u = this.fade(xf);
        const v = this.fade(yf);
        
        const aa = this.grad(this.hash(xi, yi), xf, yf);
        const ab = this.grad(this.hash(xi, yi + 1), xf, yf - 1);
        const ba = this.grad(this.hash(xi + 1, yi), xf - 1, yf);
        const bb = this.grad(this.hash(xi + 1, yi + 1), xf - 1, yf - 1);
        
        const x1 = this.lerp(aa, ba, u);
        const x2 = this.lerp(ab, bb, u);
        
        return this.lerp(x1, x2, v);
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(a, b, t) {
        return a + t * (b - a);
    }
    
    hash(x, y) {
        return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
    }
    
    grad(hash, x, y) {
        return (hash < 0.5 ? x : -x) + (hash % 0.25 < 0.125 ? y : -y);
    }
    
    hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    addNoise(intensity) {
        const imageData = this.ctx.getImageData(0, 0, this.resolution, this.resolution);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (this.random() - 0.5) * intensity * 255;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    applySymmetry() {
        const imageData = this.ctx.getImageData(0, 0, this.resolution, this.resolution);
        
        if (this.parameters.symmetry > 50) {
            // Vertical symmetry
            this.ctx.save();
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(this.canvas, -this.resolution, 0, this.resolution / 2, this.resolution);
            this.ctx.restore();
        }
        
        if (this.parameters.symmetry > 75) {
            // Horizontal symmetry
            this.ctx.save();
            this.ctx.scale(1, -1);
            this.ctx.drawImage(this.canvas, 0, -this.resolution, this.resolution, this.resolution / 2);
            this.ctx.restore();
        }
    }
    
    updateProgress(percentage) {
        document.getElementById('progressBar').style.width = percentage + '%';
    }
    
    updateGenerationStats(status) {
        document.getElementById('generationStats').textContent = status;
    }
    
    updateUI() {
        document.getElementById('currentResolution').textContent = `${this.resolution}x${this.resolution}`;
        document.getElementById('currentStyle').textContent = this.getStyleDisplayName(this.currentStyle);
        document.getElementById('currentSeed').textContent = this.seed;
    }
    
    getStyleDisplayName(style) {
        const names = {
            abstract: 'Abstract Flow',
            geometric: 'Geometric Patterns',
            organic: 'Organic Shapes',
            fractal: 'Fractal Art',
            neural: 'Neural Networks',
            psychedelic: 'Psychedelic'
        };
        return names[style] || style;
    }
    
    addToHistory(generationTime) {
        const entry = {
            style: this.currentStyle,
            seed: this.seed,
            time: generationTime,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.generationHistory.unshift(entry);
        if (this.generationHistory.length > 10) {
            this.generationHistory.pop();
        }
        
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        const historyContainer = document.getElementById('generationHistory');
        historyContainer.innerHTML = this.generationHistory
            .map(entry => `
                <div class="history-item">
                    <span>${entry.timestamp} - ${this.getStyleDisplayName(entry.style)}</span>
                    <span>Seed: ${entry.seed}</span>
                </div>
            `).join('');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

let artGenerator;

function generateArt() {
    artGenerator.seed = parseInt(document.getElementById('seedInput').value) || Math.floor(Math.random() * 999999);
    document.getElementById('seedInput').value = artGenerator.seed;
    artGenerator.generateArt();
}

function regenerateWithSeed() {
    artGenerator.generateArt();
}

function setStyle(style) {
    artGenerator.currentStyle = style;
    
    document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    artGenerator.updateUI();
}

function setColorPalette(palette) {
    artGenerator.currentColorPalette = palette;
    
    document.querySelectorAll('.color-swatch').forEach(swatch => swatch.classList.remove('active'));
    event.target.classList.add('active');
}

function setResolution(resolution) {
    artGenerator.resolution = resolution;
    artGenerator.initCanvas();
    
    document.querySelectorAll('.style-selector button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function randomSeed() {
    const newSeed = Math.floor(Math.random() * 999999);
    artGenerator.seed = newSeed;
    document.getElementById('seedInput').value = newSeed;
    artGenerator.updateUI();
}

function exportArt(format) {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `ai-art-${artGenerator.currentStyle}-${artGenerator.seed}-${timestamp}.${format}`;
    
    if (format === 'png') {
        link.download = filename;
        link.href = artGenerator.canvas.toDataURL('image/png');
    } else if (format === 'jpg') {
        link.download = filename;
        link.href = artGenerator.canvas.toDataURL('image/jpeg', 0.9);
    }
    
    link.click();
}

async function copyToClipboard() {
    try {
        const blob = await new Promise(resolve => 
            artGenerator.canvas.toBlob(resolve, 'image/png')
        );
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        
        alert('アートがクリップボードにコピーされました！');
    } catch (err) {
        console.error('クリップボードへのコピーに失敗:', err);
        alert('クリップボードへのコピーに失敗しました。');
    }
}

function shareArt() {
    if (navigator.share) {
        artGenerator.canvas.toBlob(async (blob) => {
            const file = new File([blob], 'ai-generated-art.png', { type: 'image/png' });
            
            try {
                await navigator.share({
                    title: 'AI生成アート',
                    text: `AI生成アートエディターで作成 - スタイル: ${artGenerator.currentStyle}, シード: ${artGenerator.seed}`,
                    files: [file]
                });
            } catch (err) {
                console.error('共有に失敗:', err);
            }
        });
    } else {
        exportArt('png');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    artGenerator = new AIArtGenerator();
    
    setTimeout(() => {
        artGenerator.initCanvas();
    }, 100);
});