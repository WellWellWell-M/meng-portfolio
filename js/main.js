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

    let currentLanguage = localStorage.getItem('preferredLanguage') || 'en'; // 从本地存储获取语言偏好

    // 更新语言切换按钮状态
    function updateLanguageButtons() {
        document.querySelectorAll('.language-option').forEach(button => {
            if (button.getAttribute('data-lang') === currentLanguage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // 更新 HTML 语言属性
    function updateHtmlLang(lang) {
        document.documentElement.setAttribute('lang', lang);
    }

    // 加载语言文件并更新内容
    async function loadLanguage(lang) {
        console.log(`[Language] 开始加载语言文件: ${lang}`);
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const translations = await response.json();
            console.log('[Language] 成功加载语言文件:', translations);
            updateContent(translations);
            currentLanguage = lang;
            localStorage.setItem('preferredLanguage', lang);
            updateLanguageButtons();
            updateHtmlLang(lang);
        } catch (error) {
            console.error('[Language] 加载语言文件失败:', error);
        }
    }

    // 更新页面内容的函数
    function updateContent(translations) {
        console.log('[Update] 开始更新页面内容');

        // 更新页面标题
        document.title = translations.title;
        console.log('[Update] 页面标题已更新为:', translations.title);
        
        // 更新个人介绍
        const homeLink = document.getElementById('home-link');
        if (homeLink) {
            const h1 = homeLink.querySelector('h1');
            const desc = homeLink.querySelector('.description');
            if (h1) h1.textContent = translations.intro;
            if (desc) desc.textContent = translations.description;
            console.log('[Update] 个人介绍已更新:', { intro: translations.intro, desc: translations.description });
        } else {
            console.warn('[Update] 未找到 home-link 元素');
        }
        
        // 更新菜单项
        console.log('[Update] 开始更新菜单项');
        document.querySelectorAll('.menu-link').forEach(link => {
            // 获取原始 href 值，移除开头的 #
            const key = link.getAttribute('href').substring(1);
            console.log(`[Update] 处理菜单项: ${key}`);
            const menuItem = translations.menu[key];
            if (menuItem) {
                const title = link.querySelector('.title');
                const description = link.querySelector('.description');
                if (title) title.textContent = menuItem.title;
                if (description) description.textContent = menuItem.description;
                console.log(`[Update] 菜单项已更新: ${key}`, menuItem);
            } else {
                console.warn(`[Update] 未找到菜单项的翻译: ${key}`);
            }
        });

        // 更新滚动描述
        const scrollDesc = document.querySelector('.scroll-description');
        if (scrollDesc && translations.common.scrollDescription) {
            scrollDesc.textContent = translations.common.scrollDescription;
            console.log('[Update] 滚动描述已更新:', translations.common.scrollDescription);
        }

        // 更新所有内容区域
        console.log('[Update] 开始更新内容区域');
        document.querySelectorAll('.content-section').forEach(section => {
            const sectionId = section.id;
            // 移除 -section 后缀
            const sectionKey = sectionId.replace('-section', '');
            console.log(`[Update] 处理内容区域: ${sectionId} -> ${sectionKey}`);
            
            // 检查是否有对应的翻译内容
            if (translations.sections && translations.sections[sectionKey]) {
                const sectionContent = translations.sections[sectionKey];
                console.log(`[Debug] 找到区域翻译:`, sectionContent);
                
                // 更新标题（包括带链接的标题）
                const title = section.querySelector('h3 a, h3');
                if (title && sectionContent.title) {
                    console.log(LogLevel.DEBUG, `更新标题元素:`, {
                        element: title.tagName,
                        currentText: title.textContent,
                        newText: sectionContent.title
                    });
                    
                    if (title.tagName === 'A') {
                        // 保存原有的链接和图标
                        const href = title.getAttribute('href');
                        const target = title.getAttribute('target');
                        const linkIcon = title.querySelector('.link-icon');
                        
                        // 清空内容并重新设置
                        title.textContent = sectionContent.title;
                        
                        // 恢复链接属性
                        if (href) title.setAttribute('href', href);
                        if (target) title.setAttribute('target', target);
                        
                        // 恢复图标
                        if (linkIcon) {
                            const newLinkIcon = document.createElement('span');
                            newLinkIcon.className = 'link-icon';
                            newLinkIcon.textContent = '⤴';  // 使用固定的图标文本
                            title.appendChild(newLinkIcon);
                        }
                        
                        console.log(LogLevel.DEBUG, `更新链接标题完成: ${sectionContent.title}`);
                    } else {
                        title.textContent = sectionContent.title;
                        console.log(LogLevel.DEBUG, `更新普通标题完成: ${sectionContent.title}`);
                    }
                    console.log(`[Update] 区域标题已更新: ${sectionContent.title}`);
                }

                // 更新视频说明文本
                if (sectionContent.teaser) {
                    const teaserPs = section.querySelectorAll('.introduction p');
                    const teaserParagraphs = sectionContent.teaser.split('\n\n');
                    console.log(`[Debug] 更新预告片说明:`, {
                        paragraphCount: teaserPs.length,
                        content: teaserParagraphs
                    });
                    teaserPs.forEach((p, index) => {
                        if (teaserParagraphs[index]) {
                            p.textContent = teaserParagraphs[index];
                            console.log(`[Debug] 更新预告片段落 ${index}`);
                        }
                    });
                }

                // 更新后记
                if (sectionContent.afterword) {
                    const afterwordPs = section.querySelectorAll('p');
                    const afterwordParagraphs = sectionContent.afterword.split('\n\n');
                    console.log(`[Debug] 更新后记:`, {
                        paragraphCount: afterwordPs.length,
                        content: afterwordParagraphs
                    });
                    afterwordPs.forEach((p, index) => {
                        if (afterwordParagraphs[index]) {
                            p.textContent = afterwordParagraphs[index];
                            console.log(`[Debug] 更新后记段落 ${index}`);
                        }
                    });
                }

                // 更新关于页面
                if (sectionKey === 'about') {
                    console.log('[Update] 更新关于页面');
                    
                    // 更新经历标题
                    const expTitle = section.querySelector('.about-card h2');
                    if (expTitle && sectionContent.experience?.title) {
                        expTitle.textContent = sectionContent.experience.title;
                        console.log('[Debug] 更新经历标题:', sectionContent.experience.title);
                    }

                    // 更新经历项目
                    const expItems = section.querySelectorAll('.experience-item');
                    expItems.forEach((item, index) => {
                        const expData = sectionContent.experience?.items[index];
                        if (expData) {
                            console.log(`[Debug] 更新经历项目 ${index}:`, expData);
                            const year = item.querySelector('.year');
                            const jobTitle = item.querySelector('.job-title');
                            const projectName = item.querySelector('.project-name');
                            
                            if (year) year.textContent = expData.year;
                            if (jobTitle) jobTitle.textContent = expData.title;
                            if (projectName && expData.project) {
                                projectName.textContent = expData.project;
                            }
                        }
                    });

                    // 更新联系方式标题
                    const contactTitle = section.querySelector('.contact h2');
                    if (contactTitle && sectionContent.contact?.title) {
                        contactTitle.textContent = sectionContent.contact.title;
                        console.log('[Debug] 更新联系方式标题:', sectionContent.contact.title);
                    }
                }
            } else {
                console.warn(`[Update] 未找到区域的翻译内容: ${sectionKey}`);
            }
        });

        console.log('[Update] 页面内容更新完成');
    }

    // 语言切换事件
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            if (lang) {  // 确保获取到了语言值
                console.log(`[Language] 切换语言到: ${lang}`);
                loadLanguage(lang);
            }
        });
    });

    // 初始化语言
    loadLanguage(currentLanguage);
    updateLanguageButtons();

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