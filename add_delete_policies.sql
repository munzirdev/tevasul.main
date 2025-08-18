-- إضافة سياسات الحذف المفقودة لجدول service_requests
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Users can delete their own service requests') THEN
        CREATE POLICY "Users can delete their own service requests" ON public.service_requests
            FOR DELETE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Admins can delete all service requests') THEN
        CREATE POLICY "Admins can delete all service requests" ON public.service_requests
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
                )
            );
    END IF;
END $$;

-- إضافة سياسات الحذف المفقودة لجدول file_attachments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_attachments' AND policyname = 'Users can delete their own file attachments') THEN
        CREATE POLICY "Users can delete their own file attachments" ON public.file_attachments
            FOR DELETE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_attachments' AND policyname = 'Admins can delete all file attachments') THEN
        CREATE POLICY "Admins can delete all file attachments" ON public.file_attachments
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
                )
            );
    END IF;
END $$;

-- التحقق من السياسات المضافة
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('service_requests', 'file_attachments')
ORDER BY tablename, policyname;
