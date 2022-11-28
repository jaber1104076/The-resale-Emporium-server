const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const app = express()

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wbco2uz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run() {
    try {
        const productsCollection = client.db('ResaleEmporium').collection('products');
        const catagoryCollection = client.db('ResaleEmporium').collection('catagory');
        const bookingsCollection = client.db('ResaleEmporium').collection('bookings');
        const usersCollection = client.db('ResaleEmporium').collection('users');
        const addProductsCollection = client.db('ResaleEmporium').collection('addProducts');
        const paymentsCollection = client.db('ResaleEmporium').collection('payments');
        const advertiseCollection = client.db('ResaleEmporium').collection('advertise');

        //admin verify
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

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

        app.get('/allcatagory', async (req, res) => {
            const query = {}
            const result = await catagoryCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/catagories/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await catagoryCollection.findOne(filter)
            res.send(result)
        })

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        app.post('/bookings', verifyJWT, async (req, res) => {
            const query = req.body
            const result = await bookingsCollection.insertOne(query)
            res.send(result)

        })

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;

            // Step- 05 (jwt)
            // console.log('token', req.headers.authorization);

            // Step- 07 (jwt)
            const decodedEmail = req.decoded.email;
            // console.log(decodedEmail);

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { email: email }
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await bookingsCollection.findOne(filter)
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const query = req.body;
            const result = await usersCollection.insertOne(query)
            res.send(result)
        })

        app.get('/myorder', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const result = await bookingsCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
        app.post('/addproducts', async (req, res) => {
            const query = req.body;
            const result = await addProductsCollection.insertOne(query)
            res.send(result)
        })
        app.get('/myproducts', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const result = await addProductsCollection.find(query).toArray()
            res.send(result)
        })
        // app.get('/myproducts/:id', verifyJWT, async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) }
        //     const result = await addProductsCollection.findOne(query)
        //     res.send(result)
        // })
        app.delete('/myproducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await addProductsCollection.deleteOne(filter);
            res.send(result);
        });
        app.post('/advertise', async (req, res) => {
            const query = req.body;
            const users = await advertiseCollection.insertOne(query)
            res.send(users)
        })
        app.get('/advertise', async (req, res) => {
            const query = {}
            const result = await advertiseCollection.find(query).toArray()
            res.send(result)
        })
        //STEP-2
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

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