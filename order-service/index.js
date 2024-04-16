import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import OrderSchema from './models/Order.js'
import amqp from 'amqplib'

dotenv.config()
const app = express()

const port = process.env.port
const url = process.env.url_mongoose

mongoose.connect(url).then(() => {
    console.log('Connected to mongo')
}).catch((err) =>{
    console.log('Not connected to mongo')
})

var connection , channel;
const queueName1='order-service-queue';
const queueName2='product-service-queue';

async function connectToRabbitMQ(){
    const amqpServer = process.env.rabbitMQ;
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue(queueName1);
    await channel.assertQueue(queueName2);
}
connectToRabbitMQ().then(()=>{
    channel.consume(queueName1,(data)=>{
        const products = JSON.parse(data.content.toString());
        const total = products.reduce((acc,curr)=> acc + curr.price,0);
        const order={products,total};

        OrderSchema.create(order).then((order)=>{
            channel.sendToQueue(queueName2,Buffer.from(JSON.stringify(order)));
        }).catch((err)=>{
            console.log(err)
        })

        channel.ack(data)
    })
})

app.listen(port, (err) => {
    if(err)
        console.log('Error start server')
    else
        console.log('Server started')
})