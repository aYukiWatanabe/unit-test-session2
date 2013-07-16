/*
 * 主にViewだが、フィールドに関するControllerも兼ねている
 */
function FieldView(params) {
  // 依存するモデルを受け取って保持する
  this._model = params.model;
  this._el = null;

  // 要素を生成したり、イベントハンドラなどを登録する
  this._initElements();
  this._initElementHandlers();
  this._initModelHandlers();
  
  // 描画
  this._render();
}
FieldView.WIDTH = 300;
FieldView.HEIGHT = 300;

/*
 * デストラクタ
 * フィールドに関する要素をツリーから外す
 */
FieldView.prototype.destroy = function() {
  $(this._el).remove();
  this._el = null;
};

/*
 * フィールド・マスの要素の生成
 */
FieldView.prototype._initElements = function() {
  this._el = $('<div>')
    .attr({
        'class': 'field'
    });
  
  for (var y = 0; y < this._model.ySize; y++) {
    for (var x = 0; x < this._model.xSize; x++) {
      var mass = $('<div>')
        .attr({
          'class': 'mass',
          'data-x': x,  // 要素がクリックされたときの処理のために、要素の属性にマスのx, y位置を覚える
          'data-y': y
        }).css({
          width: FieldView.WIDTH / this._model.xSize + 'px',
          height: FieldView.HEIGHT / this._model.ySize + 'px'
        });
      // この時点ではthis._elはドキュメントルートにつながってないので、リレイアウトのパフォーマンス悪化などを気にせずに追加する
      this._el.append(mass);
    }
  }
};

/*
 * マスの要素がクリックされたら、クリックされたマスを開くようにモデルに要求する
 * サーバのレスポンスが返って来てUIに反映されるまで時間がかかるので、本来は、その前にユーザに何らかのフィードバックを与えることが望ましい
 */
FieldView.prototype._initElementHandlers = function() {
  var self = this;
  $(this._el).on('click', '.mass', function() {
    var el = $(this);
    self._model.openMass({
      x: +el.attr('data-x'),
      y: +el.attr('data-y')
    });
  });
};

/*
 * モデルを変更の情報をObserverパターンで受け取る
 * MVCの典型的な処理であり、これによりModelからViewへの依存をせずに実装できる
 */
FieldView.prototype._initModelHandlers = function() {
  var self = this;
  this._model.addObserver({
    opened: function() { self._render(); }  // マスが開かれたら、再描画を行う
  });
};
/*
 * 要素の再描画処理
 * Modelの情報を元に、適切な表示を行う
 */
FieldView.prototype._render = function() {
  var self = this;

  // 現在のマスの要素を探して、それぞれdata-x,yでマスとしての座標情報を取り出し、
  // マスの情報に応じて、それぞれのマスの表示を変える
  this._el.find('.mass').each(function() {
    var el = $(this);
    var x = +el.attr('data-x');
    var y = +el.attr('data-y');
    
    var f = self._model.getMassFlag(x, y);
    // マスが開いた状態かどうかにより、開いた状態用のis-openedクラスを付け外しする
    // 見かけはなるべくCSSの仕事なので、避けれないものを除けばjsから直接styleを変更してはいけない。クラスを付け替える
    el.toggleClass('is-opened', !!(f & FieldModel.massFlags.OPENED));
  });
};

/*
 * フィールドの要素を返す関数
 * 高機能なViewのフレームワークだと、自分がドキュメントに追加されたタイミングを知ることができるものが多いが、
 * 今回はとりあえず利用者側でいいようにしてもらう
 */
FieldView.prototype.getElement = function() {
  return this._el;
};

/*
 * ゲームオーバーエフェクトの表示
 * css transitionとcss3d transformを利用して、適当に爆発させる
 */
FieldView.prototype.showGameOver = function() {

  this._el.find('.mass').each(function() {  // 全てのマスの要素に関して、
    var rt = function() {
      return Math.random() * 1000 - 500 + 'px';
    };
    var rr = function() {
      return Math.random() * 2000 - 1000 + 'deg';
    };
    var el = $(this);
    // 最新のjQueryでは既にベンダープレフィックを自動て付けてくれるので不要
    el.css({
      'transform': 'translate3d(' + rt() + ',' + rt() + ',' + rt() + ') ' + // x,y,zの適当な場所に飛ばす
        'rotateX(' + rr() + ') rotateY(' + rr() + ') rotateZ(' + rr() + ')',  // 同時にx,y,z軸の適当な角度に回転させる
      'background-color': 'red',  // 色もだんだん赤くする。こういうタイミングでクラスを付けははずしするのはちょっとパフォーマンスが怖いので直書き
      'opacity': 0, // だんだん透明にする
      'transition': 'all 5s ease-out' // 変化は全てのプロパティが対象で、5秒の間に起こる。変化は最後が緩やかな感じにする。
    });
  });
};
