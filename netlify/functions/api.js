const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_ENDPOINT,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET' || event.path !== '/.netlify/functions/api/api/stock-data') {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: '接口路径或方法不匹配' })
    };
  }

  try {
    const data = await redis.get('stock:latest');
    return {
      statusCode: 200,
      body: JSON.stringify({ data })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Redis操作失败', details: err.message })
    };
  }
};
