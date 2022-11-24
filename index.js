const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000

const app = express()

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wbco2uz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {


    }

    finally {

    }

}
run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send(`The Resale Emporium is running on ${port}`)
})

app.listen(port, () => {
    console.log(`The Resale Emporium server is running on ${port}`)
})