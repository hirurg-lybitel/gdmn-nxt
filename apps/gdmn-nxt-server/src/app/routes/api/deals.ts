import express from 'express';
import deals from '../../controllers/deals';


const router = express.Router();

router.get('/', deals.get);

export default router;
