const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const port = 3000;

// Database configuration
const db = mysql.createConnection({
    host: process.env.Host,
    user: process.env.User,
    password: process.env.Password,
    database: process.env.Database
});
db.connect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup upload directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueName}${ext}`);
    }
});

const upload = multer({ storage: storage });

// Endpoint to add computer with image upload
app.post('/product_computer', upload.single('computer_Image'), (req, res) => {
    const { computer_Namebrand, computer_Model, computer_Serialnumber, computer_Quantity, computer_Price,
        computer_CPUspeed, computer_Memory, computer_Harddisk } = req.body;
    const computer_Image = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = "INSERT INTO Computer (computer_Namebrand, computer_Model, computer_Serialnumber, computer_Quantity, computer_Price, computer_CPUspeed, computer_Memory, computer_Harddisk, computer_Image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [computer_Namebrand, computer_Model, computer_Serialnumber, computer_Quantity, computer_Price,
        computer_CPUspeed, computer_Memory, computer_Harddisk, computer_Image], function(err, result) {
        if (err) {
            console.error('Error inserting data into the database:', err);
            res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า', 'status': false });
            return;
        }
        res.send({ 'message': 'บันทึกข้อมูลสินค้าสำเร็จ', 'status': true });
    });
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadDir));
// Endpoint to get computer details by ID
app.get('/product_computer/:id', (req, res) => {
    const computer_ID = req.params.id; // รับ ID จาก URL parameters

    const sql = 'SELECT * FROM Computer WHERE computer_ID = ?';

    db.query(sql, [computer_ID], (err, results) => {
        if (err) {
            console.error('Error fetching data from the database:', err);
            return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการดึงข้อมูล', 'status': false });
        }

        if (results.length > 0) {
            // ส่งข้อมูลของเครื่องคอมพิวเตอร์ที่ตรงตาม ID
            res.send(results[0]);
        } else {
            // กรณีไม่พบข้อมูล
            res.send({ 'message': 'ไม่พบข้อมูลที่ค้นหา', 'status': false });
        }
    });
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
