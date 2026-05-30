import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";

OBR.onReady(async () => {
  // รับ broadcast จาก GM
  OBR.broadcast.onMessage("com.natwork.dmpause/notify", (event) => {
    const isPaused = event.data?.paused;
    OBR.notification.show(
      isPaused ? "⏸ Game Paused by DM!" : "▶ Game Resumed!",
      isPaused ? "WARNING" : "SUCCESS"
    );
  });
});