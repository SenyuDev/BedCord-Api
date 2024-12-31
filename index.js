const express = require('express');
const { InteractionType, InteractionResponseType, verifyKey, verifyKeyMiddleware } = require('discord-interactions');

const app = express();
const axios = require('axios');

// const PUBLIC_KEY = '1b7cdeed930696868b7860390d52b630834898732ab69324dc79bc062e124f67';
// const aplication_id = '1038885927487033435';

let users = {
  // "1038885927487033435": {
  //   "public_key":"1b7cdeed930696868b7860390d52b630834898732ab69324dc79bc062e124f67",
  //   "interactions":[]
  // }
}


app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

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

app.all("/", (req, res) => res.send("hola mundo"))

app.post('/interactions', async (req, res) => {
  const app_id = req.body.application_id;
  const PUBLIC_KEY = users[req.body.application_id].public_key;
  if (!PUBLIC_KEY) return res.status(400).send({ error: 'Tipo de interacción no soportado' });
  const verify = await verifyKey(
    req.rawBody,
    req.headers["x-signature-ed25519"],
    req.headers["x-signature-timestamp"],
    PUBLIC_KEY
  );
  if (verify == false) return;
  const interaction = req.body;

  if (interaction.type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    users[app_id].interactions.push(interaction)
    return;
  }
  return res.status(400).send({ error: 'Tipo de interacción no soportado' });
});

app.post('/register', (req, res) => {
  const publicKey = req.body.publicKey;
  const appid = req.body.aplication_id;
  if (!publicKey || !appid) {
    return res.status(400).json({ content: "invalido" });
  }
  if (!users[appid]) {
    users[appid] = { interactions: [] };
  }
  users[appid].public_key = publicKey;
  return res.json({ content: "Registrado!" });
});

app.get("/get-interactions", (req, res) => {
  const app_id = req.body.aplication_id;
  if (!app_id || !users[app_id]) return res.status(400).send({ error: 'Aplicación no registrada' });

  const checkForInteractions = () => {
    if (users[app_id].interactions.length > 0) {
      const interaction = users[app_id].interactions.shift();
      clearTimeout(timeout);
      res.status(200).json(interaction);
    } else {
      setTimeout(checkForInteractions, 1000);
    }
  };

  const timeout = setTimeout(() => {
    res.status(204).end();
  }, 10000); // Espera 10 segundos antes de enviar 204 No Content

  req.on('close', () => {
    clearTimeout(timeout);
  });

  checkForInteractions();
});

const listener = app.listen(8000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});