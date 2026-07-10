// Auto-generated grammar topic definitions — edit for richer content as needed.
export type GrammarCategoryId =
  | 'parts-of-speech'
  | 'sentence-structure'
  | 'verb-tenses'
  | 'punctuation'
  | 'common-mistakes';

export interface GrammarHighlight {
  text: string;
  tooltip: string;
}

export interface GrammarExample {
  sentence: string;
  highlights: GrammarHighlight[];
}

export interface GrammarTopic {
  id: string;
  categoryId: GrammarCategoryId;
  name: string;
  teaser: string;
  explanation: string[];
  keyRule: string;
  examples: GrammarExample[];
}

export interface GrammarCategory {
  id: GrammarCategoryId;
  title: string;
  topics: GrammarTopic[];
}

export const GRAMMAR_CATEGORIES: GrammarCategory[] = [
  {
    "id": "parts-of-speech",
    "title": "Parts of Speech",
    "topics": [
      {
        "id": "nouns",
        "categoryId": "parts-of-speech",
        "name": "Nouns",
        "teaser": "A team of writers met at the library.",
        "explanation": [
          "Nouns name people, places, things, or ideas. Common nouns are general (writer, city); proper nouns name specific ones (London, Inkwell). Abstract nouns name ideas (freedom, courage); collective nouns name groups (team, flock).",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "A noun is the name of a person, place, thing, or idea — the anchor every sentence builds around.",
        "examples": [
          {
            "sentence": "A team of writers met at the library.",
            "highlights": [
              {
                "text": "team",
                "tooltip": "Shows nouns in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Nouns name people, places, things, or ideas.",
            "highlights": [
              {
                "text": "team",
                "tooltip": "A noun is the name of a person, place, thing, or idea — the anchor every sentence builds around."
              }
            ]
          }
        ]
      },
      {
        "id": "pronouns",
        "categoryId": "parts-of-speech",
        "name": "Pronouns",
        "teaser": "She handed them the draft before it was due.",
        "explanation": [
          "Pronouns replace nouns so we do not repeat the same name. Personal pronouns (I, you, she) refer to people. Possessive forms (her, their) show ownership. Reflexive pronouns (herself, themselves) refer back to the subject. Relative pronouns (who, which, that) introduce clauses.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Use a pronoun only when the reader already knows what it refers to.",
        "examples": [
          {
            "sentence": "She handed them the draft before it was due.",
            "highlights": [
              {
                "text": "She",
                "tooltip": "Shows pronouns in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Pronouns replace nouns so we do not repeat the same name.",
            "highlights": [
              {
                "text": "She",
                "tooltip": "Use a pronoun only when the reader already knows what it refers to."
              }
            ]
          }
        ]
      },
      {
        "id": "verbs",
        "categoryId": "parts-of-speech",
        "name": "Verbs",
        "teaser": "The editor reads carefully and will publish tomorrow.",
        "explanation": [
          "Verbs express action or state. Action verbs show what someone does (write, run). Linking verbs connect subject to description (is, seem, become). Auxiliary/modal verbs help other verbs (is writing, can finish, should revise).",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Every complete sentence needs a verb — it tells us what happens or what something is.",
        "examples": [
          {
            "sentence": "The editor reads carefully and will publish tomorrow.",
            "highlights": [
              {
                "text": "reads",
                "tooltip": "Shows verbs in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Verbs express action or state.",
            "highlights": [
              {
                "text": "reads",
                "tooltip": "Every complete sentence needs a verb — it tells us what happens or what something is."
              }
            ]
          }
        ]
      },
      {
        "id": "adjectives",
        "categoryId": "parts-of-speech",
        "name": "Adjectives",
        "teaser": "The tall, mysterious stranger walked slowly.",
        "explanation": [
          "Adjectives describe or limit nouns. Descriptive adjectives add detail (tall, blue). Comparative adjectives compare two things (taller, more careful). Superlative adjectives mark the extreme (tallest, most careful).",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Place adjectives as close as possible to the noun they modify.",
        "examples": [
          {
            "sentence": "The tall, mysterious stranger walked slowly.",
            "highlights": [
              {
                "text": "tall",
                "tooltip": "Shows adjectives in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Adjectives describe or limit nouns.",
            "highlights": [
              {
                "text": "tall",
                "tooltip": "Place adjectives as close as possible to the noun they modify."
              }
            ]
          }
        ]
      },
      {
        "id": "adverbs",
        "categoryId": "parts-of-speech",
        "name": "Adverbs",
        "teaser": "She spoke softly yesterday and very clearly.",
        "explanation": [
          "Adverbs modify verbs, adjectives, or other adverbs. Adverbs of manner describe how (softly). Time adverbs say when (yesterday). Place adverbs say where (here). Degree adverbs show intensity (very, quite).",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "If you can move a word in the sentence without breaking grammar, it may be an adverb.",
        "examples": [
          {
            "sentence": "She spoke softly yesterday and very clearly.",
            "highlights": [
              {
                "text": "softly",
                "tooltip": "Shows adverbs in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Adverbs modify verbs, adjectives, or other adverbs.",
            "highlights": [
              {
                "text": "softly",
                "tooltip": "If you can move a word in the sentence without breaking grammar, it may be an adverb."
              }
            ]
          }
        ]
      },
      {
        "id": "prepositions",
        "categoryId": "parts-of-speech",
        "name": "Prepositions",
        "teaser": "We met at the café on Monday before noon.",
        "explanation": [
          "Prepositions show relationships — often place, time, or direction. Place: in, on, at. Time: before, after, during. Direction: to, toward, through. They always begin a prepositional phrase ending in a noun.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Prepositions need an object — never leave them dangling at the end without one in formal writing.",
        "examples": [
          {
            "sentence": "We met at the café on Monday before noon.",
            "highlights": [
              {
                "text": "at",
                "tooltip": "Shows prepositions in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Prepositions show relationships — often place, time, or direction.",
            "highlights": [
              {
                "text": "at",
                "tooltip": "Prepositions need an object — never leave them dangling at the end without one in formal writing."
              }
            ]
          }
        ]
      },
      {
        "id": "conjunctions",
        "categoryId": "parts-of-speech",
        "name": "Conjunctions",
        "teaser": "I wanted to finish, but the deadline moved.",
        "explanation": [
          "Conjunctions join words, phrases, or clauses. Coordinating conjunctions (and, but, or) join equal parts. Subordinating conjunctions (because, although, when) introduce dependent clauses. Correlative pairs (either…or, both…and) work in sets.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Match the grammar on both sides of a conjunction.",
        "examples": [
          {
            "sentence": "I wanted to finish, but the deadline moved.",
            "highlights": [
              {
                "text": "but",
                "tooltip": "Shows conjunctions in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Conjunctions join words, phrases, or clauses.",
            "highlights": [
              {
                "text": "but",
                "tooltip": "Match the grammar on both sides of a conjunction."
              }
            ]
          }
        ]
      },
      {
        "id": "interjections",
        "categoryId": "parts-of-speech",
        "name": "Interjections",
        "teaser": "Wow, that revision changed everything!",
        "explanation": [
          "Interjections are brief emotional bursts (wow, oh, hey). They stand apart from the sentence grammar and are often followed by an exclamation mark or comma. Use them sparingly in formal writing.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Interjections add voice in casual writing but usually belong outside academic prose.",
        "examples": [
          {
            "sentence": "Wow, that revision changed everything!",
            "highlights": [
              {
                "text": "Wow",
                "tooltip": "Shows interjections in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Interjections are brief emotional bursts (wow, oh, hey).",
            "highlights": [
              {
                "text": "Wow",
                "tooltip": "Interjections add voice in casual writing but usually belong outside academic prose."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "sentence-structure",
    "title": "Sentence Structure",
    "topics": [
      {
        "id": "simple-sentences",
        "categoryId": "sentence-structure",
        "name": "Simple sentences",
        "teaser": "The student revised the paragraph.",
        "explanation": [
          "A simple sentence has one independent clause: one subject and one predicate. It can still contain phrases and compound subjects or objects, but it expresses one complete thought.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "One subject + one verb can carry a full idea when the words are chosen well.",
        "examples": [
          {
            "sentence": "The student revised the paragraph.",
            "highlights": [
              {
                "text": "student",
                "tooltip": "Shows simple sentences in a natural sentence."
              }
            ]
          },
          {
            "sentence": "A simple sentence has one independent clause: one subject and one predicate.",
            "highlights": [
              {
                "text": "student",
                "tooltip": "One subject + one verb can carry a full idea when the words are chosen well."
              }
            ]
          }
        ]
      },
      {
        "id": "compound-sentences",
        "categoryId": "sentence-structure",
        "name": "Compound sentences",
        "teaser": "I was tired, yet I kept writing.",
        "explanation": [
          "A compound sentence joins two independent clauses with a coordinating conjunction or semicolon. Both halves could stand alone as sentences.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Use a comma before the conjunction when joining two full clauses — or use a semicolon if the ideas are closely linked.",
        "examples": [
          {
            "sentence": "I was tired, yet I kept writing.",
            "highlights": [
              {
                "text": "yet",
                "tooltip": "Shows compound sentences in a natural sentence."
              }
            ]
          },
          {
            "sentence": "A compound sentence joins two independent clauses with a coordinating conjunction or semicolon.",
            "highlights": [
              {
                "text": "yet",
                "tooltip": "Use a comma before the conjunction when joining two full clauses — or use a semicolon if the ideas are closely linked."
              }
            ]
          }
        ]
      },
      {
        "id": "complex-sentences",
        "categoryId": "sentence-structure",
        "name": "Complex sentences",
        "teaser": "Although it rained, we walked to class.",
        "explanation": [
          "A complex sentence has one independent clause and at least one dependent (subordinate) clause. Subordinating conjunctions like although, because, and when signal the dependent part.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "The dependent clause cannot stand alone — it leans on the main clause for meaning.",
        "examples": [
          {
            "sentence": "Although it rained, we walked to class.",
            "highlights": [
              {
                "text": "Although",
                "tooltip": "Shows complex sentences in a natural sentence."
              }
            ]
          },
          {
            "sentence": "A complex sentence has one independent clause and at least one dependent (subordinate) clause.",
            "highlights": [
              {
                "text": "Although",
                "tooltip": "The dependent clause cannot stand alone — it leans on the main clause for meaning."
              }
            ]
          }
        ]
      },
      {
        "id": "compound-complex",
        "categoryId": "sentence-structure",
        "name": "Compound-complex sentences",
        "teaser": "When the bell rang, students cheered, and the teacher smiled.",
        "explanation": [
          "This sentence type combines compound and complex structure: at least two independent clauses plus at least one dependent clause.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Mark clause boundaries clearly with punctuation so readers never lose the thread.",
        "examples": [
          {
            "sentence": "When the bell rang, students cheered, and the teacher smiled.",
            "highlights": [
              {
                "text": "When",
                "tooltip": "Shows compound-complex sentences in a natural sentence."
              }
            ]
          },
          {
            "sentence": "This sentence type combines compound and complex structure: at least two independent clauses plus at least one dependent clause.",
            "highlights": [
              {
                "text": "When",
                "tooltip": "Mark clause boundaries clearly with punctuation so readers never lose the thread."
              }
            ]
          }
        ]
      },
      {
        "id": "fragments",
        "categoryId": "sentence-structure",
        "name": "Sentence fragments",
        "teaser": "Because the draft was late.",
        "explanation": [
          "A fragment is an incomplete sentence — often a dependent clause or phrase left standing alone. Fix it by attaching it to a main clause or by turning it into a full sentence.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Every sentence you submit should express a complete thought on its own.",
        "examples": [
          {
            "sentence": "Because the draft was late.",
            "highlights": [
              {
                "text": "Because",
                "tooltip": "Shows sentence fragments in a natural sentence."
              }
            ]
          },
          {
            "sentence": "A fragment is an incomplete sentence — often a dependent clause or phrase left standing alone.",
            "highlights": [
              {
                "text": "Because",
                "tooltip": "Every sentence you submit should express a complete thought on its own."
              }
            ]
          }
        ]
      },
      {
        "id": "run-ons",
        "categoryId": "sentence-structure",
        "name": "Run-on sentences and comma splices",
        "teaser": "I finished the essay I went home.",
        "explanation": [
          "A run-on joins independent clauses without proper punctuation. A comma splice uses only a comma between two full clauses. Fix with a period, semicolon, conjunction, or restructuring.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Two complete sentences need more than a comma between them.",
        "examples": [
          {
            "sentence": "I finished the essay I went home.",
            "highlights": [
              {
                "text": "finished",
                "tooltip": "Shows run-on sentences and comma splices in a natural sentence."
              }
            ]
          },
          {
            "sentence": "A run-on joins independent clauses without proper punctuation.",
            "highlights": [
              {
                "text": "finished",
                "tooltip": "Two complete sentences need more than a comma between them."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "verb-tenses",
    "title": "Verb Tenses",
    "topics": [
      {
        "id": "simple-present",
        "categoryId": "verb-tenses",
        "name": "Simple present",
        "teaser": "She writes every morning.",
        "explanation": [
          "Simple present describes habits, facts, and general truths. Add -s or -es for third-person singular (she writes).",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Use simple present for what happens regularly or is always true.",
        "examples": [
          {
            "sentence": "She writes every morning.",
            "highlights": [
              {
                "text": "writes",
                "tooltip": "Shows simple present in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Simple present describes habits, facts, and general truths.",
            "highlights": [
              {
                "text": "writes",
                "tooltip": "Use simple present for what happens regularly or is always true."
              }
            ]
          }
        ]
      },
      {
        "id": "simple-past",
        "categoryId": "verb-tenses",
        "name": "Simple past",
        "teaser": "They submitted the report yesterday.",
        "explanation": [
          "Simple past marks completed actions at a specific past time. Regular verbs add -ed; irregular verbs change form (went, wrote).",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Past time words (yesterday, last week) often signal simple past.",
        "examples": [
          {
            "sentence": "They submitted the report yesterday.",
            "highlights": [
              {
                "text": "submitted",
                "tooltip": "Shows simple past in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Simple past marks completed actions at a specific past time.",
            "highlights": [
              {
                "text": "submitted",
                "tooltip": "Past time words (yesterday, last week) often signal simple past."
              }
            ]
          }
        ]
      },
      {
        "id": "simple-future",
        "categoryId": "verb-tenses",
        "name": "Simple future",
        "teaser": "We will announce the results tomorrow.",
        "explanation": [
          "Simple future uses will or shall plus the base verb for decisions, predictions, and promises about the future.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "will + base verb is the default future for neutral statements.",
        "examples": [
          {
            "sentence": "We will announce the results tomorrow.",
            "highlights": [
              {
                "text": "will announce",
                "tooltip": "Shows simple future in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Simple future uses will or shall plus the base verb for decisions, predictions, and promises about the future.",
            "highlights": [
              {
                "text": "will announce",
                "tooltip": "will + base verb is the default future for neutral statements."
              }
            ]
          }
        ]
      },
      {
        "id": "present-continuous",
        "categoryId": "verb-tenses",
        "name": "Present continuous",
        "teaser": "I am studying grammar right now.",
        "explanation": [
          "Present continuous (am/is/are + -ing) describes actions in progress now or temporary situations.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Use it for what is happening at this moment, not permanent facts.",
        "examples": [
          {
            "sentence": "I am studying grammar right now.",
            "highlights": [
              {
                "text": "am studying",
                "tooltip": "Shows present continuous in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Present continuous (am/is/are + -ing) describes actions in progress now or temporary situations.",
            "highlights": [
              {
                "text": "am studying",
                "tooltip": "Use it for what is happening at this moment, not permanent facts."
              }
            ]
          }
        ]
      },
      {
        "id": "past-continuous",
        "categoryId": "verb-tenses",
        "name": "Past continuous",
        "teaser": "She was typing when the power failed.",
        "explanation": [
          "Past continuous (was/were + -ing) sets a background action interrupted by another event, often in simple past.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "was/were + -ing frames the longer action; the shorter event snaps it.",
        "examples": [
          {
            "sentence": "She was typing when the power failed.",
            "highlights": [
              {
                "text": "was typing",
                "tooltip": "Shows past continuous in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Past continuous (was/were + -ing) sets a background action interrupted by another event, often in simple past.",
            "highlights": [
              {
                "text": "was typing",
                "tooltip": "was/were + -ing frames the longer action; the shorter event snaps it."
              }
            ]
          }
        ]
      },
      {
        "id": "future-continuous",
        "categoryId": "verb-tenses",
        "name": "Future continuous",
        "teaser": "This time tomorrow, I will be presenting.",
        "explanation": [
          "Future continuous (will be + -ing) describes an action in progress at a future point.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Picture yourself in the middle of the action at a future time.",
        "examples": [
          {
            "sentence": "This time tomorrow, I will be presenting.",
            "highlights": [
              {
                "text": "will be presenting",
                "tooltip": "Shows future continuous in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Future continuous (will be + -ing) describes an action in progress at a future point.",
            "highlights": [
              {
                "text": "will be presenting",
                "tooltip": "Picture yourself in the middle of the action at a future time."
              }
            ]
          }
        ]
      },
      {
        "id": "present-perfect",
        "categoryId": "verb-tenses",
        "name": "Present perfect",
        "teaser": "She has finished three chapters.",
        "explanation": [
          "Present perfect (has/have + past participle) links past action to the present — results, experience, or unfinished time.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Use when the past still matters now, not when you name a finished past moment.",
        "examples": [
          {
            "sentence": "She has finished three chapters.",
            "highlights": [
              {
                "text": "has finished",
                "tooltip": "Shows present perfect in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Present perfect (has/have + past participle) links past action to the present — results, experience, or unfinished time.",
            "highlights": [
              {
                "text": "has finished",
                "tooltip": "Use when the past still matters now, not when you name a finished past moment."
              }
            ]
          }
        ]
      },
      {
        "id": "past-perfect",
        "categoryId": "verb-tenses",
        "name": "Past perfect",
        "teaser": "He had left before I arrived.",
        "explanation": [
          "Past perfect (had + past participle) shows an action completed before another past action.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "The earlier past event takes had + past participle.",
        "examples": [
          {
            "sentence": "He had left before I arrived.",
            "highlights": [
              {
                "text": "had left",
                "tooltip": "Shows past perfect in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Past perfect (had + past participle) shows an action completed before another past action.",
            "highlights": [
              {
                "text": "had left",
                "tooltip": "The earlier past event takes had + past participle."
              }
            ]
          }
        ]
      },
      {
        "id": "future-perfect",
        "categoryId": "verb-tenses",
        "name": "Future perfect",
        "teaser": "By Friday, we will have completed the draft.",
        "explanation": [
          "Future perfect (will have + past participle) looks back from a future point to an action that will be done by then.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "By + future time often pairs with will have + past participle.",
        "examples": [
          {
            "sentence": "By Friday, we will have completed the draft.",
            "highlights": [
              {
                "text": "will have completed",
                "tooltip": "Shows future perfect in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Future perfect (will have + past participle) looks back from a future point to an action that will be done by then.",
            "highlights": [
              {
                "text": "will have completed",
                "tooltip": "By + future time often pairs with will have + past participle."
              }
            ]
          }
        ]
      },
      {
        "id": "present-perfect-continuous",
        "categoryId": "verb-tenses",
        "name": "Present perfect continuous",
        "teaser": "They have been waiting for an hour.",
        "explanation": [
          "This tense (have/has been + -ing) stresses duration of an action that started in the past and continues or recently stopped.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Emphasize how long something has been going on.",
        "examples": [
          {
            "sentence": "They have been waiting for an hour.",
            "highlights": [
              {
                "text": "have been waiting",
                "tooltip": "Shows present perfect continuous in a natural sentence."
              }
            ]
          },
          {
            "sentence": "This tense (have/has been + -ing) stresses duration of an action that started in the past and continues or recently stopped.",
            "highlights": [
              {
                "text": "have been waiting",
                "tooltip": "Emphasize how long something has been going on."
              }
            ]
          }
        ]
      },
      {
        "id": "past-perfect-continuous",
        "categoryId": "verb-tenses",
        "name": "Past perfect continuous",
        "teaser": "She had been practicing before the recital began.",
        "explanation": [
          "Had been + -ing highlights ongoing action up to a point in the past, often before another past event.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Use it when duration before a past moment matters.",
        "examples": [
          {
            "sentence": "She had been practicing before the recital began.",
            "highlights": [
              {
                "text": "had been practicing",
                "tooltip": "Shows past perfect continuous in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Had been + -ing highlights ongoing action up to a point in the past, often before another past event.",
            "highlights": [
              {
                "text": "had been practicing",
                "tooltip": "Use it when duration before a past moment matters."
              }
            ]
          }
        ]
      },
      {
        "id": "future-perfect-continuous",
        "categoryId": "verb-tenses",
        "name": "Future perfect continuous",
        "teaser": "By June, I will have been working here for five years.",
        "explanation": [
          "Will have been + -ing projects ongoing action up to a future deadline, stressing duration.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Pair with by + future time to show accumulated time.",
        "examples": [
          {
            "sentence": "By June, I will have been working here for five years.",
            "highlights": [
              {
                "text": "will have been working",
                "tooltip": "Shows future perfect continuous in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Will have been + -ing projects ongoing action up to a future deadline, stressing duration.",
            "highlights": [
              {
                "text": "will have been working",
                "tooltip": "Pair with by + future time to show accumulated time."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "punctuation",
    "title": "Punctuation",
    "topics": [
      {
        "id": "end-marks",
        "categoryId": "punctuation",
        "name": "Full stops, question marks, exclamation marks",
        "teaser": "Are you ready? I am!",
        "explanation": [
          "Statements end with a full stop. Direct questions need a question mark. Exclamation marks show strong emotion — use them rarely in formal writing.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Match the end mark to the sentence type; do not stack multiple marks.",
        "examples": [
          {
            "sentence": "Are you ready? I am!",
            "highlights": [
              {
                "text": "?",
                "tooltip": "Shows full stops, question marks, exclamation marks in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Statements end with a full stop.",
            "highlights": [
              {
                "text": "?",
                "tooltip": "Match the end mark to the sentence type; do not stack multiple marks."
              }
            ]
          }
        ]
      },
      {
        "id": "commas",
        "categoryId": "punctuation",
        "name": "Commas",
        "teaser": "After dinner, we reviewed the notes, which helped.",
        "explanation": [
          "Commas separate items in a list, set off introductory elements, bracket nonessential clauses, join independent clauses with a conjunction, and more. When in doubt, read aloud — pause points often need commas.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "A comma is a pause that prevents misreading — not decoration after every word.",
        "examples": [
          {
            "sentence": "After dinner, we reviewed the notes, which helped.",
            "highlights": [
              {
                "text": "After dinner",
                "tooltip": "Shows commas in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Commas separate items in a list, set off introductory elements, bracket nonessential clauses, join independent clauses with a conjunction, and more.",
            "highlights": [
              {
                "text": "After dinner",
                "tooltip": "A comma is a pause that prevents misreading — not decoration after every word."
              }
            ]
          }
        ]
      },
      {
        "id": "semicolons-colons",
        "categoryId": "punctuation",
        "name": "Semicolons and colons",
        "teaser": "I love writing; it never gets boring.",
        "explanation": [
          "Semicolons join closely related independent clauses. Colons introduce lists, explanations, or elaborations after a complete clause.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Use a colon only after a clause that could stand as its own sentence.",
        "examples": [
          {
            "sentence": "I love writing; it never gets boring.",
            "highlights": [
              {
                "text": ";",
                "tooltip": "Shows semicolons and colons in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Semicolons join closely related independent clauses.",
            "highlights": [
              {
                "text": ";",
                "tooltip": "Use a colon only after a clause that could stand as its own sentence."
              }
            ]
          }
        ]
      },
      {
        "id": "apostrophes",
        "categoryId": "punctuation",
        "name": "Apostrophes",
        "teaser": "The writer's desk is messy; it's covered in notes.",
        "explanation": [
          "Apostrophes show possession (writer's) or contractions (it's = it is). Possessive its has no apostrophe. Plural nouns ending in s take the apostrophe after the s (writers').",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Possession or missing letters — never use an apostrophe to make a regular plural.",
        "examples": [
          {
            "sentence": "The writer's desk is messy; it's covered in notes.",
            "highlights": [
              {
                "text": "writer's",
                "tooltip": "Shows apostrophes in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Apostrophes show possession (writer's) or contractions (it's = it is).",
            "highlights": [
              {
                "text": "writer's",
                "tooltip": "Possession or missing letters — never use an apostrophe to make a regular plural."
              }
            ]
          }
        ]
      },
      {
        "id": "quotation-marks",
        "categoryId": "punctuation",
        "name": "Quotation marks",
        "teaser": "She said, \"Revision is where the magic happens.\"",
        "explanation": [
          "Use double quotation marks for direct speech and short titles. Place commas and periods inside closing quotes in American English. Single quotes nest inside doubles when needed.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Introduce quoted speech with a comma or colon, then capitalize the first word of the quote.",
        "examples": [
          {
            "sentence": "She said, \"Revision is where the magic happens.\"",
            "highlights": [
              {
                "text": "\"Revision",
                "tooltip": "Shows quotation marks in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Use double quotation marks for direct speech and short titles.",
            "highlights": [
              {
                "text": "\"Revision",
                "tooltip": "Introduce quoted speech with a comma or colon, then capitalize the first word of the quote."
              }
            ]
          }
        ]
      },
      {
        "id": "dashes-hyphens",
        "categoryId": "punctuation",
        "name": "Dashes and hyphens",
        "teaser": "The well-known author — a former teacher — signed books.",
        "explanation": [
          "Hyphens join compound modifiers before a noun (well-known author). Em dashes set off extra information with emphasis. En dashes show ranges (pages 10–20).",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Hyphens build words; dashes separate ideas.",
        "examples": [
          {
            "sentence": "The well-known author — a former teacher — signed books.",
            "highlights": [
              {
                "text": "well-known",
                "tooltip": "Shows dashes and hyphens in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Hyphens join compound modifiers before a noun (well-known author).",
            "highlights": [
              {
                "text": "well-known",
                "tooltip": "Hyphens build words; dashes separate ideas."
              }
            ]
          }
        ]
      },
      {
        "id": "parentheses-brackets",
        "categoryId": "punctuation",
        "name": "Parentheses and brackets",
        "teaser": "The results (see Appendix A) were surprising.",
        "explanation": [
          "Parentheses tuck in extra detail without breaking the sentence flow. Square brackets add editorial notes inside quotations [sic].",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "If removing the parenthetical leaves a complete sentence, the punctuation is probably right.",
        "examples": [
          {
            "sentence": "The results (see Appendix A) were surprising.",
            "highlights": [
              {
                "text": "(see Appendix A)",
                "tooltip": "Shows parentheses and brackets in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Parentheses tuck in extra detail without breaking the sentence flow.",
            "highlights": [
              {
                "text": "(see Appendix A)",
                "tooltip": "If removing the parenthetical leaves a complete sentence, the punctuation is probably right."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "common-mistakes",
    "title": "Common Mistakes",
    "topics": [
      {
        "id": "subject-verb-agreement",
        "categoryId": "common-mistakes",
        "name": "Subject-verb agreement errors",
        "teaser": "The list of ideas is on your desk.",
        "explanation": [
          "The verb must agree with the subject in number. Prepositional phrases between subject and verb can trick you — find the true subject (list, not ideas). Indefinite pronouns like everyone and each take singular verbs.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Identify the subject first, then match the verb — ignore interrupting phrases.",
        "examples": [
          {
            "sentence": "The list of ideas is on your desk.",
            "highlights": [
              {
                "text": "is",
                "tooltip": "Shows subject-verb agreement errors in a natural sentence."
              }
            ]
          },
          {
            "sentence": "The verb must agree with the subject in number.",
            "highlights": [
              {
                "text": "is",
                "tooltip": "Identify the subject first, then match the verb — ignore interrupting phrases."
              }
            ]
          }
        ]
      },
      {
        "id": "dangling-modifiers",
        "categoryId": "common-mistakes",
        "name": "Dangling and misplaced modifiers",
        "teaser": "Running to class, my bag fell open.",
        "explanation": [
          "A modifier should sit next to what it describes. Here, my bag was not running — the person was. Rephrase so the doer of the action is clear: Running to class, I dropped my bag.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Open the sentence with who actually performs the opening action.",
        "examples": [
          {
            "sentence": "Running to class, my bag fell open.",
            "highlights": [
              {
                "text": "Running",
                "tooltip": "Shows dangling and misplaced modifiers in a natural sentence."
              }
            ]
          },
          {
            "sentence": "A modifier should sit next to what it describes.",
            "highlights": [
              {
                "text": "Running",
                "tooltip": "Open the sentence with who actually performs the opening action."
              }
            ]
          }
        ]
      },
      {
        "id": "wrong-tense",
        "categoryId": "common-mistakes",
        "name": "Wrong tense usage",
        "teaser": "Yesterday she submits the form.",
        "explanation": [
          "Keep tense consistent unless you have a reason to shift time. Past time markers (yesterday) need past tense verbs. Switching tenses randomly confuses readers about when events happened.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Let time words guide your tense choice.",
        "examples": [
          {
            "sentence": "Yesterday she submits the form.",
            "highlights": [
              {
                "text": "submits",
                "tooltip": "Shows wrong tense usage in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Keep tense consistent unless you have a reason to shift time.",
            "highlights": [
              {
                "text": "submits",
                "tooltip": "Let time words guide your tense choice."
              }
            ]
          }
        ]
      },
      {
        "id": "article-errors",
        "categoryId": "common-mistakes",
        "name": "Article errors (a/an/the)",
        "teaser": "She is an honest critic and a university graduate.",
        "explanation": [
          "Use a before consonant sounds, an before vowel sounds (an honest — h is silent). The points to something specific both reader and writer know. Do not use the with general plural nouns.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Read the next word aloud — consonant sound gets a, vowel sound gets an.",
        "examples": [
          {
            "sentence": "She is an honest critic and a university graduate.",
            "highlights": [
              {
                "text": "an",
                "tooltip": "Shows article errors (a/an/the) in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Use a before consonant sounds, an before vowel sounds (an honest — h is silent).",
            "highlights": [
              {
                "text": "an",
                "tooltip": "Read the next word aloud — consonant sound gets a, vowel sound gets an."
              }
            ]
          }
        ]
      },
      {
        "id": "preposition-confusion",
        "categoryId": "common-mistakes",
        "name": "Preposition confusion (in/on/at)",
        "teaser": "We meet at noon on Monday in the office.",
        "explanation": [
          "In often wraps larger areas or periods (in July, in the building). On marks surfaces and specific days (on Monday). At pins a point in time or place (at noon, at the door).",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Learn common collocations — good at, interested in, depend on.",
        "examples": [
          {
            "sentence": "We meet at noon on Monday in the office.",
            "highlights": [
              {
                "text": "at",
                "tooltip": "Shows preposition confusion (in/on/at) in a natural sentence."
              }
            ]
          },
          {
            "sentence": "In often wraps larger areas or periods (in July, in the building).",
            "highlights": [
              {
                "text": "at",
                "tooltip": "Learn common collocations — good at, interested in, depend on."
              }
            ]
          }
        ]
      },
      {
        "id": "double-negatives",
        "categoryId": "common-mistakes",
        "name": "Double negatives",
        "teaser": "I do not have no time left.",
        "explanation": [
          "Two negatives in one clause cancel each other and sound informal or unclear. Use one negative: I do not have any time left, or I have no time left.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "One negative per idea is enough in standard English.",
        "examples": [
          {
            "sentence": "I do not have no time left.",
            "highlights": [
              {
                "text": "not",
                "tooltip": "Shows double negatives in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Two negatives in one clause cancel each other and sound informal or unclear.",
            "highlights": [
              {
                "text": "not",
                "tooltip": "One negative per idea is enough in standard English."
              }
            ]
          }
        ]
      },
      {
        "id": "confused-words",
        "categoryId": "common-mistakes",
        "name": "Commonly confused words",
        "teaser": "Their report improved the effect on morale.",
        "explanation": [
          "Their/there/they're, affect/effect, its/it's, and similar pairs differ in meaning and part of speech. Read the sentence role: possession, location, contraction, noun vs verb.",
          "Watch how the concept works inside real sentences — that is how you will use it in your own writing."
        ],
        "keyRule": "Swap in the expanded form — if \"it is\" works, use it's; if not, use its.",
        "examples": [
          {
            "sentence": "Their report improved the effect on morale.",
            "highlights": [
              {
                "text": "Their",
                "tooltip": "Shows commonly confused words in a natural sentence."
              }
            ]
          },
          {
            "sentence": "Their/there/they're, affect/effect, its/it's, and similar pairs differ in meaning and part of speech.",
            "highlights": [
              {
                "text": "Their",
                "tooltip": "Swap in the expanded form — if \"it is\" works, use it's; if not, use its."
              }
            ]
          }
        ]
      }
    ]
  }
];

export const GRAMMAR_TOPICS: GrammarTopic[] = GRAMMAR_CATEGORIES.flatMap((c) => c.topics);

export function getGrammarTopic(id: string): GrammarTopic | undefined {
  return GRAMMAR_TOPICS.find((t) => t.id === id);
}
