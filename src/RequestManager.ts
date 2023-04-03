import { config } from './config';
import {
	GamesModeEnum,
	IResultFromBet,
	snapshotObjectInterface,
} from './types';
import { returnToXmlResponseFormat } from './helpers';

const axios = require('axios');
const qs = require('querystring');
const convert = require('xml-js');

const convert2JSON = (object: Object) => {
	const converted = convert.xml2json(object, {
		compact: true,
		spaces: 2,
	});
	return JSON.parse(converted);
};

export default class RequestManager {
	snapshotDataJSON: snapshotObjectInterface;
	marketType: string;
	round: number;
	// price = odds
	price: string;
	games: any;
	selectionId: string;

	async start() {
		await this.fetchSnapShot();
		await this.placeBet(12);
	}
	async fetchSnapShot(indexOfGame: number = 0) {
		console.log(`fazendo chamada...`);
		try {
			const data = await axios.get(
				'https://api.games.betfair.com/rest/v1/channels/1444082/snapshot?username=jozelio.mv000@gmail.com',
				config
			);

			this.snapshotDataJSON = convert2JSON(data.data);
			this.round =
				this.snapshotDataJSON.channelSnapshot.channel.game.round._text;

			this.games =
				this.snapshotDataJSON.channelSnapshot.channel.game.markets.market.selections.selection;

			const marketType =
				this.snapshotDataJSON.channelSnapshot.channel.game.markets.market
					._attributes.id;
			this.marketType = marketType;
			this.price =
				this.snapshotDataJSON.channelSnapshot.channel.game.markets.market.selections?.selection[
					indexOfGame
				]?.bestAvailableToBackPrices?.price[indexOfGame]?._text;

			this.selectionId =
				this.snapshotDataJSON.channelSnapshot.channel.game.markets.market.selections?.selection[
					indexOfGame
				]?._attributes.id;
		} catch (error) {
			console.log(error.message);
		}
	}

	async placeBet(size: number) {
		console.log(`apostando...`);
		const xmlBody = returnToXmlResponseFormat(
			this.marketType,
			this.round,
			this.price,
			size,
			this.selectionId
		);
		let betId = ``;
		console.log(xmlBody);
		try {
			const res = await axios.post(
				'https://api.games.betfair.com/rest/v1/bet/order?username=jozelio.mv000@gmail.com',
				xmlBody,
				config
			);
			console.log(res.data);
			const response = convert2JSON(res.data);
			betId = response.responseBetOrder.betPlacementResult.betId._text;
		} catch (error) {
			console.log(error);
		}
		console.log(betId);
		return betId;
	}

	async fetchAllHistoryBets() {
		let betsHistory = [];
		try {
			const res = await axios.get(
				'https://api.games.betfair.com/rest/v1/bet/history?username=jozelio.mv000@gmail.com&betStatus=SETTLED',
				config
			);
			const historyDataObject = convert2JSON(res.data);
			const historyItems = historyDataObject.betHistory.betHistoryItem;

			historyItems.map((element) => {
				betsHistory.push({
					betId: element.betId._text,
					placedDate: element.placedDate._text,
					price: element.price._text,
					size: element.size._text,
					winLose: element.winLose._text,
				});
			});
		} catch (error) {
			console.log(error);
		}
		console.log(betsHistory);
		return betsHistory;
	}

	async fetchHistoryBet(betId: string) {
		let status = 'not found';
		let size = 'not found';
		let price = 'not found';
		try {
			const res = await axios.get(
				'https://api.games.betfair.com/rest/v1/bet/history?username=jozelio.mv000@gmail.com&betStatus=SETTLED',
				config
			);
			const historyDataObject = convert2JSON(res.data);
			const historyItems = historyDataObject.betHistory.betHistoryItem;

			historyItems.forEach((element) => {
				if (element.betId._text == betId) {
					console.log(`achei`);
					status = element.winLose._text;
					size = element.size._text;
					price = element.price._text;
				}
			});
		} catch (error) {
			console.log(error);
		}
		const report: IResultFromBet = {
			status,
			size,
			price,
		};
		console.log(report);
		return report;
	}
}
