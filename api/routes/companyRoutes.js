const express = require('express');
const {
    getCompanyDetails,
    updateCompanyDetails
} = require('../controllers/companyController');

const router = express.Router();

router.get('/', getCompanyDetails);
router.post('/', updateCompanyDetails); // Using POST for upsert-like behavior in UI

module.exports = router;
