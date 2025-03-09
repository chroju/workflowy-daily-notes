import { init, createBullet, CreateBulletProps } from './workflowy';
import { html } from './html';
import { z } from 'zod';
import { getTitleFromUrl, isValidHttpUrl } from './utils';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	WORKFLOWY_DAILY_NOTES: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

const KV_KEYS = {
	TOKEN: 'token',
	JOURNAL_ROOT_ID: 'journalRootId',
	WEEKLY_NOTE_ID: 'weeklyNoteId',
	SESSION_ID: 'sessionId',
	PENDING_BULLET: 'pending_bullet', // 処理待ちのバレット情報
};

interface parsedRequest {
	path: string;
	method: string;
	body: any;
}

const requestSchema = z.object({
	text: z.string(),
	note: z.string().optional(),
	useDailyNote: z.boolean().optional().default(true),
	useTimestamp: z.boolean().optional().default(true),
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const path = new URL(request.url).pathname;
		const res = await validatePostRequest(request, env);
		switch (path) {
			case '/':
				return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
			case '/send':
				if (res !== null) {
					return res;
				}
				return send(request, env, ctx);
			case '/weekly':
				if (res !== null) {
					return getWeeklyNote(env);
				}
				return createWeeklyNote(env);
			default:
				return new Response('Not found', { status: 404 });
		}
	},
	async scheduled(event: Event, env: Env, ctx: ExecutionContext) {
		ctx.waitUntil(createWeeklyNote(env));
	},
};

async function validatePostRequest(request: Request, env: Env) {
	if (request.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 });
	}

	const token = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.TOKEN);
	if (request.headers.get('Authorization') !== `Bearer ${token}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	return null;
}

async function getWeeklyNote(env: Env) {
	const weeklyNoteId = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.WEEKLY_NOTE_ID);
	if (weeklyNoteId === null) {
		return new Response('Weekly note ID not found', { status: 404 });
	}

	const weeklyNotePath = weeklyNoteId.split('-').pop();
	const weeklyNoteURL = `https://workflowy.com/#/${weeklyNotePath}`;

	return new Response('', { status: 302, headers: { Location: weeklyNoteURL } });
}

async function createWeeklyNote(env: Env) {
	const sessionId = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.SESSION_ID);
	if (sessionId === null) {
		return new Response('Session ID not found', { status: 403 });
	}

	const parentId = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.JOURNAL_ROOT_ID);
	if (parentId === null) {
		return new Response('Parent ID not found', { status: 403 });
	}

	const initData = await init(sessionId);

	// Get current date (Monday) and next Sunday date in YYYY/MM/DD format
	const currentDate = new Date();
	// Format current date as YYYY/MM/DD
	const currentDateFormatted = `${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(
		currentDate.getDate()
	).padStart(2, '0')}`;

	// Calculate next Sunday (current date + days until next Sunday)
	const nextSunday = new Date(currentDate);
	const daysUntilSunday = 7 - currentDate.getDay();
	nextSunday.setDate(currentDate.getDate() + daysUntilSunday);
	// Format next Sunday as YYYY/MM/DD
	const nextSundayFormatted = `${nextSunday.getFullYear()}/${String(nextSunday.getMonth() + 1).padStart(2, '0')}/${String(
		nextSunday.getDate()
	).padStart(2, '0')}`;

	// Create the date range string
	const dateString = `${currentDateFormatted}-${nextSundayFormatted} `;

	const props: CreateBulletProps = {
		sessionId: sessionId,
		parentId: parentId,
		priority: 0,
		text: dateString,
		description: '',
		initData: initData,
	};

	const weeklyNoteBulletId = await createBullet(props);
	await env.WORKFLOWY_DAILY_NOTES.put(KV_KEYS.WEEKLY_NOTE_ID, weeklyNoteBulletId);

	return new Response('Created weekly note', { status: 200 });
}

async function send(request: Request, env: Env, ctx: ExecutionContext) {
	// リクエストのJSONをパースする処理だけは同期的に行う
	let reqBody;
	try {
		reqBody = await request.json();
	} catch (err) {
		return new Response('Invalid JSON', { status: 400 });
	}

	// 残りの処理はすべて非同期で実行
	ctx.waitUntil(processRequest(reqBody, env));

	// 即座に成功レスポンスを返す
	return new Response('Request accepted', { status: 200 });
}

// 非同期で実行される処理
async function processRequest(reqBody: any, env: Env) {
	try {
		// リクエストのバリデーション
		const req = requestSchema.parse(reqBody);

		// セッションIDの取得
		const sessionId = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.SESSION_ID);
		if (sessionId === null) {
			console.error('Session ID not found');
			return;
		}

		// 親IDの取得
		const parentId = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.WEEKLY_NOTE_ID);
		if (parentId === null) {
			console.error('Weekly note ID not found');
			return;
		}

		// URLからタイトルを取得
		let text = req.text;
		if (isValidHttpUrl(text) && 'x.com' !== new URL(text).hostname) {
			const title = await getTitleFromUrl(text);
			if (title) {
				text = `${title} ${text}`;
			}
		}
		text = `${text} #inbox`;

		// タイムスタンプの追加
		if (req.useTimestamp) {
			const date = new Date();
			date.setHours(date.getHours() + 9);
			const timestamp = date.toTimeString().split(' ')[0].split(':').slice(0, 2).join(':');
			text = `${timestamp} ${text}`;
		}

		// Workflowyの初期化
		const initData = await init(sessionId);

		// バレット作成に必要な情報をKVに保存
		const bulletInfo = {
			sessionId: sessionId,
			parentId: parentId,
			priority: 1000000,
			text: text,
			description: req.note ?? '',
			initDataJson: JSON.stringify(initData),
			createdAt: Date.now(),
		};

		// KVに保存
		await env.WORKFLOWY_DAILY_NOTES.put(KV_KEYS.PENDING_BULLET, JSON.stringify(bulletInfo));

		// バレットの作成
		await processPendingBullet(env);
	} catch (err) {
		console.error('Error processing request:', err);
	}
}

// バックグラウンドでバレットを作成する関数
async function processPendingBullet(env: Env) {
	// KVからバレット情報を取得
	const bulletInfoJson = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.PENDING_BULLET);
	if (!bulletInfoJson) return;

	try {
		const bulletInfo = JSON.parse(bulletInfoJson);

		// initDataをJSONから復元
		const initData = JSON.parse(bulletInfo.initDataJson);

		// CreateBulletPropsを作成
		const props: CreateBulletProps = {
			sessionId: bulletInfo.sessionId,
			parentId: bulletInfo.parentId,
			priority: bulletInfo.priority,
			text: bulletInfo.text,
			description: bulletInfo.description,
			initData: initData,
		};

		// バレットを作成
		await createBullet(props);

		// 処理が完了したらKVから削除
		await env.WORKFLOWY_DAILY_NOTES.delete(KV_KEYS.PENDING_BULLET);

		console.log('Bullet created successfully in background');
	} catch (error) {
		console.error('Error creating bullet in background:', error);
		// エラーが発生しても、KVからは削除しない
		// 次回の実行時に再試行される可能性がある
	}
}
