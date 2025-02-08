import streamlit as st
import numpy as np
import pandas as pd
import joblib

QUEUE_FILE = "queue_data.txt"

# Load trained models
model1 = joblib.load("model_total_time.pkl")  # Model for predicting Total_Time
model2 = joblib.load("model_durations.pkl")   # Model for predicting Green & Red Duration

def get_latest_queue_length():
    try:
        with open(QUEUE_FILE, "r") as f:
            return int(f.read().strip())
    except:
        return 0  # Default queue length

# Streamlit UI
st.title("\U0001F6A6 Smart Traffic Light Duration Predictor")

st.markdown("### Enter Queue Lengths (meters):")

queue_n = get_latest_queue_length()
# queue_n = st.number_input("Queue Length (North)", min_value=0, max_value=2500, value=500)
queue_s = st.number_input("Queue Length (South)", min_value=0, max_value=2500, value=600)
queue_e = st.number_input("Queue Length (East)", min_value=0, max_value=2500, value=800)
queue_w = st.number_input("Queue Length (West)", min_value=0, max_value=2500, value=700)

# Prediction Function
def predict_durations(queue_n, queue_s, queue_e, queue_w):
    total_queue = queue_n + queue_s + queue_e + queue_w
    
    # Predict Total Time
    predicted_total_time = model1.predict(pd.DataFrame([[total_queue]], columns=["Total_Queue"]))[0]

    # Predict Green & Red Duration
    input_features = pd.DataFrame([[queue_n, queue_s, queue_e, queue_w, predicted_total_time]],
                                  columns=["Queue_N", "Queue_S", "Queue_E", "Queue_W", "Total_Time"])
    predicted_durations = model2.predict(input_features)
    
    return predicted_total_time, predicted_durations[0][0], predicted_durations[0][1]

# Buttons for North-South and East-West selection
st.markdown("### Select Traffic Direction")
col1, col2 = st.columns(2)
with col1:
    ns_selected = st.button("North-South")
with col2:
    ew_selected = st.button("East-West")

# Run prediction if a button is clicked
if ns_selected or ew_selected:
    total_time, green_duration, red_duration = predict_durations(queue_n, queue_s, queue_e, queue_w)
    
    if ew_selected:
        green_duration, red_duration = red_duration, green_duration  # Swap durations for East-West
    
    st.success(f"\U0001F6A6 **Predicted Total Time:** {total_time:.2f} sec")
    st.info(f"✅ **Green Light Duration:** {green_duration:.2f} sec")
    st.warning(f"\U0001F6D1 **Red Light Duration:** {red_duration:.2f} sec")
