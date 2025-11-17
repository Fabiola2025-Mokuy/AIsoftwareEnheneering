# Water Potability Detection Program in Google Colab (English Translation)

#1 Setup and Data Preprocessing (Scikit-learn)

# This section covers the simulated data loading, cleaning, normalization, and splitting.


import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans 
from sklearn.metrics import accuracy_score, f1_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
import matplotlib.pyplot as plt
import seaborn as sns

print("Libraries imported: Pandas, Numpy, Scikit-learn, and TensorFlow.")
print("---")

# 2. Data Loading (Simulated)
# In a real scenario, you would use: df = pd.read_csv('water_potability.csv')

N_SAMPLES = 3276 
np.random.seed(42) 

# Using the exact column names provided
data = {
    'ph': np.random.uniform(5.5, 9.5, N_SAMPLES),
    'Hardness': np.random.uniform(100, 350, N_SAMPLES),
    'Solids': np.random.uniform(1000, 40000, N_SAMPLES),
    'Chloramines': np.random.uniform(3, 10, N_SAMPLES),
    'Sulfate': np.random.uniform(150, 450, N_SAMPLES),
    'Conductivity': np.random.uniform(300, 700, N_SAMPLES),
    'Organic_carbon': np.random.uniform(8, 20, N_SAMPLES),
    'Trihalomethanes': np.random.uniform(50, 100, N_SAMPLES),
    'Turbidity': np.random.uniform(1.5, 6.5, N_SAMPLES),
    'Potability': np.random.randint(0, 2, N_SAMPLES) 
}

# Injecting NaN values to simulate missing data (Cleaning)
for col in ['ph', 'Sulfate']:
    nan_indices = np.random.choice(N_SAMPLES, size=int(0.05 * N_SAMPLES), replace=False)
    data[col][nan_indices] = np.nan

df = pd.DataFrame(data)

# a) Data Cleaning
df.fillna(df.median(), inplace=True) 

# b) Split X and y (Using 'Potability' as the target column)
X = df.drop('Potability', axis=1)
y = df['Potability']

# c) Normalization/Standardization
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# d) Train and Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

print("✅ Preprocessing (Cleaning, Normalization, Splitting) Complete!")
print(f"Training Data ready for TensorFlow: {X_train.shape}")


2. Supervised Learning: Training and Evaluation (TensorFlow ANN)

This section builds and trains the Neural Network to **predict** potability.

python
# 3. Supervised Learning Model Training and Evaluation (TensorFlow ANN) ---

# 3.1. Build and Train the Neural Network to predict potability.

# Model Building
input_shape = X_train.shape[1] 

supervised_model = Sequential([
    Dense(64, activation='relu', input_shape=(input_shape,)),
    Dropout(0.2), # Helps prevent Overfitting
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid') # Binary output (0 or 1)
])

# Compilation
supervised_model.compile(
    optimizer='adam', 
    loss='binary_crossentropy', 
    metrics=['accuracy']
)

print("\nModel Structure (ANN) for Classification:")
supervised_model.summary()

# Training
print("\nStarting ANN Training...")

history = supervised_model.fit(
    X_train, 
    y_train, 
    epochs=50, 
    batch_size=32, 
    validation_split=0.1, 
    verbose=0
)

print("✅ Supervised Training Complete!")

print("\n--- Mean ")
# Evaluation
loss, accuracy = supervised_model.evaluate(X_test, y_test, verbose=0)
predictions = supervised_model.predict(X_test)
y_pred_class = (predictions > 0.5).astype(int) 
f1 = f1_score(y_test, y_pred_class)

print(f"\n--- Evaluation (Supervised) ---")
print(f"Test Accuracy: {accuracy * 100:.2f}%")
print(f"Test F1-Score: {f1:.4f}")

# Visualization of the Loss Curve
plt.figure(figsize=(10, 5))
plt.plot(history.history['loss'], label='Loss (Training)')
plt.plot(history.history['val_loss'], label='Loss (Validation)')
plt.title('Neural Network Loss Curve')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.show()

#  Unsupervised Learning: Data Clustering (KMeans)

This section **clusters** the samples based on their characteristics (without looking at the `Potability` label), which is useful for naturally identifying different levels of pollution or quality.

# --- Unsupervised Learning: Data Clustering (KMeans) ---

# Defining 3 Clusters: Good, Medium, Bad
K = 3 
kmeans = KMeans(n_clusters=K, random_state=42, n_init=10)

# Apply K-Means to the standardized data (X_scaled)
df['Cluster'] = kmeans.fit_predict(X_scaled) 

print(f"\n✅ Unsupervised Learning (KMeans) Complete! ({K} Clusters)")

# Group Analysis: Checking the average characteristics of each cluster
cluster_analysis = df.groupby('Cluster')[X.columns.tolist() + ['Potability']].mean()

# Interpretation:
# The Cluster with the lowest 'Solids' and 'Turbidity' and highest 'ph' is likely the Clean Water group.
print(cluster_analysis.to_string())

# Visualization of Real Quality within Clusters
plt.figure(figsize=(8, 5))
sns.countplot(x='Cluster', hue='Potability', data=df)
plt.title('Real Potability by Cluster (Grouping)')
plt.xlabel('Cluster ID')
plt.ylabel('Sample Count')
plt.legend(title='Real Potability')
plt.show()
