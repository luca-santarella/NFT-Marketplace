var express = require('express');
var debug = require('debug')('app');
var path = require('path');
var fs = require('fs');
const multer  = require('multer'); //module for multipart data

var storage = multer.diskStorage(
    {
        destination: './images/',
        filename: function ( req, file, cb ) {
            cb( null, file.originalname);
        }
    }
);

const upload = multer({ storage: storage });

var app = express();

app.use(express.json()) // for parsing application/json

app.use(express.static(__dirname + '/src/'));
app.use(express.static('.'));
app.use(express.static(__dirname + '/images/'));
app.use(express.static(__dirname + '/build/contracts'));
app.use(express.static(__dirname + '/node_modules/@truffle/contract'));
app.use(express.static(__dirname + '/node_modules/web3'));



app.get('/',
    function (req, res) {
        debug("Root URL requested.");
        res.sendFile(path.join(__dirname, '/src/index.html'));
    });

app.post('/upload', upload.single('imageNFT'), function (req, res, next) {


    res.send("Success!");

    // fs.writeFile('./images/image.png', req.body, 'binary', function(err){
    //   if (err) throw err
    //   console.log('File saved.')
    //   //console.log(imagedata);
    // })
});

var port = process.env.PORT || 3000;
debug("Using port ", port);
var server = app.listen(port,
  function() {
    var host = "localhost";
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});
