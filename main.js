const amqp = require("amqplib");


//global variables
async function connectQueue() {

    const opt = { credentials: require('amqplib').credentials.plain('admin', 'admin') };

    try {
        connection = await amqp.connect("amqp://3.83.64.248:5672", opt);
        channel = await connection.createChannel()

        await channel.assertQueue("online-orders")
        return [channel, connection];
    } catch (error) {
        console.log(error)
    }
}

async function sendData(data) {
    // send data to queue
    var aux = await connectQueue();
    var channel = aux[0];
    var connection = aux[1];
    await channel.sendToQueue("online-orders", Buffer.from(JSON.stringify(data)));

    // close the channel and connection
    await channel.close();
    await connection.close();
}





const express = require("express");
const app = express();
const PORT = process.env.PORT || 4001;
app.use(express.json());
app.post("/send-msg", (req, res) => {
    payload = req.body;

    sendData(payload);  // pass the data to the function we defined
    console.log("A message is sent to queue")
    res.send(
        {
            "Message": "Your order has been send successfully"
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