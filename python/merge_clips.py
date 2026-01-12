import sys
import os
import json
import argparse
from moviepy.editor import VideoFileClip, concatenate_videoclips

def merge_clips(clip_paths, output_path):
    try:
        clips = []
        for path in clip_paths:
            if os.path.exists(path):
                # We need to ensure we close these clips later or let moviepy handle it
                clips.append(VideoFileClip(path))
            else:
                sys.stderr.write(f"Warning: Clip not found: {path}\n")

        if not clips:
            print(json.dumps({"success": False, "error": "No valid clips found"}))
            return

        final_clip = concatenate_videoclips(clips, method="compose") # compose handles different sizes if needed
        final_clip.write_videofile(
            output_path, 
            codec="libx264", 
            audio_codec="aac", 
            verbose=False, 
            logger=None, # reduce stderr noise
            preset='ultrafast'
        )
        
        # Cleanup
        for clip in clips:
            clip.close()

        print(json.dumps({"success": True, "output_path": output_path}))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--json-input", required=True, help="JSON string with list of absolute clip paths")
    parser.add_argument("--output", required=True, help="Absolute output path")
    args = parser.parse_args()
    
    try:
        paths = json.loads(args.json_input)
        merge_clips(paths, args.output)
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
