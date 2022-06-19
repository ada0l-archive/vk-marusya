const {marusyaHello} = require("./helloVezdekod");

const express = require("express");
const cors = require("cors");

const server = express()
    .use(express.json())
    .use(express.urlencoded({extended: true}))
    .use(cors());

const http = require("http").createServer(server);

server.post("/toster", async (req, res) => res.send(marusyaHello(req.body)));

http.listen(5000, function () {
    console.log("Приложение запущено на порту 5000!");
});
