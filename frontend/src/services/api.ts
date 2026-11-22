import type {
  Place,
  CategoryMeta,
  RecommendationResponse,
  SearchResultResponse,
  AnalyticsSummary,
  AssociationRule
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export async function fetchCategories(): Promise<CategoryMeta[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return data.categories;
}

export async function fetchPlaces(params?: {
  category?: string;
  locality?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  limit?: number;
  skip?: number;
}): Promise<Place[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.locality) query.set('locality', params.locality);
  if (params?.search) query.set('search', params.search);
  if (params?.latitude !== undefined) query.set('latitude', params.latitude.toString());
  if (params?.longitude !== undefined) query.set('longitude', params.longitude.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.skip) query.set('skip', params.skip.toString());

  const res = await fetch(`${API_BASE}/places?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch places');
  const data = await res.json();
  return data.places;
}

export async function fetchPlaceDetails(place_id: string): Promise<Place> {
  const res = await fetch(`${API_BASE}/places/${place_id}`);
  if (!res.ok) throw new Error('Failed to fetch place details');
  return res.json();
}

export async function fetchTrendingPlaces(category?: string, limit: number = 10): Promise<Place[]> {
  const query = new URLSearchParams();
  if (category && category !== 'all') query.set('category', category);
  query.set('limit', limit.toString());

  const res = await fetch(`${API_BASE}/trending?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch trending places');
  const data = await res.json();
  return data.trending;
}

export async function fetchRecommendations(
  place_id: string,
  latitude?: number,
  longitude?: number
): Promise<RecommendationResponse> {
  const query = new URLSearchParams();
  if (latitude !== undefined) query.set('latitude', latitude.toString());
  if (longitude !== undefined) query.set('longitude', longitude.toString());

  const res = await fetch(`${API_BASE}/recommendations/${place_id}?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function performNaturalSearch(
  query: string,
  user_lat?: number,
  user_lng?: number
): Promise<SearchResultResponse> {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, user_lat, user_lng })
  });
  if (!res.ok) throw new Error('Failed to execute search');
  return res.json();
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  if (!res.ok) throw new Error('Failed to fetch analytics summary');
  return res.json();
}

export async function fetchAssociationRules(limit = 100): Promise<{ rules: AssociationRule[]; total_rules: number; parameters: any }> {
  const res = await fetch(`${API_BASE}/algorithm/rules?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch association rules');
  return res.json();
}

export async function retrainAprioriAlgorithm(params: {
  min_support: number;
  min_confidence: number;
  min_lift: number;
}) {
  const res = await fetch(`${API_BASE}/algorithm/retrain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to retrain algorithm');
  return res.json();
}
