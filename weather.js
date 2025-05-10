// Function to fetch current weather for favorite cities
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
        return null; // Return null if there's an error
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Page 1 Elements
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const myFavoriteBtn = document.getElementById('my-favorite');
    const timeElement = document.getElementById('time');
    
    if (myFavoriteBtn) {
        myFavoriteBtn.addEventListener('click', () => {
            window.location.href = 'weather3.html'; // Navigate to your favorites page
        });
    }

    const forecastContainer = document.getElementById('forecast-container');
    const heartContainer = document.getElementById('heart-container');

    // Page 2 Elements (Weather Information Page)
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const date = document.getElementById('date');

    // Page 3 Elements (Favorite Cities Page)
    const favoriteCitiesList = document.getElementById('favorite-cities-list');

    // API key for OpenCage Geocoding API
    const geoApiKey = 'd3e65066212c46dea436eb2f4e3ccbcd';

    // Function to get city coordinates
    async function getCoordinates(city) {
        try {
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${geoApiKey}`);
            const data = await response.json();
            
            //here we go respnse from json and if the result array grater than 0 means we got the city coordinates(dosn't mean the city coordinates is right) 
            if (data.results.length > 0) {
                const location = data.results[0].geometry; //[0]maby we get many results for the city coordinates in an array , and we choose the first index such as a true result.
                return { lat: location.lat, lon: location.lng };// return the object then can be used more and for another perpose also.
            } else {
                throw new Error('Location not found');
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            alert('Could not find the location. Please try another city.');
        }
    }

    
// Function to get city name from coordinates
async function getCityName(lat, lon) {
    const geoApiKey = 'd3e65066212c46dea436eb2f4e3ccbcd'; // din OpenCage API-nyckel
    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${geoApiKey}`);
        const data = await response.json();

        if (data.results.length > 0) {
            const components = data.results[0].components;

            console.log('Geocoding components:', components); // För felsökning i webbläsarens konsol

            // Försök hämta platsnamn i denna ordning
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
            console.warn('No results from geocoding API');
            return 'Unknown Location';
        }
    } catch (error) {
        console.error('Error fetching city name:', error);
        return 'Unknown Location';
    }
}

   // Function to get city coordinates
