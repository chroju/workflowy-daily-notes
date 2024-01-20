// To parse this data:
//
//   import { Convert, DataD } from "./file";
//
//   const dataD = Convert.toDataD(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface ResultD {
	results: Result[];
}

export interface Result {
	new_most_recent_operation_transaction_id: string;
	server_run_operation_transaction_json: string;
	concurrent_remote_operation_transactions: any[];
	error_encountered_in_remote_operations: boolean;
	new_polling_interval_in_ms: number;
	items_created_in_current_month: number;
	monthly_item_quota: number;
}

export interface ServerRunOperationTransactionJSON {
	ops: Op[];
	ppid: string;
	id: number;
	client_timestamp: number;
}

export interface Op {
	type: string;
	data: Data;
}

export interface Data {
	projectid: string;
	parentid?: string;
	priority?: number;
	name?: string;
	description?: string;
}

export interface InitData {
	projectTreeData: ProjectTreeData;
	user: User;
	globals: Array<Array<boolean | GlobalClass | number | string>>;
	settings: Settings;
	features: Feature[];
	rootProjectMetadata: RootProjectMetadata;
	files_stats: FilesStats;
	payment: Payment;
}

export interface Feature {
	name: string;
	description: string;
	codename: string;
	label: null | string;
	beta: boolean;
	workflowy_dev: boolean;
}

export interface FilesStats {
	folder_size_limit: number;
}

export interface GlobalClass {
	signup_big_try_out_small: FriendRecommendationV1;
	share_to_refer: FriendRecommendationV1;
	onboarding_emails: FriendRecommendationV1;
	friend_recommendation_v1: FriendRecommendationV1;
	weekly_report: FriendRecommendationV1;
	stripe_elements_exp: StripeElementsExp;
}

export interface FriendRecommendationV1 {
	group: string;
	code: number;
}

export interface StripeElementsExp {
	group: string;
}

export interface Payment {
	plans: Plans;
	upgrade: Upgrade;
}

export interface Plans {
	individual: Individual[];
	team: Individual[];
}

export interface Individual {
	type: Type;
	plan_id: string;
	dollars: number;
	description: string;
	default?: boolean;
}

export enum Type {
	Individual = 'individual',
	Team = 'team',
}

export interface Upgrade {
	dialog: Dialog;
}

export interface Dialog {
	notice: string;
}

export interface ProjectTreeData {
	mainProjectTreeInfo: MainProjectTreeInfo;
	auxiliaryProjectTreeInfos: any[];
	clientId: string;
}

export interface MainProjectTreeInfo {
	rootProject: null;
	rootProjectChildren: RootProjectChild[];
	sharedData: SharedData;
	initialMostRecentOperationTransactionId: string;
	initialPollingIntervalInMs: number;
	serverExpandedProjectsList: string[];
	isReadOnly: null;
	ownerId: number;
	ownerName: string;
	dateJoinedTimestampInSeconds: number;
	itemsCreatedInCurrentMonth: number;
	monthlyItemQuota: number;
	rootProjectMetadata: RootProjectMetadata;
}

export interface RootProjectChild {
	id: string;
	nm: string;
	ct: number;
	metadata: RootProjectChildMetadata;
	lm: number;
	ch?: RootProjectChildCh[];
	no?: string;
	cp?: number;
}

export interface RootProjectChildCh {
	id: string;
	nm: string;
	ct: number;
	metadata: CunningMetadata;
	lm: number;
	ch?: PurpleCh[];
	cp?: number;
	no?: string;
	shared?: Shared;
}

export interface PurpleCh {
	id: string;
	nm: string;
	ct: number;
	metadata: AmbitiousMetadata;
	no?: string;
	lm: number;
	ch?: FluffyCh[];
}

export interface FluffyCh {
	id: string;
	nm: string;
	ct: number;
	metadata: HilariousMetadata;
	lm: number;
	no?: string;
	ch?: TentacledCh[];
	cp?: number;
}

export interface TentacledCh {
	id: string;
	nm: string;
	ct: number;
	metadata: IndecentMetadata;
	lm: number;
	ch?: StickyCh[];
	lmb?: number;
	cp?: number;
	no?: string;
}

export interface StickyCh {
	id: string;
	nm: string;
	ct: number;
	metadata: IndigoMetadata;
	lm: number;
	ch?: IndigoCh[];
	lmb?: number;
	cp?: number;
	no?: string;
}

