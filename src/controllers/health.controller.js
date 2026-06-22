/**
 * Health controller — liveness endpoint for uptime checks and orchestrators
 * (load balancers, container health probes).
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
