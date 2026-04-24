import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seed() {
  console.log("Seeding site_settings...");
  await setDoc(doc(db, "site_settings", "global"), {
    hero_title_part1: 'NINO',
    hero_title_part2: 'Khikhidze',
    hero_quote: 'ფოტოგრაფია ჩემთვის მხოლოდ კადრი არაა, ეს არის წამიერი ემოცია, რომელიც სამუდამოდ რჩება.',
    contact_location: 'თბილისი, საქართველო',
    contact_email: 'Khikhadzenino2005@gmail.com',
    contact_phone: '+995 557 23 35 77',
    instagram: 'https://www.instagram.com/nkhikhadze/',
    about_text: 'ნინო ხიხიძე — დამოუკიდებელი ფოტოგრაფი თბილისიდან. 2024 წლიდან ვქმნი ვიზუალურ ისტორიებს, რომლებიც წამიერ ემოციას მარადიულ კადრად აქცევს.',
    updated_at: new Date().toISOString()
  });

  console.log("Site settings updated!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
