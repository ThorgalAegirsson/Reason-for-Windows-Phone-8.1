// For an introduction to the Pivot template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392284
(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;
    let allFeeds, currentItem, roamingData;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application was suspended and then terminated.
                // To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
                
            }

            //console.log('RESUME ACTIVATED');
            //allFeeds = app.sessionState.reasonAllFeeds;
            //currentItem = app.sessionState.reasonCurrentItem;
            //roamingData = app.sessionState.reasonRoamingData;
            //console.log('app sessionstate after resume:');
            //console.log(app.sessionState);
            //debugger;


            hookUpBackButtonGlobalEventHandlers();
            nav.history = app.sessionState.history || {};
            nav.history.current.initialPlaceholder = true;

            // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
            ui.disableAnimations();
            var p = ui.processAll().then(function () {
                return nav.navigate(nav.location || Application.navigator.home, nav.state);
            }).then(function () {
                return sched.requestDrain(sched.Priority.aboveNormal + 1);
            }).then(function () {
                ui.enableAnimations();
            });

            args.setPromise(p);
            
            //if (allFeeds) WinJS.Namespace.define('Reason', {
            //    allFeeds: allFeeds
            //});
            //if (currentItem) WinJS.Namespace.define('Reason', {
            //    currentItem: currentItem
            //});
            //if (roamingData) WinJS.Namespace.define('Reason', {
            //    roamingData: roamingData
            //});
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        
        app.sessionState.history = nav.history;
        //app.sessionState.reasonAllFeeds = Reason.allFeeds;
        //app.sessionState.reasonCurrentItem = Reason.currentItem;
        //app.sessionState.reasonRoamingData = Reason.roamingData;
        console.log('app sessionstate on checkpoint: ');
        console.log(app.sessionState);
        debugger;
    };

    function hookUpBackButtonGlobalEventHandlers() {
        // Subscribes to global events on the window object
        window.addEventListener('keyup', backButtonGlobalKeyUpHandler, false)
    }

    // CONSTANTS
    var KEY_LEFT = "Left";
    var KEY_BROWSER_BACK = "BrowserBack";
    var MOUSE_BACK_BUTTON = 3;

    function backButtonGlobalKeyUpHandler(event) {
        // Navigates back when (alt + left) or BrowserBack keys are released.
        if ((event.key === KEY_LEFT && event.altKey && !event.shiftKey && !event.ctrlKey) || (event.key === KEY_BROWSER_BACK)) {
            nav.back();
        }
    }

    app.start();
})();
