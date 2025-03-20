const express = require("express");
const cors = require("cors");
const fs = require("fs");

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

// Add a new restaurant
app.post("/add-restaurant", (req, res) => {
    const { name, zomatoUrl } = req.body;
    if (!name || !zomatoUrl) {
        return res.status(400).json({ error: "Name and Zomato URL are required" });
    }

    let db = JSON.parse(fs.readFileSync("db.json", "utf8"));
    const newRestaurant = { id: Date.now(), name, zomatoUrl, ratings: { dine_in: "N/A", delivery: "N/A" } };
    
    db.restaurants.push(newRestaurant);
    fs.writeFileSync("db.json", JSON.stringify(db, null, 2));

    res.json({ success: true, restaurant: newRestaurant });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
