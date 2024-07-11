const express = require('express');
const app = express();
require('dotenv').config();
const morgan = require('morgan')
const userRoutes = require('./routes/User');
const profileRoutes = require('./routes/Profile');
const paymentRoutes = require('./routes/Payment');
const courseRoutes = require('./routes/Course');

const database = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {cloudinaryConnect} = require('./config/cloudinary');
const fileUpload = require('express-fileupload');

const PORT = process.env.PORT || 8080;
//database connect
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'))

app.use(
    cors({
        origin:"http://localhost:3000",
        credential:true,
    })
)
 
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)

//cloudinarry connect
cloudinaryConnect();

//routes mount
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

//default route

app.get("/", (req, res)=>{
    return res.json({
        success:true,
        message:"Your server is up and running..."
    })
    // res.send("<h1>Hello jee this is study notion</h1>")
})

app.listen(PORT ,() => {
    console.log(`App is running at ${PORT}`)
})