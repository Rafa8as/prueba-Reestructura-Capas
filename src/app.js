import express from "express";
import __dirname from "./utils.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import messagesRouter from "./routes/messages.router.js"
import cookiesRouter from "./routes/cookies.router.js"
import sessionsRouter from "./routes/sessions.router.js"
import products from "./data/products.json" assert {type: "json"};
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import session from "express-session";

import {messageModel} from "./dao/mongo/messages.model.js";
import { productModel } from "./dao/mongo/product.model.js";
import handlebars from "express-handlebars";

import {Server} from "socket.io";
import "dotenv/config";
import config from "../config.js";
import router from './router/router.js';







const app = express ();
const PORT = 8080;
const host = "0.0.0.0";


mongoose.set ('strictQuery',false)

const mongoUrl = config.MONGO_URL;
const MONGO_PASS = config.MONGO_PASS;

//const connection = mongoose.connect ('mongodb+srv://rafa8as:Odarita23@cluster0.mjxuonn.mongodb.net/?retryWrites=true&w=majority');
//const mongoUrl = "mongodb+srv://rafa8as:Odarita23@cluster0.mjxuonn.mongodb.net/?retryWrites=true&w=majority";
const enviroment = async () => {
    await mongoose.connect(mongoUrl);
};
enviroment();
initializePassport ();
app.use(session({
    store: MongoStore.create({mongoUrl}),
    secret: MONGO_PASS,
    resave: false,
    saveUninitialized: true,
}))


//const mongoUrl = config.MONGO_URL;
//const MONGO_PASS = config.MONGO_URL;

//const connection = mongoose.connect ('mongodb+srv://rafa8as:Odarita23@cluster0.mjxuonn.mongodb.net/?retryWrites=true&w=majority');
/*const mongoUrl = mongoose.connect ('mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.mjxuonn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority')
    mongoDB:{
    URL :'mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.mjxuonn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority'},
    options; {
        useNewUrlParser: true,
        useUnifiedTopology; true,
    
    }*/

  /*  const enviroment = async () => {
        await mongoose.connect(mongoUrl);
    };
    enviroment();
    app.use(
        session({
            store: MongoStore.create({mongoUrl}),
            secret: process.env.MONGO_PASS,
            resave: false,
            saveUninitialized: true,
        })
    );
*/
/*app.use(session({
    store: MongoStore.create({MONGO_URL}),
    secret: process.env.MONGO_PASS,
    resave: false,
    saveUninitialized: true,
}))
*/
import passport from "passport";
import initializePassport from "./config/passport.config.js";

initializePassport();
app.use(passport.initialize());
app.use(passport.session());


app.engine ('handlebars', handlebars.engine());
app.set ('views', __dirname + '/views');
app.set ('view engine', 'handlebars');
app.use (express.static ( __dirname + "/public"));

app.use (express.urlencoded ({extended: true}));
app.use (express.json ());
app.use ('/api/products', productsRouter);
app.use ('/api/carts', cartsRouter);
app.use ('/api/cookies', cookiesRouter);
app.use ('/api/sessions', sessionsRouter);
app.use ('/api/messages', messagesRouter);
app.use ('/', viewsRouter);



const httpServer = app.listen (PORT, host, () => {console.log (`Server arriba en http://${host}: ${PORT}`);});

const io = new Server(httpServer);

io.on( "connection", async socket => {
    console.log (`Cliente ${socket.id} conectado`);


    const products = await productModel.find().lean();
    io.emit ("products", products);

    productModel.watch().on("change", async change => {
        const products = await productModel.find().lean();
        io.emit ("products", products);
    });


const messages = [];

socket.on("user", async data => {
    await messageModel.create ({
        user: data.user,
        message: data.messages,
    });
    const messagesLogs = await messageModel.find();
    io.emit ("messagesLogs", messagesLogs);
});

  
    socket.on ("message", async data =>{
        await messageModel.create ({
            user: data.user,
            message: data.message,
        });

        const messagesLogs = await messageModel.find();
       
        io.emit ("messagesLogs", messagesLogs);
        
    });
    socket.on ("disconnect", () => {
        console.log (`Client ${socket.id} disconnected`);
    });
});