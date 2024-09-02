const express = require('express')
const mysql = require('mysql2')
const app = express()
const port = 3000
const dotenv = require('dotenv');


dotenv.config();


//Database(MySql) configulation
const db = mysql.createConnection({
    host: process.env.Host,
    user: process.env.User,
    password: process.env.Password,
    database: process.env.Database
  })
db.connect()

//Middleware (Body parser)
app.use(express.json())
app.use(express.urlencoded ({extended: true}))

app.get('/product_computer', function(req, res){
    const { computer_Namebrand, computer_Model, computer_Serialnumber, computer_Quantity, computer_Price,
            computer_CPUspeed, computer_Memory, computer_Harddisk, computer_Image } = req.body
    let sql = "INSERT INTO Computer (computer_Namebrand, computer_Model, computer_Serialnumber, computer_Quantity, computer_Price, computer_CPUspeed, computer_Memory, computer_Harddisk, computer_Image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    db.query(sql, [computer_Namebrand, computer_Model, computer_Serialnumber, computer_Quantity, computer_Price,
        computer_CPUspeed, computer_Memory, computer_Harddisk, computer_Image], function(err, result) {
        if (err) {
          console.error(err) // log errors for debugging
          res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในบันทึกข้อมูลสินค้า', 'status': false })
          return
        }
        res.send({ 'message': 'บันทึกข้อมูลสินค้าสำเร็จ', 'status': true })
      })

});
app.post('/product_computer_researh', function(req, res){
    const {computer_ID} = req.body
    const sql = 'SELECT * FROM Computer WHERE computer_ID = ?'

    db.query(sql, [computer_ID], function(err, result){
        if(err) throw err

            if(result.length > 0){
                let computer_ID = result[0]
                computer_ID['message'] = "ดึงข้อมูลสำเร็จ"
                computer_ID['status'] = true
    
                res.send(computer_ID)
            }else{
                res.send({"message":"ไม่พบข้อมูลที่ค้นหา", "status":false} )
            }        
        } )
    })

app.listen(port, function() {
    console.log(`server listening on port ${port}`)
  })
  
