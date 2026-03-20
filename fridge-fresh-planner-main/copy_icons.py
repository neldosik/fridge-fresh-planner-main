import os
import shutil

src_img = r"C:\Users\Oleksandr\.gemini\antigravity\brain\057cbef0-b7f2-4999-a479-10aa712a6cdb\neld_pwa_icon_1774038843372.png"
dst1 = r"c:\Users\Oleksandr\fridge-fresh-planner-main\fridge-fresh-planner-main\public\pwa-192x192.png"
dst2 = r"c:\Users\Oleksandr\fridge-fresh-planner-main\fridge-fresh-planner-main\public\pwa-512x512.png"

if os.path.exists(src_img):
    shutil.copy(src_img, dst1)
    shutil.copy(src_img, dst2)
    print("Icons copied successfully!")
else:
    print("Source image not found!")
