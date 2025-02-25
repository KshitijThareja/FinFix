import express from 'express';
import { authenticateToken } from '../middleware/auth';
import supabase from '../supabase/supabase';

const router = express.Router();

router.get('/loans', authenticateToken, async (req, res) => { 
    try {
        const { data, error } = await supabase
            .from('loans')
            .select('*');
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});
router.get('/loans/:id', authenticateToken, async (req, res) => { 
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('loans')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});
router.post('/loans', authenticateToken, async (req, res) => { 
    try {
        const { data, error } = await supabase
            .from('loans')
            .insert(req.body);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
 });
router.delete('/loans/:id', authenticateToken, async (req, res) => { 
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('loans')
            .delete()
            .eq('id', id);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
 });

export default router;