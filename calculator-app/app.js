import fs from 'fs';
import readline from 'readline';
import http from 'http';
import { calculate } from './src/calculate.js';

let history = [];

function logCalculation(operation, result) {
  console.log(`Operation: ${operation}, Result: ${result}`);
  history.push({ operation, result, timestamp: new Date().toISOString() });
}

function saveHistory() {
  fs.writeFileSync('calculator_results.json', JSON.stringify(history, null, 2));
  console.log('History saved to calculator_results.json');
}

function runCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Calculator CLI - Enter calculations or commands (save/exit)');
  
  rl.on('line', (input) => {
    const trimmed = input.trim().toLowerCase();
    
    if (trimmed === 'exit') {
      rl.close();
      process.exit(0);
    } else if (trimmed === 'save') {
      saveHistory();
    } else {
      const result = calculate(input);
      logCalculation(input, result);
    }
  });
}

function runBatch(args) {
  args.forEach(expression => {
    const result = calculate(expression);
    logCalculation(expression, result);
  });
}

function runServer(port = 8080) {
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url.startsWith('/calculate')) {
      const url = new URL(req.url, `http://localhost:${port}`);
      const operation = url.searchParams.get('op');
      
      if (operation) {
        const result = calculate(decodeURIComponent(operation));
        logCalculation(operation, result);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ operation, result }));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing operation parameter' }));
      }
    } else if (req.method === 'POST' && req.url === '/save') {
      saveHistory();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'History saved', count: history.length }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(port, () => {
    console.log(`Calculator HTTP server running on port ${port}`);
  });
}

const args = process.argv.slice(2);

if (args.includes('--server')) {
  const portIndex = args.indexOf('--port');
  const port = portIndex !== -1 && args[portIndex + 1] ? parseInt(args[portIndex + 1]) : 8080;
  runServer(port);
} else if (args.length > 0) {
  runBatch(args);
} else {
  runCLI();
}