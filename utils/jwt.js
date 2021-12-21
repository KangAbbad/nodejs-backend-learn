const expressJwt = require('express-jwt');
const { jwtUrlExeption } = require('./index');

function authJwt () {
  const apiUrl = process.env.API_URL;

  return expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    isRevoked,
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
        url: `${apiUrl}/users/register`,
        methods: ['POST'],
      },
      {
        url: `${apiUrl}/users/login`,
        methods: ['POST'],
      },
      {
        url: `${apiUrl}/orders`,
        methods: ['POST'],
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

function isRevoked (req, payload, done) {
  if (!payload.isAdmin) {
    done(null, true);
  }

  done();
}

module.exports = { authJwt, jwtErrorHandler };
