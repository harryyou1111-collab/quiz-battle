import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";

/* ═══════════════════ SOUND ENGINE ═══════════════════ */
let audioStarted = false;
const ensureAudio = async () => {
  if (!audioStarted) { await Tone.start(); audioStarted = true; }
};

const SFX = {
  buzz: () => {
    ensureAudio();
    const s = new Tone.Synth({ oscillator:{type:"triangle"}, envelope:{attack:0.01,decay:0.15,sustain:0,release:0.1}, volume:sfxVolDb }).toDestination();
    s.triggerAttackRelease("C5","8n",Tone.now());
    s.triggerAttackRelease("E5","8n",Tone.now()+0.1);
  },
  correct: () => {
    ensureAudio();
    const s = new Tone.Synth({ oscillator:{type:"square"}, envelope:{attack:0.01,decay:0.2,sustain:0.1,release:0.2}, volume:sfxVolDb-2 }).toDestination();
    s.triggerAttackRelease("C5","16n",Tone.now());
    s.triggerAttackRelease("E5","16n",Tone.now()+0.1);
    s.triggerAttackRelease("G5","16n",Tone.now()+0.2);
    s.triggerAttackRelease("C6","8n",Tone.now()+0.3);
  },
  wrong: () => {
    ensureAudio();
    const s = new Tone.Synth({ oscillator:{type:"sawtooth"}, envelope:{attack:0.01,decay:0.3,sustain:0,release:0.2}, volume:sfxVolDb-4 }).toDestination();
    s.triggerAttackRelease("E4","8n",Tone.now());
    s.triggerAttackRelease("Eb4","8n",Tone.now()+0.15);
    s.triggerAttackRelease("D4","4n",Tone.now()+0.3);
  },
  tick: () => {
    ensureAudio();
    const s = new Tone.NoiseSynth({ noise:{type:"white"}, envelope:{attack:0.001,decay:0.05,sustain:0,release:0.01}, volume:sfxVolDb-10 }).toDestination();
    s.triggerAttackRelease("32n");
  },
  fanfare: () => {
    ensureAudio();
    const s = new Tone.Synth({ oscillator:{type:"triangle"}, envelope:{attack:0.01,decay:0.3,sustain:0.2,release:0.4}, volume:sfxVolDb }).toDestination();
    const notes = ["C5","E5","G5","C6","E6","G5","C6"];
    notes.forEach((n,i) => s.triggerAttackRelease(n,"8n",Tone.now()+i*0.12));
  },
  countdown: () => {
    ensureAudio();
    const s = new Tone.Synth({ oscillator:{type:"sine"}, envelope:{attack:0.01,decay:0.1,sustain:0,release:0.05}, volume:sfxVolDb-6 }).toDestination();
    s.triggerAttackRelease("A5","16n");
  },
};

let bgmPart = null;
let bgmSynth = null;
let bgmStarted = false;
const startBGM = () => {
  if (bgmStarted) return;
  ensureAudio();
  bgmStarted = true;
  bgmSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.3, release: 0.5 },
    volume: -20,
  }).toDestination();
  const notes = [
    {time:"0:0",note:"C4",dur:"8n"},{time:"0:1",note:"E4",dur:"8n"},{time:"0:2",note:"G4",dur:"8n"},{time:"0:3",note:"E4",dur:"8n"},
    {time:"1:0",note:"A3",dur:"8n"},{time:"1:1",note:"C4",dur:"8n"},{time:"1:2",note:"E4",dur:"8n"},{time:"1:3",note:"C4",dur:"8n"},
    {time:"2:0",note:"F3",dur:"8n"},{time:"2:1",note:"A3",dur:"8n"},{time:"2:2",note:"C4",dur:"8n"},{time:"2:3",note:"A3",dur:"8n"},
    {time:"3:0",note:"G3",dur:"8n"},{time:"3:1",note:"B3",dur:"8n"},{time:"3:2",note:"D4",dur:"8n"},{time:"3:3",note:"B3",dur:"8n"},
  ];
  bgmPart = new Tone.Part((time, val) => {
    bgmSynth.triggerAttackRelease(val.note, val.dur, time);
  }, notes.map(n => [n.time, {note:n.note,dur:n.dur}]));
  bgmPart.loop = true;
  bgmPart.loopEnd = "4:0";
  Tone.Transport.bpm.value = 120;
  Tone.Transport.start();
  bgmPart.start(0);
};
const stopBGM = () => {
  if (bgmPart) { bgmPart.stop(); bgmPart.dispose(); bgmPart = null; }
  if (bgmSynth) { bgmSynth.dispose(); bgmSynth = null; }
  bgmStarted = false;
  Tone.Transport.stop();
};

let sfxVolDb = -8;
const setSFXVolume = (pct) => {
  sfxVolDb = pct <= 0 ? -Infinity : -40 + (pct / 100) * 40;
};
const setBGMVolume = (pct) => {
  const db = pct <= 0 ? -Infinity : -50 + (pct / 100) * 35;
  if (bgmSynth) bgmSynth.volume.value = db;
};

/* ═══════════════════ LANGUAGE ═══════════════════ */
const L = {
  ko: {
    title: "퀴즈 배틀", subtitle: "친구들과 퀴즈 대결!",
    modeSelect: "게임 모드", individual: "개인전", team: "팀전",
    playerName: "이름 입력", addPlayer: "참가",
    teamA: "🔴 레드", teamB: "🔵 블루", teamAShort: "레드", teamBShort: "블루",
    players: "참가자", startGame: "게임 시작",
    minPlayers: "최소 2명 필요", minTeamPlayers: "각 팀 최소 1명 필요",
    removeTip: "이름 눌러 제거",
    topic: "주제 선택",
    topicGeneral: "일반 상식", topicAnimal: "동물",
    topicPlace: "세계 여행", topicScience: "과학",
    topicMovie: "영화·드라마", topicFood: "음식·요리",
    topicSports: "스포츠", topicTech: "기술·IT",
    topicCustom: "직접 만들기",
    questionCount: "문제 수", ready: "준비 완료!",
    buzzer: "정답!",
    correct: "정답! 🎉", wrong: "오답! 😢", noOneGot: "아무도 못 맞춤!",
    nextQ: "다음 문제", scoreboard: "점수판",
    bonusRound: "⭐ 보너스 ⭐", bonusDesc: "맞추면 아이템!",
    itemHint: "💡 힌트", itemDouble: "✕2 더블", itemShield: "🛡️ 쉴드",
    gameOver: "게임 종료!", winner: "우승", draw: "무승부!",
    playAgain: "다시 하기", backToLobby: "로비로",
    question: "문제", answer: "정답",
    customQPlaceholder: "문제 입력", customAPlaceholder: "정답 입력",
    customW1: "오답1", customW2: "오답2", customW3: "오답3",
    addQuestion: "추가", customTitle: "나만의 퀴즈",
    needQuestions: "최소 5개 문제 필요", questionsAdded: "개 추가",
    waiting: "준비...", timeUp: "시간 초과!",
    pts: "점", otherTurn: "팀 차례...",
    miniGames: "미니게임", roulette: "룰렛", ladder: "사다리 타기",
    spin: "돌려!", climbing: "출발!", addName: "이름 추가",
    result: "결과", reset: "초기화", rouletteDesc: "누가 당첨?", ladderDesc: "운명의 사다리!",
    nameInput: "이름 입력", resultInput: "결과 입력",
    draw: "제비뽑기", drawDesc: "당첨? 꽝?", drawWin: "당첨", drawLose: "꽝",
    drawPick: "뽑기!", drawWinCount: "당첨 수", drawRemaining: "남은 제비",
    bomb: "숫자 폭탄", bombDesc: "폭탄을 피해라!", bombGuess: "숫자 입력",
    bombGo: "선택!", bombExplode: "💥 폭발!", bombSafe: "세이프!", bombRange: "범위",
    bombNext: "다음 차례", bombWinner: "생존자!",
    teamSplit: "팀 나누기", teamSplitDesc: "랜덤 팀 배정!", teamCount: "팀 수",
    teamShuffle: "섞기!", teamDone: "완료!",
    combo: "콤보", finalRound: "🔥 파이널 라운드 🔥", x2: "x2",
    mvpMostCorrect: "최다 정답", mvpMaxCombo: "최다 콤보", mvpBonusKing: "보너스 킹",
    comboBonus: "콤보 보너스",
  },
  en: {
    title: "Quiz Battle", subtitle: "Challenge your friends!",
    modeSelect: "Game Mode", individual: "Free-for-All", team: "Team Battle",
    playerName: "Enter name", addPlayer: "Join",
    teamA: "🔴 Red", teamB: "🔵 Blue", teamAShort: "Red", teamBShort: "Blue",
    players: "Players", startGame: "Start Game",
    minPlayers: "Need 2+ players", minTeamPlayers: "Each team needs 1+",
    removeTip: "Tap to remove",
    topic: "Choose Topic",
    topicGeneral: "General", topicAnimal: "Animals",
    topicPlace: "World Travel", topicScience: "Science",
    topicMovie: "Movies & TV", topicFood: "Food & Cooking",
    topicSports: "Sports", topicTech: "Tech & IT",
    topicCustom: "Custom",
    questionCount: "Questions", ready: "All Set!",
    buzzer: "BUZZ!",
    correct: "Correct! 🎉", wrong: "Wrong! 😢", noOneGot: "Nobody got it!",
    nextQ: "Next", scoreboard: "Scores",
    bonusRound: "⭐ BONUS ⭐", bonusDesc: "Win an item!",
    itemHint: "💡 Hint", itemDouble: "✕2 Double", itemShield: "🛡️ Shield",
    gameOver: "Game Over!", winner: "Winner", draw: "Tie!",
    playAgain: "Play Again", backToLobby: "Lobby",
    question: "Q", answer: "Answer",
    customQPlaceholder: "Enter question", customAPlaceholder: "Enter answer",
    customW1: "Wrong 1", customW2: "Wrong 2", customW3: "Wrong 3",
    addQuestion: "Add", customTitle: "Create Quiz",
    needQuestions: "Need 5+ questions", questionsAdded: "added",
    waiting: "Ready...", timeUp: "Time's up!",
    pts: "pts", otherTurn: "team's turn...",
    miniGames: "Mini Games", roulette: "Roulette", ladder: "Ladder",
    spin: "Spin!", climbing: "Go!", addName: "Add name",
    result: "Result", reset: "Reset", rouletteDesc: "Who's the lucky one?", ladderDesc: "Climb to your fate!",
    nameInput: "Enter name", resultInput: "Enter result",
    draw: "Lucky Draw", drawDesc: "Win or lose?", drawWin: "Win", drawLose: "Lose",
    drawPick: "Draw!", drawWinCount: "Winners", drawRemaining: "Remaining",
    bomb: "Number Bomb", bombDesc: "Dodge the bomb!", bombGuess: "Enter number",
    bombGo: "Go!", bombExplode: "💥 BOOM!", bombSafe: "Safe!", bombRange: "Range",
    bombNext: "Next turn", bombWinner: "Survivor!",
    teamSplit: "Team Split", teamSplitDesc: "Random team assignment!", teamCount: "Teams",
    teamShuffle: "Shuffle!", teamDone: "Done!",
    combo: "Combo", finalRound: "🔥 FINAL ROUND 🔥", x2: "x2",
    mvpMostCorrect: "Most Correct", mvpMaxCombo: "Max Combo", mvpBonusKing: "Bonus King",
    comboBonus: "Combo Bonus",
  },
};

