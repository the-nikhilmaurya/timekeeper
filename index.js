const express = require('express')
const app = express();
const port = 3000
app.use(express.static("public"))

const UserRouter = require('./routes/users');
app.use('/users',UserRouter)

const axios = require('axios');
app.set('view engine','ejs')

app.use(express.json())
app.use(express.urlencoded({extended : true}))




app.get('/',(req,res)=>{
    // res.render('homePage')
    // res.render('login')
    res.render('signup')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });