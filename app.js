const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');

const PORT = process.env.PORT || 3000;

// middleware
require('dotenv/config');
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());

// Routes
const api = process.env.API_URL;

app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);

// Server
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log('Database connection is ready...');
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
