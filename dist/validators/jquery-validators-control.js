// Generated by CoffeeScript 1.3.1
(function() {
  var JqueryValidatorsControl;

  JqueryValidatorsControl = (function() {

    JqueryValidatorsControl.name = 'JqueryValidatorsControl';

    function JqueryValidatorsControl(elem, layer, options) {
      var url, validator, _i, _len, _ref, _ref1,
        _this = this;
      this.elem = elem;
      this.layer = layer;
      this.options = options != null ? options : {};
      this.validators = [];
      if (this.options.validators) {
        _ref = this.options.validators;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          validator = _ref[_i];
          this.validators.push(validator);
        }
      }
      _ref1 = this.layer.validators;
      for (url in _ref1) {
        validator = _ref1[url];
        this.validators.push(validator);
      }
      this.layer.on('validatoradd', function(e) {
        if (_this.validators.indexOf(e.validator) < 0) {
          _this.validators.push(e.validator);
        }
        return _this.update();
      });
      this.layer.on('validatorremove', this.update, this);
      this.update();
    }

    JqueryValidatorsControl.prototype.update = function() {
      var validator, _i, _len, _ref, _results;
      this.elem.html('');
      _ref = this.validators;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        validator = _ref[_i];
        _results.push(this.elem.append(this.buildListItem(validator)));
      }
      return _results;
    };

    JqueryValidatorsControl.prototype.buildListItem = function(validator) {
      var cb, li,
        _this = this;
      cb = $('<input type="checkbox" />');
      if (this.layer.validators[validator.url]) {
        cb.attr('checked', 'checked');
      }
      cb.change(function() {
        if (cb.attr('checked')) {
          return _this.layer.addValidator(validator);
        } else {
          return _this.layer.removeValidator(validator);
        }
      });
      li = $('<li />');
      li.append(cb);
      li.append(validator.name);
      return li;
    };

    return JqueryValidatorsControl;

  })();

  jQuery.fn.validatorsControl = function(layer, options) {
    return this.each(function() {
      return new JqueryValidatorsControl($(this), layer, options);
    });
  };

}).call(this);
