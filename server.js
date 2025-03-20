const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;  // Use dynamic port for deployment
const DB_FILE = 'db.json';

app.use(cors());
app.use(express.json());

// Load restaurants from db.json
function loadRestaurants() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading restaurants:", error);
        return [];
    }
}

// Save restaurants to db.json
function saveRestaurants(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving restaurants:", error);
    }
}

// GET all restaurants
app.get('/restaurants', (req, res) => {
    const restaurants = loadRestaurants();
    res.json(restaurants);
});

// POST new restaurant
app.post('/restaurants', (req, res) => {
    const restaurants = loadRestaurants();
    const newRestaurant = {
        id: Date.now(),
        name: req.body.name,
        zomatoUrl: req.body.zomatoUrl
    };
    restaurants.push(newRestaurant);
    saveRestaurants(restaurants);
    res.json(newRestaurant);
});

// DELETE a restaurant
app.delete('/restaurants/:id', (req, res) => {
    let restaurants = loadRestaurants();
    restaurants = restaurants.filter(r => r.id != req.params.id);
    saveRestaurants(restaurants);
    res.json({ message: 'Restaurant deleted' });
});

// GET ratings for a restaurant
app.get('/ratings/:id', (req, res) => {
    const restaurants = loadRestaurants();
    const restaurant = restaurants.find(r => r.id == req.params.id);

    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    console.log(`Fetching ratings for: ${restaurant.name} (${restaurant.zomatoUrl})`);

    // Use 'python3' for better compatibility on hosting services
    const pythonProcess = spawn('python3', ['scraper.py', restaurant.zomatoUrl]);

    pythonProcess.stdout.on('data', (data) => {
        const result = data.toString().trim();
        try {
            const ratings = JSON.parse(result);
            res.json({ name: restaurant.name, ratings });
        } catch (error) {
            console.error("Failed to parse scraper data:", error);
            res.status(500).json({ error: 'Failed to parse scraper data' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error("Scraper error:", data.toString());
        res.status(500).json({ error: 'Scraper error', details: data.toString() });
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
});
