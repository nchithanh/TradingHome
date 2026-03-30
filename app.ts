type HistoricalQuote = {
  date: string;
  symbol: string;
  priceOpen?: number;
  priceClose?: number;
  priceChange?: number | null;
  [key: string]: unknown;
};

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
};

type PictureInPictureWindowHost = Window & {
  documentPictureInPicture?: {
    requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
  };
};

type MappingRow = Record<string, string | number | null | undefined>;

type SortState = {
  key: string;
  direction: "asc" | "desc";
};

type AppSettings = {
  token: string;
  language: Language;
  symbols: string;
  startDate: string;
  endDate: string;
  notifyEnabled?: boolean;
  notifyOnHedgeChange?: boolean;
  notifyOnBuySignal?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  discordWebhookUrl?: string;
  portfolioPositions?: Array<{ symbol: string; price: number; quantity: number; sellPrice?: number; marginPct?: number }>;
  cashTransactions?: Array<{
    type: "deposit" | "withdrawal";
    amount: number;
    description: string;
    createdAt?: string;
  }>;
  derivativesOrders?: DerivativeOrder[];
};

type DerivativeOrder = {
  symbol: string;
  type: "long" | "short";
  quantity: number;
  entryPrice: number;
  closePrice?: number;
  description: string;
};

/** Mô phỏng thủ công — không lưu vào tổng tài sản / overview */
type SimDerivManualRow = {
  type: "long" | "short";
  quantity: number;
  entryPrice: number;
  closePrice: number;
};

type CashTransaction = { type: "deposit" | "withdrawal"; amount: number; description: string; createdAt?: string };

type PortfolioPosition = { symbol: string; price: number; quantity: number; sellPrice?: number; marginPct?: number };

type MappingColumn = {
  key: string;
  label: string;
  group: string;
  formatter: (value: unknown) => string;
  focusSymbol?: string;
  cellClassName?: (value: unknown) => string;
};

type HedgeState = "No hedge" | "Watch" | "Hedge on" | "Stop hedge" | "Basis risk";
type Language = "vi" | "ja" | "en" | "zh" | "ko";

const HEDGE_WINDOWS = {
  basisZScore: 20,
  trackingError: 20
} as const;

const BOTTOM_SIGNAL = {
  volumeWindow: 20,
  volumeMultiplier: 2
} as const;

const BUY_SIGNAL = {
  minPassCount: 4,
  discountFromPeakPct: 25,
  peakLookback: 60,
  rsiPeriod: 14,
  rsiOversold: 30,
  maShort: 5,
  maLong: 20,
  volumeWindow: 20,
  bbPeriod: 20,
  bbStd: 2
} as const;

const BUY_SIGNAL_NAMES: Record<string, string> = {
  sig1: "Volume spike + reversal",
  sig2: "Chiết khấu sâu + volume nhỏ dần",
  sig3: "RSI oversold",
  sig4: "Higher lows",
  sig5: "Golden cross",
  sig6: "Bollinger bounce",
  sig7: "Volume tăng khi giá tăng"
};

function isBaseSymbol(symbol: string): boolean {
  return symbol !== "VN30" && !symbol.startsWith("VN30F");
}

const HEDGE_THRESHOLDS = {
  entryBaseReturnPct: -0.6,
  stopRecoveryPct: 0.35,
  corr20EntryMin: 0.85,
  corr20StopMax: 0.7,
  trackingError20EntryMax: 0.8,
  trackingError20StopMax: 1.2,
  basisZScoreEntryMax: 1.5,
  basisZScoreExtreme: 2.25,
  basisChangeShock: 4
} as const;

const PAGE_SIZE = 200;
const API_BASE_URL = "https://restv2.fireant.vn/symbols";
const SUGGEST_API_DELAY_MS = 400;

const HOSE_SYMBOLS: string[] = [
  "AAM", "ABB", "ABT", "ACB", "ACG", "ACL", "ADG", "ADS", "AGG", "AMD", "ANV", "APH", "ASM",
  "BBC", "BCE", "BCG", "BCM", "BID", "BII", "BMP", "BWE", "CII", "CKV", "CLC", "CMG", "CMV", "COM", "CRE", "CTG", "CTR",
  "DBC", "DCM", "DGW", "DHA", "DHG", "DPM", "DPG", "DQG", "DRC", "DXG", "DXS",
  "EIB", "EVF", "EVG", "FPT", "FRT",
  "GAS", "GEX", "GMD", "GVR", "HAG", "HCM", "HDC", "HDG", "HNG", "HPG", "HSG", "HT1",
  "IMP", "ITA", "KBC", "KDC", "KDH", "KOS", "KPF", "LPB", "LSS",
  "MBB", "MIG", "MSB", "MSN", "MWG", "NLG", "NSC", "NTL", "NVL",
  "OCB", "OPC", "ORS", "PDR", "PET", "PHR", "PLX", "PMG", "POM", "POW", "PPC", "PSH", "PVD", "PVT",
  "REE", "SAB", "SAM", "SBT", "SHP", "SIP", "SSB", "SSI", "STB", "SZC",
  "TCB", "TLG", "TMP", "TPB", "TSB",
  "VCI", "VGC", "VGI", "VHC", "VHM", "VIB", "VIC", "VJC", "VND", "VNM", "VOS", "VPB", "VPI", "VRE", "VTP",
  "ZSC"
];
const LANGUAGE_STORAGE_KEY = "fireant-language";
const APP_SETTINGS_API_PATH = "/api/settings";
const SIM_DERIV_MANUAL_STORAGE_KEY = "investing-sim-derivatives-manual-v2";
const NOTIFY_API_PATH = "/api/notify";
const FUTURES_POINT_VALUE = 100_000;
const FUTURES_MARGIN_PER_CONTRACT = 10_000_000;

