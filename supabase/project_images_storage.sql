-- Execute uma vez no SQL Editor do Supabase para permitir fotos privadas por usuário.
create policy "project images upload own" on storage.objects for insert to authenticated
with check (bucket_id = 'project-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "project images read own" on storage.objects for select to authenticated
using (bucket_id = 'project-images' and (storage.foldername(name))[1] = auth.uid()::text);
