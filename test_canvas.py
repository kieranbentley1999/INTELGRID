import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:8000")
        
        # Wait for everything to load
        await page.wait_for_timeout(2000)
        
        # Simulate file upload
        file_input = await page.query_selector('#pfp-upload')
        if file_input:
            await file_input.set_input_files('assets/meme_template_pepe.png')
            
            # Wait for canvas to draw
            await page.wait_for_timeout(1000)
            
            # Capture the specific section
            element = await page.query_selector('.pfp-generator-section')
            if element:
                await element.scroll_into_view_if_needed()
                await element.screenshot(path='C:\\Users\\kiera\\.gemini\\antigravity\\brain\\c9e69b57-87b5-4a88-8d0d-585d6509fc74\\pfp_canvas_test_output.png')
                print("Screenshot saved to artifacts")
            else:
                print("Could not find section")
        else:
            print("Could not find file input")
            
        await browser.close()

asyncio.run(run())
