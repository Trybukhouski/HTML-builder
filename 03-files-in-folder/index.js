const path = require('path');
const fs = require('fs').promises;
const dir = path.join(__dirname, '/secret-folder');

(async () => {
  const files = await fs.readdir(dir, {
    withFileTypes: true,
  });
  for (let file of files)
    if (file.isFile()) {
      const name = file.name.split('.')[0];
      const ext = path.extname(path.join(dir, `${file.name}`)).slice(1);
      const size = await fs
        .stat(path.join(dir, `${file.name}`))
        .then((stat) => `${stat.size / 1024}kb`);
      console.log(`${name} - ${ext} - ${size}`);
    }
})().catch((err) => {
  if (err) {
    throw err;
  }
});
