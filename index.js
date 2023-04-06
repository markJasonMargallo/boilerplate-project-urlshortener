const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

var stored_url = [];

const addURL = (url) => {
  const lastShortID = stored_url.length > 0 ? stored_url[stored_url.length - 1].short_url : 0;
  stored_url.push({ "original_url": url, "short_url": lastShortID + 1 });
};

const getURL = (short_url) => {
  if (short_url > 0) {
    return stored_url[short_url - 1];
  }
}

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:id', function (req, res) {
  const shorturl = req.params.id - 1
  res.redirect(stored_url[shorturl].original_url);
});

app.post('/api/shorturl', function (req, res) {
  const lastShortID = stored_url.length > 0 ? stored_url[stored_url.length - 1].short_url : 0;

  const url = new URL(req.body.url);

  dns.lookup(url.hostname, (err, address, family) => { 
    if(address){
      addURL(req.body.url);
      res.json(stored_url[lastShortID]);
    }else{
      res.json({ error: 'Invalid URL' });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
