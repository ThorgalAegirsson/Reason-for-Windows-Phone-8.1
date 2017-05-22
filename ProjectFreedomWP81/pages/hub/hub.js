(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var session = WinJS.Application.sessionState;
    var util = WinJS.Utilities;
    let netInfo = Windows.Networking.Connectivity.NetworkInformation;

    // Get the groups used by the data-bound sections of the Hub.
    //var section3Group = Data.resolveGroupReference("group4");
    //var section3Items = Data.getItemsFromGroup(section3Group);

    WinJS.UI.Pages.define("/pages/hub/hub.html", {
        processed: function (element) {
            return WinJS.Resources.processAll(element);
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var hub = element.querySelector(".hub").winControl;

            //appBar commands
            let appBar = document.querySelector('#appbar').winControl;
            if (appBar) appBar.showOnlyCommands(['cmdRefresh', 'cmdAbout']);
            document.querySelector('#cmdAbout').addEventListener('click', Helpers.aboutButtonHandler, false);
            document.querySelector('#cmdRefresh').addEventListener('click', Helpers.refreshButtonHandler, false);
            document.querySelector('#cmdSettings').addEventListener('click', Helpers.settingsButtonHandler, false);
            //document.querySelector('#cmdFavRemoveAll').addEventListener('click', HubApps_SectionControls._deleteHandler, false);
            document.querySelector('#cmdFavRemoveAll').addEventListener('click', Helpers.removeAllArticles, false);

            if (session.lastSectionIndex) hub.selectedIndex = session.lastSectionIndex;
            hub.onselectionchanged = function (args) {
                session.lastSectionIndex = args.detail.index;
                console.log('Reason.currentData on hub selection:');
                console.log(Reason.currentData);
                Reason.currentData.feed = Reason.allFeeds[args.detail.item.header];
                if (Reason.currentData.feed) Reason.currentData.element = Reason.currentData.feed.element;
                console.log('Reason.currentData on hub selection after assigning:');
                console.log(Reason.currentData);
                console.log('current feed: ');
                console.log(Reason.currentData.feed);
                console.log('current element: ');
                console.log(Reason.currentData.element);
                switch (args.detail.item.header) {
                    case "Donate":
                        appBar.showOnlyCommands(['cmdAbout']);
                        break;
                    case "Saved":
                        appBar.showOnlyCommands(['cmdFavRemoveAll', 'cmdAbout']);
                        break;
                    default:
                        appBar.showOnlyCommands(['cmdRefresh', 'cmdAbout']);
                }
                console.log('pivot item:');
                console.log(args.detail.index);
                console.log(args.detail.item.header);
                
                console.log('pivot args object:')
                //console.log(Reason.allFeeds[args.detail.item.header]);
                console.log(args);
            }

            hub.onheaderinvoked = function (args) {
                args.detail.section.onheaderinvoked(args);
            };
            hub.onloadingstatechanged = function (args) {
                if (args.srcElement === hub.element && args.detail.loadingState === "complete") {
                    hub.onloadingstatechanged = null;
                    hub.element.focus();
                }
            }


            // TODO: Initialize the page here.
            
            //let appBar = document.querySelector('#appbar').winControl;
            //if (appBar) appBar.showOnlyCommands(['cmdRefresh', 'cmdSettings']);
            //document.querySelector('#cmdRefresh').addEventListener('click', Helpers.refreshButtonHandler, false);
            //document.querySelector('#cmdSettings').addEventListener('click', Helpers.settingsButtonHandler, false);
            //document.querySelector('#cmdFavRemoveAll').addEventListener('click', HubApps_SectionControls._deleteHandler, false);
        },

        //section3DataSource: section3Items.dataSource,

        //sectionItemNavigate: util.markSupportedForProcessing(function (args) {
        //    let item = Reason.currentFeed[args.detail.itemIndex];
        //    //var item = Data.getItemReference(section3Items.getAt(args.detail.itemIndex));
        //    nav.navigate("/pages/item/item.html", { item: item });
        //}),

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        },
    });
})();