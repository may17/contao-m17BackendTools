var M17BackendTools = new Class({
    Implements:[Options, Events],
    options:{
        'css':{
            'stickyClass':'stickySave'
        },
        'lang': {
            'Saving': 'Daten werden gespeichert'
        }
    },
    initialize:function (options) {
        this.setOptions(options);
        this.url = new URI(location.href);
        this.showInformations();
        //this.SaveAndCloseLightbox();
    },
    tlArticle: function() {
        var self = this;
        window.addEvent('domready', function(){
            self.removeArticleEditHide($$('#main')[0]);
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
                document.id('main').setStyles({
                    'height': '400px',
                    'overflow': 'hidden'
                });
                var waitScreen = new Spinner(document.body, {
                    'message': 'Please wait, Contao saves your changes',
                    'class': 'saving-hint'
                });

                waitScreen.show();
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
        var self = this;
        elSet.addEvent('click', function(e){
            e.preventDefault();
            var _href = this.get('href');
            var _hrefLabel = this.get('text');
            var _howdy = this.getParent('.tl_left').getElement('.currentCol');
            var _parent = this.getParent('ul');
            var xhr = new Request.HTML({
                'url': _href,
                onRequest: AjaxRequest.displayBox(self.options.lang.Saving + ' …'),
                onSuccess: function(responseText, responseXML) {
                    AjaxRequest.hideBox();
                    _howdy.set('text', _hrefLabel);
                }
            });
            xhr.send();
        });
    }
});