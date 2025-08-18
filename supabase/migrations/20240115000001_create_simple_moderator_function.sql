-- Create a simple function to create moderators
CREATE OR REPLACE FUNCTION create_simple_moderator(
  p_email TEXT,
  p_full_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Check if user already exists in profiles
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = p_email;
  
  -- If user doesn't exist, create a dummy user_id
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    -- Insert into profiles
    INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (v_user_id, p_email, p_full_name, 'moderator', NOW(), NOW());
  ELSE
    -- Update existing user to moderator role
    UPDATE profiles 
    SET role = 'moderator', 
        full_name = p_full_name,
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;
  
  -- Insert or update moderator record
  INSERT INTO moderators (user_id, email, full_name, created_by)
  VALUES (v_user_id, p_email, p_full_name, COALESCE(auth.uid(), v_user_id))
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
GRANT EXECUTE ON FUNCTION create_simple_moderator(TEXT, TEXT) TO authenticated;
