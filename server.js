const express = require('express');
const app = express();
const port = 3399;
const jsonfile = require('jsonfile');
const fs = require('fs');
const axios = require('axios');
const _ = require('lodash');
const requestIp = require('request-ip');
app.set('json spaces', 2);

app.get('/bad', (req, res) => {
  const badLinks = jsonfile.readFileSync('./api/badLinks.json');
  res.send(badLinks);
});

app.get('/all', (req, res) => {
  const allLinks = jsonfile.readFileSync('./api/allLinks.json');

  res.send(allLinks);
});

app.get('/generate', (req, res) => {
  res.send('Generate here');
});

app.get('/', function (req, res) {
  const lastUpdated = jsonfile.readFileSync('./api/lastUpdated.json');
  res.send(lastUpdated);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
