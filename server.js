const express = require('express');
const mongoose = require('mongoose');
const Fuse = require('fuse.js');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Correct MongoDB connection URI — fixed db name
mongoose.connect('mongodb://localhost:27017/customerservicedb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log(err));

// ✅ Schema must include the correct fields
const faqSchema = new mongoose.Schema({
  flags: String,
  instruction: String,
  category: String,
  intent: String,
  response: String,
});

const FAQ = mongoose.model('FAQ', faqSchema, 'faqs'); // ✅ Explicitly specify collection name

// ✅ Main route
app.post('/ask', async (req, res) => {
  const { question } = req.body;

  const faqs = await FAQ.find();

  const fuse = new Fuse(faqs, {
    keys: ['instruction'],
    threshold: 0.3
  });

  const result = fuse.search(question);

  if (result.length > 0) {
    res.json({ answer: result[0].item.response });
  } else {
    res.json({ answer: "Sorry, I couldn't find an answer." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
