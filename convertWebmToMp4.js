//webm-Dateien mit ffmpeg in mp4 umwandeln
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const { execSync } = require('child_process');

//Ueber webm-Dateien gehehn und im mp4 umwandeln
const dataDir = fs.readJSONSync("config.json").mediaDir;
glob(dataDir + "/*.webm", (err, files) => {
    for (const inputPath of files) {
        console.log("Convert " + inputPath + " to .mp4");
        const outputPath = dataDir + "/" + path.basename(inputPath, '.webm') + ".mp4";
        execSync("ffmpeg -i " + inputPath + " " + outputPath);
    }
});