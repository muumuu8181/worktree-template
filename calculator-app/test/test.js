import assert from 'assert';
import { calculate } from '../src/calculate.js';

const tests = [
  { input: "1 + 5", expected: 6, description: "基本加算" },
  { input: "100 / 4", expected: 25, description: "基本除算" },
  { input: "10 * 2", expected: 20, description: "基本乗算" },
  { input: "5 - 3", expected: 2, description: "基本減算" },
  { input: "10 / 0", expected: "Error: Division by zero", description: "ゼロ除算" },
  { input: "abc + 1", expected: "Invalid input", description: "無効数字" },
  { input: "1 ^ 2", expected: "Invalid operator", description: "無効演算子" },
  { input: "1 + ", expected: "Invalid format", description: "引数不足" },
  { input: "0 - 0", expected: 0, description: "エッジケース" },
  { input: "999999999999 + 1", expected: 1000000000000, description: "大数値" }
];

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  const result = calculate(test.input);
  try {
    assert.strictEqual(result, test.expected);
    console.log(`✓ Test ${index + 1} passed: ${test.description}`);
    passed++;
  } catch (error) {
    console.log(`✗ Test ${index + 1} failed: ${test.description}`);
    console.log(`  Input: "${test.input}"`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Actual: ${result}`);
    failed++;
  }
});

const total = passed + failed;
const passRate = ((passed / total) * 100).toFixed(1);

console.log('\n' + '='.repeat(50));
console.log(`Total: ${total} tests`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Pass Rate: ${passRate}%`);