const UI_TEXT = {
  vi: {
    appTitle: "FireAnt Downloader",
    noteIntroHtml:
      'Trang này có thể đọc dữ liệu sẵn trong <code>data</code> để hiển thị mapping ngay, hoặc gọi API FireAnt để tải và cập nhật file JSON.',
    noteUsageHtml:
      'Nên mở qua <code>http://localhost</code> hoặc local server để trình duyệt cho phép chọn thư mục và ghi file. Bạn có thể chọn trực tiếp thư mục <code>data</code> hoặc thư mục gốc của project.',
    tokenLabel: "Bearer token",
    tokenPlaceholder: "Dán Bearer token vào đây. Có thể dán cả chuỗi Bearer ...",
    languageLabel: "Ngôn ngữ",
    symbolsLabel: "Mã",
    symbolsPlaceholder: "VD: VN30,VN30F1M,HPG,SSI",
    startDateLabel: "Ngày bắt đầu",
    endDateLabel: "Ngày kết thúc",
    vn30AssetLabel: "Tài sản VN30",
    vn30f1mAssetLabel: "Ký quỹ VN30F1M",
    notifyEnabledLabel: "Bật thông báo",
    notifyOnHedgeLabel: "Khi đổi trạng thái hedge",
    notifyOnBuyLabel: "Khi có gợi ý mua (4/7)",
    assetInputPlaceholder: "100.000.000",
    suggestButton: "Gợi ý đáy HOSE",
    suggestModalTitle: "Gợi ý tạo đáy HOSE",
    suggestScanning: "Đang quét...",
    suggestFound: "Tìm thấy",
    suggestNone: "Không có mã nào thỏa điều kiện.",
    suggestAddToWatch: "Thêm vào theo dõi",
    loadButton: "Đọc data có sẵn",
    pipButtonOpen: "Mở cửa sổ nổi (PiP)",
    pipButtonClose: "Đóng cửa sổ nổi (PiP)",
    pipUnsupported: "PiP không hỗ trợ",
    summaryIdle: "Chưa chạy.",
    detailPanelTitle: "Chi tiết",
    detailHint: "Click vào một dòng hoặc ô trong bảng để xem chi tiết.",
    overviewVn30Label: "Tổng tiền còn VN30",
    overviewFuturesLabel: "Tổng lãi/lỗ VN30F1M",
    overviewTotalLabel: "Tổng tài sản",
    overviewBaseDateLabel: "Theo ngày",
    overviewNoData: "Chưa có dữ liệu",
    overviewHeaderInitialAssetLabel: "Tổng tài sản lúc đầu",
    overviewHeaderPnLLabel: "Lãi/lỗ",
    overviewHeaderNetAssetLabel: "Tài sản ròng",
    tableEmpty: "Chưa có dữ liệu mapping.",
    noPipData: "Chưa có dữ liệu để hiển thị.",
    noData: "Không có dữ liệu.",
    noDataForDate: "Không có dữ liệu cho ngày này.",
    noVisibleSymbols: "Không còn mã nào đang hiển thị.",
    pipTitle: "Tín hiệu hedge",
    dateLabel: "Ngày",
    restoreAll: "Hiện lại tất cả",
    hiddenColumnsLabel: "Cột đang ẩn",
    restoreColumns: "Hiện lại cột",
    hideColumnTitle: "Ẩn cột",
    quickMetrics: "Chỉ số nhanh",
    reasonLabel: "Lý do",
    watchedSymbols: "Mã theo dõi",
    closePrice: "Đóng cửa",
    closePriceColumn: "đóng cửa",
    priceChangeLabel: "Biến động",
    returnPctLabel: "Lợi nhuận %",
    basisLabel: "Basis",
    basisChangeLabel: "Biến động basis",
    basisRiskExplainTitle: "Vì sao Basis risk",
    basisZScoreLabel: "Basis Z",
    trackingLabel: "Tracking",
    assetValueLabel: "Giá trị tài sản",
    detailMetricsTitle: "Chỉ số hedging",
    hedgeStateLabel: "Trạng thái hedge",
    shortSignalLabel: "Tín hiệu short",
    stopSignalLabel: "Tín hiệu dừng",
    spreadReturnLabel: "Spread return %",
    signalScoreLabel: "Signal score",
    groupGeneral: "Thông tin chung",
    groupHedging: "Hedging",
    dateColumn: "Ngày",
    assetAppliedDateColumn: "Ngày áp dụng tiền",
    priceChangeColumn: "priceChange",
    returnPctColumn: "return %",
    bottomColumnLabel: "Đáy",
    buyColumnLabel: "Gợi ý",
    buySignalsTitle: "Chỉ báo mua",
    passLabel: "PASS",
    failLabel: "FAIL",
    assetValueColumn: "giá trị",
    basisChangeColumn: "basisChange",
    spreadReturnColumn: "spreadReturn %",
    trackingError20Column: "trackingError20",
    signalScoreColumn: "signalScore",
    priceChangeSpreadColumn: "priceChange spread",
    runButton: "Tải và lưu JSON",
    pleaseEnterSymbol: "Vui lòng nhập ít nhất một mã.",
    startEndRequired: "Ngày bắt đầu và ngày kết thúc là bắt buộc.",
    startBeforeEnd: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.",
    uiNotFound: "Không tìm thấy thành phần giao diện.",
    pipBrowserUnsupported: "Document Picture-in-Picture chưa được hỗ trợ trong trình duyệt này.",
    noMatchingJson: "Không tìm thấy file JSON phù hợp trong data/.",
    bearerRequired: "Bearer token là bắt buộc.",
    showDirPickerUnsupported: "showDirectoryPicker chưa được hỗ trợ. Hãy mở trang này từ localhost trên Edge hoặc Chrome.",
    selectDataFolder: "Vui lòng chọn thư mục data hoặc thư mục gốc của project.",
    selectedFolderAlreadyData: "Thư mục đã chọn chính là data, file sẽ được lưu trực tiếp tại đây.",
    selectedFolderProjectRoot: "Đã chọn thư mục gốc project, sẽ dùng thư mục con data/.",
    loadingLocalTable: "Đang đọc dữ liệu local...",
    loadingLocalSummary: "Đang đọc dữ liệu local...",
    localDataNotFound: "Không tìm thấy dữ liệu local phù hợp.",
    loadingRemoteTable: "Đang tải dữ liệu...",
    runningSummary: "Đang chạy...",
    tryingLoadExisting: "Đang thử đọc JSON có sẵn từ data/ ...",
    noLocalDataSummary: "Chưa có dữ liệu local. Bạn có thể bấm 'Đọc data có sẵn' hoặc tải mới.",
    noLocalDataTable: "Chưa có dữ liệu local.",
    autoLoadSkipped: "Bỏ qua tự động đọc",
    failed: "Thất bại.",
    done: "Hoàn tất.",
    loadedExisting: "Đã đọc JSON có sẵn từ data/.",
    savedToSelectedData: "Đã lưu vào data/ trong thư mục bạn đã chọn.",
    missingLabel: "Thiếu",
    rangeLabel: "khoảng",
    rowsLabel: "dòng",
    saveSettingsButton: "Lưu cài đặt",
    settingsSaved: "Đã lưu cài đặt.",
    portfolioTitle: "Danh mục",
    portfolioDesc: "Nhập mã CK, giá vốn, số lượng. Lãi/lỗ theo giá đóng cửa ngày mới nhất trong bảng data.",
    portfolioColSymbol: "Mã",
    portfolioColPrice: "Giá vốn",
    portfolioColQty: "SL",
    portfolioColTotal: "Tổng vốn",
    portfolioColActualCapital: "Tổng vốn thực",
    portfolioColCurrentPrice: "Giá",
    portfolioColSellPrice: "Giá bán",
    portfolioColMarginPct: "Margin %",
    portfolioColPnL: "Lãi/lỗ",
    portfolioColPnLPct: "Lãi/lỗ %",
    portfolioAddRow: "+ Thêm dòng",
    portfolioTotalLabel: "Tổng vốn:",
    portfolioCurrentLabel: "Tổng hiện tại:",
    portfolioPnLLabel: "Lãi/lỗ:",
    portfolioMarginLabel: "Margin %",
    portfolioDebtLabel: "Tổng nợ:",
    cashTitle: "Tiền mặt",
    cashDesc: "Nhập lệnh nộp/rút tiền, số tiền, mô tả.",
    cashColType: "Loại",
    cashColAmount: "Số tiền",
    cashColDesc: "Mô tả",
    cashColCreatedAt: "Tạo lúc",
    cashTypeDeposit: "Nộp",
    cashTypeWithdrawal: "Rút",
    cashAddRow: "+ Thêm dòng",
    cashTotalLabel: "Tổng tiền mặt:",
    derivativesSectionTitle: "Phái sinh",
    derivativesSectionDesc: "Nhập các lệnh phái sinh: mã hợp đồng, long/short, số lượng, giá.",
    simDerivTabTitle: "Mô phỏng phái sinh",
    simDerivTabDesc:
      "Nhập giá vào, giá đóng và khối lượng để xem lãi/lỗ (1 điểm = 100.000đ). Chỉ mô phỏng — không cộng vào tổng tài sản hay Tổng quan.",
    simDerivColType: "Loại",
    simDerivColQty: "SL",
    simDerivColEntry: "Giá vào",
    simDerivColClose: "Giá đóng",
    simDerivColPnL: "Lãi/lỗ",
    simDerivAddRow: "+ Thêm dòng",
    simDerivClearBtn: "Xóa mô phỏng",
    simDerivTotalPnLLabel: "Tổng Lãi/lỗ (mô phỏng)",
    derivColSymbol: "Mã HĐ",
    derivColType: "Loại",
    derivColQty: "SL",
    derivColPrice: "Giá vào",
    derivColClosePrice: "Giá đóng",
    derivColPnL: "Lãi/lỗ",
    derivColDesc: "Mô tả",
    derivTypeLong: "Long",
    derivTypeShort: "Short",
    derivativesAddRow: "+ Thêm dòng",
    derivativesTotalLabel: "Tổng lệnh:",
    derivativesPnLLabel: "Tổng lãi/lỗ:",
    tabSearchPlaceholder: "Tìm trong tab này…",
    tabSearchHint: "Gõ để lọc dòng; để trống để xem tất cả dòng.",
    tabSearchNoMatch: "Không có dòng nào khớp. Xóa ô tìm kiếm để xem lại dữ liệu."
  },
  ja: {
    appTitle: "FireAnt Downloader",
    noteIntroHtml:
      'このページは <code>data</code> の既存データを読み込んですぐにマッピングを表示するか、FireAnt API を呼び出して JSON を取得・更新できます。',
    noteUsageHtml:
      'フォルダー選択と書き込みを許可するため、<code>http://localhost</code> またはローカルサーバー経由で開いてください。<code>data</code> フォルダー、またはプロジェクトのルートを直接選択できます。',
    tokenLabel: "Bearer token",
    tokenPlaceholder: "Bearer token をここに貼り付けます。Bearer ... を含めても構いません。",
    languageLabel: "言語",
    symbolsLabel: "銘柄",
    symbolsPlaceholder: "例: VN30,VN30F1M,HPG,SSI",
    startDateLabel: "開始日",
    endDateLabel: "終了日",
    vn30AssetLabel: "VN30 資産",
    vn30f1mAssetLabel: "VN30F1M 証拠金",
    notifyEnabledLabel: "通知を有効にする",
    notifyOnHedgeLabel: "ヘッジ状態変更時",
    notifyOnBuyLabel: "買いシグナル (4/7) 時",
    assetInputPlaceholder: "100.000.000",
    suggestButton: "HOSE底候補",
    suggestModalTitle: "HOSE底形成候補",
    suggestScanning: "スキャン中...",
    suggestFound: "見つかりました",
    suggestNone: "条件を満たす銘柄はありません。",
    suggestAddToWatch: "監視に追加",
    loadButton: "既存データを読む",
    pipButtonOpen: "フローティングウィンドウを開く (PiP)",
    pipButtonClose: "フローティングウィンドウを閉じる (PiP)",
    pipUnsupported: "PiP 非対応",
    summaryIdle: "未実行です。",
    detailPanelTitle: "詳細",
    detailHint: "表の行またはセルをクリックすると詳細を表示します。",
    overviewVn30Label: "VN30 残り資産",
    overviewFuturesLabel: "VN30F1M 損益合計",
    overviewTotalLabel: "総資産",
    overviewBaseDateLabel: "対象日",
    overviewNoData: "データなし",
    overviewHeaderInitialAssetLabel: "初期総資産",
    overviewHeaderPnLLabel: "損益",
    overviewHeaderNetAssetLabel: "純資産",
    tableEmpty: "マッピングデータがありません。",
    noPipData: "表示するデータがありません。",
    noData: "データがありません。",
    noDataForDate: "この日のデータはありません。",
    noVisibleSymbols: "表示中の銘柄がありません。",
    pipTitle: "ヘッジシグナル",
    dateLabel: "日付",
    restoreAll: "すべて再表示",
    hiddenColumnsLabel: "非表示の列",
    restoreColumns: "列を戻す",
    hideColumnTitle: "列を隠す",
    quickMetrics: "主要指標",
    reasonLabel: "理由",
    watchedSymbols: "監視銘柄",
    closePrice: "終値",
    closePriceColumn: "終値",
    priceChangeLabel: "変動",
    returnPctLabel: "収益率 %",
    basisLabel: "Basis",
    basisChangeLabel: "Basis変動",
    basisRiskExplainTitle: "Basis riskの理由",
    basisZScoreLabel: "Basis Z",
    trackingLabel: "Tracking",
    assetValueLabel: "資産価値",
    detailMetricsTitle: "ヘッジ指標",
    hedgeStateLabel: "ヘッジ状態",
    shortSignalLabel: "ショートシグナル",
    stopSignalLabel: "停止シグナル",
    spreadReturnLabel: "スプレッド収益率 %",
    signalScoreLabel: "シグナルスコア",
    groupGeneral: "共通情報",
    groupHedging: "ヘッジ",
    dateColumn: "日付",
    assetAppliedDateColumn: "資金適用日",
    priceChangeColumn: "priceChange",
    returnPctColumn: "return %",
    bottomColumnLabel: "底",
    buyColumnLabel: "買い候補",
    buySignalsTitle: "買いシグナル",
    passLabel: "PASS",
    failLabel: "FAIL",
    assetValueColumn: "資産価値",
    basisChangeColumn: "basisChange",
    spreadReturnColumn: "spreadReturn %",
    trackingError20Column: "trackingError20",
    signalScoreColumn: "signalScore",
    priceChangeSpreadColumn: "priceChange spread",
    runButton: "JSON を取得して保存",
    pleaseEnterSymbol: "少なくとも 1 つの銘柄を入力してください。",
    startEndRequired: "開始日と終了日は必須です。",
    startBeforeEnd: "開始日は終了日以前である必要があります。",
    uiNotFound: "UI 要素が見つかりません。",
    pipBrowserUnsupported: "このブラウザは Document Picture-in-Picture をサポートしていません。",
    noMatchingJson: "data/ に一致する JSON ファイルが見つかりません。",
    bearerRequired: "Bearer token は必須です。",
    showDirPickerUnsupported: "showDirectoryPicker は未対応です。Edge または Chrome で localhost から開いてください。",
    selectDataFolder: "data フォルダーまたはプロジェクトのルートを選択してください。",
    selectedFolderAlreadyData: "選択したフォルダーは既に data です。ここへ直接保存します。",
    selectedFolderProjectRoot: "プロジェクトのルートを選択しました。data/ サブフォルダーを使用します。",
    loadingLocalTable: "ローカルデータを読み込み中...",
    loadingLocalSummary: "ローカルデータを読み込み中...",
    localDataNotFound: "一致するローカルデータが見つかりません。",
    loadingRemoteTable: "データを取得中...",
    runningSummary: "実行中...",
    tryingLoadExisting: "data/ から既存 JSON を読み込み中 ...",
    noLocalDataSummary: "ローカルデータはまだありません。'既存データを読む' を押すか、新規取得してください。",
    noLocalDataTable: "ローカルデータはありません。",
    autoLoadSkipped: "自動読込をスキップ",
    failed: "失敗。",
    done: "完了。",
    loadedExisting: "data/ から既存 JSON を読み込みました。",
    savedToSelectedData: "選択したフォルダー内の data/ に保存しました。",
    missingLabel: "不足",
    rangeLabel: "範囲",
    rowsLabel: "行",
    saveSettingsButton: "設定を保存",
    settingsSaved: "設定を保存しました。",
    portfolioTitle: "ポートフォリオ",
    portfolioDesc: "銘柄、価格、数量を入力。合計は自動計算。",
    portfolioColSymbol: "銘柄",
    portfolioColPrice: "価格",
    portfolioColQty: "数量",
    portfolioColTotal: "元本合計",
    portfolioColActualCapital: "実質元本",
    portfolioColCurrentPrice: "現在価格",
    portfolioColSellPrice: "売却価格",
    portfolioColMarginPct: "Margin %",
    portfolioColPnL: "損益",
    portfolioColPnLPct: "損益 %",
    portfolioAddRow: "+ 行を追加",
    portfolioTotalLabel: "元本合計:",
    portfolioCurrentLabel: "現在合計:",
    portfolioPnLLabel: "損益:",
    portfolioMarginLabel: "Margin %",
    portfolioDebtLabel: "総負債:",
    cashTitle: "現金",
    cashDesc: "入金/出金、金額、説明を入力。",
    cashColType: "種類",
    cashColAmount: "金額",
    cashColDesc: "説明",
    cashColCreatedAt: "作成日時",
    cashTypeDeposit: "入金",
    cashTypeWithdrawal: "出金",
    cashAddRow: "+ 行を追加",
    cashTotalLabel: "現金合計:",
    derivativesSectionTitle: "デリバティブ",
    derivativesSectionDesc: "デリバティブ注文を入力: コード、ロング/ショート、数量、価格。",
    simDerivTabTitle: "デリバティブシミュ",
    simDerivTabDesc: "エントリー・クローズ・数量を入力して損益を確認（1ポイント=10万円）。シミュのみ—総資産に含みません。",
    simDerivColType: "種別",
    simDerivColQty: "数量",
    simDerivColEntry: "エントリー",
    simDerivColClose: "クローズ",
    simDerivColPnL: "損益",
    simDerivAddRow: "+ 行を追加",
    simDerivClearBtn: "シミュを消去",
    simDerivTotalPnLLabel: "損益合計（シミュ）",
    derivColSymbol: "コード",
    derivColType: "タイプ",
    derivColQty: "数量",
    derivColPrice: "エントリー価格",
    derivColClosePrice: "決済価格",
    derivColPnL: "損益",
    derivColDesc: "説明",
    derivTypeLong: "ロング",
    derivTypeShort: "ショート",
    derivativesAddRow: "+ 行を追加",
    derivativesTotalLabel: "注文合計:",
    derivativesPnLLabel: "損益合計:",
    tabSearchPlaceholder: "このタブを検索…",
    tabSearchHint: "入力で行を絞り込み。空欄ですべて表示。",
    tabSearchNoMatch: "該当する行がありません。検索をクリアしてください。"
  },
  en: {
    appTitle: "FireAnt Downloader",
    noteIntroHtml:
      'This page can load existing data from <code>data</code> for immediate mapping, or call the FireAnt API to download and update JSON files.',
    noteUsageHtml:
      'Open via <code>http://localhost</code> or a local server so the browser allows folder selection and file writing. You can choose the <code>data</code> folder directly or the project root folder.',
    tokenLabel: "Bearer token",
    tokenPlaceholder: "Paste the Bearer token here. You may paste the full Bearer ... string.",
    languageLabel: "Language",
    symbolsLabel: "Symbols",
    symbolsPlaceholder: "Example: VN30,VN30F1M,HPG,SSI",
    startDateLabel: "Start date",
    endDateLabel: "End date",
    vn30AssetLabel: "VN30 asset",
    vn30f1mAssetLabel: "VN30F1M margin",
    notifyEnabledLabel: "Enable notifications",
    notifyOnHedgeLabel: "On hedge state change",
    notifyOnBuyLabel: "On buy signal (4/7)",
    assetInputPlaceholder: "100,000,000",
    suggestButton: "HOSE bottom suggestions",
    suggestModalTitle: "HOSE bottom formation suggestions",
    suggestScanning: "Scanning...",
    suggestFound: "Found",
    suggestNone: "No symbols match the criteria.",
    suggestAddToWatch: "Add to watch",
    loadButton: "Load existing data",
    pipButtonOpen: "Open floating window (PiP)",
    pipButtonClose: "Close floating window (PiP)",
    pipUnsupported: "PiP unsupported",
    summaryIdle: "Not started.",
    detailPanelTitle: "Details",
    detailHint: "Click a row or cell in the table to view details.",
    overviewVn30Label: "VN30 remaining value",
    overviewFuturesLabel: "VN30F1M total P/L",
    overviewTotalLabel: "Total asset",
    overviewBaseDateLabel: "As of",
    overviewNoData: "No data yet",
    overviewHeaderInitialAssetLabel: "Initial total asset",
    overviewHeaderPnLLabel: "P/L",
    overviewHeaderNetAssetLabel: "Net asset",
    tableEmpty: "No mapping data yet.",
    noPipData: "No data to display.",
    noData: "No data.",
    noDataForDate: "No data for this date.",
    noVisibleSymbols: "No visible symbols remain.",
    pipTitle: "Hedge signal",
    dateLabel: "Date",
    restoreAll: "Restore all",
    hiddenColumnsLabel: "Hidden columns",
    restoreColumns: "Restore columns",
    hideColumnTitle: "Hide column",
    quickMetrics: "Quick metrics",
    reasonLabel: "Reason",
    watchedSymbols: "Watched symbols",
    closePrice: "Close",
    closePriceColumn: "close",
    priceChangeLabel: "Change",
    returnPctLabel: "Return %",
    basisLabel: "Basis",
    basisChangeLabel: "Basis change",
    basisRiskExplainTitle: "Why Basis risk",
    basisZScoreLabel: "Basis Z",
    trackingLabel: "Tracking",
    assetValueLabel: "Asset value",
    detailMetricsTitle: "Hedging metrics",
    hedgeStateLabel: "Hedge state",
    shortSignalLabel: "Short signal",
    stopSignalLabel: "Stop signal",
    spreadReturnLabel: "Spread return %",
    signalScoreLabel: "Signal score",
    groupGeneral: "General",
    groupHedging: "Hedging",
    dateColumn: "Date",
    assetAppliedDateColumn: "Money start date",
    priceChangeColumn: "priceChange",
    returnPctColumn: "return %",
    bottomColumnLabel: "Bottom",
    buyColumnLabel: "Buy",
    buySignalsTitle: "Buy signals",
    passLabel: "PASS",
    failLabel: "FAIL",
    assetValueColumn: "asset value",
    basisChangeColumn: "basisChange",
    spreadReturnColumn: "spreadReturn %",
    trackingError20Column: "trackingError20",
    signalScoreColumn: "signalScore",
    priceChangeSpreadColumn: "priceChange spread",
    runButton: "Download and save JSON",
    pleaseEnterSymbol: "Please enter at least one symbol.",
    startEndRequired: "Start date and end date are required.",
    startBeforeEnd: "Start date must be before or equal to end date.",
    uiNotFound: "UI elements were not found.",
    pipBrowserUnsupported: "Document Picture-in-Picture is not supported in this browser.",
    noMatchingJson: "No matching JSON files were found in data/.",
    bearerRequired: "Bearer token is required.",
    showDirPickerUnsupported: "showDirectoryPicker is not supported. Open this page from localhost in Edge or Chrome.",
    selectDataFolder: "Please select the data folder or the project root folder.",
    selectedFolderAlreadyData: "Selected folder is already data, files will be saved directly here.",
    selectedFolderProjectRoot: "Selected folder is project root, using its data/ subfolder.",
    loadingLocalTable: "Loading local data...",
    loadingLocalSummary: "Loading local data...",
    localDataNotFound: "No matching local data was found.",
    loadingRemoteTable: "Loading remote data...",
    runningSummary: "Running...",
    tryingLoadExisting: "Trying to load existing JSON from data/ ...",
    noLocalDataSummary: "No local data yet. You can click 'Load existing data' or download fresh data.",
    noLocalDataTable: "No local data yet.",
    autoLoadSkipped: "Auto-load skipped",
    failed: "Failed.",
    done: "Done.",
    loadedExisting: "Loaded existing JSON from data/.",
    savedToSelectedData: "Saved to data/ inside the folder you selected.",
    missingLabel: "Missing",
    rangeLabel: "range",
    rowsLabel: "rows",
    saveSettingsButton: "Save settings",
    settingsSaved: "Settings saved.",
    portfolioTitle: "Portfolio",
    portfolioDesc: "Enter symbol, price, quantity. Total auto-calculated.",
    portfolioColSymbol: "Symbol",
    portfolioColPrice: "Price",
    portfolioColQty: "Qty",
    portfolioColTotal: "Cost total",
    portfolioColActualCapital: "Effective capital",
    portfolioColCurrentPrice: "Current",
    portfolioColSellPrice: "Sell",
    portfolioColMarginPct: "Margin %",
    portfolioColPnL: "P/L",
    portfolioColPnLPct: "P/L %",
    portfolioAddRow: "+ Add row",
    portfolioTotalLabel: "Cost total:",
    portfolioCurrentLabel: "Current total:",
    portfolioPnLLabel: "P/L:",
    portfolioMarginLabel: "Margin %",
    portfolioDebtLabel: "Total debt:",
    cashTitle: "Cash",
    cashDesc: "Enter deposit/withdrawal, amount, description.",
    cashColType: "Type",
    cashColAmount: "Amount",
    cashColDesc: "Description",
    cashColCreatedAt: "Created at",
    cashTypeDeposit: "Deposit",
    cashTypeWithdrawal: "Withdrawal",
    cashAddRow: "+ Add row",
    cashTotalLabel: "Total cash:",
    derivativesSectionTitle: "Derivatives",
    derivativesSectionDesc: "Enter derivative orders: contract code, long/short, quantity, price.",
    simDerivTabTitle: "Futures simulation",
    simDerivTabDesc:
      "Enter entry, close, and quantity to see P/L (1 point = 100,000). Simulation only—not included in total assets or overview.",
    simDerivColType: "Side",
    simDerivColQty: "Qty",
    simDerivColEntry: "Entry",
    simDerivColClose: "Close",
    simDerivColPnL: "P/L",
    simDerivAddRow: "+ Add row",
    simDerivClearBtn: "Clear simulation",
    simDerivTotalPnLLabel: "Total P/L (sim)",
    derivColSymbol: "Contract",
    derivColType: "Type",
    derivColQty: "Qty",
    derivColPrice: "Entry",
    derivColClosePrice: "Close",
    derivColPnL: "P/L",
    derivColDesc: "Desc",
    derivTypeLong: "Long",
    derivTypeShort: "Short",
    derivativesAddRow: "+ Add row",
    derivativesTotalLabel: "Total orders:",
    derivativesPnLLabel: "Total P/L:",
    tabSearchPlaceholder: "Search this tab…",
    tabSearchHint: "Type to filter rows; clear to show all.",
    tabSearchNoMatch: "No rows match. Clear the search to see your data again."
  },
  zh: {
    appTitle: "FireAnt Downloader",
    noteIntroHtml:
      '此页面可以读取 <code>data</code> 中的现有数据并立即显示映射，也可以调用 FireAnt API 下载并更新 JSON 文件。',
    noteUsageHtml:
      '请通过 <code>http://localhost</code> 或本地服务器打开，以便浏览器允许选择文件夹并写入文件。你可以直接选择 <code>data</code> 文件夹或项目根目录。',
    tokenLabel: "Bearer token",
    tokenPlaceholder: "在这里粘贴 Bearer token。可以直接粘贴完整的 Bearer ... 字符串。",
    languageLabel: "语言",
    symbolsLabel: "代码",
    symbolsPlaceholder: "例如: VN30,VN30F1M,HPG,SSI",
    startDateLabel: "开始日期",
    endDateLabel: "结束日期",
    vn30AssetLabel: "VN30 资产",
    vn30f1mAssetLabel: "VN30F1M 保证金",
    notifyEnabledLabel: "启用通知",
    notifyOnHedgeLabel: "对冲状态变化时",
    notifyOnBuyLabel: "买入信号 (4/7) 时",
    assetInputPlaceholder: "100.000.000",
    suggestButton: "HOSE底部建议",
    suggestModalTitle: "HOSE底部形成建议",
    suggestScanning: "扫描中...",
    suggestFound: "找到",
    suggestNone: "没有符合条件的代码。",
    suggestAddToWatch: "加入监控",
    loadButton: "读取现有数据",
    pipButtonOpen: "打开悬浮窗口 (PiP)",
    pipButtonClose: "关闭悬浮窗口 (PiP)",
    pipUnsupported: "PiP 不支持",
    summaryIdle: "尚未运行。",
    detailPanelTitle: "详情",
    detailHint: "点击表格中的行或单元格查看详情。",
    overviewVn30Label: "VN30 剩余金额",
    overviewFuturesLabel: "VN30F1M 总盈亏",
    overviewTotalLabel: "总资产",
    overviewBaseDateLabel: "基于日期",
    overviewNoData: "暂无数据",
    overviewHeaderInitialAssetLabel: "初期总资产",
    overviewHeaderPnLLabel: "盈亏",
    overviewHeaderNetAssetLabel: "净资产",
    tableEmpty: "暂无映射数据。",
    noPipData: "没有可显示的数据。",
    noData: "没有数据。",
    noDataForDate: "该日期没有数据。",
    noVisibleSymbols: "当前没有可显示的代码。",
    pipTitle: "对冲信号",
    dateLabel: "日期",
    restoreAll: "全部恢复",
    hiddenColumnsLabel: "已隐藏列",
    restoreColumns: "恢复列",
    hideColumnTitle: "隐藏列",
    quickMetrics: "快速指标",
    reasonLabel: "原因",
    watchedSymbols: "监控代码",
    closePrice: "收盘价",
    closePriceColumn: "收盘价",
    priceChangeLabel: "变动",
    returnPctLabel: "收益率 %",
    basisLabel: "Basis",
    basisChangeLabel: "Basis变动",
    basisRiskExplainTitle: "为何Basis风险",
    basisZScoreLabel: "Basis Z",
    trackingLabel: "Tracking",
    assetValueLabel: "资产价值",
    detailMetricsTitle: "对冲指标",
    hedgeStateLabel: "对冲状态",
    shortSignalLabel: "做空信号",
    stopSignalLabel: "停止信号",
    spreadReturnLabel: "价差收益率 %",
    signalScoreLabel: "信号分数",
    groupGeneral: "通用信息",
    groupHedging: "对冲",
    dateColumn: "日期",
    assetAppliedDateColumn: "资金起算日",
    priceChangeColumn: "priceChange",
    returnPctColumn: "return %",
    bottomColumnLabel: "底",
    buyColumnLabel: "买入建议",
    buySignalsTitle: "买入指标",
    passLabel: "PASS",
    failLabel: "FAIL",
    assetValueColumn: "资产价值",
    basisChangeColumn: "basisChange",
    spreadReturnColumn: "spreadReturn %",
    trackingError20Column: "trackingError20",
    signalScoreColumn: "signalScore",
    priceChangeSpreadColumn: "priceChange spread",
    runButton: "下载并保存 JSON",
    pleaseEnterSymbol: "请至少输入一个代码。",
    startEndRequired: "开始日期和结束日期不能为空。",
    startBeforeEnd: "开始日期必须早于或等于结束日期。",
    uiNotFound: "未找到界面元素。",
    pipBrowserUnsupported: "当前浏览器不支持 Document Picture-in-Picture。",
    noMatchingJson: "在 data/ 中未找到匹配的 JSON 文件。",
    bearerRequired: "Bearer token 是必填项。",
    showDirPickerUnsupported: "showDirectoryPicker 不受支持。请在 Edge 或 Chrome 中通过 localhost 打开此页面。",
    selectDataFolder: "请选择 data 文件夹或项目根目录。",
    selectedFolderAlreadyData: "所选文件夹已是 data，文件将直接保存到这里。",
    selectedFolderProjectRoot: "已选择项目根目录，将使用其 data/ 子目录。",
    loadingLocalTable: "正在读取本地数据...",
    loadingLocalSummary: "正在读取本地数据...",
    localDataNotFound: "未找到匹配的本地数据。",
    loadingRemoteTable: "正在下载数据...",
    runningSummary: "运行中...",
    tryingLoadExisting: "正在尝试从 data/ 读取现有 JSON ...",
    noLocalDataSummary: "尚无本地数据。你可以点击“读取现有数据”或重新下载。",
    noLocalDataTable: "尚无本地数据。",
    autoLoadSkipped: "已跳过自动读取",
    failed: "失败。",
    done: "完成。",
    loadedExisting: "已从 data/ 读取现有 JSON。",
    savedToSelectedData: "已保存到所选文件夹中的 data/。",
    missingLabel: "缺少",
    rangeLabel: "范围",
    rowsLabel: "行",
    saveSettingsButton: "保存设置",
    settingsSaved: "设置已保存。",
    portfolioTitle: "投资组合",
    portfolioDesc: "输入代码、价格、数量。总金额自动计算。",
    portfolioColSymbol: "代码",
    portfolioColPrice: "价格",
    portfolioColQty: "数量",
    portfolioColTotal: "成本总额",
    portfolioColActualCapital: "实际本金",
    portfolioColCurrentPrice: "现价",
    portfolioColSellPrice: "卖出价",
    portfolioColMarginPct: "Margin %",
    portfolioColPnL: "盈亏",
    portfolioColPnLPct: "盈亏 %",
    portfolioAddRow: "+ 添加行",
    portfolioTotalLabel: "成本总额:",
    portfolioCurrentLabel: "现价总额:",
    portfolioPnLLabel: "盈亏:",
    portfolioMarginLabel: "Margin %",
    portfolioDebtLabel: "总负债:",
    cashTitle: "现金",
    cashDesc: "输入存入/取出、金额、说明。",
    cashColType: "类型",
    cashColAmount: "金额",
    cashColDesc: "说明",
    cashColCreatedAt: "创建时间",
    cashTypeDeposit: "存入",
    cashTypeWithdrawal: "取出",
    cashAddRow: "+ 添加行",
    cashTotalLabel: "现金合计:",
    derivativesSectionTitle: "衍生品",
    derivativesSectionDesc: "输入衍生品订单: 合约代码、多/空、数量、价格。",
    simDerivTabTitle: "衍生品模拟",
    simDerivTabDesc: "输入入场、平仓与数量查看盈亏（1点=100,000）。仅模拟—不计入总资产与概览。",
    simDerivColType: "方向",
    simDerivColQty: "数量",
    simDerivColEntry: "入场价",
    simDerivColClose: "平仓价",
    simDerivColPnL: "盈亏",
    simDerivAddRow: "+ 添加行",
    simDerivClearBtn: "清除模拟",
    simDerivTotalPnLLabel: "盈亏合计（模拟）",
    derivColSymbol: "合约",
    derivColType: "类型",
    derivColQty: "数量",
    derivColPrice: "开仓价",
    derivColClosePrice: "平仓价",
    derivColPnL: "盈亏",
    derivColDesc: "描述",
    derivTypeLong: "多",
    derivTypeShort: "空",
    derivativesAddRow: "+ 添加行",
    derivativesTotalLabel: "订单合计:",
    derivativesPnLLabel: "盈亏合计:",
    tabSearchPlaceholder: "在此标签页搜索…",
    tabSearchHint: "输入以筛选行；留空显示全部。",
    tabSearchNoMatch: "没有匹配的行。请清空搜索框以恢复显示。"
  },
  ko: {
    appTitle: "FireAnt Downloader",
    noteIntroHtml:
      '이 페이지는 <code>data</code> 의 기존 데이터를 읽어 즉시 매핑을 표시하거나, FireAnt API 를 호출해 JSON 파일을 다운로드하고 업데이트할 수 있습니다.',
    noteUsageHtml:
      '브라우저가 폴더 선택과 파일 쓰기를 허용하도록 <code>http://localhost</code> 또는 로컬 서버로 열어 주세요. <code>data</code> 폴더나 프로젝트 루트를 직접 선택할 수 있습니다.',
    tokenLabel: "Bearer token",
    tokenPlaceholder: "여기에 Bearer token 을 붙여 넣으세요. Bearer ... 전체 문자열도 가능합니다.",
    languageLabel: "언어",
    symbolsLabel: "종목",
    symbolsPlaceholder: "예: VN30,VN30F1M,HPG,SSI",
    startDateLabel: "시작일",
    endDateLabel: "종료일",
    vn30AssetLabel: "VN30 자산",
    vn30f1mAssetLabel: "VN30F1M 증거금",
    notifyEnabledLabel: "알림 사용",
    notifyOnHedgeLabel: "헤지 상태 변경 시",
    notifyOnBuyLabel: "매수 신호 (4/7) 시",
    assetInputPlaceholder: "100.000.000",
    suggestButton: "HOSE 바닥 제안",
    suggestModalTitle: "HOSE 바닥 형성 제안",
    suggestScanning: "스캔 중...",
    suggestFound: "발견",
    suggestNone: "조건에 맞는 종목이 없습니다.",
    suggestAddToWatch: "관심 추가",
    loadButton: "기존 데이터 읽기",
    pipButtonOpen: "플로팅 창 열기 (PiP)",
    pipButtonClose: "플로팅 창 닫기 (PiP)",
    pipUnsupported: "PiP 미지원",
    summaryIdle: "아직 실행되지 않았습니다.",
    detailPanelTitle: "상세",
    detailHint: "표의 행이나 셀을 클릭하면 상세 내용을 볼 수 있습니다.",
    overviewVn30Label: "VN30 남은 금액",
    overviewFuturesLabel: "VN30F1M 총 손익",
    overviewTotalLabel: "총자산",
    overviewBaseDateLabel: "기준일",
    overviewNoData: "데이터 없음",
    overviewHeaderInitialAssetLabel: "초기 총자산",
    overviewHeaderPnLLabel: "손익",
    overviewHeaderNetAssetLabel: "순자산",
    tableEmpty: "매핑 데이터가 없습니다.",
    noPipData: "표시할 데이터가 없습니다.",
    noData: "데이터가 없습니다.",
    noDataForDate: "이 날짜의 데이터가 없습니다.",
    noVisibleSymbols: "표시 중인 종목이 없습니다.",
    pipTitle: "헤지 신호",
    dateLabel: "날짜",
    restoreAll: "모두 다시 표시",
    hiddenColumnsLabel: "숨김 열",
    restoreColumns: "열 복원",
    hideColumnTitle: "열 숨기기",
    quickMetrics: "빠른 지표",
    reasonLabel: "사유",
    watchedSymbols: "관심 종목",
    closePrice: "종가",
    closePriceColumn: "종가",
    priceChangeLabel: "변동",
    returnPctLabel: "수익률 %",
    basisLabel: "Basis",
    basisChangeLabel: "Basis 변동",
    basisRiskExplainTitle: "Basis risk 이유",
    basisZScoreLabel: "Basis Z",
    trackingLabel: "Tracking",
    assetValueLabel: "자산 가치",
    detailMetricsTitle: "헤지 지표",
    hedgeStateLabel: "헤지 상태",
    shortSignalLabel: "숏 신호",
    stopSignalLabel: "중단 신호",
    spreadReturnLabel: "스프레드 수익률 %",
    signalScoreLabel: "신호 점수",
    groupGeneral: "공통 정보",
    groupHedging: "헤징",
    dateColumn: "날짜",
    assetAppliedDateColumn: "자금 적용일",
    priceChangeColumn: "priceChange",
    returnPctColumn: "return %",
    bottomColumnLabel: "바닥",
    buyColumnLabel: "매수 제안",
    buySignalsTitle: "매수 지표",
    passLabel: "PASS",
    failLabel: "FAIL",
    assetValueColumn: "자산 가치",
    basisChangeColumn: "basisChange",
    spreadReturnColumn: "spreadReturn %",
    trackingError20Column: "trackingError20",
    signalScoreColumn: "signalScore",
    priceChangeSpreadColumn: "priceChange spread",
    runButton: "JSON 다운로드 및 저장",
    pleaseEnterSymbol: "최소 한 개의 종목을 입력하세요.",
    startEndRequired: "시작일과 종료일은 필수입니다.",
    startBeforeEnd: "시작일은 종료일보다 빠르거나 같아야 합니다.",
    uiNotFound: "UI 요소를 찾을 수 없습니다.",
    pipBrowserUnsupported: "이 브라우저는 Document Picture-in-Picture 를 지원하지 않습니다.",
    noMatchingJson: "data/ 에서 일치하는 JSON 파일을 찾지 못했습니다.",
    bearerRequired: "Bearer token 은 필수입니다.",
    showDirPickerUnsupported: "showDirectoryPicker 가 지원되지 않습니다. Edge 또는 Chrome 에서 localhost 로 열어 주세요.",
    selectDataFolder: "data 폴더 또는 프로젝트 루트 폴더를 선택하세요.",
    selectedFolderAlreadyData: "선택한 폴더가 이미 data 입니다. 여기에 바로 저장합니다.",
    selectedFolderProjectRoot: "프로젝트 루트를 선택했습니다. data/ 하위 폴더를 사용합니다.",
    loadingLocalTable: "로컬 데이터를 읽는 중...",
    loadingLocalSummary: "로컬 데이터를 읽는 중...",
    localDataNotFound: "일치하는 로컬 데이터를 찾지 못했습니다.",
    loadingRemoteTable: "데이터를 불러오는 중...",
    runningSummary: "실행 중...",
    tryingLoadExisting: "data/ 에서 기존 JSON 을 읽는 중 ...",
    noLocalDataSummary: "아직 로컬 데이터가 없습니다. '기존 데이터 읽기'를 누르거나 새로 다운로드할 수 있습니다.",
    noLocalDataTable: "아직 로컬 데이터가 없습니다.",
    autoLoadSkipped: "자동 로드를 건너뜀",
    failed: "실패.",
    done: "완료.",
    loadedExisting: "data/ 에서 기존 JSON 을 읽었습니다.",
    savedToSelectedData: "선택한 폴더의 data/ 에 저장했습니다.",
    missingLabel: "누락",
    rangeLabel: "범위",
    rowsLabel: "행",
    saveSettingsButton: "설정 저장",
    settingsSaved: "설정이 저장되었습니다.",
    portfolioTitle: "포트폴리오",
    portfolioDesc: "종목, 가격, 수량 입력. 합계 자동 계산.",
    portfolioColSymbol: "종목",
    portfolioColPrice: "가격",
    portfolioColQty: "수량",
    portfolioColTotal: "원금 합계",
    portfolioColActualCapital: "실제 증거금",
    portfolioColCurrentPrice: "현재가",
    portfolioColSellPrice: "매도가",
    portfolioColMarginPct: "Margin %",
    portfolioColPnL: "손익",
    portfolioColPnLPct: "손익 %",
    portfolioAddRow: "+ 행 추가",
    portfolioTotalLabel: "원금 합계:",
    portfolioCurrentLabel: "현재가 합계:",
    portfolioPnLLabel: "손익:",
    portfolioMarginLabel: "Margin %",
    portfolioDebtLabel: "총 부채:",
    cashTitle: "현금",
    cashDesc: "입금/출금, 금액, 설명 입력.",
    cashColType: "유형",
    cashColAmount: "금액",
    cashColDesc: "설명",
    cashColCreatedAt: "생성일시",
    cashTypeDeposit: "입금",
    cashTypeWithdrawal: "출금",
    cashAddRow: "+ 행 추가",
    cashTotalLabel: "현금 합계:",
    derivativesSectionTitle: "파생상품",
    derivativesSectionDesc: "파생상품 주문 입력: 계약코드, 롱/숏, 수량, 가격.",
    simDerivTabTitle: "파생 시뮬",
    simDerivTabDesc: "진입·청산·수량을 입력해 손익 확인(1포인트=10만). 시뮬만—총자산·개요에 미포함.",
    simDerivColType: "방향",
    simDerivColQty: "수량",
    simDerivColEntry: "진입가",
    simDerivColClose: "청산가",
    simDerivColPnL: "손익",
    simDerivAddRow: "+ 행 추가",
    simDerivClearBtn: "시뮬 삭제",
    simDerivTotalPnLLabel: "합계 손익(시뮬)",
    derivColSymbol: "계약",
    derivColType: "유형",
    derivColQty: "수량",
    derivColPrice: "진입가",
    derivColClosePrice: "청산가",
    derivColPnL: "손익",
    derivColDesc: "설명",
    derivTypeLong: "롱",
    derivTypeShort: "숏",
    derivativesAddRow: "+ 행 추가",
    derivativesTotalLabel: "주문 합계:",
    derivativesPnLLabel: "손익 합계:",
    tabSearchPlaceholder: "이 탭에서 검색…",
    tabSearchHint: "입력하면 행을 필터합니다. 비우면 전체 표시.",
    tabSearchNoMatch: "일치하는 행이 없습니다. 검색어를 지우면 데이터가 다시 보입니다."
  }
} as const;

