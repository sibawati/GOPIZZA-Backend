const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ✅ Fix: Load db.json safely
let db = { restaurants: [] };
try {
    const fileData = fs.readFileSync("db.json", "utf8");
    db = JSON.parse(fileData);
    if (!db.restaurants || !Array.isArray(db.restaurants)) {
        db.restaurants = [];
    }
} catch (error) {
    console.error("Error reading db.json:", error);
}

// ✅ Fix: Ensure `/restaurants` returns an array
app.get("/restaurants", (req, res) => {
    res.json(db.restaurants);
});

// ✅ Fix: Ensure new restaurants persist
app.post("/add-restaurant", (req, res) => {
    const { name, zomatoUrl } = req.body;
    if (!name || !zomatoUrl) {
        return res.status(400).json({ error: "Name and Zomato URL are required" });
    }

    const newRestaurant = { id: Date.now(), name, zomatoUrl };
    db.restaurants.push(newRestaurant);

    fs.writeFileSync("db.json", JSON.stringify({ restaurants: db.restaurants }, null, 2));

    res.json({ success: true, restaurant: newRestaurant });
});

// ✅ Fix: Fetch ratings dynamically
app.get("/ratings/:id", (req, res) => {
    const restaurant = db.restaurants.find(r => r.id == req.params.id);
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    const pythonProcess = spawn("python", ["scraper.py", restaurant.zomatoUrl]);
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

// ✅ Fix: Handle missing db.json issue
app.post("/reset-db", (req, res) => {
    fs.writeFileSync("db.json", JSON.stringify({ restaurants: [] }, null, 2));
    res.json({ success: true, message: "Database reset successfully" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
