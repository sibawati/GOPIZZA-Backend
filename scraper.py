import requests
from bs4 import BeautifulSoup
import json
import datetime

DB_FILE = "db.json"

def get_zomato_ratings(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")

        try:
            ratings_divs = soup.find_all("div", class_="sc-1q7bklc-1 cILgox")
            if len(ratings_divs) >= 2:
                dine_in = ratings_divs[0].text.strip()
                delivery = ratings_divs[1].text.strip()
                return {"dine_in": dine_in, "delivery": delivery}
        except:
            pass
    
    return {"dine_in": "N/A", "delivery": "N/A"}

def update_ratings():
    try:
        with open(DB_FILE, "r") as file:
            data = json.load(file)

        today = datetime.date.today().isoformat()
        for restaurant in data["restaurants"]:
            if restaurant.get("lastUpdated") != today:
                print(f"Updating ratings for {restaurant['name']}...")
                restaurant["ratings"] = get_zomato_ratings(restaurant["zomatoUrl"])
                restaurant["lastUpdated"] = today

        with open(DB_FILE, "w") as file:
            json.dump(data, file, indent=2)

    except Exception as e:
        print("Error updating ratings:", str(e))

if __name__ == "__main__":
    update_ratings()
