var searchEl = document.getElementById("search");
var searchBtn = document.getElementById("searchbtn");
var sidebarEl = document.getElementById("sidebar");
var todayEl = document.getElementById("today");
var fivedayEl = document.getElementById("five-day");
var ls = window.localStorage;

searchEl.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        searchBtn.click()
    }
});

var init = function () {
}

var generateForecast = function (data, isToday, outputEl) {
    var tempEl = document.createElement('h3');
    var windEl = document.createElement('h3');
    var humidityEl = document.createElement('h3');
    tempEl.innerText = `Temp: ${data[0]} °F`;
    windEl.innerText = `Wind: ${data[1]} MPH`;
    humidityEl.innerText = `Humidity: ${data[2]}`;
    outputEl.append(tempEl);
    outputEl.append(windEl);
    outputEl.append(humidityEl);
    if (isToday) {
        var uviEl = document.createElement('h3');
        uviEl.innerHTML = `UV Index: <span>${data[3]}</span>`;
        outputEl.append(uviEl);
    }
}

var searchHandle = function () {
    var inputText = searchEl.value;
    apiCall(inputText);
}

var renderForecast = function (weatherJSON, cityName) {
    console.log(weatherJSON);
    var dateString = moment.unix(weatherJSON.current.dt).format("MM/DD/YYYY");
    var cityHeader = document.createElement('h1');
    cityHeader.innerText = `${cityName} (${dateString})`;
    todayEl.append(cityHeader);
    var icon = document.createElement('img');
    icon.setAttribute('src', `http://openweathermap.org/img/wn/${weatherJSON.current.weather[0].icon}.png`);
    cityHeader.append(icon);
    var temp = weatherJSON.current.temp;
    var wind_speed = weatherJSON.current.wind_speed;
    var humidity = weatherJSON.current.humidity;
    var uvi = weatherJSON.current.uvi;
    var forecast = [temp, wind_speed, humidity, uvi];
    generateForecast(forecast, true, todayEl);
    var fiveDayHeader = document.createElement('h2');
    fiveDayHeader.innerText = '5-Day Forecast';
    fivedayEl.append(fiveDayHeader);
    for (i = 0; i < 5; i++) {
        var dayEl = document.createElement('div');
        day = weatherJSON.daily[i];
        var dateString = moment.unix(day.dt).format("MM/DD/YYYY");
        var dateEl = document.createElement('h2');
        dateEl.innerText = dateString;
        dayEl.append(dateEl);
        var icon = document.createElement('img');
        icon.setAttribute('src', `http://openweathermap.org/img/wn/${weatherJSON.daily[0].weather[0].icon}.png`);
        dayEl.append(icon);
        futureTemp = day.temp.day;
        futureWind_speed = day.wind_speed;
        futureHumidity = day.humidity;
        futureUVI = day.uvi;
        futureForecast = [futureTemp, futureWind_speed, futureHumidity, futureUVI];
        generateForecast(futureForecast, false, dayEl);
        fivedayEl.append(dayEl);
    }
}

var clearRender = function (el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
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
                    clearRender(todayEl);
                    clearRender(fivedayEl);
                    ls.setItem('lastSearched', cityName);
                    var searchHistory = JSON.parse(ls.getItem('history')) || [];
                    searchHistory.push(cityName);
                    ls.setItem('searchHistory', searchHistory);)
                    renderForecast(data, cityName);
                });
        })
        .catch((error) => {
            handleBadrequest();
        });
}