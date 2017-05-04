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
        request.data.setText("I'd to share this article with you: ");
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

    function refreshButtonHandler(e) {
        //console.log('Event in refreshButtonHandler');
        //console.log(e);
        //console.log(e.target.ownerDocument.querySelector('.itemslist'));
        Reason.refreshFeed(Reason.roamingData.feed, Reason.roamingData.element);
    }

    function settingsButtonHandler(e) {
        console.log('settigns clicked');
    }

    function savePrevious(feed) {
        let fileName = 'previous' + feed.name + '.txt';
        _updateLocalStorage(feed.previous, fileName);
    }

    function _updateLocalStorage(articleList, fileName, errMsg) {
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

    function saveLVPosition(lv) {
        WinJS.Application.sessionState.scrollPosition = lv.scrollPosition;
        //console.log('scrollPosition saved:');
        //console.log(WinJS.Application.sessionState.scrollPosition);
    }

    function loadLVPosition(lv) {
        setImmediate(function () {
            let scrollPosition = WinJS.Application.sessionState.scrollPosition;
            if (scrollPosition) lv.scrollPosition = scrollPosition;
        });
    }

    function readPrevious(feed, listView) {
        let appData = Windows.Storage.ApplicationData.current;
        let fileName = 'previous' + feed.name + '.txt';
        //console.log('reading from previous:');
        //console.log(fileName);
        appData.localFolder.getFileAsync(fileName)
            .then(function (file) {
                return Windows.Storage.FileIO.readTextAsync(file);
            }, function error(file) {
                //console.log('previous file created');
            })
            .then(function (contents) {
                if (contents) feed.previous = JSON.parse(contents);
                //console.log('previous articles:');
                //console.log(feed.previous);
                //if (feed.previous) {
                WinJS.log && WinJS.log('previous loaded', 'pageControlInside', 'INFO');
                console.log('previous loaded console');
                let list = new WinJS.Binding.List(feed.previous);
                listView.itemDataSource = list.dataSource;
                //}
            });
    }
    

    //export methods
    WinJS.Namespace.define('Helpers', {
        openLink: openLink,
        showShareUI: showShareUI,
        shareLink: shareLink,
        saveArticle: saveArticle,
        removeArticle: removeArticle,
        savePrevious: savePrevious,
        readPrevious: readPrevious,
        saveLVPosition: saveLVPosition,
        loadLVPosition: loadLVPosition,
        refreshButtonHandler: refreshButtonHandler,
        settingsButtonHandler: settingsButtonHandler
    });
})();