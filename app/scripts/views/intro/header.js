define(['backbone', 'backbone.marionette', 'tpl!template/intro/header.html'],
  function( Backbone, Marionette, Template ) {

    return Marionette.ItemView.extend({

      className: 'row',

      template: Template,

      initialize: function(o) {
        this.model = new Backbone.Model({
          alreadySeen: o.alreadySeen
        });
      }

    });

  });