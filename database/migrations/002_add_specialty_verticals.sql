-- Add new isolated verticals without rewriting an already-applied migration.
ALTER TABLE organization_verticals
  DROP CONSTRAINT organization_verticals_vertical_check;

ALTER TABLE organization_verticals
  ADD CONSTRAINT organization_verticals_vertical_check CHECK (
    vertical IN (
      'restaurant', 'supermarket', 'pharmacy', 'legal', 'beauty_wellness',
      'field_services', 'retail_commerce', 'franchise_hq', 'veterinary',
      'auto_repair', 'building_supply', 'vehicle_dealership'
    )
  );
