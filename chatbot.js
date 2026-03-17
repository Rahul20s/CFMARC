// CFM ARC ChatBot JavaScript
class CFMARCChatBot {
    constructor() {
        this.currentLanguage = 'en';
        this.currentStep = 'language';
        this.userSession = {
            loanAccount: '',
            mobileNumber: '',
            authenticated: false
        };
        
        this.translations = {
            en: {
                greeting: 'Hello! Welcome to CFM.AI Assistant. Please select your preferred language:',
                languages: {
                    english: 'English',
                    hindi: 'हिंदी',
                    kannada: 'ಕನ್ನಡ',
                    telugu: 'తెలుగు',
                    tamil: 'தமிழ்',
                    malayalam: 'മലയാളം'
                },
                loanAccountPrompt: 'Please enter your Loan A/C number:',
                mobilePrompt: 'Please enter your mobile number:',
                otpPrompt: 'Please enter the OTP sent to your mobile:',
                mainMenu: 'Please choose an option:',
                menuOptions: [
                    'Know your outstanding',
                    'Settlement proposal for your account',
                    'NDC/NOC letter',
                    'EMI payment status',
                    'Loan statement',
                    'Payment gateway',
                    'Talk to our representative',
                    'Exit'
                ],
                invalidInput: 'Invalid input. Please try again.',
                thankYou: 'Thank you for using CFM.AI Assistant!',
                authenticating: 'Authenticating your details...',
                fetchingData: 'Fetching your information...',
                otpSent: 'OTP has been sent to your mobile number.',
                otpVerified: 'OTP verified successfully!',
                invalidOTP: 'Invalid OTP. Please try again.',
                exitMessage: 'Thank you for using CFM.AI Assistant. Have a great day!'
            },
            hi: {
                greeting: 'नमस्ते! CFM.AI चैटबॉट में आपका स्वागत है। कृपया अपनी पसंदीदा भाषा चुनें:',
                languages: {
                    english: 'English',
                    hindi: 'हिंदी',
                    kannada: 'ಕನ್ನಡ',
                    telugu: 'తెలుగు',
                    tamil: 'தமிழ்',
                    malayalam: 'മലയാളം'
                },
                loanAccountPrompt: 'कृपया अपना लोन खाता नंबर दर्ज करें:',
                mobilePrompt: 'कृपया अपना मोबाइल नंबर दर्ज करें:',
                otpPrompt: 'कृपया अपने मोबाइल पर भेजे गए OTP को दर्ज करें:',
                mainMenu: 'कृपया एक विकल्प चुनें:',
                menuOptions: [
                    'अपना बकाया जानें',
                    'आपके खाते के लिए समझौता प्रस्ताव',
                    'NDC/NOC पत्र',
                    'ईएमआई भुगतान स्थिति',
                    'ऋण विवरण',
                    'भुगतान गेटवे',
                    'हमारे प्रतिनिधि से बात करें',
                    'बाहर निकलें'
                ],
                invalidInput: 'अमान्य इनपुट। कृपया पुन: प्रयास करें।',
                thankYou: 'CFM.AI चैटबॉट का उपयोग करने के लिए धन्यवाद!',
                authenticating: 'आपका विवरण सत्यापित किया जा रहा है...',
                fetchingData: 'आपकी जानकारी प्राप्त की जा रही है...',
                otpSent: 'OTP आपके मोबाइल नंबर पर भेज दिया गया है।',
                otpVerified: 'OTP सफलतापूर्वक सत्यापित!',
                invalidOTP: 'अमान्य OTP। कृपया पुन: प्रयास करें।',
                exitMessage: 'CFM.AI चैटबॉट का उपयोग करने के लिए धन्यवाद। आपका दिन शुभ हो!'
            },
            kn: {
                greeting: 'ನಮಸ್ಕಾರ! CFM.AI ಚಾಟ್‌ಬಾಟ್‌ಗೆ ಸ್ವಾಗತ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆದ್ಯತೆ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:',
                languages: {
                    english: 'English',
                    hindi: 'हिंदी',
                    kannada: 'ಕನ್ನಡ',
                    telugu: 'తెలుగు',
                    tamil: 'தமிழ்',
                    malayalam: 'മലയാളം'
                },
                loanAccountPrompt: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಾಲ ಖಾತಾ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ:',
                mobilePrompt: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ:',
                otpPrompt: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ಕಳುಹಿಸಿದ OTP ಅನ್ನು ನಮೂದಿಸಿ:',
                mainMenu: 'ದಯವಿಟ್ಟು ಒಂದು ಆಯ್ಕೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:',
                menuOptions: [
                    'ನಿಮ್ಮ ಬಾಕಿ ಇರುವ ಮೊತ್ತವನ್ನು ತಿಳಿಯಿರಿ',
                    'ನಿಮ್ಮ ಖಾತೆಗೆ ನೌಕರಿ ಪ್ರಸ್ತಾವ',
                    'NDC/NOC ಪತ್ರ',
                    'ಇಎಂಐ ಪಾವತಿ ಸ್ಥಿತಿ',
                    'ಸಾಲದ ಹೇಳಿಕೆ',
                    'ಪಾವತಿ ಗೇಟ್‌ವೇ',
                    'ನಮ್ಮ ಪ್ರತಿನಿಧಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ',
                    'ನಿರ್ಗಮಿಸಿ'
                ],
                invalidInput: 'ಅಮಾನ್ಯ ಇನ್‌ಪುಟ್. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
                thankYou: 'CFM.AI ಚಾಟ್‌ಬಾಟ್ ಬಳಸಿದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!',
                authenticating: 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...',
                fetchingData: 'ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
                otpSent: 'OTP ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.',
                otpVerified: 'OTP ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ!',
                invalidOTP: 'ಅಮಾನ್ಯ OTP. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
                exitMessage: 'CFM.AI ಚಾಟ್‌ಬಾಟ್ ಬಳಸಿದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ಒಳ್ಳೆಯ ದಿನ!'
            },
            te: {
                greeting: 'నమస్కారం! CFM.AI చాట్‌బాట్‌కి స్వాగతం. దయచేసి మీ ఇష్టపడే భాషను ఎంచుకోండి:',
                languages: {
                    english: 'English',
                    hindi: 'हिंदी',
                    kannada: 'ಕನ್ನಡ',
                    telugu: 'తెలుగు',
                    tamil: 'தமிழ்',
                    malayalam: 'മലയാളം'
                },
                loanAccountPrompt: 'దయచేసి మీ రుణ ఖాతా సంఖ్యను నమోదు చేయండి:',
                mobilePrompt: 'దయచేసి మీ మొబైల్ సంఖ్యను నమోదు చేయండి:',
                otpPrompt: 'దయచేసి మీ మొబైల్‌కు పంపిన OTPను నమోదు చేయండి:',
                mainMenu: 'దయచేసి ఒక ఎంపికను ఎంచుకోండి:',
                menuOptions: [
                    'మీ బకాయిని తెలుసుకోండి',
                    'మీ ఖాతాకు పరిహార ప్రతిపాదన',
                    'NDC/NOC లేఖ',
                    'ఈఎంఐ చెల్లింపుల స్థితి',
                    'రుణ వివరణ',
                    'పావతి గేట్‌వే',
                    'మా ప్రతినిధితో మాట్లాడండి',
                    'నిష్క్రమించండి'
                ],
                invalidInput: 'చెల్లని ఇన్‌పుట్. దయచేసి మళ్లీ ప్రయత్నించండి.',
                thankYou: 'CFM.AI చాట్‌బాట్ ఉపయోగించినందుకు ధన్యవాదాలు!',
                authenticating: 'మీ వివరాలను ధృవీకరిస్తున్నాం...',
                fetchingData: 'మీ సమాచారాన్ని పొందుతున్నాం...',
                otpSent: 'OTP మీ మొబైల్ సంఖ్యకు పంపబడింది.',
                otpVerified: 'OTP విజయవంతంగా ధృవీకరించబడింది!',
                invalidOTP: 'చెల్లని OTP. దయచేసి మళ్లీ ప్రయత్నించండి.',
                exitMessage: 'CFM.AI చాట్‌బాట్ ఉపయోగించినందుకు ధన్యవాదాలు. శుభ దిన!'
            },
            ta: {
                greeting: 'வணக்கம்! CFM.AI சாட்‌பாட்டிற்கு வரவேற்கிறோம். தயவுசெய்து உங்கள் விரும்பிய மொழியைத் தேர்ந்தெடுக்கவும்:',
                languages: {
                    english: 'English',
                    hindi: 'हिंदी',
                    kannada: 'ಕನ್ನಡ',
                    telugu: 'తెలుగు',
                    tamil: 'தமிழ்',
                    malayalam: 'മലയാളം'
                },
                loanAccountPrompt: 'தயவுசெய்து உங்கள் கடன் கணக்கு எண்ணை உள்ளிடவும்:',
                mobilePrompt: 'தயவுசெய்து உங்கள் மொபைல் எண்ணை உள்ளிடவும்:',
                otpPrompt: 'தயவுசெய்து உங்கள் மொபைலுக்கு அனுப்பப்பட்ட OTPஐ உள்ளிடவும்:',
                mainMenu: 'தயவுசெய்து ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும்:',
                menuOptions: [
                    'உங்கள் மீதமுள்ளதை அறியவும்',
                    'உங்கள் கணக்கிற்கான தீர்வு முன்மொழிவு',
                    'NDC/NOC கடிதம்',
                    'ஈஎம்ஐ செலுத்துதல் நிலை',
                    'கடன் விவரணம்',
                    'செலுத்துதல் நுழையம்',
                    'எங்கள் பிரதிநிதியுடன் பேசுங்கள்',
                    'வெளியேறுங்கள்'
                ],
                invalidInput: 'தவறான உள்ளீடு. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
                thankYou: 'CFM.AI சாட்‌பாட்டைப் பயன்படுத்தியதற்கு நன்றி!',
                authenticating: 'உங்கள் விவரங்களை சரிபார்க்கிறோம்...',
                fetchingData: 'உங்கள் தகவலைப் பெறுகிறோம்...',
                otpSent: 'OTP உங்கள் மொபைல் எண்ணுக்கு அனுப்பப்பட்டது.',
                otpVerified: 'OTP வெற்றிகரமாக சரிபார்க்கப்பட்டது!',
                invalidOTP: 'தவறான OTP. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
                exitMessage: 'CFM.AI சாட்‌பாட்டைப் பயன்படுத்தியதற்கு நன்றி. நல்ல நாள்!'
            },
            ml: {
                greeting: 'നമസ്കാരം! CFM.AI ചാറ്റ്ബോട്ടിലേക്ക് സ്വാഗതം. ദയവായി നിങ്ങളുടെ ഇഷ്ടഭാഷ തിരഞ്ഞെടുക്കുക:',
                languages: {
                    english: 'English',
                    hindi: 'हिंदी',
                    kannada: 'ಕನ್ನಡ',
                    telugu: 'తెలుగు',
                    tamil: 'தமிழ்',
                    malayalam: 'മലയാളം'
                },
                loanAccountPrompt: 'ദയവായി നിങ്ങളുടെ വായ്പ അക്കൗണ്ട് നമ്പർ നൽകുക:',
                mobilePrompt: 'ദയവായി നിങ്ങളുടെ മൊബൈൽ നമ്പർ നൽകുക:',
                otpPrompt: 'ദയവായി നിങ്ങളുടെ മൊബൈലിലേക്ക് അയച്ച OTP നൽകുക:',
                mainMenu: 'ദയവായി ഒരു ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക:',
                menuOptions: [
                    'നിങ്ങളുടെ ബാക്കിയുള്ളത് അറിയുക',
                    'നിങ്ങളുടെ അക്കൗണ്ടിനുള്ള തീർപ്പ് നിർദ്ദേശം',
                    'NDC/NOC കത്ത്',
                    'ഇഎംഐ പേയ്മെന്റ് അവസ്ഥ',
                    'വായ്പ വിവരണം',
                    'പേയ്മെന്റ് ഗേറ്റ്വേ',
                    'ഞങ്ങളുടെ പ്രതിനിധിയുമായി സംസാരിക്കുക',
                    'പുറത്ത് പോകുക'
                ],
                invalidInput: 'അസാധുവായ ഇൻപുട്ട്. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
                thankYou: 'CFM ARC ചാറ്റ്ബോട്ട് ഉപയോഗിച്ചതിന് നന്ദി!',
                authenticating: 'നിങ്ങളുടെ വിവരങ്ങൾ പരിശോധിക്കുന്നു...',
                fetchingData: 'നിങ്ങളുടെ വിവരങ്ങൾ ശേഖരിക്കുന്നു...',
                otpSent: 'OTP നിങ്ങളുടെ മൊബൈൽ നമ്പറിലേക്ക് അയച്ചു.',
                otpVerified: 'OTP വിജയകരമായി പരിശോധിച്ചു!',
                invalidOTP: 'അസാധുവായ OTP. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
                exitMessage: 'CFM ARC ചാറ്റ്ബോട്ട് ഉപയോഗിച്ചതിന് നന്ദി. നല്ല ദിവസം!'
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showLanguageSelection();
    }
    
    setupEventListeners() {
        const chatbotWidget = document.getElementById('chatbotWidget');
        const chatbotToggleBtn = document.getElementById('openChatbot');
        const toggleBtn = document.getElementById('toggleChatbot');
        const closeBtn = document.getElementById('closeChatbot');
        const sendBtn = document.getElementById('sendMessage');
        const chatInput = document.getElementById('chatInput');
        
        if (chatbotToggleBtn) {
            chatbotToggleBtn.addEventListener('click', () => {
                this.openChatbot();
            });
        }
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleChatbot();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeChatbot();
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        // Create floating chatbot button if it doesn't exist
        this.createFloatingButton();
    }
    
    createFloatingButton() {
        if (!document.getElementById('chatbotToggleBtn')) {
            console.log('Creating floating chatbot button...');
            const floatingBtn = document.createElement('button');
            floatingBtn.id = 'chatbotToggleBtn';
            floatingBtn.className = 'chatbot-toggle-btn';
            floatingBtn.innerHTML = '💬';
            floatingBtn.title = 'CFM.AI Assistant';
            
            // Force visibility styles
            floatingBtn.style.cssText = `
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                width: 70px !important;
                height: 70px !important;
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 9999 !important;
            `;
            
            document.body.appendChild(floatingBtn);
            console.log('Floating button created and added to DOM');
            
            // Add click event to open chatbot
            floatingBtn.addEventListener('click', () => {
                console.log('Toggle button clicked');
                this.openChatbot();
            });
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.id = 'chatbotTooltip';
            tooltip.className = 'chatbot-toggle-tooltip';
            tooltip.innerHTML = `
                <button class="tooltip-close" onclick="this.parentElement.classList.remove('active')">×</button>
                <div class="tooltip-header">
                    <div class="tooltip-avatar">👋</div>
                    <div class="tooltip-content">
                        <h4>CFM ARC Assistant</h4>
                        <p>May I help you with your loan account services?</p>
                    </div>
                </div>
            `;
            document.body.appendChild(tooltip);
            
            // Show tooltip by default for 5 seconds
            setTimeout(() => {
                tooltip.classList.add('active');
            }, 1000);
            
            // Hide tooltip after 20 seconds
            setTimeout(() => {
                tooltip.classList.remove('active');
            }, 20000);
            
            // Show tooltip on hover with delay
            let tooltipTimeout;
            floatingBtn.addEventListener('mouseenter', () => {
                tooltipTimeout = setTimeout(() => {
                    tooltip.classList.add('active');
                }, 500);
            });
            
            floatingBtn.addEventListener('mouseleave', () => {
                clearTimeout(tooltipTimeout);
                setTimeout(() => {
                    tooltip.classList.remove('active');
                }, 1000); // Hide after 1 second of mouse leave
            });
            
            floatingBtn.addEventListener('click', () => {
                tooltip.classList.remove('active');
                this.openChatbot();
            });
        } else {
            console.log('Floating button already exists');
        }
    }
    
    openChatbot() {
        const chatbotWidget = document.getElementById('chatbotWidget');
        const floatingBtn = document.getElementById('chatbotToggleBtn');
        
        if (chatbotWidget) {
            chatbotWidget.classList.add('active');
            chatbotWidget.classList.remove('minimized');
        }
        
        if (floatingBtn) {
            floatingBtn.classList.add('hidden');
        }
        
        // Only show language selection if this is a fresh start
        if (this.currentStep === 'language' && document.getElementById('chatMessages').children.length === 0) {
            this.showLanguageSelection();
        }
    }
    
    closeChatbot() {
        const chatbotWidget = document.getElementById('chatbotWidget');
        const floatingBtn = document.getElementById('chatbotToggleBtn');
        
        if (chatbotWidget) {
            chatbotWidget.classList.remove('active');
        }
        
        if (floatingBtn) {
            floatingBtn.classList.remove('hidden');
        }
    }
    
    toggleChatbot() {
        const chatbotWidget = document.getElementById('chatbotWidget');
        const toggleBtn = document.getElementById('toggleChatbot');
        
        if (chatbotWidget.classList.contains('minimized')) {
            chatbotWidget.classList.remove('minimized');
            toggleBtn.innerHTML = '<span>−</span>';
        } else {
            chatbotWidget.classList.add('minimized');
            toggleBtn.innerHTML = '<span>+</span>';
        }
    }
    
    addMessage(content, isBot = true, isHTML = false) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (isHTML) {
            messageContent.innerHTML = content;
        } else {
            messageContent.textContent = content;
        }
        
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return messageDiv;
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="typing-indicator active">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    showLanguageSelection() {
        const t = this.translations[this.currentLanguage];
        this.addMessage(t.greeting, true);
        
        const languageHTML = `
            <div class="language-selector">
                <button class="language-btn" data-lang="en">${t.languages.english}</button>
                <button class="language-btn" data-lang="hi">${t.languages.hindi}</button>
                <button class="language-btn" data-lang="kn">${t.languages.kannada}</button>
                <button class="language-btn" data-lang="te">${t.languages.telugu}</button>
                <button class="language-btn" data-lang="ta">${t.languages.tamil}</button>
                <button class="language-btn" data-lang="ml">${t.languages.malayalam}</button>
            </div>
        `;
        
        const messageDiv = this.addMessage(languageHTML, true, true);
        
        // Add event listeners to language buttons
        setTimeout(() => {
            const langButtons = messageDiv.querySelectorAll('.language-btn');
            langButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.selectLanguage(btn.dataset.lang);
                    
                    // Update button styles
                    langButtons.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });
            });
        }, 100);
    }
    
    selectLanguage(lang) {
        this.currentLanguage = lang;
        this.currentStep = 'loanAccount';
        
        const t = this.translations[this.currentLanguage];
        const languageNames = {
            'en': 'English',
            'hi': 'हिंदी',
            'kn': 'ಕನ್ನಡ',
            'te': 'తెలుగు',
            'ta': 'தமிழ்',
            'ml': 'മലയാളം'
        };
        
        this.addMessage(`Language selected: ${languageNames[lang]}`, false);
        
        setTimeout(() => {
            this.addMessage(t.loanAccountPrompt, true);
            this.enableInput();
        }, 1000);
    }
    
    enableInput() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendMessage');
        
        if (chatInput && sendBtn) {
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }
    
    disableInput() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendMessage');
        
        if (chatInput && sendBtn) {
            chatInput.disabled = true;
            sendBtn.disabled = true;
            chatInput.value = '';
        }
    }
    
    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, false);
        this.disableInput();
        
        this.processUserInput(message);
    }
    
    processUserInput(message) {
        switch (this.currentStep) {
            case 'loanAccount':
                this.handleLoanAccount(message);
                break;
            case 'mobile':
                this.handleMobileNumber(message);
                break;
            case 'otp':
                this.handleOTP(message);
                break;
            case 'mainMenu':
                this.handleMainMenuSelection(message);
                break;
            default:
                this.enableInput();
        }
    }
    
    handleLoanAccount(accountNumber) {
        this.userSession.loanAccount = accountNumber;
        this.currentStep = 'mobile';
        
        const t = this.translations[this.currentLanguage];
        this.addMessage(t.mobilePrompt, true);
        this.enableInput();
    }
    
    handleMobileNumber(mobileNumber) {
        if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
            const t = this.translations[this.currentLanguage];
            this.addMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.', true);
            this.enableInput();
            return;
        }
        
        this.userSession.mobileNumber = mobileNumber;
        this.currentStep = 'otp';
        
        this.sendOTP();
    }
    
    async sendOTP() {
        this.showTypingIndicator();
        
        try {
            const response = await fetch('/api/chatbot/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobileNumber: this.userSession.mobileNumber
                })
            });
            
            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.success) {
                this.addMessage(data.message, true);
                this.showOTPInput();
            } else {
                this.addMessage(data.message, true);
                // Allow retry
                setTimeout(() => {
                    this.addMessage('Please try entering your mobile number again:', true);
                    this.currentStep = 'mobile';
                    this.enableInput();
                }, 2000);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Service temporarily unavailable. Please try again later.', true);
            console.error('Error sending OTP:', error);
        }
    }
    
    showOTPInput() {
        const otpHTML = `
            <div class="otp-inputs">
                <input type="text" class="otp-input" maxlength="1" data-index="0">
                <input type="text" class="otp-input" maxlength="1" data-index="1">
                <input type="text" class="otp-input" maxlength="1" data-index="2">
                <input type="text" class="otp-input" maxlength="1" data-index="3">
                <input type="text" class="otp-input" maxlength="1" data-index="4">
                <input type="text" class="otp-input" maxlength="1" data-index="5">
            </div>
            <div style="text-align: center; margin-top: 10px;">
                <small style="color: #6b7280;">OTP valid for 5 minutes</small>
            </div>
        `;
        
        const messageDiv = this.addMessage(otpHTML, true, true);
        
        setTimeout(() => {
            this.setupOTPInputs(messageDiv);
        }, 100);
    }
    
    setupOTPInputs(messageDiv) {
        const otpInputs = messageDiv.querySelectorAll('.otp-input');
        
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
                
                if (index === otpInputs.length - 1 && e.target.value) {
                    const otp = Array.from(otpInputs).map(inp => inp.value).join('');
                    this.handleOTP(otp);
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });
            
            if (index === 0) {
                input.focus();
            }
        });
    }
    
    async handleOTP(otp) {
        this.showTypingIndicator();
        
        try {
            const response = await fetch('/api/chatbot/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobileNumber: this.userSession.mobileNumber,
                    otp: otp
                })
            });
            
            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.success) {
                this.userSession.authenticated = true;
                this.addMessage(data.message, true);
                
                setTimeout(() => {
                    this.showMainMenu();
                }, 1000);
            } else {
                this.addMessage(data.message, true);
                
                if (data.message.includes('expired') || data.message.includes('Maximum attempts')) {
                    // Restart the process
                    setTimeout(() => {
                        this.addMessage('Please start over with your mobile number:', true);
                        this.currentStep = 'mobile';
                        this.enableInput();
                    }, 2000);
                } else {
                    // Allow retry for invalid OTP
                    setTimeout(() => {
                        this.sendOTP();
                    }, 2000);
                }
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Service temporarily unavailable. Please try again later.', true);
            console.error('Error verifying OTP:', error);
        }
    }
    
    showMainMenu() {
        this.currentStep = 'mainMenu';
        
        const t = this.translations[this.currentLanguage];
        this.addMessage(t.mainMenu, true);
        
        const menuHTML = `
            <div class="main-menu">
                <button class="menu-option" data-option="1">
                    <span class="option-number">1</span>
                    ${t.menuOptions[0]}
                </button>
                <button class="menu-option" data-option="2">
                    <span class="option-number">2</span>
                    ${t.menuOptions[1]}
                </button>
                <button class="menu-option" data-option="3">
                    <span class="option-number">3</span>
                    ${t.menuOptions[2]}
                </button>
                <button class="menu-option" data-option="4">
                    <span class="option-number">4</span>
                    ${t.menuOptions[3]}
                </button>
                <button class="menu-option" data-option="5">
                    <span class="option-number">5</span>
                    ${t.menuOptions[4]}
                </button>
                <button class="menu-option" data-option="6">
                    <span class="option-number">6</span>
                    ${t.menuOptions[5]}
                </button>
                <button class="menu-option" data-option="7">
                    <span class="option-number">7</span>
                    ${t.menuOptions[6]}
                </button>
                <button class="menu-option" data-option="8">
                    <span class="option-number">8</span>
                    ${t.menuOptions[7]}
                </button>
            </div>
        `;
        
        const messageDiv = this.addMessage(menuHTML, true, true);
        
        setTimeout(() => {
            const menuButtons = messageDiv.querySelectorAll('.menu-option');
            menuButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.handleMainMenuSelection(btn.dataset.option);
                });
            });
        }, 100);
    }
    
    handleMainMenuSelection(option) {
        const t = this.translations[this.currentLanguage];
        
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            
            switch (option) {
                case '1':
                    this.handleOutstandingQuery();
                    break;
                case '2':
                    this.handleSettlementProposal();
                    break;
                case '3':
                    this.handleNDCRequest();
                    break;
                case '4':
                    this.handleEMIStatus();
                    break;
                case '5':
                    this.handleLoanStatement();
                    break;
                case '6':
                    this.handlePaymentGateway();
                    break;
                case '7':
                    this.handleTalkToRepresentative();
                    break;
                case '8':
                    this.handleExit();
                    break;
                default:
                    this.addMessage(t.invalidInput, true);
                    this.showMainMenu();
            }
        }, 1000);
    }
    
    async handleOutstandingQuery() {
        try {
            const response = await fetch('/api/chatbot/outstanding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    loanAccount: this.userSession.loanAccount,
                    mobileNumber: this.userSession.mobileNumber
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.addMessage(`Your outstanding amount is: ${data.outstanding.amount}`, true);
                this.addMessage(`Due date: ${data.outstanding.dueDate}`, true);
                this.addMessage(`Total due: ${data.outstanding.totalDue}`, true);
            } else {
                this.addMessage('Unable to fetch outstanding details. Please try again later.', true);
            }
        } catch (error) {
            this.addMessage('Service temporarily unavailable. Please try again later.', true);
        }
        
        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }
    
    async handleSettlementProposal() {
        try {
            const response = await fetch('/api/chatbot/settlement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    loanAccount: this.userSession.loanAccount,
                    mobileNumber: this.userSession.mobileNumber
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.addMessage('Settlement proposal details:', true);
                this.addMessage(`Proposal amount: ${data.settlement.proposalAmount}`, true);
                this.addMessage(`Resolution Officer: ${data.settlement.officerName}`, true);
                this.addMessage(`Contact: ${data.settlement.officerContact}`, true);
                this.addMessage(`Email: ${data.settlement.officerEmail}`, true);
            } else {
                this.addMessage('Unable to fetch settlement details. Please try again later.', true);
            }
        } catch (error) {
            this.addMessage('Service temporarily unavailable. Please try again later.', true);
        }
        
        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }
    
    async handleNDCRequest() {
        try {
            const response = await fetch('/api/chatbot/ndc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    loanAccount: this.userSession.loanAccount,
                    mobileNumber: this.userSession.mobileNumber
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (data.ndc.loanClosed) {
                    this.addMessage('Your loan is closed. NDC letter will be shared with you shortly.', true);
                    this.addMessage(`NDC Reference: ${data.ndc.reference}`, true);
                } else {
                    this.addMessage('Your loan is not yet closed. Please contact our team for assistance.', true);
                    this.addMessage(`Team Contact: ${data.ndc.teamContact}`, true);
                    this.addMessage(`Email: ${data.ndc.teamEmail}`, true);
                }
            } else {
                this.addMessage('Unable to process NDC request. Please try again later.', true);
            }
        } catch (error) {
            this.addMessage('Service temporarily unavailable. Please try again later.', true);
        }
        
        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }
    
    handleSecurityDocumentRelease() {
        // Manual operations team details
        this.addMessage('Security Document Release:', true);
        this.addMessage('Operations Team Contact Details:', true);
        this.addMessage('Phone: +91-22-47831222', true);
        this.addMessage('Email: operations@cfmarc.com', true);
        this.addMessage('Address: 1st Floor, Wakefield House, Sprott Road, Ballard Estate, Mumbai 400001', true);
        
        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }
    
    handlePayment() {
        this.addMessage('Redirecting to payment gateway...', true);
        
        // Redirect to payment gateway - replace with your actual payment URL
        const paymentUrl = 'https://payment.example.com/cfmarc-payment';
        
        setTimeout(() => {
            window.open(paymentUrl, '_blank');
            this.addMessage('Payment gateway opened in a new window.', true);
            this.addMessage('Please complete your payment and return to chat if you need assistance.', true);
            this.showMainMenu();
        }, 2000);
    }
    
    handleCIBILQuery() {
        // Manual CRM contact details
        this.addMessage('CIBIL Queries:', true);
        this.addMessage('CRM Team Contact Details:', true);
        this.addMessage('Phone: +91-22-47831233', true);
        this.addMessage('Email: crm@cfmarc.com', true);
        this.addMessage('Working Hours: Monday - Friday, 10:30 AM - 7:00 PM', true);
        
        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }
    
    handleExit() {
        const t = this.translations[this.currentLanguage];
        this.addMessage(t.exitMessage, true);
        
        setTimeout(() => {
            this.closeChatbot();
        }, 2000);
    }
    
    // Handle EMI Status
    async handleEMIStatus() {
        const t = this.translations[this.currentLanguage];
        
        if (!this.userSession.authenticated) {
            this.startAuthentication();
            return;
        }
        
        this.addMessage('Let me check your EMI payment status...', true);
        this.showTypingIndicator();
        
        try {
            const response = await fetch('/api/chatbot/emi-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loanId: this.userSession.loanId
                })
            });
            
            const data = await response.json();
            this.hideTypingIndicator();
            
            if (data.success) {
                const emiInfo = data.data;
                const message = `
                    <div class="loan-details">
                        <h4>EMI Payment Status</h4>
                        <p><strong>Total EMIs:</strong> ${emiInfo.totalEmis}</p>
                        <p><strong>Paid EMIs:</strong> ${emiInfo.paidEmis}</p>
                        <p><strong>Pending EMIs:</strong> ${emiInfo.pendingEmis}</p>
                        <p><strong>Next Due Date:</strong> ${emiInfo.nextDueDate}</p>
                        <p><strong>Next Due Amount:</strong> ₹${emiInfo.nextDueAmount.toLocaleString('en-IN')}</p>
                    </div>
                `;
                this.addMessage(message, true, true);
            } else {
                this.addMessage('Unable to fetch EMI status. Please try again later.', true);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Service temporarily unavailable. Please try again later.', true);
        }
        
        // Show main menu again after EMI status response
        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }
    
    // Handle Loan Statement
    async handleLoanStatement() {
        const t = this.translations[this.currentLanguage];
        
        if (!this.userSession.authenticated) {
            this.startAuthentication();
            return;
        }
        
        this.addMessage('Let me fetch your loan statement...', true);
        this.showTypingIndicator();
        
        try {
            const fromDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 6 months ago
            const toDate = new Date().toISOString().split('T')[0];
            
            const response = await fetch('/api/chatbot/loan-statement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loanId: this.userSession.loanId,
                    fromDate: fromDate,
                    toDate: toDate
                })
            });
            
            const data = await response.json();
            this.hideTypingIndicator();
            
            if (data.success) {
                const statement = data.data;
                let transactionsHTML = '<div class="transactions">';
                statement.transactions.slice(0, 5).forEach(transaction => {
                    transactionsHTML += `
                        <div class="transaction">
                            <p><strong>${transaction.date}</strong> - ${transaction.type}</p>
                            <p>Amount: ₹${transaction.amount.toLocaleString('en-IN')}</p>
                        </div>
                    `;
                });
                transactionsHTML += '</div>';
                
                const message = `
                    <div class="loan-details">
                        <h4>Recent Transactions (Last 6 months)</h4>
                        <p><strong>Opening Balance:</strong> ₹${statement.openingBalance.toLocaleString('en-IN')}</p>
                        <p><strong>Closing Balance:</strong> ₹${statement.closingBalance.toLocaleString('en-IN')}</p>
                        ${transactionsHTML}
                        <p><em>Showing last 5 transactions. Full statement available on request.</em></p>
                    </div>
                `;
                this.addMessage(message, true, true);
            } else {
                this.addMessage('Unable to fetch loan statement. Please try again later.', true);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Service temporarily unavailable. Please try again later.', true);
        }
        
        // Show main menu again after loan statement response
        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }
    
    // Handle Payment Gateway
    handlePaymentGateway() {
        const t = this.translations[this.currentLanguage];
        
        const message = `
            <div class="payment-gateway-info">
                <h4>💳 Payment Gateway</h4>
                <p>You can make your loan payments through our secure payment gateway.</p>
                <p><strong>Available payment methods:</strong></p>
                <ul>
                    <li>UPI (PhonePe, GPay, Paytm)</li>
                    <li>Net Banking</li>
                    <li>Debit/Credit Cards</li>
                    <li>Mobile Wallets</li>
                </ul>
                <p><button id="paymentGatewayBtn" class="btn-primary payment-btn">Proceed to Payment Gateway</button></p>
                <p><em>Our payment gateway is secure and PCI-DSS compliant.</em></p>
            </div>
        `;
        
        const messageDiv = this.addMessage(message, true, true);
        
        // Add click event listener to the payment gateway button
        setTimeout(() => {
            const paymentBtn = document.getElementById('paymentGatewayBtn');
            if (paymentBtn) {
                paymentBtn.addEventListener('click', () => {
                    window.open('payment-gateway.html', '_blank');
                    this.addMessage('Opening payment gateway in a new window...', true);
                });
            }
        }, 100);
    }
    
    // Handle Talk to Representative
    handleTalkToRepresentative() {
        const t = this.translations[this.currentLanguage];
        
        const message = `
            <div class="representative-info">
                <h4>👥 Talk to Our Representative</h4>
                <p>Our customer service team is here to help you.</p>
                <p><strong>Contact Information:</strong></p>
                <ul>
                    <li>📞 Phone: +91-22 47831222</li>
                    <li>📧 Email: support@cfmarc.in</li>
                    <li>🕐 Office Hours: Mon-Fri, 10:30 AM - 7:00 PM</li>
                    <li>📍 Address: 1st Floor, Wakefield House, Sprott Road, Ballard Estate, Mumbai 400 001</li>
                </ul>
                <p>You can also visit our contact page for more information.</p>
            </div>
        `;
        
        this.addMessage(message, true, true);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.cfmarcChatBot) {
        window.cfmarcChatBot = new CFMARCChatBot();
        console.log('CFM ARC ChatBot initialized');
        
        // Force create toggle button if it doesn't exist
        setTimeout(() => {
            const toggleBtn = document.getElementById('chatbotToggleBtn');
            if (!toggleBtn) {
                console.log('Toggle button not found, creating it manually...');
                window.cfmarcChatBot.createFloatingButton();
            } else {
                console.log('Toggle button found:', toggleBtn);
                // Force visibility
                toggleBtn.style.display = 'flex';
                toggleBtn.style.visibility = 'visible';
                toggleBtn.style.opacity = '1';
                toggleBtn.style.zIndex = '9999';
            }
        }, 1000);
    }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM is already loaded
    if (!window.cfmarcChatBot) {
        window.cfmarcChatBot = new CFMARCChatBot();
        console.log('CFM ARC ChatBot initialized (immediate)');
        
        // Force create toggle button if it doesn't exist
        setTimeout(() => {
            const toggleBtn = document.getElementById('chatbotToggleBtn');
            if (!toggleBtn) {
                console.log('Toggle button not found, creating it manually...');
                window.cfmarcChatBot.createFloatingButton();
            } else {
                console.log('Toggle button found:', toggleBtn);
                // Force visibility
                toggleBtn.style.display = 'flex';
                toggleBtn.style.visibility = 'visible';
                toggleBtn.style.opacity = '1';
                toggleBtn.style.zIndex = '9999';
            }
        }, 1000);
    }
}
