// @ts-ignore
import ConsistentHash from 'consistent-hash';
import crypto from 'crypto';
import express from 'express';
import { Client } from 'pg';

const hr = new ConsistentHash();
hr.add('5432');
hr.add('5433');
hr.add('5434');

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
	'5432': createClient(5432),
	'5433': createClient(5433),
	'5434': createClient(5434),
};

const app = express();

connect();

async function connect() {
	try {
		// Establishing tcp connection to postgres containers
		await clients['5432'].connect();
		await clients['5433'].connect();
		await clients['5434'].connect();
	} catch (err) {
		console.log(err.message);
	}
}

app.get('/:urlId', async (req, res) => {
	try {
		const urlId = req.params.urlId;
		const server: '5432' | '5433' | '5434' = hr.get(urlId);
		const result = await clients[server].query('SELECT * FROM url_table where url_id = $1', [
			urlId,
		]);
		if (result.rowCount > 0) {
			res.send({
				data: result.rows[0],
				status: 'success',
			});
		} else {
			res.send({
				status: 'error',
				message: 'Not found',
			});
		}
	} catch (err) {
		res.send({
			status: 'error',
			message: err.message,
		});
	}
});

app.post('/', async (req, res) => {
	try {
		const url = req.query.url as string;
		// consistently hash to get port
		const hash = crypto.createHash('sha256').update(url).digest('base64');
		const urlId = hash.substring(0, 5);
		const server: '5432' | '5433' | '5434' = hr.get(urlId);
		await clients[server].query('INSERT INTO url_table(url, url_id) values($1, $2)', [url, urlId]);
		res.send({
			status: 'success',
			data: {
				urlId,
				url,
				server,
			},
		});
	} catch (err) {
		res.send({
			message: err.message,
			status: 'error',
		});
	}
});

app.listen(4000, () => {
	console.log(`Server listening on port 4000`);
});
