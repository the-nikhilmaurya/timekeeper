const express = require('express')
const router = express.Router();


const {Pool} = require('pg')
const pool  = new Pool ({
    user: 'postgres',
    host: 'localhost',
    database: 'db2',
    password: '1234',
    port: 5432
});
router.use(express.static('public'))



const axios = require('axios');

router.use(express.json())
router.use(express.urlencoded({extended : true}))


async function check(email){
    try{
        const query = ("select * from timekeeper where email = $1 ;")
        const result = await pool.query(query,[email]);
    
        if(result.rowCount === 0){
            console.log("no found")
            return true;
        }
        // console.log("email found")
        return false;
      }catch(error){
        console.log(error)
         return false;
      }
}

// signup details here entered in db
router.post('/',async(req,res)=>{
    console.log("entered /users/")
    const {fname,lname,email,password} =req.body;
    // console.log(req.body)
    var err = ""
    if (await check(email) === false){
        err = "email exists"
        return res.render('signup',{err})
    }
    else{
    try{
        
        const insert = 'insert into timekeeper (fname,lname,email,password) values ($1,$2,$3,$4) RETURNING *';
        const result = await pool.query(insert,[fname,lname,email,password]);
        console.log('Data inserted successfully',result.rows[0]);
        err = ""
        return res.render('login')
        // res.status(200).json({ message: 'Data inserted successfully', insertedRow: result.rows[0] });
  
    }catch(error){
        console.log(error)
        // console.error("got error while inserting that is signup")
        var err = "got some error while inserting "
        return res.render('signup',{err})
    } }
})



// login verification

router.post('/login',async(req,res)=>{
    
    console.log('entered /users/login')
    const {email,password} = req.body;
    
    // console.log(req.body)
    var err  = ""
    try{
        const query = ("select * from timekeeper where email = $1 and password = $2 ;")
        const result = await pool.query(query,[email,password]);

        if(result.rowCount === 0){
            console.log("not found email or password")
            err = "not found email or password"
            return res.render('login',{err})
        }
        // console.log("credentials matches")
        // err = ""
        // temp = email;
        // return res.redirect('/users/getZones')
      }catch(error){
        //   console.log(error)
          console.error("Facing some issues while log in")
          err = "Facing some issues while log in"
          return res.render('login',{err})
      }
      
})


//main
var temp =""
router.get('/getZones', async (req, res) => {
    temp = req.query.email

    if(temp == "" || !temp){
        return res.render('login')
    }
    console.log(temp+ " entered /users/getZones")

    // get dropdown of available zones
    const dropdownList = await getDropDown();
    // res.send(dropdownList)
    
    var profile =await giveProfile(temp)
    console.log(profile)
    // get the number of zones selected by user

    var ZonesArr =  await getZonesDetails(temp);
    // console.log(ZonesArr)

    var details = await getTime(ZonesArr)
    // console.log(details +"  trying details")
    res.render('homePage',{dropdownList,details,profile})
    

});



// will give me the drop down list of time zone
async function getDropDown(){
    try {
        const response = await axios.get('https://www.timeapi.io/api/TimeZone/AvailableTimeZones');
        const data = response.data;
        // console.log(data)
        return  data;
    } catch (error) {
        console.error('Error occurred:', error);
        return "nothing found";
    }
}


// will give me the zones name array so that i can fetch for that country's timezone
async function getZonesDetails(email){
    var arrObj = []
    try{
        const select = "select * from timekeeper2 where email = $1;"
        const result = await pool.query(select,[email]);
        if(result.rowCount === 0){
          return arrObj;
        }
        arrObj = result.rows.map((el)=>{
            return (el.country)
        })
        // console.log(arrObj)
        return arrObj;

        }catch(error){
          console.log(error)
          return arrObj;
        }
} 


// will give me object of array of different time zones
async function getTime(ZonesArr){
    
        return  await Promise.all(ZonesArr.map((el) => fetchData(el)));
        
        function fetchData(timeZone) {
        //   console.log('timeZone ' + timeZone);
          const url = `https://www.timeapi.io/api/Time/current/zone?timeZone=${timeZone}`;
          return axios.get(url).then((response) => {
        
            const data = response.data;
            // console.log(data)
            return data;
          }).catch((error) => {
            console.error('Error occurred:', error);
            return null; 
          });
        }
}        


router.post('/insertCountry',async (req, res) => {
    console.log("inserting.... countryy  "+temp)
    
    const selectedTimezone = req.body.selectedTimezone; 
    if(temp == "" ){
        return res.render('login')
    }
    else if(selectedTimezone === "")
    {
        return 
    }
   
    // console.log(selectedTimezone)
    try{
      const insert = 'insert into timekeeper2 (email,country) values ($1,$2) RETURNING *';
      const result = await pool.query(insert,[temp,selectedTimezone]);
      console.log('country Data inserted successfully');

      const dropdownList = await getDropDown();
      // res.send(dropdownList)
    var profile =await giveProfile(temp)
      
  
      // get the number of zones selected by user
  
      var ZonesArr =  await getZonesDetails(temp);
      // console.log(ZonesArr)
  
      var details = await getTime(ZonesArr)
    //   console.log(details +"  trying details")
      res.render('homePage',{dropdownList,details,profile})
      
      
    
  
    }catch(error){
        // console.log(error)
        console.error("got error while inserting")
        return res.send("caught error while inserting")
    }
  });

  router.post('/delete',async (req, res) => {
    console.log("deleting.... countryy  "+temp)
    
    const deleteRow = req.body.deleteRow; 
    if(temp == "" ){
        return res.render('login')
    }
    
   
    console.log(deleteRow)
    try{
      const deletequery = 'delete from timekeeper2 where country = $1 RETURNING *;'
      const result = await pool.query(deletequery,[deleteRow]);
      console.log('country Data deleted successfully');

      const dropdownList = await getDropDown();
      // res.send(dropdownList)
      
    var profile =await giveProfile(temp)
    // console.log(profile)
      // get the number of zones selected by user
  
      var ZonesArr =  await getZonesDetails(temp);
      // console.log(ZonesArr)
  
      var details = await getTime(ZonesArr)
    //   console.log(details +"  trying details")
      res.render('homePage',{dropdownList,details,profile})
      
    }catch(error){
        console.log(error)
        console.error("got error while deleting")
        return res.send("caught error while deleting")
    }
  });

 

  async function giveProfile(email){
    try{
        const query = ("select * from timekeeper where email = $1 ;")
        const result = await pool.query(query,[email]);
    
        if(result.rowCount === 0){
            console.log("no found")
            return {}
        }
        // console.log("email found")
        return result.rows[0];
      }catch(error){
        console.log(error)
         return {};
      }
}


module.exports = router;