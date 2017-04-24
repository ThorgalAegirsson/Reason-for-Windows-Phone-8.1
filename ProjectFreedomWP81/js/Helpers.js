(function () {
    'use strict';
    
    //helpers for appbar
    function openLink() {
        let item = Reason.currentItem;
        let uri = new Windows.Foundation.Uri(item.origLink);
        Windows.System.Launcher.launchUriAsync(uri).done();
    }
    function showShareUI() {
        Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
    }

    function shareLink(e) {
        let item = Reason.currentItem;
        let request = e.request;
        request.data.properties.title = 'Reason: '+ item.title;
        request.data.properties.description = 'Article from Reason app for Windows Phone';
        request.data.setText('I want to share this article with you: ');
        request.data.setWebLink(new Windows.Foundation.Uri(item.origLink));
    }
    function saveArticle(e) {
        let item = Reason.currentItem;
        let savedArticles = Reason.savedArticles.map(function(savedItem){
            return savedItem.origLink;
        });
        let index = savedArticles.indexOf(item.origLink);
        console.log('saved articles index: ' + index);
        if (index === -1) {
            Reason.savedArticles.push(item);
        } else {
            Reason.savedArticles[index] = item;
        }
        WinJS.Application.
        console.log('saved articles:');
        console.log(Reason.savedArticles);
    }


    //export methods
    WinJS.Namespace.define('Helpers', {
        openLink: openLink,
        showShareUI: showShareUI,
        shareLink: shareLink,
        saveArticle: saveArticle
    });
})();