const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');

const url = process.env.MONGODB_URI;

console.log('connecting to', url);
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((result) => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: { unique: true, type: String, required: true, minLength: 3 },
  number: { required: true, type: String, minLength: 8 },
});

personSchema.plugin(mongooseUniqueValidator);

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
