
const path = require('path');
const { mkdir, rmdir, readdir, unlink, access } = require('fs/promises');
const constants = require('fs');
const { createReadStream, createWriteStream } = require('fs');
const { pipeline } = require('stream/promises');

const src = path.join(__dirname, 'files');
const destination = path.join(__dirname, 'files-copy');

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
        const pathToSrc = path.join(path1, file.name);
        const pathToDestination = path.join(path2, file.name);
        const rs = createReadStream(pathToSrc);
        const ws = createWriteStream(pathToDestination);
        await pipeline(rs, ws);
      }
    }
  } catch (err) {
    console.log(err);
  }
}
(async function () {
  try {
    await access(destination, constants.R_OK | constants.W_OK)
    await clearDir(destination);
    console.log('Old folder deleted!');
  } catch {
    console.log('Folder does not exist');
  } finally {
    await copyDir(src, destination);
    console.log('New folder created!');
  }
}
)();