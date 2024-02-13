
\c quotes; -- Connect to the newly created database

DROP TABLE vol_entry;

-- Create a new table in the newly created database
CREATE TABLE vol_entry (
    id SERIAL PRIMARY KEY,
    ticker TEXT NOT NULL,
    creation BIGINT NOT NULL,
    price NUMERIC NOT NULL,
    putVol NUMERIC DEFAULT 0,
    callVol NUMERIC DEFAULT 0,
    putOI NUMERIC DEFAULT 0,
    callOI NUMERIC DEFAULT 0,
    entries JSONB
);
