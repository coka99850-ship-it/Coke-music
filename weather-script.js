// OpenWeatherMap API Configuration
// Sign up for free at: https://openweathermap.org/api
const API_KEY = 'demo'; // Replace with your actual API key
const API_BASE = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecastSection');
const recentSearches = document.getElementById('recentSearches');

// Weather Icon Mapping
const weatherIcons = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '🌤️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadRecentSearches();
    // Load default city on startup
    fetchWeatherByCity('London');
});

function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    locationBtn.addEventListener('click', handleLocation);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

// Search weather by city name
function handleSearch() {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
        searchInput.value = '';
    }
}

// Get user's current location
function handleLocation() {
    if (navigator.geolocation) {
        showLoader();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                showError('Unable to get your location. Please enable location services.');
                hideLoader();
            }
        );
    } else {
        showError('Geolocation is not supported by your browser.');
    }
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
    showLoader();
    try {
        // Using Open-Meteo API (free, no API key required)
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            showError('City not found. Please try another search.');
            hideLoader();
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        fetchWeatherByCoords(latitude, longitude, `${name}, ${country}`);
        addToRecentSearches(`${name}, ${country}`);
    } catch (error) {
        showError('Error fetching location. Please try again.');
        hideLoader();
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(latitude, longitude, cityName = '') {
    showLoader();
    try {
        // Using Open-Meteo API (free weather data)
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,pressure_msl,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        // Get city name if not provided
        if (!cityName) {
            try {
                const geoResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const geoData = await geoResponse.json();
                cityName = geoData.address?.city || geoData.address?.town || 'Unknown Location';
            } catch (e) {
                cityName = 'Unknown Location';
            }
        }

        displayCurrentWeather(weatherData, cityName);
        displayForecast(weatherData);
        hideLoader();
        hideError();
    } catch (error) {
        showError('Error fetching weather data. Please try again.');
        hideLoader();
    }
}

// Display current weather
function displayCurrentWeather(data, cityName) {
    const current = data.current;
    const timezone = data.timezone;

    // Convert weather code to description
    const weatherDesc = getWeatherDescription(current.weather_code);
    const weatherIcon = getWeatherIcon(current.weather_code);

    // Update DOM
    document.getElementById('cityName').textContent = cityName;
    document.getElementById('temperature').textContent = Math.round(current.temperature_2m) + '°C';
    document.getElementById('weatherIcon').textContent = weatherIcon;
    document.getElementById('description').textContent = weatherDesc;
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('humidity').textContent = current.relative_humidity_2m + '%';
    document.getElementById('windSpeed').textContent = (current.wind_speed_10m * 3.6).toFixed(1) + ' km/h';
    document.getElementById('pressure').textContent = Math.round(current.pressure_msl) + ' hPa';
    document.getElementById('visibility').textContent = (current.visibility / 1000).toFixed(1) + ' km';
    document.getElementById('cloudiness').textContent = getCloudCoverage(current.weather_code);
    document.getElementById('uvIndex').textContent = 'N/A';
    
    const now = new Date();
    document.getElementById('lastUpdated').textContent = `Updated: ${now.toLocaleTimeString()}`;

    currentWeatherDiv.classList.remove('hidden');
}

// Display 5-day forecast
function displayForecast(data) {
    const dailyData = data.daily;
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    for (let i = 1; i < Math.min(6, dailyData.time.length); i++) {
        const date = new Date(dailyData.time[i]);
        const code = dailyData.weather_code[i];
        const tempMax = dailyData.temperature_2m_max[i];
        const tempMin = dailyData.temperature_2m_min[i];
        const description = getWeatherDescription(code);
        const icon = getWeatherIcon(code);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${Math.round(tempMax)}°</div>
            <div class="forecast-temp-range">${Math.round(tempMin)}° / ${Math.round(tempMax)}°</div>
            <div class="forecast-description">${description}</div>
        `;
        forecastContainer.appendChild(card);
    }

    forecastSection.classList.remove('hidden');
}

// Weather code to description (WMO Weather Interpretation Codes)
function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Thunderstorm with hail'
    };
    return descriptions[code] || 'Unknown';
}

// Weather code to emoji icon
function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 86) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '🌤️';
}

// Get cloud coverage description
function getCloudCoverage(code) {
    if (code === 0) return '0%';
    if (code === 1 || code === 2) return '25-50%';
    if (code === 3) return '75-100%';
    return 'Variable';
}

// Recent searches management
function loadRecentSearches() {
    const recent = JSON.parse(localStorage.getItem('recentSearches')) || [];
    updateRecentSearchesUI(recent);
}

function addToRecentSearches(city) {
    let recent = JSON.parse(localStorage.getItem('recentSearches')) || [];
    recent = recent.filter(c => c !== city);
    recent.unshift(city);
    recent = recent.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
    updateRecentSearchesUI(recent);
}

function updateRecentSearchesUI(recent) {
    const recentList = document.getElementById('recentList');
    recentList.innerHTML = '';

    if (recent.length === 0) {
        recentSearches.classList.add('hidden');
        return;
    }

    recent.forEach(city => {
        const item = document.createElement('span');
        item.className = 'recent-item';
        item.textContent = city;
        item.addEventListener('click', () => {
            fetchWeatherByCity(city.split(',')[0]);
        });
        recentList.appendChild(item);
    });

    recentSearches.classList.remove('hidden');
}

// UI Helpers
function showLoader() {
    loader.classList.remove('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = '⚠️ ' + message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}
