const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb')

const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p2nrx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        console.log('Database connected successfully');

        const database = client.db('sailorBoatStore');
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.limit(6).toArray();
            res.json(products);

        })

        // get for explore page
        app.get('/explore', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.json(products);
        })

        // get reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        })

        // get for specific product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const qurey = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(qurey);
            res.json(result);
        })

        // post method for insert order 
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        })

        // for admin check (if user role property is admin ,set admin is true)
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            // after find users check role property
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // get myorders by findining with email
        app.get('/myorder/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const myOrder = await orderCollection.find(query).toArray();
            // const result = await myOrder.toArray(myOrder)

            res.json(myOrder);
        })

        // post user review to db
        app.post('/review', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await reviewsCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        })

        // delete my order

        app.delete('/myorder/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { productId: id };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

        // add user in db usersCollection
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        })

        // users role update for admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;

            console.log('put', req.body);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Sailor Boat Store!')
})

app.listen(port, () => {
    console.log(`listening at:${port}`)
})