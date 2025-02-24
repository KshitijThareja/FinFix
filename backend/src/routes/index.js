import { Router } from 'express';
const router = Router();
import { authenticateUser } from '../middleware/auth';
import { getLocationsInBounds, createLocation, updateLocation, deleteLocation } from '../controllers/locations';
import { getAllCategories, createCategory } from '../controllers/categories';
import { getUserFavorites, addToFavorites, removeFromFavorites } from '../controllers/favorites';

router.get('/locations', authenticateUser, getLocationsInBounds);
router.post('/locations', authenticateUser, createLocation);
router.put('/locations/:id', authenticateUser, updateLocation);
router.delete('/locations/:id', authenticateUser, deleteLocation);

router.get('/categories', authenticateUser, getAllCategories);
router.post('/categories', authenticateUser, createCategory);

router.get('/favorites', authenticateUser, getUserFavorites);
router.post('/favorites', authenticateUser, addToFavorites);
router.delete('/favorites/:location_id', authenticateUser, removeFromFavorites);

export default router;