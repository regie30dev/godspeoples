/**
 * Health controller — temporary endpoint to confirm the server is runnable.
 * Replace/extend with real domain controllers as features are added.
 */

const getHealth = (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'be-god-peoples',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
};

export default { getHealth };
