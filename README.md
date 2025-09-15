Project Title
Face Recognition using Transfer Learning with PyTorch

Description
This project demonstrates how to build and train a deep learning model for face recognition using transfer learning. It leverages a pre-trained ResNet-50 model, fine-tuning it on a custom celebrity face dataset. The goal is to classify images of new faces into a set of predefined celebrity classes.

Features
Transfer Learning: Uses a pre-trained ResNet-50 model to achieve high accuracy without training from scratch.

Efficient Data Handling: Employs PyTorch's DataLoader to efficiently load image data from a folder structure.

GPU Accelerated Training: Code is optimized to automatically use a GPU (CUDA) if available for fast training.

Reproducibility: Includes a clear training loop with epoch-by-epoch reporting of loss and accuracy.

Windows Compatibility: The code uses if __name__ == '__main__': to prevent multiprocessing errors on Windows.

Getting Started
Prerequisites
Python 3.8+

PyTorch

torchvision

NumPy

Pillow

You can install the required packages using pip:

Bash

pip install torch torchvision torchaudio numpy Pillow
Dataset
The project expects your dataset to be organized in a specific folder structure. It should be divided into a train and a val (validation) folder, with each containing subfolders for every class (celebrity).

<your-data-directory>/
├── train/
│   ├── celebrity_A/
│   │   ├── img1.jpg
│   │   ├── img2.jpg
│   │   └── ...
│   ├── celebrity_B/
│   │   ├── img_a.jpg
│   │   ├── img_b.jpg
│   │   └── ...
│   └── ...
└── val/
    ├── celebrity_A/
    │   ├── img3.jpg
    │   ├── img4.jpg
    │   └── ...
    ├── celebrity_B/
    │   ├── img_c.jpg
    │   ├── img_d.jpg
    │   └── ...
    └── ...
Running the Code
The provided code is ready to run on Google Colab, which is highly recommended for its free access to GPUs.

Open a new Colab notebook and enable the GPU runtime (Runtime -> Change runtime type -> T4 GPU).

Upload your dataset to a folder on your Google Drive.

Copy and paste the entire code from the main.py file into a cell in the notebook.

Update the data_dir variable in the code to point to your dataset's location on Google Drive.

Run the cell. The code will automatically mount your Google Drive and begin training the model.

Code
The core training logic is contained in a single Python script.

model_training.py: This script handles data loading, model setup, and the training and validation loops. It is structured to be easily run on both local machines and cloud platforms like Google Colab.
