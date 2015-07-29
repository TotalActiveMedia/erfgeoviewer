require.config( {

  baseUrl: "/scripts",

  /* starting point for application */
  deps: ["backbone.marionette", "boot", "jquery"],

  jsx: {
    fileExtension: ".jsx",
    transformOptions: {
      harmony: true,
      stripTypes: false,
      inlineSourceMap: true
    },
    usePragma: false
  },

  paths: {

    /* Libraries */
    "backbone": "../bower_components/backbone/backbone",
    "backbone.marionette": "../bower_components/backbone.marionette/lib/core/backbone.marionette",
    "backbone.wreqr": "../bower_components/backbone.wreqr/lib/backbone.wreqr",
    "backbone.babysitter": "../bower_components/backbone.babysitter/lib/backbone.babysitter",
    "backbone.pageable.collection": "../bower_components/backbone.paginator/lib/backbone.paginator",
    "backbone.react.component": "../bower_components/backbone-react-component/lib/component",
    "backgrid": "../bower_components/backgrid/lib/backgrid",
    "backgrid.paginator": "../bower_components/backgrid-paginator/backgrid-paginator",
    "bootstrap": "vendor/bootstrap",
    "config": "config/dev",
    "d3": "../bower_components/d3/d3",
    "hammerjs": "../bower_components/hammerjs/hammer",
    "jquery": "../bower_components/jquery/dist/jquery",
    "jquery.hammer": "../bower_components/materialize/js/jquery.hammer",
    "jsx": "../bower_components/requirejs-react-jsx/jsx",
    "JSXTransformer": "../bower_components/react/JSXTransformer",
    "leaflet.markercluster": "../bower_components/leaflet.markercluster/dist/leaflet.markercluster",
    "leaflet.smoothmarkerbouncing": "../bower_components/Leaflet.SmoothMarkerBouncing/leaflet.smoothmarkerbouncing",
    "mapbox": "../bower_components/mapbox.js/mapbox.uncompressed",
    "materialize": "../bower_components/materialize/js/global",
    "materialize.cards": "../bower_components/materialize/js/cards",
    "materialize.modal": "../bower_components/materialize/js/leanModal",
    "materialize.forms": "../bower_components/materialize/js/forms",
    "materialize.tabs": "../bower_components/materialize/js/tabs",
    "materialize.sidenav": "../bower_components/materialize/js/sideNav",
    "materialize.waves": "../bower_components/materialize/js/waves",
    "medium.editor": "../bower_components/medium-editor/dist/js/medium-editor",
    "polyline": "../bower_components/polyline/src/polyline",
    "react": "../bower_components/react/react",
    "react.paginate": "../bower_components/react-paginate/index",
    "underscore": "../bower_components/underscore/underscore",
    "velocity": "../bower_components/velocity/velocity",

    /* Shortcut paths */
    "template": "../templates",
    "geo": "../geo",

    /* Pre-processors: tpl!template/filename.html */
    "text": "../bower_components/requirejs-text/text",
    "tpl": "../bower_components/requirejs-tpl/tpl"

  },

  wrapShim: true,

  shim: {

    "backbone": {
      "deps": [
        "underscore",
        "jquery"
      ],
      "exports": "Backbone"
    },

    "backbone.marionette": {
      "deps": [
        "backbone"
      ]
    },

    'backgrid': {
      deps: ['backbone'],
      exports: 'Backgrid'
    },

    'backgrid.paginator': { deps: ['backgrid'] },

    "leaflet.markercluster": {
      deps: ["mapbox"],
      exports: "L"
    },

    "leaflet.smoothmarkerbouncing": {
      deps: ["mapbox"],
      exports: "L"
    },

    "mapbox": {
      "exports": "L"
    },

    "materialize.modal": {
      deps: ["jquery"]
    },

    "materialize.forms": {
      deps: ["materialize"],
      exports: "Materialize"
    },

    "polyline": {
      "exports": "polyline"
    },

    // jquery plugins
    "velocity": ["jquery"],

    "underscore": {
      "exports": "_"
    },

    "jquery.hammer": {
      "deps": ["jquery", "hammerjs"]
    }

  }

} );