/* ═══════════════════ QUIZ DATA ═══════════════════ */
const mkQ = (q, a, w1, w2, w3) => ({ q, a, wrongs: [w1, w2, w3] });
const QUIZ = {
  topicGeneral: {
    ko: [
      mkQ("유엔 안전보장이사회 상임이사국 수는?","5개국","6개국","4개국","7개국"),
      mkQ("인간의 DNA 염기쌍 수는 약?","30억 개","10억 개","50억 개","1억 개"),
      mkQ("세계 최초의 프로그래머로 불리는 사람은?","에이다 러브레이스","앨런 튜링","찰스 배비지","폰 노이만"),
      mkQ("국제우주정거장(ISS)의 궤도 고도는 약?","400km","1000km","200km","800km"),
      mkQ("체스에서 퀸이 움직일 수 있는 방향 수는?","8방향","6방향","4방향","12방향"),
      mkQ("인간의 뼈 개수(성인 기준)는?","206개","186개","226개","196개"),
      mkQ("세계에서 가장 깊은 바다는?","마리아나 해구","통가 해구","필리핀 해구","쿠릴 해구"),
      mkQ("원주율(π)의 소수점 둘째자리까지는?","3.14","3.16","3.12","3.18"),
      mkQ("마그나카르타가 제정된 해는?","1215년","1315년","1115년","1415년"),
      mkQ("인터넷의 전신 이름은?","ARPANET","DARPANET","NETLINK","WEBNET"),
      mkQ("인체에서 가장 작은 뼈는?","등자뼈","망치뼈","모루뼈","미골"),
      mkQ("세계에서 가장 많이 사용되는 언어는?","영어","중국어","스페인어","힌디어"),
      mkQ("금의 원소기호는?","Au","Ag","Fe","Cu"),
      mkQ("세계 최초의 대학은?","볼로냐 대학","옥스퍼드","알카라윈","파리 대학"),
      mkQ("적도의 둘레는 약?","4만km","3만km","5만km","6만km"),
      mkQ("바이올린 현의 개수는?","4개","6개","3개","5개"),
      mkQ("셰익스피어의 출생 연도는?","1564년","1620년","1500년","1490년"),
      mkQ("세계에서 가장 큰 사막은?","남극 사막","사하라 사막","고비 사막","아라비아 사막"),
      mkQ("인체 혈액의 pH는 약?","7.4","7.0","6.8","7.8"),
      mkQ("세계에서 가장 오래된 문명은?","수메르","이집트","인더스","중국"),
      mkQ("소리의 속도(공기 중)는 초속 약?","340m","170m","500m","700m"),
      mkQ("노벨상 시상식이 열리는 도시는?","스톡홀름","오슬로","헬싱키","코펜하겐"),
      mkQ("인체에서 가장 큰 근육은?","대둔근","대퇴사두근","광배근","삼두근"),
      mkQ("구글이 설립된 해는?","1998년","2000년","1996년","2002년"),
      mkQ("태양의 표면 온도는 약?","5,500°C","3,000°C","8,000°C","10,000°C"),
      mkQ("세계에서 가장 긴 산맥은?","안데스 산맥","히말라야","로키 산맥","알프스"),
      mkQ("인체에 가장 많은 원소는?","산소","탄소","수소","질소"),
      mkQ("올림픽 오륜기의 색상 수는?","5가지","4가지","6가지","3가지"),
      mkQ("타이타닉호가 침몰한 해는?","1912년","1905년","1920년","1898년"),
      mkQ("세계에서 가장 높은 폭포는?","앙헬 폭포","나이아가라","이과수","빅토리아"),
      mkQ("로마 제국이 멸망한 해(서로마)는?","476년","410년","500년","395년"),
      mkQ("지구에서 달까지의 거리는 약?","38만km","15만km","50만km","100만km"),
      mkQ("커피의 원산지는?","에티오피아","브라질","콜롬비아","베트남"),
      mkQ("인체 세포의 대략적 수는?","37조 개","10조 개","100조 개","1조 개"),
      mkQ("프랑스 혁명이 시작된 해는?","1789년","1776년","1804년","1815년"),
      mkQ("세계에서 가장 작은 대륙은?","오세아니아","유럽","남극","아프리카"),
      mkQ("빛이 태양에서 지구까지 오는 시간은?","약 8분","약 1분","약 30분","약 1시간"),
      mkQ("세계 최초의 인쇄술을 발명한 나라는?","한국","중국","독일","이집트"),
      mkQ("인간 게놈 프로젝트가 완료된 해는?","2003년","2000년","1998년","2010년"),
      mkQ("세계에서 가장 오래된 올림픽 종목은?","육상","수영","레슬링","펜싱"),
      mkQ("지구의 나이는 약?","46억 년","30억 년","60억 년","100억 년"),
      mkQ("모차르트가 태어난 도시는?","잘츠부르크","비엔나","뮌헨","프라하"),
      mkQ("세계에서 가장 긴 강은?","나일강","아마존강","양쯔강","미시시피강"),
      mkQ("인체에서 가장 강한 근육은?","교근(턱)","심장","대퇴사두근","종아리"),
      mkQ("유네스코 본부가 있는 도시는?","파리","뉴욕","제네바","로마"),
      mkQ("달의 중력은 지구의 약 몇 분의 1?","6분의 1","3분의 1","10분의 1","4분의 1"),
      mkQ("세계에서 가장 많이 마시는 음료는?","물 다음 차","커피","콜라","주스"),
      mkQ("아인슈타인이 노벨상을 받은 분야는?","광전효과","상대성이론","핵물리","양자역학"),
      mkQ("지구 표면에서 물이 차지하는 비율은?","약 71%","약 50%","약 85%","약 60%"),
      mkQ("세계 최초의 컴퓨터는?","ENIAC","UNIVAC","콜로서스","Z3"),
    ],
    en: [
      mkQ("How many permanent UN Security Council members?","5","6","4","7"),
      mkQ("Approximate human DNA base pairs?","3 billion","1 billion","5 billion","100 million"),
      mkQ("Who is considered the first programmer?","Ada Lovelace","Alan Turing","Charles Babbage","Von Neumann"),
      mkQ("ISS orbital altitude?","400 km","1000 km","200 km","800 km"),
      mkQ("Directions a chess queen can move?","8","6","4","12"),
      mkQ("Number of bones in an adult human?","206","186","226","196"),
      mkQ("Deepest ocean trench?","Mariana","Tonga","Philippine","Kuril"),
      mkQ("Pi to two decimal places?","3.14","3.16","3.12","3.18"),
      mkQ("Year Magna Carta was signed?","1215","1315","1115","1415"),
      mkQ("Predecessor of the internet?","ARPANET","DARPANET","NETLINK","WEBNET"),
      mkQ("Smallest bone in the human body?","Stapes","Malleus","Incus","Coccyx"),
      mkQ("Most spoken language worldwide?","English","Mandarin","Spanish","Hindi"),
      mkQ("Chemical symbol for gold?","Au","Ag","Fe","Cu"),
      mkQ("Oldest university in the world?","Bologna","Oxford","Al-Qarawiyyin","Paris"),
      mkQ("Circumference of the equator?","40,000 km","30,000 km","50,000 km","60,000 km"),
      mkQ("How many strings on a violin?","4","6","3","5"),
      mkQ("Shakespeare's birth year?","1564","1620","1500","1490"),
      mkQ("World's largest desert?","Antarctic","Sahara","Gobi","Arabian"),
      mkQ("Human blood pH?","7.4","7.0","6.8","7.8"),
      mkQ("Oldest known civilization?","Sumer","Egypt","Indus","China"),
      mkQ("Speed of sound in air?","340 m/s","170 m/s","500 m/s","700 m/s"),
      mkQ("Nobel Prize ceremony city?","Stockholm","Oslo","Helsinki","Copenhagen"),
      mkQ("Largest muscle in the body?","Gluteus maximus","Quadriceps","Latissimus dorsi","Triceps"),
      mkQ("Year Google was founded?","1998","2000","1996","2002"),
      mkQ("Sun's surface temperature?","5,500°C","3,000°C","8,000°C","10,000°C"),
      mkQ("Longest mountain range?","Andes","Himalayas","Rockies","Alps"),
      mkQ("Most abundant element in human body?","Oxygen","Carbon","Hydrogen","Nitrogen"),
      mkQ("Colors in the Olympic rings?","5","4","6","3"),
      mkQ("Year the Titanic sank?","1912","1905","1920","1898"),
      mkQ("World's tallest waterfall?","Angel Falls","Niagara","Iguazu","Victoria"),
      mkQ("Fall of Western Roman Empire?","476 AD","410 AD","500 AD","395 AD"),
      mkQ("Distance from Earth to Moon?","384,000 km","150,000 km","500,000 km","1M km"),
      mkQ("Coffee's origin country?","Ethiopia","Brazil","Colombia","Vietnam"),
      mkQ("Cells in the human body?","37 trillion","10 trillion","100 trillion","1 trillion"),
      mkQ("French Revolution start year?","1789","1776","1804","1815"),
      mkQ("Smallest continent?","Oceania","Europe","Antarctica","Africa"),
      mkQ("Time for light from Sun to Earth?","~8 minutes","~1 minute","~30 minutes","~1 hour"),
      mkQ("First printing press nation?","Korea","China","Germany","Egypt"),
      mkQ("Human Genome Project completed?","2003","2000","1998","2010"),
      mkQ("Oldest Olympic sport?","Track & field","Swimming","Wrestling","Fencing"),
      mkQ("Age of the Earth?","4.6 billion years","3 billion","6 billion","10 billion"),
      mkQ("Mozart's birthplace?","Salzburg","Vienna","Munich","Prague"),
      mkQ("Longest river in the world?","Nile","Amazon","Yangtze","Mississippi"),
      mkQ("Strongest muscle in the body?","Masseter (jaw)","Heart","Quadriceps","Calf"),
      mkQ("UNESCO headquarters city?","Paris","New York","Geneva","Rome"),
      mkQ("Moon's gravity vs Earth's?","1/6","1/3","1/10","1/4"),
      mkQ("Most consumed beverage after water?","Tea","Coffee","Cola","Juice"),
      mkQ("Einstein's Nobel Prize was for?","Photoelectric effect","Relativity","Nuclear physics","Quantum mechanics"),
      mkQ("Earth's surface covered by water?","~71%","~50%","~85%","~60%"),
      mkQ("First electronic computer?","ENIAC","UNIVAC","Colossus","Z3"),
    ],
  },
  topicAnimal: {
    ko: [
      mkQ("문어 심장 수는?","3개","1개","2개","5개"),
      mkQ("기린의 목뼈 개수는?","7개","14개","12개","20개"),
      mkQ("해마에서 출산하는 쪽은?","수컷","암컷","둘 다","교대"),
      mkQ("칼새의 비행 속도는 최대?","시속 170km","시속 100km","시속 250km","시속 70km"),
      mkQ("가장 수명이 긴 동물은?","북극고래","코끼리","거북이","갈라파고스 땅거북"),
      mkQ("개미가 들 수 있는 무게는 자기 체중의?","50배","10배","100배","5배"),
      mkQ("상어가 지구에 나타난 시기는?","4억 년 전","1억 년 전","2억 년 전","6천만 년 전"),
      mkQ("낙지와 문어의 차이점은?","다리 길이","색깔","다리 수","서식지"),
      mkQ("코끼리의 임신 기간은?","22개월","12개월","9개월","30개월"),
      mkQ("세계에서 가장 독이 강한 개구리는?","황금독화살개구리","청독화살개구리","빨간독개구리","줄무늬개구리"),
      mkQ("고래상어의 식성은?","여과 섭식","육식","잡식","초식"),
      mkQ("벌새가 1초에 날갯짓하는 횟수는?","약 80회","약 20회","약 200회","약 10회"),
      mkQ("카멜레온이 색을 바꾸는 주된 이유는?","의사소통","위장","온도조절","구애"),
      mkQ("흰개미의 여왕 수명은?","최대 50년","최대 5년","최대 15년","최대 1년"),
      mkQ("돌고래가 잠잘 때 특이한 점은?","뇌 반쪽만 수면","눈을 뜨고 잔다","물 밖에서 잔다","서서 잔다"),
      mkQ("세계에서 가장 빠른 해양 생물은?","돛새치","참다랑어","백상아리","범고래"),
      mkQ("킹코브라의 먹이는 주로?","다른 뱀","쥐","새","곤충"),
      mkQ("흑표범은 사실 어떤 동물?","표범의 멜라닌 변이","별도의 종","재규어","퓨마"),
      mkQ("나무늘보가 땅에 내려오는 이유는?","배변","먹이","짝짓기","이동"),
      mkQ("세계에서 가장 큰 곤충은?","대왕대벌레","헤라클레스 장수풍뎅이","골리앗 딱정벌레","아틀라스 나방"),
      mkQ("피라냐는 실제로?","겁이 많다","매우 공격적","온순하다","야행성이다"),
      mkQ("알바트로스의 날개 폭은 최대?","약 3.5m","약 2m","약 5m","약 1.5m"),
      mkQ("코뿔소의 뿔은 무엇으로 되어있나?","케라틴","뼈","상아","연골"),
      mkQ("세계에서 가장 시력이 좋은 동물은?","독수리","올빼미","매","고양이"),
      mkQ("맨드릴의 특징은?","알록달록한 얼굴","긴 꼬리","야행성","수영 능력"),
      mkQ("해파리에게 없는 것은?","뇌","촉수","입","세포"),
      mkQ("전기뱀장어가 만드는 전압은 최대?","860V","100V","500V","2000V"),
      mkQ("미어캣이 서서 보초를 서는 이유는?","천적 감시","햇빛 쬐기","소통","체온 조절"),
      mkQ("악어의 성별을 결정하는 것은?","알의 온도","유전자","크기","나이"),
      mkQ("나비의 미각 기관은 어디에?","발","더듬이","입","날개"),
      mkQ("세계에서 가장 큰 양서류는?","중국대왕도롱뇽","골리앗 개구리","일본장수도롱뇽","아홀로틀"),
      mkQ("새우의 심장은 어디에?","머리","꼬리","배","등"),
      mkQ("하이에나는 어떤 과에 속하나?","사향고양이과","개과","고양이과","곰과"),
      mkQ("지렁이에게 있는 심장 수는?","5개","1개","3개","없음"),
      mkQ("북극곰의 털 색은 실제로?","투명","흰색","노란색","회색"),
      mkQ("타조 알 하나의 무게는 약?","1.4kg","500g","3kg","800g"),
      mkQ("거북이는 등딱지를 벗을 수 있나?","아니오","예","종에 따라","어릴 때만"),
      mkQ("세계에서 가장 긴 뱀은?","그물무늬비단뱀","아나콘다","킹코브라","블랙맘바"),
      mkQ("까마귀가 할 수 있는 놀라운 것은?","도구 사용","수영","야광","독 생산"),
      mkQ("코알라가 하루에 잠자는 시간은?","약 22시간","약 12시간","약 8시간","약 16시간"),
      mkQ("세계에서 가장 작은 포유류는?","뒤쥐벌꿀박쥐","난쟁이쥐","땃쥐","피그미주머니쥐"),
      mkQ("오리너구리의 특이한 점은?","독이 있다","날 수 있다","뿔이 있다","빛을 낸다"),
      mkQ("범고래의 다른 이름은?","킬러 웨일","바다사자","흰돌고래","향유고래"),
      mkQ("세계에서 가장 느린 동물은?","세발가락나무늘보","거북","달팽이","해마"),
      mkQ("플라밍고가 분홍색인 이유는?","먹이(새우)","유전","환경","나이"),
      mkQ("여왕벌이 하루에 낳는 알 수는?","약 2000개","약 100개","약 500개","약 50개"),
      mkQ("카피바라는 어떤 동물과?","쥐과","돼지과","개과","소과"),
      mkQ("세계에서 가장 무거운 곤충은?","골리앗 딱정벌레","헤라클레스 장수풍뎅이","사슴벌레","장수말벌"),
      mkQ("참치가 수영 중 멈추면?","질식한다","쉬는 것","속도가 줄뿐","아무 일 없다"),
      mkQ("가장 오래 사는 곤충은?","흰개미 여왕","매미","여왕벌","딱정벌레"),
    ],
    en: [
      mkQ("How many hearts does an octopus have?","3","1","2","5"),
      mkQ("How many neck bones does a giraffe have?","7","14","12","20"),
      mkQ("Which seahorse gives birth?","Male","Female","Both","Alternate"),
      mkQ("Max speed of a swift?","170 km/h","100 km/h","250 km/h","70 km/h"),
      mkQ("Longest-lived animal?","Bowhead whale","Elephant","Tortoise","Galápagos tortoise"),
      mkQ("Ants can carry how many times their weight?","50x","10x","100x","5x"),
      mkQ("When did sharks first appear?","400M years ago","100M years ago","200M years ago","60M years ago"),
      mkQ("Elephant gestation period?","22 months","12 months","9 months","30 months"),
      mkQ("Most poisonous frog?","Golden poison dart","Blue poison dart","Red frog","Striped frog"),
      mkQ("Whale shark's diet type?","Filter feeder","Carnivore","Omnivore","Herbivore"),
      mkQ("Hummingbird wingbeats per second?","~80","~20","~200","~10"),
      mkQ("Main reason chameleons change color?","Communication","Camouflage","Temperature","Mating"),
      mkQ("Termite queen lifespan?","Up to 50 years","Up to 5 years","Up to 15 years","Up to 1 year"),
      mkQ("How do dolphins sleep?","Half-brain sleep","Eyes open","Above water","Standing"),
      mkQ("Fastest marine animal?","Sailfish","Bluefin tuna","Great white","Orca"),
      mkQ("King cobra mainly eats?","Other snakes","Mice","Birds","Insects"),
      mkQ("A black panther is actually?","Melanistic leopard","Separate species","Jaguar","Puma"),
      mkQ("Why do sloths come to the ground?","To defecate","To eat","To mate","To travel"),
      mkQ("Largest insect in the world?","Giant stick insect","Hercules beetle","Goliath beetle","Atlas moth"),
      mkQ("Piranhas are actually?","Timid","Very aggressive","Gentle","Nocturnal"),
      mkQ("Albatross max wingspan?","~3.5m","~2m","~5m","~1.5m"),
      mkQ("Rhino horn is made of?","Keratin","Bone","Ivory","Cartilage"),
      mkQ("Animal with the best eyesight?","Eagle","Owl","Hawk","Cat"),
      mkQ("What jellyfish lack?","Brain","Tentacles","Mouth","Cells"),
      mkQ("Electric eel max voltage?","860V","100V","500V","2000V"),
      mkQ("Why do meerkats stand guard?","Watch for predators","Sunbathe","Communicate","Thermoregulate"),
      mkQ("What determines crocodile gender?","Egg temperature","Genetics","Size","Age"),
      mkQ("Where are butterfly taste sensors?","Feet","Antennae","Mouth","Wings"),
      mkQ("Largest amphibian?","Chinese giant salamander","Goliath frog","Japanese salamander","Axolotl"),
      mkQ("Where is a shrimp's heart?","Head","Tail","Belly","Back"),
      mkQ("Hyenas belong to which family?","Civet family","Dog family","Cat family","Bear family"),
      mkQ("How many hearts does a worm have?","5","1","3","0"),
      mkQ("Polar bear fur is actually?","Transparent","White","Yellow","Gray"),
      mkQ("Weight of one ostrich egg?","~1.4 kg","~500g","~3 kg","~800g"),
      mkQ("Can a turtle leave its shell?","No","Yes","Some species","When young"),
      mkQ("World's longest snake?","Reticulated python","Anaconda","King cobra","Black mamba"),
      mkQ("Remarkable ability of crows?","Tool use","Swimming","Glowing","Producing venom"),
      mkQ("Hours a koala sleeps per day?","~22","~12","~8","~16"),
      mkQ("Smallest mammal?","Bumblebee bat","Pygmy mouse","Shrew","Pygmy possum"),
      mkQ("Platypus unique trait?","Venomous","Can fly","Has horns","Bioluminescent"),
      mkQ("Another name for orcas?","Killer whales","Sea lions","Belugas","Sperm whales"),
      mkQ("Slowest animal?","Three-toed sloth","Turtle","Snail","Seahorse"),
      mkQ("Why are flamingos pink?","Diet (shrimp)","Genetics","Environment","Age"),
      mkQ("Eggs a queen bee lays daily?","~2000","~100","~500","~50"),
      mkQ("Capybara is related to?","Rodents","Pigs","Dogs","Cattle"),
      mkQ("Heaviest insect?","Goliath beetle","Hercules beetle","Stag beetle","Hornet"),
      mkQ("If tuna stops swimming?","Suffocates","Rests","Slows down","Nothing"),
      mkQ("Longest-living insect?","Termite queen","Cicada","Queen bee","Beetle"),
      mkQ("Mandrill's notable feature?","Colorful face","Long tail","Nocturnal","Swimming"),
      mkQ("Deepest-diving mammal?","Cuvier's beaked whale","Sperm whale","Elephant seal","Blue whale"),
    ],
  },
  topicPlace: {
    ko: [
      mkQ("세계에서 가장 큰 섬은?","그린란드","보르네오","마다가스카르","수마트라"),
      mkQ("마추픽추는 해발 약 몇 m?","2,430m","1,200m","3,800m","4,500m"),
      mkQ("세계에서 가장 긴 해저터널은?","영불해저터널","세이칸 터널","고트하르트 터널","래르달 터널"),
      mkQ("사해의 해발 고도는?","해수면 아래 430m","해수면","해수면 아래 100m","해수면 아래 200m"),
      mkQ("세계에서 가장 높은 수도는?","라파스","키토","보고타","카트만두"),
      mkQ("아이슬란드의 수도는?","레이캬비크","오슬로","헬싱키","코펜하겐"),
      mkQ("세계에서 가장 큰 호수는?","카스피해","슈피리어호","빅토리아호","바이칼호"),
      mkQ("앙코르와트가 있는 나라는?","캄보디아","태국","베트남","미얀마"),
      mkQ("세계에서 가장 긴 해안선을 가진 나라?","캐나다","인도네시아","노르웨이","호주"),
      mkQ("페트라 유적이 있는 나라는?","요르단","이집트","이라크","이란"),
      mkQ("세계에서 가장 높은 빌딩은?","부르즈 할리파","상하이 타워","롯데타워","도쿄 스카이트리"),
      mkQ("부탄의 국가 행복지수를 뭐라 하나?","GNH","GDP","GHI","GPI"),
      mkQ("모로코의 옛 수도는?","페즈","카사블랑카","마라케시","라바트"),
      mkQ("세계에서 가장 건조한 사막은?","아타카마","사하라","고비","남극"),
      mkQ("나미비아의 유명한 사막은?","나미브 사막","칼라하리","사하라","고비"),
      mkQ("세계에서 가장 많은 섬을 가진 나라?","스웨덴","인도네시아","필리핀","일본"),
      mkQ("바티칸의 면적은 약?","0.44km²","1km²","5km²","10km²"),
      mkQ("세계에서 가장 오래된 도시 중 하나는?","다마스쿠스","로마","아테네","카이로"),
      mkQ("세계에서 가장 큰 산호초는?","그레이트 배리어 리프","벨리즈 산호초","홍해 산호초","팔라우 산호초"),
      mkQ("볼리비아의 우유니 소금사막 면적은?","약 10,000km²","약 1,000km²","약 50,000km²","약 500km²"),
      mkQ("세계 7대 불가사의 중 현존하는 것은?","기자 피라미드","바빌론 공중정원","로도스 거상","알렉산드리아 등대"),
      mkQ("북극점에 가장 가까운 도시는?","론위에아르뷔엔","트롬쇠","무르만스크","앵커리지"),
      mkQ("세계에서 가장 좁은 나라는?","칠레","노르웨이","감비아","베트남"),
      mkQ("모나코의 면적은 약?","2km²","10km²","50km²","100km²"),
      mkQ("세계에서 가장 높은 도로는 어디?","카르둥라 패스","에베레스트 베이스캠프","티베트 고원","안데스 도로"),
      mkQ("세계에서 가장 긴 지명을 가진 곳은?","방콕(태국)","웨일스 마을","뉴질랜드 언덕","하와이 물고기"),
      mkQ("케냐의 수도는?","나이로비","몸바사","키수무","나쿠루"),
      mkQ("세계에서 가장 북쪽의 수도는?","레이캬비크","헬싱키","오슬로","모스크바"),
      mkQ("터키의 옛 이름은?","오스만 제국","비잔틴","페르시아","로마"),
      mkQ("미국에서 가장 작은 주는?","로드아일랜드","델라웨어","코네티컷","버몬트"),
      mkQ("세계에서 가장 깊은 호수는?","바이칼호","탕가니카호","카스피해","티티카카호"),
      mkQ("그랜드 캐니언의 나이는 약?","600만 년","100만 년","1억 년","1000만 년"),
      mkQ("세계에서 가장 활동적인 화산은?","킬라우에아","에트나","베수비오","후지산"),
      mkQ("호주의 수도는?","캔버라","시드니","멜버른","브리즈번"),
      mkQ("세계에서 가장 큰 광장은?","천안문 광장","붉은 광장","콩코르드 광장","트라팔가 광장"),
      mkQ("남극 대륙을 처음 발견한 해는?","1820년","1900년","1750년","1600년"),
      mkQ("세계에서 가장 많은 화산을 가진 나라?","인도네시아","일본","미국","칠레"),
      mkQ("사우디아라비아의 수도는?","리야드","제다","메카","메디나"),
      mkQ("몽골의 수도는?","울란바토르","다르한","에르데네트","초이발산"),
      mkQ("세계에서 가장 큰 내륙국은?","카자흐스탄","몽골","차드","에티오피아"),
      mkQ("뉴질랜드의 원주민은?","마오리족","아보리진","이누이트","사모아인"),
      mkQ("세계에서 가장 큰 열대우림은?","아마존","콩고","동남아 열대우림","다인트리"),
      mkQ("에베레스트의 높이는?","8,849m","8,611m","8,200m","9,100m"),
      mkQ("세계에서 가장 큰 반도는?","아라비아 반도","인도 반도","스칸디나비아","발칸 반도"),
      mkQ("체르노빌이 있는 나라는?","우크라이나","러시아","벨라루스","폴란드"),
      mkQ("세계에서 가장 긴 비행 노선 출발지는?","싱가포르","두바이","시드니","뉴욕"),
      mkQ("독일의 수도는?","베를린","뮌헨","프랑크푸르트","함부르크"),
      mkQ("세계에서 가장 많은 언어를 사용하는 나라?","파푸아뉴기니","인도","인도네시아","나이지리아"),
      mkQ("갈라파고스 제도는 어느 나라 소속?","에콰도르","페루","콜롬비아","칠레"),
      mkQ("히말라야는 어느 두 판이 충돌해서 생겼나?","인도판과 유라시아판","태평양판","아프리카판","남극판"),
    ],
    en: [
      mkQ("World's largest island?","Greenland","Borneo","Madagascar","Sumatra"),
      mkQ("Machu Picchu's elevation?","~2,430m","~1,200m","~3,800m","~4,500m"),
      mkQ("Longest undersea tunnel?","Channel Tunnel","Seikan","Gotthard","Lærdal"),
      mkQ("Dead Sea elevation?","430m below sea level","Sea level","100m below","200m below"),
      mkQ("Highest capital city?","La Paz","Quito","Bogotá","Kathmandu"),
      mkQ("Capital of Iceland?","Reykjavik","Oslo","Helsinki","Copenhagen"),
      mkQ("World's largest lake?","Caspian Sea","Superior","Victoria","Baikal"),
      mkQ("Angkor Wat is in?","Cambodia","Thailand","Vietnam","Myanmar"),
      mkQ("Country with longest coastline?","Canada","Indonesia","Norway","Australia"),
      mkQ("Petra ruins are in?","Jordan","Egypt","Iraq","Iran"),
      mkQ("World's tallest building?","Burj Khalifa","Shanghai Tower","Lotte Tower","Tokyo Skytree"),
      mkQ("Bhutan's happiness index?","GNH","GDP","GHI","GPI"),
      mkQ("Driest desert on Earth?","Atacama","Sahara","Gobi","Antarctic"),
      mkQ("Namibia's famous desert?","Namib","Kalahari","Sahara","Gobi"),
      mkQ("Country with most islands?","Sweden","Indonesia","Philippines","Japan"),
      mkQ("Vatican City area?","0.44 km²","1 km²","5 km²","10 km²"),
      mkQ("One of the oldest cities?","Damascus","Rome","Athens","Cairo"),
      mkQ("Largest coral reef?","Great Barrier Reef","Belize Reef","Red Sea Reef","Palau Reef"),
      mkQ("Uyuni Salt Flat area?","~10,000 km²","~1,000 km²","~50,000 km²","~500 km²"),
      mkQ("Only surviving ancient wonder?","Great Pyramid","Hanging Gardens","Colossus","Lighthouse"),
      mkQ("Nearest city to North Pole?","Longyearbyen","Tromsø","Murmansk","Anchorage"),
      mkQ("Narrowest country?","Chile","Norway","Gambia","Vietnam"),
      mkQ("Monaco's area?","~2 km²","~10 km²","~50 km²","~100 km²"),
      mkQ("Capital of Kenya?","Nairobi","Mombasa","Kisumu","Nakuru"),
      mkQ("Northernmost capital?","Reykjavik","Helsinki","Oslo","Moscow"),
      mkQ("Smallest US state?","Rhode Island","Delaware","Connecticut","Vermont"),
      mkQ("Deepest lake?","Baikal","Tanganyika","Caspian","Titicaca"),
      mkQ("Grand Canyon's age?","~6 million years","~1 million","~100 million","~10 million"),
      mkQ("Most active volcano?","Kīlauea","Etna","Vesuvius","Fuji"),
      mkQ("Capital of Australia?","Canberra","Sydney","Melbourne","Brisbane"),
      mkQ("Largest square/plaza?","Tiananmen","Red Square","Concorde","Trafalgar"),
      mkQ("Antarctica first sighted?","1820","1900","1750","1600"),
      mkQ("Country with most volcanoes?","Indonesia","Japan","USA","Chile"),
      mkQ("Capital of Saudi Arabia?","Riyadh","Jeddah","Mecca","Medina"),
      mkQ("Capital of Mongolia?","Ulaanbaatar","Darkhan","Erdenet","Choibalsan"),
      mkQ("Largest landlocked country?","Kazakhstan","Mongolia","Chad","Ethiopia"),
      mkQ("Indigenous people of NZ?","Māori","Aboriginal","Inuit","Samoan"),
      mkQ("Largest tropical rainforest?","Amazon","Congo","Southeast Asian","Daintree"),
      mkQ("Height of Everest?","8,849m","8,611m","8,200m","9,100m"),
      mkQ("Largest peninsula?","Arabian","Indian","Scandinavian","Balkan"),
      mkQ("Chernobyl is in?","Ukraine","Russia","Belarus","Poland"),
      mkQ("Capital of Germany?","Berlin","Munich","Frankfurt","Hamburg"),
      mkQ("Country with most languages?","Papua New Guinea","India","Indonesia","Nigeria"),
      mkQ("Galápagos Islands belong to?","Ecuador","Peru","Colombia","Chile"),
      mkQ("Himalayas formed by which plates?","Indian & Eurasian","Pacific","African","Antarctic"),
      mkQ("Highest road in the world?","Khardung La","Everest Base Camp","Tibetan Plateau","Andes Road"),
      mkQ("World's largest inland sea?","Caspian Sea","Aral Sea","Dead Sea","Black Sea"),
      mkQ("Country spanning most time zones?","France","Russia","USA","UK"),
      mkQ("Oldest national park?","Yellowstone","Banff","Kruger","Yosemite"),
      mkQ("Largest delta in the world?","Ganges Delta","Mekong","Nile","Amazon"),
    ],
  },
  topicScience: {
    ko: [
      mkQ("빛은 파동인가 입자인가?","둘 다","파동만","입자만","둘 다 아님"),
      mkQ("인체에서 가장 큰 세포는?","난자","적혈구","백혈구","신경세포"),
      mkQ("블랙홀의 경계를 뭐라 하나?","사건의 지평선","특이점","광구","코로나"),
      mkQ("원소 주기율표를 만든 사람은?","멘델레예프","뉴턴","아인슈타인","보어"),
      mkQ("DNA 이중나선을 발견한 사람은?","왓슨과 크릭","멘델","다윈","파스퇴르"),
      mkQ("우주에서 가장 풍부한 원소는?","수소","헬륨","산소","탄소"),
      mkQ("인체의 물 비율은 약?","60%","80%","40%","90%"),
      mkQ("반도체의 주 재료는?","실리콘","구리","알루미늄","금"),
      mkQ("세포분열 시 DNA를 복제하는 효소는?","DNA 중합효소","RNA 중합효소","리가아제","헬리카아제"),
      mkQ("플랑크 상수의 단위는?","J·s","m/s","kg·m","N·m"),
      mkQ("인간 게놈의 유전자 수는 약?","2만 개","10만 개","5만 개","1만 개"),
      mkQ("안드로메다 은하까지의 거리는?","250만 광년","100만 광년","500만 광년","1000만 광년"),
      mkQ("양자역학의 불확정성 원리를 제안한 사람?","하이젠베르크","슈뢰딩거","보어","디랙"),
      mkQ("지구 핵의 주 성분은?","철과 니켈","마그마","실리콘","알루미늄"),
      mkQ("태양 에너지의 원천은?","핵융합","핵분열","화학반응","중력"),
      mkQ("인체 혈관의 총 길이는 약?","10만km","1만km","50만km","1000km"),
      mkQ("물 분자 사이의 결합은?","수소결합","이온결합","공유결합","금속결합"),
      mkQ("뇌에서 가장 큰 부분은?","대뇌","소뇌","뇌간","시상"),
      mkQ("1 나노미터는?","10억분의 1미터","100만분의 1미터","1000분의 1미터","1조분의 1미터"),
      mkQ("CRISPR는 무엇에 사용되나?","유전자 편집","단백질 합성","세포 분열","바이러스 치료"),
      mkQ("목성의 대적점은 무엇인가?","거대한 폭풍","화산","바다","산"),
      mkQ("화성의 하늘 색은?","붉은색/분홍색","파란색","초록색","검정색"),
      mkQ("절대 영도에서 분자의 운동은?","거의 정지","활발","없음","폭발"),
      mkQ("진핵세포와 원핵세포의 차이는?","핵막 유무","크기만","세포벽","리보솜"),
      mkQ("다크 에너지가 우주에서 차지하는 비율은?","약 68%","약 30%","약 50%","약 5%"),
      mkQ("인체에서 가장 작은 세포는?","정자","적혈구","혈소판","신경세포"),
      mkQ("힉스 보손이 발견된 해는?","2012년","2008년","2015년","2020년"),
      mkQ("인간의 뇌 무게는 약?","1.4kg","3kg","800g","2.5kg"),
      mkQ("초전도체의 특성은?","전기저항 제로","자기장 차단","빛 흡수","열 발생"),
      mkQ("프리즘으로 빛을 분해하면 몇 가지 색?","7가지","5가지","3가지","무한"),
      mkQ("지구 자전 속도는 적도에서 약?","시속 1,670km","시속 500km","시속 3,000km","시속 100km"),
      mkQ("인체에서 가장 단단한 물질은?","치아 에나멜","뼈","손톱","연골"),
      mkQ("우주의 나이는 약?","138억 년","100억 년","200억 년","50억 년"),
      mkQ("광합성에서 물이 분해되어 생기는 것은?","산소","이산화탄소","질소","수소"),
      mkQ("뉴런 사이의 연결부를 뭐라 하나?","시냅스","축삭","수상돌기","미엘린"),
      mkQ("화학 원소 중 가장 무거운 자연 원소는?","우라늄","플루토늄","라듐","금"),
      mkQ("지구의 자기장을 만드는 것은?","외핵의 대류","맨틀","지각","내핵"),
      mkQ("RNA와 DNA의 당 차이는?","리보스 vs 디옥시리보스","포도당 vs 과당","같다","갈락토스 vs 리보스"),
      mkQ("1광년은 약 몇 km?","9.46조km","1조km","100조km","1000억km"),
      mkQ("밀도가 가장 높은 행성은?","지구","목성","토성","금성"),
      mkQ("인체에서 산소를 운반하는 것은?","헤모글로빈","백혈구","혈소판","혈장"),
      mkQ("양자 컴퓨터의 기본 단위는?","큐비트","비트","바이트","트랜지스터"),
      mkQ("태양계에서 가장 많은 위성을 가진 행성?","토성","목성","천왕성","해왕성"),
      mkQ("mRNA 백신의 원리는?","단백질 합성 지시","바이러스 약화","항체 주입","세포 파괴"),
      mkQ("지구에서 가장 오래된 암석의 나이는?","약 40억 년","약 10억 년","약 46억 년","약 20억 년"),
      mkQ("초신성이란?","별의 폭발","새로운 별 탄생","은하 충돌","행성 형성"),
      mkQ("인간 장내 세균 수는 체세포보다?","비슷하거나 더 많다","훨씬 적다","10배 많다","100배 많다"),
      mkQ("페니실린을 발견한 사람은?","알렉산더 플레밍","루이 파스퇴르","로베르트 코흐","에드워드 제너"),
      mkQ("양성자의 전하는?","+1","0","-1","+2"),
      mkQ("멘델레예프가 주기율표에서 예측한 원소는?","갈륨","네온","헬륨","라돈"),
    ],
    en: [
      mkQ("Is light a wave or particle?","Both","Wave only","Particle only","Neither"),
      mkQ("Largest cell in the human body?","Egg cell","Red blood cell","White blood cell","Neuron"),
      mkQ("Boundary of a black hole?","Event horizon","Singularity","Photosphere","Corona"),
      mkQ("Who created the periodic table?","Mendeleev","Newton","Einstein","Bohr"),
      mkQ("Who discovered the DNA double helix?","Watson & Crick","Mendel","Darwin","Pasteur"),
      mkQ("Most abundant element in the universe?","Hydrogen","Helium","Oxygen","Carbon"),
      mkQ("Water percentage in human body?","~60%","~80%","~40%","~90%"),
      mkQ("Main semiconductor material?","Silicon","Copper","Aluminum","Gold"),
      mkQ("Enzyme that copies DNA?","DNA polymerase","RNA polymerase","Ligase","Helicase"),
      mkQ("Planck's constant unit?","J·s","m/s","kg·m","N·m"),
      mkQ("Genes in the human genome?","~20,000","~100,000","~50,000","~10,000"),
      mkQ("Distance to Andromeda?","2.5M light-years","1M light-years","5M light-years","10M light-years"),
      mkQ("Who proposed the uncertainty principle?","Heisenberg","Schrödinger","Bohr","Dirac"),
      mkQ("Earth's core mainly made of?","Iron & nickel","Magma","Silicon","Aluminum"),
      mkQ("Source of the Sun's energy?","Nuclear fusion","Nuclear fission","Chemical reaction","Gravity"),
      mkQ("Total length of human blood vessels?","~100,000 km","~10,000 km","~500,000 km","~1,000 km"),
      mkQ("Bond between water molecules?","Hydrogen bond","Ionic","Covalent","Metallic"),
      mkQ("Largest part of the brain?","Cerebrum","Cerebellum","Brainstem","Thalamus"),
      mkQ("What is 1 nanometer?","1 billionth of a meter","1 millionth","1 thousandth","1 trillionth"),
      mkQ("What is CRISPR used for?","Gene editing","Protein synthesis","Cell division","Virus treatment"),
      mkQ("Jupiter's Great Red Spot is?","Giant storm","Volcano","Ocean","Mountain"),
      mkQ("Color of Mars sky?","Reddish/pink","Blue","Green","Black"),
      mkQ("Molecular motion at absolute zero?","Nearly stops","Active","None","Explosive"),
      mkQ("Eukaryote vs prokaryote difference?","Nuclear membrane","Size only","Cell wall","Ribosomes"),
      mkQ("Dark energy's share of the universe?","~68%","~30%","~50%","~5%"),
      mkQ("Year Higgs boson was discovered?","2012","2008","2015","2020"),
      mkQ("Human brain weight?","~1.4 kg","~3 kg","~800g","~2.5 kg"),
      mkQ("Superconductor property?","Zero resistance","Magnetic shielding","Light absorption","Heat generation"),
      mkQ("Colors when light passes through a prism?","7","5","3","Infinite"),
      mkQ("Earth's rotation speed at equator?","~1,670 km/h","~500 km/h","~3,000 km/h","~100 km/h"),
      mkQ("Hardest substance in human body?","Tooth enamel","Bone","Nail","Cartilage"),
      mkQ("Age of the universe?","~13.8 billion years","~10 billion","~20 billion","~5 billion"),
      mkQ("What does water splitting produce in photosynthesis?","Oxygen","CO2","Nitrogen","Hydrogen"),
      mkQ("Connection between neurons?","Synapse","Axon","Dendrite","Myelin"),
      mkQ("Heaviest naturally occurring element?","Uranium","Plutonium","Radium","Gold"),
      mkQ("What creates Earth's magnetic field?","Outer core convection","Mantle","Crust","Inner core"),
      mkQ("Sugar difference between RNA and DNA?","Ribose vs deoxyribose","Glucose vs fructose","Same","Galactose vs ribose"),
      mkQ("One light-year in km?","9.46 trillion km","1 trillion km","100 trillion km","100 billion km"),
      mkQ("Densest planet?","Earth","Jupiter","Saturn","Venus"),
      mkQ("What carries oxygen in blood?","Hemoglobin","White blood cells","Platelets","Plasma"),
      mkQ("Basic unit of quantum computing?","Qubit","Bit","Byte","Transistor"),
      mkQ("Planet with most moons?","Saturn","Jupiter","Uranus","Neptune"),
      mkQ("How mRNA vaccines work?","Instruct protein synthesis","Weaken virus","Inject antibodies","Destroy cells"),
      mkQ("Age of oldest rocks on Earth?","~4 billion years","~1 billion","~4.6 billion","~2 billion"),
      mkQ("What is a supernova?","Star explosion","New star birth","Galaxy collision","Planet formation"),
      mkQ("Gut bacteria vs body cells?","Similar or more","Far fewer","10x more","100x more"),
      mkQ("Who discovered penicillin?","Alexander Fleming","Louis Pasteur","Robert Koch","Edward Jenner"),
      mkQ("Charge of a proton?","+1","0","-1","+2"),
      mkQ("Element Mendeleev predicted?","Gallium","Neon","Helium","Radon"),
      mkQ("Smallest subatomic particle?","Quark","Electron","Proton","Neutron"),
    ],
  },
  topicMovie: {
    ko: [
      mkQ("아카데미 최다 수상 영화는?","벤허/타이타닉/반지의 제왕","대부","쉰들러 리스트","포레스트 검프"),
      mkQ("스타워즈의 감독은?","조지 루카스","스티븐 스필버그","제임스 카메론","크리스토퍼 놀란"),
      mkQ("기생충의 감독은?","봉준호","박찬욱","김기덕","이창동"),
      mkQ("MCU 첫 번째 영화는?","아이언맨","캡틴 아메리카","토르","헐크"),
      mkQ("쇼생크 탈출의 원작자는?","스티븐 킹","존 그리샴","톰 클랜시","댄 브라운"),
      mkQ("타이타닉이 개봉한 해는?","1997년","1995년","2000년","1993년"),
      mkQ("넷플릭스가 스트리밍을 시작한 해는?","2007년","2010년","2005년","2012년"),
      mkQ("오징어 게임 시즌1 참가자 수는?","456명","500명","300명","100명"),
      mkQ("매트릭스에서 빨간 약의 의미는?","진실을 보는 것","잠드는 것","힘을 얻는 것","시간여행"),
      mkQ("역대 세계 흥행 1위 영화는?","아바타","어벤져스:엔드게임","타이타닉","스타워즈"),
      mkQ("디즈니가 픽사를 인수한 해는?","2006년","2010년","2000년","2012년"),
      mkQ("크리스토퍼 놀란의 데뷔작은?","팔로잉","메멘토","인셉션","배트맨 비긴즈"),
      mkQ("왕좌의 게임 시즌 수는?","8시즌","7시즌","10시즌","6시즌"),
      mkQ("스튜디오 지브리를 설립한 감독은?","미야자키 하야오","오시이 마모루","신카이 마코토","안노 히데아키"),
      mkQ("인터스텔라에서 여행하는 곳은?","웜홀/블랙홀","화성","안드로메다","달"),
      mkQ("대부에서 말론 브란도의 역할은?","비토 콜레오네","마이클","소니","톰 헤이건"),
      mkQ("해리 포터 시리즈의 책 수는?","7권","8권","6권","5권"),
      mkQ("조커(2019)에서 주인공의 본명은?","아서 플렉","잭 네이피어","에드워드 니그마","하비 덴트"),
      mkQ("트루먼 쇼의 핵심 설정은?","인생이 TV쇼","타임루프","가상현실","기억상실"),
      mkQ("올드보이(2003) 감독은?","박찬욱","봉준호","김지운","이창동"),
      mkQ("반지의 제왕 촬영 국가는?","뉴질랜드","아일랜드","스코틀랜드","노르웨이"),
      mkQ("브레이킹 배드의 주인공 직업은?","화학 교사","물리학자","의사","변호사"),
      mkQ("아카데미 작품상을 받은 첫 애니메이션은?","없음(아직)","토이스토리","업","코코"),
      mkQ("쿠엔틴 타란티노의 대표작은?","펄프 픽션","인셉션","매트릭스","대부"),
      mkQ("이터널 선샤인의 주제는?","기억 삭제","시간여행","꿈","평행우주"),
      mkQ("흑백영화 최초의 유성영화는?","재즈 싱어","시민 케인","사이코","노스페라투"),
      mkQ("기생충이 칸 황금종려상을 받은 해?","2019년","2020년","2018년","2021년"),
      mkQ("다크 나이트에서 조커 배우는?","히스 레저","잭 니콜슨","호아킨 피닉스","재러드 레토"),
      mkQ("블랙 미러의 주된 주제는?","기술의 부작용","범죄","로맨스","역사"),
      mkQ("ET에서 ET가 좋아하는 과자는?","리시스 피시스","M&M","스키틀즈","킷캣"),
    ],
    en: [
      mkQ("Most Oscar-winning films (11 each)?","Ben-Hur/Titanic/LOTR","The Godfather","Schindler's List","Forrest Gump"),
      mkQ("Star Wars director?","George Lucas","Steven Spielberg","James Cameron","Christopher Nolan"),
      mkQ("Parasite director?","Bong Joon-ho","Park Chan-wook","Kim Ki-duk","Lee Chang-dong"),
      mkQ("First MCU film?","Iron Man","Captain America","Thor","Hulk"),
      mkQ("Shawshank Redemption author?","Stephen King","John Grisham","Tom Clancy","Dan Brown"),
      mkQ("Titanic release year?","1997","1995","2000","1993"),
      mkQ("Netflix started streaming in?","2007","2010","2005","2012"),
      mkQ("Squid Game S1 total players?","456","500","300","100"),
      mkQ("Red pill means in The Matrix?","Seeing truth","Sleeping","Gaining power","Time travel"),
      mkQ("Highest-grossing film ever?","Avatar","Avengers: Endgame","Titanic","Star Wars"),
      mkQ("Disney acquired Pixar in?","2006","2010","2000","2012"),
      mkQ("Nolan's debut film?","Following","Memento","Inception","Batman Begins"),
      mkQ("Game of Thrones total seasons?","8","7","10","6"),
      mkQ("Studio Ghibli founder?","Hayao Miyazaki","Mamoru Oshii","Makoto Shinkai","Hideaki Anno"),
      mkQ("Interstellar travels through?","Wormhole/black hole","Mars","Andromeda","Moon"),
      mkQ("Brando's role in The Godfather?","Vito Corleone","Michael","Sonny","Tom Hagen"),
      mkQ("Harry Potter book count?","7","8","6","5"),
      mkQ("Joker (2019) protagonist name?","Arthur Fleck","Jack Napier","Edward Nigma","Harvey Dent"),
      mkQ("The Truman Show premise?","Life is a TV show","Time loop","VR","Amnesia"),
      mkQ("Oldboy (2003) director?","Park Chan-wook","Bong Joon-ho","Kim Jee-woon","Lee Chang-dong"),
      mkQ("LOTR filmed in?","New Zealand","Ireland","Scotland","Norway"),
      mkQ("Breaking Bad protagonist's job?","Chemistry teacher","Physicist","Doctor","Lawyer"),
      mkQ("First animated Best Picture winner?","None yet","Toy Story","Up","Coco"),
      mkQ("Tarantino's iconic film?","Pulp Fiction","Inception","Matrix","Godfather"),
      mkQ("Eternal Sunshine theme?","Memory erasure","Time travel","Dreams","Parallel worlds"),
      mkQ("First feature-length talkie?","The Jazz Singer","Citizen Kane","Psycho","Nosferatu"),
      mkQ("Parasite Palme d'Or year?","2019","2020","2018","2021"),
      mkQ("Dark Knight Joker actor?","Heath Ledger","Jack Nicholson","Joaquin Phoenix","Jared Leto"),
      mkQ("Black Mirror's main theme?","Tech side effects","Crime","Romance","History"),
      mkQ("ET's favorite candy?","Reese's Pieces","M&M's","Skittles","Kit Kat"),
    ],
  },
  topicFood: {
    ko: [
      mkQ("스시의 원래 목적은?","생선 보존","예술","약용","제사"),
      mkQ("세계에서 가장 비싼 향신료는?","사프란","바닐라","카다멈","고추냉이"),
      mkQ("김치의 주재료는?","배추","무","오이","파"),
      mkQ("에스프레소의 나라는?","이탈리아","프랑스","브라질","터키"),
      mkQ("와사비의 실제 재료는?","산식물 뿌리","겨자","고추","양파"),
      mkQ("프렌치프라이의 원산지는?","벨기에","프랑스","미국","네덜란드"),
      mkQ("초콜릿의 원료인 카카오 최대 생산국?","코트디부아르","가나","브라질","인도네시아"),
      mkQ("미슐랭 가이드의 별 최대 등급은?","3스타","5스타","4스타","2스타"),
      mkQ("두부의 주재료는?","대두","쌀","밀","옥수수"),
      mkQ("세계에서 가장 많이 먹는 과일은?","바나나","사과","망고","오렌지"),
      mkQ("파스타 알 덴테의 뜻은?","이에 씹히는","부드러운","차가운","매운"),
      mkQ("타바스코 소스의 원산지는?","미국 루이지애나","멕시코","스페인","이탈리아"),
      mkQ("카레의 원산지는?","인도","일본","태국","영국"),
      mkQ("트러플은 무엇인가?","버섯","과일","허브","해산물"),
      mkQ("모차렐라 치즈의 원래 우유는?","물소","소","양","염소"),
      mkQ("된장의 발효 기간은 보통?","수개월~수년","1일","1주일","12시간"),
      mkQ("세계에서 가장 매운 고추는?","캐롤라이나 리퍼","하바네로","부트 졸로키아","할라피뇨"),
      mkQ("고기 마블링이란?","지방 분포","색상","두께","신선도"),
      mkQ("우마미를 발견한 나라는?","일본","중국","프랑스","이탈리아"),
      mkQ("피자 마르게리타의 이름 유래는?","이탈리아 왕비","도시 이름","셰프 이름","꽃"),
      mkQ("올리브 오일 최대 생산국?","스페인","이탈리아","그리스","터키"),
      mkQ("라멘의 면 재료는?","밀가루","쌀","메밀","감자"),
      mkQ("칵테일 모히토의 베이스 술은?","럼","보드카","진","테킬라"),
      mkQ("MSG를 최초로 추출한 사람은?","이케다 키쿠나에","파스퇴르","멘델","페르미"),
      mkQ("비빔밥에 꼭 들어가는 양념은?","고추장","된장","간장","쌈장"),
      mkQ("와인의 떫은맛을 내는 성분은?","탄닌","카페인","비타민C","산"),
      mkQ("나폴리탄은 어느 나라 음식?","일본","이탈리아","프랑스","미국"),
      mkQ("스테이크 미디엄 레어의 내부 온도는 약?","57°C","45°C","70°C","80°C"),
      mkQ("세계 3대 진미가 아닌 것은?","와규","캐비어","트러플","푸아그라"),
      mkQ("식초의 주성분은?","아세트산","구연산","젖산","주석산"),
    ],
    en: [
      mkQ("Original purpose of sushi?","Fish preservation","Art","Medicine","Ritual"),
      mkQ("World's most expensive spice?","Saffron","Vanilla","Cardamom","Wasabi"),
      mkQ("Main kimchi ingredient?","Napa cabbage","Radish","Cucumber","Scallion"),
      mkQ("Espresso originated in?","Italy","France","Brazil","Turkey"),
      mkQ("Real wasabi is made from?","Plant root","Mustard","Chili","Onion"),
      mkQ("French fries actually from?","Belgium","France","USA","Netherlands"),
      mkQ("Top cacao-producing country?","Côte d'Ivoire","Ghana","Brazil","Indonesia"),
      mkQ("Michelin Guide max stars?","3","5","4","2"),
      mkQ("Tofu is made from?","Soybeans","Rice","Wheat","Corn"),
      mkQ("Most consumed fruit globally?","Banana","Apple","Mango","Orange"),
      mkQ("Pasta 'al dente' means?","Firm to the bite","Soft","Cold","Spicy"),
      mkQ("Tabasco sauce origin?","Louisiana, USA","Mexico","Spain","Italy"),
      mkQ("Curry originated in?","India","Japan","Thailand","UK"),
      mkQ("Truffle is a type of?","Mushroom","Fruit","Herb","Seafood"),
      mkQ("Traditional mozzarella milk?","Water buffalo","Cow","Sheep","Goat"),
      mkQ("Doenjang fermentation time?","Months to years","1 day","1 week","12 hours"),
      mkQ("World's hottest pepper?","Carolina Reaper","Habanero","Bhut Jolokia","Jalapeño"),
      mkQ("Meat marbling refers to?","Fat distribution","Color","Thickness","Freshness"),
      mkQ("Umami was discovered in?","Japan","China","France","Italy"),
      mkQ("Pizza Margherita named after?","Italian Queen","City","Chef","Flower"),
      mkQ("Top olive oil producer?","Spain","Italy","Greece","Turkey"),
      mkQ("Ramen noodles made from?","Wheat flour","Rice","Buckwheat","Potato"),
      mkQ("Mojito base spirit?","Rum","Vodka","Gin","Tequila"),
      mkQ("Who first extracted MSG?","Kikunae Ikeda","Pasteur","Mendel","Fermi"),
      mkQ("Essential bibimbap sauce?","Gochujang","Doenjang","Soy sauce","Ssamjang"),
      mkQ("Wine's astringent compound?","Tannin","Caffeine","Vitamin C","Acid"),
      mkQ("Napolitan pasta is from?","Japan","Italy","France","USA"),
      mkQ("Medium-rare steak internal temp?","~57°C","~45°C","~70°C","~80°C"),
      mkQ("Which is NOT a top 3 delicacy?","Wagyu","Caviar","Truffle","Foie gras"),
      mkQ("Main component of vinegar?","Acetic acid","Citric acid","Lactic acid","Tartaric acid"),
    ],
  },
  topicSports: {
    ko: [
      mkQ("FIFA 월드컵 최다 우승국은?","브라질","독일","이탈리아","아르헨티나"),
      mkQ("올림픽 오륜기 색이 아닌 것은?","보라","파랑","빨강","초록"),
      mkQ("농구 코트의 3점 라인 거리(NBA)?","7.24m","6.75m","8m","6m"),
      mkQ("마라톤의 공식 거리는?","42.195km","40km","45km","42km"),
      mkQ("테니스 그랜드슬램 대회 수는?","4개","3개","5개","6개"),
      mkQ("축구에서 오프사이드란?","수비수 뒤에서 패스받기","파울","핸드볼","반칙"),
      mkQ("UFC의 정식 명칭은?","Ultimate Fighting Championship","United Fighting Club","Universal Fight Cup","Ultra Fighting Challenge"),
      mkQ("수영 자유형에서 가장 빠른 영법은?","크롤","배영","접영","평영"),
      mkQ("야구에서 완전 게임이란?","노히트+노워크","삼진 27개","완투","무실점"),
      mkQ("올림픽 100m 세계 기록 보유자는?","우사인 볼트","칼 루이스","타이슨 게이","요한 블레이크"),
      mkQ("복싱 체급 중 가장 무거운 것은?","헤비웨이트","크루저급","슈퍼미들급","라이트헤비급"),
      mkQ("피겨스케이팅 쿼드러플 점프 회전 수?","4회전","3회전","5회전","2회전"),
      mkQ("골프에서 이글은 몇 타 적게?","2타","1타","3타","4타"),
      mkQ("럭비 팀 인원 수는?","15명","11명","13명","9명"),
      mkQ("F1 최다 우승 드라이버는?","루이스 해밀턴","미하엘 슈마허","아일톤 세나","알랭 프로스트"),
      mkQ("배드민턴 셔틀콕 깃털 수는?","16개","14개","18개","12개"),
      mkQ("크리켓 경기의 이닝 수(테스트)?","2이닝씩","1이닝","3이닝","4이닝"),
      mkQ("스키점프에서 착지 자세를 뭐라 하나?","텔레마크","카빙","보겐","슈템"),
      mkQ("발롱도르를 가장 많이 받은 선수?","메시","호날두","크루이프","플라티니"),
      mkQ("탁구 공의 지름은?","40mm","35mm","45mm","50mm"),
      mkQ("이종격투기에서 UFC 옥타곤 변 수?","8각형","6각형","원형","4각형"),
      mkQ("철인3종 경기 순서는?","수영-자전거-달리기","달리기-수영-자전거","자전거-달리기-수영","수영-달리기-자전거"),
      mkQ("NBA 쿼터 시간은?","12분","10분","15분","8분"),
      mkQ("하키 퍽의 재질은?","고무","나무","금속","플라스틱"),
      mkQ("양궁에서 10점 영역 지름은?","12.2cm","5cm","20cm","15cm"),
      mkQ("월드컵 결승 최다 골 선수는?","펠레/음바페","지단","호나우두","마라도나"),
      mkQ("스노보드 하프파이프 높이는?","약 6.7m","약 3m","약 10m","약 4m"),
      mkQ("배구 한 세트 점수(일반)?","25점","21점","15점","30점"),
      mkQ("e스포츠가 올림픽에 포함된 적이?","아직 없음","2020년","2024년","2016년"),
      mkQ("레슬링은 고대 올림픽부터 있었나?","예","아니오","근대부터","중세부터"),
    ],
    en: [
      mkQ("Most FIFA World Cup wins?","Brazil","Germany","Italy","Argentina"),
      mkQ("NOT an Olympic ring color?","Purple","Blue","Red","Green"),
      mkQ("NBA 3-point line distance?","7.24m","6.75m","8m","6m"),
      mkQ("Official marathon distance?","42.195km","40km","45km","42km"),
      mkQ("Tennis Grand Slam events?","4","3","5","6"),
      mkQ("What is offside in soccer?","Receiving behind defenders","Foul","Handball","Penalty"),
      mkQ("UFC stands for?","Ultimate Fighting Championship","United Fighting Club","Universal Fight Cup","Ultra Fighting Challenge"),
      mkQ("Fastest swimming stroke?","Front crawl","Backstroke","Butterfly","Breaststroke"),
      mkQ("Perfect game in baseball?","No hits + no walks","27 strikeouts","Complete game","No runs"),
      mkQ("100m world record holder?","Usain Bolt","Carl Lewis","Tyson Gay","Yohan Blake"),
      mkQ("Heaviest boxing weight class?","Heavyweight","Cruiserweight","Super middleweight","Light heavyweight"),
      mkQ("Quadruple jump rotations?","4","3","5","2"),
      mkQ("Eagle in golf means?","2 under par","1 under","3 under","4 under"),
      mkQ("Rugby team size?","15","11","13","9"),
      mkQ("Most F1 race wins?","Lewis Hamilton","Michael Schumacher","Ayrton Senna","Alain Prost"),
      mkQ("Shuttlecock feather count?","16","14","18","12"),
      mkQ("Test cricket innings per side?","2","1","3","4"),
      mkQ("Ski jump landing stance?","Telemark","Carving","Snowplow","Stem"),
      mkQ("Most Ballon d'Or wins?","Messi","Ronaldo","Cruyff","Platini"),
      mkQ("Table tennis ball diameter?","40mm","35mm","45mm","50mm"),
      mkQ("UFC octagon shape?","8 sides","6 sides","Circle","4 sides"),
      mkQ("Triathlon event order?","Swim-Bike-Run","Run-Swim-Bike","Bike-Run-Swim","Swim-Run-Bike"),
      mkQ("NBA quarter length?","12 min","10 min","15 min","8 min"),
      mkQ("Hockey puck material?","Rubber","Wood","Metal","Plastic"),
      mkQ("Archery 10-ring diameter?","12.2cm","5cm","20cm","15cm"),
      mkQ("Most WC final goals?","Pelé/Mbappé","Zidane","Ronaldo","Maradona"),
      mkQ("Halfpipe wall height?","~6.7m","~3m","~10m","~4m"),
      mkQ("Volleyball set points?","25","21","15","30"),
      mkQ("Esports in Olympics?","Not yet","2020","2024","2016"),
      mkQ("Wrestling in ancient Olympics?","Yes","No","Modern only","Medieval"),
    ],
  },
  topicTech: {
    ko: [
      mkQ("인터넷의 전신 이름은?","ARPANET","DARPANET","WEBNET","NETLINK"),
      mkQ("최초의 프로그래밍 언어는?","포트란","C","파이썬","자바"),
      mkQ("HTML은 무엇의 약자?","HyperText Markup Language","High Tech ML","Hyper Transfer ML","Home Tool ML"),
      mkQ("구글의 첫 서버는 어디에 있었나?","차고","사무실","대학 기숙사","지하실"),
      mkQ("비트코인 창시자의 가명은?","사토시 나카모토","존 스미스","앨런 튜링","빌 게이츠"),
      mkQ("세계 최초 스마트폰으로 불리는 것은?","IBM 사이먼","아이폰","블랙베리","노키아 N95"),
      mkQ("1바이트는 몇 비트?","8비트","4비트","16비트","32비트"),
      mkQ("리눅스를 만든 사람은?","리누스 토르발스","빌 게이츠","스티브 잡스","팀 버너스리"),
      mkQ("WWW를 발명한 사람은?","팀 버너스리","빌 게이츠","스티브 잡스","마크 저커버그"),
      mkQ("무어의 법칙이란?","트랜지스터 2배/2년","속도 10배/년","가격 반감/5년","용량 3배/년"),
      mkQ("파이썬의 이름 유래는?","몬티 파이썬","뱀","창시자 이름","수학 용어"),
      mkQ("최초의 검색 엔진은?","아치","구글","야후","알타비스타"),
      mkQ("애플의 첫 제품은?","애플 I","매킨토시","아이팟","아이폰"),
      mkQ("AI 튜링 테스트란?","기계가 인간처럼 대화","속도 테스트","메모리 테스트","보안 테스트"),
      mkQ("USB 풀네임은?","Universal Serial Bus","Ultra Speed Bus","United System Bus","Universal System Byte"),
      mkQ("세계 최초 웹사이트 주제는?","WWW 프로젝트 소개","뉴스","쇼핑","게임"),
      mkQ("GPS 위성 개수는 최소?","24개","12개","6개","36개"),
      mkQ("이모지가 탄생한 나라는?","일본","미국","한국","핀란드"),
      mkQ("깃허브를 인수한 회사는?","마이크로소프트","구글","아마존","애플"),
      mkQ("최초의 바이러스 이름은?","크리퍼","모리스","멜리사","아이러브유"),
      mkQ("Wi-Fi의 'Fi'는 뭘 의미하나?","아무 뜻 없음","Fidelity","Fire","First"),
      mkQ("자바의 마스코트 이름은?","듀크","자바","커피","모카"),
      mkQ("클라우드 컴퓨팅 최대 사업자는?","AWS","Azure","GCP","알리바바"),
      mkQ("블루투스 이름의 유래는?","바이킹 왕","파란 이빨","발명가","주파수"),
      mkQ("최초의 전자 메일을 보낸 해는?","1971년","1980년","1990년","1965년"),
      mkQ("양자 컴퓨터의 기본 단위는?","큐비트","비트","바이트","트랜지스터"),
      mkQ("테슬라 CEO는?","일론 머스크","팀 쿡","제프 베이조스","마크 저커버그"),
      mkQ("5G의 이론적 최대 속도는?","20Gbps","1Gbps","100Mbps","5Gbps"),
      mkQ("챗GPT를 만든 회사는?","OpenAI","구글","메타","마이크로소프트"),
      mkQ("NFT의 풀네임은?","Non-Fungible Token","New File Transfer","Net Finance Tech","Node First Token"),
    ],
    en: [
      mkQ("Internet's predecessor?","ARPANET","DARPANET","WEBNET","NETLINK"),
      mkQ("First programming language?","FORTRAN","C","Python","Java"),
      mkQ("HTML stands for?","HyperText Markup Language","High Tech ML","Hyper Transfer ML","Home Tool ML"),
      mkQ("Google's first server was in?","A garage","An office","Dorm room","Basement"),
      mkQ("Bitcoin creator's pseudonym?","Satoshi Nakamoto","John Smith","Alan Turing","Bill Gates"),
      mkQ("First smartphone?","IBM Simon","iPhone","BlackBerry","Nokia N95"),
      mkQ("How many bits in a byte?","8","4","16","32"),
      mkQ("Linux creator?","Linus Torvalds","Bill Gates","Steve Jobs","Tim Berners-Lee"),
      mkQ("WWW inventor?","Tim Berners-Lee","Bill Gates","Steve Jobs","Mark Zuckerberg"),
      mkQ("Moore's Law states?","Transistors double/2 years","Speed 10x/year","Price halves/5 years","Capacity 3x/year"),
      mkQ("Python named after?","Monty Python","A snake","Creator's name","Math term"),
      mkQ("First search engine?","Archie","Google","Yahoo","AltaVista"),
      mkQ("Apple's first product?","Apple I","Macintosh","iPod","iPhone"),
      mkQ("Turing Test checks?","If machine seems human","Speed","Memory","Security"),
      mkQ("USB stands for?","Universal Serial Bus","Ultra Speed Bus","United System Bus","Universal System Byte"),
      mkQ("First website topic?","WWW project info","News","Shopping","Games"),
      mkQ("Minimum GPS satellites?","24","12","6","36"),
      mkQ("Emoji originated in?","Japan","USA","Korea","Finland"),
      mkQ("GitHub acquired by?","Microsoft","Google","Amazon","Apple"),
      mkQ("First computer virus?","Creeper","Morris","Melissa","ILOVEYOU"),
      mkQ("Wi-Fi 'Fi' means?","Nothing","Fidelity","Fire","First"),
      mkQ("Java mascot name?","Duke","Java","Coffee","Mocha"),
      mkQ("Largest cloud provider?","AWS","Azure","GCP","Alibaba"),
      mkQ("Bluetooth named after?","Viking king","Blue tooth","Inventor","Frequency"),
      mkQ("First email sent in?","1971","1980","1990","1965"),
      mkQ("Quantum computing basic unit?","Qubit","Bit","Byte","Transistor"),
      mkQ("Tesla CEO?","Elon Musk","Tim Cook","Jeff Bezos","Mark Zuckerberg"),
      mkQ("5G theoretical max speed?","20 Gbps","1 Gbps","100 Mbps","5 Gbps"),
      mkQ("ChatGPT made by?","OpenAI","Google","Meta","Microsoft"),
      mkQ("NFT stands for?","Non-Fungible Token","New File Transfer","Net Finance Tech","Node First Token"),
    ],
  },
};
const ITEMS_LIST = ["hint","double","shield"];
const BONUS_EVERY = 3;
const PTS = 100;
const TIMER_SEC = 10;
const TC = { A:{bg:"#FF6B6B",lt:"#FFD4D4"}, B:{bg:"#4ECDC4",lt:"#D4F5F2"} };
const CHOICE_COLORS = ["#FF6B6B","#4ECDC4","#A855F7","#FFB347"];

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}

