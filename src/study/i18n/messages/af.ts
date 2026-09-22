import type { StudyMessages } from "@/study/i18n/types";

const encouragement = [
  "Jy kan dit doen.",
  "Een sessie op 'n slag.",
  "Klein stappe tel op.",
  "Kom ons maak vandag saam tell.",
];

export const af: StudyMessages = {
  locale: "af",
  langTag: "af-ZA",
  brand: { short: "12", full: "Studie-afrigter" },
  nav: {
    aria: "Studie-afrigter navigasie",
    home: "Tuis",
    subjects: "Vakke",
    practice: "Oefen",
    progress: "Vordering",
    profile: "Jy",
  },
  common: {
    back: "Terug",
    continue: "Gaan voort",
    start: "Begin",
    saving: "Stoor…",
    minutes: "min",
    mastery: "Hoe gaan dit",
    target: "Doel",
    days: "dae",
    daysUntil: (subject) => `dae tot ${subject}`,
    tryAgain: "Probeer weer",
    hmm: "Hmm…",
    soon: "Binnekort",
    nsc: "NSC",
    examStyle: "Eksamen-styl",
    quizzes: "Vasvrae",
    topicsSoon: "Binnekort",
    marksNowToGoal: (current, goal) => `Nou ${current}% → mik ${goal}%`,
    atPercent: (pct) => `Jy is op ongeveer ${pct}% hier`,
  },
  landing: {
    pill: "Graad 12 · Matriek",
    titleLine1: "Moenie stress nie.",
    titleLine2: "Ons sê vir jou wat volgende.",
    lead: "Sê vir ons jou vakke en punte — ons wys waar jy staan en waar jy vandag moet werk.",
    setupTitle: "Ongeveer 2 minute",
    setupBullet1: "Jou naam & vakke",
    setupBullet2: "Waar jy nou is & wat jy wil hê",
    setupBullet3: "Wanneer jou eksamens is",
    cta: "Kom ons begin",
    footnote: "Gratis · werk op jou foon · geen aanmelding nodig",
  },
  dashboard: {
    examDaysPrefix: "dae tot",
    yourSubjects: "Jou vakke",
    subjectsLead: "Waar jy nou is vs waar jy heen wil.",
    seeTopics: "Sien onderwerpe",
    nextStep: "Beste volgende ding",
    nextStepLead: "Gebaseer op jou punte, eksamens en onlangse oefening.",
    weeklyFocus: "Hierdie week se fokus",
    todayPlan: "Vandag se studieplan",
    planMinutes: (used, total) => `${used} / ${total} min beplan`,
    emptyTitle: "Kom ons vind jou beginpunt",
    emptyLead: "Doen 'n kort oefen-rondte sodat ons weet waar om te fokus.",
    emptyCta: "Begin oefen",
    progress: "Jou vordering",
    coachPicked: (subtopic) => `Werk tans aan ${subtopic}`,
    streak: "dag-reeks",
    sessionsDone: "sessies klaar",
    comingUp: "Komende",
    override: "Wil jy iets anders?",
    chooseElse: "Kies 'n ander onderwerp",
    controlNote: "Jy besluit.",
  },
  nextStep: {
    why: "Hoekom hierdie een?",
    start: "Begin hier",
    notNow: "Nie nou nie — stel iets anders voor",
    atScore: (pct) => `Ongeveer ${pct}% op hierdie onderwerp sover`,
  },
  subjects: {
    title: "Jou vakke",
    lead: "Tik 'n vak om te sien waar jy sterk is — en waar jy moet fokus.",
    target: (pct) => `Teiken ${pct}%`,
    mapSoon: "Ons voeg nog onderwerpe by vir hierdie vak.",
    topicsOnWay: "Onderwerpe kom binnekort",
    topicsOnWayLead: "Jy kan steeds jou punte en eksamendatums in jou profiel stel.",
    browsePractice: "Soek iets om te oefen",
    masteryMap: "Hoe gaan dit",
    practice: "Oefen",
  },
  practice: {
    title: "Oefen",
    lead: "Begin met wat die meeste aandag nodig het.",
    needsWork: "Hierdie het aandag nodig",
    practiceNow: "Oefen nou",
    allTopics: "Alle onderwerpe",
    answered: "beantwoord",
    estimateOnly: "net skatting",
  },
  progress: {
    title: "Vordering",
    lead: "Sien hoe jou oefening gaan.",
    sessions: "Sessies voltooi",
    streak: "Dag-reeks",
    matricGoals: "Matriek-doelwitte",
    inRange: "Jy is op koers",
    toGo: (pct) => `${pct}% om te gaan`,
    weeklyFocus: "Hierdie week se fokus",
    gettingStronger: "Word sterker",
    emptyTitle: "Kom ons begin",
    emptyLead: "Jou eerste studie-sessie sal hier verskyn.",
    emptyCta: "Begin jou eerste sessie",
    biggestGaps: "Het die meeste werk nodig",
    needsAttention: "Het aandag nodig",
    practiceThis: "Oefen dié",
  },
  profile: {
    title: "Jou matriekprofiel",
    gradeLine: (year) => `Graad 12 · ${year}`,
    subjectsTargets: "Vakke & teikens",
    nowAiming: (current, target) => `Nou ~${current}% → mik na ${target}%`,
    demonstrated: (pct) => `Uit oefening: ~${pct}%`,
    selfReported: (pct) => `Jy gesê: ~${pct}% by aanmelding`,
    dailyStudyTime: "Daaglikse studietyd",
    dailyStudyTimeLead: "Gebruik om vandag se plan te bou (jy kan dit enige tyd verander).",
    saveDailyTime: "Stoor daaglikse tyd",
    update: "Werk vakke & eksamendatums by",
    about: "Oor Studie-afrigter",
    language: "App-taal",
    languageLead: "Kieslys en leiding — jou vakke bly dieselfde.",
  },
  onboarding: {
    signInHint: "Opsioneel:",
    signInLink: "Meld aan",
    signInRest: "om jou profiel te sinkroniseer as jy meer as een toestel gebruik.",
    subjectsMissing:
      "Vakke is nog nie gelaai nie. Op Railway gebeur dit gewoonlik outomaties wanneer die app ná 'n deploy begin — kyk in die deploy-log vir “Study curriculum seed”, wag 'n minuut, en verfris. As dit steeds leeg is, herdeploy of vra jou admin om die databasis te kontroleer.",
    hey: "Hey 👋 Kom ons bou jou matriek-studieplan.",
    planIntro: "",
    nameLabel: "Wat is jou naam?",
    namePlaceholder: "bv. Thabo",
    dailyMinutesLabel: "Hoeveel tyd kan jy tipies per dag studeer?",
    gradeLine: "Graad 12 · 2026",
    subjectsTitle: "Wat studeer jy hierdie jaar?",
    subjectsLead: "Tik jou Graad 12-vakke.",
    goalsTitle: "Waarvoor mik jy?",
    goalsLead: "Eerlike huidige punt + jou teiken.",
    currentMark: "Waar jy nou is",
    targetMark: "Waar jy wil wees",
    examsTitle: "Wanneer is jou eksamens?",
    examsLead: "Papier 1-datums is fine — ons herinner jou wat opkom.",
    examDate: "Eksamendatum",
    paper: "Papier",
    minutes: "Minute",
    readyTitle: (name) => `Jy is reg, ${name}. Ons het jou beginpunt.`,
    readyLead: (count) => `${count} vakke · persoonlike volgende stap op jou tuisskerm.`,
    showPlan: "Wys my plan",
    errors: {
      name: "Wat moet ons jou noem?",
      subjects: "Kies minstens een Graad 12-vak.",
    },
  },
  quiz: {
    notFound: "Onderwerp nie gevind nie.",
    notEnrolled: "Hierdie vak is nie op jou profiel nie.",
    noQuestions: "Oefenvrae vir hierdie onderwerp is nog nie beskikbaar nie.",
    backPractice: "Terug na oefen",
    check: "Kontroleer antwoord",
    checking: "Kontroleer…",
    pickAnswer: "Kies of tik eers 'n antwoord.",
    questionOf: (n, total) => `Vraag ${n} van ${total}`,
    yourAnswer: "Jou antwoord",
    shortPlaceholder: "Tik jou finale antwoord",
    nice: "Lekker.",
    gotIt: "Jy het dit reg.",
    almost: "Byna.",
    almostLead: "Hier is hoekom dit saak maak.",
    memoAnswer: "Regte antwoord:",
    nextOne: "Gereed vir die volgende?",
    finishSession: "Voltooi sessie",
    whyTopicLabel: "Hoekom hierdie onderwerp?",
    savingProgress: "Stoor jou vordering…",
    sessionComplete: "Sessie klaar",
    niceWork: "Wel gedaan.",
    masteryLabel: "op hierdie onderwerp",
    stepCloser: (delta) => `+${delta}% — lekker, jy klim op`,
    nextUp: "Probeer hierdie volgende",
    nextGap: (name) => `${name} kan werk gebruik`,
    doneToday: "Klaar vir vandag",
    confidencePrompt: "Hoe selfverseker voel jy nou oor hierdie onderwerp?",
    confidenceUnderstands: "Ek verstaan",
    confidenceUnsure: "Nog onseker",
    confidenceDontUnderstand: "Ek het meer hulp nodig",
    confidenceSaved: "Gestoor — ons gebruik dit vir jou volgende stap.",
    introMastery: (pct, attempted) =>
      `Ongeveer ${pct}% hier · ${attempted} vrae klaar`,
    introBaseline: "'n Paar vinnige vrae — dan weet ons waar om te fokus.",
    questionType: "Watter vrae?",
    questionsReady: (n) => `${n} vra${n === 1 ? "g" : "e"} gereed`,
    official: "Werklike eksamenvrae",
    officialHint: "Uit vorige matriek-vraestelle",
    practiceDrills: "Vinnige oefening",
    practiceHint: "Korter vrae om selfvertroue te bou",
    mixed: "Beide saam",
    mixedHint: "Eksamen + oefening",
    readyCount: (n) => `${n} beskikbaar`,
    letsGo: "Kom ons",
    startQuestions: "Begin vrae",
    loading: "Laai…",
    modes: {
      official: "Vorige eksamenvrae",
      practice: "Vinnige oefening",
      all: "Beide saam",
    },
  },
  homeHelpers: {
    greetingMorning: (name) => `Goeiemôre, ${name}`,
    greetingAfternoon: (name) => `Goeiemiddag, ${name}`,
    greetingEvening: (name) => `Goeienaand, ${name}`,
    encouragement,
    examPassed: "Eksamendatum verby — werk jou profiel by indien nodig.",
    examToday: "Eksamen is vandag. Asem in — jy het voorberei.",
    finalOnTrack: "Laaste stretch — jy is op koers.",
    finalFocus: "Laaste stretch — 'n bietjie ekstra fokus help.",
    onTrack: "Jy is op koers.",
    needFocus: "Nog 'n bietjie fokus nodig.",
    plentyOnTrack: "Baie tyd — bly konsekwent.",
    plentyMomentum: "Kom ons bou momentum.",
  },
  masteryBand: {
    strong: "Gaan goed",
    building: "Kom daar",
    focus: "Het werk nodig",
  },
  recommendation: {
    examSoon: (subject, days) =>
      `${subject}-eksamen oor ${days} dag${days === 1 ? "" : "e"} — goeie tyd om te oefen.`,
    strengthenPrereq: (prereq, pct, topic) =>
      prereq + " is net " + pct + " persent. Sorteer dit eers — dit help met " + topic + ".",
    recentAttemptsLow: (count, avg) =>
      "Jou laaste " + count + " pogings hier was gemiddeld " + avg + " persent.",
    recentWrongStreak: (count) =>
      "Jou laaste " + count + " antwoorde agtereenvolgens was verkeerd hier — fokus-oefening help.",
    bigGap: (pct) => `Jy is op ongeveer ${pct}% op hierdie onderwerp — nog spasie om te groei.`,
    noBaseline: () =>
      "Jy het nog nie hierdie onderwerp geoefen nie — 'n kort sessie wys waar jy staan.",
    lightPractice: (attempts) =>
      "Slegs " +
      attempts +
      " vraag" +
      (attempts === 1 ? "" : "e") +
      " hier sover — meer oefening skerp die prent.",
    improving: () => "Jy verbeter hier — hou aan.",
    defaultReason: () => "Dit pas by jou punte, eksamens en wat jy onlangs oefen.",
    subjectMarkGap: (subject, current, target, gap) => {
      if (gap <= 0) {
        return (
          subject +
          ": jy is op ~" +
          current +
          "% en naby jou " +
          target +
          "% teiken — goeie basis."
        );
      }
      return (
        subject +
        ": jy is op ~" +
        current +
        "% met n " +
        target +
        "% teiken — ongeveer " +
        gap +
        "% nog om te sluit."
      );
    },
    topicLevel: (subtopic, masteryPct, target) => {
      return (
        "Op " +
        subtopic +
        ": jou oefen-skatting is ~" +
        masteryPct +
        " persent; teiken vir die vak is ~" +
        target +
        " persent."
      );
    },
    highExamWeight: (topic) =>
      topic + " is n swaar gewig in matriek — tyd hier betaal gewoonlik af in die finale eksamen.",
    solidExamWeight: (topic) =>
      topic + " dra ordentlike eksamen-gewig — hou dit op jou radar.",
    examCountdown: (subject, days) => {
      if (days <= 0) {
        return subject + "-eksamendatum is verby — werk jou profiel by indien nodig.";
      }
      if (days === 1) {
        return subject + "-eksamen is môre — gefokusde oefening help nog steeds.";
      }
      return subject + "-eksamen oor " + days + " dae — genoeg tyd vir betekenisvolle vordering.";
    },
    examDateUnknown: (subject) =>
      "Voeg jou " + subject + "-eksamendatum by vir skerper tydsberekening — ons prioritiseer steeds jou grootste gapings.",
    encouragement: (subtopic, subjectGap, examDays, neverPractised) => {
      if (neverPractised) {
        return (
          "n Gefokusde sessie op " +
          subtopic +
          " is n slim manier om n gaping te karteer sonder om oorweldig te voel."
        );
      }
      if (subjectGap >= 15 && examDays != null && examDays <= 42) {
        return (
          "Bestendige werk aan " +
          subtopic +
          " help nou om jou puntteling-gap te sluit — een stap op n slag."
        );
      }
      if (subjectGap >= 10) {
        return subtopic + " is nou n hoë-opbrengs keuse — klein wenke hier tel op oor die vraestel.";
      }
      return (
        "Jy bou momentum — " +
        subtopic +
        " pas by waar jy vandag is. Moenie stress nie; begin net."
      );
    },
    weeklyFocusHeadline: (subject, gap, target) =>
      "Prioritiseer " +
      subject +
      " hierdie week — ~" +
      gap +
      " persent na jou " +
      target +
      " persent teiken.",
    weeklyFocusDetail: (subject, gap, examDays, neverPractisedCount, weakTopicCount) => {
      const parts: string[] = [];
      if (examDays != null && examDays > 0) {
        parts.push(
          examDays + " dag" + (examDays === 1 ? "" : "e") + " tot eksamen",
        );
      }
      if (neverPractisedCount > 0) {
        parts.push(
          neverPractisedCount +
            " onderwerp" +
            (neverPractisedCount === 1 ? "" : "e") +
            " nog nie probeer nie",
        );
      }
      if (weakTopicCount > 0) {
        parts.push(weakTopicCount + " onder jou teiken");
      }
      const tail = parts.length > 0 ? " (" + parts.join(" · ") + ")" : "";
      return (
        "Jou grootste puntteling-gap is in " +
        subject +
        tail +
        ". Selfs twee kort sessies kan help."
      );
    },
    summaryStrengthen: (name) => "Begin met " + name,
    summaryFocus: (name) => "Werk volgende aan " + name,
  },
};
