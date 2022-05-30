const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

const stream = fs.createReadStream(path.join(__dirname, 'text.txt'), 'utf-8');

stream.pipe(process.stdout);
