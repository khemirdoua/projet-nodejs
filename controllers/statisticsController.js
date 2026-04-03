const Invoice = require('../models/Invoice');
const RecoveryAction = require('../models/RecoveryAction');
const Client = require('../models/Client');

exports.getStatistics = async (req, res, next) => {
  try {
    // Invoice stats
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'Payée' });
    const unpaidInvoices = totalInvoices - paidInvoices;

    // Recovery action stats
    const totalRecoveryActions = await RecoveryAction.countDocuments();
    const completedActions = await RecoveryAction.countDocuments({ status: 'completed' });
    const pendingActions = await RecoveryAction.countDocuments({ status: 'pending' });

    // Actions per client (optional)
    const actionsPerClient = await RecoveryAction.aggregate([
      {
        $group: {
          _id: '$clientId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $project: {
          _id: 0,
          clientId: '$_id',
          clientName: { $arrayElemAt: ['$client.name', 0] },
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      totalRecoveryActions,
      completedActions,
      pendingActions,
      actionsPerClient
    });
  } catch (error) {
    next(error);
  }
};
