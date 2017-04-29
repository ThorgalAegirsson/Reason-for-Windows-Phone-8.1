(function () {
    'use strict';
    WinJS.Utilities.startLog('retrieveFeed pageControl');
    console.clear();
    
    
    let appData = Windows.Storage.ApplicationData.current;
    console.log('maximum roaming:');
    console.log(appData.roamingStorageQuota);
    
    
    let complete = false;

    //Saved articles into local storage
    //it is saved into a file because the localstorage values can't be longer than 8kB
    let savedArticles = [];
    appData.localFolder.getFileAsync('savedArticles.txt')
        .then(function (file) {
            return Windows.Storage.FileIO.readTextAsync(file);
            console.log('savedArticles open');
        }, function error(file) {
            //appData.localFolder.createFileAsync('savedArticles.txt');
            console.log('savedArticles created');
            })
        .then(function (contents) {
            if (contents) savedArticles = JSON.parse(contents);
            WinJS.Namespace.define('Reason', {
                savedArticles: savedArticles
            });
            console.log('savedArticles:');
            console.log(savedArticles);
        });

    
    //let savedArticlesContainer = appData.localSettings.createContainer('savedArticles', Windows.Storage.ApplicationDataCreateDisposition.always);
    //if (savedArticlesContainer.values.hasKey('savedArticles')) savedArticles = JSON.parse(savedArticlesContainer.values['savedArticles']);
    //console.log('savedArticles in roaming: ');
    //console.log(savedArticles);


    //END OF LOCAL STORAGE

    let currentFeed = null;
    let mediaFeed = false;
    let currentItemIndex = 0;
    let defaultPic = '/images/reasonlogo.png';
    let ReasonFeed = {
        Blog: {
            name: 'Blog',
            url: 'http://feeds.feedburner.com/reason/HitandRun?format=xml',
            firstStart: true,
            previous: null,
            current: null
        },
        Articles: {
            name: 'Articles',
            url: 'http://feeds.feedburner.com/reason/Articles?format=xml',
            firstStart: true,
            previous: null,
            current: null
        },
        TV: {
            name: 'TV',
            url: 'http://reason.com/itunes/index.xml',
            firstStart: true,
            previous: null,
            current: null
        },
        Podcast: {
            name: 'Podcast',
            url: 'http://reason.com/podcast/index.xml',
            firstStart: true,
            previous: null,
            current: null
        },
        Org: {
            name: 'org',
            url: 'http://reason.org/rss/index.xml',
            firstStart: true,
            previous: null,
            current: null
        }
    };

    

    function retrieveFeed(feedObject, lv) {
        let feedArr = [];
        let client = new Windows.Web.Syndication.SyndicationClient();
        let url = feedObject.url;
        //let defaultPic = '/images/reasonlogo.png';
        let uri = null;
        try {
            uri = new Windows.Foundation.Uri(url);
            if (url === 'http://reason.org/rss/index.html') {
                defaultPic = 'http://reason.org/media/images/logo.png';
            }
            WinJS.log && WinJS.log('log uri ' + uri, 'retrieveFeed', 'INFO');
        } catch (err) {
            
            WinJS.log && WinJS.log('Error: Invalid URI' + err, 'retrieveFeed', 'ERROR');
        }
        WinJS && WinJS.log('start retrieving...', 'retrieveFeed', 'INFO');
        client.setRequestHeader("User-Agent", "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0)");

        client.retrieveFeedAsync(uri).then(function (feed) {
            document.querySelector('.feedStatus').style.display = 'none';
            currentFeed = feed;
            WinJS.log && WinJS.log('Feed download complete', 'retrieveFeed retrieveFeedAsync', 'INFO');
            let title = '(no title)';
            if (currentFeed.title) title = currentFeed.title.text;
            //document.querySelector('#outcome').innerText = title;
            mediaFeed = (title === 'Reason Video Podcast'||title === 'Reason Podcast') ? true : false;
            WinJS && WinJS.log('mediaFeed: ' + mediaFeed, 'retrieveFeed retrieveFeedAsync', 'INFO');


            currentItemIndex = 0;
            if (currentFeed.items.size > 0) {
                for (; currentItemIndex < currentFeed.items.size; currentItemIndex++) {
                    createFeedObj(currentItemIndex, feedArr);
                    if (currentItemIndex === currentFeed.items.size - 1) complete = true;
                }
            }
            WinJS && WinJS.log("Items: " + currentFeed.items.size, 'retrieveFeed retrieveFeedAsync', 'INFO');
            WinJS && WinJS.log("latest feedObject: ", 'retrieveFeed retrieveFeedAsync', 'INFO');
            //WinJS && WinJS.log(feedArr, 'retrieveFeed retrieveFeedAsync', 'INFO');
            console.log(feedArr);
            feedObject.current = feedArr;
            //lv.itemDataSource = new WinJS.Binding.List(feedObject.current).dataSource;
            feedObject.previous = feedArr;
            return feedObject;
        }, onError, onProgress);
        return new WinJS.Promise(function (done, error, progress) {
            let intervalID = setInterval(function () {
                //progress(doneFeed.length);
                if (complete) {
                    done(feedObject);
                    clearInterval(intervalID);
                }
            }, 50);
        });
    }

    function onProgress() {
        document.querySelector('.feedStatus').style.display = '';
        WinJS.log && WinJS.log('downloading...', 'retrieveFeed promise', 'INFO');
    }

    function onError(err) {
        WinJS.log && WinJS.log(err, 'retrieveFeed promise', 'ERROR');
        WinJS.log && WinJS.log("ERROR ERROR ERROR", 'retrieveFeed promise', 'ERROR');
        document.querySelector('.feedStatus').textContent = "Couldn't download the articles!!!";
        document.querySelector('.feedStatus').style.display = '';
        window.setTimeout(function () {
            if (document.querySelector('.feedStatus')) document.querySelector('.feedStatus').style.display = 'none';
        }, 5000);
        let errorStatus = Windows.Web.Syndication.SyndicationError.getStatus(err.number);
        if (errorStatus === Windows.Web.Syndication.SyndicationErrorStatus.invalidXml) console.log('An invalid XML exception was thrown. Please make sure to use a URI that points to a RSS or Atom feed');
    }

    function refreshFeed(feed, element) {
        element.querySelector('.feedStatus').style.display = '';
        let listView = element.querySelector(".itemslist").winControl;
        WinJS.log && WinJS.log('feed refreshed', 'pageControl', 'INFO');
        Reason.retrieve(feed, listView).done(
            function (feed) {
                feed.firstStart = false;
                WinJS.log && WinJS.log('listview' + listView, 'pageControl', 'INFO');
                WinJS.log && WinJS.log('                                              feed final:', 'pageControl', 'INFO');
                WinJS.log && WinJS.log(feed, 'pageControl', 'INFO');
                listView.itemDataSource = new WinJS.Binding.List(feed.current).dataSource;
                element.querySelector('.feedStatus').style.display = 'none';
                Helpers.savePrevious(feed);
                console.log('previous saved');
            },
            function error() {
                feed.firstStart = true;
                element.querySelector('.feedStatus').innerHTML = "<p>Something went wrong. Do you have the internet connection? Try again later...</p>"
                element.querySelector('.feedStatus').style.display = '';
                let intervalID = window.setTimeout(function () {
                    element.querySelector('.feedStatus').style.display = 'none';
                }, 5000);
                WinJS.log && WinJS.log("                                             ERROR ERROR ERROR", 'pageControl', 'INFO');
            },
            function progress(feedLength) {
                WinJS.log && WinJS.log('                                               feed length: ' + feedLength, 'pageControl', 'INFO');
            }
        );
    }

    function videoToPicture(video) { // currently not in use - see problem in trello
        
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
        //if (day < 10) {
        //    day = '0' + day.toString();
        //}
        return month +' '+ day + ', ' + year;
    }

    function parseContent(content) {
        let parser = new DOMParser();
        return parser.parseFromString(content, 'text/html');
    }

    function processContent(contentHTML) {
        const content = parseContent(contentHTML);
        const imgs = content.querySelectorAll('img');
        //debugger;
        [].forEach.call(imgs, function (img) {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });
        let serializer = new XMLSerializer();
        let contentString = serializer.serializeToString(content);
        console.log(contentString);
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

    //function authorString(authorsArray) {
    //    let authors = document.createElement('span');
    //    authorsArray.forEach(function (author) {
    //        let link = document.createElement('a');
    //        link.href = author.email;
    //        let name = document.createElement('span');
    //        name.innerText = author.name;
    //        link.appendChild(name);
    //        authors.appendChild(link);
    //    });
    //    return authors;
    //}
    
    function authorString(authorsArray) {
        let authors = [];
        authorsArray.forEach(function (author) {
            let authorEl = '<a href="' + author.email + '">' + author.name + '</a>';
            //let authorEl = author.name;
            authors.push(authorEl);
        });
        return '<span>'+authors.join(', ')+'</span>';
    }

    function authorStringOnly(authorsArray) {
        let authors = [];
        authorsArray.forEach(function (author) {
            authors.push(author.name);
        });
        return authors.join(', ');
    }

    function createFeedObj(currentItemIndex, feedArr) {
        
        let item = currentFeed.items[currentItemIndex];
        WinJS && WinJS.log('ITEM DURATION:', 'createFeed', 'INFO');
        WinJS && WinJS.log(item.duration, 'createFeed', 'INFO');
        let feedObject = {
            media:{}
        };
        let title = '(no title)';
        if (item.title) title = item.title.text;
        feedObject.title = title;
        WinJS && WinJS.log('Title: ' + feedObject.title, 'createFeed', 'INFO');

        if (item.links.size > 0) feedObject.link = item.links[0].uri.absoluteUri;
        WinJS && WinJS.log('link: ' + feedObject.link, 'createFeed', 'INFO');
        
        let content = '(no content)';
        
        if (item.content) {
            content = item.content.text;
        } else if (item.summary) {
            content = '<div>'+item.summary.text+'</div>';
        }
        feedObject.content = content;
        WinJS && WinJS.log('Content: ' + feedObject.content, 'createFeed', 'INFO');

        if (item.summary) {
            //WinJS && WinJS.log('item.summary:', 'createFeed', 'INFO');
            //WinJS && WinJS.log(item.summary, 'createFeed', 'INFO');
            feedObject.summary = (item.summary.xml)?item.summary.xml.innerText : item.summary.text;
        };
        WinJS && WinJS.log('summary:', 'createFeed', 'INFO');
        WinJS && WinJS.log(feedObject.summary, 'createFeed', 'INFO');

        let author = [{
            name: '',
            email: ''
        }];
        if (item.authors&& !mediaFeed) {
            if (item.authors.size > 0) {
                //debugger;
                for (let i = 0; i < item.authors.size; i++) {
                    //WinJS && WinJS.log('item.authors', 'createFeed', 'INFO');
                    //WinJS && WinJS.log(item.authors, 'createFeed', 'INFO');
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
        WinJS && WinJS.log('Published: ', 'createFeed', 'INFO');
        WinJS && WinJS.log(published.articleDate, 'createFeed', 'INFO');
        WinJS && WinJS.log(published.articleDateName, 'createFeed', 'INFO');

        if (item.links[1]) feedObject.origLink = item.links[1].uri.absoluteUri; //if it's a media feed the link to the article is here
        for (let i = 0; i < item.elementExtensions.size; i++) {
            WinJS && WinJS.log('Extensions: ', 'createFeed', 'INFO');
            WinJS && WinJS.log(item.elementExtensions, 'createFeed', 'INFO');
            
            let extension = item.elementExtensions[i];
            WinJS && WinJS.log(extension.nodeName, 'createFeed', 'INFO');
            WinJS && WinJS.log(item.elementExtensions[i], 'createFeed', 'INFO');
            
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
                        author[0].email = extension.elementExtensions[1].nodeValue;
                        feedObject.author = author;
                    }
                    break;
            }
            //if (item.elementExtensions[i].nodeName == 'origLink') {
            //    feedObject.origLink = item.elementExtensions[i].nodeValue;
            //}
        }
        feedObject.authors = authorStringOnly(feedObject.author);
        feedObject.authorsWithLinks = authorString(feedObject.author);
        WinJS && WinJS.log('authors: ', 'createFeed', 'INFO');
        WinJS && WinJS.log(feedObject.authors, 'createFeed', 'INFO');
        WinJS && WinJS.log('original link: ' + feedObject.origLink, 'createFeed', 'INFO');

        let picSrc = '';
        let vidSrc = '';
        
        let contentHTML = parseContent(feedObject.content);
        let firstPic = contentHTML.getElementsByTagName('div')[0].getElementsByTagName('img')[0];
        if (firstPic) {
            feedObject.picture = firstPic.src;
        } else if (mediaFeed && currentFeed.imageUri) {
            feedObject.picture = currentFeed.imageUri.absoluteUri;
        } else {
            feedObject.picture = defaultPic;
        }

        WinJS && WinJS.log('media feed: ' + mediaFeed);
        let firstVid = contentHTML.getElementsByTagName('iframe')[0];
        WinJS && WinJS.log('firstVid: ' + firstVid, 'createFeed', 'INFO');
        if (firstVid) {
            feedObject.media.src = firstVid.src;
            WinJS && WinJS.log('video thumbnail: ' + feedObject.picture, 'createFeed', 'INFO');

        } else if (mediaFeed) {
            WinJS && WinJS.log('mediafeed picture', 'createFeed', 'INFO');
            feedObject.media.src = feedObject.link;
            //feedObject.picture = videoToPicture('/images/Bajka.mp4');
        }

        feedObject.pictureSrc = 'url("' + feedObject.picture + '")';
        if (item.duration) feedObject.media.duration = item.duration.text;
        
        WinJS && WinJS.log('pic: ' + feedObject.picture, 'createFeed', 'INFO');
        WinJS && WinJS.log('media: ' + feedObject.media.src, 'createFeed', 'INFO');
        WinJS && WinJS.log('media duration: ' + feedObject.media.duration, 'createFeed', 'INFO')
        WinJS && WinJS.log(item, 'createFeed', 'INFO');
        //WinJS && WinJS.log(parseContent(feedObject.content), 'createFeed', 'INFO');

        //document.querySelector('#WebView').innerHTML = window.toStaticHTML(content);
        feedArr.push(feedObject);
        //WinJS && WinJS.log('feedArr:', 'createFeed', 'INFO');
        //WinJS && WinJS.log(feedArr, 'createFeed', 'INFO');
    }


    WinJS.Namespace.define('Reason', {
        retrieve: retrieveFeed,
        //currentFeed: 
        allFeeds: ReasonFeed,
        refreshFeed: refreshFeed,
        currentItem: null
    });
    console.log('Reason.savedArticles after namespace assigning');
    console.log(Reason.savedArticles);
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
            //let contentHTML = window.toStaticHTML(element);
            let processedContent = processContent(element);
            return window.toStaticHTML(processedContent);
        })
        //ellipsizeTextBox: ellipsizeTextBox
    });
    
})();