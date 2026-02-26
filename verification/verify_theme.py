
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

        # Take a screenshot of the main game screen with new difficulty options (Light Mode Default)
        await page.screenshot(path="verification/game_screen_light.png", full_page=True)

        # Verify the presence of new difficulty options and EQUES spelling
        content = await page.content()
        assert "EQUES" in content
        assert "PLEBEIAN" in content
        assert "MERCHANT" in content
        assert "SENATOR" in content
        assert "CONSUL" in content
        print("Difficulty options verified in DOM (EQUES confirmed).")

        # Find the Theme Toggle button (Sun/Moon icon)
        # Assuming it's the button with title "Switch to Dark Mode" initially
        theme_toggle = page.get_by_title("Switch to Dark Mode")
        if await theme_toggle.count() > 0:
            await theme_toggle.click()
            # Wait a bit for transition
            await page.wait_for_timeout(1000)

            # Verify Dark Mode class applied
            is_dark = await page.evaluate("document.documentElement.classList.contains('dark')")
            assert is_dark, "Dark mode class not applied after toggle"
            print("Dark mode toggle verified.")

            # Screenshot Dark Mode
            await page.screenshot(path="verification/game_screen_dark.png", full_page=True)
        else:
            print("Theme toggle button not found via title locator.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
