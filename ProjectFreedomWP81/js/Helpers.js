﻿(function () {
    'use strict';
    
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
        let errMsg = "I couldn't save your article. Spare me! I beg you!";
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
        Reason.refreshFeed(Reason.currentData.feed, Reason.currentData.element);
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
                console.log('writing to a file: ' + fileName);
                return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(articleList));
            }, function (error) {
                let msg = errMsg || 'Something went wrong with localStorage file';
                new Windows.UI.Popups.MessageDialog(msg);
            });
    }

    function saveLVPosition(lv, feedName) {
        let appState = WinJS.Application.sessionState;
        if (!appState.scrollPosition) appState.scrollPosition = {};
        appState.scrollPosition[feedName] = lv.scrollPosition;

        console.log('scrollPosition saved in: '+feedName);
        console.log(appState.scrollPosition[feedName]);
    }

    function loadLVPosition(lv, feedName) {
        setImmediate(function () {
            let scrollPosition;
            let appState = WinJS.Application.sessionState;
            if (appState.scrollPosition) scrollPosition = appState.scrollPosition[feedName];
            if (scrollPosition) lv.scrollPosition = scrollPosition;
        });
    }

    function readPrevious(feed, listView) {
        let appData = Windows.Storage.ApplicationData.current;
        let fileName = 'previous' + feed.name + '.txt';
        console.log('reading from previous:');
        console.log(fileName);
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
                console.log(listView);
                //}
            });
    }

    function testConnection() { // !!! NOT IN USE - UNRELIABLE !!!
        let networkInfo = Windows.Networking.Connectivity.NetworkInformation;
        
        try {
            let internetProfile = networkInfo.getInternetConnectionProfile();
            console.log('Connection info: ');
            console.log(internetProfile);
            console.log(_getConnectionProfileInfo(internetProfile));
        } catch (e) {
            console.log('Connection error: ');
            console.log(e);
        }
    }

    function _getConnectionProfileInfo(connectionProfile) { // NOT IN USE
        let networkConnectivityInfo = Windows.Networking.Connectivity.NetworkConnectivityLevel;
        if (connectionProfile == null) return 'null\n\r';
        //console.log('connectionProfile:');
        //console.log(connectionProfile);
        //console.log('connectivityLevel:');
        //console.log(connectionProfile.getNetworkConnectivityLevel());
        let str = 'INFO: ';
        //try {
        switch (connectionProfile.getNetworkConnectivityLevel()) {
            case networkConnectivityInfo.none:
                str += "Connectivity Level: None\n\r";
                break;
            case networkConnectivityInfo.localAccess:
                str += "Connectivity Level: Local Access\n\r";
                break;

            case networkConnectivityInfo.constrainedInternetAccess:
                str += "Connectivity Level: Constrained Internet Access\n\r";
                break;
            case networkConnectivityInfo.internetAccess:
                console.log('connectionProfile:');
                console.log(connectionProfile);
                console.log('connectivity level:');
                console.log(connectionProfile.getNetworkConnectivityLevel());
                str += "Connectivity Level: Internet Access\n\r";
                break;
        }
        //} catch (e) {
        //    console.log('Connectivity exception caught:');
        //    console.log(e);
        //}
        return str;
    }

    function testOnline() { // NOT IN USE - I WAS USING IT FOR TESTING
        console.log('navigator test');
        console.log(navigator.onLine);
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
        settingsButtonHandler: settingsButtonHandler,
        testConnection: testConnection,
        testOnline: testOnline
    });
})();