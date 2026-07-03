const zh = {
  common: {
    red: '紅方',
    black: '黑方',
    loading: '...',
    notAvailable: '—',
  },
  header: {
    title: 'Xiangqi Master',
    subtitle: '中國象棋',
    about: '關於',
  },
  footer: {
    tagline: '現代中國象棋平台',
  },
  board: {
    river: {
      chu: '楚河',
      han: '漢界',
    },
  },
  analysis: {
    heading: '分析',
    evaluation: '評估',
    evaluating: '...',
    bestMove: '最佳著法',
    'bestMove.tooltip': '點擊執行此著法',
    depth: '深度',
    pv: '變化',
    'pv.tooltip': '主要變化 — 引擎預測雙方最佳應對路線',
    classification: '評級',
    'classification.tooltip': '最後一著的質量評級：最佳 → 卓越 → 好 → 不準 → 失誤 → 漏著',
    fen: 'FEN',
    'classification.best': '最佳',
    'classification.excellent': '卓越',
    'classification.good': '好',
    'classification.inaccuracy': '不準',
    'classification.mistake': '失誤',
    'classification.blunder': '漏著',
  },
  moves: {
    heading: '著法',
    empty: '尚無著法',
    columnNumber: '#',
    columnRed: '紅方',
    columnBlack: '黑方',
    indicator: {
      check: '+',
      capture: 'x',
    },
    annotation: {
      excellent: '!',
      inaccuracy: '?!',
      mistake: '?',
      blunder: '??',
    },
  },
  game: {
    newGame: '新局',
    hint: '提示',
    bestMove: '最佳著法',
    undo: '悔棋',
    resign: '認負',
    id: '對局',
    status: '狀態',
    'status.thinking': '思考中',
    'status.ready': '就緒',
  },
  newGame: {
    heading: '新局',
    play: '開始',
    title: 'XIANGQI MASTER',
    taglineLine1: '楚漢爭霸，千古流傳',
    taglineLine2: '一局定乾坤，勝負決天下',
    section: {
      matchType: '對局模式',
      difficulty: '難度',
    },
    start: {
      pvc: '開始對局',
      pvp: '開始對弈',
      cvc: '觀看對戰',
      analysis: '自由棋盤',
    },
    matchType: {
      pvc: {
        label: '人機對戰',
        chinese: '人機對戰',
        desc: '與 AI 引擎對弈',
      },
      pvp: {
        label: '雙人對弈',
        chinese: '雙人對弈',
        desc: '兩人共享一盤',
      },
      cvc: {
        label: '電腦對戰',
        chinese: '電腦對戰',
        desc: '觀看兩個 AI 對戰',
      },
      analysis: {
        label: '分析模式',
        chinese: '分析模式',
        desc: '自由棋盤，探索局面',
      },
    },
    difficulty: {
      easy: {
        label: '初學',
        chinese: '初學',
        time: '100ms',
      },
      medium: {
        label: '中級',
        chinese: '中級',
        time: '500ms',
      },
      hard: {
        label: '高級',
        chinese: '高級',
        time: '1.5s',
      },
      expert: {
        label: '專家',
        chinese: '專家',
        time: '5.0s',
      },
    },
  },
  gameOver: {
    redWins: '🏆 紅方勝！',
    blackWins: '🏆 黑方勝！',
    draw: '🤝 和棋！',
    subtitle: '對局結束',
    playAgain: '再來一局',
    reviewGame: '回顧對局',
  },
  about: {
    engine: {
      title: '象棋引擎',
      description: '由 Pikafish 驅動 — 最強的開源象棋引擎，源自 Stockfish 並配備 NNUE 評估。本項目感謝 Pikafish 團隊的卓越貢獻。',
    },
    author: {
      title: '作者',
    },
    tech: {
      title: '技術棧',
    },
    license: {
      title: '許可證與源碼',
    },
    tagline: '現代中國象棋平台',
    close: '關閉',
  },
  status: {
    redWins: '紅方勝！',
    blackWins: '黑方勝！',
    draw: '和棋！',
    engineThinking: '引擎思考中...',
    toMove: '{{turn}} 走棋',
    check: '{{turn}} 走棋 — 將軍！',
    loading: '載入中...',
  },
};

export default zh;
