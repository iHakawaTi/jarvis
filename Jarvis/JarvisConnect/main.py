import os
import sys
from preprocessing import preprocess_celebrity_images
from augmentation import augment_and_save

sys.path.append(r'C:\Users\USER\Desktop\Python')

def main():
    # Define paths
    dataset_folder = r'C:\Users\USER\Desktop\Python\Dataset'
    processed_folder = r'C:\Users\USER\Desktop\Python\processed_dataset'
    augmented_folder = r'C:\Users\USER\Desktop\Python\augmented_data' # Define this path

    try:
        # 1. RUN PREPROCESSING
        print("Starting celebrity image preprocessing...")
        processed_data_info = preprocess_celebrity_images(
            dataset_folder=dataset_folder,
            output_folder=processed_folder,
            target_size=(224, 224)
        )
        print(f"Preprocessing complete. Found {len(processed_data_info)} unique images.")

        # 2. RUN AUGMENTATION
        print("\nStarting augmentation...")
        # This function doesn't need to return anything.
        augment_and_save(
            processed_folder=processed_folder,
            augmented_folder=augmented_folder,
            num_augmentations_per_image=9
        )

        # 3. GENERATE THE FINAL SUMMARY CORRECTLY
        print("\n--- Final Summary ---")
        print(f"Total unique images processed: {len(processed_data_info)}")

        celebrity_counts = {}
        total_augmented_images = 0
        # Scan the final output folder to get counts
        for celebrity_folder in os.listdir(augmented_folder):
            celebrity_path = os.path.join(augmented_folder, celebrity_folder)
            if os.path.isdir(celebrity_path):
                num_images = len(os.listdir(celebrity_path))
                celebrity_counts[celebrity_folder] = num_images
                total_augmented_images += num_images

        print(f"Total images in final augmented dataset: {total_augmented_images}")
        print("\nImages per celebrity:")
        for celebrity, count in celebrity_counts.items():
            print(f"  {celebrity}: {count} images")

    except Exception as e:
        # Use a more specific error message
        print(f"\nAn error occurred in the main process: {e}")

if __name__ == "__main__":
    main()