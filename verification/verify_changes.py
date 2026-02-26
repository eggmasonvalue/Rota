
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate to the app
        await page.goto("http://localhost:3000")

        # Wait for the main title to ensure page load
        await page.wait_for_selector("text=ROTA")

        # Take a screenshot of the main game screen with new difficulty options
        await page.screenshot(path="verification/game_screen.png", full_page=True)

        # Click on the difficulty selector to show options
        # We target the select element with label "Rank"
        # Note: Select elements in HTML are tricky to screenshot "open",
        # so we might just verify the values are present in the DOM.

        # Verify the presence of new difficulty options
        content = await page.content()
        assert "PLEBEIAN" in content
        assert "MERCHANT" in content
        assert "EQUITES" in content
        assert "SENATOR" in content
        assert "CONSUL" in content

        print("Difficulty options verified in DOM.")

        # Capture the palette mockup
        await page.goto("http://localhost:3000/palette-mockup.html")
        await page.screenshot(path="verification/palette_mockup.png", full_page=True)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
