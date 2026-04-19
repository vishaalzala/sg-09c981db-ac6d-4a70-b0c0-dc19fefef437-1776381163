ALTER TABLE wof_inspections ALTER COLUMN inspection_type DROP NOT NULL;
ALTER TABLE wof_inspections ALTER COLUMN inspector_id DROP NOT NULL;
ALTER TABLE wof_inspections ALTER COLUMN overall_result DROP NOT NULL;