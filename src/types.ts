export interface IUserInitialParms {
	generalParams: {
		stopWhenWinning: number;
		stopWhenLoss: number;
		stopByTime: number;
	};
	games: IGamesModes[];
}

export interface IBotParams {
	generalParams: {
		stopWhenWinning: number;
		stopWhenLoss: number;
		stopByTime: number;
	};
	game: IGamesModes;
}

export interface IGamesModes {
	gameMode: GamesModeEnum;
	multiplier: number;
	size: number;
	numberOfMatchs: number;
}

export enum GamesModeEnum {
	player1 = 0,
	player2 = 1,
	player3 = 2,
	player4 = 3,
}

export interface snapshotObjectInterface {
	_declaration: any;
	_instruction: any;
	channelSnapshot: {
		_attributes: any;
		channel: {
			game: {
				round: any;
				markets: {
					_attributes: any;
					market: {
						selections: { selection: any };
						marketType: any;
						_attributes: any;
					};
				};
			};
		};
	};
}

interface IBetHistory {
	betId: string;
	placedDate: string;
	//price = odds
	price: string;
	//size = aporte
	size: string;
	winLose: string;
}

export interface IResultFromBet {
	status: string;
	size: string;
	price: string;
}