export interface IndigoCh {
	id: string;
	nm: string;
	ct: number;
	metadata: StickyMetadata;
	lm: number;
	ch?: IndecentCh[];
	cp?: number;
	no?: string;
}

export interface IndecentCh {
	id: string;
	nm: string;
	ct: number;
	metadata: TentacledMetadata;
	lm: number;
	ch?: HilariousCh[];
	cp?: number;
	no?: string;
}

export interface HilariousCh {
	id: string;
	nm: string;
	ct: number;
	metadata: FluffyMetadata;
	lm: number;
	ch?: AmbitiousCh[];
	cp?: number;
}

export interface AmbitiousCh {
	id: string;
	nm: string;
	ct: number;
	metadata: PurpleMetadata;
	lm: number;
	ch?: CunningCh[];
}

export interface CunningCh {
	id: string;
	nm: string;
	ct: number;
	metadata: PurpleMetadata;
	lm: number;
	ch?: MagentaCh[];
}

export interface MagentaCh {
	id: string;
	nm: string;
	ct: number;
	metadata: ReadStates;
	lm: number;
	ch?: MagentaCh[];
}

export interface ReadStates {}

export interface PurpleMetadata {
	changes?: PurpleChanges;
}

export interface PurpleChanges {
	ct: CT;
}

export interface CT {
	by: number;
}

export interface FluffyMetadata {
	changes?: PurpleChanges;
	s3File?: S3File;
	mirror?: PurpleMirror;
	originalId?: string;
	isVirtualRoot?: boolean;
}

export interface PurpleMirror {
	originalId: string;
	isMirrorRoot: boolean;
}

export interface S3File {
	isFile: boolean;
	fileName: string;
	fileType: FileType;
	objectFolder: string;
	isAnimatedGIF?: boolean;
	imageOriginalWidth?: number;
	imageOriginalHeight?: number;
	explicitSize?: ExplicitSize;
}

export interface ExplicitSize {
	width: number;
	height: number;
}

export enum FileType {
	ApplicationPDF = 'application/pdf',
	ImageJPEG = 'image/jpeg',
	ImagePNG = 'image/png',
}

export interface TentacledMetadata {
	changes?: FluffyChanges;
	s3File?: S3File;
	mirror?: FluffyMirror;
	backlink?: Backlink;
	originalId?: string;
	isVirtualRoot?: boolean;
	isReferencesRoot?: boolean;
	virtualRootIds?: { [key: string]: boolean };
}

export interface Backlink {
	sourceID: string;
	targetID: string;
}

export interface FluffyChanges {
	ct?: CT;
	et?: Et;
}

export interface Et {
	by: number;
	ts: number;
}

export interface FluffyMirror {
	originalId?: string;
	isMirrorRoot?: boolean;
	backlinkMirrorRootIds?: ReadStates;
	mirrorRootIds?: { [key: string]: boolean };
}

export interface StickyMetadata {
	changes?: FluffyChanges;
	layoutMode?: RootProjectMetadataLayoutMode;
	mirror?: FluffyMirror;
	originalId?: string;
	isVirtualRoot?: boolean;
	backlink?: Backlink;
	isReferencesRoot?: boolean;
	s3File?: S3File;
	virtualRootIds?: { [key: string]: boolean };
}

export enum RootProjectMetadataLayoutMode {
	Bullets = 'bullets',
	Dashboard = 'dashboard',
	P = 'p',
	Todo = 'todo',
}

export interface IndigoMetadata {
	changes?: TentacledChanges;
	s3File?: S3File;
	layoutMode?: RootProjectMetadataLayoutMode;
	mirror?: TentacledMirror;
	originalId?: string;
	isVirtualRoot?: boolean;
	virtualRootIds?: { [key: string]: boolean };
	isReferencesRoot?: boolean;
	backlink?: Backlink;
}

export interface TentacledChanges {
	et?: Et;
	mv?: Mv;
	ct?: CT;
}

export interface Mv {
	by: number;
	ts: number;
	from: string;
}

export interface TentacledMirror {
	backlinkMirrorRootIds?: { [key: string]: boolean };
	originalId?: string;
	isMirrorRoot?: boolean;
	mirrorRootIds?: { [key: string]: boolean };
}

