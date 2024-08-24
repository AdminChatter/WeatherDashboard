import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

//POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  //GET weather data from city name
  //save city to search history
  try {
    const city = req.body.cityName;
    await HistoryService.addCity(city);
    const weatherData = await WeatherService.getWeatherForCity(city);
    res.json(weatherData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const savedCities = await HistoryService.getCities();
    res.json(savedCities);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      throw new Error('City ID is required');
    }

    const id = req.params.id;
    await HistoryService.removeCity(id);
    res.json({success: 'City successfully removed from search history'});
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

export default router;
