import { init, createBullet, CreateBulletProps } from './workflowy';
import { z } from 'zod';
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
	DAILY_NOTE_ID: 'dailyNoteId',
	SESSION_ID: 'sessionId',
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
		switch (path) {
			case '/':
				return new Response('Hello world!');
			case '/send':
				return send(request, env);
			case '/daily':
				return createDailyNote(request, env);
			default:
				return new Response('Not found', { status: 404 });
		}
	},
};

async function createDailyNote(request: Request, env: Env) {
	if (request.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 });
	}

	const token = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.TOKEN);
	if (request.headers.get('Authorization') !== `Bearer ${token}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	const sessionId = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.SESSION_ID);
	if (sessionId === null) {
		return new Response('Session ID not found', { status: 403 });
	}

	const parentId = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.JOURNAL_ROOT_ID);
	if (parentId === null) {
		return new Response('Parent ID not found', { status: 403 });
	}

	const initData = await init(sessionId);

	// Get current date string (e.g. 2024-01-20)
	const date = new Date();
	const dateString = date.toISOString().split('T')[0];

	const props: CreateBulletProps = {
		sessionId: sessionId,
		parentId: parentId,
		priority: 0,
		text: dateString,
		description: '',
		initData: initData,
	};

	const dailyNoteBulletId = await createBullet(props);
	await env.WORKFLOWY_DAILY_NOTES.put(KV_KEYS.DAILY_NOTE_ID, dailyNoteBulletId);

	return new Response('Created daily note', { status: 200 });
}

async function send(request: Request, env: Env) {
	if (request.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 });
	}

	const token = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.TOKEN);
	if (request.headers.get('Authorization') !== `Bearer ${token}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	const sessionId = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.SESSION_ID);
	if (sessionId === null) {
		return new Response('Session ID not found', { status: 403 });
	}

	const parentId = await env.WORKFLOWY_DAILY_NOTES.get(KV_KEYS.DAILY_NOTE_ID);
	if (parentId === null) {
		return new Response('Daily note ID not found', { status: 403 });
	}

	try {
		const req = requestSchema.parse(await request.json());
		req.text = `${req.text} #inbox`;

		if (req.useTimestamp) {
			// get current time in +0900 timezone with format like 12:34
			const date = new Date();
			date.setHours(date.getHours() + 9);
			const timestamp = date.toTimeString().split(' ')[0].split(':').slice(0, 2).join(':');

			req.text = `${timestamp} ${req.text}`;
		}
		const initData = await init(sessionId);

		const props: CreateBulletProps = {
			sessionId: sessionId,
			parentId: parentId,
			priority: 1000000,
			text: req.text,
			description: req.note ?? '',
			initData: initData,
		};
		await createBullet(props);
		return new Response('Created bullet', { status: 200 });
	} catch (err) {
		if (err instanceof z.ZodError) {
			return new Response(err.message, { status: 400 });
		}
		return new Response('Bad request', { status: 400 });
	}
}
