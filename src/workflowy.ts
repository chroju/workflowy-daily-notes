import { InitData, ResultD } from './data';

const CLIENT_VERSION = '23';
const WORKFLOWY_URL = {
	INIT: `https://workflowy.com/get_initialization_data?client_version=${CLIENT_VERSION}`,
	UPDATE: 'https://workflowy.com/push_and_poll',
};

interface OperationData {
	projectid: string;
	parentid: string;
	priority: number;
}

interface Operation {
	type: string;
	data: OperationData;
	clientTimestamp: number;
}

export async function init(sessionid: string) {
	try {
		const response = await fetch(WORKFLOWY_URL.INIT, {
			method: 'GET',
			headers: sessionid ? { Cookie: `sessionid=${sessionid}` } : {},
		});

		return (await response.json()) as InitData;
	} catch (err) {
		throw err;
	}
}

export interface CreateBulletProps {
	sessionId: string;
	parentId: string;
	priority: number;
	text: string;
	description: string;
	initData: InitData;
}

export async function createBullet(props: CreateBulletProps) {
	const clientId = props.initData.projectTreeData.clientId;
	const timestamp = getTimestamp(props.initData.projectTreeData.mainProjectTreeInfo.dateJoinedTimestampInSeconds);
	const projectid = generateUUID();
	const operations = [
		{
			type: 'create',
			data: {
				projectid: projectid,
				parentid: props.parentId,
				priority: props.priority, // 0 adds as first child, 1 as second, etc
			},
			clientTimestamp: timestamp,
		},
		{
			type: 'edit',
			data: {
				projectid: projectid,
				name: props.text,
				description: props.description,
			},
			clientTimestamp: timestamp,
		},
	];

	const pushPollData = JSON.stringify([
		{
			most_recent_operation_transaction_id: props.initData.projectTreeData.mainProjectTreeInfo.initialMostRecentOperationTransactionId,
			operations,
		},
	]);

	const form = new FormData();
	form.set('client_id', clientId);
	form.set('client_version', CLIENT_VERSION);
	form.set('push_poll_id', generatePollId());
	form.set('push_poll_data', pushPollData);

	try {
		const response = await fetch(WORKFLOWY_URL.UPDATE, {
			method: 'POST',
			body: form,
			headers: {
				Accept: 'application/json',
				Cookie: `sessionid=${props.sessionId}`,
			},
		});
		if (response.status !== 200) {
			throw new Error('${response.status} ${response.statusText}');
		}
		console.log(response);
		return projectid;
	} catch (err) {
		console.error(err);
		throw err;
	}
}

function getTimestamp(ts: number) {
	return Math.floor((Date.now() - ts) / 60);
}

function generatePollId() {
	const number = Math.floor(Math.random() * 100000000);
	return ('00000000' + number).slice(-8);
}

function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
