import { rpc, from } from '../config/supabase';

const locationController = {
  // Get locations within bounds
  getLocationsInBounds: async (req, res) => {
    try {
      const { min_lng, min_lat, max_lng, max_lat, category_id } = req.query;
      
      const { data, error } = await rpc('get_locations_in_bounds', {
        min_lng: parseFloat(min_lng),
        min_lat: parseFloat(min_lat),
        max_lng: parseFloat(max_lng),
        max_lat: parseFloat(max_lat),
        loc_category_id: category_id || null
      });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new location
  createLocation: async (req, res) => {
    try {
      const {
        name,
        category_id,
        latitude,
        longitude,
        description,
        address,
        is_public,
        custom_properties
      } = req.body;

      const { data, error } = await rpc('create_location', {
        name,
        category_id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description,
        address,
        is_public,
        custom_properties
      });

      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update location
  updateLocation: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const { data, error } = await from('locations')
        .update(updateData)
        .eq('id', id)
        .eq('created_by', req.user.id)
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete location
  deleteLocation: async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await from('locations')
        .delete()
        .eq('id', id)
        .eq('created_by', req.user.id);

      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};