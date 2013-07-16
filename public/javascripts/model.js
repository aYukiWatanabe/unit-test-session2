/*
 * フィールドのModel
 * ModelなのでView/Controllerに依存しない
 */
function FieldModel() {
  // Observerパターンのためのリスナー
  this._listeners = {
    opened: []
  };
  
  this.xSize = -1;
  this.ySize = -1;
  this._map = null; // null初期化は不要か否かで意見が分かれるが、個人的にはした方がエラーを防ぎやすい
  this._clear();
}
/*
 * デストラクタ
 */
FieldModel.prototype.destroy = function(params) {
  this._clear();
};
/*
 * マスのフラグ
 * 本来は当然サーバと共通化するが、Node利用時のクライアントサーバ間でのソースの共通化は、
 * Node初心者には混乱を招きやすく、目的のUnit Testと外れるので、コピペした。
 */
FieldModel.massFlags = {
  NONE: 0x00,
  MINE: 0x01,
  OPENED: 0x0102
};
/*
 * リスナーを消す
 */
FieldModel.prototype._clear = function(params) {
  this._listeners = {
    opened: []
  };
};
/*
 * ajaxのリクエストをまとめる関数
 * ajaxのリクエストは、モデルのどこかでまとめる
 */
FieldModel.prototype._ajax = function(params) {
  var newParams = {
    dataType: 'json'
  };
  // newParamsに対して、paramsの各プロパティを上書きする
  // デフォルトの値を持たせたい場合の典型パターン
  $.extend(newParams, params);
  $.ajax(newParams);
};

/*
 * 非同期の初期化処理
 * サーバに対してフィールド生成(リセット)を行い終わったらコールバック
 */
FieldModel.prototype.init = function(proc) {
  this._requestCreateField({
    proc: proc
  });
};

/*
 * オブザーバーを追加する
 * 通常はかならず対になるremoveがあるだが、今回は未実装
 */
FieldModel.prototype.addObserver = function(params) {
  this._listeners.opened.push(params.opened);
};

/*
 * サーバにフィールドを作成させて、その情報を元に自分のフィールド情報を設定する非同期メソッド
 */
FieldModel.prototype._requestCreateField = function(params) {
  var self = this;
  var proc = params.proc || function() {};
  this._ajax({
    type: 'POST',
    url: '/api/field',
    success: function(res) {
      self._initMap(res);
      proc(res);  // 完了をコールバックで通知
    }
  });
};

/*
 * サーバから渡されたフィールドのサイズを元に、マス情報をNONEで初期化
 * Webゲームとして、サーバにマスを開くというアクションを行って初めて地雷をあけてしまったという内容にするため、
 * サーバが持つ地雷の位置などはこの時点では持っていない。
 */
FieldModel.prototype._initMap = function(params) {
  this.xSize = params.xSize;
  this.ySize = params.ySize;
  var map = [];
  for (var x = 0; x < this.xSize; x++) {
    map[x] = [];
    for (var y = 0; y < this.ySize; y++) {
      map[x][y] = FieldModel.massFlags.NONE;
    }
  }
  this._map = map;
};

/*
 * サーバに対してマスを開かせる
 * サーバから地雷の情報が返ってきたら、ユーザは地雷を踏んだことになる
 */
FieldModel.prototype._requestOpenMass = function(params) {
  var self = this;
  var x = params.x;
  var y = params.y;
  var proc = params.proc || function() {};
  this._ajax({
    type: 'POST',
    url: '/api/field/masses/open',
    data: {
      x: x,
      y: y
    },
    success: function(res) {
      var p = {
        x: x,
        y: y,
        flag: FieldModel.massFlags.OPENED | (res.isMine && FieldModel.massFlags.MINE)
      };
      self._handleMassOpened(p);  // 自分の持つマスの情報を変更
      proc(p);  // 完了をコールバックで通知
    }
  });
};
/*
 * マスが開かれてサーバから情報が返ってきたので、マスの状態を更新
 */
FieldModel.prototype._handleMassOpened = function(params) {
  // マスを開かれた状態にする。また、地雷だった場合そのフラグも立てる。
  this._map[params.x][params.y] = params.flag;
  // 全てのオブザーバーに変更を通知
  this._listeners.opened.forEach(function(f) {
    f(params);
  });
};

/*
 * テスト・デバッグ用にサーバ側のマップ情報をまとめて取得する非同期処理メソッド
 * ゲームとしてはこれができるとチートなので、本来は、テスト・開発環境以外ではサーバの機能と合わせて無効にしないといけない
 */
FieldModel.prototype.debugRequestMap = function(proc) {
  this._ajax({
    type: 'GET',
    url: '/api/debug/field/map',
    success: function(res) {
      proc(res);
    }
  });
};
/*
 * マスを開くためのIF関数。非同期処理メソッド
 */
FieldModel.prototype.openMass = function(params) {
  return this._requestOpenMass(params);
};
/*
 * マスの情報を取得する
 */
FieldModel.prototype.getMassFlag = function(x, y) {
  return this._map[x][y];
};
