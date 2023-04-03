import { GamesModeEnum, IBotParams, IUserInitialParms } from './types';

export const returnToXmlResponseFormat = (
	marketType: string,
	round: number,
	price: string,
	size: number,
	selectionId: string
) => {
	return `<?xml version="1.0" encoding="UTF-8"?>
<postBetOrder xmlns="urn:betfair:games:api:v1"
 marketId="${marketType}" round="${round}" currency="BRL">
 <betPlace>
 <bidType>BACK</bidType>
 <price>${price}</price>
 <size>${size}</size>
 <selectionId>${selectionId}</selectionId>
 </betPlace>
</postBetOrder>`;
};

export const userInitialParams: IBotParams = {
	generalParams: {
		stopWhenWinning: 10,
		stopWhenLoss: 10,
		stopByTime: 60 * 1000,
		// tempo em segundos
	},
	game: {
		gameMode: GamesModeEnum.player1,
		multiplier: 1.05,
		numberOfMatchs: 4,
		size: 5,
	},
};

export const userParams: IUserInitialParms = {
	generalParams: { stopByTime: 10, stopWhenLoss: 20, stopWhenWinning: 10 },
	games: [
		{
			gameMode: GamesModeEnum.player1,
			multiplier: 2,
			numberOfMatchs: 1,
			size: 5,
		},
		{
			gameMode: GamesModeEnum.player3,
			multiplier: 2,
			numberOfMatchs: 1,
			size: 5,
		},
	],
};
