//Video von Url herunterladen
const fs = require('fs-extra');
const download = require('download');
const { execSync } = require('child_process');

//Benennung 003.ts um richtige Reihenfolge sicherzustellen
const padStart = require('lodash.padstart');

//Wo sollen Videos gespeichert werden
const config = fs.readJSONSync("config.json");
const mediaDir = config.mediaDir;
const downloadDir = mediaDir + "/download";
const doneDir = mediaDir;
const source = config.source;

//Dir anlegen, wo fertiges Video liegen soll, falls es nicht existiert
if (!fs.existsSync(doneDir)) {
    fs.mkdirSync(doneDir);
}

//Skript starten
main();

//Ueber Liste der files gehen, die heruntergeladen werden sollen
async function main() {
    for (const video of config.urls) {
        await downloadVideo(video);
    }
}

//Video aus einzelnen Teilen herunterladen
async function downloadVideo(video) {
    console.log("downloading " + video[0]);

    //Url je nach Modus aufteilen, damit part-urls erzeugt werden koennen
    const urlSplit = {
        zdf: (video[1]).split(/segment\d{1,}/),
        wdr: (video[1]).split(/segment\d{1,}/),
        ard: (video[1]).split(/segment\d{1,}/),
        dm: (video[1]).split(/frag\(\d{1,}/)
    }[source];

    //Video-Promises sammeln
    const videoPromises = [];

    //Download-Dir leeren
    fs.emptyDirSync(downloadDir);

    //Wie viele Segmente sollen fuer diesen Modus abgefragt werden
    const limit = {
        zdf: 165,
        wdr: 12,
        ard: 45,
        dm: 500
    }[source];

    //Einzelne Teile herunterladen
    for (let i = 1; i <= limit; i++) {

        //Videos-Promises sammeln
        videoPromises.push(new Promise((resolve, reject) => {

            //Url mit part-id erstellen fuer best. Modus
            const partUrl = {
                zdf: urlSplit[0] + "segment" + i + urlSplit[1],
                wdr: urlSplit[0] + "segment" + i + urlSplit[1],
                ard: urlSplit[0] + "segment" + i + urlSplit[1],
                dm: urlSplit[0] + "frag(" + i + urlSplit[1]
            }[source];

            //Download
            download(partUrl).then(data => {

                //Datei speichern
                fs.writeFileSync(downloadDir + "/" + padStart(i, 3, "0") + ".ts", data);
                resolve();
            }, err => {

                //Bei Fehler trotzdem resolven
                console.log(err.statusCode);
                resolve();
            });
        }));
    }

    //Wenn alle Dateien heruntergeladen wurden
    await Promise.all(videoPromises);
    console.log("download done");

    //in Download-Verzeichnis gehen und ts Dateien zu einer ts-Datei zusammenfuehren
    switch (config.os) {

        //Befehl unter Windows
        case "windows":
            execSync("cd " + downloadDir + " && copy /b *.ts joined_files.ts");
            console.log("putting single files together done");
            break;

        //Befehl unter Linux
        case "linux":
            execSync("cd " + downloadDir + " && cat *.ts > joined_files.ts");
            console.log("putting single files together done");
    }

    //ts-Datei nach mp4 konvertieren
    execSync("ffmpeg -loglevel panic -i " + downloadDir + "/joined_files.ts -acodec copy -vcodec copy " + doneDir + "/" + config.mode + "-" + video[0] + ".mp4");
    console.log("creating mp4 file done");

    //Download-Dir leeren
    fs.emptyDirSync(downloadDir);
    console.log("removing downloaded files done");
}