import express from 'express'
import ModelProduct from '../models/Product.js'
import { Router } from 'express'
import amqp from 'amqplib'

const routes = Router()

var connection , channel;
const queueName1='order-service-queue';
const queueName2='product-service-queue';

async function connectToRabbitMQ() {
    const amqpServer = process.env.rabbitMQ;
    connection= await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue(queueName1);
    await channel.assertQueue(queueName2);
}

connectToRabbitMQ().then(() => {
    console.log('connected to rabbitmq')
}).catch((err) => {
    console.log(err)
})

routes.post('/add', (req,res)=>{
    const newProduct = req.body

    ModelProduct.create(newProduct).then((product)=>{
        res.send(product)
    })
   .catch((err)=>{
       res.status(500).json(err)
   })
   
})

routes.post('/buy', (req,res)=>{
     const liste = req.body;

    ModelProduct.find({_id: {$in:liste}}).then((p) => {
        channel.sendToQueue(queueName1, Buffer.from(JSON.stringify(p)))
        
        channel.consume(queueName2, (data) => {
            res.json(JSON.parse(data.content.toString()))
            channel.ack(data)
        })
    }).catch((err) => {
        res.status(520).send('Insertion Impossible')
    })
})

export default routes