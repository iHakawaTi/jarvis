import os
import cv2
import numpy as np
from PIL import Image
import hashlib
import mediapipe as mp
from sklearn.cluster import DBSCAN


# file path =  C:\Users\USER\Desktop\Dataset
# Configuration for more lenient duplicate detection
 # Lower confidence = detect more faces

def preprocess_celebrity_images(dataset_folder, output_folder, target_size=(224, 224)):
    """
    Preprocess celebrity image dataset addressing key challenges:
    - Face detection and alignment using MediaPipe
    - Duplicate/near-duplicate removal
    - Standardized sizing and normalization
    """
    os.makedirs(output_folder, exist_ok=True)
    processed_images = []
    image_hashes = set()

    # Initialize MediaPipe face detection
    mp_face_detection = mp.solutions.face_detection
    mp_drawing = mp.solutions.drawing_utils

    for celebrity_folder in os.listdir(dataset_folder):
        celebrity_path = os.path.join(dataset_folder, celebrity_folder)
        if not os.path.isdir(celebrity_path):
            continue

        celebrity_output = os.path.join(output_folder, celebrity_folder)
        os.makedirs(celebrity_output, exist_ok=True)

        images_data = []
        with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
            for img_file in os.listdir(celebrity_path):
                if img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    img_path = os.path.join(celebrity_path, img_file)

                    # Load and preprocess image
                    processed_img = process_single_image(img_path, target_size, face_detection)
                    if processed_img is not None:
                        # Check for duplicates using perceptual hashing
                        img_hash = get_image_hash(processed_img)
                        if img_hash not in image_hashes:
                            image_hashes.add(img_hash)
                            images_data.append((processed_img, img_file))

        # Remove near-duplicates using clustering
        if len(images_data) > 1:
            filtered_images = remove_near_duplicates(images_data)
        else:
            filtered_images = images_data

        # Save processed images
        for i, (img, original_name) in enumerate(filtered_images):
            output_path = os.path.join(celebrity_output, f"processed_{i}_{original_name}")
            cv2.imwrite(output_path, img)
            processed_images.append({
                'celebrity': celebrity_folder,
                'path': output_path,
                'original': original_name
            })

    return processed_images


def process_single_image(img_path, target_size, face_detection):
    """Process single image: face detection, alignment, and normalization using MediaPipe"""
    try:
        # Load image
        image = cv2.imread(img_path)
        if image is None:
            return None

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Detect faces using MediaPipe
        results = face_detection.process(image_rgb)

        if results.detections:
            # Get the largest face if multiple detected
            largest_detection = max(results.detections, key=lambda
                x: x.location_data.relative_bounding_box.width * x.location_data.relative_bounding_box.height)

            # Extract bounding box
            bbox = largest_detection.location_data.relative_bounding_box
            h, w, _ = image.shape

            # Convert relative coordinates to absolute
            x = int(bbox.xmin * w)
            y = int(bbox.ymin * h)
            width = int(bbox.width * w)
            height = int(bbox.height * h)

            # Validate bounding box dimensions
            if width <= 0 or height <= 0 or x < 0 or y < 0 or x + width > w or y + height > h:
                return None

            # Extract face region
            face_image = image[y:y + height, x:x + width]

            # Check if face_image is valid before resizing
            if face_image.size == 0 or face_image.shape[0] == 0 or face_image.shape[1] == 0:
                return None

            # Resize to target size
            face_image = cv2.resize(face_image, target_size)

            # Keep as uint8 for cv2.imwrite compatibility
            # Normalization can be done later during model training if needed

            return face_image
        else:
            # No face detected
            return None

    except Exception as e:
        print(f"Error processing {img_path}: {e}")
        return None


def get_image_hash(image):
    """Generate perceptual hash for duplicate detection"""
    # Ensure image is uint8 for proper hashing
    if image.dtype == np.float32:
        image = (image * 255).astype(np.uint8)

    # Convert to grayscale and resize for hashing
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (8, 8))

    # Calculate hash
    avg = resized.mean()
    hash_bits = (resized > avg).astype(int)
    hash_string = ''.join(hash_bits.flatten().astype(str))
    return hash_string


def remove_near_duplicates(images_data, similarity_threshold=0.8):
    """Remove near-duplicate images using feature similarity"""
    if len(images_data) <= 1:
        return images_data

    # Extract features for clustering
    features = []
    for img, _ in images_data:
        # Ensure image is uint8 for histogram calculation
        if img.dtype == np.float32:
            img = (img * 255).astype(np.uint8)

        # Simple feature: histogram
        hist = cv2.calcHist([img], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        features.append(hist.flatten())

    features = np.array(features)

    # Use DBSCAN to cluster similar images
    clustering = DBSCAN(eps=0.3, min_samples=1, metric='cosine')
    labels = clustering.fit_predict(features)

    # Keep one representative from each cluster
    unique_images = []
    seen_labels = set()

    for i, label in enumerate(labels):
        if label not in seen_labels:
            unique_images.append(images_data[i])
            seen_labels.add(label)

    return unique_images

# Example usage:
# dataset_folder = 'path/to/celebrity/dataset'
# output_folder = 'path/to/processed/dataset'
# processed_data = preprocess_celebrity_images(dataset_folder, output_folder)
# print(f"Processed {len(processed_data)} images")