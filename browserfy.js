const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const files = fs.readdirSync(path.join('build', 'web')).filter(file => file.endsWith('.js'));

files.forEach(file => {
    const filename = path.basename(file);
    const bundleOutput = path.join('web', `${path.parse(filename).name}.js`);
    const filePath = path.join('build', 'web', filename);

    exec(`browserify ${filePath} -o ${bundleOutput}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error bundling ${filename}: ${stderr}`);
        } else {
            console.log(`Bundled ${filename} successfully!`);
        }
    });
});
