
const path = require('path');
const { mkdir, rmdir, readdir, copyFile, unlink, access } = require('fs/promises');
const constants = require('fs');

async function clearDir(path1) {  
  try {
    const files = await readdir(path1, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile()) {
        await unlink(path.join(path1, file.name));
      } else {
        await clearDir(path.join(path1, file.name));
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
      } else {
        await copyFile(path.join(path1, file.name), path.join(path2, file.name));
      }
    }
  } catch (err) {
    console.log(err);
  }
}
(async function () {
  try {
    await access(path.join(__dirname, 'files-copy'), constants.R_OK | constants.W_OK)
    await clearDir(path.join(__dirname, 'files-copy'));
    console.log('Old folder deleted!');
  } catch {
    console.log('Folder does not exist');
  } finally {
    await copyDir(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));
    console.log('New folder created!');
  }
}
)();