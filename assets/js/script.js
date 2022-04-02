var searchEl = document.getElementById("search");
var sidebarEl = document.getElementById("sidebar");
var todayEl = document.getElementById("today");
var fivedayEl = document.getElementById("five-day");
var citySearched;


var generateForecast = function (weatherJSON, cityName) {
    console.log(weatherJSON);
    var cityHeader = document.createElement('h1');
    cityHeader.innerText = cityName;
    todayEl.append(cityHeader);
    console.log(moment.unix(weatherJSON.current.dt).format("MM/DD/YYYY"));
}

var handleBadrequest = function () {
    console.log("You did bad job searching :(");
}

var apiCall = function (cityName) {
    cityName = cityName.toLowerCase();
    var requestURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=2613830090fb57ce193f5f9c35c9f396";
    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            cityName = data[0].name;
            var lat = data[0].lat;
            var lon = data[0].lon;
            return [lat, lon];
        }).then(function (latlon) {
            var reqestURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latlon[0] + "&lon=" + latlon[1] + "&lang=en&units=imperial&appid=2613830090fb57ce193f5f9c35c9f396";
            fetch(reqestURL)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    generateForecast(data, cityName);
                });
        })
        .catch((error) => {
            handleBadrequest();
        });
}



apiCall('pasadena');