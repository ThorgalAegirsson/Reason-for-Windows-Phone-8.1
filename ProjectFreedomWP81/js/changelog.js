(function () {
    'use strict';
    let listOfChanges = '<h2>What\'s new in this version:</h2 ><ul><li>Videos from ReasonTV and podcasts are now correctly displayed in "Saved" section</li><li>When an article is added to/removed from favorites the icon changes immediately</li><li>Layout changes - main logo is fixed now, tweets inside articles are formatted etc.</li><li>Stability improvements - the app doesn\'t crash anymore when "View this article" is clicked</li></ul>';

    function initialize() {
        let appData = Windows.Storage.ApplicationData.current;
        let localSettings = appData.localSettings;
        //localSettings.values['appVersion'] = null;
        let appVersion = localSettings.values['appVersion'];
        
        if (appVersion) {
            if (appVersion !== '1.1.0.0') {
                changeLogModal(listOfChanges);
                localSettings.values['appVersion'] = '1.1.0.0';
            } 
        } else {
            changeLogModal(listOfChanges);
            localSettings.values['appVersion'] = '1.1.0.0';
        }
    }

    function changeLogModal(listOfChanges) {
        let modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = listOfChanges;
        let btn = document.createElement('button');
        btn.classList.add('modalBtn');
        btn.innerText = 'Got it!';
        modal.appendChild(btn);
        document.querySelector('body').appendChild(modal);
        btn.addEventListener('click', function () {
            modal.parentElement.removeChild(document.querySelector('.modal'));
        });
    }

    document.addEventListener('DOMContentLoaded', initialize);
})();