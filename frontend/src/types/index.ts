export interface AuthData {
  session_token: string;
  uuid: string;
}

export interface SupabaseRequestOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}