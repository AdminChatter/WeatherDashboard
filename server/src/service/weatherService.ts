import dotenv from 'dotenv';
dotenv.config();

//interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

//class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(city: string, date: string, icon: string, iconDescription: string, tempF: number, windSpeed: number, humidity: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

//Class for the WeatherService
class WeatherService {
  private baseURL = process.env.API_BASE_URL;
  private apiKey = process.env.API_KEY;
  private cityName = '';

  //Method to destructure the location data
  private destructureLocationData(locationData: Coordinates): Coordinates {
    let { lat, lon } = locationData;
    
    lat = Math.round(lat*100)/100;
    lon = Math.round(lon*100)/100;

    return { lat, lon };
  }

  //Method to build the geocode query
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
  }

  //Method to fetch and destructure the location data
  private async fetchAndDestructureLocationData() {
    const geoResponse = await fetch(this.buildGeocodeQuery());
    const locationData = await geoResponse.json();
    const coordinates = this.destructureLocationData(locationData[0]);
    return coordinates;
  }

  //Method to build the weather query
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
  }

  //Method to fetch the current weather data
  private async fetchCurrentWeatherData(coordinates: Coordinates) {
    const response = await fetch(`${this.baseURL}/data/2.5/weather` + this.buildWeatherQuery(coordinates));
    return await response.json();
  }

  //Method to parse the current weather data
  private parseCurrentWeather(response: any) {
    const city = response.name;
    const date = new Date().toLocaleDateString();
    const icon = response.weather[0].icon;
    const iconDescription = response.weather[0].description;
    const tempF = response.main.temp;
    const windSpeed = response.wind.speed;
    const humidity = response.main.humidity;
    return new Weather(city, date, icon, iconDescription, tempF, windSpeed, humidity);
  }

  //Method to fetch the forecast data
  private async fetchForecastData(coordinates: Coordinates) {
    const response = await fetch(`${this.baseURL}/data/2.5/forecast` + this.buildWeatherQuery(coordinates));
    return await response.json();
  }

  private parseForecastData(response: any) {
    return response.list;
  }

  //Method to build the forecast array
  //Test Information website: https://api.openweathermap.org/data/2.5/forecast?lat=43.58&lon=-79.64&units=imperial&appid=329ab86a330d12d34419e30035a4b9ef
  private buildForecastArray(currentWeather: Weather, weatherData: any[]){
    const forecastArray = [];
    forecastArray.push(currentWeather);

    for (let i = 0; i < weatherData.length; i=i+8) {
      const weather = weatherData[i];

      const city = currentWeather.city;
      const date = weather.dt_txt;
      const icon = weather.weather[0].icon;
      const iconDescription = weather.weather[0].description;
      const tempF = weather.main.temp;
      const windSpeed = weather.wind.speed;
      const humidity = weather.main.humidity;

      forecastArray.push(new Weather(city, date, icon, iconDescription, tempF, windSpeed, humidity));
    }

    return forecastArray;
  }

  //Method to get the weather for a city
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const currentWeatherData = await this.fetchCurrentWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(currentWeatherData);
    const forecastData = await this.fetchForecastData(coordinates);
    const forecastWeather = this.parseForecastData(forecastData);
    return this.buildForecastArray(currentWeather, forecastWeather)
  }
}

export default new WeatherService();
