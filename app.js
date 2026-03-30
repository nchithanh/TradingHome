(() => {
  // app.ts
  var HEDGE_WINDOWS = {
    basisZScore: 20,
    trackingError: 20
  };
  var BOTTOM_SIGNAL = {
    volumeWindow: 20,
    volumeMultiplier: 2
  };
  var BUY_SIGNAL = {
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
  };
  var BUY_SIGNAL_NAMES = {
    sig1: "Volume spike + reversal",
    sig2: "Chi\u1EBFt kh\u1EA5u s\xE2u + volume nh\u1ECF d\u1EA7n",
    sig3: "RSI oversold",
    sig4: "Higher lows",
    sig5: "Golden cross",
    sig6: "Bollinger bounce",
    sig7: "Volume t\u0103ng khi gi\xE1 t\u0103ng"
  };
  function isBaseSymbol(symbol) {
    return symbol !== "VN30" && !symbol.startsWith("VN30F");
  }
  var HEDGE_THRESHOLDS = {
    entryBaseReturnPct: -0.6,
    stopRecoveryPct: 0.35,
    corr20EntryMin: 0.85,
    corr20StopMax: 0.7,
    trackingError20EntryMax: 0.8,
    trackingError20StopMax: 1.2,
    basisZScoreEntryMax: 1.5,
    basisZScoreExtreme: 2.25,
    basisChangeShock: 4
  };
  var PAGE_SIZE = 200;
  var API_BASE_URL = "https://restv2.fireant.vn/symbols";
  var SUGGEST_API_DELAY_MS = 400;
  var HOSE_SYMBOLS = [
    "AAM",
    "ABB",
    "ABT",
    "ACB",
    "ACG",
    "ACL",
    "ADG",
    "ADS",
    "AGG",
    "AMD",
    "ANV",
    "APH",
    "ASM",
    "BBC",
    "BCE",
    "BCG",
    "BCM",
    "BID",
    "BII",
    "BMP",
    "BWE",
    "CII",
    "CKV",
    "CLC",
    "CMG",
    "CMV",
    "COM",
    "CRE",
    "CTG",
    "CTR",
    "DBC",
    "DCM",
    "DGW",
    "DHA",
    "DHG",
    "DPM",
    "DPG",
    "DQG",
    "DRC",
    "DXG",
    "DXS",
    "EIB",
    "EVF",
    "EVG",
    "FPT",
    "FRT",
    "GAS",
    "GEX",
    "GMD",
    "GVR",
    "HAG",
    "HCM",
    "HDC",
    "HDG",
    "HNG",
    "HPG",
    "HSG",
    "HT1",
    "IMP",
    "ITA",
    "KBC",
    "KDC",
    "KDH",
    "KOS",
    "KPF",
    "LPB",
    "LSS",
    "MBB",
    "MIG",
    "MSB",
    "MSN",
    "MWG",
    "NLG",
    "NSC",
    "NTL",
    "NVL",
    "OCB",
    "OPC",
    "ORS",
    "PDR",
    "PET",
    "PHR",
    "PLX",
    "PMG",
    "POM",
    "POW",
    "PPC",
    "PSH",
    "PVD",
    "PVT",
    "REE",
    "SAB",
    "SAM",
    "SBT",
    "SHP",
    "SIP",
    "SSB",
    "SSI",
    "STB",
    "SZC",
    "TCB",
    "TLG",
    "TMP",
    "TPB",
    "TSB",
    "VCI",
    "VGC",
    "VGI",
    "VHC",
    "VHM",
    "VIB",
    "VIC",
    "VJC",
    "VND",
    "VNM",
    "VOS",
    "VPB",
    "VPI",
    "VRE",
    "VTP",
    "ZSC"
  ];
  var LANGUAGE_STORAGE_KEY = "fireant-language";
  var APP_SETTINGS_API_PATH = "/api/settings";
  var SIM_DERIV_MANUAL_STORAGE_KEY = "investing-sim-derivatives-manual-v2";
  var NOTIFY_API_PATH = "/api/notify";
  var FUTURES_POINT_VALUE = 1e5;
  var FUTURES_MARGIN_PER_CONTRACT = 1e7;
  var UI_TEXT = {
    vi: {
      appTitle: "FireAnt Downloader",
      noteIntroHtml: "Trang n\xE0y c\xF3 th\u1EC3 \u0111\u1ECDc d\u1EEF li\u1EC7u s\u1EB5n trong <code>data</code> \u0111\u1EC3 hi\u1EC3n th\u1ECB mapping ngay, ho\u1EB7c g\u1ECDi API FireAnt \u0111\u1EC3 t\u1EA3i v\xE0 c\u1EADp nh\u1EADt file JSON.",
      noteUsageHtml: "N\xEAn m\u1EDF qua <code>http://localhost</code> ho\u1EB7c local server \u0111\u1EC3 tr\xECnh duy\u1EC7t cho ph\xE9p ch\u1ECDn th\u01B0 m\u1EE5c v\xE0 ghi file. B\u1EA1n c\xF3 th\u1EC3 ch\u1ECDn tr\u1EF1c ti\u1EBFp th\u01B0 m\u1EE5c <code>data</code> ho\u1EB7c th\u01B0 m\u1EE5c g\u1ED1c c\u1EE7a project.",
      tokenLabel: "Bearer token",
      tokenPlaceholder: "D\xE1n Bearer token v\xE0o \u0111\xE2y. C\xF3 th\u1EC3 d\xE1n c\u1EA3 chu\u1ED7i Bearer ...",
      languageLabel: "Ng\xF4n ng\u1EEF",
      symbolsLabel: "M\xE3",
      symbolsPlaceholder: "VD: VN30,VN30F1M,HPG,SSI",
      startDateLabel: "Ng\xE0y b\u1EAFt \u0111\u1EA7u",
      endDateLabel: "Ng\xE0y k\u1EBFt th\xFAc",
      vn30AssetLabel: "T\xE0i s\u1EA3n VN30",
      vn30f1mAssetLabel: "K\xFD qu\u1EF9 VN30F1M",
      notifyEnabledLabel: "B\u1EADt th\xF4ng b\xE1o",
      notifyOnHedgeLabel: "Khi \u0111\u1ED5i tr\u1EA1ng th\xE1i hedge",
      notifyOnBuyLabel: "Khi c\xF3 g\u1EE3i \xFD mua (4/7)",
      assetInputPlaceholder: "100.000.000",
      suggestButton: "G\u1EE3i \xFD \u0111\xE1y HOSE",
      suggestModalTitle: "G\u1EE3i \xFD t\u1EA1o \u0111\xE1y HOSE",
      suggestScanning: "\u0110ang qu\xE9t...",
      suggestFound: "T\xECm th\u1EA5y",
      suggestNone: "Kh\xF4ng c\xF3 m\xE3 n\xE0o th\u1ECFa \u0111i\u1EC1u ki\u1EC7n.",
      suggestAddToWatch: "Th\xEAm v\xE0o theo d\xF5i",
      loadButton: "\u0110\u1ECDc data c\xF3 s\u1EB5n",
      pipButtonOpen: "M\u1EDF c\u1EEDa s\u1ED5 n\u1ED5i (PiP)",
      pipButtonClose: "\u0110\xF3ng c\u1EEDa s\u1ED5 n\u1ED5i (PiP)",
      pipUnsupported: "PiP kh\xF4ng h\u1ED7 tr\u1EE3",
      summaryIdle: "Ch\u01B0a ch\u1EA1y.",
      detailPanelTitle: "Chi ti\u1EBFt",
      detailHint: "Click v\xE0o m\u1ED9t d\xF2ng ho\u1EB7c \xF4 trong b\u1EA3ng \u0111\u1EC3 xem chi ti\u1EBFt.",
      overviewVn30Label: "T\u1ED5ng ti\u1EC1n c\xF2n VN30",
      overviewFuturesLabel: "T\u1ED5ng l\xE3i/l\u1ED7 VN30F1M",
      overviewTotalLabel: "T\u1ED5ng t\xE0i s\u1EA3n",
      overviewBaseDateLabel: "Theo ng\xE0y",
      overviewNoData: "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u",
      overviewHeaderInitialAssetLabel: "T\u1ED5ng t\xE0i s\u1EA3n l\xFAc \u0111\u1EA7u",
      overviewHeaderPnLLabel: "L\xE3i/l\u1ED7",
      overviewHeaderNetAssetLabel: "T\xE0i s\u1EA3n r\xF2ng",
      tableEmpty: "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u mapping.",
      noPipData: "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u \u0111\u1EC3 hi\u1EC3n th\u1ECB.",
      noData: "Kh\xF4ng c\xF3 d\u1EEF li\u1EC7u.",
      noDataForDate: "Kh\xF4ng c\xF3 d\u1EEF li\u1EC7u cho ng\xE0y n\xE0y.",
      noVisibleSymbols: "Kh\xF4ng c\xF2n m\xE3 n\xE0o \u0111ang hi\u1EC3n th\u1ECB.",
      pipTitle: "T\xEDn hi\u1EC7u hedge",
      dateLabel: "Ng\xE0y",
      restoreAll: "Hi\u1EC7n l\u1EA1i t\u1EA5t c\u1EA3",
      hiddenColumnsLabel: "C\u1ED9t \u0111ang \u1EA9n",
      restoreColumns: "Hi\u1EC7n l\u1EA1i c\u1ED9t",
      hideColumnTitle: "\u1EA8n c\u1ED9t",
      quickMetrics: "Ch\u1EC9 s\u1ED1 nhanh",
      reasonLabel: "L\xFD do",
      watchedSymbols: "M\xE3 theo d\xF5i",
      closePrice: "\u0110\xF3ng c\u1EEDa",
      closePriceColumn: "\u0111\xF3ng c\u1EEDa",
      priceChangeLabel: "Bi\u1EBFn \u0111\u1ED9ng",
      returnPctLabel: "L\u1EE3i nhu\u1EADn %",
      basisLabel: "Basis",
      basisChangeLabel: "Bi\u1EBFn \u0111\u1ED9ng basis",
      basisRiskExplainTitle: "V\xEC sao Basis risk",
      basisZScoreLabel: "Basis Z",
      trackingLabel: "Tracking",
      assetValueLabel: "Gi\xE1 tr\u1ECB t\xE0i s\u1EA3n",
      detailMetricsTitle: "Ch\u1EC9 s\u1ED1 hedging",
      hedgeStateLabel: "Tr\u1EA1ng th\xE1i hedge",
      shortSignalLabel: "T\xEDn hi\u1EC7u short",
      stopSignalLabel: "T\xEDn hi\u1EC7u d\u1EEBng",
      spreadReturnLabel: "Spread return %",
      signalScoreLabel: "Signal score",
      groupGeneral: "Th\xF4ng tin chung",
      groupHedging: "Hedging",
      dateColumn: "Ng\xE0y",
      assetAppliedDateColumn: "Ng\xE0y \xE1p d\u1EE5ng ti\u1EC1n",
      priceChangeColumn: "priceChange",
      returnPctColumn: "return %",
      bottomColumnLabel: "\u0110\xE1y",
      buyColumnLabel: "G\u1EE3i \xFD",
      buySignalsTitle: "Ch\u1EC9 b\xE1o mua",
      passLabel: "PASS",
      failLabel: "FAIL",
      assetValueColumn: "gi\xE1 tr\u1ECB",
      basisChangeColumn: "basisChange",
      spreadReturnColumn: "spreadReturn %",
      trackingError20Column: "trackingError20",
      signalScoreColumn: "signalScore",
      priceChangeSpreadColumn: "priceChange spread",
      runButton: "T\u1EA3i v\xE0 l\u01B0u JSON",
      pleaseEnterSymbol: "Vui l\xF2ng nh\u1EADp \xEDt nh\u1EA5t m\u1ED9t m\xE3.",
      startEndRequired: "Ng\xE0y b\u1EAFt \u0111\u1EA7u v\xE0 ng\xE0y k\u1EBFt th\xFAc l\xE0 b\u1EAFt bu\u1ED9c.",
      startBeforeEnd: "Ng\xE0y b\u1EAFt \u0111\u1EA7u ph\u1EA3i nh\u1ECF h\u01A1n ho\u1EB7c b\u1EB1ng ng\xE0y k\u1EBFt th\xFAc.",
      uiNotFound: "Kh\xF4ng t\xECm th\u1EA5y th\xE0nh ph\u1EA7n giao di\u1EC7n.",
      pipBrowserUnsupported: "Document Picture-in-Picture ch\u01B0a \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3 trong tr\xECnh duy\u1EC7t n\xE0y.",
      noMatchingJson: "Kh\xF4ng t\xECm th\u1EA5y file JSON ph\xF9 h\u1EE3p trong data/.",
      bearerRequired: "Bearer token l\xE0 b\u1EAFt bu\u1ED9c.",
      showDirPickerUnsupported: "showDirectoryPicker ch\u01B0a \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3. H\xE3y m\u1EDF trang n\xE0y t\u1EEB localhost tr\xEAn Edge ho\u1EB7c Chrome.",
      selectDataFolder: "Vui l\xF2ng ch\u1ECDn th\u01B0 m\u1EE5c data ho\u1EB7c th\u01B0 m\u1EE5c g\u1ED1c c\u1EE7a project.",
      selectedFolderAlreadyData: "Th\u01B0 m\u1EE5c \u0111\xE3 ch\u1ECDn ch\xEDnh l\xE0 data, file s\u1EBD \u0111\u01B0\u1EE3c l\u01B0u tr\u1EF1c ti\u1EBFp t\u1EA1i \u0111\xE2y.",
      selectedFolderProjectRoot: "\u0110\xE3 ch\u1ECDn th\u01B0 m\u1EE5c g\u1ED1c project, s\u1EBD d\xF9ng th\u01B0 m\u1EE5c con data/.",
      loadingLocalTable: "\u0110ang \u0111\u1ECDc d\u1EEF li\u1EC7u local...",
      loadingLocalSummary: "\u0110ang \u0111\u1ECDc d\u1EEF li\u1EC7u local...",
      localDataNotFound: "Kh\xF4ng t\xECm th\u1EA5y d\u1EEF li\u1EC7u local ph\xF9 h\u1EE3p.",
      loadingRemoteTable: "\u0110ang t\u1EA3i d\u1EEF li\u1EC7u...",
      runningSummary: "\u0110ang ch\u1EA1y...",
      tryingLoadExisting: "\u0110ang th\u1EED \u0111\u1ECDc JSON c\xF3 s\u1EB5n t\u1EEB data/ ...",
      noLocalDataSummary: "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u local. B\u1EA1n c\xF3 th\u1EC3 b\u1EA5m '\u0110\u1ECDc data c\xF3 s\u1EB5n' ho\u1EB7c t\u1EA3i m\u1EDBi.",
      noLocalDataTable: "Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u local.",
      autoLoadSkipped: "B\u1ECF qua t\u1EF1 \u0111\u1ED9ng \u0111\u1ECDc",
      failed: "Th\u1EA5t b\u1EA1i.",
      done: "Ho\xE0n t\u1EA5t.",
      loadedExisting: "\u0110\xE3 \u0111\u1ECDc JSON c\xF3 s\u1EB5n t\u1EEB data/.",
      savedToSelectedData: "\u0110\xE3 l\u01B0u v\xE0o data/ trong th\u01B0 m\u1EE5c b\u1EA1n \u0111\xE3 ch\u1ECDn.",
      missingLabel: "Thi\u1EBFu",
      rangeLabel: "kho\u1EA3ng",
      rowsLabel: "d\xF2ng",
      saveSettingsButton: "L\u01B0u c\xE0i \u0111\u1EB7t",
      settingsSaved: "\u0110\xE3 l\u01B0u c\xE0i \u0111\u1EB7t.",
      portfolioTitle: "Danh m\u1EE5c",
      portfolioDesc: "Nh\u1EADp m\xE3 CK, gi\xE1 v\u1ED1n, s\u1ED1 l\u01B0\u1EE3ng. L\xE3i/l\u1ED7 theo gi\xE1 \u0111\xF3ng c\u1EEDa ng\xE0y m\u1EDBi nh\u1EA5t trong b\u1EA3ng data.",
      portfolioColSymbol: "M\xE3",
      portfolioColPrice: "Gi\xE1 v\u1ED1n",
      portfolioColQty: "SL",
      portfolioColTotal: "T\u1ED5ng v\u1ED1n",
      portfolioColActualCapital: "T\u1ED5ng v\u1ED1n th\u1EF1c",
      portfolioColCurrentPrice: "Gi\xE1",
      portfolioColSellPrice: "Gi\xE1 b\xE1n",
      portfolioColMarginPct: "Margin %",
      portfolioColPnL: "L\xE3i/l\u1ED7",
      portfolioColPnLPct: "L\xE3i/l\u1ED7 %",
      portfolioAddRow: "+ Th\xEAm d\xF2ng",
      portfolioTotalLabel: "T\u1ED5ng v\u1ED1n:",
      portfolioCurrentLabel: "T\u1ED5ng hi\u1EC7n t\u1EA1i:",
      portfolioPnLLabel: "L\xE3i/l\u1ED7:",
      portfolioMarginLabel: "Margin %",
      portfolioDebtLabel: "T\u1ED5ng n\u1EE3:",
      cashTitle: "Ti\u1EC1n m\u1EB7t",
      cashDesc: "Nh\u1EADp l\u1EC7nh n\u1ED9p/r\xFAt ti\u1EC1n, s\u1ED1 ti\u1EC1n, m\xF4 t\u1EA3.",
      cashColType: "Lo\u1EA1i",
      cashColAmount: "S\u1ED1 ti\u1EC1n",
      cashColDesc: "M\xF4 t\u1EA3",
      cashColCreatedAt: "T\u1EA1o l\xFAc",
      cashTypeDeposit: "N\u1ED9p",
      cashTypeWithdrawal: "R\xFAt",
      cashAddRow: "+ Th\xEAm d\xF2ng",
      cashTotalLabel: "T\u1ED5ng ti\u1EC1n m\u1EB7t:",
      derivativesSectionTitle: "Ph\xE1i sinh",
      derivativesSectionDesc: "Nh\u1EADp c\xE1c l\u1EC7nh ph\xE1i sinh: m\xE3 h\u1EE3p \u0111\u1ED3ng, long/short, s\u1ED1 l\u01B0\u1EE3ng, gi\xE1.",
      simDerivTabTitle: "M\xF4 ph\u1ECFng ph\xE1i sinh",
      simDerivTabDesc: "Nh\u1EADp gi\xE1 v\xE0o, gi\xE1 \u0111\xF3ng v\xE0 kh\u1ED1i l\u01B0\u1EE3ng \u0111\u1EC3 xem l\xE3i/l\u1ED7 (1 \u0111i\u1EC3m = 100.000\u0111). Ch\u1EC9 m\xF4 ph\u1ECFng \u2014 kh\xF4ng c\u1ED9ng v\xE0o t\u1ED5ng t\xE0i s\u1EA3n hay T\u1ED5ng quan.",
      simDerivColType: "Lo\u1EA1i",
      simDerivColQty: "SL",
      simDerivColEntry: "Gi\xE1 v\xE0o",
      simDerivColClose: "Gi\xE1 \u0111\xF3ng",
      simDerivColPnL: "L\xE3i/l\u1ED7",
      simDerivAddRow: "+ Th\xEAm d\xF2ng",
      simDerivClearBtn: "X\xF3a m\xF4 ph\u1ECFng",
      simDerivTotalPnLLabel: "T\u1ED5ng L\xE3i/l\u1ED7 (m\xF4 ph\u1ECFng)",
      derivColSymbol: "M\xE3 H\u0110",
      derivColType: "Lo\u1EA1i",
      derivColQty: "SL",
      derivColPrice: "Gi\xE1 v\xE0o",
      derivColClosePrice: "Gi\xE1 \u0111\xF3ng",
      derivColPnL: "L\xE3i/l\u1ED7",
      derivColDesc: "M\xF4 t\u1EA3",
      derivTypeLong: "Long",
      derivTypeShort: "Short",
      derivativesAddRow: "+ Th\xEAm d\xF2ng",
      derivativesTotalLabel: "T\u1ED5ng l\u1EC7nh:",
      derivativesPnLLabel: "T\u1ED5ng l\xE3i/l\u1ED7:",
      tabSearchPlaceholder: "T\xECm trong tab n\xE0y\u2026",
      tabSearchHint: "G\xF5 \u0111\u1EC3 l\u1ECDc d\xF2ng; \u0111\u1EC3 tr\u1ED1ng \u0111\u1EC3 xem t\u1EA5t c\u1EA3 d\xF2ng.",
      tabSearchNoMatch: "Kh\xF4ng c\xF3 d\xF2ng n\xE0o kh\u1EDBp. X\xF3a \xF4 t\xECm ki\u1EBFm \u0111\u1EC3 xem l\u1EA1i d\u1EEF li\u1EC7u."
    },
    ja: {
      appTitle: "FireAnt Downloader",
      noteIntroHtml: "\u3053\u306E\u30DA\u30FC\u30B8\u306F <code>data</code> \u306E\u65E2\u5B58\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u3093\u3067\u3059\u3050\u306B\u30DE\u30C3\u30D4\u30F3\u30B0\u3092\u8868\u793A\u3059\u308B\u304B\u3001FireAnt API \u3092\u547C\u3073\u51FA\u3057\u3066 JSON \u3092\u53D6\u5F97\u30FB\u66F4\u65B0\u3067\u304D\u307E\u3059\u3002",
      noteUsageHtml: "\u30D5\u30A9\u30EB\u30C0\u30FC\u9078\u629E\u3068\u66F8\u304D\u8FBC\u307F\u3092\u8A31\u53EF\u3059\u308B\u305F\u3081\u3001<code>http://localhost</code> \u307E\u305F\u306F\u30ED\u30FC\u30AB\u30EB\u30B5\u30FC\u30D0\u30FC\u7D4C\u7531\u3067\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002<code>data</code> \u30D5\u30A9\u30EB\u30C0\u30FC\u3001\u307E\u305F\u306F\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306E\u30EB\u30FC\u30C8\u3092\u76F4\u63A5\u9078\u629E\u3067\u304D\u307E\u3059\u3002",
      tokenLabel: "Bearer token",
      tokenPlaceholder: "Bearer token \u3092\u3053\u3053\u306B\u8CBC\u308A\u4ED8\u3051\u307E\u3059\u3002Bearer ... \u3092\u542B\u3081\u3066\u3082\u69CB\u3044\u307E\u305B\u3093\u3002",
      languageLabel: "\u8A00\u8A9E",
      symbolsLabel: "\u9298\u67C4",
      symbolsPlaceholder: "\u4F8B: VN30,VN30F1M,HPG,SSI",
      startDateLabel: "\u958B\u59CB\u65E5",
      endDateLabel: "\u7D42\u4E86\u65E5",
      vn30AssetLabel: "VN30 \u8CC7\u7523",
      vn30f1mAssetLabel: "VN30F1M \u8A3C\u62E0\u91D1",
      notifyEnabledLabel: "\u901A\u77E5\u3092\u6709\u52B9\u306B\u3059\u308B",
      notifyOnHedgeLabel: "\u30D8\u30C3\u30B8\u72B6\u614B\u5909\u66F4\u6642",
      notifyOnBuyLabel: "\u8CB7\u3044\u30B7\u30B0\u30CA\u30EB (4/7) \u6642",
      assetInputPlaceholder: "100.000.000",
      suggestButton: "HOSE\u5E95\u5019\u88DC",
      suggestModalTitle: "HOSE\u5E95\u5F62\u6210\u5019\u88DC",
      suggestScanning: "\u30B9\u30AD\u30E3\u30F3\u4E2D...",
      suggestFound: "\u898B\u3064\u304B\u308A\u307E\u3057\u305F",
      suggestNone: "\u6761\u4EF6\u3092\u6E80\u305F\u3059\u9298\u67C4\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
      suggestAddToWatch: "\u76E3\u8996\u306B\u8FFD\u52A0",
      loadButton: "\u65E2\u5B58\u30C7\u30FC\u30BF\u3092\u8AAD\u3080",
      pipButtonOpen: "\u30D5\u30ED\u30FC\u30C6\u30A3\u30F3\u30B0\u30A6\u30A3\u30F3\u30C9\u30A6\u3092\u958B\u304F (PiP)",
      pipButtonClose: "\u30D5\u30ED\u30FC\u30C6\u30A3\u30F3\u30B0\u30A6\u30A3\u30F3\u30C9\u30A6\u3092\u9589\u3058\u308B (PiP)",
      pipUnsupported: "PiP \u975E\u5BFE\u5FDC",
      summaryIdle: "\u672A\u5B9F\u884C\u3067\u3059\u3002",
      detailPanelTitle: "\u8A73\u7D30",
      detailHint: "\u8868\u306E\u884C\u307E\u305F\u306F\u30BB\u30EB\u3092\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3068\u8A73\u7D30\u3092\u8868\u793A\u3057\u307E\u3059\u3002",
      overviewVn30Label: "VN30 \u6B8B\u308A\u8CC7\u7523",
      overviewFuturesLabel: "VN30F1M \u640D\u76CA\u5408\u8A08",
      overviewTotalLabel: "\u7DCF\u8CC7\u7523",
      overviewBaseDateLabel: "\u5BFE\u8C61\u65E5",
      overviewNoData: "\u30C7\u30FC\u30BF\u306A\u3057",
      overviewHeaderInitialAssetLabel: "\u521D\u671F\u7DCF\u8CC7\u7523",
      overviewHeaderPnLLabel: "\u640D\u76CA",
      overviewHeaderNetAssetLabel: "\u7D14\u8CC7\u7523",
      tableEmpty: "\u30DE\u30C3\u30D4\u30F3\u30B0\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
      noPipData: "\u8868\u793A\u3059\u308B\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
      noData: "\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
      noDataForDate: "\u3053\u306E\u65E5\u306E\u30C7\u30FC\u30BF\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
      noVisibleSymbols: "\u8868\u793A\u4E2D\u306E\u9298\u67C4\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
      pipTitle: "\u30D8\u30C3\u30B8\u30B7\u30B0\u30CA\u30EB",
      dateLabel: "\u65E5\u4ED8",
      restoreAll: "\u3059\u3079\u3066\u518D\u8868\u793A",
      hiddenColumnsLabel: "\u975E\u8868\u793A\u306E\u5217",
      restoreColumns: "\u5217\u3092\u623B\u3059",
      hideColumnTitle: "\u5217\u3092\u96A0\u3059",
      quickMetrics: "\u4E3B\u8981\u6307\u6A19",
      reasonLabel: "\u7406\u7531",
      watchedSymbols: "\u76E3\u8996\u9298\u67C4",
      closePrice: "\u7D42\u5024",
      closePriceColumn: "\u7D42\u5024",
      priceChangeLabel: "\u5909\u52D5",
      returnPctLabel: "\u53CE\u76CA\u7387 %",
      basisLabel: "Basis",
      basisChangeLabel: "Basis\u5909\u52D5",
      basisRiskExplainTitle: "Basis risk\u306E\u7406\u7531",
      basisZScoreLabel: "Basis Z",
      trackingLabel: "Tracking",
      assetValueLabel: "\u8CC7\u7523\u4FA1\u5024",
      detailMetricsTitle: "\u30D8\u30C3\u30B8\u6307\u6A19",
      hedgeStateLabel: "\u30D8\u30C3\u30B8\u72B6\u614B",
      shortSignalLabel: "\u30B7\u30E7\u30FC\u30C8\u30B7\u30B0\u30CA\u30EB",
      stopSignalLabel: "\u505C\u6B62\u30B7\u30B0\u30CA\u30EB",
      spreadReturnLabel: "\u30B9\u30D7\u30EC\u30C3\u30C9\u53CE\u76CA\u7387 %",
      signalScoreLabel: "\u30B7\u30B0\u30CA\u30EB\u30B9\u30B3\u30A2",
      groupGeneral: "\u5171\u901A\u60C5\u5831",
      groupHedging: "\u30D8\u30C3\u30B8",
      dateColumn: "\u65E5\u4ED8",
      assetAppliedDateColumn: "\u8CC7\u91D1\u9069\u7528\u65E5",
      priceChangeColumn: "priceChange",
      returnPctColumn: "return %",
      bottomColumnLabel: "\u5E95",
      buyColumnLabel: "\u8CB7\u3044\u5019\u88DC",
      buySignalsTitle: "\u8CB7\u3044\u30B7\u30B0\u30CA\u30EB",
      passLabel: "PASS",
      failLabel: "FAIL",
      assetValueColumn: "\u8CC7\u7523\u4FA1\u5024",
      basisChangeColumn: "basisChange",
      spreadReturnColumn: "spreadReturn %",
      trackingError20Column: "trackingError20",
      signalScoreColumn: "signalScore",
      priceChangeSpreadColumn: "priceChange spread",
      runButton: "JSON \u3092\u53D6\u5F97\u3057\u3066\u4FDD\u5B58",
      pleaseEnterSymbol: "\u5C11\u306A\u304F\u3068\u3082 1 \u3064\u306E\u9298\u67C4\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      startEndRequired: "\u958B\u59CB\u65E5\u3068\u7D42\u4E86\u65E5\u306F\u5FC5\u9808\u3067\u3059\u3002",
      startBeforeEnd: "\u958B\u59CB\u65E5\u306F\u7D42\u4E86\u65E5\u4EE5\u524D\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
      uiNotFound: "UI \u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002",
      pipBrowserUnsupported: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u306F Document Picture-in-Picture \u3092\u30B5\u30DD\u30FC\u30C8\u3057\u3066\u3044\u307E\u305B\u3093\u3002",
      noMatchingJson: "data/ \u306B\u4E00\u81F4\u3059\u308B JSON \u30D5\u30A1\u30A4\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002",
      bearerRequired: "Bearer token \u306F\u5FC5\u9808\u3067\u3059\u3002",
      showDirPickerUnsupported: "showDirectoryPicker \u306F\u672A\u5BFE\u5FDC\u3067\u3059\u3002Edge \u307E\u305F\u306F Chrome \u3067 localhost \u304B\u3089\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002",
      selectDataFolder: "data \u30D5\u30A9\u30EB\u30C0\u30FC\u307E\u305F\u306F\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306E\u30EB\u30FC\u30C8\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      selectedFolderAlreadyData: "\u9078\u629E\u3057\u305F\u30D5\u30A9\u30EB\u30C0\u30FC\u306F\u65E2\u306B data \u3067\u3059\u3002\u3053\u3053\u3078\u76F4\u63A5\u4FDD\u5B58\u3057\u307E\u3059\u3002",
      selectedFolderProjectRoot: "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306E\u30EB\u30FC\u30C8\u3092\u9078\u629E\u3057\u307E\u3057\u305F\u3002data/ \u30B5\u30D6\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002",
      loadingLocalTable: "\u30ED\u30FC\u30AB\u30EB\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D...",
      loadingLocalSummary: "\u30ED\u30FC\u30AB\u30EB\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D...",
      localDataNotFound: "\u4E00\u81F4\u3059\u308B\u30ED\u30FC\u30AB\u30EB\u30C7\u30FC\u30BF\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002",
      loadingRemoteTable: "\u30C7\u30FC\u30BF\u3092\u53D6\u5F97\u4E2D...",
      runningSummary: "\u5B9F\u884C\u4E2D...",
      tryingLoadExisting: "data/ \u304B\u3089\u65E2\u5B58 JSON \u3092\u8AAD\u307F\u8FBC\u307F\u4E2D ...",
      noLocalDataSummary: "\u30ED\u30FC\u30AB\u30EB\u30C7\u30FC\u30BF\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002'\u65E2\u5B58\u30C7\u30FC\u30BF\u3092\u8AAD\u3080' \u3092\u62BC\u3059\u304B\u3001\u65B0\u898F\u53D6\u5F97\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      noLocalDataTable: "\u30ED\u30FC\u30AB\u30EB\u30C7\u30FC\u30BF\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
      autoLoadSkipped: "\u81EA\u52D5\u8AAD\u8FBC\u3092\u30B9\u30AD\u30C3\u30D7",
      failed: "\u5931\u6557\u3002",
      done: "\u5B8C\u4E86\u3002",
      loadedExisting: "data/ \u304B\u3089\u65E2\u5B58 JSON \u3092\u8AAD\u307F\u8FBC\u307F\u307E\u3057\u305F\u3002",
      savedToSelectedData: "\u9078\u629E\u3057\u305F\u30D5\u30A9\u30EB\u30C0\u30FC\u5185\u306E data/ \u306B\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
      missingLabel: "\u4E0D\u8DB3",
      rangeLabel: "\u7BC4\u56F2",
      rowsLabel: "\u884C",
      saveSettingsButton: "\u8A2D\u5B9A\u3092\u4FDD\u5B58",
      settingsSaved: "\u8A2D\u5B9A\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F\u3002",
      portfolioTitle: "\u30DD\u30FC\u30C8\u30D5\u30A9\u30EA\u30AA",
      portfolioDesc: "\u9298\u67C4\u3001\u4FA1\u683C\u3001\u6570\u91CF\u3092\u5165\u529B\u3002\u5408\u8A08\u306F\u81EA\u52D5\u8A08\u7B97\u3002",
      portfolioColSymbol: "\u9298\u67C4",
      portfolioColPrice: "\u4FA1\u683C",
      portfolioColQty: "\u6570\u91CF",
      portfolioColTotal: "\u5143\u672C\u5408\u8A08",
      portfolioColActualCapital: "\u5B9F\u8CEA\u5143\u672C",
      portfolioColCurrentPrice: "\u73FE\u5728\u4FA1\u683C",
      portfolioColSellPrice: "\u58F2\u5374\u4FA1\u683C",
      portfolioColMarginPct: "Margin %",
      portfolioColPnL: "\u640D\u76CA",
      portfolioColPnLPct: "\u640D\u76CA %",
      portfolioAddRow: "+ \u884C\u3092\u8FFD\u52A0",
      portfolioTotalLabel: "\u5143\u672C\u5408\u8A08:",
      portfolioCurrentLabel: "\u73FE\u5728\u5408\u8A08:",
      portfolioPnLLabel: "\u640D\u76CA:",
      portfolioMarginLabel: "Margin %",
      portfolioDebtLabel: "\u7DCF\u8CA0\u50B5:",
      cashTitle: "\u73FE\u91D1",
      cashDesc: "\u5165\u91D1/\u51FA\u91D1\u3001\u91D1\u984D\u3001\u8AAC\u660E\u3092\u5165\u529B\u3002",
      cashColType: "\u7A2E\u985E",
      cashColAmount: "\u91D1\u984D",
      cashColDesc: "\u8AAC\u660E",
      cashColCreatedAt: "\u4F5C\u6210\u65E5\u6642",
      cashTypeDeposit: "\u5165\u91D1",
      cashTypeWithdrawal: "\u51FA\u91D1",
      cashAddRow: "+ \u884C\u3092\u8FFD\u52A0",
      cashTotalLabel: "\u73FE\u91D1\u5408\u8A08:",
      derivativesSectionTitle: "\u30C7\u30EA\u30D0\u30C6\u30A3\u30D6",
      derivativesSectionDesc: "\u30C7\u30EA\u30D0\u30C6\u30A3\u30D6\u6CE8\u6587\u3092\u5165\u529B: \u30B3\u30FC\u30C9\u3001\u30ED\u30F3\u30B0/\u30B7\u30E7\u30FC\u30C8\u3001\u6570\u91CF\u3001\u4FA1\u683C\u3002",
      simDerivTabTitle: "\u30C7\u30EA\u30D0\u30C6\u30A3\u30D6\u30B7\u30DF\u30E5",
      simDerivTabDesc: "\u30A8\u30F3\u30C8\u30EA\u30FC\u30FB\u30AF\u30ED\u30FC\u30BA\u30FB\u6570\u91CF\u3092\u5165\u529B\u3057\u3066\u640D\u76CA\u3092\u78BA\u8A8D\uFF081\u30DD\u30A4\u30F3\u30C8=10\u4E07\u5186\uFF09\u3002\u30B7\u30DF\u30E5\u306E\u307F\u2014\u7DCF\u8CC7\u7523\u306B\u542B\u307F\u307E\u305B\u3093\u3002",
      simDerivColType: "\u7A2E\u5225",
      simDerivColQty: "\u6570\u91CF",
      simDerivColEntry: "\u30A8\u30F3\u30C8\u30EA\u30FC",
      simDerivColClose: "\u30AF\u30ED\u30FC\u30BA",
      simDerivColPnL: "\u640D\u76CA",
      simDerivAddRow: "+ \u884C\u3092\u8FFD\u52A0",
      simDerivClearBtn: "\u30B7\u30DF\u30E5\u3092\u6D88\u53BB",
      simDerivTotalPnLLabel: "\u640D\u76CA\u5408\u8A08\uFF08\u30B7\u30DF\u30E5\uFF09",
      derivColSymbol: "\u30B3\u30FC\u30C9",
      derivColType: "\u30BF\u30A4\u30D7",
      derivColQty: "\u6570\u91CF",
      derivColPrice: "\u30A8\u30F3\u30C8\u30EA\u30FC\u4FA1\u683C",
      derivColClosePrice: "\u6C7A\u6E08\u4FA1\u683C",
      derivColPnL: "\u640D\u76CA",
      derivColDesc: "\u8AAC\u660E",
      derivTypeLong: "\u30ED\u30F3\u30B0",
      derivTypeShort: "\u30B7\u30E7\u30FC\u30C8",
      derivativesAddRow: "+ \u884C\u3092\u8FFD\u52A0",
      derivativesTotalLabel: "\u6CE8\u6587\u5408\u8A08:",
      derivativesPnLLabel: "\u640D\u76CA\u5408\u8A08:",
      tabSearchPlaceholder: "\u3053\u306E\u30BF\u30D6\u3092\u691C\u7D22\u2026",
      tabSearchHint: "\u5165\u529B\u3067\u884C\u3092\u7D5E\u308A\u8FBC\u307F\u3002\u7A7A\u6B04\u3067\u3059\u3079\u3066\u8868\u793A\u3002",
      tabSearchNoMatch: "\u8A72\u5F53\u3059\u308B\u884C\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u691C\u7D22\u3092\u30AF\u30EA\u30A2\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
    },
    en: {
      appTitle: "FireAnt Downloader",
      noteIntroHtml: "This page can load existing data from <code>data</code> for immediate mapping, or call the FireAnt API to download and update JSON files.",
      noteUsageHtml: "Open via <code>http://localhost</code> or a local server so the browser allows folder selection and file writing. You can choose the <code>data</code> folder directly or the project root folder.",
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
      simDerivTabDesc: "Enter entry, close, and quantity to see P/L (1 point = 100,000). Simulation only\u2014not included in total assets or overview.",
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
      tabSearchPlaceholder: "Search this tab\u2026",
      tabSearchHint: "Type to filter rows; clear to show all.",
      tabSearchNoMatch: "No rows match. Clear the search to see your data again."
    },
    zh: {
      appTitle: "FireAnt Downloader",
      noteIntroHtml: "\u6B64\u9875\u9762\u53EF\u4EE5\u8BFB\u53D6 <code>data</code> \u4E2D\u7684\u73B0\u6709\u6570\u636E\u5E76\u7ACB\u5373\u663E\u793A\u6620\u5C04\uFF0C\u4E5F\u53EF\u4EE5\u8C03\u7528 FireAnt API \u4E0B\u8F7D\u5E76\u66F4\u65B0 JSON \u6587\u4EF6\u3002",
      noteUsageHtml: "\u8BF7\u901A\u8FC7 <code>http://localhost</code> \u6216\u672C\u5730\u670D\u52A1\u5668\u6253\u5F00\uFF0C\u4EE5\u4FBF\u6D4F\u89C8\u5668\u5141\u8BB8\u9009\u62E9\u6587\u4EF6\u5939\u5E76\u5199\u5165\u6587\u4EF6\u3002\u4F60\u53EF\u4EE5\u76F4\u63A5\u9009\u62E9 <code>data</code> \u6587\u4EF6\u5939\u6216\u9879\u76EE\u6839\u76EE\u5F55\u3002",
      tokenLabel: "Bearer token",
      tokenPlaceholder: "\u5728\u8FD9\u91CC\u7C98\u8D34 Bearer token\u3002\u53EF\u4EE5\u76F4\u63A5\u7C98\u8D34\u5B8C\u6574\u7684 Bearer ... \u5B57\u7B26\u4E32\u3002",
      languageLabel: "\u8BED\u8A00",
      symbolsLabel: "\u4EE3\u7801",
      symbolsPlaceholder: "\u4F8B\u5982: VN30,VN30F1M,HPG,SSI",
      startDateLabel: "\u5F00\u59CB\u65E5\u671F",
      endDateLabel: "\u7ED3\u675F\u65E5\u671F",
      vn30AssetLabel: "VN30 \u8D44\u4EA7",
      vn30f1mAssetLabel: "VN30F1M \u4FDD\u8BC1\u91D1",
      notifyEnabledLabel: "\u542F\u7528\u901A\u77E5",
      notifyOnHedgeLabel: "\u5BF9\u51B2\u72B6\u6001\u53D8\u5316\u65F6",
      notifyOnBuyLabel: "\u4E70\u5165\u4FE1\u53F7 (4/7) \u65F6",
      assetInputPlaceholder: "100.000.000",
      suggestButton: "HOSE\u5E95\u90E8\u5EFA\u8BAE",
      suggestModalTitle: "HOSE\u5E95\u90E8\u5F62\u6210\u5EFA\u8BAE",
      suggestScanning: "\u626B\u63CF\u4E2D...",
      suggestFound: "\u627E\u5230",
      suggestNone: "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u4EE3\u7801\u3002",
      suggestAddToWatch: "\u52A0\u5165\u76D1\u63A7",
      loadButton: "\u8BFB\u53D6\u73B0\u6709\u6570\u636E",
      pipButtonOpen: "\u6253\u5F00\u60AC\u6D6E\u7A97\u53E3 (PiP)",
      pipButtonClose: "\u5173\u95ED\u60AC\u6D6E\u7A97\u53E3 (PiP)",
      pipUnsupported: "PiP \u4E0D\u652F\u6301",
      summaryIdle: "\u5C1A\u672A\u8FD0\u884C\u3002",
      detailPanelTitle: "\u8BE6\u60C5",
      detailHint: "\u70B9\u51FB\u8868\u683C\u4E2D\u7684\u884C\u6216\u5355\u5143\u683C\u67E5\u770B\u8BE6\u60C5\u3002",
      overviewVn30Label: "VN30 \u5269\u4F59\u91D1\u989D",
      overviewFuturesLabel: "VN30F1M \u603B\u76C8\u4E8F",
      overviewTotalLabel: "\u603B\u8D44\u4EA7",
      overviewBaseDateLabel: "\u57FA\u4E8E\u65E5\u671F",
      overviewNoData: "\u6682\u65E0\u6570\u636E",
      overviewHeaderInitialAssetLabel: "\u521D\u671F\u603B\u8D44\u4EA7",
      overviewHeaderPnLLabel: "\u76C8\u4E8F",
      overviewHeaderNetAssetLabel: "\u51C0\u8D44\u4EA7",
      tableEmpty: "\u6682\u65E0\u6620\u5C04\u6570\u636E\u3002",
      noPipData: "\u6CA1\u6709\u53EF\u663E\u793A\u7684\u6570\u636E\u3002",
      noData: "\u6CA1\u6709\u6570\u636E\u3002",
      noDataForDate: "\u8BE5\u65E5\u671F\u6CA1\u6709\u6570\u636E\u3002",
      noVisibleSymbols: "\u5F53\u524D\u6CA1\u6709\u53EF\u663E\u793A\u7684\u4EE3\u7801\u3002",
      pipTitle: "\u5BF9\u51B2\u4FE1\u53F7",
      dateLabel: "\u65E5\u671F",
      restoreAll: "\u5168\u90E8\u6062\u590D",
      hiddenColumnsLabel: "\u5DF2\u9690\u85CF\u5217",
      restoreColumns: "\u6062\u590D\u5217",
      hideColumnTitle: "\u9690\u85CF\u5217",
      quickMetrics: "\u5FEB\u901F\u6307\u6807",
      reasonLabel: "\u539F\u56E0",
      watchedSymbols: "\u76D1\u63A7\u4EE3\u7801",
      closePrice: "\u6536\u76D8\u4EF7",
      closePriceColumn: "\u6536\u76D8\u4EF7",
      priceChangeLabel: "\u53D8\u52A8",
      returnPctLabel: "\u6536\u76CA\u7387 %",
      basisLabel: "Basis",
      basisChangeLabel: "Basis\u53D8\u52A8",
      basisRiskExplainTitle: "\u4E3A\u4F55Basis\u98CE\u9669",
      basisZScoreLabel: "Basis Z",
      trackingLabel: "Tracking",
      assetValueLabel: "\u8D44\u4EA7\u4EF7\u503C",
      detailMetricsTitle: "\u5BF9\u51B2\u6307\u6807",
      hedgeStateLabel: "\u5BF9\u51B2\u72B6\u6001",
      shortSignalLabel: "\u505A\u7A7A\u4FE1\u53F7",
      stopSignalLabel: "\u505C\u6B62\u4FE1\u53F7",
      spreadReturnLabel: "\u4EF7\u5DEE\u6536\u76CA\u7387 %",
      signalScoreLabel: "\u4FE1\u53F7\u5206\u6570",
      groupGeneral: "\u901A\u7528\u4FE1\u606F",
      groupHedging: "\u5BF9\u51B2",
      dateColumn: "\u65E5\u671F",
      assetAppliedDateColumn: "\u8D44\u91D1\u8D77\u7B97\u65E5",
      priceChangeColumn: "priceChange",
      returnPctColumn: "return %",
      bottomColumnLabel: "\u5E95",
      buyColumnLabel: "\u4E70\u5165\u5EFA\u8BAE",
      buySignalsTitle: "\u4E70\u5165\u6307\u6807",
      passLabel: "PASS",
      failLabel: "FAIL",
      assetValueColumn: "\u8D44\u4EA7\u4EF7\u503C",
      basisChangeColumn: "basisChange",
      spreadReturnColumn: "spreadReturn %",
      trackingError20Column: "trackingError20",
      signalScoreColumn: "signalScore",
      priceChangeSpreadColumn: "priceChange spread",
      runButton: "\u4E0B\u8F7D\u5E76\u4FDD\u5B58 JSON",
      pleaseEnterSymbol: "\u8BF7\u81F3\u5C11\u8F93\u5165\u4E00\u4E2A\u4EE3\u7801\u3002",
      startEndRequired: "\u5F00\u59CB\u65E5\u671F\u548C\u7ED3\u675F\u65E5\u671F\u4E0D\u80FD\u4E3A\u7A7A\u3002",
      startBeforeEnd: "\u5F00\u59CB\u65E5\u671F\u5FC5\u987B\u65E9\u4E8E\u6216\u7B49\u4E8E\u7ED3\u675F\u65E5\u671F\u3002",
      uiNotFound: "\u672A\u627E\u5230\u754C\u9762\u5143\u7D20\u3002",
      pipBrowserUnsupported: "\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301 Document Picture-in-Picture\u3002",
      noMatchingJson: "\u5728 data/ \u4E2D\u672A\u627E\u5230\u5339\u914D\u7684 JSON \u6587\u4EF6\u3002",
      bearerRequired: "Bearer token \u662F\u5FC5\u586B\u9879\u3002",
      showDirPickerUnsupported: "showDirectoryPicker \u4E0D\u53D7\u652F\u6301\u3002\u8BF7\u5728 Edge \u6216 Chrome \u4E2D\u901A\u8FC7 localhost \u6253\u5F00\u6B64\u9875\u9762\u3002",
      selectDataFolder: "\u8BF7\u9009\u62E9 data \u6587\u4EF6\u5939\u6216\u9879\u76EE\u6839\u76EE\u5F55\u3002",
      selectedFolderAlreadyData: "\u6240\u9009\u6587\u4EF6\u5939\u5DF2\u662F data\uFF0C\u6587\u4EF6\u5C06\u76F4\u63A5\u4FDD\u5B58\u5230\u8FD9\u91CC\u3002",
      selectedFolderProjectRoot: "\u5DF2\u9009\u62E9\u9879\u76EE\u6839\u76EE\u5F55\uFF0C\u5C06\u4F7F\u7528\u5176 data/ \u5B50\u76EE\u5F55\u3002",
      loadingLocalTable: "\u6B63\u5728\u8BFB\u53D6\u672C\u5730\u6570\u636E...",
      loadingLocalSummary: "\u6B63\u5728\u8BFB\u53D6\u672C\u5730\u6570\u636E...",
      localDataNotFound: "\u672A\u627E\u5230\u5339\u914D\u7684\u672C\u5730\u6570\u636E\u3002",
      loadingRemoteTable: "\u6B63\u5728\u4E0B\u8F7D\u6570\u636E...",
      runningSummary: "\u8FD0\u884C\u4E2D...",
      tryingLoadExisting: "\u6B63\u5728\u5C1D\u8BD5\u4ECE data/ \u8BFB\u53D6\u73B0\u6709 JSON ...",
      noLocalDataSummary: "\u5C1A\u65E0\u672C\u5730\u6570\u636E\u3002\u4F60\u53EF\u4EE5\u70B9\u51FB\u201C\u8BFB\u53D6\u73B0\u6709\u6570\u636E\u201D\u6216\u91CD\u65B0\u4E0B\u8F7D\u3002",
      noLocalDataTable: "\u5C1A\u65E0\u672C\u5730\u6570\u636E\u3002",
      autoLoadSkipped: "\u5DF2\u8DF3\u8FC7\u81EA\u52A8\u8BFB\u53D6",
      failed: "\u5931\u8D25\u3002",
      done: "\u5B8C\u6210\u3002",
      loadedExisting: "\u5DF2\u4ECE data/ \u8BFB\u53D6\u73B0\u6709 JSON\u3002",
      savedToSelectedData: "\u5DF2\u4FDD\u5B58\u5230\u6240\u9009\u6587\u4EF6\u5939\u4E2D\u7684 data/\u3002",
      missingLabel: "\u7F3A\u5C11",
      rangeLabel: "\u8303\u56F4",
      rowsLabel: "\u884C",
      saveSettingsButton: "\u4FDD\u5B58\u8BBE\u7F6E",
      settingsSaved: "\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\u3002",
      portfolioTitle: "\u6295\u8D44\u7EC4\u5408",
      portfolioDesc: "\u8F93\u5165\u4EE3\u7801\u3001\u4EF7\u683C\u3001\u6570\u91CF\u3002\u603B\u91D1\u989D\u81EA\u52A8\u8BA1\u7B97\u3002",
      portfolioColSymbol: "\u4EE3\u7801",
      portfolioColPrice: "\u4EF7\u683C",
      portfolioColQty: "\u6570\u91CF",
      portfolioColTotal: "\u6210\u672C\u603B\u989D",
      portfolioColActualCapital: "\u5B9E\u9645\u672C\u91D1",
      portfolioColCurrentPrice: "\u73B0\u4EF7",
      portfolioColSellPrice: "\u5356\u51FA\u4EF7",
      portfolioColMarginPct: "Margin %",
      portfolioColPnL: "\u76C8\u4E8F",
      portfolioColPnLPct: "\u76C8\u4E8F %",
      portfolioAddRow: "+ \u6DFB\u52A0\u884C",
      portfolioTotalLabel: "\u6210\u672C\u603B\u989D:",
      portfolioCurrentLabel: "\u73B0\u4EF7\u603B\u989D:",
      portfolioPnLLabel: "\u76C8\u4E8F:",
      portfolioMarginLabel: "Margin %",
      portfolioDebtLabel: "\u603B\u8D1F\u503A:",
      cashTitle: "\u73B0\u91D1",
      cashDesc: "\u8F93\u5165\u5B58\u5165/\u53D6\u51FA\u3001\u91D1\u989D\u3001\u8BF4\u660E\u3002",
      cashColType: "\u7C7B\u578B",
      cashColAmount: "\u91D1\u989D",
      cashColDesc: "\u8BF4\u660E",
      cashColCreatedAt: "\u521B\u5EFA\u65F6\u95F4",
      cashTypeDeposit: "\u5B58\u5165",
      cashTypeWithdrawal: "\u53D6\u51FA",
      cashAddRow: "+ \u6DFB\u52A0\u884C",
      cashTotalLabel: "\u73B0\u91D1\u5408\u8BA1:",
      derivativesSectionTitle: "\u884D\u751F\u54C1",
      derivativesSectionDesc: "\u8F93\u5165\u884D\u751F\u54C1\u8BA2\u5355: \u5408\u7EA6\u4EE3\u7801\u3001\u591A/\u7A7A\u3001\u6570\u91CF\u3001\u4EF7\u683C\u3002",
      simDerivTabTitle: "\u884D\u751F\u54C1\u6A21\u62DF",
      simDerivTabDesc: "\u8F93\u5165\u5165\u573A\u3001\u5E73\u4ED3\u4E0E\u6570\u91CF\u67E5\u770B\u76C8\u4E8F\uFF081\u70B9=100,000\uFF09\u3002\u4EC5\u6A21\u62DF\u2014\u4E0D\u8BA1\u5165\u603B\u8D44\u4EA7\u4E0E\u6982\u89C8\u3002",
      simDerivColType: "\u65B9\u5411",
      simDerivColQty: "\u6570\u91CF",
      simDerivColEntry: "\u5165\u573A\u4EF7",
      simDerivColClose: "\u5E73\u4ED3\u4EF7",
      simDerivColPnL: "\u76C8\u4E8F",
      simDerivAddRow: "+ \u6DFB\u52A0\u884C",
      simDerivClearBtn: "\u6E05\u9664\u6A21\u62DF",
      simDerivTotalPnLLabel: "\u76C8\u4E8F\u5408\u8BA1\uFF08\u6A21\u62DF\uFF09",
      derivColSymbol: "\u5408\u7EA6",
      derivColType: "\u7C7B\u578B",
      derivColQty: "\u6570\u91CF",
      derivColPrice: "\u5F00\u4ED3\u4EF7",
      derivColClosePrice: "\u5E73\u4ED3\u4EF7",
      derivColPnL: "\u76C8\u4E8F",
      derivColDesc: "\u63CF\u8FF0",
      derivTypeLong: "\u591A",
      derivTypeShort: "\u7A7A",
      derivativesAddRow: "+ \u6DFB\u52A0\u884C",
      derivativesTotalLabel: "\u8BA2\u5355\u5408\u8BA1:",
      derivativesPnLLabel: "\u76C8\u4E8F\u5408\u8BA1:",
      tabSearchPlaceholder: "\u5728\u6B64\u6807\u7B7E\u9875\u641C\u7D22\u2026",
      tabSearchHint: "\u8F93\u5165\u4EE5\u7B5B\u9009\u884C\uFF1B\u7559\u7A7A\u663E\u793A\u5168\u90E8\u3002",
      tabSearchNoMatch: "\u6CA1\u6709\u5339\u914D\u7684\u884C\u3002\u8BF7\u6E05\u7A7A\u641C\u7D22\u6846\u4EE5\u6062\u590D\u663E\u793A\u3002"
    },
    ko: {
      appTitle: "FireAnt Downloader",
      noteIntroHtml: "\uC774 \uD398\uC774\uC9C0\uB294 <code>data</code> \uC758 \uAE30\uC874 \uB370\uC774\uD130\uB97C \uC77D\uC5B4 \uC989\uC2DC \uB9E4\uD551\uC744 \uD45C\uC2DC\uD558\uAC70\uB098, FireAnt API \uB97C \uD638\uCD9C\uD574 JSON \uD30C\uC77C\uC744 \uB2E4\uC6B4\uB85C\uB4DC\uD558\uACE0 \uC5C5\uB370\uC774\uD2B8\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      noteUsageHtml: "\uBE0C\uB77C\uC6B0\uC800\uAC00 \uD3F4\uB354 \uC120\uD0DD\uACFC \uD30C\uC77C \uC4F0\uAE30\uB97C \uD5C8\uC6A9\uD558\uB3C4\uB85D <code>http://localhost</code> \uB610\uB294 \uB85C\uCEEC \uC11C\uBC84\uB85C \uC5F4\uC5B4 \uC8FC\uC138\uC694. <code>data</code> \uD3F4\uB354\uB098 \uD504\uB85C\uC81D\uD2B8 \uB8E8\uD2B8\uB97C \uC9C1\uC811 \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      tokenLabel: "Bearer token",
      tokenPlaceholder: "\uC5EC\uAE30\uC5D0 Bearer token \uC744 \uBD99\uC5EC \uB123\uC73C\uC138\uC694. Bearer ... \uC804\uCCB4 \uBB38\uC790\uC5F4\uB3C4 \uAC00\uB2A5\uD569\uB2C8\uB2E4.",
      languageLabel: "\uC5B8\uC5B4",
      symbolsLabel: "\uC885\uBAA9",
      symbolsPlaceholder: "\uC608: VN30,VN30F1M,HPG,SSI",
      startDateLabel: "\uC2DC\uC791\uC77C",
      endDateLabel: "\uC885\uB8CC\uC77C",
      vn30AssetLabel: "VN30 \uC790\uC0B0",
      vn30f1mAssetLabel: "VN30F1M \uC99D\uAC70\uAE08",
      notifyEnabledLabel: "\uC54C\uB9BC \uC0AC\uC6A9",
      notifyOnHedgeLabel: "\uD5E4\uC9C0 \uC0C1\uD0DC \uBCC0\uACBD \uC2DC",
      notifyOnBuyLabel: "\uB9E4\uC218 \uC2E0\uD638 (4/7) \uC2DC",
      assetInputPlaceholder: "100.000.000",
      suggestButton: "HOSE \uBC14\uB2E5 \uC81C\uC548",
      suggestModalTitle: "HOSE \uBC14\uB2E5 \uD615\uC131 \uC81C\uC548",
      suggestScanning: "\uC2A4\uCE94 \uC911...",
      suggestFound: "\uBC1C\uACAC",
      suggestNone: "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC885\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      suggestAddToWatch: "\uAD00\uC2EC \uCD94\uAC00",
      loadButton: "\uAE30\uC874 \uB370\uC774\uD130 \uC77D\uAE30",
      pipButtonOpen: "\uD50C\uB85C\uD305 \uCC3D \uC5F4\uAE30 (PiP)",
      pipButtonClose: "\uD50C\uB85C\uD305 \uCC3D \uB2EB\uAE30 (PiP)",
      pipUnsupported: "PiP \uBBF8\uC9C0\uC6D0",
      summaryIdle: "\uC544\uC9C1 \uC2E4\uD589\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
      detailPanelTitle: "\uC0C1\uC138",
      detailHint: "\uD45C\uC758 \uD589\uC774\uB098 \uC140\uC744 \uD074\uB9AD\uD558\uBA74 \uC0C1\uC138 \uB0B4\uC6A9\uC744 \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      overviewVn30Label: "VN30 \uB0A8\uC740 \uAE08\uC561",
      overviewFuturesLabel: "VN30F1M \uCD1D \uC190\uC775",
      overviewTotalLabel: "\uCD1D\uC790\uC0B0",
      overviewBaseDateLabel: "\uAE30\uC900\uC77C",
      overviewNoData: "\uB370\uC774\uD130 \uC5C6\uC74C",
      overviewHeaderInitialAssetLabel: "\uCD08\uAE30 \uCD1D\uC790\uC0B0",
      overviewHeaderPnLLabel: "\uC190\uC775",
      overviewHeaderNetAssetLabel: "\uC21C\uC790\uC0B0",
      tableEmpty: "\uB9E4\uD551 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
      noPipData: "\uD45C\uC2DC\uD560 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
      noData: "\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
      noDataForDate: "\uC774 \uB0A0\uC9DC\uC758 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
      noVisibleSymbols: "\uD45C\uC2DC \uC911\uC778 \uC885\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      pipTitle: "\uD5E4\uC9C0 \uC2E0\uD638",
      dateLabel: "\uB0A0\uC9DC",
      restoreAll: "\uBAA8\uB450 \uB2E4\uC2DC \uD45C\uC2DC",
      hiddenColumnsLabel: "\uC228\uAE40 \uC5F4",
      restoreColumns: "\uC5F4 \uBCF5\uC6D0",
      hideColumnTitle: "\uC5F4 \uC228\uAE30\uAE30",
      quickMetrics: "\uBE60\uB978 \uC9C0\uD45C",
      reasonLabel: "\uC0AC\uC720",
      watchedSymbols: "\uAD00\uC2EC \uC885\uBAA9",
      closePrice: "\uC885\uAC00",
      closePriceColumn: "\uC885\uAC00",
      priceChangeLabel: "\uBCC0\uB3D9",
      returnPctLabel: "\uC218\uC775\uB960 %",
      basisLabel: "Basis",
      basisChangeLabel: "Basis \uBCC0\uB3D9",
      basisRiskExplainTitle: "Basis risk \uC774\uC720",
      basisZScoreLabel: "Basis Z",
      trackingLabel: "Tracking",
      assetValueLabel: "\uC790\uC0B0 \uAC00\uCE58",
      detailMetricsTitle: "\uD5E4\uC9C0 \uC9C0\uD45C",
      hedgeStateLabel: "\uD5E4\uC9C0 \uC0C1\uD0DC",
      shortSignalLabel: "\uC20F \uC2E0\uD638",
      stopSignalLabel: "\uC911\uB2E8 \uC2E0\uD638",
      spreadReturnLabel: "\uC2A4\uD504\uB808\uB4DC \uC218\uC775\uB960 %",
      signalScoreLabel: "\uC2E0\uD638 \uC810\uC218",
      groupGeneral: "\uACF5\uD1B5 \uC815\uBCF4",
      groupHedging: "\uD5E4\uC9D5",
      dateColumn: "\uB0A0\uC9DC",
      assetAppliedDateColumn: "\uC790\uAE08 \uC801\uC6A9\uC77C",
      priceChangeColumn: "priceChange",
      returnPctColumn: "return %",
      bottomColumnLabel: "\uBC14\uB2E5",
      buyColumnLabel: "\uB9E4\uC218 \uC81C\uC548",
      buySignalsTitle: "\uB9E4\uC218 \uC9C0\uD45C",
      passLabel: "PASS",
      failLabel: "FAIL",
      assetValueColumn: "\uC790\uC0B0 \uAC00\uCE58",
      basisChangeColumn: "basisChange",
      spreadReturnColumn: "spreadReturn %",
      trackingError20Column: "trackingError20",
      signalScoreColumn: "signalScore",
      priceChangeSpreadColumn: "priceChange spread",
      runButton: "JSON \uB2E4\uC6B4\uB85C\uB4DC \uBC0F \uC800\uC7A5",
      pleaseEnterSymbol: "\uCD5C\uC18C \uD55C \uAC1C\uC758 \uC885\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694.",
      startEndRequired: "\uC2DC\uC791\uC77C\uACFC \uC885\uB8CC\uC77C\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.",
      startBeforeEnd: "\uC2DC\uC791\uC77C\uC740 \uC885\uB8CC\uC77C\uBCF4\uB2E4 \uBE60\uB974\uAC70\uB098 \uAC19\uC544\uC57C \uD569\uB2C8\uB2E4.",
      uiNotFound: "UI \uC694\uC18C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
      pipBrowserUnsupported: "\uC774 \uBE0C\uB77C\uC6B0\uC800\uB294 Document Picture-in-Picture \uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
      noMatchingJson: "data/ \uC5D0\uC11C \uC77C\uCE58\uD558\uB294 JSON \uD30C\uC77C\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      bearerRequired: "Bearer token \uC740 \uD544\uC218\uC785\uB2C8\uB2E4.",
      showDirPickerUnsupported: "showDirectoryPicker \uAC00 \uC9C0\uC6D0\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. Edge \uB610\uB294 Chrome \uC5D0\uC11C localhost \uB85C \uC5F4\uC5B4 \uC8FC\uC138\uC694.",
      selectDataFolder: "data \uD3F4\uB354 \uB610\uB294 \uD504\uB85C\uC81D\uD2B8 \uB8E8\uD2B8 \uD3F4\uB354\uB97C \uC120\uD0DD\uD558\uC138\uC694.",
      selectedFolderAlreadyData: "\uC120\uD0DD\uD55C \uD3F4\uB354\uAC00 \uC774\uBBF8 data \uC785\uB2C8\uB2E4. \uC5EC\uAE30\uC5D0 \uBC14\uB85C \uC800\uC7A5\uD569\uB2C8\uB2E4.",
      selectedFolderProjectRoot: "\uD504\uB85C\uC81D\uD2B8 \uB8E8\uD2B8\uB97C \uC120\uD0DD\uD588\uC2B5\uB2C8\uB2E4. data/ \uD558\uC704 \uD3F4\uB354\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.",
      loadingLocalTable: "\uB85C\uCEEC \uB370\uC774\uD130\uB97C \uC77D\uB294 \uC911...",
      loadingLocalSummary: "\uB85C\uCEEC \uB370\uC774\uD130\uB97C \uC77D\uB294 \uC911...",
      localDataNotFound: "\uC77C\uCE58\uD558\uB294 \uB85C\uCEEC \uB370\uC774\uD130\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      loadingRemoteTable: "\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911...",
      runningSummary: "\uC2E4\uD589 \uC911...",
      tryingLoadExisting: "data/ \uC5D0\uC11C \uAE30\uC874 JSON \uC744 \uC77D\uB294 \uC911 ...",
      noLocalDataSummary: "\uC544\uC9C1 \uB85C\uCEEC \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. '\uAE30\uC874 \uB370\uC774\uD130 \uC77D\uAE30'\uB97C \uB204\uB974\uAC70\uB098 \uC0C8\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
      noLocalDataTable: "\uC544\uC9C1 \uB85C\uCEEC \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
      autoLoadSkipped: "\uC790\uB3D9 \uB85C\uB4DC\uB97C \uAC74\uB108\uB700",
      failed: "\uC2E4\uD328.",
      done: "\uC644\uB8CC.",
      loadedExisting: "data/ \uC5D0\uC11C \uAE30\uC874 JSON \uC744 \uC77D\uC5C8\uC2B5\uB2C8\uB2E4.",
      savedToSelectedData: "\uC120\uD0DD\uD55C \uD3F4\uB354\uC758 data/ \uC5D0 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
      missingLabel: "\uB204\uB77D",
      rangeLabel: "\uBC94\uC704",
      rowsLabel: "\uD589",
      saveSettingsButton: "\uC124\uC815 \uC800\uC7A5",
      settingsSaved: "\uC124\uC815\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
      portfolioTitle: "\uD3EC\uD2B8\uD3F4\uB9AC\uC624",
      portfolioDesc: "\uC885\uBAA9, \uAC00\uACA9, \uC218\uB7C9 \uC785\uB825. \uD569\uACC4 \uC790\uB3D9 \uACC4\uC0B0.",
      portfolioColSymbol: "\uC885\uBAA9",
      portfolioColPrice: "\uAC00\uACA9",
      portfolioColQty: "\uC218\uB7C9",
      portfolioColTotal: "\uC6D0\uAE08 \uD569\uACC4",
      portfolioColActualCapital: "\uC2E4\uC81C \uC99D\uAC70\uAE08",
      portfolioColCurrentPrice: "\uD604\uC7AC\uAC00",
      portfolioColSellPrice: "\uB9E4\uB3C4\uAC00",
      portfolioColMarginPct: "Margin %",
      portfolioColPnL: "\uC190\uC775",
      portfolioColPnLPct: "\uC190\uC775 %",
      portfolioAddRow: "+ \uD589 \uCD94\uAC00",
      portfolioTotalLabel: "\uC6D0\uAE08 \uD569\uACC4:",
      portfolioCurrentLabel: "\uD604\uC7AC\uAC00 \uD569\uACC4:",
      portfolioPnLLabel: "\uC190\uC775:",
      portfolioMarginLabel: "Margin %",
      portfolioDebtLabel: "\uCD1D \uBD80\uCC44:",
      cashTitle: "\uD604\uAE08",
      cashDesc: "\uC785\uAE08/\uCD9C\uAE08, \uAE08\uC561, \uC124\uBA85 \uC785\uB825.",
      cashColType: "\uC720\uD615",
      cashColAmount: "\uAE08\uC561",
      cashColDesc: "\uC124\uBA85",
      cashColCreatedAt: "\uC0DD\uC131\uC77C\uC2DC",
      cashTypeDeposit: "\uC785\uAE08",
      cashTypeWithdrawal: "\uCD9C\uAE08",
      cashAddRow: "+ \uD589 \uCD94\uAC00",
      cashTotalLabel: "\uD604\uAE08 \uD569\uACC4:",
      derivativesSectionTitle: "\uD30C\uC0DD\uC0C1\uD488",
      derivativesSectionDesc: "\uD30C\uC0DD\uC0C1\uD488 \uC8FC\uBB38 \uC785\uB825: \uACC4\uC57D\uCF54\uB4DC, \uB871/\uC20F, \uC218\uB7C9, \uAC00\uACA9.",
      simDerivTabTitle: "\uD30C\uC0DD \uC2DC\uBBAC",
      simDerivTabDesc: "\uC9C4\uC785\xB7\uCCAD\uC0B0\xB7\uC218\uB7C9\uC744 \uC785\uB825\uD574 \uC190\uC775 \uD655\uC778(1\uD3EC\uC778\uD2B8=10\uB9CC). \uC2DC\uBBAC\uB9CC\u2014\uCD1D\uC790\uC0B0\xB7\uAC1C\uC694\uC5D0 \uBBF8\uD3EC\uD568.",
      simDerivColType: "\uBC29\uD5A5",
      simDerivColQty: "\uC218\uB7C9",
      simDerivColEntry: "\uC9C4\uC785\uAC00",
      simDerivColClose: "\uCCAD\uC0B0\uAC00",
      simDerivColPnL: "\uC190\uC775",
      simDerivAddRow: "+ \uD589 \uCD94\uAC00",
      simDerivClearBtn: "\uC2DC\uBBAC \uC0AD\uC81C",
      simDerivTotalPnLLabel: "\uD569\uACC4 \uC190\uC775(\uC2DC\uBBAC)",
      derivColSymbol: "\uACC4\uC57D",
      derivColType: "\uC720\uD615",
      derivColQty: "\uC218\uB7C9",
      derivColPrice: "\uC9C4\uC785\uAC00",
      derivColClosePrice: "\uCCAD\uC0B0\uAC00",
      derivColPnL: "\uC190\uC775",
      derivColDesc: "\uC124\uBA85",
      derivTypeLong: "\uB871",
      derivTypeShort: "\uC20F",
      derivativesAddRow: "+ \uD589 \uCD94\uAC00",
      derivativesTotalLabel: "\uC8FC\uBB38 \uD569\uACC4:",
      derivativesPnLLabel: "\uC190\uC775 \uD569\uACC4:",
      tabSearchPlaceholder: "\uC774 \uD0ED\uC5D0\uC11C \uAC80\uC0C9\u2026",
      tabSearchHint: "\uC785\uB825\uD558\uBA74 \uD589\uC744 \uD544\uD130\uD569\uB2C8\uB2E4. \uBE44\uC6B0\uBA74 \uC804\uCCB4 \uD45C\uC2DC.",
      tabSearchNoMatch: "\uC77C\uCE58\uD558\uB294 \uD589\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uAC80\uC0C9\uC5B4\uB97C \uC9C0\uC6B0\uBA74 \uB370\uC774\uD130\uAC00 \uB2E4\uC2DC \uBCF4\uC785\uB2C8\uB2E4."
    }
  };
  var tokenInput = document.querySelector("#token");
  var languageSelect = document.querySelector("#languageSelect");
  var symbolsInput = document.querySelector("#symbols");
  var startDateInput = document.querySelector("#startDate");
  var endDateInput = document.querySelector("#endDate");
  var notifyEnabledInput = document.querySelector("#notifyEnabled");
  var notifyOnHedgeChangeInput = document.querySelector("#notifyOnHedgeChange");
  var notifyOnBuySignalInput = document.querySelector("#notifyOnBuySignal");
  var telegramBotTokenInput = document.querySelector("#telegramBotToken");
  var telegramChatIdInput = document.querySelector("#telegramChatId");
  var discordWebhookUrlInput = document.querySelector("#discordWebhookUrl");
  var loadButton = document.querySelector("#loadButton");
  var saveSettingsButton = document.querySelector("#saveSettingsButton");
  var pipButton = document.querySelector("#pipButton");
  var suggestButton = document.querySelector("#suggestButton");
  var runButton = document.querySelector("#runButton");
  var suggestModal = document.querySelector("#suggestModal");
  var suggestModalTitle = document.querySelector("#suggestModalTitle");
  var suggestModalClose = document.querySelector("#suggestModalClose");
  var suggestModalStatus = document.querySelector("#suggestModalStatus");
  var suggestModalResults = document.querySelector("#suggestModalResults");
  var logElement = document.querySelector("#log");
  var summaryElement = document.querySelector("#summary");
  var mappingHeadElement = document.querySelector("#mappingHead");
  var mappingBodyElement = document.querySelector("#mappingBody");
  var hiddenColumnsBarElement = document.querySelector("#hiddenColumnsBar");
  var detailContentElement = document.querySelector("#detailContent");
  var appTitleElement = document.querySelector("#appTitle");
  var noteIntroElement = document.querySelector("#noteIntro");
  var noteUsageElement = document.querySelector("#noteUsage");
  var overviewVn30LabelElement = document.querySelector("#overviewVn30Label");
  var overviewVn30ValueElement = document.querySelector("#overviewVn30Value");
  var overviewVn30SubtextElement = document.querySelector("#overviewVn30Subtext");
  var overviewFuturesLabelElement = document.querySelector("#overviewFuturesLabel");
  var overviewFuturesValueElement = document.querySelector("#overviewFuturesValue");
  var overviewFuturesSubtextElement = document.querySelector("#overviewFuturesSubtext");
  var overviewTotalLabelElement = document.querySelector("#overviewTotalLabel");
  var overviewTotalValueElement = document.querySelector("#overviewTotalValue");
  var overviewTotalSubtextElement = document.querySelector("#overviewTotalSubtext");
  var overviewHeaderInitialAssetLabelElement = document.querySelector("#overviewHeaderInitialAssetLabel");
  var overviewHeaderInitialAssetValueElement = document.querySelector("#overviewHeaderInitialAssetValue");
  var overviewHeaderPnLLabelElement = document.querySelector("#overviewHeaderPnLLabel");
  var overviewHeaderPnLValueElement = document.querySelector("#overviewHeaderPnLValue");
  var overviewHeaderNetAssetLabelElement = document.querySelector("#overviewHeaderNetAssetLabel");
  var overviewHeaderNetAssetValueElement = document.querySelector("#overviewHeaderNetAssetValue");
  var tokenLabelElement = document.querySelector("#tokenLabel");
  var languageLabelElement = document.querySelector("#languageLabel");
  var symbolsLabelElement = document.querySelector("#symbolsLabel");
  var startDateLabelElement = document.querySelector("#startDateLabel");
  var endDateLabelElement = document.querySelector("#endDateLabel");
  var notifyEnabledLabelElement = document.querySelector("#notifyEnabledLabel");
  var notifyOnHedgeLabelElement = document.querySelector("#notifyOnHedgeLabel");
  var notifyOnBuyLabelElement = document.querySelector("#notifyOnBuyLabel");
  var portfolioBodyElement = document.querySelector("#portfolioBody");
  var portfolioAddRowButton = document.querySelector("#portfolioAddRow");
  var portfolioTotalValueElement = document.querySelector("#portfolioTotalValue");
  var portfolioCurrentValueElement = document.querySelector("#portfolioCurrentValue");
  var portfolioPnLValueElement = document.querySelector("#portfolioPnLValue");
  var portfolioSectionTitleElement = document.querySelector("#portfolioSectionTitle");
  var portfolioSectionDescElement = document.querySelector("#portfolioSectionDesc");
  var portfolioColSymbolElement = document.querySelector("#portfolioColSymbol");
  var portfolioColPriceElement = document.querySelector("#portfolioColPrice");
  var portfolioColQtyElement = document.querySelector("#portfolioColQty");
  var portfolioColTotalElement = document.querySelector("#portfolioColTotal");
  var portfolioColActualCapitalElement = document.querySelector("#portfolioColActualCapital");
  var portfolioColCurrentPriceElement = document.querySelector("#portfolioColCurrentPrice");
  var portfolioColSellPriceElement = document.querySelector("#portfolioColSellPrice");
  var portfolioColMarginPctElement = document.querySelector("#portfolioColMarginPct");
  var portfolioColPnLElement = document.querySelector("#portfolioColPnL");
  var portfolioColPnLPctElement = document.querySelector("#portfolioColPnLPct");
  var portfolioTotalLabelElement = document.querySelector("#portfolioTotalLabel");
  var portfolioCurrentLabelElement = document.querySelector("#portfolioCurrentLabel");
  var portfolioPnLLabelElement = document.querySelector("#portfolioPnLLabel");
  var portfolioDebtLabelElement = document.querySelector("#portfolioDebtLabel");
  var portfolioDebtValueElement = document.querySelector("#portfolioDebtValue");
  var cashBodyElement = document.querySelector("#cashBody");
  var cashAddRowButton = document.querySelector("#cashAddRow");
  var cashTotalValueElement = document.querySelector("#cashTotalValue");
  var cashSectionTitleElement = document.querySelector("#cashSectionTitle");
  var cashSectionDescElement = document.querySelector("#cashSectionDesc");
  var cashColTypeElement = document.querySelector("#cashColType");
  var cashColAmountElement = document.querySelector("#cashColAmount");
  var cashColDescElement = document.querySelector("#cashColDesc");
  var cashColCreatedAtElement = document.querySelector("#cashColCreatedAt");
  var cashTotalLabelElement = document.querySelector("#cashTotalLabel");
  var derivativesBodyElement = document.querySelector("#derivativesBody");
  var derivativesAddRowButton = document.querySelector("#derivativesAddRow");
  var derivativesTotalValueElement = document.querySelector("#derivativesTotalValue");
  var derivativesSectionTitleElement = document.querySelector("#derivativesSectionTitle");
  var derivativesSectionDescElement = document.querySelector("#derivativesSectionDesc");
  var derivColSymbolElement = document.querySelector("#derivColSymbol");
  var derivColTypeElement = document.querySelector("#derivColType");
  var derivColQtyElement = document.querySelector("#derivColQty");
  var derivColPriceElement = document.querySelector("#derivColPrice");
  var derivColClosePriceElement = document.querySelector("#derivColClosePrice");
  var derivColPnLElement = document.querySelector("#derivColPnL");
  var derivColDescElement = document.querySelector("#derivColDesc");
  var derivativesTotalLabelElement = document.querySelector("#derivativesTotalLabel");
  var derivativesPnLValueElement = document.querySelector("#derivativesPnLValue");
  var derivativesPnLLabelElement = document.querySelector("#derivativesPnLLabel");
  var simDerivativesSectionTitleElement = document.querySelector("#simDerivativesSectionTitle");
  var simDerivativesSectionDescElement = document.querySelector("#simDerivativesSectionDesc");
  var simDerivativesBodyElement = document.querySelector("#simDerivativesBody");
  var simDerivAddRowButton = document.querySelector("#simDerivAddRow");
  var simDerivClearButton = document.querySelector("#simDerivClearLog");
  var simDerivTotalPnLLabelElement = document.querySelector("#simDerivTotalPnLLabel");
  var simDerivTotalPnLValueElement = document.querySelector("#simDerivTotalPnLValue");
  var simDerivColTypeElement = document.querySelector("#simDerivColType");
  var simDerivColQtyElement = document.querySelector("#simDerivColQty");
  var simDerivColEntryElement = document.querySelector("#simDerivColEntry");
  var simDerivColCloseElement = document.querySelector("#simDerivColClose");
  var simDerivColPnLElement = document.querySelector("#simDerivColPnL");
  var portfolioTabSearchInput = document.querySelector("#portfolioTabSearch");
  var cashTabSearchInput = document.querySelector("#cashTabSearch");
  var overviewTabSearchInput = document.querySelector("#overviewTabSearch");
  var derivativesTabSearchInput = document.querySelector("#derivativesTabSearch");
  var portfolioTabSearchHintElement = document.querySelector("#portfolioTabSearchHint");
  var cashTabSearchHintElement = document.querySelector("#cashTabSearchHint");
  var derivativesTabSearchHintElement = document.querySelector("#derivativesTabSearchHint");
  var overviewTabSearchNoMatchElement = document.querySelector("#overviewTabSearchNoMatch");
  var detailPanelTitleElement = document.querySelector("#detailPanelTitle");
  var defaultSortState = { key: "date", direction: "desc" };
  var currentMappingData = {};
  var mappingSortState = { ...defaultSortState };
  var portfolioSortState = null;
  var cashSortState = null;
  var derivativesSortState = null;
  var currentDetailState = { date: null, symbol: null };
  var pipWindowRef = null;
  var pipRootElement = null;
  var hiddenMappingColumnKeys = /* @__PURE__ */ new Set();
  var pipHiddenSections = {
    metrics: false,
    reason: false,
    buySignals: false,
    cards: false
  };
  var pipHiddenSymbols = {};
  var lastPipHedgeState = null;
  var lastBuySuggestions = /* @__PURE__ */ new Set();
  var currentLanguage = "vi";
  var summaryBuilder = null;
  var saveSettingsTimer = null;
  var realtimeRefreshTimer = null;
  var realtimeRefreshInFlight = false;
  if (!tokenInput || !languageSelect || !symbolsInput || !startDateInput || !endDateInput || !loadButton || !pipButton || !suggestButton || !runButton || !logElement || !summaryElement || !mappingHeadElement || !mappingBodyElement || !hiddenColumnsBarElement || !detailContentElement || !appTitleElement || !noteIntroElement || !noteUsageElement || !overviewVn30LabelElement || !overviewVn30ValueElement || !overviewVn30SubtextElement || !overviewFuturesLabelElement || !overviewFuturesValueElement || !overviewFuturesSubtextElement || !overviewTotalLabelElement || !overviewTotalValueElement || !overviewTotalSubtextElement || !tokenLabelElement || !languageLabelElement || !symbolsLabelElement || !startDateLabelElement || !endDateLabelElement || !detailPanelTitleElement) {
    throw new Error(UI_TEXT.en.uiNotFound);
  }
  function appendLog(message) {
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB");
    logElement.textContent += `[${timestamp}] ${message}
`;
    logElement.scrollTop = logElement.scrollHeight;
  }
  function getPreferredLanguage() {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage === "vi" || storedLanguage === "ja" || storedLanguage === "en" || storedLanguage === "zh" || storedLanguage === "ko") {
      return storedLanguage;
    }
    return "vi";
  }
  function t(key) {
    return UI_TEXT[currentLanguage][key];
  }
  function setSummary(message) {
    summaryBuilder = () => message;
    summaryElement.textContent = message;
  }
  function setDynamicSummary(builder) {
    summaryBuilder = builder;
    summaryElement.textContent = builder();
  }
  function refreshSummary() {
    if (summaryBuilder) {
      summaryElement.textContent = summaryBuilder();
    }
  }
  function buildSymbolRangeLine(symbol, rows) {
    const firstDate = rows[0]?.date ?? "n/a";
    const lastDate = rows[rows.length - 1]?.date ?? "n/a";
    return `${symbol}: ${rows.length} ${t("rowsLabel")}, ${t("rangeLabel")} ${firstDate} -> ${lastDate}`;
  }
  function getPortfolioPositionsFromDOM() {
    if (!portfolioBodyElement) return [];
    const rows = portfolioBodyElement.querySelectorAll("tr[data-portfolio-row]");
    const result = [];
    for (const row of rows) {
      const symbolInput = row.querySelector(".portfolio-symbol");
      const priceInput = row.querySelector(".portfolio-price");
      const qtyInput = row.querySelector(".portfolio-qty");
      const sellPriceInput = row.querySelector(".portfolio-sell-price");
      const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
      const price = parseAssetInput(priceInput?.value ?? "") ?? 0;
      const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
      const sellPrice = sellPriceInput?.value ? parseAssetInput(sellPriceInput.value) ?? void 0 : void 0;
      const marginPct = parseMarginPct(row.querySelector(".portfolio-margin-pct")?.value ?? "");
      if (symbol || price > 0 || qty > 0) {
        result.push({ symbol: symbol || "-", price, quantity: qty, sellPrice, marginPct });
      }
    }
    return result;
  }
  function isoToDatetimeLocalValue(iso) {
    if (!iso || typeof iso !== "string") return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function datetimeLocalValueToIso(local) {
    const t2 = local.trim();
    if (!t2) return void 0;
    const d = new Date(t2);
    if (Number.isNaN(d.getTime())) return void 0;
    return d.toISOString();
  }
  function getCashTransactionsFromDOM() {
    if (!cashBodyElement) return [];
    const rows = cashBodyElement.querySelectorAll("tr[data-cash-row]");
    const result = [];
    for (const row of rows) {
      const typeSelect = row.querySelector(".cash-type");
      const amountInput = row.querySelector(".cash-amount");
      const descInput = row.querySelector(".cash-desc");
      const createdAtInput = row.querySelector(".cash-created-at");
      const type = typeSelect?.value ?? "deposit";
      const amount = parseAssetInput(amountInput?.value ?? "") ?? 0;
      const description = (descInput?.value ?? "").trim();
      const createdAtIso = datetimeLocalValueToIso(createdAtInput?.value ?? "");
      const hasCreatedAt = Boolean(createdAtInput?.value?.trim());
      if (amount > 0 || description || hasCreatedAt) {
        const tx = { type, amount, description: description || "-" };
        if (createdAtIso) tx.createdAt = createdAtIso;
        result.push(tx);
      }
    }
    return result;
  }
  function getDerivativesFromDOM() {
    if (!derivativesBodyElement) return [];
    const rows = derivativesBodyElement.querySelectorAll("tr[data-derivatives-row]");
    const result = [];
    for (const row of rows) {
      const symbolInput = row.querySelector(".derivatives-symbol");
      const typeSelect = row.querySelector(".derivatives-type");
      const qtyInput = row.querySelector(".derivatives-qty");
      const priceInput = row.querySelector(".derivatives-entry-price");
      const closePriceInput = row.querySelector(".derivatives-close-price");
      const descInput = row.querySelector(".derivatives-desc");
      const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
      const type = typeSelect?.value ?? "long";
      const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
      const entryPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
      const closePrice = closePriceInput?.value ? parseAssetInput(closePriceInput.value) ?? void 0 : void 0;
      const description = (descInput?.value ?? "").trim();
      if (symbol || qty > 0 || entryPrice > 0 || description) {
        result.push({ symbol, type, quantity: qty, entryPrice, closePrice, description: description || "-" });
      }
    }
    return result;
  }
  function getCurrentSettings() {
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
  function applySavedSettings(settings) {
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
    if (settings.language === "vi" || settings.language === "ja" || settings.language === "en" || settings.language === "zh" || settings.language === "ko") {
      currentLanguage = settings.language;
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, settings.language);
    }
  }
  async function saveSettingsToJsonFile() {
    const response = await fetch(APP_SETTINGS_API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getCurrentSettings())
    });
    if (!response.ok) {
      throw new Error(`Failed to save settings (${response.status}).`);
    }
  }
  function escapeTelegramHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function buildNotifyMessageLine(title, body) {
    const titleOne = title.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
    const bodyOne = body.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
    return `<b>${escapeTelegramHtml(titleOne)}</b>: ${escapeTelegramHtml(bodyOne)}`;
  }
  function getFuturesSymbolForNotify() {
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
  function buildDiscordExtraFuturesLine() {
    const sym = getFuturesSymbolForNotify();
    const price = getLatestCloseForDerivative(sym);
    if (price === null) return void 0;
    return `${sym}: ${formatDisplayNumber(price)}`;
  }
  async function sendNotification(title, body) {
    const settings = getCurrentSettings();
    if (!settings.notifyEnabled) return;
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "/favicon.ico" });
      } catch {
      }
    }
    const token = (settings.telegramBotToken ?? "").trim();
    const chatId = (settings.telegramChatId ?? "").trim();
    const discordUrl = (settings.discordWebhookUrl ?? "").trim();
    if (token && chatId || discordUrl) {
      try {
        const discordExtra = buildDiscordExtraFuturesLine();
        await fetch(NOTIFY_API_PATH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: buildNotifyMessageLine(title, body),
            ...discordExtra ? { discordExtra } : {}
          })
        });
      } catch {
      }
    }
  }
  async function ensureNotificationPermission() {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }
  function scheduleSaveSettings() {
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
  async function loadSavedSettings() {
    const response = await fetch(APP_SETTINGS_API_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load settings (${response.status}).`);
    }
    const settings = await response.json();
    applySavedSettings(settings);
  }
  function parseAssetInput(rawValue) {
    const digitsOnly = rawValue.replace(/\D/g, "");
    if (!digitsOnly) {
      return null;
    }
    const parsedValue = Number(digitsOnly);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }
  function parseSortableNumber(raw) {
    const s = String(raw ?? "").trim();
    const neg = s.startsWith("-");
    const digits = s.replace(/\D/g, "");
    const n = digits ? Number(digits) : 0;
    return neg ? -n : n;
  }
  function parseMarginPct(rawValue) {
    const cleaned = rawValue.replace(",", ".").trim();
    if (!cleaned) return void 0;
    const n = Number(cleaned);
    if (!Number.isFinite(n) || n < 0 || n > 100) return void 0;
    return n;
  }
  function formatAssetInput(value) {
    if (value === null || value <= 0) {
      return "";
    }
    return value.toLocaleString("vi-VN");
  }
  function formatAssetValue(value) {
    if (value === null || value === void 0 || Number.isNaN(Number(value))) {
      return "";
    }
    return Number(value).toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
  function renderPortfolioRows(positions) {
    if (!portfolioBodyElement) return;
    const rows = positions.length > 0 ? positions : [{ symbol: "", price: 0, quantity: 0 }];
    portfolioBodyElement.innerHTML = rows.map(
      (pos) => `
    <tr data-portfolio-row>
      <td><input class="portfolio-symbol" type="text" placeholder="NVL" value="${escapeHtml(pos.symbol)}" data-portfolio-field /></td>
      <td><input class="portfolio-price" type="text" inputmode="numeric" placeholder="50.000" value="${pos.price > 0 ? formatAssetInput(pos.price) : ""}" data-portfolio-field /></td>
      <td><input class="portfolio-qty" type="text" inputmode="numeric" placeholder="100" value="${pos.quantity > 0 ? String(pos.quantity) : ""}" data-portfolio-field /></td>
      <td class="portfolio-total-cell"><span class="portfolio-row-total">${pos.price > 0 && pos.quantity > 0 ? formatAssetValue(pos.price * pos.quantity) : ""}</span></td>
      <td class="portfolio-actual-capital-cell"><span class="portfolio-row-actual-capital">${pos.price > 0 && pos.quantity > 0 ? formatAssetValue(pos.marginPct === void 0 ? pos.price * pos.quantity : pos.price * pos.quantity * (pos.marginPct / 100)) : ""}</span></td>
      <td><span class="portfolio-row-current"></span></td>
      <td><input class="portfolio-sell-price" type="text" inputmode="numeric" placeholder="" value="${pos.sellPrice && pos.sellPrice > 0 ? formatAssetInput(pos.sellPrice) : ""}" data-portfolio-field /></td>
      <td><input class="portfolio-margin-pct" type="text" inputmode="numeric" placeholder="0" value="${pos.marginPct !== void 0 && pos.marginPct > 0 ? String(pos.marginPct) : ""}" data-portfolio-field style="width:50px;text-align:right" /></td>
      <td><span class="portfolio-row-pnl"></span></td>
      <td><span class="portfolio-row-pnlpct"></span></td>
      <td><button type="button" class="portfolio-del-btn secondary-button" data-portfolio-remove>\xD7</button></td>
    </tr>`
    ).join("");
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
  function refreshPortfolioRowActualCapital(row) {
    if (!row) return;
    const priceInput = row.querySelector(".portfolio-price");
    const qtyInput = row.querySelector(".portfolio-qty");
    const marginPctInput = row.querySelector(".portfolio-margin-pct");
    const span = row.querySelector(".portfolio-row-actual-capital");
    if (!span) return;
    const price = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const marginPct = parseMarginPct(marginPctInput?.value ?? "");
    const total = price > 0 && qty > 0 ? price * qty : 0;
    if (total <= 0) {
      span.textContent = "";
      return;
    }
    if (marginPct === void 0) {
      span.textContent = formatAssetValue(total);
    } else {
      span.textContent = formatAssetValue(total * (marginPct / 100));
    }
  }
  function refreshPortfolioRowTotal(row) {
    if (!row) return;
    const priceInput = row.querySelector(".portfolio-price");
    const qtyInput = row.querySelector(".portfolio-qty");
    const totalSpan = row.querySelector(".portfolio-row-total");
    if (!totalSpan) return;
    const price = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    totalSpan.textContent = price > 0 && qty > 0 ? formatAssetValue(price * qty) : "";
    refreshPortfolioRowActualCapital(row);
    refreshPortfolioRowPnL(row);
  }
  function refreshPortfolioRowPnL(row) {
    const symbolInput = row.querySelector(".portfolio-symbol");
    const priceInput = row.querySelector(".portfolio-price");
    const qtyInput = row.querySelector(".portfolio-qty");
    const sellPriceInput = row.querySelector(".portfolio-sell-price");
    const currentSpan = row.querySelector(".portfolio-row-current");
    const pnlSpan = row.querySelector(".portfolio-row-pnl");
    const pnlPctSpan = row.querySelector(".portfolio-row-pnlpct");
    if (!currentSpan || !pnlSpan || !pnlPctSpan) return;
    const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
    const costPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
    const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
    const sellPrice = sellPriceInput?.value ? parseAssetInput(sellPriceInput.value) ?? void 0 : void 0;
    const tr = row instanceof HTMLTableRowElement ? row : row.closest("tr");
    tr?.classList.remove("portfolio-row-profit", "portfolio-row-loss");
    if (!symbol || costPrice <= 0 || qty <= 0) {
      currentSpan.textContent = "";
      pnlSpan.textContent = "";
      pnlPctSpan.textContent = "";
      return;
    }
    const currentPrice = getLatestCloseForSymbol(symbol);
    const priceForPnL = sellPrice !== void 0 && sellPrice > 0 ? sellPrice : currentPrice ?? null;
    if (priceForPnL === null) {
      currentSpan.textContent = "-";
      pnlSpan.textContent = "-";
      pnlPctSpan.textContent = "-";
      return;
    }
    const cost = costPrice * qty;
    const pnl = (priceForPnL - costPrice) * qty;
    const pnlPct = cost > 0 ? pnl / cost * 100 : null;
    currentSpan.textContent = currentPrice !== null ? formatAssetValue(currentPrice) : "-";
    pnlSpan.textContent = formatAssetValue(pnl);
    pnlSpan.className = pnl > 0 ? "positive" : pnl < 0 ? "negative" : "";
    pnlPctSpan.textContent = pnlPct !== null ? `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%` : "";
    pnlPctSpan.className = (pnlPct ?? 0) > 0 ? "positive" : (pnlPct ?? 0) < 0 ? "negative" : "";
    if (pnl > 0) tr?.classList.add("portfolio-row-profit");
    else if (pnl < 0) tr?.classList.add("portfolio-row-loss");
  }
  function refreshPortfolioTotal() {
    applyPortfolioTabSearch();
    let totalCost = 0;
    let totalCurrent = 0;
    portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => {
      if (row.classList.contains("hidden-by-tab-search")) return;
      const symbolInput = row.querySelector(".portfolio-symbol");
      const priceInput = row.querySelector(".portfolio-price");
      const qtyInput = row.querySelector(".portfolio-qty");
      const sellPriceInput = row.querySelector(".portfolio-sell-price");
      const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
      const costPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
      const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
      const sellPrice = sellPriceInput?.value ? parseAssetInput(sellPriceInput.value) ?? void 0 : void 0;
      if (costPrice > 0 && qty > 0) {
        totalCost += costPrice * qty;
        const priceForValue = sellPrice !== void 0 && sellPrice > 0 ? sellPrice : symbol ? getLatestCloseForSymbol(symbol) : null;
        totalCurrent += priceForValue !== null ? priceForValue * qty : 0;
      }
    });
    const totalPnL = totalCurrent - totalCost;
    const totalPnLPct = totalCost > 0 ? totalPnL / totalCost * 100 : null;
    let totalDebt = 0;
    portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => {
      if (row.classList.contains("hidden-by-tab-search")) return;
      const symbolInput = row.querySelector(".portfolio-symbol");
      const priceInput = row.querySelector(".portfolio-price");
      const qtyInput = row.querySelector(".portfolio-qty");
      const sellPriceInput = row.querySelector(".portfolio-sell-price");
      const marginPctInput = row.querySelector(".portfolio-margin-pct");
      const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
      const costPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
      const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
      const sellPrice = sellPriceInput?.value ? parseAssetInput(sellPriceInput.value) ?? void 0 : void 0;
      const marginPct = parseMarginPct(marginPctInput?.value ?? "");
      if (costPrice > 0 && qty > 0 && marginPct !== void 0) {
        const priceForValue = sellPrice !== void 0 && sellPrice > 0 ? sellPrice : symbol ? getLatestCloseForSymbol(symbol) : null;
        const rowValue = priceForValue !== null ? priceForValue * qty : 0;
        totalDebt += rowValue * (marginPct / 100);
      }
    });
    if (portfolioTotalValueElement) portfolioTotalValueElement.textContent = formatAssetValue(totalCost);
    if (portfolioCurrentValueElement)
      portfolioCurrentValueElement.textContent = totalCost > 0 && totalCurrent === 0 ? "-" : formatAssetValue(totalCurrent || totalCost);
    if (portfolioDebtValueElement) portfolioDebtValueElement.textContent = formatAssetValue(totalDebt);
    if (portfolioPnLValueElement) {
      if (totalCost > 0 && totalCurrent === 0) {
        portfolioPnLValueElement.textContent = "-";
        portfolioPnLValueElement.className = "";
      } else if (totalCost > 0) {
        portfolioPnLValueElement.textContent = `${formatAssetValue(totalPnL)}${totalPnLPct !== null ? ` (${totalPnLPct >= 0 ? "+" : ""}${totalPnLPct.toFixed(2)}%)` : ""}`;
        portfolioPnLValueElement.className = totalPnL > 0 ? "positive" : totalPnL < 0 ? "negative" : "";
      } else {
        portfolioPnLValueElement.textContent = formatAssetValue(0);
        portfolioPnLValueElement.className = "";
      }
    }
    refreshOverviewHeader();
  }
  function renderCashRows(transactions) {
    if (!cashBodyElement) return;
    const rows = transactions.length > 0 ? transactions : [{ type: "deposit", amount: 0, description: "" }];
    cashBodyElement.innerHTML = rows.map(
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
      <td><button type="button" class="cash-del-btn secondary-button" data-cash-remove>\xD7</button></td>
    </tr>`
    ).join("");
    cashBodyElement.querySelectorAll("[data-cash-field]").forEach((el) => {
      el.addEventListener("input", () => {
        const row = el.closest("tr[data-cash-row]");
        const typeSelect = row?.querySelector(".cash-type");
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
        const row = sel.closest("tr[data-cash-row]");
        const typeSelect = row?.querySelector(".cash-type");
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
  function refreshCashTotal() {
    let total = 0;
    cashBodyElement?.querySelectorAll("tr[data-cash-row]").forEach((row) => {
      const typeSelect = row.querySelector(".cash-type");
      const amountInput = row.querySelector(".cash-amount");
      const type = typeSelect?.value ?? "deposit";
      const amount = parseAssetInput(amountInput?.value ?? "") ?? 0;
      total += type === "deposit" ? amount : -amount;
    });
    if (cashTotalValueElement) cashTotalValueElement.textContent = formatAssetValue(total);
    refreshOverviewHeader();
    applyCashTabSearch();
  }
  function renderDerivativesRows(orders) {
    if (!derivativesBodyElement) return;
    const rows = orders.length > 0 ? orders : [{ symbol: "", type: "long", quantity: 0, entryPrice: 0, closePrice: void 0, description: "" }];
    derivativesBodyElement.innerHTML = rows.map(
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
      <td><input class="derivatives-close-price" type="text" inputmode="numeric" placeholder="1.260" value="${o.closePrice !== void 0 && o.closePrice > 0 ? formatAssetInput(o.closePrice) : ""}" data-derivatives-field /></td>
      <td><span class="derivatives-pnl-value"></span></td>
      <td><input class="derivatives-desc" type="text" placeholder="${escapeHtml(t("derivColDesc"))}" value="${escapeHtml(o.description || "")}" data-derivatives-field /></td>
      <td><button type="button" class="derivatives-del-btn secondary-button" data-derivatives-remove>\xD7</button></td>
    </tr>`
    ).join("");
    derivativesBodyElement.querySelectorAll("[data-derivatives-field]").forEach((el) => {
      el.addEventListener("input", () => {
        const row = el.closest("tr[data-derivatives-row]");
        const typeSelect = row?.querySelector(".derivatives-type");
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
        const row = sel.closest("tr[data-derivatives-row]");
        const typeSelect = row?.querySelector(".derivatives-type");
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
  function refreshDerivativesTotal() {
    let totalPnL = 0;
    derivativesBodyElement?.querySelectorAll("tr[data-derivatives-row]").forEach((row) => {
      const symbolInput = row.querySelector(".derivatives-symbol");
      const typeSelect = row.querySelector(".derivatives-type");
      const qtyInput = row.querySelector(".derivatives-qty");
      const priceInput = row.querySelector(".derivatives-entry-price");
      const closePriceInput = row.querySelector(".derivatives-close-price");
      const pnlSpan = row.querySelector(".derivatives-pnl-value");
      const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
      const type = typeSelect?.value ?? "long";
      const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
      const entryPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
      const closePriceRaw = closePriceInput?.value ? parseAssetInput(closePriceInput.value) ?? void 0 : void 0;
      const closePrice = closePriceRaw !== void 0 && closePriceRaw > 0 ? closePriceRaw : symbol ? getLatestCloseForDerivative(symbol) : null;
      let pnl = null;
      if (entryPrice > 0 && qty > 0 && closePrice !== null) {
        const pointDiff = type === "long" ? closePrice - entryPrice : entryPrice - closePrice;
        pnl = pointDiff * qty * FUTURES_POINT_VALUE;
        totalPnL += pnl;
      }
      if (pnlSpan) {
        pnlSpan.textContent = pnl !== null ? `${pnl >= 0 ? "+" : ""}${formatAssetValue(pnl)}` : "-";
        pnlSpan.className = `derivatives-pnl-value ${pnl !== null ? pnl > 0 ? "positive" : pnl < 0 ? "negative" : "" : ""}`.trim();
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
  function getTableRowSearchText(row) {
    const parts = [row.textContent ?? ""];
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
  function applyPortfolioTabSearch() {
    if (!portfolioBodyElement) return;
    const q = (portfolioTabSearchInput?.value ?? "").trim().toLowerCase();
    portfolioBodyElement.querySelectorAll("tr.tab-search-no-match").forEach((el) => el.remove());
    const rows = portfolioBodyElement.querySelectorAll("tr[data-portfolio-row]");
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
  function applyCashTabSearch() {
    if (!cashBodyElement) return;
    const q = (cashTabSearchInput?.value ?? "").trim().toLowerCase();
    cashBodyElement.querySelectorAll("tr.tab-search-no-match").forEach((el) => el.remove());
    const rows = cashBodyElement.querySelectorAll("tr[data-cash-row]");
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
  function applyOverviewTabSearch() {
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
  function applyDerivativesTabSearch() {
    if (!derivativesBodyElement) return;
    const q = (derivativesTabSearchInput?.value ?? "").trim().toLowerCase();
    derivativesBodyElement.querySelectorAll("tr.tab-search-no-match").forEach((el) => el.remove());
    const rows = derivativesBodyElement.querySelectorAll("tr[data-derivatives-row]");
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
  function refreshOverviewHeader() {
    let portfolioCost = 0;
    let portfolioCurrent = 0;
    let cashTotal = 0;
    portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => {
      const symbolInput = row.querySelector(".portfolio-symbol");
      const priceInput = row.querySelector(".portfolio-price");
      const qtyInput = row.querySelector(".portfolio-qty");
      const sellPriceInput = row.querySelector(".portfolio-sell-price");
      const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
      const costPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
      const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
      const sellPrice = sellPriceInput?.value ? parseAssetInput(sellPriceInput.value) ?? void 0 : void 0;
      if (costPrice > 0 && qty > 0) {
        portfolioCost += costPrice * qty;
        const priceForValue = sellPrice !== void 0 && sellPrice > 0 ? sellPrice : symbol ? getLatestCloseForSymbol(symbol) : null;
        portfolioCurrent += priceForValue !== null ? priceForValue * qty : 0;
      }
    });
    cashBodyElement?.querySelectorAll("tr[data-cash-row]").forEach((row) => {
      const typeSelect = row.querySelector(".cash-type");
      const amountInput = row.querySelector(".cash-amount");
      const type = typeSelect?.value ?? "deposit";
      const amount = parseAssetInput(amountInput?.value ?? "") ?? 0;
      cashTotal += type === "deposit" ? amount : -amount;
    });
    let totalDebt = 0;
    portfolioBodyElement?.querySelectorAll("tr[data-portfolio-row]").forEach((row) => {
      const symbolInput = row.querySelector(".portfolio-symbol");
      const priceInput = row.querySelector(".portfolio-price");
      const qtyInput = row.querySelector(".portfolio-qty");
      const sellPriceInput = row.querySelector(".portfolio-sell-price");
      const marginPctInput = row.querySelector(".portfolio-margin-pct");
      const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
      const costPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
      const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
      const sellPrice = sellPriceInput?.value ? parseAssetInput(sellPriceInput.value) ?? void 0 : void 0;
      const marginPct = parseMarginPct(marginPctInput?.value ?? "");
      if (costPrice > 0 && qty > 0 && marginPct !== void 0) {
        const priceForValue = sellPrice !== void 0 && sellPrice > 0 ? sellPrice : symbol ? getLatestCloseForSymbol(symbol) : null;
        const rowValue = priceForValue !== null ? priceForValue * qty : 0;
        totalDebt += rowValue * (marginPct / 100);
      }
    });
    let derivativesPnL = 0;
    derivativesBodyElement?.querySelectorAll("tr[data-derivatives-row]").forEach((row) => {
      const symbolInput = row.querySelector(".derivatives-symbol");
      const typeSelect = row.querySelector(".derivatives-type");
      const qtyInput = row.querySelector(".derivatives-qty");
      const priceInput = row.querySelector(".derivatives-entry-price");
      const closePriceInput = row.querySelector(".derivatives-close-price");
      const symbol = (symbolInput?.value ?? "").trim().toUpperCase();
      const type = typeSelect?.value ?? "long";
      const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
      const entryPrice = parseAssetInput(priceInput?.value ?? "") ?? 0;
      const closePriceRaw = closePriceInput?.value ? parseAssetInput(closePriceInput.value) ?? void 0 : void 0;
      const closePrice = closePriceRaw !== void 0 && closePriceRaw > 0 ? closePriceRaw : symbol ? getLatestCloseForDerivative(symbol) : null;
      if (entryPrice > 0 && qty > 0 && closePrice !== null) {
        const pointDiff = type === "long" ? closePrice - entryPrice : entryPrice - closePrice;
        derivativesPnL += pointDiff * qty * FUTURES_POINT_VALUE;
      }
    });
    const pnl = portfolioCurrent - portfolioCost + derivativesPnL;
    const netAsset = portfolioCurrent + cashTotal - totalDebt + derivativesPnL;
    if (overviewHeaderInitialAssetLabelElement) overviewHeaderInitialAssetLabelElement.textContent = t("overviewHeaderInitialAssetLabel");
    if (overviewHeaderInitialAssetValueElement) {
      overviewHeaderInitialAssetValueElement.textContent = portfolioCost > 0 || cashTotal !== 0 ? formatAssetValue(netAsset - pnl) : "-";
    }
    if (overviewHeaderPnLLabelElement) overviewHeaderPnLLabelElement.textContent = t("overviewHeaderPnLLabel");
    if (overviewHeaderNetAssetLabelElement) overviewHeaderNetAssetLabelElement.textContent = t("overviewHeaderNetAssetLabel");
    if (overviewHeaderPnLValueElement) {
      overviewHeaderPnLValueElement.textContent = portfolioCost > 0 && portfolioCurrent === 0 ? "-" : `${pnl >= 0 ? "+" : ""}${formatAssetValue(pnl)}`;
      overviewHeaderPnLValueElement.className = `overview-header-value ${getValueClass(pnl)}`.trim();
    }
    if (overviewHeaderNetAssetValueElement) {
      overviewHeaderNetAssetValueElement.textContent = portfolioCost > 0 && portfolioCurrent === 0 && cashTotal === 0 ? "-" : formatAssetValue(netAsset);
      overviewHeaderNetAssetValueElement.className = "overview-header-value";
    }
  }
  function getComparisonClass(currentValue, baseValue) {
    if (currentValue === null || baseValue === null || currentValue === baseValue) {
      return "";
    }
    return currentValue > baseValue ? "positive" : "negative";
  }
  function renderOverview() {
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
    const totalBaseAsset = (configuredAssets.VN30 ?? 0) + FUTURES_MARGIN_PER_CONTRACT;
    const vn30Value = toNumberOrNull(latestRow?.VN30AssetValue);
    const vn30f1mValue = toNumberOrNull(latestRow?.VN30F1MAssetValue);
    const totalAsset = vn30Value === null && vn30f1mValue === null ? null : (vn30Value ?? 0) + (vn30f1mValue ?? 0);
    const totalPnL = totalAsset === null ? null : totalAsset - totalBaseAsset;
    const futuresBaseMargin = configuredAssets.VN30F1M ?? null;
    const futuresPnL = futuresBaseMargin === null ? null : rows.reduce((sum, row) => {
      const futuresRowValue = toNumberOrNull(row.VN30F1MAssetValue);
      return futuresRowValue === null ? sum : sum + (futuresRowValue - futuresBaseMargin);
    }, 0);
    const appliedDate = String(latestRow?.assetAppliedDate ?? latestRow?.date ?? "");
    overviewVn30ValueElement.textContent = vn30Value === null ? "-" : formatAssetValue(vn30Value);
    overviewVn30ValueElement.className = `overview-value ${getComparisonClass(vn30Value, vn30BaseAsset)}`.trim();
    overviewVn30SubtextElement.textContent = appliedDate ? `${t("overviewBaseDateLabel")}: ${appliedDate}` : t("overviewNoData");
    overviewFuturesValueElement.textContent = futuresPnL === null ? "-" : `${futuresPnL > 0 ? "+" : ""}${formatAssetValue(futuresPnL)}`;
    overviewFuturesValueElement.className = `overview-value ${getValueClass(futuresPnL)}`.trim();
    overviewFuturesSubtextElement.textContent = appliedDate ? `${t("overviewBaseDateLabel")}: ${appliedDate}` : t("overviewNoData");
    overviewTotalValueElement.textContent = totalAsset === null ? "-" : `${formatAssetValue(totalAsset)}${totalPnL === null ? "" : ` (${totalPnL > 0 ? "+" : ""}${formatAssetValue(totalPnL)})`}`;
    overviewTotalValueElement.className = `overview-value ${getComparisonClass(totalAsset, totalBaseAsset)}`.trim();
    overviewTotalSubtextElement.textContent = appliedDate ? `${t("overviewBaseDateLabel")}: ${appliedDate}` : t("overviewNoData");
    applyOverviewTabSearch();
  }
  function getConfiguredAssetInputs() {
    const vn30Input = document.querySelector("#vn30Asset");
    const vn30f1mInput = document.querySelector("#vn30f1mAsset");
    return {
      VN30: vn30Input ? parseAssetInput(vn30Input.value) : null,
      VN30F1M: vn30f1mInput ? parseAssetInput(vn30f1mInput.value) : null
    };
  }
  function getTodayDateString() {
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function mergeLatestQuoteIntoRows(existingRows, latestQuote) {
    const filteredRows = existingRows.filter((row) => String(row.date).slice(0, 10) !== String(latestQuote.date).slice(0, 10));
    return normalizeQuotes([...filteredRows, latestQuote]);
  }
  function refreshDataViews() {
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
  function formatAssetInputs() {
    const vn30Input = document.querySelector("#vn30Asset");
    const vn30f1mInput = document.querySelector("#vn30f1mAsset");
    if (vn30Input) vn30Input.value = formatAssetInput(parseAssetInput(vn30Input.value));
    if (vn30f1mInput) vn30f1mInput.value = formatAssetInput(parseAssetInput(vn30f1mInput.value));
  }
  function calculateSimpleFuturesAssetValue(baseMargin, priceChange) {
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
  function isMappingColumnVisible(column) {
    return column.key === "date" || !hiddenMappingColumnKeys.has(column.key);
  }
  function renderHiddenColumnsBar(columns) {
    const hiddenColumns = columns.filter((column) => column.key !== "date" && hiddenMappingColumnKeys.has(column.key));
    if (hiddenColumns.length === 0) {
      hiddenColumnsBarElement.innerHTML = "";
      return;
    }
    const chips = hiddenColumns.map(
      (column) => `<span class="hidden-column-chip">${escapeHtml(column.label)} <button type="button" data-restore-column="${escapeHtml(
        column.key
      )}" title="${escapeHtml(t("restoreColumns"))}">+</button></span>`
    ).join("");
    hiddenColumnsBarElement.innerHTML = `<span class="hidden-columns-label">${escapeHtml(
      t("hiddenColumnsLabel")
    )}</span>${chips}<button type="button" class="restore-columns-button" data-restore-all-columns="true">${escapeHtml(
      t("restoreColumns")
    )}</button>`;
  }
  function applyStaticTranslations() {
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
  function updateLanguage(language) {
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
  function supportsDocumentPictureInPicture() {
    return "documentPictureInPicture" in window;
  }
  function syncPipButtonLabel() {
    if (!supportsDocumentPictureInPicture()) {
      pipButton.disabled = true;
      pipButton.textContent = t("pipUnsupported");
      return;
    }
    pipButton.disabled = false;
    pipButton.textContent = pipWindowRef && !pipWindowRef.closed ? t("pipButtonClose") : t("pipButtonOpen");
  }
  function resetMappingView(message) {
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
  function resetPictureInPictureVisibility() {
    pipHiddenSections = {
      metrics: false,
      reason: false,
      buySignals: false,
      cards: false
    };
    pipHiddenSymbols = {};
  }
  function setSortableLabel(el, text) {
    if (!el) return;
    const label = el.querySelector(".sortable-label");
    if (label) label.textContent = text;
    else el.textContent = text;
  }
  function getPortfolioRowSortValue(row, col) {
    const cells = row.querySelectorAll("td");
    const cell = cells[col];
    if (!cell) return "";
    const input = cell.querySelector("input");
    const span = cell.querySelector("span");
    const val = input ? input.value : span ? span.textContent ?? "" : cell.textContent ?? "";
    if (col === 0) return String(val).trim().toUpperCase();
    return parseSortableNumber(val);
  }
  function getCashRowSortValue(row, col) {
    const cells = row.querySelectorAll("td");
    const cell = cells[col];
    if (!cell) return "";
    const input = cell.querySelector("input");
    const select = cell.querySelector("select");
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
  function getDerivativesRowSortValue(row, col) {
    const cells = row.querySelectorAll("td");
    const cell = cells[col];
    if (!cell) return "";
    const input = cell.querySelector("input");
    const select = cell.querySelector("select");
    const span = cell.querySelector("span");
    const val = select ? select.value : input ? input.value : span ? span.textContent ?? "" : cell.textContent ?? "";
    if (col === 0 || col === 6) return String(val).trim();
    if (col === 1) return String(val);
    return parseSortableNumber(val);
  }
  function sortAndReorderRows(tbody, rowSelector, getSortValue, col, direction) {
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll(rowSelector));
    if (rows.length <= 1) return;
    const mult = direction === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      const va = getSortValue(a, col);
      const vb = getSortValue(b, col);
      const cmp = typeof va === "string" && typeof vb === "string" ? va.localeCompare(vb, void 0, { numeric: true }) : typeof va === "number" && typeof vb === "number" ? va < vb ? -1 : va > vb ? 1 : 0 : String(va).localeCompare(String(vb));
      return mult * cmp;
    });
    rows.forEach((r) => tbody.appendChild(r));
  }
  function updateTabSortIndicators(tableId, sortState) {
    const table = document.getElementById(tableId);
    if (!table) return;
    table.querySelectorAll(".sortable-th").forEach((th) => {
      const indicator = th.querySelector(".sort-indicator-small");
      const colStr = th.dataset.sortCol;
      const col = colStr !== void 0 ? parseInt(colStr, 10) : -1;
      if (indicator && sortState && sortState.col === col) {
        indicator.textContent = sortState.direction === "asc" ? " \u25B2" : " \u25BC";
        indicator.className = "sort-indicator-small active";
      } else if (indicator) {
        indicator.textContent = "";
        indicator.className = "sort-indicator-small";
      }
    });
  }
  function handleTabSortClick(ev, tableId, tbody, rowSelector, getSortValue) {
    const th = ev.target?.closest?.(".sortable-th");
    if (!th) return;
    const colStr = th.getAttribute("data-sort-col");
    if (colStr === null || colStr === void 0) return;
    const col = parseInt(colStr, 10);
    if (Number.isNaN(col)) return;
    const state = tableId === "portfolioTable" ? portfolioSortState : tableId === "cashTable" ? cashSortState : derivativesSortState;
    const nextDir = state && state.col === col ? state.direction === "asc" ? "desc" : "asc" : "asc";
    const newState = { col, direction: nextDir };
    if (tableId === "portfolioTable") portfolioSortState = newState;
    else if (tableId === "cashTable") cashSortState = newState;
    else derivativesSortState = newState;
    sortAndReorderRows(tbody, rowSelector, getSortValue, col, nextDir);
    updateTabSortIndicators(tableId, newState);
  }
  function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function normalizeToken(rawToken) {
    return rawToken.replace(/^Bearer\s+/i, "").trim();
  }
  function toNumberOrNull(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }
  function formatPercent(value) {
    if (value === null || value === void 0 || Number.isNaN(Number(value))) {
      return "";
    }
    return `${Number(value).toFixed(2)}%`;
  }
  function formatSignalLabel(value) {
    if (typeof value !== "string") {
      return "";
    }
    const labelsByLanguage = {
      vi: {
        "No hedge": "Kh\xF4ng hedge",
        Watch: "Theo d\xF5i",
        "Hedge on": "\u0110ang hedge",
        "Stop hedge": "D\u1EEBng hedge",
        "Basis risk": "R\u1EE7i ro basis",
        Short: "Short",
        Hold: "Gi\u1EEF hedge",
        Stop: "D\u1EEBng short",
        "No action": "Kh\xF4ng h\xE0nh \u0111\u1ED9ng"
      },
      ja: {
        "No hedge": "\u30D8\u30C3\u30B8\u306A\u3057",
        Watch: "\u76E3\u8996",
        "Hedge on": "\u30D8\u30C3\u30B8\u4E2D",
        "Stop hedge": "\u30D8\u30C3\u30B8\u505C\u6B62",
        "Basis risk": "Basis \u30EA\u30B9\u30AF",
        Short: "\u30B7\u30E7\u30FC\u30C8",
        Hold: "\u30D8\u30C3\u30B8\u7DAD\u6301",
        Stop: "\u30B7\u30E7\u30FC\u30C8\u505C\u6B62",
        "No action": "\u30A2\u30AF\u30B7\u30E7\u30F3\u306A\u3057"
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
        "No hedge": "\u65E0\u5BF9\u51B2",
        Watch: "\u89C2\u5BDF",
        "Hedge on": "\u5BF9\u51B2\u4E2D",
        "Stop hedge": "\u505C\u6B62\u5BF9\u51B2",
        "Basis risk": "Basis \u98CE\u9669",
        Short: "\u505A\u7A7A",
        Hold: "\u7EF4\u6301\u5BF9\u51B2",
        Stop: "\u505C\u6B62\u505A\u7A7A",
        "No action": "\u65E0\u64CD\u4F5C"
      },
      ko: {
        "No hedge": "\uD5E4\uC9C0 \uC5C6\uC74C",
        Watch: "\uAD00\uCC30",
        "Hedge on": "\uD5E4\uC9C0 \uC911",
        "Stop hedge": "\uD5E4\uC9C0 \uC911\uB2E8",
        "Basis risk": "Basis \uB9AC\uC2A4\uD06C",
        Short: "\uC20F",
        Hold: "\uD5E4\uC9C0 \uC720\uC9C0",
        Stop: "\uC20F \uC911\uB2E8",
        "No action": "\uC870\uCE58 \uC5C6\uC74C"
      }
    };
    return labelsByLanguage[currentLanguage][value] ?? value;
  }
  function formatSignalReason(value) {
    if (typeof value !== "string" || value.trim() === "") {
      return "";
    }
    const labelsByLanguage = {
      vi: {
        "VN30 recovered": "VN30 h\u1ED3i ph\u1EE5c",
        "corr20 weakened": "T\u01B0\u01A1ng quan corr20 suy y\u1EBFu",
        "basis too stretched": "Basis l\u1EC7ch qu\xE1 m\u1EE9c",
        "tracking error spiked": "Tracking error t\u0103ng v\u1ECDt",
        "VN30 still weak": "VN30 v\u1EABn y\u1EBFu",
        "correlation healthy": "T\u01B0\u01A1ng quan c\xF2n t\u1ED1t",
        "hedge remains valid": "Hedge v\u1EABn hi\u1EC7u qu\u1EA3",
        "VN30 weak": "VN30 suy y\u1EBFu",
        "corr20 strong": "corr20 m\u1EA1nh",
        "basis normal": "Basis b\xECnh th\u01B0\u1EDDng",
        "tracking clean": "Tracking s\u1EA1ch",
        "short-term pressure confirmed": "\xC1p l\u1EF1c ng\u1EAFn h\u1EA1n \u0111\u01B0\u1EE3c x\xE1c nh\u1EADn",
        "tracking error high": "Tracking error cao",
        "basis changed abruptly": "Basis thay \u0111\u1ED5i \u0111\u1ED9t ng\u1ED9t",
        "watch list": "C\u1EA7n theo d\xF5i",
        "most entry conditions present": "\u0110\xE3 c\xF3 ph\u1EA7n l\u1EDBn \u0111i\u1EC1u ki\u1EC7n v\xE0o l\u1EC7nh",
        "no clean hedge setup": "Ch\u01B0a c\xF3 setup hedge \u0111\u1EB9p"
      },
      ja: {
        "VN30 recovered": "VN30 \u304C\u56DE\u5FA9",
        "corr20 weakened": "corr20 \u306E\u76F8\u95A2\u304C\u5F31\u5316",
        "basis too stretched": "Basis \u304C\u884C\u304D\u904E\u304E",
        "tracking error spiked": "Tracking error \u304C\u6025\u5897",
        "VN30 still weak": "VN30 \u306F\u307E\u3060\u5F31\u3044",
        "correlation healthy": "\u76F8\u95A2\u306F\u5065\u5168",
        "hedge remains valid": "\u30D8\u30C3\u30B8\u306F\u6709\u52B9",
        "VN30 weak": "VN30 \u304C\u5F31\u3044",
        "corr20 strong": "corr20 \u304C\u5F37\u3044",
        "basis normal": "Basis \u306F\u6B63\u5E38",
        "tracking clean": "Tracking \u306F\u826F\u597D",
        "short-term pressure confirmed": "\u77ED\u671F\u5727\u529B\u3092\u78BA\u8A8D",
        "tracking error high": "Tracking error \u304C\u9AD8\u3044",
        "basis changed abruptly": "Basis \u304C\u6025\u5909",
        "watch list": "\u76E3\u8996\u304C\u5FC5\u8981",
        "most entry conditions present": "\u30A8\u30F3\u30C8\u30EA\u30FC\u6761\u4EF6\u306E\u5927\u534A\u304C\u63C3\u3063\u305F",
        "no clean hedge setup": "\u304D\u308C\u3044\u306A\u30D8\u30C3\u30B8\u6761\u4EF6\u306A\u3057"
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
        "VN30 recovered": "VN30 \u5DF2\u6062\u590D",
        "corr20 weakened": "corr20 \u76F8\u5173\u6027\u8F6C\u5F31",
        "basis too stretched": "Basis \u504F\u79BB\u8FC7\u5927",
        "tracking error spiked": "Tracking error \u6FC0\u589E",
        "VN30 still weak": "VN30 \u4ECD\u7136\u504F\u5F31",
        "correlation healthy": "\u76F8\u5173\u6027\u4ECD\u7136\u5065\u5EB7",
        "hedge remains valid": "\u5BF9\u51B2\u4ECD\u7136\u6709\u6548",
        "VN30 weak": "VN30 \u504F\u5F31",
        "corr20 strong": "corr20 \u8F83\u5F3A",
        "basis normal": "Basis \u6B63\u5E38",
        "tracking clean": "Tracking \u5E72\u51C0",
        "short-term pressure confirmed": "\u77ED\u671F\u538B\u529B\u5DF2\u786E\u8BA4",
        "tracking error high": "Tracking error \u504F\u9AD8",
        "basis changed abruptly": "Basis \u7A81\u7136\u53D8\u5316",
        "watch list": "\u9700\u8981\u89C2\u5BDF",
        "most entry conditions present": "\u5927\u90E8\u5206\u5165\u573A\u6761\u4EF6\u5DF2\u6EE1\u8DB3",
        "no clean hedge setup": "\u6682\u65E0\u6E05\u6670\u7684\u5BF9\u51B2\u6761\u4EF6"
      },
      ko: {
        "VN30 recovered": "VN30 \uD68C\uBCF5",
        "corr20 weakened": "corr20 \uC0C1\uAD00 \uC57D\uD654",
        "basis too stretched": "Basis \uACFC\uB3C4 \uD655\uB300",
        "tracking error spiked": "Tracking error \uAE09\uB4F1",
        "VN30 still weak": "VN30 \uC5EC\uC804\uD788 \uC57D\uC138",
        "correlation healthy": "\uC0C1\uAD00\uAD00\uACC4 \uC591\uD638",
        "hedge remains valid": "\uD5E4\uC9C0 \uC720\uD6A8",
        "VN30 weak": "VN30 \uC57D\uC138",
        "corr20 strong": "corr20 \uAC15\uD568",
        "basis normal": "Basis \uC815\uC0C1",
        "tracking clean": "Tracking \uC591\uD638",
        "short-term pressure confirmed": "\uB2E8\uAE30 \uC555\uB825 \uD655\uC778",
        "tracking error high": "Tracking error \uB192\uC74C",
        "basis changed abruptly": "Basis \uAE09\uBCC0",
        "watch list": "\uAD00\uCC30 \uD544\uC694",
        "most entry conditions present": "\uC9C4\uC785 \uC870\uAC74 \uB300\uBD80\uBD84 \uCDA9\uC871",
        "no clean hedge setup": "\uAE54\uB054\uD55C \uD5E4\uC9C0 \uC870\uAC74 \uC5C6\uC74C"
      }
    };
    return value.split(" | ").map((item) => labelsByLanguage[currentLanguage][item] ?? item).join(" | ");
  }
  function parseSymbols(rawSymbols) {
    const symbols = rawSymbols.split(",").map((symbol) => symbol.trim().toUpperCase()).filter(Boolean);
    if (symbols.length === 0) {
      throw new Error(t("pleaseEnterSymbol"));
    }
    return [...new Set(symbols)];
  }
  function ensureDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new Error(t("startEndRequired"));
    }
    if (startDate > endDate) {
      throw new Error(t("startBeforeEnd"));
    }
  }
  async function fetchPage(symbol, bearerToken, startDate, endDate, offset) {
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
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error(`Unexpected response for ${symbol}.`);
    }
    return data;
  }
  async function loadLocalJsonFile(symbol) {
    const response = await fetch(`./data/${encodeURIComponent(symbol)}.json`, {
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error(`Local file data/${symbol}.json was not found.`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error(`Local file data/${symbol}.json has invalid format.`);
    }
    return normalizeQuotes(data);
  }
  function normalizeQuotes(quotes) {
    const deduped = /* @__PURE__ */ new Map();
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
        returnPct: previousClose === null || currentClose === null || previousClose === 0 ? null : (currentClose - previousClose) / previousClose * 100
      };
    });
  }
  function formatDisplayNumber(value) {
    if (value === null || value === void 0 || Number.isNaN(value)) {
      return "";
    }
    return Number(value).toFixed(2);
  }
  function getValueClass(value) {
    if (value === null || value === void 0 || Number.isNaN(value) || value === 0) {
      return "";
    }
    return value > 0 ? "positive" : "negative";
  }
  function compareNullableNumbers(left, right) {
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
  function compareNullableStrings(left, right) {
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
  function calculateMean(values) {
    if (values.length === 0) {
      return null;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  function calculateStandardDeviation(values) {
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
  function getRollingNumericValues(rows, currentIndex, key, windowSize) {
    return rows.slice(Math.max(0, currentIndex - windowSize + 1), currentIndex + 1).map((row) => row[key]).filter((value) => typeof value === "number" && Number.isFinite(value));
  }
  function hasBottomSignal(quotes, dateIndex, volumeMultiplier = BOTTOM_SIGNAL.volumeMultiplier) {
    if (dateIndex < BOTTOM_SIGNAL.volumeWindow + 1) {
      return false;
    }
    const quote = quotes[dateIndex];
    const prevQuote = quotes[dateIndex - 1];
    const prevVolume = toNumberOrNull(prevQuote?.totalVolume);
    const priceOpen = toNumberOrNull(quote?.priceOpen);
    const priceClose = toNumberOrNull(quote?.priceClose);
    const priceChange = toNumberOrNull(quote?.priceChange);
    if (prevVolume === null || prevVolume <= 0) {
      return false;
    }
    const maQuotes = quotes.slice(dateIndex - 1 - BOTTOM_SIGNAL.volumeWindow, dateIndex - 1);
    const volumes = maQuotes.map((q) => toNumberOrNull(q.totalVolume)).filter((v) => v !== null && v > 0);
    if (volumes.length < BOTTOM_SIGNAL.volumeWindow / 2) {
      return false;
    }
    const volumeMA = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const volumeSpike = prevVolume >= volumeMultiplier * volumeMA;
    const priceUp = priceClose !== null && priceOpen !== null && priceClose > priceOpen || priceChange !== null && priceChange > 0;
    return volumeSpike && priceUp;
  }
  function getVolume(q) {
    return toNumberOrNull(q.totalVolume);
  }
  function getClose(q) {
    return toNumberOrNull(q.priceClose);
  }
  function getLow(q) {
    return toNumberOrNull(q.priceLow ?? q.priceClose);
  }
  function calcMA(values) {
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
  function calcStd(values) {
    const mean = calcMA(values);
    if (mean === null || values.length < 2) return null;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }
  function calcRSI(closes, period) {
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
  function hasBuySig1(quotes, dateIndex) {
    return hasBottomSignal(quotes, dateIndex);
  }
  function hasBuySig2(quotes, dateIndex) {
    if (dateIndex < BUY_SIGNAL.peakLookback + BUY_SIGNAL.maLong) return false;
    const quote = quotes[dateIndex];
    const close = getClose(quote);
    if (close === null || close <= 0) return false;
    const lookback = quotes.slice(Math.max(0, dateIndex - BUY_SIGNAL.peakLookback), dateIndex + 1);
    const closes = lookback.map((q) => getClose(q)).filter((v) => v !== null && v > 0);
    if (closes.length < 10) return false;
    const peak = Math.max(...closes);
    const discountPct = (peak - close) / peak * 100;
    if (discountPct < BUY_SIGNAL.discountFromPeakPct) return false;
    const volSlice = quotes.slice(dateIndex - BUY_SIGNAL.maLong, dateIndex + 1);
    const vols = volSlice.map((q) => getVolume(q)).filter((v) => v !== null && v > 0);
    if (vols.length < BUY_SIGNAL.maLong) return false;
    const ma5 = calcMA(vols.slice(-5));
    const ma20 = calcMA(vols);
    return ma5 !== null && ma20 !== null && ma5 < ma20;
  }
  function hasBuySig3(quotes, dateIndex) {
    if (dateIndex < BUY_SIGNAL.rsiPeriod + 2) return false;
    const closes = quotes.slice(0, dateIndex + 1).map((q) => getClose(q)).filter((v) => v !== null && Number.isFinite(v));
    const rsiToday = calcRSI(closes, BUY_SIGNAL.rsiPeriod);
    const rsiYesterday = calcRSI(closes.slice(0, -1), BUY_SIGNAL.rsiPeriod);
    return rsiToday !== null && rsiYesterday !== null && rsiYesterday < BUY_SIGNAL.rsiOversold && rsiToday > rsiYesterday;
  }
  function hasBuySig4(quotes, dateIndex) {
    if (dateIndex < 10) return false;
    const window2 = quotes.slice(Math.max(0, dateIndex - 20), dateIndex + 1);
    const lows = [];
    for (let i = 1; i < window2.length - 1; i++) {
      const curr = getLow(window2[i]);
      const prev = getLow(window2[i - 1]);
      const next = getLow(window2[i + 1]);
      if (curr !== null && prev !== null && next !== null && curr <= prev && curr <= next) {
        lows.push({ i, v: curr });
      }
    }
    if (lows.length < 3) return false;
    const last3 = lows.slice(-3);
    return last3[2].v > last3[1].v && last3[1].v > last3[0].v;
  }
  function hasBuySig5(quotes, dateIndex) {
    if (dateIndex < BUY_SIGNAL.maLong) return false;
    const closes = quotes.slice(0, dateIndex + 1).map((q) => getClose(q)).filter((v) => v !== null && Number.isFinite(v));
    const ma5Today = calcMA(closes.slice(-BUY_SIGNAL.maShort));
    const ma20Today = calcMA(closes.slice(-BUY_SIGNAL.maLong));
    const ma5Yesterday = calcMA(closes.slice(-BUY_SIGNAL.maShort - 1, -1));
    const ma20Yesterday = calcMA(closes.slice(-BUY_SIGNAL.maLong - 1, -1));
    return ma5Today !== null && ma20Today !== null && ma5Yesterday !== null && ma20Yesterday !== null && ma5Today > ma20Today && ma5Yesterday <= ma20Yesterday;
  }
  function hasBuySig6(quotes, dateIndex) {
    if (dateIndex < BUY_SIGNAL.bbPeriod) return false;
    const slice = quotes.slice(dateIndex - BUY_SIGNAL.bbPeriod, dateIndex + 1);
    const closes = slice.map((q) => getClose(q)).filter((v) => v !== null && Number.isFinite(v));
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
  function hasBuySig7(quotes, dateIndex) {
    if (dateIndex < BUY_SIGNAL.volumeWindow) return false;
    const quote = quotes[dateIndex];
    const priceOpen = toNumberOrNull(quote?.priceOpen);
    const priceClose = getClose(quote);
    const priceChange = toNumberOrNull(quote?.priceChange);
    const vol = getVolume(quote);
    const priceUp = priceClose !== null && priceOpen !== null && priceClose > priceOpen || priceChange !== null && priceChange > 0;
    const volSlice = quotes.slice(dateIndex - BUY_SIGNAL.volumeWindow, dateIndex);
    const vols = volSlice.map((q) => getVolume(q)).filter((v) => v !== null && v > 0);
    const volMA = calcMA(vols);
    const volumeUp = vol !== null && volMA !== null && vol > volMA;
    return priceUp && volumeUp;
  }
  function computeBuySignals(quotes, dateIndex) {
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
  function getSignalCellClass(value) {
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
  function getPictureInPictureAccentClass(row) {
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
  function getComparisonPair(sortedSymbols) {
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
  function calculateCorrelation(leftValues, rightValues) {
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
  function calculateRollingCorrelation(rows, currentIndex, leftKey, rightKey, windowSize) {
    const windowRows = rows.slice(Math.max(0, currentIndex - windowSize + 1), currentIndex + 1);
    const validRows = windowRows.filter(
      (row) => typeof row[leftKey] === "number" && typeof row[rightKey] === "number"
    );
    if (validRows.length < windowSize) {
      return null;
    }
    return calculateCorrelation(
      validRows.map((row) => row[leftKey]),
      validRows.map((row) => row[rightKey])
    );
  }
  function buildMappingRows(symbolData) {
    const sortedSymbols = Object.keys(symbolData).sort();
    const comparisonPair = getComparisonPair(sortedSymbols);
    const configuredAssets = getConfiguredAssetInputs();
    const dateMap = /* @__PURE__ */ new Map();
    for (const symbol of sortedSymbols) {
      for (const quote of symbolData[symbol]) {
        const date = String(quote.date).slice(0, 10);
        if (!dateMap.has(date)) {
          dateMap.set(date, { date });
        }
        dateMap.get(date)[`${symbol}ClosePrice`] = toNumberOrNull(quote.priceClose);
        dateMap.get(date)[symbol] = toNumberOrNull(quote.priceChange);
        dateMap.get(date)[`${symbol}ReturnPct`] = toNumberOrNull(quote.returnPct);
      }
    }
    const rows = Array.from(dateMap.values()).sort((left, right) => String(left.date).localeCompare(String(right.date)));
    const earliestDate = rows[0] ? String(rows[0].date) : null;
    const baseCloseBySymbol = Object.fromEntries(
      sortedSymbols.map((symbol) => {
        const initialQuote = earliestDate === null ? null : symbolData[symbol].find((quote) => {
          const quoteDate = String(quote.date).slice(0, 10);
          return quoteDate >= earliestDate && toNumberOrNull(quote.priceClose) !== null;
        }) ?? null;
        return [symbol, toNumberOrNull(initialQuote?.priceClose)];
      })
    );
    let previousBasis = null;
    const baseRows = rows.map((row, index) => {
      const values = sortedSymbols.map((symbol) => row[symbol]).filter((value) => typeof value === "number" && Number.isFinite(value));
      const priceChangeSpread = values.length > 1 ? Math.max(...values) - Math.min(...values) : null;
      let basis = null;
      let spreadReturn = null;
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
      const enrichedRow = {
        ...row,
        assetAppliedDate: earliestDate,
        basis,
        basisChange,
        spreadReturn,
        corr5: comparisonPair === null ? null : calculateRollingCorrelation(
          rows,
          index,
          `${comparisonPair.baseSymbol}ReturnPct`,
          `${comparisonPair.hedgeSymbol}ReturnPct`,
          5
        ),
        corr10: comparisonPair === null ? null : calculateRollingCorrelation(
          rows,
          index,
          `${comparisonPair.baseSymbol}ReturnPct`,
          `${comparisonPair.hedgeSymbol}ReturnPct`,
          10
        ),
        corr20: comparisonPair === null ? null : calculateRollingCorrelation(
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
        enrichedRow[`${symbol}AssetValue`] = assetStartValue === null || assetStartValue <= 0 || baseClose === null || baseClose === 0 || currentClose === null ? null : assetStartValue * currentClose / baseClose;
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
      const basisZScore = basis === null || basisMean === null || basisStd === null || basisStd === 0 ? null : (basis - basisMean) / basisStd;
      const trackingError20 = calculateStandardDeviation(spreadWindow);
      const entryMarketWeak = baseReturn !== null && baseReturn <= HEDGE_THRESHOLDS.entryBaseReturnPct;
      const entryCorrelationStrong = corr20 !== null && corr20 >= HEDGE_THRESHOLDS.corr20EntryMin;
      const entryBasisSafe = basisZScore !== null && Math.abs(basisZScore) <= HEDGE_THRESHOLDS.basisZScoreEntryMax;
      const entryTrackingClean = trackingError20 !== null && trackingError20 <= HEDGE_THRESHOLDS.trackingError20EntryMax;
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
      let hedgeState = "No hedge";
      let shortSignal = "No action";
      let stopSignal = "";
      const reasons = [];
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
  function sortMappingRows(rows, sortState) {
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
  function getSortIndicator(columnKey) {
    if (mappingSortState.key !== columnKey) {
      return "";
    }
    return mappingSortState.direction === "asc" ? "\u25B2" : "\u25BC";
  }
  function buildMappingColumns(symbolData) {
    const sortedSymbols = Object.keys(symbolData).sort();
    const comparisonPair = getComparisonPair(sortedSymbols);
    const columns = [
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
          cellClassName: (value) => value === 1 ? "bottom-signal-cell" : "",
          focusSymbol: symbol
        });
        columns.push({
          key: `${symbol}BuyCount`,
          label: t("buyColumnLabel"),
          group: symbol,
          formatter: (value) => typeof value === "number" && value >= BUY_SIGNAL.minPassCount ? `${value}/7` : "",
          cellClassName: (value) => typeof value === "number" && value >= BUY_SIGNAL.minPassCount ? "buy-suggestion-cell" : "",
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
  function buildColumnGroups(columns) {
    const groups = [];
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
  function formatDateTime(value) {
    if (!value) {
      return "n/a";
    }
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return date.toLocaleString("sv-SE");
  }
  function findQuoteByDate(rows, date) {
    return rows.find((quote) => String(quote.date).slice(0, 10) === date) ?? null;
  }
  function getLatestCloseForSymbol(symbol) {
    const quotes = currentMappingData[symbol];
    if (!quotes || quotes.length === 0) return null;
    const sorted = [...quotes].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const quote = sorted[0];
    const priceClose = toNumberOrNull(quote?.priceClose);
    if (priceClose === null) return null;
    const unit = toNumberOrNull(quote?.unit) ?? 1e3;
    return priceClose * unit;
  }
  function getLatestCloseForDerivative(symbol) {
    const quotes = currentMappingData[symbol];
    if (!quotes || quotes.length === 0) return null;
    const sorted = [...quotes].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const quote = sorted[0];
    return toNumberOrNull(quote?.priceClose);
  }
  function calcSimDerivRowPnL(type, qty, entry, close) {
    if (entry <= 0 || qty <= 0 || close <= 0) return null;
    const pointDiff = type === "long" ? close - entry : entry - close;
    return pointDiff * qty * FUTURES_POINT_VALUE;
  }
  function getSimDerivRowsFromDOM() {
    if (!simDerivativesBodyElement) return [];
    const out = [];
    simDerivativesBodyElement.querySelectorAll("tr[data-sim-deriv-row]").forEach((rowEl) => {
      const typeSelect = rowEl.querySelector(".sim-deriv-type");
      const qtyInput = rowEl.querySelector(".sim-deriv-qty");
      const entryInput = rowEl.querySelector(".sim-deriv-entry");
      const closeInput = rowEl.querySelector(".sim-deriv-close");
      const type = typeSelect?.value ?? "long";
      const qty = parseInt(String(qtyInput?.value ?? "0").replace(/\D/g, ""), 10) || 0;
      const entry = parseAssetInput(entryInput?.value ?? "") ?? 0;
      const close = parseAssetInput(closeInput?.value ?? "") ?? 0;
      out.push({ type, quantity: qty, entryPrice: entry, closePrice: close });
    });
    return out;
  }
  function saveSimDerivativesManual() {
    try {
      localStorage.setItem(SIM_DERIV_MANUAL_STORAGE_KEY, JSON.stringify(getSimDerivRowsFromDOM()));
    } catch {
    }
  }
  function loadSimDerivativesManual() {
    try {
      const raw = localStorage.getItem(SIM_DERIV_MANUAL_STORAGE_KEY);
      if (!raw) {
        renderSimDerivativesRows([{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        renderSimDerivativesRows([{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }]);
        return;
      }
      const rows = [];
      for (const x of parsed) {
        if (typeof x !== "object" || x === null) continue;
        const o = x;
        const type = o.type === "short" ? "short" : "long";
        const quantity = typeof o.quantity === "number" && Number.isFinite(o.quantity) ? o.quantity : parseInt(String(o.quantity ?? "0").replace(/\D/g, ""), 10) || 0;
        const entryPrice = typeof o.entryPrice === "number" ? o.entryPrice : parseAssetInput(String(o.entryPrice ?? "")) ?? 0;
        const closePrice = typeof o.closePrice === "number" ? o.closePrice : parseAssetInput(String(o.closePrice ?? "")) ?? 0;
        rows.push({ type, quantity, entryPrice, closePrice });
      }
      renderSimDerivativesRows(rows.length > 0 ? rows : [{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }]);
    } catch {
      renderSimDerivativesRows([{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }]);
    }
  }
  function refreshSimDerivativesPnL() {
    let totalPnL = 0;
    simDerivativesBodyElement?.querySelectorAll("tr[data-sim-deriv-row]").forEach((rowEl) => {
      const typeSelect = rowEl.querySelector(".sim-deriv-type");
      const qtyInput = rowEl.querySelector(".sim-deriv-qty");
      const entryInput = rowEl.querySelector(".sim-deriv-entry");
      const closeInput = rowEl.querySelector(".sim-deriv-close");
      const pnlSpan = rowEl.querySelector(".sim-deriv-pnl-value");
      const type = typeSelect?.value ?? "long";
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
  function renderSimDerivativesRows(rows) {
    if (!simDerivativesBodyElement) return;
    const list = rows.length > 0 ? rows : [{ type: "long", quantity: 0, entryPrice: 0, closePrice: 0 }];
    simDerivativesBodyElement.innerHTML = list.map(
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
      <td><button type="button" class="derivatives-del-btn secondary-button" data-sim-deriv-remove>\xD7</button></td>
    </tr>`
    ).join("");
    simDerivativesBodyElement.querySelectorAll("[data-sim-deriv-field]").forEach((el) => {
      el.addEventListener("input", () => {
        const row = el.closest("tr[data-sim-deriv-row]");
        const typeSelect = row?.querySelector(".sim-deriv-type");
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
        const row = sel.closest("tr[data-sim-deriv-row]");
        const typeSelect = row?.querySelector(".sim-deriv-type");
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
  function getCurrentSignalRow(symbolData) {
    const rows = buildMappingRows(symbolData);
    if (rows.length === 0) {
      return null;
    }
    if (currentDetailState.date) {
      return rows.find((row) => row.date === currentDetailState.date) ?? rows[0];
    }
    return rows[0];
  }
  function buildPictureInPictureMarkup(symbolData) {
    const row = getCurrentSignalRow(symbolData);
    if (!row) {
      return `<div class="pip-empty">${escapeHtml(t("noPipData"))}</div>`;
    }
    const date = String(row.date ?? "");
    const shellAccentClass = getPictureInPictureAccentClass(row);
    const sortedSymbols = Object.keys(symbolData).sort();
    const derivativesSymbols = sortedSymbols.filter((s) => s === "VN30" || s.startsWith("VN30F"));
    const watchedSymbols = sortedSymbols.filter((s) => s !== "VN30" && !s.startsWith("VN30F"));
    const buildTickerSpan = (symbol, isPriceChange) => {
      const val = isPriceChange ? toNumberOrNull(row[symbol]) : toNumberOrNull(row[`${symbol}ReturnPct`]);
      const cls = getValueClass(val);
      const text = isPriceChange ? formatDisplayNumber(val) : formatPercent(val);
      const hasBottom = isBaseSymbol(symbol) && row[`${symbol}BottomSignal`] === 1;
      const hasBuy = isBaseSymbol(symbol) && row[`${symbol}BuySuggestion`] === 1;
      const bottomClass = hasBottom ? " pip-ticker-bottom" : "";
      const buyClass = hasBuy ? " pip-ticker-buy" : "";
      return `<span class="pip-ticker ${cls}${bottomClass}${buyClass}">${escapeHtml(symbol)}: ${escapeHtml(text)}</span>`;
    };
    const derivativesRow = derivativesSymbols.length > 0 ? `<div class="pip-ticker-row">${derivativesSymbols.map((s) => buildTickerSpan(s, true)).join(" ")}</div>` : "";
    const watchedRow = watchedSymbols.length > 0 ? `<div class="pip-ticker-row">${watchedSymbols.map((s) => buildTickerSpan(s, false)).join(" ")}</div>` : "";
    const cards = sortedSymbols.map((symbol) => {
      if (pipHiddenSymbols[symbol]) {
        return "";
      }
      const quote = findQuoteByDate(symbolData[symbol], date);
      const assetValue = toNumberOrNull(row[`${symbol}AssetValue`]);
      if (!quote) {
        return `<div class="pip-card"><button class="pip-close-button" type="button" data-pip-action="hide-symbol" data-pip-symbol="${escapeHtml(symbol)}">\xD7</button><h3>${escapeHtml(symbol)}</h3><p>${escapeHtml(t("noData"))}</p></div>`;
      }
      const bottomClass = isBaseSymbol(symbol) && row[`${symbol}BottomSignal`] === 1 ? " pip-card-bottom" : "";
      const buyClass = isBaseSymbol(symbol) && row[`${symbol}BuySuggestion`] === 1 ? " pip-card-buy" : "";
      return `<div class="pip-card ${symbol === currentDetailState.symbol ? "active" : ""}${bottomClass}${buyClass}">
        <button class="pip-close-button" type="button" data-pip-action="hide-symbol" data-pip-symbol="${escapeHtml(symbol)}">\xD7</button>
        <h3>${escapeHtml(symbol)}</h3>
        <p>${escapeHtml(t("closePrice"))}: ${escapeHtml(formatDisplayNumber(toNumberOrNull(quote.priceClose)))}</p>
        <p>${escapeHtml(t("priceChangeLabel"))}: ${escapeHtml(formatDisplayNumber(toNumberOrNull(quote.priceChange)))}</p>
        <p>${escapeHtml(t("returnPctLabel"))}: ${escapeHtml(formatPercent(toNumberOrNull(quote.returnPct)))}</p>
        ${assetValue === null ? "" : `<p>${escapeHtml(t("assetValueLabel"))}: ${escapeHtml(formatAssetValue(assetValue))}</p>`}
      </div>`;
    }).join("");
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
    ${pipHiddenSections.metrics ? "" : `<div class="pip-section">
      <div class="pip-section-header">
        <div class="pip-section-title">${escapeHtml(t("quickMetrics"))}</div>
        <button class="pip-close-button" type="button" data-pip-action="hide-section" data-pip-section="metrics">\xD7</button>
      </div>
      <div class="pip-metrics">
      <div class="pip-metric"><span>${escapeHtml(t("shortSignalLabel"))}</span><strong class="${getSignalCellClass(row.shortSignal)}">${escapeHtml(formatSignalLabel(row.shortSignal))}</strong></div>
      <div class="pip-metric"><span>${escapeHtml(t("stopSignalLabel"))}</span><strong class="${getSignalCellClass(row.stopSignal)}">${escapeHtml(formatSignalLabel(row.stopSignal))}</strong></div>
      <div class="pip-metric"><span>${escapeHtml(t("basisLabel"))}</span><strong>${escapeHtml(formatDisplayNumber(toNumberOrNull(row.basis)))}</strong></div>
      <div class="pip-metric"><span>${escapeHtml(t("basisZScoreLabel"))}</span><strong>${escapeHtml(formatDisplayNumber(toNumberOrNull(row.basisZScore)))}</strong></div>
      <div class="pip-metric"><span>Corr20</span><strong>${escapeHtml(formatDisplayNumber(toNumberOrNull(row.corr20)))}</strong></div>
      <div class="pip-metric"><span>${escapeHtml(t("trackingLabel"))}</span><strong>${escapeHtml(formatPercent(toNumberOrNull(row.trackingError20)))}</strong></div>
      </div>
    </div>`}
    ${pipHiddenSections.reason ? "" : `<div class="pip-section">
      <div class="pip-section-header">
        <div class="pip-section-title">${escapeHtml(t("reasonLabel"))}</div>
        <button class="pip-close-button" type="button" data-pip-action="hide-section" data-pip-section="reason">\xD7</button>
      </div>
      <div class="pip-reason">${escapeHtml(t("reasonLabel"))}: ${escapeHtml(formatSignalReason(row.signalReason))}</div>
    </div>`}
    ${row.hedgeState === "Basis risk" ? (() => {
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
          <span>${escapeHtml(t("basisChangeLabel"))}</span> ${escapeHtml(formatDisplayNumber(bc))} (\u2265${HEDGE_THRESHOLDS.basisChangeShock})
        </div>
        <div class="pip-basis-risk-row${bzTriggered ? " triggered" : ""}">
          <span>${escapeHtml(t("basisZScoreLabel"))}</span> ${escapeHtml(formatDisplayNumber(bz))} (\u2265${HEDGE_THRESHOLDS.basisZScoreExtreme})
        </div>
        <div class="pip-basis-risk-row${teTriggered ? " triggered" : ""}">
          <span>${escapeHtml(t("trackingLabel"))}</span> ${escapeHtml(formatPercent(te))} (\u2265${formatPercent(HEDGE_THRESHOLDS.trackingError20StopMax)})
        </div>
      </div>
    </div>`;
    })() : ""}
    ${pipHiddenSections.buySignals || watchedSymbols.length === 0 ? "" : (() => {
      const buyRows = watchedSymbols.map((sym) => {
        const count = row[`${sym}BuyCount`];
        if (typeof count !== "number" || count < BUY_SIGNAL.minPassCount) return "";
        const sigs = [1, 2, 3, 4, 5, 6, 7].map((i) => row[`${sym}BuySig${i}`] === 1 ? "P" : "F").join("");
        return `<div class="pip-buy-row"><span class="pip-buy-symbol">${escapeHtml(sym)}</span> ${count}/7: ${sigs}</div>`;
      }).filter(Boolean).join("");
      if (!buyRows) return "";
      return `<div class="pip-section">
      <div class="pip-section-header">
        <div class="pip-section-title">${escapeHtml(t("buySignalsTitle"))}</div>
        <button class="pip-close-button" type="button" data-pip-action="hide-section" data-pip-section="buySignals">\xD7</button>
      </div>
      <div class="pip-buy-signals">${buyRows}</div>
    </div>`;
    })()}
    ${pipHiddenSections.cards ? "" : `<div class="pip-section">
      <div class="pip-section-header">
        <div class="pip-section-title">${escapeHtml(t("watchedSymbols"))}</div>
        <button class="pip-close-button" type="button" data-pip-action="hide-section" data-pip-section="cards">\xD7</button>
      </div>
      <div class="pip-cards">${cards || `<div class="pip-empty">${escapeHtml(t("noVisibleSymbols"))}</div>`}</div>
    </div>`}
  </div>`;
  }
  function getPictureInPictureStyles() {
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
  function renderPictureInPictureContent() {
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
      const shell = pipRootElement.querySelector(".pip-shell");
      if (shell) {
        shell.classList.add("pip-flash");
        shell.classList.add("pip-state-changed");
        shell.setAttribute("data-pip-prev-state", String(prevState ?? ""));
        shell.setAttribute("data-pip-curr-state", String(currentState ?? ""));
        pipWindowRef.setTimeout(() => {
          shell.classList.remove("pip-flash");
          shell.classList.remove("pip-state-changed");
        }, 2e3);
      }
      if (getCurrentSettings().notifyEnabled && getCurrentSettings().notifyOnHedgeChange) {
        void sendNotification(
          t("hedgeStateLabel"),
          `${prevState ?? "-"} \u2192 ${currentState ?? "-"}`
        );
      }
    }
  }
  async function openPictureInPictureWindow() {
    const pipHostWindow = window;
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
    pipRootElement = pipWindow.document.querySelector("#pipRoot");
    pipWindow.document.body.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const actionElement = target.closest("[data-pip-action]");
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
  function closePictureInPictureWindow() {
    if (pipWindowRef && !pipWindowRef.closed) {
      pipWindowRef.close();
    }
    pipWindowRef = null;
    pipRootElement = null;
    lastPipHedgeState = null;
    syncPipButtonLabel();
  }
  function renderDetailPanel(symbolData, date, focusedSymbol = null) {
    if (!date) {
      detailContentElement.innerHTML = t("detailHint");
      return;
    }
    const sortedSymbols = Object.keys(symbolData).sort();
    const comparisonPair = getComparisonPair(sortedSymbols);
    const row = buildMappingRows(symbolData).find((item) => item.date === date);
    const cards = sortedSymbols.map((symbol) => {
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
    }).join("");
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
      ${row?.hedgeState === "Basis risk" ? (() => {
        const bc = toNumberOrNull(row.basisChange);
        const bz = toNumberOrNull(row.basisZScore);
        const te = toNumberOrNull(row.trackingError20);
        const bcTriggered = bc !== null && Math.abs(bc) >= HEDGE_THRESHOLDS.basisChangeShock;
        const bzTriggered = bz !== null && Math.abs(bz) >= HEDGE_THRESHOLDS.basisZScoreExtreme;
        const teTriggered = te !== null && te >= HEDGE_THRESHOLDS.trackingError20StopMax;
        return `<p class="detail-basis-risk-explain"><strong>${escapeHtml(t("basisRiskExplainTitle"))}</strong></p>
      <p class="detail-basis-risk-row${bcTriggered ? " triggered" : ""}">${escapeHtml(t("basisChangeLabel"))}: ${escapeHtml(formatDisplayNumber(bc))} (\u2265${HEDGE_THRESHOLDS.basisChangeShock})</p>
      <p class="detail-basis-risk-row${bzTriggered ? " triggered" : ""}">${escapeHtml(t("basisZScoreLabel"))}: ${escapeHtml(formatDisplayNumber(bz))} (\u2265${HEDGE_THRESHOLDS.basisZScoreExtreme})</p>
      <p class="detail-basis-risk-row${teTriggered ? " triggered" : ""}">${escapeHtml(t("trackingLabel"))}: ${escapeHtml(formatPercent(te))} (\u2265${formatPercent(HEDGE_THRESHOLDS.trackingError20StopMax)})</p>`;
      })() : ""}
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
  function renderMappingTable(symbolData, sortState = mappingSortState) {
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
    const groupHeaderCells = columnGroups.map((group, index) => {
      const groupClass = index === columnGroups.length - 1 ? "group-header" : "group-header group-end";
      return `<th class="${groupClass}" colspan="${group.span}">${escapeHtml(group.label)}</th>`;
    }).join("");
    const headCells = columns.map(
      (column, index) => {
        const isGroupEnd = index === columns.length - 1 || columns[index + 1].group !== column.group;
        const headerClass = isGroupEnd ? "sub-header group-end" : "sub-header";
        const hideButton = column.key === "date" ? "" : `<button type="button" class="column-hide-button" data-hide-column="${escapeHtml(column.key)}" title="${escapeHtml(
          t("hideColumnTitle")
        )}">\xD7</button>`;
        return `<th class="${headerClass}"><div class="header-cell-content"><button type="button" class="sort-button" data-sort-key="${escapeHtml(
          column.key
        )}">${escapeHtml(column.label)} <span class="sort-indicator">${escapeHtml(getSortIndicator(
          column.key
        ))}</span></button>${hideButton}</div></th>`;
      }
    ).join("");
    mappingHeadElement.innerHTML = `<tr>${groupHeaderCells}</tr><tr>${headCells}</tr>`;
    const rows = sortMappingRows(buildMappingRows(symbolData), sortState);
    mappingBodyElement.innerHTML = rows.map((row) => {
      const rowClass = currentDetailState.date === row.date ? "clickable-row selected-row" : "clickable-row";
      const cells = columns.map((column, index) => {
        const value = row[column.key];
        if (column.key === "date") {
          const cellClass = index === columns.length - 1 || columns[index + 1].group !== column.group ? "group-end" : "";
          return `<td class="${cellClass}">${escapeHtml(String(value ?? ""))}</td>`;
        }
        const numericValue = typeof value === "number" ? value : null;
        const className = getValueClass(numericValue);
        const customCellClass = column.cellClassName ? column.cellClassName(value) : "";
        const selectedCellClass = currentDetailState.date === row.date && currentDetailState.symbol === column.focusSymbol ? " selected-cell" : "";
        const groupEndClass = index === columns.length - 1 || columns[index + 1].group !== column.group ? " group-end" : "";
        const dataSymbol = column.focusSymbol ? ` data-symbol="${escapeHtml(column.focusSymbol)}"` : "";
        const cellContent = column.key.endsWith("BottomSignal") && value === 1 ? '<span class="bottom-signal-dot"></span>' : escapeHtml(column.formatter(value));
        return `<td class="${className} ${customCellClass}${selectedCellClass}${groupEndClass}"${dataSymbol}>${cellContent}</td>`;
      }).join("");
      return `<tr class="${rowClass}" data-date="${escapeHtml(String(row.date ?? ""))}">${cells}</tr>`;
    }).join("");
  }
  mappingHeadElement.addEventListener("click", (event) => {
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
    mappingSortState = mappingSortState.key === nextKey ? {
      key: nextKey,
      direction: mappingSortState.direction === "asc" ? "desc" : "asc"
    } : {
      key: nextKey,
      direction: "desc"
    };
    renderMappingTable(currentMappingData, mappingSortState);
  });
  hiddenColumnsBarElement.addEventListener("click", (event) => {
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
      hiddenMappingColumnKeys = /* @__PURE__ */ new Set();
      renderMappingTable(currentMappingData, mappingSortState);
    }
  });
  mappingBodyElement.addEventListener("click", (event) => {
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
  async function fetchAllHistoricalQuotes(symbol, bearerToken, startDate, endDate) {
    const quotes = [];
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
  async function saveJsonFile(directoryHandle, fileName, data) {
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(`${JSON.stringify(data, null, 2)}
`);
    await writable.close();
  }
  async function resolveDataDirectoryHandle(selectedDirectoryHandle) {
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
  function buildSummary(symbolData) {
    const lines = [t("done")];
    for (const [symbol, rows] of Object.entries(symbolData)) {
      lines.push(buildSymbolRangeLine(symbol, rows));
    }
    lines.push(t("savedToSelectedData"));
    return lines.join("\n");
  }
  function buildLoadedSummary(symbolData, missingSymbols) {
    const lines = [t("loadedExisting")];
    for (const [symbol, rows] of Object.entries(symbolData)) {
      lines.push(buildSymbolRangeLine(symbol, rows));
    }
    if (missingSymbols.length > 0) {
      lines.push(`${t("missingLabel")}: ${missingSymbols.join(", ")}`);
    }
    return lines.join("\n");
  }
  async function loadExistingData() {
    const symbols = parseSymbols(symbolsInput.value);
    const allData = {};
    const missingSymbols = [];
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
    lastBuySuggestions = /* @__PURE__ */ new Set();
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
  async function refreshRealtimeLatestRows() {
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
            const symbols2 = parseSymbols(symbolsInput.value);
            const nowBuy = /* @__PURE__ */ new Set();
            for (const sym of symbols2) {
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
  function stopRealtimeRefresh() {
    if (realtimeRefreshTimer !== null) {
      window.clearInterval(realtimeRefreshTimer);
      realtimeRefreshTimer = null;
    }
  }
  function startRealtimeRefresh() {
    stopRealtimeRefresh();
    const bearerToken = normalizeToken(tokenInput.value);
    if (!bearerToken) {
      return;
    }
    void refreshRealtimeLatestRows();
    realtimeRefreshTimer = window.setInterval(() => {
      void refreshRealtimeLatestRows();
    }, 5e3);
  }
  async function run() {
    const bearerToken = normalizeToken(tokenInput.value);
    const symbols = parseSymbols(symbolsInput.value);
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    ensureDateRange(startDate, endDate);
    if (!bearerToken) {
      throw new Error(t("bearerRequired"));
    }
    const pickerWindow = window;
    if (!pickerWindow.showDirectoryPicker) {
      throw new Error(t("showDirPickerUnsupported"));
    }
    appendLog(t("selectDataFolder"));
    const selectedDirectoryHandle = await pickerWindow.showDirectoryPicker({ mode: "readwrite" });
    const { directoryHandle: dataDirectoryHandle, outputPathLabel } = await resolveDataDirectoryHandle(selectedDirectoryHandle);
    const allData = {};
    for (const symbol of symbols) {
      const rows = await fetchAllHistoricalQuotes(symbol, bearerToken, startDate, endDate);
      await saveJsonFile(dataDirectoryHandle, `${symbol}.json`, rows);
      allData[symbol] = rows;
      appendLog(`Saved ${outputPathLabel}${symbol}.json`);
    }
    currentMappingData = allData;
    mappingSortState = { ...defaultSortState };
    currentDetailState = { date: null, symbol: null };
    lastBuySuggestions = /* @__PURE__ */ new Set();
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
  for (const input of [document.querySelector("#vn30Asset"), document.querySelector("#vn30f1mAsset")].filter(Boolean)) {
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
    input.addEventListener("change", () => {
      if (input === notifyEnabledInput && input?.checked) {
        void ensureNotificationPermission();
      }
      scheduleSaveSettings();
    });
  }
  for (const input of [telegramBotTokenInput, telegramChatIdInput, discordWebhookUrlInput].filter(Boolean)) {
    input.addEventListener("input", () => scheduleSaveSettings());
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
      transactions.push({ type: "deposit", amount: 0, description: "", createdAt: (/* @__PURE__ */ new Date()).toISOString() });
      renderCashRows(transactions);
      refreshCashTotal();
      scheduleSaveSettings();
    });
  }
  if (derivativesAddRowButton && derivativesBodyElement) {
    derivativesAddRowButton.addEventListener("click", () => {
      const orders = getDerivativesFromDOM();
      orders.push({ symbol: "", type: "long", quantity: 0, entryPrice: 0, closePrice: void 0, description: "" });
      renderDerivativesRows(orders);
      refreshDerivativesTotal();
      scheduleSaveSettings();
    });
  }
  var portfolioTable = document.getElementById("portfolioTable");
  var cashTableEl = document.getElementById("cashTable");
  var derivativesTableEl = document.getElementById("derivativesTable");
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
      setSummary(`${t("failed")}
${message}`);
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
      setSummary(`${t("failed")}
${message}`);
      resetMappingView(t("localDataNotFound"));
    } finally {
      loadButton.disabled = false;
      runButton.disabled = false;
    }
  });
  async function runSuggestScan() {
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
    const found = [];
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
      }
    }
    suggestModalStatus.textContent = found.length > 0 ? `${t("suggestFound")} ${found.length} ${t("buyColumnLabel")} (4/7+):` : t("suggestNone");
    if (found.length > 0 && getCurrentSettings().notifyEnabled) {
      void sendNotification(
        t("buyColumnLabel"),
        `${t("suggestFound")} ${found.length}: ${found.join(", ")}`
      );
    }
    if (found.length > 0) {
      suggestModalResults.innerHTML = found.map(
        (s) => `<button type="button" class="suggest-chip" data-suggest-symbol="${escapeHtml(s)}">${escapeHtml(s)}</button>`
      ).join("");
      suggestModalResults.querySelectorAll(".suggest-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
          const sym = btn.dataset.suggestSymbol;
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
      setSummary(`${t("failed")}
${message}`);
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
})();
