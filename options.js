window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem; 
window.resolveLocalFileSystemURL = 
  window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

var gCurrentList;

function errorHandler(tag) {
  return function(e) {
    console.log(tag + ': ' + e.name + ' ' + e.message);
  }
}

function uploadFile(file) {
  window.requestFileSystem(window.PERSISTENT, 100*1024*1024, function(fs) {
    // Duplicate each file to local storage
    saveFile(fs,file);
  }, errorHandler('requestFileSystem'));
}

function saveFile(fs, file) {
  fs.root.getFile(md5(file.name), {create: true},
    function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
        // write file system
        fileWriter.write(file);

        // write local storage
        addFileIndex(fileEntry.toURL());

        // add to page
        let container = document.getElementById('container');
        let img = createImage(fileEntry.toURL());
        container.appendChild(img);
      }, errorHandler('writeFile'));
    }, errorHandler('getFile'));
}

function deleteFile(url) {
  window.resolveLocalFileSystemURL(url, function(fileEntry) {
    fileEntry.remove(function() {
    }, errorHandler('removeFile'));
  });
  removeFileIndex(url);
}

function addFileIndex(url) {
  gCurrentList.push(url);
  chrome.storage.local.set({
    imageList: gCurrentList
  }, function() {
    //TODO add callback here
  });
}

function removeFileIndex(url) {
  var currentList;
  chrome.storage.local.get({
    imageList: []
  }, function(items) {
    currentList = items.imageList;
    var index = currentList.indexOf(url);
    if (index > -1) {
      currentList.splice(index, 1);
      chrome.storage.local.set({
        imageList: currentList
      }, function() {
        //TODO add callback here
      })
    }
  });
}

function onDeleteClicked(event) {
  var targetElement = event.target || event.srcElement;
  var rootImg = targetElement.parentNode.parentNode;
  var url = rootImg.dataset.url;
  deleteFile(url);
  rootImg.parentNode.removeChild(rootImg);
}

function createImage(url) {
  let img = document.createElement('div');
  img.setAttribute('class', 'img');
  img.style.backgroundImage = 'url(' + url + ')';
  img.dataset.url = url;
  img.innerHTML = '<a class="overlay"><span class="icon"></span></a>';
  let removeButton = img.firstChild;
  removeButton.addEventListener('click', onDeleteClicked);
  return img;
}

window.onload = function() {
  var container = document.querySelector('#container');
  chrome.storage.local.get({
    imageList: []
  }, function(items) {
    var urlList = items.imageList;
    var fragment = document.createDocumentFragment();
    let counter = 0;
    for (var i = 0, url; url = urlList[i]; i++, counter++) {
      let img = createImage(url);
      fragment.appendChild(img);
    }
    container.appendChild(fragment);
    gCurrentList = urlList;
  })
}

// add drag and drop
let dnd = DnDFileController('body', function(data) {
  chosenEntry = null;
  for (var i = 0; i < data.items.length; i++) {
    var item = data.items[i];
    if (item.kind == 'file' &&
        item.type.match('image/*') &&
        item.webkitGetAsEntry()) {
      chosenEntry = item.webkitGetAsEntry();
      chosenEntry.file(uploadFile);
    }
  };
})
