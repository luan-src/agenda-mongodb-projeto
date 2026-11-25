const { Router } = require('express');
const router = Router();
router.get('/saude', (_req, res) => res.json({ status: 'ok' }));
module.exports = router;
