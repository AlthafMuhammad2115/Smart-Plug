const express = require('express');
<<<<<<< HEAD
const router = express.Router();    

=======
const router = express.Router();
const { PlugControll } = require('../controllers/api.controller');
const { verifyApiKey }= require('../middlewares/apikeyauth.middleware');

router.post('/control/plug',verifyApiKey, PlugControll);
>>>>>>> 86be83b59638220cf2856e5ad5b837a689f85f72

module.exports = router;