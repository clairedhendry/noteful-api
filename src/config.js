module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: 'postgres://vjaagzarspowdw:172a73d712a54c1b99c56cb81ef5d6772035ebb1cf3593bb5d774cd4df875aad@ec2-3-223-21-106.compute-1.amazonaws.com:5432/d6r33p0a8vtu4g',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/noteful-test'
}