-- Create a function to create moderators
CREATE OR REPLACE FUNCTION create_moderator(
  p_email TEXT,
  p_full_name TEXT,
  p_password TEXT DEFAULT 'defaultpassword123',
  p_created_by UUID DEFAULT auth.uid()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  -- If user doesn't exist, create new user
  IF v_user_id IS NULL THEN
    -- Create user in auth.users (this will trigger the trigger to create profile)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmed_at,
      email_change_confirm_status,
      banned_until,
      reauthentication_sent_at,
      last_sign_in_at,
      app_metadata,
      user_metadata,
      factors,
      identities
    ) VALUES (
      (SELECT id FROM auth.instances LIMIT 1),
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      p_email,
      crypt(p_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('full_name', p_full_name),
      FALSE,
      NOW(),
      0,
      NULL,
      NULL,
      NULL,
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('full_name', p_full_name),
      '[]',
      '[]'
    ) RETURNING id INTO v_user_id;
  END IF;
  
  -- Update profile to moderator role
  UPDATE profiles 
  SET role = 'moderator', 
      updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Insert or update moderator record
  INSERT INTO moderators (user_id, email, full_name, created_by)
  VALUES (v_user_id, p_email, p_full_name, p_created_by)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  -- Return success result
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Moderator created successfully',
    'user', jsonb_build_object(
      'id', v_user_id,
      'email', p_email,
      'full_name', p_full_name
    )
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    v_result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create moderator'
    );
    
    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_moderator(TEXT, TEXT, TEXT, UUID) TO authenticated;

-- Create policy to allow admins to execute this function
CREATE POLICY "Admins can create moderators" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
