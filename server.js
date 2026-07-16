const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

const supportedLanguages = new Set([
  'ar', 'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'he', 'hi',
  'hu', 'id', 'it', 'ja', 'ko', 'ms', 'nl', 'no', 'pl', 'pt', 'ro', 'ru',
  'sk', 'sv', 'th', 'tr', 'uk', 'vi', 'zh-CN', 'zh-TW'
]);

const virtualUsers = [
  {
    id: 'BOT-amelia',
    name: 'Amelia',
    source: 'en',
    replies: [
      'That sounds interesting. Can you tell me a little more?',
      'I see what you mean. How do you feel about that?',
      'Nice. I would like to hear another example.',
      'That makes sense. What happened next?'
    ]
  },
  {
    id: 'BOT-minjun',
    name: 'Minjun',
    source: 'ko',
    replies: [
      '좋아요. 조금 더 자세히 말해 줄 수 있어요?',
      '그 말 이해했어요. 다음에는 어떻게 했어요?',
      '재미있네요. 저도 그 이야기를 더 듣고 싶어요.',
      '맞아요. 그런 상황에서는 천천히 말하면 좋아요.'
    ]
  },
  {
    id: 'BOT-sofia',
    name: 'Sofia',
    source: 'es',
    replies: [
      'Entiendo. ¿Puedes contarme un poco más?',
      'Qué interesante. ¿Y después qué pasó?',
      'Me parece bien. También quiero saber tu opinión.',
      'Sí, tiene sentido. Podemos seguir hablando de eso.'
    ]
  },
  {
    id: 'BOT-camille',
    name: 'Camille',
    source: 'fr',
    replies: [
      'Je comprends. Tu peux expliquer un peu plus ?',
      'C’est intéressant. Qu’est-ce que tu en penses ?',
      'D’accord. On peut continuer cette conversation.',
      'Oui, ça a du sens. Raconte-moi la suite.'
    ]
  },
  {
    id: 'BOT-liwei',
    name: 'Li Wei',
    source: 'zh-CN',
    replies: [
      '我明白了。你可以再多说一点吗？',
      '很有意思。然后发生了什么？',
      '听起来不错。你怎么看？',
      '可以，我们继续聊这个话题。'
    ]
  },
  {
    id: 'BOT-haru',
    name: 'Haru',
    source: 'ja',
    replies: [
      'いいですね。もう少し詳しく聞かせてください。',
      'なるほど、そういうことですね。次はどうなりましたか？',
      '面白いです。その話をもう少し続けましょう。',
      'わかりました。ゆっくり会話していきましょう。'
    ]
  }
];

const virtualNamesByLanguage = {
  ja: 'Haru',
  en: 'Amelia',
  ko: 'Minjun',
  es: 'Sofia',
  fr: 'Camille',
  de: 'Lena',
  it: 'Marco',
  pt: 'Lucas',
  'zh-CN': 'Li Wei',
  'zh-TW': 'Mei',
  ar: 'Noura',
  hi: 'Aarav',
  th: 'Mali',
  vi: 'Linh',
  id: 'Bima',
  ms: 'Aina',
  tr: 'Deniz',
  uk: 'Oksana',
  nl: 'Noa',
  sv: 'Elsa',
  no: 'Nora',
  da: 'Freja',
  fi: 'Aino',
  pl: 'Ania',
  cs: 'Tereza',
  sk: 'Marek',
  hu: 'Eszter',
  ro: 'Andrei',
  bg: 'Mila',
  el: 'Nikos',
  he: 'Noam'
};

