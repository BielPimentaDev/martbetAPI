import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';

interface IBotIds {
	currentBotsRunning: string[];
	botsToStop: string[];
}

export async function readJsonFile() {
	const data = await fs.readFile('src/botIds.json', 'utf8');
	return data;
}

export const botsToStopList = async () => {
	const data = await fs.readFile('src/botIds.json', {
		encoding: 'utf8',
		flag: 'r',
	});
	const jsonData: IBotIds = JSON.parse(data);
	return jsonData.botsToStop;
};

export const stopBotById = async (botId: string) => {
	const jsonFile = await readJsonFile();
	const parseFile: IBotIds = JSON.parse(jsonFile);
	const newJsonData = {
		currentBotsRunning: parseFile.currentBotsRunning.filter(
			(item) => item != botId
		),
		botsToStop: [...parseFile.botsToStop, botId],
	};
	await fs.writeFile('src/botIds.json', JSON.stringify(newJsonData));
};

export const writeBotId = async () => {
	const botId = uuidv4();
	const jsonFile = await readJsonFile();
	const parseFile: IBotIds = JSON.parse(jsonFile);
	const newJsonData = {
		currentBotsRunning: [...parseFile.currentBotsRunning, botId],
		botsToStop: [...parseFile.botsToStop],
	};
	await fs.writeFile('src/botIds.json', JSON.stringify(newJsonData));
	return botId;
};

export const stopAllCurrentBots = async () => {
	const jsonFile = await readJsonFile();
	const parseFile: IBotIds = JSON.parse(jsonFile);
	const newJsonData = {
		currentBotsRunning: [],
		botsToStop: [...parseFile.botsToStop, ...parseFile.currentBotsRunning],
	};
	await fs.writeFile('src/botIds.json', JSON.stringify(newJsonData));
	console.log(`parando bots`);
};
