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

            //if (feed.previous) {
                WinJS.log && WinJS.log('previous loaded', 'pageControlInside', 'INFO');
                console.log('previous loaded console');
                let list = new WinJS.Binding.List(feed.previous);
                listView.itemDataSource = list.dataSource;
            //}
            //was the app started? if so refresh content
            if (feed.firstStart || !feed.previous) {
                WinJS.log && WinJS.log('initial load', 'pageControlInside', 'INFO');
                console.log('initial load console');
                Reason.refreshFeed(feed, element);
                feed.firstStart = false;
            }

            document.querySelector('#cmdRefresh').addEventListener('click', function () {
                Reason.refreshFeed(feed, element);
            }.bind(this));

            listView.layout = options.layout;
            //listView.oniteminvoked = options.oniteminvoked;
            listView.addEventListener('iteminvoked', function (args) {
                let item = feed.current[args.detail.itemIndex];
                WinJS.Navigation.navigate("/pages/item/item.html", { item: item, type: 'Blog' });
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