const tokenInput = document.querySelector<HTMLTextAreaElement>("#token");
const languageSelect = document.querySelector<HTMLSelectElement>("#languageSelect");
const symbolsInput = document.querySelector<HTMLInputElement>("#symbols");
const startDateInput = document.querySelector<HTMLInputElement>("#startDate");
const endDateInput = document.querySelector<HTMLInputElement>("#endDate");
const notifyEnabledInput = document.querySelector<HTMLInputElement>("#notifyEnabled");
const notifyOnHedgeChangeInput = document.querySelector<HTMLInputElement>("#notifyOnHedgeChange");
const notifyOnBuySignalInput = document.querySelector<HTMLInputElement>("#notifyOnBuySignal");
const telegramBotTokenInput = document.querySelector<HTMLInputElement>("#telegramBotToken");
const telegramChatIdInput = document.querySelector<HTMLInputElement>("#telegramChatId");
const discordWebhookUrlInput = document.querySelector<HTMLInputElement>("#discordWebhookUrl");
const loadButton = document.querySelector<HTMLButtonElement>("#loadButton");
const saveSettingsButton = document.querySelector<HTMLButtonElement>("#saveSettingsButton");
const pipButton = document.querySelector<HTMLButtonElement>("#pipButton");
const suggestButton = document.querySelector<HTMLButtonElement>("#suggestButton");
const runButton = document.querySelector<HTMLButtonElement>("#runButton");
const suggestModal = document.querySelector<HTMLDivElement>("#suggestModal");
const suggestModalTitle = document.querySelector<HTMLHeadingElement>("#suggestModalTitle");
const suggestModalClose = document.querySelector<HTMLButtonElement>("#suggestModalClose");
const suggestModalStatus = document.querySelector<HTMLParagraphElement>("#suggestModalStatus");
const suggestModalResults = document.querySelector<HTMLDivElement>("#suggestModalResults");
const logElement = document.querySelector<HTMLPreElement>("#log");
const summaryElement = document.querySelector<HTMLDivElement>("#summary");
const mappingHeadElement = document.querySelector<HTMLTableSectionElement>("#mappingHead");
const mappingBodyElement = document.querySelector<HTMLTableSectionElement>("#mappingBody");
const hiddenColumnsBarElement = document.querySelector<HTMLDivElement>("#hiddenColumnsBar");
const detailContentElement = document.querySelector<HTMLDivElement>("#detailContent");
const appTitleElement = document.querySelector<HTMLHeadingElement>("#appTitle");
const noteIntroElement = document.querySelector<HTMLParagraphElement>("#noteIntro");
const noteUsageElement = document.querySelector<HTMLParagraphElement>("#noteUsage");
const overviewVn30LabelElement = document.querySelector<HTMLDivElement>("#overviewVn30Label");
const overviewVn30ValueElement = document.querySelector<HTMLDivElement>("#overviewVn30Value");
const overviewVn30SubtextElement = document.querySelector<HTMLDivElement>("#overviewVn30Subtext");
const overviewFuturesLabelElement = document.querySelector<HTMLDivElement>("#overviewFuturesLabel");
const overviewFuturesValueElement = document.querySelector<HTMLDivElement>("#overviewFuturesValue");
const overviewFuturesSubtextElement = document.querySelector<HTMLDivElement>("#overviewFuturesSubtext");
const overviewTotalLabelElement = document.querySelector<HTMLDivElement>("#overviewTotalLabel");
const overviewTotalValueElement = document.querySelector<HTMLDivElement>("#overviewTotalValue");
const overviewTotalSubtextElement = document.querySelector<HTMLDivElement>("#overviewTotalSubtext");
const overviewHeaderInitialAssetLabelElement = document.querySelector<HTMLSpanElement>("#overviewHeaderInitialAssetLabel");
const overviewHeaderInitialAssetValueElement = document.querySelector<HTMLSpanElement>("#overviewHeaderInitialAssetValue");
const overviewHeaderPnLLabelElement = document.querySelector<HTMLSpanElement>("#overviewHeaderPnLLabel");
const overviewHeaderPnLValueElement = document.querySelector<HTMLSpanElement>("#overviewHeaderPnLValue");
const overviewHeaderNetAssetLabelElement = document.querySelector<HTMLSpanElement>("#overviewHeaderNetAssetLabel");
const overviewHeaderNetAssetValueElement = document.querySelector<HTMLSpanElement>("#overviewHeaderNetAssetValue");
const tokenLabelElement = document.querySelector<HTMLLabelElement>("#tokenLabel");
const languageLabelElement = document.querySelector<HTMLLabelElement>("#languageLabel");
const symbolsLabelElement = document.querySelector<HTMLLabelElement>("#symbolsLabel");
const startDateLabelElement = document.querySelector<HTMLLabelElement>("#startDateLabel");
const endDateLabelElement = document.querySelector<HTMLLabelElement>("#endDateLabel");
const notifyEnabledLabelElement = document.querySelector<HTMLSpanElement>("#notifyEnabledLabel");
const notifyOnHedgeLabelElement = document.querySelector<HTMLSpanElement>("#notifyOnHedgeLabel");
const notifyOnBuyLabelElement = document.querySelector<HTMLSpanElement>("#notifyOnBuyLabel");
const portfolioBodyElement = document.querySelector<HTMLTableSectionElement>("#portfolioBody");
const portfolioAddRowButton = document.querySelector<HTMLButtonElement>("#portfolioAddRow");
const portfolioTotalValueElement = document.querySelector<HTMLSpanElement>("#portfolioTotalValue");
const portfolioCurrentValueElement = document.querySelector<HTMLSpanElement>("#portfolioCurrentValue");
const portfolioPnLValueElement = document.querySelector<HTMLSpanElement>("#portfolioPnLValue");
const portfolioSectionTitleElement = document.querySelector<HTMLHeadingElement>("#portfolioSectionTitle");
const portfolioSectionDescElement = document.querySelector<HTMLParagraphElement>("#portfolioSectionDesc");
const portfolioColSymbolElement = document.querySelector<HTMLElement>("#portfolioColSymbol");
const portfolioColPriceElement = document.querySelector<HTMLElement>("#portfolioColPrice");
const portfolioColQtyElement = document.querySelector<HTMLElement>("#portfolioColQty");
const portfolioColTotalElement = document.querySelector<HTMLElement>("#portfolioColTotal");
const portfolioColActualCapitalElement = document.querySelector<HTMLElement>("#portfolioColActualCapital");
const portfolioColCurrentPriceElement = document.querySelector<HTMLElement>("#portfolioColCurrentPrice");
const portfolioColSellPriceElement = document.querySelector<HTMLElement>("#portfolioColSellPrice");
const portfolioColMarginPctElement = document.querySelector<HTMLElement>("#portfolioColMarginPct");
const portfolioColPnLElement = document.querySelector<HTMLElement>("#portfolioColPnL");
const portfolioColPnLPctElement = document.querySelector<HTMLElement>("#portfolioColPnLPct");
const portfolioTotalLabelElement = document.querySelector<HTMLSpanElement>("#portfolioTotalLabel");
const portfolioCurrentLabelElement = document.querySelector<HTMLSpanElement>("#portfolioCurrentLabel");
const portfolioPnLLabelElement = document.querySelector<HTMLSpanElement>("#portfolioPnLLabel");
const portfolioDebtLabelElement = document.querySelector<HTMLElement>("#portfolioDebtLabel");
const portfolioDebtValueElement = document.querySelector<HTMLSpanElement>("#portfolioDebtValue");
const cashBodyElement = document.querySelector<HTMLTableSectionElement>("#cashBody");
const cashAddRowButton = document.querySelector<HTMLButtonElement>("#cashAddRow");
const cashTotalValueElement = document.querySelector<HTMLSpanElement>("#cashTotalValue");
const cashSectionTitleElement = document.querySelector<HTMLHeadingElement>("#cashSectionTitle");
const cashSectionDescElement = document.querySelector<HTMLParagraphElement>("#cashSectionDesc");
const cashColTypeElement = document.querySelector<HTMLElement>("#cashColType");
const cashColAmountElement = document.querySelector<HTMLElement>("#cashColAmount");
const cashColDescElement = document.querySelector<HTMLElement>("#cashColDesc");
const cashColCreatedAtElement = document.querySelector<HTMLElement>("#cashColCreatedAt");
const cashTotalLabelElement = document.querySelector<HTMLSpanElement>("#cashTotalLabel");
const derivativesBodyElement = document.querySelector<HTMLTableSectionElement>("#derivativesBody");
const derivativesAddRowButton = document.querySelector<HTMLButtonElement>("#derivativesAddRow");
const derivativesTotalValueElement = document.querySelector<HTMLSpanElement>("#derivativesTotalValue");
const derivativesSectionTitleElement = document.querySelector<HTMLHeadingElement>("#derivativesSectionTitle");
const derivativesSectionDescElement = document.querySelector<HTMLParagraphElement>("#derivativesSectionDesc");
const derivColSymbolElement = document.querySelector<HTMLElement>("#derivColSymbol");
const derivColTypeElement = document.querySelector<HTMLElement>("#derivColType");
const derivColQtyElement = document.querySelector<HTMLElement>("#derivColQty");
const derivColPriceElement = document.querySelector<HTMLElement>("#derivColPrice");
const derivColClosePriceElement = document.querySelector<HTMLElement>("#derivColClosePrice");
const derivColPnLElement = document.querySelector<HTMLElement>("#derivColPnL");
const derivColDescElement = document.querySelector<HTMLElement>("#derivColDesc");
const derivativesTotalLabelElement = document.querySelector<HTMLSpanElement>("#derivativesTotalLabel");
const derivativesPnLValueElement = document.querySelector<HTMLSpanElement>("#derivativesPnLValue");
const derivativesPnLLabelElement = document.querySelector<HTMLSpanElement>("#derivativesPnLLabel");
const simDerivativesSectionTitleElement = document.querySelector<HTMLHeadingElement>("#simDerivativesSectionTitle");
const simDerivativesSectionDescElement = document.querySelector<HTMLParagraphElement>("#simDerivativesSectionDesc");
const simDerivativesBodyElement = document.querySelector<HTMLTableSectionElement>("#simDerivativesBody");
const simDerivAddRowButton = document.querySelector<HTMLButtonElement>("#simDerivAddRow");
const simDerivClearButton = document.querySelector<HTMLButtonElement>("#simDerivClearLog");
const simDerivTotalPnLLabelElement = document.querySelector<HTMLSpanElement>("#simDerivTotalPnLLabel");
const simDerivTotalPnLValueElement = document.querySelector<HTMLSpanElement>("#simDerivTotalPnLValue");
const simDerivColTypeElement = document.querySelector<HTMLElement>("#simDerivColType");
const simDerivColQtyElement = document.querySelector<HTMLElement>("#simDerivColQty");
const simDerivColEntryElement = document.querySelector<HTMLElement>("#simDerivColEntry");
const simDerivColCloseElement = document.querySelector<HTMLElement>("#simDerivColClose");
const simDerivColPnLElement = document.querySelector<HTMLElement>("#simDerivColPnL");
const portfolioTabSearchInput = document.querySelector<HTMLInputElement>("#portfolioTabSearch");
const cashTabSearchInput = document.querySelector<HTMLInputElement>("#cashTabSearch");
const overviewTabSearchInput = document.querySelector<HTMLInputElement>("#overviewTabSearch");
const derivativesTabSearchInput = document.querySelector<HTMLInputElement>("#derivativesTabSearch");
const portfolioTabSearchHintElement = document.querySelector<HTMLParagraphElement>("#portfolioTabSearchHint");
const cashTabSearchHintElement = document.querySelector<HTMLParagraphElement>("#cashTabSearchHint");
const derivativesTabSearchHintElement = document.querySelector<HTMLParagraphElement>("#derivativesTabSearchHint");
const overviewTabSearchNoMatchElement = document.querySelector<HTMLParagraphElement>("#overviewTabSearchNoMatch");
const detailPanelTitleElement = document.querySelector<HTMLHeadingElement>("#detailPanelTitle");
const defaultSortState: SortState = { key: "date", direction: "desc" };
let currentMappingData: Record<string, HistoricalQuote[]> = {};
let mappingSortState: SortState = { ...defaultSortState };

type TabSortState = { col: number; direction: "asc" | "desc" };
let portfolioSortState: TabSortState | null = null;
let cashSortState: TabSortState | null = null;
let derivativesSortState: TabSortState | null = null;
let currentDetailState: { date: string | null; symbol: string | null } = { date: null, symbol: null };
let pipWindowRef: Window | null = null;
let pipRootElement: HTMLDivElement | null = null;
let hiddenMappingColumnKeys = new Set<string>();
let pipHiddenSections: Record<string, boolean> = {
  metrics: false,
  reason: false,
  buySignals: false,
  cards: false
};
let pipHiddenSymbols: Record<string, boolean> = {};
let lastPipHedgeState: string | null = null;
let lastBuySuggestions: Set<string> = new Set();
let currentLanguage: Language = "vi";
let summaryBuilder: (() => string) | null = null;
let saveSettingsTimer: number | null = null;
let realtimeRefreshTimer: number | null = null;
let realtimeRefreshInFlight = false;

if (
  !tokenInput ||
  !languageSelect ||
  !symbolsInput ||
  !startDateInput ||
  !endDateInput ||
  !loadButton ||
  !pipButton ||
  !suggestButton ||
  !runButton ||
  !logElement ||
  !summaryElement ||
  !mappingHeadElement ||
  !mappingBodyElement ||
  !hiddenColumnsBarElement ||
  !detailContentElement ||
  !appTitleElement ||
  !noteIntroElement ||
  !noteUsageElement ||
  !overviewVn30LabelElement ||
  !overviewVn30ValueElement ||
  !overviewVn30SubtextElement ||
  !overviewFuturesLabelElement ||
  !overviewFuturesValueElement ||
  !overviewFuturesSubtextElement ||
  !overviewTotalLabelElement ||
  !overviewTotalValueElement ||
  !overviewTotalSubtextElement ||
  !tokenLabelElement ||
  !languageLabelElement ||
  !symbolsLabelElement ||
  !startDateLabelElement ||
  !endDateLabelElement ||
  !detailPanelTitleElement
) {
  throw new Error(UI_TEXT.en.uiNotFound);
}

function appendLog(message: string): void {
  const timestamp = new Date().toLocaleTimeString("en-GB");
  logElement.textContent += `[${timestamp}] ${message}\n`;
  logElement.scrollTop = logElement.scrollHeight;
}

function getPreferredLanguage(): Language {
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (storedLanguage === "vi" || storedLanguage === "ja" || storedLanguage === "en" || storedLanguage === "zh" || storedLanguage === "ko") {
    return storedLanguage;
  }

  return "vi";
}

function t(key: keyof (typeof UI_TEXT)["en"]): string {
  return UI_TEXT[currentLanguage][key];
}

function setSummary(message: string): void {
  summaryBuilder = () => message;
  summaryElement.textContent = message;
}

function setDynamicSummary(builder: () => string): void {
  summaryBuilder = builder;
  summaryElement.textContent = builder();
}

function refreshSummary(): void {
  if (summaryBuilder) {
    summaryElement.textContent = summaryBuilder();
  }
}

function buildSymbolRangeLine(symbol: string, rows: HistoricalQuote[]): string {
  const firstDate = rows[0]?.date ?? "n/a";
  const lastDate = rows[rows.length - 1]?.date ?? "n/a";
  return `${symbol}: ${rows.length} ${t("rowsLabel")}, ${t("rangeLabel")} ${firstDate} -> ${lastDate}`;
}

function getPortfolioPositionsFromDOM(): PortfolioPosition[] {
  if (!portfolioBodyElement) return [];
  const rows = portfolioBodyElement.querySelectorAll<HTMLTableRowElement>("tr[data-portfolio-row]");
  const result: PortfolioPosition[] = [];
  for (const row of rows) {
    const symbolInput = row.querySelector<HTMLInputElement>(".portfolio-symbol");
    const priceInput = row.querySelector<HTMLInputElement>(".portfolio-price");
    const qtyInput = row.querySelector<HTMLInputElement>(".portfolio-qty");
    const sellPriceInput = row.querySelector<HTMLInputElement>(".portfolio-sell-price");
    const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
    const price = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const sellPrice = sellPriceInput?.value ? (parseAssetInput(sellPriceInput.value) ?? undefined) : undefined;
    const marginPct = parseMarginPct(row.querySelector<HTMLInputElement>(".portfolio-margin-pct")?.value ?? "");
    if (symbol || price > 0 || qty > 0) {
      result.push({ symbol: symbol || "-", price, quantity: qty, sellPrice, marginPct });
    }
  }
  return result;
}

function isoToDatetimeLocalValue(iso: string | undefined): string {
  if (!iso || typeof iso !== "string") return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalValueToIso(local: string): string | undefined {
  const t = local.trim();
  if (!t) return undefined;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function getCashTransactionsFromDOM(): CashTransaction[] {
  if (!cashBodyElement) return [];
  const rows = cashBodyElement.querySelectorAll<HTMLTableRowElement>("tr[data-cash-row]");
  const result: CashTransaction[] = [];
  for (const row of rows) {
    const typeSelect = row.querySelector<HTMLSelectElement>(".cash-type");
    const amountInput = row.querySelector<HTMLInputElement>(".cash-amount");
    const descInput = row.querySelector<HTMLInputElement>(".cash-desc");
    const createdAtInput = row.querySelector<HTMLInputElement>(".cash-created-at");
    const type = (typeSelect?.value ?? "deposit") as "deposit" | "withdrawal";
    const amount = parseAssetInput(amountInput?.value ?? "") ?? 0;
    const description = (descInput?.value ?? "").trim();
    const createdAtIso = datetimeLocalValueToIso(createdAtInput?.value ?? "");
    const hasCreatedAt = Boolean(createdAtInput?.value?.trim());
    if (amount > 0 || description || hasCreatedAt) {
      const tx: CashTransaction = { type, amount, description: description || "-" };
      if (createdAtIso) tx.createdAt = createdAtIso;
      result.push(tx);
    }
  }
  return result;
}

function getDerivativesFromDOM(): DerivativeOrder[] {
  if (!derivativesBodyElement) return [];
  const rows = derivativesBodyElement.querySelectorAll<HTMLTableRowElement>("tr[data-derivatives-row]");
  const result: DerivativeOrder[] = [];
  for (const row of rows) {
    const symbolInput = row.querySelector<HTMLInputElement>(".derivatives-symbol");
    const typeSelect = row.querySelector<HTMLSelectElement>(".derivatives-type");
    const qtyInput = row.querySelector<HTMLInputElement>(".derivatives-qty");
    const priceInput = row.querySelector<HTMLInputElement>(".derivatives-entry-price");
    const closePriceInput = row.querySelector<HTMLInputElement>(".derivatives-close-price");
    const descInput = row.querySelector<HTMLInputElement>(".derivatives-desc");
    const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
    const type = (typeSelect?.value ?? "long") as "long" | "short";
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const entryPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const closePrice = closePriceInput?.value ? (parseAssetInput(closePriceInput.value) ?? undefined) : undefined;
    const description = (descInput?.value ?? "").trim();
    if (symbol || qty > 0 || entryPrice > 0 || description) {
      result.push({ symbol, type, quantity: qty, entryPrice, closePrice, description: description || "-" });
    }
  }
  return result;
}

function getCurrentSettings(): AppSettings {
  return {
    token: tokenInput.value,
    language: currentLanguage,
    symbols: symbolsInput.value,
    startDate: startDateInput.value,
    endDate: endDateInput.value,
    notifyEnabled: notifyEnabledInput?.checked ?? false,
    notifyOnHedgeChange: notifyOnHedgeChangeInput?.checked ?? false,
    notifyOnBuySignal: notifyOnBuySignalInput?.checked ?? false,
    telegramBotToken: telegramBotTokenInput?.value ?? "",
    telegramChatId: telegramChatIdInput?.value ?? "",
    discordWebhookUrl: discordWebhookUrlInput?.value ?? "",
    portfolioPositions: getPortfolioPositionsFromDOM(),
    cashTransactions: getCashTransactionsFromDOM(),
    derivativesOrders: getDerivativesFromDOM()
  };
}

function applySavedSettings(settings: Partial<AppSettings>): void {
  if (typeof settings.token === "string") {
    tokenInput.value = settings.token;
  }
  if (typeof settings.symbols === "string") {
    symbolsInput.value = settings.symbols;
  }
  if (typeof settings.startDate === "string") {
    startDateInput.value = settings.startDate;
  }
  if (typeof settings.endDate === "string") {
    endDateInput.value = settings.endDate;
  }
  if (notifyEnabledInput) notifyEnabledInput.checked = settings.notifyEnabled === true;
  if (notifyOnHedgeChangeInput) notifyOnHedgeChangeInput.checked = settings.notifyOnHedgeChange !== false;
  if (notifyOnBuySignalInput) notifyOnBuySignalInput.checked = settings.notifyOnBuySignal !== false;
  if (telegramBotTokenInput && typeof settings.telegramBotToken === "string") telegramBotTokenInput.value = settings.telegramBotToken;
  if (telegramChatIdInput && typeof settings.telegramChatId === "string") telegramChatIdInput.value = settings.telegramChatId;
  if (discordWebhookUrlInput && typeof settings.discordWebhookUrl === "string") discordWebhookUrlInput.value = settings.discordWebhookUrl;
  if (portfolioBodyElement) {
    renderPortfolioRows(Array.isArray(settings.portfolioPositions) ? settings.portfolioPositions : []);
    refreshPortfolioTotal();
  }
  if (cashBodyElement) {
    renderCashRows(Array.isArray(settings.cashTransactions) ? settings.cashTransactions : []);
    refreshCashTotal();
  }
  if (derivativesBodyElement) {
    renderDerivativesRows(Array.isArray(settings.derivativesOrders) ? settings.derivativesOrders : []);
    refreshDerivativesTotal();
  }
  if (
    settings.language === "vi" ||
    settings.language === "ja" ||
    settings.language === "en" ||
    settings.language === "zh" ||
    settings.language === "ko"
  ) {
    currentLanguage = settings.language;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, settings.language);
  }
}

async function saveSettingsToJsonFile(): Promise<void> {
  const response = await fetch(APP_SETTINGS_API_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(getCurrentSettings())
  });

  if (!response.ok) {
    throw new Error(`Failed to save settings (${response.status}).`);
  }
}

let notificationPermission: NotificationPermission = "default";

function escapeTelegramHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Một dòng cho Telegram + Discord: sau khi gỡ tag HTML, Discord nhận "title: body" */
function buildNotifyMessageLine(title: string, body: string): string {
  const titleOne = title.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  const bodyOne = body.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  return `<b>${escapeTelegramHtml(titleOne)}</b>: ${escapeTelegramHtml(bodyOne)}`;
}

/** Mã phái sinh đang theo dõi (VN30F*) — mặc định VN30F1M */
function getFuturesSymbolForNotify(): string {
  const raw = (symbolsInput?.value ?? "").trim();
  if (!raw) return "VN30F1M";
  try {
    const symbols = parseSymbols(raw);
    const f = symbols.find((s) => s.startsWith("VN30F"));
    return f ?? "VN30F1M";
  } catch {
    return "VN30F1M";
  }
}

/** Dòng plain text chỉ gửi kèm Discord: giá đóng mới nhất (điểm) */
function buildDiscordExtraFuturesLine(): string | undefined {
  const sym = getFuturesSymbolForNotify();
  const price = getLatestCloseForDerivative(sym);
  if (price === null) return undefined;
  return `${sym}: ${formatDisplayNumber(price)}`;
}

async function sendNotification(title: string, body: string): Promise<void> {
  const settings = getCurrentSettings();
  if (!settings.notifyEnabled) return;

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: "/favicon.ico" });
    } catch {
      // ignore
    }
  }

  const token = (settings.telegramBotToken ?? "").trim();
  const chatId = (settings.telegramChatId ?? "").trim();
  const discordUrl = (settings.discordWebhookUrl ?? "").trim();
  if ((token && chatId) || discordUrl) {
    try {
      const discordExtra = buildDiscordExtraFuturesLine();
      await fetch(NOTIFY_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: buildNotifyMessageLine(title, body),
          ...(discordExtra ? { discordExtra } : {})
        })
      });
    } catch {
      // ignore
    }
  }
}

async function ensureNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

function scheduleSaveSettings(): void {
  if (saveSettingsTimer !== null) {
    window.clearTimeout(saveSettingsTimer);
  }

  saveSettingsTimer = window.setTimeout(async () => {
    saveSettingsTimer = null;
    try {
      await saveSettingsToJsonFile();
    } catch (error) {
      appendLog(error instanceof Error ? error.message : String(error));
    }
  }, 300);
}

