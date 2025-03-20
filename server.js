const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Load restaurant data from db.json
const getRestaurants = () => {
    try {
        const data = fs.readFileSync("db.json", "utf8");
        return JSON.parse(data).restaurants || [];
    } catch (error) {
        console.error("Error loading restaurants:", error);
        return [];
    }
};

// Get all restaurants
app.get("/restaurants", (req, res) => {
    res.json(getRestaurants());
});

// Get restaurant ratings dynamically
app.get("/ratings/:id", (req, res) => {
    const restaurants = getRestaurants();
    const restaurant = restaurants.find(r => r.id == req.params.id);

    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    const pythonProcess = spawn("python3", ["scraper.py", restaurant.zomatoUrl]);

    let data = "";
    pythonProcess.stdout.on("data", chunk => { data += chunk; });

    pythonProcess.on("close", () => {
        try {
            const ratings = JSON.parse(data);
            res.json({ name: restaurant.name, ratings });
        } catch (error) {
            res.json({ name: restaurant.name, ratings: { error: "Failed to parse scraper response" } });
        }
    });

    pythonProcess.stderr.on("data", err => {
        console.error(`Scraper error: ${err}`);
    });
});

// Add a new restaurant
app.post("/add-restaurant", (req, res) => {
    const { name, zomatoUrl } = req.body;
    if (!name || !zomatoUrl) {
        return res.status(400).json({ error: "Name and Zomato URL are required" });
    }

    let db = { restaurants: getRestaurants() };
    const newRestaurant = { id: Date.now(), name, zomatoUrl };
    db.restaurants.push(newRestaurant);

    fs.writeFile("db.json", JSON.stringify(db, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to save restaurant" });
        }
        res.json({ success: true, restaurant: newRestaurant });
    });
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
