import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const words = [
  ["serendipity", "noun", "A happy accident; finding something good without looking for it.", "We met by serendipity at the library cafe."],
  ["melancholy", "noun", "A gentle, thoughtful sadness.", "A melancholy rain fell on the empty street."],
  ["eloquent", "adjective", "Expressing ideas clearly and powerfully.", "Her eloquent speech moved the whole room."],
  ["meticulous", "adjective", "Extremely careful about every small detail.", "He kept meticulous notes during the experiment."],
  ["ubiquitous", "adjective", "Seeming to be everywhere at once.", "Smartphones have become ubiquitous in daily life."],
  ["pragmatic", "adjective", "Focused on practical results rather than theory.", "She took a pragmatic approach to the budget."],
  ["resilient", "adjective", "Able to recover quickly from difficulty.", "The community proved resilient after the storm."],
  ["ambiguous", "adjective", "Open to more than one interpretation.", "His reply was polite but ambiguous."],
  ["concise", "adjective", "Giving a lot of information clearly in few words.", "Please keep your summary concise."],
  ["verbose", "adjective", "Using more words than needed.", "The report was accurate but verbose."],
  ["ephemeral", "adjective", "Lasting for a very short time.", "Cherry blossoms are famously ephemeral."],
  ["tenacious", "adjective", "Not giving up easily; persistent.", "A tenacious researcher finally solved the puzzle."],
  ["benevolent", "adjective", "Kind and wanting to help others.", "The benevolent donor funded the scholarship."],
  ["candid", "adjective", "Honest and direct, even about difficult topics.", "She gave a candid account of the failure."],
  ["diligent", "adjective", "Showing steady, careful effort.", "Diligent practice improved her writing fast."],
  ["fortuitous", "adjective", "Happening by lucky chance.", "A fortuitous meeting led to our collaboration."],
  ["gregarious", "adjective", "Enjoying the company of other people.", "He is gregarious at parties but quiet at work."],
  ["hypothesis", "noun", "An idea you test to see if it is true.", "Our hypothesis predicted faster growth in spring."],
  ["impeccable", "adjective", "Flawless; without any mistakes.", "Her timing was impeccable during the presentation."],
  ["juxtapose", "verb", "Place two things side by side to compare them.", "The essay juxtaposes rural and urban life."],
  ["lucid", "adjective", "Clear and easy to understand.", "She wrote a lucid explanation of the rule."],
  ["mundane", "adjective", "Ordinary and not exciting.", "Even mundane chores can teach patience."],
  ["nostalgic", "adjective", "Feeling warm longing for the past.", "The song made everyone slightly nostalgic."],
  ["obsolete", "adjective", "No longer used or needed.", "That filing system is nearly obsolete now."],
  ["paradox", "noun", "A statement that seems contradictory but may be true.", "It is a paradox that less can sometimes be more."],
  ["quintessential", "adjective", "The most perfect example of something.", "This cafe is the quintessential neighborhood spot."],
  ["reluctant", "adjective", "Unwilling or hesitant to do something.", "He was reluctant to share the draft early."],
  ["scrutinize", "verb", "Examine something very closely.", "Editors scrutinize every comma in legal text."],
  ["taciturn", "adjective", "Reserved; saying very little.", "The taciturn coach spoke only when necessary."],
  ["understate", "verb", "Describe something as smaller or less important than it is.", "She tends to understate her own achievements."],
  ["venerable", "adjective", "Respected because of age or long service.", "The venerable oak shaded the courtyard."],
  ["whimsical", "adjective", "Playfully unusual or fanciful.", "The illustrator added whimsical details to each page."],
  ["zealous", "adjective", "Showing great energy and enthusiasm for a cause.", "Zealous volunteers rebuilt the trail in a week."],
  ["alleviate", "verb", "Make pain, problems, or suffering less severe.", "Rest and water can alleviate mild headaches."],
  ["bolster", "verb", "Support or strengthen something.", "Fresh data bolstered their main argument."],
  ["catalyst", "noun", "Something that causes an important change.", "The workshop acted as a catalyst for new ideas."],
  ["dichotomy", "noun", "A division into two sharply different parts.", "The essay explores the dichotomy of freedom and duty."],
  ["elucidate", "verb", "Make something clear by explaining it.", "The teacher elucidated the rule with examples."],
  ["fastidious", "adjective", "Very attentive to accuracy and detail.", "A fastidious proofreader catches tiny errors."],
  ["garrulous", "adjective", "Excessively talkative, especially about trivial things.", "The garrulous guide extended the tour by an hour."],
  ["harbinger", "noun", "A sign that something is about to happen.", "Frost is a harbinger of winter in the valley."],
  ["idiosyncrasy", "noun", "A distinctive personal habit or way of doing things.", "Arriving early is one of her harmless idiosyncrasies."],
  ["jubilant", "adjective", "Feeling or expressing great happiness.", "The team was jubilant after the final whistle."],
  ["kinetic", "adjective", "Relating to motion or movement.", "The dancer created a kinetic line across the stage."],
  ["lament", "verb", "Express sorrow or regret about something.", "Poets often lament the passing of seasons."],
  ["mitigate", "verb", "Make something less severe or harmful.", "Shade trees mitigate heat in dense cities."],
  ["nonchalant", "adjective", "Calm and casually unconcerned.", "He gave a nonchalant shrug and changed the topic."],
  ["ostensible", "adjective", "Appearing to be true but possibly not.", "The ostensible reason was safety; the real one was cost."],
  ["perfunctory", "adjective", "Done with little interest or effort.", "He offered a perfunctory apology and left."],
  ["quell", "verb", "Put an end to something, usually by force or calm.", "She quelled the panic with a steady voice."],
  ["recalcitrant", "adjective", "Stubbornly resistant to authority or control.", "The recalcitrant file refused to upload."],
  ["sagacious", "adjective", "Wise and showing good judgment.", "A sagacious mentor saved me from a costly mistake."],
  ["tangible", "adjective", "Clear and real enough to touch or measure.", "We need tangible progress by Friday."],
  ["unequivocal", "adjective", "Leaving no doubt; completely clear.", "The results were unequivocal and reproducible."],
  ["vacillate", "verb", "Alternate between different opinions or actions.", "Do not vacillate once you have chosen a thesis."],
  ["wistful", "adjective", "Having a gently sad longing for something.", "He stared out the window with a wistful smile."],
  ["yearn", "verb", "Feel a powerful desire for something.", "Readers yearn for characters they can trust."],
  ["zeal", "noun", "Great energy or passion for a cause.", "Her zeal for learning inspired the whole class."],
  ["aberration", "noun", "A departure from what is normal or expected.", "The warm day in January was a weather aberration."],
  ["brevity", "noun", "Concise and exact use of words.", "Brevity makes your strongest points stand out."],
  ["cacophony", "noun", "A harsh mixture of loud sounds.", "A cacophony of horns filled the intersection."],
  ["deference", "noun", "Polite respect for someone's wishes or opinion.", "In deference to her expertise, we waited."],
  ["ebullient", "adjective", "Cheerful and full of energy.", "His ebullient mood lifted the tired team."],
  ["fallacy", "noun", "A mistaken belief based on weak reasoning.", "That argument rests on a common logical fallacy."],
  ["germane", "adjective", "Relevant to a subject under consideration.", "Keep comments germane to the paragraph you edit."],
  ["heuristic", "noun", "A practical method for solving problems quickly.", "Use the heuristic: read aloud to catch awkward rhythm."],
  ["inexorable", "adjective", "Impossible to stop or prevent.", "Deadlines have an inexorable way of arriving."],
  ["judicious", "adjective", "Having or showing good judgment.", "A judicious edit removed repetition without losing voice."],
  ["kudos", "noun", "Praise and honor for an achievement.", "Kudos to everyone who revised before dawn."],
  ["laconic", "adjective", "Using very few words.", "His laconic reply ended the debate."],
  ["malleable", "adjective", "Easily influenced or shaped.", "Young minds are wonderfully malleable with good teaching."],
  ["nefarious", "adjective", "Wicked or criminal.", "The villain's nefarious plan unraveled quickly."],
  ["obfuscate", "verb", "Make something unclear on purpose.", "Jargon should clarify ideas, not obfuscate them."],
  ["placate", "verb", "Make someone less angry or hostile.", "She tried to placate the upset customer with tea."],
  ["quixotic", "adjective", "Extremely idealistic and impractical.", "His quixotic quest for a perfect first draft never ends."],
  ["relegate", "verb", "Assign to a lower or less important position.", "Do not relegate proofreading to the last five minutes."],
  ["salient", "adjective", "Most noticeable or important.", "Highlight the salient facts before the details."],
  ["truculent", "adjective", "Eager to argue or fight; aggressively defiant.", "A truculent tone can ruin an otherwise fair point."],
  ["unctuous", "adjective", "Excessively flattering or insincerely earnest.", "The unctuous praise made everyone uncomfortable."],
  ["vicarious", "adjective", "Experienced through another person's actions.", "Readers feel vicarious triumph when the hero wins."],
  ["wane", "verb", "Become gradually smaller or weaker.", "Interest in the fad began to wane by March."],
  ["xenial", "adjective", "Relating to hospitality between host and guest.", "The xenial welcome made travelers feel at home."],
  ["yoke", "verb", "Join or link two things tightly together.", "The essay yokes memory and landscape into one theme."],
  ["zenith", "noun", "The highest point of success or power.", "At the zenith of her career, she still took classes."],
  ["acquiesce", "verb", "Accept something reluctantly but without protest.", "He acquiesced to the group's simpler title."],
  ["bellicose", "adjective", "Demonstrating aggression and willingness to fight.", "Bellicose language escalates minor disagreements."],
  ["capricious", "adjective", "Changing mood or behavior suddenly and unpredictably.", "Capricious weather ruined our outdoor rehearsal."],
  ["dearth", "noun", "A scarcity or lack of something.", "There is no dearth of advice, only of practice."],
  ["effervescent", "adjective", "Vivacious and enthusiastic.", "Her effervescent curiosity energized the seminar."],
  ["furtive", "adjective", "Attempting to avoid notice; secretive.", "He cast a furtive glance at the clock."],
  ["gossamer", "adjective", "Extremely light, thin, and delicate.", "Gossamer mist hung over the meadow at dawn."],
  ["halcyon", "adjective", "Calm, peaceful, and happy, especially of a past time.", "We spoke of halcyon summers before the move."],
  ["iconoclast", "noun", "A person who challenges accepted beliefs or institutions.", "Every iconoclast needs evidence, not just attitude."],
  ["jejune", "adjective", "Naive, simplistic, and uninteresting.", "The first draft felt jejune until we added specifics."],
  ["knack", "noun", "A skill at doing something easily and well.", "She has a knack for turning complex ideas plain."],
  ["languid", "adjective", "Slow, relaxed, and lacking energy.", "A languid afternoon slowed every sentence we wrote."],
  ["mirth", "noun", "Amusement, especially expressed in laughter.", "Shared mirth loosened the tense workshop."],
  ["nadir", "noun", "The lowest point of something.", "After the nadir of week two, scores climbed again."],
  ["opulent", "adjective", "Luxurious and wealthy in appearance.", "Opulent prose can bury a simple truth."],
  ["paucity", "noun", "The presence of something only in small amounts.", "A paucity of examples weakens the argument."],
  ["quagmire", "noun", "A difficult or messy situation hard to escape.", "Without a thesis, the draft became a quagmire."],
  ["redolent", "adjective", "Strongly reminiscent or suggestive of something.", "The passage is redolent of early autumn."],
  ["sanguine", "adjective", "Optimistic or positive, especially in a difficult situation.", "Stay sanguine, but revise the weak paragraph tonight."],
  ["trepidation", "noun", "A feeling of fear about something that may happen.", "She opened the feedback email with trepidation."],
  ["utilitarian", "adjective", "Designed to be useful rather than attractive.", "His utilitarian style favors clarity over flourish."],
  ["veracity", "noun", "Truthfulness and accuracy.", "Check the veracity of every quoted statistic."],
  ["wheedle", "verb", "Coax someone using flattery or soft persuasion.", "Do not wheedle readers; earn their trust with proof."],
  ["xeric", "adjective", "Very dry, especially describing a habitat.", "Xeric plants thrive where rain is rare."],
  ["yonder", "adverb", "At some distance in the direction indicated.", "The hills yonder turned violet at sunset."],
  ["zephyr", "noun", "A soft, gentle breeze.", "A cool zephyr rattled the pages on the desk."],
];

