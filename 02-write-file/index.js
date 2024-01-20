const path = require('path');
const { stdout, stdin } = process;
const fs = require('fs');

fs.writeFile(path.join(__dirname, 'text.txt'), '', (err) => {
  if (err) {
    throw err;
  }
});

stdout.write('Hello! Add smth to text.txt, please!\n');

stdin.on('data', (data) => {
  data = data.toString().trim();
  if (data === 'exit') {
    process.exit();
  } else {
    fs.appendFile(path.join(__dirname, 'text.txt'), `${data}\n`, (err) => {
      if (err) {
        throw err;
      }
    });
  }
});

process.on('exit', () => {
  stdout.write('Good luck!');
});

process.on('SIGINT', () => process.exit());
