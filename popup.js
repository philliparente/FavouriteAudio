storage = chrome.storage.sync;

var titlePattern = />(.*)<\/\s*h1>/g;
var audioPattern = /\'(.*\.mp3|\.mp4|\.wav|\.ogg)\'/g;
var urlPattern = /^((http|https):\/\/)?([a-z0-9-.]+)/g;

function clear(){
  storage.clear(function() {
          var table = document.querySelector("#table_list");
          cleanTable(table);
          console.log("Data cleared!");
      });

}

function saveItem(title, url, callback){

    storage.get({favourite_audios: {list: []}}, function(data){
      data.favourite_audios.list.push({title: title, url: url});
      storage.set({favourite_audios: data.favourite_audios}, function(){

        callback(data.favourite_audios);
      });  
    });

    
}

function getCurrentTabUrl(callback) {
 
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    
    callback(url);
  });
}

function removeItem(index){
  storage.get({favourite_audios: {list: []}}, function(data){
    
    data.favourite_audios.list.splice(index, 1);
    storage.set({favourite_audios: data.favourite_audios}, function(){
      updateTable(data.favourite_audios);
    });
        
    
  });
}


chrome.runtime.onMessage.addListener(function(request, sender) {  
  if (request.action == "getSource") {

    getCurrentTabUrl(function(url){
      var title = titlePattern.exec(request.source);
      
      var audioUrl = audioPattern.exec(request.source);

      if(audioUrl){
        audioUrl = audioUrl[1];        
        processedAudioUrl = urlPattern.exec(audioUrl);
        
        var tabUrl = urlPattern.exec(url);
        if (!processedAudioUrl){
          tabUrl
          var scheme = tabUrl[2];

          var domain = tabUrl[3];

          fullUrl = scheme + "://" + domain+audioUrl;
        }else{
          fullUrl = processedAudioUrl[2] + "://" + processedAudioUrl[3] + audioUrl;
        }   

        var url = document.querySelector('#input_url');
        url.value = fullUrl;     
      }

      
      

      if (title){
          title = title[1];
          var title_input = document.querySelector('#input_title');
          title_input.value = title;
      }
      
    });

    
    
  }
});

function cleanTable(table){
  table.innerHTML="";
}

function fillRow(row, rowData, index){
  var cell_title = row.insertCell(0);
  var cell_url = row.insertCell(1);

  var cell_remove = row.insertCell(2);

  cell_title.innerHTML = rowData.title;
  
  var buttonPlay = document.createElement('button');
  buttonPlay.className = "action play";
  buttonPlay.innerText = ">";

  var audio = new Audio(rowData.url);
  buttonPlay.onclick = function(){
    
    audio.play();
  }
  cell_url.appendChild(buttonPlay);

  var buttonRemove = document.createElement('button');
  buttonRemove.className = "action remove";
  buttonRemove.innerText = "x";
  buttonRemove.onclick = function(){

      removeItem(index);
  };

  cell_remove.appendChild(buttonRemove);
}
function updateTable(data){
  var table = document.querySelector("#table_list");
  cleanTable(table);
  
  for (var i = 0; i < data.list.length; i++) {
    var row = table.insertRow(i);
    fillRow(row, data.list[i], i);
    
  }
  
}


function onWindowLoad() {
  
  var title = document.querySelector('#input_title');
  var url = document.querySelector('#input_url');
  

  storage.get({favourite_audios: {list: []}}, function(data){
    updateTable(data.favourite_audios);
  });

  document.getElementById('submit').onclick = function() {

    saveItem(title.value, url.value, function(data){
      updateTable(data);
    });
    
  }

  document.getElementById('clear').onclick= function() {
    clear();
  }

  
  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      // message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
    }
  });

}

window.onload = onWindowLoad;