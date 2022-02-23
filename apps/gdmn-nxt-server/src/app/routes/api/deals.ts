import express from 'express';
import deals from '../../deals';


const router = express.Router();

router.get('/', deals.get);

export default router;
