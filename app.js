const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const { authJwt, jwtErrorHandler } = require('./utils/jwt');
const app = express();

const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');

const PORT = process.env.PORT || 3000;

// middleware
require('dotenv/config');
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
app.use(authJwt());
app.use(jwtErrorHandler);
app.options('*', cors());

// Routes
const api = process.env.API_URL;

app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

// MongoDB Server
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
