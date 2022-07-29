const express = require('express')
const dotenv = require('dotenv')
const expressGraphQL = require('express-graphql').graphqlHTTP
const schema = require('./schema')
const connectDB = require('./config/db')
dotenv.config({path: './config/config.env'})

const app = express()

app.use('/graphql', expressGraphQL({
    schema:schema,
    graphiql: true
}))

connectDB()

const PORT = process.env.PORT || 8000

app.listen(PORT, () => console.log(`server is running on port ${PORT}`))