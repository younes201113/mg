document.getElementById("menuBtn").onclick = () => {
const bar = document.getElementById("sidebar");
bar.style.left = bar.style.left === "0px" ? "-250px" : "0px";
};


// Login handler
document.getElementById("loginBtn").onclick = () => {
googleLogin();
};
