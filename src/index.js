const request = require('request');
const urlExist = require('url-exist');
// const links = [
//   {
//     title:
//       "Guiding Officers to Deflect Citizens to Treatment: An Examination of Police Department Policies in Illinois",
//     publicationDate: "2023-02-10",
//     fileURL:
//       "https://researchhub.icjia-api.cloud/uploads/PDF%20policy%20paper-230210T21141657.pdf1",
//   },
//   {
//     title:
//       "Criminal History Record Checks for Federally Assisted Housing: A Progress Report",
//     publicationDate: "2023-02-07",
//     fileURL:
//       "https://researchhub.icjia-api.cloud/uploads/FINAL%20REPORT%20PDF%20FOR%20POSTING-230207T16344430.pdf",
//   },
//   {
//     title:
//       "Evaluation of the Development of a Multijurisdictional Police-Based Deflection Program in Southern Illinois",
//     publicationDate: "2023-02-07",
//     fileURL:
//       "https://researchhub.icjia-api.cloud/uploads/FINAL%20PDF%20FOR%20POSTING-230207T17003598.pdf",
//   },
// ];

/* eslint-disable no-unused-vars */
const fs = require('fs');
const axios = require('axios');
const jsonfile = require('jsonfile');
const _ = require('lodash');
// const { apiBaseURL } = require("./src/config");
const allowedHost = 'https://icjia.illinois.gov/researchhub';

const init = async () => {
  const limit = 500;
  let pubArray = [];
  let start = 0;
  let count = await axios.get(
    'https://agency.icjia-api.cloud/publications/count',
  );
  count = count.data;
  let iterations = Math.ceil(count / limit);

  for (let i = 0; i < iterations; i++) {
    let response = await axios.get(
      `https://agency.icjia-api.cloud/publications?_limit=${limit}&_start=${start}`,
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
    return obj;
  });
  let content = [...publications];
  content = _.orderBy(content, ['publicationDate'], ['desc']);
  Promise.all(
    content.map(async (item) => {
      const result = await urlExist(item.fileURL);
      return { status: result, item };
    }),
  ).then((res) => {
    jsonfile.writeFileSync(`./links.json`, res, function (err) {
      if (err) {
        console.error(err);
      }
    });
    console.log('link file written --> ./links.json');
  });
};

init();
