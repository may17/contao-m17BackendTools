M17BackendTools.implement({
    extendInit: function() {
        this.colSave($$(".m17BT-colList a"));
        this.fastPageEdit();
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
                onRequest: AjaxRequest.displayBox('Saving Data …'),
                onSuccess: function(responseText, responseXML) {
                    AjaxRequest.hideBox();
                    _howdy.set('text', _hrefLabel);
                }
            });
            xhr.send();
        });
    },
    fastPageEdit: function() {
        var pagesFolderRight = $$('.tl_folder .tl_right'),
            editShadow = document.getElement('.tl_file img[src$=edit.gif]').getParent('a').addClass('editPage'),
            self = this;

        pagesFolderRight.each(function(el) {
            if(!el.getElement('.editPage')) {
                var url = new URI(el.getParent().getElement('a.tl_gray').get('href'));
                var pageId = url.getData('page');
                var button = editShadow.clone().set({
                    'href': 'contao/main.php?do=page&act=edit&id='+pageId,
                    'title': ''
                });

                self.addLightboxToElement(button, 'fastEditPage');

                button.inject(el, 'inside');
            }
        });
    },
});
