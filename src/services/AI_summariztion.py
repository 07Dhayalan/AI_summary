import google.generativeai as genai
from src.services import google_api_key, generalize_prompt, realEstate_prompt, Broadband_prompt
import json
from datetime import datetime
import os
from bs4 import BeautifulSoup

def google_API(html_data, type_of_html):
    try:
        if type_of_html == 'Real Estate':
            # print('prompt:',realEstate_prompt)
            json_data = gemini_ai(html_data, type_of_html, realEstate_prompt)
            return {'Response': 'Real Estate Data Received from Gemini AI', 'Json': json_data}
        elif type_of_html == 'Others':
            # print('prompt:',generalize_prompt)
            json_data = gemini_ai(html_data, type_of_html, generalize_prompt)
            return {'Response': 'Html Data Received from Gemini AI', 'Json': json_data}
        elif type_of_html == 'Broad band':
            # print('prompt:',Broadband_prompt)
            json_data = gemini_ai(html_data, type_of_html, Broadband_prompt)
            return {'Response': 'Broadband Data Received from Gemini AI', 'Json': json_data}
        else:
            print("❌ Invalid HTML type:", type_of_html)
            return {'Response': 'Invalid HTML Type', 'Json': None}
    except Exception as ex:
        print("🔥 Unexpected error:", ex)
        return {'Response': 'Gemini AI Error', 'Error': str(ex)}

def gemini_ai(html_data, type_of_html, prompt):
    try:
        genai.configure(api_key=google_api_key)

        model = genai.GenerativeModel('gemini-1.5-flash')
        
        print('🔄 Gemini AI started...')

        # Format the prompt
        # soup = BeautifulSoup(html_data, 'html.parser')
        formatted_prompt = str(prompt).strip().format(html=html_data)

        # Request content generation
        response = model.generate_content(f'You are a highly skilled data extraction assistant specializing in real estate listings_{formatted_prompt}')

        # Check if response has the expected structure
        if response.candidates:
            response_text = response.candidates[0].content.parts[0].text.strip()
            print(response_text)
        else:
            response_text = "No response candidates available"

        # Clean the response if it contains markdown formatting
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.strip().startswith("JSON"):
            response_text = response_text.strip()[4:].strip()
        if response_text.endswith("```"):
            response_text = response_text[:-3]

        # Try to parse JSON
        try:
            json_data = json.loads(response_text)

            # Save the JSON output to file
            now = datetime.now()
            time_strf = now.strftime('%d%m%Y_%H%M%S')
            folder_path = "D:/Frame_work/Flask/AI_Summarization/uploads/JSON_Result_Data"
            os.makedirs(folder_path, exist_ok=True)
            file_path = os.path.join(folder_path, f"{type_of_html}_{time_strf}.json")

            # with open(file_path, "w", encoding='utf-8') as f:
            #     json.dump(json_data, f, indent=2, ensure_ascii=False)

            print(f"✅ JSON data saved...")
            return json_data
        except json.JSONDecodeError as e:
            print("❌ Failed to parse response as JSON:", e)
            print("Response was:\n", response_text)
            return None
                                          
    except Exception as e:
        print('Exception in gemini_AI:', e)
