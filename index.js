const express = require('express');
const morgan = require('morgan');
morgan.token('body', function (req, res) {
  return JSON.stringify(req.body);
});

const app = express();

app.use(express.json());
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.body(req, res),
    ].join(' ');
  })
);
app.use(express.static('build'));
let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-523523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendick',
    number: '39-23-6423122',
  },
];
app.post('/api/persons', (req, res) => {
  newId = Math.floor(Math.random() * 100000);
  person = req.body;
  if (!person.name || !person.number) {
    res.status(500);
    res.json({ error: 'must include name and number' });
    return;
  }
  if (persons.find((p) => p.name === person.name)) {
    res.status(500);
    res.json({ error: 'name must be unique' });
    return;
  }
  person = { id: newId, ...person };
  persons = persons.concat(person);
  res.status(200);
  res.json(person);
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.delete('/api/persons/:id', (req, res) => {
  const person = persons.find((p) => p.id === Number(req.params.id));
  if (!person) {
    res.status(404);
    res.send('Not found');
  }
  persons = persons.filter((p) => p.id !== person.id);
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const person = persons.find((p) => p.id === Number(req.params.id));
  if (!person) {
    res.status(404);
    res.send('Not found');
  }
  res.json(person);
});

app.get('/info', (req, res) => {
  res.send(`Phonebook has info for ${persons.length} people <br/><br/>
  ${Date(Date.now()).toString()}`);
});

app.listen(process.env.PORT || 3001);
