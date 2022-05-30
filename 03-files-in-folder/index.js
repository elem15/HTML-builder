const { readdir, stat } = require('fs/promises');
const path = require('path');

async function readFiles() {
  try {
    const files = await readdir(path.join(__dirname, 'secret-folder'), { withFileTypes: true });
    for (const file of files) {
      if (file.isFile()) {
        const stats = await stat(path.join(__dirname, 'secret-folder', file.name));
        const name = path.basename(file.name, path.extname(file.name));
        const extname = path.extname(file.name).substring(1);
        const size = (stats.size / 1024).toFixed(3) + 'k';
        process.stdout.write(name + ' - ' + extname + ' - ' + size + '\n');
      }
    }
  } catch (err) {
    console.error(err);
  }
}
readFiles();