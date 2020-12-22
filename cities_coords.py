from geopy.geocoders import Nominatim
import pprint
import json
from tqdm import tqdm

pp = pprint.PrettyPrinter(indent=2)
geolocator = Nominatim(user_agent="infovis_app")
location = geolocator.geocode("Buenos Aires, Argentina")


with open('Examen/data/charlyGarciaClean.json', encoding='utf-8') as f:
    data = json.load(f)


cities_count = dict()
for setlist in tqdm(data):
    if setlist['venue']['city']['id'] in cities_count.keys():
        cities_count[setlist['venue']['city']['id']]['count'] += 1
    else:
        try:
            cities_count[setlist['venue']['city']['id']] = {
            'count': 1,
            'lat': geolocator.geocode(f"{setlist['venue']['city']['name']}, {setlist['venue']['city']['country']['name']}").latitude,
            'long': geolocator.geocode(f"{setlist['venue']['city']['name']}, {setlist['venue']['city']['country']['name']}").longitude
        }
        except:
            print("Error con ", f"{setlist['venue']['city']['name']}, {setlist['venue']['city']['country']['name']}")
        

with open('Examen/data/venuesCharlyGarcia.json', 'w+', encoding="utf8") as f:
    json.dump(cities_count, f)    

