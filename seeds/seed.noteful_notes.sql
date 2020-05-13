TRUNCATE TABLE noteful_notes;

INSERT INTO noteful_notes (folder_id, name, content, date_modified)
VALUES
(1, 'Dogs', 'Dogs are pretty great!', '2019-01-03T00:00:00.000Z'),
(2, 'Cats', 'Cats are even better!', '2018-08-15T23:00:00.000Z'),
(1, 'Snakes', 'Snakes like to slither!', '2018-03-01T00:00:00.000Z'),
(3, 'Elephants', 'But elephants are bigger!', '2019-01-04T00:00:00.000Z');
