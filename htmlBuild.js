async function completeHtml() {
  await fsPromises.copyFile(htmlFilePath, htmlFileCopyPath);
  let htmlFileContent = await fsPromises.readFile(htmlFileCopyPath, charset);
  const writableStream = fs.createWriteStream(htmlFileCopyPath);
  const files = await fsPromises.readdir(componentsFolderPath, { withFileTypes: true });
  for (const file of files) {
    const sourceFilePath = path.join(componentsFolderPath, file.name);
    const sourceFileExtension = path.extname(sourceFilePath);
    if (file.isFile() && sourceFileExtension === '.html') {
      const sourceFileName = path.parse(sourceFilePath).name;
      const htmlFileComponentContent = await fsPromises.readFile(sourceFilePath, charset);
      const substitude = `{{${sourceFileName}}}`;
      htmlFileContent = htmlFileContent.replace(substitude, htmlFileComponentContent);
    }
  }
  writableStream.write(htmlFileContent);
}