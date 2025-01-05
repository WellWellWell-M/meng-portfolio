document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.menu-link');
    const contentSections = document.querySelectorAll('.content-section');
    const scrollContainer = document.querySelector('.scroll-container');
    const homeLink = document.getElementById('home-link');

    // 显示主页
    function showHome() {
        // 显示塞尔达图片
        scrollContainer.style.display = 'block';
        // 添加主页特殊类
        document.querySelector('.content').classList.add('showing-home');
        // 隐藏所有项目内容
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        // 移除所有菜单项的激活状态
        menuLinks.forEach(link => {
            link.classList.remove('active');
        });
    }

    // 修改菜单点击事件处理
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 隐藏塞尔达图片
            scrollContainer.style.display = 'none';
            
            // 移除所有链接和区块的active类
            menuLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // 为点击的链接添加active类
            link.classList.add('active');
            
            // 显示对应的区块
            const sectionId = link.getAttribute('href').substring(1) + '-section';
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
                // 扩大行距
                document.querySelector('.menu').classList.add('expanded');
                // 滚动到页面顶部
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'  // 添加平滑滚动效果
                });
                
                // 如果是The WELL页面，加载内容
                if (sectionId === 'the-well-section') {
                    loadStoryContent();
                }
            }
        });
    });

    // 监听内容区的隐藏事件，移除行距
    contentSections.forEach(section => {
        section.addEventListener('transitionend', () => {
            if (!section.classList.contains('active')) {
                document.querySelector('.menu').classList.remove('expanded');
            }
        });
    });

    // 点击头像/名字返回主页
    homeLink.addEventListener('click', showHome);

    // 初始显示主页
    showHome();

    let currentLanguage = 'en'; // 默认语言

    // 加载语言文件并更新内容
    async function loadLanguage(lang) {
        const response = await fetch(`locales/${lang}.json`);
        const translations = await response.json();
        updateContent(translations);
    }

    // 更新页面内容
    function updateContent(translations) {
        document.title = translations.title;
        document.getElementById('home-link').querySelector('h1').textContent = translations.intro;
        document.getElementById('home-link').querySelector('.description').textContent = translations.description;

        const menuLinks = document.querySelectorAll('.menu-link');
        menuLinks.forEach(link => {
            const key = link.getAttribute('href').substring(1).replace('-', '');
            link.querySelector('.title').textContent = translations.menu[key].title;
            link.querySelector('.description').textContent = translations.menu[key].description;
        });

        // 更新项目详细内容
        const currentSectionId = document.querySelector('.content-section.active').id;
        const projectKey = currentSectionId.replace('-section', '');
        const projectDetails = translations.projectDetails[projectKey];

        if (projectDetails) {
            document.querySelector('.project-content .overview').textContent = projectDetails.overview;
            document.querySelector('.project-content .concept-art').textContent = projectDetails.conceptArt;
            document.querySelector('.project-content .development').textContent = projectDetails.development;
        }
    }

    // 语言切换事件
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            currentLanguage = lang;
            loadLanguage(currentLanguage);
        });
    });

    // 初始加载
    loadLanguage(currentLanguage);

    // 加载故事内容的函数
    async function loadStoryContent(storyId, contentFile) {
        try {
            const response = await fetch(`content/${contentFile}.html`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const content = await response.text();
            document.getElementById(storyId).innerHTML = content;
            
        } catch (error) {
            console.error('Error loading story content:', error);
            document.getElementById(storyId).innerHTML = 
                `<p>Error loading content: ${error.message}</p>`;
        }
    }

    // 当点击菜单项时加载所有故事
    document.querySelector('a[href="#more-samples"]')?.addEventListener('click', () => {
        loadStoryContent('story-content-1', 'story-content-1');
        loadStoryContent('story-content-2', 'story-content-2');
        loadStoryContent('story-content-3', 'story-content-3');
        loadStoryContent('story-content-4', 'story-content-4');
    });

    // 点击其他菜单项时移除主页类
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.content').classList.remove('showing-home');
        });
    });
}); 