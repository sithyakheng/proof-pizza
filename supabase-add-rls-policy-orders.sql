-- Enable Row Level Security on orders table
alter table orders enable row level security;

-- Drop existing policy if it exists
drop policy if exists "Public can update order status" on orders;

-- Create policy to allow public updates to order status
create policy "Public can update order status"
  on orders for update
  using (true)
  with check (true);
