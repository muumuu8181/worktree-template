class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForNewOperand = false;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.displayHistory();
        this.updateDisplay();
    }

    appendNumber(num) {
        if (this.waitingForNewOperand) {
            this.currentInput = num;
            this.waitingForNewOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        this.updateDisplay();
        this.addRippleEffect(event.target);
    }

    appendDecimal() {
        if (this.waitingForNewOperand) {
            this.currentInput = '0.';
            this.waitingForNewOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
        this.updateDisplay();
        this.addRippleEffect(event.target);
    }

    appendOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.operator);

            this.currentInput = `${parseFloat(newValue.toFixed(7))}`;
            this.previousInput = newValue;
        }

        this.waitingForNewOperand = true;
        this.operator = nextOperator;
        this.updateHistoryDisplay();
        this.addRippleEffect(event.target);
    }

    calculate() {
        const inputValue = parseFloat(this.currentInput);

        if (this.operator && this.previousInput !== '') {
            const currentValue = this.previousInput || 0;
            const calculation = `${currentValue} ${this.getOperatorSymbol(this.operator)} ${inputValue}`;
            const newValue = this.performCalculation(currentValue, inputValue, this.operator);
            
            this.addToHistory(calculation, newValue);
            this.currentInput = `${parseFloat(newValue.toFixed(7))}`;
            this.previousInput = '';
            this.operator = '';
            this.waitingForNewOperand = true;
            this.updateDisplay();
            this.clearHistoryDisplay();
        }
        this.addRippleEffect(event.target);
    }

    performCalculation(firstOperand, secondOperand, operator) {
        try {
            switch (operator) {
                case '+':
                    return firstOperand + secondOperand;
                case '-':
                    return firstOperand - secondOperand;
                case '*':
                    return firstOperand * secondOperand;
                case '/':
                    if (secondOperand === 0) {
                        throw new Error('ゼロで割ることはできません');
                    }
                    return firstOperand / secondOperand;
                default:
                    return secondOperand;
            }
        } catch (error) {
            this.showError(error.message);
            return 0;
        }
    }

    getOperatorSymbol(operator) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };
        return symbols[operator] || operator;
    }

    clearDisplay() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForNewOperand = false;
        this.updateDisplay();
        this.clearHistoryDisplay();
        this.addRippleEffect(event.target);
    }

    deleteLast() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
        this.addRippleEffect(event.target);
    }

    updateDisplay() {
        const resultElement = document.getElementById('result');
        resultElement.value = this.formatNumber(this.currentInput);
        
        // 数値が大きすぎる場合は科学記法で表示
        if (Math.abs(parseFloat(this.currentInput)) > 999999999) {
            resultElement.value = parseFloat(this.currentInput).toExponential(6);
        }
    }

    updateHistoryDisplay() {
        const historyElement = document.getElementById('history');
        if (this.operator && this.previousInput !== '') {
            historyElement.textContent = `${this.formatNumber(this.previousInput)} ${this.getOperatorSymbol(this.operator)}`;
        }
    }

    clearHistoryDisplay() {
        document.getElementById('history').textContent = '';
    }

    formatNumber(num) {
        const number = parseFloat(num);
        if (isNaN(number)) return '0';
        
        // 整数の場合は小数点以下を表示しない
        if (number % 1 === 0) {
            return number.toLocaleString('ja-JP');
        }
        
        // 小数の場合は適切にフォーマット
        return number.toLocaleString('ja-JP', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 7
        });
    }

    addToHistory(calculation, result) {
        const historyItem = {
            calculation: calculation,
            result: result,
            timestamp: new Date().toLocaleString('ja-JP')
        };
        
        this.history.unshift(historyItem);
        
        // 履歴は最大50件まで保持
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        this.displayHistory();
    }

    displayHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        this.history.forEach((item, index) => {
            const historyItemElement = document.createElement('div');
            historyItemElement.className = 'history-item';
            historyItemElement.onclick = () => this.useHistoryResult(item.result);
            
            historyItemElement.innerHTML = `
                <div>
                    <div class="calculation">${item.calculation}</div>
                    <div class="result-value">= ${this.formatNumber(item.result)}</div>
                </div>
            `;
            
            historyList.appendChild(historyItemElement);
        });
    }

    useHistoryResult(result) {
        this.currentInput = result.toString();
        this.waitingForNewOperand = true;
        this.updateDisplay();
        this.addVisualFeedback();
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('calculatorHistory');
        this.displayHistory();
        this.addRippleEffect(event.target);
    }

    showError(message) {
        const resultElement = document.getElementById('result');
        resultElement.value = message;
        resultElement.classList.add('error');
        
        setTimeout(() => {
            resultElement.classList.remove('error');
            this.clearDisplay();
        }, 2000);
    }

    addRippleEffect(element) {
        element.style.transform = 'scale(0.95)';
        element.style.background = 'rgba(255, 255, 255, 0.3)';
        
        setTimeout(() => {
            element.style.transform = '';
            element.style.background = '';
        }, 150);
    }

    addVisualFeedback() {
        const resultElement = document.getElementById('result');
        resultElement.style.color = '#4CAF50';
        resultElement.style.textShadow = '0 0 15px rgba(76, 175, 80, 0.7)';
        
        setTimeout(() => {
            resultElement.style.color = '';
            resultElement.style.textShadow = '';
        }, 500);
    }
}

