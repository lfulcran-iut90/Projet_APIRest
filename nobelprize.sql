DROP TABLE IF EXISTS Laureate_Prizes;
DROP TABLE IF EXISTS laureates;
DROP TABLE IF EXISTS Prizes;
DROP TABLE IF EXISTS Categories;




CREATE TABLE Categories (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Prizes (
                        id SERIAL PRIMARY KEY,
                        year VARCHAR(4),
                        category_id INT REFERENCES Categories(id),
                        UNIQUE(year, category_id)
);

CREATE TABLE Laureates (
                           laureate_id SERIAL PRIMARY KEY,
                           firstname VARCHAR(100),
                           surname VARCHAR(100),
                           motivation TEXT,
                           share INT,
                           prize_id INT REFERENCES Prizes(id)
);

CREATE TABLE Laureate_Prizes (
                                 laureate_id INT REFERENCES Laureates(laureate_id),
                                 prize_id INT REFERENCES Prizes(id),
                                 PRIMARY KEY (laureate_id, prize_id)
);

ALTER TABLE Laureates DROP COLUMN prize_id;
ALTER TABLE Laureate_Prizes ALTER COLUMN laureate_id TYPE INTEGER USING laureate_id::INTEGER;
ALTER TABLE Laureate_Prizes ALTER COLUMN prize_id TYPE INTEGER USING prize_id::INTEGER;

