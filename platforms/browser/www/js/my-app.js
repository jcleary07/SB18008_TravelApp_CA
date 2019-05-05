// Initialize app
var myApp = new Framework7();
  
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'My App',
    // App id
    id: 'com.myapp.test',
    // Enable swipe panel
    panel: {
      swipe: 'left',
    },
    // Add default routes
    routes: [
      {
        path: '/currency/',
        url: 'currency.html',
      },
      {
        path: '/weather/',
        url: 'weather.html',
      },
      {
        path: '/picture/',
        url: 'picture.html',
      },
    ]
    // ... other parameters
  });

var mainView = app.views.create('.view-main');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    getLocation();
    // I ONLY NEED TO ACCESS THE FILE SYSTEM ONCE
    // SO WE REQUEST THIS STRAIGHT AWAY AS SOON AS
    // THE PROGRAM IS LOADING
    tryingFile1();
    tryingFile2();
    
});

// Option 1. Using one 'page:init' handler for all pages
$$(document).on('page:init', function (e) {
    // Do something here when page loaded and initialized
    console.log(e);
})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="about"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log(e);
})


//function to get 
function getLocation()
{
    navigator.geolocation.getCurrentPosition(geoCallback, onError);
}

function geoCallback (position){
    /*var element = document.getElementById('gpslocation');
    element.innerHTML = 'Longitude: ' + position.coords.longitude + '<br>' +
                        'Latitude: ' + position.coords.latitude + '<br>' +
                        'Timestamp ' + position.timestamp + '<br>';*/
                        
      console.log('Longitude: ' + position.coords.longitude + '<br>' +
      'Latitude: ' + position.coords.latitude);
      initMap(position);
      openCage(position);
      weather(position);
}

// onError callback
function onError (msg){ 
    console.log(msg);
}

function initMap(position) 
{
  var lat1 = position.coords.latitude;
  var long1 = position.coords.longitude;

  var currentPosition = {lat: lat1, lng: long1};
  console.log(currentPosition);
  
  var placeholder = document.getElementById('googleMap');

  var map = new google.maps.Map(placeholder,
  { zoom: 10,
    center: currentPosition
  }
  );

  var marker = new google.maps.Marker({
    position: currentPosition, 
    map: map
    });

  console.log(placeholder);
  console.log(map);

}

function openCage(position)
{
    var lat1 = position.coords.latitude;
    var long1 = position.coords.longitude;
    var http = new XMLHttpRequest();
    const url = 'https://api.opencagedata.com/geocode/v1/json?q='+lat1+'+'+long1+'&key=b95ccb4da5784bfca72b01a6b2af690f';
    //const url = 'https://api.opencagedata.com/geocode/v1/json?q=53.346+-6.2588&key=b95ccb4da5784bfca72b01a6b2af690f';
    http.open("GET", url);
    http.send();

    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response);
        console.log(responseJSON);

        var city = responseJSON.results[0].components.city;
        var country = responseJSON.results[0].components.country;
        var county = responseJSON.results[0].components.county;
        var currency = responseJSON.results[0].annotations.currency.name;

        document.getElementById('opencage').innerHTML =  "Country: " 
        + country + "<br>City: " + city +  "<br>County: " + county + 
        "<br>Currency: " + currency;
    }
}

var input;
var rate;

function readingInput(){

    input = document.getElementById('/currency/input').value;
}

function getRate(){

    // The XMLHttpRequest object, is the one in 
    // charge of handleing the request for us
    var http = new XMLHttpRequest();

    // The url to send the request to. Notice that we're passing
    // here some value of Latituted and longitude for the API 
    // to process
    const url = 'http://apilayer.net/api/live?access_key=295fa4ae6b0ad82f2deec9e1a75a6eda&currencies=EUR&source=USD&format=1';
    // Opening the request. Remember, we will send
    // a "GET" request to the URL define above
    http.open("GET", url);
    // Sending the request
    http.send();

    // Once the request has been processed and we have
    // and answer, we can do something with it
    http.onreadystatechange = (e) => {
        
        // First, I'm extracting the reponse from the 
        // http object in text format
        var response = http.responseText;

        // As we know that answer is a JSON object,
        // we can parse it and handle it as such
        var responseJSON = JSON.parse(response); 
    
        // Printing the result JSON to the console
        console.log(responseJSON);

        rate = responseJSON.quotes.USDEUR;
        
    }
}

// Converting in one direction
function convert(){

    readingInput();
    getRate();
    var result = input * rate;
    console.log(input);
    console.log(rate);
    document.getElementById('/currency/result').innerHTML = result;
}

