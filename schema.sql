DROP TABLE IF EXISTS harry;

CREATE TABLE harry (
    id SERIAL PRIMARY KEY,
    name  VARCHAR(255),
    House VARCHAR(255),
    patronus VARCHAR(255),
    is_alive BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(255)
)

