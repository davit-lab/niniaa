import { supabase } from './supabase';

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  description?: string;
  cover_image: string;
  gallery: string[];
  date_label?: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  image?: string;
  sort_order: number;
}

export interface Shot {
  id: string;
  url: string;
  caption?: string;
  sort_order: number;
}

export interface Review {
  id: string;
  name: string;
  role?: string;
  text: string;
  image?: string;
  rating: number;
  sort_order: number;
}

export interface SiteSettings {
  id?: string;
  hero_title_part1: string;
  hero_title_part2: string;
  hero_image?: string;
  hero_quote?: string;
  contact_location: string;
  contact_email?: string;
  contact_phone?: string;
  instagram?: string;
  facebook?: string;
  about_text?: string;
  about_image?: string;
  primary_color?: string;
  accent_color?: string;
  background_color?: string;
  updated_at?: string;
}

export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return data as Project[];
}

export async function fetchProjectBySlug(slug: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) return null;
  return data as Project;
}

export async function fetchServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return data as Service[];
}

export async function fetchShots(limitCount?: number) {
  let query = supabase
    .from('shots')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (limitCount) {
    query = query.limit(limitCount);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as Shot[];
}

export async function fetchReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return data as Review[];
}

export async function fetchSettings() {
  try {
    // Try to fetch all, if any column is missing, this might fail with schema error
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, hero_title_part1, hero_title_part2, hero_image, hero_quote, contact_location, contact_email, contact_phone, instagram, facebook, about_text, about_image, primary_color, accent_color, background_color, updated_at')
      .limit(1)
      .maybeSingle(); 
    
    if (error) {
      console.warn("Error fetching settings (likely missing columns):", error.message);
      // Try again with even more basic select if first one fails
      const { data: basicData, error: basicError } = await supabase
        .from('site_settings')
        .select('id, hero_title_part1, hero_title_part2, hero_image, about_image')
        .limit(1)
        .maybeSingle();
      
      if (basicError) return null;
      return basicData as SiteSettings;
    }
    return data as SiteSettings;
  } catch (err) {
    console.error("Critical error in fetchSettings:", err);
    return null;
  }
}
