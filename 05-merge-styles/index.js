const { readdir } = require('fs/promises');
const { createWriteStream, createReadStream } = require('fs');
const path = require('path');

const output = createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'));

const arr = [];

const buildArr = async () => {
  const files = await readdir(path.join(__dirname, 'styles'));

  files.forEach(async file =>  {
    const src = path.join(__dirname, 'styles', file);
    const extname = path.extname(src);
    let data = '';
    if (extname === '.css') {
      const stream = createReadStream(src, 'utf-8');
      stream.on('data', chunk => {
        data += chunk;
      });
      stream.on('end', async () => {
        arr.push(data);

      });
      stream.on('error', (err) => console.log(err));
    }
  });
  return arr;
};

buildArr(); 

process.on('exit', async () => {
  output.write(arr.join('\n'));
  output.on('error', (err) => console.log(err));
});