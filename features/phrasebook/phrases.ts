import type { Word } from "@/features/curriculum/types";

type Row = readonly [ar: string, tr: string, en: string];

export interface PhraseCategory {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  /** A speaking mission that puts these phrases to work. */
  scenarioId?: string;
  phrases: Word[];
}

function category(
  meta: Omit<PhraseCategory, "phrases">,
  rows: readonly Row[],
): PhraseCategory {
  return {
    ...meta,
    phrases: rows.map(([ar, tr, en], i) => ({
      id: `p-${meta.id}-${i + 1}`,
      ar,
      tr,
      en,
    })),
  };
}

/** Whole sentences for real situations. Lessons teach the words; this is what you say with them. */
export const PHRASEBOOK: readonly PhraseCategory[] = [
  category(
    {
      id: "essentials",
      title: "Survival essentials",
      titleAr: "الأَسَاسِيَّات",
      description: "When you're stuck, lost or need someone to slow down.",
    },
    [
      [
        "أَنَا أَتَعَلَّمُ العَرَبِيَّةَ",
        "anā ataʿallamu l-ʿarabiyya",
        "I'm learning Arabic.",
      ],
      [
        "أَنَا لَا أَتَكَلَّمُ العَرَبِيَّةَ جَيِّدًا",
        "anā lā atakallamu l-ʿarabiyya jayyidan",
        "I don't speak Arabic well.",
      ],
      [
        "هَلْ تَتَكَلَّمُ الإِنْجِلِيزِيَّةَ؟",
        "hal tatakallamu l-injilīziyya?",
        "Do you speak English? (to a man)",
      ],
      [
        "تَكَلَّمْ بِبُطْءٍ مِنْ فَضْلِكَ",
        "takallam bi-buṭʾin min faḍlik",
        "Please speak slowly. (to a man)",
      ],
      [
        "لَا أَفْهَمُ، أَعِدْ مِنْ فَضْلِكَ",
        "lā afhamu, aʿid min faḍlik",
        "I don't understand, please repeat.",
      ],
      ["مَاذَا يَعْنِي هٰذَا؟", "mādhā yaʿnī hādhā?", "What does this mean?"],
      [
        "اُكْتُبْهُ لِي مِنْ فَضْلِكَ",
        "uktubhu lī min faḍlik",
        "Please write it down for me. (to a man)",
      ],
      ["أَيْنَ الحَمَّامُ؟", "ayna l-ḥammām?", "Where is the bathroom?"],
      ["أَنَا تَائِهٌ", "anā tāʾih", "I'm lost. (said by a man)"],
      [
        "سَاعِدْنِي مِنْ فَضْلِكَ",
        "sāʿidnī min faḍlik",
        "Help me, please. (to a man)",
      ],
    ],
  ),
  category(
    {
      id: "meeting",
      title: "Meeting people",
      titleAr: "التَّعَارُف",
      description: "Names, ages, where you're from and where you live.",
      scenarioId: "intro",
    },
    [
      ["مَا اسْمُكِ؟", "mā ismuki?", "What's your name? (to a woman)"],
      ["اِسْمِي سَارَة", "ismī sāra", "My name is Sara."],
      [
        "تَشَرَّفْتُ بِمَعْرِفَتِكَ",
        "tasharraftu bi-maʿrifatik",
        "It's an honour to meet you. (to a man)",
      ],
      [
        "مِنْ أَيْنَ أَنْتِ؟",
        "min ayna anti?",
        "Where are you from? (to a woman)",
      ],
      ["أَنَا مِنْ لَنْدَن", "anā min landan", "I'm from London."],
      ["أَيْنَ تَسْكُنُ؟", "ayna taskunu?", "Where do you live? (to a man)"],
      ["كَمْ عُمْرُكَ؟", "kam ʿumruk?", "How old are you? (to a man)"],
      [
        "عُمْرِي ثَلَاثُونَ سَنَةً",
        "ʿumrī thalāthūna sana",
        "I'm thirty years old.",
      ],
      [
        "هَلْ أَنْتَ مُتَزَوِّجٌ؟",
        "hal anta mutazawwij?",
        "Are you married? (to a man)",
      ],
      [
        "هٰذَا صَدِيقِي أَحْمَد",
        "hādhā ṣadīqī aḥmad",
        "This is my friend Ahmad.",
      ],
      ["أَرَاكَ لَاحِقًا", "arāka lāḥiqan", "See you later. (to a man)"],
    ],
  ),
  category(
    {
      id: "courtesy",
      title: "Courtesy",
      titleAr: "الأَدَب",
      description:
        "Thanks, apologies and the small politeness that opens doors.",
    },
    [
      [
        "شُكْرًا جَزِيلًا عَلَى مُسَاعَدَتِكَ",
        "shukran jazīlan ʿalā musāʿadatik",
        "Thank you so much for your help.",
      ],
      [
        "عَفْوًا، لَا شُكْرَ عَلَى وَاجِبٍ",
        "ʿafwan, lā shukra ʿalā wājib",
        "You're welcome, don't mention it.",
      ],
      [
        "أَنَا آسِفٌ جِدًّا",
        "anā āsifun jiddan",
        "I'm very sorry. (said by a man)",
      ],
      [
        "لَا بَأْسَ عَلَيْكَ",
        "lā baʾsa ʿalayk",
        "Don't worry about it. (to a man)",
      ],
      [
        "عَنْ إِذْنِكَ، هَلْ يُمْكِنُنِي المُرُورُ؟",
        "ʿan idhnik, hal yumkinunī l-murūr?",
        "Excuse me, may I get past?",
      ],
      [
        "تَفَضَّلْ بِالجُلُوسِ",
        "tafaḍḍal bil-julūs",
        "Please have a seat. (to a man)",
      ],
      ["بَعْدَكَ", "baʿdak", "After you. (to a man)"],
      ["مَعَ الأَسَفِ", "maʿa l-asaf", "Unfortunately."],
      [
        "لَوْ سَمَحْتَ، هَلْ عِنْدَكَ دَقِيقَةٌ؟",
        "law samaḥt, hal ʿindaka daqīqa?",
        "Excuse me, do you have a minute? (to a man)",
      ],
    ],
  ),
  category(
    {
      id: "eating-out",
      title: "Cafés and restaurants",
      titleAr: "فِي المَطْعَم",
      description: "Getting a table, ordering, dietary needs and paying.",
      scenarioId: "restaurant",
    },
    [
      [
        "طَاوِلَةٌ لِأَرْبَعَةِ أَشْخَاصٍ مِنْ فَضْلِكَ",
        "ṭāwilatun li-arbaʿati ashkhāṣin min faḍlik",
        "A table for four, please.",
      ],
      [
        "هَلْ يُمْكِنُنِي أَنْ أَرَى القَائِمَةَ؟",
        "hal yumkinunī an arā l-qāʾima?",
        "May I see the menu?",
      ],
      [
        "مَاذَا تَنْصَحُنِي؟",
        "mādhā tanṣaḥunī?",
        "What do you recommend? (to a man)",
      ],
      [
        "أُرِيدُ قَهْوَةً بِدُونِ سُكَّرٍ",
        "urīdu qahwatan bi-dūni sukkar",
        "I'd like a coffee without sugar.",
      ],
      [
        "أَنَا نَبَاتِيٌّ، لَا آكُلُ اللَّحْمَ",
        "anā nabātī, lā ākulu l-laḥm",
        "I'm vegetarian, I don't eat meat.",
      ],
      ["هَلْ هٰذَا حَارٌّ؟", "hal hādhā ḥārr?", "Is this spicy?"],
      [
        "كَأْسُ مَاءٍ مِنْ فَضْلِكَ",
        "kaʾsu māʾin min faḍlik",
        "A glass of water, please.",
      ],
      [
        "الطَّعَامُ لَذِيذٌ جِدًّا",
        "aṭ-ṭaʿāmu ladhīdhun jiddan",
        "The food is delicious.",
      ],
      ["الحِسَابُ مِنْ فَضْلِكَ", "al-ḥisābu min faḍlik", "The bill, please."],
      [
        "هَلْ أَسْتَطِيعُ أَنْ أَدْفَعَ بِالبِطَاقَةِ؟",
        "hal astaṭīʿu an adfaʿa bil-biṭāqa?",
        "Can I pay by card?",
      ],
    ],
  ),
  category(
    {
      id: "shopping",
      title: "Shopping",
      titleAr: "التَّسَوُّق",
      description: "Prices, sizes, colours and a little bargaining.",
      scenarioId: "clothes",
    },
    [
      [
        "بِكَمْ هٰذَا القَمِيصُ؟",
        "bikam hādhā l-qamīṣ?",
        "How much is this shirt?",
      ],
      ["هٰذَا غَالٍ جِدًّا", "hādhā ghālin jiddan", "That's too expensive."],
      [
        "هَلْ عِنْدَكَ مَقَاسٌ أَكْبَرُ؟",
        "hal ʿindaka maqāsun akbar?",
        "Do you have a bigger size?",
      ],
      [
        "هَلْ عِنْدَكَ لَوْنٌ آخَرُ؟",
        "hal ʿindaka lawnun ākhar?",
        "Do you have another colour?",
      ],
      [
        "هَلْ يُمْكِنُنِي أَنْ أُجَرِّبَهُ؟",
        "hal yumkinunī an ujarribah?",
        "Can I try it on?",
      ],
      ["أَنَا أَتَفَرَّجُ فَقَطْ", "anā atafarraju faqaṭ", "I'm just looking."],
      ["هَلْ يُوجَدُ خَصْمٌ؟", "hal yūjadu khaṣm?", "Is there a discount?"],
      ["سَآخُذُ اثْنَيْنِ", "sa-ākhudhu thnayn", "I'll take two."],
      ["أَيْنَ أَدْفَعُ؟", "ayna adfaʿu?", "Where do I pay?"],
      [
        "هَلْ يُمْكِنُنِي أَنْ أُرْجِعَهُ؟",
        "hal yumkinunī an urjiʿah?",
        "Can I return it?",
      ],
    ],
  ),
  category(
    {
      id: "getting-around",
      title: "Getting around",
      titleAr: "التَّنَقُّل",
      description: "Directions, taxis, buses and trains.",
      scenarioId: "taxi",
    },
    [
      [
        "أَيْنَ مَحَطَّةُ القِطَارِ؟",
        "ayna maḥaṭṭatu l-qiṭār?",
        "Where is the train station?",
      ],
      [
        "كَيْفَ أَصِلُ إِلَى وَسَطِ المَدِينَةِ؟",
        "kayfa aṣilu ilā wasaṭi l-madīna?",
        "How do I get to the city centre?",
      ],
      [
        "هَلْ هُوَ بَعِيدٌ مِنْ هُنَا؟",
        "hal huwa baʿīdun min hunā?",
        "Is it far from here?",
      ],
      [
        "إِلَى المَطَارِ مِنْ فَضْلِكَ",
        "ilā l-maṭāri min faḍlik",
        "To the airport, please.",
      ],
      [
        "قِفْ هُنَا مِنْ فَضْلِكَ",
        "qif hunā min faḍlik",
        "Stop here, please. (to a man)",
      ],
      ["كَمِ الأُجْرَةُ؟", "kami l-ujra?", "How much is the fare?"],
      [
        "تَذْكِرَةُ ذَهَابٍ وَعَوْدَةٍ",
        "tadhkiratu dhahābin wa-ʿawda",
        "A return ticket.",
      ],
      [
        "مَتَى يُغَادِرُ القِطَارُ؟",
        "matā yughādiru l-qiṭār?",
        "When does the train leave?",
      ],
      [
        "أَيُّ حَافِلَةٍ تَذْهَبُ إِلَى السُّوقِ؟",
        "ayyu ḥāfilatin tadhhabu ilā s-sūq?",
        "Which bus goes to the market?",
      ],
      [
        "اِنْعَطِفْ يَمِينًا عِنْدَ الإِشَارَةِ",
        "inʿaṭif yamīnan ʿinda l-ishāra",
        "Turn right at the traffic light.",
      ],
    ],
  ),
  category(
    {
      id: "hotel",
      title: "At the hotel",
      titleAr: "فِي الفُنْدُق",
      description: "Checking in, asking for things and checking out.",
      scenarioId: "hotel",
    },
    [
      [
        "عِنْدِي حَجْزٌ بِاسْمِ أَحْمَد",
        "ʿindī ḥajzun bi-smi aḥmad",
        "I have a reservation under Ahmad.",
      ],
      [
        "هَلْ عِنْدَكُمْ غُرْفَةٌ فَارِغَةٌ؟",
        "hal ʿindakum ghurfatun fārigha?",
        "Do you have a free room?",
      ],
      ["لِكَمْ لَيْلَةً؟", "li-kam laylatan?", "For how many nights?"],
      ["لِثَلَاثِ لَيَالٍ", "li-thalāthi layālin", "For three nights."],
      [
        "هَلِ الفَطُورُ مَشْمُولٌ؟",
        "hali l-faṭūru mashmūl?",
        "Is breakfast included?",
      ],
      ["مَتَى الفَطُورُ؟", "matā l-faṭūr?", "When is breakfast?"],
      [
        "مَا كَلِمَةُ السِّرِّ لِلْإِنْتَرْنِت؟",
        "mā kalimatu s-sirri lil-intirnit?",
        "What's the Wi-Fi password?",
      ],
      [
        "المُكَيِّفُ لَا يَعْمَلُ",
        "al-mukayyifu lā yaʿmal",
        "The air conditioning doesn't work.",
      ],
      [
        "أُرِيدُ أَنْ أُغَادِرَ الفُنْدُقَ",
        "urīdu an ughādira l-funduq",
        "I'd like to check out.",
      ],
    ],
  ),
  category(
    {
      id: "health",
      title: "Health and emergencies",
      titleAr: "الصِّحَّة وَالطَّوَارِئ",
      description: "Phrases you hope not to need, but should know.",
      scenarioId: "doctor",
    },
    [
      ["النَّجْدَةَ!", "an-najda!", "Help!"],
      ["أَحْتَاجُ إِلَى طَبِيبٍ", "aḥtāju ilā ṭabīb", "I need a doctor."],
      [
        "اُطْلُبِ الإِسْعَافَ!",
        "uṭlubi l-isʿāf!",
        "Call an ambulance! (to a man)",
      ],
      [
        "اِتَّصِلْ بِالشُّرْطَةِ",
        "ittaṣil bish-shurṭa",
        "Call the police. (to a man)",
      ],
      [
        "أَيْنَ أَقْرَبُ صَيْدَلِيَّةٍ؟",
        "ayna aqrabu ṣaydaliyya?",
        "Where is the nearest pharmacy?",
      ],
      ["يُؤْلِمُنِي بَطْنِي", "yuʾlimunī baṭnī", "My stomach hurts."],
      ["أَشْعُرُ بِدُوَارٍ", "ashʿuru bi-duwār", "I feel dizzy."],
      ["مُنْذُ يَوْمَيْنِ", "mundhu yawmayn", "For two days."],
      [
        "عِنْدِي حَسَاسِيَّةٌ مِنَ الفُولِ السُّودَانِيِّ",
        "ʿindī ḥasāsiyyatun mina l-fūli s-sūdānī",
        "I'm allergic to peanuts.",
      ],
      [
        "فَقَدْتُ جَوَازَ سَفَرِي",
        "faqadtu jawāza safarī",
        "I've lost my passport.",
      ],
    ],
  ),
  category(
    {
      id: "small-talk",
      title: "Small talk and feelings",
      titleAr: "الدَّرْدَشَة",
      description: "The weather, your day and how you're feeling.",
      scenarioId: "small-talk",
    },
    [
      [
        "الجَوُّ جَمِيلٌ اليَوْمَ",
        "al-jawwu jamīlun al-yawm",
        "The weather is lovely today.",
      ],
      ["الجَوُّ حَارٌّ جِدًّا", "al-jawwu ḥārrun jiddan", "It's very hot."],
      [
        "كَيْفَ كَانَ يَوْمُكَ؟",
        "kayfa kāna yawmuk?",
        "How was your day? (to a man)",
      ],
      ["كَانَ يَوْمًا طَوِيلًا", "kāna yawman ṭawīlan", "It was a long day."],
      [
        "مَاذَا فَعَلْتَ فِي نِهَايَةِ الأُسْبُوعِ؟",
        "mādhā faʿalta fī nihāyati l-usbūʿ?",
        "What did you do at the weekend? (to a man)",
      ],
      ["لَا شَيْءَ خَاصًّا", "lā shayʾa khāṣṣan", "Nothing special."],
      [
        "أَنَا سَعِيدٌ بِرُؤْيَتِكَ",
        "anā saʿīdun bi-ruʾyatik",
        "I'm happy to see you. (to a man)",
      ],
      [
        "أَنَا مُتْعَبٌ قَلِيلًا",
        "anā mutʿabun qalīlan",
        "I'm a bit tired. (said by a man)",
      ],
      ["هٰذَا رَائِعٌ!", "hādhā rāʾiʿ!", "That's great!"],
      ["يَا لَلْأَسَفِ", "yā lal-asaf", "What a pity."],
    ],
  ),
  category(
    {
      id: "plans",
      title: "Plans and meeting up",
      titleAr: "المَوَاعِيد",
      description: "Suggest, agree, run late and say see you.",
      scenarioId: "plans",
    },
    [
      [
        "هَلْ أَنْتَ مَشْغُولٌ غَدًا؟",
        "hal anta mashghūlun ghadan?",
        "Are you busy tomorrow? (to a man)",
      ],
      [
        "مَا رَأْيُكَ أَنْ نَذْهَبَ إِلَى السِّينَمَا؟",
        "mā raʾyuka an nadhhaba ilā s-sīnamā?",
        "How about going to the cinema?",
      ],
      ["مَتَى نَلْتَقِي؟", "matā naltaqī?", "When shall we meet?"],
      ["أَيْنَ نَلْتَقِي؟", "ayna naltaqī?", "Where shall we meet?"],
      [
        "نَلْتَقِي السَّاعَةَ السَّابِعَةَ",
        "naltaqī s-sāʿata s-sābiʿa",
        "Let's meet at seven.",
      ],
      ["هٰذَا يُنَاسِبُنِي", "hādhā yunāsibunī", "That suits me."],
      [
        "آسِفٌ، لَا أَسْتَطِيعُ اليَوْمَ",
        "āsif, lā astaṭīʿu l-yawm",
        "Sorry, I can't today.",
      ],
      [
        "سَأَتَأَخَّرُ قَلِيلًا",
        "sa-ataʾakhkharu qalīlan",
        "I'll be a little late.",
      ],
      ["أَنَا فِي الطَّرِيقِ", "anā fī ṭ-ṭarīq", "I'm on my way."],
      ["إِلَى اللِّقَاءِ غَدًا", "ilā l-liqāʾi ghadan", "See you tomorrow."],
    ],
  ),
  category(
    {
      id: "work-study",
      title: "Work and study",
      titleAr: "العَمَل وَالدِّرَاسَة",
      description: "Your job, your studies and staying in touch.",
      scenarioId: "work",
    },
    [
      [
        "أَعْمَلُ فِي شَرِكَةٍ كَبِيرَةٍ",
        "aʿmalu fī sharikatin kabīra",
        "I work at a big company.",
      ],
      [
        "أَنَا طَالِبٌ فِي الجَامِعَةِ",
        "anā ṭālibun fī l-jāmiʿa",
        "I'm a university student.",
      ],
      [
        "مُنْذُ مَتَى تَدْرُسُ العَرَبِيَّةَ؟",
        "mundhu matā tadrusu l-ʿarabiyya?",
        "How long have you studied Arabic? (to a man)",
      ],
      [
        "أَدْرُسُ العَرَبِيَّةَ مُنْذُ شَهْرٍ",
        "adrusu l-ʿarabiyya mundhu shahr",
        "I've been studying Arabic for a month.",
      ],
      [
        "أَبْدَأُ العَمَلَ السَّاعَةَ التَّاسِعَةَ",
        "abdaʾu l-ʿamala s-sāʿata t-tāsiʿa",
        "I start work at nine.",
      ],
      [
        "عِنْدِي اجْتِمَاعٌ الآنَ",
        "ʿindī jtimāʿun al-ān",
        "I have a meeting now.",
      ],
      ["أُحِبُّ عَمَلِي", "uḥibbu ʿamalī", "I love my job."],
      [
        "مَا رَقْمُ هَاتِفِكَ؟",
        "mā raqmu hātifik?",
        "What's your phone number? (to a man)",
      ],
      [
        "سَأُرْسِلُ لَكَ رِسَالَةً",
        "sa-ursilu laka risāla",
        "I'll send you a message. (to a man)",
      ],
    ],
  ),
  category(
    {
      id: "opinions",
      title: "Opinions and discussion",
      titleAr: "النِّقَاش",
      description: "Agree, disagree, hedge and explain yourself.",
      scenarioId: "opinions",
    },
    [
      [
        "أَظُنُّ أَنَّكَ عَلَى حَقٍّ",
        "aẓunnu annaka ʿalā ḥaqq",
        "I think you're right. (to a man)",
      ],
      ["لَا أَظُنُّ ذٰلِكَ", "lā aẓunnu dhālik", "I don't think so."],
      [
        "أَنَا مُوَافِقٌ تَمَامًا",
        "anā muwāfiqun tamāman",
        "I completely agree. (said by a man)",
      ],
      ["هٰذَا يَعْتَمِدُ", "hādhā yaʿtamid", "It depends."],
      [
        "لِمَاذَا تَقُولُ ذٰلِكَ؟",
        "limādhā taqūlu dhālik?",
        "Why do you say that? (to a man)",
      ],
      [
        "أُفَضِّلُ المَدِينَةَ عَلَى القَرْيَةِ",
        "ufaḍḍilu l-madīnata ʿalā l-qarya",
        "I prefer the city to the village.",
      ],
      [
        "الحَيَاةُ فِي المَدِينَةِ أَسْرَعُ",
        "al-ḥayātu fī l-madīnati asraʿ",
        "Life in the city is faster.",
      ],
      [
        "عِنْدَكَ نُقْطَةٌ جَيِّدَةٌ",
        "ʿindaka nuqṭatun jayyida",
        "You have a good point. (to a man)",
      ],
      [
        "بِصَرَاحَةٍ، لَسْتُ مُتَأَكِّدًا",
        "bi-ṣarāḥa, lastu mutaʾakkidan",
        "Honestly, I'm not sure. (said by a man)",
      ],
    ],
  ),
];

export const PHRASE_COUNT = PHRASEBOOK.reduce(
  (n, c) => n + c.phrases.length,
  0,
);
