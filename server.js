//Luca Santarella - NFT Marketplace

/* ### MODULES ### */
var express = require('express');
var debug = require('debug')('app');
var path = require('path');
var fs = require('fs');
var http = require('http');
var morgan = require('morgan')
const multer  = require('multer'); //module used for multipart data
const GracefulShutdownManager =
  require('@moebius/http-graceful-shutdown').GracefulShutdownManager;
const sqlite3 = require('sqlite3').verbose();
const keccak256 = require('keccak256');

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
  burned INTEGER NOT NULL DEFAULT 0);');


var storage = multer.diskStorage(
  {
    destination: './images/',
    filename: function( req, file, cb ) {
      hashedFilename = keccak256(file.originalname).toString('hex');
      var extension = file.originalname.split('.').pop();
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
app.use(express.static(__dirname + '/node_modules/@truffle/contract'));
app.use(express.static(__dirname + '/node_modules/web3'));
app.use(express.static(__dirname + '/node_modules/sweetalert2'));
app.use(express.static(__dirname + '/node_modules/nanogallery2'));
app.use(express.static(__dirname + '/node_modules/jquery'));
app.use(express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));


// ### API ENDPOINTS ###
app.get('/',
    function (req, res) {
        debug("Root URL requested.");
        res.sendFile(path.join(__dirname, '/src/index.html'));
    });

app.post('/upload', upload.single('image'),
  function (req, res, next) {

    var dict = {id: req.body.id, title: req.body.title, owner: req.body.owner,
      tokenURI: newTokenURI};
    var dictString = JSON.stringify(dict);

    fs.writeFile("./NFTs/"+req.body.title+".json", dictString,
      function(err, result) {
      if(err)
        console.log('error', err);
    });

    console.log("file has been written");

    sqlInsertItem = 'INSERT INTO items (tokenID,title,owner,tokenURI,txHash) \
      VALUES (?, ?, ?, ?, ?);';
    db.run(sqlInsertItem, [req.body.id, req.body.title, req.body.owner, newTokenURI, req.body.txHash], function(err) {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
    res.send(dict);
  });

app.post('/delete',
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

app.get('/NFT-images',
  function(req, res){
    db.all(`SELECT tokenID as id,title,owner,tokenURI,txHash
             FROM items WHERE burned = 0;`, [], (err, rows) => {
      if (err) {
        throw err;
      }
      console.log(rows);
      res.send(rows);
    });
  });

app.get('/item-name', // TODO maybe rethink this
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
