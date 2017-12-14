require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const body = require('body-parser');
const cors = require('cors');
const superagent = require('superagent');
const pokeUrl = "http://pokeapi.co/api/v2/pokemon/";
const dexUrl = "https://pokeapi.co/api/v2/pokemon-species/";

const PORT = process.env.PORT;
console.log(PORT);
const conString = process.env.DATABASE_URL;
const client = new pg.Client(conString);
client.connect();

app.use(cors());
app.use(body.json());
app.use(body.urlencoded({extended: true}));




app.get('/game/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    superagent
        .get(`${pokeUrl}${id}/`)
        .end((err, resp) => {
            const poke = resp.body;
            console.log(poke.types.length);
            const typeSlot = () => {
                return (poke.types.length > 1) ? poke.types[1].type.name : poke.types[0].type.name;
            };
            const pokeObj = {
                name: poke.name || 'n/a',
                dex_number: poke.id,
                img_url: poke.sprites.front_default || 'n/a',
                type: poke.types ? typeSlot() : 'n/a'
            };
            loadPokemon(pokeObj);
            console.log(pokeObj);
        });

    res.send('done');
});

app.listen(PORT, () => (console.log(`listening for api requests to ${PORT}`)));



//////// ** DATABASE LOADERS ** ////////
////////////////////////////////////////

function loadPokemon(poke) {
    client.query(
        'INSERT INTO pokemon(name, dex_number, img_url, type) VALUES($1, $2, $3, $4)',
        [poke.name, poke.dex_number, poke.img_url, poke.type]
    )
        .catch(console.error);
};

function loadLeaderboard() {
    client.query(`CREATE TABLE IF NOT EXISTS leaderboard (id serial PRIMARY KEY, name VARCHAR(50), score INTEGER);`
    )
        .catch(console.error);
}

function loadPokemon() {
    client.query(`CREATE TABLE IF NOT EXISTS pokemon (id serial PRIMARY KEY, dex_number INTEGER UNIQUE, name VARCHAR(25), img_url VARCHAR(300), type VARCHAR(25));`
    )
        .then(loadPokemon)
        .catch(console.error);
}