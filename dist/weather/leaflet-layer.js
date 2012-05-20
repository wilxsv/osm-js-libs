// Generated by CoffeeScript 1.3.1
(function() {
  var Layer;

  Layer = L.Class.extend({
    defaultI18n: {
      en: {
        currentTemperature: "Temperature",
        maximumTemperature: "Max. temp",
        minimumTemperature: "Min. temp",
        humidity: "Humidity",
        wind: "Wind",
        show: "Snow",
        snow_possible: "Snow possible",
        rain: "Rain",
        rain_possible: "Rain possible",
        icerain: "Ice rain",
        rime: "Rime",
        rime_possible: "Rime",
        clear: "Clear"
      },
      ru: {
        currentTemperature: "Температура",
        maximumTemperature: "Макс. темп",
        minimumTemperature: "Мин. темп",
        humidity: "Влажность",
        wind: "Ветер",
        show: "Снег",
        snow_possible: "Возможен снег",
        rain: "Дождь",
        rain_possible: "Возможен дождь",
        icerain: "Ледяной дождь",
        rime: "Гололед",
        rime_possible: "Возможен гололед",
        clear: "Ясно"
      }
    },
    includes: L.Mixin.Events,
    initialize: function(options) {
      this.options = options != null ? options : {};
      this.layer = new L.LayerGroup();
      this.sourceUrl = "http://openweathermap.org/data/getrect?type={type}&lat1={minlat}&lat2={maxlat}&lng1={minlon}&lng2={maxlon}";
      this.sourceRequests = {};
      this.clusterWidth = this.options.clusterWidth || 150;
      this.clusterHeight = this.options.clusterHeight || 150;
      this.type = this.options.type || 'city';
      this.i18n = this.options.i18n || this.defaultI18n[this.options.lang || 'en'];
      return Layer.Utils.checkSunCal();
    },
    onAdd: function(map) {
      this.map = map;
      this.map.addLayer(this.layer);
      this.map.on('moveend', this.update, this);
      return this.update();
    },
    onRemove: function(map) {
      if (this.map !== map) {
        return;
      }
      this.map.off('moveend', this.update, this);
      this.map.removeLayer(this.layer);
      return this.map = void 0;
    },
    getAttribution: function() {
      return 'Weather data provided by <a href="http://openweathermap.org/">OpenWeatherMap</a>.';
    },
    update: function() {
      var req, url, _ref;
      _ref = this.sourceRequests;
      for (url in _ref) {
        req = _ref[url];
        req.abort();
      }
      this.sourceRequests = {};
      return this.updateType(this.type);
    },
    updateType: function(type) {
      var bounds, ne, sw, url,
        _this = this;
      bounds = this.map.getBounds();
      sw = bounds.getSouthWest();
      ne = bounds.getNorthEast();
      url = this.sourceUrl.replace('{type}', type).replace('{minlat}', sw.lat).replace('{maxlat}', ne.lat).replace('{minlon}', sw.lng).replace('{maxlon}', ne.lng);
      return this.sourceRequests[type] = Layer.Utils.requestJsonp(url, function(data) {
        var cells, key, ll, p, st, _i, _len, _ref;
        delete _this.sourceRequests[type];
        _this.map.removeLayer(_this.layer);
        _this.layer.clearLayers();
        cells = {};
        _ref = data.list;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          st = _ref[_i];
          ll = new L.LatLng(st.lat, st.lng);
          p = _this.map.latLngToLayerPoint(ll);
          key = "" + (Math.round(p.x / _this.clusterWidth)) + "_" + (Math.round(p.y / _this.clusterHeight));
          if (!cells[key] || parseInt(cells[key].rang) < parseInt(st.rang)) {
            cells[key] = st;
          }
        }
        for (key in cells) {
          st = cells[key];
          _this.layer.addLayer(_this.buildMarker(st, new L.LatLng(st.lat, st.lng)));
        }
        return _this.map.addLayer(_this.layer);
      });
    },
    buildMarker: function(st, ll) {
      var marker, markerIcon, popupContent, typeIcon, weatherIcon, weatherText;
      weatherText = this.weatherText(st);
      weatherIcon = this.weatherIcon(st);
      popupContent = "<div class=\"weather-place\">";
      popupContent += "<img height=\"38\" width=\"45\" style=\"border: none; float: right;\" alt=\"" + weatherText + "\" src=\"" + weatherIcon + "\" />";
      popupContent += "<h3>" + st.name + "</h3>";
      popupContent += "<p>" + weatherText + "</p>";
      popupContent += "<p>";
      popupContent += "" + this.i18n.currentTemperature + ": " + (this.toCelc(st.temp)) + " °C<br />";
      popupContent += "" + this.i18n.maximumTemperature + ": " + (this.toCelc(st.temp_max)) + " °C<br />";
      popupContent += "" + this.i18n.minimumTemperature + ": " + (this.toCelc(st.temp_min)) + " °C<br />";
      popupContent += "" + this.i18n.humidity + ": " + st.humidity + "<br />";
      popupContent += "" + this.i18n.wind + ": " + st.wind_ms + " m/s<br />";
      popupContent += "</p>";
      popupContent += "</div>";
      typeIcon = this.typeIcon(st);
      markerIcon = typeIcon ? Layer.Utils.buildTypeIcon(typeIcon) : Layer.Utils.buildWeatherIcon(weatherIcon);
      marker = new L.Marker(ll, {
        icon: markerIcon
      });
      marker.bindPopup(popupContent);
      return marker;
    },
    weatherIcon: function(st) {
      var cl, day, i, img, _i, _len, _ref;
      day = this.dayTime(st);
      cl = st.cloud;
      img = 'transparent';
      if (cl < 25 && cl >= 0) {
        img = '01' + day;
      }
      if (cl < 50 && cl >= 25) {
        img = '02' + day;
      }
      if (cl < 75 && cl >= 50) {
        img = '03' + day;
      }
      if (cl >= 75) {
        img = '04';
      }
      if (st.prsp_type === '1' && st.prcp > 0) {
        img = '13';
      }
      if (st.prsp_type === '4' && st.prcp > 0) {
        img = '09';
      }
      _ref = ['23', '24', '26', '27', '28', '29', '33', '38', '42'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        if (st.prsp_type === i) {
          img = '09';
        }
      }
      return "http://openweathermap.org/images/icons60/" + img + ".png";
    },
    typeIcon: function(st) {
      if (st.datatype === 'station') {
        if (st.type === '1') {
          return "http://openweathermap.org/images/list-icon-3.png";
        } else if (st.type === '2') {
          return "http://openweathermap.org/images/list-icon-2.png";
        }
      }
    },
    weatherText: function(st) {
      if (st.prsp_type === '1') {
        if (st.prcp !== 0 && st.prcp > 0) {
          return "" + this.i18n.snow + " ( " + st.prcp + " mm )";
        } else {
          return this.i18n.snow_possible;
        }
      } else if (st.prsp_type === '2') {
        if (st.prcp !== 0 && st.prcp > 0) {
          return "" + this.i18n.rime + " ( " + st.prcp + " mm )";
        } else {
          return this.i18n.rime_possible;
        }
      } else if (st.prsp_type === '3') {
        return this.i18n.icerain;
      } else if (st.prsp_type === '4') {
        if (st.prcp !== 0 && st.prcp > 0) {
          return "" + this.i18n.rain + " ( " + st.prcp + " mm )";
        } else {
          return this.i18n.rain_possible;
        }
      } else {
        return this.i18n.clear;
      }
    },
    dayTime: function(st) {
      var dt, times;
      if (typeof SunCalc === "undefined" || SunCalc === null) {
        return 'd';
      }
      dt = new Date();
      times = SunCalc.getTimes(dt, st.lat, st.lng);
      if (dt > times.sunrise && dt < times.sunset) {
        return 'd';
      } else {
        return 'n';
      }
    },
    toCelc: function(t) {
      return Math.round((t - 273.15) * 100) / 100;
    }
  });

  Layer.Utils = {
    callbacks: {},
    callbackCounter: 0,
    typeIconCache: {},
    weatherIconCache: {},
    buildWeatherIcon: function(url) {
      var iconClass;
      if (this.weatherIconCache[url]) {
        return this.weatherIconCache[url];
      }
      iconClass = L.Icon.extend({
        iconUrl: url,
        iconSize: new L.Point(60, 50),
        iconAnchor: new L.Point(30, 30),
        popupAnchor: new L.Point(0, -25),
        options: {
          iconUrl: url,
          iconSize: new L.Point(60, 50),
          iconAnchor: new L.Point(30, 30),
          popupAnchor: new L.Point(0, -25)
        }
      });
      return this.weatherIconCache[url] = new iconClass();
    },
    buildTypeIcon: function(url) {
      var iconClass;
      if (this.typeIconCache[url]) {
        return this.typeIconCache[url];
      }
      iconClass = L.Icon.extend({
        iconUrl: url,
        iconSize: new L.Point(24, 24),
        iconAnchor: new L.Point(12, 12),
        popupAnchor: new L.Point(0, -12),
        options: {
          iconUrl: url,
          iconSize: new L.Point(23, 24),
          iconAnchor: new L.Point(12, 12),
          popupAnchor: new L.Point(0, -12)
        }
      });
      return this.typeIconCache[url] = new iconClass();
    },
    checkSunCal: function() {
      var el;
      if (typeof SunCalc !== "undefined" && SunCalc !== null) {
        return;
      }
      el = document.createElement('script');
      el.src = 'https://raw.github.com/mourner/suncalc/master/suncalc-min.js';
      el.type = 'text/javascript';
      return document.getElementsByTagName('body')[0].appendChild(el);
    },
    requestJsonp: function(url, cb) {
      var abort, callback, counter, delim, el,
        _this = this;
      el = document.createElement('script');
      counter = (this.callbackCounter += 1);
      callback = "OsmJs.Weather.LeafletLayer.Utils.callbacks[" + counter + "]";
      abort = function() {
        if (el.parentNode) {
          return el.parentNode.removeChild(el);
        }
      };
      this.callbacks[counter] = function(data) {
        delete _this.callbacks[counter];
        return cb(data);
      };
      delim = url.indexOf('?') >= 0 ? '&' : '?';
      el.src = "" + url + delim + "callback=" + callback;
      el.type = 'text/javascript';
      document.getElementsByTagName('body')[0].appendChild(el);
      return {
        abort: abort
      };
    }
  };

  if (!this.OsmJs) {
    this.OsmJs = {};
  }

  if (!this.OsmJs.Weather) {
    this.OsmJs.Weather = {};
  }

  this.OsmJs.Weather.LeafletLayer = Layer;

}).call(this);
