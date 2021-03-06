/**
 * Functions as an adaptor for field names from results to what the ErfGeoviewer expects
 */
define( ["backbone", "underscore", "config"], function( Backbone, _, Config ) {

  return Backbone.Model.extend( {

    defaults: {
      baseMap: 'CartoDB Positron',
      showMapTitle: false,
      showSearchFilter: false,
      showShare: false,
      showLegend: false,
      showList: false,
      primaryColor: Config.colors.primary,
      secondaryColor: Config.colors.secondary,
      legend: [],
      editorCenterPoint: [52.121580, 5.6304],
      editorZoom: 8,
      centerPoint: [52.121580, 5.6304],
      zoom: 8,
      title: 'ErfGeoviewer'
    }

  } );

});

