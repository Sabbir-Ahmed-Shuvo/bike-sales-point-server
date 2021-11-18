const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// connect to the database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shtpn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("bike-sales");
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");


    //add new product
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });

    // load all products
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({})
      const products = await cursor.toArray();
      res.json(products);
    });

    //load a single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const product = await productsCollection.findOne({ _id: ObjectId(id) });
      res.json(product);
    });

    //order a bike
    app.post("/order", async (req, res) => {
      const order = req.body
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    //my order
    app.get("/myOrder/:email", async (req, res) => {
      const email = req.params.email;
      const myOrder = await ordersCollection.find({ email: email }).toArray();
      res.json(myOrder);
    });

    //cancel a order
    app.delete("/remove/:id", async (req, res) => {
      const id = req.params.id;
      const result = await ordersCollection.deleteOne({ _id: ObjectId(id) });
      res.json(result);
    });

    // sent review
    app.post("/addReview", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // get reviews 
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find({}).toArray();
      res.json(reviews);
    });


    //get all orders
    app.get("/allOrders", async (req, res) => {
      const orders = await ordersCollection.find({}).toArray();
      res.json(orders);
    });

    // update status
    app.get("/allOrders/:id", async (req, res) => {
      const id = req.params.id;
      const result = await ordersCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
      console.log(result)
    });
    // status update
    app.put("/allOrders/:id", async (req, res) => {
      const id = req.params.id;
      const updateStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updateStatus.status,
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //remove a product 
    app.delete("/removeProducts/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productsCollection.deleteOne({ _id: ObjectId(id) });
      res.json(result);
    });


    // save a sign up user
    app.post("/saveUser", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });


    // get admin
    app.get("/saveUser/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email: email });
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // add admin
    app.put("/makeAdmin/:email", async (req, res) => {
      const email = req.params.email;
      const query = await usersCollection.findOne({ email: email });
      if (query) {
        const updatedDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await usersCollection.updateOne(query, updatedDoc);
        res.json(result);
      } else {
        res
          .status(403)
          .json({ message: "You do not have access to make admin" });
      }
    });


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// check the server is running or not
app.get("/", (req, res) => {
  res.send("Server successfully running");
});

app.listen(port, () => {
  console.log("listening on port", port);
});
