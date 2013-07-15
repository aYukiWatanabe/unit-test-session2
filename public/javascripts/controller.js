
function App() {
  this._fieldModel = null;
  this._fieldView = null;
}
App.prototype._reset = function(opt_proc) {
  if (this._fieldModel) {
    this._fieldModel.destroy();
  }
  if (this._fieldView) {
    this._fieldView.destroy();
  }
};
App.prototype._handleMassOpened = function(res) {
  if (res.flag & FieldModel.massFlags.MINE) {
    this._setGameOver();
  }
};
App.prototype._setGameOver = function() {
  this._fieldView.showGameOver();
};

App.prototype.start = function(opt_proc) {
  var self = this;
  this._reset();

  this._fieldModel = new FieldModel();
  this._fieldModel.init(function() {
    self._fieldView = new FieldView({
      model: self._fieldModel
    });
    $('.mount').append(self._fieldView.getElement());
  });

  this._fieldModel.addObserver({
    opened: function(res) { self._handleMassOpened(res); }
  });
};

$(document).ready(function() {
  var app = new App();
  $('.start-button').on('click', function() {
    app.start();
  });
});
