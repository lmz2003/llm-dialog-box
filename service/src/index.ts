import express from 'express';
import { streamingChat } from '../Coze/Coze';
import cors from 'cors';
const app = express();
const port = 3000;
// 使用 CORS 中间件
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { query } = req.body;
  try {
    await streamingChat((data) => {
      res.write(JSON.stringify(data));
    }, query);
    res.end();
  } catch (error: any) {
    res.status(500).send((error as Error).message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});