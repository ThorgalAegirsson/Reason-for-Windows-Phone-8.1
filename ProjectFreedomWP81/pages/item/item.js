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

            if (item.media.src) {
                let mediaType = item.media.src;
                if (/[.]mp3$/.test(mediaType)) {
                    Helpers.createAudio(element, item);
                } else if (/[.]mp4$/.test(mediaType)) {
                    Helpers.createVideo(element, item);
                }
            }

            // Youtube videos inside articles -> still not working...
            //function createYTvideo(element, item) {
            //    let divElement = document.createElement('div');
            //    let hrElement = document.createElement('hr');
            //    divElement.classList.add('video')
            //    let videoElement = document.createElement('video');
            //    videoElement.src = item;
            //    videoElement.setAttribute('controls')               
            //    divElement.appendChild(hrElement);
            //    divElement.appendChild(item);
            //    element.appendChild(divElement);
            //    return divElement;
            //}
            //let webview = document.createElement('x-ms-webview');
            //let iframe = '<iframe src="' + item.media.src + '" width="100%" height="auto" allowfullscreen="allowfullscreen"></iframe>';
            //webview.navigateToString(iframe);

            //webview.style.width = "100%";
            //webview.style.height = 'auto';
            //webview.setAttribute('allowfullscreen', 'allowfullscreen');
            //webview.src = item.media.src;
            //element.appendChild(webview);
            

            if (sessionState.history) item = sessionState.history.current.state.item;
            if (sessionState.reasonSavedArticles) WinJS.Namespace.define('Reason', {
                savedArticles: sessionState.reasonSavedArticles
            });
            WinJS.Binding.processAll(element, item);
            //element.querySelector('.raw').textContent = item.content;

            //sharing contract init
            let dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.addEventListener('datarequested', Helpers.shareLink, false);

			if (WinJS.Utilities.isPhone)
			{
				document.getElementById("backButton").style.display = "none";
            }
            //configure appbar
			let appBar = document.querySelector('#appbar').winControl;
			if (Helpers.articleInSaved()) {
			    if (appBar) appBar.showOnlyCommands(['articleFavRemove', 'articleBrowser', 'articleShare']);
			} else {
			    if (appBar) appBar.showOnlyCommands(['articleFav', 'articleBrowser', 'articleShare']);
			}
			
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