async function loadSavedSettings(): Promise<void> {
  const response = await fetch(APP_SETTINGS_API_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load settings (${response.status}).`);
  }

  const settings = (await response.json()) as Partial<AppSettings>;
  applySavedSettings(settings);
}

function parseAssetInput(rawValue: string): number | null {
  const digitsOnly = rawValue.replace(/\D/g, "");
  if (!digitsOnly) {
    return null;
  }

  const parsedValue = Number(digitsOnly);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

/** Parse number from formatted text (1.234.567, +1.234.567, -500.000) for sorting */
function parseSortableNumber(raw: string): number {
  const s = String(raw ?? "").trim();
  const neg = s.startsWith("-");
  const digits = s.replace(/\D/g, "");
  const n = digits ? Number(digits) : 0;
  return neg ? -n : n;
}

function parseMarginPct(rawValue: string): number | undefined {
  const cleaned = rawValue.replace(",", ".").trim();
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0 || n > 100) return undefined;
  return n;
}

function formatAssetInput(value: number | null): string {
  if (value === null || value <= 0) {
    return "";
  }

  return value.toLocaleString("vi-VN");
}

function formatAssetValue(value: unknown): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "";
  }

  return Number(value).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function renderPortfolioRows(positions: PortfolioPosition[]): void {
  if (!portfolioBodyElement) return;
  const rows = positions.length > 0 ? positions : [{ symbol: "", price: 0, quantity: 0 }];
  portfolioBodyElement.innerHTML = rows
    .map(
      (pos) => `
    <tr data-portfolio-row>
      <td><input class="portfolio-symbol" type="text" placeholder="NVL" value="${escapeHtml(pos.symbol)}" data-portfolio-field /></td>
      <td><input class="portfolio-price" type="text" inputmode="numeric" placeholder="50.000" value="${pos.price > 0 ? formatAssetInput(pos.price) : ""}" data-portfolio-field /></td>
      <td><input class="portfolio-qty" type="text" inputmode="numeric" placeholder="100" value="${pos.quantity > 0 ? String(pos.quantity) : ""}" data-portfolio-field /></td>
      <td class="portfolio-total-cell"><span class="portfolio-row-total">${pos.price > 0 && pos.quantity > 0 ? formatAssetValue(pos.price * pos.quantity) : ""}</span></td>
      <td class="portfolio-actual-capital-cell"><span class="portfolio-row-actual-capital">${pos.price > 0 && pos.quantity > 0 ? formatAssetValue(pos.marginPct === undefined ? pos.price * pos.quantity : pos.price * pos.quantity * (pos.marginPct / 100)) : ""}</span></td>
      <td><span class="portfolio-row-current"></span></td>
      <td><input class="portfolio-sell-price" type="text" inputmode="numeric" placeholder="" value="${pos.sellPrice && pos.sellPrice > 0 ? formatAssetInput(pos.sellPrice) : ""}" data-portfolio-field /></td>
      <td><input class="portfolio-margin-pct" type="text" inputmode="numeric" placeholder="0" value="${pos.marginPct !== undefined && pos.marginPct > 0 ? String(pos.marginPct) : ""}" data-portfolio-field style="width:50px;text-align:right" /></td>
      <td><span class="portfolio-row-pnl"></span></td>
      <td><span class="portfolio-row-pnlpct"></span></td>
      <td><button type="button" class="portfolio-del-btn secondary-button" data-portfolio-remove>×</button></td>
    </tr>`
    )
    .join("");
  portfolioBodyElement.querySelectorAll("[data-portfolio-field]").forEach((el) => {
    el.addEventListener("input", () => {
      refreshPortfolioRowTotal(el.closest("tr"));
      refreshPortfolioTotal();
      scheduleSaveSettings();
    });
  });
  portfolioBodyElement.querySelectorAll("[data-portfolio-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      if (row && portfolioBodyElement.querySelectorAll("tr[data-portfolio-row]").length > 1) {
        row.remove();
        refreshPortfolioTotal();
        scheduleSaveSettings();
      }
    });
  });
  portfolioBodyElement.querySelectorAll("tr[data-portfolio-row]").forEach((row) => refreshPortfolioRowTotal(row));
  refreshPortfolioTotal();
  if (portfolioSortState) {
    sortAndReorderRows(
      portfolioBodyElement,
      "tr[data-portfolio-row]",
      getPortfolioRowSortValue,
      portfolioSortState.col,
      portfolioSortState.direction
    );
  }
}

function refreshPortfolioRowActualCapital(row: Element | null): void {
  if (!row) return;
  const priceInput = row.querySelector<HTMLInputElement>(".portfolio-price");
  const qtyInput = row.querySelector<HTMLInputElement>(".portfolio-qty");
  const marginPctInput = row.querySelector<HTMLInputElement>(".portfolio-margin-pct");
  const span = row.querySelector<HTMLSpanElement>(".portfolio-row-actual-capital");
  if (!span) return;
  const price = parseAssetInput(priceInput?.value ?? "") ?? 0;
  const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
  const marginPct = parseMarginPct(marginPctInput?.value ?? "");
  const total = price > 0 && qty > 0 ? price * qty : 0;
  if (total <= 0) {
    span.textContent = "";
    return;
  }
  if (marginPct === undefined) {
    span.textContent = formatAssetValue(total);
  } else {
    span.textContent = formatAssetValue(total * (marginPct / 100));
  }
}

function refreshPortfolioRowTotal(row: Element | null): void {
  if (!row) return;
  const priceInput = row.querySelector<HTMLInputElement>(".portfolio-price");
  const qtyInput = row.querySelector<HTMLInputElement>(".portfolio-qty");
  const totalSpan = row.querySelector<HTMLSpanElement>(".portfolio-row-total");
  if (!totalSpan) return;
  const price = parseAssetInput(priceInput?.value ?? "") ?? 0;
  const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
  totalSpan.textContent = price > 0 && qty > 0 ? formatAssetValue(price * qty) : "";
  refreshPortfolioRowActualCapital(row);
  refreshPortfolioRowPnL(row);
}

function refreshPortfolioRowPnL(row: Element): void {
  const symbolInput = row.querySelector<HTMLInputElement>(".portfolio-symbol");
  const priceInput = row.querySelector<HTMLInputElement>(".portfolio-price");
  const qtyInput = row.querySelector<HTMLInputElement>(".portfolio-qty");
  const sellPriceInput = row.querySelector<HTMLInputElement>(".portfolio-sell-price");
  const currentSpan = row.querySelector<HTMLSpanElement>(".portfolio-row-current");
  const pnlSpan = row.querySelector<HTMLSpanElement>(".portfolio-row-pnl");
  const pnlPctSpan = row.querySelector<HTMLSpanElement>(".portfolio-row-pnlpct");
  if (!currentSpan || !pnlSpan || !pnlPctSpan) return;
  const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
  const costPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
  const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
  const sellPrice = sellPriceInput?.value ? (parseAssetInput(sellPriceInput.value) ?? undefined) : undefined;
  const tr = row instanceof HTMLTableRowElement ? row : row.closest("tr");
  tr?.classList.remove("portfolio-row-profit", "portfolio-row-loss");
  if (!symbol || costPrice <= 0 || qty <= 0) {
    currentSpan.textContent = "";
    pnlSpan.textContent = "";
    pnlPctSpan.textContent = "";
    return;
  }
  const currentPrice = getLatestCloseForSymbol(symbol);
  const priceForPnL = sellPrice !== undefined && sellPrice > 0 ? sellPrice : (currentPrice ?? null);
  if (priceForPnL === null) {
    currentSpan.textContent = "-";
    pnlSpan.textContent = "-";
    pnlPctSpan.textContent = "-";
    return;
  }
  const cost = costPrice * qty;
  const pnl = (priceForPnL - costPrice) * qty;
  const pnlPct = cost > 0 ? (pnl / cost) * 100 : null;
  currentSpan.textContent = currentPrice !== null ? formatAssetValue(currentPrice) : "-";
  pnlSpan.textContent = formatAssetValue(pnl);
  pnlSpan.className = pnl > 0 ? "positive" : pnl < 0 ? "negative" : "";
  pnlPctSpan.textContent = pnlPct !== null ? `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%` : "";
  pnlPctSpan.className = (pnlPct ?? 0) > 0 ? "positive" : (pnlPct ?? 0) < 0 ? "negative" : "";
  if (pnl > 0) tr?.classList.add("portfolio-row-profit");
  else if (pnl < 0) tr?.classList.add("portfolio-row-loss");
}

function refreshPortfolioTotal(): void {
  applyPortfolioTabSearch();
  let totalCost = 0;
  let totalCurrent = 0;
  portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => {
    if (row.classList.contains("hidden-by-tab-search")) return;
    const symbolInput = row.querySelector<HTMLInputElement>(".portfolio-symbol");
    const priceInput = row.querySelector<HTMLInputElement>(".portfolio-price");
    const qtyInput = row.querySelector<HTMLInputElement>(".portfolio-qty");
    const sellPriceInput = row.querySelector<HTMLInputElement>(".portfolio-sell-price");
    const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
    const costPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const sellPrice = sellPriceInput?.value ? (parseAssetInput(sellPriceInput.value) ?? undefined) : undefined;
    if (costPrice > 0 && qty > 0) {
      totalCost += costPrice * qty;
      const priceForValue =
        sellPrice !== undefined && sellPrice > 0
          ? sellPrice
          : (symbol ? getLatestCloseForSymbol(symbol) : null);
      totalCurrent += priceForValue !== null ? priceForValue * qty : 0;
    }
  });
  const totalPnL = totalCurrent - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : null;
  let totalDebt = 0;
  portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => {
    if (row.classList.contains("hidden-by-tab-search")) return;
    const symbolInput = row.querySelector<HTMLInputElement>(".portfolio-symbol");
    const priceInput = row.querySelector<HTMLInputElement>(".portfolio-price");
    const qtyInput = row.querySelector<HTMLInputElement>(".portfolio-qty");
    const sellPriceInput = row.querySelector<HTMLInputElement>(".portfolio-sell-price");
    const marginPctInput = row.querySelector<HTMLInputElement>(".portfolio-margin-pct");
    const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
    const costPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const sellPrice = sellPriceInput?.value ? (parseAssetInput(sellPriceInput.value) ?? undefined) : undefined;
    const marginPct = parseMarginPct(marginPctInput?.value ?? "");
    if (costPrice > 0 && qty > 0 && marginPct !== undefined) {
      const priceForValue =
        sellPrice !== undefined && sellPrice > 0
          ? sellPrice
          : (symbol ? getLatestCloseForSymbol(symbol) : null);
      const rowValue = priceForValue !== null ? priceForValue * qty : 0;
      totalDebt += rowValue * (marginPct / 100);
    }
  });
  if (portfolioTotalValueElement) portfolioTotalValueElement.textContent = formatAssetValue(totalCost);
  if (portfolioCurrentValueElement)
    portfolioCurrentValueElement.textContent =
      totalCost > 0 && totalCurrent === 0 ? "-" : formatAssetValue(totalCurrent || totalCost);
  if (portfolioDebtValueElement) portfolioDebtValueElement.textContent = formatAssetValue(totalDebt);
  if (portfolioPnLValueElement) {
    if (totalCost > 0 && totalCurrent === 0) {
      portfolioPnLValueElement.textContent = "-";
      portfolioPnLValueElement.className = "";
    } else if (totalCost > 0) {
      portfolioPnLValueElement.textContent =
        `${formatAssetValue(totalPnL)}${totalPnLPct !== null ? ` (${totalPnLPct >= 0 ? "+" : ""}${totalPnLPct.toFixed(2)}%)` : ""}`;
      portfolioPnLValueElement.className = totalPnL > 0 ? "positive" : totalPnL < 0 ? "negative" : "";
    } else {
      portfolioPnLValueElement.textContent = formatAssetValue(0);
      portfolioPnLValueElement.className = "";
    }
  }
  refreshOverviewHeader();
}

function renderCashRows(transactions: CashTransaction[]): void {
  if (!cashBodyElement) return;
  const rows =
    transactions.length > 0
      ? transactions
      : [{ type: "deposit" as const, amount: 0, description: "" }];
  cashBodyElement.innerHTML = rows
    .map(
      (tx) => `
    <tr data-cash-row class="cash-row-${tx.type}">
      <td>
        <select class="cash-type cash-type-${tx.type}" data-cash-field>
          <option value="deposit" ${tx.type === "deposit" ? "selected" : ""}>${escapeHtml(t("cashTypeDeposit"))}</option>
          <option value="withdrawal" ${tx.type === "withdrawal" ? "selected" : ""}>${escapeHtml(t("cashTypeWithdrawal"))}</option>
        </select>
      </td>
      <td><input class="cash-amount" type="text" inputmode="numeric" placeholder="1.000.000" value="${tx.amount > 0 ? formatAssetInput(tx.amount) : ""}" data-cash-field /></td>
      <td><input class="cash-desc" type="text" placeholder="${escapeHtml(t("cashColDesc"))}" value="${escapeHtml(tx.description || "")}" data-cash-field /></td>
      <td><input class="cash-created-at" type="datetime-local" value="${escapeHtml(isoToDatetimeLocalValue(tx.createdAt))}" data-cash-field /></td>
      <td><button type="button" class="cash-del-btn secondary-button" data-cash-remove>×</button></td>
    </tr>`
    )
    .join("");
  cashBodyElement.querySelectorAll("[data-cash-field]").forEach((el) => {
    el.addEventListener("input", () => {
      const row = el.closest("tr[data-cash-row]");
      const typeSelect = row?.querySelector<HTMLSelectElement>(".cash-type");
      if (typeSelect) {
        typeSelect.classList.remove("cash-type-deposit", "cash-type-withdrawal");
        typeSelect.classList.add(`cash-type-${typeSelect.value}`);
        row.classList.remove("cash-row-deposit", "cash-row-withdrawal");
        row.classList.add(`cash-row-${typeSelect.value}`);
      }
      refreshCashTotal();
      scheduleSaveSettings();
    });
  });
  cashBodyElement.querySelectorAll(".cash-type").forEach((sel) => {
    sel.addEventListener("change", () => {
      const row = (sel as Element).closest("tr[data-cash-row]");
      const typeSelect = row?.querySelector<HTMLSelectElement>(".cash-type");
      if (typeSelect && row) {
        row.classList.remove("cash-row-deposit", "cash-row-withdrawal");
        row.classList.add(`cash-row-${typeSelect.value}`);
      }
    });
  });
  cashBodyElement.querySelectorAll("[data-cash-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr[data-cash-row]");
      if (row && cashBodyElement.querySelectorAll("tr[data-cash-row]").length > 1) {
        row.remove();
        refreshCashTotal();
        scheduleSaveSettings();
      }
    });
  });
  refreshCashTotal();
  if (cashSortState) {
    sortAndReorderRows(cashBodyElement, "tr[data-cash-row]", getCashRowSortValue, cashSortState.col, cashSortState.direction);
  }
}

function refreshCashTotal(): void {
  let total = 0;
  cashBodyElement?.querySelectorAll("tr[data-cash-row]").forEach((row) => {
    const typeSelect = row.querySelector<HTMLSelectElement>(".cash-type");
    const amountInput = row.querySelector<HTMLInputElement>(".cash-amount");
    const type = typeSelect?.value ?? "deposit";
    const amount = parseAssetInput(amountInput?.value ?? "") ?? 0;
    total += type === "deposit" ? amount : -amount;
  });
  if (cashTotalValueElement) cashTotalValueElement.textContent = formatAssetValue(total);
  refreshOverviewHeader();
  applyCashTabSearch();
}

function renderDerivativesRows(orders: DerivativeOrder[]): void {
  if (!derivativesBodyElement) return;
  const rows =
    orders.length > 0
      ? orders
      : [{ symbol: "", type: "long" as const, quantity: 0, entryPrice: 0, closePrice: undefined, description: "" }];
  derivativesBodyElement.innerHTML = rows
    .map(
      (o) => `
    <tr data-derivatives-row class="derivatives-row-${o.type}">
      <td><input class="derivatives-symbol" type="text" placeholder="VN30F1M" value="${escapeHtml(o.symbol)}" data-derivatives-field /></td>
      <td>
        <select class="derivatives-type derivatives-type-${o.type}" data-derivatives-field>
          <option value="long" ${o.type === "long" ? "selected" : ""}>${escapeHtml(t("derivTypeLong"))}</option>
          <option value="short" ${o.type === "short" ? "selected" : ""}>${escapeHtml(t("derivTypeShort"))}</option>
        </select>
      </td>
      <td><input class="derivatives-qty" type="text" inputmode="numeric" placeholder="1" value="${o.quantity > 0 ? String(o.quantity) : ""}" data-derivatives-field /></td>
      <td><input class="derivatives-entry-price" type="text" inputmode="numeric" placeholder="1.250" value="${o.entryPrice > 0 ? formatAssetInput(o.entryPrice) : ""}" data-derivatives-field /></td>
      <td><input class="derivatives-close-price" type="text" inputmode="numeric" placeholder="1.260" value="${o.closePrice !== undefined && o.closePrice > 0 ? formatAssetInput(o.closePrice) : ""}" data-derivatives-field /></td>
      <td><span class="derivatives-pnl-value"></span></td>
      <td><input class="derivatives-desc" type="text" placeholder="${escapeHtml(t("derivColDesc"))}" value="${escapeHtml(o.description || "")}" data-derivatives-field /></td>
      <td><button type="button" class="derivatives-del-btn secondary-button" data-derivatives-remove>×</button></td>
    </tr>`
    )
    .join("");
  derivativesBodyElement.querySelectorAll("[data-derivatives-field]").forEach((el) => {
    el.addEventListener("input", () => {
      const row = el.closest("tr[data-derivatives-row]");
      const typeSelect = row?.querySelector<HTMLSelectElement>(".derivatives-type");
      if (typeSelect) {
        typeSelect.classList.remove("derivatives-type-long", "derivatives-type-short");
        typeSelect.classList.add(`derivatives-type-${typeSelect.value}`);
        row?.classList.remove("derivatives-row-long", "derivatives-row-short");
        row?.classList.add(`derivatives-row-${typeSelect.value}`);
      }
      refreshDerivativesTotal();
      scheduleSaveSettings();
    });
  });
  derivativesBodyElement.querySelectorAll(".derivatives-type").forEach((sel) => {
    sel.addEventListener("change", () => {
      const row = (sel as Element).closest("tr[data-derivatives-row]");
      const typeSelect = row?.querySelector<HTMLSelectElement>(".derivatives-type");
      if (typeSelect && row) {
        row.classList.remove("derivatives-row-long", "derivatives-row-short");
        row.classList.add(`derivatives-row-${typeSelect.value}`);
      }
      refreshDerivativesTotal();
      scheduleSaveSettings();
    });
  });
  derivativesBodyElement.querySelectorAll("[data-derivatives-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr[data-derivatives-row]");
      if (row && derivativesBodyElement.querySelectorAll("tr[data-derivatives-row]").length > 1) {
        row.remove();
        refreshDerivativesTotal();
        scheduleSaveSettings();
      }
    });
  });
  refreshDerivativesTotal();
  if (derivativesSortState) {
    sortAndReorderRows(
      derivativesBodyElement,
      "tr[data-derivatives-row]",
      getDerivativesRowSortValue,
      derivativesSortState.col,
      derivativesSortState.direction
    );
  }
}

function refreshDerivativesTotal(): void {
  let totalPnL = 0;
  derivativesBodyElement?.querySelectorAll("tr[data-derivatives-row]").forEach((row) => {
    const symbolInput = row.querySelector<HTMLInputElement>(".derivatives-symbol");
    const typeSelect = row.querySelector<HTMLSelectElement>(".derivatives-type");
    const qtyInput = row.querySelector<HTMLInputElement>(".derivatives-qty");
    const priceInput = row.querySelector<HTMLInputElement>(".derivatives-entry-price");
    const closePriceInput = row.querySelector<HTMLInputElement>(".derivatives-close-price");
    const pnlSpan = row.querySelector<HTMLSpanElement>(".derivatives-pnl-value");
    const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
    const type = (typeSelect?.value ?? "long") as "long" | "short";
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const entryPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const closePriceRaw = closePriceInput?.value ? parseAssetInput(closePriceInput.value) ?? undefined : undefined;
    const closePrice =
      closePriceRaw !== undefined && closePriceRaw > 0
        ? closePriceRaw
        : (symbol ? getLatestCloseForDerivative(symbol) : null);
    let pnl: number | null = null;
    if (entryPrice > 0 && qty > 0 && closePrice !== null) {
      const pointDiff = type === "long" ? closePrice - entryPrice : entryPrice - closePrice;
      pnl = pointDiff * qty * FUTURES_POINT_VALUE;
      totalPnL += pnl;
    }
    if (pnlSpan) {
      pnlSpan.textContent = pnl !== null ? `${pnl >= 0 ? "+" : ""}${formatAssetValue(pnl)}` : "-";
      pnlSpan.className = `derivatives-pnl-value ${pnl !== null ? (pnl > 0 ? "positive" : pnl < 0 ? "negative" : "") : ""}`.trim();
    }
  });
  const count = derivativesBodyElement?.querySelectorAll("tr[data-derivatives-row]").length ?? 0;
  if (derivativesTotalValueElement) derivativesTotalValueElement.textContent = String(count);
  if (derivativesPnLValueElement) {
    derivativesPnLValueElement.textContent = formatAssetValue(totalPnL);
    derivativesPnLValueElement.className = `derivatives-pnl-total ${totalPnL > 0 ? "positive" : totalPnL < 0 ? "negative" : ""}`.trim();
  }
  refreshOverviewHeader();
  applyDerivativesTabSearch();
}

/** `tr.textContent` omits values inside `<input>` / `<select>` — include them for tab search. */
function getTableRowSearchText(row: Element): string {
  const parts: string[] = [row.textContent ?? ""];
  row.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      parts.push(el.value);
    } else if (el instanceof HTMLSelectElement) {
      parts.push(el.value);
      const opt = el.options[el.selectedIndex];
      if (opt) parts.push(opt.text);
    }
  });
  return parts.join(" ").toLowerCase();
}

function applyPortfolioTabSearch(): void {
  if (!portfolioBodyElement) return;
  const q = (portfolioTabSearchInput?.value ?? "").trim().toLowerCase();
  portfolioBodyElement.querySelectorAll("tr.tab-search-no-match").forEach((el) => el.remove());
  const rows = portfolioBodyElement.querySelectorAll<HTMLTableRowElement>("tr[data-portfolio-row]");
  let visible = 0;
  rows.forEach((row) => {
    const show = !q || getTableRowSearchText(row).includes(q);
    row.classList.toggle("hidden-by-tab-search", !show);
    if (show) visible++;
  });
  if (q && rows.length > 0 && visible === 0) {
    const tr = document.createElement("tr");
    tr.className = "tab-search-no-match";
    tr.innerHTML = `<td colspan="11">${escapeHtml(t("tabSearchNoMatch"))}</td>`;
    portfolioBodyElement.appendChild(tr);
  }
}

function applyCashTabSearch(): void {
  if (!cashBodyElement) return;
  const q = (cashTabSearchInput?.value ?? "").trim().toLowerCase();
  cashBodyElement.querySelectorAll("tr.tab-search-no-match").forEach((el) => el.remove());
  const rows = cashBodyElement.querySelectorAll<HTMLTableRowElement>("tr[data-cash-row]");
  let visible = 0;
  rows.forEach((row) => {
    const show = !q || getTableRowSearchText(row).includes(q);
    row.classList.toggle("hidden-by-tab-search", !show);
    if (show) visible++;
  });
  if (q && rows.length > 0 && visible === 0) {
    const tr = document.createElement("tr");
    tr.className = "tab-search-no-match";
    tr.innerHTML = `<td colspan="5">${escapeHtml(t("tabSearchNoMatch"))}</td>`;
    cashBodyElement.appendChild(tr);
  }
}

function applyOverviewTabSearch(): void {
  const q = (overviewTabSearchInput?.value ?? "").trim().toLowerCase();
  const cards = document.querySelectorAll("#overviewTab .overview-card");
  let visible = 0;
  cards.forEach((card) => {
    const show = !q || (card.textContent ?? "").toLowerCase().includes(q);
    card.classList.toggle("hidden-by-tab-search", !show);
    if (show) visible++;
  });
  if (overviewTabSearchNoMatchElement) {
    if (q && cards.length > 0 && visible === 0) {
      overviewTabSearchNoMatchElement.textContent = t("tabSearchNoMatch");
      overviewTabSearchNoMatchElement.hidden = false;
    } else {
      overviewTabSearchNoMatchElement.textContent = "";
      overviewTabSearchNoMatchElement.hidden = true;
    }
  }
}

function applyDerivativesTabSearch(): void {
  if (!derivativesBodyElement) return;
  const q = (derivativesTabSearchInput?.value ?? "").trim().toLowerCase();
  derivativesBodyElement.querySelectorAll("tr.tab-search-no-match").forEach((el) => el.remove());
  const rows = derivativesBodyElement.querySelectorAll<HTMLTableRowElement>("tr[data-derivatives-row]");
  let visible = 0;
  rows.forEach((row) => {
    const show = !q || getTableRowSearchText(row).includes(q);
    row.classList.toggle("hidden-by-tab-search", !show);
    if (show) visible++;
  });
  if (q && rows.length > 0 && visible === 0) {
    const tr = document.createElement("tr");
    tr.className = "tab-search-no-match";
    tr.innerHTML = `<td colspan="8">${escapeHtml(t("tabSearchNoMatch"))}</td>`;
    derivativesBodyElement.appendChild(tr);
  }
}

function refreshOverviewHeader(): void {
  let portfolioCost = 0;
  let portfolioCurrent = 0;
  let cashTotal = 0;
  portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => {
    const symbolInput = row.querySelector<HTMLInputElement>(".portfolio-symbol");
    const priceInput = row.querySelector<HTMLInputElement>(".portfolio-price");
    const qtyInput = row.querySelector<HTMLInputElement>(".portfolio-qty");
    const sellPriceInput = row.querySelector<HTMLInputElement>(".portfolio-sell-price");
    const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
    const costPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const sellPrice = sellPriceInput?.value ? (parseAssetInput(sellPriceInput.value) ?? undefined) : undefined;
    if (costPrice > 0 && qty > 0) {
      portfolioCost += costPrice * qty;
      const priceForValue =
        sellPrice !== undefined && sellPrice > 0
          ? sellPrice
          : (symbol ? getLatestCloseForSymbol(symbol) : null);
      portfolioCurrent += priceForValue !== null ? priceForValue * qty : 0;
    }
  });
  cashBodyElement?.querySelectorAll("tr[data-cash-row]").forEach((row) => {
    const typeSelect = row.querySelector<HTMLSelectElement>(".cash-type");
    const amountInput = row.querySelector<HTMLInputElement>(".cash-amount");
    const type = typeSelect?.value ?? "deposit";
    const amount = parseAssetInput(amountInput?.value ?? "") ?? 0;
    cashTotal += type === "deposit" ? amount : -amount;
  });
  let totalDebt = 0;
  portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => {
    const symbolInput = row.querySelector<HTMLInputElement>(".portfolio-symbol");
    const priceInput = row.querySelector<HTMLInputElement>(".portfolio-price");
    const qtyInput = row.querySelector<HTMLInputElement>(".portfolio-qty");
    const sellPriceInput = row.querySelector<HTMLInputElement>(".portfolio-sell-price");
    const marginPctInput = row.querySelector<HTMLInputElement>(".portfolio-margin-pct");
    const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
    const costPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const sellPrice = sellPriceInput?.value ? (parseAssetInput(sellPriceInput.value) ?? undefined) : undefined;
    const marginPct = parseMarginPct(marginPctInput?.value ?? "");
    if (costPrice > 0 && qty > 0 && marginPct !== undefined) {
      const priceForValue =
        sellPrice !== undefined && sellPrice > 0
          ? sellPrice
          : (symbol ? getLatestCloseForSymbol(symbol) : null);
      const rowValue = priceForValue !== null ? priceForValue * qty : 0;
      totalDebt += rowValue * (marginPct / 100);
    }
  });
  let derivativesPnL = 0;
  derivativesBodyElement?.querySelectorAll("tr[data-derivatives-row]").forEach((row) => {
    const symbolInput = row.querySelector<HTMLInputElement>(".derivatives-symbol");
    const typeSelect = row.querySelector<HTMLSelectElement>(".derivatives-type");
    const qtyInput = row.querySelector<HTMLInputElement>(".derivatives-qty");
    const priceInput = row.querySelector<HTMLInputElement>(".derivatives-entry-price");
    const closePriceInput = row.querySelector<HTMLInputElement>(".derivatives-close-price");
    const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
    const type = (typeSelect?.value ?? "long") as "long" | "short";
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const entryPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const closePriceRaw = closePriceInput?.value ? parseAssetInput(closePriceInput.value) ?? undefined : undefined;
    const closePrice =
      closePriceRaw !== undefined && closePriceRaw > 0
        ? closePriceRaw
        : (symbol ? getLatestCloseForDerivative(symbol) : null);
    if (entryPrice > 0 && qty > 0 && closePrice !== null) {
      const pointDiff = type === "long" ? closePrice - entryPrice : entryPrice - closePrice;
      derivativesPnL += pointDiff * qty * FUTURES_POINT_VALUE;
    }
  });
  const pnl = portfolioCurrent - portfolioCost + derivativesPnL;
  const netAsset = portfolioCurrent + cashTotal - totalDebt + derivativesPnL;
  if (overviewHeaderInitialAssetLabelElement) overviewHeaderInitialAssetLabelElement.textContent = t("overviewHeaderInitialAssetLabel");
  if (overviewHeaderInitialAssetValueElement) {
    overviewHeaderInitialAssetValueElement.textContent =
      portfolioCost > 0 || cashTotal !== 0 ? formatAssetValue(netAsset - pnl) : "-";
  }
  if (overviewHeaderPnLLabelElement) overviewHeaderPnLLabelElement.textContent = t("overviewHeaderPnLLabel");
  if (overviewHeaderNetAssetLabelElement) overviewHeaderNetAssetLabelElement.textContent = t("overviewHeaderNetAssetLabel");
  if (overviewHeaderPnLValueElement) {
    overviewHeaderPnLValueElement.textContent =
      portfolioCost > 0 && portfolioCurrent === 0 ? "-" : `${pnl >= 0 ? "+" : ""}${formatAssetValue(pnl)}`;
    overviewHeaderPnLValueElement.className = `overview-header-value ${getValueClass(pnl)}`.trim();
  }
  if (overviewHeaderNetAssetValueElement) {
    overviewHeaderNetAssetValueElement.textContent =
      portfolioCost > 0 && portfolioCurrent === 0 && cashTotal === 0 ? "-" : formatAssetValue(netAsset);
    overviewHeaderNetAssetValueElement.className = "overview-header-value";
  }
}

function getComparisonClass(currentValue: number | null, baseValue: number | null): string {
  if (currentValue === null || baseValue === null || currentValue === baseValue) {
    return "";
  }

  return currentValue > baseValue ? "positive" : "negative";
}

function renderOverview(): void {
  overviewVn30LabelElement.textContent = t("overviewVn30Label");
  overviewFuturesLabelElement.textContent = t("overviewFuturesLabel");
  overviewTotalLabelElement.textContent = t("overviewTotalLabel");

  if (Object.keys(currentMappingData).length === 0) {
    overviewVn30ValueElement.textContent = "-";
    overviewFuturesValueElement.textContent = "-";
    overviewTotalValueElement.textContent = "-";
    overviewVn30ValueElement.className = "overview-value";
    overviewFuturesValueElement.className = "overview-value";
    overviewTotalValueElement.className = "overview-value";
    overviewVn30SubtextElement.textContent = t("overviewNoData");
    overviewFuturesSubtextElement.textContent = t("overviewNoData");
    overviewTotalSubtextElement.textContent = t("overviewNoData");
    applyOverviewTabSearch();
    return;
  }

  const rows = buildMappingRows(currentMappingData);
  const latestRow = rows[0] ?? null;
  const configuredAssets = getConfiguredAssetInputs();
  const vn30BaseAsset = configuredAssets.VN30 ?? null;
  const totalBaseAsset =
    (configuredAssets.VN30 ?? 0) + FUTURES_MARGIN_PER_CONTRACT;
  const vn30Value = toNumberOrNull(latestRow?.VN30AssetValue);
  const vn30f1mValue = toNumberOrNull(latestRow?.VN30F1MAssetValue);
  const totalAsset =
    vn30Value === null && vn30f1mValue === null
      ? null
      : (vn30Value ?? 0) + (vn30f1mValue ?? 0);
  const totalPnL =
    totalAsset === null ? null : totalAsset - totalBaseAsset;
  const futuresBaseMargin = configuredAssets.VN30F1M ?? null;
  const futuresPnL =
    futuresBaseMargin === null
      ? null
      : rows.reduce((sum, row) => {
          const futuresRowValue = toNumberOrNull(row.VN30F1MAssetValue);
          return futuresRowValue === null ? sum : sum + (futuresRowValue - futuresBaseMargin);
        }, 0);
  const appliedDate = String(latestRow?.assetAppliedDate ?? latestRow?.date ?? "");

  overviewVn30ValueElement.textContent = vn30Value === null ? "-" : formatAssetValue(vn30Value);
  overviewVn30ValueElement.className = `overview-value ${getComparisonClass(vn30Value, vn30BaseAsset)}`.trim();
  overviewVn30SubtextElement.textContent = appliedDate ? `${t("overviewBaseDateLabel")}: ${appliedDate}` : t("overviewNoData");

  overviewFuturesValueElement.textContent =
    futuresPnL === null ? "-" : `${futuresPnL > 0 ? "+" : ""}${formatAssetValue(futuresPnL)}`;
  overviewFuturesValueElement.className = `overview-value ${getValueClass(futuresPnL)}`.trim();
  overviewFuturesSubtextElement.textContent = appliedDate ? `${t("overviewBaseDateLabel")}: ${appliedDate}` : t("overviewNoData");

  overviewTotalValueElement.textContent =
    totalAsset === null
      ? "-"
      : `${formatAssetValue(totalAsset)}${
          totalPnL === null ? "" : ` (${totalPnL > 0 ? "+" : ""}${formatAssetValue(totalPnL)})`
        }`;
  overviewTotalValueElement.className = `overview-value ${getComparisonClass(totalAsset, totalBaseAsset)}`.trim();
  overviewTotalSubtextElement.textContent = appliedDate ? `${t("overviewBaseDateLabel")}: ${appliedDate}` : t("overviewNoData");
  applyOverviewTabSearch();
}

function getConfiguredAssetInputs(): Record<string, number | null> {
  const vn30Input = document.querySelector<HTMLInputElement>("#vn30Asset");
  const vn30f1mInput = document.querySelector<HTMLInputElement>("#vn30f1mAsset");
  return {
    VN30: vn30Input ? parseAssetInput(vn30Input.value) : null,
    VN30F1M: vn30f1mInput ? parseAssetInput(vn30f1mInput.value) : null
  };
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mergeLatestQuoteIntoRows(existingRows: HistoricalQuote[], latestQuote: HistoricalQuote): HistoricalQuote[] {
  const filteredRows = existingRows.filter((row) => String(row.date).slice(0, 10) !== String(latestQuote.date).slice(0, 10));
  return normalizeQuotes([...filteredRows, latestQuote]);
}

function refreshDataViews(): void {
  if (Object.keys(currentMappingData).length === 0) {
    renderOverview();
    portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => refreshPortfolioRowPnL(row));
    refreshPortfolioTotal();
    refreshDerivativesTotal();
    return;
  }

  renderOverview();
  renderMappingTable(currentMappingData, mappingSortState);
  renderDetailPanel(currentMappingData, currentDetailState.date, currentDetailState.symbol);
  portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => refreshPortfolioRowPnL(row));
  refreshPortfolioTotal();
  refreshDerivativesTotal();
}

function formatAssetInputs(): void {
  const vn30Input = document.querySelector<HTMLInputElement>("#vn30Asset");
  const vn30f1mInput = document.querySelector<HTMLInputElement>("#vn30f1mAsset");
  if (vn30Input) vn30Input.value = formatAssetInput(parseAssetInput(vn30Input.value));
  if (vn30f1mInput) vn30f1mInput.value = formatAssetInput(parseAssetInput(vn30f1mInput.value));
}

function calculateSimpleFuturesAssetValue(baseMargin: number | null, priceChange: number | null): number | null {
  if (baseMargin === null || baseMargin <= 0) {
    return null;
  }

  const contractCount = Math.floor(baseMargin / FUTURES_MARGIN_PER_CONTRACT);
  if (contractCount <= 0) {
    return baseMargin;
  }

  if (priceChange === null || priceChange >= -5) {
    return baseMargin;
  }

  return baseMargin - (priceChange + 5) * FUTURES_POINT_VALUE * contractCount;
}

function isMappingColumnVisible(column: MappingColumn): boolean {
  return column.key === "date" || !hiddenMappingColumnKeys.has(column.key);
}

function renderHiddenColumnsBar(columns: MappingColumn[]): void {
  const hiddenColumns = columns.filter((column) => column.key !== "date" && hiddenMappingColumnKeys.has(column.key));

  if (hiddenColumns.length === 0) {
    hiddenColumnsBarElement.innerHTML = "";
    return;
  }

  const chips = hiddenColumns
    .map(
      (column) =>
        `<span class="hidden-column-chip">${escapeHtml(column.label)} <button type="button" data-restore-column="${escapeHtml(
          column.key
        )}" title="${escapeHtml(t("restoreColumns"))}">+</button></span>`
    )
    .join("");

  hiddenColumnsBarElement.innerHTML = `<span class="hidden-columns-label">${escapeHtml(
    t("hiddenColumnsLabel")
  )}</span>${chips}<button type="button" class="restore-columns-button" data-restore-all-columns="true">${escapeHtml(
    t("restoreColumns")
  )}</button>`;
}

