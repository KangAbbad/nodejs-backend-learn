const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Order } = require('../models/order');
const { OrderItem } = require('../models/orderItem');
const { Product } = require('../models/product');

router.get('/', (req, res) => {
  const { fields, orderId, userId } = req.query;
  const selectFields = fields ? fields.split(',').join(' ') : '';
  const find = {};
  if (orderId) find._id = orderId;
  if (userId) find.user = userId;

  Order
    .find(find)
    .populate({
      path: 'orderItems',
      populate: {
        path: 'product',
        populate: 'category',
      },
    })
    .populate('user', '-password')
    .select(selectFields)
    .sort({ dateCreated: -1 })
    .then((orderList) => {
      const response = {
        data: [],
        status: 200,
        error: null,
      };

      if (orderId) {
        if (orderList.length) {
          response.data = orderList[0];
        } else {
          response.data = null;
        }
      } else {
        response.data = orderList;
      }

      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json({
        data: [],
        status: 500,
        error,
      });
    });
});

router.get('/total-sales', (req, res) => {
  Order
    .aggregate([{
      $group: {
        _id: null,
        totalSales: {
          $sum: '$totalPrice',
        },
      },
    }])
    .then((sales) => {
      const { totalSales } = sales.pop();
      res.status(201).json({
        data: { totalSales },
        status: 201,
        error: null,
      });
    })
    .catch((error) => {
      res.status(500).json({
        data: null,
        status: 500,
        error,
      });
    });
});

router.post('/', (req, res) => {
  const orderItemsIds = Promise.all(req.body.orderItems.map((orderItem) => {
    const newOrderItem = new OrderItem({
      product: orderItem.product,
      quantity: orderItem.quantity,
    });

    return newOrderItem.save().then((createdOrderItem) => createdOrderItem.id);
  }));

  const summaryPrice = Promise.all(req.body.orderItems.map(async (orderItem) => {
    const product = await Product.findById(orderItem.product);
    return product.price * orderItem.quantity;
  }));

  summaryPrice.then((price) => {
    const totalPrice = price.reduce((acc, curr) => acc + curr, 0);

    orderItemsIds
      .then((ids) => {
        const newOrder = new Order({
          orderItems: ids,
          shippingAddress1: req.body.shippingAddress1,
          shippingAddress2: req.body.shippingAddress2,
          city: req.body.city,
          zip: req.body.zip,
          country: req.body.country,
          phone: req.body.phone,
          status: req.body.status,
          totalPrice: totalPrice,
          user: req.body.user,
        });

        newOrder.save()
          .then((order) => {
            res.status(201).json({
              data: order,
              status: 201,
              error: null,
            });
          })
          .catch((error) => {
            res.status(500).json({
              data: null,
              status: 500,
              error: error,
            });
          });
      })
      .catch((error) => {
        res.status(500).json({
          data: null,
          status: 500,
          error,
        });
      });
  });
});

router.put('/status-update', (req, res) => {
  if (!mongoose.isValidObjectId(req.query.orderId)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid order id!',
    });
  } else {
    Order
      .findByIdAndUpdate(
        req.query.orderId,
        { status: req.body.status },
        { new: true },
      )
      .then((order) => {
        res.status(200).json({
          data: {
            id: order.id,
            status: order.status,
          },
          status: 200,
          error: null,
        });
      })
      .catch((error) => {
        res.status(500).json({
          data: null,
          status: 500,
          error,
        });
      });
  }
});

router.delete('/', (req, res) => {
  if (!mongoose.isValidObjectId(req.query.orderId)) {
    res.status(400).send({
      data: null,
      status: 400,
      error: 'Invalid order id!',
    });
  } else {
    Order
      .findByIdAndRemove(req.query.orderId)
      .then((order) => {
        const deletedOrderItems = Promise.all(order.orderItems.map((orderItem) => {
          return OrderItem.findByIdAndRemove(orderItem).then((item) => item);
        }));

        deletedOrderItems
          .then(() => {
            res.status(200).json({
              data: {
                message: `Order id ${order.id} is successfully deleted!`,
              },
              status: 200,
              error: null,
            });
          })
          .catch((error) => {
            res.status(400).json({
              data: null,
              status: 400,
              error,
            });
          });
      })
      .catch((error) => {
        res.status(500).json({
          data: null,
          status: 500,
          error,
        });
      });
  }
});

module.exports = router;
