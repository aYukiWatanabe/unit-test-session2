describe('FieldModel', function() {
  var fieldModel;

  // 各テストの前に実行される
  beforeEach(function() {
    var isFieldCreated = false;

    fieldModel = new FieldModel();
    fieldModel.init(function() {
      isFieldCreated = true;
    });
    
    waitsFor(function() {
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
  
  it('should create server side map that have mine', function() {
    var map = null;
    fieldModel.debugRequestMap(function(m) {
      map = m;
    });

    waitsFor(function() {
      return map;
    });

    runs(function() {
      var mines = map.filter(function(massFlag) {
        return massFlag | FieldModel.massFlags.MINE;
      });
      expect(mines.length).toNotEqual(0);
    });
  });

});
