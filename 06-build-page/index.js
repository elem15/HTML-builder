const fs = require('fs');
const path = require('path');
const { mkdir, rmdir, readdir, copyFile, unlink } = require('fs/promises');

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
  const files = await readdir(path.join(__dirname, 'styles'));
  for await (const file of files) {
    const src = path.join(__dirname, 'styles', file);
    const extname = path.extname(src);
    if (extname === '.css') {
      const stream = fs.createReadStream(src, 'utf-8');
      let data = '';
      stream.on('data', chunk => {
        data += chunk;
      });
      stream.on('end', () => output.write(data + '\n\n'));
      stream.on('error', (err) => console.log('Style building error:', err));
    }
  }
}

const readStream = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8');
let htmlBuild = '';

async function buildHtml() {
  readStream.on('data', (chunk) => {
    htmlBuild = chunk;
  });
  readStream.on('end', async () => {
    const files = await readdir(path.join(__dirname, 'components'));
    for await (const file of files) {
      let data = '';
      const extname = path.extname(file);
      if (extname === '.html') {
        const inputSource = fs.createReadStream(path.join(__dirname, 'components', file), 'utf-8');
        inputSource.on('data', (chunk) => {
          data += chunk;
        });
        inputSource.on('end', () => {
          const name = path.basename(file, extname);
          htmlBuild = htmlBuild.replace(`{{${name}}}`, data);
          const output = fs.createWriteStream(path.join(__dirname, 'project-dist', 'index.html'));
          output.write(htmlBuild);
          output.on('error', (err) => console.log(err));
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
  await buildHtml();
}
combine();