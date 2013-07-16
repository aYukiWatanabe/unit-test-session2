/*
 * Expressを利用したWebアプリ
 */
var express = require('express');
var path = require('path');
// ユニットテスト勉強会第1回で作成したNodeモジュールを読み込む
var Field = require('simple-mine').Field;

var FIELD_SIZE = 3;

var app = express();
var field = null;

// public以下の静的ファイルをパス/publicにマッピングする。
app.use('/public', express.static(path.join(__dirname, 'public')))
// テスト用のclient_spec以下の静的ファイルをパス/client_specにマッピングする
// 本来はテスト環境のみ有効にする
app.use('/client_spec', express.static(path.join(__dirname, 'client_spec')))
// Postのボディー内をパースする
app.use(express.bodyParser());

// リクエストからx,yのパラメーターを取り出す
function getPos(req) {
  return {
    x: +req.query.x || +req.body.x || 0,
    y: +req.query.y || +req.body.y || 0
  };
}

// 指定されたオブジェクトをjsonの文字列にして、jsonとしてレスポンスを返す
function setResponse(res, data) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/*
 * WebAPI: フィールドの作成兼リセット
 */ 
app.post('/api/field', function(req, res) {
  field = new Field(FIELD_SIZE, FIELD_SIZE);

  // フィールドには、ランダムな位置に地雷を1つ配置する。
  field.setMine(
    ~~(Math.random() * FIELD_SIZE),
    ~~(Math.random() * FIELD_SIZE)
  );

  // フィールドのサイズ(マス数)を返す
  setResponse(res, {
    xSize: FIELD_SIZE,
    ySize: FIELD_SIZE
  });
});

/*
 * WebAPI: フィールド内のマスをオープンする
 */ 
app.post('/api/field/masses/open', function(req, res) {
  var pos = getPos(req);
  var isMine = field.hasMine(pos.x, pos.y);

  // 地雷があったかどうかを返す
  setResponse(res, { isMine: isMine });
});

/*
 * WebAPI: テスト用の関数。フィールド内のマスの情報を全て返す
 * 本来はテスト時のみ有効にする
 */ 
app.get('/api/debug/field/map', function(req, res) {
  setResponse(res, field.getMap());
});

// 普通は利用ポートは引数をみて変数するが、とりあえず3000固定
var server = app.listen(3000);

// サーバーを終了させる
exports.quit = function() {
  server.close();
}
// フィールドを返すデバッグ関数
// 本来はテスト時のみ有効にする
exports.getField = function() {
  return field;
}
