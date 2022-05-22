const fs = require('fs');
const path = require('path');

const output = fs.createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'));

const arr = [];

fs.readdir(path.join(__dirname, 'styles'), async (err, files) => {
  if (err) console.log(err);
  for (const file of files) {
    const src = path.join(__dirname, 'styles', file);
    const extname = path.extname(src);
    let data = '';
    if (extname === '.css') {
      const stream = fs.createReadStream(src, 'utf-8');
      stream.on('data', chunk => {
        data += chunk;
      });
      stream.on('end', () => arr.push(data));
      stream.on('error', (err) => console.log(err));
    }
  }
});
process.on('exit', () => {
  output.write(arr.join('\n'));
  output.on('error', (err) => console.log(err));
});