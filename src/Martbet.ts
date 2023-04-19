import { Martingale, sleep } from './Martingale';
import { IBotParams, IUserInitialParms } from './types';
import { v4 as uuidv4 } from 'uuid';
import { writeBotId } from './botIdManager';

export class Martbet {
	userParams: IUserInitialParms;
	constructor(userParams: IUserInitialParms) {
		this.userParams = { ...userParams };
		this.startBots();
	}
	
	async startBots() {
		for (const game of this.userParams.games) {
			const martingaleParams: IBotParams = {
				generalParams: this.userParams.generalParams,
				game: game,
			};
			const botId = await writeBotId();
			const martingale = new Martingale(martingaleParams, botId);
			await sleep(500);
		}
		// this.userParams.games.map(async (game) => {
		// 	const martingaleParams: IBotParams = {
		// 		generalParams: this.userParams.generalParams,
		// 		game: game,
		// 	};
		// 	const botId = await writeBotId();
		// 	const martingale = new Martingale(martingaleParams, botId);
		// });
	}
}