function applyStaticTranslations(): void {
  appTitleElement.textContent = t("appTitle");
  noteIntroElement.innerHTML = t("noteIntroHtml");
  noteUsageElement.innerHTML = t("noteUsageHtml");
  tokenLabelElement.textContent = t("tokenLabel");
  tokenInput.placeholder = t("tokenPlaceholder");
  languageLabelElement.textContent = t("languageLabel");
  symbolsLabelElement.textContent = t("symbolsLabel");
  symbolsInput.placeholder = t("symbolsPlaceholder");
  startDateLabelElement.textContent = t("startDateLabel");
  endDateLabelElement.textContent = t("endDateLabel");
  if (notifyEnabledLabelElement) notifyEnabledLabelElement.textContent = t("notifyEnabledLabel");
  if (notifyOnHedgeLabelElement) notifyOnHedgeLabelElement.textContent = t("notifyOnHedgeLabel");
  if (notifyOnBuyLabelElement) notifyOnBuyLabelElement.textContent = t("notifyOnBuyLabel");
  if (portfolioSectionTitleElement) portfolioSectionTitleElement.textContent = t("portfolioTitle");
  if (portfolioSectionDescElement) portfolioSectionDescElement.textContent = t("portfolioDesc");
  setSortableLabel(portfolioColSymbolElement, t("portfolioColSymbol"));
  setSortableLabel(portfolioColPriceElement, t("portfolioColPrice"));
  setSortableLabel(portfolioColQtyElement, t("portfolioColQty"));
  setSortableLabel(portfolioColTotalElement, t("portfolioColTotal"));
  setSortableLabel(portfolioColActualCapitalElement, t("portfolioColActualCapital"));
  setSortableLabel(portfolioColCurrentPriceElement, t("portfolioColCurrentPrice"));
  setSortableLabel(portfolioColSellPriceElement, t("portfolioColSellPrice"));
  setSortableLabel(portfolioColMarginPctElement, t("portfolioColMarginPct"));
  setSortableLabel(portfolioColPnLElement, t("portfolioColPnL"));
  setSortableLabel(portfolioColPnLPctElement, t("portfolioColPnLPct"));
  if (portfolioAddRowButton) portfolioAddRowButton.textContent = t("portfolioAddRow");
  if (portfolioTotalLabelElement) portfolioTotalLabelElement.textContent = t("portfolioTotalLabel");
  if (portfolioCurrentLabelElement) portfolioCurrentLabelElement.textContent = t("portfolioCurrentLabel");
  if (portfolioPnLLabelElement) portfolioPnLLabelElement.textContent = t("portfolioPnLLabel");
  if (portfolioDebtLabelElement) portfolioDebtLabelElement.textContent = t("portfolioDebtLabel");
  if (cashSectionTitleElement) cashSectionTitleElement.textContent = t("cashTitle");
  if (cashSectionDescElement) cashSectionDescElement.textContent = t("cashDesc");
  setSortableLabel(cashColTypeElement, t("cashColType"));
  setSortableLabel(cashColAmountElement, t("cashColAmount"));
  setSortableLabel(cashColDescElement, t("cashColDesc"));
  setSortableLabel(cashColCreatedAtElement, t("cashColCreatedAt"));
  if (cashAddRowButton) cashAddRowButton.textContent = t("cashAddRow");
  if (cashTotalLabelElement) cashTotalLabelElement.textContent = t("cashTotalLabel");
  if (derivativesSectionTitleElement) derivativesSectionTitleElement.textContent = t("derivativesSectionTitle");
  if (derivativesSectionDescElement) derivativesSectionDescElement.textContent = t("derivativesSectionDesc");
  setSortableLabel(derivColSymbolElement, t("derivColSymbol"));
  setSortableLabel(derivColTypeElement, t("derivColType"));
  setSortableLabel(derivColQtyElement, t("derivColQty"));
  setSortableLabel(derivColPriceElement, t("derivColPrice"));
  setSortableLabel(derivColClosePriceElement, t("derivColClosePrice"));
  setSortableLabel(derivColPnLElement, t("derivColPnL"));
  setSortableLabel(derivColDescElement, t("derivColDesc"));
  if (derivativesAddRowButton) derivativesAddRowButton.textContent = t("derivativesAddRow");
  if (derivativesTotalLabelElement) derivativesTotalLabelElement.textContent = t("derivativesTotalLabel");
  if (derivativesPnLLabelElement) derivativesPnLLabelElement.textContent = t("derivativesPnLLabel");
  if (simDerivativesSectionTitleElement) simDerivativesSectionTitleElement.textContent = t("simDerivTabTitle");
  if (simDerivativesSectionDescElement) simDerivativesSectionDescElement.textContent = t("simDerivTabDesc");
  if (simDerivAddRowButton) simDerivAddRowButton.textContent = t("simDerivAddRow");
  if (simDerivClearButton) simDerivClearButton.textContent = t("simDerivClearBtn");
  if (simDerivTotalPnLLabelElement) simDerivTotalPnLLabelElement.textContent = t("simDerivTotalPnLLabel");
  if (simDerivColTypeElement) simDerivColTypeElement.textContent = t("simDerivColType");
  if (simDerivColQtyElement) simDerivColQtyElement.textContent = t("simDerivColQty");
  if (simDerivColEntryElement) simDerivColEntryElement.textContent = t("simDerivColEntry");
  if (simDerivColCloseElement) simDerivColCloseElement.textContent = t("simDerivColClose");
  if (simDerivColPnLElement) simDerivColPnLElement.textContent = t("simDerivColPnL");
  if (portfolioTabSearchInput) portfolioTabSearchInput.placeholder = t("tabSearchPlaceholder");
  if (cashTabSearchInput) cashTabSearchInput.placeholder = t("tabSearchPlaceholder");
  if (overviewTabSearchInput) overviewTabSearchInput.placeholder = t("tabSearchPlaceholder");
  if (derivativesTabSearchInput) derivativesTabSearchInput.placeholder = t("tabSearchPlaceholder");
  if (portfolioTabSearchHintElement) portfolioTabSearchHintElement.textContent = t("tabSearchHint");
  if (cashTabSearchHintElement) cashTabSearchHintElement.textContent = t("tabSearchHint");
  if (derivativesTabSearchHintElement) derivativesTabSearchHintElement.textContent = t("tabSearchHint");
  if (overviewHeaderInitialAssetLabelElement) overviewHeaderInitialAssetLabelElement.textContent = t("overviewHeaderInitialAssetLabel");
  if (overviewHeaderPnLLabelElement) overviewHeaderPnLLabelElement.textContent = t("overviewHeaderPnLLabel");
  if (overviewHeaderNetAssetLabelElement) overviewHeaderNetAssetLabelElement.textContent = t("overviewHeaderNetAssetLabel");
  refreshOverviewHeader();
  renderSimDerivativesRows(getSimDerivRowsFromDOM());
  loadButton.textContent = t("loadButton");
  if (saveSettingsButton) saveSettingsButton.textContent = t("saveSettingsButton");
  suggestButton.textContent = t("suggestButton");
  runButton.textContent = t("runButton");
  detailPanelTitleElement.textContent = t("detailPanelTitle");
  if (suggestModalTitle) suggestModalTitle.textContent = t("suggestModalTitle");
  languageSelect.value = currentLanguage;
  syncPipButtonLabel();
  renderOverview();

  if (Object.keys(currentMappingData).length === 0) {
    mappingHeadElement.innerHTML = "";
    mappingBodyElement.innerHTML = `<tr><td>${escapeHtml(t("tableEmpty"))}</td></tr>`;
    hiddenColumnsBarElement.innerHTML = "";
    detailContentElement.innerHTML = t("detailHint");
  }

  refreshSummary();
}

function updateLanguage(language: Language): void {
  currentLanguage = language;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  applyStaticTranslations();

  if (Object.keys(currentMappingData).length > 0) {
    renderMappingTable(currentMappingData);
    renderDetailPanel(currentMappingData, currentDetailState.date, currentDetailState.symbol);
  } else {
    renderPictureInPictureContent();
  }
}

function supportsDocumentPictureInPicture(): boolean {
  return "documentPictureInPicture" in window;
}

function syncPipButtonLabel(): void {
  if (!supportsDocumentPictureInPicture()) {
    pipButton.disabled = true;
    pipButton.textContent = t("pipUnsupported");
    return;
  }

  pipButton.disabled = false;
  pipButton.textContent = pipWindowRef && !pipWindowRef.closed ? t("pipButtonClose") : t("pipButtonOpen");
}

function resetMappingView(message: string): void {
  currentMappingData = {};
  stopRealtimeRefresh();
  mappingSortState = { ...defaultSortState };
  currentDetailState = { date: null, symbol: null };
  mappingHeadElement.innerHTML = "";
  mappingBodyElement.innerHTML = `<tr><td>${escapeHtml(message)}</td></tr>`;
  hiddenColumnsBarElement.innerHTML = "";
  detailContentElement.innerHTML = t("detailHint");
  renderOverview();
  renderPictureInPictureContent();
}

function resetPictureInPictureVisibility(): void {
  pipHiddenSections = {
    metrics: false,
    reason: false,
    buySignals: false,
    cards: false
  };
  pipHiddenSymbols = {};
}

function setSortableLabel(el: HTMLElement | null, text: string): void {
  if (!el) return;
  const label = el.querySelector(".sortable-label");
  if (label) label.textContent = text;
  else el.textContent = text;
}

function getPortfolioRowSortValue(row: HTMLTableRowElement, col: number): number | string {
  const cells = row.querySelectorAll("td");
  const cell = cells[col];
  if (!cell) return "";
  const input = cell.querySelector<HTMLInputElement>("input");
  const span = cell.querySelector<HTMLSpanElement>("span");
  const val = input ? input.value : span ? span.textContent ?? "" : cell.textContent ?? "";
  if (col === 0) return String(val).trim().toUpperCase();
  return parseSortableNumber(val);
}

function getCashRowSortValue(row: HTMLTableRowElement, col: number): number | string {
  const cells = row.querySelectorAll("td");
  const cell = cells[col];
  if (!cell) return "";
  const input = cell.querySelector<HTMLInputElement>("input");
  const select = cell.querySelector<HTMLSelectElement>("select");
  const val = select ? select.value : input ? input.value : cell.textContent ?? "";
  if (col === 0) return String(val);
  if (col === 2) return String(val).trim();
  if (col === 3) {
    const v = input?.value ?? "";
    if (!v.trim()) return "";
    const ms = new Date(v).getTime();
    return Number.isNaN(ms) ? "" : ms;
  }
  return parseSortableNumber(val);
}

function getDerivativesRowSortValue(row: HTMLTableRowElement, col: number): number | string {
  const cells = row.querySelectorAll("td");
  const cell = cells[col];
  if (!cell) return "";
  const input = cell.querySelector<HTMLInputElement>("input");
  const select = cell.querySelector<HTMLSelectElement>("select");
  const span = cell.querySelector<HTMLSpanElement>("span");
  const val = select ? select.value : input ? input.value : span ? span.textContent ?? "" : cell.textContent ?? "";
  if (col === 0 || col === 6) return String(val).trim();
  if (col === 1) return String(val);
  return parseSortableNumber(val);
}

function sortAndReorderRows(
  tbody: HTMLTableSectionElement | null,
  rowSelector: string,
  getSortValue: (row: HTMLTableRowElement, col: number) => number | string,
  col: number,
  direction: "asc" | "desc"
): void {
  if (!tbody) return;
  const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>(rowSelector));
  if (rows.length <= 1) return;
  const mult = direction === "asc" ? 1 : -1;
  rows.sort((a, b) => {
    const va = getSortValue(a, col);
    const vb = getSortValue(b, col);
    const cmp =
      typeof va === "string" && typeof vb === "string"
        ? va.localeCompare(vb, undefined, { numeric: true })
        : (typeof va === "number" && typeof vb === "number" ? (va < vb ? -1 : va > vb ? 1 : 0) : String(va).localeCompare(String(vb)));
    return mult * cmp;
  });
  rows.forEach((r) => tbody.appendChild(r));
}

function updateTabSortIndicators(tableId: string, sortState: TabSortState | null): void {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.querySelectorAll(".sortable-th").forEach((th) => {
    const indicator = th.querySelector(".sort-indicator-small");
    const colStr = (th as HTMLElement).dataset.sortCol;
    const col = colStr !== undefined ? parseInt(colStr, 10) : -1;
    if (indicator && sortState && sortState.col === col) {
      indicator.textContent = sortState.direction === "asc" ? " ▲" : " ▼";
      indicator.className = "sort-indicator-small active";
    } else if (indicator) {
      indicator.textContent = "";
      indicator.className = "sort-indicator-small";
    }
  });
}

function handleTabSortClick(
  ev: Event,
  tableId: "portfolioTable" | "cashTable" | "derivativesTable",
  tbody: HTMLTableSectionElement | null,
  rowSelector: string,
  getSortValue: (row: HTMLTableRowElement, col: number) => number | string
): void {
  const th = (ev.target as HTMLElement)?.closest?.(".sortable-th");
  if (!th) return;
  const colStr = (th as HTMLElement).getAttribute("data-sort-col");
  if (colStr === null || colStr === undefined) return;
  const col = parseInt(colStr, 10);
  if (Number.isNaN(col)) return;
  const state =
    tableId === "portfolioTable"
      ? portfolioSortState
      : tableId === "cashTable"
        ? cashSortState
        : derivativesSortState;
  const nextDir: "asc" | "desc" =
    state && state.col === col ? (state.direction === "asc" ? "desc" : "asc") : "asc";
  const newState: TabSortState = { col, direction: nextDir };
  if (tableId === "portfolioTable") portfolioSortState = newState;
  else if (tableId === "cashTable") cashSortState = newState;
  else derivativesSortState = newState;
  sortAndReorderRows(tbody, rowSelector, getSortValue, col, nextDir);
  updateTabSortIndicators(tableId, newState);
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeToken(rawToken: string): string {
  return rawToken.replace(/^Bearer\s+/i, "").trim();
}

function toNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatPercent(value: unknown): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "";
  }

  return `${Number(value).toFixed(2)}%`;
}

function formatSignalLabel(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const labelsByLanguage: Record<Language, Record<string, string>> = {
    vi: {
      "No hedge": "Không hedge",
      Watch: "Theo dõi",
      "Hedge on": "Đang hedge",
      "Stop hedge": "Dừng hedge",
      "Basis risk": "Rủi ro basis",
      Short: "Short",
      Hold: "Giữ hedge",
      Stop: "Dừng short",
      "No action": "Không hành động"
    },
    ja: {
      "No hedge": "ヘッジなし",
      Watch: "監視",
      "Hedge on": "ヘッジ中",
      "Stop hedge": "ヘッジ停止",
      "Basis risk": "Basis リスク",
      Short: "ショート",
      Hold: "ヘッジ維持",
      Stop: "ショート停止",
      "No action": "アクションなし"
    },
    en: {
      "No hedge": "No hedge",
      Watch: "Watch",
      "Hedge on": "Hedge on",
      "Stop hedge": "Stop hedge",
      "Basis risk": "Basis risk",
      Short: "Short",
      Hold: "Hold",
      Stop: "Stop",
      "No action": "No action"
    },
    zh: {
      "No hedge": "无对冲",
      Watch: "观察",
      "Hedge on": "对冲中",
      "Stop hedge": "停止对冲",
      "Basis risk": "Basis 风险",
      Short: "做空",
      Hold: "维持对冲",
      Stop: "停止做空",
      "No action": "无操作"
    },
    ko: {
      "No hedge": "헤지 없음",
      Watch: "관찰",
      "Hedge on": "헤지 중",
      "Stop hedge": "헤지 중단",
      "Basis risk": "Basis 리스크",
      Short: "숏",
      Hold: "헤지 유지",
      Stop: "숏 중단",
      "No action": "조치 없음"
    }
  };

  return labelsByLanguage[currentLanguage][value] ?? value;
}

function formatSignalReason(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    return "";
  }

  const labelsByLanguage: Record<Language, Record<string, string>> = {
    vi: {
      "VN30 recovered": "VN30 hồi phục",
      "corr20 weakened": "Tương quan corr20 suy yếu",
      "basis too stretched": "Basis lệch quá mức",
      "tracking error spiked": "Tracking error tăng vọt",
      "VN30 still weak": "VN30 vẫn yếu",
      "correlation healthy": "Tương quan còn tốt",
      "hedge remains valid": "Hedge vẫn hiệu quả",
      "VN30 weak": "VN30 suy yếu",
      "corr20 strong": "corr20 mạnh",
      "basis normal": "Basis bình thường",
      "tracking clean": "Tracking sạch",
      "short-term pressure confirmed": "Áp lực ngắn hạn được xác nhận",
      "tracking error high": "Tracking error cao",
      "basis changed abruptly": "Basis thay đổi đột ngột",
      "watch list": "Cần theo dõi",
      "most entry conditions present": "Đã có phần lớn điều kiện vào lệnh",
      "no clean hedge setup": "Chưa có setup hedge đẹp"
    },
    ja: {
      "VN30 recovered": "VN30 が回復",
      "corr20 weakened": "corr20 の相関が弱化",
      "basis too stretched": "Basis が行き過ぎ",
      "tracking error spiked": "Tracking error が急増",
      "VN30 still weak": "VN30 はまだ弱い",
      "correlation healthy": "相関は健全",
      "hedge remains valid": "ヘッジは有効",
      "VN30 weak": "VN30 が弱い",
      "corr20 strong": "corr20 が強い",
      "basis normal": "Basis は正常",
      "tracking clean": "Tracking は良好",
      "short-term pressure confirmed": "短期圧力を確認",
      "tracking error high": "Tracking error が高い",
      "basis changed abruptly": "Basis が急変",
      "watch list": "監視が必要",
      "most entry conditions present": "エントリー条件の大半が揃った",
      "no clean hedge setup": "きれいなヘッジ条件なし"
    },
    en: {
      "VN30 recovered": "VN30 recovered",
      "corr20 weakened": "corr20 weakened",
      "basis too stretched": "basis too stretched",
      "tracking error spiked": "tracking error spiked",
      "VN30 still weak": "VN30 still weak",
      "correlation healthy": "correlation healthy",
      "hedge remains valid": "hedge remains valid",
      "VN30 weak": "VN30 weak",
      "corr20 strong": "corr20 strong",
      "basis normal": "basis normal",
      "tracking clean": "tracking clean",
      "short-term pressure confirmed": "short-term pressure confirmed",
      "tracking error high": "tracking error high",
      "basis changed abruptly": "basis changed abruptly",
      "watch list": "watch list",
      "most entry conditions present": "most entry conditions present",
      "no clean hedge setup": "no clean hedge setup"
    },
    zh: {
      "VN30 recovered": "VN30 已恢复",
      "corr20 weakened": "corr20 相关性转弱",
      "basis too stretched": "Basis 偏离过大",
      "tracking error spiked": "Tracking error 激增",
      "VN30 still weak": "VN30 仍然偏弱",
      "correlation healthy": "相关性仍然健康",
      "hedge remains valid": "对冲仍然有效",
      "VN30 weak": "VN30 偏弱",
      "corr20 strong": "corr20 较强",
      "basis normal": "Basis 正常",
      "tracking clean": "Tracking 干净",
      "short-term pressure confirmed": "短期压力已确认",
      "tracking error high": "Tracking error 偏高",
      "basis changed abruptly": "Basis 突然变化",
      "watch list": "需要观察",
      "most entry conditions present": "大部分入场条件已满足",
      "no clean hedge setup": "暂无清晰的对冲条件"
    },
    ko: {
      "VN30 recovered": "VN30 회복",
      "corr20 weakened": "corr20 상관 약화",
      "basis too stretched": "Basis 과도 확대",
      "tracking error spiked": "Tracking error 급등",
      "VN30 still weak": "VN30 여전히 약세",
      "correlation healthy": "상관관계 양호",
      "hedge remains valid": "헤지 유효",
      "VN30 weak": "VN30 약세",
      "corr20 strong": "corr20 강함",
      "basis normal": "Basis 정상",
      "tracking clean": "Tracking 양호",
      "short-term pressure confirmed": "단기 압력 확인",
      "tracking error high": "Tracking error 높음",
      "basis changed abruptly": "Basis 급변",
      "watch list": "관찰 필요",
      "most entry conditions present": "진입 조건 대부분 충족",
      "no clean hedge setup": "깔끔한 헤지 조건 없음"
    }
  };

  return value
    .split(" | ")
    .map((item) => labelsByLanguage[currentLanguage][item] ?? item)
    .join(" | ");
}

function parseSymbols(rawSymbols: string): string[] {
  const symbols = rawSymbols
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length === 0) {
    throw new Error(t("pleaseEnterSymbol"));
  }

  return [...new Set(symbols)];
}

function ensureDateRange(startDate: string, endDate: string): void {
  if (!startDate || !endDate) {
    throw new Error(t("startEndRequired"));
  }

  if (startDate > endDate) {
    throw new Error(t("startBeforeEnd"));
  }
}

