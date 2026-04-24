create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create policy "user_roles_select_self_or_admin" on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "user_roles_admin_all" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  description text,
  cover_image text not null,
  gallery jsonb not null default '[]'::jsonb,
  date_label text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create policy "projects_public_read" on public.projects for select using (true);
create policy "projects_admin_write" on public.projects for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tags jsonb not null default '[]'::jsonb,
  image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.services enable row level security;
create trigger services_updated before update on public.services for each row execute function public.set_updated_at();
create policy "services_public_read" on public.services for select using (true);
create policy "services_admin_write" on public.services for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.shots (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.shots enable row level security;
create policy "shots_public_read" on public.shots for select using (true);
create policy "shots_admin_write" on public.shots for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  text text not null,
  image text,
  rating numeric(2,1) not null default 5.0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "reviews_public_read" on public.reviews for select using (true);
create policy "reviews_admin_write" on public.reviews for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create type public.booking_status as enum ('new','contacted','confirmed','done','cancelled');
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service text,
  message text,
  status booking_status not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.bookings enable row level security;
create policy "bookings_public_insert" on public.bookings for insert with check (true);
create policy "bookings_admin_read" on public.bookings for select to authenticated
  using (public.has_role(auth.uid(),'admin'));
create policy "bookings_admin_update" on public.bookings for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "bookings_admin_delete" on public.bookings for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));

create table public.site_settings (
  id text primary key default 'global',
  hero_title_part1 text not null default 'NINO',
  hero_title_part2 text not null default 'Khikhidze',
  hero_quote text,
  contact_location text not null default 'Tbilisi, Georgia',
  contact_email text,
  contact_phone text,
  instagram text,
  facebook text,
  about_text text,
  about_image text,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create trigger site_settings_updated before update on public.site_settings for each row execute function public.set_updated_at();
create policy "settings_public_read" on public.site_settings for select using (true);
create policy "settings_admin_write" on public.site_settings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.site_settings (id, hero_quote, contact_email, contact_phone, instagram, about_text)
values (
  'global',
  'ფოტოგრაფია ჩემთვის მხოლოდ კადრი არაა, ეს არის წამიერი ემოცია, რომელიც სამუდამოდ რჩება.',
  'hello@ninokhikhidze.com',
  '+995 555 12 34 56',
  'https://instagram.com/ninokhikhidze',
  'ნინო ხიხიძე — დამოუკიდებელი ფოტოგრაფი თბილისიდან. 2024 წლიდან ვქმნი ვიზუალურ ისტორიებს, რომლებიც წამიერ ემოციას მარადიულ კადრად აქცევს.'
);