-- Harden set_updated_at search_path
create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at := now(); return new; end; $$;

-- Tighten public bookings insert policy
drop policy if exists "bookings_public_insert" on public.bookings;
create policy "bookings_public_insert_limited" on public.bookings
  for insert
  with check (
    char_length(name)  between 1 and 120 and
    char_length(email) between 3 and 200 and
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and
    (phone   is null or char_length(phone)   <= 50) and
    (service is null or char_length(service) <= 120) and
    (message is null or char_length(message) <= 2000)
  );

-- Seed services
insert into public.services (title, description, tags, image, sort_order) values
('პორტრეტული ფოტოგრაფია', 'დააფიქსირეთ თქვენი საუკეთესო მხარეები მარადიული, პროფესიონალური პორტრეტებით.',
  '["Headshot","ახლო პლანი","კორპორატიული"]'::jsonb,
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1600&q=80', 1),
('ღონისძიებები და გარე გადაღება', 'თქვენი ღონისძიებების ენერგიის დაფიქსირება პროფესიონალური გაშუქებით.',
  '["დღესასწაულები","კონცერტები","ქუჩის სტილი"]'::jsonb,
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80', 2),
('ოჯახური სესიები', 'თქვენი ყველაზე ძვირფასი ოჯახური მომენტების მარადიული შენახვა.',
  '["ახალშობილი","დღესასწაული","ორსულობა"]'::jsonb,
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1600&q=80', 3),
('ფოტო რეტუშირება და დამუშავება', 'პროფესიონალური დამუშავება, რომელიც აუმჯობესებს ფოტოს ავთენტურობის შეცვლის გარეშე.',
  '["ფერები","კანი","კომერციული"]'::jsonb,
  'https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=1600&q=80', 4),
('ბრენდი და კომერციული ფოტოგრაფია', 'ხარისხიანი ვიზუალი, რომელიც ყვება თქვენი ბრენდის უნიკალურ ისტორიას.',
  '["პროდუქტები","ლაიფსტაილი","მოდა"]'::jsonb,
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80', 5);

-- Seed projects
insert into public.projects (slug, title, category, description, cover_image, gallery, date_label, featured, sort_order) values
('denim-reimagined', 'დენიმის ახალი ხედვა', 'მოდის ედიტორიალი',
 'დენიმის ახალი ხედვა — მოდის ედიტორიალი, რომელიც იკვლევს დენიმს ტრადიციული ფორმის მიღმა. პროექტი ხაზს უსვამს კრეატიულობას, ტექსტურას და მრავალფეროვნებას.',
 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=85',
 '["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=85","https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1800&q=85","https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=85"]'::jsonb,
 'იანვარი 2026', true, 1),
('zoe-newborn', 'ზოის პირველი ნაბიჯები', 'ოჯახური სესიები',
 'ზოის პირველი ფოტო სესია ფოკუსირებულია მისი ცხოვრების ადრეული მომენტების დაფიქსირებაზე — მშვიდ, მყუდრო გარემოში რბილი ბუნებრივი განათებით.',
 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=1800&q=85',
 '["https://images.unsplash.com/photo-1544126592-807ade215a0b?w=1800&q=85","https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1800&q=85"]'::jsonb,
 'დეკემბერი 2025', true, 2),
('morning-in-motion', 'დილა მოძრაობაში', 'გარე ლაიფსტაილი',
 'მზის ამოსვლის ლაიფსტაილ გადაღება ბუნებრივი განათებით და გულწრფელი ემოციებით.',
 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=1800&q=85',
 '["https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=1800&q=85","https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&q=85"]'::jsonb,
 'ნოემბერი 2025', true, 3),
('gaia-essence', 'Gaia Essence — კანის მოვლა', 'ბრენდი და კომერციული',
 'ბრენდზე ორიენტირებული ედიტორიალი, შთაგონებული ბუნებით, სითბოთი და ორგანული სილამაზით.',
 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1800&q=85',
 '["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1800&q=85","https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1800&q=85"]'::jsonb,
 'ოქტომბერი 2025', false, 4);

-- Seed shots
insert into public.shots (url, sort_order) values
('https://images.unsplash.com/photo-1502720433255-614171a1835e?w=1400&q=80', 1),
('https://images.unsplash.com/photo-1488161628813-04466f872be2?w=1400&q=80', 2),
('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1400&q=80', 3),
('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=80', 4),
('https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=1400&q=80', 5),
('https://images.unsplash.com/photo-1496440737103-cd596325d314?w=1400&q=80', 6),
('https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=1400&q=80', 7),
('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1400&q=80', 8),
('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1400&q=80', 9),
('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1400&q=80', 10),
('https://images.unsplash.com/photo-1463453091185-61582044d556?w=1400&q=80', 11),
('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1400&q=80', 12),
('https://images.unsplash.com/photo-1549221987-25a490f65d34?w=1400&q=80', 13),
('https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=1400&q=80', 14),
('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=80', 15),
('https://images.unsplash.com/photo-1604608672516-f1b9b1d1ce8a?w=1400&q=80', 16),
('https://images.unsplash.com/photo-1611042553365-9b101441c135?w=1400&q=80', 17),
('https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=1400&q=80', 18),
('https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1400&q=80', 19),
('https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=1400&q=80', 20),
('https://images.unsplash.com/photo-1502780402662-acc01917c8e2?w=1400&q=80', 21),
('https://images.unsplash.com/photo-1495368308839-a1bd2c0e5ce8?w=1400&q=80', 22),
('https://images.unsplash.com/photo-1517677129300-07b130802f46?w=1400&q=80', 23),
('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80', 24);

-- Seed reviews
insert into public.reviews (name, role, text, image, rating, sort_order) values
('სარა კ.', 'ღონისძიების კლიენტი',
 'ნინოსთან მუშაობა ნამდვილი სიამოვნება იყო. მისი ყურადღება დეტალებისადმი, კრეატიულობა და გულწრფელი ემოციების დაფიქსირების უნარი ყოველ კადრს აცოცხლებს.',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', 5.0, 1),
('ვატო ჯ.', 'ივენთ ფლანერი',
 'ნინოსთან თანამშრომლობა საოცარი გამოცდილება იყო. კრეატიულობა და ნამდვილი მომენტების დაჭერის ნიჭი მის ნამუშევრებში აშკარად ჩანს.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', 5.0, 2),
('ჯეიდ ო.', 'მოდელი',
 'ნინოს მიერ გადაღებული ფოტოები ყოველთვის განსაკუთრებულია. მისი ხედვა და ავთენტური გამომეტყველებისკენ სწრაფვა საუკეთესო შედეგს იძლევა.',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', 4.5, 3);