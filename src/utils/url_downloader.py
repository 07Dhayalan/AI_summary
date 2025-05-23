from bs4 import BeautifulSoup
import requests
from playwright.async_api import async_playwright
from datetime import datetime
from urllib.parse import quote_plus
from flask import current_app
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium_stealth import stealth
import time
import MySQLdb.cursors
import asyncio

class downloader:

    def __init__(self, url):
        self.URL = url

    @staticmethod
    def get_db_cursor():
        from src import mysql  # import here to ensure app context
        connection = mysql.connection
        cursor = connection.cursor(MySQLdb.cursors.DictCursor)
        return connection, cursor

    @staticmethod
    def html_cleanser(html):
        try:
            soup = BeautifulSoup(html, 'html.parser')
            body_tag = soup.find('body')

            if not body_tag:
                return soup  # return full soup if <body> is missing

            for tag in body_tag.find_all(["script", "style", "link"]):
                tag.decompose()

            allowed_attributes = {'class', 'href'}

            for tag in body_tag.find_all(True):
                tag.attrs = {key: value for key, value in tag.attrs.items() if key in allowed_attributes}

            return body_tag
        except Exception as e:
            print('Exception in HTML cleanser:', e)
            return html  # fallback to original html

    def html_Downloader_L1(self):
        req = requests.get(self.URL)

        if req.status_code == 200:
            now = datetime.now()
            time_strf = now.strftime('%d%m%Y_%H%M%S')
            safe_url = quote_plus(self.URL)
            html = req.content.decode('utf-8')
            cleaned_HTML = downloader.html_cleanser(html)

            try:
                connection, cursor = downloader.get_db_cursor()
                cursor.execute("""
                    INSERT INTO AI_Summarization.HTML_log (date_time, URL, orginal_HTML, cleanned_HTML)
                    VALUES (%s, %s, %s, %s)
                """, (time_strf, safe_url, html, str(cleaned_HTML)))
                connection.commit()
                cursor.close()
            except Exception as e:
                print("Database insert error:", e)

            return {'Status Code': req.status_code, 'HTML': cleaned_HTML, 'Orginal_HTML': html}
        else:
            return {'Status Code': req.status_code, 'HTML': 'No Content In Response', 'Orginal_HTML': 'Html not received'}


    async def html_Downloader_L2(self):
        browser = None
        try:
            extension_path = r"D:\Frame_work\Flask\AI_Summarization\src\utils\NopeCHA-CAPTCHA-Solver-Chrome-Web-Store"
            user_data_dir = r"D:\Frame_work\Flask\AI_Summarization\src\utils\Browser data"

            async with async_playwright() as p:
                browser = await p.chromium.launch_persistent_context(
                    user_data_dir=user_data_dir,
                    headless=False,
                    viewport={'width': 1536, 'height': 864},
                    args=[
                        "--start-maximized",
                        "--disable-blink-features=AutomationControlled",
                        f"--disable-extensions-except={extension_path}",
                        f"--load-extension={extension_path}",
                    ],
                    ignore_default_args=["--enable-automation"]
                )

                page = await browser.new_page()
                await page.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                    window.chrome = { runtime: {} };
                    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
                    Object.defineProperty(navigator, 'plugins', {
                        get: () => [1, 2, 3],
                    });
                """)

                response = await page.goto(self.URL, wait_until="domcontentloaded")
                await page.wait_for_timeout(10000)

                html = await page.content()
                soup = BeautifulSoup(html, 'html.parser')
                status_code = response.status if response else 500
                cleaned_HTML = downloader.html_cleanser(soup)

                if status_code == 200:
                    return {'Status Code': 200, 'HTML': cleaned_HTML, 'Orginal_HTML': soup}
                else:
                    return {'Status Code': 500, 'HTML': 'No Content - Error Occurred', 'Orginal_HTML': 'Html not received'}

        except Exception as e:
            print("Exception in level 2:", e)
            return {'Status Code': 500, 'HTML': 'No Content - Error Occurred', 'Error': str(e)}

        finally:
            try:
                if browser:
                    await browser.close()
            except Exception as e:
                print("Browser closing failed:", str(e))


    def html_Downloader_L3(self):
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--disable-infobars")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument('--start-maximized')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
        options.add_extension(r'D:\Frame_work\Flask\AI_Summarization\src\utils\NopeCHA-CAPTCHA-Solver-Chrome-Web-Store.crx')
        driver = webdriver.Chrome(options=options)

        stealth(driver,
                languages=["en-US", "en"],
                vendor="Google Inc.",
                platform="Win32",
                webgl_vendor="Intel Inc.",
                renderer="Intel Iris OpenGL Engine",
                fix_hairline=True,
                )
        try:
            driver.get(self.URL)
            time.sleep(5)
            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            cleaned_HTML = downloader.html_cleanser(soup)
            return {'Status Code': 200, 'HTML': cleaned_HTML, 'Orginal_HTML' : soup}
        except Exception as e:
            return {'Status Code': 500, 'HTML': 'No Content - Error Occurred', 'Orginal_HTML': 'Html not received'}
        finally:
            driver.quit()


# obj = downloader('https://www.allconnect.com/results/providers?zip=60559')
# result = obj.html_Downloader_L1()
# # result = asyncio.run(obj.html_Downloader_L2())
# print(result)