function FieldView(params) {
  this._model = params.model;
  this._el = null;

  this._initElements();
  this._initElementHandlers();
  this._initModelHandlers();
  this._render();
}
FieldView.WIDTH = 300;
FieldView.HEIGHT = 300;
FieldView.prototype.destroy = function() {
  $(this._el).remove();
  this._el = null;
};

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
          'data-x': x,
          'data-y': y 
        }).css({
          width: FieldView.WIDTH / this._model.xSize + 'px',
          height: FieldView.HEIGHT / this._model.ySize + 'px'
        });
      this._el.append(mass);
    }
  }
};
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
FieldView.prototype._initModelHandlers = function() {
  var self = this;
  this._model.addObserver({
    opened: function() { self._render(); }
  });
};
FieldView.prototype._render = function() {
  var self = this;
  this._el.find('.mass').each(function() {
    var el = $(this);
    var x = +el.attr('data-x');
    var y = +el.attr('data-y');
    
    var f = self._model.getMassFlag(x, y);
    el.toggleClass('is-opened', !!(f & FieldModel.massFlags.OPENED));
  });
};

FieldView.prototype.getElement = function() {
  return this._el;
};
FieldView.prototype.showGameOver = function() {
  this._el.find('.mass').each(function() {
    var rt = function() {
      return Math.random() * 1000 - 500 + 'px';
    };
    var rr = function() {
      return Math.random() * 2000 - 1000 + 'deg';
    };
    var el = $(this);
    el.css({
      'transform': 'translate3d(' + rt() + ',' + rt() + ',' + rt() + ') ' +
        'rotateX(' + rr() + ') rotateY(' + rr() + ') rotateZ(' + rr() + ')',
      'background-color': 'red',
      'opacity': 0,
      'transition': 'all 5s ease-out'
    });
  });
};
