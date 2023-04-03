import { stopAllCurrentBots } from './botIdManager';
// import { userParams } from './helpers';
// import { Martbet } from './Martbet';
import express from 'express';
import { Router, Request, Response } from 'express';
import { Martbet } from './Martbet';
import RequestManager from './RequestManager';
import { v4 as uuidv4 } from 'uuid';
import {
	botsToStopList,
	readJsonFile,
	stopBotById,
	writeBotId,
} from './botIdManager';
import process from 'process';
const port = process.env.PORT || 3000;

const app = express();

const route = Router();

app.use(express.json());

route.get('/startBots', (req: Request, res: Response) => {
	console.log(req.body);
	const martbet = new Martbet(req.body);
	res.json({
		status: 'sucess',
		message: 'all bot has started',
		request: req.body,
	});
});

route.get('/stopAllBots', (req: Request, res: Response) => {
	stopAllCurrentBots();
	res.json({
		status: 'sucess',
		message: 'all bot has stoped',
	});
});

route.get('/betsHistory', async (req: Request, res: Response) => {
	const requestManager = new RequestManager();
	try {
		const history = await requestManager.fetchAllHistoryBets();
		res.json({
			status: 'sucess',

			history: history,
		});
	} catch (error) {
		console.log(error);
		res.json({
			status: 'fail',

			history: history,
		});
	}
});
app.use(route);
app.listen(port, () => 'server running on port 3333');

// stopAllCurrentBots();
