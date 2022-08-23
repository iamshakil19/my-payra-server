const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bqjy6zm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const bloodDonorCollection = client.db('payra').collection('donor-list')

        /* =======================
            ALL GET API
            ======================== */
        app.get('/donor-request', async (req, res) => {
            const status = "pending"
            const query = { status: status }
            const pendingRequest = (await bloodDonorCollection.find(query).toArray()).reverse()
            res.send(pendingRequest)
        })
        app.get('/verified-donor', async (req, res) => {
            const status = "verified"
            const query = { status: status }
            const verifiedDonor = await bloodDonorCollection.find(query).toArray()
            res.send(verifiedDonor)
        })

        /* =======================
            ALL POST API
            ======================== */
        app.post('/donor-request', async (req, res) => {
            const donorRequest = req.body;
            const result = await bloodDonorCollection.insertOne(donorRequest);
            res.send(result);
        })

        /* =======================
            ALL PATCH API
        ======================== */
        app.patch('/donorStatus/:id', async (req, res) => {
            const id = req.params.id;
            const donorInfo = req.body
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: donorInfo.status
                }
            }
            const updatedDonorInfo = await bloodDonorCollection.updateOne(filter, updateDoc)
            res.send(updateDoc)
        })

        /* =======================
            ALL DELETE API
        ======================== */
        app.delete('/donorRequest/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)}
            const result = await bloodDonorCollection.deleteOne(query)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('running payra server')
})
app.listen(port, () => {
    console.log("payra app listening to port", port);
})