import express from 'express';
import {
    getCompanyDetails,
    updateCompanyDetails
} from '../controllers/companyController.js';

const router = express.Router();

router.get('/', getCompanyDetails);
router.post('/', updateCompanyDetails);

export default router;
