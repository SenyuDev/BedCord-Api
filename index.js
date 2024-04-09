const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post("/patch", async function (request, response) {
    const url = request.query.link;
    const headers = request.headers;
    try {
        const axiosResponse = await axios.patch(url, request.body, {
            headers: {
                "Authorization": headers["authorization"],
                'Content-Type': headers["content-type"],
                'Accept': headers["accept"]
            }
        });

        response.send(axiosResponse.data);
    } catch (error) {
        console.error("Error making request:", error.message);
        response.status(500).json({ error: "Internal Server Error", message: error.message });
    }
});

app.get("/patch", (req,res) => res.send("hola mundo bebe"))


app.all("/", (req, res) => res.send("hola mundo"))


const listener = app.listen(8000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
