import sys
import requests
from bs4 import BeautifulSoup
import json

def get_zomato_ratings(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
        "DNT": "1",  # Do Not Track Request Header
        "Connection": "keep-alive"
    }
    
    response = requests.get(url, headers=headers)

    if response.status_code == 403:
        return json.dumps({"error": "Access denied by Zomato (403 Forbidden). Try updating the headers."})
    elif response.status_code != 200:
        return json.dumps({"error": "Failed to fetch data", "status_code": response.status_code})

    soup = BeautifulSoup(response.text, 'html.parser')

    try:
        # Adjust these selectors if Zomato's website structure changes
        rating_elements = soup.find_all('div', class_='sc-1q7bklc-1 cILgox')
        if len(rating_elements) >= 2:
            dine_in = rating_elements[0].text.strip()
            delivery = rating_elements[1].text.strip()
            return json.dumps({"dine_in": dine_in, "delivery": delivery})
        else:
            return json.dumps({"error": "Failed to extract ratings, structure may have changed."})

    except Exception as e:
        return json.dumps({"error": "Failed to extract ratings", "details": str(e)})

# Run when executed
if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(get_zomato_ratings(url))
    else:
        print(json.dumps({"error": "No URL provided"}))
