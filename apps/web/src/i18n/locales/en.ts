const en = {
  common: {
    red: 'Red',
    black: 'Black',
    loading: '...',
    notAvailable: '—',
  },
  header: {
    title: 'Xiangqi Master',
    subtitle: '中國象棋',
    about: 'About',
  },
  footer: {
    tagline: 'A modern Chinese Chess platform',
  },
  board: {
    river: {
      chu: '楚河',
      han: '漢界',
    },
  },
  analysis: {
    heading: 'ANALYSIS',
    evaluation: 'Evaluation',
    evaluating: '...',
    bestMove: 'Best Move',
    'bestMove.tooltip': 'Click to play this move',
    depth: 'Depth',
    pv: 'PV',
    'pv.tooltip': "Principal Variation — the engine's predicted best line of play for both sides",
    classification: 'Classification',
    'classification.tooltip': 'Quality rating of the last move: Best → Excellent → Good → Inaccuracy → Mistake → Blunder',
    fen: 'FEN',
    'classification.best': 'BEST',
    'classification.excellent': 'EXCELLENT',
    'classification.good': 'GOOD',
    'classification.inaccuracy': 'INACCURACY',
    'classification.mistake': 'MISTAKE',
    'classification.blunder': 'BLUNDER',
  },
  moves: {
    heading: 'MOVES',
    empty: 'No moves yet',
    columnNumber: '#',
    columnRed: 'Red',
    columnBlack: 'Black',
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
    newGame: 'New Game',
    hint: 'Hint',
    bestMove: 'Best Move',
    undo: 'Undo',
    exportPgn: 'Export PGN',
    id: 'Game',
    status: 'Status',
    'status.thinking': 'Thinking',
    'status.ready': 'Ready',
  },
  newGame: {
    heading: 'New Game',
    play: 'Play',
    title: 'XIANGQI MASTER',
    taglineLine1: 'The legendary Chu-Han Contention',
    taglineLine2: 'One game decides the fate of an empire',
    section: {
      matchType: 'MATCH TYPE',
      difficulty: 'DIFFICULTY',
    },
    start: {
      pvc: 'START GAME',
      pvp: 'START MATCH',
      cvc: 'WATCH BATTLE',
      analysis: 'OPEN BOARD',
    },
    matchType: {
      pvc: {
        label: 'vs Computer',
        chinese: '人機對戰',
        desc: 'Play against the AI engine',
      },
      pvp: {
        label: 'vs Player',
        chinese: '雙人對弈',
        desc: 'Two players, one board',
      },
      cvc: {
        label: 'AI vs AI',
        chinese: '電腦對戰',
        desc: 'Watch two AIs battle',
      },
      analysis: {
        label: 'Analysis',
        chinese: '分析模式',
        desc: 'Free board, explore positions',
      },
    },
    difficulty: {
      easy: {
        label: 'Easy',
        chinese: '初學',
        time: '100ms',
      },
      medium: {
        label: 'Medium',
        chinese: '中級',
        time: '500ms',
      },
      hard: {
        label: 'Hard',
        chinese: '高級',
        time: '1.5s',
      },
      expert: {
        label: 'Expert',
        chinese: '專家',
        time: '5.0s',
      },
    },
  },
  gameOver: {
    redWins: '🏆 Red Wins!',
    blackWins: '🏆 Black Wins!',
    draw: '🤝 Draw!',
    subtitle: 'Game Over',
    playAgain: 'Play Again',
    reviewGame: 'Review Game',
  },
  confirm: {
    newGame: 'Start a new game? The current game will be lost.',
    cancel: 'Cancel',
    ok: 'Confirm',
  },
  about: {
    engine: {
      title: 'Chess Engine',
      description: 'Powered by Pikafish — the strongest open-source Xiangqi engine, derived from Stockfish with NNUE evaluation. This project is grateful to the Pikafish team for their incredible work.',
    },
    author: {
      title: 'Author',
    },
    tech: {
      title: 'Technology',
    },
    license: {
      title: 'License & Source',
    },
    tagline: 'A modern Chinese Chess platform',
    close: 'Close',
  },
  status: {
    redWins: 'Red Wins!',
    blackWins: 'Black Wins!',
    draw: 'Draw!',
    engineThinking: 'Engine thinking...',
    toMove: '{{turn}} to move',
    check: '{{turn}} to move — Check!',
    loading: 'Loading...',
  },
};

export default en;
