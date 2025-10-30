import express from 'express';
import { evaluatePolicy } from '../service/policy-service';

const router = express.Router();

router.post('/evaluate', async (req, res) => {
    try {
        if (!req.is('application/json')) {
            return res.status(400).json({ error: 'Content-Type must be application/json' });
        }

        //imp 
        const { orgId, expense } = (req.body ?? {}) as { orgId?: string; expense?: unknown };

        if (!orgId || expense === undefined) {
            return res.status(400).json({ error: 'orgId and expense are required' });
        }

        const result = await evaluatePolicy(orgId, expense as Record<string, unknown>);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;