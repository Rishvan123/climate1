// Wait for the DOM to be fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // DOM Elements Selection
    // ======================
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');
    const loader = document.getElementById('loader');
    
    // Weather display elements
    const cityName = document.getElementById('city-name');
    const currentDate = document.getElementById('current-date');
    const currentTemp = document.getElementById('current-temp');
    const weatherDesc = document.getElementById('weather-desc');
    const weatherIcon = document.getElementById('weather-icon');
    const feelsLike = document.getElementById('feels-like');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const forecastContainer = document.getElementById('forecast');

    // ======================
    // API Configuration
    // ======================
    const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual OpenWeatherMap API key
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';
    
    // ======================
    // Initialize Application
    // ======================
    function init() {
        updateDate(); // Display current date
        setupEventListeners(); // Set up all event listeners
        fetchWeather('London'); // Default city on load (optional)
    }

    // ======================
    // Core Functions
    // ======================

    // Update the current date display
    function updateDate() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        currentDate.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Search button click
        searchBtn.addEventListener('click', searchWeather);
        
        // Location button click
        locationBtn.addEventListener('click', getLocationWeather);
        
        // Enter key press in search input
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchWeather();
        });
    }

    // Handle city search
    function searchWeather() {
        const city = searchInput.value.trim();
        if (city) {
            fetchWeather(city);
            searchInput.value = ''; // Clear input after search
        } else {
            alert('Please enter a city name');
        }
    }

    // Get weather for user's current location
    function getLocationWeather() {
        if (navigator.geolocation) {
            showLoader(true);
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherByCoords(latitude, longitude);
                },
                error => {
                    showLoader(false);
                    alert('Unable to retrieve your location. Please enable location services or search by city name.');
                    console.error('Geolocation error:', error);
                },
                { timeout: 10000 } // 10 second timeout
            );
        } else {
            alert('Geolocation is not supported by your browser. Please search by city name.');
        }
    }

    // ======================
    // API Fetch Functions
    // ======================

    // Fetch weather data by city name
    function fetchWeather(city) {
        showLoader(true);
        
        // First fetch current weather
        fetch(${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY})
            .then(handleAPIResponse)
            .then(data => {
                displayCurrentWeather(data);
                // Then fetch forecast for the same location
                return fetch(${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY});
            })
            .then(handleAPIResponse)
            .then(data => displayForecast(data))
            .catch(handleAPIError)
            .finally(() => showLoader(false));
    }

    // Fetch weather data by coordinates
    function fetchWeatherByCoords(lat, lon) {
        fetch(${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY})
            .then(handleAPIResponse)
            .then(data => {
                displayCurrentWeather(data);
                return fetch(${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY});
            })
            .then(handleAPIResponse)
            .then(data => displayForecast(data))
            .catch(handleAPIError)
            .finally(() => showLoader(false));
    }

    // Handle API response
    function handleAPIResponse(response) {
        if (!response.ok) {
            throw new Error(response.status === 404 ? 'City not found' : 'Weather data unavailable');
        }
        return response.json();
    }

    // Handle API errors
    function handleAPIError(error) {
        alert(error.message);
        console.error('API Error:', error);
    }

    // ======================
    // Display Functions
    // ======================

    // Display current weather data
    function displayCurrentWeather(data) {
        cityName.textContent = ${data.name}, ${data.sys.country};
        currentTemp.textContent = ${Math.round(data.main.temp)}°;
        weatherDesc.textContent = data.weather[0].description;
        feelsLike.textContent = ${Math.round(data.main.feels_like)}°;
        humidity.textContent = ${data.main.humidity}%;
        windSpeed.textContent = ${Math.round(data.wind.speed * 3.6)} km/h;
        
        // Set weather icon
        const iconCode = data.weather[0].icon;
        weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                                  alt="${data.weather[0].main}">`;
    }

    // Display 5-day forecast
    function displayForecast(data) {
        forecastContainer.innerHTML = ''; // Clear previous forecast
        
        // We'll take one forecast per day at 12:00 PM for simplicity
        const dailyForecast = data.list.filter(item => {
            return item.dt_txt.includes('12:00:00');
        }).slice(0, 5); // Get next 5 days

        dailyForecast.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-day">${day}</div>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" 
                     alt="${item.weather[0].main}">
                <div class="forecast-temp">${Math.round(item.main.temp)}°</div>
            `;
            forecastContainer.appendChild(forecastItem);
        });
    }

    // ======================
    // Utility Functions
    // ======================

    // Show/hide loading spinner
    function showLoader(show) {
        loader.style.display = show ? 'flex'
