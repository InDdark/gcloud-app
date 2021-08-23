const express = require('express');
//const bodyParser = require('body-parser')
// const {check, validationResult, header} = require('express-validator')
const app = express();
//const router = express.Router();
const path = require('path')
const emailValidator = require('deep-email-validator');
const fs  = require('fs')
const csv = require('fast-csv')
// const cs = require('csv-parse')
// const http = require('http')
const multer = require('multer');
// const parse = require('csv-parse');
//const { callbackify } = require('util');
// const port = 80;

const emailArray = [];
// const output = 'making it global'



// const output = fs.createWriteStream('output.csv', {flags: 'a'});

if(fs.existsSync('./output.csv')){
    fs.unlinkSync('./output.csv');
} 
fs.createWriteStream('output.csv', {flags: 'a'});


const upload = multer({dest:'upload/'});    


async function isEmailValid(email) {
     return emailValidator.validate(email)
    }

    

// app.set('view engine', 'ejs')

// const urlencodedParser =  bodyParser.urlencoded({extended:false})

app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
})



async function checkEmail(emailArray, callback){
     // console.log("Here in checker !")

     for(var i=1; i< emailArray.length; i++){
          //console.log(typeof String(emailArray[i]));
          console.log("this email: " + String(emailArray[i]));

          const {valid, reason, validators} =   await isEmailValid(String(emailArray[i]));
           console.log("is valid: " + valid);
          if (!emailArray[i]){
               console.log("not email");
             //   return res.status(400).send({
            //   message: "Email missing."
            // })
         }
          
           if(valid){
             //  console.log("Valid: " + emailArray[i]);
               
               await fs.appendFile('output.csv', String(emailArray[i]) + '\n', (err) => {
                    if(err) console.log("[ERROR]: while uploading..")
               });
               
               console.log("Item Added");

              }
             //  await csv.write([emailArray[i]], {header:true}).pipe(output);
            
             // return res.send({message: "Valid Email Address!"});
             
          else{
             console.log("coming here in else !");
             /*
             return res.status(400).send({
                  message: "Please provide a valid email address.",
                  reason: validators[reason].reason
                })
              */
           }
     }
     console.log("Exiting foor loop ");
     await fs.appendFile('output.csv', 'END\n', (err) => {
        if(err) console.log("[ERROR]: while uploading..")
   });
     callback();

}

app.post('/submit', upload.single('myfile'), async (req, res) => {
     
   //  console.log(req.file) 
     //console.log(req.path);
          fs.truncateSync('./output.csv', 0, function(){console.log('done')})
          
           csv.parseFile(req.file.path).on("data", (data) => {
               emailArray.push(data); 
           }).on("end", () =>{
             console.log("Here bhai----");
             fs.unlinkSync(req.file.path);
              
              checkEmail(emailArray, () => {
                 console.log('Callback Func is called');
                 setTimeout(() => {  res.download("./output.csv", "VerifiedEmailList.csv", (err) => {
                    console.log(err);
                 }) }, 8000);
                // res.sendFile(path.join(__dirname, '/views/index.html')); 
            })
               
             
               /*
               , () => {
               
              // res.download('/', 'output.cssv');          
            });
            */
            
           })


    //await checkEmail(emailArray);
});




// app.use('web_dev', router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});



//app.listen(port, () => console.info(`App listening on port ${port}`))