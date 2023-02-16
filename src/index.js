const request = require('request');
const urlExist = require('url-exist');
require('dotenv').config();

/* eslint-disable no-unused-vars */
const fs = require('fs');
const axios = require('axios');
const jsonfile = require('jsonfile');
const _ = require('lodash');
const API = process.env.API;

const init = async () => {
  const limit = 500;
  let pubArray = [];
  let start = 0;
  let count = await axios.get(`${API}/publications/count`);
  count = count.data;
  let iterations = Math.ceil(count / limit);

  for (let i = 0; i < iterations; i++) {
    let response = await axios.get(
      `${API}/publications?_limit=${limit}&_start=${start}`,
    );
    pubArray = pubArray.concat(response.data);
    start += limit;
  }
  pubArray = _.uniqBy(pubArray, 'id');
  // remove all objects that don't have a fileURL
  pubArray = pubArray.filter((p) => p.fileURL);

  let publications = pubArray.map((p) => {
    let obj = {};
    obj.title = p.title;
    obj.publicationDate = p.publicationDate;
    obj.fileURL = p.fileURL.replace(/ /g, '%20');
    obj.pubPath = `${process.env.WEBSITE}/about/publications/${p.slug}`;
    obj.canonical = p.fileURL;
    return obj;
  });
  let content = [...publications];
  content = _.orderBy(content, ['publicationDate'], ['desc']);

  // filter out all links that are not from the variable content
  badLinks = content.filter((c) => c.result);

  Promise.all(
    content.map(async (item) => {
      const result = await urlExist(item.fileURL);
      return { status: result, item };
    }),
  ).then((res) => {
    // filter out bad status from res
    let badLinks = res.filter((r) => r.status === false);

    //badLinks = badLinks.map((b) => b.item);

    jsonfile.writeFileSync(
      `./api/allLinks.json`,
      res,
      function (err) {
        if (err) {
          console.error(err);
        }
      },
    );
    jsonfile.writeFileSync(
      `./api/badLinks.json`,
      badLinks,
      function (err) {
        if (err) {
          console.error(err);
        }
      },
    );

    // write a json file containing the current date and time
    let date = new Date();
    let dateStr = 'Last Updated: ' + date.toISOString();
    jsonfile.writeFileSync(
      `./api/lastUpdated.json`,
      dateStr,
      function (err) {
        if (err) {
          console.error(err);
        }
      },
    );

    console.log('links files written.');
  });
};

init();
