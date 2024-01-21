const path = require('path');
const fs = require('fs').promises;

async function copyDir() {
  await fs.rm(path.join(__dirname, 'files-copy'), {
    recursive: true,
    force: true,
  });
  await fs.mkdir(path.join(__dirname, 'files-copy'));

  const files = await fs.readdir(path.join(__dirname, 'files'), {
    withFileTypes: true,
  });

  for (let file of files) {
    const root = path.join(__dirname, 'files', `${file.name}`);
    const destination = path.join(__dirname, 'files-copy', `${file.name}`);
    await fs.copyFile(root, destination);
  }
}

copyDir();
