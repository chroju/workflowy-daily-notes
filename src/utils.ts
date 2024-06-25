export async function getTitleFromUrl(url: string): Promise<string> {
	try {
		// URLからデータを取得
		const response = await fetch(url);

		// ステータスコードが200以外の場合はエラーとなる
		if (!response.ok) {
			throw new Error(`Failed to load page, status code: ${response.status}`);
		}

		// レスポンスからHTMLをテキストとして取得
		const html = await response.text();

		// title要素を探す
		const titleElement = html.match(/<title>(.*)<\/title>/);

		// title要素があればそのテキストを、なければnullを返す
		return titleElement ? titleElement[0] : '';
	} catch (error) {
		console.error('Error fetching the title:', error);
		return '';
	}
}

export function isValidHttpUrl(string: string): boolean {
	try {
		const url = new URL(string);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false; // URLでない場合はfalseを返す
	}
}
