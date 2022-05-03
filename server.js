//Luca Santarella - NFT Marketplace

/* ### MODULES ### */
var sanitize = require("sanitize-filename");
const exec = require('child_process').exec;
var FormData = require('form-data');
const axios = require('axios').default;
var express = require('express');
var debug = require('debug')('app');
var path = require('path');
var fs = require('fs');
var http = require('http');
var https = require('https');
var morgan = require('morgan')
const multer  = require('multer'); //module used for multipart data
const GracefulShutdownManager =
  require('@moebius/http-graceful-shutdown').GracefulShutdownManager;
const sqlite3 = require('sqlite3').verbose();
const keccak256 = require('keccak256');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var baseUrlIpfs = "http://127.0.0.1:5001/api/v0/";

var app = express();

/* listen on port localhost:3000 */
var port = process.env.PORT || 3000;
debug("Using port ", port);
var server = app.listen(port,
  function() {
    var host = "localhost";
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(8080);

const shutdownManager = new GracefulShutdownManager(server);

/* handle SIGINT and SIGTERM signals */
process.on('SIGINT', () => {
  shutdownManager.terminate(() => {
    console.log('Server received SIGINT');
    console.log('Closing SQlite server');
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Close the database connection.');
    });
  });
});

process.on('SIGTERM', () => {
  shutdownManager.terminate(() => {
    console.log('Server received SIGTERM');
    console.log('Closing SQlite server');
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Close the database connection.');
    });
  });
});

