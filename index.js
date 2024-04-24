const express = require("express");
const axios = require("axios");
const { parse } = require("csv-parse");
const fs = require("node:fs/promises");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 4000;
const app = express();

let lengthRows = null;
let indexRow = 0;
const tgApi = "https://api.telegram.org/";
const photoUrl = `${tgApi}bot${process.env.BOT_TOKEN}/sendPhoto`;

function start() {
    if (lengthRows && indexRow >= lengthRows) return console.log("Rows ended");
    getCsv(publishPost);
}

async function getCsv(callback) {

    const dataCsv = await fs.readFile(path.join(__dirname, "content.csv"), { encoding: "utf-8" });
    
    if (!lengthRows) lengthRows = dataCsv.length - 1;

    parse(dataCsv, {
        comment: '#'
      }, function(err, records){
        if (!err) {
            const [ headers, ...csvWithoutHeaders ] = records;
            callback(csvWithoutHeaders);
        }
    });

}

async function publishPost(csv) {

    if (!csv[indexRow]) return console.log("Rows ended");;
    let [ img, ...content ] = csv[indexRow];

    try {

        await axios.post(photoUrl, {
            chat_id: process.env.CHAT_ID,
            photo: img,
            caption: generateContent(content),
            parse_mode: "HTML"
        });

        // let text = "Совсем скоро опубликуется новый пост🙂";
        // await axios.get(`${tgApi}bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${text}`)

        indexRow++;
        setTimeout(start, 5000); //7 hours - 25200

    } catch(e) {
        console.log(e);
    }

}

function generateContent(content) {
    let [ title, text, offerText, link ] = content;
    return `
<b>📌${title}📌</b>

${text}

<u>${offerText}</u>

<a href="${link}">👇Переходи👇</a>
    `;
}

start();

app.get("/", async (req, res) => {
    res.json("Bot started");
});

app.listen(PORT, () => console.log("Server has been started"));

module.exports = app;