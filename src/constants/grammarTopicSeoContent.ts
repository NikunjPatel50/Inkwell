import type { GrammarTopicSeoContent } from "./grammarTopicSeo";

export const GRAMMAR_TOPIC_SEO_CONTENT: Record<string, GrammarTopicSeoContent> = {
  nouns: {
    whyThisHappens:
      "Noun errors usually come from treating uncountable words as countable, mixing up singular and plural forms, or using a generic noun where a specific one is needed. In exam writing, vague nouns like thing or stuff weaken arguments, while wrong plurals (informations, advices) stand out immediately to markers. Spotting the noun first helps you choose the right article, verb, and modifier around it.",
    seeInSentence: [
      {
        incorrect: "She gave me many useful advices about the essay.",
        correct: "She gave me much useful advice about the essay.",
        note: "Advice is uncountable — use much advice, not many advices.",
      },
      {
        incorrect: "The datas from the survey supports our claim.",
        correct: "The data from the survey support our claim.",
        note: "Data is traditionally plural; datas is non-standard in formal writing.",
      },
      {
        incorrect: "A group of student are waiting outside.",
        correct: "A group of students is waiting outside.",
        note: "Students is the object of of; the subject group is singular, so use is.",
      },
    ],
    edgeCases: [
      {
        sentence: "The staff were divided on the new policy, but the staff room was locked.",
        note: "Staff can take a plural verb when emphasising individuals (were divided) but stays singular as a unit in other contexts.",
      },
      {
        sentence: "Mathematics is required; her maths scores are improving.",
        note: "Subject names ending in -ics are usually singular (mathematics is) even though scores takes a plural verb.",
      },
      {
        sentence: "One species of bird migrates here; several species nest nearby.",
        note: "Species is the same in singular and plural — let the determiner (one vs several) guide agreement.",
      },
      {
        sentence: "The United States has a large economy; the states have different tax rules.",
        note: "Proper nouns that look plural (United States) can be singular as one entity; parts of the name may still be plural.",
      },
    ],
    quickCheck: {
      prompt: "We need more equipments before the lab session starts.",
      answer: "We need more equipment before the lab session starts. Equipment is uncountable — drop the -s and use equipment, not equipments.",
    },
  },

  pronouns: {
    whyThisHappens:
      "Pronoun mistakes happen when the reader cannot tell who she, they, or it refers to, or when the form does not match the antecedent in number and case. Exam essays often shift person mid-paragraph (one... you) or use they for a single named person inconsistently. Clear pronouns keep arguments tight and stop markers from rereading sentences to find the subject.",
    seeInSentence: [
      {
        incorrect: "When Sarah met Emma, she looked nervous.",
        correct: "When Sarah met Emma, Sarah looked nervous — or Emma looked nervous.",
        note: "She could mean either person; repeat the name or rephrase so the referent is obvious.",
      },
      {
        incorrect: "Each student must hand in their essay by Friday.",
        correct: "Each student must hand in his or her essay by Friday — or All students must hand in their essays by Friday.",
        note: "Each is singular; their is widely accepted but can be flagged in very formal exams — pick a consistent solution.",
      },
      {
        incorrect: "The report and it appendix were missing.",
        correct: "The report and its appendix were missing.",
        note: "Its shows possession; it is only for it is or it has.",
      },
    ],
    edgeCases: [
      {
        sentence: "Who did you give the folder to? — Whom did you give the folder to?",
        note: "In formal writing, whom is the object form; in speech, who is common after prepositions in informal contexts.",
      },
      {
        sentence: "The team won its match, and they celebrated in the locker room.",
        note: "Collective nouns: its treats the team as one unit; they emphasises individuals — stay consistent within a passage.",
      },
      {
        sentence: "Neither of the options works on their own.",
        note: "Neither is singular — use its own, not their own, in strict formal usage.",
      },
      {
        sentence: "It was the manager who approved it, not me.",
        note: "After who/that clauses, the pronoun it still refers back clearly — avoid stacking vague it forms in one sentence.",
      },
    ],
    quickCheck: {
      prompt: "Between you and I, the results were surprising.",
      answer: "Between you and me, the results were surprising. After the preposition between, use the object form me, not I.",
    },
  },

  verbs: {
    whyThisHappens:
      "Verb problems often come from missing auxiliaries, wrong forms for tense or mood, or two verbs competing in one clause. Under time pressure, writers leave out helping verbs (She going home) or use the base form after a modal (He must goes). Matching the verb to time, certainty, and subject is what markers check first in sentence-level accuracy.",
    seeInSentence: [
      {
        incorrect: "He don't agree with the conclusion.",
        correct: "He doesn't agree with the conclusion.",
        note: "Third person singular needs doesn't, not don't.",
      },
      {
        incorrect: "She can speaks three languages fluently.",
        correct: "She can speak three languages fluently.",
        note: "After a modal (can), use the base verb speak, not speaks.",
      },
      {
        incorrect: "The results was published last week.",
        correct: "The results were published last week.",
        note: "Results is plural, so use were, not was.",
      },
    ],
    edgeCases: [
      {
        sentence: "If I was taller, I would reach the shelf. — If I were taller, I would reach the shelf.",
        note: "Use were in hypothetical if-clauses (subjunctive) in formal writing: If I were, If he were.",
      },
      {
        sentence: "The news surprises everyone, even though the stories seem familiar.",
        note: "News is singular (surprises); stories is plural (seem) — noun number drives verb form.",
      },
      {
        sentence: "Let us consider the evidence before we decide.",
        note: "Imperatives and lets phrases take base verbs: let us consider, not let us considers.",
      },
      {
        sentence: "Not only the cost but also the risks worry investors.",
        note: "With not only... but also, the verb often agrees with the nearer subject (risks worry).",
      },
    ],
    quickCheck: {
      prompt: "The committee have voted to postpone the meeting.",
      answer: "The committee has voted to postpone the meeting — if acting as one unit. Has matches a singular collective subject in formal usage.",
    },
  },

  adjectives: {
    whyThisHappens:
      "Adjective errors show up when modifiers are in the wrong order, when comparatives are formed incorrectly, or when a word that looks like an adverb is used to describe a noun. Writers also pile adjectives before a noun without commas where coordinate adjectives need them. In essays, misplaced adjectives can change meaning — only the tall candidates passed vs the candidates only passed.",
    seeInSentence: [
      {
        incorrect: "She is more smarter than her colleague.",
        correct: "She is smarter than her colleague.",
        note: "Do not combine more with -er comparatives — pick smarter or more intelligent.",
      },
      {
        incorrect: "He wore a cotton blue shirt to the interview.",
        correct: "He wore a blue cotton shirt to the interview.",
        note: "Opinion (blue) usually comes before material (cotton) in adjective order.",
      },
      {
        incorrect: "The exam was very perfectly organised.",
        correct: "The exam was very well organised — or perfectly organised.",
        note: "Perfectly is an adverb; organised needs well or an adjective form, not very perfectly.",
      },
    ],
    edgeCases: [
      {
        sentence: "A small red Italian sports car vs a red small Italian sports car.",
        note: "Standard order: size, age, colour, origin, material, purpose — small red Italian fits the usual pattern.",
      },
      {
        sentence: "The results are more accurate than last year.",
        note: "Comparisons need a clear standard: more accurate than last year's results.",
      },
      {
        sentence: "She felt badly after the presentation.",
        note: "Felt is linking here — she felt bad (adjective), not badly (which implies poor sense of touch).",
      },
      {
        sentence: "Elder and eldest refer to family members; older and oldest are general.",
        note: "My elder sister is standard; my older sister is also fine — avoid elder without a noun (not She is elder).",
      },
    ],
    quickCheck: {
      prompt: "This is the most easiest question on the paper.",
      answer: "This is the easiest question on the paper. Superlatives with -est do not take most — use easiest, not most easiest.",
    },
  },

  adverbs: {
    whyThisHappens:
      "Many adverbs end in -ly, but writers often use adjectives where adverbs belong (drive careful) or place adverbs so they modify the wrong word. In academic writing, sentence adverbs (However, Therefore) need clear punctuation, while manner adverbs should sit close to the verb they modify. Confusion between good/well and real/really is especially common under exam conditions.",
    seeInSentence: [
      {
        incorrect: "She spoke quiet during the entire debate.",
        correct: "She spoke quietly during the entire debate.",
        note: "Quiet describes nouns; quietly describes how she spoke.",
      },
      {
        incorrect: "He did good on the grammar section.",
        correct: "He did well on the grammar section.",
        note: "Well is the adverb after did; good is an adjective (He is good at grammar).",
      },
      {
        incorrect: "Only I want tea if you are making some.",
        correct: "I only want tea if you are making some.",
        note: "Only placement changes meaning — here, only modifies want, not I alone.",
      },
    ],
    edgeCases: [
      {
        sentence: "She nearly failed every test vs she failed nearly every test.",
        note: "Nearly failed means almost failed; failed nearly every means missed only a few — position matters.",
      },
      {
        sentence: "However the data were collected, the trend remains.",
        note: "However meaning no matter how is not the same as However, comma, as a sentence connector.",
      },
      {
        sentence: "Fast can be adjective or adverb: a fast train, run fast.",
        note: "Some flat adverbs (drive slow, drive slowly) vary by dialect — in formal exams, prefer -ly forms.",
      },
      {
        sentence: "Hopefully, the deadline will be extended.",
        note: "Hopefully as a sentence adverb (it is hoped) is accepted; some editors prefer I hope that instead.",
      },
    ],
    quickCheck: {
      prompt: "The team worked really good together on the group project.",
      answer: "The team worked really well together on the group project. Worked needs the adverb well, not the adjective good.",
    },
  },

  prepositions: {
    whyThisHappens:
      "Preposition errors come from direct translation, fixed-phrase memorisation gaps, or uncertainty about time versus place versus abstract relations. Writers mix in/on/at for time, or choose between interested in and good at by ear alone. In formal essays, wrong prepositions make otherwise strong sentences sound non-native or careless.",
    seeInSentence: [
      {
        incorrect: "She is good in mathematics and interested on science.",
        correct: "She is good at mathematics and interested in science.",
        note: "Good at and interested in are fixed patterns — the preposition is not interchangeable.",
      },
      {
        incorrect: "We will meet in Monday at the afternoon.",
        correct: "We will meet on Monday in the afternoon.",
        note: "Days take on; parts of the day usually take in (in the afternoon).",
      },
      {
        incorrect: "The report depends from accurate data.",
        correct: "The report depends on accurate data.",
        note: "Depend on is the standard collocation, not depend from.",
      },
    ],
    edgeCases: [
      {
        sentence: "Different from is preferred in many style guides; different than is common in speech.",
        note: "In formal writing, different from the control group is safer than different than.",
      },
      {
        sentence: "We arrived at the station but arrived in London.",
        note: "Arrive at a point (station); arrive in a city or large area (London).",
      },
      {
        sentence: "Between two options; among three or more.",
        note: "Between the two candidates is precise; among the finalists fits a larger set.",
      },
      {
        sentence: "Composed of ingredients vs composed by a musician.",
        note: "Of shows makeup; by shows the creator — preposition choice changes the relationship.",
      },
    ],
    quickCheck: {
      prompt: "She has been married with a doctor for ten years.",
      answer: "She has been married to a doctor for ten years. Married to is the correct preposition for a spouse.",
    },
  },

  conjunctions: {
    whyThisHappens:
      "Conjunction mistakes include comma splices (joining two full sentences with only a comma), missing coordinators between related ideas, and faulty parallel structure after and/but/or. Writers also confuse subordinating conjunctions (because, although) with transitions (however, therefore), creating fragments or run-ons. Choosing the right linker shows logical relationships markers expect.",
    seeInSentence: [
      {
        incorrect: "The trial ended early, the jury had already decided.",
        correct: "The trial ended early because the jury had already decided.",
        note: "Two independent clauses cannot join with only a comma — add because or use a semicolon.",
      },
      {
        incorrect: "Although she was tired, but she finished the essay.",
        correct: "Although she was tired, she finished the essay.",
        note: "Do not combine although and but — one subordinator is enough.",
      },
      {
        incorrect: "He likes not only swimming but also to hike on weekends.",
        correct: "He likes not only swimming but also hiking on weekends.",
        note: "After not only... but also, keep forms parallel (swimming / hiking).",
      },
    ],
    edgeCases: [
      {
        sentence: "Since you asked, I will explain — Since has been rainy, we stayed in.",
        note: "Since can mean because or from a time — context must make the sense clear.",
      },
      {
        sentence: "Neither the coach nor the players were happy.",
        note: "Neither/nor pairs negatives; the verb agrees with the nearer subject (players were).",
      },
      {
        sentence: "I will call you when I will arrive.",
        note: "In time clauses with when, use present tense for future meaning: when I arrive.",
      },
      {
        sentence: "Both the summary and the chart support the claim.",
        note: "Both... and requires plural agreement when two subjects together are plural.",
      },
    ],
    quickCheck: {
      prompt: "I studied hard, however I still ran out of time.",
      answer: "I studied hard; however, I still ran out of time. However joins independent clauses best with a semicolon or period, not a lone comma.",
    },
  },

  interjections: {
    whyThisHappens:
      "Interjections (oh, wow, hey, alas) express emotion or reaction and rarely belong in formal exam essays — yet they slip in when writers mimic speech or try to sound conversational. Overuse weakens tone, and missing punctuation around interjections can make sentences confusing. Knowing when an interjection is appropriate separates informal notes from academic prose.",
    seeInSentence: [
      {
        incorrect: "Wow the results were unexpected and significant.",
        correct: "Wow, the results were unexpected and significant. — or drop Wow in formal writing.",
        note: "Interjections at the start need a comma; in essays, removing them is often better.",
      },
      {
        incorrect: "The well alas was dry by noon.",
        correct: "The well, alas, was dry by noon.",
        note: "Alas interrupts the sentence — set it off with commas when you keep it.",
      },
      {
        incorrect: "Oh I see the problem now.",
        correct: "Oh, I see the problem now.",
        note: "A brief interjection before the main clause takes a comma.",
      },
    ],
    edgeCases: [
      {
        sentence: "Well, I disagree with that interpretation.",
        note: "Well as a discourse marker is not the same as the adverb well — punctuate it as an interrupter.",
      },
      {
        sentence: "Dear me, that was an oversight.",
        note: "Multi-word interjections (dear me, oh no) function as a single emotional unit.",
      },
      {
        sentence: "Yes the data confirm the trend.",
        note: "Yes or no answering a question needs a comma: Yes, the data confirm the trend.",
      },
      {
        sentence: "Hmm the author never cites a source.",
        note: "Sounds informal in academic writing — replace with However or omit.",
      },
    ],
    quickCheck: {
      prompt: "Hey lets review the introduction before we submit.",
      answer: "Hey, let's review the introduction before we submit. Add a comma after Hey and use let's (let us), not lets.",
    },
  },

  "simple-sentences": {
    whyThisHappens:
      "A simple sentence has one independent clause — one subject–verb core — but writers sometimes mistake short for simple or pack too many ideas into one clause with commas. Others add fragments thinking they are simple sentences. Recognising the single complete thought helps you control pace and combine ideas deliberately later.",
    seeInSentence: [
      {
        incorrect: "The report was late, it missed the deadline.",
        correct: "The report was late. — or The report was late and missed the deadline.",
        note: "Two subject–verb pairs need two clauses joined properly, not a comma splice.",
      },
      {
        incorrect: "Running every morning.",
        correct: "She runs every morning.",
        note: "Running every morning has no finite verb — add a subject and main verb.",
      },
      {
        incorrect: "The team celebrated after the win was announced loudly.",
        correct: "The team celebrated loudly after the win was announced.",
        note: "One clause can include modifiers, but place them so the meaning stays clear.",
      },
    ],
    edgeCases: [
      {
        sentence: "She arrived, signed in, and sat down.",
        note: "One subject with a compound predicate (three verbs) is still one simple sentence.",
      },
      {
        sentence: "In 2024, revenue grew sharply.",
        note: "Introductory phrases do not create a second clause — still one independent clause.",
      },
      {
        sentence: "The plan failed.",
        note: "Simple does not mean easy or short — it means one independent clause, however many words.",
      },
      {
        sentence: "Wait!",
        note: "Imperatives with an implied you are complete simple sentences.",
      },
    ],
    quickCheck: {
      prompt: "Because the bus was delayed.",
      answer: "Because the bus was delayed is a fragment, not a simple sentence — add a main clause: Because the bus was delayed, we arrived late.",
    },
  },

  "compound-sentences": {
    whyThisHappens:
      "Compound sentences join two or more independent clauses with coordinators (and, but, or, so, yet, for, nor). Errors happen when writers comma-splice without a conjunction, use the wrong coordinator for the logic, or join clauses that are not truly independent. Strong writers match the conjunction to the relationship: contrast (but), result (so), addition (and).",
    seeInSentence: [
      {
        incorrect: "The lecture was clear, I still took notes.",
        correct: "The lecture was clear, but I still took notes.",
        note: "Add a coordinating conjunction or use a semicolon — a comma alone is not enough.",
      },
      {
        incorrect: "She studied all week, so but she felt unprepared.",
        correct: "She studied all week, but she still felt unprepared.",
        note: "Use one coordinator per join — so but is not valid.",
      },
      {
        incorrect: "The printer jammed and because the paper was wet.",
        correct: "The printer jammed because the paper was wet.",
        note: "Because introduces a dependent clause — not a second independent clause for and.",
      },
    ],
    edgeCases: [
      {
        sentence: "The sun set; the air cooled quickly.",
        note: "A semicolon can join two closely related independent clauses without a coordinator.",
      },
      {
        sentence: "Not only did costs rise, but profits also fell.",
        note: "Correlative pairs (not only... but also) can build compound structures with inverted word order.",
      },
      {
        sentence: "I wanted to stay, yet I left early.",
        note: "Yet shows contrast, similar to but — slightly more formal or emphatic.",
      },
      {
        sentence: "Join two short clauses: She laughed, he sighed.",
        note: "Even short clauses need proper punctuation if both are independent.",
      },
    ],
    quickCheck: {
      prompt: "The evidence is strong, therefore the claim holds.",
      answer: "The evidence is strong; therefore, the claim holds. Therefore between independent clauses needs a semicolon (or period), not only a comma.",
    },
  },

  "complex-sentences": {
    whyThisHappens:
      "Complex sentences combine one independent clause with at least one dependent clause introduced by subordinators (because, although, when, if). Writers create fragments by stopping after although..., or misplace dependent clauses so the meaning shifts. Subordinate clauses add cause, time, and contrast — but only when attached to a full main clause.",
    seeInSentence: [
      {
        incorrect: "Although the sample was small.",
        correct: "Although the sample was small, the trend was clear.",
        note: "Although starts a dependent clause — it must connect to an independent main clause.",
      },
      {
        incorrect: "The team finished the project because they were efficient workers.",
        correct: "The team finished the project early because they worked efficiently.",
        note: "Because should show cause — efficient workers does not explain why they finished.",
      },
      {
        incorrect: "When the alarm sounds employees must evacuate.",
        correct: "When the alarm sounds, employees must evacuate.",
        note: "Introductory dependent clause needs a comma before the main clause.",
      },
    ],
    edgeCases: [
      {
        sentence: "While I agree with the premise, I question the method.",
        note: "While can mean although (contrast) or at the same time — context clarifies.",
      },
      {
        sentence: "If it rains, the match will be postponed.",
        note: "In if-clauses about the future, use present tense: if it rains, not if it will rain.",
      },
      {
        sentence: "The book that you lent me was helpful.",
        note: "Dependent relative clauses (that you lent me) embed inside the main clause.",
      },
      {
        sentence: "Because he was tired, he left. vs He left because he was tired.",
        note: "Dependent clause at the start usually takes a comma; at the end often does not.",
      },
    ],
    quickCheck: {
      prompt: "While the data were being collected. The team met daily.",
      answer: "While the data were being collected, the team met daily. Merge into one complex sentence — the while-clause cannot stand alone.",
    },
  },

  "compound-complex": {
    whyThisHappens:
      "Compound-complex sentences have at least two independent clauses and at least one dependent clause. They fail when writers lose track of which clause is which, producing run-ons or dangling subordinators. Used well, they show sophisticated links between ideas; used badly, they bury the main point. Map subject and verb in each clause before adding more.",
    seeInSentence: [
      {
        incorrect: "When the bell rang, the students left and they the teacher locked the hall.",
        correct: "When the bell rang, the students left, and the teacher locked the hall.",
        note: "Each independent clause needs its own subject — they the teacher is broken.",
      },
      {
        incorrect: "Although it was late, but we continued writing.",
        correct: "Although it was late, we continued writing.",
        note: "Do not pair although with but in the same join.",
      },
      {
        incorrect: "If you finish early, celebrate, you can review tomorrow.",
        correct: "If you finish early, you can celebrate, and you can review tomorrow.",
        note: "Keep parallel independent clauses with clear subjects and conjunctions.",
      },
    ],
    edgeCases: [
      {
        sentence: "After the storm passed, roads reopened, and crews began repairs.",
        note: "One dependent clause (After the storm passed) plus two independents joined by and.",
      },
      {
        sentence: "She said that she would call when she arrived, but she forgot.",
        note: "Nested dependent clauses (that she would call, when she arrived) inside a compound frame.",
      },
      {
        sentence: "While managers approved the plan, staff raised concerns, and clients waited for updates.",
        note: "Three clauses — label independent vs dependent before punctuating.",
      },
      {
        sentence: "Because A and B, C, and D.",
        note: "Avoid stacking so many clauses that readers forget the main claim — split if needed.",
      },
    ],
    quickCheck: {
      prompt: "Because the file was corrupt, we restored a backup and we then we notified users.",
      answer: "Because the file was corrupt, we restored a backup and then notified users. Remove the extra we — one subject can share two verbs in a compound predicate.",
    },
  },

  fragments: {
    whyThisHappens:
      "Fragments look like sentences but lack a subject, a finite verb, or a complete thought — often after although, because, or which. Speech and bullet notes encourage fragments; formal writing does not. They also appear when a dependent clause is capitalised and given a full stop as if it could stand alone.",
    seeInSentence: [
      {
        incorrect: "Because the instructions were unclear.",
        correct: "We paused because the instructions were unclear.",
        note: "Because the instructions were unclear cannot stand alone — attach it to a main clause.",
      },
      {
        incorrect: "Such as charts, graphs, and tables.",
        correct: "The report includes visuals such as charts, graphs, and tables.",
        note: "Such as introduces examples and needs a host sentence.",
      },
      {
        incorrect: "The best candidate for the role. Who also speaks French.",
        correct: "The best candidate for the role also speaks French.",
        note: "Who also speaks French is a fragment when separated — merge with the main statement.",
      },
    ],
    edgeCases: [
      {
        sentence: "Really? — Not a fragment in dialogue; unacceptable as an exam body paragraph sentence alone.",
        note: "Single-word responses work in Q&A but not as analytical points.",
      },
      {
        sentence: "For example, tighter deadlines and clearer rubrics.",
        note: "For example must attach to a statement about what is being exemplified.",
      },
      {
        sentence: "Which was a serious oversight.",
        note: "Which-clauses are dependent unless connected: ...an error, which was a serious oversight.",
      },
      {
        sentence: "Running late as usual.",
        note: "Participial phrases without a subject are fragments — add who was running late.",
      },
    ],
    quickCheck: {
      prompt: "Although the evidence was limited. The conclusion was still persuasive.",
      answer: "Although the evidence was limited, the conclusion was still persuasive. Replace the full stop with a comma — Although starts a dependent clause.",
    },
  },

  "run-ons": {
    whyThisHappens:
      "Run-on sentences (fused sentences) jam two or more independent clauses without correct punctuation or conjunction. Comma splices are the most common type — a comma where a period, semicolon, or coordinator belongs. They often appear when writers rush through related ideas and assume the link is obvious. In timed exams, fixing a run-on is faster when you first mark each subject–verb pair, then choose a period, semicolon, or conjunction that matches the logic.",
    seeInSentence: [
      {
        incorrect: "The experiment failed the team redesigned the method.",
        correct: "The experiment failed, so the team redesigned the method.",
        note: "Two complete clauses need a conjunction, semicolon, or full stop.",
      },
      {
        incorrect: "She proofread the essay, she submitted it online.",
        correct: "She proofread the essay, and she submitted it online.",
        note: "Comma alone cannot join two independent clauses — add and or use a semicolon.",
      },
      {
        incorrect: "Results improved however bias remained.",
        correct: "Results improved; however, bias remained.",
        note: "However between full clauses needs stronger punctuation than a lone comma.",
      },
    ],
    edgeCases: [
      {
        sentence: "I came, I saw, I conquered.",
        note: "Asyndeton can work rhetorically in literary writing; examiners usually prefer explicit links.",
      },
      {
        sentence: "The study was small; it still offered useful insights.",
        note: "Semicolon fixes a run-on when clauses are closely related.",
      },
      {
        sentence: "Join with subordination: Because results improved, we published early.",
        note: "Making one clause dependent removes the run-on without two equal mains.",
      },
      {
        sentence: "Not a run-on: She smiled and left.",
        note: "One subject, two verbs — compound predicate, not two independent clauses.",
      },
    ],
    quickCheck: {
      prompt: "The deadline passed everyone submitted late work.",
      answer: "The deadline passed, and everyone submitted late work — or use a semicolon or period. Two independent clauses cannot fuse without punctuation.",
    },
  },

  "simple-present": {
    whyThisHappens:
      "Simple present describes habits, facts, and general truths, but writers slip into it when narrating past events or describing actions happening right now. Third-person singular -s is often forgotten (she write). In essays, simple present also states arguments (Pollution harms health) while other tenses carry examples. PTE and academic tasks reward stable tense: use simple present for timeless claims and routines, then shift only when the time frame clearly changes.",
    seeInSentence: [
      {
        incorrect: "Every morning she go to the library before class.",
        correct: "Every morning she goes to the library before class.",
        note: "She needs goes in the third person singular.",
      },
      {
        incorrect: "Yesterday he walks home in the rain.",
        correct: "Yesterday he walked home in the rain.",
        note: "Yesterday signals past time — use simple past, not simple present.",
      },
      {
        incorrect: "Water boil at 100 degrees Celsius at sea level.",
        correct: "Water boils at 100 degrees Celsius at sea level.",
        note: "Scientific facts use simple present with correct -s on boil.",
      },
    ],
    edgeCases: [
      {
        sentence: "The train leaves at six tonight.",
        note: "Timetabled future events often use simple present (leaves at six).",
      },
      {
        sentence: "Here comes the bus.",
        note: "Commentaries and demonstrations use present for immediacy.",
      },
      {
        sentence: "Shakespeare explores ambition in Macbeth.",
        note: "Writers discuss literature in present tense even about past works.",
      },
      {
        sentence: "I suggest that he study harder.",
        note: "Subjunctive after suggest: he study, not he studies, in formal American usage.",
      },
    ],
    quickCheck: {
      prompt: "The graph show a steady increase in enrolment.",
      answer: "The graph shows a steady increase in enrolment. Graph is singular — use shows in simple present.",
    },
  },

  "simple-past": {
    whyThisHappens:
      "Simple past marks completed actions at a finished time, but writers confuse it with present perfect or use wrong irregular forms (goed, catched). Time markers like yesterday, in 2019, and last week anchor simple past. Without them, readers may wonder whether the action still connects to now. Narrative paragraphs stay clearest when every verb in a finished episode shares past time unless you deliberately signal a shift.",
    seeInSentence: [
      {
        incorrect: "Last term she has completed three modules.",
        correct: "Last term she completed three modules.",
        note: "Last term is finished time — simple past completed, not present perfect.",
      },
      {
        incorrect: "He goed to the conference on Tuesday.",
        correct: "He went to the conference on Tuesday.",
        note: "Go is irregular — went, not goed.",
      },
      {
        incorrect: "Did you finished the reading?",
        correct: "Did you finish the reading?",
        note: "After did, use the base verb finish, not finished.",
      },
    ],
    edgeCases: [
      {
        sentence: "I lived in Berlin for five years (I no longer do).",
        note: "Simple past with a finished duration implies the situation ended.",
      },
      {
        sentence: "If she studied harder, she might have passed.",
        note: "Past hypothetical conditions often use past forms in if-clauses.",
      },
      {
        sentence: "He said he was tired.",
        note: "Reported speech often backshifts present to past: I am tired → he was tired.",
      },
      {
        sentence: "At noon she realised the file was missing.",
        note: "Past narrative chains multiple simple-past verbs for sequence.",
      },
    ],
    quickCheck: {
      prompt: "In 2022, the company has opened a new branch in Leeds.",
      answer: "In 2022, the company opened a new branch in Leeds. A specific past year needs simple past opened.",
    },
  },

  "simple-future": {
    whyThisHappens:
      "Simple future (will + base verb) expresses predictions, promises, and spontaneous decisions, but writers overuse will where going to fits planned intentions, or use will in when-clauses (When I will arrive). Shall appears in formal offers (Shall I?) but is rare in modern American usage. Match the form to evidence: will for on-the-spot choices, going to for prior plans, and present tense inside when and after time clauses.",
    seeInSentence: [
      {
        incorrect: "I will meet her at three — we planned it last week.",
        correct: "I am going to meet her at three — we planned it last week.",
        note: "Prior plans often use going to; will fits a decision made now.",
      },
      {
        incorrect: "When you will receive the email, reply at once.",
        correct: "When you receive the email, reply at once.",
        note: "Time clauses use present tense, not will, for future meaning.",
      },
      {
        incorrect: "She wills finish the draft tonight.",
        correct: "She will finish the draft tonight.",
        note: "Will is a modal — no -s on wills before the main verb.",
      },
    ],
    edgeCases: [
      {
        sentence: "The meeting starts at nine tomorrow.",
        note: "Scheduled future can use simple present, not only will.",
      },
      {
        sentence: "I shall return the book tomorrow — formal British promise.",
        note: "Shall with I/we is formal; will is standard in most contexts.",
      },
      {
        sentence: "Will you help me with this paragraph?",
        note: "Will in questions asks about willingness or future action.",
      },
      {
        sentence: "That will be the postman — present evidence for near future.",
        note: "Will can infer immediate future from present signs.",
      },
    ],
    quickCheck: {
      prompt: "They will to submit the form before Friday.",
      answer: "They will submit the form before Friday. Will takes the base verb directly — no to before submit.",
    },
  },

  "present-continuous": {
    whyThisHappens:
      "Present continuous (am/is/are + -ing) describes actions in progress now or temporary situations, but writers use it for permanent facts (*I am knowing the answer) or stative verbs that rarely take -ing. Confusion with simple present is common in narratives and process descriptions. If the sentence states a habit, a permanent trait, or a mental state, simple present is usually safer; reserve continuous for what is unfolding around the moment of speaking.",
    seeInSentence: [
      {
        incorrect: "She is belong to the honours programme.",
        correct: "She belongs to the honours programme.",
        note: "Belong is stative — simple present, not continuous.",
      },
      {
        incorrect: "Every day I am walking to campus.",
        correct: "Every day I walk to campus.",
        note: "Habits use simple present; continuous stresses temporary or in-progress habits.",
      },
      {
        incorrect: "He is write an essay right now.",
        correct: "He is writing an essay right now.",
        note: "Continuous needs be + verb-ing: writing, not write.",
      },
    ],
    edgeCases: [
      {
        sentence: "She is always losing her keys — annoyance about repeated action.",
        note: "Always with continuous can show irritation or emphasis.",
      },
      {
        sentence: "More students are studying online this term.",
        note: "Temporary trends suit present continuous even without right now.",
      },
      {
        sentence: "I am meeting the tutor at four.",
        note: "Arranged near future can use present continuous.",
      },
      {
        sentence: "Thinking about the question, he paused.",
        note: "Participial thinking differs from is thinking — label tense clearly.",
      },
    ],
    quickCheck: {
      prompt: "Right now, the committee discuss the revised policy.",
      answer: "Right now, the committee is discussing the revised policy. Right now signals action in progress — use present continuous.",
    },
  },

  "past-continuous": {
    whyThisHappens:
      "Past continuous (was/were + -ing) backgrounds an ongoing past action, often interrupted by simple past. Errors include using it for every past verb or pairing it wrongly with stative verbs (*I was knowing). It also sets scene in storytelling while shorter past tense carries events. Use it when duration matters at a past moment — not as a default replacement for every verb in a anecdote.",
    seeInSentence: [
      {
        incorrect: "While she was cook, the phone rang.",
        correct: "While she was cooking, the phone rang.",
        note: "Past continuous needs was cooking, not was cook.",
      },
      {
        incorrect: "Yesterday at noon I was believing his story.",
        correct: "Yesterday at noon I believed his story.",
        note: "Believe is stative — simple past believed fits better.",
      },
      {
        incorrect: "He was work when I called.",
        correct: "He was working when I called.",
        note: "Ongoing action needs was working.",
      },
    ],
    edgeCases: [
      {
        sentence: "While I was reading, she was taking notes.",
        note: "Two parallel background actions can both use past continuous.",
      },
      {
        sentence: "I was living in York that year.",
        note: "Temporary past situations suit past continuous.",
      },
      {
        sentence: "When I arrived, they were already leaving.",
        note: "Arrived (event) interrupted were leaving (ongoing).",
      },
      {
        sentence: "Was knowing is non-standard — I knew him well.",
        note: "Know rarely appears in continuous forms; use simple past knew or past perfect had known for duration.",
      },
    ],
    quickCheck: {
      prompt: "At 8 p.m. last night, we watched TV and were eat dinner.",
      answer: "At 8 p.m. last night, we were eating dinner and watching TV. Parallel ongoing actions at a past moment use was/were + verb-ing: were eating, were watching.",
    },
  },

  "future-continuous": {
    whyThisHappens:
      "Future continuous (will be + -ing) describes an action in progress at a future time or polite inquiries about plans. It is less common than will + base verb, so writers avoid it or form it incorrectly (will being). Use it when the emphasis is on duration at a specific future moment.",
    seeInSentence: [
      {
        incorrect: "This time tomorrow I will work on the thesis.",
        correct: "This time tomorrow I will be working on the thesis.",
        note: "Future point in progress suits will be working.",
      },
      {
        incorrect: "She will being present at the briefing.",
        correct: "She will be present at the briefing — or She will be attending the briefing.",
        note: "Will be + adjective/attending — not will being.",
      },
      {
        incorrect: "Will you will be joining us for lunch?",
        correct: "Will you be joining us for lunch?",
        note: "One will — Will you be joining.",
      },
    ],
    edgeCases: [
      {
        sentence: "At nine tonight they will be flying over the Atlantic.",
        note: "Locates action in progress at a future clock time.",
      },
      {
        sentence: "Will you be using the lab this afternoon?",
        note: "Polite question about plans without demanding an immediate answer.",
      },
      {
        sentence: "I will be submitting Friday — informal scheduled action.",
        note: "Some dialects use future continuous for planned tasks.",
      },
      {
        sentence: "Future continuous is rare in formal essays — prefer simpler futures for clarity.",
        note: "In academic prose, will submit or am going to submit is often cleaner.",
      },
    ],
    quickCheck: {
      prompt: "By 6 p.m., we will finish dinner and will watch the news.",
      answer: "By 6 p.m., we will be finishing dinner and watching the news — if emphasising activity at that moment. Or we will have finished dinner if completed by then.",
    },
  },

  "present-perfect": {
    whyThisHappens:
      "Present perfect (have/has + past participle) links past actions to now, but writers use it with finished time markers (*I have seen him yesterday) or skip it when the result still matters (I lost my keys and cannot enter). Has versus have errors and wrong participles (has went) are frequent. Ask whether the time is finished or still relevant — that single question sorts most present perfect mistakes in exam answers.",
    seeInSentence: [
      {
        incorrect: "She has visited Paris in 2019.",
        correct: "She visited Paris in 2019.",
        note: "In 2019 is finished — simple past visited.",
      },
      {
        incorrect: "I have saw that film already.",
        correct: "I have seen that film already.",
        note: "Present perfect needs the past participle seen, not saw.",
      },
      {
        incorrect: "He have finished the assignment.",
        correct: "He has finished the assignment.",
        note: "Third person singular he takes has finished, not have finished.",
      },
    ],
    edgeCases: [
      {
        sentence: "I have lived here since 2020.",
        note: "Since + point in time keeps action relevant to now.",
      },
      {
        sentence: "Have you ever submitted late work?",
        note: "Ever marks experience up to now.",
      },
      {
        sentence: "Just, already, and yet often appear with present perfect.",
        note: "She has just arrived; I have already replied; Have you finished yet? — all tie action to now.",
      },
      {
        sentence: "News has broken — American English often uses has with collective news.",
        note: "Present perfect works when the result matters now.",
      },
    ],
    quickCheck: {
      prompt: "We have completed the survey last Monday.",
      answer: "We completed the survey last Monday. Last Monday names finished time, so simple past completed fits — not present perfect have completed.",
    },
  },

  "past-perfect": {
    whyThisHappens:
      "Past perfect (had + past participle) shows the earlier of two past events, but writers use it whenever the past is mentioned, even when sequence is already clear. Others forget it and leave ambiguity about which action came first. It matters for narratives, reported sequences, and cause before effect. If both events are simply in the past with no ordering problem, simple past is enough.",
    seeInSentence: [
      {
        incorrect: "After she submitted the form, she had checked the guidelines.",
        correct: "After she had checked the guidelines, she submitted the form.",
        note: "Checking came first — past perfect had checked before submitted.",
      },
      {
        incorrect: "Yesterday I had went to the office.",
        correct: "Yesterday I went to the office.",
        note: "Single past event with no earlier reference needs simple past, not past perfect.",
      },
      {
        incorrect: "He had ate before the meeting started.",
        correct: "He had eaten before the meeting started.",
        note: "Past participle is eaten, not ate.",
      },
    ],
    edgeCases: [
      {
        sentence: "By the time we arrived, the lecture had already begun.",
        note: "By the time + past often pairs with past perfect for the earlier action.",
      },
      {
        sentence: "She said she had forgotten the password.",
        note: "Reported speech backshifts present perfect to past perfect.",
      },
      {
        sentence: "If he had studied, he would have passed.",
        note: "Past perfect in contrary-to-fact if-clauses.",
      },
      {
        sentence: "I had never seen snow before I moved to Canada.",
        note: "Experience before another past point uses past perfect.",
      },
    ],
    quickCheck: {
      prompt: "When I reached the station, the train already left.",
      answer: "When I reached the station, the train had already left. The leaving happened before reaching — use past perfect had left.",
    },
  },

  "future-perfect": {
    whyThisHappens:
      "Future perfect (will have + past participle) marks completion before a future deadline, but it is uncommon, so writers avoid it or build it wrong (will have went). Use it with by next week, by then, or before + future time when finishing before that moment is the point.",
    seeInSentence: [
      {
        incorrect: "By Friday I will finished the report.",
        correct: "By Friday I will have finished the report.",
        note: "Future completion before a deadline uses will have + past participle.",
      },
      {
        incorrect: "She will has completed the course by June.",
        correct: "She will have completed the course by June.",
        note: "After will, use have — not has.",
      },
      {
        incorrect: "By 2030, scientists will discover a cure — if meaning completed by then.",
        correct: "By 2030, scientists will have discovered a cure.",
        note: "By 2030 points to completion — future perfect will have discovered.",
      },
    ],
    edgeCases: [
      {
        sentence: "By the time you read this, I will have left.",
        note: "Reader's future moment follows the completed action.",
      },
      {
        sentence: "In two years she will have worked here for a decade.",
        note: "Duration counted up to a future point.",
      },
      {
        sentence: "Future perfect is rare in everyday speech — simple future often replaces it.",
        note: "I will finish by Friday is acceptable if completion is clear.",
      },
      {
        sentence: "Will have been is future perfect continuous — different emphasis on duration.",
        note: "Do not confuse will have done with will have been doing.",
      },
    ],
    quickCheck: {
      prompt: "By next month, they will complete all migrations.",
      answer: "By next month, they will have completed all migrations — if stressing done before that date. Will have completed marks completion by the deadline.",
    },
  },

  "present-perfect-continuous": {
    whyThisHappens:
      "Present perfect continuous (have/has been + -ing) stresses ongoing activity from past until now, but writers use it with stative verbs (*have been knowing) or when simple present perfect is enough (I have been finishing — awkward). It highlights duration and visible effects (look tired from studying). Choose it when the process itself — not just the result — still matters at the moment of speaking.",
    seeInSentence: [
      {
        incorrect: "I have been knowing her for years.",
        correct: "I have known her for years.",
        note: "Know is stative — present perfect known, not continuous.",
      },
      {
        incorrect: "She has been wrote three chapters.",
        correct: "She has written three chapters — or She has been writing the thesis for months.",
        note: "Been wrote is wrong; match completed count (written) vs ongoing process (been writing).",
      },
      {
        incorrect: "They have been work all morning.",
        correct: "They have been working all morning.",
        note: "Been needs verb-ing: been working.",
      },
    ],
    edgeCases: [
      {
        sentence: "I have been reading since breakfast.",
        note: "Since + time with action still relevant or continuing.",
      },
      {
        sentence: "How long have you been waiting?",
        note: "How long questions often trigger present perfect continuous.",
      },
      {
        sentence: "I have lived vs I have been living here — similar with temporary nuance in continuous.",
        note: "Been living can stress a temporary stay.",
      },
      {
        sentence: "Recent evidence with visible result: You have been crying.",
        note: "Continuous can explain current state from recent activity.",
      },
    ],
    quickCheck: {
      prompt: "He has been study for the exam all week.",
      answer: "He has been studying for the exam all week. Present perfect continuous uses has been + verb-ing: studying.",
    },
  },

  "past-perfect-continuous": {
    whyThisHappens:
      "Past perfect continuous (had been + -ing) shows an activity continuing up to a past moment, but it is heavy and often replaceable. Writers misuse it for any long past action or form it incorrectly (had been study). Reserve it when duration before another past event truly matters.",
    seeInSentence: [
      {
        incorrect: "She had been work there before she transferred.",
        correct: "She had been working there before she transferred.",
        note: "Had been needs verb-ing: working.",
      },
      {
        incorrect: "I had been went home when they called.",
        correct: "I had gone home when they called — or I had been driving home when they called.",
        note: "Went does not follow had been — use been driving or past perfect gone.",
      },
      {
        incorrect: "He was tired because he had been know the truth for months.",
        correct: "He was tired because he had known the truth for months.",
        note: "Know is stative — had known, not had been knowing.",
      },
    ],
    edgeCases: [
      {
        sentence: "They had been negotiating for hours before an agreement emerged.",
        note: "Emphasises duration leading to a past outcome.",
      },
      {
        sentence: "She had been waiting since dawn when the doors opened.",
        note: "Ongoing wait up to a past event.",
      },
      {
        sentence: "Often interchangeable with past perfect: He had worked vs had been working.",
        note: "Continuous adds duration emphasis.",
      },
      {
        sentence: "Rare in short exam sentences — simplify unless contrast requires it.",
        note: "Clear sequence may need only past perfect or simple past.",
      },
    ],
    quickCheck: {
      prompt: "By the time help arrived, we had been wait for over an hour.",
      answer: "By the time help arrived, we had been waiting for over an hour. Had been waiting shows ongoing action up to that past point.",
    },
  },

  "future-perfect-continuous": {
    whyThisHappens:
      "Future perfect continuous (will have been + -ing) is the least common future form — it projects ongoing activity up to a future point. Writers rarely need it in essays and often garble it (will have been work). Use mainly for duration questions: By July, how long will you have been studying?",
    seeInSentence: [
      {
        incorrect: "By next year she will have been teach for twenty years.",
        correct: "By next year she will have been teaching for twenty years.",
        note: "Will have been + verb-ing: teaching.",
      },
      {
        incorrect: "In June I will have been worked here since 2020.",
        correct: "In June I will have been working here since 2020.",
        note: "Ongoing duration uses been working, not been worked.",
      },
      {
        incorrect: "They will have been finish by then.",
        correct: "They will have finished by then — completion, not continuous.",
        note: "Finished actions use future perfect, not future perfect continuous.",
      },
    ],
    edgeCases: [
      {
        sentence: "By December, he will have been leading the team for five years.",
        note: "Duration measured forward to a future date.",
      },
      {
        sentence: "How long will you have been living there by 2030?",
        note: "Typical question form for this tense.",
      },
      {
        sentence: "In academic writing, prefer simpler time phrases when possible.",
        note: "For five years by then may read clearer than future perfect continuous.",
      },
      {
        sentence: "Do not confuse with will be working (future continuous).",
        note: "Will be working at nine vs will have been working for three hours by nine.",
      },
    ],
    quickCheck: {
      prompt: "By graduation, I will have been attend this school for four years.",
      answer: "By graduation, I will have been attending this school for four years. Use will have been attending for duration up to a future point.",
    },
  },

  "end-marks": {
    whyThisHappens:
      "End marks — full stops, question marks, exclamation points — close sentences and set tone. Writers use question marks on indirect questions (*He asked why was she late?), drop periods in formal paragraphs, or stack exclamation marks in academic work. Each mark signals how the reader should interpret the clause. A quick final scan for mark type catches errors that spellcheck will never flag.",
    seeInSentence: [
      {
        incorrect: "She asked whether the deadline was Friday?",
        correct: "She asked whether the deadline was Friday.",
        note: "Indirect questions end with a period, not a question mark.",
      },
      {
        incorrect: "What time is the lecture.",
        correct: "What time is the lecture?",
        note: "Direct questions need a question mark.",
      },
      {
        incorrect: "The results were shocking!!",
        correct: "The results were shocking.",
        note: "Formal writing avoids multiple exclamation marks.",
      },
    ],
    edgeCases: [
      {
        sentence: "Is the data reliable? is a direct question; She wondered whether the data were reliable. is not.",
        note: "Only the direct form takes a question mark at the end.",
      },
      {
        sentence: "Imperatives can end with a period: Submit the form by noon.",
        note: "Commands are not always exclamations.",
      },
      {
        sentence: "Rhetorical questions in essays still use question marks.",
        note: "Why should taxpayers fund this? — then answer in the next sentence.",
      },
      {
        sentence: "Abbreviations like etc. and e.g. include internal periods; sentence still ends with one final mark.",
        note: "Do not double up incorrectly before the true sentence end.",
      },
    ],
    quickCheck: {
      prompt: "The tutor asked if we had read the chapter?",
      answer: "The tutor asked if we had read the chapter. Indirect question — use a period, not a question mark.",
    },
  },

  commas: {
    whyThisHappens:
      "Commas mark pauses and logical boundaries, but writers often omit them before coordinating conjunctions joining independent clauses, or add them where no pause belongs. Lists, introductory elements, and nonessential clauses each follow predictable patterns — errors usually come from rushing or mirroring speech without checking sentence structure.",
    seeInSentence: [
      {
        incorrect: "She finished the draft and she sent it to her tutor.",
        correct: "She finished the draft, and she sent it to her tutor.",
        note: "Two independent clauses joined by and need a comma before the conjunction.",
      },
      {
        incorrect: "After the meeting we revised the introduction.",
        correct: "After the meeting, we revised the introduction.",
        note: "Introductory phrase after the meeting needs a comma before the main clause.",
      },
      {
        incorrect: "The report which was overdue is finally complete.",
        correct: "The report, which was overdue, is finally complete.",
        note: "Nonessential which clause adds extra detail — set it off with commas on both sides.",
      },
    ],
    edgeCases: [
      {
        sentence: "We invited Maya, James, and Priya to the workshop.",
        note: "Oxford comma before and in a list of three or more items prevents ambiguity.",
      },
      {
        sentence: "On Tuesday, however, the deadline moved again.",
        note: "Introductory day phrase and however as interrupter both need comma boundaries.",
      },
      {
        sentence: "The CEO, who joined last year, approved the budget.",
        note: "Who joined last year is extra information — commas show it could be removed without changing core meaning.",
      },
      {
        sentence: "She said she would call, but she never did.",
        note: "Comma only when both sides could stand alone as sentences; do not comma-join fragments incorrectly.",
      },
    ],
    quickCheck: {
      prompt: "Before the exam students reviewed their notes in the library.",
      answer: "Before the exam, students reviewed their notes in the library. Add a comma after the introductory phrase Before the exam.",
    },
  },

  "semicolons-colons": {
    whyThisHappens:
      "Semicolons link related independent clauses or separate complex list items; colons introduce lists, explanations, or elaborations. Writers comma-splice instead of semicolon, or use a colon where a sentence is not complete before it. Knowing what came before the mark — full clause or not — decides the choice.",
    seeInSentence: [
      {
        incorrect: "The trial was inconclusive, the jury asked for more time.",
        correct: "The trial was inconclusive; the jury asked for more time.",
        note: "Related independent clauses can join with a semicolon.",
      },
      {
        incorrect: "The report includes: introduction, methods, and results.",
        correct: "The report includes an introduction, methods, and results. — or The report includes three sections: introduction, methods, and results.",
        note: "Avoid colon directly after a verb like includes without a complete lead-in.",
      },
      {
        incorrect: "She brought, apples; oranges, and pears.",
        correct: "She brought apples, oranges, and pears.",
        note: "Simple lists use commas, not semicolons — unless items contain internal commas.",
      },
    ],
    edgeCases: [
      {
        sentence: "We visited Leeds, UK; Paris, France; and Berlin, Germany.",
        note: "Semicolons separate list items that already contain commas.",
      },
      {
        sentence: "One idea became clear: the policy needed revision.",
        note: "Colon after an independent clause introduces an explanation.",
      },
      {
        sentence: "However is not a coordinator — use semicolon before however between clauses.",
        note: "...inconclusive; however, the jury...",
      },
      {
        sentence: "Do not capitalise the first word after a colon in a mid-sentence list unless it is a quotation or multiple sentences.",
        note: "Style guides differ — consistency matters in one essay.",
      },
    ],
    quickCheck: {
      prompt: "The experiment failed, therefore we repeated it with tighter controls.",
      answer: "The experiment failed; therefore, we repeated it with tighter controls. Use a semicolon before therefore between independent clauses.",
    },
  },

  apostrophes: {
    whyThisHappens:
      "Apostrophes show possession or mark contractions (it's = it is). Errors include its versus it's, plural apostrophes (*apple's for sale), and irregular plurals before possessive (children's). Autocorrect and speed writing make these some of the most visible mistakes in submitted work. Slow down on every word ending in -s and decide: plural only, possessive, or contraction.",
    seeInSentence: [
      {
        incorrect: "The company updated it's policy on remote work.",
        correct: "The company updated its policy on remote work.",
        note: "Its is possessive; it's means it is or it has.",
      },
      {
        incorrect: "Two student's presentations were selected.",
        correct: "Two students' presentations were selected.",
        note: "Plural possessive: students' for more than one student.",
      },
      {
        incorrect: "Its a difficult question, but its answer is short.",
        correct: "It's a difficult question, but its answer is short.",
        note: "It's = it is; its answer shows possession.",
      },
    ],
    edgeCases: [
      {
        sentence: "James's book vs James' book — both appear in style guides.",
        note: "Singular names ending in s vary — pick one form and stay consistent.",
      },
      {
        sentence: "Who's coming? — Who is. Whose draft is this? — Whose shows ownership.",
        note: "Who's is not possessive.",
      },
      {
        sentence: "The 1990s or the 1990's — decades usually take no apostrophe in plurals.",
        note: "No apostrophe for simple plurals of numbers.",
      },
      {
        sentence: "Mens room is wrong — Men's room or Men room signage varies; standard possessive is men's.",
        note: "Irregular plurals take apostrophe before s: men's, women's, children's.",
      },
    ],
    quickCheck: {
      prompt: "The teams captain announced it's strategy before kickoff.",
      answer: "The team's captain announced its strategy before kickoff. Team's = one team's; its = possessive for the strategy.",
    },
  },

  "quotation-marks": {
    whyThisHappens:
      "Quotation marks enclose direct speech, titles of short works, and sometimes terms used specially. Mistakes include punctuating outside the marks in American style, using single and double quotes inconsistently, or quoting so much that original analysis disappears. British and American placement rules differ slightly around commas and periods.",
    seeInSentence: [
      {
        incorrect: "She said the deadline was Friday.",
        correct: "She said, \"The deadline is Friday.\"",
        note: "Exact words need quotation marks and often a comma before the quote.",
      },
      {
        incorrect: "The article \"Climate and Cities\" argues for greener planning.",
        correct: "The article \"Climate and Cities\" argues for greener planning. — title in quotes if not italicised.",
        note: "Short works take quotation marks when italics are unavailable.",
      },
      {
        incorrect: "He called it a 'game changer' in the report.",
        correct: "He called it a \"game changer\" in the report.",
        note: "In American English, double quotes are primary; singles nest inside.",
      },
    ],
    edgeCases: [
      {
        sentence: "Periods and commas usually sit inside closing quotes in American usage.",
        note: "She agreed, \"We will revise.\"",
      },
      {
        sentence: "Question mark belongs inside if the quote is the question: She asked, \"Who attends?\"",
        note: "If the whole sentence questions the quote, mark goes outside.",
      },
      {
        sentence: "Scare quotes around so-called experts signal doubt — use sparingly.",
        note: "Overuse sounds sarcastic or vague.",
      },
      {
        sentence: "Block quotes of long passages often drop quotation marks and indent instead.",
        note: "Follow your exam style guide for length thresholds.",
      },
    ],
    quickCheck: {
      prompt: "The judge ruled that the contract was void\", she wrote in her notes.",
      answer: "The judge ruled that the contract was void,\" she wrote in her notes. Close the quotation before the dialogue tag and add the comma inside the quotes.",
    },
  },

  "dashes-hyphens": {
    whyThisHappens:
      "Hyphens join compound modifiers (well-known author); en dashes show ranges (pages 4–6); em dashes mark breaks or emphasis — unlike commas or parentheses. Writers hyphenate after -ly adverbs wrongly, use hyphens where an em dash belongs, or omit hyphens in compounds that change meaning (small business owner vs small-business owner). One missing hyphen can change what you are describing entirely.",
    seeInSentence: [
      {
        incorrect: "The well known researcher presented first.",
        correct: "The well-known researcher presented first.",
        note: "Compound adjective before a noun takes hyphens: well-known researcher.",
      },
      {
        incorrect: "Three cities London, Paris, and Rome were compared.",
        correct: "Three cities — London, Paris, and Rome — were compared.",
        note: "Em dashes set off an interrupting list more emphatically than commas.",
      },
      {
        incorrect: "Submit the form by 5:00-6:00 p.m.",
        correct: "Submit the form by 5:00–6:00 p.m.",
        note: "Time ranges use an en dash, not a hyphen.",
      },
    ],
    edgeCases: [
      {
        sentence: "A newly formed committee — no hyphen after -ly adverbs (newly formed).",
        note: "Do not hyphenate after most -ly adverbs.",
      },
      {
        sentence: "Em dash vs colon: One result stood out — accuracy improved.",
        note: "Dash adds drama; colon expects formal elaboration.",
      },
      {
        sentence: "Re-enter vs reenter — spelling varies; exams may accept one dictionary form.",
        note: "Follow one consistent dictionary.",
      },
      {
        sentence: "Hyphenate compound numbers twenty-one through ninety-nine when spelled out.",
        note: "Twenty-one students, not twenty one students.",
      },
    ],
    quickCheck: {
      prompt: "We need a last minute revision before the ten page report is due.",
      answer: "We need a last-minute revision before the ten-page report is due. Hyphenate compound modifiers before nouns: last-minute, ten-page.",
    },
  },

  "parentheses-brackets": {
    whyThisHappens:
      "Parentheses tuck in optional detail; brackets add editorial notes inside quotations or clarify material. Problems include leaving parentheses unclosed, overstuffing main sentences with asides, or changing quoted words inside brackets without signalling the edit. Material inside should be skippable without breaking the grammar of the host sentence.",
    seeInSentence: [
      {
        incorrect: "The results (which were unexpected showed a clear trend.",
        correct: "The results (which were unexpected) showed a clear trend.",
        note: "Close parentheses — the aside must not swallow the main verb.",
      },
      {
        incorrect: "She wrote that the policy was unfair and discriminatory [sic].",
        correct: "She wrote that the policy was \"unfair and discriminatory\" [sic].",
        note: "Quotations often need marks; [sic] shows quoted error preserved.",
      },
      {
        incorrect: "Contact the team (email: team@example.com for details.",
        correct: "Contact the team (team@example.com) for details.",
        note: "Parenthetical contact info must be fully enclosed.",
      },
    ],
    edgeCases: [
      {
        sentence: "Punctuation: place a period outside if the parenthetical is not a full sentence.",
        note: "The trial ended early (see Appendix B).",
      },
      {
        sentence: "Square brackets add clarification: He [the manager] approved it.",
        note: "Brackets show your insertion, not the original author's words.",
      },
      {
        sentence: "Nested parentheses are awkward — rephrase or use dashes instead.",
        note: "Avoid (group A (subset B) results).",
      },
      {
        sentence: "Citation brackets [1] differ from editorial brackets — follow your style system.",
        note: "Academic formats vary on bracket use for references.",
      },
    ],
    quickCheck: {
      prompt: "The average score (n = 45 increased sharply in round two.",
      answer: "The average score (n = 45) increased sharply in round two. Close the parenthesis before increased so the main clause stays intact.",
    },
  },

  "subject-verb-agreement": {
    whyThisHappens:
      "Writers often match the verb to the nearest noun instead of the true subject, especially when a long phrase sits between them. Collective nouns, indefinite pronouns, and compound subjects with or/nor also blur what counts as singular or plural. The fix is always the same habit: name the subject first, then choose the verb.",
    seeInSentence: [
      {
        incorrect: "The committee have approved the revised draft.",
        correct: "The committee has approved the revised draft.",
        note: "Treat committee as one unit taking a singular verb when it acts together.",
      },
      {
        incorrect: "The list of ideas are on your desk.",
        correct: "The list of ideas is on your desk.",
        note: "Subject is list (singular), not ideas — ignore the prepositional phrase in the middle.",
      },
      {
        incorrect: "Everyone in the teams were ready.",
        correct: "Everyone in the teams was ready.",
        note: "Everyone is singular; teams only adds detail and does not make the verb plural.",
      },
    ],
    edgeCases: [
      {
        sentence: "Neither the manager nor the analysts have signed off yet.",
        note: "With neither/nor, the verb agrees with the nearer subject — analysts is plural, so use have.",
      },
      {
        sentence: "The data show a clear trend, but the dataset is incomplete.",
        note: "Data is plural in scientific writing (data show); dataset is singular (dataset is).",
      },
      {
        sentence: "A number of students are waiting; the number of applicants is rising.",
        note: "A number of takes a plural verb; the number of takes a singular verb.",
      },
      {
        sentence: "Politics is complicated, but the politics of this issue are local.",
        note: "Some -ics nouns are singular when meaning a field (politics is) but plural when meaning specific factors (politics are).",
      },
    ],
    quickCheck: {
      prompt: "Each of the reports need a summary paragraph before Friday.",
      answer: "Each of the reports needs a summary paragraph before Friday. Each is the subject and is singular, so use needs — not reports.",
    },
  },

  "dangling-modifiers": {
    whyThisHappens:
      "Opening phrases like Running to class or Having finished the report describe an action, so readers assume the subject right after the comma performed it. When the wrong noun follows, the sentence sounds absurd or vague. Rephrasing so the doer is explicit prevents confusion and tightens professional writing.",
    seeInSentence: [
      {
        incorrect: "Running to class, my bag fell open.",
        correct: "Running to class, I dropped my bag and it fell open.",
        note: "Bags do not run — put the person (I) next to the opening phrase.",
      },
      {
        incorrect: "Having studied all night, the exam felt easier.",
        correct: "Having studied all night, I found the exam easier.",
        note: "The exam did not study; the student did.",
      },
      {
        incorrect: "To win the grant, careful data collection is required.",
        correct: "To win the grant, we must collect data carefully.",
        note: "Data collection cannot intend to win a grant — name who must act.",
      },
    ],
    edgeCases: [
      {
        sentence: "Walking through the market, the spices overwhelmed her senses.",
        note: "Misplaced: spices were not walking. Better: As she walked through the market, the spices overwhelmed her senses.",
      },
      {
        sentence: "Freshly baked, Ava grabbed the loaf from the counter.",
        note: "Ava was not freshly baked. Better: Ava grabbed the freshly baked loaf from the counter.",
      },
      {
        sentence: "After reviewing the contract, several clauses still confused the team.",
        note: "Who reviewed? Add the reader: After we reviewed the contract, several clauses still confused us.",
      },
      {
        sentence: "Turning the corner, the skyline appeared through the rain.",
        note: "Skylines do not turn corners. Better: When we turned the corner, the skyline appeared through the rain.",
      },
    ],
    quickCheck: {
      prompt: "Hoping for a reply, the email was sent again on Monday.",
      answer: "Hoping for a reply, I sent the email again on Monday. An email cannot hope — the writer must be the subject after the opening modifier.",
    },
  },

  "wrong-tense": {
    whyThisHappens:
      "Wrong tense shifts time without reason — past events in present tense, or finished deadlines still in future will. Narratives need consistent anchors; arguments may use present for general claims and past for examples. Markers notice when every verb wobbles between was and is in one paragraph.",
    seeInSentence: [
      {
        incorrect: "In 2020 the government introduces a new tax and millions protested.",
        correct: "In 2020 the government introduced a new tax and millions protested.",
        note: "Keep the same past time frame for both verbs in a historical sentence.",
      },
      {
        incorrect: "She finishes the essay and submitted it yesterday.",
        correct: "She finished the essay and submitted it yesterday.",
        note: "Yesterday requires past throughout — finished and submitted.",
      },
      {
        incorrect: "By next week, we submitted the final report.",
        correct: "By next week, we will submit the final report.",
        note: "Future deadline — use future tense, not past submitted.",
      },
    ],
    edgeCases: [
      {
        sentence: "Historical present in analysis: Darwin argues... — acceptable in literary essays.",
        note: "Shift is deliberate, not accidental.",
      },
      {
        sentence: "Backshift in reported speech: She said she was ill.",
        note: "Reporting past speech often moves present to past.",
      },
      {
        sentence: "Present perfect vs past: I have lost my keys (still lost) vs I lost my keys (may be found).",
        note: "Choose based on connection to now.",
      },
      {
        sentence: "Sequence of tenses in conditionals: If I had known, I would have acted.",
        note: "Hypothetical past chains past perfect with would have.",
      },
    ],
    quickCheck: {
      prompt: "Last night she prepares dinner and watches a documentary.",
      answer: "Last night she prepared dinner and watched a documentary. Last night fixes the time in the past — use prepared and watched.",
    },
  },

  "article-errors": {
    whyThisHappens:
      "Article errors (a, an, the, or zero article) plague non-native writers and rush editing alike. The choice depends on countability, specificity, and first versus second mention. Wrong articles make familiar nouns sound odd — an university, the pollution in general statements, or missing the before unique roles.",
    seeInSentence: [
      {
        incorrect: "She is an university student studying the biology.",
        correct: "She is a university student studying biology.",
        note: "University starts with a consonant sound (a university); biology is general — no the.",
      },
      {
        incorrect: "A Sun rises in east every morning.",
        correct: "The sun rises in the east every morning.",
        note: "Unique natural references take the: the sun, the east.",
      },
      {
        incorrect: "He gave me good advice on the writing essays.",
        correct: "He gave me good advice on writing essays.",
        note: "Advice and general writing essays take no article before the gerund phrase.",
      },
    ],
    edgeCases: [
      {
        sentence: "A European country vs an hour — match a/an to sound, not spelling.",
        note: "European has a y-consonant sound; hour starts with a vowel sound.",
      },
      {
        sentence: "The United Kingdom, but generally zero article with country names except plurals or kingdoms.",
        note: "The Netherlands vs Canada.",
      },
      {
        sentence: "First mention: a report; later: the report.",
        note: "Definite article signals shared knowledge.",
      },
      {
        sentence: "Zero article with plural generalisations: Computers have changed education.",
        note: "Plurals in general statements often need no the.",
      },
    ],
    quickCheck: {
      prompt: "She wants to become the doctor and work in hospital.",
      answer: "She wants to become a doctor and work in a hospital. A doctor = any member of the profession; a hospital = one unspecified institution.",
    },
  },

  "preposition-confusion": {
    whyThisHappens:
      "Preposition confusion is separate from general preposition use — it targets high-frequency mix-ups: depend on/in, different from/than, arrive at/in, agree with/on/about. These pairs are not interchangeable; exams often test collocations in gap-fill and error-correction items. Learning them as fixed phrases beats translating from another language word by word.",
    seeInSentence: [
      {
        incorrect: "Success depends in hard work and careful planning.",
        correct: "Success depends on hard work and careful planning.",
        note: "Depend on is fixed — not depend in.",
      },
      {
        incorrect: "She is married with a lawyer who specialises in tax.",
        correct: "She is married to a lawyer who specialises in tax.",
        note: "Married to a person; married with is non-standard for spouses.",
      },
      {
        incorrect: "We discussed about the results at length.",
        correct: "We discussed the results at length.",
        note: "Discuss takes a direct object — no about after discuss.",
      },
    ],
    edgeCases: [
      {
        sentence: "Agree with a person, agree on a plan, agree about a topic — senses differ slightly.",
        note: "I agree with her; we agree on the date.",
      },
      {
        sentence: "In the morning vs on Monday vs at night — time prepositions are idiomatic.",
        note: "Memorise sets rather than one rule.",
      },
      {
        sentence: "Compliant with regulations vs compliant to is wrong.",
        note: "Many adjective + preposition pairs are fixed.",
      },
      {
        sentence: "Enter a room — no into after enter (enter into an agreement is idiomatic).",
        note: "Verb + preposition traps vary by verb.",
      },
    ],
    quickCheck: {
      prompt: "The findings are different than the control group in several ways.",
      answer: "The findings are different from the control group in several ways. In formal writing, different from is preferred over different than.",
    },
  },

  "double-negatives": {
    whyThisHappens:
      "Double negatives use two negative words in one clause (I do not need no help), creating a non-standard positive or confusing meaning. Some dialects use them for emphasis, but formal exams expect a single negative. Writers also stumble with hardly, scarcely, and barely, which are already negative — so not hardly is wrong.",
    seeInSentence: [
      {
        incorrect: "I do not have no time to revise tonight.",
        correct: "I do not have any time to revise tonight — or I have no time to revise tonight.",
        note: "One negative per clause in standard English.",
      },
      {
        incorrect: "She cannot hardly hear the speaker.",
        correct: "She can hardly hear the speaker.",
        note: "Hardly is negative — drop cannot.",
      },
      {
        incorrect: "We did not see nobody at the desk.",
        correct: "We did not see anybody at the desk — or We saw nobody at the desk.",
        note: "Nobody and did not stack negatives — pick anybody or nobody alone.",
      },
    ],
    edgeCases: [
      {
        sentence: "Not uncommon means fairly common — intentional double negative as rhetoric.",
        note: "Litotes is deliberate; exam errors are not.",
      },
      {
        sentence: "Scarcely any and barely any are fine — scarcely no is not.",
        note: "Do not pair scarcely with no.",
      },
      {
        sentence: "Without hardly any support — without is negative in effect.",
        note: "Watch stacked negatives in longer phrases.",
      },
      {
        sentence: "I could not disagree more — idiomatic emphasis, not an error.",
        note: "Fixed expressions differ from accidental double negatives.",
      },
    ],
    quickCheck: {
      prompt: "He does not never submit drafts on time.",
      answer: "He never submits drafts on time — or He does not ever submit drafts on time. Does not never is a double negative; use one negative form.",
    },
  },

  "confused-words": {
    whyThisHappens:
      "Confused words sound or look alike but differ in meaning — affect/effect, principal/principle, fewer/less. Spellcheck will not catch them because both are valid English. Context and part of speech decide the choice; mixing them undermines credibility in essays and business writing alike.",
    seeInSentence: [
      {
        incorrect: "The new policy will effect every student in the program.",
        correct: "The new policy will affect every student in the program.",
        note: "Affect is usually the verb (influence); effect is usually the noun (result).",
      },
      {
        incorrect: "There are less applicants this year than last.",
        correct: "There are fewer applicants this year than last.",
        note: "Fewer counts discrete items (applicants); less measures bulk (less time).",
      },
      {
        incorrect: "The principal reason is cost; we must follow that affect.",
        correct: "The principal reason is cost; we must follow that principle.",
        note: "Principal = main; principle = rule. Affect is not principle.",
      },
    ],
    edgeCases: [
      {
        sentence: "Its vs it's; their vs there vs they're — homophone trios need slow proofreading.",
        note: "Read aloud substituting it is or they are.",
      },
      {
        sentence: "Compliment vs complement: she complimented his work; wine complements the meal.",
        note: "Spelling changes meaning entirely.",
      },
      {
        sentence: "Lead (metal) vs led (past tense of lead) vs lead (verb present).",
        note: "Pronunciation and role clarify.",
      },
      {
        sentence: "Than for comparisons; then for time: better than before, then we left.",
        note: "Then ≠ than.",
      },
    ],
    quickCheck: {
      prompt: "The weather may have an affect on attendance at the outdoor lecture.",
      answer: "The weather may have an effect on attendance at the outdoor lecture. The noun result is effect; affect is usually the verb.",
    },
  },
};
