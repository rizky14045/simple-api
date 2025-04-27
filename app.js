const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.set('view engine', 'ejs')
const PORT = 8000;

// Mock Database
const leads = [];
const users = [{ username: 'admin', password: bcrypt.hashSync('password123', 8) }]; // simple user

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Secret for JWT
const SECRET_KEY = 'your_secret_key';

// Authentication Middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send({ message: 'No token provided.' });

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(500).send({ message: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    next();
  });
}

// Routes
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).send({ message: 'Invalid credentials.' });
  }
  
  const token = jwt.sign({ id: username }, SECRET_KEY, { expiresIn: 86400 }); // 24 hours
  res.send({ token });
});

app.post('/leads', (req, res) => {
  const { name, phone, email, loanType } = req.body;
  if (!name || !phone || !email || !loanType) {
    return res.status(400).send({ message: 'All fields are required.' });
  }
  
  leads.push({ name, phone, email, loanType, createdAt: new Date() });
  res.send({ message: 'Lead stored successfully.' });
});

app.get('/leads', verifyToken, (req, res) => {
  res.send(leads);
});
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
