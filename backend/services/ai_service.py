import json
import urllib.request
import urllib.error

def analyze_image_with_gemini(image_base64: str, api_key: str) -> dict:
    if not api_key:
        return {
            "success": False,
            "error": "Google Gemini API Key is missing. Please set it in the Settings page."
        }
    
    # Strip base64 headers if present (e.g. data:image/jpeg;base64,...)
    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = (
        "You are an expert AI communication coach. Analyze the person in this image and provide constructive feedback on: "
        "1. Body Language & Posture (confidence, stance, open/closed posture) "
        "2. Facial Expression & Engagement (eye contact proxy, facial warmth, micro-expressions) "
        "3. Actionable Coaching Tips (3 clear bullet points to improve their presence). "
        "Keep the output professional, positive, and direct. Format the response as a structured JSON object with keys: "
        "'posture_feedback' (string), 'facial_feedback' (string), 'actionable_tips' (list of strings)."
    )
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {
                    "inlineData": {
                        "mimeType": "image/jpeg",
                        "data": image_base64
                    }
                }
            ]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    req_data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            
            # Extract text content from Gemini response structure
            candidates = res_json.get("candidates", [])
            if candidates:
                text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
                # Parse the JSON string from Gemini's response
                try:
                    structured_res = json.loads(text_content)
                    return {
                        "success": True,
                        "posture_feedback": structured_res.get("posture_feedback", "Stance looks neutral."),
                        "facial_feedback": structured_res.get("facial_feedback", "Expression looks neutral."),
                        "actionable_tips": structured_res.get("actionable_tips", ["Keep practicing!"]),
                    }
                except json.JSONDecodeError:
                    return {
                        "success": True,
                        "raw_feedback": text_content,
                        "posture_feedback": "Detailed feedback in raw report.",
                        "facial_feedback": "Detailed feedback in raw report.",
                        "actionable_tips": [text_content]
                    }
            return {
                "success": False,
                "error": "Empty response from Gemini API."
            }
            
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"[Gemini API Error] {e.code}: {err_msg}")
        try:
            err_json = json.loads(err_msg)
            message = err_json.get("error", {}).get("message", "HTTP Error calling Gemini API.")
        except Exception:
            message = f"HTTP Error {e.code}"
        return {
            "success": False,
            "error": message
        }
    except Exception as e:
        print(f"[Gemini Error] {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
