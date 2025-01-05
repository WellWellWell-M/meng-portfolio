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
        console.log('[Debug] 当前语言内容:', translations);

        // 创建翻译状态检查器
        const translationStatus = {
            success: [],
            failed: []
        };

        function logTranslationStatus(component, isSuccess, details = '') {
            if (isSuccess) {
                translationStatus.success.push(`${component} ✓ ${details}`);
            } else {
                translationStatus.failed.push(`${component} ✗ ${details}`);
            }
        }

        // 更新页面标题
        document.title = translations.title;
        logTranslationStatus('页面标题', true, translations.title);
        
        // 更新个人介绍
        const homeLink = document.getElementById('home-link');
        if (homeLink) {
            const h1 = homeLink.querySelector('h1');
            const desc = homeLink.querySelector('.description');
            if (h1) h1.textContent = translations.intro;
            if (desc) desc.textContent = translations.description;
            logTranslationStatus('个人介绍', true);
        }
        
        // 更新菜单项
        document.querySelectorAll('.menu-link').forEach(link => {
            const key = link.getAttribute('href').substring(1);
            const menuItem = translations.menu[key];
            if (menuItem) {
                const title = link.querySelector('.title');
                const description = link.querySelector('.description');
                if (title) title.textContent = menuItem.title;
                if (description) description.textContent = menuItem.description;
                logTranslationStatus(`菜单项 ${key}`, true);
            } else {
                logTranslationStatus(`菜单项 ${key}`, false, '未找到翻译');
            }
        });

        // 更新滚动描述
        const scrollDesc = document.querySelector('.scroll-description');
        if (scrollDesc && translations.common.scrollDescription) {
            scrollDesc.textContent = translations.common.scrollDescription;
            logTranslationStatus('滚动描述', true);
        }

        // 更新所有内容区域
        document.querySelectorAll('.content-section').forEach(section => {
            const sectionId = section.id;
            const sectionKey = sectionId.replace('-section', '');
            console.log(`[Debug] 处理内容区域: ${sectionKey}`);
            
            if (translations.sections && translations.sections[sectionKey]) {
                const sectionContent = translations.sections[sectionKey];
                
                // 更新标题（包括带链接的标题）
                const title = section.querySelector('h3 a, h3');
                if (title && sectionContent.title) {
                    try {
                        // 对于特定的section，保持原标题不翻译
                        const keepOriginalTitle = ['dreams-of-fuyao', 'xiu-xian'].includes(sectionKey);
                        
                        if (title.tagName === 'A') {
                            const href = title.getAttribute('href');
                            const target = title.getAttribute('target');
                            
                            // 创建新的链接元素
                            const newTitle = document.createElement('a');
                            newTitle.textContent = keepOriginalTitle ? title.textContent.replace('⤴', '').trim() : sectionContent.title;
                            newTitle.href = href;
                            if (target) newTitle.target = target;
                            newTitle.className = 'game-title';
                            
                            // 添加图标
                            const linkIcon = document.createElement('span');
                            linkIcon.className = 'link-icon';
                            linkIcon.textContent = '⤴';
                            newTitle.appendChild(linkIcon);
                            
                            // 替换原有标题
                            title.parentNode.replaceChild(newTitle, title);
                            logTranslationStatus(`标题 ${sectionKey}`, true, '链接已保留');
                        } else {
                            if (!keepOriginalTitle) {
                                title.textContent = sectionContent.title;
                            }
                            logTranslationStatus(`标题 ${sectionKey}`, true);
                        }
                    } catch (error) {
                        console.error(`[Error] 更新标题失败: ${sectionKey}`, error);
                        logTranslationStatus(`标题 ${sectionKey}`, false, error.message);
                    }
                }

                // 更新概述内容
                if (sectionContent.overview) {
                    try {
                        const overviewPs = section.querySelectorAll('p');
                        const overviewParagraphs = sectionContent.overview.split('\n\n');
                        overviewPs.forEach((p, index) => {
                            if (overviewParagraphs[index]) {
                                p.textContent = overviewParagraphs[index];
                            }
                        });
                        logTranslationStatus(`概述 ${sectionKey}`, true);
                    } catch (error) {
                        logTranslationStatus(`概述 ${sectionKey}`, false, error.message);
                    }
                }

                // 更新概念艺术和开发过程标题
                if (translations.common) {
                    try {
                        // 使用更准确的选择器
                        const h3Elements = section.querySelectorAll('h3');
                        h3Elements.forEach(h3 => {
                            if (h3.textContent.includes('Concept Art') && translations.common.conceptArt) {
                                h3.textContent = translations.common.conceptArt;
                                logTranslationStatus('概念艺术标题', true);
                            }
                            if (h3.textContent.includes('Development') && translations.common.development) {
                                h3.textContent = translations.common.development;
                                logTranslationStatus('开发过程标题', true);
                            }
                        });
                    } catch (error) {
                        logTranslationStatus('标题翻译', false, error.message);
                    }
                }

                // 更新概念艺术内容
                if (sectionContent.conceptArt) {
                    const conceptArtP = section.querySelector('.concept-art p');
                    if (conceptArtP) {
                        conceptArtP.textContent = sectionContent.conceptArt;
                        logTranslationStatus(`概念艺术内容 ${sectionKey}`, true);
                    }
                }

                // 更新开发过程内容
                if (sectionContent.development) {
                    const developmentP = section.querySelector('.development p');
                    if (developmentP) {
                        developmentP.textContent = sectionContent.development;
                        logTranslationStatus(`开发过程内容 ${sectionKey}`, true);
                    }
                }

                // 更新视频说明文本
                if (sectionContent.teaser) {
                    try {
                        const teaserPs = section.querySelectorAll('.introduction p');
                        const teaserParagraphs = sectionContent.teaser.split('\n\n');
                        teaserPs.forEach((p, index) => {
                            if (teaserParagraphs[index]) {
                                p.textContent = teaserParagraphs[index];
                            }
                        });
                        logTranslationStatus(`视频说明 ${sectionKey}`, true);
                    } catch (error) {
                        logTranslationStatus(`视频说明 ${sectionKey}`, false, error.message);
                    }
                }

                // 更新关于页面
                if (sectionKey === 'about') {
                    try {
                        // 更新经历标题
                        const expTitle = section.querySelector('.about-card h2');
                        if (expTitle && sectionContent.experience?.title) {
                            expTitle.textContent = sectionContent.experience.title;
                        }

                        // 更新经历项目
                        const expItems = section.querySelectorAll('.experience-item');
                        expItems.forEach((item, index) => {
                            const expData = sectionContent.experience?.items[index];
                            if (expData) {
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

                        // 更新联系方式标题和内容
                        if (sectionContent.contact) {
                            const contactTitle = section.querySelector('.about-card:last-child h2');
                            if (contactTitle) {
                                contactTitle.textContent = sectionContent.contact.title;
                            }
                        }
                        logTranslationStatus('关于页面', true);
                    } catch (error) {
                        logTranslationStatus('关于页面', false, error.message);
                    }
                }

                // 更新后记内容
                if (sectionContent.afterword) {
                    try {
                        // 使用更准确的选择器
                        const h3Elements = section.querySelectorAll('h3');
                        h3Elements.forEach(h3 => {
                            if (h3.textContent.trim() === 'Afterword' && translations.common?.afterword) {
                                h3.textContent = translations.common.afterword;
                            }
                        });
                        
                        // 选择后记段落
                        const afterwordPs = Array.from(section.querySelectorAll('p')).filter(p => {
                            const previousH3 = p.previousElementSibling;
                            return previousH3 && (previousH3.textContent.trim() === 'Afterword' || 
                                   previousH3.textContent.trim() === translations.common?.afterword);
                        });
                        
                        const afterwordParagraphs = sectionContent.afterword.split('\n\n');
                        afterwordPs.forEach((p, index) => {
                            if (afterwordParagraphs[index]) {
                                p.textContent = afterwordParagraphs[index];
                            }
                        });
                        logTranslationStatus(`后记 ${sectionKey}`, true);
                    } catch (error) {
                        logTranslationStatus(`后记 ${sectionKey}`, false, error.message);
                    }
                }

                // 更新漫画注释内容
                if (sectionContent.note) {
                    try {
                        // 使用更准确的选择器
                        const h3Elements = section.querySelectorAll('h3');
                        h3Elements.forEach(h3 => {
                            if (h3.textContent.trim() === 'Note' && translations.common?.note) {
                                h3.textContent = translations.common.note;
                            }
                        });
                        
                        const notePs = section.querySelectorAll('.introduction p');
                        const noteParagraphs = sectionContent.note.split('\n\n');
                        notePs.forEach((p, index) => {
                            if (noteParagraphs[index]) {
                                p.textContent = noteParagraphs[index];
                            }
                        });
                        logTranslationStatus(`注释 ${sectionKey}`, true);
                    } catch (error) {
                        logTranslationStatus(`注释 ${sectionKey}`, false, error.message);
                    }
                }

                // 更新诗歌内容
                if (sectionContent.poem) {
                    try {
                        const poemTitle = section.querySelector('h3:contains("Poem")');
                        if (poemTitle && translations.common?.poem) {
                            poemTitle.textContent = translations.common.poem;
                        }
                        
                        const poemPs = section.querySelectorAll('.introduction p');
                        const poemParagraphs = sectionContent.poem.split('\n\n');
                        poemPs.forEach((p, index) => {
                            if (poemParagraphs[index]) {
                                p.textContent = poemParagraphs[index];
                            }
                        });
                        logTranslationStatus(`诗歌 ${sectionKey}`, true);
                    } catch (error) {
                        logTranslationStatus(`诗歌 ${sectionKey}`, false, error.message);
                    }
                }
            } else {
                logTranslationStatus(sectionKey, false, '未找到翻译内容');
            }
        });

        // 输出翻译状态报告
        console.log('\n[Translation Status Report]');
        console.log('成功翻译的组件:');
        translationStatus.success.forEach(item => console.log('✓', item));
        console.log('\n失败的翻译:');
        translationStatus.failed.forEach(item => console.log('✗', item));
        
        // 如果有失败的翻译，尝试自动修复
        if (translationStatus.failed.length > 0) {
            console.log('\n[Auto-fix] 尝试修复失败的翻译...');
            
            // 遍历失败的翻译
            translationStatus.failed.forEach(failure => {
                console.log(`[Auto-fix] 尝试修复: ${failure}`);
                
                // 如果是标题翻译失败，尝试使用备用方法
                if (failure.includes('标题翻译')) {
                    document.querySelectorAll('.content-section').forEach(section => {
                        const h3Elements = section.querySelectorAll('h3');
                        h3Elements.forEach(h3 => {
                            // 检查并翻译概念艺术标题
                            if (h3.textContent.trim() === 'Concept Art' && translations.common?.conceptArt) {
                                h3.textContent = translations.common.conceptArt;
                                console.log('[Auto-fix] 已修复概念艺术标题');
                            }
                            // 检查并翻译开发过程标题
                            if (h3.textContent.trim() === 'Development' && translations.common?.development) {
                                h3.textContent = translations.common.development;
                                console.log('[Auto-fix] 已修复开发过程标题');
                            }
                        });
                    });
                }
                
                // 如果是about页面翻译失败，尝试重新翻译
                if (failure.includes('about')) {
                    const aboutSection = document.getElementById('about-section');
                    if (aboutSection && translations.sections?.about) {
                        const sectionContent = translations.sections.about;
                        
                        // 重新翻译经历标题
                        const expTitle = aboutSection.querySelector('.about-card h2');
                        if (expTitle && sectionContent.experience?.title) {
                            expTitle.textContent = sectionContent.experience.title;
                            console.log('[Auto-fix] 已修复经历标题');
                        }
                        
                        // 重新翻译联系方式标题
                        const contactTitle = aboutSection.querySelector('.about-card:last-child h2');
                        if (contactTitle && sectionContent.contact?.title) {
                            contactTitle.textContent = sectionContent.contact.title;
                            console.log('[Auto-fix] 已修复联系方式标题');
                        }
                    }
                }
            });
        }

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
        const contentElement = document.getElementById(storyId);
        if (!contentElement) {
            console.warn(`[Warning] 未找到内容元素: ${storyId}`);
            return;
        }

        try {
            console.log(`[Content] 开始加载故事内容: ${contentFile}`);
            const response = await fetch(`content/${contentFile}.html`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const content = await response.text();
            contentElement.innerHTML = content;
            console.log(`[Content] 成功加载故事内容: ${contentFile}`);
            
        } catch (error) {
            console.error(`[Error] 加载故事内容失败 (${contentFile}):`, error);
            contentElement.innerHTML = `<p class="error-message">加载内容失败: ${error.message}</p>`;
        }
    }

    // 当点击菜单项时加载所有故事
    document.querySelector('a[href="#more-samples"]')?.addEventListener('click', async () => {
        console.log('[Content] 开始加载所有故事内容');
        const stories = [
            { id: 'story-content-1', file: 'story-content-1' },
            { id: 'story-content-2', file: 'story-content-2' },
            { id: 'story-content-3', file: 'story-content-3' },
            { id: 'story-content-4', file: 'story-content-4' }
        ];

        // 确保所有内容容器都存在
        const allContainersExist = stories.every(story => {
            const exists = document.getElementById(story.id) !== null;
            if (!exists) {
                console.warn(`[Warning] 未找到故事容器: ${story.id}`);
            }
            return exists;
        });

        if (!allContainersExist) {
            console.error('[Error] 部分故事容器不存在，停止加载');
            return;
        }

        try {
            await Promise.all(stories.map(story => 
                loadStoryContent(story.id, story.file)
            ));
            console.log('[Content] 所有故事内容加载完成');
        } catch (error) {
            console.error('[Error] 加载故事内容时发生错误:', error);
        }
    });

    // 点击其他菜单项时移除主页类
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.content').classList.remove('showing-home');
        });
    });
}); 