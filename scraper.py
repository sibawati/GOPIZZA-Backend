import sys
import requests
from bs4 import BeautifulSoup
import json
import random

# List of user-agents to rotate
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36",
]

def get_zomato_ratings(url):
    headers = {"User-Agent": random.choice(USER_AGENTS)}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")

        try:
            rating_elements = soup.find_all("div", class_="sc-1q7bklc-1 cILgox")

            if len(rating_elements) >= 2:
                dine_in = rating_elements[0].text.strip()
                delivery = rating_elements[1].text.strip()
                return json.dumps({"dine_in": dine_in, "delivery": delivery})
            else:
                return json.dumps({"error": "Ratings not found"})
        
        except Exception as e:
            return json.dumps({"error": "Failed to extract ratings", "details": str(e)})
    else:
        return json.dumps({"error": "Failed to fetch data", "status_code": response.status_code})

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(get_zomato_ratings(url))
    else:
        print(json.dumps({"error": "No URL provided"}))
