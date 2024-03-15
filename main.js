#!/usr/bin/env node

const OS = require('opensubtitles.com')
const fetch = require('node-fetch');
const fs = require('fs');
const flags = require("flags");
const path = require("path");

const os = new OS({
    apikey: '4VREJEFASh550XitH7Pt5wbkPc3dWj3S'
});

flags.defineString("file", "", "File name");
flags.parse();

const search = (flags.get("file")).split('/').pop();
console.log("searching for", search)
let foundMatch = false;


os.login({
    username: 'jchaike',
    password: 'fnx*xpu_JEZ6ued9atj'
}).then((response) => {
    os.subtitles({
        query: search,
    }).then((response) => {
        for (item in response.data) {
          if (search == response.data[item].attributes.release && !foundMatch) {
            const fileId = response.data[item].attributes.files[0].file_id;
            foundMatch = true;
            console.log(fileId);
            os.download({
              file_id: fileId
            }).then((response) => {
              downloadFile(response.link);
              console.log(response);
            }).catch(console.error)
          }
        }

        if (!foundMatch) {
          os.download({
            file_id: response.data[0].attributes.files[0].file_id
          }).then((response) => {
            downloadFile(response.link);
            console.log(response);
          }).catch(console.error);
        }
    }).catch(console.error)


}).catch(console.error)

async function downloadFile(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('HTTP Error');
    }

    const fileStream = fs.createWriteStream(`${__dirname}/${path.parse(search).name}.srt`);
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', (err) => {
        reject(err);
      });
      fileStream.on('finish', function () {
        resolve();
      });
    });

  } catch (error) {
    console.error("Error")
  }
}

