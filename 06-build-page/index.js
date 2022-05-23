const fs = require('fs');
const path = require('path');
const { mkdir, rmdir, readdir, copyFile, unlink } = require('fs/promises');

const input = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8');

async function buildAssets() {
  async function clearDir(err, path1) {
    if (err) return;
    try {
      const files = await readdir(path1, { withFileTypes: true });
      for (const file of files) {
        if (file.isFile()) {
          await unlink(path.join(path1, file.name));
        } else {
          await clearDir(null, path.join(path1, file.name));
        }
      }
      await rmdir(path.join(path1));
    } catch (err) {
      console.log(err);
    }
  }
  async function copyDir(path1, path2) {
    try {
      const files = await readdir(path1, { withFileTypes: true });
      await mkdir(path2, { recursive: true });
      for (const file of files) {
        if (file.isDirectory()) {
          await copyDir(path.join(path1, file.name), path.join(path2, file.name));
        } else if (file.isFile()) {
          await copyFile(path.join(path1, file.name), path.join(path2, file.name));
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  fs.access(path.join(__dirname, 'project-dist', 'assets'), fs.F_OK, async (err) => {
    await clearDir(err, path.join(__dirname, 'project-dist', 'assets'));
    await copyDir(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'));
  });
}

async function buildCss() {
  const output = fs.createWriteStream(path.join(__dirname, 'project-dist', 'style.css'));
  fs.readdir(path.join(__dirname, 'styles'), async (err, files) => {
    if (err) console.log(err);
    for (const file of files) {
      const src = path.join(__dirname, 'styles', file);
      const extname = path.extname(src);
      if (extname === '.css') {
        const stream = fs.createReadStream(src, 'utf-8');
        stream.on('data', chunk => {
          output.write(chunk + '\n\n');
        });
      }
    }
  });
}

let data = '';
const sources = {};
const arr = [];
async function buildHtml() {
  input.on('data', async (chunk) => {
    data += chunk;
    let html = '';
    let sourceName = '';
    let state = 'writeTemplate';
    for (let i = 0; i < data.length; i++) {
      if (data[i] === '{' && data[i + 1] === '{') {
        state = 'writeSource';
        arr.push(html);
        html = '';
        sourceName += data[i];
      } else if (data[i] !== '{' && data[i] !== '}' && state === 'writeSource') {
        sourceName += data[i];
      } else if (data[i] === '}' && data[i - 1] === '}') {
        sourceName += data[i];
        state = 'writeTemplate';
        arr.push(sourceName);
        sourceName = '';
      } else if (state === 'writeTemplate') {
        html += data[i];
      }
    }
  });
  input.on('error', (err) => console.error('Error:', err));
  fs.readdir(path.join(__dirname, 'components'), async (err, files) => {
    if (err) console.log(err);
    for (const file of files) {
      let data = '';
      if (path.extname(file) === '.html') {
        const inputSource = fs.createReadStream(path.join(__dirname, 'components', file), 'utf-8');
        inputSource.on('data', (chunk) => {
          data += chunk;
        });
        inputSource.on('end', () => {
          sources[path.basename(file, path.extname(file))] = data.trim();
        });
        inputSource.on('error', (err) => console.log(err));
      }
    }
  });
}

async function combine() {
  await mkdir(path.join(__dirname, 'project-dist'), { recursive: true });
  await buildAssets();
  await buildCss();
  return await buildHtml();
}
combine();

const output = fs.createWriteStream(path.join(__dirname, 'project-dist', 'index.html'));
process.on('exit', async () => {
  Object.keys(sources).map(key => {
    const idx = arr.indexOf(`{${key}}`);
    arr[idx] = sources[key];
  });
  output.write(arr.join(''));
  output.on('error', (err) => console.log(err));
});