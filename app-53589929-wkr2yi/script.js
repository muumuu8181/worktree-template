class AIBattleArena {
    constructor() {
        this.bots = [
            {
                id: 'scientist',
                name: 'Dr. Logic',
                type: '科学者',
                avatar: '🔬',
                personality: 'analytical',
                score: 0,
                messages: [],
                color: '#3498db',
                responsePatterns: [
                    '統計的に分析すると、',
                    '科学的根拠に基づいて、',
                    'データから判断すれば、',
                    '論理的に考察すると、',
                    '研究結果によると、'
                ]
            },
            {
                id: 'poet',
                name: 'Verse',
                type: '詩人',
                avatar: '🎭',
                personality: 'creative',
                score: 0,
                messages: [],
                color: '#e74c3c',
                responsePatterns: [
                    '心の奥底から語れば、',
                    '詩的な視点で見ると、',
                    '美しい言葉で表現すれば、',
                    '感性に訴えかけるように、',
                    '芸術的観点から述べると、'
                ]
            },
            {
                id: 'warrior',
                name: 'Blade',
                type: '戦士',
                avatar: '⚔️',
                personality: 'aggressive',
                score: 0,
                messages: [],
                color: '#e67e22',
                responsePatterns: [
                    '戦略的に攻めるなら、',
                    '勝負の世界では、',
                    '戦士の視点から言えば、',
                    '決断力を持って行動すれば、',
                    '勇敢に立ち向かうと、'
                ]
            },
            {
                id: 'philosopher',
                name: 'Wisdom',
                type: '哲学者',
                avatar: '🤔',
                personality: 'philosophical',
                score: 0,
                messages: [],
                color: '#9b59b6',
                responsePatterns: [
                    '存在論的に考察すると、',
                    '哲学的観点では、',
                    '深く思索すれば、',
                    '本質を追求すると、',
                    '真理を求めて考えれば、'
                ]
            },
            {
                id: 'comedian',
                name: 'Joker',
                type: 'コメディアン',
                avatar: '😄',
                personality: 'humorous',
                score: 0,
                messages: [],
                color: '#f1c40f',
                responsePatterns: [
                    'ちょっと面白い話だけど、',
                    'ユーモアを交えて言うと、',
                    'ジョークのように聞こえるかもしれないが、',
                    '笑いながら考えてみると、',
                    'コメディアンの視点では、'
                ]
            }
        ];
        
        this.topics = [
            '人工知能の未来',
            '宇宙探査の意義',
            '愛とは何か',
            '完璧な社会の条件',
            '時間の本質',
            '芸術の価値',
            '幸福の定義',
            '自由意志の存在',
            '科学と宗教',
            '未来の教育'
        ];
        
        this.currentTopic = this.topics[0];
        this.battleState = 'waiting'; // waiting, active, paused, finished
        this.battleTime = 180; // 3分
        this.currentRound = 1;
        this.timer = null;
        this.messageTimer = null;
        this.userPrediction = null;
        
        this.init();
    }
    
    init() {
        this.setupArena();
        this.updateDisplay();
        this.addLogEntry('🎮 AIバトルアリーナが初期化されました', 'highlight');
    }
    
    setupArena() {
        this.createScoreBoard();
        this.createChatArena();
        this.createPredictionButtons();
    }
    
    createScoreBoard() {
        const scoreBoard = document.getElementById('scoreBoard');
        scoreBoard.innerHTML = '';
        
        this.bots.forEach(bot => {
            const scoreCard = document.createElement('div');
            scoreCard.className = 'bot-score';
            scoreCard.id = `score-${bot.id}`;
            scoreCard.innerHTML = `
                <div style="font-size: 1.2rem;">${bot.avatar} ${bot.name}</div>
                <div style="font-size: 0.9rem; opacity: 0.7;">${bot.type}</div>
                <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">
                    <span id="score-value-${bot.id}">${bot.score}</span>点
                </div>
            `;
            scoreBoard.appendChild(scoreCard);
        });
    }
    
    createChatArena() {
        const chatArena = document.getElementById('chatArena');
        chatArena.innerHTML = '';
        
        this.bots.forEach(bot => {
            const chatBot = document.createElement('div');
            chatBot.className = `chatbot ${bot.id}`;
            chatBot.innerHTML = `
                <div class="bot-header">
                    <div class="bot-avatar" style="background: ${bot.color};">
                        ${bot.avatar}
                    </div>
                    <div>
                        <div class="bot-name">${bot.name}</div>
                        <div class="bot-type">${bot.type}</div>
                    </div>
                </div>
                <div class="chat-messages" id="messages-${bot.id}">
                    <div class="message">準備完了！トピックについて議論する準備ができています。</div>
                </div>
            `;
            chatArena.appendChild(chatBot);
        });
    }
    
    createPredictionButtons() {
        const predictionButtons = document.getElementById('predictionButtons');
        predictionButtons.innerHTML = '';
        
        this.bots.forEach(bot => {
            const button = document.createElement('button');
            button.className = 'predict-btn';
            button.innerHTML = `${bot.avatar} ${bot.name}`;
            button.onclick = () => this.makePrediction(bot.id);
            predictionButtons.appendChild(button);
        });
    }
    
    makePrediction(botId) {
        this.userPrediction = botId;
        document.querySelectorAll('.predict-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
        this.addLogEntry(`🎯 ${this.getBotById(botId).name} に賭けました！`, 'highlight');
    }
    
    getBotById(id) {
        return this.bots.find(bot => bot.id === id);
    }
    
    startBattle() {
        if (this.battleState === 'active') return;
        
        this.battleState = 'active';
        this.battleTime = 180;
        document.getElementById('battleState').textContent = '対戦中';
        
        this.addLogEntry(`⚔️ ラウンド ${this.currentRound} 開始！`, 'highlight');
        this.addLogEntry(`💭 テーマ: ${this.currentTopic}`, 'highlight');
        
        this.startTimer();
        this.startMessages();
    }
    
    pauseBattle() {
        if (this.battleState === 'active') {
            this.battleState = 'paused';
            document.getElementById('battleState').textContent = '一時停止';
            this.stopTimers();
            this.addLogEntry('⏸️ バトルが一時停止されました');
        } else if (this.battleState === 'paused') {
            this.battleState = 'active';
            document.getElementById('battleState').textContent = '対戦中';
            this.startTimer();
            this.startMessages();
            this.addLogEntry('▶️ バトルが再開されました');
        }
    }
    
    resetBattle() {
        this.battleState = 'waiting';
        this.battleTime = 180;
        this.currentRound = 1;
        this.userPrediction = null;
        
        this.bots.forEach(bot => {
            bot.score = 0;
            bot.messages = [];
        });
        
        this.stopTimers();
        this.setupArena();
        this.updateDisplay();
        
        document.getElementById('battleState').textContent = '準備中';
        document.querySelectorAll('.predict-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        this.addLogEntry('🔄 バトルがリセットされました', 'highlight');
    }
    
    changeTopic() {
        const randomTopic = this.topics[Math.floor(Math.random() * this.topics.length)];
        this.currentTopic = randomTopic;
        document.getElementById('battleTopic').textContent = `テーマ: ${this.currentTopic}`;
        this.addLogEntry(`💭 新しいテーマ: ${this.currentTopic}`, 'highlight');
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.battleTime--;
            this.updateDisplay();
            
            if (this.battleTime <= 0) {
                this.endBattle();
            }
        }, 1000);
    }
    
    startMessages() {
        const messageInterval = 3000 + Math.random() * 4000; // 3-7秒間隔
        
        this.messageTimer = setInterval(() => {
            if (this.battleState === 'active') {
                this.generateRandomMessage();
            }
        }, messageInterval);
        
        // 最初のメッセージを即座に送信
        setTimeout(() => {
            if (this.battleState === 'active') {
                this.generateRandomMessage();
            }
        }, 1000);
    }
    
    generateRandomMessage() {
        const activeBots = this.bots.filter(bot => bot.messages.length < 10);
        if (activeBots.length === 0) return;
        
        const randomBot = activeBots[Math.floor(Math.random() * activeBots.length)];
        const message = this.generateBotMessage(randomBot);
        
        randomBot.messages.push(message);
        this.displayMessage(randomBot.id, message);
        this.updateScore(randomBot);
    }
    
    generateBotMessage(bot) {
        const patterns = bot.responsePatterns;
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        const responses = this.getTopicResponses(bot.personality);
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        return pattern + response;
    }
    
    getTopicResponses(personality) {
        const responses = {
            analytical: [
                '統計データを基に分析すると、この問題には複数の解決策が存在します。',
                'エビデンスベースのアプローチが最も効果的だと考えられます。',
                '実証研究の結果を見ると、興味深いパターンが浮かび上がります。',
                'メタ分析による検証が必要ですが、有望な仮説が立てられます。',
                '因果関係を慎重に検討すると、予想以上に複雑な構造が見えてきます。'
            ],
            creative: [
                '詩のような美しさでこの世界を見つめると、新しい真実が見えてきます。',
                'インスピレーションが語りかけるのは、感情の奥に隠された智慧です。',
                '芸術的な視点で捉えると、論理を超えた深い意味が浮かび上がります。',
                '想像力の翼を広げれば、無限の可能性が目の前に広がります。',
                '創造性こそが、人間の本質を最も美しく表現する手段だと信じています。'
            ],
            aggressive: [
                '勝負の世界では迷いは禁物！即座に行動を起こすべきです。',
                '戦略的思考と果敢な実行力があれば、どんな困難も乗り越えられます。',
                '競争に勝つためには、常に一歩先を読む必要があります。',
                'チャレンジ精神こそが成功への唯一の道筋です。',
                '困難な状況こそ、真の実力が試される絶好の機会です。'
            ],
            philosophical: [
                '存在の本質について深く考察すると、根本的な疑問が浮かんできます。',
                '真理を求める探求において、我々は何を見失ってしまったのでしょうか。',
                '哲学的思考は、表面的な答えを超えて本質に迫る力を持っています。',
                '人間の理性と感情の関係性について、さらなる洞察が必要です。',
                '普遍的な価値とは何か、という問いに我々は答えを見つけられるのでしょうか。'
            ],
            humorous: [
                'これってまるでコメディ映画のワンシーンみたいですね（笑）',
                'ジョークみたいに聞こえるかもしれませんが、実は深い真実が隠されています。',
                'ユーモアのセンスがあれば、どんな困難も笑い飛ばせますよ！',
                '人生は最高のコメディ番組だと思いませんか？',
                '笑いこそが人類の最高の発明だと、コメディアンの私は確信しています。'
            ]
        };
        
        return responses[personality] || responses.analytical;
    }
    
    displayMessage(botId, message) {
        const messagesContainer = document.getElementById(`messages-${botId}`);
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    updateScore(bot) {
        // スコア計算ロジック
        const baseScore = 10;
        const creativityBonus = Math.floor(Math.random() * 15);
        const lengthBonus = Math.min(Math.floor(bot.messages[bot.messages.length - 1].length / 20), 5);
        
        const scoreGain = baseScore + creativityBonus + lengthBonus;
        bot.score += scoreGain;
        
        document.getElementById(`score-value-${bot.id}`).textContent = bot.score;
        
        this.updateLeaderBoard();
        this.addLogEntry(`${bot.avatar} ${bot.name} が ${scoreGain} ポイント獲得！`);
    }
    
    updateLeaderBoard() {
        const sortedBots = [...this.bots].sort((a, b) => b.score - a.score);
        
        document.querySelectorAll('.bot-score').forEach(card => {
            card.classList.remove('leading');
        });
        
        if (sortedBots.length > 0) {
            document.getElementById(`score-${sortedBots[0].id}`).classList.add('leading');
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.battleTime / 60);
        const seconds = this.battleTime % 60;
        document.getElementById('battleTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('battleRound').textContent = `ラウンド ${this.currentRound}`;
        document.getElementById('battleTopic').textContent = `テーマ: ${this.currentTopic}`;
    }
    
    stopTimers() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.messageTimer) {
            clearInterval(this.messageTimer);
            this.messageTimer = null;
        }
    }
    
    endBattle() {
        this.battleState = 'finished';
        this.stopTimers();
        
        const winner = this.bots.reduce((prev, current) => 
            prev.score > current.score ? prev : current
        );
        
        document.getElementById('battleState').textContent = '終了';
        
        this.addLogEntry('🏁 バトル終了！', 'highlight');
        this.addLogEntry(`🏆 勝者: ${winner.name} (${winner.score}点)`, 'highlight');
        
        if (this.userPrediction === winner.id) {
            this.addLogEntry('🎉 予想的中！おめでとうございます！', 'highlight');
        } else {
            this.addLogEntry('😅 予想は外れましたが、次回頑張りましょう！');
        }
        
        this.showWinnerCelebration(winner);
    }
    
    showWinnerCelebration(winner) {
        const celebration = document.getElementById('winnerCelebration');
        const winnerText = document.getElementById('winnerText');
        const winnerStats = document.getElementById('winnerStats');
        
        winnerText.textContent = `🏆 勝者: ${winner.avatar} ${winner.name}`;
        winnerStats.textContent = `${winner.score}点で圧倒的勝利！`;
        
        celebration.style.display = 'flex';
        
        // 紙吹雪エフェクト
        this.createConfetti();
    }
    
    createConfetti() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#f1c40f'][Math.floor(Math.random() * 5)];
                confetti.style.animationDelay = Math.random() * 3 + 's';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 100);
        }
    }
    
    closeWinnerModal() {
        document.getElementById('winnerCelebration').style.display = 'none';
        this.currentRound++;
        this.resetBattle();
    }
    
    addLogEntry(message, className = '') {
        const battleLog = document.getElementById('battleLog');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${className}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        battleLog.appendChild(logEntry);
        battleLog.scrollTop = battleLog.scrollHeight;
        
        // ログエントリーの制限
        if (battleLog.children.length > 50) {
            battleLog.removeChild(battleLog.firstChild);
        }
    }
}

// グローバル関数
let arena;

function startBattle() {
    arena.startBattle();
}

function pauseBattle() {
    arena.pauseBattle();
}

function resetBattle() {
    arena.resetBattle();
}

function changeTopic() {
    arena.changeTopic();
}

function closeWinnerModal() {
    arena.closeWinnerModal();
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    arena = new AIBattleArena();
});