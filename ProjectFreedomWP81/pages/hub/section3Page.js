(function () {
    "use strict";

    var ControlConstructor = WinJS.UI.Pages.define("/pages/hub/section3Page.html", {
        // This function is called after the page control contents 
        // have been loaded, controls have been activated, and 
        // the resulting elements have been parented to the DOM. 
        ready: function (element, options) {
            options = options || {};
            WinJS.Utilities.startLog('pageControlInside');
            let feed = Reason.allFeeds.Blog; // attach the appropriate feed
            let listView = element.querySelector(".itemslist").winControl;
            listView.loadingBehavior = 'randomaccess';
            

            //reload previous from saved file
            let appData = Windows.Storage.ApplicationData.current;
            let fileName = 'previous' + feed.name + '.txt';
            console.log('reading from previous:');
            console.log(fileName);
            appData.localFolder.getFileAsync(fileName)
                .then(function (file) {
                    return Windows.Storage.FileIO.readTextAsync(file);
                }, function error(file) {
                    console.log('previous file created');
                })
                .then(function (contents) {
                    if (contents) feed.previous = JSON.parse(contents);
                    console.log('previous articles:');
                    console.log(feed.previous);
                    //if (feed.previous) {
                    WinJS.log && WinJS.log('previous loaded', 'pageControlInside', 'INFO');
                    console.log('previous loaded console');
                    let list = new WinJS.Binding.List(feed.previous);
                    listView.itemDataSource = list.dataSource;
                    //}
                });
            //end reload previous
            
            

            
            //was the app started? if so refresh content
            if (feed.firstStart || !feed.previous) {
                WinJS.log && WinJS.log('initial load', 'pageControlInside', 'INFO');
                console.log('initial load console');
                Reason.refreshFeed(feed, element);
                //feed.firstStart = false; //moved to refreshFeed
            }
            //load the scroll position for listview
            console.log('listview loaded');
            Helpers.loadLVPosition(listView);
            listView.onloadingstatechanged = function () {
                if (listView.loadingState === 'complete') {
                    
                }
            }
            
            //if (!sessionState.itemList) {
            //    sessionState.itemList = {};
            //} else if (sessionState.itemList.scrollPosition) {
            //    WinJS.Promise.timeout().then(function () {
            //        listView.ensureVisible(scrollPosition) = sessionState.itemList.scrollPosition;
            //    });
            //}
            document.querySelector('#cmdRefresh').addEventListener('click', function () {
                Reason.refreshFeed(feed, element);
            }.bind(this));

            listView.layout = options.layout;
            //listView.oniteminvoked = options.oniteminvoked;
            listView.addEventListener('iteminvoked', function (args) {
                
                let feedSrc = feed.current || feed.previous;
                let item = feedSrc[args.detail.itemIndex];
                WinJS.Navigation.navigate("/pages/item/item.html", { item: item, type: 'Blog' });
                Helpers.saveLVPosition(listView);
            });

        }
    });

    // The following lines expose this control constructor as a global. 
    // This lets you use the control as a declarative control inside the 
    // data-win-control attribute. 

    WinJS.Namespace.define("HubApps_SectionControls", {
        Section3Control: ControlConstructor
    });
})();