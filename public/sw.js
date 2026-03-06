self.addEventListener("push", function (event) {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: "/logo.png",
        badge: "/logo.png",
        data: {
            url: data.url
        }
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// For local broadcast via Socket.io (since we don't have a push server)
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SHOW_NOTIFICATION") {
        const { title, body, url } = event.data;
        self.registration.showNotification(title, {
            body,
            icon: "/logo.png",
            data: { url }
        });
    }
});
