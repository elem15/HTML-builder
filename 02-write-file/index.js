const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const rl = readline.createInterface({ input, output });

const outputStream = fs.createWriteStream(path.join(__dirname, 'text.txt'));

outputStream.write('');
output.write('Введите текст:\n');

rl.on('line', (chunk) => {
  if(String(chunk).trim() === 'exit') {
    rl.close();
    return;
  } 
  outputStream.write(chunk + '\n');
});

process.on('exit', () => {  
  outputStream.on('error', (err) => console.error('Error:', err));
  output.write('Спасибо за информацию.');
});