async function fetchPage(
  symbol: string,
  bearerToken: string,
  startDate: string,
  endDate: string,
  offset: number
): Promise<HistoricalQuote[]> {
  const url = new URL(`${API_BASE_URL}/${encodeURIComponent(symbol)}/historical-quotes`);
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(PAGE_SIZE));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json, text/plain, */*",
      Authorization: `Bearer ${bearerToken}`
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status} for ${symbol}: ${body}`);
  }

  const data = (await response.json()) as HistoricalQuote[];
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected response for ${symbol}.`);
  }

  return data;
}

async function loadLocalJsonFile(symbol: string): Promise<HistoricalQuote[]> {
  const response = await fetch(`./data/${encodeURIComponent(symbol)}.json`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Local file data/${symbol}.json was not found.`);
  }

  const data = (await response.json()) as HistoricalQuote[];
  if (!Array.isArray(data)) {
    throw new Error(`Local file data/${symbol}.json has invalid format.`);
  }

  return normalizeQuotes(data);
}

function normalizeQuotes(quotes: HistoricalQuote[]): HistoricalQuote[] {
  const deduped = new Map<string, HistoricalQuote>();

  for (const quote of quotes) {
    const key = `${quote.symbol}-${quote.date}`;
    deduped.set(key, quote);
  }

  const sortedQuotes = Array.from(deduped.values()).sort((left, right) => {
    return new Date(left.date).getTime() - new Date(right.date).getTime();
  });

  return sortedQuotes.map((quote, index) => {
    const previousQuote = index > 0 ? sortedQuotes[index - 1] : null;
    const previousClose = toNumberOrNull(previousQuote?.priceClose);
    const currentClose = toNumberOrNull(quote.priceClose);

    return {
      ...quote,
      priceChange: previousClose === null || currentClose === null ? null : currentClose - previousClose,
      returnPct:
        previousClose === null || currentClose === null || previousClose === 0
          ? null
          : ((currentClose - previousClose) / previousClose) * 100
    };
  });
}

function formatDisplayNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }

  return Number(value).toFixed(2);
}

function getValueClass(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value) || value === 0) {
    return "";
  }

  return value > 0 ? "positive" : "negative";
}

function compareNullableNumbers(left: number | null, right: number | null): number {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left - right;
}

function compareNullableStrings(left: string | null, right: string | null): number {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left.localeCompare(right);
}

function calculateMean(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateStandardDeviation(values: number[]): number | null {
  if (values.length < 2) {
    return null;
  }

  const mean = calculateMean(values);
  if (mean === null) {
    return null;
  }

  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function getRollingNumericValues(rows: MappingRow[], currentIndex: number, key: string, windowSize: number): number[] {
  return rows
    .slice(Math.max(0, currentIndex - windowSize + 1), currentIndex + 1)
    .map((row) => row[key])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function hasBottomSignal(
  quotes: HistoricalQuote[],
  dateIndex: number,
  volumeMultiplier: number = BOTTOM_SIGNAL.volumeMultiplier
): boolean {
  if (dateIndex < BOTTOM_SIGNAL.volumeWindow + 1) {
    return false;
  }
  const quote = quotes[dateIndex];
  const prevQuote = quotes[dateIndex - 1];
  const prevVolume = toNumberOrNull((prevQuote as Record<string, unknown>)?.totalVolume);
  const priceOpen = toNumberOrNull(quote?.priceOpen);
  const priceClose = toNumberOrNull(quote?.priceClose);
  const priceChange = toNumberOrNull(quote?.priceChange);

  if (prevVolume === null || prevVolume <= 0) {
    return false;
  }

  const maQuotes = quotes.slice(dateIndex - 1 - BOTTOM_SIGNAL.volumeWindow, dateIndex - 1);
  const volumes = maQuotes
    .map((q) => toNumberOrNull((q as Record<string, unknown>).totalVolume))
    .filter((v): v is number => v !== null && v > 0);
  if (volumes.length < BOTTOM_SIGNAL.volumeWindow / 2) {
    return false;
  }
  const volumeMA = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const volumeSpike = prevVolume >= volumeMultiplier * volumeMA;

  const priceUp =
    (priceClose !== null && priceOpen !== null && priceClose > priceOpen) ||
    (priceChange !== null && priceChange > 0);

  return volumeSpike && priceUp;
}

function getVolume(q: HistoricalQuote): number | null {
  return toNumberOrNull((q as Record<string, unknown>).totalVolume);
}

function getClose(q: HistoricalQuote): number | null {
  return toNumberOrNull(q.priceClose);
}

function getLow(q: HistoricalQuote): number | null {
  return toNumberOrNull((q as Record<string, unknown>).priceLow ?? q.priceClose);
}

function calcMA(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calcStd(values: number[]): number | null {
  const mean = calcMA(values);
  if (mean === null || values.length < 2) return null;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function calcRSI(closes: number[], period: number): number | null {
  if (closes.length < period + 1) return null;
  const recent = closes.slice(-period - 1);
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < recent.length; i++) {
    const ch = recent[i] - recent[i - 1];
    if (ch > 0) gains += ch;
    else losses += -ch;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function hasBuySig1(quotes: HistoricalQuote[], dateIndex: number): boolean {
  return hasBottomSignal(quotes, dateIndex);
}

function hasBuySig2(quotes: HistoricalQuote[], dateIndex: number): boolean {
  if (dateIndex < BUY_SIGNAL.peakLookback + BUY_SIGNAL.maLong) return false;
  const quote = quotes[dateIndex];
  const close = getClose(quote);
  if (close === null || close <= 0) return false;

  const lookback = quotes.slice(Math.max(0, dateIndex - BUY_SIGNAL.peakLookback), dateIndex + 1);
  const closes = lookback.map((q) => getClose(q)).filter((v): v is number => v !== null && v > 0);
  if (closes.length < 10) return false;
  const peak = Math.max(...closes);
  const discountPct = ((peak - close) / peak) * 100;
  if (discountPct < BUY_SIGNAL.discountFromPeakPct) return false;

  const volSlice = quotes.slice(dateIndex - BUY_SIGNAL.maLong, dateIndex + 1);
  const vols = volSlice.map((q) => getVolume(q)).filter((v): v is number => v !== null && v > 0);
  if (vols.length < BUY_SIGNAL.maLong) return false;
  const ma5 = calcMA(vols.slice(-5));
  const ma20 = calcMA(vols);
  return ma5 !== null && ma20 !== null && ma5 < ma20;
}

function hasBuySig3(quotes: HistoricalQuote[], dateIndex: number): boolean {
  if (dateIndex < BUY_SIGNAL.rsiPeriod + 2) return false;
  const closes = quotes
    .slice(0, dateIndex + 1)
    .map((q) => getClose(q))
    .filter((v): v is number => v !== null && Number.isFinite(v));
  const rsiToday = calcRSI(closes, BUY_SIGNAL.rsiPeriod);
  const rsiYesterday = calcRSI(closes.slice(0, -1), BUY_SIGNAL.rsiPeriod);
  return (
    rsiToday !== null &&
    rsiYesterday !== null &&
    rsiYesterday < BUY_SIGNAL.rsiOversold &&
    rsiToday > rsiYesterday
  );
}

function hasBuySig4(quotes: HistoricalQuote[], dateIndex: number): boolean {
  if (dateIndex < 10) return false;
  const window = quotes.slice(Math.max(0, dateIndex - 20), dateIndex + 1);
  const lows: { i: number; v: number }[] = [];
  for (let i = 1; i < window.length - 1; i++) {
    const curr = getLow(window[i]);
    const prev = getLow(window[i - 1]);
    const next = getLow(window[i + 1]);
    if (curr !== null && prev !== null && next !== null && curr <= prev && curr <= next) {
      lows.push({ i, v: curr });
    }
  }
  if (lows.length < 3) return false;
  const last3 = lows.slice(-3);
  return last3[2].v > last3[1].v && last3[1].v > last3[0].v;
}

function hasBuySig5(quotes: HistoricalQuote[], dateIndex: number): boolean {
  if (dateIndex < BUY_SIGNAL.maLong) return false;
  const closes = quotes
    .slice(0, dateIndex + 1)
    .map((q) => getClose(q))
    .filter((v): v is number => v !== null && Number.isFinite(v));
  const ma5Today = calcMA(closes.slice(-BUY_SIGNAL.maShort));
  const ma20Today = calcMA(closes.slice(-BUY_SIGNAL.maLong));
  const ma5Yesterday = calcMA(closes.slice(-BUY_SIGNAL.maShort - 1, -1));
  const ma20Yesterday = calcMA(closes.slice(-BUY_SIGNAL.maLong - 1, -1));
  return (
    ma5Today !== null &&
    ma20Today !== null &&
    ma5Yesterday !== null &&
    ma20Yesterday !== null &&
    ma5Today > ma20Today &&
    ma5Yesterday <= ma20Yesterday
  );
}

function hasBuySig6(quotes: HistoricalQuote[], dateIndex: number): boolean {
  if (dateIndex < BUY_SIGNAL.bbPeriod) return false;
  const slice = quotes.slice(dateIndex - BUY_SIGNAL.bbPeriod, dateIndex + 1);
  const closes = slice.map((q) => getClose(q)).filter((v): v is number => v !== null && Number.isFinite(v));
  if (closes.length < BUY_SIGNAL.bbPeriod) return false;
  const middle = calcMA(closes);
  const std = calcStd(closes);
  if (middle === null || std === null || std === 0) return false;
  const lower = middle - BUY_SIGNAL.bbStd * std;
  const prevClose = dateIndex > 0 ? getClose(quotes[dateIndex - 1]) : null;
  const todayClose = getClose(quotes[dateIndex]);
  if (todayClose === null) return false;
  const prevTouchedLower = prevClose !== null && prevClose <= lower;
  const todayBackInside = todayClose > lower;
  return prevTouchedLower && todayBackInside;
}

function hasBuySig7(quotes: HistoricalQuote[], dateIndex: number): boolean {
  if (dateIndex < BUY_SIGNAL.volumeWindow) return false;
  const quote = quotes[dateIndex];
  const priceOpen = toNumberOrNull(quote?.priceOpen);
  const priceClose = getClose(quote);
  const priceChange = toNumberOrNull(quote?.priceChange);
  const vol = getVolume(quote);

  const priceUp =
    (priceClose !== null && priceOpen !== null && priceClose > priceOpen) ||
    (priceChange !== null && priceChange > 0);

  const volSlice = quotes.slice(dateIndex - BUY_SIGNAL.volumeWindow, dateIndex);
  const vols = volSlice.map((q) => getVolume(q)).filter((v): v is number => v !== null && v > 0);
  const volMA = calcMA(vols);
  const volumeUp = vol !== null && volMA !== null && vol > volMA;

  return priceUp && volumeUp;
}

type BuySignalsResult = { sig1: boolean; sig2: boolean; sig3: boolean; sig4: boolean; sig5: boolean; sig6: boolean; sig7: boolean; count: number };

function computeBuySignals(quotes: HistoricalQuote[], dateIndex: number): BuySignalsResult {
  const sig1 = hasBuySig1(quotes, dateIndex);
  const sig2 = hasBuySig2(quotes, dateIndex);
  const sig3 = hasBuySig3(quotes, dateIndex);
  const sig4 = hasBuySig4(quotes, dateIndex);
  const sig5 = hasBuySig5(quotes, dateIndex);
  const sig6 = hasBuySig6(quotes, dateIndex);
  const sig7 = hasBuySig7(quotes, dateIndex);
  const count = [sig1, sig2, sig3, sig4, sig5, sig6, sig7].filter(Boolean).length;
  return { sig1, sig2, sig3, sig4, sig5, sig6, sig7, count };
}

function getSignalCellClass(value: unknown): string {
  if (value === "Short" || value === "Hedge on") {
    return "signal-cell signal-short";
  }

  if (value === "Hold") {
    return "signal-cell signal-hold";
  }

  if (value === "Stop") {
    return "signal-cell signal-stop";
  }

  if (value === "No action") {
    return "signal-cell signal-neutral";
  }

  if (value === "Watch") {
    return "signal-cell signal-watch";
  }

  if (value === "Stop hedge") {
    return "signal-cell signal-stop";
  }

  if (value === "Basis risk") {
    return "signal-cell signal-risk";
  }

  return "";
}

function getPictureInPictureAccentClass(row: MappingRow): string {
  if (row.shortSignal === "Short" || row.hedgeState === "Hedge on") {
    return "pip-accent-short";
  }

  if (row.stopSignal === "Stop" || row.hedgeState === "Stop hedge") {
    return "pip-accent-stop";
  }

  if (row.hedgeState === "Basis risk") {
    return "pip-accent-risk";
  }

  if (row.shortSignal === "Hold") {
    return "pip-accent-hold";
  }

  if (row.hedgeState === "Watch") {
    return "pip-accent-watch";
  }

  return "pip-accent-neutral";
}

function getComparisonPair(sortedSymbols: string[]): { baseSymbol: string; hedgeSymbol: string } | null {
  if (sortedSymbols.includes("VN30") && sortedSymbols.includes("VN30F1M")) {
    return {
      baseSymbol: "VN30",
      hedgeSymbol: "VN30F1M"
    };
  }

  if (sortedSymbols.length >= 2) {
    return {
      baseSymbol: sortedSymbols[0],
      hedgeSymbol: sortedSymbols[1]
    };
  }

  return null;
}

function calculateCorrelation(leftValues: number[], rightValues: number[]): number | null {
  if (leftValues.length !== rightValues.length || leftValues.length < 2) {
    return null;
  }

  const leftMean = leftValues.reduce((sum, value) => sum + value, 0) / leftValues.length;
  const rightMean = rightValues.reduce((sum, value) => sum + value, 0) / rightValues.length;

  let numerator = 0;
  let leftVariance = 0;
  let rightVariance = 0;

  for (let index = 0; index < leftValues.length; index += 1) {
    const leftDelta = leftValues[index] - leftMean;
    const rightDelta = rightValues[index] - rightMean;
    numerator += leftDelta * rightDelta;
    leftVariance += leftDelta * leftDelta;
    rightVariance += rightDelta * rightDelta;
  }

  if (leftVariance === 0 || rightVariance === 0) {
    return null;
  }

  return numerator / Math.sqrt(leftVariance * rightVariance);
}

function calculateRollingCorrelation(
  rows: MappingRow[],
  currentIndex: number,
  leftKey: string,
  rightKey: string,
  windowSize: number
): number | null {
  const windowRows = rows.slice(Math.max(0, currentIndex - windowSize + 1), currentIndex + 1);
  const validRows = windowRows.filter(
    (row): row is MappingRow & Record<string, number> => typeof row[leftKey] === "number" && typeof row[rightKey] === "number"
  );

  if (validRows.length < windowSize) {
    return null;
  }

  return calculateCorrelation(
    validRows.map((row) => row[leftKey]),
    validRows.map((row) => row[rightKey])
  );
}

function buildMappingRows(
  symbolData: Record<string, HistoricalQuote[]>
): MappingRow[] {
  const sortedSymbols = Object.keys(symbolData).sort();
  const comparisonPair = getComparisonPair(sortedSymbols);
  const configuredAssets = getConfiguredAssetInputs();
  const dateMap = new Map<string, MappingRow>();

  for (const symbol of sortedSymbols) {
    for (const quote of symbolData[symbol]) {
      const date = String(quote.date).slice(0, 10);
      if (!dateMap.has(date)) {
        dateMap.set(date, { date });
      }

      dateMap.get(date)![`${symbol}ClosePrice`] = toNumberOrNull(quote.priceClose);
      dateMap.get(date)![symbol] = toNumberOrNull(quote.priceChange);
      dateMap.get(date)![`${symbol}ReturnPct`] = toNumberOrNull(quote.returnPct);
    }
  }

  const rows = Array.from(dateMap.values()).sort((left, right) => String(left.date).localeCompare(String(right.date)));
  const earliestDate = rows[0] ? String(rows[0].date) : null;
  const baseCloseBySymbol = Object.fromEntries(
    sortedSymbols.map((symbol) => {
      const initialQuote =
        earliestDate === null
          ? null
          : symbolData[symbol].find((quote) => {
              const quoteDate = String(quote.date).slice(0, 10);
              return quoteDate >= earliestDate && toNumberOrNull(quote.priceClose) !== null;
            }) ?? null;

      return [symbol, toNumberOrNull(initialQuote?.priceClose)];
    })
  ) as Record<string, number | null>;
  let previousBasis: number | null = null;
  const baseRows = rows.map((row, index) => {
    const values = sortedSymbols
      .map((symbol) => row[symbol])
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

    const priceChangeSpread = values.length > 1 ? Math.max(...values) - Math.min(...values) : null;
    let basis: number | null = null;
    let spreadReturn: number | null = null;

    if (comparisonPair) {
      const baseQuote = findQuoteByDate(symbolData[comparisonPair.baseSymbol], String(row.date));
      const hedgeQuote = findQuoteByDate(symbolData[comparisonPair.hedgeSymbol], String(row.date));
      const baseClose = toNumberOrNull(baseQuote?.priceClose);
      const hedgeClose = toNumberOrNull(hedgeQuote?.priceClose);
      const baseReturn = toNumberOrNull(baseQuote?.returnPct);
      const hedgeReturn = toNumberOrNull(hedgeQuote?.returnPct);

      basis = baseClose === null || hedgeClose === null ? null : hedgeClose - baseClose;
      spreadReturn = baseReturn === null || hedgeReturn === null ? null : hedgeReturn - baseReturn;
    }

    const basisChange = previousBasis === null || basis === null ? null : basis - previousBasis;
    const enrichedRow: MappingRow = {
      ...row,
      assetAppliedDate: earliestDate,
      basis,
      basisChange,
      spreadReturn,
      corr5:
        comparisonPair === null
          ? null
          : calculateRollingCorrelation(
              rows,
              index,
              `${comparisonPair.baseSymbol}ReturnPct`,
              `${comparisonPair.hedgeSymbol}ReturnPct`,
              5
            ),
      corr10:
        comparisonPair === null
          ? null
          : calculateRollingCorrelation(
              rows,
              index,
              `${comparisonPair.baseSymbol}ReturnPct`,
              `${comparisonPair.hedgeSymbol}ReturnPct`,
              10
            ),
      corr20:
        comparisonPair === null
          ? null
          : calculateRollingCorrelation(
              rows,
              index,
              `${comparisonPair.baseSymbol}ReturnPct`,
              `${comparisonPair.hedgeSymbol}ReturnPct`,
              20
            ),
      priceChangeSpread
    };

    for (const symbol of sortedSymbols) {
      const assetStartValue = configuredAssets[symbol] ?? null;
      const baseClose = baseCloseBySymbol[symbol] ?? null;
      const currentQuote = findQuoteByDate(symbolData[symbol], String(row.date));
      const currentClose = toNumberOrNull(currentQuote?.priceClose);

      if (symbol === "VN30F1M") {
        const futuresPriceChange = toNumberOrNull(row[symbol]);
        enrichedRow[`${symbol}AssetValue`] = calculateSimpleFuturesAssetValue(assetStartValue, futuresPriceChange);
        continue;
      }

      enrichedRow[`${symbol}AssetValue`] =
        assetStartValue === null || assetStartValue <= 0 || baseClose === null || baseClose === 0 || currentClose === null
          ? null
          : (assetStartValue * currentClose) / baseClose;

      if (isBaseSymbol(symbol)) {
        const symbolQuotes = symbolData[symbol];
        const quoteIndex = symbolQuotes.findIndex(
          (q) => String(q.date).slice(0, 10) === String(row.date).slice(0, 10)
        );
        if (quoteIndex >= 0) {
          const bs = hasBottomSignal(symbolQuotes, quoteIndex);
          enrichedRow[`${symbol}BottomSignal`] = bs ? 1 : 0;
          const buy = computeBuySignals(symbolQuotes, quoteIndex);
          enrichedRow[`${symbol}BuySig1`] = buy.sig1 ? 1 : 0;
          enrichedRow[`${symbol}BuySig2`] = buy.sig2 ? 1 : 0;
          enrichedRow[`${symbol}BuySig3`] = buy.sig3 ? 1 : 0;
          enrichedRow[`${symbol}BuySig4`] = buy.sig4 ? 1 : 0;
          enrichedRow[`${symbol}BuySig5`] = buy.sig5 ? 1 : 0;
          enrichedRow[`${symbol}BuySig6`] = buy.sig6 ? 1 : 0;
          enrichedRow[`${symbol}BuySig7`] = buy.sig7 ? 1 : 0;
          enrichedRow[`${symbol}BuyCount`] = buy.count;
          enrichedRow[`${symbol}BuySuggestion`] = buy.count >= BUY_SIGNAL.minPassCount ? 1 : 0;
        }
      }
    }

    previousBasis = basis;
    return enrichedRow;
  });

  let hedgeActive = false;
  const signalRows = baseRows.map((row, index) => {
    const baseReturn = comparisonPair ? toNumberOrNull(row[`${comparisonPair.baseSymbol}ReturnPct`]) : null;
    const corr20 = toNumberOrNull(row.corr20);
    const corr5 = toNumberOrNull(row.corr5);
    const basis = toNumberOrNull(row.basis);
    const basisChange = toNumberOrNull(row.basisChange);
    const spreadReturn = toNumberOrNull(row.spreadReturn);
    const basisWindow = getRollingNumericValues(baseRows, index, "basis", HEDGE_WINDOWS.basisZScore);
    const spreadWindow = getRollingNumericValues(baseRows, index, "spreadReturn", HEDGE_WINDOWS.trackingError);
    const basisMean = calculateMean(basisWindow);
    const basisStd = calculateStandardDeviation(basisWindow);
    const basisZScore =
      basis === null || basisMean === null || basisStd === null || basisStd === 0 ? null : (basis - basisMean) / basisStd;
    const trackingError20 = calculateStandardDeviation(spreadWindow);

    const entryMarketWeak = baseReturn !== null && baseReturn <= HEDGE_THRESHOLDS.entryBaseReturnPct;
    const entryCorrelationStrong = corr20 !== null && corr20 >= HEDGE_THRESHOLDS.corr20EntryMin;
    const entryBasisSafe = basisZScore !== null && Math.abs(basisZScore) <= HEDGE_THRESHOLDS.basisZScoreEntryMax;
    const entryTrackingClean =
      trackingError20 !== null && trackingError20 <= HEDGE_THRESHOLDS.trackingError20EntryMax;
    const shortTermWeakening = corr5 !== null && corr20 !== null && corr5 <= corr20;

    const signalScore = [
      entryMarketWeak,
      entryCorrelationStrong,
      entryBasisSafe,
      entryTrackingClean,
      shortTermWeakening
    ].filter(Boolean).length;

    const recoverySignal = baseReturn !== null && baseReturn >= HEDGE_THRESHOLDS.stopRecoveryPct;
    const correlationBroken = corr20 !== null && corr20 <= HEDGE_THRESHOLDS.corr20StopMax;
    const basisExtreme = basisZScore !== null && Math.abs(basisZScore) >= HEDGE_THRESHOLDS.basisZScoreExtreme;
    const trackingTooNoisy = trackingError20 !== null && trackingError20 >= HEDGE_THRESHOLDS.trackingError20StopMax;
    const basisShock = basisChange !== null && Math.abs(basisChange) >= HEDGE_THRESHOLDS.basisChangeShock;

    let hedgeState: HedgeState = "No hedge";
    let shortSignal = "No action";
    let stopSignal = "";
    const reasons: string[] = [];

    if (hedgeActive) {
      if (recoverySignal || correlationBroken || basisExtreme || trackingTooNoisy) {
        hedgeActive = false;
        hedgeState = "Stop hedge";
        stopSignal = "Stop";
        reasons.push(
          recoverySignal ? "VN30 recovered" : "",
          correlationBroken ? "corr20 weakened" : "",
          basisExtreme ? "basis too stretched" : "",
          trackingTooNoisy ? "tracking error spiked" : ""
        );
      } else {
        hedgeState = "Hedge on";
        shortSignal = "Hold";
        reasons.push("VN30 still weak", "correlation healthy", "hedge remains valid");
      }
    } else if (entryMarketWeak && entryCorrelationStrong && entryBasisSafe && entryTrackingClean) {
      hedgeActive = true;
      hedgeState = "Hedge on";
      shortSignal = "Short";
      reasons.push("VN30 weak", "corr20 strong", "basis normal", "tracking clean");
      if (shortTermWeakening) {
        reasons.push("short-term pressure confirmed");
      }
    } else if (basisExtreme || trackingTooNoisy || basisShock) {
      hedgeState = "Basis risk";
      reasons.push(
        basisExtreme ? "basis too stretched" : "",
        trackingTooNoisy ? "tracking error high" : "",
        basisShock ? "basis changed abruptly" : ""
      );
    } else if (signalScore >= 3) {
      hedgeState = "Watch";
      reasons.push("watch list", "most entry conditions present");
    } else {
      hedgeState = "No hedge";
      reasons.push("no clean hedge setup");
    }

    return {
      ...row,
      basisZScore,
      trackingError20,
      signalScore,
      hedgeState,
      shortSignal,
      stopSignal,
      signalReason: reasons.filter(Boolean).join(" | ")
    };
  });

  return signalRows.reverse();
}

function sortMappingRows(rows: MappingRow[], sortState: SortState): MappingRow[] {
  const sortedRows = [...rows];
  sortedRows.sort((left, right) => {
    if (sortState.key === "date") {
      return String(left.date).localeCompare(String(right.date));
    }

    const leftValue = left[sortState.key];
    const rightValue = right[sortState.key];

    if (typeof leftValue === "number" || typeof rightValue === "number") {
      return compareNullableNumbers(typeof leftValue === "number" ? leftValue : null, typeof rightValue === "number" ? rightValue : null);
    }

    return compareNullableStrings(typeof leftValue === "string" ? leftValue : null, typeof rightValue === "string" ? rightValue : null);
  });

  return sortState.direction === "asc" ? sortedRows : sortedRows.reverse();
}

function getSortIndicator(columnKey: string): string {
  if (mappingSortState.key !== columnKey) {
    return "";
  }

  return mappingSortState.direction === "asc" ? "▲" : "▼";
}

function buildMappingColumns(symbolData: Record<string, HistoricalQuote[]>): MappingColumn[] {
  const sortedSymbols = Object.keys(symbolData).sort();
  const comparisonPair = getComparisonPair(sortedSymbols);
  const columns: MappingColumn[] = [
    { key: "date", label: t("dateColumn"), group: t("groupGeneral"), formatter: (value) => String(value ?? "") },
    {
      key: "assetAppliedDate",
      label: t("assetAppliedDateColumn"),
      group: t("groupGeneral"),
      formatter: (value) => String(value ?? "")
    }
  ];

  for (const symbol of sortedSymbols) {
    columns.push({
      key: `${symbol}ClosePrice`,
      label: `${symbol} ${t("closePriceColumn")}`,
      group: symbol,
      formatter: formatDisplayNumber,
      focusSymbol: symbol
    });
    columns.push({
      key: symbol,
      label: `${symbol} ${t("priceChangeColumn")}`,
      group: symbol,
      formatter: formatDisplayNumber,
      focusSymbol: symbol
    });
    columns.push({
      key: `${symbol}ReturnPct`,
      label: `${symbol} ${t("returnPctColumn")}`,
      group: symbol,
      formatter: formatPercent,
      focusSymbol: symbol
    });
    if (isBaseSymbol(symbol)) {
      columns.push({
        key: `${symbol}BottomSignal`,
        label: t("bottomColumnLabel"),
        group: symbol,
        formatter: () => "",
        cellClassName: (value) => (value === 1 ? "bottom-signal-cell" : ""),
        focusSymbol: symbol
      });
      columns.push({
        key: `${symbol}BuyCount`,
        label: t("buyColumnLabel"),
        group: symbol,
        formatter: (value) =>
          typeof value === "number" && value >= BUY_SIGNAL.minPassCount ? `${value}/7` : "",
        cellClassName: (value) =>
          typeof value === "number" && value >= BUY_SIGNAL.minPassCount ? "buy-suggestion-cell" : "",
        focusSymbol: symbol
      });
    }
    if (symbol === "VN30" || symbol === "VN30F1M") {
      columns.push({
        key: `${symbol}AssetValue`,
        label: `${symbol} ${t("assetValueColumn")}`,
        group: symbol,
        formatter: formatAssetValue,
        focusSymbol: symbol
      });
    }
  }

  if (comparisonPair) {
    columns.push({
      key: "basis",
      label: `${t("basisLabel")} (${comparisonPair.hedgeSymbol}-${comparisonPair.baseSymbol})`,
      group: t("groupHedging"),
      formatter: formatDisplayNumber
    });
    columns.push({
      key: "basisChange",
      label: t("basisChangeColumn"),
      group: t("groupHedging"),
      formatter: formatDisplayNumber
    });
    columns.push({
      key: "spreadReturn",
      label: t("spreadReturnColumn"),
      group: t("groupHedging"),
      formatter: formatPercent
    });
    columns.push({
      key: "basisZScore",
      label: t("basisZScoreLabel"),
      group: t("groupHedging"),
      formatter: formatDisplayNumber
    });
    columns.push({
      key: "trackingError20",
      label: t("trackingError20Column"),
      group: t("groupHedging"),
      formatter: formatPercent
    });
    columns.push({ key: "corr5", label: "corr5", group: t("groupHedging"), formatter: formatDisplayNumber });
    columns.push({ key: "corr10", label: "corr10", group: t("groupHedging"), formatter: formatDisplayNumber });
    columns.push({ key: "corr20", label: "corr20", group: t("groupHedging"), formatter: formatDisplayNumber });
  }

  columns.push({
    key: "signalScore",
    label: t("signalScoreColumn"),
    group: t("groupHedging"),
    formatter: formatDisplayNumber
  });
  columns.push({
    key: "hedgeState",
    label: t("hedgeStateLabel"),
    group: t("groupHedging"),
    formatter: formatSignalLabel,
    cellClassName: getSignalCellClass
  });
  columns.push({
    key: "shortSignal",
    label: t("shortSignalLabel"),
    group: t("groupHedging"),
    formatter: formatSignalLabel,
    cellClassName: getSignalCellClass
  });
  columns.push({
    key: "stopSignal",
    label: t("stopSignalLabel"),
    group: t("groupHedging"),
    formatter: formatSignalLabel,
    cellClassName: getSignalCellClass
  });
  columns.push({
    key: "priceChangeSpread",
    label: t("priceChangeSpreadColumn"),
    group: t("groupHedging"),
    formatter: formatDisplayNumber
  });

  return columns;
}

function buildColumnGroups(columns: MappingColumn[]): Array<{ label: string; span: number; endIndex: number }> {
  const groups: Array<{ label: string; span: number; endIndex: number }> = [];

  for (let index = 0; index < columns.length; index += 1) {
    const column = columns[index];
    const previousGroup = groups[groups.length - 1];

    if (previousGroup && previousGroup.label === column.group) {
      previousGroup.span += 1;
      previousGroup.endIndex = index;
      continue;
    }

    groups.push({
      label: column.group,
      span: 1,
      endIndex: index
    });
  }

  return groups;
}

function formatDateTime(value: unknown): string {
  if (!value) {
    return "n/a";
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("sv-SE");
}

function findQuoteByDate(rows: HistoricalQuote[], date: string): HistoricalQuote | null {
  return rows.find((quote) => String(quote.date).slice(0, 10) === date) ?? null;
}

function getLatestCloseForSymbol(symbol: string): number | null {
  const quotes = currentMappingData[symbol];
  if (!quotes || quotes.length === 0) return null;
  const sorted = [...quotes].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const quote = sorted[0];
  const priceClose = toNumberOrNull(quote?.priceClose);
  if (priceClose === null) return null;
  const unit = toNumberOrNull((quote as Record<string, unknown>)?.unit) ?? 1000;
  return priceClose * unit;
}

/** Giá đóng (điểm) cho phái sinh VN30F – 1 điểm = 100.000 VND */
function getLatestCloseForDerivative(symbol: string): number | null {
  const quotes = currentMappingData[symbol];
  if (!quotes || quotes.length === 0) return null;
  const sorted = [...quotes].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const quote = sorted[0];
  return toNumberOrNull(quote?.priceClose);
}

function calcSimDerivRowPnL(type: "long" | "short", qty: number, entry: number, close: number): number | null {
  if (entry <= 0 || qty <= 0 || close <= 0) return null;
  const pointDiff = type === "long" ? close - entry : entry - close;
  return pointDiff * qty * FUTURES_POINT_VALUE;
}

function getSimDerivRowsFromDOM(): SimDerivManualRow[] {
  if (!simDerivativesBodyElement) return [];
  const out: SimDerivManualRow[] = [];
  simDerivativesBodyElement.querySelectorAll("tr[data-sim-deriv-row]").forEach((rowEl) => {
    const typeSelect = rowEl.querySelector<HTMLSelectElement>(".sim-deriv-type");
    const qtyInput = rowEl.querySelector<HTMLInputElement>(".sim-deriv-qty");
    const entryInput = rowEl.querySelector<HTMLInputElement>(".sim-deriv-entry");
    const closeInput = rowEl.querySelector<HTMLInputElement>(".sim-deriv-close");
    const type = (typeSelect?.value ?? "long") as "long" | "short";
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const entry = parseAssetInput(entryInput?.value ?? "") ?? 0;
    const close = parseAssetInput(closeInput?.value ?? "") ?? 0;
    out.push({ type, quantity: qty, entryPrice: entry, closePrice: close });
  });
  return out;
}

function saveSimDerivativesManual(): void {
  try {
    localStorage.setItem(SIM_DERIV_MANUAL_STORAGE_KEY, JSON.stringify(getSimDerivRowsFromDOM()));
  } catch {
    /* ignore */
  }
}

