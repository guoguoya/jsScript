const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const rootPath = process.cwd();
const packageJson = require(path.resolve(rootPath, './package.json'));

const newPackageJson = JSON.parse(JSON.stringify(packageJson));
const args = process.argv.splice(2);
const [versionMethod] = args;
let arg = undefined;
let versionUpgradeType = undefined;

if (versionMethod) {
    [arg, versionUpgradeType] = versionMethod.split('=');
}

const version = packageJson.version;

function execAsync(src) {
    return new Promise((resolve, reject) => {
        const process = childProcess.exec(src, function(error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
        process.stdout.on('data', function(data) {
            console.log(data);
        });
    })
}

/**
 * @description 修改package.json的version并打tag发布船新的版本
 * 
 */
function execCommannd() {
    try {
        let [v0,v1,v2] = version.split('.'); 
        if (arg === 'method') {
            if (versionUpgradeType == 'version') {
                v0 = 1 * v0 + 1;
            } else if (versionUpgradeType == 'feature') {
                v1 = 1 * v1 + 1;
            } else {
                v2 = 1 * v2 + 1;
            }
        } else {
            v2 = 1 * v2 + 1;
        }
        const v = `${v0}.${v1}.${v2}`;
        newPackageJson.version = v;
        Promise.resolve().then(() => {
            fs.writeFileSync('package.json', JSON.stringify(newPackageJson, null, 2));
        }).then(() => {
            return execAsync('git add package.json');
        }).then(() => {
            return execAsync('git commit -m \'version upgrade\' ');
        }).then(() => {
            return execAsync('git push origin master');
        }).then(() => {
            return execAsync(`git tag ${v}`);
        }).then(() => {
            return execAsync(`git push origin ${v}`)
        }).then(() => {
        }).catch((e) => {
            console.log(e);
        });
    } catch(e) {
        console.error(e);
    }
}


execCommannd();
