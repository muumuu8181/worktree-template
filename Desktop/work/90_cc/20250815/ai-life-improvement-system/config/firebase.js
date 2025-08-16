// 🔄 Step 1: Firebase設定分離
const FirebaseConfig = {
    // Firebase設定（元のメインファイルから移動）
    config: {
        apiKey: "AIzaSyA5PXKChizYDCXF_GJ4KL6Ylq9K5hCPXWE",
        authDomain: "shares-b1b97.firebaseapp.com",
        databaseURL: "https://shares-b1b97-default-rtdb.firebaseio.com",
        projectId: "shares-b1b97",
        storageBucket: "shares-b1b97.firebasestorage.app",
        messagingSenderId: "38311063248",
        appId: "1:38311063248:web:0d2d5726d12b305b24b8d5"
    },
    
    // Firebase初期化メソッド
    init() {
        // Step 1 ログ出力
        if (typeof MigrationLog !== 'undefined') {
            MigrationLog.log(1, 'Firebase初期化', {
                source: 'config/firebase.js',
                method: '分離版init()',
                timestamp: Date.now()
            });
        }
        
        // Firebase初期化
        firebase.initializeApp(this.config);
        
        console.log('🔄 [Step1] Firebase初期化完了 - 設定分離版');
        
        // Firebase service objects を返す
        return {
            auth: firebase.auth(),
            database: firebase.database()
        };
    }
};

// グローバル公開（後方互換性のため）
window.FirebaseConfig = FirebaseConfig;

console.log('🔄 [Step1] config/firebase.js ロード完了');