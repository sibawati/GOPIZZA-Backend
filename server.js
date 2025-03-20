const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Load restaurant data
function loadRestaurants() {
    return JSON.parse(fs.readFileSync("db.json", "utf8")).restaurants;
}

// Get all restaurants
app.get("/restaurants", (req, res) => {
    res.json(loadRestaurants());
});

// Get ratings from cached data
app.get("/ratings/:id", (req, res) => {
    const restaurant = loadRestaurants().find(r => r.id == req.params.id);
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json({ name: restaurant.name, ratings: restaurant.ratings });
});

// Function to update ratings for a specific restaurant
function updateRatingsForRestaurant(restaurant, callback) {
    exec(`python3 scraper.py "${restaurant.zomatoUrl}"`, (error, stdout) => {
        if (error) {
            console.error(`Error fetching ratings for ${restaurant.name}:`, error);
            return callback({ dine_in: "N/A", delivery: "N/A" });
        }

        try {
            const scrapedRatings = JSON.parse(stdout);
            callback(scrapedRatings);
        } catch (parseError) {
            console.error("Failed to parse scraper output:", parseError);
            callback({ dine_in: "N/A", delivery: "N/A" });
        }
    });
}

// Add a new restaurant and fetch its ratings immediately
app.post("/add-restaurant", (req, res) => {
    const { name, zomatoUrl } = req.body;
    if (!name || !zomatoUrl) {
        return res.status(400).json({ error: "Name and Zomato URL are required" });
    }

    let db = JSON.parse(fs.readFileSync("db.json", "utf8"));
    const newRestaurant = { id: Date.now(), name, zomatoUrl, ratings: { dine_in: "N/A", delivery: "N/A" } };
    db.restaurants.push(newRestaurant);

    // Fetch ratings immediately
    updateRatingsForRestaurant(newRestaurant, (ratings) => {
        newRestaurant.ratings = ratings;
        
        // Save updated restaurant data
        fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
        res.json({ success: true, restaurant: newRestaurant });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