// Converting in the other direction
function convert2(){

    readingInput();
    getRate();
    var result = input / rate;
    document.getElementById('/currency/result').innerHTML = result;

}

function tryingFile1(){

  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemCallback1, onError);
  
}

function tryingFile2(){

  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemCallback2, onError);
  
 
}

function fileSystemCallback1(fs){

  // Name of the file I want to create
  // IN THIS CASE A JPG FILE!!
  var fileToCreate = "newPersistentPic.jpg";

  // Opening/creating the file
  fs.root.getFile(fileToCreate, fileSystemOptionals, getFileCallback1, onError);
}

var fileSystemOptionals = { create: true, exclusive: false };

// NOW, THE GETFILECALLBACK IS NOT GOING
// TO CALL THE READ OR THE WRITE FUNCTIONS 
// AUTOMATICALLY. THIS WILL BE DONE BY THE
// BUTTON ON THE FRONT END
// THE IMPORTANT PART HERE IS TO PUT THE 
// FILE ENTRY SOMEWHERE FOR ALL OTHER FUNCTIONS
// TO FIND
var entry;
function getFileCallback1(fileEntry){
  
  entry = fileEntry;

}

// THE WRITEPIC FUNCTION DOES NOT NEED TO
// RECEIVE THE FILE ENTRY BECAUSE IT CAN
// ACCESS IT DIRECTLY IN THE GLOBAL SCOPE VARIABLE
function writePic(dataObj) {

  // THIS IS IMPORTANT, THIS IS THE GLOBAL VARIABLE
  entry.createWriter(function (fileWriter) {

      // SAVING WHATEVER OBJECT IS PASSED FROM OUTSIDE
      fileWriter.write(dataObj);

      fileWriter.onwriteend = function() {
          console.log("Successful file write...");
      };

      fileWriter.onerror = function (e) {
          console.log("Failed file write: " + e.toString());
      };

  });
}

// TO OPEN THE PICTURE, AGAIN WE DON'T NEED TO
// PASS THE FILE ENTRY, BECAUSE EVERYONE CAN SEE
// THE FILE ENTRY IN THE GLOBAL VARIABLE
function readPic() {

  // AND AGAIN, I USE THE GLOBAL VARIBLE EVERYONE IS SEEING
  entry.file(function (file) {
      
      // Create the reader
      var reader = new FileReader();

      // READ THE FILE AS A BINARY STRING
      reader.readAsBinaryString(file);

      reader.onloadend = function() {

          console.log("Successful file read: " + this.result);
          console.log("file path: " + entry.fullPath);

          // AND PUT THE RESULT IN THE FRONT END
          document.getElementById('/picture/display').src = reader.result;

      };

  }, onError);
}

function onError(msg){
  console.log(msg);
}

// NOW, TAKING THE PICTURE IS THE SAME
function pics(){
navigator.camera.getPicture(cameraCallback, onError,{correctOrientation: true});
}

// BUT THE CALLBACK, INSTEAD OF DISPLAYING THE PIC
// IS GOING TO SAVE IT USING THE WRITEPIC FUNCTION
// AND PASSING A BLOB OBJECT!
function cameraCallback(imageData) {
  
  var dataObj = new Blob([imageData], { type: 'image/jpeg' });
  
  writePic(dataObj);

}

//next function starts HERE!!!!!!
function fileSystemCallback2(fs){

  // Name of the file I want to create
  // IN THIS CASE A JPG FILE!!
  var fileToCreate = "locations.txt";

  // Opening/creating the file
  fs.root.getFile(fileToCreate, fileSystemOptionals, getFileCallback2, onError);
}

var fileSystemOptionals = { create: true, exclusive: false };

// NOW, THE GETFILECALLBACK IS NOT GOING
// TO CALL THE READ OR THE WRITE FUNCTIONS 
// AUTOMATICALLY. THIS WILL BE DONE BY THE
// BUTTON ON THE FRONT END
// THE IMPORTANT PART HERE IS TO PUT THE 
// FILE ENTRY SOMEWHERE FOR ALL OTHER FUNCTIONS
// TO FIND
var locationentry;
function getFileCallback2(fileEntry){
  
  locationentry = fileEntry;

}

// THE WRITEPIC FUNCTION DOES NOT NEED TO
// RECEIVE THE FILE ENTRY BECAUSE IT CAN
// ACCESS IT DIRECTLY IN THE GLOBAL SCOPE VARIABLE
function writeLocation(dataObj) {

  // THIS IS IMPORTANT, THIS IS THE GLOBAL VARIABLE
  locationentry.createWriter(function (fileWriter) {

      // SAVING WHATEVER OBJECT IS PASSED FROM OUTSIDE
      fileWriter.write(dataObj);

      fileWriter.onwriteend = function() {
          console.log("Successful file write...");
          alert("Location Stored!!");
      };

      fileWriter.onerror = function (e) {
          console.log("Failed file write: " + e.toString());
      };

  });
}

