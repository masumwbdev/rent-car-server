const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qr0wp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("rent-car");
        const servicesCollection = database.collection("services");
        const bookingsCollection = database.collection("bookings");
        const addReviewsCollection = database.collection("add-reviews");
        const usersCollection = database.collection("users");


        // +++++++++++++++ START APIS +++++++++++++++++++

        // ---------- SERVICES API -----------

        // services get
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const service = await cursor.toArray();
            res.send(service);
        })

        // get single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        })

        // service post
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        })

        // add new service
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result)
        })


        // ---------- BOOKING API -----------

        // get bookings
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = bookingsCollection.find(query);
            const booking = await cursor.toArray();
            res.json(booking);
        })

        // post bookings
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.json(result);
        })

        // delete booking
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        })


        // ---------- REVIEWS API -----------

        // add reviews get
        app.get('/add-reviews', async (req, res) => {
            const cursor = addReviewsCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })

        // add reviews post
        app.post('/add-reviews', async (req, res) => {
            const review = req.body;
            const result = await addReviewsCollection.insertOne(review);
            res.json(result);
        })


        // ---------- USERS API -----------

        // post users ( for email and password auth )
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        // put users > upsert > ( for google auth )
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const filter = { email: user.email };
            const options = {upsert : true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        // put make admin
        app.put('/users/admin', async(req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // get users > make admin after checking role on email
        app.get('/users/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })


        // +++++++++++++++ END APIS +++++++++++++++++++



    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})