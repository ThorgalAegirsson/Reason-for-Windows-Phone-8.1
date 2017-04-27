(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/item/item.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            let item = options.item; //defined in section3page.js
            WinJS.Namespace.define('Reason', {
                currentItem: options.item,
                type: options.type
            });
            console.log('item: ');
            console.log(item);
            WinJS.Binding.processAll(null, item);

            //sharing init
            let dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.addEventListener('datarequested', Helpers.shareLink, false);

            
            //var item = Data.resolveItemReference(options.item);
            
			if (WinJS.Utilities.isPhone)
			{
				document.getElementById("backButton").style.display = "none";
            }
            //configure appbar
			let appbar = document.querySelector('#appbar');
			document.querySelector('#articleFav').addEventListener('click', Helpers.saveArticle, false);
			document.querySelector('#articleBrowser').addEventListener('click', Helpers.openLink, false);
			document.querySelector('#articleShare').addEventListener('click', Helpers.showShareUI, false);
           
        },
        unload: function () {
            // restore appbar

            //cancel sharing contract
            let dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.removeEventListener('datarequested', Helpers.shareLink);
            WinJS.Namespace.define('Reason', {
                currentItem: null
            });
        }
    });
})();