let db = new sqlite3.Database('./db/popnft.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

/* ### create table if it doesn't exist ### */
db.run('CREATE TABLE IF NOT EXISTS items (\
  tokenID INTEGER PRIMARY KEY, \
  title TEXT NOT NULL UNIQUE, \
  owner TEXT NOT NULL, \
  tokenURI TEXT NOT NULL, \
  txHash TEXT NOT NULL, \
  tokenCID TEXT NOT NULL, \
  metadataCID TEXT NOT NULL, \
  burned INTEGER NOT NULL DEFAULT 0);');

// const upload = multer({ dest: './images/' })

var storage = multer.diskStorage(
  {
    destination: './images/',
    filename: function( req, file, cb ) {
      hashedFilename = keccak256(file.originalname).toString('hex');
      var extension = file.originalname.split('.').pop();
      console.log(extension);
      if(extension !== 'png' && extension !== 'jpg' && extension !== 'gif' && extension !== 'jpeg'){
            cb(new Error('Only images are allowed'));
      }
      newTokenURI = hashedFilename +'.' + extension;
      cb(null, newTokenURI);
    }
  });

const upload = multer({ storage: storage });

app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use(express.static(__dirname + '/src/'));
app.use(express.static('.'));
app.use(express.static(__dirname + '/images/'));
app.use(express.static(__dirname + '/images/assets/'));
app.use(express.static(__dirname + '/build/contracts'));
app.use(express.static(__dirname + '/node_modules/'));


// ### API ENDPOINTS ###
app.get('/',
    function (req, res) {
        debug("Root URL requested.");
        res.sendFile(path.join(__dirname, '/src/index.html'));
    });

app.post('/items/metadata', upload.single('image'),
  function(req, res, next){
    sanitizedTitle = sanitize(req.body.title);
    tokenCID = '';
    console.log(req.file.path);
    exec("ipfs add "+req.file.path, (error, stdout, stderr) => {
      console.log(stdout);
      strTokens = stdout.split(" ");
      tokenCID = strTokens[1];
      var nameDict = {
        type: "string",
        description: sanitizedTitle
      }
      var descriptionDict = {
        type:"string",
        description: "The title of this NFT is "+sanitizedTitle
      }
      var imageDict = {
        type: "string",
        description: "https://ipfs.io/ipfs/"+tokenCID
      }
      var propertiesDict = {
        name: nameDict,
        description: descriptionDict,
        image: imageDict
      }
      var dict = {name: sanitizedTitle,
        description: "NFTCollection NFT", title: sanitizedTitle,
        owner: req.body.owner,
        image: "https://ipfs.io/ipfs/"+tokenCID, properties: propertiesDict};
      var dictString = JSON.stringify(dict);
      var metadataPath = "./tokens/"+sanitizedTitle+".json";
      fs.writeFile(metadataPath, dictString,
        function(err, result) {
        if(err)
          console.log('error', err);
      });

      metadataCID = '';
      exec("ipfs add "+metadataPath, (error, stdout, stderr) => {
        console.log(stdout);
        tokens = stdout.split(" ");
        metadataCID = tokens[1];
        res.send(metadataCID);
      });
    });
  })

app.post('/items/upload-item',upload.single('image'),
  function (req, res, next) {
    sanitizedTitle = sanitize(req.body.title);
    tokenCID = '';
    exec("ipfs add "+req.file.path, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      tokens = stdout.split(" ");
      tokenCID = tokens[1];
      var nameDict = {
        type: "string",
        description: sanitizedTitle
      }
      var descriptionDict = {
        type:"string",
        description: "The title of this NFT is "+sanitizedTitle
      }
      var imageDict = {
        type: "string",
        description: "https://ipfs.io/ipfs/"+tokenCID
      }
      var propertiesDict = {
        name: nameDict,
        description: descriptionDict,
        image: imageDict
      }
      var dict = {id: req.body.id, name: sanitizedTitle,
        description: "NFTCollection NFT", title: sanitizedTitle,
        owner: req.body.owner, tokenURI: newTokenURI,
        image: "https://ipfs.io/ipfs/"+tokenCID, properties: propertiesDict};
      var dictString = JSON.stringify(dict);
      metadataPath = "./NFTs/"+sanitizedTitle+".json";
      fs.writeFile(metadataPath, dictString,
        function(err, result) {
        if(err)
          console.log('error', err);
      });

      metadataCID = '';
      exec("ipfs add "+metadataPath, (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        tokens = stdout.split(" ");
        metadataCID = tokens[1];
        sqlInsertItem = 'INSERT INTO items (tokenID,title,owner, \
          tokenURI,txHash,tokenCID, metadataCID) \
          VALUES (?, ?, ?, ?, ?, ?, ?);';
        db.run(sqlInsertItem, [req.body.id, sanitizedTitle, req.body.owner,
          newTokenURI, req.body.txHash, tokenCID, metadataCID], function(err) {
          if (err) {
            return console.log(err.message);
          }
          // get the last insert id
          console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
        res.send(dict);
      });
    });
  });



app.post('/items/delete-item',
  function(req, res){
    //delete image associated with the NFT
    fs.unlink("./images/"+req.body.tokenURI, (err => {
      if (err)
        console.log(err);
    }));
    console.log(req.body.id);
    sqlSafeDeleteItem = 'UPDATE items\
      SET burned = 1\
      WHERE tokenID = ?';
    db.run(sqlSafeDeleteItem, req.body.id, function(err) {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      console.log(`A row has been updated with rowid ${this.lastID}`);
    });
    res.status(200).send(JSON.stringify('Successful deletion'));
  });

app.get('/items',
  function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, \
                Content-Type, Accept");
    db.all(`SELECT tokenID as id,title,owner,tokenURI,txHash
             FROM items WHERE burned = 0;`, [], (err, rows) => {
      if (err) {
        throw err;
      }
      console.log(rows);
      res.send(rows);
    });
  });

app.get('/items/item',
  function(req, res){
    sqlSearchItem = 'SELECT *\
      FROM items\
      WHERE title = ?';
    db.get(sqlSearchItem, req.query.title, (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      //title already exists
      if(row != null){
        res.send(row);
      }
      else{
        res.status(404).send(JSON.stringify('This item does not exist.'));
      }
    });
  });
