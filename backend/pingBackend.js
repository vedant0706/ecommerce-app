// 🔥 This code keeps your Render backend awake every 14 minutes
setInterval(() => {
  fetch("/api/auth/is-auth", {
    method: "GET",
    credentials: "include",
  }).catch(() => {});
}, 840000); // 14 minutes = 840,000 ms
