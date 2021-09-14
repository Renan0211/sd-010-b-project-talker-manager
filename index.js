const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const randomToken = require('random-token');

const talkerPath = './talker.json';

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

function validateEmail(email) {
  const validEmailShape = /\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,6}\b/i;
  if (email === undefined || email === '') return 'undefined email';
  if (!validEmailShape.test(email)) return 'unvalid email format';
  return 'valid email';
}

function validatePassword(password) {
  if (password === undefined || password === '') return 'undefined password';
  if (password.length < 6) return 'password too short';
} 

function validateToken(token) {
  const tokenRE = /\w{16}/;
  if (token === undefined) return { message: 'Token não encontrado' };
  if (!tokenRE.test(token)) return { message: 'Token inválido' };
  return true;
}

function validateName(name) {
  if (name === undefined || name === '') return { message: 'O campo "name" é obrigatório' };
  if (name.length < 3) return { message: 'O "name" deve ter pelo menos 3 caracteres' };
  return true;
}

function validateAge(age) {
  if (age === undefined || age === '') return { message: 'O campo "age" é obrigatório' };
  if (age < 18) return { message: 'A pessoa palestrante deve ser maior de idade' };
  return true;
}

function validateTalkValues(talk) {
  if (talk === undefined || talk.watchedAt === undefined || talk.rate === undefined) {
    return { message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' }; 
   }
  return true;
}

function validateTalk(talk) {
  if (validateTalkValues(talk) !== true) return validateTalkValues(talk);
  const dateRE = /^[0-3]\d\/[0-1]\d\/\d\d\d\d$/;
  if (!dateRE.test(talk.watchedAt)) {
    return { message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' };
  }

  // const rateRe = /^[0-5]$/;
  if (talk.rate > 5 || talk.rate < 1) {
    return { message: 'O campo "rate" deve ser um inteiro de 1 à 5' };
  }
  return true;
}

app.get('/talker', (req, res) => {
  const talker = JSON.parse(fs.readFileSync('talker.json'));
  if (talker.length === 0) return res.json([]);
  res.json(talker);
});

app.post('/talker', (req, res) => {
  const { authorization } = req.headers;
  const { name, age, talk } = req.body;
  if (validateToken(authorization) !== true) {
    return res.status(401).json(validateToken(authorization)); 
  }
  if (validateName(name) !== true) {
    return res.status(400).json(validateName(name));
  }
  if (validateAge(age) !== true) {
    return res.status(400).json(validateAge(age));
  }
  if (validateTalk(talk) !== true) return res.status(400).json(validateTalk(talk));
  const talkers = JSON.parse(fs.readFileSync(talkerPath));
  const lastId = talkers[talkers.length - 1].id;
  const newTalker = { id: lastId + 1, name, age, talk };
  talkers.push(newTalker);
  fs.writeFileSync(talkerPath, JSON.stringify(talkers));
  return res.status(201).json(newTalker);
});

app.get('/talker/:id', (req, res) => {
  const talker = JSON.parse(fs.readFileSync(talkerPath));
  const { id } = req.params;
  const selectedTalker = talker.find((t) => t.id === parseInt(id, 10));
  if (!selectedTalker) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  res.status(200).json(selectedTalker);
});

app.put('/talker/:id', (req, res) => {
  const { authorization } = req.headers;
  const { name, age, talk } = req.body;
  const { id } = req.params;
  const talkers = JSON.parse(fs.readFileSync(talkerPath));
  if (validateToken(authorization) !== true) {
    return res.status(401).json(validateToken(authorization));
  }
  if (validateName(name) !== true) {
    return res.status(400).json(validateName(name));
  }
  if (validateAge(age) !== true) {
    return res.status(400).json(validateAge(age));
  }
  if (validateTalk(talk) !== true) return res.status(400).json(validateTalk(talk));
  const talkerIndex = talkers.findIndex((t) => t.id === parseInt(id, 10));
   talkers[talkerIndex] = { id: parseInt(id, 10), name, age, talk };
   fs.writeFileSync(talkerPath, JSON.stringify(talkers));
   return res.status(200).json(talkers[talkerIndex]);
});

app.delete('/talker/:id', (req, res) => {
  const { authorization } = req.headers;
  const { id } = req.params;
  if (validateToken(authorization) !== true) {
    return res.status(401).json(validateToken(authorization));
  }

  const talkers = JSON.parse(fs.readFileSync(talkerPath));
  const newTalkers = talkers.filter((t) => t.id !== parseInt(id, 10));
  fs.writeFileSync(talkerPath, JSON.stringify(newTalkers));
  return res.status(200).json({ message: 'Pessoa palestrante deletada com sucesso' });
});

app.post('/login', (req, res) => {
   const { email, password } = req.body;
  if (validateEmail(email) === 'undefined email') {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  } if (validateEmail(email) === 'unvalid email format') {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (validatePassword(password) === 'password too short') {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  if (validatePassword(password) === 'undefined password') {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
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
