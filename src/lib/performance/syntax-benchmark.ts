import { tokenize } from '../syntax-highlighter';

// Mock data
const JS_SAMPLE = `
function helloWorld() {
  console.log("Hello, world!");
  const a = 10;
  const b = 20;
  return a + b;
}
`;

const PY_SAMPLE = `
def hello_world():
    print("Hello, world!")
    a = 10
    b = 20
    return a + b
`;

const BASH_SAMPLE = `
#!/bin/bash
echo "Hello, world!"
a=10
b=20
echo $((a + b))
`;

const LARGE_JS = JS_SAMPLE.repeat(1000); // 1000 * 6 lines = 6000 lines
const LARGE_PY = PY_SAMPLE.repeat(1000);
const LARGE_BASH = BASH_SAMPLE.repeat(1000);

function measure(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms`);
}

console.log('--- Benchmarking Syntax Highlighter ---');

measure('JS Tokenize (6000 lines)', () => {
  tokenize(LARGE_JS, 'javascript');
});

measure('Python Tokenize (6000 lines)', () => {
  tokenize(LARGE_PY, 'python');
});

measure('Bash Tokenize (6000 lines)', () => {
  tokenize(LARGE_BASH, 'bash');
});
