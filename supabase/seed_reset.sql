-- VELVET SEED RESET — removes all demo seed data
-- Run this to clean up before a real launch

DO $$
DECLARE
  member_1_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567801';
  member_2_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567802';
  member_3_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567803';
  member_4_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567804';
  member_5_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567805';
  member_6_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567806';
  event_1_id  UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  event_2_id  UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678902';
  event_3_id  UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678903';
  conv_1_id   UUID := 'c3d4e5f6-a7b8-9012-cdef-123456789001';
  conv_2_id   UUID := 'c3d4e5f6-a7b8-9012-cdef-123456789002';
BEGIN

  DELETE FROM messages 
    WHERE conversation_id IN (conv_1_id, conv_2_id);
  
  DELETE FROM conversations 
    WHERE id IN (conv_1_id, conv_2_id);
  
  DELETE FROM event_rsvps 
    WHERE event_id IN (event_1_id, event_2_id, event_3_id);
  
  DELETE FROM events 
    WHERE id IN (event_1_id, event_2_id, event_3_id);
  
  DELETE FROM invites 
    WHERE code IN ('PRIYA001', 'MARCUS08');
  
  DELETE FROM profiles 
    WHERE id IN (
      member_1_id, member_2_id, member_3_id,
      member_4_id, member_5_id, member_6_id
    );

  -- 6. Delete Auth Users (This will cascade to profiles if cascade is set, but we delete profiles explicitly above just in case)
  DELETE FROM auth.users WHERE id IN (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567804',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567805',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567806'
  );
END $$;
