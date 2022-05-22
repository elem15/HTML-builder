const fs = require('fs');
const path = require('path');
const { mkdir, rmdir, readdir, copyFile, unlink } = require('fs/promises');

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
    await mkdir(path2, {recursive: true});
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

fs.access(path.join(__dirname, 'files-copy'), fs.F_OK, async (err) => {
  await clearDir(err, path.join(__dirname, 'files-copy'));
  await copyDir(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));
});
