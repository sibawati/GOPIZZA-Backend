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
            # Adjust these selectors if Zomato's website structure changes
            dine_in = soup.find('div', class_='sc-1q7bklc-1 cILgox').text.strip()
            delivery = soup.find_all('div', class_='sc-1q7bklc-1 cILgox')[1].text.strip()

            return json.dumps({"dine_in": dine_in, "delivery": delivery})

        except Exception as e:
            return json.dumps({"error": "Failed to extract ratings", "details": str(e)})
    else:
        return json.dumps({"error": "Failed to fetch data"})

# Run when executed
if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(get_zomato_ratings(url))
    else:
        print(json.dumps({"error": "No URL provided"}))
