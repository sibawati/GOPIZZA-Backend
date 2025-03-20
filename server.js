const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Function to load restaurant data from db.json
function loadDB() {
    return JSON.parse(fs.readFileSync("db.json", "utf8"));
}

// ✅ Get all restaurants (always fetch the latest data)
app.get("/restaurants", (req, res) => {
    try {
        const db = loadDB();
        res.json(db.restaurants);
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fetch ratings dynamically using Python scraper
app.get("/ratings/:id", (req, res) => {
    const db = loadDB();
    const restaurant = db.restaurants.find(r => r.id == req.params.id);
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    const pythonProcess = spawn("python3", ["scraper.py", restaurant.zomatoUrl]);

    let data = "";
    pythonProcess.stdout.on("data", chunk => {
        data += chunk;
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

// ✅ Add a new restaurant and save it to db.json
app.post("/add-restaurant", (req, res) => {
    const { name, zomatoUrl } = req.body;
    if (!name || !zomatoUrl) {
        return res.status(400).json({ error: "Name and Zomato URL are required" });
    }

    const db = loadDB();
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

// ✅ Start server
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
