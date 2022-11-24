const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000

const app = express()

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send(`The Resale Emporium is running on ${port}`)
})

app.listen(port, () => {
    console.log(`The Resale Emporium server is running on ${port}`)
})