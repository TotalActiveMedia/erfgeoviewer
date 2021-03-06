require(['backbone', 'erfgeoviewer.common', 'communicator', 'underscore', 'jquery', 'leaflet', 'config', 'q', 'share.button',
    'views/map', 'views/layout/header.layout', 'views/detail', 'views/detail-navigation', 'views/legend', 'views/layout/detail.layout',
    'views/search/search', 'views/new', 'views/open', 'plugins/routeyou/routeyou', 'erfgeoviewer.search',
    'models/layers', 'models/state', 'models/sidenav', 'models/navbar'],

  function( Backbone, App, Communicator, _, $, L, Config, Q, ShareButton,
            MapView, HeaderView, DetailView, DetailNavigationView, LegendView, DetailLayout,
            SearchView, NewMapView, OpenMapView, RouteyouModule, SearchModule,
            LayerCollection, State, SideNav, NavBar ) {

    console.log('Erfgeoviewer: reader mode.');

    if (Config.controls.newMap || false) {
      SideNav.addItem('new_map', {
        fragment: 'new',
        icon: 'map',
        label: 'Nieuwe kaart'
      });
    }

    if (Config.controls.openMap || false) {
      SideNav.addItem('open_map', {
        fragment: 'open',
        icon: 'folder-open-empty',
        label: 'Open'
      });
    }

    var init = function() {

      /**
       * Event handlers.
       */
      Communicator.reqres.setHandler("app:get", function() {
        return App;
      });
      Communicator.reqres.setHandler("router:get", function() {
        return App.router;
      });
      Communicator.mediator.on('map:ready', function( map ) {

        /**
         * Legend
         */
        if (State.getPlugin('map_settings').model.get('showLegend') && State.getPlugin('map_settings').model.get('legend')) {
          var legend = L.control({position: 'bottomleft'});

          legend.onAdd = function( map ) {
            // Render legend
            var legendView = new LegendView({legend: State.getPlugin('map_settings').model.get('legend')});
            return legendView.render().$el[0];
          };

          legend.addTo(map);
        }

        /**
         * Share
         */
        if (State.getPlugin('map_settings').model.get('showShare')) {
          var share = L.control({position: 'bottomleft'});

          share.onAdd = function( map ) {
            return document.createElement('share-button');
          };

          share.addTo(map);

          new ShareButton({
            title: State.getPlugin('map_settings').model.get('title'),
            description: State.getPlugin('map_settings').model.get('title') + ' #kaart #erfgoed',
            ui: {
              flyout: 'top right',
              buttonText: 'Delen'
            },
            networks: {
              linkedin: {
                enabled: false
              },
              pinterest: {
                enabled: false
              },
              reddit: {
                enabled: false
              },
              email: {
                description: "Ik wil graag een kaart met je delen:\n\n" + window.location.href
              }
            }
          });
        }
      });
      Communicator.mediator.on("marker:click", function( m ) {
        var detailLayout = new DetailLayout();

        App.flyouts.getRegion('detail').show(detailLayout);

        detailLayout.getRegion('container').show(new DetailView({model: m}));
        detailLayout.getRegion('footer').show(new DetailNavigationView({model: m}));
      });
      Communicator.mediator.on("all", function( e, a ) {
        // Debugging:
        console.log("event: " + e, a);
      });


      /**
       * Router.
       */
      var routes = {
        "": function() {
          App.flyouts.getRegion('bottom').hideFlyout();
          App.flyouts.getRegion('right').hideFlyout();
        },
      };

      if (State.getPlugin('map_settings').model.get('showSearchFilter')) {
        NavBar.addItem('add', {
          fragment: 'search',
          label: 'Zoek',
          weight: 1000
        });

        routes = _.extend(routes, {
          "search": function() {
            var searchModule = new SearchModule({
              markers_collection: State.getPlugin('geojson_features').collection
            });

            var markerView = new SearchView({
              searchModule: searchModule
            });

            App.flyouts.getRegion('bottom').hideFlyout();
            App.flyouts.getRegion('right').show(markerView);
          }
        });
      }

      if (Config.controls.newMap || false) {
        routes = _.extend(routes, {
          "new": function() {
            App.flyouts.getRegion('bottom').hideFlyout();
            App.layout.getRegion('modal').show(new NewMapView());
          }
        });
      }

      if (Config.controls.openMap || false) {
        routes = _.extend(routes, {
          "open": function() {
            App.flyouts.getRegion('bottom').hideFlyout();
            App.layout.getRegion('modal').show(new OpenMapView());
          }
        });
      }

      var Router = Marionette.AppRouter.extend({
        routes: routes
      });
      App.router = new Router();

      Communicator.reqres.setHandler("router:get", function() {
        return App.router;
      });


      /**
       * Init.
       */
      App.mode = "reader";
      App.container.$el.addClass("mode-" + App.mode);
      App.map_view = new MapView({
        layout: App.layout
      });

      App.layout.getRegion('content').show(App.map_view);
      App.layout.getRegion('header').show(new HeaderView());

      App.start();


    };

    State.pluginsInitialized.promise
      .then(function() {
        var d = Q.defer();

        if (typeof window.erfgeoviewer !== "undefined" && _.isObject(window.erfgeoviewer)) {

          if (window.erfgeoviewer.dataFile) {
            // Load a JSON file.
            $.ajax(erfgeoviewer.dataFile).done(function( data ) {
              State.set(State.parse(data));
              d.resolve();
            });
          } else if (window.erfgeoviewer.data) {
            // Digest a JSON object
            State.set(State.parse(window.erfgeoviewer.data));
            d.resolve();
          }

        }
        else {
          State.fetch({
            success: d.resolve,
            error: d.resolve // Also resolve on error to prevent unhandled exceptions on empty state
          });
        }

        return d.promise;
      })
      .then(Config.makiCollection.getPromise)
      .done(init);

  });
