export type VocabularyCategoryId = 'academic' | 'professional' | 'precision' | 'everyday' | 'confused-pairs';

export interface VocabularyHighlight { text: string; tooltip: string; }
export interface VocabularyExample { sentence: string; highlights: VocabularyHighlight[]; }

export interface VocabularyWord {
  id: string;
  categoryId: VocabularyCategoryId;
  word: string;
  partOfSpeech: string;
  definition: string;
  teaser: string;
  explanation: string[];
  keyRule: string;
  examples: VocabularyExample[];
}

export interface VocabularyCategory {
  id: VocabularyCategoryId;
  title: string;
  words: VocabularyWord[];
}

export const VOCABULARY_CATEGORIES: VocabularyCategory[] = [
  {
    "id": "academic",
    "title": "Academic & Study",
    "words": [
      {
        "id": "analyze",
        "categoryId": "academic",
        "word": "analyze",
        "partOfSpeech": "verb",
        "definition": "Examine something methodically to explain it.",
        "teaser": "Scientists analyze data before drawing conclusions.",
        "explanation": [
          "Examine something methodically to explain it. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"analyze\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Scientists analyze data before drawing conclusions.",
            "highlights": [
              {
                "text": "analyze",
                "tooltip": "Examine something methodically to explain it."
              }
            ]
          }
        ]
      },
      {
        "id": "hypothesis",
        "categoryId": "academic",
        "word": "hypothesis",
        "partOfSpeech": "noun",
        "definition": "An idea offered for testing, not yet proven.",
        "teaser": "Her hypothesis guided the entire experiment.",
        "explanation": [
          "An idea offered for testing, not yet proven. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"hypothesis\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Her hypothesis guided the entire experiment.",
            "highlights": [
              {
                "text": "hypothesis",
                "tooltip": "An idea offered for testing, not yet proven."
              }
            ]
          }
        ]
      },
      {
        "id": "synthesize",
        "categoryId": "academic",
        "word": "synthesize",
        "partOfSpeech": "verb",
        "definition": "Combine separate parts into a coherent whole.",
        "teaser": "The essay synthesizes three major theories.",
        "explanation": [
          "Combine separate parts into a coherent whole. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"synthesize\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "The essay synthesizes three major theories.",
            "highlights": [
              {
                "text": "synthesizes",
                "tooltip": "Combine separate parts into a coherent whole."
              }
            ]
          }
        ]
      },
      {
        "id": "evidence",
        "categoryId": "academic",
        "word": "evidence",
        "partOfSpeech": "noun",
        "definition": "Facts or details that support a claim.",
        "teaser": "Strong evidence makes your argument persuasive.",
        "explanation": [
          "Facts or details that support a claim. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"evidence\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Strong evidence makes your argument persuasive.",
            "highlights": [
              {
                "text": "evidence",
                "tooltip": "Facts or details that support a claim."
              }
            ]
          }
        ]
      },
      {
        "id": "implication",
        "categoryId": "academic",
        "word": "implication",
        "partOfSpeech": "noun",
        "definition": "A likely consequence or unstated meaning.",
        "teaser": "The implication of the study is that practice matters.",
        "explanation": [
          "A likely consequence or unstated meaning. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"implication\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "The implication of the study is that practice matters.",
            "highlights": [
              {
                "text": "implication",
                "tooltip": "A likely consequence or unstated meaning."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "professional",
    "title": "Professional & Workplace",
    "words": [
      {
        "id": "collaborate",
        "categoryId": "professional",
        "word": "collaborate",
        "partOfSpeech": "verb",
        "definition": "Work jointly toward a shared goal.",
        "teaser": "Teams collaborate better when roles are clear.",
        "explanation": [
          "Work jointly toward a shared goal. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"collaborate\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Teams collaborate better when roles are clear.",
            "highlights": [
              {
                "text": "collaborate",
                "tooltip": "Work jointly toward a shared goal."
              }
            ]
          }
        ]
      },
      {
        "id": "delegate",
        "categoryId": "professional",
        "word": "delegate",
        "partOfSpeech": "verb",
        "definition": "Assign responsibility to someone else.",
        "teaser": "Good managers delegate tasks they cannot do alone.",
        "explanation": [
          "Assign responsibility to someone else. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"delegate\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Good managers delegate tasks they cannot do alone.",
            "highlights": [
              {
                "text": "delegate",
                "tooltip": "Assign responsibility to someone else."
              }
            ]
          }
        ]
      },
      {
        "id": "stakeholder",
        "categoryId": "professional",
        "word": "stakeholder",
        "partOfSpeech": "noun",
        "definition": "Anyone affected by a decision or project.",
        "teaser": "We updated every stakeholder before the launch.",
        "explanation": [
          "Anyone affected by a decision or project. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"stakeholder\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "We updated every stakeholder before the launch.",
            "highlights": [
              {
                "text": "stakeholder",
                "tooltip": "Anyone affected by a decision or project."
              }
            ]
          }
        ]
      },
      {
        "id": "deliverable",
        "categoryId": "professional",
        "word": "deliverable",
        "partOfSpeech": "noun",
        "definition": "A concrete output promised by a deadline.",
        "teaser": "The deliverable is a polished client report.",
        "explanation": [
          "A concrete output promised by a deadline. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"deliverable\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "The deliverable is a polished client report.",
            "highlights": [
              {
                "text": "deliverable",
                "tooltip": "A concrete output promised by a deadline."
              }
            ]
          }
        ]
      },
      {
        "id": "prioritize",
        "categoryId": "professional",
        "word": "prioritize",
        "partOfSpeech": "verb",
        "definition": "Treat some tasks as more urgent or important.",
        "teaser": "She prioritized feedback over new features.",
        "explanation": [
          "Treat some tasks as more urgent or important. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"prioritize\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "She prioritized feedback over new features.",
            "highlights": [
              {
                "text": "prioritized",
                "tooltip": "Treat some tasks as more urgent or important."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "precision",
    "title": "Precision & Nuance",
    "words": [
      {
        "id": "nuance",
        "categoryId": "precision",
        "word": "nuance",
        "partOfSpeech": "noun",
        "definition": "A subtle difference in meaning or tone.",
        "teaser": "Great writing captures emotional nuance.",
        "explanation": [
          "A subtle difference in meaning or tone. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"nuance\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Great writing captures emotional nuance.",
            "highlights": [
              {
                "text": "nuance.",
                "tooltip": "A subtle difference in meaning or tone."
              }
            ]
          }
        ]
      },
      {
        "id": "ambiguous",
        "categoryId": "precision",
        "word": "ambiguous",
        "partOfSpeech": "adjective",
        "definition": "Open to more than one interpretation.",
        "teaser": "The email was ambiguous about the deadline.",
        "explanation": [
          "Open to more than one interpretation. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"ambiguous\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "The email was ambiguous about the deadline.",
            "highlights": [
              {
                "text": "ambiguous",
                "tooltip": "Open to more than one interpretation."
              }
            ]
          }
        ]
      },
      {
        "id": "concise",
        "categoryId": "precision",
        "word": "concise",
        "partOfSpeech": "adjective",
        "definition": "Expressing much in few words.",
        "teaser": "A concise summary respects the reader's time.",
        "explanation": [
          "Expressing much in few words. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"concise\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "A concise summary respects the reader's time.",
            "highlights": [
              {
                "text": "concise",
                "tooltip": "Expressing much in few words."
              }
            ]
          }
        ]
      },
      {
        "id": "explicit",
        "categoryId": "precision",
        "word": "explicit",
        "partOfSpeech": "adjective",
        "definition": "Stated clearly, leaving no doubt.",
        "teaser": "Give explicit instructions to avoid confusion.",
        "explanation": [
          "Stated clearly, leaving no doubt. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"explicit\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Give explicit instructions to avoid confusion.",
            "highlights": [
              {
                "text": "explicit",
                "tooltip": "Stated clearly, leaving no doubt."
              }
            ]
          }
        ]
      },
      {
        "id": "implicit",
        "categoryId": "precision",
        "word": "implicit",
        "partOfSpeech": "adjective",
        "definition": "Suggested rather than directly stated.",
        "teaser": "There was an implicit agreement to revise together.",
        "explanation": [
          "Suggested rather than directly stated. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"implicit\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "There was an implicit agreement to revise together.",
            "highlights": [
              {
                "text": "implicit",
                "tooltip": "Suggested rather than directly stated."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "everyday",
    "title": "Everyday Power Words",
    "words": [
      {
        "id": "reluctant",
        "categoryId": "everyday",
        "word": "reluctant",
        "partOfSpeech": "adjective",
        "definition": "Unwilling or hesitant to act.",
        "teaser": "He was reluctant to share the first draft.",
        "explanation": [
          "Unwilling or hesitant to act. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"reluctant\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "He was reluctant to share the first draft.",
            "highlights": [
              {
                "text": "reluctant",
                "tooltip": "Unwilling or hesitant to act."
              }
            ]
          }
        ]
      },
      {
        "id": "persistent",
        "categoryId": "everyday",
        "word": "persistent",
        "partOfSpeech": "adjective",
        "definition": "Continuing firmly despite difficulty.",
        "teaser": "Persistent effort beats talent alone.",
        "explanation": [
          "Continuing firmly despite difficulty. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"persistent\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Persistent effort beats talent alone.",
            "highlights": [
              {
                "text": "Persistent",
                "tooltip": "Continuing firmly despite difficulty."
              }
            ]
          }
        ]
      },
      {
        "id": "genuine",
        "categoryId": "everyday",
        "word": "genuine",
        "partOfSpeech": "adjective",
        "definition": "Truly what it is claimed to be; sincere.",
        "teaser": "Her apology sounded genuine and thoughtful.",
        "explanation": [
          "Truly what it is claimed to be; sincere. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"genuine\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Her apology sounded genuine and thoughtful.",
            "highlights": [
              {
                "text": "genuine",
                "tooltip": "Truly what it is claimed to be; sincere."
              }
            ]
          }
        ]
      },
      {
        "id": "adequate",
        "categoryId": "everyday",
        "word": "adequate",
        "partOfSpeech": "adjective",
        "definition": "Enough for the purpose, though not exceptional.",
        "teaser": "The explanation was adequate but not inspiring.",
        "explanation": [
          "Enough for the purpose, though not exceptional. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"adequate\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "The explanation was adequate but not inspiring.",
            "highlights": [
              {
                "text": "adequate",
                "tooltip": "Enough for the purpose, though not exceptional."
              }
            ]
          }
        ]
      },
      {
        "id": "inevitable",
        "categoryId": "everyday",
        "word": "inevitable",
        "partOfSpeech": "adjective",
        "definition": "Certain to happen; unavoidable.",
        "teaser": "Revision is inevitable in serious writing.",
        "explanation": [
          "Certain to happen; unavoidable. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"inevitable\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Revision is inevitable in serious writing.",
            "highlights": [
              {
                "text": "inevitable",
                "tooltip": "Certain to happen; unavoidable."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "confused-pairs",
    "title": "Commonly Confused Pairs",
    "words": [
      {
        "id": "affect-vs-effect",
        "categoryId": "confused-pairs",
        "word": "affect / effect",
        "partOfSpeech": "pair",
        "definition": "Affect (verb) influences; effect (noun) is the result.",
        "teaser": "The rain will affect the schedule; the effect was a delay.",
        "explanation": [
          "Affect (verb) influences; effect (noun) is the result. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"affect / effect\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "The rain will affect the schedule; the effect was a delay.",
            "highlights": [
              {
                "text": "affect",
                "tooltip": "Affect (verb) influences; effect (noun) is the result."
              }
            ]
          }
        ]
      },
      {
        "id": "accept-vs-except",
        "categoryId": "confused-pairs",
        "word": "accept / except",
        "partOfSpeech": "pair",
        "definition": "Accept means receive; except means excluding.",
        "teaser": "I accept your terms except the last clause.",
        "explanation": [
          "Accept means receive; except means excluding. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"accept / except\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "I accept your terms except the last clause.",
            "highlights": [
              {
                "text": "accept",
                "tooltip": "Accept means receive; except means excluding."
              }
            ]
          }
        ]
      },
      {
        "id": "complement-vs-compliment",
        "categoryId": "confused-pairs",
        "word": "complement / compliment",
        "partOfSpeech": "pair",
        "definition": "Complement completes; compliment praises.",
        "teaser": "The wine complements the meal; she complimented the chef.",
        "explanation": [
          "Complement completes; compliment praises. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"complement / compliment\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "The wine complements the meal; she complimented the chef.",
            "highlights": [
              {
                "text": "complements",
                "tooltip": "Complement completes; compliment praises."
              }
            ]
          }
        ]
      },
      {
        "id": "principal-vs-principle",
        "categoryId": "confused-pairs",
        "word": "principal / principle",
        "partOfSpeech": "pair",
        "definition": "Principal is main or a school leader; principle is a rule.",
        "teaser": "The principal reason is a matter of principle.",
        "explanation": [
          "Principal is main or a school leader; principle is a rule. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"principal / principle\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "The principal reason is a matter of principle.",
            "highlights": [
              {
                "text": "principal",
                "tooltip": "Principal is main or a school leader; principle is a rule."
              }
            ]
          }
        ]
      },
      {
        "id": "fewer-vs-less",
        "categoryId": "confused-pairs",
        "word": "fewer / less",
        "partOfSpeech": "pair",
        "definition": "Fewer counts items; less measures amount.",
        "teaser": "Fewer mistakes mean less frustration.",
        "explanation": [
          "Fewer counts items; less measures amount. Seeing the word inside a sentence is the fastest way to learn it — definitions alone rarely stick.",
          "Notice who does what, and what changes when this word appears."
        ],
        "keyRule": "Use \"fewer / less\" only when the sentence truly needs this exact shade of meaning.",
        "examples": [
          {
            "sentence": "Fewer mistakes mean less frustration.",
            "highlights": [
              {
                "text": "Fewer",
                "tooltip": "Fewer counts items; less measures amount."
              }
            ]
          }
        ]
      }
    ]
  }
];

export const VOCABULARY_WORDS: VocabularyWord[] = VOCABULARY_CATEGORIES.flatMap((c) => c.words);

export function getVocabularyWord(id: string): VocabularyWord | undefined {
  return VOCABULARY_WORDS.find((w) => w.id === id);
}
