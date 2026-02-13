(() => {
  if (window.__chatWidgetLoaded) return;
  window.__chatWidgetLoaded = true;

  const scriptEl = document.currentScript;
  const defaults = {
    title: "Trợ lý ảo",
    subtitle: "Trực tuyến",
    brand: "ĐHKT",
    primaryColor: "#4f46e5",
    greeting:
      "Xin chào! Tôi là trợ lý ảo của Trường Đại Học Kiến Trúc Hà Nội. Tôi có thể giúp gì cho bạn?",
    placeholder: "Nhập câu hỏi của bạn...",
    suggestions: [
      "Giới thiệu về trường",
      "Thông tin tuyển sinh",
      "Các ngành đào tạo",
      "Liên hệ trường",
    ],
    position: "right", // right | left
    zIndex: 9999,
    apiBaseUrl: "", // API base URL (root), sẽ lấy từ data-api-base-url hoặc tự động detect
    sessionId: null, // Session ID để track conversation
    faqAiConfigId: 1, // ID AI Config dùng cho FAQs
    faqSuggestionsLimit: 6, // Số câu hỏi gợi ý tối đa
    maxWords: 1000, // Giới hạn số từ tối đa cho một câu hỏi (match với .env MAX_WORDS)
  };

  // Mapping câu trả lời gán cứng cho Trường Đại Học Kiến Trúc Hà Nội
  const hardcodedResponses = {
    "giới thiệu về trường":
      "Trường Đại Học Kiến Trúc Hà Nội (Hanoi University of Architecture - HAU) là một trong những trường đại học hàng đầu về đào tạo kiến trúc, xây dựng và quy hoạch tại Việt Nam.\n\nTrường được thành lập với sứ mệnh đào tạo nguồn nhân lực chất lượng cao trong lĩnh vực kiến trúc, xây dựng và quy hoạch đô thị.\n\nTrường có đội ngũ giảng viên giàu kinh nghiệm, cơ sở vật chất hiện đại và chương trình đào tạo được cập nhật thường xuyên theo xu hướng quốc tế.",
    "thông tin tuyển sinh":
      "Thông tin tuyển sinh Trường Đại Học Kiến Trúc Hà Nội:\n\n📋 Phương thức tuyển sinh:\n• Xét tuyển dựa trên kết quả thi THPT Quốc gia\n• Xét tuyển học bạ\n• Xét tuyển kết hợp\n\n📅 Thời gian tuyển sinh: Thường bắt đầu từ tháng 3-4 hàng năm\n\n📞 Để biết thêm chi tiết, vui lòng liên hệ:\n• Phòng Đào tạo: (024) 3854 1234\n• Email: tuyensinh@hau.edu.vn\n• Website: www.hau.edu.vn",
    "các ngành đào tạo":
      "Trường Đại Học Kiến Trúc Hà Nội đào tạo các ngành chính:\n\n🏛️ Kiến trúc:\n• Kiến trúc công trình\n• Kiến trúc cảnh quan\n• Thiết kế nội thất\n\n🏗️ Xây dựng:\n• Kỹ thuật xây dựng công trình dân dụng và công nghiệp\n• Kỹ thuật xây dựng công trình thủy\n• Kỹ thuật hạ tầng đô thị\n\n🗺️ Quy hoạch:\n• Quy hoạch vùng và đô thị\n• Quản lý đô thị\n\n📐 Các ngành khác:\n• Kỹ thuật môi trường\n• Công nghệ thông tin xây dựng",
    "liên hệ trường":
      "Thông tin liên hệ Trường Đại Học Kiến Trúc Hà Nội:\n\n📍 Địa chỉ:\nKm 10, Nguyễn Trãi, Thanh Xuân, Hà Nội\n\n📞 Điện thoại:\n• Tổng đài: (024) 3854 1234\n• Phòng Đào tạo: (024) 3854 1235\n• Phòng Hành chính: (024) 3854 1236\n\n📧 Email:\n• info@hau.edu.vn\n• tuyensinh@hau.edu.vn\n\n🌐 Website: www.hau.edu.vn\n\n⏰ Giờ làm việc: 7:30 - 17:00 (Thứ 2 - Thứ 6)",
    "học phí":
      "Thông tin học phí Trường Đại Học Kiến Trúc Hà Nội:\n\n💰 Học phí được tính theo tín chỉ và có thể thay đổi theo từng năm học.\n\n📊 Mức học phí tham khảo:\n• Hệ đại học chính quy: Khoảng 15-20 triệu đồng/năm\n• Hệ đại học vừa làm vừa học: Khoảng 12-15 triệu đồng/năm\n\n💡 Lưu ý:\n• Học phí có thể thay đổi theo quy định của Bộ Giáo dục và Đào tạo\n• Trường có chính sách học bổng và hỗ trợ tài chính cho sinh viên\n\n📞 Để biết thông tin chi tiết, vui lòng liên hệ Phòng Đào tạo: (024) 3854 1235",
    "điểm chuẩn":
      "Thông tin điểm chuẩn Trường Đại Học Kiến Trúc Hà Nội:\n\n📊 Điểm chuẩn thay đổi theo từng năm và từng ngành:\n\n🏛️ Các ngành Kiến trúc: Thường từ 22-26 điểm\n🏗️ Các ngành Xây dựng: Thường từ 18-22 điểm\n🗺️ Các ngành Quy hoạch: Thường từ 20-24 điểm\n\n📝 Lưu ý:\n• Điểm chuẩn có thể thay đổi theo phương thức tuyển sinh\n• Một số ngành có yêu cầu thi năng khiếu\n• Điểm chuẩn năm trước chỉ mang tính tham khảo\n\n📞 Để biết điểm chuẩn chính xác, vui lòng theo dõi thông báo tuyển sinh hoặc liên hệ Phòng Đào tạo.",
    "học bổng":
      "Thông tin học bổng Trường Đại Học Kiến Trúc Hà Nội:\n\n🎓 Các loại học bổng:\n\n1️⃣ Học bổng khuyến khích học tập:\n• Dành cho sinh viên có kết quả học tập xuất sắc\n• Mức hỗ trợ: 50-100% học phí\n\n2️⃣ Học bổng hỗ trợ sinh viên có hoàn cảnh khó khăn:\n• Dành cho sinh viên có hoàn cảnh gia đình khó khăn\n• Mức hỗ trợ: 30-70% học phí\n\n3️⃣ Học bổng tài năng:\n• Dành cho sinh viên có thành tích đặc biệt\n• Mức hỗ trợ: 100% học phí + phụ cấp\n\n📞 Liên hệ Phòng Công tác Sinh viên để biết thêm chi tiết.",
    "cơ sở vật chất":
      "Cơ sở vật chất Trường Đại Học Kiến Trúc Hà Nội:\n\n🏛️ Trường có hệ thống cơ sở vật chất hiện đại:\n\n📚 Thư viện:\n• Hơn 50.000 đầu sách\n• Phòng đọc rộng rãi, yên tĩnh\n• Hệ thống máy tính phục vụ tra cứu\n\n💻 Phòng thực hành:\n• Phòng máy tính với phần mềm chuyên ngành\n• Xưởng mô hình kiến trúc\n• Phòng thí nghiệm vật liệu xây dựng\n\n🏟️ Khuôn viên:\n• Khu giảng đường hiện đại\n• Khu ký túc xá cho sinh viên\n• Sân thể thao, căng tin\n• Khu vực xanh, không gian học tập ngoài trời",
    "xin chào":
      "Xin chào! Tôi là trợ lý ảo của Trường Đại Học Kiến Trúc Hà Nội. Tôi có thể giúp bạn tìm hiểu về:\n• Thông tin tuyển sinh\n• Các ngành đào tạo\n• Giới thiệu về trường\n• Học phí, học bổng\n• Và nhiều thông tin khác\n\nBạn muốn biết thêm điều gì?",
    hello:
      "Hello! I'm the virtual assistant of Hanoi University of Architecture. How can I help you today?",
    hi: "Hi! I'm here to help you with information about Hanoi University of Architecture. What would you like to know?",
    "cảm ơn":
      "Không có gì! Nếu bạn còn câu hỏi nào khác về Trường Đại Học Kiến Trúc Hà Nội, đừng ngần ngại hỏi tôi nhé. Chúc bạn một ngày tốt lành! 😊",
    "tạm biệt":
      "Tạm biệt bạn! Chúc bạn thành công trong việc tìm hiểu thông tin về trường. Nếu cần hỗ trợ thêm, hãy quay lại nhé! 👋",
  };

  const parseSuggestions = (value) => {
    if (!value) return [];
    return value
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const parsedSuggestions = parseSuggestions(scriptEl?.dataset?.suggestions);

  // Lazy-load Socket.IO client (qua CDN) khi cần
  let socketIoClientPromise = null;
  const loadSocketIoClient = () => {
    if (socketIoClientPromise) return socketIoClientPromise;
    socketIoClientPromise = new Promise((resolve, reject) => {
      if (window.io) {
        resolve(window.io);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
      script.async = true;
      script.onload = () => {
        if (window.io) resolve(window.io);
        else reject(new Error("Socket.IO client not loaded"));
      };
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
    return socketIoClientPromise;
  };

  // Tự động detect API base URL nếu không được cung cấp
  const getApiBaseUrl = () => {
    if (scriptEl?.dataset?.apiBaseUrl) {
      return scriptEl.dataset.apiBaseUrl;
    }
    // Tự động detect từ current origin, trỏ tới root API v1
    const origin = window.location.origin;
    return `${origin}/api/v1`;
  };

  // Generate session ID nếu chưa có
  const getSessionId = () => {
    const storageKey = "chatbot_session_id";
    let sessionId = localStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, sessionId);
    }
    return sessionId;
  };

  // Kiểm tra xem đã nhập thông tin chưa
  const hasUserInfo = () => {
    const phone = localStorage.getItem("chatbot_user_phone");
    const email = localStorage.getItem("chatbot_user_email");
    return phone && email;
  };

  // Validate số điện thoại VN
  const validatePhone = (phone) => {
    // Format: 10 số bắt đầu bằng 0, hoặc +84
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    const cleaned = phone.replace(/\s+/g, "");
    return phoneRegex.test(cleaned);
  };

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const config = {
    title: scriptEl?.dataset?.title || defaults.title,
    subtitle: scriptEl?.dataset?.subtitle || defaults.subtitle,
    brand: scriptEl?.dataset?.brand || defaults.brand,
    primaryColor: scriptEl?.dataset?.primaryColor || defaults.primaryColor,
    greeting: scriptEl?.dataset?.greeting || defaults.greeting,
    placeholder: scriptEl?.dataset?.placeholder || defaults.placeholder,
    position:
      scriptEl?.dataset?.position === "left" ? "left" : defaults.position,
    zIndex: Number(scriptEl?.dataset?.zIndex) || defaults.zIndex,
    apiBaseUrl: getApiBaseUrl(),
    sessionId: getSessionId(),
    faqAiConfigId:
      Number(scriptEl?.dataset?.faqAiConfigId) || defaults.faqAiConfigId,
    faqSuggestionsLimit:
      Number(scriptEl?.dataset?.faqSuggestionsLimit) ||
      defaults.faqSuggestionsLimit,
    maxWords: Number(scriptEl?.dataset?.maxWords) || defaults.maxWords,
    socketUrl:
      scriptEl?.dataset?.socketUrl || getApiBaseUrl().replace(/\/api.*/i, ""),
    // Note: [] is truthy in JS, so we must fall back based on length.
    suggestions: parsedSuggestions.length
      ? parsedSuggestions
      : defaults.suggestions,
  };

  class ChatbotWidget {
    constructor(cfg) {
      this.cfg = cfg;
      this.isOpen = false;
      this.historyLoaded = false;
      this.userInfoSubmitted = hasUserInfo();
      this.isProcessing = false; // Flag để ngăn spam tin nhắn
      // Pagination cho infinite scroll
      this.currentPage = 1;
      this.hasMoreMessages = true;
      this.isLoadingMore = false;
      this.pageSize = 20; // Số messages mỗi lần load
      // Polling để fetch messages mới từ nhân viên
      this.pollingInterval = null;
      this.lastMessageId = null; // ID của message cuối cùng đã load
      this.pollingIntervalMs = 5000; // Polling mỗi 3 giây
      // Socket.IO
      this.socket = null;
      this.socketConnected = false;
      // Typing indicator debounce
      this.typingTimeout = null;
      this.isTyping = false;

      this.host = document.createElement("div");
      this.host.id = "chatbot-widget-host";
      this.host.setAttribute("aria-live", "polite");
      this.shadow = this.host.attachShadow({ mode: "open" });
      this.render();
      document.body.appendChild(this.host);
      // Load danh sách câu hỏi gợi ý từ backend (FAQs) nếu có
      this.loadFaqSuggestionsFromApi();
    }

    render() {
      const { cfg } = this;
      const side = cfg.position === "left" ? "left: 20px;" : "right: 20px;";
      const style = `
          :host { all: initial; }
          *, *::before, *::after { box-sizing: border-box; }

          .floating {
            position: fixed;
            bottom: max(16px, env(safe-area-inset-bottom));
            ${side}
            z-index: ${cfg.zIndex};
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
            line-height: 1.3;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          :root, .floating {
            --cw-primary: ${cfg.primaryColor};
            --cw-bg: #0b1222;
            --cw-panel: rgba(255, 255, 255, 0.92);
            --cw-panel-solid: #ffffff;
            --cw-text: #0f172a;
            --cw-muted: #475569;
            --cw-border: rgba(15, 23, 42, 0.10);
            --cw-shadow: 0 18px 60px rgba(2, 6, 23, 0.28);
          }

          @media (prefers-color-scheme: dark) {
            :root, .floating {
              --cw-panel: rgba(15, 23, 42, 0.92);
              --cw-panel-solid: #0f172a;
              --cw-text: #e2e8f0;
              --cw-muted: #94a3b8;
              --cw-border: rgba(226, 232, 240, 0.10);
              --cw-shadow: 0 22px 80px rgba(0, 0, 0, 0.45);
            }
          }

          .launcher {
            width: 58px;
            height: 58px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.22);
            background: radial-gradient(120% 120% at 20% 20%, rgba(255,255,255,0.28), transparent 48%),
                        linear-gradient(135deg, var(--cw-primary), #0ea5e9);
            color: #fff;
            display: grid;
            place-items: center;
            box-shadow: 0 14px 40px rgba(2, 6, 23, 0.24);
            cursor: pointer;
            transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
            position: relative;
            user-select: none;
          }
          .launcher:hover { transform: translateY(-2px); filter: brightness(1.02); box-shadow: 0 18px 56px rgba(2, 6, 23, 0.28); }
          .launcher:active { transform: translateY(-1px) scale(0.99); }
          .launcher:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(79,70,229,0.28), 0 18px 56px rgba(2, 6, 23, 0.28); }
          
          @media (max-width: 480px) {
            .launcher {
              width: 56px;
              height: 56px;
              border-radius: 14px;
            }
            .floating {
              bottom: max(12px, env(safe-area-inset-bottom));
              ${cfg.position === "left" ? "left: 12px;" : "right: 12px;"}
            }
          }

          .dot {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 10px;
            height: 10px;
            background: #22c55e;
            border: 2px solid rgba(255,255,255,0.95);
            border-radius: 50%;
            box-shadow: 0 0 0 3px rgba(34,197,94,0.18);
          }
          .icon { width: 24px; height: 24px; }

          .panel {
            position: absolute;
            bottom: 74px;
            ${cfg.position === "left" ? "left: 0;" : "right: 0;"}
            width: min(420px, calc(100vw - 32px));
            max-height: min(650px, calc(100vh - 100px));
            height: auto;
            border-radius: 20px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: var(--cw-panel);
            color: var(--cw-text);
            border: 1px solid var(--cw-border);
            box-shadow: var(--cw-shadow);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            transform-origin: ${cfg.position === "left" ? "left bottom" : "right bottom"};
            transform: translateY(8px) scale(0.98);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
          }
          .panel.open {
            transform: translateY(0) scale(1);
            opacity: 1;
            pointer-events: auto;
          }
          
          @media (max-width: 480px) {
            .panel {
              width: calc(100vw - 24px);
              max-height: calc(100vh - 80px);
              border-radius: 16px;
              bottom: 70px;
            }
          }
          
          @media (min-width: 768px) {
            .panel {
              width: min(420px, calc(100vw - 40px));
              max-height: min(680px, calc(100vh - 90px));
            }
          }

          .panel .header {
            padding: 18px 20px;
            background:
              radial-gradient(140% 120% at 12% 10%, rgba(255,255,255,0.35), transparent 52%),
              linear-gradient(135deg, var(--cw-primary), #0ea5e9);
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            flex-shrink: 0;
          }
          
          @media (max-width: 480px) {
            .panel .header {
              padding: 16px 18px;
            }
          }
          .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
          .brand .avatar {
            width: 40px;
            height: 40px;
            border-radius: 14px;
            background: rgba(255,255,255,0.22);
            border: 1px solid rgba(255,255,255,0.28);
            display: grid;
            place-items: center;
            font-weight: 800;
            font-size: 15px;
            letter-spacing: 0.5px;
            color: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          }
          .brand-text { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; gap: 2px; }
          .brand-text .title { font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.2px; }
          .brand-text .subtitle { font-size: 12px; opacity: 0.95; display: flex; align-items: center; gap: 6px; font-weight: 500; }
          .brand-text .subtitle::before {
            content: "";
            width: 7px;
            height: 7px;
            border-radius: 999px;
            background: #22c55e;
            box-shadow: 0 0 0 2px rgba(34,197,94,0.25), 0 0 8px rgba(34,197,94,0.4);
            animation: pulse 2s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }

          .close-btn {
            background: rgba(255,255,255,0.16);
            border: 1px solid rgba(255,255,255,0.18);
            width: 36px;
            height: 36px;
            border-radius: 12px;
            color: #fff;
            cursor: pointer;
            display: grid;
            place-items: center;
            transition: background 0.18s ease, transform 0.18s ease;
          }
          .close-btn:hover { background: rgba(255,255,255,0.26); transform: translateY(-1px); }
          .close-btn:active { transform: translateY(0); }
          .close-btn:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(255,255,255,0.22); }

          .body {
            display: flex;
            flex-direction: column;
            height: 100%;
            background:
              radial-gradient(120% 100% at 10% 0%, rgba(79,70,229,0.08), transparent 45%),
              radial-gradient(120% 100% at 90% 20%, rgba(14,165,233,0.06), transparent 42%),
              var(--cw-panel-solid);
            overflow: hidden;
          }

          .messages {
            flex: 1;
            padding: 20px 18px 16px;
            overflow-y: auto;
            gap: 12px;
            display: flex;
            flex-direction: column;
            scroll-behavior: smooth;
            min-height: 0;
          }
          .messages::-webkit-scrollbar { width: 8px; }
          .messages::-webkit-scrollbar-track { background: transparent; }
          .messages::-webkit-scrollbar-thumb { 
            background: rgba(148,163,184,0.25); 
            border-radius: 999px; 
            border: 2px solid transparent; 
            background-clip: content-box; 
          }
          .messages::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.4); }
          
          @media (max-width: 480px) {
            .messages {
              padding: 16px 14px 12px;
              gap: 10px;
            }
          }

          .msg {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14.5px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
            word-break: break-word;
            border: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            animation: msgSlideIn 0.2s ease-out;
          }
          
          @media (max-width: 480px) {
            .msg {
              max-width: 90%;
              padding: 10px 14px;
              font-size: 14px;
              border-radius: 14px;
            }
          }
          @keyframes msgSlideIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          /* Typing indicator với text động chuyên nghiệp */
          @keyframes typingPulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          
          .typing-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-width: 120px;
            min-height: 26px;
            color: var(--cw-muted);
            font-style: italic;
            font-size: 13.5px;
          }
          
          .typing-indicator-text {
            animation: typingPulse 1.5s infinite ease-in-out;
          }
          
          .typing-indicator-dots {
            display: inline-flex;
            gap: 3px;
            align-items: center;
          }
          
          .typing-indicator-dot {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: currentColor;
            animation: typingDot 1.2s infinite ease-in-out;
            opacity: 0.6;
          }
          
          @keyframes typingDot {
            0%, 80%, 100% { transform: translateY(0) scale(0.8); opacity: 0.4; }
            40% { transform: translateY(-2px) scale(1); opacity: 0.8; }
          }
          
          .typing-indicator-dot:nth-child(2) {
            animation-delay: 0.2s;
          }
          
          .typing-indicator-dot:nth-child(3) {
            animation-delay: 0.4s;
          }
          .msg.bot {
            align-self: flex-start;
            background: linear-gradient(135deg, rgba(79,70,229,0.12), rgba(79,70,229,0.08));
            color: var(--cw-text);
            border: 1px solid rgba(79,70,229,0.15);
          }
          .msg.user {
            align-self: flex-end;
            background: linear-gradient(135deg, var(--cw-primary), #0ea5e9);
            color: #fff;
            box-shadow: 0 4px 12px rgba(79,70,229,0.25);
          }

          /* Link styling inside messages */
          .msg a {
            color: inherit;
            text-decoration: underline;
            text-underline-offset: 3px;
            font-weight: 600;
            word-break: break-word;
          }
          .msg.bot a { color: #1d4ed8; }
          @media (prefers-color-scheme: dark) {
            .msg.bot a { color: #60a5fa; }
          }

          .suggestions-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 18px 8px;
            border-top: 1px solid var(--cw-border);
            background: linear-gradient(180deg, rgba(148,163,184,0.04), rgba(148,163,184,0.02));
          }
          
          .suggestions-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--cw-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .suggestions-toggle {
            appearance: none;
            border: none;
            background: transparent;
            color: var(--cw-muted);
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .suggestions-toggle:hover {
            background: rgba(79,70,229,0.1);
            color: var(--cw-primary);
          }
          
          .suggestions-toggle-icon {
            width: 14px;
            height: 14px;
            transition: transform 0.3s ease;
          }
          
          .suggestions-toggle.collapsed .suggestions-toggle-icon {
            transform: rotate(-90deg);
          }
          
          .suggestions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 6px 18px 16px;
            overflow-x: hidden;
            overflow-y: auto;
            scrollbar-width: none;
            background: linear-gradient(180deg, rgba(148,163,184,0.04), rgba(148,163,184,0.02));
            width: 100%;
            box-sizing: border-box;
            -webkit-overflow-scrolling: touch;
            max-height: 200px;
            min-height: 56px;
            transition: max-height 0.3s ease, padding 0.3s ease, opacity 0.3s ease;
            opacity: 1;
            flex-shrink: 0;
          }
          
          .suggestions.collapsed {
            max-height: 0;
            min-height: 0;
            padding: 0 18px;
            opacity: 0;
            overflow: hidden;
          }
          
          .suggestions::-webkit-scrollbar { display: none; }
          .suggestions::-webkit-scrollbar-track { display: none; }
          
          @media (max-width: 480px) {
            .suggestions-header {
              padding: 10px 16px 6px;
            }
            .suggestions {
              padding: 4px 16px 14px;
              gap: 8px;
              max-height: 160px;
              min-height: 45px;
            }
            .suggestions.collapsed {
              padding: 0 16px;
            }
          }

          .chip {
            appearance: none;
            border: 1.5px solid rgba(79,70,229,0.2);
            background: rgba(255,255,255,0.9);
            color: var(--cw-text);
            border-radius: 16px;
            padding: 10px 14px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            white-space: normal;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
            flex-shrink: 0;
            flex-grow: 0;
            width: 100%;
            max-width: none;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
            text-align: left;
            line-height: 1.45;
            min-height: 0;
            align-items: flex-start;
            position: relative;
          }
          
          @media (max-width: 480px) {
            .chip {
              padding: 9px 12px;
              font-size: 12.5px;
              width: 100%;
            }
          }
          @media (prefers-color-scheme: dark) {
            .chip { 
              background: rgba(15, 23, 42, 0.6); 
              border-color: rgba(79,70,229,0.3);
            }
          }
          .chip:hover { 
            transform: translateY(-2px); 
            border-color: var(--cw-primary); 
            background: rgba(79,70,229,0.12); 
            box-shadow: 0 4px 12px rgba(79,70,229,0.2);
          }
          .chip:active { transform: translateY(0); }
          .chip:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(79,70,229,0.2); }
          .chip:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
            pointer-events: none;
          }
          .chip:disabled:hover {
            transform: none;
            border-color: rgba(79,70,229,0.2);
            background: rgba(255,255,255,0.9);
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
          }

          .composer {
            padding: 16px 18px;
            border-top: 1px solid var(--cw-border);
            background: rgba(255,255,255,0.7);
            backdrop-filter: blur(8px);
            display: flex;
            gap: 12px;
            align-items: flex-end;
            flex-shrink: 0;
          }
          @media (prefers-color-scheme: dark) {
            .composer { background: rgba(2,6,23,0.25); }
          }
          
          @media (max-width: 480px) {
            .composer {
              padding: 14px 16px;
              gap: 10px;
            }
          }

          .length-warning {
            padding: 0 18px 10px;
            font-size: 11px;
            color: #64748b;
            text-align: right;
            opacity: 0.9;
          }

          .length-warning.error {
            color: #dc2626;
          }

          .composer textarea {
            flex: 1;
            resize: none;
            border: 1.5px solid rgba(148,163,184,0.3);
            background: rgba(255,255,255,0.9);
            color: var(--cw-text);
            border-radius: 16px;
            padding: 12px 16px;
            font-size: 14.5px;
            line-height: 1.5;
            min-height: 48px;
            max-height: 120px;
            outline: none;
            transition: all 0.2s ease;
            font-family: inherit;
            overflow-y: auto;
          }
          
          @media (max-width: 480px) {
            .composer textarea {
              padding: 10px 14px;
              font-size: 14px;
              min-height: 44px;
              border-radius: 14px;
            }
            .send-btn {
              width: 44px;
              height: 44px;
              border-radius: 14px;
              font-size: 16px;
            }
          }
          @media (prefers-color-scheme: dark) {
            .composer textarea { 
              background: rgba(15,23,42,0.7); 
              border-color: rgba(148,163,184,0.25); 
            }
          }
          .composer textarea::placeholder { 
            color: rgba(71,85,105,0.7); 
            font-weight: 400;
          }
          @media (prefers-color-scheme: dark) {
            .composer textarea::placeholder { color: rgba(148,163,184,0.65); }
          }
          .composer textarea:focus {
            border-color: var(--cw-primary);
            box-shadow: 0 0 0 4px rgba(79,70,229,0.15), 0 2px 8px rgba(79,70,229,0.1);
            background: rgba(255,255,255,1);
          }
          @media (prefers-color-scheme: dark) {
            .composer textarea:focus {
              background: rgba(15,23,42,0.85);
            }
          }
          .composer textarea:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background: rgba(148,163,184,0.1);
          }
          @media (prefers-color-scheme: dark) {
            .composer textarea:disabled {
              background: rgba(15,23,42,0.4);
            }
          }

          .send-btn {
            width: 48px;
            height: 48px;
            border-radius: 16px;
            border: none;
            background: linear-gradient(135deg, var(--cw-primary), #0ea5e9);
            color: #fff;
            cursor: pointer;
            display: grid;
            place-items: center;
            font-weight: 700;
            font-size: 18px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(79,70,229,0.25);
            flex-shrink: 0;
          }
          .send-btn:disabled { 
            opacity: 0.5; 
            cursor: not-allowed; 
            box-shadow: none;
          }
          .send-btn:not(:disabled):hover { 
            transform: translateY(-2px); 
            filter: brightness(1.05); 
            box-shadow: 0 6px 20px rgba(79,70,229,0.35); 
          }
          .send-btn:not(:disabled):active { 
            transform: translateY(0); 
            box-shadow: 0 2px 8px rgba(79,70,229,0.25);
          }

          .empty { color: var(--cw-muted); font-size: 13px; padding: 10px 0; text-align: center; }
          
          .user-info-form-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 24px 20px;
            overflow-y: auto;
            animation: fadeInUp 0.3s ease;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .user-info-form-container.hidden {
            display: none;
          }
          
          .user-info-form {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            max-width: 100%;
          }
          
          .user-info-form-header {
            text-align: center;
            margin-bottom: 32px;
          }
          
          .user-info-form-header .icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            background: linear-gradient(135deg, var(--cw-primary), #0ea5e9);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(79,70,229,0.25);
          }
          
          .user-info-form-header .icon svg {
            width: 32px;
            height: 32px;
            color: #fff;
          }
          
          .user-info-form h3 {
            margin: 0 0 10px;
            font-size: 22px;
            font-weight: 800;
            color: var(--cw-text);
            text-align: center;
            letter-spacing: -0.3px;
          }
          
          .user-info-form p {
            margin: 0;
            font-size: 14px;
            color: var(--cw-muted);
            text-align: center;
            line-height: 1.6;
            font-weight: 400;
          }
          
          .form-group {
            margin-bottom: 20px;
            position: relative;
          }
          
          .form-label {
            display: block;
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 600;
            color: var(--cw-text);
            letter-spacing: 0.2px;
            text-transform: uppercase;
            font-size: 11px;
            opacity: 0.8;
          }
          
          .form-input {
            width: 100%;
            padding: 12px 16px;
            border: 1.5px solid rgba(148,163,184,0.3);
            border-radius: 12px;
            font-size: 14.5px;
            background: rgba(255,255,255,0.7);
            color: var(--cw-text);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: inherit;
            box-sizing: border-box;
          }
          
          @media (prefers-color-scheme: dark) {
            .form-input {
              background: rgba(15,23,42,0.6);
              border-color: rgba(148,163,184,0.25);
            }
          }
          
          .form-input::placeholder {
            color: rgba(148,163,184,0.6);
            font-weight: 400;
          }
          
          .form-input:focus {
            outline: none;
            border-color: var(--cw-primary);
            box-shadow: 
              0 0 0 3px rgba(79,70,229,0.15),
              0 2px 8px rgba(79,70,229,0.1);
            background: rgba(255,255,255,0.9);
          }
          
          @media (prefers-color-scheme: dark) {
            .form-input:focus {
              background: rgba(15,23,42,0.8);
            }
          }
          
          .form-input.error {
            border-color: #ef4444;
            box-shadow: 
              0 0 0 3px rgba(239,68,68,0.15),
              0 2px 4px rgba(0,0,0,0.04);
            animation: shake 0.3s ease;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          
          .form-error {
            margin-top: 6px;
            font-size: 12px;
            color: #ef4444;
            display: none;
            font-weight: 500;
            line-height: 1.4;
          }
          
          .form-error.show {
            display: block;
            animation: fadeIn 0.2s ease;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .form-submit {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--cw-primary), #0ea5e9);
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(79,70,229,0.3);
            margin-top: 8px;
            position: relative;
            overflow: hidden;
          }
          
          .form-submit::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
          }
          
          .form-submit:hover:not(:disabled)::before {
            left: 100%;
          }
          
          .form-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(79,70,229,0.4);
            filter: brightness(1.05);
          }
          
          .form-submit:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(79,70,229,0.3);
          }
          
          .form-submit:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }
          
          @media (max-width: 480px) {
            .user-info-form-container {
              padding: 20px 16px;
            }
            .user-info-form-header .icon {
              width: 56px;
              height: 56px;
              margin-bottom: 14px;
            }
            .user-info-form-header .icon svg {
              width: 28px;
              height: 28px;
            }
            .user-info-form h3 {
              font-size: 20px;
            }
            .user-info-form p {
              font-size: 13.5px;
            }
            .form-group {
              margin-bottom: 18px;
            }
            .form-input {
              padding: 11px 14px;
              font-size: 14px;
            }
            .form-submit {
              padding: 13px;
              font-size: 14.5px;
            }
          }
        `;

      this.shadow.innerHTML = `
          <style>${style}</style>
          <div class="floating">
            <div class="panel">
              <div class="header">
                <div class="brand">
                  <div class="avatar">${cfg.brand.slice(0, 2).toUpperCase()}</div>
                  <div class="brand-text">
                    <span class="title">${cfg.title}</span>
                    <span class="subtitle">${cfg.subtitle}</span>
                  </div>
                </div>
                <button class="close-btn" aria-label="Đóng">×</button>
              </div>
              <div class="body">
                ${
                  !this.userInfoSubmitted
                    ? `
                <div class="user-info-form-container">
                  <div class="user-info-form">
                    <div class="user-info-form-header">
                      <div class="icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          <path d="M13 8H7"/>
                          <path d="M17 12H7"/>
                        </svg>
                      </div>
                      <h3>Bắt đầu trò chuyện</h3>
                      <p>Vui lòng cung cấp thông tin liên hệ để chúng tôi có thể hỗ trợ bạn tốt hơn</p>
                    </div>
                    <form id="user-info-form">
                      <div class="form-group">
                        <label class="form-label" for="user-phone">Số điện thoại</label>
                        <input 
                          type="tel" 
                          id="user-phone" 
                          class="form-input" 
                          placeholder="0912345678 hoặc +84912345678"
                          required
                          autocomplete="tel"
                        />
                        <div class="form-error" id="phone-error">Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0 hoặc +84)</div>
                      </div>
                      <div class="form-group">
                        <label class="form-label" for="user-email">Email</label>
                        <input 
                          type="email" 
                          id="user-email" 
                          class="form-input" 
                          placeholder="example@email.com"
                          required
                          autocomplete="email"
                        />
                        <div class="form-error" id="email-error">Vui lòng nhập email hợp lệ</div>
                      </div>
                      <button type="submit" class="form-submit">Bắt đầu</button>
                    </form>
                  </div>
                </div>
                `
                    : `
                <div class="messages"></div>
                <div class="suggestions-header">
                  <span class="suggestions-title">Câu hỏi gợi ý</span>
                  <button class="suggestions-toggle" aria-label="Ẩn/Hiện câu hỏi gợi ý">
                    <span class="suggestions-toggle-text">Ẩn</span>
                    <svg class="suggestions-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                </div>
                <div class="suggestions"></div>
                <div class="composer">
                  <textarea rows="1" placeholder="${cfg.placeholder}" aria-label="Nhập tin nhắn"></textarea>
                  <button class="send-btn" aria-label="Gửi">➤</button>
                </div>
                `
                }
              </div>
            </div>
            <button class="launcher" aria-label="Mở chatbot">
              <div class="dot" title="Trực tuyến"></div>
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 5h16c.6 0 1 .4 1 1v9c0 .6-.4 1-1 1H7l-4 4V6c0-.6.4-1 1-1Z"/>
                <path d="M8 11h8"/>
                <path d="M8 8h10"/>
              </svg>
            </button>
          </div>
        `;

      this.cacheDom();
      this.bindEvents();
      if (this.userInfoSubmitted) {
        this.seedInitialMessages();
        this.renderSuggestions();
      } else {
        this.bindFormEvents();
      }
    }

    cacheDom() {
      const s = this.shadow;
      this.userInfoFormContainer = s.querySelector(".user-info-form-container");
      this.userInfoForm = s.querySelector("#user-info-form");
      this.phoneInput = s.querySelector("#user-phone");
      this.emailInput = s.querySelector("#user-email");
      this.phoneError = s.querySelector("#phone-error");
      this.emailError = s.querySelector("#email-error");
      this.panel = s.querySelector(".panel");
      this.launcher = s.querySelector(".launcher");
      this.closeBtn = s.querySelector(".close-btn");
      this.messagesEl = s.querySelector(".messages");
      this.suggestionsEl = s.querySelector(".suggestions");
      this.suggestionsHeader = s.querySelector(".suggestions-header");
      this.suggestionsToggle = s.querySelector(".suggestions-toggle");
      this.suggestionsToggleText = s.querySelector(".suggestions-toggle-text");
      this.textarea = s.querySelector("textarea");
      this.sendBtn = s.querySelector(".send-btn");
      this.suggestionsCollapsed = false;
      this.lengthWarning = null;
    }

    bindFormEvents() {
      if (!this.userInfoForm) return;

      // Real-time validation
      if (this.phoneInput) {
        this.phoneInput.addEventListener("blur", () => this.validatePhone());
        this.phoneInput.addEventListener("input", () => {
          if (this.phoneInput.classList.contains("error")) {
            this.validatePhone();
          }
        });
      }

      if (this.emailInput) {
        this.emailInput.addEventListener("blur", () => this.validateEmail());
        this.emailInput.addEventListener("input", () => {
          if (this.emailInput.classList.contains("error")) {
            this.validateEmail();
          }
        });
      }

      // Form submit
      this.userInfoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submitUserInfo();
      });
    }

    countWords(text) {
      if (!text) return 0;
      return text.trim().split(/\s+/).filter(Boolean).length;
    }

    validateMaxWords() {
      if (!this.textarea) return;
      const maxWords = this.cfg.maxWords || 1000;
      const currentText = this.textarea.value || "";
      const count = this.countWords(currentText);

      // Tìm / tạo khối hiển thị cảnh báo bên dưới composer
      if (!this.lengthWarning) {
        const composer = this.shadow.querySelector(".composer");
        if (composer) {
          const warn = document.createElement("div");
          warn.className = "length-warning";
          warn.style.display = "none";
          composer.parentElement.appendChild(warn);
          this.lengthWarning = warn;
        }
      }

      if (this.lengthWarning) {
        if (count > 0) {
          this.lengthWarning.style.display = "block";
          if (count > maxWords) {
            this.lengthWarning.classList.add("error");
            this.lengthWarning.textContent = `Câu hỏi quá dài (${count}/${maxWords} từ). Vui lòng rút ngắn.`;
          } else {
            this.lengthWarning.classList.remove("error");
            this.lengthWarning.textContent = `Số từ: ${count}/${maxWords}`;
          }
        } else {
          this.lengthWarning.style.display = "none";
        }
      }

      // Disable send nếu vượt quá
      if (this.sendBtn) {
        this.sendBtn.disabled = count > maxWords;
      }
    }

    validatePhone() {
      const phone = this.phoneInput.value.trim();
      const isValid = validatePhone(phone);

      if (!isValid && phone) {
        this.phoneInput.classList.add("error");
        this.phoneError.classList.add("show");
        return false;
      } else {
        this.phoneInput.classList.remove("error");
        this.phoneError.classList.remove("show");
        return true;
      }
    }

    validateEmail() {
      const email = this.emailInput.value.trim();
      const isValid = validateEmail(email);

      if (!isValid && email) {
        this.emailInput.classList.add("error");
        this.emailError.classList.add("show");
        return false;
      } else {
        this.emailInput.classList.remove("error");
        this.emailError.classList.remove("show");
        return true;
      }
    }

    async submitUserInfo() {
      const phone = this.phoneInput.value.trim();
      const email = this.emailInput.value.trim();

      // Validate
      const phoneValid = this.validatePhone();
      const emailValid = this.validateEmail();

      if (!phone || !email) {
        if (!phone) {
          this.phoneInput.classList.add("error");
          this.phoneError.classList.add("show");
        }
        if (!email) {
          this.emailInput.classList.add("error");
          this.emailError.classList.add("show");
        }
        return;
      }

      if (!phoneValid || !emailValid) {
        return;
      }

      // Disable submit button
      const submitBtn = this.userInfoForm.querySelector(".form-submit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang xử lý...";

      try {
        // Gửi lên server để lưu vào database
        let contactId = null;
        try {
          const response = await fetch(
            `${this.cfg.apiBaseUrl}/public/contact/user-info`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sdt: phone,
                email: email,
                session_id: this.cfg.sessionId,
                specialized: null, // Có thể thêm sau nếu cần
              }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            if (data.status === "success" && data.data) {
              contactId = data.data.id;
              // Lưu contact ID vào localStorage để sử dụng sau
              localStorage.setItem("chatbot_contact_id", contactId);
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.warn("Lỗi khi lưu thông tin lên server:", errorData);
          }
        } catch (error) {
          console.warn("Không thể gửi thông tin lên server:", error);
          // Vẫn tiếp tục nếu API lỗi, nhưng sẽ lưu vào localStorage làm backup
        }

        // Lưu vào localStorage làm backup (ngay cả khi API thành công)
        localStorage.setItem("chatbot_user_phone", phone);
        localStorage.setItem("chatbot_user_email", email);
        if (contactId) {
          localStorage.setItem("chatbot_contact_id", contactId);
        }

        // Ẩn form container
        this.userInfoFormContainer.classList.add("hidden");

        // Hiển thị chat interface
        this.userInfoSubmitted = true;

        // Render chat interface
        const body = this.shadow.querySelector(".body");
        body.innerHTML = `
            <div class="messages"></div>
            <div class="suggestions-header">
              <span class="suggestions-title">Câu hỏi gợi ý</span>
              <button class="suggestions-toggle" aria-label="Ẩn/Hiện câu hỏi gợi ý">
                <span class="suggestions-toggle-text">Ẩn</span>
                <svg class="suggestions-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
            </div>
            <div class="suggestions"></div>
            <div class="composer">
              <textarea rows="1" placeholder="${this.cfg.placeholder}" aria-label="Nhập tin nhắn"></textarea>
              <button class="send-btn" aria-label="Gửi">➤</button>
            </div>
          `;

        // Re-cache DOM
        this.cacheDom();
        this.bindEvents();

        // Seed messages và suggestions
        this.seedInitialMessages();
        this.renderSuggestions();

        // Load history
        if (!this.historyLoaded) {
          this.loadHistory();
          this.historyLoaded = true;
        }

        // Bắt đầu polling sau khi submit thông tin
        if (this.userInfoSubmitted) {
          this.startPolling();
        }
      } catch (error) {
        console.error("Lỗi khi lưu thông tin:", error);
        submitBtn.disabled = false;
        submitBtn.textContent = "Bắt đầu";
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    }

    bindEvents() {
      if (this.launcher) {
        this.launcher.addEventListener("click", () => this.toggle(true));
      }
      if (this.closeBtn) {
        this.closeBtn.addEventListener("click", () => this.toggle(false));
      }
      if (this.sendBtn) {
        this.sendBtn.addEventListener("click", () => this.sendMessage());
      }
      if (this.suggestionsToggle) {
        this.suggestionsToggle.addEventListener("click", () =>
          this.toggleSuggestions(),
        );
      }
      if (this.textarea) {
        this.textarea.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });
        // Auto-resize textarea + validate độ dài
        this.textarea.addEventListener("input", () => {
          this.textarea.style.height = "auto";
          this.textarea.style.height = `${Math.min(this.textarea.scrollHeight, 120)}px`;
          this.validateMaxWords();
          // Emit typing indicator cho staff
          this.handleTypingIndicator();
        });
      }
      // Infinite scroll: detect scroll to top để load more messages
      if (this.messagesEl) {
        this.messagesEl.addEventListener("scroll", () => {
          // Nếu scroll gần đến đầu (trong vòng 100px) và có thể load more
          if (
            this.messagesEl.scrollTop < 100 &&
            this.hasMoreMessages &&
            !this.isLoadingMore &&
            this.historyLoaded
          ) {
            this.loadMoreMessages();
          }
        });
      }
    }

    toggleSuggestions() {
      if (
        !this.suggestionsEl ||
        !this.suggestionsToggle ||
        !this.suggestionsToggleText
      )
        return;

      this.suggestionsCollapsed = !this.suggestionsCollapsed;
      if (this.suggestionsCollapsed) {
        this.suggestionsEl.classList.add("collapsed");
        this.suggestionsToggle.classList.add("collapsed");
        this.suggestionsToggleText.textContent = "Hiện";
      } else {
        this.suggestionsEl.classList.remove("collapsed");
        this.suggestionsToggle.classList.remove("collapsed");
        this.suggestionsToggleText.textContent = "Ẩn";
      }
    }

    toggle(forceOpen) {
      if (!this.panel) return;

      const next = typeof forceOpen === "boolean" ? forceOpen : !this.isOpen;
      this.isOpen = next;
      if (next) {
        this.panel.classList.add("open");
        // Focus vào input phù hợp
        if (!this.userInfoSubmitted && this.phoneInput) {
          this.phoneInput.focus();
        } else if (this.textarea) {
          this.textarea.focus();
        }
        // Load history khi mở lần đầu (nếu đã có thông tin)
        if (this.userInfoSubmitted && !this.historyLoaded) {
          this.loadHistory();
          this.historyLoaded = true;
        }
        // Bắt đầu polling để fetch messages mới từ nhân viên (fallback)
        if (this.userInfoSubmitted) {
          this.startPolling();
        }
        // Kết nối Socket.IO để nhận realtime từ nhân viên
        if (this.userInfoSubmitted) {
          this.connectSocket();
        }
      } else {
        this.panel.classList.remove("open");
        // Dừng polling khi đóng widget
        this.stopPolling();
        // Ngắt kết nối socket
        this.disconnectSocket();
      }
    }

    startPolling() {
      // Dừng polling cũ nếu có
      this.stopPolling();

      // Chỉ start polling nếu đã có contact_id và widget đang mở
      const contactId = localStorage.getItem("chatbot_contact_id");
      if (!contactId || !this.isOpen) {
        return;
      }

      // Bắt đầu polling mới
      this.pollingInterval = setInterval(() => {
        this.checkNewMessages();
      }, this.pollingIntervalMs);
    }

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    }

    async connectSocket() {
      if (this.socket || !this.userInfoSubmitted) {
        return;
      }
      const contactId = localStorage.getItem("chatbot_contact_id");
      if (!contactId) {
        return;
      }
      try {
        const ioClient = await loadSocketIoClient();
        const baseUrl =
          this.cfg.socketUrl || this.cfg.apiBaseUrl.replace(/\/api.*/i, "");
        this.socket = ioClient(baseUrl, {
          path: "/socket.io",
          transports: ["websocket"],
          query: { contact_id: contactId },
        });

        this.socket.on("connect", () => {
          this.socketConnected = true;
          // Join room để nhận sự kiện từ room contact_{id}
          this.socket.emit("join_room", { room: `contact_${contactId}` });
          // Khi socket đã ổn định, có thể dừng polling để giảm tải
          this.stopPolling();
          console.log(
            "[socket.io] connected",
            `joined room contact_${contactId}`,
          );
        });

        this.socket.on("disconnect", () => {
          this.socketConnected = false;
          console.log("[socket.io] disconnected");
          // Fallback: bật lại polling nếu widget vẫn mở
          if (this.isOpen && this.userInfoSubmitted) {
            this.startPolling();
          }
        });

        this.socket.on("staff_message", (payload) => {
          if (!payload || !payload.content) return;
          // Ẩn remote typing indicator nếu có
          this.hideRemoteTyping();
          // Tin nhắn từ nhân viên hiển thị như bot
          this.addMessage(payload.content, "bot");
          if (this.messagesEl) {
            this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
          }
        });

        // Lắng nghe sự kiện typing từ admin/staff
        this.socket.on("user_typing", (payload) =>
          this.handleRemoteTyping(payload),
        );
        this.socket.on("staff_typing", (payload) =>
          this.handleRemoteTyping(payload),
        );
      } catch (err) {
        console.warn("Không thể kết nối Socket.IO, fallback về polling:", err);
        // Polling vẫn tiếp tục hoạt động
      }
    }

    disconnectSocket() {
      if (this.socket) {
        this.socket.off("staff_message");
        this.socket.off("user_typing");
        this.socket.off("staff_typing");
        this.socket.disconnect();
        this.socket = null;
        this.socketConnected = false;
      }
      // Clear typing timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
        this.typingTimeout = null;
      }
      this.isTyping = false;
    }

    handleTypingIndicator() {
      // Chỉ emit nếu socket đã kết nối và widget đang mở
      if (!this.socketConnected || !this.socket || !this.isOpen) {
        return;
      }

      const contactId = localStorage.getItem("chatbot_contact_id");
      if (!contactId) {
        return;
      }

      // Emit typing event ngay lập tức
      if (!this.isTyping) {
        this.isTyping = true;
        this.socket.emit("user_typing", {
          contact_id: parseInt(contactId),
          is_typing: true,
        });
      }

      // Clear timeout cũ
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      // Sau 2 giây không gõ, emit stop typing
      this.typingTimeout = setTimeout(() => {
        if (this.socketConnected && this.socket) {
          this.socket.emit("user_typing", {
            contact_id: parseInt(contactId),
            is_typing: false,
          });
        }
        this.isTyping = false;
        this.typingTimeout = null;
      }, 2000);
    }

    handleRemoteTyping(payload) {
      console.log("[Widget] handleRemoteTyping:", payload);
      // payload: { contact_id, is_typing: boolean }
      // Kiểm tra xem có phải typing từ phía bên kia không
      // (Nếu backend broadcast lại cho chính người gửi thì cần check, nhưng ở đây
      // ta giả định backend broadcast "user_typing" từ Admin -> Widget)

      if (payload.is_typing) {
        this.showRemoteTyping();
      } else {
        this.hideRemoteTyping();
      }
    }

    showRemoteTyping() {
      if (!this.messagesEl) return;

      // Kiểm tra xem đã có indicator chưa
      let indicator = this.messagesEl.querySelector(
        ".msg.bot.typing-indicator.remote-typing",
      );
      if (indicator) return;

      indicator = document.createElement("div");
      indicator.className = "msg bot typing-indicator remote-typing";
      indicator.innerHTML = `
          <span class="typing-indicator-text">Nhân viên đang nhập</span>
          <span class="typing-indicator-dots">
            <span class="typing-indicator-dot"></span>
            <span class="typing-indicator-dot"></span>
            <span class="typing-indicator-dot"></span>
          </span>
        `;
      this.messagesEl.appendChild(indicator);
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    hideRemoteTyping() {
      if (!this.messagesEl) return;
      const indicator = this.messagesEl.querySelector(
        ".msg.bot.typing-indicator.remote-typing",
      );
      if (indicator) {
        indicator.remove();
      }
    }

    async updateLastMessageIdFromHistory() {
      // Helper function để cập nhật lastMessageId từ history
      const contactId = localStorage.getItem("chatbot_contact_id");
      if (!contactId) {
        return;
      }

      try {
        const response = await fetch(
          `${this.cfg.apiBaseUrl}/public/messages/history?contact_id=${encodeURIComponent(contactId)}&page=1&page_size=1`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (
            data.status === "success" &&
            data.data &&
            Array.isArray(data.data.messages) &&
            data.data.messages.length > 0
          ) {
            this.lastMessageId = data.data.messages[0].id;
          }
        }
      } catch (error) {
        // Silent fail
        console.debug("Update lastMessageId error (silent):", error);
      }
    }

    async checkNewMessages() {
      // Chỉ check khi widget đang mở và đã có contact_id
      if (!this.isOpen || !this.userInfoSubmitted) {
        return;
      }

      const contactId = localStorage.getItem("chatbot_contact_id");
      if (!contactId) {
        return;
      }

      try {
        // Lấy trang 1 history để kiểm tra messages mới
        const response = await fetch(
          `${this.cfg.apiBaseUrl}/public/messages/history?contact_id=${encodeURIComponent(contactId)}&page=1&page_size=${this.pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) return;

        const data = await response.json();
        if (
          !data ||
          data.status !== "success" ||
          !data.data ||
          !Array.isArray(data.data.messages)
        ) {
          return;
        }

        const messages = data.data.messages;
        if (!messages.length) return;

        // Nếu chưa có lastMessageId, khởi tạo bằng ID mới nhất rồi bỏ qua lần này
        if (this.lastMessageId === null) {
          this.lastMessageId = messages[0].id;
          return;
        }

        // Lọc các message mới hơn lastMessageId
        const newMessages = messages.filter(
          (msg) => msg.id > this.lastMessageId,
        );
        if (!newMessages.length) return;

        // Sắp xếp theo ID tăng dần để hiển thị theo thời gian
        newMessages.sort((a, b) => a.id - b.id);

        newMessages.forEach((msg) => {
          const role = msg.role === "user" ? "user" : "bot";
          this.addMessage(msg.content, role);
        });

        if (this.messagesEl) {
          this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
        }

        // Cập nhật lastMessageId = ID lớn nhất
        this.lastMessageId = newMessages[newMessages.length - 1].id;
        console.log(`Đã nhận ${newMessages.length} tin nhắn mới từ nhân viên`);
      } catch (error) {
        console.debug("Polling error (silent):", error);
      }
    }

    async loadHistory() {
      // Lấy contact_id từ localStorage
      const contactId = localStorage.getItem("chatbot_contact_id");
      if (!contactId) {
        console.log("Không có contact_id, không thể load lịch sử");
        return;
      }

      // Reset pagination
      this.currentPage = 1;
      this.hasMoreMessages = true;
      this.isLoadingMore = false;

      try {
        const response = await fetch(
          `${this.cfg.apiBaseUrl}/public/messages/history?contact_id=${encodeURIComponent(contactId)}&page=${this.currentPage}&page_size=${this.pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (
            data.status === "success" &&
            data.data &&
            Array.isArray(data.data.messages)
          ) {
            const messages = data.data.messages;
            const totalRecords = data.data.total_records || 0;

            // Kiểm tra còn messages để load không
            this.hasMoreMessages =
              this.currentPage * this.pageSize < totalRecords;

            // Nếu có lịch sử, xóa tất cả messages hiện tại và render lại lịch sử
            if (messages.length > 0 && this.messagesEl) {
              // Xóa tất cả messages hiện tại (bao gồm greeting)
              this.messagesEl.innerHTML = "";

              // Messages từ API đã được sắp xếp mới nhất trước, nhưng cần reverse để render từ cũ đến mới
              // (để tin nhắn mới nhất ở dưới cùng)
              const reversedMessages = [...messages].reverse();

              // Render lại toàn bộ lịch sử chat (từ cũ đến mới)
              reversedMessages.forEach((msg) => {
                // role='user' -> hiển thị bên phải (user)
                // role='bot' hoặc 'customer' (nhân viên) -> hiển thị bên trái (bot)
                const role = msg.role === "user" ? "user" : "bot";
                this.addMessage(msg.content, role);
              });

              // Scroll xuống cuối (tin nhắn mới nhất)
              this.messagesEl.scrollTop = this.messagesEl.scrollHeight;

              // Cập nhật lastMessageId để polling biết message cuối cùng
              if (messages.length > 0) {
                this.lastMessageId = messages[0].id; // Message mới nhất (đã sắp xếp desc)
              } else {
                // Nếu không có messages, set lastMessageId = 0 để polling vẫn hoạt động
                // (sẽ check tất cả messages có ID > 0)
                this.lastMessageId = 0;
              }

              console.log(
                "Đã load lịch sử chat:",
                messages.length,
                "tin nhắn (trang",
                this.currentPage,
                ")",
              );
            } else {
              // Không có lịch sử, giữ lại greeting message (đã được thêm từ seedInitialMessages)
              console.log("Không có lịch sử chat, giữ lại greeting message");
              this.hasMoreMessages = false;
            }
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn("Lỗi khi load lịch sử chat:", errorData);
        }
      } catch (error) {
        console.warn("Không thể load lịch sử chat từ server:", error);
        // Không throw error để không làm gián đoạn flow chat
      }
    }

    async loadMoreMessages() {
      // Kiểm tra điều kiện
      if (this.isLoadingMore || !this.hasMoreMessages || !this.historyLoaded) {
        return;
      }

      const contactId = localStorage.getItem("chatbot_contact_id");
      if (!contactId) {
        return;
      }

      this.isLoadingMore = true;
      this.currentPage += 1;

      try {
        // Lưu scroll position hiện tại
        const oldScrollHeight = this.messagesEl.scrollHeight;
        const oldScrollTop = this.messagesEl.scrollTop;

        const response = await fetch(
          `${this.cfg.apiBaseUrl}/public/messages/history?contact_id=${encodeURIComponent(contactId)}&page=${this.currentPage}&page_size=${this.pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (
            data.status === "success" &&
            data.data &&
            Array.isArray(data.data.messages)
          ) {
            const messages = data.data.messages;
            const totalRecords = data.data.total_records || 0;

            // Kiểm tra còn messages để load không
            this.hasMoreMessages =
              this.currentPage * this.pageSize < totalRecords;

            if (messages.length > 0 && this.messagesEl) {
              // Messages từ API đã được sắp xếp mới nhất trước, cần reverse để render từ cũ đến mới
              const reversedMessages = [...messages].reverse();

              // Thêm messages cũ hơn vào đầu danh sách
              reversedMessages.forEach((msg) => {
                // role='user' -> hiển thị bên phải (user)
                // role='bot' hoặc 'customer' (nhân viên) -> hiển thị bên trái (bot)
                const role = msg.role === "user" ? "user" : "bot";
                this.addMessageToTop(msg.content, role);
              });

              // Giữ scroll position (scroll xuống một khoảng bằng chiều cao messages mới thêm)
              const newScrollHeight = this.messagesEl.scrollHeight;
              const heightDifference = newScrollHeight - oldScrollHeight;
              this.messagesEl.scrollTop = oldScrollTop + heightDifference;

              console.log(
                "Đã load thêm",
                messages.length,
                "tin nhắn cũ hơn (trang",
                this.currentPage,
                ")",
              );
            } else {
              this.hasMoreMessages = false;
            }
          }
        } else {
          // Nếu lỗi, rollback page number
          this.currentPage -= 1;
          const errorData = await response.json().catch(() => ({}));
          console.warn("Lỗi khi load thêm lịch sử chat:", errorData);
        }
      } catch (error) {
        // Nếu lỗi, rollback page number
        this.currentPage -= 1;
        console.warn("Không thể load thêm lịch sử chat từ server:", error);
      } finally {
        this.isLoadingMore = false;
      }
    }

    addMessageToTop(text, role) {
      if (!this.messagesEl) return;

      const msg = document.createElement("div");
      msg.className = `msg ${role}`;
      const escapeHtml = (s) =>
        String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\"/g, "&quot;")
          .replace(/'/g, "&#39;");

      const formatUrlLabel = (rawUrl) => {
        try {
          const u = new URL(rawUrl);
          const host = u.host;
          const path = u.pathname && u.pathname !== "/" ? u.pathname : "";
          const shortPath = path.length > 28 ? `${path.slice(0, 28)}…` : path;
          return `${host}${shortPath}`;
        } catch (e) {
          return rawUrl;
        }
      };

      // Linkify URL để người dùng click được (mở tab mới)
      const linkify = (s) => {
        const escaped = escapeHtml(s);
        const urlRegex = /(https?:\/\/[^\s<>"')\]]+)/g;
        return escaped.replace(urlRegex, (m) => {
          const href = m;
          const label = escapeHtml(formatUrlLabel(m));
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        });
      };

      msg.innerHTML = linkify(text);
      // Thêm vào đầu danh sách (insertBefore với firstChild)
      this.messagesEl.insertBefore(msg, this.messagesEl.firstChild);
    }

    getHardcodedResponse(message) {
      const normalized = message.toLowerCase().trim();

      // Tìm exact match
      if (hardcodedResponses[normalized]) {
        return hardcodedResponses[normalized];
      }

      // Tìm partial match
      for (const [key, value] of Object.entries(hardcodedResponses)) {
        if (normalized.includes(key) || key.includes(normalized)) {
          return value;
        }
      }

      return null;
    }

    async sendMessageToAPI(message) {
      // 1) Thử tìm câu trả lời trong FAQs backend (vector search)
      try {
        // Lấy contact_id từ localStorage
        const contactId = localStorage.getItem("chatbot_contact_id");
        const payload = {
          query: message,
          ai_config_id: this.cfg.faqAiConfigId || defaults.faqAiConfigId,
          top_k: 5,
          threshold: 0.6,
        };
        // Thêm contact_id nếu có để kiểm tra ai_active
        if (contactId) {
          payload.contact_id = parseInt(contactId);
        }

        const response = await fetch(
          `${this.cfg.apiBaseUrl}/public/faqs/search`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === "success" && data.data) {
            // Kiểm tra nếu source là "manual" (ai_active=False)
            if (data.data.source === "manual") {
              const message =
                data.message ||
                "Cuộc hội thoại này đã được chuyển sang chế độ xử lý thủ công. Vui lòng đợi phản hồi từ nhân viên.";
              // Không lưu message khi ai_active=False (vì sẽ được xử lý thủ công)
              return message;
            }

            // Ưu tiên 1: Nếu có FAQs, trả về FAQ đầu tiên
            if (Array.isArray(data.data.faqs) && data.data.faqs.length > 0) {
              const best = data.data.faqs[0];
              const answer =
                best.answer ||
                "Hiện hệ thống chưa có câu trả lời chi tiết cho câu hỏi này. Bạn vui lòng liên hệ Phòng Đào tạo để được hỗ trợ thêm.";
              try {
                await this.saveMessageToAPI(answer, "bot");
              } catch (e) {
                // ignore lưu lịch sử lỗi
              }
              return answer;
            }

            // Ưu tiên 2: Nếu không có FAQs nhưng có AI response, sử dụng AI response
            if (data.data.ai_response && data.data.ai_response.trim()) {
              const aiAnswer = data.data.ai_response.trim();
              try {
                await this.saveMessageToAPI(aiAnswer, "bot");
              } catch (e) {
                // ignore
              }
              return aiAnswer;
            }
          }
        }
      } catch (error) {
        console.warn("Lỗi khi gọi API FAQs search:", error);
      }

      // 2) Nếu không tìm được trong FAQs và không có AI response, thử hardcoded responses
      const hardcoded = this.getHardcodedResponse(message);
      if (hardcoded) {
        try {
          await this.saveMessageToAPI(hardcoded, "bot");
        } catch (e) {
          // ignore
        }
        return hardcoded;
      }

      // 3) Fallback cuối cùng
      return "Hiện tại tôi chưa có thông tin cho câu hỏi này. Bạn có thể hỏi theo cách khác hoặc xem thêm trên website tuyển sinh của Trường.";
    }

    async saveMessageToAPI(message, role) {
      // Lấy contact_id từ localStorage
      const contactId = localStorage.getItem("chatbot_contact_id");
      if (!contactId) {
        console.warn("Không có contact_id, không thể lưu message");
        return null;
      }

      try {
        const response = await fetch(`${this.cfg.apiBaseUrl}/public/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contact_id: parseInt(contactId),
            role: role, // "user" hoặc "bot"
            content: message,
            message_metadata: null,
            session_id: this.cfg.sessionId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === "success") {
            console.log("Đã lưu message vào database:", data.data);
            // Trả về data để có thể lấy ID
            return data.data;
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn("Lỗi khi lưu message lên server:", errorData);
        }
      } catch (error) {
        console.warn("Không thể gửi message lên server:", error);
        // Không throw error để không làm gián đoạn flow chat
      }
      return null;
    }

    seedInitialMessages() {
      if (this.messagesEl) {
        this.addMessage(this.cfg.greeting, "bot");
      }
    }

    renderSuggestions() {
      if (!this.suggestionsEl) return;

      const { suggestions } = this.cfg;
      if (!suggestions || !suggestions.length) {
        this.suggestionsEl.innerHTML = "";
        return;
      }
      this.suggestionsEl.innerHTML = "";
      suggestions.forEach((text) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.textContent = text;
        // Hiện full câu hỏi khi hover (vì chip có ellipsis để tránh vỡ UI)
        chip.title = text;
        chip.addEventListener("click", () => {
          // Chặn click vào suggestions nếu đang xử lý tin nhắn
          if (this.isProcessing) {
            return;
          }
          if (this.textarea) {
            this.textarea.value = text;
            this.sendMessage();
          }
        });
        this.suggestionsEl.appendChild(chip);
      });
    }

    async loadFaqSuggestionsFromApi() {
      try {
        const limit =
          this.cfg.faqSuggestionsLimit || defaults.faqSuggestionsLimit;
        const url = `${this.cfg.apiBaseUrl}/public/faqs?ai_config_id=${encodeURIComponent(
          this.cfg.faqAiConfigId || defaults.faqAiConfigId,
        )}&page=1&page_size=${limit}&sort_by=priority&sort_order=desc`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) return;
        const data = await response.json();
        if (
          data.status === "success" &&
          data.data &&
          Array.isArray(data.data.faqs)
        ) {
          const qs = data.data.faqs.map((f) => f.question).filter(Boolean);
          if (qs.length) {
            this.cfg.suggestions = qs.slice(0, limit);
            this.renderSuggestions();
          }
        }
      } catch (error) {
        console.warn("Không thể load FAQ suggestions từ API:", error);
      }
    }

    addMessage(text, role) {
      if (!this.messagesEl) return;

      const msg = document.createElement("div");
      msg.className = `msg ${role}`;
      const escapeHtml = (s) =>
        String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\"/g, "&quot;")
          .replace(/'/g, "&#39;");

      const formatUrlLabel = (rawUrl) => {
        try {
          const u = new URL(rawUrl);
          const host = u.host;
          const path = u.pathname && u.pathname !== "/" ? u.pathname : "";
          const shortPath = path.length > 28 ? `${path.slice(0, 28)}…` : path;
          return `${host}${shortPath}`;
        } catch (e) {
          return rawUrl;
        }
      };

      // Linkify URL để người dùng click được (mở tab mới)
      const linkify = (s) => {
        const escaped = escapeHtml(s);
        const urlRegex = /(https?:\/\/[^\s<>"')\]]+)/g;
        return escaped.replace(urlRegex, (m) => {
          const href = m;
          const label = escapeHtml(formatUrlLabel(m));
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        });
      };

      msg.innerHTML = linkify(text);
      this.messagesEl.appendChild(msg);
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    async sendMessage() {
      if (!this.textarea || !this.sendBtn || !this.messagesEl) return;

      // Kiểm tra nếu đang xử lý tin nhắn khác, không cho phép gửi tiếp
      if (this.isProcessing) {
        return;
      }

      const value = (this.textarea.value || "").trim();
      if (!value) return;

      // Kiểm tra lại giới hạn số từ trước khi gửi (phòng trường hợp JS chưa kịp chạy validateMaxWords)
      const wordCount = this.countWords(value);
      const maxWords = this.cfg.maxWords || 1000;
      if (wordCount > maxWords) {
        // Hiển thị cảnh báo chuyên nghiệp và không gửi request
        if (this.lengthWarning) {
          this.lengthWarning.style.display = "block";
          this.lengthWarning.style.color = "#dc2626";
          this.lengthWarning.textContent = `Câu hỏi quá dài (${wordCount}/${maxWords} từ). Vui lòng rút ngắn trước khi gửi.`;
        }
        return;
      }

      // Đánh dấu đang xử lý và disable UI
      this.isProcessing = true;
      this.sendBtn.disabled = true;
      if (this.textarea) {
        this.textarea.disabled = true;
        this.textarea.placeholder = "Đang xử lý tin nhắn, vui lòng đợi...";
      }

      // Disable tất cả suggestions
      if (this.suggestionsEl) {
        const chips = this.suggestionsEl.querySelectorAll(".chip");
        chips.forEach((chip) => {
          chip.disabled = true;
          chip.style.opacity = "0.5";
          chip.style.cursor = "not-allowed";
        });
      }

      // Hiển thị message của user
      this.addMessage(value, "user");

      // CLEAR INPUT NGAY LẬP TỨC để tạo cảm giác mượt mà
      this.textarea.value = "";
      this.textarea.style.height = "auto";

      // SHOW TYPING INDICATOR NGAY LẬP TỨC
      // Hiển thị typing indicator với thông điệp động chuyên nghiệp
      const loading = document.createElement("div");
      loading.className = "msg bot typing-indicator";

      // Danh sách thông điệp xoay vòng
      const thinkingMessages = [
        "Đang suy nghĩ",
        "Đang tìm kiếm thông tin",
        "Đang xử lý câu hỏi",
        "Đang phân tích",
      ];

      let currentMessageIndex = 0;
      const updateThinkingMessage = () => {
        if (loading.classList.contains("typing-indicator")) {
          loading.innerHTML = `
              <span class="typing-indicator-text">${thinkingMessages[currentMessageIndex]}</span>
              <span class="typing-indicator-dots">
                <span class="typing-indicator-dot"></span>
                <span class="typing-indicator-dot"></span>
                <span class="typing-indicator-dot"></span>
              </span>
            `;
          currentMessageIndex =
            (currentMessageIndex + 1) % thinkingMessages.length;
        }
      };

      // Hiển thị thông điệp đầu tiên
      updateThinkingMessage();
      this.messagesEl.appendChild(loading);
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;

      // Xoay vòng thông điệp mỗi 2 giây
      const thinkingInterval = setInterval(() => {
        if (loading.classList.contains("typing-indicator")) {
          updateThinkingMessage();
        } else {
          clearInterval(thinkingInterval);
        }
      }, 2000);

      // Lưu interval để clear khi cần
      loading._thinkingInterval = thinkingInterval;

      try {
        console.log("[Widget] Saving user message...");
        // Lưu user message vào database
        const saveResult = await this.saveMessageToAPI(value, "user");

        // Cập nhật lastMessageId sau khi lưu message thành công
        if (saveResult && saveResult.id) {
          this.lastMessageId = saveResult.id;
        } else {
          // Nếu không có ID từ response, fetch lại để cập nhật
          await this.updateLastMessageIdFromHistory();
        }

        console.log("[Widget] User message saved. Starting stream...");
        // Sử dụng streaming API để render từng token (giống ChatGPT)
        await this.sendMessageToAPIStream(value, loading);
      } catch (error) {
        console.error("Error sending message:", error);
        // Clear interval nếu có
        if (loading._thinkingInterval) {
          clearInterval(loading._thinkingInterval);
          loading._thinkingInterval = null;
        }
        // Remove loading
        loading.remove();

        // Hiển thị error message
        this.addMessage("Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.", "bot");
      } finally {
        // Re-enable UI sau khi hoàn thành (thành công hoặc lỗi)
        this.isProcessing = false;
        this.sendBtn.disabled = false;
        if (this.textarea) {
          this.textarea.disabled = false;
          this.textarea.placeholder =
            this.cfg.placeholder || "Nhập câu hỏi của bạn...";
          this.textarea.focus();
        }

        // Re-enable suggestions
        if (this.suggestionsEl) {
          const chips = this.suggestionsEl.querySelectorAll(".chip");
          chips.forEach((chip) => {
            chip.disabled = false;
            chip.style.opacity = "1";
            chip.style.cursor = "pointer";
          });
        }
      }
    }

    async sendMessageToAPIStream(message, botMessage) {
      // botMessage hiện đang là bubble typing-indicator (3 chấm) đã được add vào DOM.
      // Ta sẽ ghi dần nội dung lên chính bubble này, và bỏ class typing-indicator khi có token đầu tiên.
      // Lấy contact_id từ localStorage
      const contactId = localStorage.getItem("chatbot_contact_id");
      const payload = {
        query: message,
        ai_config_id: this.cfg.faqAiConfigId || defaults.faqAiConfigId,
        top_k: 5,
        threshold: 0.6,
      };
      // Thêm contact_id nếu có để kiểm tra ai_active
      if (contactId) {
        payload.contact_id = parseInt(contactId);
      }

      try {
        const response = await fetch(
          `${this.cfg.apiBaseUrl}/public/faqs/search/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        // Escape HTML helper
        const escapeHtml = (s) =>
          String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");

        // Linkify URL helper
        const formatUrlLabel = (rawUrl) => {
          try {
            const u = new URL(rawUrl);
            const host = u.host;
            const path = u.pathname && u.pathname !== "/" ? u.pathname : "";
            const shortPath = path.length > 28 ? `${path.slice(0, 28)}…` : path;
            return `${host}${shortPath}`;
          } catch (e) {
            return rawUrl;
          }
        };

        const linkify = (s) => {
          const escaped = escapeHtml(s);
          const urlRegex = /(https?:\/\/[^\s<>"')\]]+)/g;
          return escaped.replace(urlRegex, (m) => {
            const href = m;
            const label = escapeHtml(formatUrlLabel(m));
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
          });
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Giữ lại phần chưa hoàn chỉnh

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "token") {
                  // Thêm token vào fullText và render
                  fullText += data.content;
                  // Khi nhận token đầu tiên, bỏ hiệu ứng typing-indicator, chuyển sang bubble bot bình thường
                  if (botMessage.classList.contains("typing-indicator")) {
                    // Clear interval nếu có
                    if (botMessage._thinkingInterval) {
                      clearInterval(botMessage._thinkingInterval);
                      botMessage._thinkingInterval = null;
                    }
                    botMessage.classList.remove("typing-indicator");
                  }
                  botMessage.innerHTML = linkify(fullText);
                  // Auto scroll
                  this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
                } else if (data.type === "done") {
                  // Streaming hoàn tất
                  // Nếu source là "manual" (ai_active=False), không lưu bot message
                  // (vì đây chỉ là thông báo, không phải câu trả lời thực sự)
                  // Message của user đã được lưu trước đó (ở dòng 2014 trong sendMessage)
                  if (data.source === "manual") {
                    // Không lưu bot message khi ai_active=False
                    // Nhưng vẫn giữ lại message đã hiển thị (fullText đã được render)
                    // Cập nhật lastMessageId để polling có thể check messages mới
                    await this.updateLastMessageIdFromHistory();
                    return;
                  }
                  // Lưu bot message vào database (cho các trường hợp khác)
                  try {
                    const saveResult = await this.saveMessageToAPI(
                      fullText.trim(),
                      "bot",
                    );
                    // Cập nhật lastMessageId từ response nếu có
                    if (saveResult && saveResult.id) {
                      this.lastMessageId = saveResult.id;
                    } else {
                      await this.updateLastMessageIdFromHistory();
                    }
                  } catch (e) {
                    // ignore, nhưng vẫn cập nhật lastMessageId
                    await this.updateLastMessageIdFromHistory();
                  }
                  return;
                } else if (data.type === "error") {
                  throw new Error(data.content);
                }
              } catch (e) {
                console.warn("Error parsing SSE data:", e, line);
              }
            }
          }
        }

        // Lưu message vào database sau khi stream xong (nếu chưa lưu)
        if (fullText.trim()) {
          try {
            const saveResult = await this.saveMessageToAPI(
              fullText.trim(),
              "bot",
            );
            // Cập nhật lastMessageId từ response nếu có
            if (saveResult && saveResult.id) {
              this.lastMessageId = saveResult.id;
            } else {
              await this.updateLastMessageIdFromHistory();
            }
          } catch (e) {
            // ignore, nhưng vẫn cập nhật lastMessageId
            await this.updateLastMessageIdFromHistory();
          }
        } else {
          // Nếu không có fullText, vẫn cập nhật lastMessageId
          await this.updateLastMessageIdFromHistory();
        }
      } catch (error) {
        console.error("Streaming error:", error);
        botMessage.innerHTML = "Xin lỗi, đã xảy ra lỗi khi tải phản hồi.";
        throw error;
      }
    }
  }

  const init = () => {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      new ChatbotWidget(config);
    } else {
      document.addEventListener(
        "DOMContentLoaded",
        () => new ChatbotWidget(config),
        { once: true },
      );
    }
  };

  init();
})();
