const amqp = require("amqplib");

var channel, connection;
//global variables
async function connectQueue() {

    const opt = { credentials: require('amqplib').credentials.plain('admin', 'admin') };

    try {
        connection = await amqp.connect("amqp://3.83.64.248:5672", opt);
        channel = await connection.createChannel()

        await channel.assertQueue("online-orders")
        await channel.assertQueue("onsite-orders")
        return [channel, connection];
    } catch (error) {
        console.log(error)
    }
}

async function sendData(data,queueName) {
    // send data to queue
    await connectQueue();
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));

    // close the channel and connection
    await channel.close();
    await connection.close();
}





const express = require("express");
const app = express();
const PORT = process.env.PORT || 4001;
app.use(express.json());
app.post("/online-order", (req, res) => {
    payload = req.body;
    try {
        sendData(payload,'online-orders');  // pass the data to the function we defined
    } catch (error) {
        console.log(error)
        res.send(

            error
        )
    }
    console.log("A message is sent to queue")
    res.send(
        {
            "Message": "Your online order has been sent successfully"
        }
    ); //response to the API request
});
app.post("/onsite-order", (req, res) => {
    payload = req.body;
    try {
        sendData(payload,'onsite-orders');  // pass the data to the function we defined
    } catch (error) {
        console.log(error)
        res.send(

            error
        )
    }
    console.log("A message is sent to queue")
    res.send(
        {
            "Message": "Your onsite order has been sent successfully"
        }
    ); //response to the API request
});

// app.post('/test', (req, res) => {
//     console.log(req.body);
//     res.send("Hello world");
// })

app.listen(PORT, () => console.log("Server running at port " + PORT));
// Export the Express API
module.exports = app;