(function () {
    "use strict";

    var ControlConstructor = WinJS.UI.Pages.define("/pages/hub/section7Page.html", {
        // This function is called after the page control contents 
        // have been loaded, controls have been activated, and 
        // the resulting elements have been parented to the DOM. 
        ready: function (element, options) {
            options = options || {};
            WinJS.Utilities.query('button.donateBtn', element).listen('click', function (e) {
                let uri = new Windows.Foundation.Uri('https://reason.com/donatenow/donate.php');
                Windows.System.Launcher.launchUriAsync(uri).done();
            });
        }
    });

    // The following lines expose this control constructor as a global. 
    // This lets you use the control as a declarative control inside the 
    // data-win-control attribute. 

    WinJS.Namespace.define("HubApps_SectionControls", {
        Section7Control: ControlConstructor
    });
})();