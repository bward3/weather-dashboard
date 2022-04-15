var searchEl = document.getElementById("search");
var searchBtn = document.getElementById("searchbtn");
var sidebarEl = document.getElementById("sidebar");
var todayEl = document.getElementById("today");
var fivedayEl = document.getElementById("five-day");
var historyDiv = document.getElementById("history-div");
var mainEl = document.getElementById("main-display");
var ls = window.localStorage;
var numBtns = 0;
var maxBtns = 15;

//Allow user to use search button or Enter key to input
searchEl.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        searchBtn.click();
    }
});

//draw buttons/forecast based on localStorage
var init = function () {
    var searchHistory = JSON.parse(ls.getItem('searchHistory')) || [];
    var i = 0;
    if (searchHistory) {
        while (i < searchHistory.length && numBtns <= maxBtns) {
            var city = searchHistory[i];
            addHistoryBtn(city);
            numBtns++;
            i++;
        }
    }
    if (ls.getItem('lastSearched')) {
        apiCall(ls.getItem('lastSearched'));
    }
}

//helper fct to add buttons to the search history
var addHistoryBtn = function (city) {
    var historyBtn = document.createElement('button');
    historyBtn.innerText = city;
    //add an onclick function to get city's weather info
    historyBtn.setAttribute('onclick', `apiCall('${city}')`);
    historyDiv.prepend(historyBtn);
}

//get forecast data from api call
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
    //uvi only measured day-of, so 5-day forecast tabs won't have
    if (isToday) {
        var uviEl = document.createElement('h3');
        uviEl.innerHTML = `UV Index: <span>${data[3]}</span>`;
        outputEl.append(uviEl);
    }
}

//onClick function used for searching
var searchHandle = function () {
    var inputText = searchEl.value;
    apiCall(inputText);
}

//render the today's forecast as well as future 5-day forecast
var renderForecast = function (weatherJSON, cityName) {
    var dateString = moment.unix(weatherJSON.current.dt).format("MM/DD/YYYY");
    var cityHeader = document.createElement('h1');
    cityHeader.innerText = `${cityName} (${dateString})`;
    todayEl.append(cityHeader);

    //get icon for current weather
    var icon = document.createElement('img');
    icon.setAttribute('src', `https://openweathermap.org/img/wn/${weatherJSON.current.weather[0].icon}.png`);
    todayEl.append(icon);

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
        icon.setAttribute('src', `https://openweathermap.org/img/wn/${weatherJSON.daily[0].weather[0].icon}.png`);
        dateEl.append(icon);
        futureTemp = day.temp.day;
        futureWind_speed = day.wind_speed;
        futureHumidity = day.humidity;
        futureUVI = day.uvi;
        futureForecast = [futureTemp, futureWind_speed, futureHumidity, futureUVI];
        generateForecast(futureForecast, false, dayEl);
        fivedayEl.append(dayEl);
    }
}

//clear window to render new forecast
var clearRender = function (el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

//handle when input entered is not a place that exists
var handleBadrequest = function () {
    alert("Invalid input. Please enter a real place.");
}


//api handler function. takes input city name and calls render functions
//updates localstorage history
var apiCall = function (cityName) {
    cityName = cityName.toLowerCase();
    var requestURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=2613830090fb57ce193f5f9c35c9f396";
    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            //get city location data from name
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
                    var searchHistory = JSON.parse(ls.getItem('searchHistory')) || [];
                    if (!searchHistory.includes(cityName)) {
                        searchHistory.push(cityName);
                        if (numBtns < maxBtns) {
                            addHistoryBtn(cityName);
                        } else {
                            historyDiv.removeChild();
                        }
                    }
                    ls.setItem('searchHistory', JSON.stringify(searchHistory));
                    renderForecast(data, cityName);
                });
        })
        .catch((error) => {
            handleBadrequest();
        });
}

init();