//Webseite bauen und in passenden Ordner in Nextcloud kopieren
//node .\buildAudioWebsite.js

//Welche 
const mode = "wvp";

//Wohin kommt der Website-Code
const fs = require('fs-extra');
const websiteDir = fs.readJSONSync("config.json").videoDir + "/website/" + mode;

//Webseite bauen
console.log("start build " + mode + " website");
const execSync = require('child_process').execSync;
execSync("cd ../VideoClient && ng build --configuration production --base-href=/" + mode + "/", { stdio: 'inherit' });
console.log("build done");

//Web-Verzeichnis in Nextcloud leeren
console.log("empty website dir");
fs.emptyDirSync(websiteDir);

//Erstellte Webseite in Web-Verzeichnis in Nextcloud kopieren
console.log("copy app code to website dir");
fs.copySync("../" + appDirs[mode] + "/dist", websiteDir);
console.log("done");

/*
//Webseite bauen und auf Server laden
//node .\deployWebsiteToServer.js pw | marlen
const fs = require('fs-extra');
const config = fs.readJSONSync("config.json");

//Async Methode fuer Await Aufrufe
async function main() {

    //Welche Website (pw / marlen) wohin deployen (pw / marlen)
    const targetMachine = process.argv[2] || "pw";
    const connection = config["connections"][targetMachine];
    console.log("build and deploy video (" + connection.assetId + ") to server " + targetMachine + ": " + connection.host);

    //Unter welchem Unterpfad wird die App auf dem Server laufen?
    const base_href = "wvp";

    //Pfad wo Webseiten-Dateien auf Server liegen sollen
    let server_video_path = "/var/www/html/" + base_href;

    //Projekt bauen
    console.log("start build");
    const execSync = require('child_process').execSync;
    execSync("ng build -c=" + targetMachine + " --base-href=/" + base_href + "/", { stdio: 'inherit' });
    console.log("build done");

    //htaccess Schablone in dist Ordner kopieren und durch Pattern Ersetzung anpassen
    const replace = require("replace");
    const fs = require("fs-extra");
    console.log("copy htacces");
    await fs.copy('.htaccess', '../../dist/htaccess');

    console.log("update htacces");
    await replace({
        regex: "###PATH###",
        replacement: base_href,
        paths: ['../../dist/htaccess'],
        recursive: true,
        silent: true
    });

    //JSON-Folder zippen
    const zipFolder = require('zip-a-folder');
    console.log("zip data");
    await zipFolder.zip('../../dist', '../../myDist.zip')

    //SSH-Verbindung um Shell-Befehle auszufuehren (unzip, chmod,...)
    const SSH2Promise = require('ssh2-promise');
    const ssh = new SSH2Promise({
        host: connection.host,
        username: connection.user,
        password: connection.password
    });

    //sftp-Verbindung um Webseiten-Dateien hochzuladen
    const Client = require('ssh2-sftp-client');
    const sftp = new Client();
    await sftp.connect({
        host: connection.host,
        port: '22',
        username: connection.user,
        password: connection.password
    });

    //gibt es schon einen Ordner (wvp)
    console.log("check if exists: " + server_video_path)
    const dir_exists = await sftp.exists(server_video_path);

    //Wenn Ordner (wvp) existiert, diesen rekursiv loeschen
    if (dir_exists) {
        console.log("delete folder " + server_video_path);
        await sftp.rmdir(server_video_path, true);
    }

    //neuen Ordner (wvp) anlegen
    console.log("create folder " + server_video_path);
    await sftp.mkdir(server_video_path);

    //gezippten Webseiten-Code hochladen
    console.log("upload zip file");
    await sftp.fastPut("../../myDist.zip", server_video_path + "/myDist.zip");

    //per SSH verbinden, damit Shell-Befehle ausgefuehrt werden koennen
    console.log("connect via ssh");
    await ssh.connect();

    //Webseiten-Code entzippen
    console.log("unzip file");
    await ssh.exec("cd " + server_video_path + " && unzip myDist.zip");

    //htaccess file umbenennen (htaccess -> .htaccess)
    console.log("rename htaccess file");
    await ssh.exec("mv " + server_video_path + "/htaccess " + server_video_path + "/.htaccess")

    //Zip-File loeschen
    console.log("delete zip file");
    await sftp.delete(server_video_path + "/myDist.zip");

    //Rechte anpassen, damit Daten in Webseite geladen werden koennen
    console.log("chmod 0777");
    await ssh.exec("chmod -R 0777 /var/www/html");

    //Programm beenden
    console.log("build process done");
    await ssh.close();
    await sftp.end();
    process.exit();
}

//Deployment starten
main();
*/