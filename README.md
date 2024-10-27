# Make sure database running as per IST
alter database postgres
set timezone to 'Asia/Kolkata';

ALTER TABLE "OLHCEntity"
ADD CONSTRAINT unique_interval_date_sec_id
UNIQUE (interval, date, sec_id);