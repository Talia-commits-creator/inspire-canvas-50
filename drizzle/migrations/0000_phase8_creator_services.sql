create type public.service_pricing_type as enum ('fixed', 'starting_from', 'contact');

create table public.services (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.creator_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category_id uuid not null references public.creative_categories(id),
  pricing_type public.service_pricing_type not null,
  price numeric(10, 2),
  currency text not null default 'EUR',
  turnaround_days integer,
  visibility public.creator_visibility not null default 'public',
  position integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint services_title_length check (char_length(title) between 3 and 100),
  constraint services_description_length check (char_length(description) between 1 and 1200),
  constraint services_price_rules check (
    (pricing_type in ('fixed', 'starting_from') and price is not null and price >= 0)
    or (pricing_type = 'contact' and price is null)
  ),
  constraint services_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint services_turnaround_range check (
    turnaround_days is null or turnaround_days between 1 and 365
  )
);

grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;

alter table public.services enable row level security;

create policy "Creators manage their own services"
on public.services
for all
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.creator_profiles p
    where p.id = services.creator_profile_id
      and p.user_id = auth.uid()
  )
);

create policy "Public services are viewable by everyone"
on public.services
for select
to anon, authenticated
using (
  visibility = 'public'::creator_visibility
  and exists (
    select 1
    from public.creator_profiles p
    where p.id = services.creator_profile_id
      and p.visibility = 'public'::creator_visibility
  )
);

create index services_creator_profile_id_idx on public.services (creator_profile_id);
create index services_user_id_idx on public.services (user_id);
create index services_category_id_idx on public.services (category_id);
create index services_public_order_idx
  on public.services (creator_profile_id, position asc, created_at desc)
  where visibility = 'public'::creator_visibility;

create trigger services_set_updated_at
before update on public.services
for each row
execute function set_updated_at();

create or replace function public.get_public_services(_username text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.position asc, t.created_at desc), '[]'::jsonb)
  from (
    select s.id, s.title, s.description, s.pricing_type, s.price, s.currency,
           s.turnaround_days, s.position, s.created_at,
           (select jsonb_build_object('slug', c.slug, 'name', c.name)
              from public.creative_categories c
             where c.id = s.category_id) as category
    from public.services s
    join public.creator_profiles cp on cp.id = s.creator_profile_id
    join public.profiles p on p.id = cp.user_id
    where lower(p.username) = lower(btrim(_username))
      and cp.visibility = 'public'::creator_visibility
      and s.visibility = 'public'::creator_visibility
    order by s.position asc, s.created_at desc
    limit 60
  ) t
$function$;

grant execute on function public.get_public_services(text) to anon, authenticated, service_role;