export interface IndecentMetadata {
	changes?: TentacledChanges;
	layoutMode?: RootProjectMetadataLayoutMode;
	s3File?: S3File;
	mirror?: TentacledMirror;
	virtualRootIds?: { [key: string]: boolean };
	originalId?: string;
	isVirtualRoot?: boolean;
	isReferencesRoot?: boolean;
}

export interface HilariousMetadata {
	changes?: FluffyChanges;
	layoutMode?: PurpleLayoutMode;
	s3File?: S3File;
	mirror?: StickyMirror;
	originalId?: string;
	isVirtualRoot?: boolean;
	virtualRootIds?: RootIDS;
	participants?: Participants;
}

export enum PurpleLayoutMode {
	Bullets = 'bullets',
	Dashboard = 'dashboard',
	H1 = 'h1',
}

export interface StickyMirror {
	originalId?: string;
	isMirrorRoot?: boolean;
	mirrorRootIds?: RootIDS;
	backlinkMirrorRootIds?: ReadStates;
}

export interface RootIDS {
	'9e9f5cf9-a3cd-5baa-fcdf-f623bdaf1c56': boolean;
}

export interface Participants {
	'1085631': string;
}

export interface AmbitiousMetadata {
	isReferencesRoot?: boolean;
	changes?: FluffyChanges;
	mirror?: IndigoMirror;
	virtualRootIds?: { [key: string]: boolean };
}

export interface IndigoMirror {
	mirrorRootIds: { [key: string]: boolean };
}

export interface CunningMetadata {
	mirror?: IndigoMirror;
	layoutMode?: RootProjectMetadataLayoutMode;
	virtualRootIds?: { [key: string]: boolean };
	changes?: FluffyChanges;
	participants?: Participants;
}

export interface Shared {
	share_id: string;
	url_shared_info: URLSharedInfo;
}

export interface URLSharedInfo {
	write_permission: boolean;
	permission_level: number;
	access_token: string;
}

export interface RootProjectChildMetadata {
	layoutMode?: string;
}

export interface RootProjectMetadata {
	layoutMode: RootProjectMetadataLayoutMode;
	latestColor: LatestColor;
	color: Color;
	slash: Slash;
	searchForChangesAfter: number;
	_recentlySavedTo: { [key: string]: number };
	dateFormat: string;
	timeFormat: string;
	starring: Starring;
}

export interface Color {
	tags: { [key: string]: number };
}

export interface LatestColor {
	attribute: number;
	value: number;
}

export interface Slash {
	discovered: boolean;
}

export interface Starring {
	locations: Locations;
	isSynced: boolean;
}

export interface Locations {
	'd2251920-49c8-b08a-6d39-7bd9b26c8b2b': string;
	'None_#do -is:complete ': string;
	None_today: string;
	'None_#migrate': string;
}

export interface SharedData {
	'0cee699a-d05b-d754-7398-bf0b84452f04': The0Cee699AD05BD7547398Bf0B84452F04;
}

export interface The0Cee699AD05BD7547398Bf0B84452F04 {
	share_id: string;
	url_shared_info: URLSharedInfo;
	team_space: TeamSpace;
}

export interface TeamSpace {
	is_team_space: boolean;
	has_active_subscription: boolean;
	is_subscription_holder: boolean;
	is_member: boolean;
}

export interface Settings {
	theme: string;
	font: string;
	show_completed: boolean;
	show_keyboard_shortcuts: boolean;
	unsubscribe_from_summary_emails: boolean;
	backup_to_dropbox: boolean;
	email: string;
	username: string;
	saved_views_json: string;
	features: { [key: string]: boolean };
	mfa: Mfa;
	read_states: ReadStates;
}

export interface Mfa {
	enabled: boolean;
}

export interface User {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	dateJoined: Date;
	emailVerified: boolean;
	hasPassword: boolean;
	itemsCreated: number;
	monthlyItemQuota: number;
	referralLink: string;
	inviteLink: string;
	referrerBonus: number;
	refereeBonus: number;
	isPro: boolean;
	isCancelled: boolean;
	hasActiveSubscription: boolean;
	subscriptionEnd: Date;
	isFreePro: boolean;
	isFreeTrial: boolean;
	isDev: boolean;
	isStripe: boolean;
}
