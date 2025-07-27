class PaintSystem {
    constructor() {
        this.canvas = document.getElementById('paintCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.currentSize = 5;
        this.currentOpacity = 1;
        this.brushShape = 'round';
        this.brushHardness = 100;
        this.brushSpacing = 1;
        
        // 履歴管理
        this.history = [];
        this.historyStep = -1;
        this.maxHistorySteps = 50;
        
        // レイヤー管理
        this.layers = [this.canvas];
        this.currentLayer = 0;
        
        // グラデーション設定
        this.gradientColor1 = '#ff0000';
        this.gradientColor2 = '#0000ff';
        this.gradientType = 'linear';
        
        // 描画開始位置
        this.startX = 0;
        this.startY = 0;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.saveState();
    }

    initializeCanvas() {
        // 高DPI対応
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // 初期設定
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
        
        // 白い背景
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        // マウスイベント
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.updateCursor.bind(this));

        // タッチイベント
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

        // ツールボタン
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
                this.updateCursor();
            });
        });

        // スライダー
        this.setupSliderListeners();
        
        // 色選択
        this.setupColorListeners();
        
        // アクションボタン
        this.setupActionListeners();
        
        // ブラシ設定
        this.setupBrushListeners();
        
        // フィルター
        this.setupFilterListeners();
        
        // グラデーション
        this.setupGradientListeners();
        
        // キーボードショートカット
        this.setupKeyboardShortcuts();
    }

    setupSliderListeners() {
        const brushSizeSlider = document.getElementById('brushSize');
        const sizeValue = document.getElementById('sizeValue');
        brushSizeSlider.addEventListener('input', (e) => {
            this.currentSize = parseInt(e.target.value);
            sizeValue.textContent = this.currentSize + 'px';
            this.updateCursor();
        });

        const opacitySlider = document.getElementById('opacity');
        const opacityValue = document.getElementById('opacityValue');
        opacitySlider.addEventListener('input', (e) => {
            this.currentOpacity = parseFloat(e.target.value);
            opacityValue.textContent = Math.round(this.currentOpacity * 100) + '%';
        });

        const hardnessSlider = document.getElementById('brushHardness');
        const hardnessValue = document.getElementById('hardnessValue');
        hardnessSlider.addEventListener('input', (e) => {
            this.brushHardness = parseInt(e.target.value);
            hardnessValue.textContent = this.brushHardness + '%';
        });

        const spacingSlider = document.getElementById('brushSpacing');
        const spacingValue = document.getElementById('spacingValue');
        spacingSlider.addEventListener('input', (e) => {
            this.brushSpacing = parseInt(e.target.value);
            spacingValue.textContent = this.brushSpacing + 'px';
        });
    }

    setupColorListeners() {
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('change', (e) => {
            this.currentColor = e.target.value;
        });

        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                this.currentColor = e.target.dataset.color;
                colorPicker.value = this.currentColor;
            });
        });
    }

    setupActionListeners() {
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCanvas());
        document.getElementById('uploadBtn').addEventListener('change', (e) => this.uploadImage(e));
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
    }

    setupBrushListeners() {
        const brushShape = document.getElementById('brushShape');
        brushShape.addEventListener('change', (e) => {
            this.brushShape = e.target.value;
        });
    }

    setupFilterListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyFilter(e.target.dataset.filter);
            });
        });
    }

    setupGradientListeners() {
        document.getElementById('gradientColor1').addEventListener('change', (e) => {
            this.gradientColor1 = e.target.value;
        });

        document.getElementById('gradientColor2').addEventListener('change', (e) => {
            this.gradientColor2 = e.target.value;
        });

        document.querySelectorAll('.gradient-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.gradientType = e.target.dataset.gradient;
                this.currentTool = 'gradient';
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        this.downloadImage();
                        break;
                }
            }
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.startX = pos.x;
        this.startY = pos.y;
        
        if (this.currentTool === 'brush' || this.currentTool === 'pencil' || this.currentTool === 'marker') {
            this.drawBrush(pos.x, pos.y, false);
        }
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        
        switch(this.currentTool) {
            case 'brush':
            case 'pencil':
            case 'marker':
                this.drawBrush(pos.x, pos.y, true);
                break;
            case 'eraser':
                this.erase(pos.x, pos.y);
                break;
        }
    }

    stopDrawing(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        
        const pos = this.getMousePos(e);
        
        switch(this.currentTool) {
            case 'line':
                this.drawLine(this.startX, this.startY, pos.x, pos.y);
                break;
            case 'circle':
                this.drawCircle(this.startX, this.startY, pos.x, pos.y);
                break;
            case 'rectangle':
                this.drawRectangle(this.startX, this.startY, pos.x, pos.y);
                break;
            case 'gradient':
                this.drawGradient(this.startX, this.startY, pos.x, pos.y);
                break;
        }
        
        this.saveState();
    }

    drawBrush(x, y, continuous) {
        this.ctx.globalAlpha = this.currentOpacity;
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.fillStyle = this.currentColor;
        
        if (this.currentTool === 'pencil') {
            this.ctx.lineWidth = Math.max(1, this.currentSize * 0.5);
        } else if (this.currentTool === 'marker') {
            this.ctx.lineWidth = this.currentSize * 1.5;
            this.ctx.globalAlpha = this.currentOpacity * 0.6;
        } else {
            this.ctx.lineWidth = this.currentSize;
        }

        if (this.brushShape === 'round') {
            if (continuous) {
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            } else {
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
            }
        } else {
            this.drawCustomBrush(x, y);
        }
    }

    drawCustomBrush(x, y) {
        const size = this.currentSize;
        this.ctx.save();
        this.ctx.translate(x, y);
        
        this.ctx.beginPath();
        switch(this.brushShape) {
            case 'square':
                this.ctx.rect(-size/2, -size/2, size, size);
                break;
            case 'star':
                this.drawStar(0, 0, 5, size/2, size/4);
                break;
            case 'heart':
                this.drawHeart(0, 0, size/2);
                break;
        }
        this.ctx.fill();
        this.ctx.restore();
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }

        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
    }

    drawHeart(cx, cy, size) {
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy + size/4);
        this.ctx.bezierCurveTo(cx, cy, cx - size/2, cy, cx - size/2, cy + size/4);
        this.ctx.bezierCurveTo(cx - size/2, cy + size/2, cx, cy + size*3/4, cx, cy + size);
        this.ctx.bezierCurveTo(cx, cy + size*3/4, cx + size/2, cy + size/2, cx + size/2, cy + size/4);
        this.ctx.bezierCurveTo(cx + size/2, cy, cx, cy, cx, cy + size/4);
        this.ctx.closePath();
    }

    erase(x, y) {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.currentSize, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawLine(x1, y1, x2, y2) {
        this.ctx.globalAlpha = this.currentOpacity;
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    drawCircle(x1, y1, x2, y2) {
        const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        this.ctx.globalAlpha = this.currentOpacity;
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    drawRectangle(x1, y1, x2, y2) {
        this.ctx.globalAlpha = this.currentOpacity;
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }

    drawGradient(x1, y1, x2, y2) {
        let gradient;
        
        if (this.gradientType === 'linear') {
            gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        } else {
            const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            gradient = this.ctx.createRadialGradient(x1, y1, 0, x1, y1, radius);
        }
        
        gradient.addColorStop(0, this.gradientColor1);
        gradient.addColorStop(1, this.gradientColor2);
        
        this.ctx.globalAlpha = this.currentOpacity;
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    applyFilter(filterType) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        switch(filterType) {
            case 'blur':
                this.applyBlurFilter(imageData);
                break;
            case 'sharpen':
                this.applySharpenFilter(imageData);
                break;
            case 'emboss':
                this.applyEmbossFilter(imageData);
                break;
            case 'edge':
                this.applyEdgeFilter(imageData);
                break;
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
    }

    applyBlurFilter(imageData) {
        // シンプルなボックスブラー
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
                            sum += data[neighborIdx + c];
                        }
                    }
                    output[idx + c] = sum / 9;
                }
            }
        }
        
        imageData.data.set(output);
    }

    applySharpenFilter(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);
        
        const kernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];
        
        this.applyConvolution(imageData, kernel, output);
        imageData.data.set(output);
    }

    applyEmbossFilter(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);
        
        const kernel = [
            -2, -1, 0,
            -1, 1, 1,
            0, 1, 2
        ];
        
        this.applyConvolution(imageData, kernel, output);
        imageData.data.set(output);
    }

    applyEdgeFilter(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);
        
        const kernel = [
            -1, -1, -1,
            -1, 8, -1,
            -1, -1, -1
        ];
        
        this.applyConvolution(imageData, kernel, output);
        imageData.data.set(output);
    }

    applyConvolution(imageData, kernel, output) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    let kernelIdx = 0;
                    
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
                            sum += data[neighborIdx + c] * kernel[kernelIdx];
                            kernelIdx++;
                        }
                    }
                    
                    output[idx + c] = Math.max(0, Math.min(255, sum));
                }
            }
        }
    }

    updateCursor(e) {
        const cursor = document.getElementById('cursor');
        if (e) {
            const rect = this.canvas.getBoundingClientRect();
            cursor.style.left = (e.clientX - this.currentSize/2) + 'px';
            cursor.style.top = (e.clientY - this.currentSize/2) + 'px';
            cursor.style.width = this.currentSize + 'px';
            cursor.style.height = this.currentSize + 'px';
            cursor.style.display = 'block';
        }
    }

    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                         e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    saveState() {
        this.historyStep++;
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        this.history.push(this.canvas.toDataURL());
        
        if (this.history.length > this.maxHistorySteps) {
            this.history.shift();
            this.historyStep--;
        }
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState(this.history[this.historyStep]);
        }
    }

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState(this.history[this.historyStep]);
        }
    }

    restoreState(dataUrl) {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
    }

    clearCanvas() {
        if (confirm('キャンバスをクリアしますか？')) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.saveState();
        }
    }

    uploadImage(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                    this.saveState();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    downloadImage() {
        const link = document.createElement('a');
        link.download = 'paint-' + new Date().getTime() + '.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    const paintSystem = new PaintSystem();
    
    // ステータス更新
    const updateStatus = () => {
        document.getElementById('canvasSize').textContent = 
            `${paintSystem.canvas.offsetWidth} × ${paintSystem.canvas.offsetHeight}`;
    };
    
    // マウス位置更新
    paintSystem.canvas.addEventListener('mousemove', (e) => {
        const rect = paintSystem.canvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        document.getElementById('mousePos').textContent = `${x}, ${y}`;
    });
    
    updateStatus();
    window.addEventListener('resize', updateStatus);
});