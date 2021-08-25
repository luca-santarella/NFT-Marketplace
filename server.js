var express = require('express');
var debug = require('debug')('app');
var path = require('path');
var fs = require('fs');
var http = require('http-debug').http;
var morgan = require('morgan')
const multer  = require('multer'); //module used for multipart data


http.debug = 2;

var storage = multer.diskStorage(
  {
    destination: './images/',
    filename: function ( req, file, cb ) {
      //checks if path already exists, if so increment filename
      var foundDuplicate = true;
      var i = 1;
      //get file extension
      var extension = file.originalname.split('.').pop();
      //filename with file extension removed
      var filename = file.originalname.replace(/\.[^/.]+$/, "");

      if (fs.existsSync(path.join("./images/",file.originalname))) {
        while (foundDuplicate){
          //incremented filename
          incrFilename = filename+"-"+i+"."+extension;
          console.log(incrFilename);
          if (fs.existsSync(path.join("./images/",incrFilename)))
            i++;
          else{
            foundDuplicate = false;
            newTitle = filename+"-"+i;
            cb( null, incrFilename);
          }
        }
      }
      else{
        newTitle = filename;
        cb( null, file.originalname);
      }
    }
  }
);

const upload = multer({ storage: storage });

var app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use(express.json()) // for parsing application/json

app.use(express.static(__dirname + '/src/'));
app.use(express.static('.'));
app.use(express.static(__dirname + '/images/'));
app.use(express.static(__dirname + '/build/contracts'));
app.use(express.static(__dirname + '/node_modules/@truffle/contract'));
app.use(express.static(__dirname + '/node_modules/web3'));
app.use(express.static(__dirname + '/node_modules/sweetalert2'));
app.use(express.static(__dirname + '/node_modules/nanogallery2'));
app.use(express.static(__dirname + '/node_modules/jquery'));



app.get('/',
    function (req, res) {
        debug("Root URL requested.");
        res.sendFile(path.join(__dirname, '/src/index.html'));
    });

app.post('/upload', upload.single('image'),
  function (req, res, next) {

    var dict = {"title": newTitle, "tokenURI": req.body.tokenURI, "owner": req.body.owner, "id": req.body.id};
    var dictString = JSON.stringify(dict);

    fs.writeFile("./NFTs/"+newTitle+".json", dictString,
      function(err, result) {
      if(err)
        console.log('error', err);
    });
    res.send(dict);
  });

app.get('/NFT-images',
  function(req, res){
    const jsonsInDir = fs.readdirSync('./NFTs').filter(file => path.extname(file) === '.json');
    jsonArr = [];
    jsonsInDir.forEach(file => {
      const fileData = fs.readFileSync(path.join('./NFTs', file));
      const jsonFile = JSON.parse(fileData.toString());
      jsonArr.push(jsonFile);
    });
    res.send(jsonArr);
  });

var port = process.env.PORT || 3000;
debug("Using port ", port);
var server = app.listen(port,
  function() {
    var host = "localhost";
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});
