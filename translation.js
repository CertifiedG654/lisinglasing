const translations = {
    en: {
      logo: "Lising Lasing",
      my_account: "My Account",
      product: "Product",
      my_orders: "My Orders",
      wishlist: "Wishlist",
      settings: "Settings",
      logout: "Logout",
      fab_title: "Need help?",
      modal_title: "Confirm Logout",
      modal_message: "Are you sure you want to logout from your account?",
      modal_confirm: "Yes, Logout",
      modal_cancel: "Cancel",
      login_alert: "Please login first",
      fab_alert: "Contact our support team at support@lisinglasing.com for assistance.",
      dashboard_title: "Welcome to Your Dashboard",
      dashboard_description: "Manage your account, view orders, and explore our products.",
      products_title: "Our Products",
      products_description: "Browse our collection of premium products.",
      orders_title: "My Orders",
      orders_description: "View and manage your recent orders.",
      settings_title: "Account Settings",
      settings_description: "Update your profile and preferences."
    },
    fil: {
      logo: "Lising Lasing",
      my_account: "Aking Account",
      product: "Produkto",
      my_orders: "Aking Mga Order",
      wishlist: "Listahan ng Nais",
      settings: "Mga Setting",
      logout: "Mag-logout",
      fab_title: "Kailangan ng tulong?",
      modal_title: "Kumpirmahin ang Pag-logout",
      modal_message: "Sigurado ka bang nais mong mag-logout mula sa iyong account?",
      modal_confirm: "Oo, Mag-logout",
      modal_cancel: "Kanselahin",
      login_alert: "Mangyaring mag-login muna",
      fab_alert: "Makipag-ugnayan sa aming team ng suporta sa support@lisinglasing.com para sa tulong.",
      dashboard_title: "Maligayang Pagdating sa Iyong Dashboard",
      dashboard_description: "Pamahalaan ang iyong account, tingnan ang mga order, at tuklasin ang aming mga produkto.",
      products_title: "Aming Mga Produkto",
      products_description: "Tingnan ang aming koleksyon ng mga premium na produkto.",
      orders_title: "Aking Mga Order",
      orders_description: "Tingnan at pamahalaan ang iyong mga kamakailang order.",
      settings_title: "Mga Setting ng Account",
      settings_description: "I-update ang iyong profile at mga kagustuhan."
    },
    ko: {
      logo: "리싱 라싱",
      my_account: "내 계정",
      product: "제품",
      my_orders: "내 주문",
      wishlist: "위시리스트",
      settings: "설정",
      logout: "로그아웃",
      fab_title: "도움이 필요하신가요?",
      modal_title: "로그아웃 확인",
      modal_message: "계정에서 로그아웃하시겠습니까?",
      modal_confirm: "예, 로그아웃",
      modal_cancel: "취소",
      login_alert: "먼저 로그인해 주세요",
      fab_alert: "지원 팀에 support@lisinglasing.com으로 연락하여 도움을 받으세요.",
      dashboard_title: "대시보드에 오신 것을 환영합니다",
      dashboard_description: "계정을 관리하고, 주문을 확인하며, 제품을 탐색하세요.",
      products_title: "우리의 제품",
      products_description: "프리미엄 제품 컬렉션을 둘러보세요.",
      orders_title: "내 주문",
      orders_description: "최근 주문을 보고 관리하세요.",
      settings_title: "계정 설정",
      settings_description: "프로필과 설정을 업데이트하세요."
    },
    ja: {
      logo: "リシング・ラシング",
      my_account: "マイアカウント",
      product: "製品",
      my_orders: "私の注文",
      wishlist: "ウィッシュリスト",
      settings: "設定",
      logout: "ログアウト",
      fab_title: "ヘルプが必要ですか？",
      modal_title: "ログアウトの確認",
      modal_message: "アカウントからログアウトしますか？",
      modal_confirm: "はい、ログアウト",
      modal_cancel: "キャンセル",
      login_alert: "まずログインしてください",
      fab_alert: "サポートチームにsupport@lisinglasing.comでご連絡ください。",
      dashboard_title: "ダッシュボードへようこそ",
      dashboard_description: "アカウントの管理、注文の確認、製品の探索を行います。",
      products_title: "私たちの製品",
      products_description: "プレミアム製品のコレクションをご覧ください。",
      orders_title: "私の注文",
      orders_description: "最近の注文を表示および管理します。",
      settings_title: "アカウント設定",
      settings_description: "プロフィールと設定を更新します。"
    }
  };
  
  function changeLanguage(lang) {
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      if (translations[lang] && translations[lang][key]) {
        element.textContent = translations[lang][key];
        if (element.tagName === 'DIV' && element.classList.contains('fab')) {
          element.setAttribute('title', translations[lang][key]);
        }
      } else {
        // Fallback to English if translation is missing
        element.textContent = translations.en[key] || element.textContent;
        if (element.tagName === 'DIV' && element.classList.contains('fab')) {
          element.setAttribute('title', translations.en[key] || element.getAttribute('title'));
        }
      }
    });
    localStorage.setItem('selectedLanguage', lang);
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = lang;
    }
  }
  
  function getTranslation(lang, key) {
    return translations[lang] && translations[lang][key] ? translations[lang][key] : translations.en[key] || key;
  }