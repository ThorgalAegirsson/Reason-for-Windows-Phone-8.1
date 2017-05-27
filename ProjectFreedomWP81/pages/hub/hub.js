(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var session = WinJS.Application.sessionState;
    var util = WinJS.Utilities;
    let netInfo = Windows.Networking.Connectivity.NetworkInformation;

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
            document.querySelector('#cmdFavRemoveAll').addEventListener('click', Helpers.removeAllArticles, false);

            if (session.lastSectionIndex) hub.selectedIndex = session.lastSectionIndex;
            hub.onselectionchanged = function (args) {
                session.lastSectionIndex = args.detail.index;
                Reason.currentData.feed = Reason.allFeeds[args.detail.item.header];
                if (Reason.currentData.feed) Reason.currentData.element = Reason.currentData.feed.element;
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
        },


        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        },
    });
})();