const replyTemplates = {
  ja: {
    greeting: 'こんにちは。会えてうれしいです。何について話しましょうか？',
    question: 'いい質問ですね。状況によって変わると思います。',
    replies: [
      'いいですね。もう少し詳しく聞かせてください。',
      'なるほど、そういうことですね。次はどうなりましたか？',
      'その話、面白いです。あなたはどう思いますか？',
      'わかりました。ゆっくり会話していきましょう。'
    ]
  },
  en: {
    greeting: 'Hi! Nice to meet you. What would you like to talk about?',
    question: 'Good question. I think it depends on the situation.',
    replies: [
      'That sounds interesting. Can you tell me a little more?',
      'I see what you mean. How do you feel about that?',
      'Nice. I would like to hear another example.',
      'That makes sense. What happened next?'
    ]
  },
  ko: {
    greeting: '안녕하세요! 만나서 반가워요. 무엇에 대해 이야기할까요?',
    question: '좋은 질문이에요. 상황에 따라 다를 것 같아요.',
    replies: [
      '좋아요. 조금 더 자세히 말해 줄 수 있어요?',
      '그 말 이해했어요. 다음에는 어떻게 했어요?',
      '재미있네요. 저도 그 이야기를 더 듣고 싶어요.',
      '맞아요. 천천히 이야기해도 괜찮아요.'
    ]
  },
  es: {
    greeting: '¡Hola! Mucho gusto. ¿De qué quieres hablar?',
    question: 'Buena pregunta. Creo que depende de la situación.',
    replies: [
      'Entiendo. ¿Puedes contarme un poco más?',
      'Qué interesante. ¿Y después qué pasó?',
      'Me parece bien. También quiero saber tu opinión.',
      'Sí, tiene sentido. Podemos seguir hablando de eso.'
    ]
  },
  fr: {
    greeting: 'Bonjour ! Ravi de te rencontrer. De quoi veux-tu parler ?',
    question: 'Bonne question. Je pense que ça dépend de la situation.',
    replies: [
      'Je comprends. Tu peux expliquer un peu plus ?',
      'C’est intéressant. Qu’est-ce que tu en penses ?',
      'D’accord. On peut continuer cette conversation.',
      'Oui, ça a du sens. Raconte-moi la suite.'
    ]
  },
  'zh-CN': {
    greeting: '你好！很高兴认识你。你想聊什么？',
    question: '这是个好问题。我觉得要看情况。',
    replies: [
      '我明白了。你可以再多说一点吗？',
      '很有意思。然后发生了什么？',
      '听起来不错。你怎么看？',
      '可以，我们继续聊这个话题。'
    ]
  }
};

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getConversationStarterReply(text) {
  const topicReplies = [
    {
      pattern: /趣味|hobby|hobbies/i,
      reply: '趣味の話はいいですね。最近いちばん楽しいと思った趣味は何ですか？'
    },
    {
      pattern: /音楽|music/i,
      reply: '音楽の話をしましょう。最近よく聴いている曲やアーティストはいますか？'
    },
    {
      pattern: /映画|movie|film/i,
      reply: '映画の話題ですね。最近見て面白かった映画はありますか？'
    },
    {
      pattern: /旅行|travel|trip/i,
      reply: '旅行の話は盛り上がりますね。行ってみたい国や場所はありますか？'
    },
    {
      pattern: /食べ物|food|料理/i,
      reply: '食べ物の話ですね。好きな料理や、最近食べておいしかったものはありますか？'
    },
    {
      pattern: /スポーツ|sport/i,
      reply: 'スポーツの話ですね。見るのとやるの、どちらが好きですか？'
    },
    {
      pattern: /学校|school/i,
      reply: '学校の話ですね。今いちばん楽しい授業や活動は何ですか？'
    },
    {
      pattern: /仕事|work|job/i,
      reply: '仕事の話ですね。最近がんばっていることや大変だったことはありますか？'
    },
    {
      pattern: /週末|weekend/i,
      reply: '週末の予定、気になります。ゆっくり過ごす予定ですか、それともどこかへ出かけますか？'
    },
    {
      pattern: /家族|family/i,
      reply: '家族の話ですね。家族とよく一緒にすることはありますか？'
    },
    {
      pattern: /ペット|pet/i,
      reply: 'ペットの話は楽しいですね。飼っているペットや好きな動物はいますか？'
    },
    {
      pattern: /夢|dream/i,
      reply: '夢の話、いいですね。将来やってみたいことはありますか？'
    },
    {
      pattern: /おすすめ|recommend/i,
      reply: 'おすすめを聞くのはいい会話の始め方ですね。食べ物、映画、場所ならどれを知りたいですか？'
    }
  ];

  const found = topicReplies.find((item) => item.pattern.test(text));
  return found ? found.reply : null;
}

function createVirtualReply(message, user) {
  const text = String(message.text || message.msg || '').trim();
  const lowerText = text.toLowerCase();

  if (/hello|hi|hey|こんにちは|こんばんは|안녕|hola|bonjour|你好/.test(lowerText)) {
    const greetings = {
      en: 'Hi! Nice to meet you. What would you like to talk about?',
      ko: '안녕하세요! 만나서 반가워요. 무엇에 대해 이야기할까요?',
      es: '¡Hola! Mucho gusto. ¿De qué quieres hablar?',
      fr: 'Bonjour ! Ravi de te rencontrer. De quoi veux-tu parler ?',
      'zh-CN': '你好！很高兴认识你。你想聊什么？',
      ja: 'こんにちは。会えてうれしいです。何について話しましょうか？'
    };
    return greetings[user.source] || pickRandom(user.replies);
  }

  if (/[?？]$/.test(text)) {
    const questions = {
      en: 'Good question. I think it depends on the situation.',
      ko: '좋은 질문이에요. 상황에 따라 다를 것 같아요.',
      es: 'Buena pregunta. Creo que depende de la situación.',
      fr: 'Bonne question. Je pense que ça dépend de la situation.',
      'zh-CN': '这是个好问题。我觉得要看情况。',
      ja: 'いい質問ですね。状況によって変わると思います。'
    };
    return questions[user.source] || pickRandom(user.replies);
  }

  return pickRandom(user.replies);
}

function createJapaneseVirtualReply(message) {
  const text = String(message.text || message.msg || '').trim();
  const starterReply = getConversationStarterReply(text);

  if (starterReply) {
    return starterReply;
  }

  if (text && text.length <= 12 && !/[?？。.!！]/.test(text)) {
    return `${text}について話しましょう。まず、それについて好きなところや気になるところはありますか？`;
  }

  return createVirtualReply(message, {
    source: 'ja',
    replies: replyTemplates.ja.replies
  });
}

