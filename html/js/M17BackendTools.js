var CONTAO_SAVING = 'Daten werden gespeichert';
var CONTAO_ERROR = 'Daten werden gespeichert';

var M17BackendTools;
M17BackendTools = new Class({
    Implements:[Options, Events],
    options:{
        'css':{
            'stickyClass':'stickySave'
        }
    },
    initialize:function (options) {
        this.setOptions(options);
        this.url = new URI(location.href);
    },
    tlArticle: function() {
        var self = this;
        window.addEvent('domready', function(){
            self.removeArticleEditHide($$('#main')[0]);
            self.showInformations();
            if($$(".m17BT-colList a").length > 0) {
                self.colSave($$(".m17BT-colList a"));
            }

            if(self.url.getData('showOnlyMain') && parent.document){
                self.SaveAndCloseLightbox();
            }
            self.delegateAjaxTreeActions();
            Mediabox.scanPage();
        });

    },
    delegateAjaxTreeActions: function() {
        var $this = this;
        window.addEvent('ajax_change', function() {
            $this.tlArticle();
        });
    },
    showInformations: function() {
        return $$('#main a img[src$=show.gif]').each(function(el){
            this.addLightboxToElement(el.getParent('a'), 'showInformations');
        }, this);
    },
    SaveAndCloseLightbox: function() {
        $$('.tl_form').each(function(el){
            el.set('action', el.get('action')+'&reload=1');
            if(this.url.getData('reload') && $$('#main form .error').length < 1)
            {
                parent.location.href = parent.location.href;
            }
        },this);
    },
    removeArticleEditHide:function (wrapper) {
        wrapper.getElements('.edit-header').each(function (el) {
            el.removeClass('invisible');
            this.addLightboxToElement(el, 'showArticle');
        }, this);
    },
    addLightboxToElement: function(el, name) {
        var _params = name+' 765 80%';

        el.set({
            'data-lightbox':_params,
            'href':el.get('href') + '&showOnlyMain=1'
        });
    },
    colSave: function(elSet) {
        elSet.addEvent('click', function(e){
            e.preventDefault();
            var _href = this.get('href');
            var _hrefLabel = this.get('text');
            var _howdy = this.getParent('.tl_left').getElement('.currentCol');
            var _parent = this.getParent('ul');
            var xhr = new Request.HTML({
                'url': _href,
                onRequest: AjaxRequest.displayBox(CONTAO_SAVING + ' …'),
                onFailure: AjaxRequest.displayBox(CONTAO_ERROR + '!'),
                onSuccess: function(responseText, responseXML) {
                    AjaxRequest.hideBox();
                    _howdy.set('text', _hrefLabel);
                }
            });
            xhr.send();
        });
    },
    //TODO Exprimental STUFF
    addDragADrop: function() {
        $$('.tl_listing .tl_file').each(function(el) {
            var moveItem = new Element('img', {'src': 'system/modules/m17BackendTools/html/img/icon/arrow-move.png','alt': 'move', 'class': 'movethis'});
            moveItem.inject(el.getElement('.tl_left a') ,'before');
        });


        $$('.tl_listing .tl_file').addEvent('mousedown', function(event) {
            event.stop();
            $this = this;
            if(event.target.hasClass('movethis')) {

                var cloneer = $this.getElement('.tl_left').clone().setStyles(this.getCoordinates()).setStyles({
                      opacity: 0.7,
                      position: 'absolute'
                    }).inject(document.body);
                cloneer.getElement('.rtz').setStyle('display', 'none');
                var drag = new Drag.Move(cloneer, {

                                  droppables: $$('.tl_listing .tl_file', '.tl_listing .tl_folder'),

                                  onDrop: function(dragging, goal){
                                      dragging.destroy();
                                      goal.setStyle('outline', 'none');
                                      $this.inject(goal,'after');
                                      var _padding;
                                      var doRequest = function(mode,pid,id) {
                                        var _xhr = new Request({
                                          'url': 'http://cto2111.local/contao/main.php?do=article&act=cut&mode=1&pid=17&id=10'
                                        });
                                      };

                                      if(goal.hasClass('tl_folder')) {
                                          _padding = goal.getElement('.tl_left').getStyle('paddingLeft').toInt() + 40;
                                      } else {
                                          _padding = goal.getElement('.tl_left').getStyle('paddingLeft').toInt();
                                      }

                                      $this.getElement('.tl_left').setStyles({
                                          'paddingLeft': _padding
                                      });


                                  },
                                  onEnter: function(dragging, goal){
                                        goal.setStyle('outline', '2px dotted #8AB858');
                                  },
                                  onLeave: function(dragging, goal){
                                      goal.setStyle('outline', 'none');
                                  },
                                  onCancel: function(dragging){
                                      dragging.destroy();
                                  }
                                });

                                    drag.start(event);
                            }

        });
    },
    // TODO Icons zusammenfassen
    stickCrudTogether: function() {
        var getTlRight = $$('.tl_right');

        getTlRight.each(function(el) {
            var firstEl = el.getFirst() || false,
                sibs = (firstEl) ? firstEl.getSiblings('a') : false,
                imgs = el.getElements('img');

            if(sibs) {
                var wrapper = new Element('div.bet-crudwarap');
                //sibs.setStyle('display', 'none');
                sibs.inject(wrapper);
                wrapper.inject(el);
            }

            imgs.each(function(img) {
                var altAttr = img.get('alt'),
                    info = new Element('span.bet-altlabel', {
                        text: altAttr
                    });
                info.inject(img, 'after');
            });

            if(firstEl) {
            el.addEvents({
                'mouseenter': function(e) {
                    this.addClass('hover');
                },
                'mouseleave': function(e) {
                    this.removeClass('hover');
                }
            });
            }
        });

    }
});
//var BE_TOOLS;
var BE_TOOLS = new M17BackendTools();



//console.log(BE_TOOLS);
