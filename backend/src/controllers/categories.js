const categoryController = {
    getAllCategories: async (req, res) => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');
  
        if (error) throw error;
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  
    // Create category
    createCategory: async (req, res) => {
      try {
        const { name, description, color, icon_name } = req.body;
  
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name,
            description,
            color,
            icon_name,
            created_by: req.user.id
          })
          .single();
  
        if (error) throw error;
        res.status(201).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  };