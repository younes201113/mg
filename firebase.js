// Firebase Config
const firebaseConfig = {
apiKey: "YOUR_API_KEY",
authDomain: "YOUR_DOMAIN.firebaseapp.com",
projectId: "YOUR_PROJECT_ID",
storageBucket: "YOUR_BUCKET.appspot.com",
messagingSenderId: "SENDER_ID",
appId: "APP_ID"
};


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();


function googleLogin() {
const provider = new firebase.auth.GoogleAuthProvider();
auth.signInWithPopup(provider)
.then(res => alert("أهلاً " + res.user.displayName))
.catch(err => alert(err.message));
}
