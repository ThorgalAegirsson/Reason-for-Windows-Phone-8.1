(function () {
    'use strict';
    console.clear();

    //Saved articles into local storage
    //it is saved into a file because the localstorage values can't be longer than 8kB
    let appData = Windows.Storage.ApplicationData.current;
    let savedArticles = [];
    appData.localFolder.getFileAsync('savedArticles.txt')
        .then(function (file) {
            return Windows.Storage.FileIO.readTextAsync(file);
        }, function error(file) {
            })
        .then(function (contents) {
            if (contents) savedArticles = JSON.parse(contents);
            WinJS.Namespace.define('Reason', {
                savedArticles: savedArticles
            });
        });
    //END OF LOCAL STORAGE


    let el = null;
    let currentFeed = null;
    let mediaFeed = false;
    let orgFeed = false;
    let currentItemIndex;
    let ReasonFeed = {
        Blog: {
            name: 'Blog',
            url: 'http://feeds.feedburner.com/reason/HitandRun?format=xml',
            firstStart: true,
            previous: null,
            current: null,
            element: null
        },
        Articles: {
            name: 'Articles',
            url: 'http://feeds.feedburner.com/reason/Articles?format=xml',
            firstStart: true,
            previous: null,
            current: null,
            element: null
        },
        ReasonTV: {
            name: 'TV',
            url: 'http://reason.com/itunes/index.xml',
            firstStart: true,
            previous: null,
            current: null,
            element: null
        },
        Podcast: {
            name: 'Podcast',
            url: 'http://reason.com/podcast/index.xml',
            firstStart: true,
            previous: null,
            current: null,
            element: null
        },
        'Reason.Org': {
            name: 'org',
            url: 'http://reason.org/news/index.xml',
            firstStart: true,
            previous: null,
            current: null,
            element: null
        }
    };

    

    function retrieveFeed(feed, lv, element) {
        el = element;
        let complete = false;
        mediaFeed = false;
        orgFeed = false;
        let feedArr = [];
        let client = new Windows.Web.Syndication.SyndicationClient();
        let url = feed.url;
        if (url === 'http://reason.org/news/index.xml') {
            orgFeed = true;
        }
        let uri = null;
        try {
            uri = new Windows.Foundation.Uri(url);
        } catch (err) {
        }
        client.setRequestHeader("User-Agent", "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0)");

        client.retrieveFeedAsync(uri).then(function (feedData) {
            currentFeed = feedData;
            let title = '(no title)';
            if (currentFeed.title) title = currentFeed.title.text;
            mediaFeed = (title === 'Reason Video Podcast'||title === 'Reason Podcast') ? true : false;
            currentItemIndex = 0;
            if (currentFeed.items.size > 0) {
                let feedSize = currentFeed.items.size;
                if (feedSize > 40) feedSize = 40; // media feeds are too long (100 elements)
                for (; currentItemIndex < feedSize; currentItemIndex++) {
                    _createFeedObj(currentItemIndex, feedArr);
                    if (currentItemIndex === feedSize - 1) complete = true;
                }
            }
            feed.current = feedArr;
            feed.previous = feedArr;
            return feed;
        }, onError, onProgress);
        return new WinJS.Promise(function (done, error, progress) {
            let intervalID = setInterval(function () {
                if (complete) {
                    done(feed);
                    clearInterval(intervalID);
                }
            }, 50);
        });
    }

    function onProgress() {
    }

    function onError(err) {
        Windows.UI.Popups.MessageDialog("I couldn't download new articles. Make sure you're connected to the Internet.").showAsync();
        if (el.querySelector('.feedStatus')) el.querySelector('.feedStatus').classList.add('hide');
        let errorStatus = Windows.Web.Syndication.SyndicationError.getStatus(err.number);
        if (errorStatus === Windows.Web.Syndication.SyndicationErrorStatus.invalidXml) console.log('An invalid XML exception was thrown. Please make sure to use a URI that points to a RSS or Atom feed');
    }

    function refreshFeed(feed, element) {
        
        element.querySelector('.feedStatus').classList.remove('hide');
        let lv = element.querySelector('.itemslist');
        let listView = lv.winControl;

        Reason.retrieve(feed, listView, element).done(
            function (feed) {
                try {
                    // THIS HAPPENS ONLY SOMETIMES ALTHOUGH THE SITUATION IS EXACTLY THE SAME:
                    //When connection lost and then reconnected, user navigates to an item and back to the listview an error is thrown in UI.JS - why!?!
                    //Possibly I could return a promise with the feed and populate listview in section page itself, maybe that would help... If not - debug steps in ui.js
                    listView.itemDataSource = new WinJS.Binding.List(feed.current).dataSource;
                } catch (e) {

                }
                
                feed.firstStart = false;
                Helpers.savePrevious(feed);
                if (element.querySelector('.feedStatus')) element.querySelector('.feedStatus').classList.add('hide');
            },
            function error() {
                if (element.querySelector('.feedStatus')) element.querySelector('.feedStatus').classList.add('hide');
                Windows.UI.Popups.MessageDialog("I couln't download the articles. Check your internet connection").showAsync();
                listView.itemDataSource = new WinJS.Binding.List(feed.previous).dataSource;
            },
            function progress(feedLength) {
            }
        );
    }

    function videoToPicture(video) { // currently not in use - see problems in trello
        
        let videoElement = document.createElement('video');
        videoElement.src = video;
        let scale = 0.4;
        let canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth * scale;
        canvas.height = videoElement.videoHeight * scale;
        canvas.getContext('2d').drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        let src = canvas.msToBlob();
        WinJS.log && WinJS.log('pic src from vid: ', 'helper', 'INFO');
        WinJS.log && WinJS.log(src, 'helper', 'INFO');
        let srcURL = URL.createObjectURL(src);
        WinJS.log && WinJS.log(srcURL, 'helper', 'INFO');
        return srcURL;
    }

    function displayDate(date) {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        if (day < 10) {
            day = '0' + day.toString();
        }
        if (month < 10) {
            month = '0' + month.toString();
        }
        return month + '.' + day + '.' + year;
    }

    function displayDateNames(date) {
        let months = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
        let day = date.getDate();
        let month = months[date.getMonth()];
        let year = date.getFullYear();
        return month +' '+ day + ', ' + year;
    }

    function _parseContent(content) {
        let parser = new DOMParser();
        return parser.parseFromString(content, 'text/html');
    }

    function _createFeedObj(currentItemIndex, feedArr) {
        
        let defaultPic = '/images/reasonlogo.png';
        if (currentFeed.title.text === 'Reason Foundation -') {
            defaultPic = 'http://reason.org/media/images/logo.png';
        }
        if (mediaFeed && currentFeed.imageUri) {
            defaultPic = currentFeed.imageUri.absoluteUri;
        }
        let item = currentFeed.items[currentItemIndex];

        let feedObject = {
            media:{}
        };
        let title = '(no title)';
        if (item.title) title = item.title.text;
        feedObject.title = title;

        if (item.links.size > 0) feedObject.link = item.links[0].uri.absoluteUri;
        
        let content = '(no content)';
        
        if (item.content) {
            content = item.content.text;
            content = content.replace('href="//reason.com', 'href="http://reason.com');

        } else if (item.summary) {
            content = '<div>'+item.summary.text+'</div>';
        }
        feedObject.content = content;

        if (item.summary) {
            feedObject.summary = (item.summary.xml)?item.summary.xml.innerText : item.summary.text;
        };

        let author = [{
            name: '',
            email: ''
        }];
        if (item.authors&& !mediaFeed) {
            if (item.authors.size > 0) {
                for (let i = 0; i < item.authors.size; i++) {
                    author[i] = {};
                    author[i].name = item.authors[i].name || '';
                    if (item.authors[i].uri) author[i].email = item.authors[i].uri.absoluteUri || '';
                }
            }
        }
        feedObject.author = author;
        

        let published = {
            original: item.lastUpdatedTime,
            updated: item.publishedDate
        };
        published.date = (item.lastUpdatedTime > item.publishedDate) ? item.lastUpdatedTime : item.publishedDate;
        published.articleDate = displayDate(published.date);
        published.articleDateName = displayDateNames(published.date);
        feedObject.published = published;

        //links
        
        feedObject.origLink = item.links[0].uri.absoluteUri;

        if (item.links[1]) feedObject.origLink = item.links[1].uri.absoluteUri; //if it's a media feed the link to the article is here

        //extensions overwriting previous values
        for (let i = 0; i < item.elementExtensions.size; i++) {
            let extension = item.elementExtensions[i];
            switch (extension.nodeName) {
                case 'origLink':
                    feedObject.origLink = extension.nodeValue; //link to the article in regular feeds
                    break;
                case 'duration':
                    feedObject.media.duration = extension.nodeValue;
                    break;
                case 'author':
                    if (extension.elementExtensions[0]) {
                        author[0].name = extension.elementExtensions[0].nodeValue;
                        if (extension.elementExtensions[1]) author[0].email = extension.elementExtensions[1].nodeValue;
                        feedObject.author = author;
                    }
                    break;
            }
        }

        let picSrc = '';
        let vidSrc = '';
        
        let contentHTML = _parseContent(feedObject.content);
        let firstPic = contentHTML.getElementsByTagName('div')[0].getElementsByTagName('img')[0];
        if (firstPic) {
            feedObject.picture = firstPic.src;
        } else {
            feedObject.picture = defaultPic;
        }
        if (mediaFeed && currentFeed.imageUri) feedObject.picture = defaultPic;
        if (orgFeed) feedObject.picture = defaultPic;

        let firstVid = contentHTML.getElementsByTagName('iframe')[0];
        if (firstVid) {
            feedObject.media.src = firstVid.src;
        } else if (mediaFeed) {
            feedObject.media.src = feedObject.link;
            //feedObject.picture = videoToPicture('/images/Bajka.mp4');
        }

        feedObject.pictureSrc = 'url("' + feedObject.picture + '")';
        if (item.duration) feedObject.media.duration = item.duration.text;

        feedArr.push(feedObject);
    }


    WinJS.Namespace.define('Reason', {
        retrieve: retrieveFeed,
        allFeeds: ReasonFeed,
        refreshFeed: refreshFeed,
        currentItem: null,
        currentData: {
            feed: null,
            element: null
        }
    });
})();