const entries = words.map(([word, partOfSpeech, definition, example]) => ({
  word,
  partOfSpeech,
  definition,
  example,
}));

const wordOfDay = `// Curated words of the day — cycles through the list by calendar day.
export interface WordOfDayEntry {
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
}

export const WORDS_OF_THE_DAY: WordOfDayEntry[] = ${JSON.stringify(entries, null, 2)};

export function getDayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getWordOfTheDay(date = new Date()): WordOfDayEntry {
  const index = getDayOfYear(date) % WORDS_OF_THE_DAY.length;
  return WORDS_OF_THE_DAY[index];
}
`;

fs.writeFileSync(path.join(root, "src/constants/wordOfTheDay.ts"), wordOfDay);

const collections = [
  {
    id: "emotions",
    title: "Words for emotions",
    teaser: "melancholy, elated, pensive",
    words: [
      ["melancholy", "noun", "A gentle, thoughtful sadness"],
      ["elated", "adjective", "Extremely happy and excited"],
      ["pensive", "adjective", "Deep in serious thought"],
      ["serene", "adjective", "Calm and peaceful"],
      ["wistful", "adjective", "Gently longing for the past"],
      ["jubilant", "adjective", "Full of joy and celebration"],
      ["trepidation", "noun", "Fear about what may happen"],
      ["ebullient", "adjective", "Cheerful and energetic"],
      ["forlorn", "adjective", "Sad and lonely"],
      ["exuberant", "adjective", "Filled with lively energy"],
    ],
  },
  {
    id: "sound-meaning",
    title: "Words that sound like their meaning",
    teaser: "buzz, crash, whisper",
    words: [
      ["buzz", "verb", "Make a low humming sound"],
      ["crash", "verb", "Collide with a loud noise"],
      ["whisper", "verb", "Speak very softly"],
      ["hiss", "verb", "Make a sharp sibilant sound"],
      ["clang", "verb", "Make a loud metallic ringing"],
      ["murmur", "verb", "Speak quietly and indistinctly"],
      ["thud", "noun", "A dull heavy sound from impact"],
      ["sizzle", "verb", "Make a hissing frying sound"],
      ["crackle", "verb", "Make short sharp repeated sounds"],
      ["whoosh", "noun", "A rushing movement of air"],
    ],
  },
  {
    id: "commonly-confused",
    title: "Commonly confused words",
    teaser: "affect, effect, imply",
    words: [
      ["affect", "verb", "To influence or change something"],
      ["effect", "noun", "A result or consequence"],
      ["imply", "verb", "To suggest without stating directly"],
      ["infer", "verb", "To conclude from evidence"],
      ["fewer", "determiner", "Used with countable nouns"],
      ["less", "determiner", "Used with uncountable nouns"],
      ["complement", "noun", "Something that completes"],
      ["compliment", "noun", "An expression of praise"],
      ["discreet", "adjective", "Careful and private"],
      ["discrete", "adjective", "Separate and distinct"],
    ],
  },
  {
    id: "power-verbs",
    title: "Power verbs for writing",
    teaser: "assert, contend, illustrate",
    words: [
      ["assert", "verb", "State a fact or belief confidently"],
      ["contend", "verb", "Argue that something is true"],
      ["illustrate", "verb", "Explain with examples"],
      ["demonstrate", "verb", "Show clearly by evidence"],
      ["articulate", "verb", "Express clearly in words"],
      ["underscore", "verb", "Emphasize the importance of"],
      ["bolster", "verb", "Support or strengthen"],
      ["refute", "verb", "Prove a statement wrong"],
      ["synthesize", "verb", "Combine ideas into a whole"],
      ["scrutinize", "verb", "Examine very closely"],
    ],
  },
  {
    id: "borrowed-words",
    title: "Words from other languages",
    teaser: "schadenfreude, serendipity, wanderlust",
    words: [
      ["schadenfreude", "noun", "Pleasure from another's misfortune"],
      ["serendipity", "noun", "A lucky accidental discovery"],
      ["wanderlust", "noun", "A strong desire to travel"],
      ["déjà vu", "noun", "The feeling of having experienced something before"],
      ["zeitgeist", "noun", "The spirit of a particular era"],
      ["bona fide", "adjective", "Genuine and real"],
      ["ad hoc", "adjective", "Created for a specific purpose"],
      ["status quo", "noun", "The existing state of affairs"],
      ["faux pas", "noun", "An embarrassing social mistake"],
      ["raison d'être", "noun", "The most important reason for existing"],
    ],
  },
  {
    id: "academic",
    title: "Academic vocabulary",
    teaser: "analyze, synthesize, evaluate",
    words: [
      ["analyze", "verb", "Examine in detail to understand"],
      ["synthesize", "verb", "Combine parts into a coherent whole"],
      ["evaluate", "verb", "Judge the value or quality of"],
      ["hypothesize", "verb", "Propose an explanation to test"],
      ["corroborate", "verb", "Confirm with supporting evidence"],
      ["elucidate", "verb", "Make something clear"],
      ["paradigm", "noun", "A typical pattern or model"],
      ["empirical", "adjective", "Based on observation or experiment"],
      ["nuance", "noun", "A subtle difference in meaning"],
      ["premise", "noun", "A statement assumed to be true"],
    ],
  },
  {
    id: "precision",
    title: "Words for precision",
    teaser: "meticulous, fastidious, precise",
    words: [
      ["meticulous", "adjective", "Extremely careful about details"],
      ["fastidious", "adjective", "Very attentive to accuracy"],
      ["precise", "adjective", "Exact and accurate"],
      ["exacting", "adjective", "Demanding great accuracy"],
      ["rigorous", "adjective", "Extremely thorough and strict"],
      ["scrupulous", "adjective", "Very careful about honesty and detail"],
      ["exact", "adjective", "Correct in every detail"],
      ["definitive", "adjective", "Conclusive and authoritative"],
      ["unambiguous", "adjective", "Having only one clear meaning"],
      ["lucid", "adjective", "Clear and easy to understand"],
    ],
  },
  {
    id: "transitions",
    title: "Transition words",
    teaser: "however, moreover, consequently",
    words: [
      ["however", "adverb", "Introduces a contrast"],
      ["moreover", "adverb", "Adds supporting information"],
      ["consequently", "adverb", "Shows a result"],
      ["nevertheless", "adverb", "Despite what was just said"],
      ["furthermore", "adverb", "Adds another supporting point"],
      ["therefore", "adverb", "Indicates logical conclusion"],
      ["meanwhile", "adverb", "At the same time"],
      ["likewise", "adverb", "In the same way"],
      ["nonetheless", "adverb", "In spite of that"],
      ["subsequently", "adverb", "Happening after something else"],
    ],
  },
  {
    id: "words-about-words",
    title: "Words about words",
    teaser: "verbose, concise, eloquent",
    words: [
      ["verbose", "adjective", "Using too many words"],
      ["concise", "adjective", "Brief but complete"],
      ["eloquent", "adjective", "Fluent and persuasive"],
      ["articulate", "adjective", "Able to express ideas clearly"],
      ["laconic", "adjective", "Using very few words"],
      ["garrulous", "adjective", "Excessively talkative"],
      ["prolix", "adjective", "Tediously wordy"],
      ["succinct", "adjective", "Briefly and clearly expressed"],
      ["rhetoric", "noun", "The art of effective speaking or writing"],
      ["diction", "noun", "Choice and use of words"],
    ],
  },
  {
    id: "descriptive-adjectives",
    title: "Vivid descriptive adjectives",
    teaser: "luminous, austere, verdant",
    words: [
      ["luminous", "adjective", "Glowing with light"],
      ["austere", "adjective", "Severe or plain in style"],
      ["verdant", "adjective", "Green with growing plants"],
      ["somber", "adjective", "Dark and serious in mood"],
      ["resplendent", "adjective", "Attractively bright and impressive"],
      ["squalid", "adjective", "Extremely dirty and unpleasant"],
      ["ethereal", "adjective", "Extremely delicate and light"],
      ["rugged", "adjective", "Strong and roughly built"],
      ["opulent", "adjective", "Luxurious and rich"],
      ["gossamer", "adjective", "Extremely light and delicate"],
    ],
  },
  {
    id: "argument-words",
    title: "Words for building arguments",
    teaser: "premise, warrant, rebuttal",
    words: [
      ["premise", "noun", "A starting assumption"],
      ["warrant", "noun", "A reason connecting claim and evidence"],
      ["rebuttal", "noun", "A counterargument"],
      ["concede", "verb", "Admit that something is true"],
      ["refute", "verb", "Disprove by argument"],
      ["postulate", "verb", "Suggest as a basis for reasoning"],
      ["contention", "noun", "A claim argued for"],
      ["caveat", "noun", "A warning or limitation"],
      ["salient", "adjective", "Most important or noticeable"],
      ["tenable", "adjective", "Able to be defended logically"],
    ],
  },
  {
    id: "workplace",
    title: "Professional workplace vocabulary",
    teaser: "deliverable, stakeholder, bandwidth",
    words: [
      ["deliverable", "noun", "A tangible output due on a deadline"],
      ["stakeholder", "noun", "Anyone affected by a decision"],
      ["bandwidth", "noun", "Available time and mental capacity"],
      ["synergy", "noun", "Combined effort greater than parts"],
      ["onboarding", "noun", "Process of integrating a new employee"],
      ["scalable", "adjective", "Able to grow without breaking"],
      ["actionable", "adjective", "Clear enough to act on"],
      ["alignment", "noun", "Shared understanding of goals"],
      ["iterate", "verb", "Improve through repeated cycles"],
      ["prioritize", "verb", "Order tasks by importance"],
    ],
  },
  {
    id: "nature",
    title: "Nature and landscape words",
    teaser: "canopy, estuary, plateau",
    words: [
      ["canopy", "noun", "The upper layer of forest branches"],
      ["estuary", "noun", "Where a river meets the sea"],
      ["plateau", "noun", "A flat elevated landform"],
      ["meander", "verb", "Follow a winding course"],
      ["torrent", "noun", "A fast and violent stream"],
      ["glade", "noun", "An open space in a forest"],
      ["precipice", "noun", "A very steep cliff"],
      ["tempest", "noun", "A violent storm"],
      ["zephyr", "noun", "A soft gentle breeze"],
      ["verdure", "noun", "Green vegetation"],
    ],
  },
  {
    id: "character-traits",
    title: "Character trait words",
    teaser: "tenacious, magnanimous, petulant",
    words: [
      ["tenacious", "adjective", "Persistent and determined"],
      ["magnanimous", "adjective", "Generous in forgiving"],
      ["petulant", "adjective", "Childishly sulky or irritable"],
      ["gregarious", "adjective", "Sociable and outgoing"],
      ["taciturn", "adjective", "Reserved and quiet"],
      ["sagacious", "adjective", "Wise and perceptive"],
      ["capricious", "adjective", "Unpredictably changeable"],
      ["stoic", "adjective", "Enduring pain without complaint"],
      ["obstinate", "adjective", "Stubbornly refusing to change"],
      ["benevolent", "adjective", "Kind and well-meaning"],
    ],
  },
  {
    id: "time-change",
    title: "Words about time and change",
    teaser: "ephemeral, inexorable, evolve",
    words: [
      ["ephemeral", "adjective", "Lasting a very short time"],
      ["inexorable", "adjective", "Impossible to stop"],
      ["evolve", "verb", "Develop gradually over time"],
      ["obsolete", "adjective", "No longer in use"],
      ["transient", "adjective", "Lasting only briefly"],
      ["perpetual", "adjective", "Never ending or changing"],
      ["culminate", "verb", "Reach a final climax"],
      ["waning", "adjective", "Becoming gradually less"],
      ["nascent", "adjective", "Just beginning to develop"],
      ["epoch", "noun", "A distinctive period in history"],
    ],
  },
];

const collectionOut = `export interface CollectionWord {
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

export const WORD_COLLECTIONS: WordCollection[] = ${JSON.stringify(
  collections.map((c) => ({
    id: c.id,
    title: c.title,
    teaser: c.teaser,
    words: c.words.map(([word, partOfSpeech, definition]) => ({ word, partOfSpeech, definition })),
  })),
  null,
  2,
)};

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
`;

fs.writeFileSync(path.join(root, "src/constants/wordCollections.ts"), collectionOut);
console.log("Generated", entries.length, "words of the day and", collections.length, "collections");