function loadSimDerivativesManual(): void {
  try {
    const raw = localStorage.getItem(SIM_DERIV_MANUAL_STORAGE_KEY);
    if (!raw) {
      renderSimDerivativesRows([{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }]);
      return;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      renderSimDerivativesRows([{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }]);
      return;
    }
    const rows: SimDerivManualRow[] = [];
    for (const x of parsed) {
      if (typeof x !== "object" || x === null) continue;
      const o = x as Record<string, unknown>;
      const type = o.type === "short" ? "short" : "long";
      const quantity =
        typeof o.quantity === "number" && Number.isFinite(o.quantity)
          ? o.quantity
          : parseInt(String(o.quantity ?? "0").replace(/\D/g, ""), 10) || 0;
      const entryPrice = typeof o.entryPrice === "number" ? o.entryPrice : parseAssetInput(String(o.entryPrice ?? "")) ?? 0;
      const closePrice = typeof o.closePrice === "number" ? o.closePrice : parseAssetInput(String(o.closePrice ?? "")) ?? 0;
      rows.push({ type, quantity, entryPrice, closePrice });
    }
    renderSimDerivativesRows(rows.length > 0 ? rows : [{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }]);
  } catch {
    renderSimDerivativesRows([{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }]);
  }
}

function refreshSimDerivativesPnL(): void {
  let totalPnL = 0;
  simDerivativesBodyElement?.querySelectorAll("tr[data-sim-deriv-row]").forEach((rowEl) => {
    const typeSelect = rowEl.querySelector<HTMLSelectElement>(".sim-deriv-type");
    const qtyInput = rowEl.querySelector<HTMLInputElement>(".sim-deriv-qty");
    const entryInput = rowEl.querySelector<HTMLInputElement>(".sim-deriv-entry");
    const closeInput = rowEl.querySelector<HTMLInputElement>(".sim-deriv-close");
    const pnlSpan = rowEl.querySelector<HTMLSpanElement>(".sim-deriv-pnl-value");
    const type = (typeSelect?.value ?? "long") as "long" | "short";
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const entry = parseAssetInput(entryInput?.value ?? "") ?? 0;
    const close = parseAssetInput(closeInput?.value ?? "") ?? 0;
    const pnl = calcSimDerivRowPnL(type, qty, entry, close);
    if (pnl !== null) totalPnL += pnl;
    if (pnlSpan) {
      if (pnl === null) {
        pnlSpan.textContent = "-";
        pnlSpan.className = "sim-deriv-pnl-value";
      } else {
        pnlSpan.textContent = `${pnl >= 0 ? "+" : ""}${formatAssetValue(pnl)}`;
        pnlSpan.className = `sim-deriv-pnl-value ${pnl > 0 ? "positive" : pnl < 0 ? "negative" : ""}`.trim();
      }
    }
  });
  if (simDerivTotalPnLValueElement) {
    simDerivTotalPnLValueElement.textContent = formatAssetValue(totalPnL);
    simDerivTotalPnLValueElement.className = `sim-deriv-pnl-total ${totalPnL > 0 ? "positive" : totalPnL < 0 ? "negative" : ""}`.trim();
  }
}

function renderSimDerivativesRows(rows: SimDerivManualRow[]): void {
  if (!simDerivativesBodyElement) return;
  const list = rows.length > 0 ? rows : [{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }];
  simDerivativesBodyElement.innerHTML = list
    .map(
      (o) => `
    <tr data-sim-deriv-row class="sim-deriv-row-${o.type}">
      <td>
        <select class="sim-deriv-type derivatives-type-${o.type}" data-sim-deriv-field>
          <option value="long" ${o.type === "long" ? "selected" : ""}>${escapeHtml(t("derivTypeLong"))}</option>
          <option value="short" ${o.type === "short" ? "selected" : ""}>${escapeHtml(t("derivTypeShort"))}</option>
        </select>
      </td>
      <td><input class="sim-deriv-qty" type="text" inputmode="numeric" placeholder="1" value="${o.quantity > 0 ? String(o.quantity) : ""}" data-sim-deriv-field /></td>
      <td><input class="sim-deriv-entry" type="text" inputmode="numeric" placeholder="1.250" value="${o.entryPrice > 0 ? formatAssetInput(o.entryPrice) : ""}" data-sim-deriv-field /></td>
      <td><input class="sim-deriv-close" type="text" inputmode="numeric" placeholder="1.260" value="${o.closePrice > 0 ? formatAssetInput(o.closePrice) : ""}" data-sim-deriv-field /></td>
      <td><span class="sim-deriv-pnl-value">-</span></td>
      <td><button type="button" class="derivatives-del-btn secondary-button" data-sim-deriv-remove>×</button></td>
    </tr>`
    )
    .join("");
  simDerivativesBodyElement.querySelectorAll("[data-sim-deriv-field]").forEach((el) => {
    el.addEventListener("input", () => {
      const row = el.closest("tr[data-sim-deriv-row]");
      const typeSelect = row?.querySelector<HTMLSelectElement>(".sim-deriv-type");
      if (typeSelect) {
        typeSelect.classList.remove("derivatives-type-long", "derivatives-type-short");
        typeSelect.classList.add(`derivatives-type-${typeSelect.value}`);
        row?.classList.remove("sim-deriv-row-long", "sim-deriv-row-short");
        row?.classList.add(`sim-deriv-row-${typeSelect.value}`);
      }
      refreshSimDerivativesPnL();
      saveSimDerivativesManual();
    });
  });
  simDerivativesBodyElement.querySelectorAll(".sim-deriv-type").forEach((sel) => {
    sel.addEventListener("change", () => {
      const row = (sel as Element).closest("tr[data-sim-deriv-row]");
      const typeSelect = row?.querySelector<HTMLSelectElement>(".sim-deriv-type");
      if (typeSelect && row) {
        row.classList.remove("sim-deriv-row-long", "sim-deriv-row-short");
        row.classList.add(`sim-deriv-row-${typeSelect.value}`);
      }
      refreshSimDerivativesPnL();
      saveSimDerivativesManual();
    });
  });
  simDerivativesBodyElement.querySelectorAll("[data-sim-deriv-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr[data-sim-deriv-row]");
      if (row && simDerivativesBodyElement.querySelectorAll("tr[data-sim-deriv-row]").length > 1) {
        row.remove();
        refreshSimDerivativesPnL();
        saveSimDerivativesManual();
      }
    });
  });
  refreshSimDerivativesPnL();
}

function getCurrentSignalRow(symbolData: Record<string, HistoricalQuote[]>): MappingRow | null {
  const rows = buildMappingRows(symbolData);
  if (rows.length === 0) {
    return null;
  }

  if (currentDetailState.date) {
    return rows.find((row) => row.date === currentDetailState.date) ?? rows[0];
  }

  return rows[0];
}

function buildPictureInPictureMarkup(symbolData: Record<string, HistoricalQuote[]>): string {
  const row = getCurrentSignalRow(symbolData);
  if (!row) {
    return `<div class="pip-empty">${escapeHtml(t("noPipData"))}</div>`;
  }

  const date = String(row.date ?? "");
  const shellAccentClass = getPictureInPictureAccentClass(row);
  const sortedSymbols = Object.keys(symbolData).sort();
  const derivativesSymbols = sortedSymbols.filter((s) => s === "VN30" || s.startsWith("VN30F"));
  const watchedSymbols = sortedSymbols.filter((s) => s !== "VN30" && !s.startsWith("VN30F"));

  const buildTickerSpan = (symbol: string, isPriceChange: boolean): string => {
    const val = isPriceChange ? toNumberOrNull(row[symbol]) : toNumberOrNull(row[`${symbol}ReturnPct`]);
    const cls = getValueClass(val);
    const text = isPriceChange ? formatDisplayNumber(val) : formatPercent(val);
    const hasBottom = isBaseSymbol(symbol) && row[`${symbol}BottomSignal`] === 1;
    const hasBuy = isBaseSymbol(symbol) && row[`${symbol}BuySuggestion`] === 1;
    const bottomClass = hasBottom ? " pip-ticker-bottom" : "";
    const buyClass = hasBuy ? " pip-ticker-buy" : "";
    return `<span class="pip-ticker ${cls}${bottomClass}${buyClass}">${escapeHtml(symbol)}: ${escapeHtml(text)}</span>`;
  };

  const derivativesRow =
    derivativesSymbols.length > 0
      ? `<div class="pip-ticker-row">${derivativesSymbols.map((s) => buildTickerSpan(s, true)).join(" ")}</div>`
      : "";
  const watchedRow =
    watchedSymbols.length > 0
      ? `<div class="pip-ticker-row">${watchedSymbols.map((s) => buildTickerSpan(s, false)).join(" ")}</div>`
      : "";

  const cards = sortedSymbols
    .map((symbol) => {
      if (pipHiddenSymbols[symbol]) {
        return "";
      }

      const quote = findQuoteByDate(symbolData[symbol], date);
      const assetValue = toNumberOrNull(row[`${symbol}AssetValue`]);
      if (!quote) {
        return `<div class="pip-card"><button class="pip-close-button" type="button" data-pip-action="hide-symbol" data-pip-symbol="${escapeHtml(symbol)}">×</button><h3>${escapeHtml(symbol)}</h3><p>${escapeHtml(t("noData"))}</p></div>`;
      }

      const bottomClass = isBaseSymbol(symbol) && row[`${symbol}BottomSignal`] === 1 ? " pip-card-bottom" : "";
      const buyClass = isBaseSymbol(symbol) && row[`${symbol}BuySuggestion`] === 1 ? " pip-card-buy" : "";
      return `<div class="pip-card ${symbol === currentDetailState.symbol ? "active" : ""}${bottomClass}${buyClass}">
        <button class="pip-close-button" type="button" data-pip-action="hide-symbol" data-pip-symbol="${escapeHtml(symbol)}">×</button>
        <h3>${escapeHtml(symbol)}</h3>
        <p>${escapeHtml(t("closePrice"))}: ${escapeHtml(formatDisplayNumber(toNumberOrNull(quote.priceClose)))}</p>
        <p>${escapeHtml(t("priceChangeLabel"))}: ${escapeHtml(formatDisplayNumber(toNumberOrNull(quote.priceChange)))}</p>
        <p>${escapeHtml(t("returnPctLabel"))}: ${escapeHtml(formatPercent(toNumberOrNull(quote.returnPct)))}</p>
        ${assetValue === null ? "" : `<p>${escapeHtml(t("assetValueLabel"))}: ${escapeHtml(formatAssetValue(assetValue))}</p>`}
      </div>`;
    })
    .join("");

  return `<div class="pip-shell ${shellAccentClass}">
    <div class="pip-header">
      <div>
        <div class="pip-date">${escapeHtml(t("dateLabel"))} ${escapeHtml(date)}</div>
      </div>
      <div class="pip-header-actions">
        <button class="pip-reset-button" type="button" data-pip-action="reset-hidden">${escapeHtml(t("restoreAll"))}</button>
        <div class="pip-badge ${getSignalCellClass(row.hedgeState)}">${escapeHtml(formatSignalLabel(row.hedgeState))}</div>
      </div>
    </div>
    ${derivativesRow}${watchedRow}
    ${
      pipHiddenSections.metrics
        ? ""
        : `<div class="pip-section">
      <div class="pip-section-header">
        <div class="pip-section-title">${escapeHtml(t("quickMetrics"))}</div>
        <button class="pip-close-button" type="button" data-pip-action="hide-section" data-pip-section="metrics">×</button>
      </div>
      <div class="pip-metrics">
      <div class="pip-metric"><span>${escapeHtml(t("shortSignalLabel"))}</span><strong class="${getSignalCellClass(row.shortSignal)}">${escapeHtml(formatSignalLabel(row.shortSignal))}</strong></div>
      <div class="pip-metric"><span>${escapeHtml(t("stopSignalLabel"))}</span><strong class="${getSignalCellClass(row.stopSignal)}">${escapeHtml(formatSignalLabel(row.stopSignal))}</strong></div>
      <div class="pip-metric"><span>${escapeHtml(t("basisLabel"))}</span><strong>${escapeHtml(formatDisplayNumber(toNumberOrNull(row.basis)))}</strong></div>
      <div class="pip-metric"><span>${escapeHtml(t("basisZScoreLabel"))}</span><strong>${escapeHtml(formatDisplayNumber(toNumberOrNull(row.basisZScore)))}</strong></div>
      <div class="pip-metric"><span>Corr20</span><strong>${escapeHtml(formatDisplayNumber(toNumberOrNull(row.corr20)))}</strong></div>
      <div class="pip-metric"><span>${escapeHtml(t("trackingLabel"))}</span><strong>${escapeHtml(formatPercent(toNumberOrNull(row.trackingError20)))}</strong></div>
      </div>
    </div>`
    }
    ${
      pipHiddenSections.reason
        ? ""
        : `<div class="pip-section">
      <div class="pip-section-header">
        <div class="pip-section-title">${escapeHtml(t("reasonLabel"))}</div>
        <button class="pip-close-button" type="button" data-pip-action="hide-section" data-pip-section="reason">×</button>
      </div>
      <div class="pip-reason">${escapeHtml(t("reasonLabel"))}: ${escapeHtml(formatSignalReason(row.signalReason))}</div>
    </div>`
    }
    ${
      row.hedgeState === "Basis risk"
        ? (() => {
            const bc = toNumberOrNull(row.basisChange);
            const bz = toNumberOrNull(row.basisZScore);
            const te = toNumberOrNull(row.trackingError20);
            const bcTriggered = bc !== null && Math.abs(bc) >= HEDGE_THRESHOLDS.basisChangeShock;
            const bzTriggered = bz !== null && Math.abs(bz) >= HEDGE_THRESHOLDS.basisZScoreExtreme;
            const teTriggered = te !== null && te >= HEDGE_THRESHOLDS.trackingError20StopMax;
            return `<div class="pip-section pip-basis-risk-explain">
      <div class="pip-section-header">
        <div class="pip-section-title">${escapeHtml(t("basisRiskExplainTitle"))}</div>
      </div>
      <div class="pip-basis-risk-values">
        <div class="pip-basis-risk-row${bcTriggered ? " triggered" : ""}">
          <span>${escapeHtml(t("basisChangeLabel"))}</span> ${escapeHtml(formatDisplayNumber(bc))} (≥${HEDGE_THRESHOLDS.basisChangeShock})
        </div>
        <div class="pip-basis-risk-row${bzTriggered ? " triggered" : ""}">
          <span>${escapeHtml(t("basisZScoreLabel"))}</span> ${escapeHtml(formatDisplayNumber(bz))} (≥${HEDGE_THRESHOLDS.basisZScoreExtreme})
        </div>
        <div class="pip-basis-risk-row${teTriggered ? " triggered" : ""}">
          <span>${escapeHtml(t("trackingLabel"))}</span> ${escapeHtml(formatPercent(te))} (≥${formatPercent(HEDGE_THRESHOLDS.trackingError20StopMax)})
        </div>
      </div>
    </div>`;
          })()
        : ""
    }
    ${
      pipHiddenSections.buySignals || watchedSymbols.length === 0
        ? ""
        : (() => {
            const buyRows = watchedSymbols
              .map((sym) => {
                const count = row[`${sym}BuyCount`];
                if (typeof count !== "number" || count < BUY_SIGNAL.minPassCount) return "";
                const sigs = [1, 2, 3, 4, 5, 6, 7]
                  .map((i) => (row[`${sym}BuySig${i}`] === 1 ? "P" : "F"))
                  .join("");
                return `<div class="pip-buy-row"><span class="pip-buy-symbol">${escapeHtml(sym)}</span> ${count}/7: ${sigs}</div>`;
              })
              .filter(Boolean)
              .join("");
            if (!buyRows) return "";
            return `<div class="pip-section">
      <div class="pip-section-header">
        <div class="pip-section-title">${escapeHtml(t("buySignalsTitle"))}</div>
        <button class="pip-close-button" type="button" data-pip-action="hide-section" data-pip-section="buySignals">×</button>
      </div>
      <div class="pip-buy-signals">${buyRows}</div>
    </div>`;
          })()
    }
    ${
      pipHiddenSections.cards
        ? ""
        : `<div class="pip-section">
      <div class="pip-section-header">
        <div class="pip-section-title">${escapeHtml(t("watchedSymbols"))}</div>
        <button class="pip-close-button" type="button" data-pip-action="hide-section" data-pip-section="cards">×</button>
      </div>
      <div class="pip-cards">${cards || `<div class="pip-empty">${escapeHtml(t("noVisibleSymbols"))}</div>`}</div>
    </div>`
    }
  </div>`;
}

function getPictureInPictureStyles(): string {
  return `
    :root { color-scheme: light; font-family: Arial, sans-serif; }
    body { margin: 0; background: #ffffff; backdrop-filter: blur(8px); color: #0f172a; font-size: 13px; }
    .pip-shell {
      --pip-accent-rgb: 100, 116, 139;
      padding: 8px;
      border: 2px solid rgba(var(--pip-accent-rgb), 0.35);
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.9) inset;
    }
    .pip-accent-short { --pip-accent-rgb: 220, 38, 38; border-width: 3px; }
    .pip-accent-hold { --pip-accent-rgb: 217, 119, 6; border-width: 3px; }
    .pip-accent-stop { --pip-accent-rgb: 22, 163, 74; border-width: 3px; }
    .pip-accent-watch { --pip-accent-rgb: 59, 130, 246; border-width: 3px; }
    .pip-accent-risk { --pip-accent-rgb: 234, 88, 12; border-width: 3px; }
    .pip-accent-neutral { --pip-accent-rgb: 100, 116, 139; }
    .pip-shell { background: #ffffff; }
    .pip-shell.pip-accent-short { background: linear-gradient(135deg, #ffffff 0%, rgba(254, 226, 226, 0.85) 100%); }
    .pip-shell.pip-accent-hold { background: linear-gradient(135deg, #ffffff 0%, rgba(254, 243, 199, 0.85) 100%); }
    .pip-shell.pip-accent-stop { background: linear-gradient(135deg, #ffffff 0%, rgba(220, 252, 231, 0.85) 100%); }
    .pip-shell.pip-accent-watch { background: linear-gradient(135deg, #ffffff 0%, rgba(219, 234, 254, 0.85) 100%); }
    .pip-shell.pip-accent-risk { background: linear-gradient(135deg, #ffffff 0%, rgba(255, 237, 213, 0.85) 100%); }
    @keyframes pip-flash-pulse {
      0%, 100% { box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(var(--pip-accent-rgb), 0.2) inset; }
      25% { box-shadow: 0 4px 16px rgba(var(--pip-accent-rgb), 0.25), 0 0 0 2px rgba(var(--pip-accent-rgb), 0.35) inset; transform: scale(1.02); }
      50% { box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(var(--pip-accent-rgb), 0.2) inset; transform: scale(1); }
      75% { box-shadow: 0 2px 12px rgba(var(--pip-accent-rgb), 0.2), 0 0 0 1px rgba(var(--pip-accent-rgb), 0.3) inset; transform: scale(1.01); }
    }
    .pip-shell.pip-flash { animation: pip-flash-pulse 2s ease-out 1; }
    .pip-header { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; margin-bottom: 6px; }
    .pip-ticker-row { font-size: 11px; color: #64748b; margin-bottom: 4px; line-height: 1.4; display: flex; flex-wrap: wrap; gap: 4px 8px; }
    .pip-ticker-bottom { position: relative; padding-right: 12px; color: #15803d; }
    .pip-ticker-bottom::after { content: ""; position: absolute; right: 2px; top: 50%; transform: translateY(-50%); width: 6px; height: 6px; background: #22c55e; border-radius: 50%; }
    .pip-card-bottom { position: relative; }
    .pip-card-bottom h3 { color: #15803d; }
    .pip-card-bottom::before { content: ""; position: absolute; top: 8px; right: 36px; width: 6px; height: 6px; background: #22c55e; border-radius: 50%; }
    .pip-card-buy { border-color: rgba(34, 197, 94, 0.45); }
    .pip-card-buy h3 { color: #15803d; }
    .pip-ticker-buy { color: #15803d; }
    .pip-buy-signals { font-size: 11px; }
    .pip-buy-row { margin: 2px 0; }
    .pip-buy-symbol { font-weight: 700; color: #15803d; }
    .pip-ticker { white-space: nowrap; }
    .pip-ticker.positive { color: #0d9488; }
    .pip-ticker.negative { color: #dc2626; }
    .pip-header-actions { display: flex; align-items: center; gap: 8px; }
    .pip-title { font-size: 16px; font-weight: 700; color: #0f172a; }
    .pip-date { font-size: 12px; color: #64748b; margin-top: 2px; }
    .pip-badge, .signal-cell { display: inline-block; font-weight: 700; font-size: 11px; border-radius: 999px; padding: 5px 9px; }
    .pip-section { margin-bottom: 6px; }
    .pip-section-header { display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px; }
    .pip-section-title { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }
    .pip-close-button, .pip-reset-button { border: 1px solid #e2e8f0; background: #f8fafc; color: #0f172a; border-radius: 6px; cursor: pointer; }
    .pip-close-button { width: 24px; height: 24px; font-size: 15px; line-height: 1; }
    .pip-reset-button { padding: 5px 9px; font-size: 11px; }
    .signal-short { color: #991b1b; background: rgba(254, 226, 226, 0.9); }
    .signal-hold { color: #b45309; background: rgba(254, 243, 199, 0.9); }
    .signal-stop { color: #166534; background: rgba(220, 252, 231, 0.9); }
    .signal-watch { color: #1d4ed8; background: rgba(219, 234, 254, 0.9); }
    .signal-risk { color: #c2410c; background: rgba(255, 237, 213, 0.9); }
    .signal-neutral { color: #475569; background: rgba(241, 245, 249, 0.95); }
    .pip-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; margin-bottom: 6px; }
    .pip-metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 6px; }
    .pip-metric span { display: block; color: #64748b; font-size: 10px; margin-bottom: 2px; }
    .pip-metric strong { font-size: 13px; color: #0f172a; }
    .pip-reason { font-size: 12px; line-height: 1.45; color: #334155; margin-bottom: 8px; }
    .pip-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 4px; }
    .pip-card { border: 1px solid #e2e8f0; border-radius: 6px; background: #ffffff; padding: 4px 6px; }
    .pip-card .pip-close-button { float: right; margin-left: 8px; margin-bottom: 4px; }
    .pip-card.active { border-color: #2563eb; box-shadow: 0 0 0 1px #2563eb inset; }
    .pip-card h3 { margin: 0 0 2px; font-size: 11px; color: #0f172a; }
    .pip-card p { margin: 1px 0; color: #64748b; font-size: 10px; }
    .pip-empty { padding: 12px; color: #64748b; font-size: 13px; }
    .pip-basis-risk-explain { background: rgba(255, 237, 213, 0.6); border: 1px solid rgba(234, 88, 12, 0.35); border-radius: 8px; padding: 8px; }
    .pip-basis-risk-values { font-size: 10px; color: #64748b; }
    .pip-basis-risk-row { margin: 2px 0; }
    .pip-basis-risk-row.triggered { color: #dc2626; font-weight: 700; }
  `;
}

function renderPictureInPictureContent(): void {
  if (!pipWindowRef || pipWindowRef.closed || !pipRootElement) {
    return;
  }

  const row = getCurrentSignalRow(currentMappingData);
  const currentState = row?.hedgeState != null ? String(row.hedgeState) : null;
  const prevState = lastPipHedgeState;
  const stateChanged = prevState !== null && currentState !== prevState;
  lastPipHedgeState = currentState;

  pipRootElement.innerHTML = buildPictureInPictureMarkup(currentMappingData);

  if (stateChanged) {
    const shell = pipRootElement.querySelector<HTMLElement>(".pip-shell");
    if (shell) {
      shell.classList.add("pip-flash");
      shell.classList.add("pip-state-changed");
      shell.setAttribute("data-pip-prev-state", String(prevState ?? ""));
      shell.setAttribute("data-pip-curr-state", String(currentState ?? ""));
      pipWindowRef.setTimeout(() => {
        shell.classList.remove("pip-flash");
        shell.classList.remove("pip-state-changed");
      }, 2000);
    }
    if (getCurrentSettings().notifyEnabled && getCurrentSettings().notifyOnHedgeChange) {
      void sendNotification(
        t("hedgeStateLabel"),
        `${prevState ?? "-"} → ${currentState ?? "-"}`
      );
    }
  }
}

async function openPictureInPictureWindow(): Promise<void> {
  const pipHostWindow = window as PictureInPictureWindowHost;
  if (!pipHostWindow.documentPictureInPicture) {
    throw new Error(t("pipBrowserUnsupported"));
  }

  if (pipWindowRef && !pipWindowRef.closed) {
    pipWindowRef.focus();
    renderPictureInPictureContent();
    return;
  }

  const pipWindow = await pipHostWindow.documentPictureInPicture.requestWindow({
    width: 480,
    height: 420
  });

  pipWindow.document.head.innerHTML = `<meta charset="UTF-8"><title>${escapeHtml(t("pipTitle"))}</title><style>${getPictureInPictureStyles()}</style>`;
  pipWindow.document.body.innerHTML = `<div id="pipRoot"></div>`;

  pipWindowRef = pipWindow;
  pipRootElement = pipWindow.document.querySelector<HTMLDivElement>("#pipRoot");

  pipWindow.document.body.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const actionElement = target.closest<HTMLElement>("[data-pip-action]");
    if (!(actionElement instanceof HTMLElement)) {
      return;
    }

    const action = actionElement.dataset.pipAction;
    if (action === "hide-section") {
      const section = actionElement.dataset.pipSection;
      if (section) {
        pipHiddenSections[section] = true;
        renderPictureInPictureContent();
      }
      return;
    }

    if (action === "hide-symbol") {
      const symbol = actionElement.dataset.pipSymbol;
      if (symbol) {
        pipHiddenSymbols[symbol] = true;
        renderPictureInPictureContent();
      }
      return;
    }

    if (action === "reset-hidden") {
      resetPictureInPictureVisibility();
      renderPictureInPictureContent();
    }
  });

  pipWindow.addEventListener("pagehide", () => {
    pipWindowRef = null;
    pipRootElement = null;
    lastPipHedgeState = null;
    resetPictureInPictureVisibility();
    syncPipButtonLabel();
  });

  resetPictureInPictureVisibility();
  renderPictureInPictureContent();
  syncPipButtonLabel();
}

function closePictureInPictureWindow(): void {
  if (pipWindowRef && !pipWindowRef.closed) {
    pipWindowRef.close();
  }

  pipWindowRef = null;
  pipRootElement = null;
  lastPipHedgeState = null;
  syncPipButtonLabel();
}

