import json
import pprint

pp = pprint.PrettyPrinter(indent=2)
data = None
with open('setlistCharlyGarcia.json', encoding='utf-8') as f:
    data = json.load(f)


venues = dict()
for setlist in data:
    setlist.pop('artist', None)
    setlist.pop('lastUpdated', None)
    setlist.pop('versionId', None)
    if 'venue'in setlist:
        if 'city' in setlist['venue']:
            setlist['venue']['city'].pop('state', None)
            setlist['venue']['city'].pop('stateCode', None)
        setlist['venue'].pop('url', None)
    if setlist['venue']['id'] in venues.keys():
        venues[setlist['venue']['id']] += 1
    else:
        venues[setlist['venue']['id']] = 1

data.reverse()

print(max(venues.values()))


# with open('venuesBose.json', 'w+', encoding="utf8") as f:
#     json.dump(venues, f)

with open('Examen/data/charlyGarciaClean.json', 'w+', encoding="utf8") as f:
    json.dump(data, f)