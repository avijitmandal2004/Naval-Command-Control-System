import cv2
import requests

BACKEND_URL = "http://127.0.0.1:5000/alert"

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Camera not accessible")
    exit()

cv2.namedWindow("Detection Camera", cv2.WINDOW_NORMAL)

print("📷 Camera started")
print("👉 CLICK ON THE CAMERA WINDOW")
print("Press 'f' → send alert")
print("Press 'q' → quit")

alert_sent = False

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow("Detection Camera", frame)

    
    key = cv2.waitKey(1) & 0xFF

    if key == ord('f') and not alert_sent:
        payload = {
            "message": "MAN OVERBOARD DETECTED",
            "severity": "HIGH",
            "location": "Ship Deck Camera 1"
        }

        try:
            requests.post(BACKEND_URL, json=payload, timeout=2)
            print("🚨 ALERT SENT TO BACKEND")
            alert_sent = True
        except:
            print("❌ Backend not reachable")

    elif key == ord('q'):
        print("👋 Exiting detector")
        break

cap.release()
cv2.destroyAllWindows()
