const express = require('express');
const Redis = require('ioredis');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// 从Netlify环境变量读取Redis和Tushare配置
const redis = new Redis({
  host: process.env.REDIS_ENDPOINT,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

const TUSHARE_TOKEN = process.env.TUSHARE_TOKEN;

// 示例接口：从Tushare拉取股票数据并缓存到Redis
app.get('/api/stock-data', async (req, res) => {
  try {
    // 先从Redis缓存读取
    const cachedData = await redis.get('stock:latest');
    if (cachedData) {
      return res.json({ data: JSON.parse(cachedData), source: 'redis' });
    }

    // 缓存未命中，调用Tushare API
    const response = await axios.get('https://api.tushare.pro', {
      params: {
        api_name: 'stock_basic',
        token: TUSHARE_TOKEN,
        fields: 'ts_code,symbol,name,area,industry,list_date'
      }
    });

    // 缓存到Redis（过期时间1小时）
    await redis.set('stock:latest', JSON.stringify(response.data), 'EX', 3600);
    res.json({ data: response.data, source: 'tushare' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