async function createLocalizedVirtualReply(message, language) {
  const templates = replyTemplates[language];
  const text = String(message.text || message.msg || '').trim();
  const lowerText = text.toLowerCase();
  const starterReply = getConversationStarterReply(text);

  if (starterReply) {
    if (language === 'ja') {
      return { text: starterReply, source: 'ja' };
    }

    try {
      return {
        text: await translateWithService(starterReply, 'ja', language),
        source: language
      };
    } catch (error) {
      console.error('starter reply translation error:', error.message);
    }
  }

  if (templates) {
    if (language === 'ja') {
      return { text: createJapaneseVirtualReply(message), source: 'ja' };
    }

    if (/hello|hi|hey|こんにちは|こんばんは|안녕|hola|bonjour|你好/.test(lowerText)) {
      return { text: templates.greeting, source: language };
    }

    if (/[?？]$/.test(text)) {
      return { text: templates.question, source: language };
    }

    return { text: pickRandom(templates.replies), source: language };
  }

  const japaneseReply = createJapaneseVirtualReply(message);

  if (language === 'ja') {
    return { text: japaneseReply, source: 'ja' };
  }

  try {
    return {
      text: await translateWithService(japaneseReply, 'ja', language),
      source: language
    };
  } catch (error) {
    console.error('virtual reply translation error:', error.message);
    return { text: japaneseReply, source: 'ja' };
  }
}

function getVirtualUser(language, index) {
  const safeLanguage = language.replace(/[^a-zA-Z-]/g, '').toLowerCase();
  const name = virtualNamesByLanguage[language] || `AI Partner ${index + 1}`;

  return {
    id: `BOT-${safeLanguage || 'ai'}-${index + 1}`,
    name
  };
}

function scheduleVirtualReplies(message) {
  if (!message || message.autoReply === false || String(message.id || '').startsWith('BOT-')) {
    return;
  }

  const replyCount = Math.random() < 0.35 ? 2 : 1;
  const replyLanguage = supportedLanguages.has(message.target)
    ? message.target
    : supportedLanguages.has(message.source)
      ? message.source
      : 'ja';

  Array.from({ length: replyCount }).forEach((_, index) => {
    const delay = 900 + index * 900 + Math.floor(Math.random() * 900);
    const user = getVirtualUser(replyLanguage, index);

    io.emit('ai typing', {
      id: user.id,
      name: user.name,
      source: replyLanguage,
      active: true
    });

    setTimeout(async () => {
      let reply;

      try {
        reply = await createLocalizedVirtualReply(message, replyLanguage);
      } catch (error) {
        console.error('virtual reply error:', error.message);
        reply = {
          text: 'いいですね。もう少し詳しく聞かせてください。',
          source: 'ja'
        };
      }

      io.emit('chat message', {
        id: user.id,
        name: user.name,
        text: reply.text,
        source: reply.source,
        time: new Date().toISOString(),
        virtual: true,
        autoReply: false
      });
    }, delay);
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let body = '';

      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Translation service returned ${response.statusCode}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error('Translation service returned invalid JSON'));
        }
      });
    });

    request.setTimeout(12000, () => {
      request.destroy(new Error('Translation request timed out'));
    });

    request.on('error', reject);
  });
}

async function translateWithService(text, source, target) {
  if (source === target) {
    return text;
  }

  const params = new URLSearchParams({
    q: text,
    langpair: `${source}|${target}`
  });
  const url = `https://api.mymemory.translated.net/get?${params.toString()}`;
  const data = await fetchJson(url);
  const translatedText = data && data.responseData && data.responseData.translatedText;

  if (!translatedText) {
    throw new Error('Translation service did not return a translation.');
  }

  return translatedText;
}

app.post('/api/translate', async (req, res) => {
  const text = String(req.body.text || '').trim();
  const source = String(req.body.source || '');
  const target = String(req.body.target || '');

  if (!text) {
    res.status(400).json({ error: 'Text is required.' });
    return;
  }

  if (!supportedLanguages.has(source) || !supportedLanguages.has(target)) {
    res.status(400).json({ error: 'Unsupported language pair.' });
    return;
  }

  if (source === target) {
    res.json({ translatedText: text, source, target });
    return;
  }

  try {
    const translatedText = await translateWithService(text, source, target);

    res.json({
      translatedText,
      source,
      target
    });
  } catch (error) {
    console.error('translation error:', error.message);
    res.status(502).json({ error: 'Translation failed. Please try again.' });
  }
});

io.on('connection', (socket) => {
  // Listen for a new user connecting
  socket.on('user connected', (clientId) => {
    socket.clientId = clientId;
    console.log(clientId + ' connected');
    // Welcome the new user
    socket.emit('welcome', clientId);
    // Notify all other clients that a new user has joined
    socket.broadcast.emit('user joined', clientId);
  });

  socket.on('disconnect', () => {
    if (socket.clientId) {
      console.log(socket.clientId + ' disconnected');
      // Notify all clients that a user has left
      io.emit('user left', socket.clientId);
    }
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    scheduleVirtualReplies(msg);
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
