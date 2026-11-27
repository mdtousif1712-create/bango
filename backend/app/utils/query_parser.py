import re
from typing import Dict, Optional, Tuple, List

# Bengaluru localities mapping
LOCALITIES = [
    "indiranagar", "koramangala", "whitefield", "mg road", "brigade road",
    "malleshwaram", "malleswaram", "jayanagar", "yelahanka", "rajajinagar",
    "central bengaluru", "hebbal", "sarjapur", "electronic city", "basavanagudi",
    "shivaji nagar", "shivajinagar", "vasanth nagar", "chamarajpet", "shanthi nagar",
    "hsr layout", "hsr", "mysore road", "bellary road", "marathahalli", "kanakapura"
]

# Domains and synonyms (singular, plural, activities)
DOMAINS = {
    "Healthcare": ["hospital", "hospitals", "clinic", "clinics", "diagnostic", "diagnostics", "healthcare", "doctor", "doctors", "medical", "pharmacy", "pharmacies", "medicine", "emergency"],
    "Transportation": ["metro", "subway", "train", "trains", "railway", "railways", "bus", "buses", "station", "stations", "transit", "airport", "terminal", "terminals", "bmtc", "ksrtc"],
    "Tourism": ["tourist", "tourists", "tourism", "attraction", "attractions", "visit", "sightseeing", "park", "parks", "garden", "gardens", "palace", "palaces", "museum", "museums", "monument", "monuments", "temple", "temples", "heritage"],
    "Shopping": ["shopping", "mall", "malls", "store", "stores", "bazaar", "bazaars", "market", "markets", "boutique", "boutiques", "retail", "supermarket", "supermarkets"],
    "Education": ["college", "colleges", "university", "universities", "school", "schools", "campus", "campuses", "institute", "institutes", "library", "libraries", "research", "iisc"],
    "Entertainment": ["entertainment", "cinema", "cinemas", "movie", "movies", "theatre", "theatres", "theater", "theaters", "imax", "amusement", "gaming", "bowling", "fun"],
    "Restaurants": ["restaurant", "restaurants", "food", "cafe", "cafes", "dining", "brewery", "breweries", "brewpub", "beer", "dosa", "dosas", "biryani", "meals", "coffee", "eat", "lunch", "dinner", "breakfast"],
    "Startups": ["startup", "startups", "incubator", "incubators", "coworking", "co-working", "accelerator", "accelerators", "tech park", "tech", "venture", "founder", "founders", "innovation", "unicorn", "wework", "bhive", "nsrcel"]
}

def parse_natural_query(query: str) -> Dict[str, Optional[str]]:
    """
    Parses natural language query into:
    - domain: matched domain or None
    - locality: matched locality or None
    - place_or_activity: extracted specific entity or None
    - intent: recommendation vs direct search
    """
    q = query.lower().strip()
    
    # Check for recommendation intent
    recommendation_keywords = ["recommend", "suggest", "popular", "trending", "also explore", "related to", "what to do", "best"]
    is_recommendation = any(k in q for k in recommendation_keywords)
    intent = "recommendation" if is_recommendation else "search"
    
    # Detect locality
    matched_locality = None
    for loc in LOCALITIES:
        pattern = r'\b' + re.escape(loc) + r'\b'
        if re.search(pattern, q):
            matched_locality = loc.title()
            break
            
    # Detect domain
    matched_domain = None
    for domain, keywords in DOMAINS.items():
        for kw in keywords:
            pattern = r'\b' + re.escape(kw) + r'\b'
            if re.search(pattern, q):
                matched_domain = domain
                break
        if matched_domain:
            break
            
    return {
        "raw_query": query,
        "domain": matched_domain,
        "locality": matched_locality,
        "intent": intent
    }
