(function () {
    "use strict";
 
    var ControlConstructor = WinJS.UI.Pages.define("/pages/hub/section6Page.html", {
        // This function is called after the page control contents 
        // have been loaded, controls have been activated, and 
        // the resulting elements have been parented to the DOM. 
        ready: function (element, options) {
            options = options || {};

            let lv = element.querySelector('.itemslist');
            let feed = Reason.savedArticles; // attach the appropriate feed
            feed.element = element;
            Reason.currentData.element = element;
            Reason.currentData.feed = feed;
            
            let listView = lv.winControl;
            let feedList = new WinJS.Binding.List(feed);
            listView.itemDataSource = feedList.dataSource;

            //load the scroll position for listview
            Helpers.loadLVPosition(listView);

            listView.layout = options.layout;
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
        }
    });

    // The following lines expose this control constructor as a global. 
    // This lets you use the control as a declarative control inside the 
    // data-win-control attribute. 

    WinJS.Namespace.define("HubApps_SectionControls", {
        Section6Control: ControlConstructor
    });
})();