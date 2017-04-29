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
        let type = Reason.type; //not in use, created for roaming purposes
        let savedArticles = Reason.savedArticles.map(function(savedItem){
            return savedItem.origLink;
        });
        let index = savedArticles.indexOf(item.origLink);
        if (index === -1) {
            Reason.savedArticles.push(item);
        } else {
            Reason.savedArticles[index] = item;
        }
        let errMsg = "I couldn't remove your article. Spare me! I beg you!";
        _updateLocalStorage(Reason.savedArticles, 'savedArticles.txt', errMsg);
   }

    function removeArticle(e) {
        let item = Reason.currentItem;
        let savedArticles = Reason.savedArticles.map(function (savedItem) {
            return savedItem.origLink;
        });
        let index = savedArticles.indexOf(item.origLink);
        if (index === -1) return;
        Reason.savedArticles.splice(index, 1);
        let errMsg = "I couldn't remove your article. Spare me! I beg you!";
        _updateLocalStorage(Reason.savedArticles, 'savedArticles.txt', errMsg);
    }

    function savePrevious(feed) {
        console.log('feed while saving');
        console.log(feed);
        let fileName = 'previous' + feed.name + '.txt';
        _updateLocalStorage(feed.previous, fileName);

    }

    function _updateLocalStorage(articleList, fileName, errMsg) {
        console.log('previous article list');
        console.log(articleList);
        console.log(fileName);
        let appData = Windows.Storage.ApplicationData.current;
        appData.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {
                console.log('writing previous to a file');
                return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(articleList));
            }, function (error) {
                let msg = errMsg || 'Something went wrong with localStorage file';
                new Windows.UI.Popups.MessageDialog(msg);
            });
    }


    //export methods
    WinJS.Namespace.define('Helpers', {
        openLink: openLink,
        showShareUI: showShareUI,
        shareLink: shareLink,
        saveArticle: saveArticle,
        removeArticle: removeArticle,
        savePrevious: savePrevious
    });
})();