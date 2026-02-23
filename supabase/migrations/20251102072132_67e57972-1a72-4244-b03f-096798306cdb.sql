-- Enable realtime for generated_images table
ALTER TABLE generated_images REPLICA IDENTITY FULL;

-- Add generated_images to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE generated_images;