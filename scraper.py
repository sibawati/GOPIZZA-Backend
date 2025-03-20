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
            # Ensure elements exist before accessing them
            rating_elements = soup.find_all('div', class_='sc-1q7bklc-1 cILgox')

            if len(rating_elements) >= 2:
                dine_in = rating_elements[0].text.strip()
                delivery = rating_elements[1].text.strip()
                return json.dumps({"dine_in": dine_in, "delivery": delivery})
            else:
                return json.dumps({"error": "Ratings not found on page"})

        except Exception as e:
            return json.dumps({"error": "Failed to extract ratings", "details": str(e)})
    else:
        return json.dumps({"error": "Failed to fetch data", "status_code": response.status_code})

# Run when executed
if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(get_zomato_ratings(url))
    else:
        print(json.dumps({"error": "No URL provided"}))
