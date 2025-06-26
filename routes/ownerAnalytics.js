const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const moment = require('moment');
const { ensureOwnerAuthenticated } = require('../middleware/auth');

router.get('/dashboard/analytics', ensureOwnerAuthenticated, (req, res) => {
  res.render('owners/dashboard/analytics');
});

// API to get last 7 days revenue data
router.get('/api/revenue-last-7-days', ensureOwnerAuthenticated, async (req, res) => {
  try {
    const ownerId = req.user._id;

    const today = moment().startOf('day');
    const sevenDaysAgo = moment(today).subtract(6, 'days');

    const orders = await Order.aggregate([
      {
        $match: {
          restaurant: ownerId,
          createdAt: {
            $gte: sevenDaysAgo.toDate(),
            $lte: moment().endOf('day').toDate()
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days
    const revenueMap = {};
    orders.forEach(order => {
      revenueMap[order._id] = order.totalRevenue;
    });

    const labels = [];
    const revenue = [];

    for (let i = 0; i < 7; i++) {
      const dateISO = moment(sevenDaysAgo).add(i, 'days').format('YYYY-MM-DD');
      const dateFormatted = moment(sevenDaysAgo).add(i, 'days').format('DD-MM-YYYY');
      labels.push(dateFormatted);
      revenue.push(revenueMap[dateISO] || 0);
    }

    res.json({ labels, revenue });

  } catch (err) {
    console.error('Revenue fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
