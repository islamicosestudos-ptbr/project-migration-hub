import { Ayah } from '../types/quran';

export interface BundledSurahData {
  surahNumber: number;
  ayahs: Ayah[];
  historicalContext: string;
  majorThemes: string[];
}

export const BUNDLED_SURAHS: Record<number, BundledSurahData> = {
  1: {
    surahNumber: 1,
    historicalContext: "Revelada em Meca nos primeiros momentos da missão profética. É a oração suprema ensinada diretamente por Deus, recitada em cada unidade (Rak'ah) das cinco orações diárias obrigatórias (Salat). Sem a recitação da Al-Fatihah, a oração do muçulmano não é válida.",
    majorThemes: [
      "Louvor e Reconhecimento da Soberania de Deus (Tawhid)",
      "A Dupla Misericórdia Divina: Ar-Rahman (universal) e Ar-Rahim (especial)",
      "A Prestação de Contas no Dia da Recompensa",
      "A Súplica pelo Caminho Reto (Sirat al-Mustaqim)"
    ],
    ayahs: [
      {
        number: 1,
        numberInSurah: 1,
        arabicText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        transliteration: "Bismi Allāhi ar-Raḥmāni ar-Raḥīm",
        translation: "Em nome de Deus, o Clemente, o Misericordioso.",
        tafsirSummary: "A Basmalah: Consagração de todo ato nobre à bênção do Criador. 'Ar-Rahman' indica a misericórdia abrangente e infinita que abraça toda a criação; 'Ar-Rahim' a misericórdia especial concedida aos crentes sinceros."
      },
      {
        number: 2,
        numberInSurah: 2,
        arabicText: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
        transliteration: "Al-ḥamdu lillāhi rabbi al-'ālamīn",
        translation: "Louvado seja Deus, Senhor de todos os mundos.",
        tafsirSummary: "Tafsir Ibn Kathir: 'Al-Hamd' abrange tanto a gratidão pelos favores quanto o louvor à perfeição dos atributos divinos. 'Rabb al-'Alamin' define Deus como Criador, Mantenedor, Provedor e Soberano de tudo o que existe além d'Ele."
      },
      {
        number: 3,
        numberInSurah: 3,
        arabicText: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        transliteration: "Ar-Raḥmāni ar-Raḥīm",
        translation: "O Clemente, o Misericordioso.",
        tafsirSummary: "Reiteração essencial da graça divina após a menção de Sua soberania ('Senhor dos mundos'), ensinando que o domínio de Deus sobre o universo é fundamentado no amor, compaixão e clemência, e não na tirania."
      },
      {
        number: 4,
        numberInSurah: 4,
        arabicText: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
        transliteration: "Māliki yawmi ad-dīn",
        translation: "Soberano do Dia do Juízo.",
        tafsirSummary: "'Yawm ad-Din' é o Dia do Julgamento e da Retribuição final. Embora Deus seja o Soberano de todos os dias e épocas, neste Dia toda ilusão terrena de soberania humana desaparecerá por completo, restando apenas o Juízo perfeito e justo de Deus."
      },
      {
        number: 5,
        numberInSurah: 5,
        arabicText: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        transliteration: "Iyyāka na'budu wa-iyyāka nasta'īn",
        translation: "A Ti somente adoramos e de Ti somente imploramos socorro.",
        tafsirSummary: "O ápice do monoteísmo puro (Tawhid). A adoração exclusiva ('Iyyaka na'budu') precede o pedido de amparo ('wa-iyyaka nasta'in'). É a declaração de liberdade contra a submissão a qualquer tirano terreno ou ídolo ilusório."
      },
      {
        number: 6,
        numberInSurah: 6,
        arabicText: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        transliteration: "Ihdinā aṣ-ṣirāṭa al-mustaqīm",
        translation: "Guia-nos à senda reta,",
        tafsirSummary: "A súplica mais nobre que a criatura pode formular. Não pede riquezas efêmeras, mas a orientação contínua (Hidayah), discernimento, firmeza na verdade moral e equilíbrio espiritual em todas as decisões da vida."
      },
      {
        number: 7,
        numberInSurah: 7,
        arabicText: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        transliteration: "Ṣirāṭa allaḏhīna an'amta 'alayhim ghayri al-maghḍūbi 'alayhim walā aḍ-ḍāllīn",
        translation: "A senda dos que cumulaste com Tuas graças, não a dos que incorreram em Tua ira, nem a dos extraviados.",
        tafsirSummary: "Identifica a senda reta como o caminho dos profetas, verazes, mártires e virtuosos. Afasta o ser humano tanto do erro deliberado (conhecer a verdade e rejeitá-la conscientemente) quanto do extravio negligente (agir com ignorância e fanatismo)."
      }
    ]
  },
  112: {
    surahNumber: 112,
    historicalContext: "Revelada em Meca quando os politeístas desafiaram o Profeta: 'Descreve-nos a linhagem do teu Deus!'. Deus então desceu esta surata como o manifesto absoluto do monoteísmo intransigente e sublime.",
    majorThemes: ["A Unicidade Absoluta (Ahad)", "A Autossuficiência Suprema (As-Samad)", "A Transcendência além de progenitura e parentesco"],
    ayahs: [
      {
        number: 6222,
        numberInSurah: 1,
        arabicText: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
        transliteration: "Qul huwa Allāhu aḥad",
        translation: "Dize: Ele é Deus, o Único.",
        tafsirSummary: "'Ahad' indica unicidade absoluta sem partes, divisões ou associados. Deus é indivisível e único em Sua essência, atributos e atos."
      },
      {
        number: 6223,
        numberInSurah: 2,
        arabicText: "ٱللَّهُ ٱلصَّمَدُ",
        transliteration: "Allāhu aṣ-ṣamad",
        translation: "Deus, o Absoluto e Eterno Refúgio.",
        tafsirSummary: "'As-Samad': Aquele de Quem toda a criação necessita a cada fração de segundo, mas que não necessita de ninguém nem de nada para existir."
      },
      {
        number: 6224,
        numberInSurah: 3,
        arabicText: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        transliteration: "Lam yalid walam yūlad",
        translation: "Não gerou e não foi gerado,",
        tafsirSummary: "Negação categórica de qualquer genealogia física ou cósmica. Deus não tem princípio nem sucessor, nem pai nem filho."
      },
      {
        number: 6225,
        numberInSurah: 4,
        arabicText: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
        transliteration: "Walam yakun lahu kufuwan aḥad",
        translation: "E ninguém Lhe é comparável.",
        tafsirSummary: "Transcendência infinita. Nenhuma metáfora ou criatura pode se igualar a Deus em Sua sabedoria, justiça, bondade ou majestade."
      }
    ]
  },
  113: {
    surahNumber: 113,
    historicalContext: "Uma das duas suratas de refúgio (Al-Mu'awwidhatayn). Revelada para ensinar o crente a buscar a proteção inabalável de Deus contra os perigos ocultos da criação e contra a inveja humana.",
    majorThemes: ["Refúgio no Criador da Alvorada", "Proteção contra as trevas e magias", "Cura contra a inveja corrosiva"],
    ayahs: [
      {
        number: 6226,
        numberInSurah: 1,
        arabicText: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
        transliteration: "Qul a'ūḏhu birabbi al-falaq",
        translation: "Dize: Busco refúgio no Senhor da alvorada,",
        tafsirSummary: "'Al-Falaq': A luz do amanhecer que rasga as trevas mais densas da noite. Quem tem o poder de fazer nascer o dia tem o poder de dissipar qualquer escuridão da alma."
      },
      {
        number: 6227,
        numberInSurah: 2,
        arabicText: "مِن شَرِّ مَا خَلَقَ",
        transliteration: "Min sharri mā khalaq",
        translation: "Do mal daquilo que Ele criou,",
        tafsirSummary: "Proteção contra os danos potenciais existentes no mundo criado, físicos ou espirituais."
      },
      {
        number: 6228,
        numberInSurah: 3,
        arabicText: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        transliteration: "Wamin sharri ghāsiqin iḏhā waqab",
        translation: "E do mal da noite quando se adensa,",
        tafsirSummary: "A noite escura, momento em que perigos ocultos, receios e aflições costumam aflorar com mais força."
      },
      {
        number: 6229,
        numberInSurah: 4,
        arabicText: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِي ٱلْعُقَدِ",
        transliteration: "Wamin sharri an-naffāthāti fī al-'uqad",
        translation: "E do mal das que sopram nos nós,",
        tafsirSummary: "Alusão a tentativas de feitiçaria, intrigas e discórdias que procuram romper os laços de fraternidade e paz."
      },
      {
        number: 6230,
        numberInSurah: 5,
        arabicText: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        transliteration: "Wamin sharri ḥāsidin iḏhā ḥasad",
        translation: "E do mal do invejoso quando inveja.",
        tafsirSummary: "A inveja (Hasad) é o desejo destrutivo de ver a bênção alheia aniquilada. O Alcorão ensina a responder com gratidão a Deus e oração protetora."
      }
    ]
  },
  114: {
    surahNumber: 114,
    historicalContext: "O selo supremo que encerra o Alcorão Sagrado. Conclui o Livro Divino lembrando a humanidade de que o maior refúgio contra as tentações invisíveis e as fraquezas da mente está na lembrança sincera do Soberano dos Homens.",
    majorThemes: ["Os Três Nomes Reais: Senhor, Rei e Deus da Humanidade", "O Combate aos Sussurros Interiores (Waswas)", "A Paz Espiritual"],
    ayahs: [
      {
        number: 6231,
        numberInSurah: 1,
        arabicText: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
        transliteration: "Qul a'ūḏhu birabbi an-nās",
        translation: "Dize: Busco refúgio no Senhor dos seres humanos,",
        tafsirSummary: "Invocação de Deus como 'Rabb an-Nas': O Criador, Cuidador e Mantenedor de toda a humanidade, sem distinção de raça ou origem."
      },
      {
        number: 6232,
        numberInSurah: 2,
        arabicText: "مَلِكِ ٱلنَّاسِ",
        transliteration: "Maliki an-nās",
        translation: "O Rei dos seres humanos,",
        tafsirSummary: "O Soberano legítimo a Quem todos prestarão contas, superior a qualquer governante ou autoridade transitória da terra."
      },
      {
        number: 6233,
        numberInSurah: 3,
        arabicText: "إِلَٰهِ ٱلنَّاسِ",
        transliteration: "Ilāhi an-nās",
        translation: "O Deus dos seres humanos,",
        tafsirSummary: "O Único digno de devoção, amor absoluto e obediência sincera de cada coração humano."
      },
      {
        number: 6234,
        numberInSurah: 4,
        arabicText: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
        transliteration: "Min sharri al-waswāsi al-khannās",
        translation: "Do mal do sussurrador fugidio,",
        tafsirSummary: "'Al-Waswas': Os pensamentos desvirtuados, a ansiedade nociva e a tentação. 'Al-Khannas': Aquele que foge e enfraquece no momento em que o nome de Deus é lembrado com sinceridade."
      },
      {
        number: 6235,
        numberInSurah: 5,
        arabicText: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
        transliteration: "Allaḏhī yuwaswisu fī ṣudūri an-nās",
        translation: "Que sopra sussurros nos corações das pessoas,",
        tafsirSummary: "A batalha espiritual interior trava-se no peito (Sadr). Fortalecer a fé e o autoconhecimento é o antídoto corânico contra as dúvidas destrutivas."
      },
      {
        number: 6236,
        numberInSurah: 6,
        arabicText: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
        transliteration: "Mina al-jinnati wan-nās",
        translation: "Sejam dos gênios ou dos seres humanos.",
        tafsirSummary: "Reconhecimento de que as más influências podem provir tanto de impulsos invisíveis quanto de companhias tóxicas ou conselhos mal-intencionados entre os próprios seres humanos."
      }
    ]
  },
  94: {
    surahNumber: 94,
    historicalContext: "Revelada para confortar o Profeta Muhammad num período de grande adversidade e hostilidade em Meca. Traz uma mensagem universal de alívio e esperança para qualquer pessoa que passe por provações.",
    majorThemes: ["Abertura do Coração para a Serenidade", "O Alívio do Peso nos Ombros", "A Regra de Ouro: 'Com a Dificuldade vem a Facilidade'"],
    ayahs: [
      {
        number: 6099,
        numberInSurah: 1,
        arabicText: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ",
        transliteration: "Alam nashraḥ laka ṣadrak",
        translation: "Porventura, não dilatamos o teu peito,",
        tafsirSummary: "Dilatação do coração com sabedoria, luz, serenidade e paciência para acolher as verdades e suportar os fardos da existência."
      },
      {
        number: 6100,
        numberInSurah: 2,
        arabicText: "وَوَضَعْنَا عَنكَ وِزْرَكَ",
        transliteration: "Wawaḍa'nā 'anka wizrak",
        translation: "E não aliviamos de ti o teu fardo,",
        tafsirSummary: "A graça divina que perdoa faltas e desfaz o peso esmagador que consome a alma aflita."
      },
      {
        number: 6101,
        numberInSurah: 3,
        arabicText: "ٱلَّذِىٓ أَنقَضَ ظَهْرَكَ",
        transliteration: "Allaḏhī anqaḍa ẓahrak",
        translation: "Que sobrecarregava as tuas costas,",
        tafsirSummary: "Expressão poética que descreve a angústia tão intensa que parecia encurvar as vértebras de quem a carregava."
      },
      {
        number: 6102,
        numberInSurah: 4,
        arabicText: "وَرَفَعْنَا لَكَ ذِكْرَكَ",
        transliteration: "Warafa'nā laka ḏhikrak",
        translation: "E não exaltamos a tua fama?",
        tafsirSummary: "O nome de Muhammad é lembrado com bênçãos em cada chamada de oração (Adhan) ao redor do planeta continuamente."
      },
      {
        number: 6103,
        numberInSurah: 5,
        arabicText: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
        transliteration: "Fa-inna ma'a al-'usri yusrā",
        translation: "Pois, em verdade, com a dificuldade está a facilidade;",
        tafsirSummary: "A palavra 'com' ('ma'a') ensina que o alívio não vem apenas depois, mas nasce simultaneamente dentro da própria provação, forjando resiliência e maturidade."
      },
      {
        number: 6104,
        numberInSurah: 6,
        arabicText: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
        transliteration: "Inna ma'a al-'usri yusrā",
        translation: "Sim, com a dificuldade está a facilidade!",
        tafsirSummary: "Repetição enfática para selar a convicção no coração: uma única dificuldade jamais superará o dobro de facilidades e portas que Deus abre."
      },
      {
        number: 6105,
        numberInSurah: 7,
        arabicText: "فَإِذَا فَرَغْتَ فَٱنصَبْ",
        transliteration: "Fa-iḏhā faraghta fanṣab",
        translation: "Assim, quando estiveres livre dos teus afazeres, esforça-te na devoção,",
        tafsirSummary: "O dinamismo islâmico: terminada uma tarefa útil no mundo, canalize a energia para a oração, meditação e serviço ao próximo."
      },
      {
        number: 6106,
        numberInSurah: 8,
        arabicText: "وَإِلَىٰ رَبِّكَ فَٱرْغَب",
        transliteration: "Wa-ilā rabbika farghab",
        translation: "E volta todo o teu anseio para o teu Senhor.",
        tafsirSummary: "Colocar todo anelo, esperança e confiança em Deus, a fonte inesgotável de paz e renovação."
      }
    ]
  },
  103: {
    surahNumber: 103,
    historicalContext: "Três versículos que o Imam Ash-Shafi'i descreveu: 'Se Deus tivesse revelado apenas esta surata à humanidade, ela seria suficiente para guiá-la'.",
    majorThemes: ["O Valor Sagrado do Tempo", "A Condição Humana de Perda Inevitável", "Os Quatro Pilares da Salvação: Fé, Ação Justa, Conselho da Verdade e Paciência"],
    ayahs: [
      {
        number: 6177,
        numberInSurah: 1,
        arabicText: "وَٱلْعَصْرِ",
        transliteration: "Wal-'aṣr",
        translation: "Pelo Tempo,",
        tafsirSummary: "Juramento solene pelo curso do tempo e pela era. Cada segundo transcorrido é irrecuperável e define o destino eterno."
      },
      {
        number: 6178,
        numberInSurah: 2,
        arabicText: "إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ",
        transliteration: "Inna al-insāna lafī khusr",
        translation: "Em verdade, o ser humano está em perdição,",
        tafsirSummary: "A perda natural da juventude, saúde e tempo se o homem apenas se deixar levar pelos prazeres egoístas e passageiros."
      },
      {
        number: 6179,
        numberInSurah: 3,
        arabicText: "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ",
        transliteration: "Illā allaḏhīna āmanū wa'amilū aṣ-ṣāliḥāti watawāṣaw bil-ḥaqqi watawāṣaw biṣ-ṣabr",
        translation: "Exceto os que creem, praticam o bem, recomendam mutuamente a verdade e recomendam mutuamente a paciência.",
        tafsirSummary: "A fórmula integral do sucesso: fé no intelecto e coração ('amanu'), ética nas atitudes ('amilu as-salihat'), compromisso social com a justiça e a verdade ('tawasaw bil-haqq') e constância inabalável diante dos obstáculos ('tawasaw bis-sabr')."
      }
    ]
  }
};
