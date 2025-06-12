const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const c = require('../controllers/materialKitController');

router.use(auth);
router.get('/', c.getAllKits);
router.get('/:id', c.getKitById);

module.exports = router;
