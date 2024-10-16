import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//configuration
app.use(express.json({limit: "16kb"}))//to handle basic body req
app.use(express.urlencoded({extended: true, limit: "16kb"})) //to handle data from url
app.use(express.static("public")) //to store any icon, image, etc in my folder{here folder name is public} assets storage purpose
app.use(cookieParser()) //to use CRUD opr on cookies


//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)

export { app }