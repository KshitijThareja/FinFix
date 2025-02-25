"use client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Key");
}

import { AuthData, SupabaseRequestOptions } from "@/types";
import { useState } from "react";

export const useSupabaseGet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getFromSupabase = async (
    endpoint: string,
    authData: AuthData,
    options?: SupabaseRequestOptions
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authData.session_token}`,
            ...(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      options?.onSuccess?.(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      const error = new Error(errorMessage);
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { getFromSupabase, isLoading, error };
};

export const useSupabasePost = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const postToSupabase = async <T extends Record<string, any>>(
    endpoint: string,
    metadata: T,
    authData: AuthData,
    options?: SupabaseRequestOptions
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authData.session_token}`,
            ...(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            }),
          },
          body: JSON.stringify({
            ...metadata,
            user_id: authData.uuid,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      options?.onSuccess?.(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      const error = new Error(errorMessage);
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { postToSupabase, isLoading, error };
};
