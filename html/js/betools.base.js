var M17BackendTools = new Class({
    Implements:[Options, Events],
    options:{

    },
    initialize:function (options) {
        this.setOptions(options);
        this.url = new URI(location.href);
        this.loadAlways();
        this.beCallbackDelegator(this.loadAlways.bind(this));
    },
    loadAlways: function() {
        this.showInformations();
        this.SaveAndCloseLightbox();
        this.removeArticleEditHide(document.id('main'));
        if(this.extendInit) {
            this.extendInit();
        }
        this.lbScanPage();
    },
    beCallbackDelegator: function(callback) {
        var self = this,
            callback = (typeOf(callback) === 'function') ? callback : false;
        if(callback) {
            window.addEvent('ajax_change', callback);
        }
    },
    lbScanPage: function() {
        return Mediabox.scanPage();
    },
    addLightboxToElement: function(el, name) {
        var _params = name+' 765 80%';

        el.set({
            'data-lightbox':_params,
            'href': el.get('href') + '&showOnlyMain=1'
        });
    },
    removeArticleEditHide:function (wrapper) {
        wrapper.getElements('.edit-header').each(function (el) {
            el.removeClass('invisible');
            this.addLightboxToElement(el, 'showArticle');
        }, this);
    },
    SaveAndCloseLightbox: function() {
        if(this.url.getData('showOnlyMain')) {
            $$('.tl_form').each(function(el){
                /* The hidebox should be include outside as global method


                if(el.get('id') != 'tl_version') {

                    if(parent.document.id('mbImage').getNext().get('id') != 'svhint') {
                        var waitScreen = new Spinner(parent.document.id('mbImage'), {
                        'message': 'Please wait, Contao saves your changes',
                        'class': 'saving-hint',
                        'id': 'svhint'
                    });
                    }

                el.set('action', el.get('action')+'&reload=1');
                if(this.url.getData('reload') && $$('#main form .error').length < 1)
                {
                    parent.location.href = parent.location.href;
                }

                if($$('#main form .error').length > 1) {
                    parent.document.id('svhint').hide();
                }

                el.addEvent('submit', function(e) {

                    parent.document.id('svhint').show();
                });
                }*/
            },this);
        }
    },
    showInformations: function() {
        return $$('#main a img[src$=show.gif]').each(function(el){
            this.addLightboxToElement(el.getParent('a'), 'showInformations');
        }, this);
    }
});