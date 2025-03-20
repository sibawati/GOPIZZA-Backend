import sys
import requests
from bs4 import BeautifulSoup
import json

def get_zomato_ratings(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')

        try:
            ratings = soup.find_all('div', class_='sc-1q7bklc-1 cILgox')
            dine_in = ratings[0].text.strip() if len(ratings) > 0 else "N/A"
            delivery = ratings[1].text.strip() if len(ratings) > 1 else "N/A"

            return json.dumps({"dine_in": dine_in, "delivery": delivery})

        except Exception as e:
            return json.dumps({"error": "Failed to extract ratings", "details": str(e)})
    elif response.status_code == 403:
        return json.dumps({"error": "Access denied (403). Try again later."})
    else:
        return json.dumps({"error": "Failed to fetch data", "status_code": response.status_code})

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(get_zomato_ratings(url))
    else:
        print(json.dumps({"error": "No URL provided"}))
