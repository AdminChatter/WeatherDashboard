import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';

//City class with name and id properties
class City {
  name: string;
  id: string;
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  //method that reads from the searchHistory.json file
  private async read() {
    const data = await fs.readFile('db/searchHistory.json', {
      flag: 'a+',
      encoding: 'utf8',
    });

    return JSON.parse(data);
  }

  //write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    return await fs.writeFile('db/searchHistory.json', JSON.stringify(cities, null, '\t'));
  }

  //method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    return await this.read().then((cities) => {
      let searchHistory: City[];

      if (cities.length === 0) {
        searchHistory = [];
      } else {
        searchHistory = cities;
      }

      return searchHistory;
    });
  }
  
  //addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    if (!city) {
      throw new Error('City cannot be blank');
    }

    // Trim and format the city name
    city = city.trim();
    city = city.toLowerCase();
    city = city.charAt(0).toUpperCase() + city.slice(1);
    const newCity: City = { name: city, id: uuidv4() };

    return await this.getCities()
      .then((cities) => {

        if (cities.find((index) => index.name === city)) {
          return cities;
        }

        return [...cities, newCity];
      })

      .then((updatedCities) => this.write(updatedCities))
      .then(() => newCity);
  }
  
  //removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    return await this.getCities()
      .then((cities) => cities.filter((city) => city.id !== id))
      .then((updatedCities) => this.write(updatedCities));
  }
};

export default new HistoryService();