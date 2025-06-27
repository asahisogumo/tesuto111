document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.querySelector('.calendar-grid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar nav ul li a'); 
    const contentSections = document.querySelectorAll('.content-section');

    const memoModal = document.getElementById('memoModal');
    const closeModalButton = memoModal.querySelector('.close-button');
    const modalDate = document.getElementById('modalDate');
    const memosForDate = document.getElementById('memosForDate');
    const memoInput = document.getElementById('memoInput');
    const addMemoButton = document.getElementById('addMemoButton');
    
    const feedbackForm = document.getElementById('feedbackForm');
    const currentDateTimeElement = document.getElementById('currentDateTime');

    const toggleDarkModeBtn = document.getElementById('toggleDarkMode');
    const digitalClockElement = document.getElementById('digitalClock');
    const analogClockCanvas = document.getElementById('analogClock'); 
    const analogCtx = analogClockCanvas.getContext('2d'); 

    const digitalClockSkinSubmenu = document.getElementById('digitalClockSkinSubmenu'); 
    const analogClockSkinSubmenu = document.getElementById('analogClockSkinSubmenu'); 
    const digitalClockSizeSubmenu = document.getElementById('digitalClockSizeSubmenu'); 
    const analogClockSizeSubmenu = document.getElementById('analogClockSizeSubmenu'); 

    const hasSubmenuItems = document.querySelectorAll('.has-submenu');

    let currentDate = new Date(); 
    let selectedDate = null; 
    const memos = {}; 

    // --- 日本の祝日データ (2024年〜2026年) ---
    const holidays = {
        '2024-01-01': '元日', '2024-01-08': '成人の日', '2024-02-11': '建国記念の日', '2024-02-12': '振替休日', '2024-02-23': '天皇誕生日', '2024-03-20': '春分の日', '2024-04-29': '昭和の日', '2024-05-03': '憲法記念日', '2024-05-04': 'みどりの日', '2024-05-05': 'こどもの日', '2024-05-06': '振替休日', '2024-07-15': '海の日', '2024-08-11': '山の日', '2024-08-12': '振替休日', '2024-09-16': '敬老の日', '2024-09-22': '秋分の日', '2024-09-23': '振替休日', '2024-10-14': 'スポーツの日', '2024-11-03': '文化の日', '2024-11-04': '振替休日', '2024-11-23': '勤労感謝の日',
        '2025-01-01': '元日', '2025-01-13': '成人の日', '2025-02-11': '建国記念の日', '2025-02-23': '天皇誕生日', '2025-02-24': '振替休日', '2025-03-20': '春分の日', '2025-04-29': '昭和の日', '2025-05-03': '憲法記念日', '2025-05-04': 'みどりの日', '2025-05-05': 'こどもの日', '2025-05-06': '振替休日', '2025-07-21': '海の日', '2025-08-11': '山の日', '2025-09-15': '敬老の日', '2025-09-23': '秋分の日', '2025-10-13': 'スポーツの日', '2025-11-03': '文化の日', '2025-11-23': '勤労感謝の日', '2025-11-24': '振替休日',
        '2026-01-01': '元日', '2026-01-12': '成人の日', '2026-02-11': '建国記念の日', '2026-02-23': '天皇誕生日', '2026-03-20': '春分の日', '2026-04-29': '昭和の日', '2026-05-03': '憲法記念日', '2026-05-04': 'みどりの日', '2026-05-05': 'こどもの日', '2026-05-06': '振替休日', '2026-07-20': '海の日', '2026-08-11': '山の日', '2026-09-21': '敬老の日', '2026-09-22': '国民の休日', '2026-09-23': '秋分の日', '2026-10-12': 'スポーツの日', '2026-11-03': '文化の日', '2026-11-23': '勤労感謝の日',
    };

    // --- 現在の日付と時刻をフッターに表示 ---
    function updateCurrentDateTime() {
        const now = new Date();
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        currentDateTimeElement.textContent = `現在日時: ${now.toLocaleString('ja-JP', options)} JST`;
    }
    updateCurrentDateTime();
    setInterval(updateCurrentDateTime, 1000);

    // --- 時計スキンとサイズの設定 ---
    const clockSkins = {
        digital: [
            { name: 'デフォルト', className: 'clock-skin-0' },
            { name: '青系デジタル', className: 'clock-skin-1' },
            { name: '緑系シンプル', className: 'clock-skin-2' },
            { name: '丸形デジタル', className: 'clock-skin-3' }
        ],
        analog: [
            { name: 'アナログ時計1 (シンプル)', className: 'clock-skin-4' },
            { name: 'アナログ時計2 (モダン)', className: 'clock-skin-5' }
        ]
    };
    const clockSizes = {
        digital: {
            'small': 'digital-clock-size-small',
            'medium': 'digital-clock-size-medium',
            'large': 'digital-clock-size-large'
        },
        analog: {
            'small': 'analog-size-small',
            'medium': 'analog-size-medium',
            'large': 'analog-size-large'
        }
    };

    let currentClockType = localStorage.getItem('clockType') || 'digital'; // 'digital' or 'analog'
    let currentDigitalSkinIndex = parseInt(localStorage.getItem('digitalClockSkinIndex')) || 0;
    let currentAnalogSkinIndex = parseInt(localStorage.getItem('analogClockSkinIndex')) || 0;
    let currentDigitalSize = localStorage.getItem('digitalClockSize') || 'medium';
    let currentAnalogSize = localStorage.getItem('analogClockSize') || 'medium';

    // 時計の表示/非表示とスキンクラス、サイズクラスの適用
    function applyClockSettings() {
        // 全ての時計要素とスキンクラス、サイズクラスをリセット
        digitalClockElement.style.display = 'none';
        analogClockCanvas.style.display = 'none';
        
        digitalClockElement.classList.remove(...clockSkins.digital.map(s => s.className));
        analogClockCanvas.classList.remove(...clockSkins.analog.map(s => s.className));
        
        digitalClockElement.classList.remove(...Object.values(clockSizes.digital));
        analogClockCanvas.classList.remove(...Object.values(clockSizes.analog));

        if (currentClockType === 'digital') {
            const selectedSkin = clockSkins.digital[currentDigitalSkinIndex];
            digitalClockElement.style.display = 'flex'; 
            digitalClockElement.classList.add(selectedSkin.className);
            digitalClockElement.classList.add(clockSizes.digital[currentDigitalSize]); 
            updateDigitalClockContent(); // デジタル時計のコンテンツを更新
        } else if (currentClockType === 'analog') {
            const selectedSkin = clockSkins.analog[currentAnalogSkinIndex];
            analogClockCanvas.style.display = 'block'; 
            analogClockCanvas.classList.add(selectedSkin.className);
            analogClockCanvas.classList.add(clockSizes.analog[currentAnalogSize]); 
            
            // アナログ時計のcanvasのwidth/heightをCSSから取得してセット
            const computedStyle = getComputedStyle(analogClockCanvas);
            analogClockCanvas.width = parseInt(computedStyle.width);
            analogClockCanvas.height = parseInt(computedStyle.height);
            drawAnalogClock(); // アナログ時計を描画
        }
        localStorage.setItem('clockType', currentClockType);
    }

    // デジタル時計のコンテンツを更新する関数（丸形デジタルも含む）
    function updateDigitalClockContent() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        if (clockSkins.digital[currentDigitalSkinIndex].className === 'clock-skin-3') {
            digitalClockElement.innerHTML = `<span class="main-time">${hours}:${minutes}</span><span class="seconds">${seconds}</span>`;
        } else {
            digitalClockElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }

    // アナログ時計の描画関数
    function drawAnalogClock() {
        const radius = analogClockCanvas.width / 2;
        analogCtx.clearRect(0, 0, analogClockCanvas.width, analogClockCanvas.height);
        analogCtx.save(); 
        analogCtx.translate(radius, radius); 

        const isDarkMode = document.body.classList.contains('dark-mode');
        const selectedSkinClass = clockSkins.analog[currentAnalogSkinIndex].className;

        let faceColor, hourHandColor, minuteHandColor, secondHandColor, tickColor;
        // アナログ時計スキンの色定義をJavaScriptで
        switch(selectedSkinClass) {
            case 'clock-skin-4': // アナログ時計1 (シンプル)
                faceColor = isDarkMode ? '#1e2a4a' : '#ffffff';
                hourHandColor = isDarkMode ? '#e0e0e0' : '#333333';
                minuteHandColor = isDarkMode ? '#e0e0e0' : '#333333';
                secondHandColor = isDarkMode ? '#ff6b6b' : 'red';
                tickColor = isDarkMode ? '#a0a0a0' : '#555555';
                break;
            case 'clock-skin-5': // アナログ時計2 (モダン)
                faceColor = isDarkMode ? '#0f3460' : '#f0f0f0';
                hourHandColor = isDarkMode ? '#ffffff' : '#111111';
                minuteHandColor = isDarkMode ? '#ffffff' : '#111111';
                secondHandColor = isDarkMode ? '#8c52ff' : '#007bff';
                tickColor = isDarkMode ? '#b0b0b0' : '#777777';
                break;
            default: // フォールバック
                faceColor = isDarkMode ? '#16213e' : '#fefefe';
                hourHandColor = isDarkMode ? '#e0e0e0' : '#333';
                minuteHandColor = isDarkMode ? '#e0e0e0' : '#333';
                secondHandColor = isDarkMode ? '#e94560' : 'red';
                tickColor = isDarkMode ? '#a0a0a0' : '#555';
                break;
        }

        // 文字盤の描画
        analogCtx.beginPath();
        analogCtx.arc(0, 0, radius - 2, 0, 2 * Math.PI); 
        analogCtx.fillStyle = faceColor; 
        analogCtx.fill();
        analogCtx.strokeStyle = isDarkMode ? getComputedStyle(analogClockCanvas).borderColor : getComputedStyle(analogClockCanvas).borderColor; // CSSから取得
        analogCtx.lineWidth = 2;
        analogCtx.stroke();

        // 目盛り
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 * Math.PI) / 180;
            analogCtx.beginPath();
            analogCtx.strokeStyle = tickColor;
            analogCtx.lineWidth = (i % 3 === 0) ? 3 : 1; 
            analogCtx.moveTo((radius * 0.8) * Math.sin(angle), -(radius * 0.8) * Math.cos(angle));
            analogCtx.lineTo((radius * 0.9) * Math.sin(angle), -(radius * 0.9) * Math.cos(angle));
            analogCtx.stroke();
        }

        const now = new Date();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();

        // 時針
        hour = hour % 12;
        let hourAngle = ((hour * 30 + minute / 2) * Math.PI) / 180;
        drawHand(hourAngle, radius * 0.5, 4, hourHandColor);

        // 分針
        let minuteAngle = ((minute * 6 + second / 10) * Math.PI) / 180;
        drawHand(minuteAngle, radius * 0.7, 3, minuteHandColor);

        // 秒針
        let secondAngle = (second * 6 * Math.PI) / 180;
        drawHand(secondAngle, radius * 0.8, 1, secondHandColor);

        // 中心点
        analogCtx.beginPath();
        analogCtx.arc(0, 0, 3, 0, 2 * Math.PI);
        analogCtx.fillStyle = isDarkMode ? '#e0e0e0' : '#333'; 
        analogCtx.fill();

        analogCtx.restore(); 
    }

    // 針の描画ヘルパー
    function drawHand(angle, length, width, color) {
        analogCtx.beginPath();
        analogCtx.lineWidth = width;
        analogCtx.lineCap = 'round';
        analogCtx.strokeStyle = color;
        analogCtx.moveTo(0, 0);
        analogCtx.lineTo(length * Math.sin(angle), -length * Math.cos(angle));
        analogCtx.stroke();
    }

    // 時計の更新ループ（1秒ごとにどちらかの時計を描画/更新）
    setInterval(applyClockSettings, 1000); 

    // 時計スキン選択肢を動的に生成
    clockSkins.digital.forEach((skin, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = skin.name;
        a.dataset.action = 'changeDigitalClockSkin';
        a.dataset.skinIndex = index;
        li.appendChild(a);
        digitalClockSkinSubmenu.appendChild(li);
    });

    clockSkins.analog.forEach((skin, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = skin.name;
        a.dataset.action = 'changeAnalogClockSkin';
        a.dataset.skinIndex = index;
        li.appendChild(a);
        analogClockSkinSubmenu.appendChild(li);
    });

    // ページロード時にスキンとサイズ設定を読み込む
    applyClockSettings(); // 初回適用


    // --- カレンダー描画関数 (ダブルクリックでメモモーダルを開く) ---
    function renderCalendar() {
        calendarGrid.querySelectorAll('.date-cell').forEach(cell => cell.remove()); 

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); 

        currentMonthYear.textContent = `${year}年${month + 1}月`;

        const firstDayOfMonth = new Date(year, month, 1);
        const startDayOfWeek = firstDayOfMonth.getDay();

        const totalCells = 42; 

        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        for (let i = 0; i < totalCells; i++) {
            const dateCell = document.createElement('div');
            dateCell.classList.add('date-cell');

            const date = new Date(year, month, i - startDayOfWeek + 1);
            const day = date.getDate();
            const cellMonth = date.getMonth();
            const cellYear = date.getFullYear();

            const dateNumber = document.createElement('div');
            dateNumber.classList.add('date-number');
            dateNumber.textContent = day;
            dateCell.appendChild(dateNumber);

            const dateString = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dateCell.dataset.date = dateString; 

            if (cellYear === todayYear && cellMonth === todayMonth && day === todayDate) {
                dateCell.classList.add('today');
            }

            if (cellMonth !== month) {
                dateCell.classList.add('other-month');
            }
            
            if (holidays[dateString] || date.getDay() === 0) { 
                dateCell.classList.add('holiday'); 
                if (holidays[dateString]) { 
                    const holidayName = document.createElement('div');
                    holidayName.classList.add('holiday-name');
                    holidayName.textContent = holidays[dateString];
                    dateCell.appendChild(holidayName);
                }
            }
            if (date.getDay() === 6) { 
                dateCell.classList.add('saturday'); 
            }

            if (memos[dateString] && memos[dateString].length > 0) {
                const memoCountIndicator = document.createElement('div');
                memoCountIndicator.classList.add('note-indicator');
                memoCountIndicator.textContent = `${memos[dateString].length}件のメモ`;
                dateCell.appendChild(memoCountIndicator);
            }

            // --- 日付のダブルクリックでメモモーダルを開く ---
            dateCell.addEventListener('dblclick', () => {
                selectedDate = dateString;
                modalDate.textContent = `${cellYear}年${cellMonth + 1}月${day}日 のメモ`;
                renderMemosForSelectedDate();
                memoModal.classList.add('visible'); 
                memoInput.value = ''; 
            });

            calendarGrid.appendChild(dateCell);
        }
    }

    // --- メモ機能関連 (変更なし) ---
    function renderMemosForSelectedDate() { 
        memosForDate.innerHTML = ''; 
        if (holidays[selectedDate]) {
            const holidayItem = document.createElement('div');
            holidayItem.classList.add('memo-item');
            holidayItem.innerHTML = `<span class="memo-text holiday-name-in-modal">【祝日】${holidays[selectedDate]}</span>`;
            memosForDate.appendChild(holidayItem);
        }
        const currentMemos = memos[selectedDate] || [];
        if (currentMemos.length === 0 && !holidays[selectedDate]) {
            const noMemoMessage = document.createElement('p');
            noMemoMessage.textContent = 'この日付にはまだメモがありません。';
            memosForDate.appendChild(noMemoMessage);
            return;
        }
        currentMemos.forEach((memoText, index) => {
            const memoItem = document.createElement('div');
            memoItem.classList.add('memo-item');
            const memoTextSpan = document.createElement('span');
            memoTextSpan.classList.add('memo-text');
            memoTextSpan.textContent = memoText;
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-memo-button');
            deleteButton.textContent = '削除';
            deleteButton.dataset.index = index; 
            deleteButton.addEventListener('click', (e) => {
                const memoIndex = parseInt(e.target.dataset.index);
                deleteMemo(selectedDate, memoIndex);
            });
            memoItem.appendChild(memoTextSpan);
            memoItem.appendChild(deleteButton);
            memosForDate.appendChild(memoItem);
        });
    }

    addMemoButton.addEventListener('click', () => { 
        const newMemoText = memoInput.value.trim();
        if (newMemoText) {
            if (!memos[selectedDate]) {
                memos[selectedDate] = [];
            }
            memos[selectedDate].push(newMemoText);
            memoInput.value = ''; 
            renderMemosForSelectedDate(); 
            updateCalendarMemoIndicator(selectedDate); 
        } else {
            alert('メモ内容を入力してください。');
        }
    });

    function deleteMemo(date, index) { 
        if (memos[date] && memos[date].length > index) {
            memos[date].splice(index, 1); 
            if (memos[date].length === 0) {
                delete memos[date];
            }
            renderMemosForSelectedDate(); 
            updateCalendarMemoIndicator(date); 
        }
    }

    function updateCalendarMemoIndicator(dateString) { 
        const cell = document.querySelector(`.date-cell[data-date="${dateString}"]`);
        if (cell) {
            let indicator = cell.querySelector('.note-indicator');
            if (memos[dateString] && memos[dateString].length > 0) {
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.classList.add('note-indicator');
                    cell.appendChild(indicator);
                }
                indicator.textContent = `${memos[dateString].length}件のメモ`;
            } else {
                if (indicator) {
                    indicator.remove(); 
                }
            }
        }
    }

    closeModalButton.addEventListener('click', () => { 
        memoModal.classList.remove('visible');
    });

    memoModal.addEventListener('click', (event) => { 
        if (event.target === memoModal) {
            memoModal.classList.remove('visible');
        }
    });

    // --- 月移動ボタンのイベントリスナー (変更なし) ---
    prevMonthBtn.addEventListener('click', () => { 
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => { 
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // --- ハンバーガーメニューの開閉 ---
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        hamburgerIcon.classList.remove('open');
        hasSubmenuItems.forEach(item => item.classList.remove('open')); 
    }

    hamburgerIcon.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('visible');
        hamburgerIcon.classList.toggle('open'); 
    });

    overlay.addEventListener('click', closeSidebar);

    // --- サブメニューの開閉機能 (変更なし) ---
    hasSubmenuItems.forEach(item => {
        const parentLink = item.querySelector('a:not([data-action])'); 
        if (parentLink) {
            parentLink.addEventListener('click', (e) => {
                e.preventDefault(); 
                item.classList.toggle('open');
            });
        }
    });

    // --- サイドバーのリンククリックで機能実行 ---
    sidebar.addEventListener('click', (event) => {
        const targetLink = event.target.closest('a');
        if (!targetLink) return;

        const action = targetLink.dataset.action;
        const targetSection = targetLink.dataset.targetSection;
        const forcedWidth = targetLink.dataset.width;
        const skinIndex = targetLink.dataset.skinIndex;
        const size = targetLink.dataset.size; 

        if (action) {
            event.preventDefault(); 
            
            switch (action) {
                case 'showSection':
                    contentSections.forEach(section => {
                        if (section.id === `${targetSection}Section`) {
                            section.classList.add('active');
                        } else {
                            section.classList.remove('active');
                        }
                    });
                    break;
                case 'fullScreen':
                    alert('「全画面」機能: ブラウザの全画面表示モードに切り替えます。');
                    break;
                case 'datePicker':
                    alert('「日付選択Web」機能: 日付選択ピッカーを表示します。');
                    break;
                case 'onlineTools':
                    alert('「オンラインツール」機能: 外部のツールへリンクします。');
                    break;
                case 'futureFeature': 
                    alert('この機能は今後追加予定です！お楽しみに！');
                    break;
                case 'dummy':
                    alert('その他の機能...');
                    break;
                case 'forcePcView':
                    setForcedLayout('pc', forcedWidth);
                    break;
                case 'changeDigitalClockSkin':
                    currentClockType = 'digital';
                    currentDigitalSkinIndex = parseInt(skinIndex);
                    localStorage.setItem('digitalClockSkinIndex', currentDigitalSkinIndex);
                    applyClockSettings();
                    break;
                case 'changeAnalogClockSkin':
                    currentClockType = 'analog';
                    currentAnalogSkinIndex = parseInt(skinIndex);
                    localStorage.setItem('analogClockSkinIndex', currentAnalogSkinIndex);
                    applyClockSettings();
                    break;
                case 'changeDigitalClockSize': 
                    currentDigitalSize = size;
                    localStorage.setItem('digitalClockSize', currentDigitalSize);
                    applyClockSettings();
                    break;
                case 'changeAnalogClockSize':
                    currentAnalogSize = size;
                    localStorage.setItem('analogClockSize', currentAnalogSize);
                    applyClockSettings();
                    break;
            }
            closeSidebar(); 
        }
    });

    // --- ダークモード機能 ---
    function setDarkMode(isDark) { 
        if (isDark) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
        applyClockSettings(); // ダークモード変更時に時計の描画色も更新
    }

    toggleDarkModeBtn.addEventListener('click', (e) => { 
        e.preventDefault();
        const isDark = document.body.classList.contains('dark-mode');
        setDarkMode(!isDark);
        closeSidebar();
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        setDarkMode(true);
    } else {
        setDarkMode(false); 
    }

    // --- PC/モバイル表示切り替え機能 ---
    const mainContent = document.querySelector('.main-content'); 

    function setForcedLayout(layout, width = null) { 
        document.body.classList.remove('force-pc-layout', 'force-mobile-layout');
        mainContent.removeAttribute('data-force-width'); 
        mainContent.style.removeProperty('--forced-width'); 

        if (layout === 'pc') {
            document.body.classList.add('force-pc-layout');
            if (width) {
                mainContent.style.setProperty('--forced-width', `${width}px`);
                mainContent.setAttribute('data-force-width', width); 
            } else {
                mainContent.style.setProperty('--forced-width', '960px'); 
                mainContent.setAttribute('data-force-width', '960');
            }
        } else if (layout === 'mobile') {
            document.body.classList.add('force-mobile-layout');
        }
        localStorage.setItem('layout', layout); 
        localStorage.setItem('forcedWidth', width); 
    }

    // モバイル/自動表示ボタンはHTMLにdata-actionがないので直接イベントリスナーを設定
    document.getElementById('toggleMobileView').addEventListener('click', (e) => { e.preventDefault(); setForcedLayout('mobile'); closeSidebar(); });
    document.getElementById('toggleAutoView').addEventListener('click', (e) => { e.preventDefault(); setForcedLayout('auto'); closeSidebar(); });


    const savedLayout = localStorage.getItem('layout');
    const savedForcedWidth = localStorage.getItem('forcedWidth');

    if (savedLayout && savedLayout !== 'auto') {
        setForcedLayout(savedLayout, savedForcedWidth);
    } else {
        setForcedLayout('auto'); 
    }

    // --- ご意見コメントフォームの送信処理 (デモ版) ---
    feedbackForm.addEventListener('submit', (event) => {
        event.preventDefault(); 
        const formData = new FormData(feedbackForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const comment = formData.get('comment');

        alert(`ご意見・お問い合わせを送信しました！\n\nお名前: ${name || 'なし'}\nメール: ${email || 'なし'}\nコメント: ${comment}\n\n※このデモでは実際には送信されません。`);
        
        feedbackForm.reset(); 
        document.getElementById('calendarSection').classList.add('active'); 
        document.getElementById('feedbackSection').classList.remove('active'); 
        document.getElementById('aboutSection').classList.remove('active'); 
        document.getElementById('termsSection').classList.remove('active');
        closeSidebar(); 
    });

    // --- 初期表示 ---
    renderCalendar();
});