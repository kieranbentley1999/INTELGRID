import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:8000")
        
        # Wait for the Cyber Terminal to load some logs
        await page.wait_for_timeout(3000)
        
        # Take full page screenshot
        await page.screenshot(path='C:\\Users\\kiera\\.gemini\\antigravity\\brain\\c9e69b57-87b5-4a88-8d0d-585d6509fc74\\final_dashboard_launch.png', full_page=True)
        
        await browser.close()

asyncio.run(run())