// 電卓インスタンスを作成
const calculator = new Calculator();

// グローバル関数（HTMLから呼び出すため）
function appendNumber(num) {
    calculator.appendNumber(num);
}

function appendDecimal() {
    calculator.appendDecimal();
}

function appendOperator(operator) {
    calculator.appendOperator(operator);
}

function calculate() {
    calculator.calculate();
}

function clearDisplay() {
    calculator.clearDisplay();
}

function deleteLast() {
    calculator.deleteLast();
}

function clearHistory() {
    calculator.clearHistory();
}

// キーボードサポート
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // 数字
    if (key >= '0' && key <= '9') {
        calculator.appendNumber(key);
        highlightButton(key);
    }
    // 演算子
    else if (key === '+') {
        calculator.appendOperator('+');
        highlightButton('+');
    }
    else if (key === '-') {
        calculator.appendOperator('-');
        highlightButton('−');
    }
    else if (key === '*') {
        calculator.appendOperator('*');
        highlightButton('×');
    }
    else if (key === '/') {
        event.preventDefault(); // ブラウザの検索を防ぐ
        calculator.appendOperator('/');
        highlightButton('÷');
    }
    // その他
    else if (key === '.' || key === ',') {
        calculator.appendDecimal();
        highlightButton('.');
    }
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculator.calculate();
        highlightButton('=');
    }
    else if (key === 'Escape' || key === 'c' || key === 'C') {
        calculator.clearDisplay();
        highlightButton('AC');
    }
    else if (key === 'Backspace') {
        calculator.deleteLast();
        highlightButton('⌫');
    }
});

function highlightButton(buttonText) {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        if (button.textContent === buttonText) {
            button.style.background = 'rgba(255, 255, 255, 0.4)';
            button.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                button.style.background = '';
                button.style.transform = '';
            }, 150);
        }
    });
}

// ページロード時のアニメーション
window.addEventListener('load', function() {
    const calculator = document.querySelector('.calculator');
    calculator.style.opacity = '0';
    calculator.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
        calculator.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        calculator.style.opacity = '1';
        calculator.style.transform = 'translateY(0)';
    }, 100);
    
    // ボタンの順次表示アニメーション
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            button.style.transition = 'all 0.3s ease';
            button.style.opacity = '1';
            button.style.transform = 'scale(1)';
        }, 200 + index * 50);
    });
});

// サービスワーカー登録（オフライン対応）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}