// TO OPEN THE PICTURE, AGAIN WE DON'T NEED TO
// PASS THE FILE ENTRY, BECAUSE EVERYONE CAN SEE
// THE FILE ENTRY IN THE GLOBAL VARIABLE
function readLocation() {

  // AND AGAIN, I USE THE GLOBAL VARIBLE EVERYONE IS SEEING
  locationentry.file(function (file) {
      
      // Create the reader
      var reader = new FileReader();

      // READ THE FILE AS A BINARY STRING
      reader.readAsText(file);

      reader.onloadend = function() {

          console.log("Successful file read: " + this.result);
          console.log("file path: " + locationentry.fullPath);

          // AND PUT THE RESULT IN THE FRONT END
          //document.getElementById('/index/display').src = reader.result;
          alert(reader.result);
      };

  }, onError);
}

function onError(msg){
  console.log(msg);
}

// NOW, TAKING THE PICTURE IS THE SAME
function storeLocation(){
  navigator.geolocation.getCurrentPosition(storePositionCallback, onError);
}

// BUT THE CALLBACK, INSTEAD OF DISPLAYING THE PIC
// IS GOING TO SAVE IT USING THE WRITEPIC FUNCTION
// AND PASSING A BLOB OBJECT!
function storePositionCallback() {
  var input = document.getElementById('opencage').innerHTML;

  //var dataObj = new Blob([input], { type: 'text/plain' });
  
  
  writeLocation(input);

}

/* **********************************************
**
** Get Weather data
**
// ** - this module will aquire weather data and then it will pass to another module which will put the data on UI
// ** ******************************************** */

//function to get 
function getWeather()
{
    navigator.geolocation.getCurrentPosition(weatherCallback, onError);
}


function weatherCallback(position) {

      var lat1 = position.coords.latitude;
      var long1 = position.coords.longitude;
  
  const _getOpenWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?lat='+lat1+'&lon='+long1+'&appid=24f3176f2ee9a8ca7d1930aa954d73f0';
  
     // get weather data from Dark Sky
    var http = new XMLHttpRequest();
    http.open("GET", _getOpenWeatherURL);
    http.send();
    http.onreadystatechange = (e) => {
              var response1 = http.responseText;
              
              // As we know that answer is a JSON object,
              // we can parse it and handle it as such
              var responseJSON = JSON.parse(response1); 
          
              // Printing the result JSON to the console
              console.log("Weather Response" + response1);
             

              var celcius = Math.round(parseFloat(responseJSON.main.temp)-273.15);
              var fahrenheit = Math.round(((parseFloat(responseJSON.main.temp)-273.15)*1.8)+32); 
              var description = responseJSON.weather[0].description;
              
              document.getElementById('weather/description').innerHTML = description;
              document.getElementById('weather/temp').innerHTML = celcius + '&deg;';
              document.getElementById('weather/location').innerHTML = responseJSON.name;
              document.getElementById('weather/windspeed').innerHTML = '<br>' + responseJSON.wind.speed + 'km/s';
              document.getElementById('weather/humidity').innerHTML = '<br>' + responseJSON.main.humidity + '%';
              document.getElementById('weather/cloudcover').innerHTML = '<br>' + responseJSON.clouds.all + '%';

              //Function for converting UNIX time to Local Time
              function unixToTime(unix) {
                unix *= 1000;
                var toTime = new Date(unix);
                var hour = ((toTime.getHours() % 12 || 12 ) < 10 ? '0' : '') + (toTime.getHours() % 12 || 12);
                var minute = (toTime.getMinutes() < 10 ? '0' : '') + toTime.getMinutes();
                timeFormatted = hour+":"+minute;
                return timeFormatted;
              }

              //Converting UNIX time
              unixToTime(responseJSON.sys.sunrise);
              var sunriseTimeFormatted = timeFormatted+" AM";
              document.getElementById('weather/sunrise').innerHTML = sunriseTimeFormatted;

              unixToTime(responseJSON.sys.sunset);
              var sunsetTimeFormatted = timeFormatted+" PM";
              document.getElementById('weather/sunset').innerHTML = sunsetTimeFormatted;

              //document.getElementById('weather/location').innerHTML =  "Location: " 
              //+ responseJSON.name + "<br>Temperature: " + celcius + '&deg;' +  "<br>Current Status: " + description;
                  
          }
 
};

