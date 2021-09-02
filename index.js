const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const randomToken = require('random-token');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

function validateEmail(email) {
  const validEmailShape = /\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,6}\b/i;
  if (!validEmailShape.test(email)) return 'unvalid email format';
  if (!email || email === '') return 'undefined email';
  return 'valid email';
}

function validatePassword(password) {
  if (!password || password === '') return 'undefined password';
  if (password.length < 6) return 'password too short';
} 

app.get('/talker', (req, res) => {
  const talker = JSON.parse(fs.readFileSync('talker.json'));
  if (talker.length === 0) return res.json([]);
  res.json(talker);
});

app.get('/talker/:id', (req, res) => {
  const talker = JSON.parse(fs.readFileSync('talker.json'));
  const { id } = req.params;
  const selectedTalker = talker.find((t) => t.id === parseInt(id, 10));
  if (!selectedTalker) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  res.status(200).json(selectedTalker);
});

app.post('/login', (req, res) => {
   const { email, password } = req.body;
  if (validateEmail(email) === 'undefined email') {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  } if (validateEmail(email) === 'unvalid email format') {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (validatePassword(password) === 'password too short') {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (validatePassword(password) === 'undefined password') {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  return res.status(200).json({ token: randomToken(16) });
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
