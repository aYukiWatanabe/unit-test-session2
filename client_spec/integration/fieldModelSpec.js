describe('FieldModel', function() {
  var fieldModel;

  // 各テストの前にfieldModelにフィールドを保存
  // このテストでは、テストケースごとのサーバの再起動などはしない
  beforeEach(function() {
    var isFieldCreated = false;

    fieldModel = new FieldModel();
    fieldModel.init(function() {
      // 非同期処理が完了したら、
      isFieldCreated = true;
    });
    
    waitsFor(function() {
      // isFieldCreatedがtrueになったらこのbeforeEach()を抜ける
      return isFieldCreated;
    });
  });

  /*
  // jasmine.asyncを使うと大分ましにかける。QUnit風。
  // https://github.com/derickbailey/jasmine.async
  var async = new AsyncSpec(this);
  async.beforeEach(function(done) {
    fieldModel = new FieldModel();
    fieldModel.init(done);
  });
  */
  
  /*
   * テストサンプル
   * 実際にサーバにアクセスしてフィールドを初期化し、デバッグ用メソッドで取得したサーバのマップに地雷ができていることを確認
   */
  it('should create server side map that have mine', function() {
    var map = null;
    // サーバ側のフィールドマップをデバッグ用メソッドで取得
    fieldModel.debugRequestMap(function(m) {
      map = m;
    });

    waitsFor(function() {
      // 取得完了待ち
      return map;
    });

    // サーバ側のフィールドマップに、地雷が1以上存在すること確認
    runs(function() {
      var mines = [];
      for (var x = 0; x < fieldModel.xSize; x++) {
        for (var y = 0; y < fieldModel.ySize; y++) {
          if (map[x][y] & FieldModel.massFlags.MINE) {
            mines.push(map[x][y]);
          }
        }
      }
      expect(mines.length).toNotEqual(0);
    });
  });

  /*
   * 演習2. openMass()のテストとして、下記のテストケースの一部を実装する
   */
  it('should open mine mass in the case of that server responses mine', function() {
    var map = null;
    // サーバ側のフィールドマップをデバッグ用メソッドで取得
    fieldModel.debugRequestMap(function(m) {
      map = m;
    });

    waitsFor(function() {
      // 取得完了待ち
      return map;
    });

    function findMineMass(map) {
      for (var x = 0; x < fieldModel.xSize; x++) {
        for (var y = 0; y < fieldModel.ySize; y++) {
          if (map[x][y] & FieldModel.massFlags.MINE) {
            return { x: x, y: y };
          }
        }
      }
    }

    // ここから先を実装する
    // mapで地雷があるところをopenMass()で開いて、getMassFlag()で地雷が地雷を返すことを確認する

    var mineMass;
    var isMassOpened = false;

    runs(function() {
      mineMass = findMineMass(map);
      fieldModel.openMass({
        x: mineMass.x,
        y: mineMass.y,
        proc: function() { isMassOpened = true; }
      });
    });

    waitsFor(function() {
      return isMassOpened;
    });

    runs(function() {
      expect(fieldModel.getMassFlag(mineMass.x, mineMass.y)).toEqual(FieldModel.massFlags.OPENED | FieldModel.massFlags.MINE);
    });
  });
});
