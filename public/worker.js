console.info("Worker loaded! :D");

onmessage = (e) => {
    const data = e.data;
    if (data.action === "DATA_CACHE" && navigator.userAgent.includes("Chrome")) {
        for (let url of data.urls) {
            fetch(url, {
                mode: "no-cors",
                referrerPolicy: "no-referrer",
                headers: {
                    "Accept": "image/webp,*/*"
                }
            });
        }
    }
}