/* ═══════════════════ COMPONENT ═══════════════════ */
export default function QuizBattle(){
  const [lang,setLang]=useState("ko");
  const t=L[lang];
  const [sfxVol,setSfxVol]=useState(70);
  const [bgmVol,setBgmVol]=useState(40);
  const [bgmOn,setBgmOn]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const sfx=(fn)=>{if(sfxVol>0)fn();};
  useEffect(()=>{if(bgmOn&&bgmVol>0){ensureAudio();startBGM();setBGMVolume(bgmVol);}else{stopBGM();}return()=>stopBGM();},[bgmOn]);
  useEffect(()=>{setBGMVolume(bgmVol);},[bgmVol]);
  useEffect(()=>{setSFXVolume(sfxVol);},[sfxVol]);

  const [mode,setMode]=useState(null);
  const [players,setPlayers]=useState([]);
  const [nameIn,setNameIn]=useState("");
  const [selTeam,setSelTeam]=useState("A");
  const [topic,setTopic]=useState(null);
  const [qCount,setQCount]=useState(10);
  const [screen,setScreen]=useState("mode");
  const [shake,setShake]=useState(false);
  const [custQs,setCustQs]=useState([]);
  const [cQ,setCQ]=useState("");const [cA,setCA]=useState("");
  const [cW1,setCW1]=useState("");const [cW2,setCW2]=useState("");const [cW3,setCW3]=useState("");

  const [qs,setQs]=useState([]);
  const [qi,setQi]=useState(0);
  const [scores,setScores]=useState({});
  const [items,setItems]=useState({});
  const [phase,setPhase]=useState("wait");
  const [timer,setTimer]=useState(TIMER_SEC);
  const [timerOn,setTimerOn]=useState(false);
  const [feedback,setFeedback]=useState(null);
  const [choices,setChoices]=useState([]);
  const [activeItem,setActiveItem]=useState(null);
  const [hiddenChoice,setHiddenChoice]=useState(null);
  const [bonusItem,setBonusItem]=useState(null);
  const [buzzedPlayer,setBuzzedPlayer]=useState(null);
  const [triedTeams,setTriedTeams]=useState([]);
  // Combo & stats
  const [combos,setCombos]=useState({}); // {playerId: currentCombo}
  const [stats,setStats]=useState({}); // {playerId: {correct,maxCombo,bonusItems}}
  const [comboPopup,setComboPopup]=useState(null); // {name,combo,pts}

  // Mini-game state
  const [mgNames,setMgNames]=useState([]);
  const [mgNameIn,setMgNameIn]=useState("");
  const [mgResults,setMgResults]=useState([]);
  const [mgResIn,setMgResIn]=useState("");
  const [rouletteAngle,setRouletteAngle]=useState(0);
  const [rouletteSpinning,setRouletteSpinning]=useState(false);
  const [rouletteWinner,setRouletteWinner]=useState(null);
  const [ladderRunning,setLadderRunning]=useState(false);
  const [ladderResult,setLadderResult]=useState(null);
  const [ladderPaths,setLadderPaths]=useState(null);
  const [ladderHighlight,setLadderHighlight]=useState(-1);

  // Draw (제비뽑기)
  const [drawSticks,setDrawSticks]=useState([]);
  const [drawWinCount,setDrawWinCount]=useState(1);
  const [drawRevealed,setDrawRevealed]=useState([]);
  const [drawCurrentPick,setDrawCurrentPick]=useState(null);
  // Number Bomb
  const [bombMin,setBombMin]=useState(1);
  const [bombMax,setBombMax]=useState(100);
  const [bombTarget,setBombTarget]=useState(null);
  const [bombGuess,setBombGuess]=useState("");
  const [bombPlayerIdx,setBombPlayerIdx]=useState(0);
  const [bombEliminated,setBombEliminated]=useState([]);
  const [bombFeedback,setBombFeedback]=useState(null);
  // Team Split
  const [splitTeamCount,setSplitTeamCount]=useState(2);
  const [splitResult,setSplitResult]=useState(null);

  const timerRef=useRef(null);
  const inRef=useRef(null);

  useEffect(()=>{
    if(timerOn&&timer>0){
      if(timer<=3)sfx(SFX.countdown);
      timerRef.current=setTimeout(()=>setTimer(timer-1),1000);
    }
    else if(timerOn&&timer<=0){handleTimeUp();}
    return()=>clearTimeout(timerRef.current);
  },[timer,timerOn]);

  const startGame=()=>{
    let pool;
    if(topic==="topicCustom"){pool=shuffle(custQs).slice(0,qCount);}
    else{pool=shuffle(QUIZ[topic]?.[lang]||QUIZ.topicGeneral[lang]).slice(0,qCount);}
    const wB=pool.map((q,i)=>({...q,bonus:(i+1)%BONUS_EVERY===0,bonusItem:ITEMS_LIST[Math.floor(Math.random()*ITEMS_LIST.length)]}));
    setQs(wB);setQi(0);
    const sc={},it={},cb={},st={};
    players.forEach(p=>{sc[p.id]=0;it[p.id]=[];cb[p.id]=0;st[p.id]={correct:0,maxCombo:0,bonusItems:0};});
    setScores(sc);setItems(it);setCombos(cb);setStats(st);setComboPopup(null);
    setPhase("wait");setFeedback(null);
    setActiveItem(null);setHiddenChoice(null);setBonusItem(null);setBuzzedPlayer(null);setTriedTeams([]);
    prepChoices(wB[0]);setScreen("game");setBgmOn(true);sfx(SFX.fanfare);
  };

  const prepChoices=(q)=>{if(!q)return;setChoices(shuffle([q.a,...q.wrongs]));setHiddenChoice(null);};

  const handleBuzz=(team)=>{
    if(phase!=="wait")return;
    sfx(SFX.buzz);setPhase(`pick_${team}`);setTimer(TIMER_SEC);setTimerOn(true);
  };

  const handleIndiBuzz=(player)=>{
    if(phase!=="wait")return;
    sfx(SFX.buzz);setBuzzedPlayer(player);setPhase("pick_indi");setTimer(TIMER_SEC);setTimerOn(true);
  };

  const isFinalRound = qs.length>0 && qi >= qs.length - 3;
  const getFinalMultiplier = () => isFinalRound ? 2 : 1;

  const handlePick=(choice,team)=>{
    setTimerOn(false);clearTimeout(timerRef.current);
    const q=qs[qi];const correct=choice===q.a;
    const finalMult=getFinalMultiplier();
    if(correct){
      // Determine who scored
      const scorers=mode==="team"?players.filter(p=>p.team===team):(buzzedPlayer?[buzzedPlayer]:[]);
      const scorerIds=scorers.map(p=>p.id);

      // Combo calc
      let comboBonus=0;
      setCombos(prev=>{
        const next={...prev};
        scorerIds.forEach(id=>{next[id]=(next[id]||0)+1;});
        // Reset non-scorers combo
        players.forEach(p=>{if(!scorerIds.includes(p.id))next[p.id]=0;});
        const maxCombo=Math.max(...scorerIds.map(id=>next[id]));
        comboBonus=maxCombo>=2?(maxCombo-1)*50:0;
        // Show combo popup
        if(maxCombo>=2){
          const comboName=mode==="team"?(team==="A"?t.teamAShort:t.teamBShort):scorers[0]?.name;
          setComboPopup({name:comboName,combo:maxCombo,pts:comboBonus});
          setTimeout(()=>setComboPopup(null),2000);
        }
        return next;
      });

      // Points: base + item double + final multiplier + combo
      const basePts=activeItem==="double"?PTS*2:PTS;
      const totalPts=(basePts*finalMult)+comboBonus;

      if(mode==="team"){
        const tp=scorers;const each=Math.floor(totalPts/tp.length);
        tp.forEach(p=>setScores(prev=>({...prev,[p.id]:(prev[p.id]||0)+each})));
      }else if(buzzedPlayer){
        setScores(prev=>({...prev,[buzzedPlayer.id]:(prev[buzzedPlayer.id]||0)+totalPts}));
      }

      // Stats tracking
      setStats(prev=>{
        const next={...prev};
        scorerIds.forEach(id=>{
          if(!next[id])next[id]={correct:0,maxCombo:0,bonusItems:0};
          next[id]={...next[id],correct:next[id].correct+1};
        });
        return next;
      });
      // Update max combo in stats (after combos state is set)
      setTimeout(()=>{
        setStats(prev=>{
          const next={...prev};
          scorerIds.forEach(id=>{
            const curCombo=combos[id]||0;
            if(curCombo+1>((next[id]||{}).maxCombo||0)){
              next[id]={...next[id],maxCombo:curCombo+1};
            }
          });
          return next;
        });
      },50);

      const bi=q.bonus?q.bonusItem:null;
      if(bi){
        if(mode==="team"){scorers.forEach(p=>setItems(prev=>({...prev,[p.id]:[...(prev[p.id]||[]),bi]})));}
        else if(buzzedPlayer){setItems(prev=>({...prev,[buzzedPlayer.id]:[...(prev[buzzedPlayer.id]||[]),bi]}));}
        // Track bonus items in stats
        setStats(prev=>{
          const next={...prev};
          scorerIds.forEach(id=>{next[id]={...next[id],bonusItems:(next[id]?.bonusItems||0)+1};});
          return next;
        });
      }
      setBonusItem(bi);setFeedback({type:"correct",team,pts:totalPts,finalMult});setActiveItem(null);setPhase("feedback");sfx(SFX.correct);
    }else{
      // Reset combo for wrong answerer
      if(mode==="team"){
        players.filter(p=>p.team===team).forEach(p=>setCombos(prev=>({...prev,[p.id]:0})));
      }else if(buzzedPlayer){
        setCombos(prev=>({...prev,[buzzedPlayer.id]:0}));
      }
      setActiveItem(null);
      if(mode==="team"){
        const newTried=[...triedTeams,team];setTriedTeams(newTried);
        const otherTeam=team==="A"?"B":"A";
        if(newTried.includes(otherTeam)){
          setFeedback({type:"noone"});setPhase("feedback");sfx(SFX.wrong);
        }else{
          setFeedback({type:"wrong",team});sfx(SFX.wrong);
          setTimeout(()=>{setFeedback(null);setPhase(`pick_${otherTeam}`);setTimer(TIMER_SEC);setTimerOn(true);},1200);
        }
      }else{
        setFeedback({type:"wrong"});setPhase("feedback");sfx(SFX.wrong);
      }
    }
  };

  const handleTimeUp=()=>{
    setTimerOn(false);clearTimeout(timerRef.current);sfx(SFX.wrong);
    if(mode==="team"){
      const cur=phase.replace("pick_","");
      const newTried=[...triedTeams,cur];setTriedTeams(newTried);
      const other=cur==="A"?"B":"A";
      if(newTried.includes(other)){
        setFeedback({type:"noone"});setPhase("feedback");
      }else{
        setFeedback({type:"timeout"});
        setTimeout(()=>{setFeedback(null);setPhase(`pick_${other}`);setTimer(TIMER_SEC);setTimerOn(true);},1000);
      }
    }else{
      setFeedback({type:"timeout"});setPhase("feedback");
    }
  };

  const nextQ=()=>{
    if(qi+1>=qs.length){setScreen("results");setBgmOn(false);sfx(SFX.fanfare);return;}
    const nqi=qi+1;setQi(nqi);prepChoices(qs[nqi]);
    setPhase("wait");setFeedback(null);setActiveItem(null);setBonusItem(null);
    setBuzzedPlayer(null);setTriedTeams([]);setTimer(TIMER_SEC);
  };

  const doUseItem=(pid,item)=>{
    setItems(prev=>{const a=[...(prev[pid]||[])];const i=a.indexOf(item);if(i>-1)a.splice(i,1);return{...prev,[pid]:a};});
    if(item==="hint"){
      const q=qs[qi];const wrongs=choices.filter(c=>c!==q.a&&c!==hiddenChoice);
      if(wrongs.length>0)setHiddenChoice(wrongs[Math.floor(Math.random()*wrongs.length)]);
    }else{setActiveItem(item);}
  };

  const addPlayer=()=>{
    const n=nameIn.trim();
    if(!n||players.some(p=>p.name===n)){setShake(true);setTimeout(()=>setShake(false),400);return;}
    setPlayers([...players,{id:Date.now(),name:n,team:mode==="team"?selTeam:null}]);
    setNameIn("");inRef.current?.focus();
  };
  const canGo=()=>mode==="individual"?players.length>=2:players.filter(p=>p.team==="A").length>=1&&players.filter(p=>p.team==="B").length>=1;
  const addCust=()=>{
    if(!cQ.trim()||!cA.trim()||!cW1.trim()||!cW2.trim()||!cW3.trim())return;
    setCustQs([...custQs,{q:cQ.trim(),a:cA.trim(),wrongs:[cW1.trim(),cW2.trim(),cW3.trim()]}]);
    setCQ("");setCA("");setCW1("");setCW2("");setCW3("");
  };
  const resetAll=()=>{setBgmOn(false);setScreen("mode");setMode(null);setPlayers([]);setTopic(null);setQCount(10);setCustQs([]);};
  const teamScore=(team)=>players.filter(p=>p.team===team).reduce((s,p)=>s+(scores[p.id]||0),0);

  /* ═══════ TEAM GAME: SPLIT SCREEN ═══════ */
  const renderTeamHalf=(team,flipped)=>{
    const q=qs[qi];if(!q)return null;
    const isMyTurn=phase===`pick_${team}`;
    const other=team==="A"?"B":"A";
    const isFB=phase==="feedback";
    const canBz=phase==="wait";
    const myItems=players.filter(p=>p.team===team).flatMap(p=>items[p.id]||[]);
    const uniqueItems=[...new Set(myItems)];

    return(
      <div style={{...z.half,transform:flipped?"rotate(180deg)":"none"}}>
        <div style={{...z.halfHead,background:TC[team].bg}}>
          <span style={z.halfTN}>{team==="A"?t.teamAShort:t.teamBShort}</span>
          <span style={z.halfSc}>{teamScore(team)}{t.pts}</span>
        </div>
        <div style={z.halfBody}>
          <div style={z.halfQArea}>
            {isFinalRound&&<div style={{background:"linear-gradient(135deg,#FF6B6B,#FFE66D)",padding:"4px 12px",borderRadius:8,fontSize:11,fontWeight:800,color:"#1a1a2e",textAlign:"center",marginBottom:4,animation:"pulse 1s ease-in-out infinite"}}>{t.finalRound} {t.x2}</div>}
            <span style={z.halfQNum}>{t.question} {qi+1}/{qs.length} {q.bonus?t.bonusRound:""}</span>
            <p style={z.halfQTxt}>{q.q}</p>
          </div>

          {canBz&&(<button style={{...z.bigBuzz,background:TC[team].bg}} onClick={()=>handleBuzz(team)}>{t.buzzer}</button>)}

          {isMyTurn&&(
            <div style={z.pickZone}>
              <div style={z.tmrRow}>
                <div style={z.tmrBar}><div style={{...z.tmrFill,width:`${(timer/TIMER_SEC)*100}%`,background:timer<=3?"#FF4757":"#2ED573"}}/></div>
                <span style={z.tmrNum}>{timer}s</span>
              </div>
              {uniqueItems.length>0&&!activeItem&&(
                <div style={z.itRow}>{uniqueItems.map((it,i)=>(
                  <button key={i} style={z.itBtn} onClick={()=>{const p=players.find(p=>p.team===team&&(items[p.id]||[]).includes(it));if(p)doUseItem(p.id,it);}}>
                    {t[`item${it[0].toUpperCase()+it.slice(1)}`]}
                  </button>
                ))}</div>
              )}
              <div style={z.chGrid}>{choices.map((c,i)=>(
                <button key={i} disabled={c===hiddenChoice} onClick={()=>handlePick(c,team)} style={{
                  ...z.chBtn,background:c===hiddenChoice?"rgba(255,255,255,0.05)":CHOICE_COLORS[i],
                  opacity:c===hiddenChoice?0.2:1,cursor:c===hiddenChoice?"not-allowed":"pointer",
                }}>{c===hiddenChoice?"—":c}</button>
              ))}</div>
            </div>
          )}

          {phase===`pick_${other}`&&!isFB&&(<p style={z.waitTxt}>{other==="A"?t.teamAShort:t.teamBShort} {t.otherTurn}</p>)}

          {isFB&&feedback&&(
            <div style={z.fbCard}>
              <span style={{fontSize:24}}>{feedback.type==="correct"?"🎉":feedback.type==="noone"?"😅":"😢"}</span>
              <span style={{fontWeight:900,fontSize:14,color:feedback.type==="correct"?"#2ED573":"#FF4757"}}>
                {feedback.type==="correct"?t.correct:feedback.type==="noone"?t.noOneGot:t.wrong}
              </span>
              {feedback.type==="correct"&&feedback.pts&&<span style={{fontSize:11,fontWeight:800,color:"#fff"}}>+{feedback.pts}{t.pts}{feedback.finalMult>1?` (${t.x2})`:""}</span>}
              {feedback.type!=="correct"&&<span style={{fontSize:11,color:"#2ED573"}}>{t.answer}: {q.a}</span>}
              {feedback.type==="correct"&&bonusItem&&<span style={{fontSize:11,color:"#FFD93D"}}>+{t[`item${bonusItem[0].toUpperCase()+bonusItem.slice(1)}`]}</span>}
              {comboPopup&&<span style={{fontSize:12,fontWeight:800,color:"#FFB347",animation:"popIn 0.3s ease"}}>🔥 {comboPopup.combo} {t.combo}! +{comboPopup.pts}</span>}
            </div>
          )}

          {isFB&&team==="B"&&(
            <button style={{...z.nxtBtn,background:TC[team].bg}} onClick={nextQ}>
              {qi+1>=qs.length?t.gameOver:t.nextQ} →
            </button>
          )}
        </div>
        {feedback?.type==="wrong"&&feedback?.team===team&&phase!=="feedback"&&(
          <div style={z.flashW}>{t.wrong}</div>
        )}
      </div>
    );
  };

  const renderTeamGame=()=>(
    <div style={z.splitWrap}>
      {renderTeamHalf("A",true)}
      <div style={z.divider}><button style={z.exitBtnTeam} onClick={()=>{setBgmOn(false);resetAll();}}>✕</button><span style={z.divTxt}>VS</span></div>
      {renderTeamHalf("B",false)}
    </div>
  );

  /* ═══════ INDIVIDUAL GAME ═══════ */
  const renderIndiGame=()=>{
    const q=qs[qi];if(!q)return null;
    return(
      <div style={z.indiArea}>
        <div style={{textAlign:"center",position:"relative"}}>
          <button style={z.exitBtn} onClick={()=>{setBgmOn(false);resetAll();}}>✕</button>
          <h2 style={{...z.title,fontSize:20,margin:0}}>{t.title}</h2>
          <div style={z.miniScs}>{players.map(p=>(<span key={p.id} style={z.miniSc}>{p.name}: {scores[p.id]||0}</span>))}</div>
        </div>
        <div style={z.indiQCard}>
          {isFinalRound&&<div style={{background:"linear-gradient(135deg,#FF6B6B,#FFE66D)",padding:"5px 14px",borderRadius:10,fontSize:12,fontWeight:800,color:"#1a1a2e",display:"inline-block",marginBottom:6,animation:"pulse 1s ease-in-out infinite"}}>{t.finalRound} {t.x2}</div>}
          <span style={z.indiQN}>{t.question} {qi+1}/{qs.length} {q.bonus?t.bonusRound:""}</span>
          <p style={z.indiQT}>{q.q}</p>
        </div>

        {phase==="wait"&&(
          <div style={z.indiBGrid}>{players.map((p,i)=>(
            <button key={p.id} onClick={()=>handleIndiBuzz(p)} style={{...z.indiBBtn,background:`hsl(${(i*60)%360},75%,50%)`}}>
              <span style={{fontSize:22}}>🔔</span>
              <span style={{fontWeight:900,fontSize:13}}>{p.name}</span>
              <span style={{fontSize:11,opacity:0.8}}>{t.buzzer}</span>
            </button>
          ))}</div>
        )}

        {phase==="pick_indi"&&buzzedPlayer&&(
          <div style={z.pickZone}>
            <div style={{textAlign:"center",fontWeight:900,color:"#FFD93D",fontSize:16}}>{buzzedPlayer.name} {lang==="ko"?"의 차례!":"'s turn!"}</div>
            <div style={z.tmrRow}>
              <div style={z.tmrBar}><div style={{...z.tmrFill,width:`${(timer/TIMER_SEC)*100}%`,background:timer<=3?"#FF4757":"#2ED573"}}/></div>
              <span style={z.tmrNum}>{timer}s</span>
            </div>
            {(items[buzzedPlayer.id]||[]).length>0&&!activeItem&&(
              <div style={z.itRow}>{[...new Set(items[buzzedPlayer.id])].map((it,i)=>(
                <button key={i} style={z.itBtn} onClick={()=>doUseItem(buzzedPlayer.id,it)}>{t[`item${it[0].toUpperCase()+it.slice(1)}`]}</button>
              ))}</div>
            )}
            <div style={z.chGrid}>{choices.map((c,i)=>(
              <button key={i} disabled={c===hiddenChoice} onClick={()=>handlePick(c,null)} style={{
                ...z.chBtn,background:c===hiddenChoice?"rgba(255,255,255,0.05)":CHOICE_COLORS[i],
                opacity:c===hiddenChoice?0.2:1,
              }}>{c===hiddenChoice?"—":c}</button>
            ))}</div>
          </div>
        )}

        {phase==="feedback"&&feedback&&(
          <>
            <div style={z.fbCard}>
              <span style={{fontSize:30}}>{feedback.type==="correct"?"🎉":"😢"}</span>
              <span style={{fontWeight:900,fontSize:18,color:feedback.type==="correct"?"#2ED573":"#FF4757"}}>
                {feedback.type==="correct"?t.correct:feedback.type==="timeout"?t.timeUp:t.wrong}
              </span>
              {feedback.type==="correct"&&feedback.pts&&<span style={{fontSize:13,fontWeight:800,color:"#fff"}}>+{feedback.pts}{t.pts}{feedback.finalMult>1?` (${t.x2})`:""}</span>}
              {feedback.type!=="correct"&&<span style={{fontSize:14,color:"#2ED573"}}>{t.answer}: {q.a}</span>}
              {feedback.type==="correct"&&bonusItem&&<span style={{color:"#FFD93D"}}>+{t[`item${bonusItem[0].toUpperCase()+bonusItem.slice(1)}`]}</span>}
              {comboPopup&&<span style={{fontSize:14,fontWeight:800,color:"#FFB347",animation:"popIn 0.3s ease"}}>🔥 {comboPopup.combo} {t.combo}! +{comboPopup.pts}</span>}
            </div>
            <button style={z.nxtBtnIndi} onClick={nextQ}>{qi+1>=qs.length?t.gameOver:t.nextQ} →</button>
          </>
        )}
      </div>
    );
  };

  /* ═══════ RESULTS ═══════ */
  const renderMVP=()=>{
    const allStats=Object.entries(stats).map(([id,s])=>({id:Number(id),name:players.find(p=>p.id===Number(id))?.name||"?",...s}));
    if(allStats.length===0)return null;
    const mostCorrect=allStats.reduce((a,b)=>b.correct>a.correct?b:a,allStats[0]);
    const maxCombo=allStats.reduce((a,b)=>b.maxCombo>a.maxCombo?b:a,allStats[0]);
    const bonusKing=allStats.reduce((a,b)=>b.bonusItems>a.bonusItems?b:a,allStats[0]);
    const awards=[];
    if(mostCorrect.correct>0)awards.push({emoji:"🎯",label:t.mvpMostCorrect,name:mostCorrect.name,val:`${mostCorrect.correct}`});
    if(maxCombo.maxCombo>=2)awards.push({emoji:"🔥",label:t.mvpMaxCombo,name:maxCombo.name,val:`${maxCombo.maxCombo}${t.combo}`});
    if(bonusKing.bonusItems>0)awards.push({emoji:"⭐",label:t.mvpBonusKing,name:bonusKing.name,val:`${bonusKing.bonusItems}`});
    if(awards.length===0)return null;
    return(
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:6,animation:"slideUp 0.5s ease"}}>
        <h3 style={{textAlign:"center",fontSize:14,fontWeight:800,color:"#A855F7",margin:0}}>MVP</h3>
        {awards.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",background:"rgba(168,85,247,0.1)",borderRadius:14,border:"1px solid rgba(168,85,247,0.2)"}}>
            <span style={{fontSize:22}}>{a.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:700}}>{a.label}</div>
              <div style={{fontSize:14,fontWeight:800,color:"#FFE66D"}}>{a.name}</div>
            </div>
            <span style={{fontSize:16,fontWeight:800,color:"#A855F7"}}>{a.val}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderResults=()=>{
    if(mode==="team"){
      const sA=teamScore("A"),sB=teamScore("B");
      const w=sA>sB?"A":sB>sA?"B":null;
      return(<div style={z.resArea}>
        <div style={{fontSize:50,animation:"float 2s ease-in-out infinite"}}>🏆</div>
        <h2 style={z.resTitle}>{t.gameOver}</h2>
        <div style={{...z.resBanner,borderColor:w?TC[w].bg:"#FFD93D"}}>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{t.winner}</span>
          <span style={{fontSize:22,fontWeight:900,color:w?TC[w].bg:"#FFD93D"}}>{w?(w==="A"?t.teamA:t.teamB):t.draw}</span>
        </div>
        <div style={z.resTeams}>{["A","B"].map(tm=>(
          <div key={tm} style={{...z.resTeamCard,borderColor:w===tm?TC[tm].bg:"rgba(255,255,255,0.1)"}}>
            <div style={{background:TC[tm].bg,padding:"7px",borderRadius:"10px 10px 0 0",textAlign:"center",fontWeight:900,fontSize:13}}>{tm==="A"?t.teamA:t.teamB}</div>
            <div style={{textAlign:"center",fontSize:26,fontWeight:900,color:"#FFD93D",padding:"8px 0"}}>{teamScore(tm)}</div>
            {players.filter(p=>p.team===tm).map(p=>(<div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"3px 10px",fontSize:11,color:"rgba(255,255,255,0.5)"}}><span>{p.name}</span><span>{scores[p.id]||0}</span></div>))}
          </div>
        ))}</div>
        {renderMVP()}
        <div style={z.resActs}><button style={z.resPlay} onClick={startGame}>{t.playAgain}</button><button style={z.resLobby} onClick={resetAll}>{t.backToLobby}</button></div>
      </div>);
    }
    const sorted=[...players].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0));
    return(<div style={z.resArea}>
      <div style={{fontSize:50,animation:"float 2s ease-in-out infinite"}}>🏆</div>
      <h2 style={z.resTitle}>{t.gameOver}</h2>
      <div style={z.resBanner}>
        <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{t.winner}</span>
        <span style={{fontSize:22,fontWeight:900,color:"#FFD93D"}}>{sorted[0]?.name}</span>
        <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>{scores[sorted[0]?.id]||0} {t.pts}</span>
      </div>
      <div style={z.resList}>{sorted.map((p,i)=>(
        <div key={p.id} style={{...z.resRow,background:i===0?"rgba(255,217,61,0.1)":"transparent",borderLeft:i===0?"4px solid #FFD93D":"4px solid transparent"}}>
          <span style={{width:26,textAlign:"center",fontSize:15}}>{i===0?"👑":i===1?"🥈":i===2?"🥉":i+1}</span>
          <span style={{flex:1,fontWeight:800,fontSize:13}}>{p.name}</span>
          <span style={{fontWeight:900,color:"#FFD93D"}}>{scores[p.id]||0}</span>
        </div>
      ))}</div>
      {renderMVP()}
      <div style={z.resActs}><button style={z.resPlay} onClick={startGame}>{t.playAgain}</button><button style={z.resLobby} onClick={resetAll}>{t.backToLobby}</button></div>
    </div>);
  };

  /* ═══════ MINI-GAME HELPERS ═══════ */
  const mgAddName=()=>{const n=mgNameIn.trim();if(!n||mgNames.length>=12)return;setMgNames([...mgNames,n]);setMgNameIn("");};
  const mgAddRes=()=>{const r=mgResIn.trim();if(!r)return;setMgResults([...mgResults,r]);setMgResIn("");};
  const mgReset=()=>{setMgNames([]);setMgResults([]);setRouletteWinner(null);setRouletteAngle(0);setLadderResult(null);setLadderPaths(null);setLadderHighlight(-1);setDrawSticks([]);setDrawRevealed([]);setDrawCurrentPick(null);setBombTarget(null);setBombMin(1);setBombMax(100);setBombGuess("");setBombPlayerIdx(0);setBombEliminated([]);setBombFeedback(null);setSplitResult(null);};

  // === DRAW (제비뽑기) ===
  const initDraw=()=>{
    if(mgNames.length<2)return;
    const n=mgNames.length;const wc=Math.min(drawWinCount,n-1);
    const arr=Array(n).fill(false);
    const wins=new Set();while(wins.size<wc)wins.add(Math.floor(Math.random()*n));
    wins.forEach(i=>{arr[i]=true;});
    setDrawSticks(arr);setDrawRevealed([]);setDrawCurrentPick(null);
  };
  const pickDraw=(idx)=>{
    if(drawRevealed.includes(idx)||drawCurrentPick!==null)return;
    setDrawCurrentPick(idx);sfx(SFX.buzz);
    setTimeout(()=>{
      setDrawRevealed(prev=>[...prev,idx]);
      if(drawSticks[idx])sfx(SFX.fanfare); else sfx(SFX.wrong);
      setDrawCurrentPick(null);
    },800);
  };

  // === NUMBER BOMB ===
  const initBomb=()=>{
    if(mgNames.length<2)return;
    setBombTarget(Math.floor(Math.random()*99)+1);
    setBombMin(1);setBombMax(100);setBombGuess("");setBombPlayerIdx(0);setBombEliminated([]);setBombFeedback(null);
  };
  const bombSubmit=()=>{
    const g=parseInt(bombGuess);if(isNaN(g)||g<bombMin||g>bombMax)return;
    const alive=mgNames.filter((_,i)=>!bombEliminated.includes(i));
    if(g===bombTarget){
      sfx(SFX.wrong);
      const elimIdx=mgNames.indexOf(alive[bombPlayerIdx%alive.length]);
      const newElim=[...bombEliminated,elimIdx];setBombEliminated(newElim);
      const remaining=mgNames.filter((_,i)=>!newElim.includes(i));
      if(remaining.length<=1){
        setBombFeedback({type:"gameover",winner:remaining[0]||"?"});sfx(SFX.fanfare);
      } else {
        setBombFeedback({type:"explode",who:alive[bombPlayerIdx%alive.length]});
        setBombMin(1);setBombMax(100);setBombTarget(Math.floor(Math.random()*99)+1);
        setTimeout(()=>{setBombFeedback(null);setBombPlayerIdx(0);},1500);
      }
    } else {
      sfx(SFX.buzz);
      if(g<bombTarget)setBombMin(g+1); else setBombMax(g-1);
      setBombFeedback({type:"safe",dir:g<bombTarget?"↑":"↓"});
      const nextIdx=(bombPlayerIdx+1)%alive.length;setBombPlayerIdx(nextIdx);
      setTimeout(()=>setBombFeedback(null),1000);
    }
    setBombGuess("");
  };

  // === TEAM SPLIT ===
  const doTeamSplit=()=>{
    if(mgNames.length<2)return;
    const shuffled=shuffle([...mgNames]);
    const teams=Array.from({length:splitTeamCount},()=>[]);
    shuffled.forEach((name,i)=>teams[i%splitTeamCount].push(name));
    setSplitResult(teams);sfx(SFX.fanfare);
  };

  const spinRoulette=()=>{
    if(mgNames.length<2||rouletteSpinning)return;
    sfx(SFX.buzz);setRouletteSpinning(true);setRouletteWinner(null);
    const extra=1440+Math.random()*1440;
    const newAngle=rouletteAngle+extra;
    setRouletteAngle(newAngle);
    setTimeout(()=>{
      const seg=360/mgNames.length;
      const norm=((newAngle%360)+360)%360;
      const idx=Math.floor(((360-norm+seg/2)%360)/seg)%mgNames.length;
      setRouletteWinner(mgNames[idx]);
      setRouletteSpinning(false);sfx(SFX.fanfare);
    },4000);
  };

  const startLadder=()=>{
    if(mgNames.length<2||ladderRunning)return;
    const n=mgNames.length;
    const res=mgResults.length>=n?mgResults.slice(0,n):
      [...mgResults,...Array(n-mgResults.length).fill(0).map((_,i)=>mgResults.length+i+1<=n?`${mgResults.length+i+1}`:"?")];
    const shuffledRes=shuffle(res);
    // Generate random horizontal bridges
    const rows=8;
    const paths=[];
    for(let r=0;r<rows;r++){
      const bridges=[];
      for(let c=0;c<n-1;c++){
        bridges.push(Math.random()>0.5);
      }
      paths.push(bridges);
    }
    setLadderPaths({paths,results:shuffledRes,rows});
    setLadderResult(null);setLadderHighlight(-1);setLadderRunning(true);
    sfx(SFX.buzz);
    // Animate through all players
    let step=0;
    const animate=()=>{
      if(step>=n){
        // Calculate all results
        const mapping=[];
        for(let p=0;p<n;p++){
          let col=p;
          for(let r=0;r<rows;r++){
            if(col>0&&paths[r][col-1])col--;
            else if(col<n-1&&paths[r][col])col++;
          }
          mapping.push({name:mgNames[p],result:shuffledRes[col]});
        }
        setLadderResult(mapping);setLadderRunning(false);setLadderHighlight(-1);sfx(SFX.fanfare);
        return;
      }
      setLadderHighlight(step);
      step++;
      setTimeout(animate,600);
    };
    setTimeout(animate,300);
  };

  /* ═══════ RENDER: ROULETTE ═══════ */
  const renderRoulette=()=>{
    const n=mgNames.length;
    const colors=["#FF6B6B","#4ECDC4","#A855F7","#FFB347","#45B7D1","#96CEB4","#FF7EB3","#7C5CFC","#2ED573","#FFA502","#EE5A24","#6C5CE7"];
    return(
      <div style={z.sec}>
        <button style={z.navB} onClick={()=>setScreen("mini")}>←</button>
        <h2 style={z.secT}>🎰 {t.roulette}</h2>
        <p style={{textAlign:"center",color:"rgba(255,255,255,0.5)",fontSize:12,margin:0}}>{t.rouletteDesc}</p>

        {/* Name input */}
        <div style={z.inRow}>
          <input value={mgNameIn} onChange={e=>setMgNameIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&mgAddName()} placeholder={t.nameInput} style={z.inp} maxLength={10}/>
          <button style={z.addBtn} onClick={mgAddName}>{t.addName} ({n}/12)</button>
        </div>
        <div style={z.chipW}>{mgNames.map((name,i)=>(
          <div key={i} style={{...z.chip,background:colors[i%12],color:"#fff",cursor:"pointer"}} onClick={()=>setMgNames(mgNames.filter((_,j)=>j!==i))}>{name} ✕</div>
        ))}</div>

        {/* Wheel */}
        {n>=2&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginTop:8}}>
            <div style={{position:"relative",width:260,height:260}}>
              {/* Arrow */}
              <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",fontSize:24,zIndex:10,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.4))"}}>▼</div>
              {/* Wheel */}
              <svg width="260" height="260" viewBox="0 0 260 260" style={{transform:`rotate(${rouletteAngle}deg)`,transition:rouletteSpinning?"transform 4s cubic-bezier(0.17,0.67,0.12,0.99)":"none"}}>
                {mgNames.map((name,i)=>{
                  const seg=360/n;const start=i*seg;const end=start+seg;
                  const r=125;const cx=130;const cy=130;
                  const rad1=(start-90)*Math.PI/180;const rad2=(end-90)*Math.PI/180;
                  const x1=cx+r*Math.cos(rad1);const y1=cy+r*Math.sin(rad1);
                  const x2=cx+r*Math.cos(rad2);const y2=cy+r*Math.sin(rad2);
                  const large=seg>180?1:0;
                  const midRad=((start+end)/2-90)*Math.PI/180;
                  const tx=cx+r*0.6*Math.cos(midRad);const ty=cy+r*0.6*Math.sin(midRad);
                  return(<g key={i}>
                    <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={colors[i%12]} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                    <text x={tx} y={ty} fill="#fff" fontSize={n>8?"9":"11"} fontWeight="800" textAnchor="middle" dominantBaseline="central" transform={`rotate(${(start+end)/2},${tx},${ty})`}>{name.slice(0,6)}</text>
                  </g>);
                })}
                <circle cx="130" cy="130" r="18" fill="#1B0A3C" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
              </svg>
            </div>
            <button onClick={spinRoulette} disabled={rouletteSpinning} style={{...z.goBtn,opacity:rouletteSpinning?0.5:1,cursor:rouletteSpinning?"not-allowed":"pointer",padding:"12px 40px"}}>{t.spin}</button>
            {rouletteWinner&&<div style={{...z.fbCard,animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}><span style={{fontSize:32}}>🎉</span><span style={{fontWeight:800,fontSize:18,color:"#FFE66D"}}>{rouletteWinner}</span></div>}
          </div>
        )}
        <button style={{...z.navB,alignSelf:"center",marginTop:8,width:"auto",padding:"6px 16px",fontSize:12}} onClick={mgReset}>{t.reset}</button>
      </div>
    );
  };

  /* ═══════ RENDER: LADDER ═══════ */
  const renderLadder=()=>{
    const n=mgNames.length;
    const colors=["#FF6B6B","#4ECDC4","#A855F7","#FFB347","#45B7D1","#96CEB4","#FF7EB3","#7C5CFC","#2ED573","#FFA502","#EE5A24","#6C5CE7"];
    const W=Math.min(480,n*56);const H=300;
    const gap=W/(n+1);
    return(
      <div style={z.sec}>
        <button style={z.navB} onClick={()=>setScreen("mini")}>←</button>
        <h2 style={z.secT}>🪜 {t.ladder}</h2>
        <p style={{textAlign:"center",color:"rgba(255,255,255,0.5)",fontSize:12,margin:0}}>{t.ladderDesc}</p>

        <div style={z.inRow}>
          <input value={mgNameIn} onChange={e=>setMgNameIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&mgAddName()} placeholder={t.nameInput} style={z.inp} maxLength={10}/>
          <button style={z.addBtn} onClick={mgAddName}>{t.addName} ({n}/12)</button>
        </div>
        <div style={z.chipW}>{mgNames.map((name,i)=>(
          <div key={i} style={{...z.chip,background:colors[i%12],color:"#fff",cursor:"pointer"}} onClick={()=>setMgNames(mgNames.filter((_,j)=>j!==i))}>{name} ✕</div>
        ))}</div>

        {n>=2&&(<>
          <div style={z.inRow}>
            <input value={mgResIn} onChange={e=>setMgResIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&mgAddRes()} placeholder={t.resultInput} style={z.inp} maxLength={15}/>
            <button style={z.addBtn} onClick={mgAddRes}>{t.result} ({mgResults.length})</button>
          </div>
          {mgResults.length>0&&<div style={z.chipW}>{mgResults.map((r,i)=>(
            <div key={i} style={{...z.chip,background:"rgba(255,255,255,0.1)",color:"#FFE66D",cursor:"pointer"}} onClick={()=>setMgResults(mgResults.filter((_,j)=>j!==i))}>{r} ✕</div>
          ))}</div>}
        </>)}

        {/* Ladder visual */}
        {ladderPaths&&(
          <div style={{overflowX:"auto",padding:"8px 0"}}>
            <svg width={W} height={H+60} viewBox={`0 0 ${W} ${H+60}`}>
              {/* Names on top */}
              {mgNames.map((name,i)=>(
                <text key={`n${i}`} x={gap*(i+1)} y={18} fill={ladderHighlight===i?"#FFE66D":colors[i%12]} fontSize="12" fontWeight="800" textAnchor="middle">{name.slice(0,5)}</text>
              ))}
              {/* Vertical lines */}
              {Array(n).fill(0).map((_,i)=>(
                <line key={`v${i}`} x1={gap*(i+1)} y1={28} x2={gap*(i+1)} y2={H+20} stroke={colors[i%12]} strokeWidth="3" strokeLinecap="round" opacity={0.6}/>
              ))}
              {/* Horizontal bridges */}
              {ladderPaths.paths.map((row,r)=>row.map((bridge,c)=>bridge?(
                <line key={`h${r}${c}`} x1={gap*(c+1)} y1={28+(r+1)*(H-8)/(ladderPaths.rows+1)} x2={gap*(c+2)} y2={28+(r+1)*(H-8)/(ladderPaths.rows+1)} stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
              ):null))}
              {/* Results on bottom */}
              {ladderPaths.results.map((res,i)=>(
                <text key={`r${i}`} x={gap*(i+1)} y={H+45} fill="#FFE66D" fontSize="11" fontWeight="800" textAnchor="middle">{String(res).slice(0,6)}</text>
              ))}
            </svg>
          </div>
        )}

        {n>=2&&!ladderPaths&&(
          <button onClick={startLadder} style={{...z.goBtn,alignSelf:"center",padding:"12px 40px"}}>{t.climbing}</button>
        )}

        {/* Results */}
        {ladderResult&&(
          <div style={{display:"flex",flexDirection:"column",gap:6,animation:"slideUp 0.4s ease"}}>
            {ladderResult.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",background:"rgba(255,255,255,0.06)",borderRadius:12,border:`2px solid ${colors[i%12]}40`}}>
                <span style={{fontWeight:800,color:colors[i%12]}}>{m.name}</span>
                <span style={{fontWeight:800,color:"#FFE66D"}}>→ {m.result}</span>
              </div>
            ))}
            <button style={{...z.goBtn,alignSelf:"center",padding:"10px 30px",marginTop:4}} onClick={()=>{setLadderPaths(null);setLadderResult(null);setLadderHighlight(-1);}}>{t.reset}</button>
          </div>
        )}
        <button style={{...z.navB,alignSelf:"center",marginTop:4,width:"auto",padding:"6px 16px",fontSize:12}} onClick={mgReset}>{t.reset}</button>
      </div>
    );
  };

  /* ═══════ RENDER: DRAW (제비뽑기) ═══════ */
  const renderDraw=()=>{
    const n=mgNames.length;
    const colors=["#FF6B6B","#4ECDC4","#A855F7","#FFB347","#45B7D1","#96CEB4","#FF7EB3","#7C5CFC","#2ED573","#FFA502","#EE5A24","#6C5CE7"];
    const allRevealed=drawRevealed.length===n&&n>0;
    return(
      <div style={z.sec}>
        <button style={z.navB} onClick={()=>setScreen("mini")}>←</button>
        <h2 style={z.secT}>🎋 {t.draw}</h2>
        <p style={{textAlign:"center",color:"rgba(255,255,255,0.5)",fontSize:12,margin:0}}>{t.drawDesc}</p>

        {drawSticks.length===0&&(<>
          <div style={z.inRow}>
            <input value={mgNameIn} onChange={e=>setMgNameIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&mgAddName()} placeholder={t.nameInput} style={z.inp} maxLength={10}/>
            <button style={z.addBtn} onClick={mgAddName}>{t.addName} ({n}/12)</button>
          </div>
          <div style={z.chipW}>{mgNames.map((name,i)=>(
            <div key={i} style={{...z.chip,background:colors[i%12],color:"#fff",cursor:"pointer"}} onClick={()=>setMgNames(mgNames.filter((_,j)=>j!==i))}>{name} ✕</div>
          ))}</div>
          {n>=2&&(
            <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}>
              <span style={{fontSize:13,fontWeight:800,color:"rgba(255,255,255,0.6)"}}>{t.drawWinCount}:</span>
              <button style={z.cntBtn} onClick={()=>setDrawWinCount(Math.max(1,drawWinCount-1))}>−</button>
              <span style={{fontSize:18,fontWeight:800,color:"#FFE66D"}}>{drawWinCount}</span>
              <button style={z.cntBtn} onClick={()=>setDrawWinCount(Math.min(n-1,drawWinCount+1))}>+</button>
            </div>
          )}
          {n>=2&&<button onClick={initDraw} style={{...z.goBtn,alignSelf:"center",padding:"12px 40px"}}>{t.drawPick}</button>}
        </>)}

        {drawSticks.length>0&&(
          <div style={{display:"grid",gridTemplateColumns:n<=4?"repeat(2,1fr)":n<=6?"repeat(3,1fr)":"repeat(4,1fr)",gap:10}}>
            {mgNames.map((name,i)=>{
              const revealed=drawRevealed.includes(i);
              const picking=drawCurrentPick===i;
              const isWin=drawSticks[i];
              return(
                <button key={i} onClick={()=>pickDraw(i)} disabled={revealed} style={{
                  display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                  padding:"16px 8px",borderRadius:16,border:"none",fontFamily:"inherit",cursor:revealed?"default":"pointer",
                  background:revealed?(isWin?"linear-gradient(135deg,#FFE66D,#FFA502)":"rgba(255,255,255,0.06)"):"linear-gradient(135deg,#2D1B69,#A855F7)",
                  boxShadow:revealed?"none":"0 4px 20px rgba(168,85,247,0.3)",
                  animation:picking?"pulse 0.4s ease-in-out infinite":"none",
                  opacity:revealed?0.9:1,transition:"all 0.3s",
                }}>
                  <span style={{fontSize:revealed?28:32}}>{picking?"❓":revealed?(isWin?"🎉":"💨"):"🎋"}</span>
                  <span style={{fontSize:12,fontWeight:800,color:revealed?(isWin?"#1a1a2e":"rgba(255,255,255,0.4)"):"#fff"}}>{name}</span>
                  {revealed&&<span style={{fontSize:10,fontWeight:800,color:isWin?"#1a1a2e":"rgba(255,255,255,0.3)"}}>{isWin?t.drawWin:t.drawLose}</span>}
                </button>
              );
            })}
          </div>
        )}
        {drawSticks.length>0&&!allRevealed&&(
          <p style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.3)",margin:0}}>{t.drawRemaining}: {n-drawRevealed.length}</p>
        )}
        {allRevealed&&<button onClick={()=>{setDrawSticks([]);setDrawRevealed([]);}} style={{...z.goBtn,alignSelf:"center",padding:"10px 30px"}}>{t.reset}</button>}
        <button style={{...z.navB,alignSelf:"center",marginTop:4,width:"auto",padding:"6px 16px",fontSize:12}} onClick={mgReset}>{t.reset}</button>
      </div>
    );
  };

  /* ═══════ RENDER: NUMBER BOMB ═══════ */
  const renderBomb=()=>{
    const n=mgNames.length;
    const colors=["#FF6B6B","#4ECDC4","#A855F7","#FFB347","#45B7D1","#96CEB4","#FF7EB3","#7C5CFC","#2ED573","#FFA502","#EE5A24","#6C5CE7"];
    const alive=mgNames.filter((_,i)=>!bombEliminated.includes(i));
    const currentPlayer=alive.length>0?alive[bombPlayerIdx%alive.length]:null;
    const isGameOver=bombFeedback?.type==="gameover";
    return(
      <div style={z.sec}>
        <button style={z.navB} onClick={()=>setScreen("mini")}>←</button>
        <h2 style={z.secT}>🔢 {t.bomb}</h2>
        <p style={{textAlign:"center",color:"rgba(255,255,255,0.5)",fontSize:12,margin:0}}>{t.bombDesc}</p>

        {!bombTarget&&(<>
          <div style={z.inRow}>
            <input value={mgNameIn} onChange={e=>setMgNameIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&mgAddName()} placeholder={t.nameInput} style={z.inp} maxLength={10}/>
            <button style={z.addBtn} onClick={mgAddName}>{t.addName} ({n}/12)</button>
          </div>
          <div style={z.chipW}>{mgNames.map((name,i)=>(
            <div key={i} style={{...z.chip,background:colors[i%12],color:"#fff",cursor:"pointer"}} onClick={()=>setMgNames(mgNames.filter((_,j)=>j!==i))}>{name} ✕</div>
          ))}</div>
          {n>=2&&<button onClick={initBomb} style={{...z.goBtn,alignSelf:"center",padding:"12px 40px"}}>{t.startGame} 💣</button>}
        </>)}

        {bombTarget&&!isGameOver&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            {/* Range display */}
            <div style={{display:"flex",alignItems:"center",gap:12,fontSize:28,fontWeight:800}}>
              <span style={{color:"#4ECDC4"}}>{bombMin}</span>
              <span style={{color:"rgba(255,255,255,0.3)",fontSize:16}}>~</span>
              <span style={{color:"#FF6B6B"}}>{bombMax}</span>
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",fontWeight:700}}>{t.bombRange}</div>

            {/* Bomb icon */}
            <div style={{fontSize:50,animation:"wiggle 0.5s ease-in-out infinite"}}>💣</div>

            {/* Current player */}
            <div style={{fontSize:16,fontWeight:800,color:"#FFE66D"}}>{currentPlayer} {lang==="ko"?"의 차례":"'s turn"}</div>

            {/* Players alive */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
              {mgNames.map((name,i)=>{
                const dead=bombEliminated.includes(i);
                const active=name===currentPlayer;
                return <span key={i} style={{padding:"4px 10px",borderRadius:10,fontSize:11,fontWeight:800,
                  background:dead?"rgba(255,255,255,0.05)":active?colors[i%12]:"rgba(255,255,255,0.1)",
                  color:dead?"rgba(255,255,255,0.2)":"#fff",textDecoration:dead?"line-through":"none",
                  boxShadow:active?"0 2px 10px rgba(0,0,0,0.3)":"none"
                }}>{name}</span>;
              })}
            </div>

            {/* Input */}
            {!bombFeedback&&(
              <div style={{...z.inRow,maxWidth:250}}>
                <input type="number" value={bombGuess} onChange={e=>setBombGuess(e.target.value)} onKeyDown={e=>e.key==="Enter"&&bombSubmit()} placeholder={`${bombMin} ~ ${bombMax}`} style={{...z.inp,textAlign:"center",fontSize:20}} min={bombMin} max={bombMax}/>
                <button style={z.addBtn} onClick={bombSubmit}>{t.bombGo}</button>
              </div>
            )}

            {/* Feedback */}
            {bombFeedback&&bombFeedback.type==="safe"&&(
              <div style={{...z.fbCard,animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>
                <span style={{fontSize:28}}>😮‍💨</span>
                <span style={{fontWeight:800,fontSize:16,color:"#4ECDC4"}}>{t.bombSafe} {bombFeedback.dir}</span>
              </div>
            )}
            {bombFeedback&&bombFeedback.type==="explode"&&(
              <div style={{...z.fbCard,animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>
                <span style={{fontSize:36}}>💥</span>
                <span style={{fontWeight:800,fontSize:16,color:"#FF6B6B"}}>{t.bombExplode}</span>
                <span style={{fontWeight:700,fontSize:13,color:"rgba(255,255,255,0.5)"}}>{bombFeedback.who}</span>
              </div>
            )}
          </div>
        )}

        {isGameOver&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,animation:"slideUp 0.4s ease"}}>
            <span style={{fontSize:56}}>🏆</span>
            <span style={{fontSize:22,fontWeight:800,color:"#FFE66D"}}>{t.bombWinner}</span>
            <span style={{fontSize:28,fontWeight:800,color:"#4ECDC4"}}>{bombFeedback.winner}</span>
            <button onClick={()=>{setBombTarget(null);setBombEliminated([]);setBombFeedback(null);}} style={{...z.goBtn,padding:"10px 30px"}}>{t.reset}</button>
          </div>
        )}
        <button style={{...z.navB,alignSelf:"center",marginTop:4,width:"auto",padding:"6px 16px",fontSize:12}} onClick={mgReset}>{t.reset}</button>
      </div>
    );
  };

  /* ═══════ RENDER: TEAM SPLIT ═══════ */
  const renderTeamSplit=()=>{
    const n=mgNames.length;
    const teamColors=["#FF6B6B","#4ECDC4","#A855F7","#FFB347"];
    const teamEmojis=["🔴","🟢","🟣","🟠"];
    return(
      <div style={z.sec}>
        <button style={z.navB} onClick={()=>setScreen("mini")}>←</button>
        <h2 style={z.secT}>🎯 {t.teamSplit}</h2>
        <p style={{textAlign:"center",color:"rgba(255,255,255,0.5)",fontSize:12,margin:0}}>{t.teamSplitDesc}</p>

        <div style={z.inRow}>
          <input value={mgNameIn} onChange={e=>setMgNameIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&mgAddName()} placeholder={t.nameInput} style={z.inp} maxLength={10}/>
          <button style={z.addBtn} onClick={mgAddName}>{t.addName} ({n}/12)</button>
        </div>
        <div style={z.chipW}>{mgNames.map((name,i)=>(
          <div key={i} style={{...z.chip,background:`hsl(${(i*47)%360},70%,65%)`,color:"#fff",cursor:"pointer"}} onClick={()=>setMgNames(mgNames.filter((_,j)=>j!==i))}>{name} ✕</div>
        ))}</div>

        {n>=2&&!splitResult&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:13,fontWeight:800,color:"rgba(255,255,255,0.6)"}}>{t.teamCount}:</span>
              <button style={z.cntBtn} onClick={()=>setSplitTeamCount(Math.max(2,splitTeamCount-1))}>−</button>
              <span style={{fontSize:20,fontWeight:800,color:"#FFE66D"}}>{splitTeamCount}</span>
              <button style={z.cntBtn} onClick={()=>setSplitTeamCount(Math.min(Math.min(4,n),splitTeamCount+1))}>+</button>
            </div>
            <button onClick={doTeamSplit} style={{...z.goBtn,padding:"12px 40px"}}>{t.teamShuffle}</button>
          </div>
        )}

        {splitResult&&(
          <div style={{display:"flex",flexDirection:"column",gap:10,animation:"slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
            {splitResult.map((team,ti)=>(
              <div key={ti} style={{background:"rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden",border:`2px solid ${teamColors[ti]}40`}}>
                <div style={{background:teamColors[ti],padding:"8px 14px",fontWeight:800,fontSize:14,color:"#fff",display:"flex",alignItems:"center",gap:6}}>
                  <span>{teamEmojis[ti]}</span>
                  <span>{lang==="ko"?`${ti+1}팀`:`Team ${ti+1}`}</span>
                  <span style={{fontSize:12,opacity:0.7}}>({team.length}{lang==="ko"?"명":""})</span>
                </div>
                <div style={{padding:"10px 14px",display:"flex",flexWrap:"wrap",gap:6}}>
                  {team.map((name,ni)=>(
                    <span key={ni} style={{padding:"5px 12px",borderRadius:10,background:`${teamColors[ti]}20`,color:teamColors[ti],fontWeight:800,fontSize:13}}>{name}</span>
                  ))}
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button onClick={doTeamSplit} style={{...z.addBtn,background:"linear-gradient(135deg,#A855F7,#FF6B6B)"}}>{t.teamShuffle} 🔀</button>
              <button onClick={()=>setSplitResult(null)} style={{...z.navB,width:"auto",padding:"6px 16px",fontSize:12}}>{t.reset}</button>
            </div>
          </div>
        )}
        <button style={{...z.navB,alignSelf:"center",marginTop:4,width:"auto",padding:"6px 16px",fontSize:12}} onClick={mgReset}>{t.reset}</button>
      </div>
    );
  };

  /* ═══════ SETTINGS PANEL ═══════ */
  const renderSoundPanel = () => showSettings ? (
    <div style={z.settingsOverlay} onClick={()=>setShowSettings(false)}>
      <div style={z.settingsCard} onClick={e=>e.stopPropagation()}>
        <div style={z.settingsHeader}>
          <span style={{fontSize:18}}>⚙️</span>
          <span style={{fontWeight:800,fontSize:15}}>{lang==="ko"?"설정":"Settings"}</span>
          <button style={z.settingsClose} onClick={()=>setShowSettings(false)}>✕</button>
        </div>

        <div style={z.volRow}>
          <span style={z.volLabel}>🔊 {lang==="ko"?"효과음":"SFX"}</span>
          <input type="range" min="0" max="100" value={sfxVol} onChange={e=>{setSfxVol(Number(e.target.value));}} style={z.slider}/>
          <span style={z.volNum}>{sfxVol}%</span>
        </div>

        <div style={z.volRow}>
          <span style={z.volLabel}>🎵 {lang==="ko"?"배경음":"BGM"}</span>
          <input type="range" min="0" max="100" value={bgmVol} onChange={e=>{setBgmVol(Number(e.target.value));}} style={z.slider}/>
          <span style={z.volNum}>{bgmVol}%</span>
        </div>

        {screen==="game"&&(
          <button style={{...z.bgmToggle,background:bgmOn?"linear-gradient(135deg,#4ECDC4,#A855F7)":"rgba(255,255,255,0.1)"}} onClick={()=>setBgmOn(!bgmOn)}>
            {bgmOn?(lang==="ko"?"🎵 BGM 켜짐":"🎵 BGM On"):(lang==="ko"?"🎵 BGM 꺼짐":"🎵 BGM Off")}
          </button>
        )}

        <div style={z.volRow}>
          <span style={z.volLabel}>🌐 {lang==="ko"?"언어":"Lang"}</span>
          <button style={z.langSwitch} onClick={()=>setLang(lang==="ko"?"en":"ko")}>{lang==="ko"?"English":"한국어"}</button>
        </div>
      </div>
    </div>
  ) : null;

  /* ═══════ MAIN RENDER ═══════ */
  if(screen==="game"&&mode==="team")return(<div style={z.root}>{renderTeamGame()}<button style={z.gearBtnAbs} onClick={()=>setShowSettings(true)}>⚙️</button>{renderSoundPanel()}<style>{CSS}</style></div>);

  return(
    <div style={z.root}>
      <div style={z.container}>
        <button style={z.gearBtn} onClick={()=>setShowSettings(true)}>⚙️</button>
        {renderSoundPanel()}

        {!["game","results","roulette","ladder","draw","bomb","teamSplit"].includes(screen)&&(
          <div style={z.titleWrap}>
            <div style={{fontSize:32,animation:"float 2s ease-in-out infinite"}}>⚡</div>
            <h1 style={z.title}>{t.title}</h1>
            <p style={z.sub}>{t.subtitle}</p>
            <div style={z.dots}>{["mode","players","settings","ready"].map((st,i)=>(
              <div key={st} style={{...z.dot,background:screen===st?"#FFD93D":["mode","players","settings","ready"].indexOf(screen)>i?"#2ED573":"rgba(255,255,255,0.12)",transform:screen===st?"scale(1.4)":"scale(1)"}}/>
            ))}</div>
          </div>
        )}

        {screen==="mode"&&(
          <div style={z.sec}>
            <h2 style={z.secT}>{t.modeSelect}</h2>
            <div style={z.modeRow}>{[["individual","🏆"],["team","⚔️"]].map(([m,e])=>(
              <button key={m} onClick={()=>{setMode(m);setTimeout(()=>setScreen("players"),300);}} style={{...z.modeCard,border:mode===m?"3px solid #FFE66D":"3px solid rgba(255,255,255,0.08)",background:mode===m?"rgba(255,230,109,0.15)":"rgba(255,255,255,0.04)"}}>
                <span style={{fontSize:42}}>{e}</span><span style={{fontSize:15,fontWeight:800}}>{t[m]}</span>
              </button>
            ))}</div>
            <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:14,marginTop:4}}>
              <button onClick={()=>setScreen("mini")} style={{...z.modeCard,border:"3px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",width:"100%",flexDirection:"row",gap:12,padding:"16px 20px"}}>
                <span style={{fontSize:30}}>🎲</span><span style={{fontSize:15,fontWeight:800}}>{t.miniGames}</span>
              </button>
            </div>
          </div>
        )}

        {screen==="mini"&&(
          <div style={z.sec}>
            <h2 style={z.secT}>🎲 {t.miniGames}</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
              {[["roulette","🎰",t.roulette],["ladder","🪜",t.ladder],["draw","🎋",t.draw],["bomb","🔢",t.bomb],["teamSplit","🎯",t.teamSplit]].map(([scr,emoji,label])=>(
                <button key={scr} onClick={()=>setScreen(scr)} style={{...z.modeCard,border:"3px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",padding:"18px 8px"}}>
                  <span style={{fontSize:36}}>{emoji}</span><span style={{fontSize:13,fontWeight:800}}>{label}</span>
                </button>
              ))}
            </div>
            <button style={z.navB} onClick={()=>setScreen("mode")}>←</button>
          </div>
        )}

        {screen==="roulette"&&renderRoulette()}
        {screen==="ladder"&&renderLadder()}
        {screen==="draw"&&renderDraw()}
        {screen==="bomb"&&renderBomb()}
        {screen==="teamSplit"&&renderTeamSplit()}

        {screen==="players"&&(
          <div style={z.sec}>
            <h2 style={z.secT}>{t.players}</h2>
            {mode==="team"&&(<div style={z.tTog}>{["A","B"].map(tm=>(<button key={tm} onClick={()=>setSelTeam(tm)} style={{...z.tBtn,background:selTeam===tm?TC[tm].bg:"transparent",color:selTeam===tm?"#fff":"#888",border:`2px solid ${TC[tm].bg}`}}>{tm==="A"?t.teamA:t.teamB}</button>))}</div>)}
            <div style={{...z.inRow,animation:shake?"shake 0.4s":"none"}}>
              <input ref={inRef} value={nameIn} onChange={e=>setNameIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlayer()} placeholder={t.playerName} style={z.inp} maxLength={10}/>
              <button style={z.addBtn} onClick={addPlayer}>{t.addPlayer}</button>
            </div>
            {mode==="team"?(<div style={z.tCols}>{["A","B"].map(tm=>(<div key={tm} style={z.tCol}><div style={{...z.tColH,background:TC[tm].bg}}>{tm==="A"?t.teamA:t.teamB} ({players.filter(p=>p.team===tm).length})</div>{players.filter(p=>p.team===tm).map(p=>(<div key={p.id} style={{...z.chip,background:TC[tm].lt,color:"#1a1a2e"}} onClick={()=>setPlayers(players.filter(x=>x.id!==p.id))}>{p.name} ✕</div>))}</div>))}</div>):(<div style={z.chipW}>{players.map((p,i)=>(<div key={p.id} style={{...z.chip,background:`hsl(${(i*47)%360},70%,82%)`,color:"#1a1a2e"}} onClick={()=>setPlayers(players.filter(x=>x.id!==p.id))}>{p.name} ✕</div>))}</div>)}
            {players.length>0&&<p style={z.tip}>{t.removeTip}</p>}
            <div style={z.navRow}><button style={z.navB} onClick={()=>setScreen("mode")}>←</button>{canGo()&&<button style={z.startBtn} onClick={()=>setScreen("settings")}>{t.topic} →</button>}</div>
          </div>
        )}

        {screen==="settings"&&(
          <div style={z.sec}>
            <h2 style={z.secT}>{t.topic}</h2>
            <div style={z.topGrid}>{[["topicGeneral","🧠"],["topicAnimal","🐾"],["topicPlace","🌍"],["topicScience","🔬"],["topicMovie","🎬"],["topicFood","🍕"],["topicSports","⚽"],["topicTech","💻"],["topicCustom","✏️"]].map(([k,e])=>(
              <button key={k} onClick={()=>{setTopic(k);if(k!=="topicCustom")setTimeout(()=>setScreen("ready"),300);}} style={{...z.topCard,border:topic===k?"3px solid #FFE66D":"3px solid rgba(255,255,255,0.08)",background:topic===k?"rgba(255,230,109,0.15)":"rgba(255,255,255,0.04)"}}>
                <span style={{fontSize:24}}>{e}</span><span style={{fontSize:11,fontWeight:900}}>{t[k]}</span>
              </button>
            ))}</div>
            {topic==="topicCustom"&&(
              <div style={z.custSec}>
                <h3 style={{margin:0,fontSize:13,color:"#FFD93D",fontWeight:900}}>{t.customTitle}</h3>
                <input value={cQ} onChange={e=>setCQ(e.target.value)} placeholder={t.customQPlaceholder} style={z.inp}/>
                <input value={cA} onChange={e=>setCA(e.target.value)} placeholder={t.customAPlaceholder} style={{...z.inp,borderColor:"rgba(46,213,115,0.3)"}}/>
                <input value={cW1} onChange={e=>setCW1(e.target.value)} placeholder={t.customW1} style={z.inp}/>
                <input value={cW2} onChange={e=>setCW2(e.target.value)} placeholder={t.customW2} style={z.inp}/>
                <input value={cW3} onChange={e=>setCW3(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCust()} placeholder={t.customW3} style={z.inp}/>
                <button style={z.addBtn} onClick={addCust}>{t.addQuestion}</button>
                <p style={z.tip}>{custQs.length} {t.questionsAdded}</p>
              </div>
            )}
            <div style={z.navRow}><button style={z.navB} onClick={()=>setScreen("players")}>←</button>{topic==="topicCustom"&&<button style={{...z.startBtn,opacity:custQs.length>=5?1:0.3,pointerEvents:custQs.length>=5?"auto":"none"}} onClick={()=>setScreen("ready")}>{t.ready} →</button>}</div>
          </div>
        )}

        {screen==="ready"&&(
          <div style={{...z.sec,textAlign:"center"}}>
            <div style={{fontSize:44,animation:"pulse 1.5s ease-in-out infinite"}}>🎮</div>
            <h2 style={{...z.secT,fontSize:22}}>{t.ready}</h2>
            <div style={z.sum}>{[[t.modeSelect,mode==="individual"?t.individual:t.team],[t.players,players.length],[t.topic,t[topic]]].map(([l,v],i)=>(<div key={i} style={z.sumR}><span style={z.sumL}>{l}</span><span style={z.sumV}>{v}</span></div>))}</div>
            <div style={z.cntRow}><span style={z.cntL}>{t.questionCount}</span><div style={z.cntC}><button style={z.cntBtn} onClick={()=>setQCount(Math.max(5,qCount-5))}>−</button><span style={z.cntV}>{qCount}</span><button style={z.cntBtn} onClick={()=>setQCount(Math.min(30,qCount+5))}>+</button></div></div>
            <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:10}}>
              <button style={z.navB} onClick={()=>setScreen("settings")}>←</button>
              <button style={{padding:"14px 30px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#4ECDC4,#A855F7)",color:"#fff",fontSize:18,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(78,205,196,0.4)",WebkitTapHighlightColor:"transparent",touchAction:"manipulation"}} onClick={()=>startGame()}>{t.startGame} ⚡</button>
            </div>
          </div>
        )}

        {screen==="game"&&mode==="individual"&&renderIndiGame()}
        {screen==="results"&&renderResults()}
      </div>
      <style>{CSS}</style>
    </div>
  );
}

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Black+Han+Sans&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
body{margin:0;overflow-x:hidden;}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,217,61,0.3)}50%{box-shadow:0 0 50px rgba(255,217,61,0.7)}}
@keyframes bounce{0%,100%{transform:translateY(0)}40%{transform:translateY(-12px)}60%{transform:translateY(-6px)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes rainbow{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
@keyframes blob1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}}
@keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-40px,30px) scale(0.9)}66%{transform:translate(20px,-40px) scale(1.1)}}
@keyframes popIn{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
@keyframes wiggle{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
input::placeholder{color:rgba(255,255,255,0.4);}
input[type="range"]{-webkit-appearance:none;appearance:none;height:6px;background:rgba(255,255,255,0.15);border-radius:3px;outline:none;}
input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#FFE66D,#FFA502);cursor:pointer;box-shadow:0 2px 8px rgba(255,165,2,0.4);}
input[type="range"]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#FFE66D,#FFA502);cursor:pointer;border:none;box-shadow:0 2px 8px rgba(255,165,2,0.4);}
`;

const z={
  root:{minHeight:"100vh",background:"linear-gradient(135deg,#1B0A3C 0%,#2D1B69 30%,#11998E 100%)",fontFamily:"'Baloo 2','Black Han Sans',sans-serif",position:"relative",overflow:"hidden"},
  container:{maxWidth:520,margin:"0 auto",padding:"16px",color:"#fff",position:"relative",minHeight:"100vh"},
  titleWrap:{textAlign:"center",marginBottom:12},
  title:{fontSize:32,fontWeight:800,margin:0,background:"linear-gradient(135deg,#FFE66D,#FF6B6B,#4ECDC4,#A855F7)",backgroundSize:"300% 300%",animation:"rainbow 4s ease infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-1},
  sub:{fontSize:12,color:"rgba(255,255,255,0.5)",margin:"4px 0 0",fontWeight:600},
  dots:{display:"flex",justifyContent:"center",gap:8,marginTop:10},
  dot:{width:10,height:10,borderRadius:"50%",transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)"},
  sec:{display:"flex",flexDirection:"column",gap:14,animation:"slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)"},
  secT:{fontSize:17,fontWeight:800,textAlign:"center",color:"#FFE66D",margin:0,letterSpacing:0.5,textShadow:"0 2px 10px rgba(255,230,109,0.3)"},
  modeRow:{display:"flex",gap:12},
  modeCard:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"24px 10px",borderRadius:20,cursor:"pointer",color:"#fff",fontFamily:"inherit",transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",backdropFilter:"blur(10px)",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"},
  tTog:{display:"flex",gap:8},
  tBtn:{flex:1,padding:"8px",borderRadius:12,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",boxShadow:"0 4px 15px rgba(0,0,0,0.2)"},
  inRow:{display:"flex",gap:8},
  inp:{flex:1,padding:"11px 14px",borderRadius:14,border:"2px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",color:"#fff",fontSize:14,fontWeight:700,outline:"none",fontFamily:"inherit",transition:"border-color 0.2s"},
  addBtn:{padding:"11px 18px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#FFE66D,#FFA502)",color:"#1a1a2e",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",boxShadow:"0 4px 15px rgba(255,165,2,0.3)",transition:"transform 0.2s"},
  tCols:{display:"flex",gap:8},tCol:{flex:1,display:"flex",flexDirection:"column",gap:5},
  tColH:{padding:"7px",borderRadius:10,fontSize:12,fontWeight:800,textAlign:"center",color:"#fff",boxShadow:"0 4px 15px rgba(0,0,0,0.2)"},
  chipW:{display:"flex",flexWrap:"wrap",gap:6},
  chip:{padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.15)",animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",transition:"transform 0.2s"},
  tip:{fontSize:10,color:"rgba(255,255,255,0.35)",textAlign:"center",margin:0},
  navRow:{display:"flex",justifyContent:"space-between",alignItems:"center"},
  navB:{width:42,height:42,borderRadius:14,border:"2px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",color:"#fff",fontSize:16,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"},
  navN:{width:48,height:48,borderRadius:16,border:"none",background:"linear-gradient(135deg,#FFE66D,#FF6B6B)",color:"#1a1a2e",fontSize:20,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 20px rgba(255,107,107,0.4)",transition:"transform 0.2s"},
  topGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8},
  topCard:{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"14px 6px",borderRadius:16,cursor:"pointer",color:"#fff",fontFamily:"inherit",transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",backdropFilter:"blur(10px)",boxShadow:"0 4px 20px rgba(0,0,0,0.15)"},
  custSec:{display:"flex",flexDirection:"column",gap:7,padding:12,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(10px)",borderRadius:16,border:"1px solid rgba(255,255,255,0.1)"},
  cntRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(10px)",borderRadius:16,border:"1px solid rgba(255,255,255,0.1)"},
  cntL:{fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.5)"},
  cntC:{display:"flex",alignItems:"center",gap:14},
  cntBtn:{width:34,height:34,borderRadius:10,border:"2px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:17,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"},
  cntV:{fontSize:20,fontWeight:800,color:"#FFE66D",minWidth:28,textAlign:"center",textShadow:"0 2px 10px rgba(255,230,109,0.3)"},
  startBtn:{flex:1,padding:"13px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#FF6B6B,#A855F7)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 25px rgba(168,85,247,0.4)",transition:"transform 0.2s"},
  sum:{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(10px)",borderRadius:16,padding:14,display:"flex",flexDirection:"column",gap:7,border:"1px solid rgba(255,255,255,0.1)"},
  sumR:{display:"flex",justifyContent:"space-between"},
  sumL:{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:700},
  sumV:{fontSize:13,color:"#FFE66D",fontWeight:800},
  goBtn:{padding:"13px 26px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#4ECDC4,#44B09E,#A855F7)",backgroundSize:"200% 200%",color:"#fff",fontSize:18,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(78,205,196,0.4)",transition:"transform 0.2s",position:"relative",zIndex:5},

  // Split screen
  splitWrap:{display:"flex",flexDirection:"column",height:"100vh",color:"#fff",background:"linear-gradient(180deg,#1B0A3C,#2D1B69,#11998E)"},
  half:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0,position:"relative"},
  halfHead:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 12px",flexShrink:0,boxShadow:"0 2px 10px rgba(0,0,0,0.2)"},
  halfTN:{fontWeight:800,fontSize:13,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,0.3)"},
  halfSc:{fontWeight:800,fontSize:13,color:"#FFE66D",textShadow:"0 1px 3px rgba(0,0,0,0.3)"},
  halfBody:{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:6,padding:"6px 12px",overflow:"auto"},
  halfQArea:{textAlign:"center"},
  halfQNum:{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)"},
  halfQTxt:{fontSize:15,fontWeight:800,margin:"4px 0 0",lineHeight:1.3,textShadow:"0 1px 5px rgba(0,0,0,0.2)"},
  divider:{height:36,background:"linear-gradient(90deg,#FF6B6B,#A855F7,#4ECDC4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 0 20px rgba(168,85,247,0.3)"},
  divTxt:{fontSize:16,fontWeight:800,color:"#fff",letterSpacing:4,textShadow:"0 2px 10px rgba(0,0,0,0.3)"},
  bigBuzz:{padding:"14px",borderRadius:16,border:"none",color:"#fff",fontSize:20,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 25px rgba(0,0,0,0.3)",flexShrink:0,animation:"pulse 1.5s ease-in-out infinite",textShadow:"0 2px 5px rgba(0,0,0,0.3)"},
  pickZone:{display:"flex",flexDirection:"column",gap:6,flexShrink:0},
  tmrRow:{display:"flex",alignItems:"center",gap:8},
  tmrBar:{flex:1,height:7,background:"rgba(255,255,255,0.12)",borderRadius:4,overflow:"hidden",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.2)"},
  tmrFill:{height:"100%",borderRadius:4,transition:"width 1s linear",boxShadow:"0 0 10px rgba(46,213,115,0.5)"},
  tmrNum:{fontSize:16,fontWeight:800,minWidth:30,textShadow:"0 1px 5px rgba(0,0,0,0.3)"},
  itRow:{display:"flex",gap:6},
  itBtn:{padding:"4px 10px",borderRadius:10,border:"2px solid #FFE66D",background:"rgba(255,230,109,0.15)",color:"#FFE66D",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(255,230,109,0.2)",animation:"wiggle 1s ease-in-out infinite"},
  chGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7},
  chBtn:{padding:"12px 8px",borderRadius:14,border:"none",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",textAlign:"center",lineHeight:1.2,boxShadow:"0 4px 15px rgba(0,0,0,0.25)",transition:"transform 0.15s",textShadow:"0 1px 3px rgba(0,0,0,0.3)"},
  waitTxt:{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.35)",fontWeight:700,margin:0,animation:"pulse 2s ease-in-out infinite"},
  fbCard:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"12px",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",borderRadius:16,flexShrink:0,border:"1px solid rgba(255,255,255,0.15)",animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)"},
  flashW:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",color:"#FF6B6B",fontWeight:800,fontSize:16,textShadow:"0 2px 10px rgba(255,107,107,0.5)",animation:"pulse 0.5s"},
  nxtBtn:{padding:"10px",borderRadius:14,border:"none",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",flexShrink:0,boxShadow:"0 4px 15px rgba(0,0,0,0.25)",transition:"transform 0.2s"},

  // Individual
  indiArea:{display:"flex",flexDirection:"column",gap:12,animation:"slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)"},
  miniScs:{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",marginTop:4},
  miniSc:{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.5)",background:"rgba(255,255,255,0.06)",padding:"2px 8px",borderRadius:8},
  indiQCard:{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",borderRadius:20,padding:"18px 16px",textAlign:"center",border:"1px solid rgba(255,255,255,0.12)",boxShadow:"0 8px 30px rgba(0,0,0,0.15)"},
  indiQN:{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)"},
  indiQT:{fontSize:18,fontWeight:800,margin:"6px 0 0",lineHeight:1.3,textShadow:"0 1px 5px rgba(0,0,0,0.15)"},
  indiBGrid:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10},
  indiBBtn:{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"16px 8px",borderRadius:18,border:"none",color:"#fff",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 20px rgba(0,0,0,0.25)",animation:"bounce 2s ease-in-out infinite",textShadow:"0 1px 3px rgba(0,0,0,0.3)"},
  nxtBtnIndi:{padding:"14px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#FFE66D,#FFA502)",color:"#1a1a2e",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"inherit",textAlign:"center",boxShadow:"0 6px 25px rgba(255,165,2,0.4)",transition:"transform 0.2s"},

  // Results
  resArea:{display:"flex",flexDirection:"column",alignItems:"center",gap:14,paddingTop:20,animation:"slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1)"},
  resTitle:{fontSize:28,fontWeight:800,background:"linear-gradient(135deg,#FFE66D,#FF6B6B,#A855F7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:0,textShadow:"none"},
  resBanner:{background:"rgba(255,230,109,0.1)",backdropFilter:"blur(10px)",borderRadius:20,padding:"16px 22px",textAlign:"center",width:"100%",border:"2px solid rgba(255,230,109,0.3)",display:"flex",flexDirection:"column",gap:2,boxShadow:"0 8px 30px rgba(255,230,109,0.1)"},
  resTeams:{display:"flex",gap:10,width:"100%"},
  resTeamCard:{flex:1,borderRadius:16,overflow:"hidden",border:"2px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",backdropFilter:"blur(10px)",boxShadow:"0 6px 20px rgba(0,0,0,0.15)"},
  resList:{width:"100%",display:"flex",flexDirection:"column",gap:4},
  resRow:{display:"flex",alignItems:"center",padding:"10px 12px",borderRadius:12,gap:8,background:"rgba(255,255,255,0.04)",backdropFilter:"blur(10px)"},
  resActs:{display:"flex",gap:8,width:"100%",marginTop:6},
  resPlay:{flex:1,padding:"13px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#4ECDC4,#11998E)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 20px rgba(78,205,196,0.3)",transition:"transform 0.2s"},
  resLobby:{flex:1,padding:"13px",borderRadius:16,border:"2px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(10px)",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"},
  exitBtn:{position:"absolute",left:0,top:0,width:36,height:36,borderRadius:12,border:"2px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",color:"#fff",fontSize:16,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10},
  exitBtnTeam:{position:"absolute",left:10,background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,width:28,height:28,fontSize:14,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10},
  gearBtn:{position:"fixed",top:10,left:10,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",border:"2px solid rgba(255,255,255,0.25)",color:"#fff",borderRadius:12,width:38,height:38,fontSize:16,cursor:"pointer",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.2s"},
  gearBtnAbs:{position:"fixed",top:10,left:10,background:"rgba(255,255,255,0.2)",backdropFilter:"blur(10px)",border:"none",color:"#fff",borderRadius:10,width:36,height:36,fontSize:15,cursor:"pointer",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"},
  settingsOverlay:{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(5px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)"},
  settingsCard:{background:"linear-gradient(135deg,#2D1B69,#1B0A3C)",borderRadius:24,padding:"20px",width:"100%",maxWidth:340,border:"2px solid rgba(255,255,255,0.15)",boxShadow:"0 20px 60px rgba(0,0,0,0.5)",display:"flex",flexDirection:"column",gap:16},
  settingsHeader:{display:"flex",alignItems:"center",gap:8,justifyContent:"center",position:"relative"},
  settingsClose:{position:"absolute",right:0,background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:18,cursor:"pointer",padding:4},
  volRow:{display:"flex",alignItems:"center",gap:10},
  volLabel:{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.7)",minWidth:65,flexShrink:0},
  slider:{flex:1,height:6,WebkitAppearance:"none",appearance:"none",background:"rgba(255,255,255,0.15)",borderRadius:3,outline:"none",cursor:"pointer",accentColor:"#FFE66D"},
  volNum:{fontSize:13,fontWeight:800,color:"#FFE66D",minWidth:36,textAlign:"right"},
  bgmToggle:{padding:"10px",borderRadius:14,border:"none",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all 0.2s"},
  langSwitch:{padding:"6px 16px",borderRadius:10,border:"2px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"},
};
