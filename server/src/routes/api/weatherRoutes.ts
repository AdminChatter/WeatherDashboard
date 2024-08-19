import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  const cityName = req.body.city;
  const weatherService = WeatherService();
  // TODO: save city to search history
  const historyService = HistoryService.addCity(weather);
  historyService.saveCity(weather);
});

// TODO: GET search history
router.get('/history', async (req: Request, res: Response) => {
  
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const historyService = new HistoryService();
    historyService.deleteCity(id);
  }
});

export default router;
