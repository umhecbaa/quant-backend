const express = require('express');
const Redis = require('ioredis');
const server = express();

// 配置Redis连接
const redis = new Redis({
  host: process.env.REDIS_ENDPOINT,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// 定义/api/stock-data接口
server.get('/api/stock-data', async (req, res) => {
  try {
    const data = await redis.get('stock:latest');
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Redis连接或数据获取失败', details: err.message });
  }
});

// 适配Netlify Function的导出
exports.handler = server;
