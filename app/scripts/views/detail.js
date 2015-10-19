define( ["backbone", "backbone.marionette", "communicator", "medium.editor", "config", "jquery", "erfgeoviewer.common",
    "tpl!template/detail.html"],
  function( Backbone, Marionette, Communicator, MediumEditor, Config, $, App,
            Template ) {

    return Marionette.ItemView.extend( {

      template: Template,
      layout: null,
      dom: {},

      events: {
        "click .change-style": function(e) {
          e.preventDefault();
        }
      },

      initialize: function( o ) {
        this.model = o.model;
        Communicator.mediator.on( "map:tile-layer-clicked", this.hideFlyout, this);
      },

      onShow: function() {
        var editables = $(".editable", this.$el).get();
        var self = this;
        var timeout;

        if (this.editor) this.editor.destroy();
        if (App.mode == "mapmaker") {
          this.editor = new MediumEditor(editables, {
            buttons: ['bold', 'italic', 'underline', 'anchor'],
            disableReturn: true
          });
          this.editor.subscribe('editableInput', function (event, editable) {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
              var field = $(editable).attr('id').substr(5);
              self.model.set(field, $(editable).html());
            }, 1000);
          });
        }
      },

      serializeModel: function(model) {
        if (false && model.get('externalUrl')) {
          return _.extend({
            fields: Config.fields
          }, model.toJSON.apply(model, _.rest(arguments)));
        }
        else {
          return _.extend({
            fields: Config.fields
          }, model.toJSON.apply(model, _.rest(arguments)), {
            externalUrl: 'url'
          });
        }
      }

    } );

  } );
