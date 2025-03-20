import requests
from bs4 import BeautifulSoup
import json
import sys

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

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(json.dumps(get_zomato_ratings(url)))
