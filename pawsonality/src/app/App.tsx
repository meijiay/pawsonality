import { useState, useEffect } from "react";

type Screen = "landing" | "quiz" | "result" | "database" | "types";
type PetType = "cat" | "dog" | "rabbit" | "bird" | "hamster" | "other";

interface Option {
  text: string;
  emoji: string;
  pole: string;
  weight: 1 | 2;
}

interface Question {
  id: number;
  text: string;
  dimension: "EI" | "SN" | "TF" | "JP";
  options: [Option, Option, Option, Option];
}

interface PersonalityInfo {
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  traits: string[];
  color: string;
}

interface SavedResult {
  type: string;
  petName?: string;
  petType?: string;
  breed?: string;
  timestamp: string;
}

const DB_KEY = "pawsonality_results";

function loadResults(): SavedResult[] {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveResult(entry: SavedResult) {
  const existing = loadResults();
  localStorage.setItem(DB_KEY, JSON.stringify([...existing, entry]));
}

// ── Questions (4 options each, weighted 2 / 1 / 1 / 2) ──────────────────────

const questions: Question[] = [
  {
    id: 0, dimension: "EI",
    text: "When guests arrive at your home, your pet...",
    options: [
      { text: "Immediately rushes over and refuses to leave them alone", emoji: "🎉", pole: "E", weight: 2 },
      { text: "Approaches after a moment — curious but a little cautious", emoji: "🐾", pole: "E", weight: 1 },
      { text: "Peeks from across the room, maybe hides soon after", emoji: "👁️", pole: "I", weight: 1 },
      { text: "Gone. Completely vanished until every guest has left", emoji: "💨", pole: "I", weight: 2 },
    ],
  },
  {
    id: 1, dimension: "EI",
    text: "After a big play session, your pet...",
    options: [
      { text: "Immediately brings another toy — round two, right now", emoji: "🧸", pole: "E", weight: 2 },
      { text: "Rests briefly, then comes back wanting more", emoji: "⚡", pole: "E", weight: 1 },
      { text: "Takes a long nap, content and satisfied", emoji: "😴", pole: "I", weight: 1 },
      { text: "Disappears to their sanctuary for the rest of the day", emoji: "🌙", pole: "I", weight: 2 },
    ],
  },
  {
    id: 2, dimension: "EI",
    text: "In a brand-new environment, your pet...",
    options: [
      { text: "Immediately sprints off to explore every corner", emoji: "🔍", pole: "E", weight: 2 },
      { text: "Cautiously investigates, growing bolder as they go", emoji: "🗺️", pole: "E", weight: 1 },
      { text: "Explores slowly, retreating if anything startles them", emoji: "🐢", pole: "I", weight: 1 },
      { text: "Freezes and refuses to move until they feel completely safe", emoji: "🪨", pole: "I", weight: 2 },
    ],
  },
  {
    id: 3, dimension: "SN",
    text: "What your pet loves to investigate most is...",
    options: [
      { text: "Every smell, texture, and taste they can get to", emoji: "👃", pole: "S", weight: 2 },
      { text: "Familiar toys and objects they already know and trust", emoji: "🧩", pole: "S", weight: 1 },
      { text: "Sounds and movements just beyond their reach", emoji: "👂", pole: "N", weight: 1 },
      { text: "Shadows, reflections, and things only they can see", emoji: "✨", pole: "N", weight: 2 },
    ],
  },
  {
    id: 4, dimension: "SN",
    text: "When trying to reach a treat that's out of reach, your pet...",
    options: [
      { text: "Uses the exact same trick every single time", emoji: "🔁", pole: "S", weight: 2 },
      { text: "Tries their usual approach with small tweaks", emoji: "🔧", pole: "S", weight: 1 },
      { text: "Experiments with several different methods each time", emoji: "🧪", pole: "N", weight: 1 },
      { text: "Invents completely unpredictable new strategies every time", emoji: "💡", pole: "N", weight: 2 },
    ],
  },
  {
    id: 5, dimension: "SN",
    text: "Your pet seems most fascinated by...",
    options: [
      { text: "Food, tangible objects, and anything they can chew", emoji: "🍗", pole: "S", weight: 2 },
      { text: "Their favorite toys and the familiar scents of home", emoji: "🏠", pole: "S", weight: 1 },
      { text: "Moving things, sudden sounds, and unpredictable stimuli", emoji: "💫", pole: "N", weight: 1 },
      { text: "The invisible: wind, smells from outside, imaginary prey", emoji: "🌬️", pole: "N", weight: 2 },
    ],
  },
  {
    id: 6, dimension: "TF",
    text: "When you're feeling sad or upset, your pet...",
    options: [
      { text: "Carries on completely unbothered — business as usual", emoji: "😐", pole: "T", weight: 2 },
      { text: "Glances over briefly, then goes back to what they were doing", emoji: "🤔", pole: "T", weight: 1 },
      { text: "Comes and sits nearby, keeping you quiet company", emoji: "🪑", pole: "F", weight: 1 },
      { text: "Immediately rushes over to comfort you with full cuddle mode", emoji: "🫂", pole: "F", weight: 2 },
    ],
  },
  {
    id: 7, dimension: "TF",
    text: "Your pet follows the house rules because...",
    options: [
      { text: "Pure calculation — they've mapped out exactly what earns rewards", emoji: "🧮", pole: "T", weight: 2 },
      { text: "It's practical — rules usually lead to something good anyway", emoji: "📋", pole: "T", weight: 1 },
      { text: "They want to avoid tension and keep things peaceful", emoji: "☮️", pole: "F", weight: 1 },
      { text: "They genuinely want to make you happy — your joy is theirs", emoji: "❤️", pole: "F", weight: 2 },
    ],
  },
  {
    id: 8, dimension: "TF",
    text: "During play, your pet is most focused on...",
    options: [
      { text: "Winning — catching the toy, solving the puzzle, conquering it", emoji: "🏆", pole: "T", weight: 2 },
      { text: "Playing hard, but takes breaks to check in with you", emoji: "⚖️", pole: "T", weight: 1 },
      { text: "Enjoying the game but clearly prefers being near you", emoji: "🤝", pole: "F", weight: 1 },
      { text: "Just being close to you — the toy is simply an excuse", emoji: "💞", pole: "F", weight: 2 },
    ],
  },
  {
    id: 9, dimension: "JP",
    text: "Your pet's daily schedule is...",
    options: [
      { text: "Clockwork precision — same times, same places, every single day", emoji: "⏰", pole: "J", weight: 2 },
      { text: "Mostly consistent with a few small detours now and then", emoji: "📅", pole: "J", weight: 1 },
      { text: "Loosely routine but happily flexible when things shift", emoji: "🌊", pole: "P", weight: 1 },
      { text: "A complete mystery — totally unpredictable, every single day", emoji: "🎲", pole: "P", weight: 2 },
    ],
  },
  {
    id: 10, dimension: "JP",
    text: "When their routine gets disrupted, your pet...",
    options: [
      { text: "Visibly stressed and confused until order is fully restored", emoji: "😤", pole: "J", weight: 2 },
      { text: "Mildly annoyed but adapts within the hour", emoji: "🌤️", pole: "J", weight: 1 },
      { text: "Notices the change but rolls with it without much fuss", emoji: "🤷", pole: "P", weight: 1 },
      { text: "Barely registers it — already off on the next adventure", emoji: "🚀", pole: "P", weight: 2 },
    ],
  },
  {
    id: 11, dimension: "JP",
    text: "Your pet's preferred sleeping spot is...",
    options: [
      { text: "Always the exact same place — do not touch their blanket", emoji: "🛏️", pole: "J", weight: 2 },
      { text: "Usually the same spot, with occasional exceptions", emoji: "📍", pole: "J", weight: 1 },
      { text: "Rotates between a few familiar favorites", emoji: "🔄", pole: "P", weight: 1 },
      { text: "Somewhere completely new and unexpected every day", emoji: "🎯", pole: "P", weight: 2 },
    ],
  },
];

// ── Personalities ────────────────────────────────────────────────────────────

const personalities: Record<string, PersonalityInfo> = {
  ENFP: { name: "The Social Butterfly", emoji: "🦋", tagline: "Life of the pet party", description: "Your pet is pure enthusiasm in fur form! They make friends with everyone — humans, animals, even the mailman. No stranger is safe from their infectious joy. They live for connection and are always up for a spontaneous adventure.", traits: ["Friendly", "Enthusiastic", "Creative", "Excitable"], color: "#FF6B9D" },
  ENTP: { name: "The Mischief Maker", emoji: "🦊", tagline: "Always one paw ahead", description: "Clever and endlessly curious, your pet has probably figured out how to open the treat cabinet. They love bending the rules — and charming their way out of any trouble that follows.", traits: ["Clever", "Curious", "Inventive", "Chaotic"], color: "#FF9F43" },
  ENFJ: { name: "The Pack Leader", emoji: "🦁", tagline: "Heart of the whole household", description: "Your pet has a gift for bringing everyone together. They check on each family member, mediate pet disputes, and make sure everyone gets their share of warmth. A natural leader with an enormous heart.", traits: ["Warm", "Empathetic", "Organized", "Protective"], color: "#FF6348" },
  ENTJ: { name: "The Alpha", emoji: "🐉", tagline: "Born to be in charge", description: "Your pet runs a tight ship. They have a schedule, a territory, and a clear hierarchy — and you're all part of their plan. Strategic, decisive, and always watching. The boss life chose them.", traits: ["Commanding", "Strategic", "Bold", "Decisive"], color: "#5352ED" },
  INFP: { name: "The Dreamer", emoji: "🌙", tagline: "Lost in their own magical world", description: "Your pet is a gentle, sensitive soul who finds wonder in the smallest things — a sunbeam, a floating dust mote, the scent of rain. They bond deeply with their chosen few and guard their inner world carefully.", traits: ["Gentle", "Sensitive", "Creative", "Idealistic"], color: "#A29BFE" },
  INTP: { name: "The Observer", emoji: "🦉", tagline: "Analyzing everything from afar", description: "Your pet has studied you. They know your patterns, weaknesses, and schedule. They appear disinterested but miss absolutely nothing. Content to watch from their perch, they strike at exactly the right moment.", traits: ["Analytical", "Independent", "Precise", "Reserved"], color: "#00B894" },
  INFJ: { name: "The Empath", emoji: "🦢", tagline: "They always know how you feel", description: "Your pet has an uncanny ability to sense your emotions. They appear when you're sad, give you space when you need it, and always know the perfect moment to curl up next to you. Rare, mysterious, deeply connected.", traits: ["Intuitive", "Devoted", "Gentle", "Mysterious"], color: "#6C5CE7" },
  INTJ: { name: "The Strategist", emoji: "🐈‍⬛", tagline: "Three steps ahead of everyone", description: "Your pet has a plan. They have mapped every corner of your home, identified the best vantage points, and calculated exactly when you will give in and give them treats. Independent, brilliant, slightly intimidating.", traits: ["Strategic", "Independent", "Intelligent", "Composed"], color: "#2D3436" },
  ESFP: { name: "The Party Animal", emoji: "🎉", tagline: "Every moment is a celebration", description: "Your pet brings the energy wherever they go. Spontaneous, joyful, and completely in love with life, they turn a quiet Tuesday into an event. They are the reason you cannot stay in a bad mood for more than five minutes.", traits: ["Fun-loving", "Spontaneous", "Energetic", "Loving"], color: "#FDCB6E" },
  ESTP: { name: "The Daredevil", emoji: "🐆", tagline: "Leap first, think later", description: "Your pet lives on the edge — literally. They launch from the highest shelf, sprint at full speed for no reason, and investigate danger with zero hesitation. Bold, fearless, and magnetic to watch.", traits: ["Bold", "Athletic", "Impulsive", "Fearless"], color: "#E17055" },
  ESFJ: { name: "The Caretaker", emoji: "🐕", tagline: "Making sure everyone is okay", description: "Your pet is the glue that holds the household together. They check on everyone, alert you to anything unusual, and ensure no one is left out. Happiest when the whole family is together and comfortable.", traits: ["Loyal", "Nurturing", "Social", "Reliable"], color: "#00CEC9" },
  ESTJ: { name: "The Boss", emoji: "🐻", tagline: "Running this household since day one", description: "Your pet has rules, routines, and very clear expectations — mostly for you. They will remind you when it is dinner time, wake you up on schedule, and enforce the pecking order. Reliable, direct, completely in charge.", traits: ["Organized", "Assertive", "Traditional", "Dependable"], color: "#636E72" },
  ISFP: { name: "The Wanderer", emoji: "🌿", tagline: "Beauty lives in the small moments", description: "Your pet is quietly artistic. They find deep joy in textures, sun patches, and the perfect napping spot. Independent but deeply affectionate with those they trust. A quiet soul with rich inner depths.", traits: ["Gentle", "Curious", "Artistic", "Free-spirited"], color: "#00B894" },
  ISTP: { name: "The Lone Ranger", emoji: "🐺", tagline: "Self-sufficient and quietly formidable", description: "Your pet does not need you — but they choose to keep you around. Highly capable of solving problems on their own, they prefer observation over participation. When they show affection, it means everything.", traits: ["Independent", "Resourceful", "Quiet", "Skilled"], color: "#74B9FF" },
  ISFJ: { name: "The Guardian", emoji: "🐇", tagline: "Watching over everyone they love", description: "Your pet has quietly appointed themselves the family protector. They remember everyone's routine, notice when something is off, and alert the household to any anomaly. Devoted, steadfast, full of quiet enduring love.", traits: ["Protective", "Loyal", "Observant", "Steadfast"], color: "#FD79A8" },
  ISTJ: { name: "The Sentinel", emoji: "🐢", tagline: "Creature of beautiful, sacred habit", description: "Your pet has sacred routines. Same meal time, same nap spot, same patrol path every day. Change is an affront. Reliability is their love language, and they enforce the schedule with quiet unyielding resolve.", traits: ["Dependable", "Consistent", "Thorough", "Serious"], color: "#B2BEC3" },
};

const petTypes: { id: PetType; label: string; emoji: string }[] = [
  { id: "cat", label: "Cat", emoji: "🐱" },
  { id: "dog", label: "Dog", emoji: "🐶" },
  { id: "rabbit", label: "Rabbit", emoji: "🐰" },
  { id: "bird", label: "Bird", emoji: "🦜" },
  { id: "hamster", label: "Hamster", emoji: "🐹" },
  { id: "other", label: "Other", emoji: "🐾" },
];

const breedPlaceholders: Record<PetType, string> = {
  cat: "e.g. Siamese, Maine Coon, Tabby...",
  dog: "e.g. Labrador, Poodle, Husky...",
  rabbit: "e.g. Holland Lop, Lionhead...",
  bird: "e.g. Budgerigar, Cockatiel...",
  hamster: "e.g. Syrian, Dwarf, Roborovski...",
  other: "Tell us what kind!",
};

const OPTION_COLORS = ["#FF4757", "#FF9F43", "#1DD1A1", "#9B5DE5"];
const OPTION_LABELS = ["A", "B", "C", "D"];

const dimensionLabels: Record<string, { a: string; b: string; label: string }> = {
  EI: { a: "Extroverted", b: "Introverted", label: "Energy Style" },
  SN: { a: "Sensory", b: "Intuitive", label: "Perception" },
  TF: { a: "Thinking", b: "Feeling", label: "Decision Making" },
  JP: { a: "Structured", b: "Spontaneous", label: "Lifestyle" },
};

// ── Trait continuum bar ──────────────────────────────────────────────────────

function TraitBar({
  leftLabel,
  rightLabel,
  leftScore,
  rightScore,
  color,
}: {
  leftLabel: string;
  rightLabel: string;
  leftScore: number;
  rightScore: number;
  color: string;
}) {
  const total = leftScore + rightScore;
  const rightPct = total === 0 ? 50 : Math.round((rightScore / total) * 100);
  const leftPct = 100 - rightPct;
  const winningRight = rightPct >= leftPct;
  const winningLabel = winningRight ? rightLabel : leftLabel;
  const winningPct = winningRight ? rightPct : leftPct;

  return (
    <div>
      <div className="text-center mb-2.5">
        <span className="font-['Nunito'] font-bold text-xl" style={{ color }}>
          {winningPct}%
        </span>{" "}
        <span className="font-['Nunito'] font-bold text-xl text-[#1A1A2E]">{winningLabel}</span>
      </div>
      <div className="relative h-3 rounded-full" style={{ backgroundColor: color }}>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full border-[3px] shadow-sm"
          style={{ left: `${rightPct}%`, borderColor: color }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="font-['Nunito'] text-sm text-[#1A1A2E]/55">{leftLabel}</span>
        <span className="font-['Nunito'] text-sm text-[#1A1A2E]/55">{rightLabel}</span>
      </div>
    </div>
  );
}

// ── Background shapes ────────────────────────────────────────────────────────

function MemphisShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#FFD32A] opacity-20" />
      <div className="absolute top-16 right-[-40px] w-40 h-40 bg-[#FF4757] opacity-12 rotate-12" />
      <div className="absolute bottom-1/3 left-[-30px] w-28 h-28 rounded-full bg-[#9B5DE5] opacity-18" />
      <div className="absolute bottom-[-20px] right-16 w-52 h-52 bg-[#1DD1A1] opacity-12 rotate-45" />
      <div className="absolute top-1/2 right-[-15px] w-20 h-20 rounded-full bg-[#FF9F43] opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-5 h-5 rounded-full bg-[#FF4757] opacity-35" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-[#FFD32A] opacity-45" />
      <div className="absolute bottom-1/4 left-1/3 w-4 h-4 rounded-full bg-[#9B5DE5] opacity-30" />
      <div className="absolute bottom-1/3 right-1/3 w-7 h-7 bg-[#FF9F43] opacity-18 rotate-12" />
      <div className="absolute top-[15%] right-[12%] w-10 h-10 border-4 border-[#FF4757]/25 rounded-full" />
      <div className="absolute bottom-[18%] left-[8%] w-8 h-8 border-4 border-[#9B5DE5]/25 rotate-45" />
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selecting, setSelecting] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // optional save fields on result screen
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState<PetType | null>(null);
  const [breedInput, setBreedInput] = useState("");
  const [resultSaved, setResultSaved] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);

  const [dbResults, setDbResults] = useState<SavedResult[]>([]);
  const [dbView, setDbView] = useState<"personality" | "breed">("personality");
  const [dbSearch, setDbSearch] = useState("");
  const [dbSort, setDbSort] = useState<"count" | "az">("count");

  useEffect(() => {
    if (screen === "database") {
      setDbResults(loadResults());
      setDbSearch("");
      setDbView("personality");
    }
  }, [screen]);

  const handleAnswer = (idx: number) => {
    if (selecting) return;
    setSelecting(true);
    setSelectedIdx(idx);
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQ]: idx };
      setAnswers(newAnswers);
      setSelecting(false);
      setSelectedIdx(null);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setScreen("result");
      }
    }, 350);
  };

  const goBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setSelectedIdx(null);
      setSelecting(false);
    }
  };

  const calculateType = (): string => {
    const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    questions.forEach((q, idx) => {
      const ansIdx = answers[idx];
      if (ansIdx === undefined) return;
      const opt = q.options[ansIdx];
      scores[opt.pole] = (scores[opt.pole] || 0) + opt.weight;
    });
    return `${scores.E >= scores.I ? "E" : "I"}${scores.S >= scores.N ? "S" : "N"}${scores.T >= scores.F ? "T" : "F"}${scores.J >= scores.P ? "J" : "P"}`;
  };

  const handleSaveResult = () => {
    const entry: SavedResult = {
      type: calculateType(),
      timestamp: new Date().toISOString(),
      ...(petName.trim() && { petName: petName.trim() }),
      ...(petType && { petType }),
      ...(breedInput.trim() && { breed: breedInput.trim() }),
    };
    saveResult(entry);
    setResultSaved(true);
  };

  const restart = () => {
    setScreen("landing");
    setCurrentQ(0);
    setAnswers({});
    setSelecting(false);
    setSelectedIdx(null);
    setPetName("");
    setPetType(null);
    setBreedInput("");
    setResultSaved(false);
    setShowSaveForm(false);
  };

  const handleShare = (type: string, personality: PersonalityInfo) => {
    const text = `My pet is ${type} — ${personality.name}! "${personality.tagline}" 🐾 Take the PawsonalityTest!`;
    if (navigator.share) {
      navigator.share({ title: "PawsonalityTest Result", text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  // ── Landing ────────────────────────────────────────────────────────────────
  if (screen === "landing") {
    return (
      <div className="min-h-screen bg-[#FFF9F0] relative flex flex-col items-center justify-center px-4 py-16">
        <MemphisShapes />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="inline-flex items-center gap-2 bg-white border-2 border-[#1A1A2E]/10 rounded-full px-4 py-2 mb-8 shadow-sm">
            <span>🐾</span>
            <span className="font-['Righteous'] text-sm text-[#1A1A2E]/55 tracking-[0.15em] uppercase">PawsonalityTest</span>
          </div>

          <h1 className="font-['Righteous'] text-5xl md:text-6xl text-[#1A1A2E] leading-[1.05] mb-4">
            What's Your<br />Pet's <span className="text-[#FF4757]">Type?</span>
          </h1>
          <p className="font-['Nunito'] text-lg text-[#1A1A2E]/60 mb-12 leading-relaxed">
            12 fun questions. One perfect personality match.<br />
            Discover the <em>science</em> behind their chaos.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-3">
            <button
              onClick={() => setScreen("quiz")}
              className="flex-1 group bg-[#FF4757] text-white rounded-2xl py-5 px-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <div className="font-['Righteous'] text-2xl mb-1">Take the Quiz</div>
              <div className="font-['Nunito'] text-base opacity-80">~3 minutes · 12 questions</div>
            </button>

            <button
              onClick={() => setScreen("database")}
              className="flex-1 group bg-white border-2 border-[#1A1A2E]/12 text-[#1A1A2E] rounded-2xl py-5 px-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <div className="font-['Righteous'] text-2xl mb-1">Browse Results</div>
              <div className="font-['Nunito'] text-base text-[#1A1A2E]/60">See how other pets scored</div>
            </button>
          </div>

          <button
            onClick={() => setScreen("types")}
            className="w-full group bg-white border-2 border-[#1A1A2E]/12 text-[#1A1A2E] rounded-2xl py-4 px-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-between"
          >
            <div className="text-left">
              <div className="font-['Righteous'] text-xl">All 16 Personalities</div>
              <div className="font-['Nunito'] text-sm text-[#1A1A2E]/55">Explore every possible type your pet could be</div>
            </div>
            <span className="text-2xl ml-4">🦎🐺🦋🐈‍⬛</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  if (screen === "quiz") {
    const q = questions[currentQ];
    const dimInfo = dimensionLabels[q.dimension];
    const progress = (currentQ / questions.length) * 100;

    return (
      <div className="min-h-screen bg-[#FFF9F0] relative flex flex-col items-center justify-center px-4 py-12">
        <MemphisShapes />
        <div className="relative z-10 w-full max-w-md">
          <div className="flex items-center justify-between mb-3">
            {currentQ > 0 ? (
              <button
                onClick={goBack}
                className="font-['Nunito'] text-sm font-bold text-[#1A1A2E]/45 hover:text-[#1A1A2E]/70 transition-colors uppercase tracking-wider"
              >
                ← Back
              </button>
            ) : (
              <span className="w-16" />
            )}
            <span className="font-['Righteous'] text-base text-[#1A1A2E]/50">
              {currentQ + 1} / {questions.length}
            </span>
            <button
              onClick={restart}
              className="font-['Nunito'] text-sm font-bold text-[#1A1A2E]/45 hover:text-[#FF4757] transition-colors uppercase tracking-wider"
            >
              🏠 Home
            </button>
          </div>

          <div className="h-3 bg-[#1A1A2E]/8 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-[#FF4757] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="inline-flex items-center gap-2 bg-white border-2 border-[#1A1A2E]/10 rounded-full px-4 py-2 mb-4 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF4757]" />
            <span className="font-['Nunito'] font-bold text-sm text-[#1A1A2E]/60 uppercase tracking-wider">
              {dimInfo.label}: {dimInfo.a} vs {dimInfo.b}
            </span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-[#1A1A2E]/10 p-6 mb-4 shadow-sm">
            <h2 className="font-['Righteous'] text-3xl text-[#1A1A2E] leading-snug">{q.text}</h2>
          </div>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, idx) => {
              const previousAnswer = answers[currentQ];
              const isSelected = selectedIdx === idx || (selectedIdx === null && previousAnswer === idx);
              const color = OPTION_COLORS[idx];
              const label = OPTION_LABELS[idx];
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selecting}
                  className="w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-default"
                  style={
                    isSelected
                      ? { borderColor: color, backgroundColor: `${color}12` }
                      : { borderColor: "rgba(26,26,46,0.1)", backgroundColor: "white" }
                  }
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="font-['Righteous'] text-base rounded-lg w-9 h-9 flex items-center justify-center shrink-0 transition-all duration-200"
                      style={
                        isSelected
                          ? { color, backgroundColor: `${color}22` }
                          : { color: "#1A1A2E99", backgroundColor: "#1A1A2E0D" }
                      }
                    >
                      {label}
                    </span>
                    <div className="flex-1 pt-1">
                      <span className="mr-1.5">{opt.emoji}</span>
                      <span className="font-['Nunito'] text-base text-[#1A1A2E] leading-snug">{opt.text}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="font-['Nunito'] text-center text-sm text-[#1A1A2E]/40 mt-5">
            Pick the option that best describes your pet's most typical behavior ✨
          </p>
        </div>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (screen === "result") {
    const personalityType = calculateType();
    const personality = personalities[personalityType];

    return (
      <div className="min-h-screen bg-[#FFF9F0] relative flex flex-col items-center justify-center px-4 py-16">
        <MemphisShapes />
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-5">
            <span className="font-['Nunito'] font-bold text-sm text-[#1A1A2E]/45 uppercase tracking-widest">
              🎊 Results Are In
            </span>
          </div>

          <div className="bg-white rounded-3xl border-2 border-[#1A1A2E]/10 overflow-hidden shadow-xl mb-4">
            {/* Colored header */}
            <div className="relative p-8 text-white overflow-hidden" style={{ backgroundColor: personality.color }}>
              <div className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute bottom-[-40px] left-[-20px] w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute top-8 right-8 w-6 h-6 rounded-full bg-white/20" />
              <div className="relative z-10">
                <div className="text-7xl mb-3 leading-none">{personality.emoji}</div>
                <div className="font-['Righteous'] text-7xl leading-none mb-2 tracking-tight">{personalityType}</div>
                <div className="font-['Righteous'] text-2xl mb-2 opacity-90">{personality.name}</div>
                <div className="font-['Nunito'] text-base opacity-80 italic">"{personality.tagline}"</div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="font-['Nunito'] text-[#1A1A2E]/75 leading-relaxed text-lg mb-5">
                {personality.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {personality.traits.map((trait) => (
                  <span
                    key={trait}
                    className="font-['Nunito'] font-bold text-sm px-4 py-2 rounded-full"
                    style={{ backgroundColor: `${personality.color}18`, color: personality.color, border: `1.5px solid ${personality.color}30` }}
                  >
                    {trait}
                  </span>
                ))}
              </div>

              {/* Trait continuum scales */}
              {(() => {
                const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
                questions.forEach((q, idx) => {
                  const ansIdx = answers[idx];
                  if (ansIdx === undefined) return;
                  const opt = q.options[ansIdx];
                  scores[opt.pole] = (scores[opt.pole] || 0) + opt.weight;
                });
                return (
                  <div className="mb-6 flex flex-col gap-5 bg-[#FFF9F0] rounded-2xl p-5 border-2 border-[#1A1A2E]/8">
                    <TraitBar leftLabel="Extroverted" rightLabel="Introverted" leftScore={scores.E} rightScore={scores.I} color="#1DD1A1" />
                    <TraitBar leftLabel="Sensory"     rightLabel="Intuitive"   leftScore={scores.S} rightScore={scores.N} color="#FF9F43" />
                    <TraitBar leftLabel="Thinking"    rightLabel="Feeling"     leftScore={scores.T} rightScore={scores.F} color="#00B894" />
                    <TraitBar leftLabel="Structured"  rightLabel="Spontaneous" leftScore={scores.J} rightScore={scores.P} color="#9B5DE5" />
                  </div>
                );
              })()}

              {/* Optional save section */}
              {resultSaved ? (
                <div className="bg-[#1DD1A1]/10 border-2 border-[#1DD1A1]/30 rounded-2xl p-4">
                  <div className="font-['Nunito'] font-bold text-[#1DD1A1] flex items-center gap-2 text-base mb-3">
                    <span className="text-lg">✓</span> Result saved to the database! Thanks 🎉
                  </div>
                  <button
                    onClick={() => setScreen("database")}
                    className="w-full font-['Nunito'] font-bold text-base py-3 rounded-xl border-2 border-[#1DD1A1]/40 text-[#1DD1A1] hover:bg-[#1DD1A1]/10 transition-all"
                  >
                    Browse community results →
                  </button>
                </div>
              ) : showSaveForm ? (
                <div className="bg-[#FFF9F0] rounded-2xl p-5 border-2 border-[#1A1A2E]/10">
                  <div className="font-['Nunito'] font-bold text-base text-[#1A1A2E] mb-1">
                    Add your pet's info (optional)
                  </div>
                  <div className="font-['Nunito'] text-sm text-[#1A1A2E]/50 mb-4 leading-relaxed">
                    All fields are optional. We use this to find which types are most common by breed.
                  </div>

                  <div className="flex flex-col gap-3 mb-4">
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="Pet's name (optional)"
                      className="w-full font-['Nunito'] text-base bg-white rounded-xl px-4 py-3 border-2 border-[#1A1A2E]/10 focus:outline-none focus:border-[#FF4757] transition-colors"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      {petTypes.map((pt) => (
                        <button
                          key={pt.id}
                          onClick={() => setPetType(petType === pt.id ? null : pt.id)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-sm font-['Nunito'] font-bold ${
                            petType === pt.id
                              ? "border-[#FF4757] bg-[#FF4757]/8 text-[#FF4757]"
                              : "border-[#1A1A2E]/10 bg-white text-[#1A1A2E]/55 hover:border-[#FF4757]/40"
                          }`}
                        >
                          <span className="text-2xl">{pt.emoji}</span>
                          <span>{pt.label}</span>
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={breedInput}
                      onChange={(e) => setBreedInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveResult()}
                      placeholder={petType ? breedPlaceholders[petType] : "Breed (optional)"}
                      className="w-full font-['Nunito'] text-base bg-white rounded-xl px-4 py-3 border-2 border-[#1A1A2E]/10 focus:outline-none focus:border-[#FF4757] transition-colors"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSaveForm(false)}
                      className="font-['Nunito'] font-bold text-base px-5 py-3 rounded-xl border-2 border-[#1A1A2E]/12 text-[#1A1A2E]/45 hover:text-[#1A1A2E]/70 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveResult}
                      className="flex-1 font-['Nunito'] font-bold text-base py-3 rounded-xl bg-[#FF4757] text-white hover:bg-[#FF4757]/85 transition-all active:scale-95"
                    >
                      Save to Database
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="w-full font-['Nunito'] font-bold text-base py-4 rounded-2xl border-2 border-dashed border-[#1A1A2E]/15 text-[#1A1A2E]/50 hover:border-[#FF4757]/40 hover:text-[#FF4757] transition-all"
                >
                  + Save result to the community database
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={restart}
              className="flex-1 font-['Righteous'] text-lg py-4 rounded-2xl border-2 border-[#1A1A2E]/15 text-[#1A1A2E]/55 hover:border-[#1A1A2E]/30 hover:text-[#1A1A2E] transition-all"
            >
              🏠 Main Menu
            </button>
            <button
              onClick={() => handleShare(personalityType, personality)}
              className="flex-1 font-['Righteous'] text-lg py-4 rounded-2xl bg-[#1A1A2E] text-white hover:bg-[#1A1A2E]/85 transition-all active:scale-[0.98]"
            >
              Share ↗
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── All Types ──────────────────────────────────────────────────────────────
  if (screen === "types") {
    const typeList = Object.entries(personalities);
    return (
      <div className="min-h-screen bg-[#FFF9F0] relative px-4 py-12">
        <MemphisShapes />
        <div className="relative z-10 w-full max-w-2xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setScreen("landing")}
              className="font-['Nunito'] font-bold text-sm text-[#1A1A2E]/45 hover:text-[#1A1A2E]/70 transition-colors uppercase tracking-wider"
            >
              ← Home
            </button>
            <div className="inline-flex items-center gap-2 bg-white border-2 border-[#1A1A2E]/10 rounded-full px-3.5 py-1.5 shadow-sm">
              <span>🐾</span>
              <span className="font-['Righteous'] text-sm text-[#1A1A2E]/55 tracking-wider uppercase">PawsonalityTest</span>
            </div>
          </div>

          <h2 className="font-['Righteous'] text-4xl text-[#1A1A2E] mb-1">All 16 Personalities</h2>
          <p className="font-['Nunito'] text-base text-[#1A1A2E]/55 mb-8 leading-relaxed">
            Every pet is one of these types. Which one sounds like yours?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {typeList.map(([type, p]) => (
              <div
                key={type}
                className="bg-white rounded-2xl border-2 border-[#1A1A2E]/8 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Color strip */}
                <div
                  className="relative px-5 py-4 text-white overflow-hidden"
                  style={{ backgroundColor: p.color }}
                >
                  <div className="absolute top-[-16px] right-[-16px] w-20 h-20 rounded-full bg-white/10" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <div className="font-['Righteous'] text-3xl leading-none">{type}</div>
                      <div className="font-['Righteous'] text-base opacity-90 mt-0.5">{p.name}</div>
                    </div>
                    <span className="text-4xl">{p.emoji}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  <p className="font-['Nunito'] text-sm text-[#1A1A2E]/60 italic mb-3 leading-snug">
                    "{p.tagline}"
                  </p>
                  <p className="font-['Nunito'] text-sm text-[#1A1A2E]/70 leading-relaxed mb-3">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.traits.map((trait) => (
                      <span
                        key={trait}
                        className="font-['Nunito'] font-bold text-xs px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${p.color}18`, color: p.color, border: `1.5px solid ${p.color}30` }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setScreen("quiz")}
            className="w-full font-['Righteous'] text-lg py-4 rounded-2xl bg-[#FF4757] text-white hover:bg-[#FF4757]/85 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Find Your Pet's Type →
          </button>
        </div>
      </div>
    );
  }

  // ── Database ───────────────────────────────────────────────────────────────
  const typeCounts: Record<string, number> = {};
  dbResults.forEach((r) => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1; });
  const maxCount = Math.max(...Object.values(typeCounts), 1);

  const searchLC = dbSearch.toLowerCase().trim();

  // Personality view: filter by type code or name, then sort
  const filteredTypes = Object.keys(personalities).filter((type) => {
    if (!searchLC) return true;
    const p = personalities[type];
    return type.toLowerCase().includes(searchLC) || p.name.toLowerCase().includes(searchLC);
  });
  const sortedTypes = [...filteredTypes].sort((a, b) =>
    dbSort === "count"
      ? (typeCounts[b] || 0) - (typeCounts[a] || 0)
      : a.localeCompare(b)
  );

  // Breed view: group by breed (case-insensitive), count types per breed
  const breedMap: Record<string, { count: number; types: Record<string, number> }> = {};
  dbResults.forEach((r) => {
    if (!r.breed) return;
    const key = r.breed.trim().toLowerCase();
    if (!breedMap[key]) breedMap[key] = { count: 0, types: {} };
    breedMap[key].count++;
    breedMap[key].types[r.type] = (breedMap[key].types[r.type] || 0) + 1;
  });
  const breedEntries = Object.entries(breedMap)
    .filter(([key]) => !searchLC || key.includes(searchLC))
    .sort((a, b) => dbSort === "count" ? b[1].count - a[1].count : a[0].localeCompare(b[0]));

  // Capitalise breed key for display
  const displayBreed = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

  return (
    <div className="min-h-screen bg-[#FFF9F0] relative px-4 py-12">
      <MemphisShapes />
      <div className="relative z-10 w-full max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setScreen("landing")}
            className="font-['Nunito'] font-bold text-sm text-[#1A1A2E]/45 hover:text-[#1A1A2E]/70 transition-colors uppercase tracking-wider"
          >
            ← Home
          </button>
          <div className="inline-flex items-center gap-2 bg-white border-2 border-[#1A1A2E]/10 rounded-full px-3.5 py-1.5 shadow-sm">
            <span>🐾</span>
            <span className="font-['Righteous'] text-sm text-[#1A1A2E]/55 tracking-wider uppercase">PawsonalityTest</span>
          </div>
        </div>

        <h2 className="font-['Righteous'] text-4xl text-[#1A1A2E] mb-1">Community Results</h2>
        <p className="font-['Nunito'] text-[#1A1A2E]/55 text-base mb-6">
          {dbResults.length === 0
            ? "No results saved yet — be the first!"
            : `${dbResults.length} result${dbResults.length === 1 ? "" : "s"} from the community`}
        </p>

        {dbResults.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-[#1A1A2E]/10 p-10 text-center shadow-sm mb-6">
            <div className="text-5xl mb-3">🐾</div>
            <div className="font-['Righteous'] text-2xl text-[#1A1A2E] mb-2">No data yet</div>
            <p className="font-['Nunito'] text-base text-[#1A1A2E]/55 mb-5">
              Take the quiz and save your result to start the database!
            </p>
            <button
              onClick={() => setScreen("quiz")}
              className="font-['Righteous'] text-lg px-6 py-3 rounded-xl bg-[#FF4757] text-white hover:bg-[#FF4757]/85 transition-all"
            >
              Take the Quiz →
            </button>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
              {/* Search */}
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A2E]/30 text-base">🔍</span>
                <input
                  type="text"
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  placeholder={dbView === "personality" ? "Search by type or name..." : "Search by breed..."}
                  className="w-full font-['Nunito'] text-base bg-white rounded-xl pl-9 pr-3 py-3 border-2 border-[#1A1A2E]/10 focus:outline-none focus:border-[#FF4757] transition-colors"
                />
              </div>

              {/* View toggle */}
              <div className="flex bg-white border-2 border-[#1A1A2E]/10 rounded-xl overflow-hidden shrink-0">
                {(["personality", "breed"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => { setDbView(v); setDbSearch(""); }}
                    className={`font-['Nunito'] font-bold text-sm px-4 py-3 capitalize transition-all ${
                      dbView === v
                        ? "bg-[#1A1A2E] text-white"
                        : "text-[#1A1A2E]/45 hover:text-[#1A1A2E]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Sort toggle */}
              <div className="flex bg-white border-2 border-[#1A1A2E]/10 rounded-xl overflow-hidden shrink-0">
                {([["count", "# Count"], ["az", "A–Z"]] as const).map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => setDbSort(v)}
                    className={`font-['Nunito'] font-bold text-sm px-4 py-3 transition-all ${
                      dbSort === v
                        ? "bg-[#FF4757] text-white"
                        : "text-[#1A1A2E]/45 hover:text-[#1A1A2E]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Personality bar chart ── */}
            {dbView === "personality" && (
              <div className="bg-white rounded-2xl border-2 border-[#1A1A2E]/10 p-5 shadow-sm mb-5">
                {sortedTypes.length === 0 ? (
                  <p className="font-['Nunito'] text-base text-[#1A1A2E]/40 text-center py-4">No types match your search.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {sortedTypes.map((type) => {
                      const p = personalities[type];
                      const count = typeCounts[type] || 0;
                      const pct = Math.round((count / dbResults.length) * 100);
                      const barW = count ? `${(count / maxCount) * 100}%` : "0%";
                      return (
                        <div key={type} className="flex items-center gap-3 group">
                          {/* Label */}
                          <div className="w-32 shrink-0 flex items-center gap-2">
                            <span className="text-xl">{p.emoji}</span>
                            <div>
                              <div className="font-['Righteous'] text-base text-[#1A1A2E] leading-none">{type}</div>
                              <div className="font-['Nunito'] text-xs text-[#1A1A2E]/45 leading-tight truncate w-16">{p.name.replace("The ", "")}</div>
                            </div>
                          </div>
                          {/* Bar */}
                          <div className="flex-1 h-7 bg-[#1A1A2E]/6 rounded-lg overflow-hidden relative">
                            <div
                              className="h-full rounded-lg transition-all duration-700 ease-out"
                              style={{ width: barW, backgroundColor: p.color }}
                            />
                            {count > 0 && (
                              <span
                                className="absolute inset-y-0 left-2 flex items-center font-['Nunito'] font-bold text-xs text-white/90 leading-none"
                                style={{ opacity: count / maxCount > 0.25 ? 1 : 0 }}
                              >
                                {count} {count === 1 ? "pet" : "pets"}
                              </span>
                            )}
                          </div>
                          {/* Pct */}
                          <div className="w-10 shrink-0 font-['Nunito'] font-bold text-sm text-[#1A1A2E]/50 text-right">
                            {pct}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Breed view ── */}
            {dbView === "breed" && (
              <div className="bg-white rounded-2xl border-2 border-[#1A1A2E]/10 p-5 shadow-sm mb-5">
                {breedEntries.length === 0 ? (
                  <p className="font-['Nunito'] text-base text-[#1A1A2E]/40 text-center py-4">
                    {dbResults.filter((r) => r.breed).length === 0
                      ? "No breed data saved yet."
                      : "No breeds match your search."}
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {breedEntries.map(([key, data]) => {
                      return (
                        <div key={key} className="border-b border-[#1A1A2E]/6 last:border-0 pb-4 last:pb-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-['Righteous'] text-lg text-[#1A1A2E]">{displayBreed(key)}</span>
                            <span className="font-['Nunito'] text-sm text-[#1A1A2E]/40">
                              {data.count} {data.count === 1 ? "result" : "results"}
                            </span>
                          </div>
                          {/* Type breakdown bars */}
                          <div className="flex flex-col gap-1.5">
                            {Object.entries(data.types)
                              .sort((a, b) => b[1] - a[1])
                              .map(([type, cnt]) => {
                                const p = personalities[type];
                                const w = `${(cnt / data.count) * 100}%`;
                                return (
                                  <div key={type} className="flex items-center gap-2">
                                    <span className="font-['Righteous'] text-sm text-[#1A1A2E]/65 w-12 shrink-0">{type}</span>
                                    <div className="flex-1 h-5 bg-[#1A1A2E]/5 rounded overflow-hidden">
                                      <div
                                        className="h-full rounded transition-all duration-500"
                                        style={{ width: w, backgroundColor: p?.color || "#ccc" }}
                                      />
                                    </div>
                                    <span className="font-['Nunito'] text-sm text-[#1A1A2E]/50 w-5 text-right">{cnt}</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <button
          onClick={() => setScreen("quiz")}
          className="w-full font-['Righteous'] text-lg py-4 rounded-2xl bg-[#FF4757] text-white hover:bg-[#FF4757]/85 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Take the Quiz →
        </button>
      </div>
    </div>
  );
}
