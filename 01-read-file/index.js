const path = require('path');
const fs = require('fs');

const stream = fs.createReadStream(path.join(__dirname, 'text.txt'), (err) => {
  if (err) {
    throw err;
  }
});

stream.on('data', (chunk) => {
  console.log(chunk.toString());
});
