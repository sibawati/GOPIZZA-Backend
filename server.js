const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Load restaurant data from db.json
let db = JSON.parse(fs.readFileSync("db.json", "utf8"));

// Get all restaurants
app.get("/restaurants", (req, res) => {
    res.json(db.restaurants);
});

// Get ratings dynamically from Zomato
app.get("/restaurants", (req, res) => {
    try {
        const restaurants = JSON.parse(fs.readFileSync("db.json", "utf-8"));
        console.log("Fetched restaurants:", restaurants); // Debugging log

        if (!restaurants || restaurants.length === 0) {
            return res.status(404).json({ error: "No restaurants found" });
        }

        res.json(restaurants);
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


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

// Add a new restaurant and save it to db.json
app.post("/add-restaurant", (req, res) => {
    const { name, zomatoUrl } = req.body;
    if (!name || !zomatoUrl) {
        return res.status(400).json({ error: "Name and Zomato URL are required" });
    }

    const newRestaurant = { id: Date.now(), name, zomatoUrl };
    db.restaurants.push(newRestaurant);

    // Save to db.json
    fs.writeFile("db.json", JSON.stringify(db, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to save restaurant" });
        }
        res.json({ success: true, restaurant: newRestaurant });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
