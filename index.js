const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const productsCollection = client.db('ResaleEmporium').collection('products');
        const catagoryCollection = client.db('ResaleEmporium').collection('catagory');
        const bookingsCollection = client.db('ResaleEmporium').collection('bookings');
        const usersCollection = client.db('ResaleEmporium').collection('users');


        app.get('/products', async (req, res) => {
            const query = {}
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/catagory/:name', async (req, res) => {
            const name = req.params.name
            const filter = { name }
            const result = await catagoryCollection.find(filter).toArray()
            res.send(result)
        })

        app.get('/catagories/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const filter = { _id: ObjectId(id) }
            const result = await catagoryCollection.findOne(filter)
            res.send(result)
        })
        app.post('/bookings', async (req, res) => {
            const query = req.body
            const result = await bookingsCollection.insertOne(query)
            res.send(result)

        })

        app.post('/users', async (req, res) => {
            const query = req.body;
            const result = await usersCollection.insertOne(query)
            res.send(result)
        })
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