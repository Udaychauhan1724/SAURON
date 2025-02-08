import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import logging
import json
from datetime import datetime
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('traffic_prediction.log'),
        logging.StreamHandler()
    ]
)

class TrafficPredictor:
    def _init_(self, data_path="traffic_data.csv"):
        self.data_path = data_path
        self.model1 = None  # Total time predictor
        self.model2 = None  # Duration predictor
        self.metrics = {}

    def load_data(self):
        """Load and preprocess training data"""
        try:
            df = pd.read_csv(self.data_path)
            required_columns = [
                "Queue_N", "Queue_S", "Queue_E", "Queue_W",
                "Total_Time", "Green_Duration", "Red_Duration"
            ]
            
            if not all(col in df.columns for col in required_columns):
                raise ValueError("Missing required columns in dataset")

            df = df.astype({
                "Queue_N": int, "Queue_S": int, "Queue_E": int, "Queue_W": int,
                "Total_Time": int, "Green_Duration": int, "Red_Duration": int
            })
            
            return df
        except Exception as e:
            logging.error(f"Error loading data: {str(e)}")
            raise

    def train_models(self):
        """Train both prediction models"""
        try:
            df = self.load_data()
            
            # Calculate total queue length
            df["Total_Queue"] = df[["Queue_N", "Queue_S", "Queue_E", "Queue_W"]].sum(axis=1)
            
            # Train Total Time Predictor
            X1 = df[["Total_Queue"]]
            y1 = df["Total_Time"]
            X1_train, X1_test, y1_train, y1_test = train_test_split(
                X1, y1, test_size=0.2, random_state=42
            )
            
            self.model1 = RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                n_jobs=-1
            )
            self.model1.fit(X1_train, y1_train)
            
            # Evaluate Total Time Predictor
            y1_pred = self.model1.predict(X1_test)
            self.metrics["total_time"] = {
                "r2": r2_score(y1_test, y1_pred),
                "mae": mean_absolute_error(y1_test, y1_pred),
                "rmse": np.sqrt(mean_squared_error(y1_test, y1_pred))
            }
            
            # Train Duration Predictor
            X2 = df[["Queue_N", "Queue_S", "Queue_E", "Queue_W", "Total_Time"]]
            y2 = df[["Green_Duration", "Red_Duration"]]
            X2_train, X2_test, y2_train, y2_test = train_test_split(
                X2, y2, test_size=0.2, random_state=42
            )
            
            self.model2 = RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                n_jobs=-1
            )
            self.model2.fit(X2_train, y2_train)
            
            # Evaluate Duration Predictor
            y2_pred = self.model2.predict(X2_test)
            self.metrics["duration"] = {
                "r2": r2_score(y2_test, y2_pred),
                "mae": mean_absolute_error(y2_test, y2_pred),
                "rmse": np.sqrt(mean_squared_error(y2_test, y2_pred))
            }
            
            # Save models
            joblib.dump(self.model1, "model_total_time.pkl")
            joblib.dump(self.model2, "model_durations.pkl")
            
            logging.info("Models trained and saved successfully")
            self.log_metrics()
            
        except Exception as e:
            logging.error(f"Error training models: {str(e)}")
            raise

    def log_metrics(self):
        """Log model performance metrics"""
        logging.info("\nModel Performance Metrics:")
        logging.info("\nTotal Time Prediction Model:")
        logging.info(f"R² Score: {self.metrics['total_time']['r2']:.4f}")
        logging.info(f"MAE: {self.metrics['total_time']['mae']:.4f}")
        logging.info(f"RMSE: {self.metrics['total_time']['rmse']:.4f}")
        
        logging.info("\nDuration Prediction Model:")
        logging.info(f"R² Score: {self.metrics['duration']['r2']:.4f}")
        logging.info(f"MAE: {self.metrics['duration']['mae']:.4f}")
        logging.info(f"RMSE: {self.metrics['duration']['rmse']:.4f}")

    def load_trained_models(self):
        """Load trained models from disk"""
        try:
            self.model1 = joblib.load("model_total_time.pkl")
            self.model2 = joblib.load("model_durations.pkl")
            logging.info("Models loaded successfully")
        except Exception as e:
            logging.error(f"Error loading models: {str(e)}")
            raise

    def predict_durations(self, queue_n, queue_s, queue_e, queue_w):
        """Make predictions using trained models"""
        try:
            if self.model1 is None or self.model2 is None:
                self.load_trained_models()

            total_queue = queue_n + queue_s + queue_e + queue_w
            predicted_total_time = self.model1.predict(
                pd.DataFrame([[total_queue]], columns=["Total_Queue"])
            )[0]

            input_features = pd.DataFrame(
                [[queue_n, queue_s, queue_e, queue_w, predicted_total_time]],
                columns=["Queue_N", "Queue_S", "Queue_E", "Queue_W", "Total_Time"]
            )
            
            predicted_durations = self.model2.predict(input_features)[0]
            
            # Save predictions
            self.save_prediction(
                queue_n, queue_s, queue_e, queue_w,
                predicted_total_time, predicted_durations[0], predicted_durations[1]
            )
            
            return predicted_total_time, predicted_durations[0], predicted_durations[1]
            
        except Exception as e:
            logging.error(f"Error making predictions: {str(e)}")
            raise

    def save_prediction(self, queue_n, queue_s, queue_e, queue_w, 
                       total_time, green_duration, red_duration):
        """Save prediction results to JSON file"""
        prediction = {
            'timestamp': datetime.now().isoformat(),
            'input': {
                'queue_n': queue_n,
                'queue_s': queue_s,
                'queue_e': queue_e,
                'queue_w': queue_w
            },
            'predictions': {
                'total_time': total_time,
                'green_duration': green_duration,
                'red_duration': red_duration
            }
        }
        
        with open('predictions.json', 'a') as f:
            json.dump(prediction, f)
            f.write('\n')

if __name__ == "__main__":
    predictor = TrafficPredictor()
    
    # Train new models if they don't exist
    if not (os.path.exists("model_total_time.pkl") and 
            os.path.exists("model_durations.pkl")):
        predictor.train_models()
    else:
        predictor.load_trained_models()
    
    # Example prediction
    queue_n, queue_s, queue_e, queue_w = 100, 150, 200, 175
    total_time, green_dur, red_dur = predictor.predict_durations(
        queue_n, queue_s, queue_e, queue_w
    )
    
    logging.info(f"""
    Prediction Results:
    Total Time: {total_time:.2f} seconds
    Green Duration: {green_dur:.2f} seconds
    Red Duration: {red_dur:.2f} seconds
    """)