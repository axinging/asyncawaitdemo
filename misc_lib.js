async function readFileAsync(url, method = 'Get') {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

// Sleep by millisecond.
function asyncSleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function download(content, fileName) {
  var a = document.createElement('a');
  var file = new Blob([JSON.stringify(content)], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}
