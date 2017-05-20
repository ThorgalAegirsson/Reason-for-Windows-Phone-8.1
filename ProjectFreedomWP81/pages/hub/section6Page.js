﻿(function () {
    "use strict";
    let _deleteHandler = function (e) {
        e.preventDefault();
        Helpers.removeAllArticles().then(function () {
            console.log('saved articles:');
            console.log(Reason.savedArticles);
            if (Reason.savedArticles.length === 0) {
                console.log('listview refresh');
                listView.itemDataSource = new WinJS.Binding.List(Reason.savedArticles).dataSource;
            }
        });
        
    }
    var ControlConstructor = WinJS.UI.Pages.define("/pages/hub/section6Page.html", {
        // This function is called after the page control contents 
        // have been loaded, controls have been activated, and 
        // the resulting elements have been parented to the DOM. 
        ready: function (element, options) {
            options = options || {};
            //WinJS.Utilities.startLog('pageControlInside');
            //console.log('ITEM PAGE RENDERED');
            //console.log('ELEMENT BEFORE REFRESH');
            //console.log(element);
            let lv = element.querySelector('.itemslist');
            let feed = Reason.savedArticles; // attach the appropriate feed
            feed.element = element;
            Reason.currentData.element = element;
            Reason.currentData.feed = feed;
            
            //lv.style.display = 'none';
            //WinJS.Namespace.define('Reason.currentData', {
            //    feed: feed,
            //    element: element
            //});
            let listView = lv.winControl;
            let feedList = new WinJS.Binding.List(feed);
            listView.itemDataSource = feedList.dataSource;
            //reload previous from saved file
            //Helpers.readPrevious(feed, listView);

            //was the app started? if so refresh content
            //if (feed.firstStart || !feed.previous) {
            //    WinJS.log && WinJS.log('initial load', 'pageControlInside', 'INFO');
            //    Reason.refreshFeed(feed, element);
            //    //feed.firstStart = false; //moved to refreshFeed
            //}

            //load the scroll position for listview
            Helpers.loadLVPosition(listView);

            listView.layout = options.layout;
            //listView.oniteminvoked = options.oniteminvoked;
            listView.addEventListener('iteminvoked', function (args) {
                let item = feed[args.detail.itemIndex];
                WinJS.Namespace.define('Reason', {
                    currentItem: item
                });
                WinJS.Navigation.navigate("/pages/item/item.html", { item: Reason.currentItem, type: 'savedArticles' });
                Helpers.saveLVPosition(listView);
            });
        },

        unload: function () {
            console.log('section unload');
            WinJS.Namespace.define('Reason.currentData', {
                feed: null,
                element: null
            });
            //document.querySelector('#cmdFavRemoveAll').removeEventListener('click', _deleteHandler);
            //let appBar = document.querySelector('#appbar').winControl;
            //if (appBar) appBar.showOnlyCommands(['cmdRefresh', 'cmdSettings']);

        }
    });

    // The following lines expose this control constructor as a global. 
    // This lets you use the control as a declarative control inside the 
    // data-win-control attribute. 

    WinJS.Namespace.define("HubApps_SectionControls", {
        Section6Control: ControlConstructor,
        _deleteHandler: _deleteHandler
    });
})();