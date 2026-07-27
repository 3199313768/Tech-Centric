-- all_projects: global display order for archive drag-and-drop
alter table public.all_projects
  add column if not exists sort_order integer;

-- Backfill: public first, then newer created_at first, then id
with ranked as (
  select
    id,
    (row_number() over (
      order by is_public desc, created_at desc, id asc
    ) - 1)::integer as sort_order
  from public.all_projects
)
update public.all_projects as p
set sort_order = ranked.sort_order
from ranked
where p.id = ranked.id
  and (p.sort_order is distinct from ranked.sort_order);

alter table public.all_projects
  alter column sort_order set not null;

alter table public.all_projects
  alter column sort_order set default 0;

create index if not exists all_projects_sort_order_idx
  on public.all_projects (sort_order);
