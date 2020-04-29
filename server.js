const express = require('express')
const app = express()

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
}, () => console.log("While the (mon)goose is on the loose"));

const User = require('./model/User');
const Exercise = require('./model/Exercise');

app.use(cors())

app.use(express.urlencoded({
  extended: false
}))
app.use(express.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/exercise/new-user', (req, res) => {
  const user = new User({
    name: req.body.username
  });
  user.save()
    .then(res.json({
      user
    }))
    .catch(err, (err) => {
      console.log(err);
    });
});

app.get('/api/exercise/users', (req, res) => {
  
  User.find({}, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

app.post('/api/exercise/add', (req, res) => {
  let userId = req.body.userId;
  const exercise = new Exercise({
    userId: userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  });
  exercise.save()
    .then(
      User.findOneAndUpdate(
        {userId: userId}, {$push:{ exercises: exercise}}, { new:true }, (err, result) => {
          if(err){
            console.log(err);
          }
          return res.json(result);
        }
    ))
    // .catch(err, (err) => {
    //   console.log(err);
    // });
});

app.get('/api/exercise/log', (req, res) => {
  
  Exercise.find({}, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

app.get('/api/exercise/log/:userId', (req, res) => {
  const userId = req.params.userId;
  User.findOne({ userId : userId }).populate('exercises')
  .then((user) => {
    let {limit, from, to} = req.query;
    if(from){
      let fromDate = new Date(from);
      let exeFrom = user.exercises.filter(exe => new Date(exe.date) >= fromDate);
      return res.json(exeFrom);
    }
    else if(to){
      let toDate = new Date(to);
      let exeFrom = user.exercises.filter(exe => new Date(exe.date) <= toDate);
      return res.json(exeFrom);
    }
    else if(limit){
      let exeLimit = user.exercises.slice(0, +limit);
      return res.json(exeLimit);
    }
    else {
      return res.json(user);
    }
  })
});

// Not found middleware
app.use((req, res, next) => {
  return next({
    status: 404,
    message: 'not found'
  })
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is always listening on port ' + listener.address().port)
})