// ============================================================
// 🔥 Firebase自動設定 - テンプレートと同じ設定
// ============================================================
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, set, get } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';

// 実際のFirebaseプロジェクト設定 (テンプレートと同じ)
const firebaseConfig = {
  "apiKey": "AIzaSyA5PXKChizYDCXF_GJ4KL6Ylq9K5hCPXWE",
  "authDomain": "shares-b1b97.firebaseapp.com",
  "databaseURL": "https://shares-b1b97-default-rtdb.firebaseio.com",
  "projectId": "shares-b1b97",
  "storageBucket": "shares-b1b97.firebasestorage.app",
  "messagingSenderId": "38311063248",
  "appId": "1:38311063248:web:0d2d5726d12b305b24b8d5"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Google認証プロバイダー設定
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Google認証関数
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('Google認証成功:', user.displayName || user.email);
        return user;
    } catch (error) {
        console.error('Google認証エラー:', error);
        throw error;
    }
};

// ログアウト関数
export const signOutUser = async () => {
    try {
        await signOut(auth);
        console.log('ログアウト成功');
    } catch (error) {
        console.error('ログアウトエラー:', error);
        throw error;
    }
};

// 認証状態監視関数
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// データベース操作関数
export const saveData = (collection, data) => {
    const dbRef = ref(database, collection);
    return push(dbRef, {
        ...data,
        timestamp: Date.now(),
        source: 'ai-analysis-system'
    });
};

export const loadData = (collection, callback) => {
    const dbRef = ref(database, collection);
    return onValue(dbRef, callback);
};

// エクスポート
export { auth, database, ref, get, onValue };