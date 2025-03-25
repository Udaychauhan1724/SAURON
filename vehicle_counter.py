import cv2
import numpy as np
from ultralytics import YOLO
import os
from collections import defaultdict

class VehicleCounter:
    def __init__(self, model_path=None, conf_threshold=0.3):
        """
        Initialize the vehicle counter for images

        Args:
            model_path: Path to custom YOLOv8 model. If None, uses pretrained model
            conf_threshold: Confidence threshold for detections
        """
        if model_path:
            self.model = YOLO(model_path)
        else:
            self.model = YOLO('yolov8n.pt')  # Use YOLOv8 nano by default

        self.vehicle_classes = [2, 3, 5, 7]  # car, motorcycle, bus, truck
        self.class_names = {
            2: 'car',
            3: 'motorcycle',
            5: 'bus',
            7: 'truck'
        }
        self.conf_threshold = conf_threshold

    def process_image(self, image_input):
        """
        Process a single image (file path or numpy array) and return counts + annotated image

        Args:
            image_input: Path to image or image array

        Returns:
            tuple: (annotated_image, counts_dict)
        """
        if isinstance(image_input, str):
            image = cv2.imread(image_input)
            if image is None:
                raise ValueError(f"Could not read image at {image_input}")
        else:
            image = image_input

        annotated_image = image.copy()
        counts = defaultdict(int)
        total_count = 0

        results = self.model(image)

        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                cls = int(box.cls[0].item())
                conf = box.conf[0].item()

                if cls in self.vehicle_classes and conf > self.conf_threshold:
                    counts[cls] += 1
                    total_count += 1

                    color = (0, 165, 255)  # Orange
                    cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 1)

                    label = f"{self.class_names[cls]}: {conf:.2f}"
                    (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_PLAIN, 0.8, 1)

                    text_bg = np.zeros((text_height + 5, text_width + 10, 3), dtype=np.uint8)
                    text_bg[:] = (*color, )

                    alpha = 0.6
                    overlay_y1 = max(0, y1 - text_height - 5)
                    overlay_x1 = x1
                    overlay_y2 = y1
                    overlay_x2 = min(x1 + text_width + 10, annotated_image.shape[1])

                    text_bg_h = min(text_height + 5, overlay_y2 - overlay_y1)
                    text_bg_w = min(text_width + 10, overlay_x2 - overlay_x1)

                    roi = annotated_image[overlay_y1:overlay_y1 + text_bg_h, overlay_x1:overlay_x1 + text_bg_w].copy()
                    cv2.addWeighted(text_bg[0:text_bg_h, 0:text_bg_w], alpha, roi, 1 - alpha, 0, roi)
                    annotated_image[overlay_y1:overlay_y1 + text_bg_h, overlay_x1:overlay_x1 + text_bg_w] = roi

                    cv2.putText(annotated_image, label, (x1 + 5, overlay_y1 + text_height),
                                cv2.FONT_HERSHEY_PLAIN, 0.8, (255, 255, 255), 1)

        # Summary box
        summary_text = [f"Total: {total_count}"]
        for cls, count in counts.items():
            summary_text.append(f"{self.class_names[cls]}: {count}")

        max_label_width = max([cv2.getTextSize(t, cv2.FONT_HERSHEY_PLAIN, 0.9, 1)[0][0] for t in summary_text])
        label_height = cv2.getTextSize("Test", cv2.FONT_HERSHEY_PLAIN, 0.9, 1)[0][1]
        padding = 10
        box_width = max_label_width + padding * 2
        box_height = (len(summary_text) * (label_height + 5)) + padding

        overlay_y1 = 10
        overlay_x1 = annotated_image.shape[1] - box_width - 10
        summary_bg = np.zeros((box_height, box_width, 3), dtype=np.uint8)
        summary_bg[:] = (30, 30, 30)

        roi = annotated_image[overlay_y1:overlay_y1 + box_height, overlay_x1:overlay_x1 + box_width].copy()
        cv2.addWeighted(summary_bg, 0.7, roi, 0.3, 0, roi)
        annotated_image[overlay_y1:overlay_y1 + box_height, overlay_x1:overlay_x1 + box_width] = roi
        cv2.rectangle(annotated_image, (overlay_x1, overlay_y1),
                      (overlay_x1 + box_width, overlay_y1 + box_height), (120, 120, 120), 1)

        for i, text in enumerate(summary_text):
            y_pos = overlay_y1 + padding + (i * (label_height + 5))
            text_color = (0, 165, 255) if i == 0 else (255, 255, 255)
            cv2.putText(annotated_image, text, (overlay_x1 + padding, y_pos),
                        cv2.FONT_HERSHEY_PLAIN, 0.9, text_color, 1)

        counts_dict = {
            'total': total_count,
            'by_class': {self.class_names[cls]: count for cls, count in counts.items()}
        }

        return annotated_image, counts_dict
