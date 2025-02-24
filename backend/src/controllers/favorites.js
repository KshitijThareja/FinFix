const favoriteController = {
    // Get user's favorites
    getUserFavorites: async (req, res) => {
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select(`
            location_id,
            locations (*)
          `)
          .eq('user_id', req.user.id);
  
        if (error) throw error;
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  
    // Add to favorites
    addToFavorites: async (req, res) => {
      try {
        const { location_id } = req.body;
  
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: req.user.id,
            location_id
          });
  
        if (error) throw error;
        res.status(201).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  
    // Remove from favorites
    removeFromFavorites: async (req, res) => {
      try {
        const { location_id } = req.params;
  
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', req.user.id)
          .eq('location_id', location_id);
  
        if (error) throw error;
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  };