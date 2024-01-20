const path = require('path');
const fs = require('fs');

const stream = new fs.ReadStream(path.join(__dirname, 'text.txt'), {
  encoding: 'utf-8',
});
stream.on('readable', () => console.log(stream.read()));
