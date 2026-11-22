export interface Place {
  place_id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  address: string;
  locality: string;
  latitude: number;
  longitude: number;
  image_url: string;
  rating?: number;
  review_count?: number;
  tags?: string[];
  popular_activity?: string;
  distance_km?: number;
  dataset_visit_frequency?: number;
}

export interface RecommendationItem {
  place: Place;
  confidence: number;
  lift: number;
  support: number;
  antecedent: string;
  rule_explanation: string;
  recommendation_type: 'association' | 'proximity' | 'trending' | 'category_fallback' | 'location_fallback';
  distance_km?: number;
}

export interface RecommendationResponse {
  query_item?: string;
  category?: string;
  recommendations: RecommendationItem[];
  total: number;
  rules_applied_count: number;
  has_association_rules: boolean;
  notice?: string;
}

export interface CategoryMeta {
  id: string;
  name: string;
  icon: string;
  color: string;
  markerColor: string;
  description: string;
}

export interface AssociationRule {
  rule_id: string;
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
  explanation: string;
}

export interface AnalyticsSummary {
  total_places: number;
  total_transactions: number;
  total_rules_generated: number;
  frequent_itemsets_count: number;
  average_confidence: number;
  parameters: {
    min_support: number;
    min_confidence: number;
    min_lift: number;
  };
  category_breakdown: { category: string; count: number }[];
  dataset_source: string;
}

export interface SearchResultResponse {
  query: string;
  parsed_domain?: string;
  parsed_locality?: string;
  parsed_intent?: string;
  matched_places: Place[];
  apriori_recommendations: RecommendationItem[];
  has_rules: boolean;
  explanation: string;
  notice?: string;
}
