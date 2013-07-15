describe('FieldModel with mock', function() {
  var server;
  
  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });
  
  it('should create server side map', function() {
    var size = ~~(Math.random() * 10) + 1;
    server.respondWith([
      200,
      {},
      JSON.stringify({
        xSize: size,
        ySize: size
      })
    ]);
    
    var isFieldCreated = false;
    
    var fieldModel = new FieldModel();
    fieldModel.init(function() {
      isFieldCreated = true;
    });
    
    runs(function() {
      server.respond();
    });

    waitsFor(function() {
      return isFieldCreated;
    });

    runs(function() {
      expect(fieldModel.xSize).toEqual(size);
      expect(fieldModel.ySize).toEqual(size);
    });
  });

});
