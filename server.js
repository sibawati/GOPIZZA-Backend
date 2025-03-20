const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const DB_FILE = "db.json";

// Function to load restaurant data
function loadDatabase() {
    try {
        const data = fs.readFileSync(DB_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading database:", error);
        return { restaurants: [] }; // Return empty structure if file not found
    }
}

// Function to save restaurant data
function saveDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Load database on startup
let db = loadDatabase();

// ✅ API to get all restaurants
app.get("/restaurants", (req, res) => {
    res.json(db.restaurants);
});

// ✅ API to add a new restaurant (now saved permanently)
app.post("/add-restaurant", (req, res) => {
    const { name, zomatoUrl } = req.body;
    if (!name || !zomatoUrl) {
        return res.status(400).json({ error: "Name and Zomato URL are required" });
    }

    const newRestaurant = { id: Date.now(), name, zomatoUrl, ratings: { dine_in: "N/A", delivery: "N/A" } };
    db.restaurants.push(newRestaurant);
    saveDatabase(db); // Save to db.json

    res.json({ success: true, restaurant: newRestaurant });
});

// ✅ API to delete a restaurant
app.delete("/delete-restaurant/:id", (req, res) => {
    const restaurantId = parseInt(req.params.id);
    db.restaurants = db.restaurants.filter(r => r.id !== restaurantId);
    saveDatabase(db); // Save to db.json after deletion
    res.json({ success: true });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
