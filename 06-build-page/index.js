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

  addTemplate() {
    let content = '';

    fs.readFile(path.join(__dirname, 'template.html'), 'utf-8', (err, data) => {
      if (err) throw err;
      content += data;

      fs.readdir(
        path.join(__dirname, 'components'),
        { withFileTypes: true },
        (err, files) => {
          if (err) throw err;

          for (let file of files) {
            fs.readFile(
              path.join(file.path, file.name),
              'utf-8',
              (err, data) => {
                if (err) throw err;

                let componentName = `{{${file.name.split('.')[0]}}}`;
                content = content.replaceAll(componentName, data);
                fs.writeFile(
                  path.join(__dirname, 'project-dist', 'index.html'),
                  content,
                  (err) => {
                    if(err) {
                      throw err;
                    }
                  },
                );
              },
            );
          }
        },
      );
      
    });
    
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
        console.log(asset.path);
        await fsPromise.mkdir(
          path.join(__dirname, 'project-dist', shortPath, asset.name),
          {
            recursive: true,
          },
        ).then(() => {
          this.addAssets(path.join(shortPath, asset.name))
        })
      } else if (asset.isFile()) {
        console.log(path.join(__dirname, 'project-dist', shortPath, asset.name))
        fs.copyFile(
          path.join(__dirname, shortPath, asset.name),
          path.join(__dirname, 'project-dist', shortPath, asset.name),
          (err) => {if(err) {
            throw err;
          }
        }
        );
      }
    }
  }

  start() {
    this.createDistFolder();
    this.addTemplate();
    this.mergeStyles();
    this.addAssets('assets');
  }
}

const buildPage = new BuildPage();

buildPage.start();
