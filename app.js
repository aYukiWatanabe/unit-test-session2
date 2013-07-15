var express = require('express');
var path = require('path');
var Field = require('simple-mine').Field;

var FIELD_SIZE = 3;

var app = express();
var field = null;

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/client_spec', express.static(path.join(__dirname, 'client_spec')))
app.use(express.bodyParser());

function getPos(req) {
  return {
    x: +req.query.x || +req.body.x || 0,
    y: +req.query.y || +req.body.y || 0
  };
}
function setResponse(res, data) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}


app.post('/api/field', function(req, res) {
  field = new Field(FIELD_SIZE, FIELD_SIZE);

  field.setMine(
    ~~(Math.random() * FIELD_SIZE),
    ~~(Math.random() * FIELD_SIZE)
  );

  setResponse(res, {
    xSize: FIELD_SIZE,
    ySize: FIELD_SIZE
  });
});

app.post('/api/field/masses/open', function(req, res) {
  var pos = getPos(req);
  var isMine = field.hasMine(pos.x, pos.y);

  setResponse(res, { isMine: isMine });
});

app.get('/api/debug/field/map', function(req, res) {
  setResponse(res, field.getMap());
});

var server = app.listen(3000);

exports.quit = function() {
  server.close();
}
exports.getField = function() {
  return field;
}
