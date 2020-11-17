const express = require('express')
require('dotenv').config()
const cors = require('cors')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const fs = require('fs-extra')
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('images'))
app.use(fileUpload())

const port = 8080
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qhxza.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {

  const customerHouses = client.db(process.env.DB_NAME).collection('customer-houses');

  
  const adminAddHouses = client.db(process.env.DB_NAME).collection('admin-add-houses');

  const adminEmails = client.db(process.env.DB_NAME).collection('admin-emails');
  
  console.log('monodb connected YAY')
  console.log(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASS,)

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.get('/houses', (req, res) => {
    adminAddHouses.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/customerHouses', (req, res) => {
    customerHouses.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })


  app.get('/housesByCustomer', (req, res) => {
    const queryEmail = req.query.email
    console.log(queryEmail)
    customerHouses.find({ email: queryEmail })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/checkAdmin', (req, res) => {
    const queryEmail = req.query.email
    console.log(queryEmail)
    adminEmails.find({ email: queryEmail })
      .toArray((err, documents) => {
        res.send(documents.length > 0)
      })
  })


  

 
app.post('/addHouseByAdmin', (req, res) => {
    const file = req.files.file ;
    const title = req.body.title ;
    const price = req.body.price ;
    const location = req.body.location ;
    const bedroom = req.body.bedroom ;
    const bathroom  = req.body.bathroom ;    
    
    const newImg =file.data
    const encImg = newImg.toString('base64')
    
    const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')

      }

      adminAddHouses.insertOne({ title, price, location, bedroom, bathroom, image })
        .then(result => {
       res.send(result.insertedCount > 0)   
       })
    })
  
    app.post('/addAdminEmail', (req, res) => {
    const addEmail = req.body;
    console.log(addEmail)
    adminEmails.insertOne(addEmail)
    res.send('admin added successfully')
  })

});


app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})