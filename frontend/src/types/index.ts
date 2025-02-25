export interface Location {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  coordinates: any; // GeometryPoint from PostGIS
  address: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon_name: string | null;
}

export interface MapBounds {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface AuthData {
  session_token: string;
  uuid: string;
}

export interface SupabaseRequestOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}