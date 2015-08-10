define(["backbone", "backbone.marionette", "leaflet", "d3", "communicator", "config", "jquery", "underscore",
        "leaflet.markercluster", "leaflet.smoothmarkerbouncing", "leaflet.proj",
        "tpl!template/map.html"],
  function(Backbone, Marionette, L, d3, Communicator, Config, $, _,
           LeafletMarkerCluster, LeafletBouncing, LeafletProjections,
           Template) {

  return Marionette.ItemView.extend({

    // Marionette properties.
    events: {},
    template: Template,

    // ID of dom element where Leaflet will be rendered.
    mapboxContainer: "map",

    // Marionette layout instance.
    layout: null,

    // Instance of a PopupView.
    popup: null,

    // Collections
    markerCollection: null,

    initialize: function(o) {

      var self = this;
      _.bindAll(this, 'updateMapSize', 'addMarker');

      this.state = o.state;
      this.layout = o.layout;
      this.markerCollection = o.markers;

      $( window ).resize( _.throttle( this.updateMapSize, 150 ) );

      // this.registerAutoWidthMarker();
      this.registerLeafletZoomThrottle(200);

      /**
       * Event listeners
       */

      Communicator.mediator.on("map:panTo", function(o) {
        var latlng = L.latLng( [o.latitude, o.longitude] );
        self.map.panTo(latlng);
      });
      Communicator.mediator.on("map:zoomIn", function() {
        this.map.setZoom(this.map.getZoom() + 1);
      }, this);
      Communicator.mediator.on("map:zoomOut", function() {
        this.map.setZoom(this.map.getZoom() - 1);
      }, this);
      Communicator.mediator.on("map:changeBase", function(tileId) {
        self.setBaseMap(tileId);
        self.state.save();
      });
      Communicator.mediator.on("map:updateSize", function() {
        _.throttle( self.updateMapSize, 150 )
      });
      Communicator.reqres.setHandler( "getMap", function() { return self.map; });
      this.state.on("change:baseMap", function(model) {
        self.setBaseMap(model.get('baseMap'));
      })

    },

    /**
     * Take model of marker and add to map.
     * @param m - model
     */
    addMarker: function(m) {
      var self = this;
      if (!m.get( 'latitude' ) || !m.get( 'longitude' )) {
        console.log('invalid marker:', m);
        return false;
      }
      var geojson = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [m.get( 'longitude' )[0], m.get( 'latitude' )[0]]
        },
        properties: {
          title: m.get('title'),
          'marker-color': Config.colors.primary
        }
      };
      //var latlng = L.latLng( [m.get( 'latitude' )[0], m.get( 'longitude' )[0]] );
      var marker = L.mapbox.featureLayer();
      marker.setGeoJSON(geojson);
      marker.on("click", function() {
        Communicator.mediator.trigger("marker:click", m)
      });
      this.layer_markers.addLayer(marker);
    },


    /**
     * Create an alternative to the L.divIcon marker, which does not support variable widths
     */
    registerAutoWidthMarker: function() {
      var self = this;
      L.DivIconAutosize = L.Icon.extend({
        options: {
          iconSize: [12, 12], // also can be set through CSS
          /*
           iconAnchor: (Point)
           popupAnchor: (Point)
           html: (String)
           bgPos: (Point)
           */
          iconHeight: 30,
          iconAnchorHeight: 44,
          className: 'leaflet-div-icon',
          html: false
        },

        createIcon: function (oldIcon) {
          var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
            options = this.options;

          div.innerHTML = options.html !== false ? options.html : '';
          this.options.iconSize = [undefined, this.options.iconHeight];
          this.options.iconAnchor = [105, this.options.iconAnchorHeight];

          if (options.bgPos) {
            div.style.backgroundPosition = (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
          }

          this._setIconStyles(div, 'icon');

          // Temporarily attach div to the dom so we can calculate the width.
          var $temp = $(div).clone().appendTo( '#' + self.mapboxContainer );
          $temp.width('auto');
          var w = $temp.outerWidth();
          $temp.remove();

          this.options.iconSize = [w, this.options.iconHeight];
          this.options.iconAnchor = [w / 2, this.options.iconAnchorHeight];

          // Necessary to set this twice, limitation of Leaflet
          this._setIconStyles(div, 'icon');

          return div;
        },

        createShadow: function () {
          return null;
        }
      });

      L.divIconAutosize = function (options) {
        return new L.DivIconAutosize(options);
      };
    },

    /**
     * Reduces the speed of Leaflet's mouse zooming.
     */
    registerLeafletZoomThrottle: function(throttle) {
      var lastScroll = new Date().getTime();
      L.Map.ScrollWheelZoom.prototype._onWheelScroll = function (e) {
        if (new Date().getTime() - lastScroll < throttle) { return; }
        var delta = L.DomEvent.getWheelDelta(e);
        var debounce = this._map.options.wheelDebounceTime;

        this._delta += delta;
        this._lastMousePos = this._map.mouseEventToContainerPoint(e);

        if (!this._startTime) {
          this._startTime = +new Date();
        }

        var left = Math.max(debounce - (+new Date() - this._startTime), 0);

        clearTimeout(this._timer);
        lastScroll = new Date().getTime();
        this._timer = setTimeout(L.bind(this._performZoom, this), left);

        L.DomEvent.stop(e);
      }
    },

    onShow: function() {

      var self = this;

      // Load map.
      this.updateMapSize();
      L.mapbox.accessToken = Config.mapbox.accessToken;
      this.map = L.mapbox.map(this.mapboxContainer, null, {
        boxZoom: true,
        worldCopyJump: true
      });
      this.setBaseMap( this.state.get('baseMap') || "osm" );
      this.map.setView( [52.121580, 5.6304], 8 );

      // Initialize markers
      this.layer_markers = new L.MarkerClusterGroup().addTo(this.map);
      if (this.markerCollection.length > 0) {
        this.markerCollection.each(function(m) {
          self.addMarker(m);
        });
      }
      this.markerCollection.on("add", function(m) {
        self.addMarker(m);
        self.map.panTo( latlng );
      });

      // Event handlers
      $( '.leaflet-overlay-pane' ).click( function() {
        Communicator.mediator.trigger( "map:tile-layer-clicked" );
      } );

      this.map.on('boxzoomend', function(e) {

        _.each(self.layer_markers.getLayers(), function(marker) {
          if (e.boxZoomBounds.contains(marker.getLatLng())) {
            marker.feature.properties['marker-color'] = Config.colors.secondary;
          } else {
            marker.feature.properties['marker-color'] = Config.colors.primary;
          }
          marker.setGeoJSON(marker.fe)
        });
      });

      // SVG from Leaflet.
      this.map._initPathRoot();
      this.svg = d3.select('#' + this.mapboxContainer).select("svg");
      this.g = this.svg.append("g");

    },

    setBaseMap: function(tileId) {
      var self = this;
      var tile = _.findWhere( Config.tiles, {id: tileId} );
      if (!tile) return;
      if (self.baseLayer) self.map.removeLayer(self.baseLayer);
      if (tile.type == "mapbox") {
        self.baseLayer = L.mapbox.tileLayer( tile.id ).addTo( self.map );
      } else {
        self.baseLayer = L.mapbox.tileLayer( tile.tilejson ).addTo( self.map );
      }
      self.state.set('baseMap', tile.id );
    },

    updateMapSize: function() {

      this.height = $( window ).height();
      if ($('header').css('display') != 'none') {
        this.height -= $( 'header' ).height();
      }
      this.width = $( window ).width();
      $( '#' + this.mapboxContainer ).css( 'height', this.height );

    }

  });

});