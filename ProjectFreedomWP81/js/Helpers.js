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
        let type = Reason.type;
        console.log('Reason.savedArticles before adding:');
        console.log(Reason.savedArticles);
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
        console.log('Reason.savedArticles:');
        console.log(Reason.savedArticles);
        let appData = Windows.Storage.ApplicationData.current;
        appData.localFolder.createFileAsync('savedArticles.txt', Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {
                return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(Reason.savedArticles));
            })
            .then(function (contents) {
                console.log('updated savedArticles:');
                console.log(contents);
            });
        //Helpers.savedArticlesContainer.values['savedArticle'] = JSON.stringify(Reason.savedArticles);
        //console.log('saved articles:');
        //console.log(Reason.savedArticles);
    }
    function removeArticle(e) {
        let item = Reason.currentItem;
        let savedArticles = Reason.savedArticles.map(function (savedItem) {
            return savedItem.origLink;
        });
        let index = savedArticles.indexOf(item.origLink);
        if (index === -1) return;
        Reason.savedArticles.splice(index, 1);
        let appData = Windows.Storage.ApplicationData.current;
        appData.localFolder.createFileAsync('savedArticles.txt', Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {
                return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(Reason.savedArticles));
            })
            .then(function (contents) {
                console.log('updated savedArticles:');
                console.log(contents);
            });
    }


    //export methods
    WinJS.Namespace.define('Helpers', {
        openLink: openLink,
        showShareUI: showShareUI,
        shareLink: shareLink,
        saveArticle: saveArticle,
        removeArticle: removeArticle
    });
})();