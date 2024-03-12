import fs = require('fs');
import path = require('path');
import {exec} from 'child_process';
import * as JSO from "javascript-obfuscator";

const files = fs.readdirSync(path.join('build', 'web')).filter(file => file.endsWith('.js'));

files.forEach(file => {
    const filename = path.basename(file);
    const bundleOutput = path.join('web', `${path.parse(filename).name}.js`);
    const bundleObfuscatedOutput = path.join('browserfied', `${path.parse(filename).name}.js`);
    const filePath = path.join('build', 'web', filename);

    exec(`browserify ${filePath} -o ${bundleOutput}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error bundling ${filename}: ${stderr}`);
        } else {
            console.log(`Bundled ${filename} successfully!`);
        }
    }).on("exit", (code, signal) => {
        /*const fileContent = fs.readFileSync(bundleObfuscatedOutput).toString();

        const obfuscatedCode = fileContent/*JSO.obfuscate(fileContent, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: false,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 1,
            renameGlobals: false,
            target: "browser"
        }).getObfuscatedCode();

        fs.writeFileSync(bundleOutput, obfuscatedCode);*/
    });
});
