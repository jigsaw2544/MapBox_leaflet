const express = require('express');
const cors = require('cors');
const pool = require('./pgdb');
const router = express.Router();
router.use(cors());

router.use(express.json()); 
router.use(express.urlencoded({ extended: false })); 

router.get("/api/poi_pa_nonthaburi", async (req, res) => {
    try {
        const poi_pa_nonthaburi = await pool.query("SELECT id, ST_AsGeojson(geom)::json as point, name FROM public.poi_pa_nonthaburi");
        res.json(poi_pa_nonthaburi.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.get("/api/customer_order", async (req, res) => {
    try {
        const customer_order = await pool.query("SELECT id, ST_AsGeojson(geom)::json as point, name FROM public.customer_order");
        res.json(customer_order.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
