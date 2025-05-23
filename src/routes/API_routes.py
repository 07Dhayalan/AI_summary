from src.services import AI_summariztion
from src.utils import url_downloader
from src import app
from flask import request, jsonify, url_for, render_template
from datetime import datetime
import json
import MySQLdb.cursors
import asyncio
from urllib.parse import urlparse

now = datetime.now()
time_strf = now.strftime('%d%m%Y_%H%M%S')


def is_valid_url(url):
    try:
        result = urlparse(url)
        return result.scheme in ('http', 'https') and result.netloc
    except Exception:
        return False

def get_db_cursor():
    from src import mysql  # import here to ensure app context
    connection = mysql.connection
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    return connection, cursor

@app.route('/')
def home_page():
    print('debug_l1')
    return render_template('home.html')

@app.route('/home', methods=['POST'])
def process_URL():
    try:
        print('debug_l2')
        response = request.get_json(force=True)
        url = response.get('URL')
        type_Of_HTML = response.get('type_of_html')
        print(type_Of_HTML)
        print('debug_l3')

        if not url or not is_valid_url(url):
            return jsonify({'error': 'Invalid or missing URL'}), 400

        connection, cursor = get_db_cursor()

        obj = url_downloader.downloader(url)
        result = obj.html_Downloader_L1()

        if not result or result.get('Status Code') != 200:
            print("L1 failed, falling back to L2...")
            result = asyncio.run(obj.html_Downloader_L2())

        html_content = str(result['HTML'])
        AI_response = AI_summariztion.google_API(html_content, type_Of_HTML)

        if not AI_response:
            return jsonify({'error': 'AI summarization failed'}), 500

        response_data = json.dumps(AI_response) if isinstance(AI_response, dict) else str(AI_response)

        cursor.execute("""
            INSERT INTO AI_Summarization.AI_Result_log (date_time, Type_Of_HTML, HTML, AI_Summary_Result)
            VALUES (%s, %s, %s, %s)
        """, (time_strf, type_Of_HTML, html_content, response_data))
        connection.commit()

        return jsonify({
            'Message': 'AI response received successfully',
            'redirect': url_for('home_page'),
            'status': 'Success',
            'json': AI_response.get('Json', 'No summary found')
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            if cursor:
                cursor.close()
        except:
            pass



    
@app.route('/html/download', methods=['GET', 'POST'])
def download_HTML():
    try:
        response = request.get_json(force=True)
        url = response.get('URL')
        connection, cursor = get_db_cursor()

        cursor.execute('SELECT orginal_HTML FROM ai_summarization.html_log WHERE URL = %s LIMIT 1', (url,))
        result = cursor.fetchone()

        if result:
            # print('Download html data from DB:', result)
            return jsonify({
                'status': 'Success',
                'message': 'HTML data retrieved from database',
                'redirect': url_for('home_page'),
                'html': str(result[0])  # unpack the single value from tuple
            })

        # Try fast sync method (L1)
        obj = url_downloader.downloader(url)
        result = obj.html_Downloader_L1()

        # If L1 fails, fallback to async L2
        if not result or result.get('Status Code') != 200:
            print("L1 failed, falling back to L2...")
            result = asyncio.run(obj.html_Downloader_L2())
        # print('Download html data from web:', result)
        html_data = str(result.get('Orginal_HTML'))
        return jsonify({
            'status': 'Success',
            'message': 'Fresh HTML downloaded',
            'redirect': url_for('home_page'),
            'html': html_data
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            if cursor:
                cursor.close()
        except:
            pass

    
@app.route('/home/parsing', methods=['POST'])
def data_parsing():
    try:
        response = request.get_json(force=True)
        url = response.get('URL')
        type_Of_HTML = response.get('type_of_html')

        connection, cursor = get_db_cursor()
        cursor.execute('SELECT * FROM ai_summarization.HTML_log WHERE URL = %s', (url,))
        cached_response = cursor.fetchone()

        if cached_response:
            # Assuming cached_response contains JSON-like data in one column
            print('📦 Returning cached AI response:', cached_response)
            return jsonify({
                'Message': 'AI response retrieved from DB successfully',
                'redirect': url_for('home_page'),
                'status': 'Success',
                'json': cached_response[0]  # or adjust based on structure
            })
        
        # Try fast sync method (L1)
        obj = url_downloader.downloader(url)
        result = obj.html_Downloader_L1()

        # If L1 fails, fallback to async L2
        if not result or result.get('Status Code') != 200:
            print("L1 failed, falling back to L2...")
            result = asyncio.run(obj.html_Downloader_L2())

        if not result or result.get('Status Code') != 200:
            return jsonify({'error': 'Failed to download content'}), 500

        html_content = str(result['HTML'])
        AI_response = AI_summariztion.google_API(html_content, type_Of_HTML)

        return jsonify({
            'Message': 'AI response generated successfully',
            'redirect': url_for('home_page'),
            'status': 'Success',
            'json': AI_response
        })

    except Exception as e:
        print('❌ Error in /home/parsing:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            if cursor:
                cursor.close()
        except:
            pass
