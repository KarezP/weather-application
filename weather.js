// ====================== API-nyckel ======================
const geoApiKey = 'f0973e4b8cfe42c3bfc248c44384edb7';

// ====================== DOMContentLoaded ======================
document.addEventListener('DOMContentLoaded', () => {
    // HTML-element
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const myFavoriteBtn = document.getElementById('my-favorite');
    const timeElement = document.getElementById('time');
    const forecastContainer = document.getElementById('forecast-container');
    const heartContainer = document.getElementById('heart-container');
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const date = document.getElementById('date');
    const favoriteCitiesList = document.getElementById('favorite-cities-list');

    // ====================== Navigering ======================
    if (myFavoriteBtn) {
        myFavoriteBtn.addEventListener('click', () => {
            window.location.href = 'weather3.html';
        });
    }

    // ====================== Funktion: Hämta koordinater ======================
    async function getCoordinates(city) {
        try {
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${geoApiKey}`);
            const data = await response.json();
            console.log('Geocoding result:', data);

            if (data.results.length > 0) {
                const location = data.results[0].geometry;
                return { lat: location.lat, lon: location.lng };
            } else {
                alert('Could not find the location. Please try another city.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            alert('Something went wrong while fetching the location.');
            return null;
        }
    }

    // ====================== Funktion: Hämta platsnamn ======================
    async function getCityName(lat, lon) {
        try {
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${geoApiKey}`);
            const data = await response.json();

            if (data.results.length > 0) {
                const components = data.results[0].components;
                console.log('Geocoding components:', components);
                return (
                    components.city ||
                    components.town ||
                    components.village ||
                    components.county ||
                    components.state ||
                    components.suburb ||
                    'Unknown Location'
                );
            } else {
                return 'Unknown Location';
            }
        } catch (error) {
            console.error('Error fetching city name:', error);
            return 'Unknown Location';
        }
    }

    // ====================== Funktion: Väderbeskrivning ======================
    function getWeatherDescription(code) {
        const map = {
            0: "Clear sky ☀️", 1: "Mainly clear 🌤️", 2: "Partly cloudy ⛅", 3: "Overcast ☁️",
            45: "Foggy 🌫️", 48: "Rime fog 🌫️", 51: "Light drizzle 🌧️", 61: "Light rain 🌦️",
            63: "Moderate rain 🌧️", 71: "Light snow ❄️", 95: "Thunderstorm ⛈️"
        };
        return map[code] || 'Unknown weather';
    }

    // ====================== Funktion: Hämta väder med koordinater ======================
    async function getWeatherByCoordinates(lat, lon) {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
            const data = await response.json();
            const cityNameText = await getCityName(lat, lon);
            const weather = data.current_weather;

            if (cityName) {
                cityName.textContent = `City: ${cityNameText}`;
                temperature.textContent = `Temperature: ${Math.round(weather.temperature)}°C`;
                description.textContent = getWeatherDescription(weather.weathercode);
                windSpeed.textContent = `Wind Speed: ${Math.round(weather.windspeed)} m/s`;
                humidity.textContent = `Humidity: ${weather.relative_humidity_2m || 'N/A'}%`;
                date.textContent = `Date: ${new Date().toLocaleDateString()}`;
                if (timeElement) timeElement.textContent = `Time: ${new Date().toLocaleTimeString()}`;
            }

            if (heartContainer) {
                heartContainer.innerHTML = '';
                displayCityNameWithHeart(cityNameText, lat, lon);
            }

            getForecast(lat, lon, cityNameText);
        } catch (error) {
            console.error('Error getting weather:', error);
            alert('Unable to fetch weather. Try again.');
        }
    }

    // ====================== Funktion: 7-dagarsprognos ======================
    async function getForecast(lat, lon, cityNameText) {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
            const data = await response.json();

            if (forecastContainer) {
                forecastContainer.innerHTML = '';
                const forecastTitle = document.createElement('h1');
                forecastTitle.textContent = `${cityNameText}`;
                forecastContainer.appendChild(forecastTitle);

                data.daily.time.forEach((day, i) => {
                    if (i < 7) {
                        const forecastItem = document.createElement('div');
                        forecastItem.classList.add('forecast-table');
                        forecastItem.innerHTML = `
                            <p>Date: ${new Date(day).toLocaleDateString()}</p>
                            <p>Max Temp: ${Math.round(data.daily.temperature_2m_max[i])}°C</p>
                            <p>Min Temp: ${Math.round(data.daily.temperature_2m_min[i])}°C</p>
                            <p>Weather: ${getWeatherDescription(data.daily.weathercode[i])}</p>
                        `;
                        forecastContainer.appendChild(forecastItem);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
    }

    // ====================== Favoritstäder ======================
    function toggleFavoriteCity(name, lat, lon) {
        let favorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        if (favorites.includes(name)) {
            favorites = favorites.filter(c => c !== name);
            localStorage.removeItem(name);
            alert(`${name} removed from favorites.`);
        } else {
            favorites.push(name);
            localStorage.setItem(name, JSON.stringify({ lat, lon }));
            alert(`${name} added to favorites.`);
        }
        localStorage.setItem('favoriteCities', JSON.stringify(favorites));
    }

    function displayCityNameWithHeart(name, lat, lon) {
        const container = document.createElement('div');
        const span = document.createElement('span');
        span.textContent = `City: ${name}`;
        const heart = document.createElement('button');
        heart.innerHTML = '❤️';
        heart.classList.add('heart-icon');
        heart.addEventListener('click', () => toggleFavoriteCity(name, lat, lon));
        container.appendChild(span);
        container.appendChild(heart);
        heartContainer.appendChild(container);
    }

    // ====================== Aktuell plats ======================
    function getCurrentLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const { latitude: lat, longitude: lon } = pos.coords;
                    localStorage.setItem('lat', lat);
                    localStorage.setItem('lon', lon);
                    getWeatherByCoordinates(lat, lon);
                },
                err => {
                    console.error('Geolocation error:', err);
                    alert('Using default: Stockholm');
                    getWeatherByCoordinates(59.3293, 18.0686);
                }
            );
        } else {
            alert('Geolocation not supported. Using Stockholm.');
            getWeatherByCoordinates(59.3293, 18.0686);
        }
    }

    // ====================== Händelser ======================
    if (searchBtn && cityInput) {
        searchBtn.addEventListener('click', async () => {
            const city = cityInput.value.trim();
            if (!city) return alert('Please enter a city name.');

            const coordinates = await getCoordinates(city);
            if (coordinates) {
                localStorage.setItem('cityName', city);
                localStorage.setItem('lat', coordinates.lat);
                localStorage.setItem('lon', coordinates.lon);
                getWeatherByCoordinates(coordinates.lat, coordinates.lon);
            }
        });
    }

    if (currentLocationBtn) {
        currentLocationBtn.addEventListener('click', getCurrentLocationWeather);
    }

    if (cityName && temperature) {
        const lat = localStorage.getItem('lat');
        const lon = localStorage.getItem('lon');
        if (lat && lon) getWeatherByCoordinates(lat, lon);
    }

    // ====================== Favoritsida ======================
    if (favoriteCitiesList) {
        const favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        if (favoriteCities.length === 0) {
            favoriteCitiesList.innerHTML = '<p>No favorite cities added yet.</p>';
        } else {
            favoriteCitiesList.innerHTML = '';
            favoriteCities.forEach(async city => {
                const cityItem = document.createElement('div');
                cityItem.classList.add('favorite-city-item');
                const header = document.createElement('h3');
                header.textContent = city;
                const weatherDiv = document.createElement('div');

                const coords = JSON.parse(localStorage.getItem(city));
                if (coords) {
                    const weather = await getWeatherByCoordinatesForFavorites(coords.lat, coords.lon);
                    if (weather) {
                        weatherDiv.innerHTML = `
                            <p>Temperature: ${Math.round(weather.temperature)}°C</p>
                            <p>Weather: ${getWeatherDescription(weather.weatherCode)}</p>
                            <p>Wind Speed: ${Math.round(weather.windSpeed)} m/s</p>
                        `;
                    } else {
                        weatherDiv.textContent = 'Unable to fetch weather.';
                    }

                    const viewBtn = document.createElement('button');
                    viewBtn.textContent = 'View Forecast';
                    viewBtn.addEventListener('click', () => {
                        localStorage.setItem('cityName', city);
                        localStorage.setItem('lat', coords.lat);
                        localStorage.setItem('lon', coords.lon);
                        window.location.href = 'weather2.html';
                    });

                    cityItem.append(header, weatherDiv, viewBtn);
                    favoriteCitiesList.appendChild(cityItem);
                }
            });
        }
    }

    // ====================== Funktion: väder för favoriter ======================
    async function getWeatherByCoordinatesForFavorites(lat, lon) {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
            const data = await response.json();
            return {
                temperature: data.current_weather.temperature,
                weatherCode: data.current_weather.weathercode,
                windSpeed: data.current_weather.windspeed
            };
        } catch (error) {
            console.error('Error fetching weather for favorites:', error);
            return null;
        }
    }
});





