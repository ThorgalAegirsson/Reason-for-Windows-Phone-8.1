(function () {
    "use strict";

    var ControlConstructor = WinJS.UI.Pages.define("/pages/hub/section1Page.html", {
        // This function is called after the page control contents 
        // have been loaded, controls have been activated, and 
        // the resulting elements have been parented to the DOM. 
        ready: function (element, options) {
            options = options || {};
            //WinJS.Utilities.startLog('pageControlInside');
            //console.log('ITEM PAGE RENDERED');
            //console.log('ELEMENT BEFORE REFRESH');
            //console.log(element);
            let feed = Reason.allFeeds.Blog; // attach the appropriate feed
            console.log('section1 feed:');
            console.log(feed);
            let lv = element.querySelector('.itemslist');
            //lv.style.display = 'none';
            console.log('section1 Reason.currentData:');
            console.log(Reason.currentData); //null
            Reason.currentData.feed = feed; 
            Reason.currentData.element = element;
            //WinJS.Namespace.define('Reason.currentData', {
            //    feed: feed,
            //    element: element
            //});
            console.log('currentData after assignment:');
            console.log(Reason.currentData); // !!! shows feed that is not correct !!!
            console.log('currentData.feed after assignment:');
            console.log(Reason.currentData.feed);
            
            let listView = lv.winControl;
            console.log('feed before previous:');
            console.log(feed);
            //reload previous from saved file
            Helpers.readPrevious(feed, listView);
            console.log('feed after previous:');
            console.log(feed);

            //was the app started? if so refresh content
            if (feed.firstStart || !feed.previous) {
                console.log('calling refreshFeed');
                WinJS.log && WinJS.log('initial load', 'pageControlInside', 'INFO');
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
        Section1Control: ControlConstructor
    });
})();