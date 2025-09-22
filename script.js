function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open")
    icon.classList.toggle("open")
}

function translateDocument() {
    const currentLang = document.documentElement.getAttribute('lang');

    const translations = {
        en: {
            tr_name: 'Matthew Merioles',
            tr_about: 'About',
            tr_experience: 'Experience',
            tr_projects: 'Projects',
            tr_contact: 'Contact',
            tr_notes: 'Notes',
            tr_resume: "Resume",
            tr_engineer: "Electrical Engineer",
            tr_edu: "Education",
            tr_deg: "B.S. Electrical Engineering",
            tr_ucsd: "UC San Diego",
            tr_long: "I like data center networks. In my free time, I enjoy composing video game and japanese alt rock music.",
            tr_project_1: "Tatacon Project",
            tr_project_2: "RDBMS from Scratch",
            tr_project_3: "Jetson Nano Autonomous Vehicle",
            tr_github: "Github",
            tr_return: "Return",
            tr_linkedin: "LinkedIn",
            tr_mail: "Email",
            tr_link: "Link",
            button: 'JP'
        },
        jp: {
            tr_name: 'メリオーレス・マット',
            tr_about: 'プロフィール',
            tr_projects: 'プロジェクト',
            tr_notes: 'ノート',
            tr_contact: '連絡',
            tr_engineer: "電気工エンジニア",
            tr_resume: "履歴書",
            tr_edu: "学歴",
            tr_deg: "電気工学学士",
            tr_exp: "経験",
            tr_ucsd: "カリフォルニア大学サンディエゴ校",
            tr_long: "私はデータネットワークと面白いプロジェクトに興味がある情熱家です。現在、ノースロップ・グラマンで電気工エンジニアとして働いており、スケーラブルで堅牢なネットワーク・アーキテクチャとアプリケーションの設計で貴重な経験を積んでいます。余暇には、ゲームミュージックやボカロの作曲を楽しんでいます。",
            tr_project_1: "タタコン作成",
            tr_project_2: "ゼロからデータベース作り",
            tr_project_3: "ジェットソンナノ自動車",
            tr_github: "ギットハブ",
            tr_return: "リターン",
            tr_linkedin: "リンクトイン",
            tr_mail: "メール",
            tr_link: 'リンク',
            button: 'EN'
        }
    };

    const newLang = currentLang === 'en' ? 'jp' : 'en';

    const elements = document.querySelectorAll('[tr]');
    

    document.body.classList.remove('fade-in-content');
    document.body.classList.add('fade-out-content');
    

    setTimeout(() => {
        elements.forEach(element => {
            const key = element.getAttribute('tr');
            if (translations[newLang][key]) {
                element.textContent = translations[newLang][key];
            }
        });
        document.documentElement.setAttribute('lang', newLang);

        document.body.classList.remove('fade-out-content');
        document.body.classList.add('fade-in-content');

        
    }, 500);
};

// Taken from https://codepen.io/lucasdellabella
let styleSheet = null;

const SPARK_ELEMENT_WIDTH = 30;
const DISTANCE = 40;

const RANDOMNESS_ON = true;

/**
 * Util for creating sequences of css transform steps cleanly
 */
function createTransformSteps() {
  if (Array.from(arguments).length === 0) {
    throw new Error("arguments to createTransformSteps should never be empty!");
  }

  const inputSteps = Array.from(arguments);
  const outputSteps = [inputSteps.shift()];
  inputSteps.forEach((step, i) => {
    outputSteps.push(`${outputSteps[i]} ${step}`);
  });

  return outputSteps;
}

/**
 * Creates a new keyframe rule available in css context with a specific spark rotation
 */
const dynamicAnimation = (name, rotation) => {
  if (!styleSheet) {
    styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    document.head.appendChild(styleSheet);
  }

  /**
  Explaining the transform rules
  1. prepares spark
  2. shoots the spark out
  3. keeps the spark in place while scaling it down
  */

  const randomDist = RANDOMNESS_ON
    ? Math.floor((Math.random() - 0.5) * DISTANCE * 0.7)
    : 0;

  const [s1, s2, s3] = createTransformSteps(
    `translate(-50%, -50%) rotate(${rotation}deg) translate(10px, 0px)`,
    `translate(${DISTANCE + randomDist}px, 0px) scale(0.5, 0.5)`,
    `translate(${SPARK_ELEMENT_WIDTH / 2}px, 0) scale(0, 0)`
  );

  styleSheet.sheet.insertRule(
    `@keyframes ${name} {
     0% {
       transform: ${s1};
     }
     70% {
       transform: ${s2};
     }
     100% {
       transform: ${s3};
     }
  }`,
    styleSheet.length
  );
};

document.querySelectorAll('.icon').forEach(icon => {
  icon.addEventListener('click', (e) => {
    const center = { x: e.pageX, y: e.pageY };
    makeBurst(center);
  });
});

const makeBurst = (center) => {
  for (let i = 0; i < 8; i++) {
    const randomSpace = RANDOMNESS_ON
      ? Math.floor(-17 + Math.random() * 34)
      : 0;
    makeSpark(center, 45 * i + randomSpace);
  }
};

/**
 * Creates a spark
 */
const makeSpark = (center, rotation) => {
  const div = document.createElement("div");
  const aniName = `disappear_${rotation}`;
  dynamicAnimation(aniName, rotation);

  div.classList.add("spark");
  div.style.left = `${center.x}px`;
  div.style.top = `${center.y}px`;
  div.style.animation = `${aniName} 500ms ease-out both`;
  document.body.append(div);
  setTimeout(() => {
    document.body.removeChild(div);
  }, 1000);
};