function renderDetailPanel(
  symbolData: Record<string, HistoricalQuote[]>,
  date: string | null,
  focusedSymbol: string | null = null
): void {
  if (!date) {
    detailContentElement.innerHTML = t("detailHint");
    return;
  }

  const sortedSymbols = Object.keys(symbolData).sort();
  const comparisonPair = getComparisonPair(sortedSymbols);
  const row = buildMappingRows(symbolData).find((item) => item.date === date);
  const cards = sortedSymbols
    .map((symbol) => {
      const quote = findQuoteByDate(symbolData[symbol], date);
      const cardClass = symbol === focusedSymbol ? "detail-card active" : "detail-card";
      const assetValue = toNumberOrNull(row?.[`${symbol}AssetValue`]);

      if (!quote) {
        return `<div class="${cardClass}"><h3>${escapeHtml(symbol)}</h3><p>${escapeHtml(t("noDataForDate"))}</p></div>`;
      }

      return `<div class="${cardClass}">
        <h3>${escapeHtml(symbol)}</h3>
        <p>${escapeHtml(t("dateLabel"))}: ${escapeHtml(formatDateTime(quote.date))}</p>
        <p>priceOpen: ${escapeHtml(formatDisplayNumber(toNumberOrNull(quote.priceOpen)))}</p>
        <p>priceClose: ${escapeHtml(formatDisplayNumber(toNumberOrNull(quote.priceClose)))}</p>
        <p class="${getValueClass(toNumberOrNull(quote.priceChange))}">${escapeHtml(t("priceChangeColumn"))}: ${escapeHtml(formatDisplayNumber(toNumberOrNull(quote.priceChange)))}</p>
        <p class="${getValueClass(toNumberOrNull(quote.returnPct))}">${escapeHtml(t("returnPctColumn"))}: ${escapeHtml(formatPercent(toNumberOrNull(quote.returnPct)))}</p>
        ${assetValue === null ? "" : `<p>${escapeHtml(t("assetValueLabel"))}: ${escapeHtml(formatAssetValue(assetValue))}</p>`}
      </div>`;
    })
    .join("");

  let pairMetrics = "";
  if (comparisonPair) {
    const baseQuote = findQuoteByDate(symbolData[comparisonPair.baseSymbol], date);
    const hedgeQuote = findQuoteByDate(symbolData[comparisonPair.hedgeSymbol], date);
    const baseClose = toNumberOrNull(baseQuote?.priceClose);
    const hedgeClose = toNumberOrNull(hedgeQuote?.priceClose);
    const baseReturn = toNumberOrNull(baseQuote?.returnPct);
    const hedgeReturn = toNumberOrNull(hedgeQuote?.returnPct);
    const basis = baseClose === null || hedgeClose === null ? null : hedgeClose - baseClose;
    const spreadReturn = baseReturn === null || hedgeReturn === null ? null : hedgeReturn - baseReturn;

    pairMetrics = `<div class="detail-card">
      <h3>${escapeHtml(t("detailMetricsTitle"))}</h3>
      <p>${escapeHtml(t("basisLabel"))} (${escapeHtml(comparisonPair.hedgeSymbol)}-${escapeHtml(comparisonPair.baseSymbol)}): ${escapeHtml(formatDisplayNumber(basis))}</p>
      <p class="${getValueClass(spreadReturn)}">${escapeHtml(t("spreadReturnLabel"))}: ${escapeHtml(formatPercent(spreadReturn))}</p>
      <p>${escapeHtml(t("basisZScoreLabel"))}: ${escapeHtml(formatDisplayNumber(toNumberOrNull(row?.basisZScore)))}</p>
      <p>${escapeHtml(t("trackingError20Column"))}: ${escapeHtml(formatPercent(toNumberOrNull(row?.trackingError20)))}</p>
      <p>${escapeHtml(t("signalScoreLabel"))}: ${escapeHtml(formatDisplayNumber(toNumberOrNull(row?.signalScore)))}</p>
      <p class="${getSignalCellClass(row?.hedgeState)}">${escapeHtml(t("hedgeStateLabel"))}: ${escapeHtml(formatSignalLabel(row?.hedgeState))}</p>
      <p class="${getSignalCellClass(row?.shortSignal)}">${escapeHtml(t("shortSignalLabel"))}: ${escapeHtml(formatSignalLabel(row?.shortSignal))}</p>
      <p class="${getSignalCellClass(row?.stopSignal)}">${escapeHtml(t("stopSignalLabel"))}: ${escapeHtml(formatSignalLabel(row?.stopSignal))}</p>
      <p>${escapeHtml(t("reasonLabel"))}: ${escapeHtml(formatSignalReason(row?.signalReason))}</p>
      ${
        row?.hedgeState === "Basis risk"
          ? (() => {
              const bc = toNumberOrNull(row.basisChange);
              const bz = toNumberOrNull(row.basisZScore);
              const te = toNumberOrNull(row.trackingError20);
              const bcTriggered = bc !== null && Math.abs(bc) >= HEDGE_THRESHOLDS.basisChangeShock;
              const bzTriggered = bz !== null && Math.abs(bz) >= HEDGE_THRESHOLDS.basisZScoreExtreme;
              const teTriggered = te !== null && te >= HEDGE_THRESHOLDS.trackingError20StopMax;
              return `<p class="detail-basis-risk-explain"><strong>${escapeHtml(t("basisRiskExplainTitle"))}</strong></p>
      <p class="detail-basis-risk-row${bcTriggered ? " triggered" : ""}">${escapeHtml(t("basisChangeLabel"))}: ${escapeHtml(formatDisplayNumber(bc))} (≥${HEDGE_THRESHOLDS.basisChangeShock})</p>
      <p class="detail-basis-risk-row${bzTriggered ? " triggered" : ""}">${escapeHtml(t("basisZScoreLabel"))}: ${escapeHtml(formatDisplayNumber(bz))} (≥${HEDGE_THRESHOLDS.basisZScoreExtreme})</p>
      <p class="detail-basis-risk-row${teTriggered ? " triggered" : ""}">${escapeHtml(t("trackingLabel"))}: ${escapeHtml(formatPercent(te))} (≥${formatPercent(HEDGE_THRESHOLDS.trackingError20StopMax)})</p>`;
            })()
          : ""
      }
    </div>`;
  }

  let buySignalsCard = "";
  if (focusedSymbol && isBaseSymbol(focusedSymbol) && row) {
    const sigs = [1, 2, 3, 4, 5, 6, 7].map((i) => ({
      name: BUY_SIGNAL_NAMES[`sig${i}`],
      pass: row[`${focusedSymbol}BuySig${i}`] === 1
    }));
    const count = row[`${focusedSymbol}BuyCount`];
    buySignalsCard = `<div class="detail-card detail-buy-signals">
      <h3>${escapeHtml(t("buySignalsTitle"))} ${escapeHtml(focusedSymbol)} ${typeof count === "number" ? `(${count}/7)` : ""}</h3>
      ${sigs.map((s) => `<p class="detail-buy-signal-row ${s.pass ? "pass" : "fail"}">${escapeHtml(s.name)}: <strong>${s.pass ? escapeHtml(t("passLabel")) : escapeHtml(t("failLabel"))}</strong></p>`).join("")}
    </div>`;
  }

  detailContentElement.innerHTML = `<h3 class="detail-title">${escapeHtml(t("dateLabel"))} ${escapeHtml(date)}</h3><div class="detail-grid">${pairMetrics}${buySignalsCard}${cards}</div>`;
  renderPictureInPictureContent();
}

function renderMappingTable(symbolData: Record<string, HistoricalQuote[]>, sortState: SortState = mappingSortState): void {
  const allColumns = buildMappingColumns(symbolData);
  const columns = allColumns.filter(isMappingColumnVisible);

  if (!columns.some((column) => column.key === mappingSortState.key)) {
    mappingSortState = { ...defaultSortState };
  }

  renderHiddenColumnsBar(allColumns);

  if (columns.length === 1) {
    mappingHeadElement.innerHTML = "";
    mappingBodyElement.innerHTML = `<tr><td>${escapeHtml(t("tableEmpty"))}</td></tr>`;
    return;
  }

  const columnGroups = buildColumnGroups(columns);
  const groupHeaderCells = columnGroups
    .map((group, index) => {
      const groupClass = index === columnGroups.length - 1 ? "group-header" : "group-header group-end";
      return `<th class="${groupClass}" colspan="${group.span}">${escapeHtml(group.label)}</th>`;
    })
    .join("");

  const headCells = columns
    .map(
      (column, index) => {
        const isGroupEnd = index === columns.length - 1 || columns[index + 1].group !== column.group;
        const headerClass = isGroupEnd ? "sub-header group-end" : "sub-header";
        const hideButton =
          column.key === "date"
            ? ""
            : `<button type="button" class="column-hide-button" data-hide-column="${escapeHtml(column.key)}" title="${escapeHtml(
                t("hideColumnTitle")
              )}">×</button>`;
        return `<th class="${headerClass}"><div class="header-cell-content"><button type="button" class="sort-button" data-sort-key="${escapeHtml(
          column.key
        )}">${escapeHtml(column.label)} <span class="sort-indicator">${escapeHtml(getSortIndicator(
          column.key
        ))}</span></button>${hideButton}</div></th>`;
      }
    )
    .join("");
  mappingHeadElement.innerHTML = `<tr>${groupHeaderCells}</tr><tr>${headCells}</tr>`;

  const rows = sortMappingRows(buildMappingRows(symbolData), sortState);
  mappingBodyElement.innerHTML = rows
    .map((row) => {
      const rowClass = currentDetailState.date === row.date ? "clickable-row selected-row" : "clickable-row";
      const cells = columns
        .map((column, index) => {
          const value = row[column.key];
          if (column.key === "date") {
            const cellClass = index === columns.length - 1 || columns[index + 1].group !== column.group ? "group-end" : "";
            return `<td class="${cellClass}">${escapeHtml(String(value ?? ""))}</td>`;
          }

          const numericValue = typeof value === "number" ? value : null;
          const className = getValueClass(numericValue);
          const customCellClass = column.cellClassName ? column.cellClassName(value) : "";
          const selectedCellClass =
            currentDetailState.date === row.date && currentDetailState.symbol === column.focusSymbol ? " selected-cell" : "";
          const groupEndClass = index === columns.length - 1 || columns[index + 1].group !== column.group ? " group-end" : "";
          const dataSymbol = column.focusSymbol ? ` data-symbol="${escapeHtml(column.focusSymbol)}"` : "";
          const cellContent =
            column.key.endsWith("BottomSignal") && value === 1
              ? '<span class="bottom-signal-dot"></span>'
              : escapeHtml(column.formatter(value));
          return `<td class="${className} ${customCellClass}${selectedCellClass}${groupEndClass}"${dataSymbol}>${cellContent}</td>`;
        })
        .join("");

      return `<tr class="${rowClass}" data-date="${escapeHtml(String(row.date ?? ""))}">${cells}</tr>`;
    })
    .join("");
}

mappingHeadElement.addEventListener("click", (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const hideButton = target.closest("[data-hide-column]");
  if (hideButton instanceof HTMLButtonElement) {
    const columnKey = hideButton.dataset.hideColumn;
    if (!columnKey || columnKey === "date") {
      return;
    }

    hiddenMappingColumnKeys.add(columnKey);
    if (mappingSortState.key === columnKey) {
      mappingSortState = { ...defaultSortState };
    }
    renderMappingTable(currentMappingData, mappingSortState);
    return;
  }

  const button = target.closest(".sort-button");
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const nextKey = button.dataset.sortKey;
  if (!nextKey) {
    return;
  }

  mappingSortState =
    mappingSortState.key === nextKey
      ? {
          key: nextKey,
          direction: mappingSortState.direction === "asc" ? "desc" : "asc"
        }
      : {
          key: nextKey,
          direction: "desc"
        };

  renderMappingTable(currentMappingData, mappingSortState);
});

hiddenColumnsBarElement.addEventListener("click", (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const restoreButton = target.closest("[data-restore-column]");
  if (restoreButton instanceof HTMLButtonElement) {
    const columnKey = restoreButton.dataset.restoreColumn;
    if (!columnKey) {
      return;
    }

    hiddenMappingColumnKeys.delete(columnKey);
    renderMappingTable(currentMappingData, mappingSortState);
    return;
  }

  const restoreAllButton = target.closest("[data-restore-all-columns]");
  if (restoreAllButton instanceof HTMLButtonElement) {
    hiddenMappingColumnKeys = new Set<string>();
    renderMappingTable(currentMappingData, mappingSortState);
  }
});

mappingBodyElement.addEventListener("click", (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const row = target.closest("tr[data-date]");
  if (!(row instanceof HTMLTableRowElement)) {
    return;
  }

  const date = row.dataset.date;
  if (!date) {
    return;
  }

  const cell = target.closest("td[data-symbol]");
  const symbol = cell instanceof HTMLTableCellElement ? cell.dataset.symbol ?? null : null;

  currentDetailState = { date, symbol };
  renderMappingTable(currentMappingData, mappingSortState);
  renderDetailPanel(currentMappingData, date, symbol);
});

async function fetchAllHistoricalQuotes(
  symbol: string,
  bearerToken: string,
  startDate: string,
  endDate: string
): Promise<HistoricalQuote[]> {
  const quotes: HistoricalQuote[] = [];
  let offset = 0;

  while (true) {
    appendLog(`Fetching ${symbol} with offset ${offset} ...`);
    const page = await fetchPage(symbol, bearerToken, startDate, endDate, offset);
    quotes.push(...page);
    appendLog(`Received ${page.length} rows for ${symbol}.`);

    if (page.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  const normalized = normalizeQuotes(quotes);
  appendLog(`Normalized ${symbol} to ${normalized.length} unique rows.`);
  return normalized;
}

async function saveJsonFile(
  directoryHandle: FileSystemDirectoryHandle,
  fileName: string,
  data: HistoricalQuote[]
): Promise<void> {
  const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(`${JSON.stringify(data, null, 2)}\n`);
  await writable.close();
}

async function resolveDataDirectoryHandle(
  selectedDirectoryHandle: FileSystemDirectoryHandle
): Promise<{ directoryHandle: FileSystemDirectoryHandle; outputPathLabel: string }> {
  if (selectedDirectoryHandle.name.toLowerCase() === "data") {
    appendLog(t("selectedFolderAlreadyData"));
    return {
      directoryHandle: selectedDirectoryHandle,
      outputPathLabel: "data/"
    };
  }

  appendLog(t("selectedFolderProjectRoot"));
  return {
    directoryHandle: await selectedDirectoryHandle.getDirectoryHandle("data", { create: true }),
    outputPathLabel: "data/"
  };
}

function buildSummary(symbolData: Record<string, HistoricalQuote[]>): string {
  const lines = [t("done")];

  for (const [symbol, rows] of Object.entries(symbolData)) {
    lines.push(buildSymbolRangeLine(symbol, rows));
  }

  lines.push(t("savedToSelectedData"));
  return lines.join("\n");
}

function buildLoadedSummary(symbolData: Record<string, HistoricalQuote[]>, missingSymbols: string[]): string {
  const lines = [t("loadedExisting")];

  for (const [symbol, rows] of Object.entries(symbolData)) {
    lines.push(buildSymbolRangeLine(symbol, rows));
  }

  if (missingSymbols.length > 0) {
    lines.push(`${t("missingLabel")}: ${missingSymbols.join(", ")}`);
  }

  return lines.join("\n");
}

async function loadExistingData(): Promise<void> {
  const symbols = parseSymbols(symbolsInput.value);
  const allData: Record<string, HistoricalQuote[]> = {};
  const missingSymbols: string[] = [];

  for (const symbol of symbols) {
    try {
      const rows = await loadLocalJsonFile(symbol);
      allData[symbol] = rows;
      appendLog(`Loaded data/${symbol}.json`);
    } catch (error) {
      missingSymbols.push(symbol);
      appendLog(error instanceof Error ? error.message : String(error));
    }
  }

  if (Object.keys(allData).length === 0) {
    throw new Error(t("noMatchingJson"));
  }

  currentMappingData = allData;
  mappingSortState = { ...defaultSortState };
  currentDetailState = { date: null, symbol: null };
  lastBuySuggestions = new Set();
  renderOverview();
  renderMappingTable(allData);
  renderDetailPanel(allData, null, null);
  portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => refreshPortfolioRowPnL(row));
  refreshPortfolioTotal();
  refreshDerivativesTotal();
  renderPictureInPictureContent();
  setDynamicSummary(() => buildLoadedSummary(allData, missingSymbols));
  startRealtimeRefresh();
}

async function refreshRealtimeLatestRows(): Promise<void> {
  if (realtimeRefreshInFlight) {
    return;
  }

  const bearerToken = normalizeToken(tokenInput.value);
  if (!bearerToken || Object.keys(currentMappingData).length === 0) {
    return;
  }

  realtimeRefreshInFlight = true;
  try {
    const today = getTodayDateString();
    const symbols = parseSymbols(symbolsInput.value);
    let updated = false;

    for (const symbol of symbols) {
      const latestRows = normalizeQuotes(await fetchPage(symbol, bearerToken, today, today, 0));
      const latestQuote = latestRows[latestRows.length - 1] ?? null;
      if (!latestQuote) {
        continue;
      }

      currentMappingData[symbol] = mergeLatestQuoteIntoRows(currentMappingData[symbol] ?? [], latestQuote);
      updated = true;
    }

    if (updated) {
      refreshDataViews();
      renderPictureInPictureContent();
      if (getCurrentSettings().notifyOnBuySignal) {
        const rows = buildMappingRows(currentMappingData);
        const latestRow = rows[0] ?? null;
        if (latestRow) {
          const symbols = parseSymbols(symbolsInput.value);
          const nowBuy = new Set<string>();
          for (const sym of symbols) {
            if (isBaseSymbol(sym) && latestRow[`${sym}BuySuggestion`] === 1) {
              nowBuy.add(sym);
            }
          }
          const newlyBuy = [...nowBuy].filter((s) => !lastBuySuggestions.has(s));
          if (newlyBuy.length > 0) {
            void sendNotification(
              t("buyColumnLabel"),
              `${t("buyColumnLabel")}: ${newlyBuy.join(", ")}`
            );
          }
          lastBuySuggestions = nowBuy;
        }
      }
    }
  } catch (error) {
    appendLog(error instanceof Error ? error.message : String(error));
  } finally {
    realtimeRefreshInFlight = false;
  }
}

function stopRealtimeRefresh(): void {
  if (realtimeRefreshTimer !== null) {
    window.clearInterval(realtimeRefreshTimer);
    realtimeRefreshTimer = null;
  }
}

function startRealtimeRefresh(): void {
  stopRealtimeRefresh();

  const bearerToken = normalizeToken(tokenInput.value);
  if (!bearerToken) {
    return;
  }

  void refreshRealtimeLatestRows();
  realtimeRefreshTimer = window.setInterval(() => {
    void refreshRealtimeLatestRows();
  }, 5000);
}

async function run(): Promise<void> {
  const bearerToken = normalizeToken(tokenInput.value);
  const symbols = parseSymbols(symbolsInput.value);
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  ensureDateRange(startDate, endDate);

  if (!bearerToken) {
    throw new Error(t("bearerRequired"));
  }

  const pickerWindow = window as DirectoryPickerWindow;
  if (!pickerWindow.showDirectoryPicker) {
    throw new Error(t("showDirPickerUnsupported"));
  }

  appendLog(t("selectDataFolder"));
  const selectedDirectoryHandle = await pickerWindow.showDirectoryPicker({ mode: "readwrite" });
  const { directoryHandle: dataDirectoryHandle, outputPathLabel } = await resolveDataDirectoryHandle(selectedDirectoryHandle);
  const allData: Record<string, HistoricalQuote[]> = {};

  for (const symbol of symbols) {
    const rows = await fetchAllHistoricalQuotes(symbol, bearerToken, startDate, endDate);
    await saveJsonFile(dataDirectoryHandle, `${symbol}.json`, rows);
    allData[symbol] = rows;
    appendLog(`Saved ${outputPathLabel}${symbol}.json`);
  }

  currentMappingData = allData;
  mappingSortState = { ...defaultSortState };
  currentDetailState = { date: null, symbol: null };
  lastBuySuggestions = new Set();
  renderOverview();
  renderMappingTable(allData);
  renderDetailPanel(allData, null, null);
  portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => refreshPortfolioRowPnL(row));
  refreshPortfolioTotal();
  refreshDerivativesTotal();
  renderPictureInPictureContent();
  setDynamicSummary(() => buildSummary(allData));
  startRealtimeRefresh();
}

languageSelect.addEventListener("change", () => {
  const nextLanguage = languageSelect.value;
  if (nextLanguage === "vi" || nextLanguage === "ja" || nextLanguage === "en" || nextLanguage === "zh" || nextLanguage === "ko") {
    updateLanguage(nextLanguage);
    scheduleSaveSettings();
  }
});

for (const input of [document.querySelector<HTMLInputElement>("#vn30Asset"), document.querySelector<HTMLInputElement>("#vn30f1mAsset")].filter(Boolean)) {
  input.addEventListener("input", () => {
    refreshDataViews();
    scheduleSaveSettings();
  });
  input.addEventListener("blur", () => {
    formatAssetInputs();
    refreshDataViews();
    scheduleSaveSettings();
  });
}

for (const input of [tokenInput, symbolsInput]) {
  input.addEventListener("input", () => {
    scheduleSaveSettings();
    startRealtimeRefresh();
  });
}

for (const input of [startDateInput, endDateInput]) {
  input.addEventListener("change", () => {
    scheduleSaveSettings();
    startRealtimeRefresh();
  });
}

for (const input of [notifyEnabledInput, notifyOnHedgeChangeInput, notifyOnBuySignalInput].filter(Boolean)) {
  input!.addEventListener("change", () => {
    if (input === notifyEnabledInput && input?.checked) {
      void ensureNotificationPermission();
    }
    scheduleSaveSettings();
  });
}
for (const input of [telegramBotTokenInput, telegramChatIdInput, discordWebhookUrlInput].filter(Boolean)) {
  input!.addEventListener("input", () => scheduleSaveSettings());
}

if (saveSettingsButton) {
  saveSettingsButton.addEventListener("click", async () => {
    try {
      await saveSettingsToJsonFile();
      appendLog(t("settingsSaved"));
    } catch (error) {
      appendLog(error instanceof Error ? error.message : String(error));
    }
  });
}

if (portfolioAddRowButton && portfolioBodyElement) {
  portfolioAddRowButton.addEventListener("click", () => {
    const positions = getPortfolioPositionsFromDOM();
    positions.push({ symbol: "", price: 0, quantity: 0 });
    renderPortfolioRows(positions);
    refreshPortfolioTotal();
    scheduleSaveSettings();
  });
}
if (cashAddRowButton && cashBodyElement) {
  cashAddRowButton.addEventListener("click", () => {
    const transactions = getCashTransactionsFromDOM();
    transactions.push({ type: "deposit", amount: 0, description: "", createdAt: new Date().toISOString() });
    renderCashRows(transactions);
    refreshCashTotal();
    scheduleSaveSettings();
  });
}
if (derivativesAddRowButton && derivativesBodyElement) {
  derivativesAddRowButton.addEventListener("click", () => {
    const orders = getDerivativesFromDOM();
    orders.push({ symbol: "", type: "long", quantity: 0, entryPrice: 0, closePrice: undefined, description: "" });
    renderDerivativesRows(orders);
    refreshDerivativesTotal();
    scheduleSaveSettings();
  });
}

const portfolioTable = document.getElementById("portfolioTable");
const cashTableEl = document.getElementById("cashTable");
const derivativesTableEl = document.getElementById("derivativesTable");

if (portfolioTable) {
  portfolioTable.addEventListener("click", (ev) => {
    handleTabSortClick(ev, "portfolioTable", portfolioBodyElement, "tr[data-portfolio-row]", getPortfolioRowSortValue);
  });
}
if (cashTableEl) {
  cashTableEl.addEventListener("click", (ev) => {
    handleTabSortClick(ev, "cashTable", cashBodyElement, "tr[data-cash-row]", getCashRowSortValue);
  });
}
if (derivativesTableEl) {
  derivativesTableEl.addEventListener("click", (ev) => {
    handleTabSortClick(ev, "derivativesTable", derivativesBodyElement, "tr[data-derivatives-row]", getDerivativesRowSortValue);
  });
}

portfolioTabSearchInput?.addEventListener("input", () => refreshPortfolioTotal());
cashTabSearchInput?.addEventListener("input", () => applyCashTabSearch());
overviewTabSearchInput?.addEventListener("input", () => applyOverviewTabSearch());
derivativesTabSearchInput?.addEventListener("input", () => applyDerivativesTabSearch());

pipButton.addEventListener("click", async () => {
  try {
    if (pipWindowRef && !pipWindowRef.closed) {
      closePictureInPictureWindow();
      return;
    }

    await openPictureInPictureWindow();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appendLog(`Error: ${message}`);
    setSummary(`${t("failed")}\n${message}`);
  }
});

loadButton.addEventListener("click", async () => {
  loadButton.disabled = true;
  runButton.disabled = true;
  logElement.textContent = "";
  resetMappingView(t("loadingLocalTable"));
  setSummary(t("loadingLocalSummary"));

  try {
    await loadExistingData();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appendLog(`Error: ${message}`);
    setSummary(`${t("failed")}\n${message}`);
    resetMappingView(t("localDataNotFound"));
  } finally {
    loadButton.disabled = false;
    runButton.disabled = false;
  }
});

async function runSuggestScan(): Promise<void> {
  const bearerToken = normalizeToken(tokenInput.value);
  if (!bearerToken) {
    appendLog(t("bearerRequired"));
    return;
  }

  if (!suggestModal || !suggestModalStatus || !suggestModalResults) {
    return;
  }

  suggestModal.hidden = false;
  suggestModalStatus.textContent = t("suggestScanning");
  suggestModalResults.innerHTML = "";
  suggestButton.disabled = true;

  const endDate = endDateInput.value;
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 45);
  const startDateStr = startDate.toISOString().slice(0, 10);

  const found: string[] = [];

  for (let i = 0; i < HOSE_SYMBOLS.length; i++) {
    const symbol = HOSE_SYMBOLS[i];
    suggestModalStatus.textContent = `${t("suggestScanning")} (${i + 1}/${HOSE_SYMBOLS.length}) ${symbol}`;

    try {
      const page = await fetchPage(symbol, bearerToken, startDateStr, endDate, 0);
      await sleep(SUGGEST_API_DELAY_MS);

      const quotes = normalizeQuotes(page);
      if (quotes.length < BOTTOM_SIGNAL.volumeWindow + 1) {
        continue;
      }

      const lastIndex = quotes.length - 1;
      const buy = computeBuySignals(quotes, lastIndex);
      if (buy.count >= BUY_SIGNAL.minPassCount) {
        found.push(symbol);
      }
    } catch {
      // Skip failed symbols
    }
  }

  suggestModalStatus.textContent =
    found.length > 0 ? `${t("suggestFound")} ${found.length} ${t("buyColumnLabel")} (4/7+):` : t("suggestNone");

  if (found.length > 0 && getCurrentSettings().notifyEnabled) {
    void sendNotification(
      t("buyColumnLabel"),
      `${t("suggestFound")} ${found.length}: ${found.join(", ")}`
    );
  }

  if (found.length > 0) {
    suggestModalResults.innerHTML = found
      .map(
        (s) =>
          `<button type="button" class="suggest-chip" data-suggest-symbol="${escapeHtml(s)}">${escapeHtml(s)}</button>`
      )
      .join("");
    suggestModalResults.querySelectorAll(".suggest-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sym = (btn as HTMLElement).dataset.suggestSymbol;
        if (sym) {
          const current = symbolsInput.value.split(",").map((x) => x.trim()).filter(Boolean);
          if (!current.includes(sym)) {
            symbolsInput.value = [...current, sym].join(", ");
            scheduleSaveSettings();
          }
        }
      });
    });
  }

  suggestButton.disabled = false;
}

suggestButton.addEventListener("click", async () => {
  try {
    await runSuggestScan();
  } catch (error) {
    appendLog(error instanceof Error ? error.message : String(error));
    if (suggestModal) suggestModal.hidden = true;
    suggestButton.disabled = false;
  }
});

suggestModalClose?.addEventListener("click", () => {
  suggestModal?.setAttribute("hidden", "");
});

suggestModal?.addEventListener("click", (e) => {
  if (e.target === suggestModal) {
    suggestModal.setAttribute("hidden", "");
  }
});

runButton.addEventListener("click", async () => {
  loadButton.disabled = true;
  runButton.disabled = true;
  logElement.textContent = "";
  resetMappingView(t("loadingRemoteTable"));
  setSummary(t("runningSummary"));

  try {
    await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appendLog(`Error: ${message}`);
    setSummary(`${t("failed")}\n${message}`);
  } finally {
    loadButton.disabled = false;
    runButton.disabled = false;
  }
});

simDerivClearButton?.addEventListener("click", () => {
  renderSimDerivativesRows([{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }]);
  saveSimDerivativesManual();
});

simDerivAddRowButton?.addEventListener("click", () => {
  const rows = getSimDerivRowsFromDOM();
  rows.push({ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 });
  renderSimDerivativesRows(rows);
  saveSimDerivativesManual();
});

void (async () => {
  currentLanguage = getPreferredLanguage();
  loadSimDerivativesManual();
  try {
    await loadSavedSettings();
  } catch (_error) {
    // Ignore settings load failures so the app still opens normally.
    if (portfolioBodyElement) {
      renderPortfolioRows([]);
      refreshPortfolioTotal();
    }
    if (cashBodyElement) {
      renderCashRows([]);
      refreshCashTotal();
    }
    if (derivativesBodyElement) {
      renderDerivativesRows([]);
      refreshDerivativesTotal();
    }
  }
  formatAssetInputs();
  applyStaticTranslations();
  setSummary(t("summaryIdle"));
  syncPipButtonLabel();
  try {
    appendLog(t("tryingLoadExisting"));
    await loadExistingData();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appendLog(`${t("autoLoadSkipped")}: ${message}`);
    setSummary(t("noLocalDataSummary"));
    resetMappingView(t("noLocalDataTable"));
  }
})();
