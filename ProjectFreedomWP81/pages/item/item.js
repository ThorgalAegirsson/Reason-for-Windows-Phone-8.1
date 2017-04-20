(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/item/item.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            let item = options.item; //defined in section3page.js
            //var item = Data.resolveItemReference(options.item);
            console.log('item: ');
            console.log(item);
            WinJS.Binding.processAll(null, item);
            //element.querySelector(".titlearea .pagetitle").innerHTML = item.title;
            //element.querySelector('.author .authorName').textContent = item.author[0].name;
            //element.querySelector('.author a').href = item.author[0].email;
            //element.querySelector('.dateName').textContent = item.published.articleDateName;
            //element.querySelector('.content').innerHTML = window.toStaticHTML(item.content);
			if (WinJS.Utilities.isPhone)
			{
				document.getElementById("backButton").style.display = "none";
            }
			// TODO: Initialize the page here.
        }
    });
})();
