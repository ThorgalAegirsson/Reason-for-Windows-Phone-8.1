(function () {
    "use strict";
    let sessionState = WinJS.Application.sessionState;

    

    WinJS.UI.Pages.define("/pages/item/item.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            
            let item = options.item; 
            WinJS.Namespace.define('Reason', {
                currentItem: options.item,
                type: options.type //not in use, for future syncing of favorites in Win10
            });

            if (options.type) {
                if (options.type === 'ReasonTV') {
                    Helpers.createVideo(element, item);
                }
                if (options.type === "Podcast") {
                    Helpers.createAudio(element, item);
                }
            }
            if (sessionState.history) item = sessionState.history.current.state.item;
            if (sessionState.reasonSavedArticles) WinJS.Namespace.define('Reason', {
                savedArticles: sessionState.reasonSavedArticles
            });
            WinJS.Binding.processAll(element, item);
            element.querySelector('.raw').textContent = item.content;

            //sharing contract init
            let dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.addEventListener('datarequested', Helpers.shareLink, false);

			if (WinJS.Utilities.isPhone)
			{
				document.getElementById("backButton").style.display = "none";
            }
            //configure appbar
			let appBar = document.querySelector('#appbar').winControl;
			if (options.type === 'savedArticles') {
			    if (appBar) appBar.showOnlyCommands(['articleFavRemove', 'articleBrowser', 'articleShare']);
			    document.querySelector('#articleFavRemove').addEventListener('click', Helpers.removeArticle, false);
			} else {
			    if (appBar) appBar.showOnlyCommands(['articleFav', 'articleBrowser', 'articleShare']);
			    document.querySelector('#articleFav').addEventListener('click', Helpers.saveArticle, false);
			}
			document.querySelector('#articleBrowser').addEventListener('click', Helpers.openLink, false);
			document.querySelector('#articleShare').addEventListener('click', Helpers.showShareUI, false);
        },
        unload: function () {
            //cancel sharing contract
            let dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.removeEventListener('datarequested', Helpers.shareLink);
            WinJS.Namespace.define('Reason', {
                currentItem: null
            });
        }
    });
})();
