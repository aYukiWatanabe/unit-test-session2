/*
 * モック・スタブを利用したテスト
 * 現在のテストではモックではなく、スタブとしてしか使っていない
 * 
 * モックとスタブの違いは下記を参照
 * http://martinfowler.com/articles/mocksArentStubs.html
 */
describe('FieldModel with mock', function() {
  var server;
  
  // sinonでダミーのxhrをレスポンスを返す疑似サーバーを起動
  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  // ダミーのレスポンスを止めさせる
  afterEach(function() {
    server.restore();
  });

  /*
   * テストサンプル
   * FieldModelが生成と初期化時をサーバのスタブを使ってテスト
   */
  it('should create server side map', function() {
    var size = ~~(Math.random() * 10) + 1;
    server.respondWith([
      200,  // ステータスコードは200
      {}, // ヘッダの指定はなし
      JSON.stringify({  // 適当なsizeをサーバのレスポンスjsonとして返す
        xSize: size,
        ySize: size
      })
    ]);
    
    var isFieldCreated = false;
    
    // フィールド作成と非同期初期化
    var fieldModel = new FieldModel();
    fieldModel.init(function() {
      // この中は、下にあるserver.respond()が呼ばれた時に呼ばれる
      isFieldCreated = true;
    });
    
    runs(function() {
      // 疑似サーバにxhrのレスポンスを返させる。
      // 非同期処理をエミュレートしたいので、runs()でくるむ
      server.respond();
    });

    // フィールドの初期化が完了したら次に進む
    waitsFor(function() {
      return isFieldCreated;
    });

    // FieldModelのフィールドサイズが、ダミーサーバが返したものと合っているか確認
    runs(function() {
      expect(fieldModel.xSize).toEqual(size);
      expect(fieldModel.ySize).toEqual(size);
    });
  });

  /*
   * 演習1. openMass()のテストとして、下記のテストケースの一部を実装する
   */
  /*
  it('should open mine mass in the case of that server responses mine', function() {
    // 途中まではサンプルと同じ。通常は他のテストケースと共通化する
    var size = ~~(Math.random() * 10) + 1;
    server.respondWith([
      200,  // ステータスコードは200
      {}, // ヘッダの指定はなし
      JSON.stringify({  // 適当なsizeをサーバのレスポンスjsonとして返す
        xSize: size,
        ySize: size
      })
    ]);
    
    var isFieldCreated = false;
    
    // フィールド作成と非同期初期化
    var fieldModel = new FieldModel();
    fieldModel.init(function() {
      // この中は、下にあるserver.respond()が呼ばれた時に呼ばれる
      isFieldCreated = true;
    });
    
    runs(function() {
      // 疑似サーバにxhrのレスポンスを返させる。
      // 非同期処理をエミュレートしたいので、runs()でくるむ
      server.respond();
    });
    
    // フィールドの初期化が完了したら次に進む
    waitsFor(function() {
      return isFieldCreated;
    });

    // ここから先を実装する
    // 地雷を返すダミーのレスポンスを設定して、openMass()を呼んで、getMassFlag()で地雷が地雷を返すことを確認する
    // それぞれ、runs()内に書く必要があることに注意
  });
  */
});