async function getCoordinates(city) {
    const geoApiKey = 'd3e65066212c46dea436eb2f4e3ccbcd'; // din OpenCage API-nyckel

    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${geoApiKey}`);
        const data = await response.json();

        // Visa vad API:t returnerar (bra för felsökning)
        console.log('Geocoding result:', data);

        // Kontrollera om vi fått några resultat
        if (data.results.length > 0) {
            const location = data.results[0].geometry;

            // Logga den valda platsens lat/lon
            console.log(`Coordinates for ${city}:`, location);

            return {
                lat: location.lat,
                lon: location.lng
            };
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


    // Function to get 7-day forecast
    async function getForecast(lat, lon, cityNameText) {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
            const data = await response.json();
    
            // Update the city name
            const cityHeader = document.getElementById('city-name');  
            cityHeader.textContent = `City: ${cityNameText}`;  // Update the city name in the forecast
    
            if (forecastContainer) {
                // Clear previous forecast data but keep the current weather section intact
                forecastContainer.innerHTML = ''; // This clears everything inside forecastContainer
    
                // Create a header for the 7-day forecast
                const forecastTitle = document.createElement('h1');
                forecastTitle.textContent = `${cityNameText}`; //show the city name like a tiltle.
                forecastContainer.appendChild(forecastTitle);
    
                // Add the 7-day forecast dynamically
                data.daily.time.forEach((day, index) => {
                    if (index < 7) {  // Show forecast for 7 days
                        const forecastItem = document.createElement('div');
                        forecastItem.classList.add('forecast-table');  // You can style this with CSS
    
                        const weatherCode = data.daily.weathercode[index];
                        const weatherDescription = getWeatherDescription(weatherCode);
    
                        // Create the HTML structure for each forecast day
                        forecastItem.innerHTML = `
                            <p>Date: ${new Date(day).toLocaleDateString()}</p>
                            <p>Max Temp: ${Math.round(data.daily.temperature_2m_max[index])}°C</p>
                            <p>Min Temp: ${Math.round(data.daily.temperature_2m_min[index])}°C</p>
                            <p>Weather: ${weatherDescription}</p>
                            
                        `;
    
                        // Append each forecast item to the forecast container
                        forecastContainer.appendChild(forecastItem);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
    }
    

    // Function to get weather description
    function getWeatherDescription(weatherCode) {
        const weatherDescriptions = {
            0: "Clear sky ☀️",
            1: "Mainly clear 🌤️",
            2: "Partly cloudy ⛅",
            3: "Overcast ☁️",
            45: "Foggy 🌫️",
            48: "Depositing rime fog 🌫️",
            51: "Light drizzle 🌧️",
            61: "Light rain 🌦️",
            63: "Moderate rain 🌧️",
            71: "Light snow ❄️",
            95: "Thunderstorm ⛈️"
        };
        return weatherDescriptions[weatherCode] || 'Unknown weather';
    }

    // Function to toggle favorite cities
    function toggleFavoriteCity(cityNameText, lat, lon) {
        let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];

        if (favoriteCities.includes(cityNameText)) { //If cityNameText is found in the array, it means the city is already a favorite.
            favoriteCities = favoriteCities.filter(city => city !== cityNameText);//condition removes city name text from favorite cities. 
            alert(`${cityNameText} has been removed from your favorites.`);//the selected city has been removed from the favorites.
            localStorage.removeItem(cityNameText);// removes the specific city’s data (lat and lon) from local storage.
        } else {
            favoriteCities.push(cityNameText); //The push() method adds the city name text to the favorite cities array.
            localStorage.setItem(cityNameText, JSON.stringify({ lat, lon })); // Save city coordinates by json.stringify
            alert(`${cityNameText} has been added to your favorites.`);
        }

        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
    }

    // Function to display city name with heart icon
    function displayCityNameWithHeart(cityNameText, lat, lon) {
        const cityContainer = document.createElement('div');
        

        const cityNameElement = document.createElement('span');
        cityNameElement.textContent = `City: ${cityNameText}`;
        
        

        const heartIcon = document.createElement('button');  
        heartIcon.innerHTML = '❤️';  
        heartIcon.classList.add('heart-icon');  

        heartIcon.addEventListener('click', () => {
            toggleFavoriteCity(cityNameText, lat, lon);
        });

        
        cityContainer.appendChild(heartIcon);

        // Append to heart container instead of forecastContainer
        heartContainer.appendChild(cityContainer);
    }
    // Handle Page 3 (Favorite Cities)
if (favoriteCitiesList) { //This checks whether the favoriteCitiesList element exists in the DOM,If it exists you proceed to display the favorite cities.
    const favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
    
    if (favoriteCities.length === 0) { //checks if the favoriteCities array is empty.
        favoriteCitiesList.innerHTML = '<p>No favorite cities added yet.</p>';
    } else {
        favoriteCitiesList.innerHTML = ''; // Clear the list first
        
        // Loop through each favorite city and display its current weather
        favoriteCities.forEach(async city => {
            const cityItem = document.createElement('div');
            cityItem.classList.add('favorite-city-item'); // Add a class for styling
            
            const cityHeader = document.createElement('h3');
            cityHeader.textContent = city; // Display the city name
            
            const cityWeather = document.createElement('div'); // Weather data container
           

            // Get the coordinates from localStorage
            const coordinates = localStorage.getItem(city);
            if (coordinates) {
                const { lat, lon } = JSON.parse(coordinates);//retrieves the coordinates (latitude and longitude) for the city from localStorage.
                
                // Fetch the current weather for this city using its coordinates
                const weatherData = await getWeatherByCoordinatesForFavorites(lat, lon); //This calls the asynchronous function getWeatherByCoordinatesForFavorites to fetch the current weather data for the city based on its coordinates.
                
                // Display the weather info for the city
                if (weatherData) {
                    const weatherDescription = getWeatherDescription(weatherData.weatherCode);
                    cityWeather.innerHTML = `
                        <p>Temperature: ${Math.round(weatherData.temperature)}°C</p>
                        <p>Weather: ${weatherDescription}</p>
                        <p>Wind Speed: ${Math.round(weatherData.windSpeed)} m/s</p>
                    `;
                } else {
                    cityWeather.innerHTML = '<p>Unable to fetch weather data.</p>';
                }
                
                // Create "View Forecast" button to navigate to the detailed weather page
                const viewForecastBtn = document.createElement('button');
                viewForecastBtn.textContent = 'View Forecast';
                viewForecastBtn.addEventListener('click', () => {
                    localStorage.setItem('cityName', city);
                    localStorage.setItem('lat', lat);
                    localStorage.setItem('lon', lon);
                    window.location.href = 'weather2.html'; // Navigate to forecast page
                });
                //This section adds the created elements to the cityItem container.
                cityItem.appendChild(cityHeader);
                cityItem.appendChild(cityWeather); // Add the weather info
                cityItem.appendChild(viewForecastBtn); // Add the "View Forecast" button
                
                // Append the city item to the favorites list
                favoriteCitiesList.appendChild(cityItem);
            }
        });
    }
}


    // Use geolocation to get current location weather
    function getCurrentLocationWeather() {
        if (navigator.geolocation) { //This line checks whether the user's browser supports geolocation
            navigator.geolocation.getCurrentPosition((position) => { //getting a permison from the user to get current location.
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                localStorage.setItem('lat', lat);
                localStorage.setItem('lon', lon);

                getWeatherByCoordinates(lat, lon);
            }, (error) => {
                console.error('Error getting location', error);
                alert('Unable to retrieve location. Defaulting to Stockholm.');
                getWeatherByCoordinates(59.3293, 18.0686);
            });
        } else {
            alert('Geolocation is not supported by this browser. Defaulting to Stockholm.');
            getWeatherByCoordinates(59.3293, 18.0686);
        }
    }

    // Handle Page 1 (Search & Current Location)
    if (searchBtn && cityInput) {
        searchBtn.addEventListener('click', async () => {
            const city = cityInput.value.trim();
            if (city) {
                const coordinates = await getCoordinates(city);
                if (coordinates) {
                    localStorage.setItem('cityName', city);
                    localStorage.setItem('lat', coordinates.lat);
                    localStorage.setItem('lon', coordinates.lon);
                    getWeatherByCoordinates(coordinates.lat, coordinates.lon);
                } else {
                    alert('Could not find the location. Please try another city.');
                }
            } else {
                alert('Please enter a city name.');
            }
        });
    }

    if (currentLocationBtn) {
        currentLocationBtn.addEventListener('click', () => {
            getCurrentLocationWeather();
        });
    }

    // Handle Page 2 (Display Forecast Data)
    if (cityName && temperature && description && date) {
        const lat = localStorage.getItem('lat');
        const lon = localStorage.getItem('lon');
        if (lat && lon) {
            getWeatherByCoordinates(lat, lon);
        }
    }

    // Handle Page 3 (Favorite Cities)
    if (favoriteCitiesList) {
        const favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        
        if (favoriteCities.length === 0) {
            favoriteCitiesList.innerHTML = '<p>No favorite cities added yet.</p>';
        } else {
            favoriteCitiesList.innerHTML = '';
            favoriteCities.forEach(city => {
                const cityItem = document.createElement('div');
                cityItem.textContent = city;

                const viewForecastBtn = document.createElement('button');
                viewForecastBtn.textContent = 'View Forecast';
                viewForecastBtn.addEventListener('click', () => {
                    const coordinates = localStorage.getItem(city);
                    if (coordinates) {
                        const { lat, lon } = JSON.parse(coordinates);
                        localStorage.setItem('cityName', city);
                        localStorage.setItem('lat', lat);
                        localStorage.setItem('lon', lon);
                        window.location.href = 'weather2.html';
                    }
                });

    
            });
        }
    }
});







