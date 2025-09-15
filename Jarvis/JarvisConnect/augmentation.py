import os
import cv2
import albumentations as A
import random

def augment_and_save(processed_folder, augmented_folder, num_augmentations_per_image=10):
    """
    Applies data augmentation to preprocessed images and saves them.

    Args:
        processed_folder (str): The path to the folder containing the preprocessed images.
                                 (e.g., 'path/to/processed/dataset')
        augmented_folder (str): The path where augmented images will be saved.
        num_augmentations_per_image (int): The number of augmented versions to create for each original image.
    """
    # Define the augmentation pipeline ✨
    # These transformations are well-suited for face recognition tasks.
    transform = A.Compose([
        A.HorizontalFlip(p=0.5),
        A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.1, rotate_limit=15, p=0.7),
        A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.8),
        A.GaussNoise(std_range= (0.04, 0.1),p=0.2,),
        A.OneOf([
            A.GaussianBlur(p=0.5),
            A.MotionBlur(p=0.5),
        ], p=0.2),
        # Ensure the output is always a valid image for saving
        A.Normalize(mean=(0.485, 0.456, 0.406),std=(0.229, 0.224, 0.225)),
        A.ToFloat(max_value=255.0)
    ])

    print(f"Starting augmentation. Each image will be augmented {num_augmentations_per_image} times.")

    # Ensure the main augmented directory exists
    os.makedirs(augmented_folder, exist_ok=True)

    total_original_images = 0
    total_augmented_images = 0

    # Iterate through each celebrity's folder in the processed dataset
    for celebrity_folder in os.listdir(processed_folder):
        celebrity_path_in = os.path.join(processed_folder, celebrity_folder)
        celebrity_path_out = os.path.join(augmented_folder, celebrity_folder)

        if not os.path.isdir(celebrity_path_in):
            continue

        os.makedirs(celebrity_path_out, exist_ok=True)

        print(f"Processing folder: {celebrity_folder}")

        # Iterate through each preprocessed image
        for img_file in os.listdir(celebrity_path_in):
            img_path = os.path.join(celebrity_path_in, img_file)

            # Read the image
            image = cv2.imread(img_path)
            if image is None:
                continue

            total_original_images += 1

            # --- Save the original image in the new directory ---
            # This is good practice to have both original and augmented in one place
            original_save_path = os.path.join(celebrity_path_out, img_file)
            cv2.imwrite(original_save_path, image)
            total_augmented_images += 1

            # --- Create and save augmented versions ---
            for i in range(num_augmentations_per_image):
                # Apply the transformations
                augmented = transform(image=image)
                augmented_image = (augmented['image'] * 255).astype('uint8')  # Convert back to uint8 for saving

                # Create a new filename for the augmented image
                base_name, extension = os.path.splitext(img_file)
                new_filename = f"{base_name}_aug_{i}{extension}"
                output_path = os.path.join(celebrity_path_out, new_filename)

                # Save the new image
                cv2.imwrite(output_path, augmented_image)
                total_augmented_images += 1

    print("\n--- Augmentation Complete! ---")
    print(f"Total original images processed: {total_original_images}")
    print(f"Total images in augmented dataset (originals + augmentations): {total_augmented_images}")


# --- How to use it ---
# ✅ THIS BLOCK WILL NOW ONLY RUN WHEN YOU EXECUTE 'python augmentation.py'
if __name__ == "__main__":
    # 1. Define the path to your preprocessed data
    processed_dataset_folder = r'C:\Users\USER\Desktop\Python\processed_dataset'

    # 2. Define where you want to save the new, augmented dataset
    augmented_dataset_folder = r'C:\Users\USER\Desktop\Python\augmented_data'

    # 3. Set how many new versions you want for each image
    augmentations_per_image = 9

    # Run the function
    print("Running augmentation script directly...")
    augment_and_save(processed_dataset_folder, augmented_dataset_folder, augmentations_per_image)
