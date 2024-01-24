const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');

class BuildPage {
  createDistFolder() {
    fs.mkdir(
      path.join(__dirname, 'project-dist'),
      { recursive: true },
      (err) => {
        if (err) {
          throw err;
        }
      },
    );
  }

  async addTemplate() {
    async function createTemplate() {
      let template = '';
      const result = await fsPromise.readFile(
        path.join(__dirname, 'template.html'),
        'utf-8',
        (data) => {
          template += data;
          return template;
        },
      );

      return result;
    }

    async function readComponents() {
      const components = [];
      const result = await fsPromise
        .readdir(path.join(__dirname, 'components'), { withFileTypes: true })
        .then((files) => {
          for (let file of files) {
            components.push(readFile(file));
          }
          return components;
        });

      return result;
    }

    async function readFile(file) {
      const element = await fsPromise
        .readFile(path.join(file.path, file.name), 'utf-8')
        .then((data) => {
          let name = `{{${file.name.split('.')[0]}}}`;
          return [name, data];
        });
      return element;
    }
    async function updateTemplate() {
      let template = await createTemplate();
      const components = await readComponents();

      for (let i = 0; i < components.length; i++) {
        components[i]
          .then((data) => {
            template = template.replaceAll(data[0], data[1]);
            return template;
          })
          .then((template) => {
            if (i === components.length - 1) {
              fs.writeFile(
                path.join(__dirname, 'project-dist', 'index.html'),
                template,
                () => {},
              );
            }
          });
      }
    }

    await updateTemplate();
  }

  async mergeStyles() {
    fs.writeFile(
      path.join(__dirname, 'project-dist', 'style.css'),
      '',
      () => {},
    );

    const files = await fsPromise.readdir(path.join(__dirname, 'styles'), {
      withFileTypes: true,
    });

    const writeStream = new fs.WriteStream(
      path.join(__dirname, 'project-dist', 'style.css'),
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

  async addAssets(currentPath) {
    const assets = await fsPromise.readdir(path.join(__dirname, currentPath), {
      withFileTypes: true,
    });

    for (let asset of assets) {
      const pathArr = asset.path.split(path.sep);
      const rootIndex = pathArr.indexOf('assets');
      const shortPath = pathArr.slice(rootIndex).join(path.sep);

      if (asset.isDirectory()) {
        await fsPromise
          .mkdir(path.join(__dirname, 'project-dist', shortPath, asset.name), {
            recursive: true,
          })
          .then(() => {
            this.addAssets(path.join(shortPath, asset.name));
          });
      } else if (asset.isFile()) {
        fs.copyFile(
          path.join(__dirname, shortPath, asset.name),
          path.join(__dirname, 'project-dist', shortPath, asset.name),
          (err) => {
            if (err) {
              throw err;
            }
          },
        );
      }
    }
  }

  async start() {
    await this.createDistFolder();
    await this.addTemplate();
    await this.mergeStyles();
    await this.addAssets('assets');
  }
}

const buildPage = new BuildPage();

buildPage.start();
