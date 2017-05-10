(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var session = WinJS.Application.sessionState;
    var util = WinJS.Utilities;
    let netInfo = Windows.Networking.Connectivity.NetworkInformation;

    // Get the groups used by the data-bound sections of the Hub.
    var section3Group = Data.resolveGroupReference("group4");
    var section3Items = Data.getItemsFromGroup(section3Group);

    WinJS.UI.Pages.define("/pages/hub/hub.html", {
        processed: function (element) {
            return WinJS.Resources.processAll(element);
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var hub = element.querySelector(".hub").winControl;
            if (session.lastSectionIndex) hub.selectedIndex = session.lastSectionIndex;
            if (!hub.onselectionchanged) hub.onselectionchanged = function (args) {
                session.lastSectionIndex = args.detail.index;
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
            
            let appBar = document.querySelector('#appbar').winControl;
            if (appBar) appBar.showOnlyCommands(['cmdRefresh', 'cmdSettings']);
            document.querySelector('#cmdRefresh').addEventListener('click', Helpers.refreshButtonHandler, false);
            document.querySelector('#cmdSettings').addEventListener('click', Helpers.settingsButtonHandler, false);
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