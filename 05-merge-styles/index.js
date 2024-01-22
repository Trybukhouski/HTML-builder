const path = require('path');
const fs = require('fs');
const fsPromices = require('fs').promises;

async function mergeStyles() {
  fs.writeFile(
    path.join(__dirname, 'project-dist', 'bundle.css'),
    '',
    (err) => {
      if (err) {
        throw new err();
      }
    },
  );

  const files = await fsPromices.readdir(path.join(__dirname, 'styles'), {
    withFileTypes: true,
  });

  const writeStream = new fs.WriteStream(
    path.join(__dirname, 'project-dist', 'bundle.css'),
  );

  files.forEach((file) => {
    const filePath = path.join(file.path, file.name);

    if (file.isFile() && path.extname(filePath).slice(1) === 'css') {
      const readStream = new fs.ReadStream(filePath, {
        encoding: 'utf-8',
      });

      readStream.on('readable', () => {
        let data = readStream.read();
        if (data !== null) {
          writeStream.write(data);
        }
      });
    }
  });
}

mergeStyles();
