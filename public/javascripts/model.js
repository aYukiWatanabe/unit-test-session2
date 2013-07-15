function FieldModel() {
  this._listeners = {
    opened: []
  };
  this.xSize = -1;
  this.ySize = -1;
  this._map = null;
  this._clear();
}
FieldModel.prototype.destroy = function(params) {
  this._clear();
};
// 本来は共通化
FieldModel.massFlags = {
  NONE: 0x00,
  MINE: 0x01,
  OPENED: 0x0102
};
FieldModel.prototype._clear = function(params) {
  this._listeners = {
    opened: []
  };
};
FieldModel.prototype._ajax = function(params) {
  var newParams = {
    dataType: 'json'
  };
  $.extend(newParams, params);
  $.ajax(newParams);
};

FieldModel.prototype.init = function(proc) {
  this._requestCreateField({
    proc: proc
  });
};
FieldModel.prototype.addObserver = function(params) {
  this._listeners.opened.push(params.opened);
};
FieldModel.prototype._requestCreateField = function(params) {
  var self = this;
  var proc = params.proc || function() {};
  this._ajax({
    type: 'POST',
    url: '/api/field',
    success: function(res) {
      self._initMap(res);
      proc(res);
    }
  });
};
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
      self._handleMassOpened({
        x: x,
        y: y,
        isMine: res.isMine,
        proc: proc
      });
    }
  });
};
FieldModel.prototype._handleMassOpened = function(params) {
  var x = params.x;
  var y = params.y;
  var flag = FieldModel.massFlags.OPENED | (params.isMine && FieldModel.massFlags.MINE);
  this._map[x][y] = flag;
  var p = {
    x: x,
    y: y,
    flag: flag
  };
  this._listeners.opened.forEach(function(f) {
    f(p);
  });
  params.proc(p);
};

FieldModel.prototype.debugRequestMap = function(proc) {
  this._ajax({
    type: 'GET',
    url: '/api/debug/field/map',
    success: function(res) {
      proc(res);
    }
  });
};
FieldModel.prototype.openMass = function(params) {
  return this._requestOpenMass(params);
};
FieldModel.prototype.getMassFlag = function(x, y) {
  return this._map[x][y];
};
