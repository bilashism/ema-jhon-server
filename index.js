const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.3ackybm.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});

const run = async () => {
  try {
    const database = client.db("emaJohn");
    const productsCollection = database.collection("products");

    // get all products
    app.get("/products", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      console.log(page, size);
      const query = {};
      const options = {};
      const cursor = productsCollection.find(query, options);
      const products = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();
      const count = await productsCollection.estimatedDocumentCount();
      res.send({ count, products });
    });

    app.post("/productsByIds", async (req, res) => {
      const ids = req.body;
      const objectIds = ids.map(id => ObjectId(id));
      const query = { _id: { $in: objectIds } };
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();

      res.send(products);
    });
  } catch (error) {
    console.error(error);
  } finally {
  }
};

run().catch(err => console.error(err));

app.listen(port, () => console.log(`Running on: ${port}`));

app.get("/", (req, res) => {
  res.sendStatus(200);
});
