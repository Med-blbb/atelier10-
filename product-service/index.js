import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import productRoute from './routes/product.js'

dotenv.config()
const app = express()

const port = process.env.port
const url = process.env.url_mongoose

mongoose.connect(url).then(() => {
    console.log('Connected to mongo')
}).catch((err) =>{
    console.log('Not connected to mongo')
})

app.use(express.json())
app.use('/products', productRoute)

app.listen(port, (err) => {
    if(err)
        console.log('Error start server')
    else
        console.log('Server started')
})