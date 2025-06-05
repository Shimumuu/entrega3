console.log("Server start");

const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");

app.use(express.json());
app.use(cookieparser());
app.get( '/heartbeat', (req, res) => {

        res.cookie("glata","gloda",{
        httpOnly: true
        });
        res.send({"alive": true,"cookie": req.cookies});
});

app.listen(8080, () => {
        console.log("Server is listening");
});