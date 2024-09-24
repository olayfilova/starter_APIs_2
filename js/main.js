// Fetch city data from CSV and populate dropdown
document.addEventListener('DOMContentLoaded', function() {
    fetch('city_coordinates.csv')
        .then(response => response.text())
        .then(data => {
            const citySelect = document.getElementById('citySelect');
            const cities = data.split('\n');
            cities.forEach(cityLine => {
                const [lat, lon, city, country] = cityLine.split(',');
                if (city && country) {
                    let option = document.createElement('option');
                    option.value = `${lat},${lon}`;
                    option.textContent = `${city}, ${country}`;
                    citySelect.appendChild(option);
                }
            });
        });
});

// Handle form submission to get weather data
document.getElementById('cityForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedCity = document.getElementById('citySelect').value;
    const [lat, lon] = selectedCity.split(',');
    const selectedTime = parseInt(document.getElementById('timeSelect').value);  // Get selected time
    const selectedDate = document.getElementById('dateSelect').value;  // Get selected date

    if (lat && lon && selectedDate) {
        fetchWeather(lat, lon, selectedTime, selectedDate);
    }
});

// Function to fetch weather data from the API
function fetchWeather(lat, lon, selectedTime, selectedDate) {
    const apiUrl = `https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data, selectedTime, selectedDate);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

// Function to display weather data
function displayWeather(data, selectedTime, selectedDate) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    weatherDisplay.innerHTML = '';  // Clear previous results

    const selectedDateObj = new Date(selectedDate);
    const currentDate = new Date(); // Current date and time for showing "current weather"

    let closestEntry = null; // To store the closest available forecast

    data.dataseries.forEach(entry => {
        const forecastDate = new Date();
        forecastDate.setHours(forecastDate.getHours() + entry.timepoint);  // Adjust forecast date

        // Check if forecast matches selected date
        if (forecastDate.toDateString() === selectedDateObj.toDateString()) {
            const forecastHour = entry.timepoint % 24;  // Get the forecast hour in 24-hour format

            // If the forecast hour matches the selected time, display the forecast
            if (forecastHour === selectedTime) {
                const weatherInfo = `
                    <div class="weather-info">
                        <h4>${forecastDate.toDateString()} - ${forecastHour}:00</h4>
                        <p>Temperature: ${entry.temp2m}°C</p>
                        <p>Weather: ${entry.weather}</p>
                    </div>
                `;
                weatherDisplay.innerHTML += weatherInfo;
            }
        }

        // Check for the closest forecast to current time
        if (!closestEntry || Math.abs(forecastDate - currentDate) < Math.abs(new Date(closestEntry.timepoint) - currentDate)) {
            closestEntry = entry;
        }
    });

    // Show the closest available forecast to the current time
    if (closestEntry) {
        const closestDate = new Date();
        closestDate.setHours(closestDate.getHours() + closestEntry.timepoint);

        const closestWeatherInfo = `
            <div class="weather-info">
                <h4>Current Weather Forecast (${closestDate.toDateString()} - Nearest Forecast)</h4>
                <p>Temperature: ${closestEntry.temp2m}°C</p>
                <p>Weather: ${closestEntry.weather}</p>
            </div>
        `;
        weatherDisplay.innerHTML += closestWeatherInfo;
    }
}


// Function to map weather conditions to icons
function getWeatherIcon(weather) {
    const weatherIcons = {
        clear: 'clear.png',
        cloudy: 'cloudy.png',
        rain: 'rain.png',
        snow: 'snow.png',
        fog: 'fog.png',
        ishower: 'ishower.png',
        lightrain: 'lightrain.png',
        lightsnow: 'lightsnow.png',
        mcloudy: 'mcloudy.png',
        oshower: 'oshower.png',
        pcloudy: 'pcloudy.png',
        tsrain: 'tsrain.png',
        tsstorm: 'tsstorm.png',
        windy: 'windy.png',
        // Add additional weather mappings as needed
    };

    return weatherIcons[weather] || 'default.png';  // Return default if no match
}

// Function to display weather data (with icons)
function displayWeather(data, selectedTime, selectedDate) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    weatherDisplay.innerHTML = '';  // Clear previous results

    const selectedDateObj = new Date(selectedDate);
    const currentDate = new Date(); // Current date and time for showing "current weather"

    let closestEntry = null; // To store the closest available forecast

    data.dataseries.forEach(entry => {
        const forecastDate = new Date();
        forecastDate.setHours(forecastDate.getHours() + entry.timepoint);  // Adjust forecast date

        // Check if forecast matches selected date
        if (forecastDate.toDateString() === selectedDateObj.toDateString()) {
            const forecastHour = entry.timepoint % 24;  // Get the forecast hour in 24-hour format

            // If the forecast hour matches the selected time, display the forecast
            if (forecastHour === selectedTime) {
                const weatherIcon = getWeatherIcon(entry.weather);  // Get the appropriate icon
                const weatherInfo = `
                    <div class="weather-info">
                        <h4>${forecastDate.toDateString()} - ${forecastHour}:00</h4>
                        <img src="images/${weatherIcon}" alt="${entry.weather}" />
                        <p>Temperature: ${entry.temp2m}°C</p>
                        <p>Weather: ${entry.weather}</p>
                    </div>
                `;
                weatherDisplay.innerHTML += weatherInfo;
            }
        }

        // Find closest forecast to the current time
        if (!closestEntry || Math.abs(forecastDate - currentDate) < Math.abs(new Date(closestEntry.timepoint) - currentDate)) {
            closestEntry = entry;
        }
    });

    // Show the closest available forecast to the current time
    if (closestEntry) {
        const closestDate = new Date();
        closestDate.setHours(closestDate.getHours() + closestEntry.timepoint);

        const closestWeatherIcon = getWeatherIcon(closestEntry.weather);  // Get icon for current weather
        const closestWeatherInfo = `
            <div class="weather-info">
                <h4>Current Weather Forecast (${closestDate.toDateString()} - Nearest Forecast)</h4>
                <img src="images/${closestWeatherIcon}" alt="${closestEntry.weather}" />
                <p>Temperature: ${closestEntry.temp2m}°C</p>
                <p>Weather: ${closestEntry.weather}</p>
            </div>
        `;
        weatherDisplay.innerHTML += closestWeatherInfo;
    }
}


// Show and hide loading animation
function showLoading() {
    document.getElementById('loadingAnimation').style.display = 'block';
}
function hideLoading() {
    document.getElementById('loadingAnimation').style.display = 'none';
}

// Fetch weather data from the API (modified to include loading animation)
function fetchWeather(lat, lon, selectedTime, selectedDate) {
    showLoading();  // Show loading animation

    const apiUrl = `https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;


    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            hideLoading();  // Hide loading animation
            displayWeather(data, selectedTime, selectedDate);
        })
        .catch(error => {
            hideLoading();  // Hide loading animation in case of error
            console.error('Error fetching weather data:', error);
            displayError('Failed to fetch weather data. Please try again later.');
        });
}

// Function to display an error message
function displayError(message) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    weatherDisplay.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}
