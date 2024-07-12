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
            tr_blog: 'Blog',
            tr_hello: "Hello, I'm",
            tr_engineer: "Electrical Engineer",
            tr_resume: "Resume",
            tr_get: "Get To Know More",
            tr_aboutme: "About Me",
            tr_new: "3+ Years of Professional Internship Experience",
            tr_ee: "Electrical Engineer",
            tr_edu: "Education",
            tr_deg: "B.Sc. Electrical Engineering",
            tr_skill: "Experience",
            tr_ucsd: "UC San Diego",
            tr_long: "I'm a passionate individual interested in Data Networks and cool projects. I'm currently working at Northrop Grumman as a Network Engineer, where I have built valuable experience designing scalable and robust network architecture and applications. In my free time, I enjoy composing video game and japanese alt rock music.",
            tr_explore: "Explore My",
            tr_programming:"Programming Languages",
            tr_other: "Other Tools",
            tr_proficient:"Proficient",
            tr_intermediate:"Intermediate",
            tr_basic:"Basic",
            tr_browse: "Browse My Recent",
            tr_project_1: "Project One",
            tr_project_2: "Project Two",
            tr_project_3: "Project Three",
            tr_touch: "Get in Touch",
            tr_github: "Github",
            tr_linkedin: "LinkedIn",
            tr_copyright: "Copyright © 2024 Matthew Merioles. All Rights Reserved.",
            tr_link: "Link",
            button: 'JP'
        },
        jp: {
            tr_name: 'メリオーレス・マット',
            tr_about: 'プロフィール',
            tr_experience: 'スキル',
            tr_projects: 'プロジェクト',
            tr_blog: 'ブログ',
            tr_contact: '連絡',
            tr_hello: "初めまして、私は",
            tr_engineer: "電気工エンジニア",
            tr_resume: "履歴書",
            tr_get: "私について",
            tr_aboutme: "プロフィール",
            tr_new: "3年以上のプロフェッショナルなインターンシップ経験",
            tr_ee: "電気工学",
            tr_edu: "学歴",
            tr_deg: "電気工学学士",
            tr_skill: "スキル",
            tr_ucsd: "カリフォルニア大学サンディエゴ校",
            tr_long: "私はデータネットワークとクールなプロジェクトに興味がある情熱家です。現在、ノースロップ・グラマンでネットワーク・エンジニアとして働いており、スケーラブルで堅牢なネットワーク・アーキテクチャとアプリケーションの設計で貴重な経験を積んでいます。自由時間には、ビデオゲームや日本のオルタナロックの作曲を楽しんでいます。",
            tr_explore: "私の",
            tr_programming:"プログラミング言語",
            tr_other: "他のソフトウェア",
            tr_proficient:"上級レベル",
            tr_intermediate:"中級レベル",
            tr_basic:"基本レベル",
            tr_browse: "最近の",
            tr_project_1: "プロジェクト１",
            tr_project_2: "プロジェクト２",
            tr_project_3: "プロジェクト３",
            tr_touch: "お問い合わせ",
            tr_github: "ギットハブ",
            tr_linkedin: "リンクトイン",
            tr_copyright: "著作権 © 2024 メリーレス・マット 無断複製/無断転載",
            tr_link: 'リンク',
            button: 'EN'
        }
    };

    const newLang = currentLang === 'en' ? 'jp' : 'en';

    const elements = document.querySelectorAll('[tr]');

    document.body.classList.remove('fade-in-content');
    document.body.classList.add('fade-out-content');;

    setTimeout(() => {
        elements.forEach(element => {
            const key = element.getAttribute('tr');
            if (translations[newLang][key]) {
                element.textContent = translations[newLang][key];
            }
        });

        document.body.classList.remove('fade-out-content');
        document.body.classList.add('fade-in-content');

        document.documentElement.setAttribute('lang', newLang);
    }, 500);
};