const express = require('express');
const Redis = require('ioredis');
const app = express();

// 配置Redis连接
const redis = new Redis({
  host: process.env.REDIS_ENDPOINT,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// 定义/api/stock-data接口
app.get('/api/stock-data', async (req, res) => {
  try {
    const data = await redis.get('stock:latest');
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Redis操作失败', details: err.message });
  }
});

// 适配Netlify Function的请求处理逻辑
exports.handler = async (event, context) => {
  // 构造Express兼容的请求对象
  const req = {
    method: event.httpMethod,
    url: event.path,
    query: event.queryStringParameters,
    body: event.body,
    headers: event.headers
  };

  // 构造Express兼容的响应对象，并捕获结果
  const res = {
    statusCode: 200,
    headers: {},
    body: ''
  };

  // 让Express处理请求
  await new Promise((resolve) => {
    app(req, res, resolve);
  });

  // 转换为Netlify Function的响应格式
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body
  };
};
