// ===== GLOBAL STATE =====
const apiKey = "0defc0fc05c4547370b38caa132c44a3";
let is24Hour = true;
document.getElementById("weather-container").classList.add("fade-in");
let isFahrenheit = true;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
function toggleTimeFormat(){
    is24Hour = !is24Hour;
    getWeather(); // refresh display
}
function removeFavorite(city){
    favorites = favorites.filter(fav => fav !== city);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
}
function formatHour(timestamp){
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();

    if(is24Hour){
        return `${hours}:00`;
    } else {
        const suffix = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:00 ${suffix}`;
    }
}
// ===== TEMPERATURE CONVERSION =====
function convertTemp(kelvin){
    return isFahrenheit
        ? Math.round((kelvin - 273.15) * 1.8 + 32) + "°F"
        : Math.round(kelvin - 273.15) + "°C";
}

// ===== TOGGLES =====
function toggleUnits(){
    isFahrenheit = !isFahrenheit;
    getWeather();
}

function toggleDarkMode(){
    document.body.classList.toggle("dark");
}

// ===== MAIN FETCH FUNCTION (FIXED) =====
async function getWeather(){
    const city = document.getElementById("city").value;

    if(!city){
        alert("Please enter a city!");
        return;
    }

    try{
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`)
        ]);

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        if(weatherData.cod != 200){
            alert(`City not found: ${city}`);
            return;
        }

        displayWeather(weatherData);
        displayHourlyForecast(forecastData.list);
        displayDailyForecast(forecastData.list);

    }catch(error){
        console.error(error);
        alert("Failed to fetch weather data.");
    }
}
function updateBackground(weatherMain){
    const body = document.body;

    if(weatherMain.includes("cloud")){
        body.style.background = "linear-gradient(135deg, #757f9a, #d7dde8)";
    } 
    else if(weatherMain.includes("rain")){
        body.style.background = "linear-gradient(135deg, #4b6cb7, #182848)";
    } 
    else if(weatherMain.includes("clear")){
        body.style.background = "linear-gradient(135deg, #f7971e, #ffd200)";
    } 
    else {
        body.style.background = "linear-gradient(135deg, #5fb3c8, #7bc6d6)";
    }
}

// ===== CURRENT WEATHER =====
function displayWeather(data){
    const tempDiv = document.getElementById("temp-div");
    const infoDiv = document.getElementById("weather-info");
    const icon = document.getElementById("weather-icon");

    // Clear old data
    tempDiv.innerHTML = "";
    infoDiv.innerHTML = "";
updateBackground(data.weather[0].main.toLowerCase());
    const temperature = convertTemp(data.main.temp);
    const description = data.weather[0].description;
    const cityName = data.name;

    tempDiv.innerHTML = `<p>${temperature}</p>`;
    infoDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`;

    icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    icon.alt = description;
    icon.style.display = "block";
}

// ===== HOURLY FORECAST =====
function displayHourlyForecast(hourlyData){
    const container = document.getElementById("hourly-forecast");
    container.innerHTML = "";

    hourlyData.slice(0,8).forEach(item => {
        const hour = formatHour(item.dt);

        container.innerHTML += `
            <div class="hourly-item">
                <span>${hour}</span>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
                <span>${convertTemp(item.main.temp)}</span>
            </div>
        `;
    });
}

// ===== 5-DAY FORECAST =====
function displayDailyForecast(data){
    const container = document.getElementById("daily-forecast");
    if(!container) return;

    container.innerHTML = "";

    const daily = data.filter(item => item.dt_txt.includes("12:00:00"));

    daily.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString();

        container.innerHTML += `
            <div class="day-item">
                <p>${date}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p>${convertTemp(day.main.temp)}</p>
            </div>
        `;
    });
}

// ===== FAVORITES =====
function saveFavorite(){
    const city = document.getElementById("city").value;

    if(city && !favorites.includes(city)){
        favorites.push(city);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderFavorites();
    }
}

function renderFavorites(){
    const list = document.getElementById("favorites");
    list.innerHTML = "";

    favorites.forEach(city => {
        const li = document.createElement("li");

        li.innerHTML = `
            <span class="city-name" onclick="selectCity('${city}')">${city}</span>
            <span class="remove-btn" onclick="removeFavorite('${city}', event)">❌</span>
        `;

        list.appendChild(li);
    });
}
function selectCity(city){
    document.getElementById("city").value = city;
    getWeather();
}

function removeFavorite(city, event){
    event.stopPropagation();  // prevents clicking the whole row
    favorites = favorites.filter(fav => fav !== city);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
}
window.onload = () => {
    const input = document.getElementById("city");
    input.value = "Hoboken";
    getWeather();
};

// ===== INIT =====
renderFavorites();