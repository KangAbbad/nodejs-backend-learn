const expressJwt = require('express-jwt');
const { jwtUrlExeption } = require('./index');

function authJwt () {
  const apiUrl = process.env.API_URL;

  return expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
  }).unless({
    path: [
      {
        url: jwtUrlExeption(`${apiUrl}/products`),
        methods: ['GET', 'OPTIONS'],
      },
      {
        url: jwtUrlExeption(`${apiUrl}/categories`),
        methods: ['GET', 'OPTIONS'],
      },
      {
        url: `${apiUrl}/users/login`,
        methods: [],
      },
    ],
  });
}

function jwtErrorHandler (error, req, res, next) {
  if (error) {
    res.status(500).json({
      data: null,
      status: error.status,
      error,
    });
  }
}

module.exports = { authJwt, jwtErrorHandler };
