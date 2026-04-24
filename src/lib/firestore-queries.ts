import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError } from './firebase';

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
  created_at: any;
  updated_at: any;
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
}

export interface SiteSettings {
  hero_title_part1: string;
  hero_title_part2: string;
  hero_quote?: string;
  contact_location: string;
  contact_email?: string;
  contact_phone?: string;
  instagram?: string;
  facebook?: string;
  about_text?: string;
  about_image?: string;
}

export async function fetchProjects() {
  try {
    const q = query(collection(db, "projects"), orderBy("sort_order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    handleFirestoreError(error, 'list', 'projects');
  }
}

export async function fetchProjectBySlug(slug: string) {
  try {
    const q = query(collection(db, "projects"), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const projectDoc = snapshot.docs[0];
    return { id: projectDoc.id, ...projectDoc.data() } as Project;
  } catch (error) {
    handleFirestoreError(error, 'get', `projects/${slug}`);
  }
}

export async function fetchServices() {
  try {
    const q = query(collection(db, "services"), orderBy("sort_order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
  } catch (error) {
    handleFirestoreError(error, 'list', 'services');
  }
}

export async function fetchShots(l?: number) {
  try {
    let q = query(collection(db, "shots"), orderBy("sort_order", "asc"));
    if (l) q = query(q, limit(l));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shot));
  } catch (error) {
    handleFirestoreError(error, 'list', 'shots');
  }
}

export async function fetchReviews() {
  try {
    const q = query(collection(db, "reviews"), orderBy("sort_order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error) {
    handleFirestoreError(error, 'list', 'reviews');
  }
}

export async function fetchSettings() {
  try {
    const docRef = doc(db, "site_settings", "global");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, 'get', 'site_settings/global');
  }
}
