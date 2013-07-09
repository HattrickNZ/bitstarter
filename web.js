var express = require('express');
var fs = require('fs')
var app = express.createServer(express.logger());
var content;
var file = 'index.html';

// First I want to read the file
fs.readFile(file, 'utf8', function read(err, data) {
    if (err) {
        throw err;
    }
    content = data;
});

function processFile() {
    return content;
}

app.get('/', function(request, response) {
  response.send(processFile());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
