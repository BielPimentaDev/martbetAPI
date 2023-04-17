import { botsToStopList, stopBotById, writeBotId } from './botIdManager';
import RequestManager from './RequestManager';
import { IBotParams, IResultFromBet } from './types';
const schedule = require('node-schedule');
import { v4 as uuidv4 } from 'uuid';

export async function sleep(ms: number) {
	return await new Promise((resolve) => setTimeout(resolve, ms)); 
}

export class Martingale {
	initialParams: IBotParams;
	clonedInitialParams: IBotParams;
	requestsManager: RequestManager;
	keepBeting: boolean;
	lastBetId: string;
	stopWhenLoss: number;
	stopWhenWinning: number;
	numberOfMatchs: number;
	gameMode: number;
	currentPointsToStop: number;
	timeToWait: number;
	botId: string;
	botsToStopList: string[];
	constructor(initialParams: IBotParams, botId: string) {
		this.botId = botId;
		this.gameMode = initialParams.game.gameMode;
		this.initialParams = Object.assign({}, initialParams);
		this.clonedInitialParams = Object.assign({}, initialParams);
		this.stopWhenLoss = initialParams.generalParams.stopWhenLoss;
		this.stopWhenWinning = initialParams.generalParams.stopWhenWinning;
		this.numberOfMatchs = initialParams.game.numberOfMatchs;
		this.currentPointsToStop = 0;
		this.keepBeting = true;
		this.timeToWait = initialParams.generalParams.stopByTime;
		this.requestsManager = new RequestManager();
		this.start();
	}
	async start() {
		await this.initialize();
	}
	async initialize() {
		const botsList = await botsToStopList();
		this.botsToStopList = botsList;
		if (botsList.includes(this.botId)) {
			console.log(`bot id ${this.botId} encerrado`);
			return;
		}
		while (true) {
			const botsList = await botsToStopList();
			this.botsToStopList = botsList;
			if (botsList.includes(this.botId)) {
				console.log(`bot id ${this.botId} encerrado`);
				break;
			}
			console.log(`robo: ${this.gameMode} entrou no loop`);
			if (this.numberOfMatchs == 0) {
				console.log(`Numero de partidas excedido`);
				this.remakeBot();
				break;
			}

			this.numberOfMatchs -= 1;
			await this.requestsManager.fetchSnapShot(this.gameMode);
			await this.waitUntilTheMatchBegin();
			if (this.lastBetId) {
				const report = await this.requestsManager.fetchHistoryBet(
					this.lastBetId
				);
				const keepBeting = await this.resultsProcess(report);
				console.log(keepBeting);
				if (keepBeting == 'STOP') {
					console.log(
						`criterio de parada atingido: ${this.currentPointsToStop}`
					);
					this.remakeBot();
					break;
				}
			}
			this.placeBet();
			await sleep(30000);
		}
		console.log(`saiu do loop`);
	}

	async waitUntilTheMatchBegin() {
		console.log(this.requestsManager.round);
		while (this.requestsManager.round != 1) {
			const botsList = await botsToStopList();
			this.botsToStopList = botsList;
			if (this.botsToStopList.includes(this.botId)) {
				console.log(`bot id ${this.botId} encerrado`);
				break;
			}
			console.log(`...`);
			await sleep(10000);
			await this.requestsManager.fetchSnapShot(this.gameMode);
			console.log(`round novo: ${this.requestsManager.round}`);
		}
	}

	async placeBet() {
		console.log(`robo: ${this.gameMode}`);
		const responseBetId = await this.requestsManager.placeBet(
			this.initialParams.game.size
		);
		this.lastBetId = responseBetId;
		console.log(this.lastBetId);
	}

	async resultsProcess(report: IResultFromBet) {
		console.log(`processando ultima aposta`);
		if (report.status == `WON`) {
			this.currentPointsToStop +=
				Number(report.size) * Number(report.price) - Number(report.size);
			console.log(`vitoria`);
			console.log(`Total de pontos: ${this.currentPointsToStop}`);
			console.log(this.stopWhenWinning);
			console.log(this.currentPointsToStop >= this.stopWhenWinning);
			if (this.currentPointsToStop >= this.stopWhenLoss) {
				console.log(`criterio de parada atingido`);
				this.keepBeting == false;
				return 'STOP';
			}
		}
		if (report.status == `LOST`) {
			this.currentPointsToStop -= Number(report.size);
			this.initialParams.game.size *= this.initialParams.game.multiplier;
			console.log(`derrota`);
			console.log(`Total de pontos: ${this.currentPointsToStop}`);
			console.log(this.stopWhenLoss);
			console.log(`novo aporte: ${this.initialParams.game.size}`);
			console.log(this.currentPointsToStop * -1 >= this.stopWhenLoss);
			if (this.currentPointsToStop >= this.stopWhenWinning) {
				console.log(`criterio de parada atingido`);
				this.keepBeting == false;
				return 'STOP';
			}
		}

		await sleep(100);
		return 'KEEP';
	}

	async remakeBot() {
		const date = new Date();
		let currentMinutes = date.getMinutes() + this.timeToWait;
		if (currentMinutes >= 60) {
			currentMinutes -= 60;
		}
		const params = this.clonedInitialParams;
		const botId = await writeBotId();
		const job = schedule.scheduleJob(`${currentMinutes} * * * *`, function () {
			console.log(params);
			const martingale = new Martingale(params, botId);
		});
	}
}
