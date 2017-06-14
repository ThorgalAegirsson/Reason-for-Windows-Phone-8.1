(function () {
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
        _updateLocalStorage(Reason.savedArticles, 'savedArticles.txt', errMsg, true);
    }

    function articleInSaved(e) {
        let item = Reason.currentItem;
        let savedArticles = Reason.savedArticles.map(function (savedItem) {
            return savedItem.origLink;
        });
        let index = savedArticles.indexOf(item.origLink);        
        if (index === -1) {
            return false;
        } else {
            return true;
        }
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
        _updateLocalStorage(Reason.savedArticles, 'savedArticles.txt', errMsg, false);
    }

    function removeAllArticles(e) {
        let msg = new Windows.UI.Popups.MessageDialog('Are you sure you want to delete all your saved articles?', 'Warning!');
        msg.commands.append(new Windows.UI.Popups.UICommand('I am sure!'));
        msg.commands.append(new Windows.UI.Popups.UICommand('Hell, no!'));
        msg.showAsync().done(_removeAllArticlesHandler);

    }

    function _removeAllArticlesHandler(command) {
        if (command.label === 'I am sure!') {
            Reason.savedArticles = [];
            let errMsg = 'Something went wrong. Try again later...';
            let lv = Reason.currentData.element.querySelector('.itemslist').winControl;
            lv.itemDataSource = new WinJS.Binding.List(Reason.savedArticles).dataSource;
            _updateLocalStorage(Reason.savedArticles, 'savedArticles.txt', errMsg).then(function success() {
            });
        }
        
    }

    function refreshButtonHandler(e) {
        Reason.refreshFeed(Reason.currentData.feed, Reason.currentData.element);
    }

    function settingsButtonHandler(e) {
        console.log('settigns clicked');
    }

    function aboutButtonHandler(e) {
        WinJS.Navigation.navigate("/pages/about/about.html");
    }

    function savePrevious(feed) {
        let fileName = 'previous' + feed.name + '.txt';
        _updateLocalStorage(feed.previous, fileName);
    }

    function _updateLocalStorage(articleList, fileName, errMsg, isInSaved) {
        let appData = Windows.Storage.ApplicationData.current;
        appData.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {
                //change appBar icon
                let appBar = document.querySelector('#appbar').winControl;
                if (appBar && isInSaved !== undefined) {
                    if (isInSaved) {
                        appBar.showOnlyCommands(['articleFavRemove', 'articleBrowser', 'articleShare']);

                    } else {
                        appBar.showOnlyCommands(['articleFav', 'articleBrowser', 'articleShare']);
                    }
                }
                
                return Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(articleList));
            }, function (error) {
                let msg = errMsg || 'Something went wrong with localStorage file';
                new Windows.UI.Popups.MessageDialog(msg);
            });
        return WinJS.Promise.timeout();
    }

    function saveLVPosition(lv, feedName) {
        let appState = WinJS.Application.sessionState;
        if (!appState.scrollPosition) appState.scrollPosition = {};
        appState.scrollPosition[feedName] = lv.scrollPosition;
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
        appData.localFolder.getFileAsync(fileName)
            .then(function (file) {
                return Windows.Storage.FileIO.readTextAsync(file);
            }, function error(file) {
                //console.log('previous file created');
            })
            .then(function (contents) {
                if (contents) feed.previous = JSON.parse(contents);
                let list = new WinJS.Binding.List(feed.previous);
                listView.itemDataSource = list.dataSource;
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
        let str = 'INFO: ';
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
                str += "Connectivity Level: Internet Access\n\r";
                break;
        }
        return str;
    }

    function testOnline() { // NOT IN USE - I WAS USING IT FOR TESTING
        //console.log('navigator test');
        //console.log(navigator.onLine);
    }
    
    function createVideo(element, item) {
        let divElement = document.createElement('div');
        let hrElement = document.createElement('hr');
        divElement.classList.add('video')
        let pElement = document.createElement('p');
        pElement.textContent = 'Video length: ' + item.media.duration;
        let videoElement = document.createElement('video');
        videoElement.src = item.media.src;
        videoElement.setAttribute('controls')
        let btn = document.createElement('button');
        btn.textContent = 'Download the video';
        btn.classList.add('btnDownload');
        divElement.appendChild(hrElement);
        divElement.appendChild(pElement);
        divElement.appendChild(videoElement);
        divElement.appendChild(btn);
        btn.addEventListener('click', function (e) {
            let uri = new Windows.Foundation.Uri(item.media.src);
            Windows.System.Launcher.launchUriAsync(uri).done();
        });
        element.appendChild(divElement);
    }

    function createAudio(element, item) {
        let divElement = document.createElement('div');
        let hrElement = document.createElement('hr');
        divElement.classList.add('audio')
        let pElement = document.createElement('p');
        pElement.textContent = 'Audio length: ' + item.media.duration;
        let audioElement = document.createElement('audio');
        audioElement.src = item.media.src;
        audioElement.setAttribute('controls')
        let btn = document.createElement('button');
        btn.textContent = 'Download the audio';
        btn.classList.add('btnDownload');
        divElement.appendChild(hrElement);
        divElement.appendChild(pElement);
        divElement.appendChild(audioElement);
        divElement.appendChild(btn);
        btn.addEventListener('click', function (e) {
            let uri = new Windows.Foundation.Uri(item.media.src);
            Windows.System.Launcher.launchUriAsync(uri).done();
        });
        element.appendChild(divElement);
    }

    //export methods
    WinJS.Namespace.define('Helpers', {
        openLink: openLink,
        showShareUI: showShareUI,
        shareLink: shareLink,
        saveArticle: saveArticle,
        articleInSaved: articleInSaved,
        removeArticle: removeArticle,
        removeAllArticles: removeAllArticles,
        savePrevious: savePrevious,
        readPrevious: readPrevious,
        saveLVPosition: saveLVPosition,
        loadLVPosition: loadLVPosition,
        refreshButtonHandler: refreshButtonHandler,
        settingsButtonHandler: settingsButtonHandler,
        aboutButtonHandler: aboutButtonHandler,
        testConnection: testConnection,
        testOnline: testOnline,
        createVideo: createVideo,
        createAudio: createAudio
    });
})();