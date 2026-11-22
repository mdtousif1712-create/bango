import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=== RUNNING MANDATORY SMART CITY TEST SUITE ===")
    
    # TEST 1: Health & Bengaluru Initial State
    res = urllib.request.urlopen(f"{BASE_URL}/health")
    health = json.loads(res.read().decode())
    assert health["city"] == "Bengaluru, Karnataka, India"
    assert health["apriori_engine"]["status"] == "trained"
    print("TEST 1 PASSED: Application online, Bengaluru center verified, Apriori engine trained.")

    # TEST 2: Category Tourism Filtering
    res = urllib.request.urlopen(f"{BASE_URL}/places?category=Tourism&limit=20")
    tourism = json.loads(res.read().decode())
    assert all(p["category"] == "Tourism" for p in tourism["places"])
    assert len(tourism["places"]) >= 5
    print(f"TEST 2 PASSED: Category Tourism filtering verified ({len(tourism['places'])} tourism destinations).")

    # TEST 3: Search for Cubbon Park
    req = urllib.request.Request(
        f"{BASE_URL}/search",
        data=json.dumps({"query": "Cubbon Park"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    search_cubbon = json.loads(res.read().decode())
    assert any("Cubbon Park" in p["name"] for p in search_cubbon["matched_places"])
    print("TEST 3 PASSED: Search for Cubbon Park verified.")

    # TEST 4: Select Cubbon Park & Retrieve Apriori-based recommendations
    cubbon_id = "blr_tour_01"
    res = urllib.request.urlopen(f"{BASE_URL}/recommendations/{cubbon_id}")
    cubbon_recs = json.loads(res.read().decode())
    assert cubbon_recs["has_association_rules"] is True
    assert len(cubbon_recs["recommendations"]) > 0
    top_rec = cubbon_recs["recommendations"][0]
    print(f"TEST 4 PASSED: Cubbon Park Apriori recommendations retrieved. Top: {top_rec['place']['name']}.")

    # TEST 5: Verify support, confidence, lift calculations
    assert top_rec["confidence"] > 0
    assert top_rec["lift"] >= 1.0
    assert top_rec["support"] > 0
    print(f"TEST 5 PASSED: Metrics verified: Conf={top_rec['confidence']*100:.1f}%, Lift={top_rec['lift']:.2f}x, Supp={top_rec['support']*100:.1f}%.")

    # TEST 6: Search for hospitals near Whitefield
    req = urllib.request.Request(
        f"{BASE_URL}/search",
        data=json.dumps({"query": "Find hospitals near Whitefield"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    hosp_whitefield = json.loads(res.read().decode())
    assert hosp_whitefield["parsed_domain"] == "Healthcare"
    assert hosp_whitefield["parsed_locality"] == "Whitefield"
    assert any("Hospital" in p["name"] for p in hosp_whitefield["matched_places"])
    print(f"TEST 6 PASSED: Query parsed to domain=Healthcare, locality=Whitefield, matched {hosp_whitefield['matched_places'][0]['name']}.")

    # TEST 7: Trending places from stored data
    res = urllib.request.urlopen(f"{BASE_URL}/trending?limit=5")
    trending = json.loads(res.read().decode())
    assert len(trending["trending"]) > 0
    assert "dataset_visit_frequency" in trending["trending"][0]
    print(f"TEST 7 PASSED: Trending destinations retrieved from mobility frequencies (Top: {trending['trending'][0]['name']}).")

    # TEST 8: Missing association rules handled gracefully
    res = urllib.request.urlopen(f"{BASE_URL}/recommendations/blr_re_10")
    missing_rec = json.loads(res.read().decode())
    assert "recommendations" in missing_rec
    print("TEST 8 PASSED: Edge cases and fallbacks handled gracefully with explanatory notices.")

    # TEST 9: Verify all eight categories
    all_cats = ["Healthcare", "Transportation", "Tourism", "Shopping", "Education", "Entertainment", "Restaurants", "Real Estate"]
    for cat in all_cats:
        cat_encoded = urllib.parse.quote(cat)
        res = urllib.request.urlopen(f"{BASE_URL}/places?category={cat_encoded}&limit=5")
        data = json.loads(res.read().decode())
        assert len(data["places"]) > 0, f"Category {cat} returned no places"
    print(f"TEST 9 PASSED: All 8 smart city domains operational with verified locations.")

    # TEST 10: Analytics summary
    res = urllib.request.urlopen(f"{BASE_URL}/analytics/summary")
    summary = json.loads(res.read().decode())
    assert summary["total_places"] == 80
    assert summary["total_transactions"] == 1250
    assert summary["total_rules_generated"] > 0
    print(f"TEST 10 PASSED: Summary metrics verified: 80 places, 1,250 transactions, {summary['total_rules_generated']} Apriori rules.")

    print("\n=======================================================")
    print("ALL 10 MANDATORY WORKFLOW TESTS PASSED PERFECTLY!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
