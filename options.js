var gFileSystem;
function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
}

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

//prepare upload
function uploadFile(fs, file) {
  fs.root.getFile(file.name, {create: true, exclusive: true},
    function(fileEntry) {
      // write file system
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.write(file);
      }, errorHandler);

      // write local storage
      var currentList;
      chrome.storage.local.get({
        imageList: []
      }, function(items) {
        currentList = items.imageList;
        currentList.push(fileEntry.toURL());
        chrome.storage.local.set({
          imageList: currentList
        }, function() {
          //TODO add callback here
        })
      });
    }, errorHandler);
}

document.querySelector('#myfile').addEventListener('change', function(e) {
  var files = this.files;
  console.log(files);
  window.requestFileSystem(window.PERSISTENT, 100*1024*1024, function(fs) {
    // Duplicate each file to local storage
    for (var i = 0, file; file = files[i]; i++) {
      uploadFile(fs,file);
    }
  }, errorHandler);
});
