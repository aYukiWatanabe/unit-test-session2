/*
 * クライアントサイドのMVCのController
 */

/*
 * ControllerとしてModel,Viewを保持する
 */
function App() {
  this._fieldModel = null;
  this._fieldView = null;
}

// 既存のオブジェクト内の情報のクリア
App.prototype._reset = function(opt_proc) {
  if (this._fieldModel) {
    this._fieldModel.destroy();
  }
  if (this._fieldView) {
    this._fieldView.destroy();
  }
};

// FieldModelにてマスが開かれた場合に呼ばれる
App.prototype._handleMassOpened = function(res) {
  // マスが地雷を持っていた場合、ゲームオーバーにする
  if (res.flag & FieldModel.massFlags.MINE) {
    this._setGameOver();
  }
};

// ゲームオーバー処理の実行
App.prototype._setGameOver = function() {
  // Viewに対してゲームオーバー用の表示をさせる
  this._fieldView.showGameOver();
};

// ゲームを開始する
App.prototype.start = function(opt_proc) {
  var self = this;
  
  // 既にフィールドなどを作成している場合のため、リセットを行う
  this._reset();

  // フィールドモデルを作成
  this._fieldModel = new FieldModel();
  
  // フィールドモデルの初期化して、初期化が完了したらコールバックらフィールドビューにモデルを設定
  this._fieldModel.init(function() {
    // ViewはModelに依存しているので、ここで渡す
    self._fieldView = new FieldView({
      model: self._fieldModel
    });
    // 生成されたフィールドビューをドキュメントのメインツリーに配置。これで表示が行われる
    $('.mount').append(self._fieldView.getElement());
  });

  // 地雷のマスが開かれたゲームオーバーにしたいので、
  // Observerパターンでマスが開いたときに情報をもらう
  this._fieldModel.addObserver({
    opened: function(res) { self._handleMassOpened(res); }
  });
};

// DOMツリーが準備できたら、アプリオブジェクトを作成して、スタートボタンが押されたらゲームスタート
$(document).ready(function() {
  var app = new App();
  $('.start-button').on('click', function() {
    app.start();
  });
});
