const express = require('express')
const app = express()
const port = 4000

const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://sangheon:abcd1234@boiler-plate.v2rw8.mongodb.net/<dbname>?retryWrites=true&w=majority',{
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then( ()=> console.log('MongDB Connected...'))
  .catch( err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})