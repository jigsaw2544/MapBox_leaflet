create database Project;

-- create test

create table test(
    poly_id serial primary key,
    description varchar(255)
    geometry geometry(Polygon, 4326);
);

-- create poi 

create table poi(
    poly_id serial primary key,
    description varchar(255)
    geometry geometry(Polygon, 4326);
);

--Add column geometry

SELECT AddGeometryColumn ('test','geom',4326,'POINT',2);

--Delete column 

ALTER TABLE test
DROP COLUMN geometry;