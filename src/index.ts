import express from 'express';
import { Client } from 'pg';

function createClient(port: number) {
	return new Client({
		host: 'localhost',
		port,
		user: 'postgres',
		password: 'postgres',
		database: 'postgres',
	});
}

// Spin up three clients
const clients = {
	5432: createClient(5432),
	5433: createClient(5433),
	5434: createClient(5434),
};

const app = express();

connect();

async function connect() {
	try {
		// Establishing tcp connection to postgres containers
		await clients[5432].connect();
		await clients[5433].connect();
		await clients[5434].connect();
	} catch (err) {
		console.log(err.message);
	}
}

app.get('/', async (req, res) => {});

app.post('/', async (req, res) => {});
