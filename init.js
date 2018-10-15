const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const rootPath = process.cwd();
const currentPath = path.resolve(__dirname, '../');
const baseConfigPath = path.resolve(currentPath, './config');

const tempPackage = './package-temp.json';

const packageJson = require(path.resolve(rootPath, './package.json'));
const basePackageJson = require(path.resolve(baseConfigPath, './package.json'));

log(packageJson);
log(basePackageJson);

function mergePackage(a, b) {
    if (a['initVersion'] !== b['initVersion']) {
        console.error('基础配置已经升级，请仔细比对项目升级前后的差异');
    }

    Object.keys(b).forEach((key) => {
        if (key !== 'dbvVersion') {
            Object.keys(b[key]).forEach((k) => {
                a[key][k] = b[key][k];
            });
        }
    });

    a['dbvVersion'] = b['dbvVersion'];
    return a;
}

const newPackageJson = mergePackage(packageJson, basePackageJson);

log(newPackageJson);

function execAsync(src) {
    return new Promise((resolve, reject) => {
        const process = childProcess.exec(src, function(error) {
            if (error) {
                reject();
            } else {
                resolve();
            }
        });
        process.stdout.on('data', function(data) {
            console.log(data);
        });
    })
}

function execCommand() {
    try {
        execAsync('yarn add @qunhe/carpenter@latest -D')
        .then(() => {
            return execAsync(`mv ./package.json ${tempPackage}`);
        }).then(() => {
            fs.writeFileSync('package.json', JSON.stringify(newPackageJson));
        }).then(() => {
            return execAsync('yarn');
        }).then(() => {
            return execAsync('rm ./package.json');;
        }).then(() => {
            return execAsync(`mv ${tempPackage} ./package.json`);
        })
    } catch(e) {
        console.error(e);
    } 
}

execCommand();


