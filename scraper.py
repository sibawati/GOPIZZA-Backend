import sys
import requests
from bs4 import BeautifulSoup
import json

if len(sys.argv) < 2:
    print(json.dumps({"error": "No URL provided"}))
    sys.exit()

zomato_url = sys.argv[1]

# Headers to prevent blocking
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

try:
    response = requests.get(zomato_url, headers=headers)

    if response.status_code == 403:
        print(json.dumps({"error": "Blocked by Zomato"}))
        sys.exit()

    soup = BeautifulSoup(response.text, "html.parser")

    # Extract ratings (update selectors if needed)
    dine_in_rating = soup.select_one(".sc-1q7bklc-8.kEAXKb").text if soup.select_one(".sc-1q7bklc-8.kEAXKb") else "N/A"
    delivery_rating = soup.select_one(".sc-1q7bklc-8.KbvGz").text if soup.select_one(".sc-1q7bklc-8.KbvGz") else "N/A"

    print(json.dumps({"dine_in": dine_in_rating, "delivery": delivery_rating}))

except Exception as e:
    print(json.dumps({"error": str(e)}))
