var gFileSystem;
function setBackgroundImage(url) {
  document.body.style.backgroundImage = 'url(' + url + ')';
}

function randomSet() {
  chrome.storage.local.get({
    imageList: []
  }, function(items) {
    var urlList = items.imageList;
    var url = urlList[Math.floor(Math.random() * urlList.length)];
    console.log(url);
    setBackgroundImage(url);
  })
}

window.onload = randomSet();
