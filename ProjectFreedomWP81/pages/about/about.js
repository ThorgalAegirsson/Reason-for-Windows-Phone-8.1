(function () {
    "use strict";
    let sessionState = WinJS.Application.sessionState;
    WinJS.UI.Pages.define("/pages/about/about.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            WinJS.Utilities.query('.supportMe', element).listen('click', function (e) {
                let uri = new Windows.Foundation.Uri('https://esar.us/payments.html');
                Windows.System.Launcher.launchUriAsync(uri).done();
            });

            WinJS.Utilities.query('.feedbackEmail', element).listen('click', function (e) {
                let mailto = new Windows.Foundation.Uri("mailto:?to=mailto:developer@esar.biz" + "&subject=Reason app feedback" + "&body=version 1.0 for WP8.1");
                Windows.System.Launcher.launchUriAsync(mailto).done();
            });

            WinJS.Utilities.query('.github', element).listen('click', function (e) {
                let uri = new Windows.Foundation.Uri('https://github.com/ThorgalAegirsson/Reason-for-Windows-Phone-8.1');
                Windows.System.Launcher.launchUriAsync(uri).done();
            });

            if (WinJS.Utilities.isPhone) {
                document.getElementById("backButton").style.display = "none";
            }

            //hide appbar
            document.querySelector('.win-appbar').winControl.disabled = true;
            
        },
        unload: function () {
            document.querySelector('#appbar').winControl.disabled = false;
        }
    });
})();
