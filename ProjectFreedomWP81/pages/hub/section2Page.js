(function () {
    "use strict";

    var ControlConstructor = WinJS.UI.Pages.define("/pages/hub/section2Page.html", {
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
            let feed = Reason.allFeeds.Articles; // attach the appropriate feed
            feed.element = element;
            Reason.currentData.element = element;
            Reason.currentData.feed = feed;
            //lv.style.display = 'none';
            //WinJS.Namespace.define('Reason.currentData', {
            //    feed: feed,
            //    element: element
            //});

            let listView = lv.winControl;
            //reload previous from saved file
            //console.log('feed before previous:');
            //console.log(feed);
            Helpers.readPrevious(feed, listView);
            //console.log('feed after previous:');
            //console.log(feed);
            //console.log('feed.firstStart:');
            //console.log(feed.firstStart);
            //was the app started? if so refresh content
            if (feed.firstStart || !feed.previous) {
                WinJS.log && WinJS.log('initial load', 'pageControlInside', 'INFO');
                console.log('first start in section');
                Reason.refreshFeed(feed, element);
                //feed.firstStart = false; //moved to refreshFeed
            }

            //load the scroll position for listview
            Helpers.loadLVPosition(listView, feed.name);

            listView.layout = options.layout;
            //listView.oniteminvoked = options.oniteminvoked;
            listView.addEventListener('iteminvoked', function (args) {
                let feedSrc = feed.current || feed.previous;
                let item = feedSrc[args.detail.itemIndex];
                WinJS.Namespace.define('Reason', {
                    currentItem: item
                });
                WinJS.Navigation.navigate("/pages/item/item.html", { item: Reason.currentItem, type: 'Blog' });
                Helpers.saveLVPosition(listView, feed.name);
            });
        },

        unload: function () {
            WinJS.Namespace.define('Reason.currentData', {
                feed: null,
                element: null
            });
        }
    });

    // The following lines expose this control constructor as a global. 
    // This lets you use the control as a declarative control inside the 
    // data-win-control attribute. 

    WinJS.Namespace.define("HubApps_SectionControls", {
        Section2Control: ControlConstructor
    });
})();