const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('needs arguments PASSWORD (NAME NUMBER)');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://testuser:${password}@cluster1.ali4d.mongodb.net/test?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length < 4) {
  Person.find({}).then((persons) => {
    persons.forEach((p) => {
      console.log(p.name, p.number);
    });
    mongoose.connection.close();
    process.exit(0);
  });
} else if (process.argv.length > 4) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  person.save().then((response) => {
    console.log(`Added ${person.name} number ${person.number} to phonebook`);
    mongoose.connection.close();
  });
}
