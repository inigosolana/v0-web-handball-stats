import sys
import json
import argparse
import cv2
import numpy as np
from collections import deque

# Attempt to import ultralytics
try:
    from ultralytics import YOLO
except ImportError:
    print(json.dumps({"success": False, "error": "Ultralytics (YOLOv8) not installed. Please run pip install ultralytics"}))
    sys.exit(1)

def analyze_video(video_path):
    """
    Analyzes video using YOLOv8 to track people and ball, inferring handball actions.
    """
    # Load model
    # 'yolov8n.pt' is the smallest model. 'yolov8s.pt' or 'yolov8m.pt' are better but slower.
    # We'll use 'n' for speed on CPU.
    model = YOLO('yolov8n.pt') 
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0: fps = 30
    
    # Analyze every Nth frame to save time
    FRAME_SKIP = 3 
    
    events = []
    
    # State tracking
    ball_history = deque(maxlen=30) # Track last ~1-2 seconds of ball positions
    player_count_history = deque(maxlen=10)
    
    in_action = False
    action_start_time = 0
    action_frame_start = 0
    
    frame_idx = 0
    
    # Heuristic Thresholds
    BALL_CLASS_ID = 32 # COCO class for sports ball
    PERSON_CLASS_ID = 0 # COCO class for person
    
    # Minimum number of people to consider "gameplay" (vs warm up or empty court)
    # Handball is 7v7, so usually > 10 people visible in wide shot, or > 4 in close up
    MIN_PEOPLE_FOR_ACTION = 4 
    
    # Cooldown to prevent spamming events
    last_event_end = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_idx % FRAME_SKIP != 0:
            frame_idx += 1
            continue
            
        current_time = frame_idx / fps
        
        # Run YOLO inference
        results = model(frame, verbose=False, classes=[PERSON_CLASS_ID, BALL_CLASS_ID])
        
        # Extract data
        result = results[0]
        boxes = result.boxes
        
        people_conf = []
        ball_conf = []
        ball_box = None
        
        for box in boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            
            if cls == PERSON_CLASS_ID:
                people_conf.append(conf)
            elif cls == BALL_CLASS_ID:
                ball_conf.append(conf)
                # Take highest confidence ball
                if ball_box is None or conf > ball_box[1]:
                    ball_box = (box.xyxy[0].cpu().numpy(), conf)
        
        num_people = len(people_conf)
        has_ball = len(ball_conf) > 0
        
        player_count_history.append(num_people)
        avg_people = sum(player_count_history) / len(player_count_history)
        
        # --- HEURISTICS ---
        
        # 1. Action Detection (Play vs Dead Ball)
        # Definition: Enough people + Ball visible (or recently visible)
        
        is_active_play = (avg_people >= MIN_PEOPLE_FOR_ACTION) and (has_ball or in_action)
        
        if is_active_play:
            if not in_action:
                # Start of potential action
                # Only start if we are passed the previous event
                if current_time > last_event_end + 1.0: 
                    in_action = True
                    action_start_time = current_time
                    action_frame_start = frame_idx
        else:
            if in_action:
                # End of action candidate
                duration = current_time - action_start_time
                
                # Filter short clips
                if duration >= 3.0: # Minimum 3 seconds
                    
                    # CLASSIFY THE ACTION
                    # This is hard without specific training, but we can guess
                    # based on ball velocity or player density?
                    # For now, we return specific types based on simple rules or random probability
                    # weighted by what happened (e.g. ball disappearance at end = Goal?)
                    
                    event_type = "positional_attack" # Default
                    
                    # If ball was detected recently and then disappeared quickly -> Goal/Out?
                    # If many people -> Positional
                    # If few people -> Fastbreak?
                    
                    if avg_people < 6:
                        event_type = "fastbreak"
                    else:
                        event_type = "positional_attack"
                        
                    # "Goal" detection hack:
                    # check if the action ended abruptly while high motion?
                    # For now, let's label longer plays as positional, 
                    # shorter ones could be turnovers/shots.
                    
                    # Create the event
                    events.append({
                        "time_seconds": round(action_start_time, 2),
                        "end_time": round(current_time, 2),
                        "event_type": event_type,
                        "team_id": "auto", 
                        "confidence_score": round(np.mean(people_conf) if people_conf else 0.5, 2),
                        "model_version": "yolov8n",
                        "tags": ["auto_detected", f"{int(avg_people)} players"]
                    })
                    
                    last_event_end = current_time
                    
                in_action = False

        frame_idx += 1

    cap.release()
    
    # Post-processing: Merge close events
    # ... (omit for brevity, YOLO output is usually cleaner than raw motion)
    
    return events

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True, help="Path to video file")
    args = parser.parse_args()
    
    try:
        events = analyze_video(args.video)
        print(json.dumps({"success": True, "events": events}))
    except Exception as e:
        # Print error in JSON format so API can parse it
        print(json.dumps({"success": False, "error": str(e)}))
