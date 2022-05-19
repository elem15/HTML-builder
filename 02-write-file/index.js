const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const rl = readline.createInterface({ input, output });

const outputStream = fs.createWriteStream(path.join(__dirname, 'text.txt'));

outputStream.write('');

let content = '';

rl.question('Введите текст:\n', (answer) => {
  if(answer === 'exit') {
    rl.close();
    return;
  }  
  content += answer;
  rl.on('line', (chunk) => {
    if(chunk === 'exit') {
      rl.close();
      return;
    } 
    content += chunk;
  });
});

process.on('exit', () => {
  outputStream.write(content);
  output.write('Спасибо за информацию.');
});