(function () {
    'use strict';

    function _parseContent(content) {
        let parser = new DOMParser();
        return parser.parseFromString(content, 'text/html');
    }

    function processContent(contentHTML) {
        const content = _parseContent(contentHTML);
        const imgs = content.querySelectorAll('img');
        [].forEach.call(imgs, function (img) {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });
        let serializer = new XMLSerializer();
        let contentString = serializer.serializeToString(content);
        return contentString;
    }
    //function ellipsizeTextBox(txt) { //not in use
    //    let el = txt.parentElement;
    //    let wordArray = el.innerHTML.split(' ');
    //    while (el.scrollHeight > el.offsetHeight) {
    //        wordArray.pop();
    //        el.innerHTML = wordArray.join(' ') + '...';
    //    }
    //}

    function authorString(authorsArray) {
        let authors = [];
        authorsArray.forEach(function (author) {
            let authorEl = '<a href="' + author.email + '">' + author.name + '</a>';
            authors.push(authorEl);
        });
        return '<span>' + authors.join(', ') + '</span>';
    }

    function authorStringOnly(authorsArray) {
        let authors = [];
        authorsArray.forEach(function (author) {
            authors.push(author.name);
        });
        return authors.join(', ');
    }


    WinJS.Namespace.define("MyConverters", {
        cssUrl: WinJS.Binding.converter(function (url) {
            return "url('" + url + "')";
        }),
        authorString: WinJS.Binding.converter(function (authorlist) {
            return authorString(authorlist);
        }),
        authorStringOnly: WinJS.Binding.converter(function (authorlist) {
            return authorStringOnly(authorlist);
        }),
        staticHTML: WinJS.Binding.converter(function (element) {
            let processedContent = processContent(element);
            return window.toStaticHTML(processedContent);
        })
    });
})();