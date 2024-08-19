import dotenv from 'dotenv';
dotenv.config();

//Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

//Define a class for the Weather object
class Weather {
  weatherIcon: string;
  temp: number;
  wind: number;
  humidity: number;

  constructor(weatherIcon: string, temp: number, wind: number, humidity: number) {
    this.weatherIcon = weatherIcon;
    this.temp = temp;
    this.wind = wind;
    this.humidity = humidity;
  }
}

//Complete the WeatherService class
class WeatherService {
  //Define the baseURL, API key, and city name properties
  private baseURL = process.env.BASE_URL;
  private apiKey = process.env.API_KEY;
  private cityName = '';

  //Create fetchLocationData method
  private async fetchLocationData(query: string) {
    return await fetch(
      `${this.baseURL}/data/3.0/onecall/timemachine?${query}`
    );
  }

  //Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    let { lat, lon } = locationData;
    
    lat = Math.round(lat*100)/100;
    lon = Math.round(lon*100)/100;

    return { lat, lon };
  }

  //Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
  }

  //Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const response = await this.fetchLocationData(this.buildGeocodeQuery());
    const locationData = await response.json();
    return this.destructureLocationData(locationData[0]);
  }

  // Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
  }

  //Create fetchWeatherData method
  private async fetchCurrentWeatherData(coordinates: Coordinates) {
    const response = await fetch(`${this.baseURL}/data/2.5/weather` + this.buildWeatherQuery(coordinates));
    return await response.json();
  }

  //Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const weatherIcon = response.weather[0].icon;
    const temp = response.main.temp;
    const wind_speed = response.wind.speed;
    const humidity = response.main.humidity;
    return new Weather(weatherIcon, temp, wind_speed, humidity);
  }

  //Create fetchForecastData method
  private async fetchForecastData(coordinates: Coordinates) {
    const response = await fetch(`${this.baseURL}/data/2.5/forecast` + this.buildWeatherQuery(coordinates));
    return await response.json();
  }

  //Create parseForecastData method
  private parseForecastData(response: any) {
    return response.list;
  }

  //Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]){
    const forecastArray = [];
    forecastArray.push(currentWeather);

    for (let i = 0; i < weatherData.length; i=i+8) {
      const weather = weatherData[i];
      const weatherIcon = weather.weather[0].icon;
      const temp = weather.main.temp;
      const wind_speed = weather.wind.speed;
      const humidity = weather.main.humidity;
      forecastArray.push(new Weather(weatherIcon, temp, wind_speed, humidity));
    }

    return forecastArray;
  }

  //Complete getWeatherForCity method
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
