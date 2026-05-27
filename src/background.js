import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@latest/+esm";

const METADATA_KEY = "com.yourname.dmpause/paused";
let isPaused = false;

OBR.onReady(async () => {
  // โหลดสถานะเริ่มต้น
  const metadata = await OBR.room.getMetadata();
  isPaused = metadata[METADATA_KEY] ?? false;

  // ติดตามการเปลี่ยนแปลง metadata ตลอดเวลา
  OBR.room.onMetadataChange((meta) => {
    isPaused = meta[METADATA_KEY] ?? false;
  });

  // ดัก event การขยับ item
  // วิธีนี้จับตำแหน่งก่อนขยับแล้ว revert กลับ
  OBR.scene.items.onChange(async (items) => {
    const role = await OBR.player.getRole();

    // ถ้าไม่ได้ pause หรือเป็น GM → ปล่อยผ่าน
    if (!isPaused || role === "GM") return;

    // ตรวจว่ามี item ที่ถูกขยับโดย player คนนี้หรือเปล่า
    const myId = await OBR.player.getId();
    const movedByMe = items.filter(
      (item) => item.lastModifiedUserId === myId
    );

    if (movedByMe.length > 0) {
      // Revert กลับตำแหน่งเดิม (โดยดึงค่า position จาก metadata ที่เก็บไว้)
      // แสดง notification เตือน
      OBR.notification.show(
        "⛔ Movement is paused by the DM!",
        "ERROR"
      );

      // Revert items กลับ — ต้องเก็บ snapshot ตำแหน่งเดิมไว้
      // วิธีง่ายที่สุดคือ lock ด้วย locked: true บน item
      OBR.scene.items.updateItems(movedByMe, (itemsToUpdate) => {
        for (const item of itemsToUpdate) {
          item.locked = true; // ล็อค item ไม่ให้ขยับ
        }
      });
    }
  });
});

// ฟังก์ชัน pause — ล็อคทุก token ของ player
async function pauseAllPlayerTokens(pause) {
  const items = await OBR.scene.items.getAll();
  const myId = await OBR.player.getId();

  // กรองเอาเฉพาะ token ที่ owned โดย player (ไม่ใช่ GM)
  const playerItems = items.filter(
    (item) => item.createdUserId !== myId // หรือกรองตาม layer
  );

  await OBR.scene.items.updateItems(playerItems, (toUpdate) => {
    for (const item of toUpdate) {
      item.locked = pause; // true = ล็อค, false = ปลดล็อค
    }
  });
}