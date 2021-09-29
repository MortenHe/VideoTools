//Webseite bauen und in passenden Ordner in Nextcloud kopieren
//node .\buildAudioWebsite.js

//Videomodus
const mode = "wvp";
const appDir = "VideoClient";

//Wohin kommt der Website-Code
const fs = require('fs-extra');
const websiteDir = fs.readJSONSync("config.json").videoDir + "/website/" + mode;

//Webseite bauen
console.log("start build " + mode + " website");
const execSync = require('child_process').execSync;
execSync("cd ../" + appDir + " && ng build --configuration production --base-href=/" + mode + "/", { stdio: 'inherit' });
console.log("build done");

//Web-Verzeichnis in Nextcloud leeren
console.log("empty website dir");
fs.emptyDirSync(websiteDir);

//Erstellte Webseite in Web-Verzeichnis in Nextcloud kopieren
console.log("copy app code to website dir");
fs.copySync("../" + appDir + "/dist", websiteDir);
console.log("done");