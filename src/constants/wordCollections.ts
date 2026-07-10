export interface CollectionWord {
  word: string;
  partOfSpeech: string;
  definition: string;
}

export interface WordCollection {
  id: string;
  title: string;
  teaser: string;
  words: CollectionWord[];
}

export const WORD_COLLECTIONS: WordCollection[] = [
  {
    "id": "emotions",
    "title": "Words for emotions",
    "teaser": "melancholy, elated, pensive",
    "words": [
      {
        "word": "melancholy",
        "partOfSpeech": "noun",
        "definition": "A gentle, thoughtful sadness"
      },
      {
        "word": "elated",
        "partOfSpeech": "adjective",
        "definition": "Extremely happy and excited"
      },
      {
        "word": "pensive",
        "partOfSpeech": "adjective",
        "definition": "Deep in serious thought"
      },
      {
        "word": "serene",
        "partOfSpeech": "adjective",
        "definition": "Calm and peaceful"
      },
      {
        "word": "wistful",
        "partOfSpeech": "adjective",
        "definition": "Gently longing for the past"
      },
      {
        "word": "jubilant",
        "partOfSpeech": "adjective",
        "definition": "Full of joy and celebration"
      },
      {
        "word": "trepidation",
        "partOfSpeech": "noun",
        "definition": "Fear about what may happen"
      },
      {
        "word": "ebullient",
        "partOfSpeech": "adjective",
        "definition": "Cheerful and energetic"
      },
      {
        "word": "forlorn",
        "partOfSpeech": "adjective",
        "definition": "Sad and lonely"
      },
      {
        "word": "exuberant",
        "partOfSpeech": "adjective",
        "definition": "Filled with lively energy"
      }
    ]
  },
  {
    "id": "sound-meaning",
    "title": "Words that sound like their meaning",
    "teaser": "buzz, crash, whisper",
    "words": [
      {
        "word": "buzz",
        "partOfSpeech": "verb",
        "definition": "Make a low humming sound"
      },
      {
        "word": "crash",
        "partOfSpeech": "verb",
        "definition": "Collide with a loud noise"
      },
      {
        "word": "whisper",
        "partOfSpeech": "verb",
        "definition": "Speak very softly"
      },
      {
        "word": "hiss",
        "partOfSpeech": "verb",
        "definition": "Make a sharp sibilant sound"
      },
      {
        "word": "clang",
        "partOfSpeech": "verb",
        "definition": "Make a loud metallic ringing"
      },
      {
        "word": "murmur",
        "partOfSpeech": "verb",
        "definition": "Speak quietly and indistinctly"
      },
      {
        "word": "thud",
        "partOfSpeech": "noun",
        "definition": "A dull heavy sound from impact"
      },
      {
        "word": "sizzle",
        "partOfSpeech": "verb",
        "definition": "Make a hissing frying sound"
      },
      {
        "word": "crackle",
        "partOfSpeech": "verb",
        "definition": "Make short sharp repeated sounds"
      },
      {
        "word": "whoosh",
        "partOfSpeech": "noun",
        "definition": "A rushing movement of air"
      }
    ]
  },
  {
    "id": "commonly-confused",
    "title": "Commonly confused words",
    "teaser": "affect, effect, imply",
    "words": [
      {
        "word": "affect",
        "partOfSpeech": "verb",
        "definition": "To influence or change something"
      },
      {
        "word": "effect",
        "partOfSpeech": "noun",
        "definition": "A result or consequence"
      },
      {
        "word": "imply",
        "partOfSpeech": "verb",
        "definition": "To suggest without stating directly"
      },
      {
        "word": "infer",
        "partOfSpeech": "verb",
        "definition": "To conclude from evidence"
      },
      {
        "word": "fewer",
        "partOfSpeech": "determiner",
        "definition": "Used with countable nouns"
      },
      {
        "word": "less",
        "partOfSpeech": "determiner",
        "definition": "Used with uncountable nouns"
      },
      {
        "word": "complement",
        "partOfSpeech": "noun",
        "definition": "Something that completes"
      },
      {
        "word": "compliment",
        "partOfSpeech": "noun",
        "definition": "An expression of praise"
      },
      {
        "word": "discreet",
        "partOfSpeech": "adjective",
        "definition": "Careful and private"
      },
      {
        "word": "discrete",
        "partOfSpeech": "adjective",
        "definition": "Separate and distinct"
      }
    ]
  },
  {
    "id": "power-verbs",
    "title": "Power verbs for writing",
    "teaser": "assert, contend, illustrate",
    "words": [
      {
        "word": "assert",
        "partOfSpeech": "verb",
        "definition": "State a fact or belief confidently"
      },
      {
        "word": "contend",
        "partOfSpeech": "verb",
        "definition": "Argue that something is true"
      },
      {
        "word": "illustrate",
        "partOfSpeech": "verb",
        "definition": "Explain with examples"
      },
      {
        "word": "demonstrate",
        "partOfSpeech": "verb",
        "definition": "Show clearly by evidence"
      },
      {
        "word": "articulate",
        "partOfSpeech": "verb",
        "definition": "Express clearly in words"
      },
      {
        "word": "underscore",
        "partOfSpeech": "verb",
        "definition": "Emphasize the importance of"
      },
      {
        "word": "bolster",
        "partOfSpeech": "verb",
        "definition": "Support or strengthen"
      },
      {
        "word": "refute",
        "partOfSpeech": "verb",
        "definition": "Prove a statement wrong"
      },
      {
        "word": "synthesize",
        "partOfSpeech": "verb",
        "definition": "Combine ideas into a whole"
      },
      {
        "word": "scrutinize",
        "partOfSpeech": "verb",
        "definition": "Examine very closely"
      }
    ]
  },
  {
    "id": "borrowed-words",
    "title": "Words from other languages",
    "teaser": "schadenfreude, serendipity, wanderlust",
    "words": [
      {
        "word": "schadenfreude",
        "partOfSpeech": "noun",
        "definition": "Pleasure from another's misfortune"
      },
      {
        "word": "serendipity",
        "partOfSpeech": "noun",
        "definition": "A lucky accidental discovery"
      },
      {
        "word": "wanderlust",
        "partOfSpeech": "noun",
        "definition": "A strong desire to travel"
      },
      {
        "word": "déjà vu",
        "partOfSpeech": "noun",
        "definition": "The feeling of having experienced something before"
      },
      {
        "word": "zeitgeist",
        "partOfSpeech": "noun",
        "definition": "The spirit of a particular era"
      },
      {
        "word": "bona fide",
        "partOfSpeech": "adjective",
        "definition": "Genuine and real"
      },
      {
        "word": "ad hoc",
        "partOfSpeech": "adjective",
        "definition": "Created for a specific purpose"
      },
      {
        "word": "status quo",
        "partOfSpeech": "noun",
        "definition": "The existing state of affairs"
      },
      {
        "word": "faux pas",
        "partOfSpeech": "noun",
        "definition": "An embarrassing social mistake"
      },
      {
        "word": "raison d'être",
        "partOfSpeech": "noun",
        "definition": "The most important reason for existing"
      }
    ]
  },
  {
    "id": "academic",
    "title": "Academic vocabulary",
    "teaser": "analyze, synthesize, evaluate",
    "words": [
      {
        "word": "analyze",
        "partOfSpeech": "verb",
        "definition": "Examine in detail to understand"
      },
      {
        "word": "synthesize",
        "partOfSpeech": "verb",
        "definition": "Combine parts into a coherent whole"
      },
      {
        "word": "evaluate",
        "partOfSpeech": "verb",
        "definition": "Judge the value or quality of"
      },
      {
        "word": "hypothesize",
        "partOfSpeech": "verb",
        "definition": "Propose an explanation to test"
      },
      {
        "word": "corroborate",
        "partOfSpeech": "verb",
        "definition": "Confirm with supporting evidence"
      },
      {
        "word": "elucidate",
        "partOfSpeech": "verb",
        "definition": "Make something clear"
      },
      {
        "word": "paradigm",
        "partOfSpeech": "noun",
        "definition": "A typical pattern or model"
      },
      {
        "word": "empirical",
        "partOfSpeech": "adjective",
        "definition": "Based on observation or experiment"
      },
      {
        "word": "nuance",
        "partOfSpeech": "noun",
        "definition": "A subtle difference in meaning"
      },
      {
        "word": "premise",
        "partOfSpeech": "noun",
        "definition": "A statement assumed to be true"
      }
    ]
  },
  {
    "id": "precision",
    "title": "Words for precision",
    "teaser": "meticulous, fastidious, precise",
    "words": [
      {
        "word": "meticulous",
        "partOfSpeech": "adjective",
        "definition": "Extremely careful about details"
      },
      {
        "word": "fastidious",
        "partOfSpeech": "adjective",
        "definition": "Very attentive to accuracy"
      },
      {
        "word": "precise",
        "partOfSpeech": "adjective",
        "definition": "Exact and accurate"
      },
      {
        "word": "exacting",
        "partOfSpeech": "adjective",
        "definition": "Demanding great accuracy"
      },
      {
        "word": "rigorous",
        "partOfSpeech": "adjective",
        "definition": "Extremely thorough and strict"
      },
      {
        "word": "scrupulous",
        "partOfSpeech": "adjective",
        "definition": "Very careful about honesty and detail"
      },
      {
        "word": "exact",
        "partOfSpeech": "adjective",
        "definition": "Correct in every detail"
      },
      {
        "word": "definitive",
        "partOfSpeech": "adjective",
        "definition": "Conclusive and authoritative"
      },
      {
        "word": "unambiguous",
        "partOfSpeech": "adjective",
        "definition": "Having only one clear meaning"
      },
      {
        "word": "lucid",
        "partOfSpeech": "adjective",
        "definition": "Clear and easy to understand"
      }
    ]
  },
  {
    "id": "transitions",
    "title": "Transition words",
    "teaser": "however, moreover, consequently",
    "words": [
      {
        "word": "however",
        "partOfSpeech": "adverb",
        "definition": "Introduces a contrast"
      },
      {
        "word": "moreover",
        "partOfSpeech": "adverb",
        "definition": "Adds supporting information"
      },
      {
        "word": "consequently",
        "partOfSpeech": "adverb",
        "definition": "Shows a result"
      },
      {
        "word": "nevertheless",
        "partOfSpeech": "adverb",
        "definition": "Despite what was just said"
      },
      {
        "word": "furthermore",
        "partOfSpeech": "adverb",
        "definition": "Adds another supporting point"
      },
      {
        "word": "therefore",
        "partOfSpeech": "adverb",
        "definition": "Indicates logical conclusion"
      },
      {
        "word": "meanwhile",
        "partOfSpeech": "adverb",
        "definition": "At the same time"
      },
      {
        "word": "likewise",
        "partOfSpeech": "adverb",
        "definition": "In the same way"
      },
      {
        "word": "nonetheless",
        "partOfSpeech": "adverb",
        "definition": "In spite of that"
      },
      {
        "word": "subsequently",
        "partOfSpeech": "adverb",
        "definition": "Happening after something else"
      }
    ]
  },
  {
    "id": "words-about-words",
    "title": "Words about words",
    "teaser": "verbose, concise, eloquent",
    "words": [
      {
        "word": "verbose",
        "partOfSpeech": "adjective",
        "definition": "Using too many words"
      },
      {
        "word": "concise",
        "partOfSpeech": "adjective",
        "definition": "Brief but complete"
      },
      {
        "word": "eloquent",
        "partOfSpeech": "adjective",
        "definition": "Fluent and persuasive"
      },
      {
        "word": "articulate",
        "partOfSpeech": "adjective",
        "definition": "Able to express ideas clearly"
      },
      {
        "word": "laconic",
        "partOfSpeech": "adjective",
        "definition": "Using very few words"
      },
      {
        "word": "garrulous",
        "partOfSpeech": "adjective",
        "definition": "Excessively talkative"
      },
      {
        "word": "prolix",
        "partOfSpeech": "adjective",
        "definition": "Tediously wordy"
      },
      {
        "word": "succinct",
        "partOfSpeech": "adjective",
        "definition": "Briefly and clearly expressed"
      },
      {
        "word": "rhetoric",
        "partOfSpeech": "noun",
        "definition": "The art of effective speaking or writing"
      },
      {
        "word": "diction",
        "partOfSpeech": "noun",
        "definition": "Choice and use of words"
      }
    ]
  },
  {
    "id": "descriptive-adjectives",
    "title": "Vivid descriptive adjectives",
    "teaser": "luminous, austere, verdant",
    "words": [
      {
        "word": "luminous",
        "partOfSpeech": "adjective",
        "definition": "Glowing with light"
      },
      {
        "word": "austere",
        "partOfSpeech": "adjective",
        "definition": "Severe or plain in style"
      },
      {
        "word": "verdant",
        "partOfSpeech": "adjective",
        "definition": "Green with growing plants"
      },
      {
        "word": "somber",
        "partOfSpeech": "adjective",
        "definition": "Dark and serious in mood"
      },
      {
        "word": "resplendent",
        "partOfSpeech": "adjective",
        "definition": "Attractively bright and impressive"
      },
      {
        "word": "squalid",
        "partOfSpeech": "adjective",
        "definition": "Extremely dirty and unpleasant"
      },
      {
        "word": "ethereal",
        "partOfSpeech": "adjective",
        "definition": "Extremely delicate and light"
      },
      {
        "word": "rugged",
        "partOfSpeech": "adjective",
        "definition": "Strong and roughly built"
      },
      {
        "word": "opulent",
        "partOfSpeech": "adjective",
        "definition": "Luxurious and rich"
      },
      {
        "word": "gossamer",
        "partOfSpeech": "adjective",
        "definition": "Extremely light and delicate"
      }
    ]
  },
  {
    "id": "argument-words",
    "title": "Words for building arguments",
    "teaser": "premise, warrant, rebuttal",
    "words": [
      {
        "word": "premise",
        "partOfSpeech": "noun",
        "definition": "A starting assumption"
      },
      {
        "word": "warrant",
        "partOfSpeech": "noun",
        "definition": "A reason connecting claim and evidence"
      },
      {
        "word": "rebuttal",
        "partOfSpeech": "noun",
        "definition": "A counterargument"
      },
      {
        "word": "concede",
        "partOfSpeech": "verb",
        "definition": "Admit that something is true"
      },
      {
        "word": "refute",
        "partOfSpeech": "verb",
        "definition": "Disprove by argument"
      },
      {
        "word": "postulate",
        "partOfSpeech": "verb",
        "definition": "Suggest as a basis for reasoning"
      },
      {
        "word": "contention",
        "partOfSpeech": "noun",
        "definition": "A claim argued for"
      },
      {
        "word": "caveat",
        "partOfSpeech": "noun",
        "definition": "A warning or limitation"
      },
      {
        "word": "salient",
        "partOfSpeech": "adjective",
        "definition": "Most important or noticeable"
      },
      {
        "word": "tenable",
        "partOfSpeech": "adjective",
        "definition": "Able to be defended logically"
      }
    ]
  },
  {
    "id": "workplace",
    "title": "Professional workplace vocabulary",
    "teaser": "deliverable, stakeholder, bandwidth",
    "words": [
      {
        "word": "deliverable",
        "partOfSpeech": "noun",
        "definition": "A tangible output due on a deadline"
      },
      {
        "word": "stakeholder",
        "partOfSpeech": "noun",
        "definition": "Anyone affected by a decision"
      },
      {
        "word": "bandwidth",
        "partOfSpeech": "noun",
        "definition": "Available time and mental capacity"
      },
      {
        "word": "synergy",
        "partOfSpeech": "noun",
        "definition": "Combined effort greater than parts"
      },
      {
        "word": "onboarding",
        "partOfSpeech": "noun",
        "definition": "Process of integrating a new employee"
      },
      {
        "word": "scalable",
        "partOfSpeech": "adjective",
        "definition": "Able to grow without breaking"
      },
      {
        "word": "actionable",
        "partOfSpeech": "adjective",
        "definition": "Clear enough to act on"
      },
      {
        "word": "alignment",
        "partOfSpeech": "noun",
        "definition": "Shared understanding of goals"
      },
      {
        "word": "iterate",
        "partOfSpeech": "verb",
        "definition": "Improve through repeated cycles"
      },
      {
        "word": "prioritize",
        "partOfSpeech": "verb",
        "definition": "Order tasks by importance"
      }
    ]
  },
  {
    "id": "nature",
    "title": "Nature and landscape words",
    "teaser": "canopy, estuary, plateau",
    "words": [
      {
        "word": "canopy",
        "partOfSpeech": "noun",
        "definition": "The upper layer of forest branches"
      },
      {
        "word": "estuary",
        "partOfSpeech": "noun",
        "definition": "Where a river meets the sea"
      },
      {
        "word": "plateau",
        "partOfSpeech": "noun",
        "definition": "A flat elevated landform"
      },
      {
        "word": "meander",
        "partOfSpeech": "verb",
        "definition": "Follow a winding course"
      },
      {
        "word": "torrent",
        "partOfSpeech": "noun",
        "definition": "A fast and violent stream"
      },
      {
        "word": "glade",
        "partOfSpeech": "noun",
        "definition": "An open space in a forest"
      },
      {
        "word": "precipice",
        "partOfSpeech": "noun",
        "definition": "A very steep cliff"
      },
      {
        "word": "tempest",
        "partOfSpeech": "noun",
        "definition": "A violent storm"
      },
      {
        "word": "zephyr",
        "partOfSpeech": "noun",
        "definition": "A soft gentle breeze"
      },
      {
        "word": "verdure",
        "partOfSpeech": "noun",
        "definition": "Green vegetation"
      }
    ]
  },
  {
    "id": "character-traits",
    "title": "Character trait words",
    "teaser": "tenacious, magnanimous, petulant",
    "words": [
      {
        "word": "tenacious",
        "partOfSpeech": "adjective",
        "definition": "Persistent and determined"
      },
      {
        "word": "magnanimous",
        "partOfSpeech": "adjective",
        "definition": "Generous in forgiving"
      },
      {
        "word": "petulant",
        "partOfSpeech": "adjective",
        "definition": "Childishly sulky or irritable"
      },
      {
        "word": "gregarious",
        "partOfSpeech": "adjective",
        "definition": "Sociable and outgoing"
      },
      {
        "word": "taciturn",
        "partOfSpeech": "adjective",
        "definition": "Reserved and quiet"
      },
      {
        "word": "sagacious",
        "partOfSpeech": "adjective",
        "definition": "Wise and perceptive"
      },
      {
        "word": "capricious",
        "partOfSpeech": "adjective",
        "definition": "Unpredictably changeable"
      },
      {
        "word": "stoic",
        "partOfSpeech": "adjective",
        "definition": "Enduring pain without complaint"
      },
      {
        "word": "obstinate",
        "partOfSpeech": "adjective",
        "definition": "Stubbornly refusing to change"
      },
      {
        "word": "benevolent",
        "partOfSpeech": "adjective",
        "definition": "Kind and well-meaning"
      }
    ]
  },
  {
    "id": "time-change",
    "title": "Words about time and change",
    "teaser": "ephemeral, inexorable, evolve",
    "words": [
      {
        "word": "ephemeral",
        "partOfSpeech": "adjective",
        "definition": "Lasting a very short time"
      },
      {
        "word": "inexorable",
        "partOfSpeech": "adjective",
        "definition": "Impossible to stop"
      },
      {
        "word": "evolve",
        "partOfSpeech": "verb",
        "definition": "Develop gradually over time"
      },
      {
        "word": "obsolete",
        "partOfSpeech": "adjective",
        "definition": "No longer in use"
      },
      {
        "word": "transient",
        "partOfSpeech": "adjective",
        "definition": "Lasting only briefly"
      },
      {
        "word": "perpetual",
        "partOfSpeech": "adjective",
        "definition": "Never ending or changing"
      },
      {
        "word": "culminate",
        "partOfSpeech": "verb",
        "definition": "Reach a final climax"
      },
      {
        "word": "waning",
        "partOfSpeech": "adjective",
        "definition": "Becoming gradually less"
      },
      {
        "word": "nascent",
        "partOfSpeech": "adjective",
        "definition": "Just beginning to develop"
      },
      {
        "word": "epoch",
        "partOfSpeech": "noun",
        "definition": "A distinctive period in history"
      }
    ]
  }
];

export function getWordCollection(id: string): WordCollection | undefined {
  return WORD_COLLECTIONS.find((collection) => collection.id === id);
}

export function getAllCollectionWords(): CollectionWord[] {
  const seen = new Set<string>();
  const all: CollectionWord[] = [];
  for (const collection of WORD_COLLECTIONS) {
    for (const entry of collection.words) {
      const key = entry.word.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        all.push(entry);
      }
    }
  }
  return all;
}
